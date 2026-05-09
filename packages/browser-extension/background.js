// KAIROS Browser Extension — Service Worker v0.2.0
// Auto-scan every page, badge icon, warning overlay for threats.
// Security: API key never exposed to content scripts.
// Privacy: only page text + URL sent — no PII, no tracking.

'use strict';

const DEFAULTS = {
  apiBaseUrl: 'https://kairos-cerebro-production.up.railway.app',
  apiKey: '',
};

function randomInstallationId() {
  const buf = new Uint8Array(16);
  (self.crypto || crypto).getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getConfig() {
  const stored = await chrome.storage.local.get(['apiBaseUrl', 'apiKey', 'installationId']);
  return {
    apiBaseUrl: stored.apiBaseUrl || DEFAULTS.apiBaseUrl,
    apiKey: stored.apiKey || DEFAULTS.apiKey,
    installationId: stored.installationId || null,
  };
}

async function ensureCommunityKey() {
  const cfg = await getConfig();
  if (cfg.apiKey) return cfg;
  const installationId = cfg.installationId || randomInstallationId();
  try {
    const res = await fetch(`${cfg.apiBaseUrl}/api/community/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ installationId }),
    });
    if (!res.ok) return cfg;
    const data = await res.json();
    await chrome.storage.local.set({ apiKey: data.apiKey, installationId, tenantId: data.tenantId });
    return { ...cfg, apiKey: data.apiKey, installationId };
  } catch {
    return cfg;
  }
}

async function verifyText({ text, url }) {
  let cfg = await getConfig();
  if (!cfg.apiKey) cfg = await ensureCommunityKey();
  if (!cfg.apiKey) {
    return { ok: false, error: 'KAIROS API key not configured.' };
  }
  try {
    const res = await fetch(`${cfg.apiBaseUrl}/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': cfg.apiKey,
      },
      body: JSON.stringify({ text, sourceUrl: url, channel: 'browser-extension' }),
    });
    if (!res.ok) return { ok: false, status: res.status, error: await res.text().catch(() => '') };
    return { ok: true, result: await res.json() };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

async function updateBadge(tabId, verdict) {
  const colors = { block: '#ff3b30', review: '#ff9500', allow: '#30d158' };
  const texts = { block: '!', review: '?', allow: '' };
  await chrome.action.setBadgeText({ tabId, text: texts[verdict] ?? '' });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: colors[verdict] || '#30d158' });
}

// Auto-scan on every page load
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:') || tab.url.startsWith('edge://')) return;

  try {
    const signals = await chrome.tabs.sendMessage(tabId, { type: 'KAIROS_COLLECT' }).catch(() => null);
    if (!signals?.ok) return;

    let cfg = await getConfig();
    if (!cfg.apiKey) cfg = await ensureCommunityKey();

    const result = await verifyText({ text: signals.text, url: signals.url });
    if (!result.ok) return;

    const verdict = result.result?.verdict?.decision || 'allow';
    const score = result.result?.verdict?.score ?? 0;

    // Cache result for popup
    await chrome.storage.session.set({
      [`tab_${tabId}`]: { verdict, score, url: signals.url, ts: Date.now() },
    });

    // Update badge
    await updateBadge(tabId, verdict);

    // Show overlay for high-confidence threats
    if (verdict === 'block' && score > 0.75) {
      await chrome.tabs.sendMessage(tabId, { type: 'KAIROS_WARN', verdict, score }).catch(() => {});
    }
  } catch (_) {}
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await chrome.storage.session.remove(`tab_${tabId}`).catch(() => {});
});

chrome.runtime.onInstalled.addListener(() => {
  ensureCommunityKey().catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return false;

  // Manual verify from popup
  if (msg.type === 'KAIROS_VERIFY') {
    verifyText(msg.payload || {})
      .then((out) => sendResponse(out))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  // Popup-triggered full tab scan
  if (msg.type === 'KAIROS_SCAN_TAB') {
    const tabId = msg.tabId;
    chrome.tabs.sendMessage(tabId, { type: 'KAIROS_COLLECT' })
      .then(async (signals) => {
        if (!signals?.ok) { sendResponse({ ok: false, error: 'Could not read page.' }); return; }
        const result = await verifyText({ text: signals.text, url: signals.url });
        if (result.ok) {
          const verdict = result.result?.verdict?.decision || 'allow';
          const score = result.result?.verdict?.score ?? 0;
          await chrome.storage.session.set({ [`tab_${tabId}`]: { verdict, score, url: signals.url, ts: Date.now() } });
          await updateBadge(tabId, verdict);
          sendResponse({ ok: true, verdict, score, dna: result.result?.scamDna });
        } else {
          sendResponse({ ok: false, error: result.error });
        }
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  return false;
});
