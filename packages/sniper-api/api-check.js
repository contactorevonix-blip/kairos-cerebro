'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { verifyPayloadWithGraph } = require('../sniper-engine');
const { scoreDomainName } = require('../sniper-engine/domain-heuristic');
const { readKeys } = require('./stripe-webhook');

const DB_DIR = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const CHECK_AUDIT = path.join(DB_DIR, 'check-audit.jsonl');

function nowIso() { return new Date().toISOString(); }

function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}

// ─── auth ─────────────────────────────────────────────────────────────────────

function extractBearer(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const m = authHeader.match(/^Bearer\s+(kc_[a-z]+_[0-9a-f]{48})$/i);
  return m ? m[1] : null;
}

function lookupKey(rawKey) {
  const hash = hashKey(rawKey);
  return readKeys().find((k) => k.api_key_hash === hash) || null;
}

// ─── quota ────────────────────────────────────────────────────────────────────

function firstOfNextMonth() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString();
}

function firstOfCurrentMonth() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function countUsageThisMonth(apiKeyHash) {
  try {
    if (!fs.existsSync(CHECK_AUDIT)) return 0;
    const cutoff = firstOfCurrentMonth();
    const lines = fs.readFileSync(CHECK_AUDIT, 'utf8').split('\n').filter(Boolean);
    let count = 0;
    for (const line of lines) {
      try {
        const r = JSON.parse(line);
        if (r.api_key_hash === apiKeyHash && r.timestamp >= cutoff) count++;
      } catch { /* skip malformed */ }
    }
    return count;
  } catch { return 0; }
}

// ─── audit ────────────────────────────────────────────────────────────────────

function auditId() {
  return crypto.randomBytes(8).toString('hex');
}

function appendCheckAudit(record) {
  ensureDir();
  fs.appendFileSync(CHECK_AUDIT, JSON.stringify(record) + '\n', 'utf8');
}

// ─── input normalisation ──────────────────────────────────────────────────────

function buildEnginePayload(body) {
  const domain = body.domain ? String(body.domain).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;
  const iban = body.iban ? String(body.iban).trim() : null;
  const email = body.email ? String(body.email).trim() : null;

  if (!domain && !phone && !iban && !email) return null;

  // Determine primary type and text for the engine
  let type, text, urls;
  if (domain) {
    type = 'domain';
    text = domain;
    urls = [`https://${domain.replace(/^https?:\/\//, '')}`];
  } else if (email) {
    type = 'email';
    text = email;
    urls = [];
  } else if (phone) {
    type = 'phone';
    text = phone;
    urls = [];
  } else {
    type = 'iban';
    text = iban;
    urls = [];
  }

  return { type, text, urls, query: domain || email || phone || iban };
}

// ─── main handler ─────────────────────────────────────────────────────────────

async function handleApiCheck(headers, body) {
  // 1. Extract Bearer token
  const rawKey = extractBearer(headers['authorization'] || headers['Authorization'] || '');
  if (!rawKey) {
    return { status: 401, body: { error: 'Invalid API key' } };
  }

  // 2. Lookup in api-keys.jsonl
  const keyRecord = lookupKey(rawKey);
  if (!keyRecord || keyRecord.status !== 'active') {
    return { status: 401, body: { error: 'Invalid API key' } };
  }

  // 3. Quota check
  const usage = countUsageThisMonth(keyRecord.api_key_hash);
  if (usage >= keyRecord.quota_per_month) {
    return {
      status: 429,
      body: {
        error: `Monthly quota exceeded. Resets on ${firstOfNextMonth().split('T')[0]}`,
        quota_per_month: keyRecord.quota_per_month,
        used: usage,
        reset_at: firstOfNextMonth(),
      },
    };
  }

  // 4. Validate input
  const engineInput = buildEnginePayload(body);
  if (!engineInput) {
    return {
      status: 400,
      body: { error: 'Provide at least one of: domain, phone, iban, email' },
    };
  }

  // 5. Score with graph-aware engine
  const ref = auditId();

  // Layer 0: Domain-specific heuristic (runs before content engine for domain checks)
  let domainBoost = 0;
  let domainReasons = [];
  if (engineInput.type === 'domain') {
    const domainResult = scoreDomainName(engineInput.text);
    domainBoost   = domainResult.score;
    domainReasons = domainResult.reasons;
  }

  let result;
  try {
    result = await verifyPayloadWithGraph({
      text: engineInput.text,
      urls: engineInput.urls,
      channel: engineInput.type,
      region: body.region || { country: 'EU' },
      customerId: keyRecord.customer_id || null,
      _graphType: engineInput.type,
    });
  } catch (err) {
    appendCheckAudit({
      timestamp: nowIso(),
      api_key_hash: keyRecord.api_key_hash,
      tier: keyRecord.tier,
      type: engineInput.type,
      success: false,
      error: err.message,
      ref,
    });
    return { status: 500, body: { error: 'An error occurred.', ref } };
  }

  // 6. Append audit (hash only, never raw key or query plaintext)
  appendCheckAudit({
    timestamp: nowIso(),
    api_key_hash: keyRecord.api_key_hash,
    tier: keyRecord.tier,
    type: engineInput.type,
    decision: result.verdict.decision,
    score: result.verdict.score,
    success: true,
    ref,
  });

  // 7. Merge domain-heuristic score into final result
  let finalScore = result.verdict.score;
  let finalSignals = result.verdict.reasons || [];
  if (domainBoost > 0) {
    // Weighted merge: take the max, biased toward the higher signal
    finalScore = Math.min(100, Math.round(Math.max(finalScore, domainBoost) * 0.6 + Math.min(finalScore, domainBoost) * 0.4));
    finalSignals = [...domainReasons, ...finalSignals];
  }

  // Re-apply decision thresholds after merge
  const finalVerdict = finalScore >= 60 ? 'BLOCK' : finalScore >= 30 ? 'REVIEW' : 'ALLOW';

  // 8. Response
  return {
    status: 200,
    body: {
      score: finalScore,
      verdict: finalVerdict,
      signals: finalSignals,
      dominant_threat: result.verdict.dominantThreat || null,
      type: engineInput.type,
      query: engineInput.query,
      graph_intelligence: result.graph_intelligence || null,
      timestamp: nowIso(),
      ref,
    },
  };
}

module.exports = { handleApiCheck };
