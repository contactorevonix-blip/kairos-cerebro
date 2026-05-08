// KAIROS SNIPER — Scam DNA v1
// Universal fingerprint for scam DNA. Targets the CHROMOSOMES of fraud,
// not individual gurus. Two scams with the same chromosome profile share a
// family tree even if they use different brands, languages or geographies.
//
// 7 chromosomes (each in [0,1]):
//   1. URGENCY              — pressure, scarcity, deadlines
//   2. UNREALISTIC_ROI      — guaranteed/exaggerated returns
//   3. VAGUE_METHOD         — secret/proprietary system, opaque mechanics
//   4. AUTHORITY_BAIT       — fake credentials, fake awards, "as seen on"
//   5. FOMO                 — last chance, everyone is winning, peer pressure
//   6. IDENTITY_ESCAPE      — quit your job, freedom from work, status flip
//   7. PAYMENT_RAILS        — checkout funnel + high-risk gateways + gift cards
//
// Output:
//   { vector, fingerprint (sha256 hex), family, severity, confidence }

'use strict';

const crypto = require('crypto');

const FAMILIES = [
  // Order matters: first match wins.
  {
    key: 'guru-course-pyramid',
    label: 'Guru Course / Pyramid Scheme',
    test: (v) => v.unrealisticRoi >= 0.55 && v.vagueMethod >= 0.45 && v.identityEscape >= 0.4,
  },
  {
    key: 'crypto-pump',
    label: 'Crypto Pump-and-Dump / Fake Yield',
    test: (v) => v.unrealisticRoi >= 0.6 && v.urgency >= 0.4 && v.paymentRails >= 0.4,
  },
  {
    key: 'phishing-impersonation',
    label: 'Phishing / Brand Impersonation',
    test: (v, ctx) => ctx.coreReasons.some((r) => r.startsWith('phishing-pattern')),
  },
  {
    key: 'romance-pig-butchering',
    label: 'Romance Scam / Pig Butchering',
    test: (v, ctx) => ctx.allReasons.some((r) => /romance|pig.?butchering|sha.?zhu.?pan/i.test(r)),
  },
  {
    key: 'fake-marketplace-checkout',
    label: 'Fake Marketplace / Hostile Checkout',
    test: (v) => v.paymentRails >= 0.6 && v.urgency >= 0.4 && v.unrealisticRoi < 0.3,
  },
  {
    key: 'high-pressure-unknown',
    label: 'High-Pressure Suspicious Offer',
    test: (v) => v.urgency >= 0.5 && v.fomo >= 0.4,
  },
];

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function reasonsHit(reasonList, regex) {
  return (reasonList || []).filter((r) => regex.test(r)).length;
}

function buildVector({ coreResult, guruResult, reputationResult, nlpResult, liveRepResult, checkoutResult }) {
  const dims = nlpResult.dimensions || {};
  const allReasons = [
    ...(coreResult.reasons || []),
    ...(guruResult.reasons || []),
    ...(reputationResult.reasons || []),
    ...(nlpResult.reasons || []),
    ...(liveRepResult.reasons || []),
    ...(checkoutResult.reasons || []),
  ];

  const urgency = clamp01(
    (dims.urgency || 0) / 6
    + (checkoutResult.checkoutData?.aggressiveFunnelSignals || 0) / 8
    + reasonsHit(allReasons, /urgency|countdown|expir|limited.?time|apenas\s+\d/i) / 4
  );

  const unrealisticRoi = clamp01(
    (dims.unrealisticROI || 0) / 5
    + (guruResult.flags?.unrealisticROI || 0) / 4
    + reasonsHit(allReasons, /guaranteed|garantido|garantizada|profit|lucro|earn-?\d|retorno-?\d|roi/i) / 5
  );

  const vagueMethod = clamp01(
    (dims.vagueMethod || 0) / 5
    + (guruResult.flags?.guruCourse || 0) / 4
    + reasonsHit(allReasons, /secret|secreto|secreta|formula|method|m[eé]todo|blueprint|exclusivo/i) / 5
  );

  const authorityBait = clamp01(
    (dims.authorityBait || 0) / 5
    + (guruResult.flags?.fakeSocialProof || 0) / 4
    + reasonsHit(allReasons, /authority|expert|guru|mentor|premiad|as.?seen|featured/i) / 5
  );

  const fomo = clamp01(
    (dims.fomo || 0) / 5
    + (guruResult.flags?.highPressure || 0) / 5
    + reasonsHit(allReasons, /vagas|spots|seats|last.?chance|miss-?out|todo.?mundo|everyone/i) / 4
  );

  const identityEscape = clamp01(
    (dims.identityEscape || 0) / 5
    + (guruResult.flags?.guruPersona || 0) / 4
    + reasonsHit(allReasons, /largue|quit-?your-?job|liberdade.?financeira|financial.?freedom|escape/i) / 4
  );

  const paymentRails = clamp01(
    (checkoutResult.checkoutData?.checkoutUrlsFound?.length || 0) / 3
    + (liveRepResult.reputationData?.highRiskUrls?.length || 0) / 4
    + (reputationResult.reputationFlags?.fakeUrgency || 0) / 4
    + (checkoutResult.checkoutData?.checkoutWithWealthPromise ? 0.6 : 0)
    + reasonsHit(allReasons, /checkout|pague|pay-?with|gateway|gift.?card|stripe|hotmart|eduzz|clickbank|jvzoo/i) / 5
  );

  return {
    urgency,
    unrealisticRoi,
    vagueMethod,
    authorityBait,
    fomo,
    identityEscape,
    paymentRails,
  };
}

function vectorToFingerprint(vector) {
  // 7 axes × 1 byte (0..255) = stable 14-char hex prefix, then sha256 over it.
  const buf = Buffer.from([
    Math.round(vector.urgency * 255),
    Math.round(vector.unrealisticRoi * 255),
    Math.round(vector.vagueMethod * 255),
    Math.round(vector.authorityBait * 255),
    Math.round(vector.fomo * 255),
    Math.round(vector.identityEscape * 255),
    Math.round(vector.paymentRails * 255),
  ]);
  const prefix = buf.toString('hex');
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  return `dna:v1:${prefix}:${hash.substring(0, 16)}`;
}

function classifyFamily(vector, ctx) {
  for (const f of FAMILIES) {
    if (f.test(vector, ctx)) return { key: f.key, label: f.label };
  }
  // Sum-based fallback.
  const sum = Object.values(vector).reduce((a, b) => a + b, 0);
  if (sum < 1.0) return { key: 'unknown', label: 'No clear scam family' };
  return { key: 'mixed-suspicious', label: 'Mixed Suspicious Signals' };
}

function severityFromVector(vector) {
  const sum = Object.values(vector).reduce((a, b) => a + b, 0);
  // 7 axes max sum = 7.
  const ratio = sum / 7;
  if (ratio >= 0.55) return 'critical';
  if (ratio >= 0.35) return 'high';
  if (ratio >= 0.18) return 'medium';
  if (ratio > 0) return 'low';
  return 'none';
}

function confidenceFromContext(ctx) {
  // Confidence rises with number of layers contributing non-zero score.
  const layers = [
    ctx.coreResult?.score,
    ctx.guruResult?.score,
    ctx.reputationResult?.score,
    ctx.nlpResult?.score,
    ctx.liveRepResult?.score,
    ctx.checkoutResult?.score,
  ].filter((s) => Number(s) > 0).length;
  return Math.round((layers / 6) * 100) / 100;
}

function buildScamDna(ctx) {
  const vector = buildVector(ctx);
  const fingerprint = vectorToFingerprint(vector);
  const allReasons = [
    ...(ctx.coreResult?.reasons || []),
    ...(ctx.guruResult?.reasons || []),
    ...(ctx.reputationResult?.reasons || []),
    ...(ctx.nlpResult?.reasons || []),
    ...(ctx.liveRepResult?.reasons || []),
    ...(ctx.checkoutResult?.reasons || []),
  ];
  const family = classifyFamily(vector, {
    coreReasons: ctx.coreResult?.reasons || [],
    allReasons,
  });
  return {
    fingerprint,
    vector,
    family,
    severity: severityFromVector(vector),
    confidence: confidenceFromContext(ctx),
  };
}

module.exports = { buildScamDna, buildVector, vectorToFingerprint, classifyFamily };
