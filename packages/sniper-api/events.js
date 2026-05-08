// KAIROS API — Event dispatch
// Emits webhook events to per-tenant endpoints stored in the DB.
// The webhook URL + secret are tenant-level fields; if missing, dispatch is a
// silent no-op (test-friendly default).

'use strict';

const { getTenant } = require('../sniper-db');
const { enqueue } = require('../webhook-outbox');

function dispatchScamEvent({ tenantId, verdict, scamDna, requestId }) {
  const tenant = getTenant(tenantId);
  if (!tenant || !tenant.webhookUrl || !tenant.webhookSecret) {
    return { dispatched: false, reason: 'tenant-has-no-webhook' };
  }
  const event = verdict.decision === 'block' ? 'verification.blocked' : 'verification.review';
  const enq = enqueue({
    url: tenant.webhookUrl,
    secret: tenant.webhookSecret,
    event,
    payload: {
      requestId,
      tenantId,
      decision: verdict.decision,
      score: verdict.score,
      dnaFingerprint: scamDna?.fingerprint || null,
      dnaFamily: scamDna?.family?.key || null,
      severity: scamDna?.severity || null,
    },
  });
  return { dispatched: true, id: enq.id };
}

module.exports = { dispatchScamEvent };
