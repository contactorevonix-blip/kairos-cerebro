// KAIROS Browser Extension — Popup logic

(async function init() {
  const cfg = await chrome.storage.local.get(['apiBaseUrl', 'apiKey']);
  document.getElementById('apiBaseUrl').value = cfg.apiBaseUrl || '';
  document.getElementById('apiKey').value = cfg.apiKey || '';
})();

document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    apiBaseUrl: document.getElementById('apiBaseUrl').value.trim(),
    apiKey: document.getElementById('apiKey').value.trim(),
  });
  document.getElementById('output').innerHTML = '<div class="verdict allow">Configuração guardada.</div>';
});

document.getElementById('check').addEventListener('click', async () => {
  const btn = document.getElementById('check');
  const out = document.getElementById('output');
  btn.disabled = true;
  out.innerHTML = '<div class="label">A verificar...</div>';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const collected = await chrome.tabs.sendMessage(tab.id, { type: 'KAIROS_COLLECT' });
    if (!collected || !collected.ok) throw new Error('Não foi possível ler esta página.');
    const verifyRes = await chrome.runtime.sendMessage({
      type: 'KAIROS_VERIFY',
      payload: { text: collected.text, url: collected.url },
    });
    if (!verifyRes.ok) {
      out.innerHTML = `<div class="verdict block"><div class="label">Erro</div>${verifyRes.error || 'unknown'}</div>`;
      return;
    }
    const v = verifyRes.result.verdict;
    const cls = v.decision === 'block' ? 'block' : v.decision === 'review' ? 'review' : 'allow';
    out.innerHTML = `
      <div class="verdict ${cls}">
        <div class="label">${v.decision.toUpperCase()}</div>
        <div class="score">${v.score} / 100</div>
        <div class="label" style="margin-top:8px;">DNA</div>
        <div>${verifyRes.result.scamDna?.family?.label || '—'}</div>
      </div>`;
  } catch (err) {
    out.innerHTML = `<div class="verdict block"><div class="label">Erro</div>${String(err.message || err)}</div>`;
  } finally {
    btn.disabled = false;
  }
});
