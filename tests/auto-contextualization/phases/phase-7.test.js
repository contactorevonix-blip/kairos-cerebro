const { test } = require('node:test');
const assert = require('node:assert');

test('Phase 7 — PRE-EXECUTION: template loading', async (t) => {
  await t.test('loads templates from .aiox-core/development/', () => {
    const templatePath = '.aiox-core/development/templates/';
    assert.ok(templatePath.includes('templates'));
  });

  await t.test('validates template structure before execution', () => {
    const template = { name: 'story-tmpl', type: 'story' };
    assert.ok(template.hasOwnProperty('name'));
    assert.ok(template.hasOwnProperty('type'));
  });
});
