'use strict';

// CHECK ENGINE — In-Memory Rate Limiter (zero deps)
const WINDOW_MS  = Number(process.env.RATE_LIMIT_WINDOW_MS  || 60_000);
const MAX_REQ    = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

const _buckets = new Map(); // key → { count, reset_at }

function rateLimit(key) {
  const now    = Date.now();
  const bucket = _buckets.get(key);

  if (!bucket || now > bucket.reset_at) {
    _buckets.set(key, { count: 1, reset_at: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQ - 1, reset_at: now + WINDOW_MS };
  }

  bucket.count++;

  if (bucket.count > MAX_REQ) {
    return { ok: false, error: 'rate_limit_exceeded', status: 429, reset_at: bucket.reset_at };
  }

  return { ok: true, remaining: MAX_REQ - bucket.count, reset_at: bucket.reset_at };
}

module.exports = { rateLimit };
