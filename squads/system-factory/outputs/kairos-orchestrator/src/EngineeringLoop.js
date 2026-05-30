// EngineeringLoop.js — Auto-Looping de Engenharia (>=10 micro-loops) + Self-Healing.
// Cada tarefa passa por no minimo 10 iteracoes. Se um loop falha, um auditor
// intercepta -> diagnostica -> aplica correccao antes de continuar.
// Para mais cedo se o output estabilizar (anti-custo descontrolado).

import { CircuitBreaker } from './CircuitBreaker.js';

export class EngineeringLoop {
  constructor(cerebro, config) {
    this.cerebro = cerebro;
    this.cfg = config.loop;
    this.breaker = new CircuitBreaker({
      failureThreshold: config.circuitBreaker.failureThreshold,
      resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
      opTimeoutMs: config.loop.iterationTimeoutMs,
    });
  }

  /**
   * @param taskFn   async (iteration, prevOutput) => output    — o trabalho real
   * @param auditFn  async (output) => ({ ok, issues })          — validacao cruzada
   * @param healFn   async (output, issues) => correctedOutput   — auto-correccao
   */
  async run(label, taskFn, auditFn, healFn) {
    let output = null;
    let stableFor = 0;
    let lastSignature = null;

    for (let i = 1; i <= this.cfg.maxIterations; i++) {
      try {
        output = await this.breaker.exec(() => taskFn(i, output), `${label}#${i}`);
      } catch (err) {
        this.cerebro.log('error', `Loop ${label} iter ${i} falhou: ${err.message}`, { iteration: i });
        if (this.breaker.isOpen()) {
          this.cerebro.log('warn', `CircuitBreaker abriu em ${label} — interrompo loop`);
          break;
        }
        continue;
      }

      // Validacao cruzada (auditor).
      const audit = await auditFn(output);
      if (!audit.ok) {
        this.cerebro.log('heal', `Auditor reprovou ${label} iter ${i}: ${audit.issues.join('; ')}`);
        const corrected = await healFn(output, audit.issues);
        this.cerebro.recordHeal(audit.issues, 'auto-corrigido pelo sub-squad de auditoria', i);
        output = corrected;
      }

      // Deteccao de estabilidade — para nao queimar loops a toa.
      const signature = JSON.stringify(output);
      stableFor = signature === lastSignature ? stableFor + 1 : 0;
      lastSignature = signature;

      const reachedMin = i >= this.cfg.minIterations;
      const stable = stableFor >= this.cfg.stopWhenStableFor;
      if (reachedMin && stable && audit.ok) {
        this.cerebro.log('info', `Loop ${label} convergiu na iter ${i} (estavel ${stableFor}x)`);
        break;
      }
    }
    return output;
  }
}
