// KAIROS SNIPER — In-memory sliding-window rate limiter.
// Per-key (authenticated) and per-IP (public) buckets.

'use strict';

const WINDOW_MS = 60_000;
const buckets = new Map();

function _now() { return Date.now(); }

function _bucket(id, max) {
  const now = _now();
  let entry = buckets.get(id);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS, max };
    buckets.set(id, entry);
  }
  entry.max = max;
  return entry;
}

/**
 * Atomically reserve `units` slots in the current window, or reject without
 * consuming any (avoids leaving partial capacity after a failed batch).
 */
function consumeUnits(id, max, units = 1) {
  const n = Math.max(1, Math.min(Math.floor(Number(units)) || 1, max));
  const e = _bucket(id, max);
  if (e.count + n > e.max) {
    return {
      allowed: false,
      remaining: Math.max(0, e.max - e.count),
      resetAt: e.resetAt,
      limit: e.max,
    };
  }
  e.count += n;
  return {
    allowed: true,
    remaining: Math.max(0, e.max - e.count),
    resetAt: e.resetAt,
    limit: e.max,
  };
}

function consume(id, max) {
  return consumeUnits(id, max, 1);
}

function purgeStale() {
  const now = _now();
  for (const [id, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(id);
  }
}

function _resetForTests() {
  buckets.clear();
}

module.exports = { consume, consumeUnits, purgeStale, _resetForTests, WINDOW_MS };
