// Context & intent fixtures for auto-contextualization tests

module.exports = {
  intents: {
    simple: 'implement a feature for user authentication',
    complex: 'refactor database schema and migrate data with rollback support',
    bug: 'fix race condition in concurrent writes',
  },

  gapPatterns: {
    schema: { source: 'schema-context', severity: 'high' },
    workflow: { source: 'workflow-context', severity: 'medium' },
    test: { source: 'test-context', severity: 'low' },
  },

  contextSources: {
    projectMd: { type: 'file', path: 'PROJECT.md', available: true },
    registry: { type: 'registry', path: '.synapse/context-registry.json', available: true },
    template: { type: 'template', path: '.aiox-core/development/templates/', available: true },
  },

  validationChecks: [
    { name: 'intent_clarity', result: true },
    { name: 'gap_identified', result: true },
    { name: 'source_available', result: true },
    { name: 'completeness', result: 0.95 },
    { name: 'phase_4_passed', result: true },
    { name: 'no_violations', result: true },
    { name: 'routing_valid', result: true },
    { name: 'dependencies_resolved', result: true },
  ],

  registrySession: {
    session_id: 'session-2026-06-10-test-abc123',
    timestamp: '2026-06-10T12:00:00.000Z',
    intent_type: 'feature',
    completeness: 0.95,
    phase_4_passed: true,
    gaps_detected: ['schema-context'],
    context_sources: {
      registry: ['entity-123'],
      project_md: ['PROJECT.md#section1'],
    },
  },

  handoffData: {
    from_agent: '@sm',
    to_agent: '@dev',
    story_context: {
      story_id: '5.3.4',
      story_path: 'docs/stories/5.3.4.story.md',
      story_status: 'InProgress',
    },
    decisions: [
      'Use node:test native module',
      'Fixtures via context-samples.js',
    ],
    files_modified: [
      'tests/auto-contextualization/phases/phase-1.test.js',
      'tests/auto-contextualization/engine.test.js',
    ],
  },

  performanceBenchmarks: {
    phase1: { target: 100, unit: 'ms' },
    phase2: { target: 500, unit: 'ms' },
    phase3: { target: 500, unit: 'ms' },
    phase4: { target: 100, unit: 'ms' },
    phase5: { target: 100, unit: 'ms' },
    phase6: { target: 100, unit: 'ms' },
    phase7: { target: 100, unit: 'ms' },
    phase8: { target: 100, unit: 'ms' },
    phase9: { target: 100, unit: 'ms' },
    phase10: { target: 100, unit: 'ms' },
  },
};
