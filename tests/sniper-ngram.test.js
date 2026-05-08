'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { scoreNgramSimilarity, normalize, cosine, ngramTf, CORPUS } = require('../packages/sniper-engine/ngram');
const { verifyPayload } = require('../packages/sniper-engine');

test('normalize strips diacritics and punctuation, lowercases', () => {
  assert.equal(normalize('Método-Secreto, GARANTIDO!'), 'metodo secreto garantido');
});

test('cosine self-similarity is 1.0 for identical text', () => {
  const a = ngramTf('hello world');
  assert.ok(Math.abs(cosine(a, a) - 1) < 1e-9);
});

test('scoreNgramSimilarity flags a paraphrased guru playbook', () => {
  // Brand and exact words differ from the corpus excerpt, but the shape is the same.
  const novel = `Sistema proprietário copiar e colar. Largue o seu trabalho.
    Ganhos passivos garantidos. Lugares limitados. Não perca!
    Mentor pessoal. Sistema comprovado. Liberdade financeira ao alcance.`;
  const out = scoreNgramSimilarity(novel);
  assert.ok(out.score > 0, `Expected non-zero score, got ${out.score}`);
  assert.ok(out.topMatch);
  assert.ok(['guru-course-pyramid', 'crypto-pump', 'mlm-recruit'].includes(out.topMatch.family));
});

test('scoreNgramSimilarity returns zero for benign text', () => {
  const out = scoreNgramSimilarity('Olá amigos, vamos almoçar amanhã ao meio-dia. Trago a sobremesa.');
  assert.equal(out.score, 0);
});

test('scoreNgramSimilarity returns zero for very short text', () => {
  const out = scoreNgramSimilarity('hi');
  assert.equal(out.score, 0);
});

test('verifyPayload exposes fuzzyMatch and contributes to the verdict', () => {
  const r = verifyPayload({
    text: 'Método secreto comprovado. Largue o trabalho. Passive income guaranteed. Vagas limitadas. Sistema proprietário.',
    region: { country: 'PT' },
  });
  assert.ok(r.fuzzyMatch);
  assert.ok(r.fuzzyMatch.score >= 0);
  assert.ok(typeof r.scoreBreakdown.fuzzyNgram === 'number');
});

test('CORPUS is non-empty and exposes id+family per entry', () => {
  assert.ok(CORPUS.length >= 5);
  for (const e of CORPUS) {
    assert.ok(typeof e.id === 'string' && e.id.length > 0);
    assert.ok(typeof e.family === 'string' && e.family.length > 0);
    assert.ok(typeof e.excerpt === 'string' && e.excerpt.length > 20);
  }
});
