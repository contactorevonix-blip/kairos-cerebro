// KAIROS SNIPER — API Auth v2 (DB-backed, hashed keys)
// Reads from packages/sniper-db. No plaintext keys in source.

'use strict';

const { findApiKey, getTenant, touchApiKey } = require('../sniper-db');

function readKeyFromHeaders(headers = {}) {
  const candidates = ['x-api-key', 'X-API-KEY', 'X-Api-Key', 'x-api-Key'];
  for (const k of candidates) {
    if (headers[k]) return String(headers[k]).trim();
  }
  return null;
}

function authenticate(headers = {}) {
  const rawKey = readKeyFromHeaders(headers);
  if (!rawKey) {
    return { ok: false, status: 401, error: 'Missing x-api-key header.' };
  }
  const keyRecord = findApiKey(rawKey);
  if (!keyRecord) {
    return { ok: false, status: 403, error: 'Invalid or revoked API key.' };
  }
  const tenant = getTenant(keyRecord.tenantId);
  if (!tenant) {
    return { ok: false, status: 403, error: 'Tenant not found for this key.' };
  }
  // Fire-and-forget last-used touch (cheap; same disk).
  try { touchApiKey(rawKey); } catch { /* swallow */ }
  return {
    ok: true,
    tenant,
    keyHash: keyRecord.keyHash,
  };
}

module.exports = { authenticate, readKeyFromHeaders };
