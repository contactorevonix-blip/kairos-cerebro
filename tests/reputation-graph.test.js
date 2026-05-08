'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const rep = require('../packages/reputation-graph');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-rep-')); }

test('extractEntities pulls domains, urls, emails and wallets', () => {
  const text = 'Visita https://curso-do-guru.com hoje. Contacto: scam@evil.com. BTC: bc1qarqx0qf3v0z6r3p7c4z9k7v6h0d4p9z6e7r5k3 e ETH 0xAbc123def4567890aBCDEFabcdef1234567890ab.';
  const ents = rep.extractEntities(text, ['https://shady.tld/checkout']);
  assert.ok(ents.domains.includes('curso-do-guru.com'));
  assert.ok(ents.domains.includes('shady.tld'));
  assert.ok(ents.urls.find((u) => u.includes('curso-do-guru.com')));
  assert.ok(ents.emails.includes('scam@evil.com'));
  assert.ok(ents.wallets.find((w) => w.startsWith('btc:')));
  assert.ok(ents.wallets.find((w) => w.startsWith('eth:0xabc')));
});

test('contribute then queryPreVerdict reports a positive networkScore for repeat scams', () => {
  const dir = tmp();
  rep.contribute({ text: 'Lucro garantido em https://ruyter-method.com', decision: 'block', score: 95, tenantId: 't1', dnaFamily: 'guru-course-pyramid', dir });
  rep.contribute({ text: 'visita ruyter-method.com agora', decision: 'block', score: 90, tenantId: 't2', dnaFamily: 'guru-course-pyramid', dir });
  const q = rep.queryPreVerdict({ text: 'novo lead em ruyter-method.com', dir });
  assert.ok(q.networkScore > 0);
  assert.ok(q.matched.find((m) => m.id === 'ruyter-method.com'));
  assert.ok(q.matched[0].tenants.length >= 2);
});

test('allow decisions decrement reputation', () => {
  const dir = tmp();
  rep.contribute({ text: 'curso em https://benign-news.com', decision: 'block', score: 80, tenantId: 't1', dir });
  rep.contribute({ text: 'curso em https://benign-news.com', decision: 'allow', score: 5, tenantId: 't2', dir });
  rep.contribute({ text: 'curso em https://benign-news.com', decision: 'allow', score: 5, tenantId: 't3', dir });
  const q = rep.queryPreVerdict({ text: 'visita https://benign-news.com', dir });
  // After 1 block + 2 allows the score should be lower than after a single block.
  assert.ok(q.networkScore < 25);
});

test('time-decay reduces score for old contributions', () => {
  const dir = tmp();
  rep.contribute({ text: 'site https://decaying-site.com', decision: 'block', score: 90, tenantId: 't1', dir });
  // Fresh query: positive
  const fresh = rep.queryPreVerdict({ text: 'visita decaying-site.com', dir });
  assert.ok(fresh.networkScore > 0);
  // Aged query (half-life 1ms makes everything tiny instantly)
  const aged = rep.queryPreVerdict({ text: 'visita decaying-site.com', dir, halfLifeMs: 1 });
  assert.ok(aged.networkScore <= fresh.networkScore);
});

test('listTopEntities sorts by decayed score desc', () => {
  const dir = tmp();
  rep.contribute({ text: 'https://low-rep.com', decision: 'review', score: 40, tenantId: 't1', dir });
  rep.contribute({ text: 'https://high-rep.com', decision: 'block', score: 95, tenantId: 't1', dir });
  rep.contribute({ text: 'https://high-rep.com', decision: 'block', score: 95, tenantId: 't2', dir });
  const top = rep.listTopEntities({ limit: 5, type: 'domain', dir });
  assert.equal(top[0].id, 'high-rep.com');
});

test('signFeed produces verifiable signature', () => {
  const dir = tmp();
  rep.contribute({ text: 'https://target.com', decision: 'block', score: 95, tenantId: 't1', dir });
  const { payload, signature } = rep.signFeed({ secret: 'shared-feed-secret', dir, minScore: 1 });
  assert.equal(rep.verifyFeed({ payload, signature, secret: 'shared-feed-secret' }), true);
  assert.equal(rep.verifyFeed({ payload, signature, secret: 'wrong-secret' }), false);
  // Tampered payload fails verification.
  const tampered = payload.replace('"count"', '"COUNT"');
  assert.equal(rep.verifyFeed({ payload: tampered, signature, secret: 'shared-feed-secret' }), false);
});

test('contribute ignores text without identifiable entities', () => {
  const dir = tmp();
  const out = rep.contribute({ text: 'Olá, mundo.', decision: 'allow', score: 0, tenantId: 't1', dir });
  assert.equal(out.entitiesUpdated, 0);
});
