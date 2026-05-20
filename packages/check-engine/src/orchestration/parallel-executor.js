'use strict';

/**
 * CHECK ENGINE — Parallel Executor
 * Corre sources em paralelo com timeout individual e circuit breaker.
 * Promise.allSettled garante que uma source em falha não derruba o check.
 */

const { CircuitBreaker } = require('./circuit-breaker');
const { Cache }          = require('./cache');

const SOURCE_TIMEOUT_MS = 4000; // 4s por source (suficiente para DNS + HTTPS)

const _breaker = new CircuitBreaker();
const _cache   = new Cache();

/**
 * @param {Array<{id, fn, cacheKey, cacheTtl, input}>} sources
 * @returns {Promise<{results, meta}>}
 */
async function runSources(sources) {
  const start    = Date.now();
  const outcomes = {};

  const promises = sources.map(async ({ id, fn, cacheKey, cacheTtl, input }) => {
    // Circuit breaker open?
    if (_breaker.isOpen(id)) {
      outcomes[id] = { skipped: true, reason: 'circuit_open' };
      return;
    }

    // Cache hit?
    if (cacheKey) {
      const cached = _cache.get(cacheKey);
      if (cached) {
        outcomes[id] = { ...cached, cached: true };
        return;
      }
    }

    // Execute com timeout
    let result;
    try {
      result = await Promise.race([
        fn(input),
        new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout:${id}`)), SOURCE_TIMEOUT_MS)),
      ]);

      _breaker.recordSuccess(id);

      if (cacheKey && cacheTtl) {
        _cache.set(cacheKey, result, cacheTtl);
      }

      outcomes[id] = result;
    } catch (err) {
      _breaker.recordFailure(id);
      outcomes[id] = { error: err.message, failed: true };
    }
  });

  await Promise.allSettled(promises);

  const succeeded = Object.values(outcomes).filter(r => !r?.failed && !r?.skipped).length;
  const failed    = Object.values(outcomes).filter(r => r?.failed).length;
  const skipped   = Object.values(outcomes).filter(r => r?.skipped).length;

  return {
    results: outcomes,
    meta: {
      sources_total:     sources.length,
      sources_succeeded: succeeded,
      sources_failed:    failed,
      sources_skipped:   skipped,
      elapsed_ms:        Date.now() - start,
      circuit_status:    _breaker.status(),
    },
  };
}

module.exports = { runSources, _cache, _breaker };
