const { test } = require('node:test');
const assert = require('node:assert');
const { intents } = require('../../fixtures/context-samples');

test('Phase 1 — INTAKE: intent collection', async (t) => {
  await t.test('collects single-line intent without parsing', () => {
    const intent = intents.simple;
    assert.ok(intent.length > 0);
    assert.ok(typeof intent === 'string');
  });

  await t.test('handles complex multi-context intents', () => {
    const intent = intents.complex;
    assert.ok(intent.includes('refactor') || intent.includes('schema'));
  });
});
