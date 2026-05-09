// KAIROS Browser Extension — Content Script v0.2.0
// Collects page signals + shows threat warning overlay.
// Security: never sees the API key — all network calls go through background.js.

(function () {
  'use strict';

  function collectPageSignals() {
    const title = document.title || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const headings = Array.from(document.querySelectorAll('h1, h2'))
      .map((h) => (h.textContent || '').trim()).filter(Boolean).slice(0, 30);
    const buttons = Array.from(document.querySelectorAll('button, a.cta, a.btn'))
      .map((b) => (b.textContent || '').trim()).filter(Boolean).slice(0, 30);
    const bodyText = (document.body?.innerText || '').substring(0, 50_000);
    return { url: window.location.href, domain: window.location.hostname, title, metaDescription, ogTitle, headings, buttons, bodyText };
  }

  function summarize(signals) {
    const maxTotal = 16000;
    const headerBlock = [signals.title, signals.metaDescription, signals.ogTitle, signals.headings.join(' '), signals.buttons.join(' ')].filter(Boolean).join('\n');
    const body = signals.bodyText || '';
    const overhead = headerBlock.length + 2;
    const budget = Math.max(0, maxTotal - overhead);
    let bodyOut = body;
    if (body.length > budget) {
      const headKeep = Math.min(Math.floor(budget * 0.58), budget - 200);
      const tailKeep = Math.min(Math.floor(budget * 0.38), budget - headKeep);
      if (headKeep > 0 && tailKeep > 0 && headKeep + tailKeep < body.length) {
        bodyOut = `${body.slice(0, headKeep)}\n…\n${body.slice(-tailKeep)}`;
      } else {
        bodyOut = body.slice(0, budget);
      }
    }
    return `${headerBlock}\n${bodyOut}`.substring(0, maxTotal);
  }

  function showWarningOverlay(verdict, score) {
    if (document.getElementById('kairos-shield-overlay')) return;
    const pct = typeof score === 'number' ? (score * 100).toFixed(0) : '—';
    const overlay = document.createElement('div');
    overlay.id = 'kairos-shield-overlay';
    const inner = document.createElement('div');
    inner.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
      'background:linear-gradient(135deg,#1a0000 0%,#2a0000 100%)',
      'border-bottom:3px solid #ff3b30',
      'padding:14px 20px',
      'display:flex', 'align-items:center', 'gap:14px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif',
      'box-shadow:0 4px 24px rgba(255,59,48,0.45)',
    ].join(';');

    const shield = document.createElement('div');
    shield.textContent = '🛡️';
    shield.style.cssText = 'font-size:24px;flex-shrink:0';

    const content = document.createElement('div');
    content.style.cssText = 'flex:1;min-width:0';

    const title = document.createElement('div');
    title.textContent = `KAIROS detectou ameaça — Score: ${pct}%`;
    title.style.cssText = 'color:#ff6b6b;font-weight:800;font-size:14px;letter-spacing:-.01em';

    const sub = document.createElement('div');
    sub.textContent = 'Esta página contém padrões associados a fraude. Procede com extremo cuidado.';
    sub.style.cssText = 'color:#ff9999;font-size:12px;margin-top:3px;line-height:1.4';

    content.appendChild(title);
    content.appendChild(sub);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Ignorar';
    closeBtn.style.cssText = [
      'background:rgba(255,59,48,0.2)', 'border:1px solid rgba(255,59,48,0.4)',
      'color:#ff9999', 'padding:6px 14px', 'border-radius:6px',
      'cursor:pointer', 'font-size:12px', 'font-weight:600',
      'font-family:inherit', 'flex-shrink:0',
    ].join(';');
    closeBtn.addEventListener('click', () => overlay.remove());

    inner.appendChild(shield);
    inner.appendChild(content);
    inner.appendChild(closeBtn);
    overlay.appendChild(inner);
    document.body.prepend(overlay);
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg) return false;

    if (msg.type === 'KAIROS_COLLECT') {
      const signals = collectPageSignals();
      sendResponse({ ok: true, text: summarize(signals), url: signals.url, domain: signals.domain });
      return true;
    }

    if (msg.type === 'KAIROS_WARN') {
      showWarningOverlay(msg.verdict, msg.score);
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
})();
