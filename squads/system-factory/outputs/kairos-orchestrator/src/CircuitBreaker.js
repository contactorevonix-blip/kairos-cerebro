// CircuitBreaker.js — Anti-deadlock.
// Cada operacao corre com timeout. Apos N falhas o circuito ABRE (trip) e
// rejeita imediatamente ate ao reset, evitando loops infinitos e deadlocks.

const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

export class CircuitBreaker {
  constructor({ failureThreshold = 3, resetTimeoutMs = 60000, opTimeoutMs = 30000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.opTimeoutMs = opTimeoutMs;
    this.state = STATE.CLOSED;
    this.failures = 0;
    this.openedAt = 0;
  }

  /** Envolve uma promise com timeout. Garante que nada bloqueia para sempre. */
  static withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout (${ms}ms): ${label}`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  async exec(fn, label = 'op') {
    if (this.state === STATE.OPEN) {
      if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = STATE.HALF_OPEN;
      } else {
        throw new Error(`CircuitBreaker OPEN — ${label} rejeitado (anti-deadlock)`);
      }
    }
    try {
      const result = await CircuitBreaker.withTimeout(
        Promise.resolve().then(fn), this.opTimeoutMs, label
      );
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = STATE.CLOSED;
  }

  onFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = STATE.OPEN;
      this.openedAt = Date.now();
    }
  }

  isOpen() {
    return this.state === STATE.OPEN;
  }
}
