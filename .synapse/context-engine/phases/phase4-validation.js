/**
 * Phase 4: VALIDATION — 8-point completeness check
 * Validates context completeness against 8 knowledge sources
 */

class Phase4Validation {
  async execute(context) {
    const checks = [
      this.checkProjectContext(context),
      this.checkStoryContext(context),
      this.checkEpicContext(context),
      this.checkSchemaContext(context),
      this.checkWorkflowContext(context),
      this.checkAgentContext(context),
      this.checkTaskContext(context),
      this.checkRuleContext(context)
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const allPassed = passedCount === 8;

    return {
      passed: allPassed,
      checks,
      passed_count: passedCount,
      total_checks: 8,
      can_proceed: passedCount >= 7, // 7/8 minimum threshold
      validation_timestamp: new Date().toISOString()
    };
  }

  checkProjectContext(context) {
    const passed = !!(context && Object.keys(context).length > 0);
    return {
      name: 'ProjectContext',
      type: 'project_completeness',
      passed,
      severity: passed ? 'info' : 'high'
    };
  }

  checkStoryContext(context) {
    // Check if story context is present
    const passed = !!(context['story-context'] || context['story_context']);
    return {
      name: 'StoryContext',
      type: 'story_scope',
      passed,
      severity: passed ? 'info' : 'medium'
    };
  }

  checkEpicContext(context) {
    const passed = !!(context['epic-context'] || context['epic_context']);
    return {
      name: 'EpicContext',
      type: 'epic_planning',
      passed,
      severity: 'low'
    };
  }

  checkSchemaContext(context) {
    const passed = !!(context['schema-context'] || context['schema_context']);
    return {
      name: 'SchemaContext',
      type: 'data_model',
      passed,
      severity: passed ? 'info' : 'medium'
    };
  }

  checkWorkflowContext(context) {
    const passed = !!(context['workflow-context'] || context['workflow_context']);
    return {
      name: 'WorkflowContext',
      type: 'process_flow',
      passed,
      severity: passed ? 'info' : 'low'
    };
  }

  checkAgentContext(context) {
    const passed = !!(context['agent-context'] || context['agent_context']);
    return {
      name: 'AgentContext',
      type: 'agent_authority',
      passed,
      severity: passed ? 'info' : 'high'
    };
  }

  checkTaskContext(context) {
    const passed = !!(context['task-context'] || context['task_context']);
    return {
      name: 'TaskContext',
      type: 'task_definition',
      passed,
      severity: 'low'
    };
  }

  checkRuleContext(context) {
    const passed = !!(context['rule-context'] || context['rule_context']);
    return {
      name: 'RuleContext',
      type: 'constraint_boundary',
      passed,
      severity: passed ? 'info' : 'high'
    };
  }
}

module.exports = Phase4Validation;
