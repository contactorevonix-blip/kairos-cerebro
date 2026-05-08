const test = require('node:test');
const assert = require('node:assert/strict');
const {
  verifyPayload,
  detectRegionalContext,
  scoreContentRisk,
  scoreGuruScam,
  scoreReputation,
  classifyTrustLevel,
  getTrustRecommendation,
} = require('../packages/sniper-engine');

// ─── GEO TESTS ────────────────────────────────────────────────────────────────

test('detectRegionalContext returns country-specific profile', () => {
  const region = detectRegionalContext({ country: 'BR' });
  assert.equal(region.language, 'pt-BR');
  assert.equal(region.currency, 'BRL');
  assert.ok(region.stripePaymentMethods.includes('pix'));
});

// ─── CORE CONTENT RISK TESTS ──────────────────────────────────────────────────

test('scoreContentRisk flags guru/get-rich patterns', () => {
  const risk = scoreContentRisk('Guaranteed profit and get rich quick with our guru secrets');
  assert.ok(risk.score >= 30);
  assert.ok(risk.reasons.length > 0);
});

test('scoreContentRisk flags phishing patterns', () => {
  const risk = scoreContentRisk('Verifique a sua conta urgente: a sua conta foi suspensa. Clique aqui para confirmar.');
  assert.ok(risk.score >= 40);
  assert.ok(risk.reasons.some(r => r.includes('phishing')));
});

test('scoreContentRisk returns 0 for clean content', () => {
  const risk = scoreContentRisk('Reunião de equipa amanhã às 10h. Agenda: revisão do projeto.');
  assert.equal(risk.score, 0);
  assert.equal(risk.reasons.length, 0);
});

// ─── GURU-SCAM DETECTOR TESTS ─────────────────────────────────────────────────

test('scoreGuruScam detects "get rich quick" course scam — FATAL SCORE', () => {
  const result = scoreGuruScam(
    'Get rich quick with our secret method! I made $5000 in 3 days from home. ' +
    'No experience needed. Only 3 spots left! Price goes up in 24 hours. ' +
    'Join 10,000 happy students. Money-back guarantee if you don\'t make money.'
  );
  assert.ok(result.score >= 60, `Expected score >= 60, got ${result.score}`);
  assert.ok(result.flags.guruCourse >= 1, 'Should flag guru course pattern');
  assert.ok(result.flags.highPressure >= 1, 'Should flag high pressure tactics');
  assert.ok(result.reasons.length >= 3, 'Should have multiple reasons');
});

test('scoreGuruScam detects Portuguese "curso milionário" scam', () => {
  const result = scoreGuruScam(
    'Curso online garantido! Ganhar €500 por dia sem experiência necessária. ' +
    'Método secreto dos milionários. Apenas 5 vagas restantes. ' +
    'Preço sobe amanhã. Junte-se a 5000 alunos satisfeitos!'
  );
  assert.ok(result.score >= 60, `Expected score >= 60, got ${result.score}`);
  assert.ok(result.flags.guruCourse >= 1, 'Should flag guru course pattern');
  assert.ok(result.flags.highPressure >= 1, 'Should flag high pressure tactics');
});

test('scoreGuruScam detects unrealistic ROI claims', () => {
  const result = scoreGuruScam(
    'Double your money in 30 days guaranteed! 500% ROI assured. ' +
    'Invest $100 and get $1000 back within a week.'
  );
  assert.ok(result.score >= 40, `Expected score >= 40, got ${result.score}`);
  assert.ok(result.flags.unrealisticROI >= 1, 'Should flag unrealistic ROI');
});

test('scoreGuruScam detects guru persona patterns', () => {
  const result = scoreGuruScam(
    'Self-made millionaire teaches secret method that made me rich. ' +
    'From broke to millionaire in 90 days. I was in debt before I discovered this system.'
  );
  assert.ok(result.score >= 30, `Expected score >= 30, got ${result.score}`);
  assert.ok(result.flags.guruPersona >= 1, 'Should flag guru persona');
});

test('scoreGuruScam detects Brazilian "mentoria milionária" scam', () => {
  const result = scoreGuruScam(
    'Mentoria online garantida! Fiz R$10k em apenas 7 dias em casa. ' +
    'Do zero ao milhão em 90 dias. Demita seu chefe hoje. ' +
    'Mentalidade de milionário. Apenas 3 vagas restando!'
  );
  assert.ok(result.score >= 60, `Expected score >= 60, got ${result.score}`);
  assert.ok(result.flags.guruCourse >= 1, 'Should flag guru course');
});

test('scoreGuruScam detects combo amplifier for full scam package', () => {
  const result = scoreGuruScam(
    'Self-made millionaire reveals secret method. Get rich quick online. ' +
    'Only 2 spots left! Price doubles tonight. Join 50,000 happy students.'
  );
  // Full scam package: guru persona + course + pressure = combo amplifier fires
  assert.ok(result.reasons.some(r => r.includes('combo-amplifier')), 'Should fire combo amplifier');
  assert.ok(result.score >= 80, `Expected score >= 80 for full scam package, got ${result.score}`);
});

test('scoreGuruScam returns 0 for legitimate business content', () => {
  const result = scoreGuruScam(
    'Curso de programação JavaScript para iniciantes. ' +
    'Aprenda as bases de desenvolvimento web em 12 semanas. ' +
    'Certificado reconhecido. Instrutores experientes.'
  );
  assert.equal(result.score, 0, `Expected 0 for legitimate course, got ${result.score}`);
});

// ─── REPUTATION INTELLIGENCE TESTS ───────────────────────────────────────────

test('scoreReputation detects complaint deflection patterns', () => {
  const result = scoreReputation(
    'Ignore the haters and negative reviews! They are just jealous of your success. ' +
    'The system doesn\'t want you to know this. Trustpilot reviews are fake and paid.'
  );
  assert.ok(result.score >= 30, `Expected score >= 30, got ${result.score}`);
  assert.ok(result.reputationFlags.complaintDeflection >= 1, 'Should flag complaint deflection');
});

test('scoreReputation detects Portuguese complaint deflection', () => {
  const result = scoreReputation(
    'Ignore os haters e avaliações negativas! Eles têm inveja do seu sucesso. ' +
    'O sistema não quer que você saiba disso. Reclame Aqui é falso e manipulado.'
  );
  assert.ok(result.score >= 30, `Expected score >= 30, got ${result.score}`);
  assert.ok(result.reputationFlags.complaintDeflection >= 1, 'Should flag complaint deflection');
});

test('scoreReputation detects refund manipulation', () => {
  const result = scoreReputation(
    'No refunds after you access the course. ' +
    'To get a refund you must prove you tried and implemented everything. ' +
    'Chargeback fraud will result in legal action.'
  );
  assert.ok(result.score >= 25, `Expected score >= 25, got ${result.score}`);
  assert.ok(result.reputationFlags.refundManipulation >= 1, 'Should flag refund manipulation');
});

test('scoreReputation detects known scam brand patterns', () => {
  const result = scoreReputation(
    'Join the Millionaire Academy today! The Passive Income Empire system. ' +
    'Crypto Genius reveals all secrets. Trading Wizard blueprint.'
  );
  assert.ok(result.score >= 20, `Expected score >= 20, got ${result.score}`);
  assert.ok(result.reputationFlags.knownScamBrand >= 1, 'Should flag known scam brand');
});

test('scoreReputation fires combo amplifier for complaint deflection + refund manipulation', () => {
  const result = scoreReputation(
    'Ignore the haters and negative reviews! They are jealous. ' +
    'No refunds after you access the content. Chargeback fraud is illegal.'
  );
  assert.ok(result.reasons.some(r => r.includes('reputation-combo')), 'Should fire reputation combo');
  assert.ok(result.score >= 50, `Expected score >= 50 for combo, got ${result.score}`);
});

// ─── TRUST LEVEL CLASSIFIER TESTS ────────────────────────────────────────────

test('classifyTrustLevel returns VERIFIED_SAFE for score 0', () => {
  const level = classifyTrustLevel(0);
  assert.equal(level.key, 'VERIFIED_SAFE');
  assert.equal(level.alertLevel, 0);
});

test('classifyTrustLevel returns SUSPICIOUS for score 35', () => {
  const level = classifyTrustLevel(35);
  assert.equal(level.key, 'SUSPICIOUS');
  assert.equal(level.alertLevel, 2);
});

test('classifyTrustLevel returns RED_ALERT for score 90', () => {
  const level = classifyTrustLevel(90);
  assert.equal(level.key, 'RED_ALERT');
  assert.equal(level.alertLevel, 5);
});

test('classifyTrustLevel returns CONFIRMED_SCAM for score 75', () => {
  const level = classifyTrustLevel(75);
  assert.equal(level.key, 'CONFIRMED_SCAM');
  assert.equal(level.alertLevel, 4);
});

test('getTrustRecommendation returns RED ALERT message for max threat', () => {
  const level = classifyTrustLevel(95);
  const rec = getTrustRecommendation(level);
  assert.ok(rec.includes('BLOCK'), 'RED ALERT recommendation should say BLOCK');
  assert.ok(rec.includes('🚨'), 'RED ALERT recommendation should have alert emoji');
});

// ─── FULL PIPELINE INTEGRATION TESTS ─────────────────────────────────────────

test('verifyPayload returns white-label verdict with compliance block', () => {
  const response = verifyPayload({
    tenantId: 'bank-alpha',
    channel: 'email',
    text: 'Lucro garantido com IA milagrosa. Dinheiro facil agora.',
    region: { country: 'PT' },
    brandingMode: 'white-label',
  });

  assert.equal(response.tenantId, 'bank-alpha');
  assert.equal(response.whiteLabel.brandingMode, 'white-label');
  assert.equal(response.regional.currency, 'EUR');
  assert.equal(response.compliance.explanationAvailable, true);
  assert.ok(['review', 'block'].includes(response.verdict.decision));
});

test('verifyPayload returns RED ALERT for full guru-scam course', () => {
  const response = verifyPayload({
    text: 'Get rich quick! Secret method revealed by self-made millionaire. ' +
          'I made $10,000 in 7 days from home. No experience needed. ' +
          'Only 3 spots left! Price doubles tonight. Join 50,000 happy students. ' +
          'Money-back guarantee if you don\'t make money. Ignore the haters!',
    region: { country: 'PT' },
  });

  assert.equal(response.verdict.decision, 'block', 'Full scam should be blocked');
  assert.ok(response.trustLevel.isConfirmedScam || response.trustLevel.isRedAlert,
    'Full scam should be confirmed scam or red alert');
  assert.ok(response.verdict.score >= 60, `Expected score >= 60, got ${response.verdict.score}`);
  assert.ok(response.trustLevel.alertLevel >= 4, 'Alert level should be >= 4');
});

test('verifyPayload returns RED ALERT for Portuguese mentoria scam', () => {
  const response = verifyPayload({
    text: 'Mentoria online garantida! Fiz R$15k em apenas 5 dias em casa. ' +
          'Do zero ao milhão em 60 dias. Demita seu chefe hoje. ' +
          'Método secreto dos milionários. Apenas 2 vagas restando! ' +
          'Preço sobe amanhã. Ignore os haters e avaliações negativas!',
    region: { country: 'BR' },
  });

  assert.equal(response.verdict.decision, 'block', 'PT mentoria scam should be blocked');
  assert.ok(response.verdict.score >= 60, `Expected score >= 60, got ${response.verdict.score}`);
  assert.ok(response.trustLevel.alertLevel >= 4, 'Alert level should be >= 4');
});

test('verifyPayload exposes scoreBreakdown with all three layers', () => {
  const response = verifyPayload({
    text: 'Get rich quick guaranteed! Secret method. Only 5 spots left!',
    region: { country: 'US' },
  });

  assert.ok(typeof response.scoreBreakdown.contentRisk === 'number', 'Should have contentRisk score');
  assert.ok(typeof response.scoreBreakdown.guruScam === 'number', 'Should have guruScam score');
  assert.ok(typeof response.scoreBreakdown.reputation === 'number', 'Should have reputation score');
});

test('verifyPayload exposes reputationIntelligence flags', () => {
  const response = verifyPayload({
    text: 'Get rich quick! Ignore the haters. No refunds after access.',
    region: { country: 'US' },
  });

  assert.ok(response.reputationIntelligence, 'Should have reputationIntelligence');
  assert.ok(response.reputationIntelligence.guruScamFlags, 'Should have guruScamFlags');
  assert.ok(response.reputationIntelligence.reputationFlags, 'Should have reputationFlags');
});

test('verifyPayload includes reporting channels for confirmed scams', () => {
  const response = verifyPayload({
    text: 'Get rich quick! Secret millionaire method. Only 2 spots left! ' +
          'I made $50,000 in 30 days. No experience needed. Ignore haters!',
    region: { country: 'PT' },
  });

  if (response.trustLevel.isConfirmedScam) {
    assert.ok(response.compliance.reportingChannels.length > 0,
      'Confirmed scam should have reporting channels');
  }
});

test('verifyPayload returns SAFE for legitimate content', () => {
  const response = verifyPayload({
    text: 'Reunião de equipa amanhã às 10h. Agenda: revisão do projeto Q2. ' +
          'Por favor confirmar presença até ao final do dia.',
    region: { country: 'PT' },
  });

  assert.equal(response.verdict.decision, 'allow', 'Legitimate content should be allowed');
  assert.equal(response.trustLevel.key, 'VERIFIED_SAFE', 'Should be VERIFIED_SAFE');
  assert.equal(response.trustLevel.alertLevel, 0, 'Alert level should be 0');
});

test('verifyPayload apiVersion is v2', () => {
  const response = verifyPayload({ text: 'test', region: { country: 'PT' } });
  assert.equal(response.whiteLabel.apiVersion, 'v2');
});
