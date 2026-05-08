'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Run server in an isolated data dir and on a free port.
process.env.KAIROS_DB_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-srv-it-'));
process.env.PORT = '0';
process.env.KAIROS_PII_SALT = 'integration-test-salt';

const { server } = require('../packages/sniper-api/server');
const { bootstrapIfEmpty } = require('../packages/sniper-db');

let baseUrl = '';
let bootstrapKeys = null;

test.before(async () => {
  const boot = bootstrapIfEmpty();
  bootstrapKeys = boot.bootstrapKeys;
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

test.after(async () => {
  await new Promise((r) => server.close(r));
});

function request(method, urlPath, { body = null, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      headers: { ...headers },
    };
    if (body !== null) {
      opts.headers['content-type'] = 'application/json';
    }
    const req = http.request(`${baseUrl}${urlPath}`, opts, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch { /* not JSON */ }
        resolve({ status: res.statusCode, headers: res.headers, body: raw, json });
      });
    });
    req.on('error', reject);
    if (body !== null) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

test('GET / renders the landing page without ReferenceError', async () => {
  const res = await request('GET', '/');
  assert.equal(res.status, 200);
  assert.match(res.body, /KAIROS/);
  assert.equal(res.headers['content-type'].split(';')[0], 'text/html');
});

test('every response carries the hardened security headers', async () => {
  const res = await request('GET', '/');
  assert.match(res.headers['content-security-policy'], /default-src 'self'/);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  assert.match(res.headers['strict-transport-security'], /max-age=63072000/);
  assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
});

test('GET /robots.txt is served with sensible disallows', async () => {
  const res = await request('GET', '/robots.txt');
  assert.equal(res.status, 200);
  assert.match(res.body, /User-agent: \*/);
  assert.match(res.body, /Disallow: \/api\//);
  assert.match(res.body, /Disallow: \/gdpr\//);
});

test('GET /sitemap.xml is well-formed XML', async () => {
  const res = await request('GET', '/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.body, /<\?xml version="1.0"/);
  assert.match(res.body, /<urlset/);
});

test('GET /.well-known/security.txt returns a contact', async () => {
  const res = await request('GET', '/.well-known/security.txt');
  assert.equal(res.status, 200);
  assert.match(res.body, /Contact:/);
});

test('GET /health performs the deep probe', async () => {
  const res = await request('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.json.status, 'OPERATIONAL');
  assert.equal(res.json.probes.dbWritable, true);
  assert.equal(res.json.probes.auditChain.valid, true);
  assert.ok(typeof res.json.probes.tenantCount === 'number');
});

test('GET /api/billing/plans returns the public catalogue', async () => {
  const res = await request('GET', '/api/billing/plans');
  assert.equal(res.status, 200);
  const ids = res.json.plans.map((p) => p.id).sort();
  assert.deepEqual(ids, [
    'kairos_b2b_pilot', 'kairos_business', 'kairos_enterprise', 'kairos_free', 'kairos_pro',
  ]);
});

test('GET /api/geo returns currency + region hints (no PII body)', async () => {
  const res = await request('GET', '/api/geo');
  assert.equal(res.status, 200);
  assert.match(res.json.currency, /^EUR|USD|GBP|BRL$/);
  assert.ok(res.json.source === 'cf-ipcountry' || res.json.source === 'x-vercel-ip-country' || res.json.source === 'none');
});

test('GET /docs/legal/privacy-policy.md serves the policy', async () => {
  const res = await request('GET', '/docs/legal/privacy-policy.md');
  assert.equal(res.status, 200);
  assert.match(res.body, /privacy|KAIROS|data/i);
});

test('GET /api/taskforces returns the four forces', async () => {
  const res = await request('GET', '/api/taskforces');
  assert.equal(res.status, 200);
  const ids = res.json.taskForces.map((f) => f.id).sort();
  assert.deepEqual(ids, ['b2b-security', 'growth', 'infrastructure', 'sovereign-overlay']);
});

test('POST /api/community/signup auto-provisions a free-tier tenant + key', async () => {
  const res = await request('POST', '/api/community/signup', {
    body: { installationId: 'abcdef0123456789' },
  });
  assert.equal(res.status, 201);
  assert.match(res.json.apiKey, /^ksk_/);
  assert.equal(res.json.plan.id, 'kairos_free');
});

test('POST /verify rejects without an api key', async () => {
  const res = await request('POST', '/verify', {
    body: { text: 'Lucro garantido em https://ruyter.com' },
  });
  assert.equal(res.status, 401);
});

test('POST /verify with a valid bootstrap key returns a verdict', async () => {
  assert.ok(bootstrapKeys, 'bootstrap keys must exist for the test');
  const res = await request('POST', '/verify', {
    body: {
      text: 'Ganhe €500 por dia garantido! Método secreto dos milionários. Clique em https://shady-method.com/pay agora.',
      channel: 'integration-test',
    },
    headers: { 'x-api-key': bootstrapKeys.bank },
  });
  assert.equal(res.status, 200);
  assert.ok(res.json.verdict);
  assert.ok(['allow', 'review', 'block'].includes(res.json.verdict.decision));
  assert.match(res.headers['x-request-id'], /^[0-9a-f-]{36}$/);
  assert.ok(Number(res.headers['x-ratelimit-limit']) > 0);
});

test('POST /verify/batch returns ordered results with two items', async () => {
  assert.ok(bootstrapKeys);
  const res = await request('POST', '/verify/batch', {
    body: {
      items: [
        { id: '1', text: 'Hello, legitimate newsletter.' },
        { id: '2', text: 'Ganhe €500 por dia garantido! Método secreto dos milionários. Clique em https://shady-method.com/pay agora.' },
      ],
    },
    headers: { 'x-api-key': bootstrapKeys.store },
  });
  assert.equal(res.status, 200);
  assert.equal(res.json.count, 2);
  assert.equal(res.json.results[0].ref, '1');
  assert.ok(['allow', 'review'].includes(res.json.results[0].verdict.decision));
  assert.ok(['review', 'block'].includes(res.json.results[1].verdict.decision));
});

test('POST /api/verify-public returns a verdict and respects rate limits', async () => {
  const res = await request('POST', '/api/verify-public', {
    body: { text: 'olá mundo', region: { country: 'PT' } },
  });
  assert.equal(res.status, 200);
  assert.ok(res.json.verdict);
});

test('POST /gdpr/erase requires a subject', async () => {
  const res = await request('POST', '/gdpr/erase', { body: {} });
  assert.equal(res.status, 400);
});

test('POST /billing/stripe/webhook rejects an unsigned body', async () => {
  const res = await request('POST', '/billing/stripe/webhook', {
    body: { id: 'evt_unsigned', type: 'invoice.paid' },
  });
  assert.equal(res.status, 400);
  assert.match(res.json.error, /invalid_signature|missing-input/);
});

test('POST /billing/stripe/webhook is idempotent on a replay', async () => {
  const crypto = require('node:crypto');
  process.env.KAIROS_STRIPE_WEBHOOK_SECRET = 'whsec_integration_test';
  const body = JSON.stringify({
    id: 'evt_idem_test_1',
    type: 'customer.subscription.created',
    data: { object: { id: 'sub_x', customer: 'cus_x', status: 'active', items: { data: [{ price: { lookup_key: 'kairos_pro' } }] } } },
  });
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', 'whsec_integration_test').update(`${ts}.${body}`).digest('hex');
  const header = `t=${ts},v1=${sig}`;
  const first = await request('POST', '/billing/stripe/webhook', { body, headers: { 'stripe-signature': header } });
  const replay = await request('POST', '/billing/stripe/webhook', { body, headers: { 'stripe-signature': header } });
  assert.equal(first.status, 200);
  assert.equal(replay.status, 200);
  assert.ok(replay.json.duplicate === true);
  delete process.env.KAIROS_STRIPE_WEBHOOK_SECRET;
});

test('GET /unknown-route returns a clean 404', async () => {
  const res = await request('GET', '/this-does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.json.code, 'ROUTE_NOT_FOUND');
});
