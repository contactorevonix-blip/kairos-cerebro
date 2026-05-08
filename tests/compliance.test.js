'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const compliance = require('../packages/compliance');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-compliance-')); }

test('hashPii is deterministic with same salt and one-way', () => {
  const salt = 'fixed-salt-for-test';
  const a = compliance.hashPii('user@example.com', { explicit: salt });
  const b = compliance.hashPii('user@example.com', { explicit: salt });
  assert.equal(a, b);
  assert.match(a, /^psn:[a-f0-9]{32}$/);
  assert.notEqual(a, 'user@example.com');
});

test('different salts produce different pseudonyms', () => {
  const a = compliance.hashPii('user@example.com', { explicit: 'salt-1' });
  const b = compliance.hashPii('user@example.com', { explicit: 'salt-2' });
  assert.notEqual(a, b);
});

test('pseudonymizeText replaces emails and wallets, redacts phones and cards', () => {
  process.env.KAIROS_PII_SALT = 'unit-test-salt';
  const input = 'Contacta scam@evil.com ou paga em BTC bc1qarqx0qf3v0z6r3p7c4z9k7v6h0d4p9z6e7r5k3 ou ETH 0xAbc123def4567890aBCDEFabcdef1234567890ab. Tel +351912345678. Card 4242424242424242';
  const out = compliance.pseudonymizeText(input);
  assert.ok(!out.text.includes('scam@evil.com'), 'email plaintext leaked');
  assert.ok(!out.text.includes('bc1qarq'), 'BTC plaintext leaked');
  assert.ok(!out.text.includes('0xAbc123'), 'ETH plaintext leaked');
  assert.ok(out.text.includes('[redacted-phone]') || out.text.includes('[redacted-card]'), 'phone/card redacted');
  assert.ok(out.redactionCounts.email >= 1);
  assert.ok(out.redactionCounts.wallet >= 2);
  delete process.env.KAIROS_PII_SALT;
});

test('buildComplianceEnvelope tags every record with OSINT and lawful basis', () => {
  const env = compliance.buildComplianceEnvelope();
  assert.equal(env.dataSource, 'osint');
  assert.match(env.lawfulBasis, /legitimate-interest-fraud-prevention/);
  assert.equal(env.purpose, 'fraud-detection');
  assert.equal(env.pseudonymized, true);
  assert.ok(env.retentionDays > 0);
});

test('purgeStaleVerifications removes records older than retention window', () => {
  const dir = tmp();
  const file = path.join(dir, 'verifications.jsonl');
  const old = JSON.stringify({ timestamp: '2020-01-01T00:00:00.000Z', tenantId: 't1' });
  const fresh = JSON.stringify({ timestamp: new Date().toISOString(), tenantId: 't1' });
  fs.writeFileSync(file, `${old}\n${fresh}\n`);
  const out = compliance.purgeStaleVerifications({ dir, retentionDays: 30 });
  assert.equal(out.purged, 1);
  assert.equal(out.kept, 1);
  const remaining = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(remaining.length, 1);
});

test('exportRecordsForSubject and eraseRecordsForSubject reference subject by pseudonym', () => {
  process.env.KAIROS_PII_SALT = 'export-salt';
  const dir = tmp();
  const subject = 'jane@example.com';
  const pseudonym = compliance.hashPii(subject);
  const file = path.join(dir, 'verifications.jsonl');
  fs.writeFileSync(file, [
    JSON.stringify({ timestamp: new Date().toISOString(), tenantId: 't1', textPreview: `email ${pseudonym}`, decision: 'block' }),
    JSON.stringify({ timestamp: new Date().toISOString(), tenantId: 't1', textPreview: 'unrelated', decision: 'allow' }),
  ].join('\n') + '\n');

  const exp = compliance.exportRecordsForSubject({ subject, dir });
  assert.equal(exp.count, 1);
  assert.equal(exp.pseudonym, pseudonym);

  const er = compliance.eraseRecordsForSubject({ subject, dir });
  assert.equal(er.erased, 1);

  const remaining = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
  assert.equal(remaining.length, 1);
  assert.ok(!remaining[0].includes(pseudonym));
  delete process.env.KAIROS_PII_SALT;
});
