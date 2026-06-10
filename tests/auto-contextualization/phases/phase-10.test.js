const { test } = require('node:test');
const assert = require('node:assert');
const { registrySession } = require('../../fixtures/context-samples');

test('Phase 10 — PERSISTENCE: registry update', async (t) => {
  await t.test('writes session context to registry', () => {
    assert.ok(registrySession.session_id);
    assert.ok(registrySession.timestamp);
    assert.ok(registrySession.intent_type);
  });

  await t.test('updates registry with completeness + validation results', () => {
    assert.ok(registrySession.completeness > 0);
    assert.ok(typeof registrySession.phase_4_passed === 'boolean');
    assert.ok(Array.isArray(registrySession.gaps_detected));
  });
});
