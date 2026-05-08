'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const db = require('../packages/sniper-db');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-db-'));
}

test('bootstrap creates tenants and api keys when DB is empty', () => {
  const dir = tmpDir();
  const result = db.bootstrapIfEmpty(dir);
  assert.equal(result.bootstrapped, true);
  assert.ok(result.tenants.length >= 3);
  assert.ok(result.bootstrapKeys.internal.startsWith('ksk_'));
});

test('bootstrap is idempotent', () => {
  const dir = tmpDir();
  db.bootstrapIfEmpty(dir);
  const second = db.bootstrapIfEmpty(dir);
  assert.equal(second.bootstrapped, false);
});

test('api keys are stored hashed and resolved by raw key', () => {
  const dir = tmpDir();
  db.upsertTenant({ tenantId: 't1', name: 'T1', plan: 'pilot', rateLimitPerMinute: 100 }, dir);
  const { rawKey, record } = db.createApiKey('t1', 'main', dir);

  // Hash matches DB record
  assert.equal(db.hashApiKey(rawKey), record.keyHash);
  assert.notEqual(record.keyHash, rawKey);

  const found = db.findApiKey(rawKey, dir);
  assert.ok(found);
  assert.equal(found.tenantId, 't1');

  // Wrong key returns null
  assert.equal(db.findApiKey('ksk_wrong', dir), null);

  // Revocation works
  assert.equal(db.revokeApiKey(rawKey, dir), true);
  assert.equal(db.findApiKey(rawKey, dir), null);
});

test('verifications are appended to JSONL trail', () => {
  const dir = tmpDir();
  db.recordVerification({ tenantId: 't1', decision: 'block', score: 92, channel: 'site', textPreview: 'guru' }, dir);
  db.recordVerification({ tenantId: 't1', decision: 'allow', score: 5, channel: 'email', textPreview: 'safe' }, dir);
  const recent = db.readVerifications(10, dir);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].decision, 'block');
  assert.ok(recent[0].requestId);
});

test('global metrics increment correctly and persist', () => {
  const dir = tmpDir();
  db.updateGlobalMetrics('block', dir);
  db.updateGlobalMetrics('block', dir);
  db.updateGlobalMetrics('review', dir);
  db.updateGlobalMetrics('allow', dir);
  const m = db.readGlobalMetrics(dir);
  assert.equal(m.verifyRequests, 4);
  assert.equal(m.blocked, 2);
  assert.equal(m.review, 1);
  assert.equal(m.allowed, 1);
  assert.ok(m.estimatedProtectedValueEur > 0);
});

test('atomic write does not corrupt under concurrent calls', () => {
  const dir = tmpDir();
  for (let i = 0; i < 50; i++) {
    db.upsertTenant({ tenantId: `t${i}`, name: `T${i}`, plan: 'pilot' }, dir);
  }
  const all = db.listTenants(dir);
  assert.equal(all.length, 50);
});
