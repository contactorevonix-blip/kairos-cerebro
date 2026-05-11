'use strict';

/**
 * Graph-aware wrapper around verifyPayload.
 *
 * Flow:
 *   1. queryEntity (pre-score, 30ms timeout, graceful skip)
 *   2. computeBoost from historical data
 *   3. verifyPayload (existing engine — unchanged)
 *   4. Apply boost to composite score
 *   5. recordCheck (fire-and-forget, non-blocking)
 *   6. Return result + graph_intelligence field
 *
 * Backward compat: if customerId is not provided, graph is skipped silently.
 * Existing callers of verifyPayload continue to work unchanged.
 */

const { verifyPayload } = require('../api');
const {
  queryEntity,
  recordCheck,
  computeBoost,
  formatGraphIntelligence,
} = require('./storage');

const QUERY_TIMEOUT_MS = 30;

// Wrap synchronous queryEntity in a timeout-safe promise.
// queryEntity is sync and typically < 5ms; timeout is a filesystem safety net.
function queryWithTimeout(entity, type) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), QUERY_TIMEOUT_MS);
    try {
      const r = queryEntity({ entity, type });
      clearTimeout(t);
      resolve(r);
    } catch {
      clearTimeout(t);
      resolve(null);
    }
  });
}

/**
 * verifyPayloadWithGraph — drop-in replacement for verifyPayload with graph integration.
 *
 * @param {object} payload  — same as verifyPayload, plus:
 *   payload.customerId     — Stripe customer_id (used to record check; HMAC-hashed before storage)
 *   payload.skipGraph      — set true to bypass graph (e.g. in benchmarks)
 */
async function verifyPayloadWithGraph(payload = {}) {
  const { customerId, skipGraph, ...enginePayload } = payload;

  // Identify entity for graph lookup (same logic as api-check.js verifyPayload mapping)
  const entity = enginePayload.text || null;
  const type   = enginePayload._graphType || 'domain'; // caller sets _graphType if needed

  // ── 1. Pre-score graph query ──────────────────────────────────────────────
  let graphData = null;
  let boost = 0;

  if (!skipGraph && entity && customerId) {
    graphData = await queryWithTimeout(entity, type);
    boost = computeBoost(graphData);
  }

  // ── 2. Run engine (synchronous, unchanged) ────────────────────────────────
  const result = verifyPayload(enginePayload);
  const rawScore    = result.verdict.score;    // capture BEFORE boost mutation
  const rawDecision = result.verdict.decision; // capture BEFORE boost mutation

  // ── 3. Apply boost to composite score ─────────────────────────────────────
  if (boost !== 0) {
    const boosted = Math.max(0, Math.min(rawScore + boost, 100));
    result.verdict.score = boosted;
    // Re-evaluate decision with boosted score
    const { riskDecision } = require('../core');
    result.verdict.decision = riskDecision(boosted);
  }

  // ── 4. Attach graph_intelligence to response ──────────────────────────────
  result.graph_intelligence = formatGraphIntelligence(graphData, boost);

  // ── 5. Fire-and-forget: record RAW score in graph (not boosted)
  //    Recording boosted score would create a feedback amplification loop.
  if (!skipGraph && entity && customerId) {
    recordCheck({
      entity,
      type,
      score:      rawScore,    // raw engine score, never boosted
      verdict:    rawDecision, // raw decision before boost
      signals:    result.verdict.reasons || [],
      customerId,
    }).catch(() => {}); // errors must never propagate to caller
  }

  return result;
}

module.exports = { verifyPayloadWithGraph };
