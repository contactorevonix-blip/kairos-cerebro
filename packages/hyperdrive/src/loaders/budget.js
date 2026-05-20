'use strict';

/**
 * HYPERDRIVE — Budget Loader
 * Rastreia gastos com API Anthropic: por task, sessão e mês.
 */

function loadBudget(monthlyLimitUsd = 500) {
  const allocations = [];
  let sessionSpend  = 0;

  return {
    monthly:   monthlyLimitUsd,
    remaining: monthlyLimitUsd, // approximação — sem persistência ainda
    session:   0,
    allocations,

    allocate({ allocated, tracking_id }) {
      allocations.push({ allocated, tracking_id, allocated_at: Date.now() });
    },

    track(costUsd) {
      sessionSpend   += costUsd;
      this.session    = sessionSpend;
      this.remaining  = Math.max(0, monthlyLimitUsd - sessionSpend);
    },

    isExceeded(threshold = monthlyLimitUsd) {
      return sessionSpend >= threshold;
    },

    summary() {
      return {
        monthly_limit:  monthlyLimitUsd,
        session_spend:  Math.round(sessionSpend * 10000) / 10000,
        remaining:      Math.round(this.remaining * 10000) / 10000,
        allocations:    allocations.length,
      };
    },
  };
}

module.exports = { loadBudget };
