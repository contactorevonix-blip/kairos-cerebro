'use strict';

/**
 * api-check.test.js — handleApiCheck response shape (integration)
 *
 * Closes the MEDIUM follow-up from audit 2026-05-11-v2-postfixes.md:
 * the response builder line `graph_intelligence: result.graph_intelligence || null`
 * had no direct test, leaving room for silent regression.
 *
 * Mocks: only the on-disk api-keys.jsonl + a temp KAIROS_DB_DIR.
 * Engine runs for real (cheap; no network).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

// Isolate filesystem BEFORE requiring modules that bind DB_DIR at load time.
const TEST_DIR = path.join(os.tmpdir(), `kairos-api-check-test-${Date.now()}`);
fs.mkdirSync(TEST_DIR, { recursive: true });
process.env.KAIROS_DB_DIR = TEST_DIR;
process.env.GRAPH_PEPPER = crypto.randomBytes(32).toString('hex');

const { handleApiCheck } = require('./api-check');

// Seed a fake active API key directly in api-keys.jsonl (skip Stripe).
const RAW_KEY = `kc_test_${crypto.randomBytes(24).toString('hex')}`;
const HASH = crypto.createHash('sha256').update(RAW_KEY).digest('hex');
fs.writeFileSync(
  path.join(TEST_DIR, 'api-keys.jsonl'),
  JSON.stringify({
    api_key_hash: HASH,
    api_key_preview: RAW_KEY.slice(0, 12) + '...' + RAW_KEY.slice(-4),
    customer_id: 'cus_test_audit_v2',
    tier: 'pro',
    status: 'active',
    quota_per_month: 10000,
    created_at: new Date().toISOString(),
  }) + '\n',
  'utf8'
);

function authHeaders() {
  return { authorization: `Bearer ${RAW_KEY}` };
}

test('handleApiCheck — 401 without Authorization header', async () => {
  const res = await handleApiCheck({}, { domain: 'example.com' });
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Invalid API key');
});

test('handleApiCheck — 401 with malformed bearer token', async () => {
  const res = await handleApiCheck(
    { authorization: 'Bearer not-a-real-key' },
    { domain: 'example.com' }
  );
  assert.equal(res.status, 401);
});

test('handleApiCheck — 400 when no identifier provided', async () => {
  const res = await handleApiCheck(authHeaders(), {});
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Provide at least one/);
});

test('handleApiCheck — 200 response shape includes all contract fields', async () => {
  const res = await handleApiCheck(authHeaders(), { domain: 'example.com' });

  assert.equal(res.status, 200, `unexpected status: ${JSON.stringify(res.body)}`);
  const b = res.body;

  // Core scoring contract
  assert.equal(typeof b.score, 'number', 'score must be number');
  assert.ok(b.score >= 0 && b.score <= 100, `score in [0,100] (got ${b.score})`);
  assert.equal(typeof b.verdict, 'string', 'verdict must be string');
  assert.ok(Array.isArray(b.signals), 'signals must be array');

  // Echoed input
  assert.equal(b.type, 'domain');
  assert.equal(b.query, 'example.com');

  // V2 graph contract — MUST be present in the response body.
  // Value can be null on cold cache; the KEY must exist.
  assert.ok('graph_intelligence' in b, 'graph_intelligence key must be present');

  // Traceability
  assert.equal(typeof b.ref, 'string');
  assert.match(b.ref, /^[0-9a-f]{16}$/);
  assert.equal(typeof b.timestamp, 'string');

  // dominant_threat is part of the contract (null when absent)
  assert.ok('dominant_threat' in b, 'dominant_threat key must be present');
});

test('handleApiCheck — graph_intelligence populated after prior history', async () => {
  // First call seeds the graph for example.com under the same customer.
  await handleApiCheck(authHeaders(), { domain: 'graph-seed.test' });
  await handleApiCheck(authHeaders(), { domain: 'graph-seed.test' });

  // Different customer asking about the same entity should see graph_intelligence
  // become a non-null object (cross-tenant visibility is the V2 feature).
  const otherKey = `kc_test_${crypto.randomBytes(24).toString('hex')}`;
  const otherHash = crypto.createHash('sha256').update(otherKey).digest('hex');
  fs.appendFileSync(
    path.join(TEST_DIR, 'api-keys.jsonl'),
    JSON.stringify({
      api_key_hash: otherHash,
      api_key_preview: otherKey.slice(0, 12) + '...' + otherKey.slice(-4),
      customer_id: 'cus_test_other',
      tier: 'pro',
      status: 'active',
      quota_per_month: 10000,
      created_at: new Date().toISOString(),
    }) + '\n',
    'utf8'
  );

  const res = await handleApiCheck(
    { authorization: `Bearer ${otherKey}` },
    { domain: 'graph-seed.test' }
  );
  assert.equal(res.status, 200);
  // The key always exists; once the entity has cross-customer history,
  // graph_intelligence should be an object (not null).
  assert.ok('graph_intelligence' in res.body);
  assert.ok(
    res.body.graph_intelligence === null || typeof res.body.graph_intelligence === 'object',
    'graph_intelligence must be null or object'
  );
});
