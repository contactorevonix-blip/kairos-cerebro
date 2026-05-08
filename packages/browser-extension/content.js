// KAIROS Browser Extension — Content Script
// Captures the visible text + URL of the active tab and asks the background
// service worker to score it. The background worker handles the API call so
// the page itself never sees the API key.

(function () {
  'use strict';

  function collectPageSignals() {
    const title = document.title || '';
    const metaDescription =
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const headings = Array.from(document.querySelectorAll('h1, h2'))
      .map((h) => (h.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 30);
    const buttons = Array.from(document.querySelectorAll('button, a.cta, a.btn'))
      .map((b) => (b.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 30);
    const bodyText = (document.body?.innerText || '').substring(0, 50_000);

    return {
      url: window.location.href,
      domain: window.location.hostname,
      title,
      metaDescription,
      ogTitle,
      headings,
      buttons,
      bodyText,
    };
  }

  /**
   * Preserve start of page (promises, checkout) and end (disclaimers, “ignore reviews”,
   * Reclame Aqui deflection) so reputation layers still fire on long landings.
   */
  function summarize(signals) {
    const maxTotal = 16000;
    const headerBlock = [
      signals.title,
      signals.metaDescription,
      signals.ogTitle,
      signals.headings.join(' '),
      signals.buttons.join(' '),
    ].filter(Boolean).join('\n');
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

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === 'KAIROS_COLLECT') {
      const signals = collectPageSignals();
      sendResponse({
        ok: true,
        text: summarize(signals),
        url: signals.url,
        domain: signals.domain,
      });
      return true;
    }
    return false;
  });
})();
