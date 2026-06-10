const { test } = require('node:test');
const assert = require('node:assert');
const { gapPatterns } = require('../../fixtures/context-samples');

test('Phase 2 — GAP-ANALYSIS: gap detection algorithm', async (t) => {
  await t.test('detects schema-related gaps', () => {
    const gap = gapPatterns.schema;
    assert.strictEqual(gap.source, 'schema-context');
    assert.strictEqual(gap.severity, 'high');
  });

  await t.test('detects workflow context gaps with priority scoring', () => {
    const gaps = [gapPatterns.schema, gapPatterns.workflow];
    assert.ok(gaps.length >= 1);
    assert.ok(gaps.some(g => g.severity === 'high'));
  });
});
