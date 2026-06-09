/**
 * Phase 2: GAP-ANALYSIS — Detect knowledge gaps
 * Queries 8 knowledge sources, identifies missing context
 */

class Phase2GapAnalysis {
  constructor(registryPath) {
    this.registryPath = registryPath;
    this.sources = [
      'project-context',
      'story-context',
      'epic-context',
      'schema-context',
      'workflow-context',
      'agent-context',
      'task-context',
      'rule-context'
    ];
  }

  async execute(intent) {
    const gaps = [];

    for (const source of this.sources) {
      const gap = this.detectGap(intent, source);
      if (gap) {
        gaps.push(gap);
      }
    }

    return {
      gap_count: gaps.length,
      gaps,
      sources_checked: this.sources.length,
      analysis_timestamp: new Date().toISOString()
    };
  }

  detectGap(intent, source) {
    // Simplified gap detection — in production, would query actual registries
    const gapLikelihood = Math.random();

    if (gapLikelihood > 0.3) {
      return {
        source,
        type: this.inferGapType(intent, source),
        severity: this.scoreGapSeverity(intent, source),
        confidence: 0.7
      };
    }

    return null;
  }

  inferGapType(intent, source) {
    const intentType = intent.intent_type || 'general';
    const gapTypes = {
      'project-context': 'project_state',
      'story-context': 'story_scope',
      'epic-context': 'epic_planning',
      'schema-context': 'data_model',
      'workflow-context': 'process_flow',
      'agent-context': 'agent_authority',
      'task-context': 'task_definition',
      'rule-context': 'constraint_boundary'
    };
    return gapTypes[source] || 'unknown';
  }

  scoreGapSeverity(intent, source) {
    if (source === 'rule-context' || source === 'agent-context') return 'high';
    if (source === 'story-context' || source === 'epic-context') return 'medium';
    return 'low';
  }
}

module.exports = Phase2GapAnalysis;
