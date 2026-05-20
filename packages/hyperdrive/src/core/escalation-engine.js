'use strict';
// HYPERDRIVE — Escalation Engine (stub — implementação completa: ADR-014)
class EscalationEngine {
  constructor(agents) { this.agents = agents; this.events = []; }
  escalate(reason, context) {
    this.events.push({ reason, context, ts: Date.now() });
    console.log(`  🚨 ESCALATION: ${reason}`);
    return { escalated: true, reason, timestamp: Date.now() };
  }
  shouldEscalate(monitor) {
    if (!monitor) return false;
    const stuck = Date.now() - (monitor.started_at || 0) > 10 * 60 * 1000; // >10min
    return stuck;
  }
}
module.exports = { EscalationEngine };
