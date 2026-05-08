'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const db = require('../packages/sniper-db');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-audit-')); }

test('recordVerification chains every record via prevHash + chainHash', () => {
  const dir = tmp();
  const a = db.recordVerification({ tenantId: 't1', decision: 'block', score: 80, channel: 'unit' }, dir);
  const b = db.recordVerification({ tenantId: 't1', decision: 'review', score: 50, channel: 'unit' }, dir);
  const c = db.recordVerification({ tenantId: 't1', decision: 'allow', score: 5, channel: 'unit' }, dir);
  assert.equal(a.prevHash, '0'.repeat(64));
  assert.equal(b.prevHash, a.chainHash);
  assert.equal(c.prevHash, b.chainHash);
});

test('verifyAuditChain returns valid=true on a clean chain', () => {
  const dir = tmp();
  for (let i = 0; i < 5; i += 1) {
    db.recordVerification({ tenantId: 't1', decision: 'block', score: 80, channel: 'unit' }, dir);
  }
  const out = db.verifyAuditChain(dir);
  assert.equal(out.valid, true);
  assert.equal(out.total, 5);
  assert.match(out.headHash, /^[a-f0-9]{64}$/);
});

test('verifyAuditChain detects in-place tampering of any record', () => {
  const dir = tmp();
  db.recordVerification({ tenantId: 't1', decision: 'block', score: 80, channel: 'unit' }, dir);
  db.recordVerification({ tenantId: 't1', decision: 'allow', score: 10, channel: 'unit' }, dir);
  db.recordVerification({ tenantId: 't1', decision: 'block', score: 95, channel: 'unit' }, dir);
  const file = path.join(dir, 'verifications.jsonl');
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const tampered = JSON.parse(lines[1]);
  tampered.score = 999; // criminal edits an old verdict
  lines[1] = JSON.stringify(tampered);
  fs.writeFileSync(file, lines.join('\n') + '\n');
  const out = db.verifyAuditChain(dir);
  assert.equal(out.valid, false);
  assert.equal(out.brokenAt, 1);
});

test('verifyAuditChain detects insertion of a forged record', () => {
  const dir = tmp();
  db.recordVerification({ tenantId: 't1', decision: 'block', score: 80, channel: 'unit' }, dir);
  db.recordVerification({ tenantId: 't1', decision: 'block', score: 90, channel: 'unit' }, dir);
  const file = path.join(dir, 'verifications.jsonl');
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const fake = {
    timestamp: new Date().toISOString(), tenantId: 't1', decision: 'allow', score: 1,
    channel: 'unit', sourceUrl: null, textPreview: null, redactionCounts: null,
    reasonCount: 0, dnaFingerprint: null, dnaFamily: null, dnaSeverity: null,
    requestId: 'forged', prevHash: '0'.repeat(64), chainHash: '0'.repeat(64),
  };
  lines.splice(1, 0, JSON.stringify(fake));
  fs.writeFileSync(file, lines.join('\n') + '\n');
  const out = db.verifyAuditChain(dir);
  assert.equal(out.valid, false);
});
