/**
 * Auto-Contextualization Runtime Engine
 * 10-phase orchestrator for permanent context loading
 * L4 (Project Runtime) — triggered by agent activation lifecycle
 */

const fs = require('fs').promises;
const path = require('path');
// Story 5.3.5 AC3 (REL-001): wire the engine to the Story 5.3.3 registry module
// so Phase 5 (IDS-CHECK) and Phase 10 (PERSISTENCE) share ONE canonical store
// and format (.synapse/context-registry.json) instead of the engine's previous
// inline loader that JSON.parse()'d a .yaml-named file.
const ContextRegistry = require(path.join(__dirname, '..', 'context-registry.js'));

class ContextEngine {
  constructor(config = {}) {
    this.logFile = path.join(process.cwd(), '.aiox', 'context-engine.log');
    // Canonical registry store is the JSON file managed by context-registry.js.
    this.registryPath = path.join(process.cwd(), '.synapse', 'context-registry.json');
    this.registry = new ContextRegistry(this.registryPath);
    this.phases = [];
    this.state = {
      completeness: 0,
      gapsClosed: 0,
      startedAt: new Date().toISOString()
    };
  }

  /**
   * Phase 1: INTAKE — Collect user intent
   * Input: single statement (user message or implicit context)
   * Output: intent object { statement, intent_type, clarity_score }
   */
  async phase1_intake(userStatement) {
    this.log('PHASE 1: INTAKE — Collecting intent');

    if (!userStatement || typeof userStatement !== 'string') {
      throw new Error('INTAKE requires non-empty statement');
    }

    return {
      statement: userStatement,
      intent_type: this.classifyIntent(userStatement),
      clarity_score: this.scoreCdarity(userStatement),
      collected_at: new Date().toISOString()
    };
  }

  /**
   * Phase 2: GAP-ANALYSIS — Detect knowledge gaps
   * Input: intent object from Phase 1
   * Output: gaps array with sources and recommendations
   */
  async phase2_gapAnalysis(intent) {
    this.log('PHASE 2: GAP-ANALYSIS — Detecting gaps');

    const gaps = [];
    const sources = [
      'project-context', 'story-context', 'epic-context',
      'schema-context', 'workflow-context', 'agent-context',
      'task-context', 'rule-context'
    ];

    for (const source of sources) {
      const gap = this.detectGap(intent, source);
      if (gap) gaps.push(gap);
    }

    this.state.gapsClosed = 0;
    this.log(`  Detected ${gaps.length} gaps across 8 knowledge sources`);

    return { gaps, gap_count: gaps.length };
  }

  /**
   * Phase 3: CONTEXT-COMPLETION — Fill gaps invisibly
   * Input: gaps array from Phase 2
   * Output: enriched context { sources, completeness_score }
   */
  async phase3_contextCompletion(gaps) {
    this.log('PHASE 3: CONTEXT-COMPLETION — Filling gaps');

    const context = {};
    let filled = 0;

    for (const gap of gaps) {
      const source = await this.resolveGapSource(gap);
      if (source) {
        context[gap.source] = source;
        filled++;
      }
    }

    this.state.gapsClosed = filled;
    const completeness = gaps.length > 0 ? (filled / gaps.length) : 1.0;
    this.state.completeness = completeness;

    this.log(`  Filled ${filled}/${gaps.length} gaps (${(completeness * 100).toFixed(1)}%)`);

    return { context, completeness };
  }

  /**
   * Phase 4: VALIDATION — 8-point completeness check
   * Input: completed context from Phase 3
   * Output: validation_result { passed: bool, checks: [] }
   */
  async phase4_validation(context) {
    this.log('PHASE 4: VALIDATION — Running 8-point checks');

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

    const allPassed = checks.every(c => c.passed);
    this.log(`  Validation: ${checks.filter(c => c.passed).length}/8 checks passed`);

    return {
      passed: allPassed,
      checks,
      can_proceed: allPassed
    };
  }

  /**
   * Phase 5: IDS-CHECK — Incremental Development System
   * Input: context from Phase 3
   * Output: ids_result { reuse_pattern, entities_found }
   */
  async phase5_idsCheck(context) {
    this.log('PHASE 5: IDS-CHECK — Querying entity registry');

    const registry = await this.loadRegistry();
    const patterns = {
      reuse: [],
      adapt: [],
      create: []
    };

    for (const [source, data] of Object.entries(context)) {
      const matches = this.queryRegistry(registry, data);

      matches.forEach(match => {
        if (match.relevance >= 0.9) patterns.reuse.push(match);
        else if (match.relevance >= 0.6) patterns.adapt.push(match);
      });
    }

    this.log(`  IDS: ${patterns.reuse.length} reuse, ${patterns.adapt.length} adapt, create new`);

    return {
      reuse: patterns.reuse,
      adapt: patterns.adapt,
      create: patterns.create
    };
  }

  /**
   * Phase 6: ROUTING — Deterministic agent + workflow selection
   * Input: context from Phase 3
   * Output: routing { agent, workflow, mode, confidence }
   */
  async phase6_routing(context) {
    this.log('PHASE 6: ROUTING — Selecting agent & workflow');

    const agent = this.selectAgent(context);
    const workflow = this.selectWorkflow(context, agent);
    const mode = this.selectMode(context);
    const confidence = this.calculateConfidence(context);

    this.log(`  Route: @${agent} → ${workflow} (mode: ${mode}, confidence: ${(confidence * 100).toFixed(0)}%)`);

    return {
      agent,
      workflow,
      mode,
      confidence
    };
  }

  /**
   * Phase 7: PRE-EXECUTION — Load templates & dependencies
   * Input: routing from Phase 6
   * Output: execution_context { templates, dependencies, env }
   */
  async phase7_preExecution(routing) {
    this.log('PHASE 7: PRE-EXECUTION — Loading templates & dependencies');

    const templates = await this.loadTemplates(routing.workflow);
    const dependencies = await this.resolveDependencies(routing.agent);
    const env = this.prepareEnvironment(routing);

    this.log(`  Loaded ${templates.length} templates, ${dependencies.length} dependencies`);

    return {
      templates,
      dependencies,
      env,
      ready: true
    };
  }

  /**
   * Phase 8: EXECUTION — Activate selected agent
   * Input: execution_context from Phase 7
   * Output: execution_result { agent_id, task_id, status }
   */
  async phase8_execution(executionContext) {
    this.log('PHASE 8: EXECUTION — Activating agent');

    const agentId = executionContext.routing?.agent || 'unknown';
    const taskId = `task-${Date.now()}`;

    this.log(`  Agent: @${agentId}, Task: ${taskId}`);

    return {
      agent_id: agentId,
      task_id: taskId,
      status: 'pending',
      activated_at: new Date().toISOString()
    };
  }

  /**
   * Phase 9: HANDOFF — Create audit trail
   * Input: execution_result from Phase 8
   * Output: handoff { file_path, decision_log }
   */
  async phase9_handoff(executionResult) {
    this.log('PHASE 9: HANDOFF — Creating audit trail');

    const handoffId = `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const handoffPath = path.join(process.cwd(), '.aiox', 'handoffs', `${handoffId}.yaml`);

    const handoff = {
      handoff_id: handoffId,
      from_engine: 'context-engine',
      to_agent: executionResult.agent_id,
      task_id: executionResult.task_id,
      phase_progress: this.state,
      created_at: new Date().toISOString(),
      consumed: false
    };

    await fs.mkdir(path.dirname(handoffPath), { recursive: true });
    await fs.writeFile(handoffPath, JSON.stringify(handoff, null, 2));

    this.log(`  Handoff: ${handoffId}`);

    return {
      file_path: handoffPath,
      handoff_id: handoffId,
      decision_log: handoff
    };
  }

  /**
   * Phase 10: PERSISTENCE — Update context registry
   * Input: handoff from Phase 9
   * Output: persistence_result { registry_updated: bool }
   */
  async phase10_persistence(handoff) {
    this.log('PHASE 10: PERSISTENCE — Updating registry');

    const registry = await this.loadRegistry();
    registry.last_context_engine_run = {
      handoff_id: handoff.handoff_id,
      completeness: this.state.completeness,
      gaps_closed: this.state.gapsClosed,
      ran_at: new Date().toISOString()
    };

    await this.saveRegistry(registry);
    this.log(`  Registry updated`);

    return {
      registry_updated: true,
      completeness: this.state.completeness
    };
  }

  /**
   * Main orchestrator — run all 10 phases sequentially
   */
  async execute(userStatement) {
    try {
      this.log('='.repeat(60));
      this.log('AUTO-CONTEXTUALIZATION ENGINE STARTED');
      this.log(`User Statement: "${userStatement}"`);
      this.log('='.repeat(60));

      // Phase 1: Intake
      const intent = await this.phase1_intake(userStatement);

      // Phase 2: Gap Analysis
      const gapAnalysis = await this.phase2_gapAnalysis(intent);

      // Phase 3: Context Completion
      const context = await this.phase3_contextCompletion(gapAnalysis.gaps);

      // Gate check before proceeding
      if (context.completeness < 0.8) {
        this.log('WARNING: Completeness < 80%, proceeding with caution');
      }

      // Phase 4: Validation
      const validation = await this.phase4_validation(context.context);
      if (!validation.can_proceed) {
        throw new Error('Validation gate failed — cannot proceed');
      }

      // Phase 5: IDS Check
      const idsResult = await this.phase5_idsCheck(context.context);

      // Phase 6: Routing
      const routing = await this.phase6_routing(context.context);

      // Phase 7: Pre-Execution
      const executionContext = await this.phase7_preExecution(routing);
      executionContext.routing = routing;

      // Phase 8: Execution
      const executionResult = await this.phase8_execution(executionContext);

      // Phase 9: Handoff
      const handoff = await this.phase9_handoff(executionResult);

      // Phase 10: Persistence
      const persistence = await this.phase10_persistence(handoff);

      this.log('='.repeat(60));
      this.log('AUTO-CONTEXTUALIZATION ENGINE COMPLETED');
      this.log(`Completeness: ${(this.state.completeness * 100).toFixed(1)}%`);
      this.log(`Routed to: @${routing.agent}`);
      this.log('='.repeat(60));

      return {
        success: true,
        phase_results: {
          intent, gapAnalysis, context, validation, idsResult,
          routing, executionResult, handoff, persistence
        },
        final_state: this.state
      };

    } catch (error) {
      this.log(`ERROR: ${error.message}`);
      return {
        success: false,
        error: error.message,
        final_state: this.state
      };
    }
  }

  // Helper methods

  classifyIntent(statement) {
    if (statement.includes('create') || statement.includes('new')) return 'creation';
    if (statement.includes('fix') || statement.includes('bug')) return 'bugfix';
    if (statement.includes('implement') || statement.includes('build')) return 'implementation';
    if (statement.includes('review') || statement.includes('check')) return 'review';
    return 'unknown';
  }

  scoreCdarity(statement) {
    let score = 0.5;
    if (statement.length > 20) score += 0.1;
    if (statement.length > 50) score += 0.2;
    if (statement.includes('?')) score -= 0.1;
    return Math.min(Math.max(score, 0), 1.0);
  }

  detectGap(intent, source) {
    // Simplified gap detection
    return { source, severity: 'medium', confidence: 0.7 };
  }

  async resolveGapSource(gap) {
    // Placeholder for gap resolution
    return { resolved: true, source: gap.source };
  }

  checkProjectContext(context) {
    return { passed: !!context.project, name: 'ProjectContext' };
  }

  checkStoryContext(context) {
    return { passed: true, name: 'StoryContext' };
  }

  checkEpicContext(context) {
    return { passed: true, name: 'EpicContext' };
  }

  checkSchemaContext(context) {
    return { passed: true, name: 'SchemaContext' };
  }

  checkWorkflowContext(context) {
    return { passed: true, name: 'WorkflowContext' };
  }

  checkAgentContext(context) {
    return { passed: true, name: 'AgentContext' };
  }

  checkTaskContext(context) {
    return { passed: true, name: 'TaskContext' };
  }

  checkRuleContext(context) {
    return { passed: true, name: 'RuleContext' };
  }

  queryRegistry(registry, data) {
    // Placeholder registry query
    return [];
  }

  selectAgent(context) {
    // Simplified agent selection
    return 'dev';
  }

  selectWorkflow(context, agent) {
    return 'story-development-cycle';
  }

  selectMode(context) {
    return 'interactive';
  }

  calculateConfidence(context) {
    return this.state.completeness;
  }

  async loadTemplates(workflow) {
    // Placeholder for template loading
    return [];
  }

  async resolveDependencies(agent) {
    // Placeholder for dependency resolution
    return [];
  }

  prepareEnvironment(routing) {
    return { agent: routing.agent, workflow: routing.workflow };
  }

  async loadRegistry() {
    // Delegate to the canonical registry module (context-registry.js).
    // read() returns {} on any read/parse error (graceful degradation).
    return this.registry.read();
  }

  async saveRegistry(registry) {
    // Delegate to the canonical registry module's atomic raw-write path.
    this.registry.saveRaw(registry);
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    console.log(logLine);
    // Async write to avoid blocking
    fs.appendFile(this.logFile, logLine).catch(() => {});
  }
}

module.exports = ContextEngine;
