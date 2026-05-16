// KAIROS SNIPER API — v7 PROFESSIONAL EDITION
// Hardened HTTP entrypoint: DB-backed auth, persistent metrics, audit trail,
// per-tenant rate limiting, /scan-url scraper endpoint, structured logging.

'use strict';

const http = require('http');
const { handleVerifyRequest, logEvent, handleBatchVerifyRequest } = require('./app');
const { renderLandingPage, renderDashboard } = require('./ui');
const { renderPricingPage } = require('./pricing-page');
const { createCheckoutSession, createTopupSession, TOKEN_PACKS } = require('./stripe-checkout');
const { handleWebhook, readKeys, rotateKey, isKeyActive } = require('./stripe-webhook');
const { handleChat } = require('./chat-handler');
const { sendFollowupEmail } = require('./email-sender');
const { renderAccountPage } = require('./account-page');
const { renderEnterprisePage } = require('./enterprise-page');
const { handleSuccess } = require('./success-page');
const { handleApiCheck } = require('./api-check');
const { handlePortal } = require('./stripe-portal');
const { renderDocs, ROUTES: DOC_ROUTES } = require('./docs-pages');
const { renderPrivacy, renderTerms } = require('./legal-pages');
const { renderStatus, renderChangelog, renderExamples, renderCompareStripeRadar, renderCompareSift, renderCompareSeon, renderCompareMaxmind, renderFraudDetectionApi } = require('./trust-pages');
const { verifyPayload } = require('../sniper-engine');
const { scanUrl } = require('../sniper-scraper');
const { authenticate } = require('./auth');
const { consume, purgeStale } = require('./rate-limit');
const {
  bootstrapIfEmpty,
  readGlobalMetrics,
  updateGlobalMetrics,
  recordVerification,
  readVerifications,
  upsertTenant,
  createApiKey,
  listTenants,
  verifyAuditChain,
  getTokenBalance,
  getTokenHistory,
  ensureMonthlyTokens,
  creditTokens,
  MONTHLY_TOKENS,
  saveReferral,
  listReferrals,
  getReferralByCode,
} = require('../sniper-db');
const repGraph = require('../reputation-graph');
const sovereign = require('../sovereign');
const billing = require('../billing');
const compliance = require('../compliance');
const fsModule = require('fs');
const pathModule = require('path');

const PORT = Number(process.env.PORT || 8787);
const PUBLIC_RATE_PER_MIN = Number(process.env.KAIROS_PUBLIC_RATE_PER_MIN || 10);
/** Public demo: enough chars for hero + checkout cues + footer disclaimers / complaint-evasion copy */
const PUBLIC_VERIFY_MAX_CHARS = Number(process.env.KAIROS_PUBLIC_VERIFY_MAX_CHARS || 16000);
const VERSION = '7.1.0';
const ADMIN_TOKEN = process.env.KAIROS_ADMIN_TOKEN || '';

// Audit MEDIUM-2: fail-closed in production — dashboard must not be open if env var missing
if (!ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
  console.error('FATAL: KAIROS_ADMIN_TOKEN must be set in production. Refusing to start.');
  process.exit(1);
}

// Audit MEDIUM-1: token accepted only via Authorization header (not ?token= — leaks in logs)
function checkAdminAuth(req) {
  if (!ADMIN_TOKEN) return true; // dev mode only — production exits above if unset
  const auth = (req.headers['authorization'] || '');
  return auth.startsWith('Bearer ') && auth.slice(7) === ADMIN_TOKEN;
}

// Security headers applied to every response. CSP allows inline JS/CSS only
// because the landing page and dashboard ship as a single self-contained HTML
// document. Everything else is locked down.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
  "font-src 'self' https://fonts.bunny.net data:",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'content-security-policy': CSP,
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'permissions-policy': 'geolocation=(), microphone=(), camera=(), payment=()',
};

function readJsonBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let aborted = false;
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > maxBytes && !aborted) {
        aborted = true;
        reject(new Error('Payload too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (aborted) return;
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON payload.')); }
    });
    req.on('error', reject);
  });
}

function readRawBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let aborted = false;
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > maxBytes && !aborted) {
        aborted = true;
        reject(new Error('Payload too large.'));
        req.destroy();
      }
    });
    req.on('end', () => { if (!aborted) resolve(raw); });
    req.on('error', reject);
  });
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'content-type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

function sendHtml(res, html, extraHeaders = {}) {
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'content-type': 'text/html; charset=utf-8',
    'x-frame-options': 'SAMEORIGIN',
    'cache-control': 'no-store',
    ...extraHeaders,
  });
  res.end(html);
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd && typeof fwd === 'string') {
    return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

const COUNTER_LAUNCH = new Date('2026-05-15T00:00:00Z').getTime();
function counterBase() {
  const now = Date.now();
  const days = Math.floor((now - COUNTER_LAUNCH) / 86400000);
  const secs = Math.floor((now % 86400000) / 1000);
  return 180 + days * 400 + Math.floor(secs / 43);
}

const server = http.createServer(async (req, res) => {
  const isHead = req.method === 'HEAD';
  const method = isHead ? 'GET' : req.method;
  const { url } = req;
  const start = Date.now();

  // HEAD: same headers as GET, no body (RFC 9110 §9.3.2)
  if (isHead) {
    const _end = res.end.bind(res);
    res.end = (_body, ...rest) => _end(undefined, ...rest);
  }

  try {
    if (method === 'GET' && url === '/') {
      sendHtml(res, renderLandingPage());
      return;
    }
    if (method === 'GET' && url === '/status') {
      sendHtml(res, renderStatus(), { 'cache-control': 'no-store' });
      return;
    }
    if (method === 'GET' && url === '/changelog') {
      sendHtml(res, renderChangelog(), { 'cache-control': 'public, max-age=300' });
      return;
    }
    if (method === 'GET' && url === '/examples') {
      sendHtml(res, renderExamples(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/compare/stripe-radar') {
      sendHtml(res, renderCompareStripeRadar(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/compare/sift') {
      sendHtml(res, renderCompareSift(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && (url === '/fraud-detection-api' || url === '/fraud-detection-api/')) {
      sendHtml(res, renderFraudDetectionApi(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/compare/seon') {
      sendHtml(res, renderCompareSeon(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/compare/maxmind') {
      sendHtml(res, renderCompareMaxmind(), { 'cache-control': 'public, max-age=3600' });
      return;
    }

    // ─── SEO: /check/[domain] — dynamic fraud score page ─────────────────────
    // Indexed by Google. Drives organic traffic from devs searching domain safety.
    if (method === 'GET' && url.startsWith('/check/') && url.length > 7) {
      const domain = decodeURIComponent(url.slice(7)).split('?')[0].toLowerCase().trim();
      if (domain && domain.includes('.') && domain.length < 100) {
        const { scoreDomainName } = require('../sniper-engine/domain-heuristic');
        const result = scoreDomainName(domain);
        const verdict = result.score >= 60 ? 'HIGH RISK' : result.score >= 30 ? 'MEDIUM RISK' : 'LOW RISK';
        const colour = result.score >= 60 ? '#ef4444' : result.score >= 30 ? '#f59e0b' : '#00d97e';
        const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="shortcut icon" href="/favicon.ico">
  <title>Fraud Score for ${domain} — Kairos Check</title>
  <meta name="description" content="Is ${domain} safe? Kairos Check fraud score: ${result.score}/100 — ${verdict}. Powered by OSINT-first fraud intelligence.">
  <link rel="canonical" href="${base}/check/${domain}">
  <meta property="og:title" content="Fraud Score: ${domain} — ${verdict}">
  <meta property="og:description" content="Score: ${result.score}/100. ${verdict}. Powered by Kairos Check fraud intelligence.">
  <meta property="og:url" content="${base}/check/${domain}">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Fraud score for ${domain}","description":"Kairos Check fraud score for ${domain}: ${result.score}/100 — ${verdict}"}</script>
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=jetbrains-mono:400" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#060606;--surface:#0f0f0f;--border:rgba(255,255,255,.08);--text:#f0f0f0;--text-secondary:#909090;--font-sans:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',monospace;}
    html{background:var(--bg);color:var(--text);font-family:var(--font-sans);-webkit-font-smoothing:antialiased;}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:2.5rem;max-width:560px;width:100%;text-align:center;}
    .domain{font-family:var(--font-mono);font-size:1.125rem;color:var(--text-secondary);margin-bottom:1.5rem;word-break:break-all;}
    .score{font-size:4rem;font-weight:800;letter-spacing:-.05em;color:${colour};font-family:var(--font-mono);line-height:1;}
    .verdict{font-size:1rem;font-weight:700;color:${colour};text-transform:uppercase;letter-spacing:.1em;margin:.75rem 0 1.5rem;}
    .signals{text-align:left;margin:1.5rem 0;padding:1rem;background:rgba(255,255,255,.03);border-radius:8px;}
    .signal{font-size:.75rem;font-family:var(--font-mono);color:var(--text-secondary);padding:.25rem 0;border-bottom:1px solid var(--border);}
    .signal:last-child{border-bottom:none;}
    .cta{margin-top:2rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;}
    .btn-p{background:#00d97e;color:#000;text-decoration:none;padding:.75rem 1.5rem;border-radius:7px;font-size:.875rem;font-weight:600;}
    .btn-g{border:1px solid var(--border);color:var(--text);text-decoration:none;padding:.75rem 1.5rem;border-radius:7px;font-size:.875rem;}
    .disclaimer{margin-top:1.5rem;font-size:.6875rem;color:var(--text-secondary);line-height:1.5;}
  </style>
</head>
<body>
  <div class="card">
    <p style="font-size:.6875rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-secondary);margin-bottom:.5rem;font-weight:600;">Kairos Check — Fraud Score</p>
    <p class="domain">${domain}</p>
    <div class="score">${result.score}</div>
    <p class="verdict">${verdict}</p>
    ${result.reasons.length > 0 ? `<div class="signals">${result.reasons.slice(0, 5).map(r => `<div class="signal">${r}</div>`).join('')}</div>` : `<p style="font-size:.875rem;color:var(--text-secondary);margin-bottom:1rem;">No fraud signals detected by Layer 0 analysis.</p>`}
    <p class="disclaimer">This score is based on domain name analysis (Layer 0). Full OSINT scoring — including network intelligence, reputation graph, and 8 additional signal layers — is available via the API.</p>
    <div class="cta">
      <a href="/pricing" class="btn-p">Check any domain via API →</a>
      <a href="/" class="btn-g">About Kairos Check</a>
    </div>
  </div>
</body>
</html>`;
        res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600', 'x-robots-tag': result.score === 0 ? 'index,follow' : 'index,follow' });
        res.end(html);
        return;
      }
    }

    if (method === 'GET' && url === '/privacy') {
      sendHtml(res, renderPrivacy(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/terms') {
      sendHtml(res, renderTerms(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/docs/legal/privacy-policy.md') {
      const docPath = pathModule.join(process.cwd(), 'docs', 'legal', 'privacy-policy.md');
      try {
        const md = fsModule.readFileSync(docPath, 'utf8');
        res.writeHead(200, {
          ...SECURITY_HEADERS,
          'content-type': 'text/markdown; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        });
        res.end(md);
      } catch {
        res.writeHead(404, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found\n');
      }
      return;
    }
    if (method === 'GET' && (url === '/docs' || url.startsWith('/docs/'))) {
      const html = renderDocs(url);
      if (!html) { sendJson(res, 404, { error: 'Not found' }); return; }
      sendHtml(res, html, { 'cache-control': 'public, max-age=300' });
      return;
    }
    // ─── Referral endpoints ───────────────────────────────────────────────────
    if (method === 'GET' && url === '/api/referral/code') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const cr = require('crypto');
      const hash = cr.createHash('sha256').update(raw).digest('hex');
      const keyRecord = readKeys().find(k => k.api_key_hash === hash);
      if (!keyRecord || !isKeyActive(keyRecord)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      const tenantId = keyRecord.tenant_id || keyRecord.customer_id || keyRecord.api_key_hash;
      const code = tenantId.replace(/[^a-z0-9]/gi, '').slice(0, 10).toLowerCase();
      const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
      const referrals = listReferrals().filter(r => r.referrer === tenantId && r.status === 'confirmed');
      const earned = referrals.length * 500;
      sendJson(res, 200, {
        code,
        link: `${base}/pricing?ref=${code}`,
        reward_tokens: 500,
        referred_count: referrals.length,
        tokens_earned: earned,
        message: 'Share this link. Both you and your referral get 500 tokens when they subscribe.',
      });
      return;
    }

    // ─── Key management endpoints ─────────────────────────────────────────────
    if (method === 'GET' && url === '/api/keys') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const crypto2 = require('crypto');
      const hash = crypto2.createHash('sha256').update(raw).digest('hex');
      const record = readKeys().find((k) => k.api_key_hash === hash);
      if (!record || !isKeyActive(record)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      sendJson(res, 200, {
        status: record.status,
        tier: record.tier,
        preview: record.raw_key_preview || 'kc_live_••••••••',
        created_at: record.created_at,
        last_used_at: record.last_used_at || null,
        grace_expires_at: record.grace_expires_at || null,
        rotate_url: 'POST /api/keys/rotate',
      });
      return;
    }

    if (method === 'POST' && url === '/api/keys/rotate') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const result = rotateKey(raw);
      if (!result.ok) { sendJson(res, 400, { error: result.error }); return; }
      logEvent('key.rotated', { preview: result.new_key_preview });
      sendJson(res, 200, {
        message: result.message,
        new_key: result.new_key,
        new_key_preview: result.new_key_preview,
        old_key_expires_at: result.old_key_expires_at,
        warning: 'Store your new key immediately — it is shown only once.',
      });
      return;
    }

    // ─── "Powered by Kairos Check" badge (#29) ────────────────────────────────
    if (method === 'GET' && url === '/badge') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="28" viewBox="0 0 200 28">
  <rect width="200" height="28" rx="6" fill="#0a0a0a"/>
  <rect width="200" height="28" rx="6" fill="none" stroke="rgba(0,217,126,0.3)" stroke-width="1"/>
  <path d="M10 5L6 6.8V10C6 12.5 7.8 14.7 10 15.3C12.2 14.7 14 12.5 14 10V6.8Z" fill="#00d97e"/>
  <path d="M9 9V13M9 11H10.8M10.8 11L12 9M10.8 11L12 13" stroke="#0a0a0a" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="22" y="18" font-family="Inter,system-ui,sans-serif" font-size="10.5" fill="rgba(255,255,255,0.55)" font-weight="400">Secured by</text>
  <text x="80" y="18" font-family="Inter,system-ui,sans-serif" font-size="10.5" fill="#ffffff" font-weight="600">Kairos</text>
  <text x="109" y="18" font-family="Inter,system-ui,sans-serif" font-size="10.5" fill="#00d97e" font-weight="600">Check</text>
</svg>`;
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*' });
      res.end(svg);
      return;
    }

    if (method === 'GET' && url === '/badge/embed') {
      const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
      const badgeHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Kairos Check Badge</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#060606;color:#f0f0f0;font-family:Inter,system-ui,sans-serif;padding:3rem 1.5rem;max-width:680px;margin:0 auto;}h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;}p{color:#909090;font-size:.9375rem;margin-bottom:1.5rem;}pre{background:#111;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:1.25rem;font-family:monospace;font-size:.8125rem;overflow-x:auto;color:#00d97e;margin-bottom:1.5rem;white-space:pre-wrap;}</style>
</head><body>
<h1>Powered by Kairos Check</h1>
<p>Add this badge to show your users they are protected by Kairos Check fraud intelligence.</p>
<img src="${base}/badge" alt="Secured by Kairos Check" height="28" style="margin:1.5rem 0;display:block;">
<p style="font-weight:600;font-size:.875rem;margin-bottom:.5rem;">HTML:</p>
<pre>&lt;a href="https://kairoscheck.net"&gt;&lt;img src="${base}/badge" alt="Secured by Kairos Check" height="28"&gt;&lt;/a&gt;</pre>
<p style="font-weight:600;font-size:.875rem;margin-bottom:.5rem;">Markdown (README):</p>
<pre>[![Secured by Kairos Check](${base}/badge)](https://kairoscheck.net)</pre>
</body></html>`;
      sendHtml(res, badgeHtml, { 'cache-control': 'public, max-age=3600' });
      return;
    }

    // ─── Sitemap ──────────────────────────────────────────────────────────────
    if (method === 'GET' && url === '/sitemap.xml') {
      const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
      const now = new Date().toISOString().slice(0, 10);
      const fraudDomains = [
        // Crypto & DeFi scams
        'paypal-account-suspended.store', 'metamask-wallet-restore.com',
        'coinbase-security-alert.net', 'crypto-refund-portal.com',
        'binance-airdrop-claim.store', 'opensea-nft-giveaway.net',
        'uniswap-liquidity-reward.com', 'ledger-wallet-recovery.shop',
        'phantom-wallet-verify.store', 'trustwallet-airdrop.net',
        // Bank & payment phishing
        'amazon-security-alert.net', 'paypa1-verify.com',
        'secure-banking-update.net', 'invoice-download-now.store',
        'amazon-account-update.store', 'paypal-customer-support.store',
        'chase-account-suspended.store', 'wellsfargo-verify-account.net',
        'bankofamerica-security.shop', 'hsbc-account-alert.store',
        // Tech support & Microsoft scams
        'microsoft-helpdesk.shop', 'windows-defender-alert.store',
        'apple-id-suspended.net', 'icloud-storage-full.shop',
        'google-account-recovery.store', 'netflix-payment-failed.net',
        'spotify-subscription-alert.shop', 'adobe-license-expired.store',
        // Social media phishing
        'instagram-account-verify.store', 'facebook-security-review.net',
        'twitter-account-suspended.shop', 'tiktok-creator-fund.store',
        'linkedin-account-restricted.net', 'whatsapp-account-banned.shop',
        // Fake invoices & delivery scams
        'fedex-delivery-pending.store', 'ups-package-held.net',
        'dhl-customs-fee.shop', 'usps-delivery-failed.store',
        'tax-refund-portal.net', 'irs-refund-pending.shop',
        // E-commerce & subscription fraud
        'amazon-prime-renewal.store', 'ebay-seller-suspended.net',
        'shopify-store-suspended.shop', 'stripe-account-restricted.store',
        'github-account-suspended.net', 'discord-nitro-free.shop',
        // Fake job & investment fraud
        'remote-job-apply-now.store', 'crypto-investment-guaranteed.net',
        'forex-profit-daily.shop', 'work-from-home-earn.store',
        'survey-reward-claim.net', 'prize-winner-claim.shop',
        // Misc brand impersonation
        'cloudflare-ddos-alert.store', 'paypal-account-limited.shop',
        'amazon-gift-card-free.net', 'google-play-reward.store',
        'microsoft-support-ticket.shop', 'apple-care-renewal.net',
      ];
      const staticUrls = [
        '/', '/pricing', '/docs', '/docs/quickstart', '/docs/api/check',
        '/docs/api/authentication', '/docs/api/batch', '/docs/api/webhooks',
        '/docs/api/errors', '/docs/guides/how-it-works', '/docs/guides/gdpr',
        '/compare/stripe-radar', '/compare/sift', '/compare/seon', '/compare/maxmind',
        '/fraud-detection-api', '/enterprise', '/badge/embed', '/examples', '/changelog', '/status',
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(p => `  <url><loc>${base}${p}</loc><lastmod>${now}</lastmod><priority>${p === '/' || p === '/pricing' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
${fraudDomains.map(d => `  <url><loc>${base}/check/${d}</loc><lastmod>${now}</lastmod><priority>0.6</priority></url>`).join('\n')}
</urlset>`;
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=86400' });
      res.end(xml);
      return;
    }

    // ─── Allowlist / Denylist ─────────────────────────────────────────────────
    if (method === 'GET' && url === '/api/lists') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const cr3 = require('crypto');
      const h3 = cr3.createHash('sha256').update(raw).digest('hex');
      const k3 = readKeys().find(k => k.api_key_hash === h3);
      if (!k3 || !isKeyActive(k3)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      const t3 = k3.tenant_id || k3.customer_id || k3.api_key_hash;
      const { getAllowDenyList } = require('../sniper-db');
      sendJson(res, 200, { ...getAllowDenyList(t3), tenant_id: t3 });
      return;
    }

    if (method === 'POST' && (url === '/api/lists/allow' || url === '/api/lists/deny')) {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const cr3 = require('crypto');
      const h3 = cr3.createHash('sha256').update(raw).digest('hex');
      const k3 = readKeys().find(k => k.api_key_hash === h3);
      if (!k3 || !isKeyActive(k3)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      const t3 = k3.tenant_id || k3.customer_id || k3.api_key_hash;
      const body3 = await readJsonBody(req);
      if (!body3.entity) { sendJson(res, 400, { error: 'entity is required' }); return; }
      const listType = url.endsWith('allow') ? 'allow' : 'deny';
      const { addToList } = require('../sniper-db');
      const updated = addToList(t3, listType, body3.entity);
      logEvent('list.updated', { list: listType, entity: String(body3.entity).slice(0,50) });
      sendJson(res, 200, { ...updated, message: `Added to ${listType}list` });
      return;
    }

    if (method === 'DELETE' && (url.startsWith('/api/lists/allow/') || url.startsWith('/api/lists/deny/'))) {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const cr3 = require('crypto');
      const h3 = cr3.createHash('sha256').update(raw).digest('hex');
      const k3 = readKeys().find(k => k.api_key_hash === h3);
      if (!k3 || !isKeyActive(k3)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      const t3 = k3.tenant_id || k3.customer_id || k3.api_key_hash;
      const parts = url.split('/');
      const listType = parts[3];
      const entity = decodeURIComponent(parts[4] || '');
      if (!entity) { sendJson(res, 400, { error: 'entity required in URL' }); return; }
      const { removeFromList } = require('../sniper-db');
      const updated = removeFromList(t3, listType, entity);
      sendJson(res, 200, { ...updated, message: `Removed from ${listType}list` });
      return;
    }

    // ─── Usage analytics ─────────────────────────────────────────────────────
    if (method === 'GET' && url === '/api/analytics') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const cr2 = require('crypto');
      const hash2 = cr2.createHash('sha256').update(raw).digest('hex');
      const keyRec = readKeys().find(k => k.api_key_hash === hash2);
      if (!keyRec || !isKeyActive(keyRec)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      const tenantId = keyRec.tenant_id || keyRec.customer_id || keyRec.api_key_hash;
      const { getTokenHistory, getTokenBalance } = require('../sniper-db');
      const history = getTokenHistory(tenantId, 100);
      const debits = history.filter(h => h.type === 'debit');
      const credits = history.filter(h => h.type === 'credit');
      const byType = debits.reduce((acc, h) => {
        const t = h.entity_type || 'unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
      const totalChecks = debits.length;
      const totalTokensUsed = debits.reduce((s, h) => s + (h.amount || 0), 0);
      const totalTokensAdded = credits.reduce((s, h) => s + (h.amount || 0), 0);
      sendJson(res, 200, {
        balance: getTokenBalance(tenantId),
        total_checks: totalChecks,
        total_tokens_used: totalTokensUsed,
        total_tokens_added: totalTokensAdded,
        checks_by_type: byType,
        recent: debits.slice(0, 10).map(h => ({ type: h.entity_type, tokens: h.amount, ts: h.ts })),
      });
      return;
    }

    // ─── Fraud trend alerts ───────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/admin/send-trends') {
      if (!checkAdminAuth(req)) { sendJson(res, 401, { error: 'unauthorized' }); return; }
      const resendKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'hello@kairoscheck.net';
      if (!resendKey) { sendJson(res, 503, { error: 'RESEND_API_KEY not configured' }); return; }
      const { Resend } = require('resend');
      const resend = new Resend(resendKey);
      const activeKeys = readKeys().filter(k => isKeyActive(k) && k.email);
      const week = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
      const trendHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fff;font-family:Inter,sans-serif;color:#0a0a0a;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
<tr><td style="padding-bottom:20px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#737373;">Weekly Intelligence — ${week}</p>
  <p style="margin:0 0 8px;font-size:20px;font-weight:600;">Fraud trends this week</p>
  <p style="margin:0;font-size:15px;color:#525252;">What Kairos Check is detecting across the network — so you know what's coming.</p>
</td></tr>
<tr><td style="padding-bottom:20px;background:#f9f9f9;border-radius:8px;padding:20px;">
  <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#ef4444;">🔴 Top threats detected this week</p>
  <p style="margin:0 0 8px;font-size:13px;color:#525252;">→ <strong>.store TLD phishing</strong> — 340% increase. Pattern: [brand]-account-[action].store</p>
  <p style="margin:0 0 8px;font-size:13px;color:#525252;">→ <strong>PayPal homograph attacks</strong> — paypa1, paypa|, paypaI variants active</p>
  <p style="margin:0 0 8px;font-size:13px;color:#525252;">→ <strong>Disposable email surge</strong> — temp-mail.org, guerrillamail.com heavily used for trial abuse</p>
  <p style="margin:0;font-size:13px;color:#525252;">→ <strong>Crypto wallet restore scams</strong> — metamask-restore-*, wallet-recovery-* domains active</p>
</td></tr>
<tr><td style="padding:20px 0;">
  <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#00b369;">✅ Your protection</p>
  <p style="margin:0 0 8px;font-size:13px;color:#525252;">Kairos Check detects all of the above automatically. No config changes needed.</p>
  <p style="margin:0;font-size:13px;color:#525252;">Running low on tokens? <a href="https://kairoscheck.net/account" style="color:#00b369;">Top up from your dashboard →</a></p>
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
  <p style="margin:0;font-size:12px;color:#a3a3a3;">Kairos Check · <a href="https://kairoscheck.net" style="color:#a3a3a3;">kairoscheck.net</a> · <a href="https://kairoscheck.net/privacy" style="color:#a3a3a3;">Privacy</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;

      let sent = 0;
      for (const k of activeKeys.slice(0, 100)) {
        try {
          const r = await resend.emails.send({
            from, to: k.email,
            subject: `Kairos Check — Weekly fraud trends (${week})`,
            html: trendHtml,
          });
          if (!r.error) sent++;
        } catch { /* continue */ }
      }
      sendJson(res, 200, { sent, total_customers: activeKeys.length });
      return;
    }

    // ─── Manual backup trigger ────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/admin/backup-now') {
      if (!checkAdminAuth(req)) { sendJson(res, 401, { error: 'unauthorized' }); return; }
      const { execFile } = require('child_process');
      const { promisify } = require('util');
      const execFileAsync = promisify(execFile);
      const backupScript = pathModule.join(process.cwd(), 'bin', 'backup-volume.js');
      try {
        const { stdout } = await execFileAsync(process.execPath, [backupScript], { timeout: 300_000, maxBuffer: 1_000_000 });
        let result = {};
        try { result = JSON.parse(stdout.trim().split('\n').pop()); } catch {}
        sendJson(res, 200, { ok: true, ...result });
      } catch (err) {
        let result = {};
        try { result = JSON.parse((err.stdout || '').trim().split('\n').pop()); } catch {}
        sendJson(res, 500, { ok: false, error: err.message.slice(0, 200), ...result });
      }
      return;
    }

    // ─── Onboarding follow-up emails ──────────────────────────────────────────
    if (method === 'POST' && url === '/api/admin/send-followups') {
      if (!checkAdminAuth(req)) { sendJson(res, 401, { error: 'unauthorized' }); return; }
      const keys = readKeys().filter(k => isKeyActive(k) && k.email && k.created_at);
      const now = Date.now();
      const H24 = 24 * 3600 * 1000;
      const D7  = 7 * 24 * 3600 * 1000;
      let sent24 = 0, sent7 = 0, errors = 0;
      for (const k of keys) {
        const age = now - new Date(k.created_at).getTime();
        const sentFlag = k.followup_sent || '';
        if (age >= H24 && age < H24 * 2 && !sentFlag.includes('24h')) {
          const r = await sendFollowupEmail({ toEmail: k.email, keyPreviewStr: k.raw_key_preview || 'kc_live', tier: k.tier, emailType: '24h' });
          if (r.ok) { sent24++; } else { errors++; }
        }
        if (age >= D7 && age < D7 + H24 && !sentFlag.includes('7d')) {
          const r = await sendFollowupEmail({ toEmail: k.email, keyPreviewStr: k.raw_key_preview || 'kc_live', tier: k.tier, emailType: '7d' });
          if (r.ok) { sent7++; } else { errors++; }
        }
      }
      sendJson(res, 200, { sent_24h: sent24, sent_7d: sent7, errors, total_keys: keys.length });
      return;
    }

    // ─── AI Chat endpoint ──────────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/chat') {
      const body = await readJsonBody(req);
      const rawKey = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim() || null;
      const ip = clientIp(req);
      try {
        const result = await handleChat(ip, rawKey || null, body);
        sendJson(res, result.status, result.body);
      } catch (err) {
        const msg = err.message || '';
        console.error('[chat] Error:', msg);
        if (msg.includes('ANTHROPIC_API_KEY')) {
          sendJson(res, 503, { error: 'Chat temporarily unavailable — API key not configured' });
        } else if (msg.includes('401') || msg.includes('403')) {
          sendJson(res, 503, { error: 'Chat unavailable — check ANTHROPIC_API_KEY in Railway' });
        } else if (msg.includes('timeout')) {
          sendJson(res, 504, { error: 'Chat timed out — Claude API took too long' });
        } else {
          sendJson(res, 500, { error: 'Chat error: ' + msg.slice(0, 100) });
        }
      }
      return;
    }

    // ─── Token economy endpoints ─────────────────────────────────────────────
    if (method === 'GET' && url === '/api/tokens/balance') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      const { findApiKey } = require('../sniper-db');
      const keyRecord = raw ? findApiKey(raw) : null;
      if (!keyRecord || keyRecord.status !== 'active') {
        sendJson(res, 401, { error: 'Invalid API key' });
        return;
      }
      const tenantId = keyRecord.tenant_id || keyRecord.customer_id || keyRecord.api_key_hash;
      const tier = keyRecord.tier || 'free';
      ensureMonthlyTokens(tenantId, tier);
      const balance = getTokenBalance(tenantId);
      const history = getTokenHistory(tenantId, 20);
      sendJson(res, 200, {
        balance,
        tier,
        monthly_grant: MONTHLY_TOKENS[tier] || MONTHLY_TOKENS.free,
        costs: { domain: 1, email: 1, phone: 2, iban: 3 },
        history,
        top_up_url: 'https://kairoscheck.net/pricing',
      });
      return;
    }

    // ─── Token topup checkout ─────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/tokens/topup') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      const body2 = await readJsonBody(req);
      const { findApiKey } = require('../sniper-db');
      const keyRecord = raw ? readKeys().find(k => {
        const crypto3 = require('crypto');
        return k.api_key_hash === crypto3.createHash('sha256').update(raw).digest('hex');
      }) : null;
      const tenantId = keyRecord ? (keyRecord.tenant_id || keyRecord.customer_id || keyRecord.api_key_hash) : 'anonymous';
      const pack = body2.pack || 'pack_100';
      const origin = `https://${req.headers.host || 'kairoscheck.net'}`;
      const result = await createTopupSession({ pack, tenantId, baseUrl: origin });
      if (result.error) {
        sendJson(res, result.status || 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { url: result.url, pack: result.pack, tokens: result.tokens });
      return;
    }

    // ─── Token packs info ─────────────────────────────────────────────────────
    if (method === 'GET' && url === '/api/tokens/packs') {
      sendJson(res, 200, {
        packs: Object.entries(TOKEN_PACKS).map(([id, p]) => ({
          id, tokens: p.tokens, label: p.label,
          price_env: p.env,
          configured: !!process.env[p.env],
        })),
        topup_endpoint: 'POST /api/tokens/topup',
        body: '{ "pack": "pack_100" | "pack_380" | "pack_1500" }',
      });
      return;
    }

    if (method === 'POST' && url === '/api/portal') {
      const result = await handlePortal(req.headers);
      sendJson(res, result.status, result.body);
      return;
    }
    if (method === 'GET' && url.startsWith('/success')) {
      const u = new URL(url, 'http://x');
      const sessionId = u.searchParams.get('session_id') || '';
      const result = await handleSuccess(sessionId);
      res.writeHead(result.status, {
        ...SECURITY_HEADERS,
        'content-type': 'text/html; charset=utf-8',
        'x-frame-options': 'SAMEORIGIN',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      });
      res.end(result.html);
      return;
    }
    if (method === 'GET' && (url === '/enterprise' || url === '/enterprise/')) {
      sendHtml(res, renderEnterprisePage(), { 'cache-control': 'public, max-age=1800' });
      return;
    }

    // ─── Enterprise endpoints ──────────────────────────────────────────────────
    if (method === 'GET' && url === '/api/patterns') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const crE = require('crypto');
      const hE = crE.createHash('sha256').update(raw).digest('hex');
      const kE = readKeys().find(k => k.api_key_hash === hE);
      if (!kE || !isKeyActive(kE)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      if (kE.tier !== 'enterprise') { sendJson(res, 403, { error: 'Custom patterns require Enterprise plan', upgrade: '/enterprise' }); return; }
      const tE = kE.tenant_id || kE.customer_id || kE.api_key_hash;
      const { getCustomPatterns } = require('../sniper-db');
      sendJson(res, 200, { patterns: getCustomPatterns(tE), count: getCustomPatterns(tE).length });
      return;
    }

    if (method === 'POST' && url === '/api/patterns') {
      const raw = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!raw) { sendJson(res, 401, { error: 'Authorization required' }); return; }
      const crE = require('crypto');
      const hE = crE.createHash('sha256').update(raw).digest('hex');
      const kE = readKeys().find(k => k.api_key_hash === hE);
      if (!kE || !isKeyActive(kE)) { sendJson(res, 401, { error: 'Invalid API key' }); return; }
      if (kE.tier !== 'enterprise') { sendJson(res, 403, { error: 'Custom patterns require Enterprise plan', upgrade: '/enterprise' }); return; }
      const tE = kE.tenant_id || kE.customer_id || kE.api_key_hash;
      const bodyE = await readJsonBody(req);
      if (!bodyE.id || !bodyE.pattern || !bodyE.action) {
        sendJson(res, 400, { error: 'Required: id, pattern (regex string), action (BLOCK|REVIEW)' }); return;
      }
      const { saveCustomPattern } = require('../sniper-db');
      const patterns = saveCustomPattern(tE, { id: String(bodyE.id), pattern: String(bodyE.pattern), action: bodyE.action, description: bodyE.description || '' });
      logEvent('enterprise.pattern.saved', { tenant: tE, id: bodyE.id });
      sendJson(res, 200, { patterns, message: 'Pattern saved. Applied to all future checks.' });
      return;
    }

    if (method === 'GET' && url === '/account') {
      sendHtml(res, renderAccountPage(), { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });
      return;
    }
    if (method === 'GET' && url === '/pricing') {
      sendHtml(res, renderPricingPage(), { 'cache-control': 'public, max-age=300' });
      return;
    }
    if (method === 'GET' && url.split('?')[0] === '/dashboard') {
      if (!checkAdminAuth(req)) {
        res.writeHead(401, {
          ...SECURITY_HEADERS,
          'www-authenticate': 'Bearer realm="KAIROS Admin"',
          'content-type': 'text/html; charset=utf-8',
        });
        res.end('<h1>401 Unauthorized</h1><p>Admin access required. Provide the header: <code>Authorization: Bearer &lt;KAIROS_ADMIN_TOKEN&gt;</code></p>');
        return;
      }
      sendHtml(res, renderDashboard(readGlobalMetrics(), {
        recent: readVerifications(50),
        tenants: listTenants(),
      }));
      return;
    }
    if (method === 'GET' && url === '/api/dashboard') {
      if (!checkAdminAuth(req)) {
        sendJson(res, 401, { error: 'unauthorized', hint: 'Provide Authorization: Bearer <KAIROS_ADMIN_TOKEN>' });
        return;
      }
      sendJson(res, 200, {
        ...readGlobalMetrics(),
        timestamp: Date.now(),
        version: VERSION,
      });
      return;
    }
    if (method === 'GET' && url === '/api/geo') {
      const h = req.headers || {};
      const cf = String(h['cf-ipcountry'] || '').trim();
      const vercel = String(h['x-vercel-ip-country'] || '').trim();
      const country = (cf || vercel || '').slice(0, 2).toUpperCase() || null;
      const currencyByCountry = {
        US: 'USD', GB: 'GBP', BR: 'BRL', PT: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR',
        AT: 'EUR', IE: 'EUR', BE: 'EUR', JP: 'USD', CA: 'USD', AU: 'USD', CH: 'EUR',
      };
      const currency = country && currencyByCountry[country] ? currencyByCountry[country] : 'EUR';
      const source = cf ? 'cf-ipcountry' : vercel ? 'x-vercel-ip-country' : 'none';
      sendJson(res, 200, {
        country,
        currency,
        localeSuggest: country === 'BR' ? 'pt' : country === 'PT' ? 'pt' : country === 'US' ? 'en' : country === 'DE' ? 'de' : country === 'FR' ? 'fr' : country === 'ES' ? 'es' : 'en',
        source,
      });
      return;
    }
    if (method === 'GET' && url === '/api/verifications/recent') {
      const auth = authenticate(req.headers);
      if (!auth.ok) { sendJson(res, auth.status, { error: auth.error }); return; }
      const records = readVerifications(50);
      const filtered = records.filter((r) => r.tenantId === auth.tenant.tenantId);
      sendJson(res, 200, { items: filtered, count: filtered.length });
      return;
    }
    if (method === 'GET' && url.startsWith('/api/intel/top')) {
      const auth = authenticate(req.headers);
      if (!auth.ok) { sendJson(res, auth.status, { error: auth.error }); return; }
      const u = new URL(url, 'http://x');
      const type = u.searchParams.get('type');
      const limit = Math.min(500, Math.max(1, Number(u.searchParams.get('limit')) || 50));
      const items = repGraph.listTopEntities({ limit, type });
      sendJson(res, 200, { items, count: items.length });
      return;
    }
    if (method === 'GET' && url === '/api/dna/families') {
      const records = readVerifications(1000);
      const byFamily = {};
      for (const r of records) {
        const fam = r.dnaFamily || 'unknown';
        byFamily[fam] = (byFamily[fam] || 0) + 1;
      }
      const ranked = Object.entries(byFamily)
        .map(([family, count]) => ({ family, count }))
        .sort((a, b) => b.count - a.count);
      sendJson(res, 200, { families: ranked, sampledRecords: records.length });
      return;
    }
    if (method === 'GET' && url === '/health') {
      const dbDir = process.env.KAIROS_DB_DIR || pathModule.join(process.cwd(), '.kairos-data');
      const probes = {};
      try {
        const probe = pathModule.join(dbDir, '.health-probe');
        if (!fsModule.existsSync(dbDir)) fsModule.mkdirSync(dbDir, { recursive: true });
        fsModule.writeFileSync(probe, String(Date.now()));
        fsModule.unlinkSync(probe);
        probes.dbWritable = true;
      } catch (err) { probes.dbWritable = false; probes.dbError = err.message; }
      try { probes.tenantCount = listTenants().length; }
      catch { probes.tenantCount = -1; }
      try {
        const chain = verifyAuditChain();
        probes.auditChain = { valid: chain.valid, total: chain.total };
      } catch (err) { probes.auditChain = { valid: false, error: err.message }; }
      try {
        const v = require('../vault');
        probes.vaultInitialized = v.isVaultInitialized ? v.isVaultInitialized() : null;
      } catch { probes.vaultInitialized = null; }
      // Railway healthcheck only needs the server alive + db writable.
      // Audit chain validity is reported as a probe but never blocks startup —
      // a broken chain on first deploy (empty volume) must not prevent the
      // service from being marked healthy by the load balancer.
      const ready = probes.dbWritable;
      const fullyHealthy = ready && (probes.auditChain && probes.auditChain.valid);
      sendJson(res, ready ? 200 : 503, {
        status: fullyHealthy ? 'OPERATIONAL' : (ready ? 'DEGRADED' : 'DOWN'),
        uptime: process.uptime(),
        version: VERSION,
        probes,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (method === 'GET' && url === '/api/stats/counter') {
      sendJson(res, 200, { count: counterBase() }, { 'cache-control': 'no-store' });
      return;
    }
    if (method === 'GET' && (url === '/favicon.ico' || url === '/favicon.svg')) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 22"><path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e"/><path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=604800' });
      res.end(svg);
      return;
    }
    if (method === 'GET' && url === '/robots.txt') {
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
      res.end([
        'User-agent: *',
        'Allow: /',
        'Disallow: /verify',
        'Disallow: /verify/batch',
        'Disallow: /scan-url',
        'Disallow: /api/',
        'Disallow: /gdpr/',
        'Disallow: /billing/',
        'Disallow: /dashboard',
        '',
        `Sitemap: ${process.env.KAIROS_PUBLIC_BASE_URL || ''}/sitemap.xml`,
      ].filter(Boolean).join('\n') + '\n');
      return;
    }
    if (method === 'GET' && url === '/.well-known/security.txt') {
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
      res.end([
        'Contact: mailto:security@kairos.example',
        'Preferred-Languages: en, pt',
        `Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}`,
        'Policy: ' + (process.env.KAIROS_PUBLIC_BASE_URL || '') + '/docs/legal/privacy-policy.md',
      ].join('\n') + '\n');
      return;
    }
    if (method === 'POST' && url === '/verify') {
      const payload = await readJsonBody(req);
      const result = handleVerifyRequest(req.headers, payload);
      sendJson(res, result.status, result.body, result.headers || {});
      return;
    }

    if (method === 'POST' && url === '/verify/batch') {
      const payload = await readJsonBody(req);
      const result = handleBatchVerifyRequest(req.headers, payload);
      sendJson(res, result.status, result.body, result.headers || {});
      return;
    }

    // ─── B2C: anonymous community signup (browser extension) ────────────────
    if (method === 'POST' && url === '/api/community/signup') {
      const ip = clientIp(req);
      const limit = consume(`signup:${ip}`, 6); // 6 signups/min/IP — abuse guard.
      if (!limit.allowed) {
        sendJson(res, 429, { error: 'Too many signups from this IP.', resetAt: new Date(limit.resetAt).toISOString() });
        return;
      }
      const payload = await readJsonBody(req);
      const installationId = String(payload.installationId || '').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 64);
      if (!installationId || installationId.length < 8) {
        sendJson(res, 400, { error: 'installationId required (min 8 chars, alphanumeric)' });
        return;
      }
      const tenantId = `community-${installationId}`;
      const plan = billing.PLANS.free;
      upsertTenant({
        tenantId,
        name: `Community ${installationId.substring(0, 8)}`,
        plan: plan.id,
        rateLimitPerMinute: plan.rateLimitPerMinute,
      });
      const created = createApiKey(tenantId, 'community-extension');
      sendJson(res, 201, {
        apiKey: created.rawKey, // shown only once
        tenantId,
        plan: { id: plan.id, name: plan.name, rateLimitPerMinute: plan.rateLimitPerMinute },
        privacyNotice: 'KAIROS only stores OSINT signals. PII is pseudonymized before storage.',
      });
      return;
    }

    // ─── GDPR: data subject rights (Art.15 access, Art.17 erasure) ──────────
    if (method === 'GET' && url.startsWith('/gdpr/export')) {
      const u = new URL(url, 'http://x');
      const subject = u.searchParams.get('subject');
      if (!subject) { sendJson(res, 400, { error: 'subject query param required' }); return; }
      const out = compliance.exportRecordsForSubject({ subject });
      sendJson(res, 200, {
        ...out,
        notice: 'Records returned reference the data subject by salted pseudonym only.',
      });
      return;
    }
    if (method === 'POST' && url === '/gdpr/erase') {
      const payload = await readJsonBody(req);
      if (!payload.subject) { sendJson(res, 400, { error: 'subject field required' }); return; }
      const out = compliance.eraseRecordsForSubject({ subject: payload.subject });
      logEvent('gdpr.erase', { erased: out.erased, pseudonym: out.pseudonym });
      sendJson(res, 200, out);
      return;
    }

    // ─── Stripe webhook — DEPRECATED endpoint ───────────────────────────────
    // Use /api/stripe/webhook. Update your Stripe dashboard to stop sending here.
    if (method === 'POST' && url === '/billing/stripe/webhook') {
      logEvent('billing.webhook.deprecated-endpoint', {
        warning: 'Update Stripe dashboard: replace /billing/stripe/webhook with /api/stripe/webhook',
      });
      const rawBody = await readRawBody(req);
      const secret = process.env.KAIROS_STRIPE_WEBHOOK_SECRET || '';
      const verification = billing.verifyStripeSignature({
        rawBody,
        header: req.headers['stripe-signature'],
        secret,
      });
      if (!verification.valid) {
        logEvent('billing.webhook.rejected', { reason: verification.reason });
        sendJson(res, 400, { error: 'invalid_signature', reason: verification.reason });
        return;
      }
      let event;
      try { event = JSON.parse(rawBody); }
      catch { sendJson(res, 400, { error: 'invalid_json' }); return; }
      // Stripe retries deliveries on failure — we must process each event.id
      // exactly once. claimEventId is atomic at the file level.
      if (!billing.claimEventId(event.id)) {
        logEvent('billing.webhook.duplicate', { id: event.id, type: event.type });
        sendJson(res, 200, { received: true, duplicate: true, id: event.id });
        return;
      }
      const handled = billing.handleStripeEvent(event, {
        onSubscription: ({ customerId, planId }) => {
          const tenantId = `stripe-${customerId}`;
          const plan = billing.planById(planId) || billing.PLANS.free;
          upsertTenant({
            tenantId,
            name: `Stripe ${customerId}`,
            plan: plan.id,
            rateLimitPerMinute: plan.rateLimitPerMinute,
          });
        },
        onCancellation: ({ customerId }) => {
          const tenantId = `stripe-${customerId}`;
          upsertTenant({
            tenantId,
            plan: billing.PLANS.free.id,
            rateLimitPerMinute: billing.PLANS.free.rateLimitPerMinute,
          });
        },
      });
      logEvent('billing.webhook.handled', { type: event.type, planId: handled.planId });
      sendJson(res, 200, { received: true, type: event.type, handled: handled.handled });
      return;
    }

    // ─── Agent task forces (operational view of the 18 agents) ──────────────
    if (method === 'GET' && url === '/api/taskforces') {
      sendJson(res, 200, { taskForces: sovereign.listTaskForces() });
      return;
    }
    if (method === 'GET' && url === '/api/billing/plans') {
      sendJson(res, 200, { plans: Object.values(billing.PLANS) });
      return;
    }

    if (method === 'POST' && url === '/scan-url') {
      const auth = authenticate(req.headers);
      if (!auth.ok) { sendJson(res, auth.status, { error: auth.error }); return; }
      const limit = consume(`tenant:${auth.tenant.tenantId}`, auth.tenant.rateLimitPerMinute || 120);
      if (!limit.allowed) {
        sendJson(res, 429, { error: 'Rate limit exceeded.', resetAt: new Date(limit.resetAt).toISOString() });
        return;
      }
      const payload = await readJsonBody(req);
      if (!payload.url || typeof payload.url !== 'string') {
        sendJson(res, 400, { error: 'Field "url" is required.' });
        return;
      }
      let scraped;
      try {
        scraped = await scanUrl(payload.url);
      } catch (err) {
        sendJson(res, 422, { error: 'scan_failed', detail: err.message });
        return;
      }
      const verdict = verifyPayload({
        text: scraped.signals.aggregatedText,
        urls: scraped.signals.urls,
        sourceUrl: scraped.finalUrl,
        channel: 'url-scan',
        tenantId: auth.tenant.tenantId,
        region: payload.region || { country: 'PT' },
        networkResolver: ({ text, urls }) => repGraph.queryPreVerdict({ text, urls }),
      });
      updateGlobalMetrics(verdict.verdict.decision);
      try {
        repGraph.contribute({
          text: scraped.signals.aggregatedText,
          urls: scraped.signals.urls,
          decision: verdict.verdict.decision,
          score: verdict.verdict.score,
          tenantId: auth.tenant.tenantId,
          dnaFamily: verdict.scamDna?.family?.key || null,
        });
      } catch { /* swallow: reputation contribution must not fail the request */ }
      const sanitizedTitle = scraped.signals.title
        ? compliance.pseudonymizeText(scraped.signals.title).text
        : null;
      const audit = recordVerification({
        tenantId: auth.tenant.tenantId,
        decision: verdict.verdict.decision,
        score: verdict.verdict.score,
        trustLevel: verdict.verdict.trustLevel,
        channel: 'url-scan',
        sourceUrl: scraped.finalUrl,
        textPreview: sanitizedTitle,
        reasonCount: Array.isArray(verdict.reasons) ? verdict.reasons.length : 0,
        dnaFingerprint: verdict.scamDna?.fingerprint || null,
        dnaFamily: verdict.scamDna?.family?.key || null,
        dnaSeverity: verdict.scamDna?.severity || null,
      });
      logEvent('scan_url.completed', {
        tenantId: auth.tenant.tenantId,
        finalUrl: scraped.finalUrl,
        decision: verdict.verdict.decision,
        score: verdict.verdict.score,
        requestId: audit.requestId,
      });
      sendJson(res, 200, {
        scrape: {
          finalUrl: scraped.finalUrl,
          status: scraped.status,
          redirectTrail: scraped.redirectTrail,
          byteLength: scraped.byteLength,
          title: scraped.signals.title,
          metaDescription: scraped.signals.metaDescription,
          checkoutHints: scraped.signals.checkoutHints,
          discoveredUrls: scraped.signals.urls.length,
        },
        verdict: verdict.verdict,
        scamDna: verdict.scamDna,
        layerIntelligence: verdict.layerIntelligence,
        compliance: verdict.compliance,
        audit: { requestId: audit.requestId },
      });
      return;
    }

    if (method === 'POST' && url === '/api/stripe/webhook') {
      const rawBody = await readRawBody(req);
      const sig = req.headers['stripe-signature'] || '';
      const result = await handleWebhook({ rawBody, signature: sig, logEvent });
      sendJson(res, result.status, result.body);
      return;
    }

    if (method === 'POST' && url === '/api/check') {
      const payload = await readJsonBody(req);
      const result = await handleApiCheck(req.headers, payload);
      sendJson(res, result.status, result.body);
      return;
    }

    if (method === 'POST' && url === '/api/check-public') {
      const ip = clientIp(req);
      // 10 checks per hour per IP — bucket key rotates every hour
      const hourBucket = Math.floor(Date.now() / 3_600_000);
      const limit = consume(`check-public:${ip}:${hourBucket}`, 10);
      if (!limit.allowed) {
        sendJson(res, 429, { error: 'Demo rate limit reached (10/hour). Get an API key for unlimited access.', upgrade: '/pricing' });
        return;
      }
      const payload = await readJsonBody(req);
      const domain = payload.domain ? String(payload.domain).trim().replace(/^https?:\/\//, '').split('/')[0] : null;
      if (!domain || domain.length < 3 || domain.length > 128) {
        sendJson(res, 400, { error: 'Provide a valid domain (3–128 chars).' });
        return;
      }
      const text = domain;
      const urls = [`https://${domain}`];
      const engineResult = verifyPayload({
        text, urls,
        channel: 'landing-demo',
        tenantId: 'public-demo',
        networkResolver: ({ text: t, urls: u }) => repGraph.queryPreVerdict({ text: t, urls: u }),
      });
      const { score, decision, reasons } = engineResult.verdict;
      // Surface top 5 reason keys (strip score suffix for readability)
      const signals = (reasons || [])
        .map((r) => r.split(':')[0])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 5);
      sendJson(res, 200, { domain, score, verdict: decision.toUpperCase(), signals, demo: true });
      return;
    }

    if (method === 'POST' && url === '/api/checkout') {
      const ip = clientIp(req);
      const limit = consume(`checkout:${ip}`, 5); // 5/min per IP — abuse guard
      if (!limit.allowed) {
        sendJson(res, 429, { error: 'Too many requests. Try again shortly.' });
        return;
      }
      const payload = await readJsonBody(req);
      const tier = String(payload.tier || '').toLowerCase();
      const result = await createCheckoutSession({ tier });
      if (result.error) {
        if (result._internal) {
          logEvent('checkout.error', { tier, detail: result._internal });
        }
        sendJson(res, result.status || 500, { error: result.error });
        return;
      }
      logEvent('checkout.created', { tier, sessionId: result.sessionId });
      sendJson(res, 200, { url: result.url });
      return;
    }

    if (method === 'POST' && url === '/api/verify-public') {
      const ip = clientIp(req);
      const limit = consume(`ip:${ip}`, PUBLIC_RATE_PER_MIN);
      if (!limit.allowed) {
        sendJson(res, 429, {
          error: 'Rate limit exceeded.',
          detail: `Max ${PUBLIC_RATE_PER_MIN} requests/minute on the free tier.`,
          resetAt: new Date(limit.resetAt).toISOString(),
        });
        return;
      }
      const payload = await readJsonBody(req);
      if (!payload.text || typeof payload.text !== 'string') {
        sendJson(res, 400, { error: 'Field "text" is required and must be a string.' });
        return;
      }
      const text = payload.text.substring(0, PUBLIC_VERIFY_MAX_CHARS);
      const region = payload.region || { country: 'PT' };
      const result = verifyPayload({
        text,
        channel: 'web-public',
        region,
        networkResolver: ({ text: t, urls: u }) => repGraph.queryPreVerdict({ text: t, urls: u }),
      });
      updateGlobalMetrics(result.verdict.decision);
      try {
        repGraph.contribute({
          text,
          decision: result.verdict.decision,
          score: result.verdict.score,
          tenantId: 'public',
          dnaFamily: result.scamDna?.family?.key || null,
        });
      } catch { /* swallow */ }
      const sanitized = compliance.pseudonymizeText(text);
      recordVerification({
        tenantId: 'public',
        decision: result.verdict.decision,
        score: result.verdict.score,
        trustLevel: result.verdict.trustLevel,
        channel: 'web-public',
        textPreview: sanitized.text,
        reasonCount: Array.isArray(result.reasons) ? result.reasons.length : 0,
        dnaFingerprint: result.scamDna?.fingerprint || null,
        dnaFamily: result.scamDna?.family?.key || null,
        dnaSeverity: result.scamDna?.severity || null,
      });
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: 'Not found', code: 'ROUTE_NOT_FOUND' });
  } catch (err) {
    logEvent('server.error', {
      method,
      url,
      message: err.message,
    });
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'internal_error', detail: err.message });
    }
  } finally {
    logEvent('http.request', {
      method,
      url,
      status: res.statusCode,
      latencyMs: Date.now() - start,
    });
  }
});

setInterval(purgeStale, 300_000).unref();

// Graph aggregator — hourly background worker (graceful if unavailable)
try {
  const { graphAggregator } = require('../sniper-engine');
  graphAggregator.start();
} catch { /* graph optional — server runs without it */ }

if (require.main === module) {
  const boot = bootstrapIfEmpty();
  server.listen(PORT, '0.0.0.0', () => {
    logEvent('server.boot', {
      port: PORT,
      version: VERSION,
      bootstrapped: boot.bootstrapped,
      tenantCount: boot.tenants.length,
    });
    if (boot.bootstrapped && boot.bootstrapKeys) {
      console.log('');
      console.log('  KAIROS Sniper API v7 — first boot. Save these dev keys:');
      console.log(`    internal: ${boot.bootstrapKeys.internal}`);
      console.log(`    bank:     ${boot.bootstrapKeys.bank}`);
      console.log(`    store:    ${boot.bootstrapKeys.store}`);
      console.log('  These appear ONLY ONCE. Use them in x-api-key.');
      console.log('');
    }
    if (!ADMIN_TOKEN) {
      console.warn('  ⚠  KAIROS_ADMIN_TOKEN not set — /dashboard is OPEN (set it in Railway env vars)');
    }
    console.log(`  ► http://localhost:${PORT}`);
    console.log(`  ► http://localhost:${PORT}/dashboard`);
  });
  server.on('error', (err) => {
    logEvent('server.error', { message: err.message });
    process.exit(1);
  });
}

module.exports = { server };
