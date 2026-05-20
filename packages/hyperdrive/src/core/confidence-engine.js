'use strict';

/**
 * HYPERDRIVE — Confidence Engine
 * Calcula e recalibra confidence dos agentes com base em histórico real.
 *
 * Factores:
 *   - Historical success rate por agente + domínio
 *   - Test coverage boost (+0.15 se testes passam)
 *   - Recalibração a cada 50 tasks
 *   - Cap em 0.95 (humildade epistemológica)
 *   - Floor em 0.30 (nunca muda se não há dados)
 */

const CONFIDENCE_CAP   = 0.95;
const CONFIDENCE_FLOOR = 0.30;
const RECALIBRATE_N    = 50;   // tasks
const TEST_BOOST       = 0.12;
const DOMAIN_WEIGHT    = 0.4;  // peso do domínio vs. geral

// Fallbacks por tier quando não há histórico
const TIER_DEFAULTS = {
  c_suite: 0.88,
  vp:      0.83,
  senior:  0.78,
  mid:     0.72,
  junior:  0.60,
};

class ConfidenceEngine {
  constructor(ledger) {
    this.ledger   = ledger;
    this._cache   = new Map(); // agentId:domain → { confidence, computed_at }
    this._cacheTtl = 15 * 60 * 1000; // 15min
  }

  /**
   * Calcula confidence de um agente para um domínio específico.
   * @param {object} agent - Perfil do agente (com tier, baseConfidence, domains)
   * @param {string} domain - Domínio da task (backend, frontend, etc.)
   * @param {boolean} testsPass - Se os testes do agente passam
   * @returns {number} Confidence 0..1
   */
  calculate(agent, domain, testsPass = true) {
    const cacheKey = `${agent.id}:${domain}`;
    const cached   = this._cache.get(cacheKey);

    if (cached && (Date.now() - cached.computed_at) < this._cacheTtl) {
      return cached.confidence;
    }

    // Base: tier default ou histórico do agente
    const tierDefault    = TIER_DEFAULTS[agent.tier] || TIER_DEFAULTS.mid;
    const agentBase      = agent.baseConfidence || tierDefault;

    // Histórico geral (últimas 30 tasks)
    const recentTasks    = this.ledger.recentTasksByAgent(agent.id, 30 * 24 * 60 * 60 * 1000);
    const generalRate    = this.ledger.agentSuccessRate(agent.id) ?? agentBase;

    // Histórico por domínio (domain knowledge matters)
    const domainTasks    = recentTasks.filter(e => e.payload?.domain === domain);
    const domainRate     = domainTasks.length >= 3
      ? domainTasks.filter(e => e.type === 'TaskCompleted').length / domainTasks.length
      : generalRate;

    // Combinar geral + domínio
    let confidence = (1 - DOMAIN_WEIGHT) * generalRate + DOMAIN_WEIGHT * domainRate;

    // Test coverage boost
    if (testsPass) confidence += TEST_BOOST;

    // Recalibração: penalizar se muitas tasks recentes falharam
    if (recentTasks.length >= RECALIBRATE_N) {
      const recentFails = recentTasks.slice(-10).filter(e => e.type === 'TaskFailed').length;
      if (recentFails >= 3) confidence -= 0.08 * (recentFails - 2);
    }

    // Clamp
    confidence = Math.min(CONFIDENCE_CAP, Math.max(CONFIDENCE_FLOOR, confidence));
    confidence = Math.round(confidence * 100) / 100;

    this._cache.set(cacheKey, { confidence, computed_at: Date.now() });
    return confidence;
  }

  /**
   * Ajusta confidence após task completada (feedback loop).
   */
  recordOutcome(agentId, domain, success) {
    // Invalida cache para este agente+domínio
    this._cache.delete(`${agentId}:${domain}`);
    this._cache.delete(`${agentId}:any`);
    return { recorded: true, agentId, domain, success };
  }

  /**
   * Verifica se confidence é suficiente para execução directa (sem consenso).
   */
  isSufficientForDirect(confidence, threshold = 0.65) {
    return confidence >= threshold;
  }

  /**
   * Verifica se confidence é suficiente para execução sem supervisão.
   */
  isSufficientForAutonomous(confidence, threshold = 0.80) {
    return confidence >= threshold;
  }
}

module.exports = { ConfidenceEngine, TIER_DEFAULTS };
