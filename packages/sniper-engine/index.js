const { verifyPayload } = require('./api');
const { detectRegionalContext } = require('./geo');
const { scoreContentRisk, riskDecision } = require('./core');
const { scoreGuruScam } = require('./guru-scam');
const { scoreReputation, classifyTrustLevel, getTrustRecommendation, TRUST_LEVELS } = require('./reputation');
const { scoreNLPHeuristic } = require('./nlp-heuristic');
const { checkLiveReputation } = require('./live-reputation');
const { inspectCheckout, analyzeUrl } = require('./checkout-inspector');

module.exports = {
  verifyPayload,
  detectRegionalContext,
  scoreContentRisk,
  riskDecision,
  scoreGuruScam,
  scoreReputation,
  classifyTrustLevel,
  getTrustRecommendation,
  TRUST_LEVELS,
  // Deep layer modules
  scoreNLPHeuristic,
  checkLiveReputation,
  inspectCheckout,
  analyzeUrl,
};
