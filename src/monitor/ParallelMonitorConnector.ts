import * as fs from 'fs';
import * as path from 'path';
import {
  SessionSnapshot,
  AgentState,
  TaskState,
  HookState,
  WorkflowSnapshot,
} from './types';

export class ParallelMonitorConnector {
  private workflowStatePath: string;
  private hookMetricsPath: string;

  constructor(
    workflowStatePath: string = '.aiox/WORKFLOW-STATE.json',
    hookMetricsPath: string = '.synapse/metrics/hook-metrics.json'
  ) {
    this.workflowStatePath = path.resolve(workflowStatePath);
    this.hookMetricsPath = path.resolve(hookMetricsPath);
  }

  /**
   * Get session snapshot
   * Returns immutable snapshot of current session state
   */
  getSessionSnapshot(): SessionSnapshot {
    const workflowState = this.readWorkflowState();

    return {
      uuid: this.generateUUID(),
      agent: workflowState.activeAgent,
      story: workflowState.activeStory,
      prompt_count: 0, // Not in WORKFLOW-STATE.json currently
      token_input: 0, // Not in WORKFLOW-STATE.json currently
      token_output: 0, // Not in WORKFLOW-STATE.json currently
      status: workflowState.phase === 'Done' ? 'done' : 'active',
      started_at: new Date().toISOString(),
      updated_at: workflowState.lastUpdated || new Date().toISOString(),
    };
  }

  /**
   * Get agent execution state
   * Returns current agent, story, phase, next action
   */
  getAgentState(): AgentState {
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
   * Returns task metadata and pending gates
   */
  getTaskState(): TaskState {
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
   * Returns rule layer performance and metrics
   */
  getHookState(): HookState {
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
   * All four dimensions in one immutable capture
   */
  getWorkflowSnapshot(): WorkflowSnapshot {
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
   */
  private readWorkflowState(): Record<string, any> {
    try {
      const content = fs.readFileSync(this.workflowStatePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read workflow state from ${this.workflowStatePath}: ${error}`
      );
    }
  }

  /**
   * Read hook-metrics.json from file system
   * Synchronous read — no polling
   */
  private readHookMetrics(): Record<string, any> {
    try {
      const content = fs.readFileSync(this.hookMetricsPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read hook metrics from ${this.hookMetricsPath}: ${error}`
      );
    }
  }

  /**
   * Generate UUID for session snapshot
   * Simple timestamp-based UUID
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
