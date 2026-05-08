'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyPayload } = require('../packages/sniper-engine');
const { buildScamDna, vectorToFingerprint } = require('../packages/sniper-engine/dna');

test('verifyPayload exposes a stable scamDna fingerprint', () => {
  const text = 'Lucro garantido 1000% em 7 dias. Método secreto. Vagas limitadas. Pague agora.';
  const r1 = verifyPayload({ text, region: { country: 'PT' } });
  const r2 = verifyPayload({ text, region: { country: 'PT' } });
  assert.ok(r1.scamDna);
  assert.match(r1.scamDna.fingerprint, /^dna:v1:[0-9a-f]{14}:[0-9a-f]{16}$/);
  assert.equal(r1.scamDna.fingerprint, r2.scamDna.fingerprint);
});

test('classifies guru course family with high severity', () => {
  const text = `Curso milionário do mestre. Método secreto comprovado e exclusivo.
    Lucro garantido 10000€ por mês. Largue o emprego e seja livre.
    Acesso vitalício. Mentor pessoal premiado.
    Apenas 24h, vagas limitadas. Compre agora no checkout.`;
  const r = verifyPayload({ text, region: { country: 'PT' } });
  assert.ok(['guru-course-pyramid', 'crypto-pump', 'high-pressure-unknown', 'mixed-suspicious', 'fake-marketplace-checkout'].includes(r.scamDna.family.key), `Unexpected family: ${r.scamDna.family.key}`);
  assert.ok(['medium', 'high', 'critical'].includes(r.scamDna.severity), `Unexpected severity: ${r.scamDna.severity}`);
  assert.ok(r.scamDna.confidence >= 0.5, `Confidence too low: ${r.scamDna.confidence}`);
});

test('safe text yields none family and none severity', () => {
  const r = verifyPayload({ text: 'Olá, como estás? Vamos almoçar amanhã.', region: { country: 'PT' } });
  assert.equal(r.scamDna.severity, 'none');
  assert.equal(r.scamDna.family.key, 'unknown');
});

test('two scams that share chromosomes cluster on the same family', () => {
  const a = verifyPayload({
    text: 'Curso "Método Apex" do mentor. Lucro garantido 10000 por mês. Método secreto exclusivo. Largue o emprego. Vagas limitadas. Compre agora no checkout.',
    region: { country: 'PT' },
  });
  const b = verifyPayload({
    text: 'Curso "Sistema Vortex" do mentor. Lucro garantido 10000 por mês. Método secreto exclusivo. Largue o emprego. Vagas limitadas. Compre agora no checkout.',
    region: { country: 'PT' },
  });
  // Same chromosomes → same family.
  assert.equal(a.scamDna.family.key, b.scamDna.family.key);
  // Same severity tier.
  assert.equal(a.scamDna.severity, b.scamDna.severity);
  // Confidence should be identical too — the only diff is the brand string.
  assert.equal(a.scamDna.confidence, b.scamDna.confidence);
});

test('vectorToFingerprint is deterministic for identical vectors', () => {
  const v = { urgency: 0.5, unrealisticRoi: 0.5, vagueMethod: 0.5, authorityBait: 0.5, fomo: 0.5, identityEscape: 0.5, paymentRails: 0.5 };
  const a = vectorToFingerprint(v);
  const b = vectorToFingerprint(v);
  assert.equal(a, b);
});
