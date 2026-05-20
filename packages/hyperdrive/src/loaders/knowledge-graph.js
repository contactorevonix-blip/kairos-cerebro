'use strict';

/**
 * HYPERDRIVE — Knowledge Graph Loader
 * Wraps o knowledge-graph existente com métodos cognitivos.
 */

const {
  markMilestoneStep,
  progressTowards,
} = require('../memory/knowledge-graph');

function loadKnowledgeGraph() {
  const reflections = [];
  const phaseHistory = [];

  return {
    markMilestoneStep,
    progressTowards,
    reflections,
    phaseHistory,

    recordReflection({ agent, task_id, reflection, timestamp }) {
      reflections.push({ agent, task_id, reflection, timestamp });
    },

    recordPhaseCompletion(phase, result) {
      phaseHistory.push({
        phase_id:    phase.id,
        phase_name:  phase.name,
        owner:       phase.owner,
        duration_ms: result.duration,
        quality:     result.quality_score,
        timestamp:   Date.now(),
      });

      // Marcar milestone se relevante
      if (phase.milestone_step) {
        markMilestoneStep(phase.milestone_step);
      }
    },

    // Tarefas similares bem-sucedidas nos últimos N dias
    similarSuccessfulTasks(domain, windowDays = 7) {
      const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
      return phaseHistory.filter(p =>
        p.timestamp > since &&
        p.quality >= 8
      );
    },

    getAgentReflections(agentId) {
      return reflections.filter(r => r.agent === agentId);
    },
  };
}

module.exports = { loadKnowledgeGraph };
