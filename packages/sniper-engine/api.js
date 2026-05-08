// KAIROS Engine — Verification Orchestrator
// Unified scoring pipeline across six layers:
//   core, guru-scam, reputation, nlp-heuristic, live-reputation, checkout-inspector.
// Output is a deterministic verdict + scam DNA fingerprint for clustering.

'use strict';

const { detectRegionalContext } = require('./geo');
const { scoreContentRisk, riskDecision } = require('./core');
const { scoreGuruScam } = require('./guru-scam');
const { scoreReputation, classifyTrustLevel, getTrustRecommendation } = require('./reputation');
const { scoreNLPHeuristic } = require('./nlp-heuristic');
const { checkLiveReputation } = require('./live-reputation');
const { inspectCheckout } = require('./checkout-inspector');
const { buildScamDna } = require('./dna');
const { scoreNgramSimilarity } = require('./ngram');

// ─── SCORE FUSION ─────────────────────────────────────────────────────────────
// Weighted fusion across six layers. Weights chosen so triple-counting is
// damped and the strongest signal dominates without saturating.

function fuseScores(coreResult, guruResult, reputationResult, nlpResult, liveRepResult, checkoutResult, ngramResult, networkResult) {
  const ngramScore = ngramResult ? ngramResult.score : 0;
  const networkScore = networkResult ? networkResult.networkScore : 0;
  const rawCombined = coreResult.score + guruResult.score + reputationResult.score +
    nlpResult.score + liveRepResult.score + checkoutResult.score +
    ngramScore + networkScore;

  const weighted = coreResult.score
    + (guruResult.score * 0.85)
    + (reputationResult.score * 0.75)
    + (nlpResult.score * 0.80)
    + (liveRepResult.score * 0.70)
    + (checkoutResult.score * 0.75)
    + (ngramScore * 0.55)
    + (networkScore * 0.90); // Network intelligence is the strongest signal we have.

  const composite = Math.max(0, Math.min(Math.round(weighted), 100));

  const allReasons = [
    ...coreResult.reasons,
    ...guruResult.reasons,
    ...reputationResult.reasons,
    ...nlpResult.reasons,
    ...liveRepResult.reasons,
    ...checkoutResult.reasons,
    ...((ngramResult && ngramResult.reasons) || []),
    ...((networkResult && networkResult.reasons) || []),
  ];

  const allAlerts = [
    ...(liveRepResult.alerts || []),
    ...(checkoutResult.alerts || []),
    ...((networkResult && networkResult.alerts) || []),
  ];

  // Determine dominant threat category
  const scores = {
    'guru-scam-course': guruResult.score,
    'nlp-behavioral': nlpResult.score,
    'live-reputation': liveRepResult.score,
    'checkout-inspection': checkoutResult.score,
    'reputation-complaint': reputationResult.score,
    'content-risk': coreResult.score,
    'fuzzy-ngram': ngramScore,
    'network-intelligence': networkScore,
  };
  const dominantThreat = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a, ['none', 0])[0];
  const finalDominant = scores[dominantThreat] > 0 ? dominantThreat : 'none';

  return {
    composite,
    rawCombined,
    breakdown: {
      contentRisk: coreResult.score,
      guruScam: guruResult.score,
      reputation: reputationResult.score,
      nlpHeuristic: nlpResult.score,
      liveReputation: liveRepResult.score,
      checkoutInspection: checkoutResult.score,
      fuzzyNgram: ngramScore,
      networkIntelligence: networkScore,
    },
    dominantThreat: finalDominant,
    allReasons,
    allAlerts,
  };
}

// ─── MAIN VERIFY FUNCTION ─────────────────────────────────────────────────────

function verifyPayload(payload = {}) {
  const regional = detectRegionalContext(payload.region || {});
  const tenantId = String(payload.tenantId || 'default-tenant');
  const channel = String(payload.channel || 'unknown');
  const text = payload.text || '';
  const urls = Array.isArray(payload.urls) ? payload.urls : [];

  // ── LAYER 1: Core content risk (phishing, high-risk patterns, URLs) ──
  const coreResult = scoreContentRisk(text);

  // ── LAYER 2: Guru-Scam detection (courses, fake gurus, unrealistic ROI) ──
  const guruResult = scoreGuruScam(text);

  // ── LAYER 3: Reputation & complaint intelligence ──
  const reputationResult = scoreReputation(text);

  // ── LAYER 4: NLP heuristic (7-axis scam-matrix behavioural signals) ──
  const nlpResult = scoreNLPHeuristic(text);

  // ── LAYER 5: Reputation/complaint-evasion linguistic forensics ──
  const liveRepResult = checkLiveReputation(text, urls);

  // ── LAYER 6: Deep checkout & link inspection ──
  const checkoutResult = inspectCheckout(text, urls);

  // ── LAYER 7: Fuzzy n-gram match against confirmed-scam corpus ──
  const ngramResult = scoreNgramSimilarity(text);

  // ── LAYER 8 (optional): Network intelligence (cross-tenant reputation graph) ──
  // The graph is queried via an injected resolver to keep the engine pure.
  let networkResult = null;
  if (typeof payload.networkResolver === 'function') {
    try {
      const resolved = payload.networkResolver({ text, urls });
      if (resolved && Number.isFinite(resolved.networkScore)) {
        networkResult = {
          networkScore: Math.max(0, Math.min(100, Math.round(resolved.networkScore))),
          topEntity: resolved.topEntity || null,
          matched: resolved.matched || [],
          reasons: resolved.topEntity
            ? [`network-intelligence:${resolved.topEntity.type}=${resolved.topEntity.id}:score=${resolved.networkScore}`]
            : [],
          alerts: resolved.networkScore >= 80
            ? [{ level: 'FATAL', type: 'network-intelligence', message: `Entity already flagged by ${resolved.matched?.length || 0} prior verifications across the network.`, action: 'BLOCK_IMMEDIATELY' }]
            : [],
        };
      }
    } catch { /* resolver failures must not break the engine */ }
  }

  // ── FUSION: Combine all available layers into composite score ──
  const fusion = fuseScores(coreResult, guruResult, reputationResult, nlpResult, liveRepResult, checkoutResult, ngramResult, networkResult);

  // ── SCAM DNA: 7-chromosome fingerprint, family classification, severity ──
  const scamDna = buildScamDna({
    coreResult,
    guruResult,
    reputationResult,
    nlpResult,
    liveRepResult,
    checkoutResult,
  });

  // ── DECISION: Based on composite score ──
  const decision = riskDecision(fusion.composite);

  // ── TRUST LEVEL: Human-readable classification ──
  const trustLevel = classifyTrustLevel(fusion.composite);
  const recommendation = getTrustRecommendation(trustLevel);

  // ── ALERT: RED ALERT flag for maximum threat ──
  const isRedAlert = trustLevel.alertLevel >= 5;
  const isConfirmedScam = trustLevel.alertLevel >= 4;

  // ── FATAL ALERTS: Immediate block signals from any layer ──
  const fatalAlerts = fusion.allAlerts.filter(a => a.level === 'FATAL');
  const hasFatalAlert = fatalAlerts.length > 0;

  const layerIntel = {
    nlpScamMatrix: {
      score: nlpResult.score,
      activeDimensions: nlpResult.activeDimensions,
      dimensions: nlpResult.dimensions,
    },
    liveReputation: {
      score: liveRepResult.score,
      knownScamEntities: liveRepResult.reputationData.knownScamEntities,
      reviewSiteGaslighting: liveRepResult.reputationData.reviewSiteGaslighting,
      highRiskUrls: liveRepResult.reputationData.highRiskUrls,
    },
    checkoutInspection: {
      score: checkoutResult.score,
      aggressiveFunnelSignals: checkoutResult.checkoutData.aggressiveFunnelSignals,
      checkoutUrlsFound: checkoutResult.checkoutData.checkoutUrlsFound,
      checkoutWithWealthPromise: checkoutResult.checkoutData.checkoutWithWealthPromise,
      urlAnalysis: checkoutResult.checkoutData.urlAnalysis,
    },
  };

  return {
    tenantId,
    whiteLabel: {
      brandingMode: payload.brandingMode || 'partner',
      apiVersion: 'v2',
    },
    channel,
    regional,
    verdict: {
      score: fusion.composite,
      decision,
      reasons: fusion.allReasons,
      dominantThreat: fusion.dominantThreat,
      hasFatalAlert,
      fatalAlerts: hasFatalAlert ? fatalAlerts : [],
    },
    trustLevel: {
      key: trustLevel.key,
      label: trustLevel.label,
      emoji: trustLevel.emoji,
      color: trustLevel.color,
      alertLevel: trustLevel.alertLevel,
      isRedAlert,
      isConfirmedScam,
      recommendation,
    },
    scoreBreakdown: fusion.breakdown,
    scamDna,
    layerIntelligence: layerIntel,
    skynetIntelligence: layerIntel,
    fuzzyMatch: ngramResult,
    networkIntelligence: networkResult || { networkScore: 0, topEntity: null, matched: [] },
    reputationIntelligence: {
      entitiesFound: reputationResult.entities,
      reputationFlags: reputationResult.reputationFlags,
      guruScamFlags: guruResult.flags,
    },
    compliance: {
      explanationAvailable: true,
      actionPolicy: decision === 'block' ? 'manual-appeal-allowed' : 'user-choice',
      reportingChannels: isConfirmedScam
        ? ['Procon (BR)', 'CMVM (PT)', 'FCA (UK)', 'FTC (US)', 'Reclame Aqui', 'Trustpilot']
        : [],
    },
  };
}

module.exports = { verifyPayload };
