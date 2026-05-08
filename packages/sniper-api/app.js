// KAIROS SNIPER — request handlers v2 (DB-backed)

'use strict';

const { verifyPayload } = require('../sniper-engine');
const { authenticate } = require('./auth');
const { consumeUnits } = require('./rate-limit');
const {
  recordVerification,
  updateGlobalMetrics,
} = require('../sniper-db');
const repGraph = require('../reputation-graph');
const { dispatchScamEvent } = require('./events');
const compliance = require('../compliance');
const billing = require('../billing');

function logEvent(event, data = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...data });
  console.log(line);
}

function buildAuditEntry(payload, result, tenantId) {
  // Pseudonymize PII in the audit trail. The engine has already used the
  // plaintext to score; from here on we never persist raw emails, wallets,
  // phone numbers, IDs or card numbers.
  const previewSource = payload.text ? String(payload.text).substring(0, 200) : null;
  const sanitizedPreview = previewSource ? compliance.pseudonymizeText(previewSource) : null;
  return {
    tenantId,
    decision: result.verdict.decision,
    score: result.verdict.score,
    trustLevel: result.trustLevel || null,
    channel: payload.channel || 'unknown',
    sourceUrl: payload.sourceUrl || null,
    textPreview: sanitizedPreview ? sanitizedPreview.text : null,
    redactionCounts: sanitizedPreview ? sanitizedPreview.redactionCounts : null,
    reasonCount: Array.isArray(result.verdict?.reasons) ? result.verdict.reasons.length : 0,
    dnaFingerprint: result.scamDna?.fingerprint || null,
    dnaFamily: result.scamDna?.family?.key || null,
    dnaSeverity: result.scamDna?.severity || null,
    compliance: compliance.buildComplianceEnvelope(),
  };
}

const BATCH_ITEM_TEXT_MAX = 300_000;

function processVerification(tenant, payload) {
  const enrichedPayload = {
    ...payload,
    tenantId: tenant.tenantId,
    networkResolver: ({ text, urls }) =>
      repGraph.queryPreVerdict({ text, urls }),
  };
  const result = verifyPayload(enrichedPayload);
  updateGlobalMetrics(result.verdict.decision);
  const audit = recordVerification(buildAuditEntry(enrichedPayload, result, tenant.tenantId));

  try { billing.meterUsage({ tenantId: tenant.tenantId, units: 1 }); }
  catch (err) { logEvent('billing.meter.error', { tenantId: tenant.tenantId, message: err.message }); }

  try {
    repGraph.contribute({
      text: payload.text || '',
      urls: Array.isArray(payload.urls) ? payload.urls : [],
      decision: result.verdict.decision,
      score: result.verdict.score,
      tenantId: tenant.tenantId,
      dnaFamily: result.scamDna?.family?.key || null,
    });
  } catch (err) {
    logEvent('reputation.contribute.error', { tenantId: tenant.tenantId, message: err.message });
  }

  if (result.verdict.decision !== 'allow') {
    try {
      dispatchScamEvent({
        tenantId: tenant.tenantId,
        verdict: result.verdict,
        scamDna: result.scamDna,
        requestId: audit.requestId,
      });
    } catch (err) {
      logEvent('webhook.dispatch.error', { tenantId: tenant.tenantId, message: err.message });
    }
  }

  logEvent('verify.completed', {
    tenantId: tenant.tenantId,
    decision: result.verdict.decision,
    score: result.verdict.score,
    requestId: audit.requestId,
  });

  return { result, audit };
}

function handleVerifyRequest(headers, payload) {
  const auth = authenticate(headers);
  if (!auth.ok) {
    return { status: auth.status, body: { error: auth.error } };
  }

  const tenant = auth.tenant;
  const limit = consumeUnits(`tenant:${tenant.tenantId}`, tenant.rateLimitPerMinute || 120, 1);
  if (!limit.allowed) {
    return {
      status: 429,
      body: {
        error: 'Rate limit exceeded.',
        limit: limit.limit,
        windowSeconds: 60,
        resetAt: new Date(limit.resetAt).toISOString(),
      },
      headers: {
        'x-ratelimit-limit': String(limit.limit),
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(Math.floor(limit.resetAt / 1000)),
      },
    };
  }

  const { result, audit } = processVerification(tenant, payload);

  return {
    status: 200,
    body: { ...result, audit: { requestId: audit.requestId } },
    headers: {
      'x-ratelimit-limit': String(limit.limit),
      'x-ratelimit-remaining': String(limit.remaining),
      'x-ratelimit-reset': String(Math.floor(limit.resetAt / 1000)),
      'x-request-id': audit.requestId,
    },
  };
}

function validBatchItem(item) {
  if (!item || typeof item !== 'object') return false;
  const hasText = item.text != null && String(item.text).trim().length > 0;
  const hasUrls = Array.isArray(item.urls) && item.urls.some((u) => u && String(u).trim().length > 0);
  return hasText || hasUrls;
}

function handleBatchVerifyRequest(headers, payload) {
  const batchMax = Math.min(100, Math.max(1, Number(process.env.KAIROS_VERIFY_BATCH_MAX || 50)));
  const auth = authenticate(headers);
  if (!auth.ok) {
    return { status: auth.status, body: { error: auth.error } };
  }
  const tenant = auth.tenant;
  const items = payload.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, body: { error: 'Field "items" must be a non-empty array.' } };
  }
  if (items.length > batchMax) {
    return {
      status: 400,
      body: { error: `Batch too large. Max ${batchMax} items per request.`, max: batchMax },
    };
  }
  const invalidIdx = [];
  for (let i = 0; i < items.length; i++) {
    if (!validBatchItem(items[i])) invalidIdx.push(i);
  }
  if (invalidIdx.length > 0) {
    return {
      status: 400,
      body: {
        error: 'Each item needs non-empty "text" and/or at least one URL in "urls".',
        invalidIndices: invalidIdx,
      },
    };
  }

  const rateMax = tenant.rateLimitPerMinute || 120;
  const limit = consumeUnits(`tenant:${tenant.tenantId}`, rateMax, items.length);
  if (!limit.allowed) {
    return {
      status: 429,
      body: {
        error: 'Rate limit exceeded.',
        neededUnits: items.length,
        limit: limit.limit,
        windowSeconds: 60,
        resetAt: new Date(limit.resetAt).toISOString(),
      },
      headers: {
        'x-ratelimit-limit': String(limit.limit),
        'x-ratelimit-remaining': String(limit.remaining),
        'x-ratelimit-reset': String(Math.floor(limit.resetAt / 1000)),
      },
    };
  }

  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const textRaw = item.text != null ? String(item.text) : '';
    const text = textRaw.substring(0, BATCH_ITEM_TEXT_MAX);
    const singlePayload = {
      text,
      urls: Array.isArray(item.urls) ? item.urls : [],
      sourceUrl: item.sourceUrl || null,
      region: item.region || payload.region || { country: 'PT' },
      channel: item.channel || 'batch',
    };
    const { result, audit } = processVerification(tenant, singlePayload);
    results.push({
      ref: item.id != null ? String(item.id) : String(i),
      verdict: result.verdict,
      trustLevel: result.trustLevel,
      scamDna: result.scamDna,
      scoreBreakdown: result.scoreBreakdown,
      dominantThreat: result.verdict.dominantThreat,
      audit: { requestId: audit.requestId },
    });
  }

  logEvent('verify.batch.completed', { tenantId: tenant.tenantId, count: results.length });

  return {
    status: 200,
    body: { count: results.length, results },
    headers: {
      'x-ratelimit-limit': String(limit.limit),
      'x-ratelimit-remaining': String(limit.remaining),
      'x-ratelimit-reset': String(Math.floor(limit.resetAt / 1000)),
    },
  };
}

module.exports = { handleVerifyRequest, handleBatchVerifyRequest, logEvent };
