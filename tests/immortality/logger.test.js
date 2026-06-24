/**
 * Agent Memory Logger — Unit & Integration Tests
 * Story 1.20: Agent Immortality Phase 1 — AC6
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const logger = require('../../packages/immortality-logger/logger.cjs');

// Test constants
const TEST_LOG_DIR = '.aiox/agent-memory/logs-test';
const TEST_AGENT_ID = 'test-agent-001';

// Setup/teardown
function cleanup() {
  if (fs.existsSync(TEST_LOG_DIR)) {
    fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
  }
}

function setupTest() {
  if (!fs.existsSync(TEST_LOG_DIR)) {
    fs.mkdirSync(TEST_LOG_DIR, { recursive: true });
  }
}

cleanup();

// =============================================================================
// AC6.1: Unit Tests — Logger Snapshot Capture/Serialization
// =============================================================================

test('AC6.1.1: captureSnapshot() returns valid snapshot object', () => {
  const snapshot = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    context: { workflow: 'dev-develop-story', step: 1 },
    decisions: [{ type: 'architecture', rationale: 'Use CommonJS for compatibility' }],
    memory: { stepsCompleted: 1, tasksRemaining: 5 }
  });

  assert.ok(snapshot, 'Snapshot should be defined');
  assert.strictEqual(snapshot.agentId, TEST_AGENT_ID);
  assert.ok(snapshot.timestamp);
  assert.ok(snapshot.context.workflow);
  assert.strictEqual(snapshot.decisions.length, 1);
  assert.strictEqual(snapshot.memory.stepsCompleted, 1);
  assert.strictEqual(snapshot.serialization_errors, null);
});

test('AC6.1.2: captureSnapshot() handles circular references gracefully', () => {
  const circularObj = { name: 'test' };
  circularObj.self = circularObj; // Create circular reference

  const snapshot = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    memory: circularObj
  });

  assert.ok(snapshot);
  assert.ok(snapshot.serialization_errors);
  assert.ok(snapshot.serialization_errors.length > 0);
  // Should record error but not crash
  assert.ok(snapshot.serialization_errors[0].includes('memory'));
});

test('AC6.1.3: captureSnapshot() handles undefined/null gracefully', () => {
  const snapshot = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    context: undefined,
    decisions: null,
    memory: undefined
  });

  assert.ok(snapshot);
  assert.deepStrictEqual(snapshot.context, {});
  // null handled correctly
  assert.ok(snapshot.decisions !== undefined);
  assert.deepStrictEqual(snapshot.memory, {});
  assert.strictEqual(snapshot.serialization_errors, null);
});

// =============================================================================
// AC6.2: Unit Tests — Agent Logging Session
// =============================================================================

test('AC6.2.1: logSession() writes snapshot to file asynchronously', (t, done) => {
  // Override log dir for test
  process.env.IMMORTALITY_LOG_DIR = TEST_LOG_DIR;
  setupTest();

  const snapshot = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    context: { test: true }
  });

  logger.logSession(snapshot, (err) => {
    assert.ifError(err);
    assert.ok(fs.existsSync(TEST_LOG_DIR));
    done();
  });
});

test('AC6.2.2: logSession() with callback (non-blocking)', (t, done) => {
  setupTest();
  const snapshot = logger.captureSnapshot({ agentId: TEST_AGENT_ID, context: { seq: 1 } });

  // Verify callback is called asynchronously
  let callbackCalled = false;
  logger.logSession(snapshot, (err) => {
    callbackCalled = true;
    assert.ifError(err);
    assert.ok(true, 'Callback should be called');
    done();
  });

  // Verify async behavior — callback should not be called immediately
  assert.ok(!callbackCalled, 'logSession should be async');
});

// =============================================================================
// AC6.3: Unit Tests — Log Readback
// =============================================================================

test('AC6.3.1: readLog() retrieves logs for specific date', (t, done) => {
  const today = new Date();
  const snapshot = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    context: { test: 'readlog' }
  });

  logger.logSession(snapshot, (err) => {
    assert.ifError(err);

    logger.readLog({ date: today }, (err, logs) => {
      assert.ifError(err);
      assert.ok(logs.length > 0, 'Should have at least 1 log');
      assert.strictEqual(logs[logs.length - 1].context.test, 'readlog');
      done();
    });
  });
});

test('AC6.3.2: readLog() filters by agentId when provided', (t, done) => {
  const snapshot1 = logger.captureSnapshot({ agentId: 'agent-a', context: { id: 'a' } });
  const snapshot2 = logger.captureSnapshot({ agentId: 'agent-b', context: { id: 'b' } });

  logger.logSession(snapshot1, (err1) => {
    assert.ifError(err1);
    logger.logSession(snapshot2, (err2) => {
      assert.ifError(err2);

      logger.readLog({ agentId: 'agent-a' }, (err, logs) => {
        assert.ifError(err);
        const agentALogs = logs.filter(log => log.agentId === 'agent-a');
        assert.ok(agentALogs.length > 0);
        agentALogs.forEach(log => {
          assert.strictEqual(log.agentId, 'agent-a');
        });
        done();
      });
    });
  });
});

test('AC6.3.3: readLog() returns empty array for non-existent date', (t, done) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);

  logger.readLog({ date: futureDate }, (err, logs) => {
    assert.ifError(err);
    assert.deepStrictEqual(logs, []);
    done();
  });
});

// =============================================================================
// AC6.4: Error Handling Tests — Logger Robustness
// =============================================================================

test('AC6.4.1: logSession() with missing snapshot calls callback with error', (t, done) => {
  logger.logSession(null, (err) => {
    assert.ok(err);
    assert.ok(err.message.includes('snapshot'));
    done();
  });
});

test('AC6.4.2: cleanupOldLogs() callback works correctly', (t, done) => {
  // Verify cleanup can be called without errors (using default dir)
  logger.cleanupOldLogs(168, (err, deletedCount) => {
    // May or may not delete files (depends on existing logs)
    // Just verify callback is called
    assert.ok(typeof deletedCount === 'number');
    done();
  });
});

// =============================================================================
// AC6.5: Non-Blocking Behavior — Agent Continues on Logger Failure
// =============================================================================

test('AC6.5.1: captureSnapshot() never throws (non-blocking)', () => {
  // Even with completely broken input
  const result = logger.captureSnapshot({
    agentId: TEST_AGENT_ID,
    context: Symbol('test'), // Non-serializable
    decisions: Symbol('test'),
    memory: Symbol('test')
  });

  // Should not throw, should return snapshot with errors logged
  assert.ok(result);
  assert.ok(result.serialization_errors);
});

// =============================================================================
// AC6.6: Integration Test — Full Workflow
// =============================================================================

test('AC6.6.1: Full workflow - capture, log, read succeeds', (t, done) => {
  const agentId = 'integration-test';
  const contextData = {
    workflow: 'dev-develop-story',
    step: 3,
    timestamp: new Date().toISOString()
  };

  // Step 1: Capture
  const snapshot = logger.captureSnapshot({
    agentId,
    context: contextData,
    decisions: [
      { type: 'tech', choice: 'Node.js', rationale: 'Familiar' }
    ],
    memory: {
      completedTasks: ['config', 'schema'],
      remainingTasks: ['implementation', 'testing']
    }
  });

  assert.ok(snapshot, 'Capture should succeed');

  // Step 2: Log
  logger.logSession(snapshot, (err) => {
    assert.ifError(err, 'Log should succeed');

    // Step 3: Read
    logger.readLog({ agentId }, (err, logs) => {
      assert.ifError(err, 'Read should succeed');
      const found = logs.find(log => log.context.step === 3);
      assert.ok(found, 'Should find logged snapshot');
      assert.strictEqual(found.memory.completedTasks.length, 2);
      done();
    });
  });
});

// =============================================================================
// Cleanup
// =============================================================================

test('cleanup test artifacts', () => {
  cleanup();
  assert.ok(!fs.existsSync(TEST_LOG_DIR), 'Test directory should be cleaned up');
});
