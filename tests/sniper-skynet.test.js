// KAIROS SNIPER — SKYNET ENGINE TESTS
// 3 complex, disguised scam scenarios that test the full SKYNET pipeline.
// These are real-world scam patterns that try to evade simple keyword detection.
// Each must return a BLOCK/SCAM verdict.

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  verifyPayload,
  scoreNLPHeuristic,
  checkLiveReputation,
  inspectCheckout,
  analyzeUrl,
} = require('../packages/sniper-engine');

// ─────────────────────────────────────────────────────────────────────────────
// SCAM SCENARIO 1: "THE DISGUISED GURU"
// A sophisticated scam that avoids obvious keywords like "get rich quick".
// Instead uses euphemisms, lifestyle language, and social proof manipulation.
// Real-world pattern: Instagram/TikTok "lifestyle entrepreneur" scams.
// ─────────────────────────────────────────────────────────────────────────────

const DISGUISED_GURU_TEXT = `
  Hey, I want to share something that completely transformed my life.
  
  18 months ago I was working a dead-end 9-to-5, struggling to pay rent.
  Today I work from anywhere in the world — last month from Bali, this month from Lisbon.
  
  I discovered a simple system that generates consistent income on autopilot.
  No experience necessary. Anyone can do it. I'll show you exactly how I made $8,500 
  in my first 30 days using this exclusive method.
  
  The laptop lifestyle is real. You just need the right blueprint.
  
  I'm opening up a small mastermind group — only 7 people. 
  This opportunity won't last. Once these spots are gone, they're gone forever.
  
  The banks and the system don't want you to know this exists.
  They don't want you to have financial freedom.
  
  Join over 3,000 happy members who've already changed their lives.
  
  ⚠️ WARNING: This page will be taken down soon. Act now.
  
  👉 https://bit.ly/exclusive-blueprint-access
`;

test('SKYNET: Disguised Guru scam — no obvious keywords, behavioral detection', () => {
  const result = verifyPayload({
    text: DISGUISED_GURU_TEXT,
    region: { country: 'PT' },
  });

  // Must be blocked
  assert.equal(result.verdict.decision, 'block',
    `Disguised guru scam must be BLOCKED. Score: ${result.verdict.score}`);

  // Score must be high
  assert.ok(result.verdict.score >= 60,
    `Expected score >= 60, got ${result.verdict.score}`);

  // SKYNET NLP must fire
  assert.ok(result.skynetIntelligence.nlpScamMatrix.score > 0,
    'NLP Scam Matrix must detect behavioral signals');

  assert.ok(result.skynetIntelligence.nlpScamMatrix.activeDimensions >= 3,
    `Expected >= 3 active scam dimensions, got ${result.skynetIntelligence.nlpScamMatrix.activeDimensions}`);

  // Checkout inspector must flag the bit.ly URL
  assert.ok(result.skynetIntelligence.checkoutInspection.score > 0,
    'Checkout inspector must flag the suspicious URL');

  console.log(`  ✓ Disguised Guru Score: ${result.verdict.score}/100`);
  console.log(`  ✓ NLP Dimensions Active: ${result.skynetIntelligence.nlpScamMatrix.activeDimensions}`);
  console.log(`  ✓ Dominant Threat: ${result.verdict.dominantThreat}`);
});

test('SKYNET: NLP Scam Matrix fires on disguised guru text', () => {
  const result = scoreNLPHeuristic(DISGUISED_GURU_TEXT);

  assert.ok(result.score >= 50,
    `NLP score should be >= 50 for disguised guru, got ${result.score}`);

  // Should detect identity escape (9-to-5, work from anywhere)
  assert.ok(result.dimensions.identityEscape >= 1,
    'Should detect identity escape signals (9-to-5, work from anywhere)');

  // Should detect easy money context (autopilot, no experience)
  assert.ok(result.dimensions.easyMoneyContext >= 1,
    'Should detect easy money context (autopilot, no experience)');

  // Should detect FOMO (spots gone forever, act now)
  assert.ok(result.dimensions.fomo >= 1,
    'Should detect FOMO signals (spots gone, act now)');

  // Should detect urgency (act now, page taken down)
  assert.ok(result.dimensions.urgency >= 1,
    'Should detect urgency signals');

  console.log(`  ✓ NLP Score: ${result.score}`);
  console.log(`  ✓ Active Dimensions: ${result.activeDimensions}`);
  console.log(`  ✓ Dimensions: ${JSON.stringify(result.dimensions)}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// SCAM SCENARIO 2: "THE CRYPTO GHOST" — Changed name 5 minutes ago
// A scam operation that recently rebranded from a known scam (BitConnect-style).
// Uses new name but same patterns. Tests if SKYNET catches behavioral fingerprints
// even when the entity name is new/unknown.
// Real-world pattern: Crypto Ponzi schemes that rebrand after exposure.
// ─────────────────────────────────────────────────────────────────────────────

const CRYPTO_GHOST_TEXT = `
  🚀 INTRODUCING: NovaCoin Wealth Protocol™
  
  The revolutionary AI-powered trading system that generates 300% ROI guaranteed.
  
  Our proprietary algorithm has been tested by verified traders worldwide.
  Join 15,000+ satisfied investors who are already earning passive income.
  
  ✅ Invest $500 and receive $1,500 back within 30 days — GUARANTEED
  ✅ Zero risk investment — your capital is 100% protected
  ✅ Automated income while you sleep
  ✅ No trading experience required
  
  ⚠️ IMPORTANT: Ignore the negative reviews and haters online.
  They are paid competitors trying to stop your success.
  Trustpilot reviews are fake and manipulated by our enemies.
  
  🔒 SECURE YOUR SPOT NOW — Only 48 hours remaining!
  
  Send USDT to unlock your account and activate your trading bot.
  
  Regular price: $2,000 | TODAY ONLY: $497
  
  ❌ No refunds after you access the platform.
  To get a refund you must prove you implemented everything for 90 days.
  
  👉 https://novacoin-wealth.xyz/checkout?ref=vip&aff=guru123
`;

test('SKYNET: Crypto Ghost scam — rebranded Ponzi with new name', () => {
  const result = verifyPayload({
    text: CRYPTO_GHOST_TEXT,
    region: { country: 'BR' },
  });

  // Must be blocked
  assert.equal(result.verdict.decision, 'block',
    `Crypto Ghost scam must be BLOCKED. Score: ${result.verdict.score}`);

  // Score must be very high
  assert.ok(result.verdict.score >= 70,
    `Expected score >= 70, got ${result.verdict.score}`);

  // Live reputation must detect complaint deflection
  assert.ok(result.skynetIntelligence.liveReputation.score > 0,
    'Live reputation must detect complaint deflection signals');

  // Checkout inspector must flag the .xyz URL with affiliate params
  assert.ok(result.skynetIntelligence.checkoutInspection.score > 0,
    'Checkout inspector must flag the suspicious checkout URL');

  // Must detect the checkout + wealth promise combo
  assert.ok(result.skynetIntelligence.checkoutInspection.checkoutWithWealthPromise ||
    result.skynetIntelligence.checkoutInspection.checkoutUrlsFound.length > 0 ||
    result.skynetIntelligence.checkoutInspection.aggressiveFunnelSignals > 0,
    'Checkout inspector must detect checkout signals');

  console.log(`  ✓ Crypto Ghost Score: ${result.verdict.score}/100`);
  console.log(`  ✓ Live Rep Score: ${result.skynetIntelligence.liveReputation.score}`);
  console.log(`  ✓ Checkout Score: ${result.skynetIntelligence.checkoutInspection.score}`);
  console.log(`  ✓ Fatal Alerts: ${result.verdict.fatalAlerts.length}`);
});

test('SKYNET: Live reputation detects complaint deflection in Crypto Ghost', () => {
  const result = checkLiveReputation(CRYPTO_GHOST_TEXT);

  assert.ok(result.score >= 30,
    `Live reputation score should be >= 30, got ${result.score}`);

  // Should detect Trustpilot complaint deflection
  assert.ok(result.reasons.some(r => r.includes('trustpilot') || r.includes('external-check')),
    'Should detect Trustpilot complaint deflection');

  console.log(`  ✓ Live Rep Score: ${result.score}`);
  console.log(`  ✓ Reasons: ${result.reasons.slice(0, 3).join(', ')}`);
});

test('SKYNET: Checkout inspector flags .xyz checkout URL with affiliate params', () => {
  const result = inspectCheckout(CRYPTO_GHOST_TEXT);

  assert.ok(result.score >= 20,
    `Checkout score should be >= 20, got ${result.score}`);

  console.log(`  ✓ Checkout Score: ${result.score}`);
  console.log(`  ✓ Funnel Signals: ${result.checkoutData.aggressiveFunnelSignals}`);
  console.log(`  ✓ Checkout URLs: ${result.checkoutData.checkoutUrlsFound.length}`);
});

test('SKYNET: URL analyzer flags .xyz checkout with affiliate tracking', () => {
  const url = 'https://novacoin-wealth.xyz/checkout?ref=vip&aff=guru123';
  const result = analyzeUrl(url);

  assert.ok(result.urlScore >= 25,
    `URL score should be >= 25, got ${result.urlScore}`);

  assert.ok(result.risks.some(r => r.includes('suspicious-tld') || r.includes('checkout') || r.includes('affiliate')),
    'Should flag suspicious TLD, checkout path, or affiliate tracking');

  console.log(`  ✓ URL Score: ${result.urlScore}`);
  console.log(`  ✓ URL Risks: ${result.risks.join(', ')}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// SCAM SCENARIO 3: "THE PORTUGUESE PHANTOM" — Sophisticated PT/BR scam
// A highly sophisticated Portuguese-language scam that uses:
// - Euphemistic language (no direct "dinheiro fácil")
// - Social proof manipulation
// - Conspiracy narrative
// - Checkout funnel with Hotmart link
// - Complaint deflection
// Real-world pattern: Brazilian "infoproduto" scam ecosystem
// ─────────────────────────────────────────────────────────────────────────────

const PORTUGUESE_PHANTOM_TEXT = `
  Olá, meu nome é Ricardo e há 2 anos eu estava endividado, sem perspectiva.
  
  Hoje eu trabalho de qualquer lugar do mundo, ganhando R$12.000 por mês 
  no piloto automático. Vou te mostrar exatamente como eu fiz isso.
  
  O sistema que descobri é simples. Qualquer um pode fazer, sem experiência necessária.
  
  📊 Resultados dos meus alunos:
  - João: R$8.500 no primeiro mês
  - Maria: Do zero ao R$15k em 60 dias  
  - Carlos: Largou o emprego após 45 dias
  
  ⚠️ ATENÇÃO: O sistema não quer que você saiba disso.
  Os bancos estão escondendo essa informação de você.
  
  Ignore as avaliações negativas — são de concorrentes com inveja.
  O Reclame Aqui é falso e manipulado por pessoas que não tiveram sucesso.
  
  🔥 OFERTA ÚNICA — Apenas 3 vagas restando!
  Preço sobe amanhã de R$997 para R$1.997.
  
  Junte-se a mais de 8.000 alunos satisfeitos que já transformaram suas vidas.
  
  Garantia: Se você não ganhar dinheiro em 30 dias, devolvemos tudo.
  (Para solicitar reembolso você deve provar que implementou todos os módulos.)
  
  👉 https://hotmart.com/product/sistema-renda-automatica/checkout
  
  Não perca esta oportunidade única. Quando acabar não tem mais volta.
`;

test('SKYNET: Portuguese Phantom scam — sophisticated PT/BR infoproduto scam', () => {
  const result = verifyPayload({
    text: PORTUGUESE_PHANTOM_TEXT,
    region: { country: 'BR' },
  });

  // Must be blocked
  assert.equal(result.verdict.decision, 'block',
    `Portuguese Phantom scam must be BLOCKED. Score: ${result.verdict.score}`);

  // Score must be very high
  assert.ok(result.verdict.score >= 70,
    `Expected score >= 70, got ${result.verdict.score}`);

  // NLP must detect multiple dimensions
  assert.ok(result.skynetIntelligence.nlpScamMatrix.activeDimensions >= 3,
    `Expected >= 3 NLP dimensions, got ${result.skynetIntelligence.nlpScamMatrix.activeDimensions}`);

  // Live reputation must detect ReclameAqui deflection
  assert.ok(result.skynetIntelligence.liveReputation.score > 0,
    'Live reputation must detect ReclameAqui complaint deflection');

  // Checkout inspector must flag Hotmart checkout URL
  assert.ok(result.skynetIntelligence.checkoutInspection.checkoutUrlsFound.length > 0 ||
    result.skynetIntelligence.checkoutInspection.aggressiveFunnelSignals > 0,
    'Checkout inspector must detect Hotmart checkout or funnel signals');

  // Must be confirmed scam or red alert
  assert.ok(result.trustLevel.isConfirmedScam || result.trustLevel.isRedAlert,
    `Trust level must be CONFIRMED_SCAM or RED_ALERT, got ${result.trustLevel.key}`);

  console.log(`  ✓ Portuguese Phantom Score: ${result.verdict.score}/100`);
  console.log(`  ✓ Trust Level: ${result.trustLevel.key}`);
  console.log(`  ✓ NLP Dimensions: ${result.skynetIntelligence.nlpScamMatrix.activeDimensions}`);
  console.log(`  ✓ Live Rep Score: ${result.skynetIntelligence.liveReputation.score}`);
  console.log(`  ✓ Checkout Score: ${result.skynetIntelligence.checkoutInspection.score}`);
  console.log(`  ✓ Checkout URLs Found: ${result.skynetIntelligence.checkoutInspection.checkoutUrlsFound.length}`);
  console.log(`  ✓ Dominant Threat: ${result.verdict.dominantThreat}`);
});

test('SKYNET: NLP detects identity escape + easy money in Portuguese Phantom', () => {
  const result = scoreNLPHeuristic(PORTUGUESE_PHANTOM_TEXT);

  assert.ok(result.score >= 40,
    `NLP score should be >= 40, got ${result.score}`);

  // Should detect identity escape (largou o emprego, trabalho de qualquer lugar)
  assert.ok(result.dimensions.identityEscape >= 1,
    'Should detect identity escape (largou o emprego, trabalho de qualquer lugar)');

  // Should detect easy money context (piloto automático, sem experiência)
  assert.ok(result.dimensions.easyMoneyContext >= 1,
    'Should detect easy money context');

  console.log(`  ✓ NLP Score: ${result.score}`);
  console.log(`  ✓ Dimensions: ${JSON.stringify(result.dimensions)}`);
});

test('SKYNET: Live reputation detects ReclameAqui deflection in Portuguese Phantom', () => {
  const result = checkLiveReputation(PORTUGUESE_PHANTOM_TEXT);

  assert.ok(result.score >= 30,
    `Live reputation score should be >= 30, got ${result.score}`);

  // Should detect ReclameAqui defensive language
  assert.ok(result.reasons.some(r => r.includes('reclame') || r.includes('external-check')),
    'Should detect ReclameAqui complaint deflection');

  console.log(`  ✓ Live Rep Score: ${result.score}`);
  console.log(`  ✓ Reasons: ${result.reasons.slice(0, 3).join(', ')}`);
});

test('SKYNET: Checkout inspector detects Hotmart checkout + wealth promise', () => {
  const result = inspectCheckout(PORTUGUESE_PHANTOM_TEXT);

  assert.ok(result.score >= 20,
    `Checkout score should be >= 20, got ${result.score}`);

  // Should detect wealth promise
  assert.ok(result.checkoutData.wealthPromiseDetected,
    'Should detect wealth promise in text');

  console.log(`  ✓ Checkout Score: ${result.score}`);
  console.log(`  ✓ Wealth Promise: ${result.checkoutData.wealthPromiseDetected}`);
  console.log(`  ✓ Checkout+Wealth Combo: ${result.checkoutData.checkoutWithWealthPromise}`);
  console.log(`  ✓ Funnel Signals: ${result.checkoutData.aggressiveFunnelSignals}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// SKYNET MODULE UNIT TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('SKYNET: NLP Scam Matrix returns 0 for clean content', () => {
  const result = scoreNLPHeuristic(
    'Reunião de equipa amanhã às 10h. Agenda: revisão do projeto Q2. ' +
    'Por favor confirmar presença até ao final do dia.'
  );
  assert.equal(result.score, 0, `Expected 0 for clean content, got ${result.score}`);
  assert.equal(result.activeDimensions, 0, 'No dimensions should be active for clean content');
});

test('SKYNET: NLP detects Scam Matrix combo — urgency + ROI + vague method', () => {
  const result = scoreNLPHeuristic(
    'Act now! Limited time only. Secret method to earn $500 per day guaranteed. ' +
    'No experience needed. Anyone can do it. Works on autopilot.'
  );
  assert.ok(result.score >= 60, `Expected >= 60, got ${result.score}`);
  assert.ok(result.dimensions.urgency >= 1, 'Should detect urgency');
  assert.ok(result.dimensions.unrealisticROI >= 1, 'Should detect unrealistic ROI');
  assert.ok(result.dimensions.vagueMethod >= 1, 'Should detect vague method');
  assert.ok(result.reasons.some(r => r.includes('DEADLY-COMBO')), 'Should fire deadly combo');
});

test('SKYNET: Live reputation detects known scam entity (BitConnect)', () => {
  const result = checkLiveReputation('Join BitConnect today and earn 300% ROI guaranteed!');
  assert.ok(result.score >= 90, `Expected >= 90 for BitConnect, got ${result.score}`);
  assert.ok(result.reputationData.knownScamEntities.length > 0, 'Should detect BitConnect as known scam entity');
  assert.ok(result.alerts.some(a => a.level === 'FATAL'), 'Should generate FATAL alert');
});

test('SKYNET: Live reputation detects gift card payment = ALWAYS SCAM', () => {
  const result = checkLiveReputation(
    'To unlock your account, pay with gift cards. ' +
    'Send iTunes gift card codes to activate your investment.'
  );
  assert.ok(result.score >= 60, `Expected >= 60 for gift card payment, got ${result.score}`);
  assert.ok(result.alerts.some(a => a.type === 'gift-card-payment'), 'Should generate gift card payment alert');
});

test('SKYNET: Checkout inspector detects fatal combo — checkout URL + wealth promise', () => {
  const result = inspectCheckout(
    'Get rich quick! Secret method to make $10,000 per month. ' +
    'Click here: https://hotmart.com/product/secret-method/checkout'
  );
  assert.ok(result.checkoutData.checkoutWithWealthPromise, 'Should detect checkout + wealth promise combo');
  assert.ok(result.score >= 80, `Expected >= 80 for fatal combo, got ${result.score}`);
  assert.ok(result.alerts.some(a => a.level === 'FATAL'), 'Should generate FATAL alert');
});

test('SKYNET: verifyPayload exposes skynetIntelligence in response', () => {
  const result = verifyPayload({
    text: 'Get rich quick! Secret method. Only 5 spots left!',
    region: { country: 'US' },
  });

  assert.ok(result.skynetIntelligence, 'Should have skynetIntelligence');
  assert.ok(typeof result.skynetIntelligence.nlpScamMatrix === 'object', 'Should have nlpScamMatrix');
  assert.ok(typeof result.skynetIntelligence.liveReputation === 'object', 'Should have liveReputation');
  assert.ok(typeof result.skynetIntelligence.checkoutInspection === 'object', 'Should have checkoutInspection');
  assert.ok(typeof result.scoreBreakdown.nlpHeuristic === 'number', 'Should have nlpHeuristic in breakdown');
  assert.ok(typeof result.scoreBreakdown.liveReputation === 'number', 'Should have liveReputation in breakdown');
  assert.ok(typeof result.scoreBreakdown.checkoutInspection === 'number', 'Should have checkoutInspection in breakdown');
});

test('SKYNET: verifyPayload with known scam entity returns FATAL alert', () => {
  const result = verifyPayload({
    text: 'Invest in BitConnect today! 300% ROI guaranteed. Join now!',
    region: { country: 'PT' },
  });

  assert.equal(result.verdict.decision, 'block', 'BitConnect must be blocked');
  assert.ok(result.verdict.hasFatalAlert, 'Should have fatal alert for BitConnect');
  assert.ok(result.verdict.fatalAlerts.length > 0, 'Should have at least one fatal alert');
  assert.ok(result.verdict.score >= 80, `Expected >= 80 for BitConnect, got ${result.verdict.score}`);
});

test('SKYNET: Full pipeline — all 6 layers fire on maximum scam', () => {
  const maxScamText = `
    URGENT: Act now! Only 2 spots left! Price doubles tonight!
    Self-made millionaire reveals secret method. Get rich quick!
    I made $50,000 in 30 days from home. No experience needed.
    Join 100,000 happy students. Ignore the haters and negative reviews!
    Trustpilot reviews are fake. No refunds after you access the course.
    Invest in BitConnect-style system. 500% ROI guaranteed.
    Send Bitcoin to unlock your account.
    https://bit.ly/secret-method-checkout
  `;

  const result = verifyPayload({
    text: maxScamText,
    region: { country: 'PT' },
  });

  assert.equal(result.verdict.decision, 'block', 'Maximum scam must be blocked');
  assert.ok(result.verdict.score >= 90, `Expected >= 90 for maximum scam, got ${result.verdict.score}`);
  assert.ok(result.trustLevel.isRedAlert || result.trustLevel.isConfirmedScam,
    'Maximum scam must be RED ALERT or CONFIRMED SCAM');

  // All 6 layers must contribute
  assert.ok(result.scoreBreakdown.contentRisk > 0, 'Layer 1 (core) must fire');
  assert.ok(result.scoreBreakdown.guruScam > 0, 'Layer 2 (guru) must fire');
  assert.ok(result.scoreBreakdown.reputation > 0, 'Layer 3 (reputation) must fire');
  assert.ok(result.scoreBreakdown.nlpHeuristic > 0, 'Layer 4 (NLP) must fire');
  assert.ok(result.scoreBreakdown.liveReputation > 0, 'Layer 5 (live rep) must fire');
  assert.ok(result.scoreBreakdown.checkoutInspection > 0, 'Layer 6 (checkout) must fire');

  console.log(`  ✓ MAXIMUM SCAM Score: ${result.verdict.score}/100`);
  console.log(`  ✓ Trust Level: ${result.trustLevel.key}`);
  console.log(`  ✓ All 6 layers: Core=${result.scoreBreakdown.contentRisk} | Guru=${result.scoreBreakdown.guruScam} | Rep=${result.scoreBreakdown.reputation} | NLP=${result.scoreBreakdown.nlpHeuristic} | LiveRep=${result.scoreBreakdown.liveReputation} | Checkout=${result.scoreBreakdown.checkoutInspection}`);
  console.log(`  ✓ Fatal Alerts: ${result.verdict.fatalAlerts.length}`);
  console.log(`  ✓ Dominant Threat: ${result.verdict.dominantThreat}`);
});
