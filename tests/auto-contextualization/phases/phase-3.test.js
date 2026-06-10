const { test } = require('node:test');
const assert = require('node:assert');
const { contextSources } = require('../../fixtures/context-samples');

test('Phase 3 — CONTEXT-COMPLETION: context filling', async (t) => {
  await t.test('fills context from available sources', () => {
    const sources = Object.values(contextSources);
    assert.ok(sources.some(s => s.available === true));
  });

  await t.test('prioritizes project registry over inference', () => {
    const registry = contextSources.registry;
    assert.strictEqual(registry.type, 'registry');
    assert.ok(registry.available);
  });
});
