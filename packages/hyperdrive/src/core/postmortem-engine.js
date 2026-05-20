'use strict';
// HYPERDRIVE — Post-Mortem Engine (stub — implementação completa: ADR-014)
class PostMortemEngine {
  async analyze(task, result, execution) {
    const success = result?.success ?? execution?.status === 'completed';
    return {
      task_id:    task?.id,
      success,
      root_cause: success ? null : 'Análise manual necessária',
      learnings:  [],
      action_items: success ? [] : ['Investigar falha e criar regra de prevenção'],
    };
  }
}
module.exports = { PostMortemEngine };
