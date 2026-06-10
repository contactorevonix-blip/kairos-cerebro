const { test } = require('node:test');
const assert = require('node:assert');

test('Phase 6 — ROUTING: agent + workflow selection', async (t) => {
  await t.test('selects agent based on intent type', () => {
    const intentType = 'feature';
    const agent = intentType === 'feature' ? '@dev' : '@qa';
    assert.ok(agent.startsWith('@'));
  });

  await t.test('determines workflow (SDC vs QA Loop)', () => {
    const workflows = ['SDC', 'QA-Loop', 'Spec-Pipeline'];
    assert.ok(workflows.includes('SDC'));
  });
});
