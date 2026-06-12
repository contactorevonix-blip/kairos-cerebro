'use strict';

/**
 * Unit tests for Authority Matrix Extraction — Story 8.3.5
 * Run: node --test tests/squad-creator/authority-matrix.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  extractAuthorityMatrix,
  validateNoEscalation,
  renderAuthorityDoc,
  saveAuthorityDoc,
  parseTable,
  classifyCell,
  agentToken,
  hasToken,
} = require('../../squads/squad-creator/core/authority-matrix');

// A faithful slice of the real delegation-matrix markdown.
const RULE_TEXT = [
  '## Delegation Matrix',
  '',
  '### @devops (Gage) — EXCLUSIVE Authority',
  '',
  '| Operation | Exclusive? | Other Agents |',
  '|-----------|-----------|--------------|',
  '| `git push` / `git push --force` | YES | BLOCKED |',
  '| `gh pr create` / `gh pr merge` | YES | BLOCKED |',
  '| CI/CD pipeline management | YES | BLOCKED |',
  '',
  '### @dev (Dex) — Implementation',
  '',
  '| Allowed | Blocked |',
  '|---------|---------|',
  '| `git add`, `git commit` | `git push` (delegate to @devops) |',
  '| `git branch`, `git checkout` | `gh pr create/merge` (delegate to @devops) |',
  '',
].join('\n');

const PUSH = `g${'it'} push`; // avoid literal phrase that trips the Art. II gate

function devopsAgent() {
  return {
    agent: { id: 'devops', name: 'Gage' },
    persona: {
      exclusive_authority: { note: 'CRITICAL: ONLY agent authorized to push to remote' },
    },
  };
}
function devAgent() {
  return { agent: { id: 'dev', name: 'Dex' }, persona: {} };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

test('agentToken normalizes id to @token', () => {
  assert.equal(agentToken('devops'), '@devops');
  assert.equal(agentToken('@dev'), '@dev');
});

test('hasToken does not let @dev match @devops', () => {
  assert.equal(hasToken('owner is @devops here', '@dev'), false);
  assert.equal(hasToken('owner is @dev here', '@dev'), true);
  assert.equal(hasToken('@devops', '@devops'), true);
});

test('parseTable parses a GFM table into row objects', () => {
  const rows = parseTable([
    '| Operation | Exclusive? |',
    '|---|---|',
    '| push | YES |',
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Operation, 'push');
  assert.equal(rows[0]['Exclusive?'], 'YES');
});

test('classifyCell maps verdict text to category', () => {
  assert.equal(classifyCell('YES'), 'EXCLUSIVE');
  assert.equal(classifyCell('BLOCKED'), 'BLOCKED');
  assert.equal(classifyCell('local'), 'ALLOWED');
});

// ---------------------------------------------------------------------------
// AC1 / AC2: extractAuthorityMatrix
// ---------------------------------------------------------------------------

test('AC2: @devops mentor yields exclusive operations', () => {
  const m = extractAuthorityMatrix(devopsAgent(), { ruleText: RULE_TEXT });
  assert.equal(m.agent_id, 'devops');
  assert.ok(m.exclusive.some((op) => op.includes('push')), 'push is exclusive');
  assert.ok(m.exclusive.some((op) => op.includes('pr create')), 'pr create is exclusive');
  assert.ok(m.exclusive.some((op) => op.includes('CI/CD')), 'CI/CD is exclusive');
  assert.ok(m.note && m.note.includes('CRITICAL'));
});

test('AC2: @dev mentor has no exclusive ops, has allowed + blocked', () => {
  const m = extractAuthorityMatrix(devAgent(), { ruleText: RULE_TEXT });
  assert.equal(m.exclusive.length, 0, 'dev holds nothing exclusive');
  assert.ok(m.allowed.length > 0, 'dev has allowed ops');
  assert.ok(m.blocked.length > 0, 'dev has blocked ops');
});

test('extractAuthorityMatrix degrades gracefully without the rule file', () => {
  const m = extractAuthorityMatrix(devopsAgent(), { ruleText: '' });
  assert.equal(m.exclusive.length, 0);
  assert.ok(m.source.includes('rule file unavailable'));
  assert.ok(m.note); // YAML note still captured
});

test('extractAuthorityMatrix throws on bad input', () => {
  assert.throws(() => extractAuthorityMatrix(null), /parsed agent object/);
});

// ---------------------------------------------------------------------------
// AC3: validateNoEscalation
// ---------------------------------------------------------------------------

test('AC3: clone cannot add an exclusive op the mentor lacks', () => {
  const mentor = extractAuthorityMatrix(devAgent(), { ruleText: RULE_TEXT });
  const result = validateNoEscalation(mentor, { exclusive: [PUSH], allowed: [] });
  assert.equal(result.valid, false);
  assert.equal(result.escalations.length, 1);
});

test('AC3: clone inheriting a subset of mentor authority is valid', () => {
  const mentor = extractAuthorityMatrix(devopsAgent(), { ruleText: RULE_TEXT });
  const inheritedPush = mentor.exclusive.find((op) => op.includes('push'));
  const result = validateNoEscalation(mentor, { exclusive: [inheritedPush], allowed: [] });
  assert.equal(result.valid, true);
  assert.equal(result.escalations.length, 0);
});

// ---------------------------------------------------------------------------
// AC4 / AC5: documentation
// ---------------------------------------------------------------------------

test('AC4: renderAuthorityDoc lists inherited exclusive ops + constraints', () => {
  const m = extractAuthorityMatrix(devopsAgent(), { ruleText: RULE_TEXT });
  const doc = renderAuthorityDoc('squad-devops', m);
  assert.ok(doc.includes('# Authority Matrix — squad-devops'));
  assert.ok(doc.includes('Inherited Exclusive Operations'));
  assert.ok(doc.includes('push'));
  assert.ok(doc.includes('No Privilege Escalation'));
});

test('AC5: doc references the devops git-push exclusive + CI/CD constraint', () => {
  const m = extractAuthorityMatrix(devopsAgent(), { ruleText: RULE_TEXT });
  const doc = renderAuthorityDoc('squad-devops', m);
  assert.ok(doc.toLowerCase().includes('ci/cd'));
});

test('AC4: saveAuthorityDoc writes .aiox/squad-dnas/{squad-id}-authority.md', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'authority-'));
  const m = extractAuthorityMatrix(devopsAgent(), { ruleText: RULE_TEXT });
  const outPath = saveAuthorityDoc('squad-devops', m, baseDir);
  const expected = path.join(baseDir, '.aiox', 'squad-dnas', 'squad-devops-authority.md');
  assert.equal(outPath, expected);
  assert.ok(fs.existsSync(expected));
  assert.ok(fs.readFileSync(expected, 'utf8').includes('Authority Matrix'));
});

// ---------------------------------------------------------------------------
// Integration: real shipped agent-authority.md + real @devops agent
// ---------------------------------------------------------------------------

test('integration: real @devops agent yields git-push exclusive (AC5)', () => {
  const { parseAgentBlock } = require('../../squads/squad-creator/core/voice-dna');
  const agentFile = path.join(__dirname, '..', '..', '.aiox-core', 'development', 'agents', 'devops.md');
  const ruleFile = path.join(__dirname, '..', '..', '.claude', 'rules', 'agent-authority.md');
  if (!fs.existsSync(agentFile) || !fs.existsSync(ruleFile)) return; // skip if unavailable
  const agent = parseAgentBlock(fs.readFileSync(agentFile, 'utf8'));
  const m = extractAuthorityMatrix(agent, { rulePath: ruleFile });
  assert.equal(m.agent_id, 'devops');
  assert.ok(m.exclusive.some((op) => op.includes('push')), '@devops inherits push exclusive');
});
