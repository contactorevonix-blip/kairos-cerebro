'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Force the API to use an isolated DB directory before any module that
// transitively pulls sniper-db is loaded.
const TEST_DB_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-api-'));
process.env.KAIROS_DB_DIR = TEST_DB_DIR;

const db = require('../packages/sniper-db');
const { handleVerifyRequest, handleBatchVerifyRequest } = require('../packages/sniper-api/app');
const { _resetForTests } = require('../packages/sniper-api/rate-limit');

// Bootstrap a deterministic tenant + key for tests.
db.upsertTenant({ tenantId: 'test-bank', name: 'Test Bank', plan: 'pilot', rateLimitPerMinute: 1000 }, TEST_DB_DIR);
const { rawKey: TEST_KEY } = db.createApiKey('test-bank', 'test', TEST_DB_DIR);

test('verify endpoint rejects requests without api key', () => {
  _resetForTests();
  const result = handleVerifyRequest({}, { text: 'safe message' });
  assert.equal(result.status, 401);
  assert.match(result.body.error, /x-api-key/i);
});

test('verify endpoint rejects invalid api key', () => {
  _resetForTests();
  const result = handleVerifyRequest({ 'x-api-key': 'ksk_invalid' }, { text: 'safe message' });
  assert.equal(result.status, 403);
});

test('verify endpoint scores payload, persists metrics and audit trail', () => {
  _resetForTests();
  const before = db.readGlobalMetrics();
  const result = handleVerifyRequest(
    { 'x-api-key': TEST_KEY },
    { text: 'Guaranteed profit with easy money. Pay with bitcoin to unlock.', channel: 'site' }
  );
  assert.equal(result.status, 200);
  assert.ok(['review', 'block'].includes(result.body.verdict.decision));
  assert.ok(result.body.audit.requestId);

  const after = db.readGlobalMetrics();
  assert.equal(after.verifyRequests, before.verifyRequests + 1);

  const audit = db.readVerifications(10);
  assert.ok(audit.some((r) => r.requestId === result.body.audit.requestId));
});

test('verify endpoint enforces tenant rate limit', () => {
  _resetForTests();
  // Set an artificially tight limit on a one-off tenant.
  db.upsertTenant({ tenantId: 'rl-tenant', name: 'RL', plan: 'pilot', rateLimitPerMinute: 2 }, TEST_DB_DIR);
  const { rawKey } = db.createApiKey('rl-tenant', 'tight', TEST_DB_DIR);
  const headers = { 'x-api-key': rawKey };
  const r1 = handleVerifyRequest(headers, { text: 'ok 1' });
  const r2 = handleVerifyRequest(headers, { text: 'ok 2' });
  const r3 = handleVerifyRequest(headers, { text: 'ok 3' });
  assert.equal(r1.status, 200);
  assert.equal(r2.status, 200);
  assert.equal(r3.status, 429);
});

test('batch verify scores multiple payloads with one rate-limit reservation', () => {
  _resetForTests();
  const before = db.readGlobalMetrics();
  const result = handleBatchVerifyRequest(
    { 'x-api-key': TEST_KEY },
    {
      items: [
        { id: 'a', text: 'safe message about weather' },
        {
          id: 'b',
          text: 'Guaranteed profit with easy money. Pay with bitcoin to unlock.',
        },
      ],
    }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.count, 2);
  assert.ok(['allow', 'review', 'block'].includes(result.body.results[0].verdict.decision));
  assert.ok(['review', 'block'].includes(result.body.results[1].verdict.decision));
  const after = db.readGlobalMetrics();
  assert.equal(after.verifyRequests, before.verifyRequests + 2);
});

test('batch verify rejects when batch would exceed tenant rate limit', () => {
  _resetForTests();
  db.upsertTenant({ tenantId: 'batch-rl', name: 'BRL', plan: 'pilot', rateLimitPerMinute: 2 }, TEST_DB_DIR);
  const { rawKey } = db.createApiKey('batch-rl', 'b', TEST_DB_DIR);
  const headers = { 'x-api-key': rawKey };
  const ok = handleBatchVerifyRequest(headers, {
    items: [{ text: 'one' }, { text: 'two' }],
  });
  assert.equal(ok.status, 200);
  const fail = handleBatchVerifyRequest(headers, {
    items: [{ text: 'three' }, { text: 'four' }],
  });
  assert.equal(fail.status, 429);
});

test('revoked keys are rejected', () => {
  _resetForTests();
  db.upsertTenant({ tenantId: 'rev-tenant', name: 'Rev', plan: 'pilot', rateLimitPerMinute: 100 }, TEST_DB_DIR);
  const { rawKey } = db.createApiKey('rev-tenant', 'will-revoke', TEST_DB_DIR);
  db.revokeApiKey(rawKey);
  const result = handleVerifyRequest({ 'x-api-key': rawKey }, { text: 'whatever' });
  assert.equal(result.status, 403);
  assert.match(result.body.error, /invalid|revoked/i);
});
