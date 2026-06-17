const test = require('node:test');
const assert = require('node:assert');
const LayerLoader = require('../../.aiox-core/core/context-loading/layer-loader');
const LayerValidator = require('../../.aiox-core/core/context-loading/layer-validator');
const path = require('path');

test('LayerLoader - DAG Validation', async (t) => {
  const loader = new LayerLoader();

  await t.test('should validate 8-layer DAG without cycles', () => {
    const result = loader.validateDAG();
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.layers.length, 8);
  });

  await t.test('should validate layer sequence is correct', () => {
    const result = loader.validateDAG();
    const expectedSequence = [
      'constitution',
      'global-rules',
      'agent-layer',
      'workflow-layer',
      'task-layer',
      'squad-layer',
      'keyword-layer',
      'star-command-layer'
    ];
    assert.deepStrictEqual(result.layers, expectedSequence);
  });
});

test('LayerLoader - Transaction Management', async (t) => {
  const loader = new LayerLoader();

  await t.test('should begin and commit transaction', async () => {
    await loader.beginTransaction();
    assert.strictEqual(loader.atomicTransaction.status, 'in_progress');

    const committed = await loader.commitTransaction();
    assert.strictEqual(committed.status, 'committed');
  });

  await t.test('should rollback transaction on error', async () => {
    const loader2 = new LayerLoader();
    await loader2.beginTransaction();
    await loader2.rollbackTransaction();
    assert.strictEqual(loader2.atomicTransaction, null);
    assert.strictEqual(loader2.loadedLayers.size, 0);
  });
});

test('LayerLoader - Logging', async (t) => {
  const loader = new LayerLoader();

  await t.test('should create log directory', () => {
    const fs = require('fs');
    loader._logEvent('test_event', { data: 'test' });
    assert.strictEqual(fs.existsSync(loader.logDir), true);
  });
});

test('LayerValidator - Coverage Validation', async (t) => {
  const validator = new LayerValidator();

  await t.test('should validate full coverage', () => {
    const loadedLayers = new Map([
      ['constitution', {}],
      ['global-rules', {}],
      ['agent-layer', {}],
      ['workflow-layer', {}],
      ['task-layer', {}],
      ['squad-layer', {}],
      ['keyword-layer', {}],
      ['star-command-layer', {}]
    ]);

    const result = validator.validateCoverage(loadedLayers);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.missing.length, 0);
  });

  await t.test('should detect missing layers', () => {
    const loadedLayers = new Map([
      ['constitution', {}],
      ['global-rules', {}]
    ]);

    const result = validator.validateCoverage(loadedLayers);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.missing.length, 6);
  });
});

test('LayerValidator - Atomicity Validation', async (t) => {
  const validator = new LayerValidator();

  await t.test('should validate committed transaction', () => {
    const transaction = {
      status: 'committed',
      loadedLayers: new Map([['constitution', {}]])
    };

    const result = validator.validateAtomicity(transaction);
    assert.strictEqual(result.valid, true);
  });

  await t.test('should reject in-progress transaction', () => {
    const transaction = {
      status: 'in_progress',
      loadedLayers: new Map()
    };

    const result = validator.validateAtomicity(transaction);
    assert.strictEqual(result.valid, false);
  });
});

test('LayerValidator - Performance Validation', async (t) => {
  const validator = new LayerValidator();

  await t.test('should pass cold start performance <2s', () => {
    const startTime = Date.now();
    const endTime = startTime + 1500;

    const result = validator.validatePerformance(startTime, endTime);
    assert.strictEqual(result.coldStartOk, true);
  });

  await t.test('should fail cold start performance >2s', () => {
    const startTime = Date.now();
    const endTime = startTime + 2500;

    const result = validator.validatePerformance(startTime, endTime);
    assert.strictEqual(result.coldStartOk, false);
  });
});
