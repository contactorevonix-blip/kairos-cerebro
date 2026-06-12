/**
 * tests/gates/gate-retry.test.js
 * Story 8.4.3 — Gate Retry Logic
 */

const test = require('node:test');
const assert = require('node:assert');
const {
  retryGateWithBackoff,
  classifyFailure,
  calculateBackoff,
} = require('../../.aiox-core/core/gates/gate-retry');

test('classifyFailure: identifies transient timeout', () => {
  const error = new Error('Connection timeout');
  assert.strictEqual(classifyFailure(error), 'transient');
});

test('classifyFailure: identifies transient ECONNREFUSED', () => {
  const error = new Error('ECONNREFUSED');
  assert.strictEqual(classifyFailure(error), 'transient');
});

test('classifyFailure: identifies transient locked file', () => {
  const error = new Error('File locked');
  assert.strictEqual(classifyFailure(error), 'transient');
});

test('classifyFailure: identifies persistent validation error', () => {
  const error = new Error('Validation failed');
  assert.strictEqual(classifyFailure(error), 'persistent');
});

test('classifyFailure: identifies persistent not found', () => {
  const error = new Error('File not found');
  assert.strictEqual(classifyFailure(error), 'persistent');
});

test('classifyFailure: identifies persistent invalid format', () => {
  const error = new Error('Invalid JSON format');
  assert.strictEqual(classifyFailure(error), 'persistent');
});

test('calculateBackoff: 1s for attempt 1', () => {
  assert.strictEqual(calculateBackoff(1), 1000);
});

test('calculateBackoff: 2s for attempt 2', () => {
  assert.strictEqual(calculateBackoff(2), 2000);
});

test('calculateBackoff: 4s for attempt 3 (capped)', () => {
  assert.strictEqual(calculateBackoff(3), 4000);
});

test('retryGateWithBackoff: succeeds on first attempt', async () => {
  const gateFn = async () => 'success';
  const result = await retryGateWithBackoff(gateFn, 'test-gate');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.result, 'success');
});

test('retryGateWithBackoff: retries on transient failure', async () => {
  let attempts = 0;
  const gateFn = async () => {
    attempts++;
    if (attempts < 2) throw new Error('timeout');
    return 'success';
  };
  const result = await retryGateWithBackoff(gateFn, 'test-gate', 3);
  assert.strictEqual(result.success, true);
  assert.strictEqual(attempts, 2);
});

test('retryGateWithBackoff: fails immediately on persistent error', async () => {
  let attempts = 0;
  const gateFn = async () => {
    attempts++;
    throw new Error('Validation failed');
  };
  const result = await retryGateWithBackoff(gateFn, 'test-gate', 3);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.persistent, true);
  assert.strictEqual(attempts, 1);
});

test('retryGateWithBackoff: respects max attempts', async () => {
  let attempts = 0;
  const gateFn = async () => {
    attempts++;
    throw new Error('timeout');
  };
  const result = await retryGateWithBackoff(gateFn, 'test-gate', 3);
  assert.strictEqual(result.success, false);
  assert.strictEqual(attempts, 3);
});

test('retryGateWithBackoff: respects abort signal', async () => {
  const controller = new AbortController();
  let attempts = 0;
  const gateFn = async () => {
    attempts++;
    throw new Error('timeout');
  };

  // Abort after first attempt
  const promise = retryGateWithBackoff(
    gateFn,
    'test-gate',
    3,
    controller.signal
  );
  setTimeout(() => controller.abort(), 100);
  const result = await promise;

  assert.strictEqual(result.aborted, true);
  assert.strictEqual(attempts, 1);
});

test('retryGateWithBackoff: exponential backoff timing', async () => {
  const times = [];
  let attempts = 0;
  const gateFn = async () => {
    attempts++;
    times.push(Date.now());
    if (attempts < 3) throw new Error('timeout');
    return 'success';
  };

  const start = Date.now();
  const result = await retryGateWithBackoff(gateFn, 'test-gate', 3);

  assert.strictEqual(result.success, true);
  // Total time should be roughly 1000ms (1s + 2s) = 3000ms
  const elapsed = Date.now() - start;
  assert.strictEqual(elapsed >= 2500, true); // Allow some variance
});
