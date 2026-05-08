// KAIROS Browser Extension — Service Worker
// Holds the API key (from chrome.storage.local), forwards page signals to
// the KAIROS API, and pushes the verdict to the popup.
//
// On first launch, the extension auto-creates a free-tier tenant via
// /api/community/signup using a randomly-generated installation ID. No
// email, no name, no PII is ever sent — only the random ID + the public
// pages the user explicitly asks to verify.

const DEFAULTS = {
  apiBaseUrl: 'https://api.kairos.example',
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

chrome.runtime.onInstalled.addListener(() => { ensureCommunityKey().catch(() => {}); });

async function verifyText({ text, url }) {
  let cfg = await getConfig();
  if (!cfg.apiKey) cfg = await ensureCommunityKey();
  if (!cfg.apiKey) {
    return { ok: false, error: 'KAIROS API key not configured. Open the popup → Settings.' };
  }
  const endpoint = `${cfg.apiBaseUrl}/verify`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': cfg.apiKey,
    },
    body: JSON.stringify({
      text,
      sourceUrl: url,
      channel: 'browser-extension',
    }),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, error: await res.text().catch(() => '') };
  }
  return { ok: true, result: await res.json() };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'KAIROS_VERIFY') {
    verifyText(msg.payload || {})
      .then((out) => sendResponse(out))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true; // keep the channel open for async sendResponse
  }
  return false;
});
