const { test } = require('node:test');
const assert = require('node:assert');
const { validationChecks } = require('../../fixtures/context-samples');

test('Phase 4 — VALIDATION: 8-point completeness checks', async (t) => {
  await t.test('validates all 8 required checks', () => {
    assert.strictEqual(validationChecks.length, 8);
    assert.ok(validationChecks.every(c => c.hasOwnProperty('name') && c.hasOwnProperty('result')));
  });

  await t.test('gates completion on all checks passing', () => {
    const allPass = validationChecks.every(c => c.result === true || typeof c.result === 'number');
    assert.ok(allPass, 'All validation checks should pass');
  });
});
