'use strict';

/**
 * HYPERDRIVE — Ledger Loader
 * Wraps o ledger existente com métodos de query para o sistema cognitivo.
 */

const path   = require('node:path');
const { append, EVENT_TYPES } = require('../memory/ledger');

const ROOT        = path.resolve(__dirname, '..', '..', '..', '..');
const LEDGER_PATH = path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');

function loadLedger() {
  const fs = require('node:fs');
  let events = [];

  try {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    if (raw) {
      events = raw.split('\n')
        .filter(Boolean)
        .map(l => { try { return JSON.parse(l); } catch { return null; } })
        .filter(Boolean);
    }
  } catch { /* ledger vazio — normal na primeira run */ }

  return {
    events,
    length: events.length,

    append(actor, type, payload) {
      const event = append(actor, type, payload);
      this.events.push(event);
      return event;
    },

    filter(predicate) {
      return this.events.filter(predicate);
    },

    // Tasks completadas por agente nos últimos N ms
    recentTasksByAgent(agentId, windowMs = 24 * 60 * 60 * 1000) {
      const since = Date.now() - windowMs;
      return this.events.filter(e =>
        (e.actor === agentId || e.payload?.agent === agentId) &&
        e.type === EVENT_TYPES.TaskCompleted &&
        new Date(e.timestamp).getTime() > since
      );
    },

    // Success rate de um agente (baseado em TaskCompleted vs TaskFailed)
    agentSuccessRate(agentId, windowMs = 7 * 24 * 60 * 60 * 1000) {
      const since = Date.now() - windowMs;
      const tasks = this.events.filter(e =>
        (e.actor === agentId || e.payload?.agent === agentId) &&
        [EVENT_TYPES.TaskCompleted, 'TaskFailed'].includes(e.type) &&
        new Date(e.timestamp).getTime() > since
      );
      if (!tasks.length) return null;
      const successes = tasks.filter(e => e.type === EVENT_TYPES.TaskCompleted).length;
      return successes / tasks.length;
    },

    // Custo total desta sessão
    sessionCostUsd() {
      const sessionStart = Date.now() - 8 * 60 * 60 * 1000; // ~8h session
      return this.events
        .filter(e => new Date(e.timestamp).getTime() > sessionStart && e.payload?.costUsd)
        .reduce((sum, e) => sum + (e.payload.costUsd || 0), 0);
    },
  };
}

module.exports = { loadLedger };
