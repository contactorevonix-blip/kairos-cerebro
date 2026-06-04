const fs = require('fs');
const path = require('path');

/**
 * ParallelMonitor Connector
 * Reads execution state from .aiox/WORKFLOW-STATE.json and .synapse/metrics/hook-metrics.json
 */
class ParallelMonitorConnector {
  constructor(
    workflowStatePath = '.aiox/WORKFLOW-STATE.json',
    hookMetricsPath = '.synapse/metrics/hook-metrics.json'
  ) {
    this.workflowStatePath = path.resolve(workflowStatePath);
    this.hookMetricsPath = path.resolve(hookMetricsPath);
  }

  /**
   * Get session snapshot
   * @returns {import('./types.js').SessionSnapshot}
   */
  getSessionSnapshot() {
    const workflowState = this.readWorkflowState();

    return {
      uuid: this.generateUUID(),
      agent: workflowState.activeAgent,
      story: workflowState.activeStory,
      prompt_count: 0,
      token_input: 0,
      token_output: 0,
      status: workflowState.phase === 'Done' ? 'done' : 'active',
      started_at: new Date().toISOString(),
      updated_at: workflowState.lastUpdated || new Date().toISOString(),
    };
  }

  /**
   * Get agent execution state
   * @returns {import('./types.js').AgentState}
   */
  getAgentState() {
    const workflowState = this.readWorkflowState();

    return {
      activeAgent: workflowState.activeAgent,
      activeStory: workflowState.activeStory,
      phase: workflowState.phase,
      nextExpectedAction: workflowState.nextExpectedAction,
    };
  }

  /**
   * Get task execution state
   * @returns {import('./types.js').TaskState}
   */
  getTaskState() {
    const workflowState = this.readWorkflowState();

    return {
      activeStory: workflowState.activeStory,
      phase: workflowState.phase,
      pendingGates: workflowState.pendingGates || [],
      track: workflowState.track,
    };
  }

  /**
   * Get hook metrics state
   * @returns {import('./types.js').HookState}
   */
  getHookState() {
    const metrics = this.readHookMetrics();

    return {
      totalDuration: metrics.totalDuration,
      hookBootMs: metrics.hookBootMs,
      bracket: metrics.bracket,
      layersLoaded: metrics.layersLoaded,
      layersSkipped: metrics.layersSkipped,
      layersErrored: metrics.layersErrored,
      totalRules: metrics.totalRules,
      perLayer: metrics.perLayer,
    };
  }

  /**
   * Get complete workflow snapshot
   * @returns {import('./types.js').WorkflowSnapshot}
   */
  getWorkflowSnapshot() {
    return {
      session: this.getSessionSnapshot(),
      agent: this.getAgentState(),
      task: this.getTaskState(),
      hooks: this.getHookState(),
    };
  }

  /**
   * Read WORKFLOW-STATE.json from file system
   * Synchronous read — no polling
   * @private
   */
  readWorkflowState() {
    try {
      const content = fs.readFileSync(this.workflowStatePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read workflow state from ${this.workflowStatePath}: ${error.message}`
      );
    }
  }

  /**
   * Read hook-metrics.json from file system
   * Synchronous read — no polling
   * @private
   */
  readHookMetrics() {
    try {
      const content = fs.readFileSync(this.hookMetricsPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read hook metrics from ${this.hookMetricsPath}: ${error.message}`
      );
    }
  }

  /**
   * Generate UUID for session snapshot
   * Simple timestamp-based UUID
   * @private
   */
  generateUUID() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { ParallelMonitorConnector };
