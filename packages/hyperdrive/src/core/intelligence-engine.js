'use strict';
// HYPERDRIVE — Intelligence Engine (stub — implementação completa: ADR-014)
class IntelligenceEngine {
  constructor(ledger, kg) { this.ledger = ledger; this.kg = kg; }
  detectPatterns(task) {
    const similar = this.ledger.filter(e =>
      e.type === 'TaskCompleted' &&
      (e.payload?.domain === task.domain) &&
      Date.now() - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    return { similar_count: similar.length, shortcut_available: similar.length >= 3 };
  }
  shouldUseConsensus(task, confidence) {
    return confidence < 0.65 || (task.description || '').toLowerCase().includes('crítico');
  }
}
module.exports = { IntelligenceEngine };
