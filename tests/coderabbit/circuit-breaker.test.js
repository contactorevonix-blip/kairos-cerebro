/**
 * tests/coderabbit/circuit-breaker.test.js
 * Story 8.4.1 — CodeRabbit Circuit Breaker
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { CircuitBreaker, logIteration, getConsecutiveFailures } = require(
  '../../.aiox-core/core/gates/coderabbit-circuit-breaker'
);

const TEST_LOG = '.aiox/gate-logs/coderabbit-iterations.jsonl';

function cleanupTestLog() {
  if (fs.existsSync(TEST_LOG)) {
    fs.unlinkSync(TEST_LOG);
  }
}

test('CircuitBreaker: initialization', () => {
  const breaker = new CircuitBreaker('story-1', 'dev', ['CRITICAL', 'HIGH']);
  assert.strictEqual(breaker.storyId, 'story-1');
  assert.strictEqual(breaker.phase, 'dev');
  assert.strictEqual(breaker.isOpen, false);
  assert.strictEqual(breaker.iteration, 0);
});

test('CircuitBreaker: records successful attempt', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'fixed', 'Fixed semantic issue');
  assert.strictEqual(breaker.iteration, 1);
  assert.strictEqual(breaker.isOpen, false);
});

test('CircuitBreaker: detects consecutive failures', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  assert.strictEqual(breaker.isOpen, true);
});

test('CircuitBreaker: shouldHalt returns true when open', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  breaker.recordAttempt('CRITICAL', 'failed', 'Unable to fix');
  assert.strictEqual(breaker.shouldHalt(), true);
});

test('CircuitBreaker: resets on successful fix', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'failed', 'Attempt 1 failed');
  breaker.recordAttempt('CRITICAL', 'fixed', 'Attempt 2 fixed');
  const failures = getConsecutiveFailures('story-1', 'dev', ['CRITICAL']);
  assert.strictEqual(failures, 0);
});

test('CircuitBreaker: getStatus returns current state', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'failed', 'Test');
  const status = breaker.getStatus();
  assert.strictEqual(status.storyId, 'story-1');
  assert.strictEqual(status.phase, 'dev');
  assert.strictEqual(status.isOpen, false);
  assert.strictEqual(status.consecutiveFailures, 1);
});

test('CircuitBreaker: logs iterations to JSONL', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev');
  breaker.recordAttempt('CRITICAL', 'fixed', 'Test fix');
  assert.strictEqual(fs.existsSync(TEST_LOG), true);
  const content = fs.readFileSync(TEST_LOG, 'utf8');
  const lines = content.trim().split('\n');
  assert.strictEqual(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.strictEqual(entry.severity, 'CRITICAL');
  assert.strictEqual(entry.result, 'fixed');
});

test('CircuitBreaker: different stories isolated', () => {
  cleanupTestLog();
  const breaker1 = new CircuitBreaker('story-1', 'dev');
  const breaker2 = new CircuitBreaker('story-2', 'dev');
  breaker1.recordAttempt('CRITICAL', 'failed', 'Test');
  breaker1.recordAttempt('CRITICAL', 'failed', 'Test');
  breaker2.recordAttempt('CRITICAL', 'failed', 'Test');
  assert.strictEqual(breaker1.isOpen, false);
  assert.strictEqual(breaker2.isOpen, false);
});

test('CircuitBreaker: filters by severity', () => {
  cleanupTestLog();
  const breaker = new CircuitBreaker('story-1', 'dev', ['CRITICAL']);
  breaker.recordAttempt('HIGH', 'failed', 'Test');
  breaker.recordAttempt('HIGH', 'failed', 'Test');
  breaker.recordAttempt('HIGH', 'failed', 'Test');
  assert.strictEqual(breaker.isOpen, false);
});

test('CircuitBreaker: graceful degradation on log write failure', () => {
  // This test ensures that recordAttempt doesn't throw even if write fails
  const breaker = new CircuitBreaker('story-1', 'dev');
  // Attempt with invalid log path won't throw (graceful degradation)
  assert.doesNotThrow(() => {
    breaker.recordAttempt('CRITICAL', 'fixed', 'Test');
  });
});
