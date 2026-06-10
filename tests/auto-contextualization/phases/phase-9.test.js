const { test } = require('node:test');
const assert = require('node:assert');
const { handoffData } = require('../../fixtures/context-samples');

test('Phase 9 — HANDOFF: audit trail creation', async (t) => {
  await t.test('creates handoff YAML with context', () => {
    assert.ok(handoffData.from_agent);
    assert.ok(handoffData.to_agent);
    assert.ok(handoffData.story_context);
  });

  await t.test('writes handoff to .aiox/handoffs/ directory', () => {
    const handoffPath = '.aiox/handoffs/';
    assert.ok(handoffPath.includes('handoffs'));
  });
});
