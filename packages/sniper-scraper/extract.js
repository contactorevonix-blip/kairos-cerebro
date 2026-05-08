// KAIROS SNIPER — HTML Signal Extractor v1
// Pulls scam-relevant signals from raw HTML without DOM/cheerio dependency.

'use strict';

function pickFirst(rx, html) {
  const m = html.match(rx);
  return m ? (m[1] || '').trim() : '';
}

function pickAll(rx, html) {
  const out = [];
  const re = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : `${rx.flags}g`);
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) out.push(m[1].trim());
    if (out.length > 200) break;
  }
  return out;
}

function stripTags(html) {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUrlsFromHtml(html) {
  const urls = new Set();
  const hrefRx = /href\s*=\s*["']([^"']+)["']/gi;
  const srcRx = /src\s*=\s*["']([^"']+)["']/gi;
  const formActionRx = /<form[^>]+action\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRx.exec(html)) !== null) urls.add(m[1]);
  while ((m = srcRx.exec(html)) !== null) urls.add(m[1]);
  while ((m = formActionRx.exec(html)) !== null) urls.add(m[1]);
  return Array.from(urls).slice(0, 200);
}

function extractSignals(html, finalUrl = '') {
  const safe = String(html);
  const title = pickFirst(/<title[^>]*>([\s\S]*?)<\/title>/i, safe);
  const metaDescription = pickFirst(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i, safe)
    || pickFirst(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i, safe);
  const ogTitle = pickFirst(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, safe);
  const ogDescription = pickFirst(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i, safe);

  const headings = [
    ...pickAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, safe).map(stripTags),
    ...pickAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, safe).map(stripTags),
  ].filter(Boolean).slice(0, 30);

  const buttonText = pickAll(/<button[^>]*>([\s\S]*?)<\/button>/gi, safe).map(stripTags).filter(Boolean).slice(0, 30);
  const ctaTexts = pickAll(/<a[^>]+class=["'][^"']*(cta|btn|button)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, safe).map(stripTags).filter(Boolean).slice(0, 30);

  const bodyText = stripTags(
    safe.replace(/<head[\s\S]*?<\/head>/i, ' ')
  ).substring(0, 50_000);

  const urls = extractUrlsFromHtml(safe);

  // Stripe / Hotmart / ClickBank checkout fingerprints in HTML.
  const checkoutHints = [];
  if (/checkout\.stripe\.com|js\.stripe\.com/i.test(safe)) checkoutHints.push('stripe');
  if (/pay\.hotmart\.com|hotmart\.com\/pay/i.test(safe)) checkoutHints.push('hotmart');
  if (/clickbank\.net|hop\.clickbank/i.test(safe)) checkoutHints.push('clickbank');
  if (/sun\.eduzz\.com|eduzz\.com\/c\//i.test(safe)) checkoutHints.push('eduzz');
  if (/jvz\d+\.com|jvzoo\.com/i.test(safe)) checkoutHints.push('jvzoo');
  if (/digistore24\.com/i.test(safe)) checkoutHints.push('digistore24');

  const aggregatedText = [
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    headings.join(' '),
    buttonText.join(' '),
    ctaTexts.join(' '),
    bodyText,
  ].filter(Boolean).join('\n');

  return {
    finalUrl,
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    headings,
    buttons: buttonText,
    ctas: ctaTexts,
    bodyTextPreview: bodyText.substring(0, 800),
    aggregatedText,
    urls,
    checkoutHints,
    bytes: safe.length,
  };
}

module.exports = { extractSignals, stripTags, extractUrlsFromHtml };
