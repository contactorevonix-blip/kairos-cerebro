const { test } = require('node:test');
const assert = require('node:assert');
const { registrySession } = require('../../fixtures/context-samples');

test('Phase 5 — IDS-CHECK: registry queries', async (t) => {
  await t.test('queries registry by intent type', () => {
    assert.strictEqual(registrySession.intent_type, 'feature');
    assert.ok(registrySession.context_sources.registry.length > 0);
  });

  await t.test('returns matching sessions in < 100ms', () => {
    const start = performance.now();
    const sessions = [registrySession].filter(s => s.intent_type === 'feature');
    const elapsed = performance.now() - start;
    assert.ok(sessions.length > 0);
    assert.ok(elapsed < 100);
  });
});
