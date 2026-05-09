'use strict';

const PRODUCTION_URL = 'https://kairos-cerebro-production.up.railway.app';

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadTabResult(tabId) {
  const stored = await chrome.storage.session.get(`tab_${tabId}`);
  return stored[`tab_${tabId}`] || null;
}

function renderVerdict(verdict, score) {
  const card = document.getElementById('verdict-card');
  const icon = document.getElementById('verdict-icon');
  const text = document.getElementById('verdict-text');
  const scoreEl = document.getElementById('verdict-score');

  const map = {
    block:  { cls: 'block',  icon: '🚨', label: 'BLOQUEADO', color: '#ff3b30' },
    review: { cls: 'review', icon: '⚠️', label: 'ATENÇÃO',   color: '#ff9500' },
    allow:  { cls: 'safe',   icon: '✅', label: 'SEGURO',    color: '#30d158' },
  };
  const m = map[verdict] || map.allow;

  card.className = `verdict-card ${m.cls}`;
  icon.textContent = m.icon;
  text.textContent = m.label;
  text.className = `verdict-text ${m.cls}`;
  text.style.color = m.color;
  scoreEl.textContent = score != null ? `Score: ${(score * 100).toFixed(1)}%` : '';
}

function renderLoading(msg) {
  document.getElementById('verdict-card').className = 'verdict-card';
  document.getElementById('verdict-icon').textContent = '⏳';
  const t = document.getElementById('verdict-text');
  t.textContent = msg || 'A verificar…';
  t.className = 'verdict-text';
  t.style.color = '#8b929e';
  document.getElementById('verdict-score').textContent = '';
}

async function init() {
  const tab = await getCurrentTab();
  if (!tab) return;

  // Show current domain
  try {
    document.getElementById('current-domain').textContent = new URL(tab.url).hostname;
  } catch {}

  // Load settings
  const stored = await chrome.storage.local.get(['apiBaseUrl', 'apiKey']);
  const apiUrl = stored.apiBaseUrl || PRODUCTION_URL;
  document.getElementById('apiBaseUrl').value = apiUrl;
  document.getElementById('apiKey').value = stored.apiKey || '';

  // API health check
  fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(4000) })
    .then((r) => r.json())
    .then((d) => {
      const dot = document.getElementById('api-dot');
      const status = document.getElementById('api-status');
      if (d.status === 'OPERATIONAL') {
        dot.className = 'status-dot online';
        status.textContent = 'Online';
        status.style.color = '#30d158';
      } else {
        dot.className = 'status-dot offline';
        status.textContent = 'Erro';
        status.style.color = '#ff3b30';
      }
    })
    .catch(() => {
      document.getElementById('api-dot').className = 'status-dot offline';
      document.getElementById('api-status').textContent = 'Offline';
      document.getElementById('api-status').style.color = '#ff3b30';
    });

  // Load cached result for this tab
  const cached = await loadTabResult(tab.id);
  if (cached) {
    renderVerdict(cached.verdict, cached.score);
  }

  // Manual scan
  document.getElementById('scan-btn').addEventListener('click', async () => {
    const btn = document.getElementById('scan-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin">⟳</span> A analisar…';
    renderLoading('A analisar…');

    const result = await chrome.runtime.sendMessage({ type: 'KAIROS_SCAN_TAB', tabId: tab.id });

    if (result?.ok && result.verdict) {
      renderVerdict(result.verdict, result.score);
    } else {
      const t = document.getElementById('verdict-text');
      t.textContent = 'Erro — tenta de novo';
      t.style.color = '#ff9500';
    }
    btn.disabled = false;
    btn.textContent = 'Analisar página';
  });

  // Settings toggle
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('open');
  });

  // Save settings
  document.getElementById('save-btn').addEventListener('click', async () => {
    const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || PRODUCTION_URL;
    const apiKey = document.getElementById('apiKey').value.trim();
    await chrome.storage.local.set({ apiBaseUrl, apiKey });
    document.getElementById('settings-panel').classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', init);
