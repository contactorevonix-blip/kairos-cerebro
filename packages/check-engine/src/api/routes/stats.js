'use strict';

const checksStorage = require('../../storage/checks');

function handleFeedback(body) {
  const { check_id, outcome, notes } = body || {};

  const validOutcomes = ['confirmed_fraud', 'false_positive', 'confirmed_legit'];
  if (!check_id)                       return { status: 400, body: { error: 'check_id required' } };
  if (!validOutcomes.includes(outcome)) return { status: 400, body: { error: 'invalid outcome', valid: validOutcomes } };

  checksStorage.updateFeedback(check_id, { outcome, notes });
  return { status: 200, body: { ok: true, check_id, outcome } };
}

function handleStats(url) {
  const periodMatch = url?.match(/[?&]period=(\d+)d/);
  const hours       = periodMatch ? parseInt(periodMatch[1]) * 24 : 168; // default 7d

  const data = checksStorage.stats(hours);
  return {
    status: 200,
    body: {
      period:         `${Math.round(hours / 24)}d`,
      ...data,
      generated_at:   new Date().toISOString(),
    },
  };
}

module.exports = { handleFeedback, handleStats };
