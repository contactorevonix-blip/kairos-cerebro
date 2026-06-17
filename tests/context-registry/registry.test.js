/**
 * Context Registry Integration Tests
 * Tests write/read operations and integration with engine.js (Phase 5 + Phase 10)
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ContextRegistry = require('../../.synapse/context-registry');

describe('ContextRegistry', () => {
  let registry;
  let testFilePath;

  before(() => {
    testFilePath = path.join(__dirname, '..', '..', '.synapse', 'test-registry.json');
    registry = new ContextRegistry(testFilePath);
  });

  after(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('write()', () => {
    it('should write a valid context state entry', () => {
      const sessionId = 'session-2026-06-09-abc123';
      const contextState = {
        timestamp: '2026-06-09T14:30:00.000Z',
        intent_type: 'feature',
        completeness: 0.95,
        phase_4_passed: true,
        gaps_detected: ['schema-context'],
        context_sources: { registry: ['entity-123'] }
      };

      assert.doesNotThrow(() => {
        registry.write(sessionId, contextState);
      });

      const data = registry.read();
      assert.ok(data[sessionId], 'Entry should exist');
      assert.equal(data[sessionId].intent_type, 'feature');
      assert.equal(data[sessionId].completeness, 0.95);
    });

    it('should reject missing required fields', () => {
      const sessionId = 'session-invalid';
      const contextState = {
        intent_type: 'feature',
        completeness: 0.95
        // Missing: timestamp, phase_4_passed
      };

      assert.throws(() => {
        registry.write(sessionId, contextState);
      }, /Missing required field/);
    });

    it('should reject invalid intent_type', () => {
      const sessionId = 'session-invalid';
      const contextState = {
        timestamp: '2026-06-09T14:30:00.000Z',
        intent_type: 'unknown',
        completeness: 0.95,
        phase_4_passed: true
      };

      assert.throws(() => {
        registry.write(sessionId, contextState);
      }, /intent_type must be one of/);
    });

    it('should reject completeness outside 0-1 range', () => {
      const sessionId = 'session-invalid';
      const contextState = {
        timestamp: '2026-06-09T14:30:00.000Z',
        intent_type: 'feature',
        completeness: 1.5,
        phase_4_passed: true
      };

      assert.throws(() => {
        registry.write(sessionId, contextState);
      }, /completeness must be a number between 0 and 1/);
    });
  });

  describe('query()', () => {
    before(() => {
      registry.clear();
      registry.write('session-2026-06-09-feat1', {
        timestamp: '2026-06-09T10:00:00.000Z',
        intent_type: 'feature',
        completeness: 0.95,
        phase_4_passed: true
      });
      registry.write('session-2026-06-09-feat2', {
        timestamp: '2026-06-09T12:00:00.000Z',
        intent_type: 'feature',
        completeness: 0.85,
        phase_4_passed: false
      });
      registry.write('session-2026-06-09-bug1', {
        timestamp: '2026-06-09T14:00:00.000Z',
        intent_type: 'bug',
        completeness: 1.0,
        phase_4_passed: true
      });
    });

    it('should query by intent_type and return matching entries', () => {
      const features = registry.query('feature');
      assert.equal(features.length, 2);
      assert.ok(features.every(s => s.intent_type === 'feature'));
    });

    it('should return results sorted by timestamp (newest first)', () => {
      const features = registry.query('feature');
      assert.equal(features[0].session_id, 'session-2026-06-09-feat2');
      assert.equal(features[1].session_id, 'session-2026-06-09-feat1');
    });

    it('should return empty array for non-matching intent_type', () => {
      const refactors = registry.query('refactor');
      assert.equal(refactors.length, 0);
    });
  });

  describe('getAll()', () => {
    before(() => {
      registry.clear();
      registry.write('session-a', {
        timestamp: '2026-06-09T10:00:00.000Z',
        intent_type: 'feature',
        completeness: 0.9,
        phase_4_passed: true
      });
      registry.write('session-b', {
        timestamp: '2026-06-09T12:00:00.000Z',
        intent_type: 'bug',
        completeness: 1.0,
        phase_4_passed: true
      });
    });

    it('should return all entries sorted by timestamp', () => {
      const all = registry.getAll();
      assert.equal(all.length, 2);
      assert.equal(all[0].session_id, 'session-b');
      assert.equal(all[1].session_id, 'session-a');
    });
  });

  describe('delete()', () => {
    before(() => {
      registry.clear();
      registry.write('session-to-delete', {
        timestamp: '2026-06-09T10:00:00.000Z',
        intent_type: 'feature',
        completeness: 0.9,
        phase_4_passed: true
      });
    });

    it('should delete a session entry', () => {
      registry.delete('session-to-delete');
      const data = registry.read();
      assert.ok(!data['session-to-delete']);
    });
  });

  describe('Performance', () => {
    before(() => {
      registry.clear();
      // Add 100+ entries to test performance
      for (let i = 0; i < 101; i++) {
        registry.write(`session-perf-${i}`, {
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          intent_type: i % 3 === 0 ? 'feature' : 'bug',
          completeness: Math.random(),
          phase_4_passed: Math.random() > 0.5
        });
      }
    });

    it('should query entries in reasonable time (< 200ms)', () => {
      const start = performance.now();
      const results = registry.query('feature');
      const elapsed = performance.now() - start;

      assert.ok(results.length > 0, 'Should return results');
      assert.ok(elapsed < 200, `Query took ${elapsed.toFixed(2)}ms (target: < 200ms)`);
    });

    it('should write in reasonable time (< 100ms)', () => {
      const start = performance.now();
      registry.write(`session-perf-write-${Date.now()}`, {
        timestamp: new Date().toISOString(),
        intent_type: 'feature',
        completeness: 0.9,
        phase_4_passed: true
      });
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 100, `Write took ${elapsed.toFixed(2)}ms (target: < 100ms)`);
    });
  });

  describe('Integration with engine.js (Phase 5 + Phase 10)', () => {
    before(() => {
      registry.clear();
    });

    it('Phase 10 (PERSISTENCE) should write session context', () => {
      const sessionId = 'session-2026-06-10-integration';
      const contextState = {
        timestamp: new Date().toISOString(),
        intent_type: 'feature',
        completeness: 0.98,
        phase_4_passed: true,
        gaps_detected: ['schema-context', 'workflow-context'],
        context_sources: { registry: ['entity-456'] }
      };

      registry.write(sessionId, contextState);
      const data = registry.read();
      assert.ok(data[sessionId], 'Phase 10 write should persist session');
    });

    it('Phase 5 (IDS-CHECK) should query by intent_type', () => {
      registry.clear();
      registry.write('session-2026-06-10-f1', {
        timestamp: new Date().toISOString(),
        intent_type: 'feature',
        completeness: 0.95,
        phase_4_passed: true
      });
      registry.write('session-2026-06-10-f2', {
        timestamp: new Date(Date.now() - 10000).toISOString(),
        intent_type: 'feature',
        completeness: 0.85,
        phase_4_passed: false
      });

      const features = registry.query('feature');
      assert.equal(features.length, 2, 'Phase 5 query should find all feature sessions');
      assert.ok(features[0].completeness >= features[1].completeness ||
                features[0].timestamp > features[1].timestamp,
                'Results should be sorted by timestamp (newest first)');
    });
  });
});
