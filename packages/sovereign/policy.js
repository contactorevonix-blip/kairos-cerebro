// KAIROS — Sovereign Policy Engine
// Deterministic guardrails. The Sovereign refuses to greenlight any task
// that fails any of these gates. No AI fluff: hard rules, hard answers.

'use strict';

const HARD_REJECT_TERMS = [
  /\b(scrape|harvest)\s+(emails?|phones?|cpfs?)\s+from/i,
  /\bbypass\s+(captcha|2fa|mfa)\b/i,
  /\bclickfarm|click[- ]?fraud\b/i,
  /\bfake\s+(reviews?|testimonials?|ratings?)\b/i,
  /\bdeceptive\s+pricing\b/i,
  /\bdark\s+pattern\b/i,
];

const REQUIRED_KEYWORDS_FOR_PRODUCTION = [
  /test|spec|coverage/i,
  /security|auth|rate.?limit|audit/i,
  /scale|tenant|isolat/i,
];

function evaluateLegality(taskText) {
  const violations = [];
  for (const rx of HARD_REJECT_TERMS) {
    if (rx.test(taskText)) {
      violations.push(rx.source);
    }
  }
  return violations;
}

function evaluateProductionReadiness(taskText) {
  // We require AT LEAST ONE keyword from each band for a SIM verdict on
  // any task tagged as production-bound.
  const matchedBands = REQUIRED_KEYWORDS_FOR_PRODUCTION.filter((rx) => rx.test(taskText));
  return {
    passed: matchedBands.length === REQUIRED_KEYWORDS_FOR_PRODUCTION.length,
    matchedBands: matchedBands.map((rx) => rx.source),
    requiredBands: REQUIRED_KEYWORDS_FOR_PRODUCTION.length,
  };
}

module.exports = {
  evaluateLegality,
  evaluateProductionReadiness,
  HARD_REJECT_TERMS,
  REQUIRED_KEYWORDS_FOR_PRODUCTION,
};
