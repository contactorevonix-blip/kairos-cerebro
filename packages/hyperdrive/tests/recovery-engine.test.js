'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { RecoveryEngine, STRATEGIES } = require('../src/core/recovery-engine');
const engine = new RecoveryEngine();

describe('RecoveryEngine — classifyError()', () => {
  test('timeout', () => assert.equal(engine.classifyError(new Error('Request timed out')), 'timeout'));
  test('token_limit', () => assert.equal(engine.classifyError(new Error('Token limit exceeded')), 'token_limit'));
  test('api_error', () => assert.equal(engine.classifyError(new Error('429 rate limit')), 'api_error'));
  test('json_parse', () => assert.equal(engine.classifyError(new Error('JSON parse error')), 'json_parse'));
  test('tool_failure', () => assert.equal(engine.classifyError(new Error('Tool execution failed')), 'tool_failure'));
  test('unknown', () => assert.equal(engine.classifyError(new Error('unknown xyz error')), 'unknown'));
  test('null error → unknown', () => assert.equal(engine.classifyError(null), 'unknown'));
});

describe('RecoveryEngine — buildRecoveryPlan()', () => {
  test('timeout < max_attempts → split_task', () => {
    const plan = engine.buildRecoveryPlan('timeout', { id: 't1', description: 'test' }, 0);
    assert.equal(plan.action, 'split_task');
  });

  test('timeout >= max_attempts → escalate', () => {
    const plan = engine.buildRecoveryPlan('timeout', { id: 't1', description: 'test' }, 3);
    assert.equal(plan.action, 'escalate');
  });

  test('unknown → escalate imediato (attempt 0)', () => {
    const plan = engine.buildRecoveryPlan('unknown', { id: 't2', description: 'test' }, 0);
    assert.equal(plan.action, 'escalate');
  });

  test('token_limit → modified_task com texto comprimido', () => {
    const plan = engine.buildRecoveryPlan('token_limit', { id: 't3', description: 'task longa' }, 0);
    assert.equal(plan.action, 'compress_context');
    assert.ok(plan.modified_task?.includes('[contexto comprimido'));
  });

  test('json_parse → modified_task com instrução sem JSON', () => {
    const plan = engine.buildRecoveryPlan('json_parse', { id: 't4', description: 'parse task' }, 0);
    assert.equal(plan.action, 'simplify_prompt');
    assert.ok(plan.modified_task?.includes('texto simples'));
  });
});

describe('RecoveryEngine — getAttemptCount()', () => {
  test('attempt count inicial = 0', () => {
    assert.equal(engine.getAttemptCount('task_x', 'timeout'), 0);
  });

  test('clearTask remove contadores', () => {
    const e2 = new RecoveryEngine();
    // recordAttempt escreve no ledger — não chamar em testes; testar clearTask indirectamente
    e2._attempts.set('task_y:api_error', 2);
    assert.equal(e2.getAttemptCount('task_y', 'api_error'), 2);
    e2.clearTask('task_y');
    assert.equal(e2.getAttemptCount('task_y', 'api_error'), 0);
  });
});

describe('STRATEGIES — estrutura', () => {
  for (const [type, strategy] of Object.entries(STRATEGIES)) {
    test(`${type}: max_attempts > 0`, () => assert.ok(strategy.max_attempts > 0));
    test(`${type}: action é string`,  () => assert.equal(typeof strategy.action, 'string'));
    test(`${type}: description é string`, () => assert.equal(typeof strategy.description, 'string'));
  }
});
