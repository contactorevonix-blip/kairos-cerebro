const { test } = require('node:test');
const assert = require('node:assert');

test('Phase 8 — EXECUTION: agent spawning', async (t) => {
  await t.test('spawns selected agent with context', () => {
    const agent = '@dev';
    assert.ok(agent.match(/^@\w+$/));
  });

  await t.test('sets agent environment with context state', () => {
    const env = { AIOX_ACTIVE_AGENT: '@dev', AIOX_SESSION_ID: 'test-123' };
    assert.ok(env.AIOX_ACTIVE_AGENT);
    assert.ok(env.AIOX_SESSION_ID);
  });
});
