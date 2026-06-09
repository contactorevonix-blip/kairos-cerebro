const test = require('node:test');
const assert = require('node:assert');
const AutoContextualizationEngine = require('../../.aiox-core/core/auto-contextualization/engine');

test('Engine runs full pipeline', async () => {
  const engine = new AutoContextualizationEngine();
  const result = await engine.run('Test intent statement');

  assert.ok(result.success);
  assert.equal(result.state.intent, 'Test intent statement');
  assert.equal(result.state.phase, 10);
  assert.ok(result.state.validationScore >= 0.8);
});

test('Phase 1 INTAKE works', async () => {
  const engine = new AutoContextualizationEngine();
  const result = await engine.phase1Intake('Sample statement');

  assert.equal(result.intent, 'Sample statement');
  assert.equal(engine.state.phase, 1);
});

test('Phase 4 VALIDATION blocks on low score', async () => {
  const engine = new AutoContextualizationEngine();
  engine.state.intent = null;

  try {
    await engine.phase4Validation();
    assert.fail('Should throw validation error');
  } catch (error) {
    assert.ok(error.message.includes('validation failed'));
  }
});

test('All phases execute in sequence', async () => {
  const engine = new AutoContextualizationEngine();
  const phases = [];

  const originalLog = engine.log.bind(engine);
  engine.log = (msg) => {
    if (msg.includes('PHASE')) {
      const match = msg.match(/PHASE (\d+)/);
      if (match && msg.includes('START')) {
        phases.push(parseInt(match[1]));
      }
    }
    originalLog(msg);
  };

  await engine.run('Test');
  assert.deepEqual(phases, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
