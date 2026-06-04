import { describe, it, expect } from '@jest/globals';
import { ParallelMonitorConnector } from '../../src/monitor/ParallelMonitorConnector';

describe('ParallelMonitorConnector', () => {
  let connector: ParallelMonitorConnector;

  beforeAll(() => {
    connector = new ParallelMonitorConnector(
      '.aiox/WORKFLOW-STATE.json',
      '.synapse/metrics/hook-metrics.json'
    );
  });

  describe('getSessionSnapshot', () => {
    it('should return valid SessionSnapshot with required fields', () => {
      const snapshot = connector.getSessionSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.uuid).toBeDefined();
      expect(typeof snapshot.uuid).toBe('string');
      expect(snapshot.agent).toBeDefined();
      expect(snapshot.status).toMatch(/^(active|paused|done)$/);
      expect(snapshot.started_at).toBeDefined();
      expect(snapshot.updated_at).toBeDefined();
      expect(snapshot.prompt_count).toBeGreaterThanOrEqual(0);
      expect(snapshot.token_input).toBeGreaterThanOrEqual(0);
      expect(snapshot.token_output).toBeGreaterThanOrEqual(0);
    });

    it('should include story when activeStory is set', () => {
      const snapshot = connector.getSessionSnapshot();
      if (snapshot.story) {
        expect(typeof snapshot.story).toBe('string');
      }
    });
  });

  describe('getAgentState', () => {
    it('should return valid AgentState', () => {
      const agentState = connector.getAgentState();

      expect(agentState).toBeDefined();
      expect(agentState).toHaveProperty('activeAgent');
      expect(agentState).toHaveProperty('phase');
      expect(agentState).toHaveProperty('nextExpectedAction');
    });
  });

  describe('getTaskState', () => {
    it('should return valid TaskState', () => {
      const taskState = connector.getTaskState();

      expect(taskState).toBeDefined();
      expect(taskState).toHaveProperty('activeStory');
      expect(taskState).toHaveProperty('phase');
      expect(Array.isArray(taskState.pendingGates)).toBe(true);
    });
  });

  describe('getHookState', () => {
    it('should return valid HookState with metrics', () => {
      const hookState = connector.getHookState();

      expect(hookState).toBeDefined();
      expect(hookState.totalDuration).toBeGreaterThan(0);
      expect(hookState.bracket).toBeDefined();
      expect(hookState.layersLoaded).toBeGreaterThanOrEqual(0);
      expect(hookState.totalRules).toBeGreaterThanOrEqual(0);
      expect(typeof hookState.perLayer).toBe('object');
    });

    it('should validate perLayer structure', () => {
      const hookState = connector.getHookState();

      Object.values(hookState.perLayer).forEach((layer: any) => {
        expect(layer).toHaveProperty('duration');
        expect(layer).toHaveProperty('status');
        expect(layer).toHaveProperty('rules');
        expect(['ok', 'skipped', 'errored']).toContain(layer.status);
      });
    });
  });

  describe('getWorkflowSnapshot', () => {
    it('should return complete WorkflowSnapshot', () => {
      const snapshot = connector.getWorkflowSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.session).toBeDefined();
      expect(snapshot.agent).toBeDefined();
      expect(snapshot.task).toBeDefined();
      expect(snapshot.hooks).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should read 150 concurrent snapshots in <50ms', () => {
      const iterations = 150;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        connector.getSessionSnapshot();
      }

      const duration = performance.now() - start;
      console.log(`150 snapshots read in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(50);
    });

    it('should read workflow snapshots in <50ms for 150 iterations', () => {
      const iterations = 150;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        connector.getWorkflowSnapshot();
      }

      const duration = performance.now() - start;
      console.log(`150 workflow snapshots read in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Snapshot accuracy', () => {
    it('should reflect real WORKFLOW-STATE.json data', () => {
      const snapshot = connector.getSessionSnapshot();
      const agentState = connector.getAgentState();

      expect(snapshot.agent).toBe(agentState.activeAgent);
      expect(snapshot.story).toBe(agentState.activeStory);
    });

    it('should reflect real hook-metrics.json data', () => {
      const hookState = connector.getHookState();

      expect(hookState.bracket).toMatch(/^[A-Z]+$/);
      expect(hookState.layersLoaded + hookState.layersSkipped).toBeGreaterThan(0);
    });
  });

  describe('Immutability', () => {
    it('should return new object instances on each call', () => {
      const snapshot1 = connector.getSessionSnapshot();
      const snapshot2 = connector.getSessionSnapshot();

      expect(snapshot1).not.toBe(snapshot2);
      expect(snapshot1.uuid).not.toBe(snapshot2.uuid);
    });
  });
});
