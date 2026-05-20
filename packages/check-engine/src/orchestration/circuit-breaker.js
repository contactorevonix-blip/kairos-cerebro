'use strict';

/**
 * CHECK ENGINE — Circuit Breaker
 * Detecta sources com falha e para de chamá-las temporariamente.
 * Open → Half-Open → Closed (circuito normal).
 */

const HALF_OPEN_WAIT_MS = 30_000; // 30s antes de tentar novamente
const FAIL_THRESHOLD    = 3;       // falhas consecutivas para abrir

class CircuitBreaker {
  constructor() {
    this._state = new Map(); // sourceId → { failures, last_fail, state }
  }

  isOpen(sourceId) {
    const s = this._state.get(sourceId);
    if (!s || s.state === 'closed') return false;

    if (s.state === 'open') {
      // Tentar half-open após wait
      if (Date.now() - s.last_fail > HALF_OPEN_WAIT_MS) {
        s.state = 'half-open';
        return false;
      }
      return true;
    }

    return false; // half-open: deixar passar uma tentativa
  }

  recordSuccess(sourceId) {
    const s = this._state.get(sourceId);
    if (s) {
      s.failures = 0;
      s.state    = 'closed';
    }
  }

  recordFailure(sourceId) {
    const s = this._state.get(sourceId) || { failures: 0, last_fail: 0, state: 'closed' };
    s.failures++;
    s.last_fail = Date.now();

    if (s.failures >= FAIL_THRESHOLD) s.state = 'open';
    this._state.set(sourceId, s);
  }

  status() {
    const out = {};
    for (const [k, v] of this._state) out[k] = v.state;
    return out;
  }
}

module.exports = { CircuitBreaker };
