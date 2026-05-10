// KAIROS SNIPER API — v7 PROFESSIONAL EDITION
// Hardened HTTP entrypoint: DB-backed auth, persistent metrics, audit trail,
// per-tenant rate limiting, /scan-url scraper endpoint, structured logging.

'use strict';

const http = require('http');
const { handleVerifyRequest, logEvent, handleBatchVerifyRequest } = require('./app');
const { renderLandingPage, renderDashboard } = require('./ui');
const { renderPricingPage } = require('./pricing-page');
const { createCheckoutSession } = require('./stripe-checkout');
const { handleWebhook } = require('./stripe-webhook');
const { handleSuccess } = require('./success-page');
const { handleApiCheck } = require('./api-check');
const { handlePortal } = require('./stripe-portal');
const { renderDocs, ROUTES: DOC_ROUTES } = require('./docs-pages');
const { renderPrivacy, renderTerms } = require('./legal-pages');
const { renderStatus, renderChangelog, renderExamples, renderCompareStripeRadar, renderCompareSift } = require('./trust-pages');
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
    if (method === 'GET' && url === '/privacy') {
      sendHtml(res, renderPrivacy(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && url === '/terms') {
      sendHtml(res, renderTerms(), { 'cache-control': 'public, max-age=3600' });
      return;
    }
    if (method === 'GET' && (url === '/docs' || url.startsWith('/docs/'))) {
      const html = renderDocs(url);
      if (!html) { sendJson(res, 404, { error: 'Not found' }); return; }
      sendHtml(res, html, { 'cache-control': 'public, max-age=300' });
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
    if (method === 'GET' && url === '/pricing') {
      sendHtml(res, renderPricingPage(), { 'cache-control': 'public, max-age=300' });
      return;
    }
    if (method === 'GET' && url === '/dashboard') {
      sendHtml(res, renderDashboard(readGlobalMetrics(), {
        recent: readVerifications(50),
        tenants: listTenants(),
      }));
      return;
    }
    if (method === 'GET' && url === '/api/dashboard') {
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
      const ready = probes.dbWritable && (probes.auditChain && probes.auditChain.valid);
      sendJson(res, ready ? 200 : 503, {
        status: ready ? 'OPERATIONAL' : 'DEGRADED',
        uptime: process.uptime(),
        version: VERSION,
        probes,
        timestamp: new Date().toISOString(),
      });
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
    if (method === 'GET' && url === '/sitemap.xml') {
      const base = process.env.KAIROS_PUBLIC_BASE_URL || '';
      const today = new Date().toISOString().split('T')[0];
      res.writeHead(200, { ...SECURITY_HEADERS, 'content-type': 'application/xml; charset=utf-8' });
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><lastmod>${today}</lastmod><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${base}/#product</loc><priority>0.85</priority></url>
  <url><loc>${base}/#api</loc><priority>0.8</priority></url>
  <url><loc>${base}/#trust</loc><priority>0.75</priority></url>
  <url><loc>${base}/#pricing</loc><priority>0.9</priority></url>
</urlset>
`);
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

    // ─── Stripe webhook receiver (HMAC-verified) ────────────────────────────
    if (method === 'POST' && url === '/billing/stripe/webhook') {
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

if (require.main === module) {
  const boot = bootstrapIfEmpty();
  server.listen(PORT, () => {
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
    console.log(`  ► http://localhost:${PORT}`);
    console.log(`  ► http://localhost:${PORT}/dashboard`);
  });
  server.on('error', (err) => {
    logEvent('server.error', { message: err.message });
    process.exit(1);
  });
}

module.exports = { server };
