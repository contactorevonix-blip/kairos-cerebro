'use strict';

/**
 * HYPERDRIVE — Performance Management
 * Rastreia métricas dos agentes e gere promoções/demotions.
 *
 * Tier system: junior → mid → senior → vp → c_suite
 * Promoção: 10 tasks consecutivas com qualidade ≥ 9/10
 * Demotion: success rate < 60% nos últimos 7 dias
 * Bench: success rate < 40% (agente não é allocado a tasks críticas)
 */

const PROMOTION_THRESHOLD   = { consecutive_quality: 10, min_quality: 9.0 };
const DEMOTION_THRESHOLD    = { success_rate: 0.60, window_tasks: 20 };
const BENCH_THRESHOLD       = { success_rate: 0.40 };
const TIER_LADDER = ['junior', 'mid', 'senior', 'vp', 'c_suite'];

class PerformanceManagement {
  constructor(ledger) {
    this.ledger   = ledger;
    this._scores  = new Map(); // agentId → { tier, consecutive_quality, history }
  }

  /**
   * Avalia performance de um agente e retorna tier + métricas.
   */
  reviewAgent(agent, _ledgerOverride) {
    const history = this.getHistory(agent.id);
    const rate    = this.ledger.agentSuccessRate(agent.id) ?? 0.75;

    const metrics = {
      success_rate:     Math.round(rate * 100) / 100,
      tasks_30d:        history.length,
      avg_quality:      this._avgQuality(history),
      consecutive_high: this._consecutiveHigh(history),
    };

    let tier   = agent.tier || 'mid';
    let action = null;

    if (metrics.success_rate < BENCH_THRESHOLD.success_rate) {
      action = 'bench';
    } else if (metrics.success_rate < DEMOTION_THRESHOLD.success_rate) {
      const tidx = TIER_LADDER.indexOf(tier);
      if (tidx > 0) { tier = TIER_LADDER[tidx - 1]; action = 'demotion'; }
    } else if (metrics.consecutive_high >= PROMOTION_THRESHOLD.consecutive_quality) {
      const tidx = TIER_LADDER.indexOf(tier);
      if (tidx < TIER_LADDER.length - 1) { tier = TIER_LADDER[tidx + 1]; action = 'promotion'; }
    }

    return { agentId: agent.id, tier, action, metrics };
  }

  /**
   * Registra resultado de uma task para um agente.
   */
  recordTaskResult(agentId, qualityScore, success) {
    const hist = this._getOrCreate(agentId);
    hist.push({ qualityScore, success, ts: Date.now() });
  }

  /**
   * Retorna se agente está benched (não allocar a tasks críticas).
   */
  isBenched(agentId) {
    const rate = this.ledger.agentSuccessRate(agentId);
    return rate !== null && rate < BENCH_THRESHOLD.success_rate;
  }

  getHistory(agentId) {
    return this._scores.get(agentId) || [];
  }

  _getOrCreate(agentId) {
    if (!this._scores.has(agentId)) this._scores.set(agentId, []);
    return this._scores.get(agentId);
  }

  _avgQuality(history) {
    if (!history.length) return null;
    const sum = history.reduce((s, h) => s + (h.qualityScore || 0), 0);
    return Math.round((sum / history.length) * 10) / 10;
  }

  _consecutiveHigh(history) {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].qualityScore >= PROMOTION_THRESHOLD.min_quality) count++;
      else break;
    }
    return count;
  }
}

module.exports = { PerformanceManagement };
