'use strict';

/**
 * Unit tests for Rules System for Squad — Story 8.3.7
 * Run: node --test tests/squad-creator/rules-inheritor.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  inheritRules,
  validateOverrides,
  renderOverridesDoc,
  saveOverridesDoc,
  articleForRule,
  CONSTITUTION,
  safeSquadId,
} = require('../../squads/squad-creator/core/rules-inheritor');

const FIXED_NOW = new Date('2026-06-11T10:00:00.000Z');

function writeRulesFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-'));
  fs.writeFileSync(path.join(dir, 'agent-authority.md'), '# auth\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'absolute-imports.md'), '# imports\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'story-lifecycle.md'), '# lifecycle\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'not-a-rule.txt'), 'ignored\n', 'utf8');
  return dir;
}

// ---------------------------------------------------------------------------
// inheritRules (AC1)
// ---------------------------------------------------------------------------

test('AC1: inheritRules discovers all .md rule files, sorted', () => {
  const rulesDir = writeRulesFixture();
  const { rules } = inheritRules({ rulesDir });
  assert.deepEqual(rules, ['absolute-imports.md', 'agent-authority.md', 'story-lifecycle.md']);
});

test('AC1: inheritRules returns [] when rules dir absent (graceful)', () => {
  const { rules } = inheritRules({ rulesDir: '/nonexistent/rules' });
  assert.deepEqual(rules, []);
});

test('AC1: inheritRules reads the real framework rules dir', () => {
  const { rules } = inheritRules();
  assert.ok(rules.includes('agent-authority.md'), 'real rules discovered');
});

// ---------------------------------------------------------------------------
// articleForRule
// ---------------------------------------------------------------------------

test('articleForRule maps rule files to constitutional articles', () => {
  assert.equal(articleForRule('agent-authority.md').id, 'II');
  assert.equal(articleForRule('absolute-imports.md').id, 'VI');
  assert.equal(articleForRule('unknown.md'), null);
});

// ---------------------------------------------------------------------------
// validateOverrides (AC3 + AC5)
// ---------------------------------------------------------------------------

test('AC3: override of a NON-NEGOTIABLE article (Agent Authority) is rejected', () => {
  const result = validateOverrides([
    { rule: 'agent-authority.md', change: 'allow @dev git push', rationale: 'speed' },
  ]);
  assert.equal(result.valid, false);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].article, 'II');
  assert.match(result.conflicts[0].reason, /cannot be relaxed/);
});

test('AC3: override of a MUST article (Story-Driven) is rejected', () => {
  const result = validateOverrides([{ rule: 'story-lifecycle.md', change: 'skip stories' }]);
  assert.equal(result.valid, false);
  assert.equal(result.conflicts[0].article, 'III');
});

test('AC5: override of a SHOULD rule (absolute-imports) is allowed', () => {
  const result = validateOverrides([
    { rule: 'absolute-imports.md', change: 'allow relative CSS-module imports', rationale: 'UI squad' },
  ]);
  assert.equal(result.valid, true);
  assert.equal(result.allowed.length, 1);
  assert.equal(result.allowed[0].article, 'VI');
});

test('validateOverrides: unknown rule (no article) is allowed', () => {
  const result = validateOverrides([{ rule: 'custom-squad-rule.md', change: 'x' }]);
  assert.equal(result.valid, true);
  assert.equal(result.allowed[0].article, null);
});

test('validateOverrides: empty/invalid input → valid, no conflicts', () => {
  assert.equal(validateOverrides([]).valid, true);
  assert.equal(validateOverrides(undefined).valid, true);
  assert.equal(validateOverrides([{ change: 'no rule key' }]).allowed.length, 0);
});

// ---------------------------------------------------------------------------
// renderOverridesDoc (AC4)
// ---------------------------------------------------------------------------

test('AC4: doc lists inherited rules + documented overrides', () => {
  const rulesDir = writeRulesFixture();
  const { rules } = inheritRules({ rulesDir });
  const md = renderOverridesDoc(
    'ui-squad',
    {
      inheritedRules: rules,
      overrides: [{ rule: 'absolute-imports.md', change: 'relative CSS imports', rationale: 'UI' }],
    },
    { now: FIXED_NOW },
  );
  assert.match(md, /## Inherited Rules/);
  assert.match(md, /`agent-authority\.md` _\(Art\. II — NON-NEGOTIABLE\)_/);
  assert.match(md, /## Documented Overrides/);
  assert.match(md, /relative CSS imports/);
  assert.match(md, /## Constitutional Constraint/);
});

test('AC4: doc surfaces rejected overrides as conflicts', () => {
  const md = renderOverridesDoc(
    'rogue-squad',
    {
      inheritedRules: ['agent-authority.md'],
      overrides: [{ rule: 'agent-authority.md', change: 'allow push' }],
    },
    { now: FIXED_NOW },
  );
  assert.match(md, /❌ Rejected Overrides/);
  assert.match(md, /Article II/);
});

test('renderOverridesDoc: no overrides → follows all rules as-is', () => {
  const md = renderOverridesDoc('plain-squad', { inheritedRules: ['x.md'], overrides: [] });
  assert.match(md, /follows all inherited rules as-is/);
});

// ---------------------------------------------------------------------------
// saveOverridesDoc (AC2/AC4)
// ---------------------------------------------------------------------------

test('AC2: saveOverridesDoc writes squads/{id}/.claude/rules/squad-overrides.md', () => {
  const rulesDir = writeRulesFixture();
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-out-'));
  const result = saveOverridesDoc(
    'ui-squad',
    { overrides: [{ rule: 'absolute-imports.md', change: 'relative imports' }] },
    { baseDir, rulesDir, now: FIXED_NOW },
  );
  const expected = path.join(baseDir, 'squads', 'ui-squad', '.claude', 'rules', 'squad-overrides.md');
  assert.equal(result.outPath, expected);
  assert.ok(fs.existsSync(expected), 'overrides doc written');
  assert.equal(result.validation.valid, true);

  const written = fs.readFileSync(expected, 'utf8');
  assert.match(written, /# Squad Rule Overrides — ui-squad/);
  assert.match(written, /absolute-imports\.md/);
});

test('AC3: saveOverridesDoc records conflicts for non-overridable rules', () => {
  const rulesDir = writeRulesFixture();
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-out2-'));
  const result = saveOverridesDoc(
    'rogue-squad',
    { overrides: [{ rule: 'agent-authority.md', change: 'allow push' }] },
    { baseDir, rulesDir, now: FIXED_NOW },
  );
  assert.equal(result.validation.valid, false);
  assert.equal(result.validation.conflicts[0].article, 'II');
  assert.match(result.markdown, /❌ Rejected Overrides/);
});

// ---------------------------------------------------------------------------
// CONSTITUTION integrity + safeSquadId
// ---------------------------------------------------------------------------

test('CONSTITUTION marks NON-NEGOTIABLE/MUST as non-overridable, SHOULD as overridable', () => {
  for (const art of CONSTITUTION) {
    if (art.severity === 'SHOULD') assert.equal(art.overridable, true, `Art ${art.id} overridable`);
    else assert.equal(art.overridable, false, `Art ${art.id} not overridable`);
  }
});

test('safeSquadId rejects unsafe ids', () => {
  assert.equal(safeSquadId('ui-squad'), 'ui-squad');
  assert.throws(() => safeSquadId('.x'), /unsafe/);
  assert.throws(() => safeSquadId('a b'), /unsafe/);
  assert.throws(() => safeSquadId(''), /required/);
});
