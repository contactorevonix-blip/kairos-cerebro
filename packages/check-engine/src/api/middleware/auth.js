'use strict';

// CHECK ENGINE — API Key Authentication
// Keys em env: CHECK_ENGINE_API_KEYS=kc_live_key1,kc_live_key2

function getValidKeys() {
  const raw = process.env.CHECK_ENGINE_API_KEYS || '';
  return new Set(raw.split(',').map(k => k.trim()).filter(Boolean));
}

function authMiddleware(req) {
  const keys = getValidKeys();
  if (keys.size === 0) return { ok: true, key: 'dev', mode: 'open' }; // dev sem keys

  const header = req.headers['authorization'] || req.headers['x-api-key'] || '';
  const key    = header.replace(/^Bearer\s+/i, '').trim();

  if (!key)         return { ok: false, error: 'missing_api_key', status: 401 };
  if (!keys.has(key)) return { ok: false, error: 'invalid_api_key', status: 403 };

  return { ok: true, key, mode: key.includes('_test_') ? 'test' : 'live' };
}

module.exports = { authMiddleware };
