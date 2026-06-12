'use strict';

/**
 * Unit tests for Skill Mapping & Validation — Story 8.3.4
 * Run: node --test tests/squad-creator/skill-validator.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateSquadSkills,
  buildSkillMatrix,
  saveSkillMatrix,
  renderReport,
  loadSquad,
  resolveMentorId,
  classifySkill,
  safeSquadId,
} = require('../../squads/squad-creator/core/skill-validator');

const cli = require('../../bin/commands/squad-validate');

// ---------------------------------------------------------------------------
// Fixtures: a mentor agent .md with commands + task deps, plus a tasks dir with
// a subset present on disk (so we can exercise passed / missing buckets).
// ---------------------------------------------------------------------------

function writeMentorFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-mentor-'));
  const md = [
    '# mentor',
    '',
    '```yaml',
    'agent:',
    '  name: Dex',
    '  id: dev',
    'persona:',
    '  role: Expert Senior Software Engineer',
    'commands:',
    '  - name: develop',
    '    description: Develop a story',
    '  - name: gotcha',
    '    description: Log a gotcha',
    '  - name: orphan',
    '    description: A command with no mapped task',
    'dependencies:',
    '  tasks:',
    '    - dev-develop-story.md',
    '    - gotcha.md',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'dev.md'), md, 'utf8');
  return dir;
}

function writeTasksFixture({ includeGotcha }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-tasks-'));
  fs.writeFileSync(path.join(dir, 'dev-develop-story.md'), '# develop\n', 'utf8');
  if (includeGotcha) fs.writeFileSync(path.join(dir, 'gotcha.md'), '# gotcha\n', 'utf8');
  return dir;
}

function squadFixture() {
  return {
    name: 'Fraud Squad',
    squad_id: 'fraud-squad',
    focus_area: 'fraud-scoring',
    created_from: '@dev',
    audit: { mentor: 'dev' },
  };
}

const FIXED_NOW = new Date('2026-06-11T10:00:00.000Z');

// ---------------------------------------------------------------------------
// loadSquad / resolveMentorId
// ---------------------------------------------------------------------------

test('loadSquad accepts an in-memory squad object', () => {
  const squad = loadSquad(squadFixture());
  assert.equal(squad.squad_id, 'fraud-squad');
});

test('loadSquad reads and parses a squad.yaml from disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-squad-'));
  const file = path.join(dir, 'squad.yaml');
  fs.writeFileSync(file, 'squad_id: fraud-squad\ncreated_from: "@dev"\n', 'utf8');
  const squad = loadSquad(file);
  assert.equal(squad.squad_id, 'fraud-squad');
  assert.equal(squad.created_from, '@dev');
});

test('loadSquad throws on a missing file', () => {
  assert.throws(() => loadSquad('/nonexistent/squad.yaml'), /not found/);
});

test('resolveMentorId reads created_from, falls back to audit.mentor', () => {
  assert.equal(resolveMentorId({ created_from: '@qa' }), 'qa');
  assert.equal(resolveMentorId({ audit: { mentor: 'architect' } }), 'architect');
  assert.equal(resolveMentorId({}), null);
});

// ---------------------------------------------------------------------------
// classifySkill (bucket logic)
// ---------------------------------------------------------------------------

test('classifySkill: empty chain → requires_customization', () => {
  const r = classifySkill([], new Set(), new Set());
  assert.equal(r.status, 'requires_customization');
});

test('classifySkill: all tasks present → passed', () => {
  const r = classifySkill(['a.md'], new Set(['a.md']), new Set());
  assert.equal(r.status, 'passed');
  assert.deepEqual(r.missing, []);
});

test('classifySkill: all tasks missing → missing_dependencies', () => {
  const r = classifySkill(['a.md'], new Set(), new Set(['a.md']));
  assert.equal(r.status, 'missing_dependencies');
  assert.deepEqual(r.missing, ['a.md']);
});

test('classifySkill: partial chain → requires_customization with missing list', () => {
  const r = classifySkill(['a.md', 'b.md'], new Set(['a.md']), new Set(['b.md']));
  assert.equal(r.status, 'requires_customization');
  assert.deepEqual(r.missing, ['b.md']);
});

// ---------------------------------------------------------------------------
// buildSkillMatrix (AC1) — passed + requires_customization paths
// ---------------------------------------------------------------------------

test('AC1: buildSkillMatrix maps mentor task dependencies to skills and classifies them', () => {
  const agentsDir = writeMentorFixture();
  const tasksDir = writeTasksFixture({ includeGotcha: true });

  const matrix = buildSkillMatrix(squadFixture(), { agentsDir, tasksDir, now: FIXED_NOW });

  assert.equal(matrix.squad_id, 'fraud-squad');
  assert.equal(matrix.mentor, 'dev');
  // dependencies.tasks → dev-develop-story.md (command "develop") + gotcha.md ("gotcha").
  assert.ok(matrix.summary.total >= 2, 'both task-derived skills accounted for');

  const develop = matrix.skills.find((s) => s.command === 'develop');
  assert.equal(develop.status, 'passed', 'develop chain resolves on disk');
  assert.ok(develop.chain.includes('dev-develop-story.md'));

  const gotcha = matrix.skills.find((s) => s.command === 'gotcha');
  assert.equal(gotcha.status, 'passed', 'gotcha chain resolves on disk');
});

test('AC1: buildSkillMatrix derives command names from task stems', () => {
  const matrix = buildSkillMatrix(squadFixture(), {
    agentsDir: writeMentorFixture(),
    tasksDir: writeTasksFixture({ includeGotcha: true }),
    now: FIXED_NOW,
  });
  const commands = matrix.skills.map((s) => s.command);
  assert.ok(commands.includes('develop'), 'dev-develop-story.md → develop');
  assert.ok(commands.includes('gotcha'), 'gotcha.md → gotcha');
});

test('AC2/AC3: missing task on disk → missing_dependencies bucket', () => {
  const agentsDir = writeMentorFixture();
  const tasksDir = writeTasksFixture({ includeGotcha: false }); // gotcha.md absent

  const matrix = buildSkillMatrix(squadFixture(), { agentsDir, tasksDir, now: FIXED_NOW });

  const gotcha = matrix.skills.find((s) => s.command === 'gotcha');
  assert.equal(gotcha.status, 'missing_dependencies');
  assert.ok(gotcha.missing.includes('gotcha.md'));
  assert.equal(matrix.summary.missing_dependencies, 1);
});

test('buildSkillMatrix degrades gracefully when mentor agent is unavailable', () => {
  const matrix = buildSkillMatrix(
    { squad_id: 'ghost-squad', created_from: '@nope' },
    { agentsDir: os.tmpdir(), now: FIXED_NOW },
  );
  assert.equal(matrix.summary.total, 0);
  assert.deepEqual(matrix.skills, []);
});

// ---------------------------------------------------------------------------
// renderReport (AC3 + AC4)
// ---------------------------------------------------------------------------

test('AC3/AC4: report has all three buckets + actionable steps for missing deps', () => {
  const agentsDir = writeMentorFixture();
  const tasksDir = writeTasksFixture({ includeGotcha: false });
  const matrix = buildSkillMatrix(squadFixture(), { agentsDir, tasksDir, now: FIXED_NOW });

  const md = renderReport(matrix);
  assert.match(md, /## ✅ Passed Skills/);
  assert.match(md, /## ⚠️ Requires Customization/);
  assert.match(md, /## ❌ Missing Dependencies/);
  assert.match(md, /## Actionable Steps/);
  assert.match(md, /gotcha\.md/);
  assert.match(md, /Re-run `aiox squad validate fraud-squad`/);
});

// ---------------------------------------------------------------------------
// validateSquadSkills (AC1/AC3/AC5) — end-to-end file writes + timing
// ---------------------------------------------------------------------------

test('AC1/AC3/AC5: validateSquadSkills writes matrix + report under 5s', () => {
  const agentsDir = writeMentorFixture();
  const tasksDir = writeTasksFixture({ includeGotcha: true });
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-out-'));

  const result = validateSquadSkills(squadFixture(), {
    baseDir, agentsDir, tasksDir, now: FIXED_NOW,
  });

  const expectedMatrix = path.join(baseDir, '.aiox', 'squad-dnas', 'fraud-squad-skills.json');
  const expectedReport = path.join(baseDir, 'docs', 'squad-validations', 'fraud-squad-report.md');
  assert.equal(result.matrixPath, expectedMatrix);
  assert.equal(result.reportPath, expectedReport);
  assert.ok(fs.existsSync(expectedMatrix), 'skills.json written');
  assert.ok(fs.existsSync(expectedReport), 'report.md written');
  assert.ok(result.durationMs < 5000, `validation completed in ${result.durationMs}ms (<5s, AC5)`);

  const written = JSON.parse(fs.readFileSync(expectedMatrix, 'utf8'));
  assert.equal(written.squad_id, 'fraud-squad');
});

// ---------------------------------------------------------------------------
// safeSquadId (path-traversal hardening)
// ---------------------------------------------------------------------------

test('safeSquadId accepts safe ids and rejects unsafe ones', () => {
  assert.equal(safeSquadId('fraud-squad'), 'fraud-squad');
  // path.basename strips directory components, so traversal collapses to a leaf;
  // ids with separators or invalid chars (after basename) are rejected.
  assert.throws(() => safeSquadId('foo/bar baz'), /unsafe/); // space → invalid char
  assert.throws(() => safeSquadId('.hidden'), /unsafe/); // dotfile
  assert.throws(() => safeSquadId(''), /required/);
  assert.throws(() => saveSkillMatrix({ squad_id: '.x' }, os.tmpdir()), /unsafe/);
});

// ---------------------------------------------------------------------------
// CLI handler (AC2)
// ---------------------------------------------------------------------------

test('AC2: CLI validates a squad written to disk', () => {
  const agentsDir = writeMentorFixture();
  // Use the real tasks dir implicitly is wrong for determinism; instead write a
  // squad.yaml and rely on validateSquadSkills with default tasks dir. Here we
  // assert the handler resolves path + reports a summary without throwing.
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-cli-'));
  const squadDir = path.join(baseDir, 'squads', 'fraud-squad');
  fs.mkdirSync(squadDir, { recursive: true });
  fs.writeFileSync(
    path.join(squadDir, 'squad.yaml'),
    'squad_id: fraud-squad\ncreated_from: "@nope"\n',
    'utf8',
  );

  const logs = [];
  const result = cli.run(['fraud-squad'], { baseDir, log: (m) => logs.push(m) });
  // mentor "@nope" doesn't resolve → 0 skills, 0 missing → ok:true
  assert.equal(result.ok, true);
  assert.ok(result.matrixPath && result.reportPath);
  assert.ok(logs.some((l) => l.includes('Validated squad: fraud-squad')));
  void agentsDir;
});

test('AC2: CLI reports missing squad-id argument', () => {
  const logs = [];
  const result = cli.run([], { baseDir: os.tmpdir(), log: (m) => logs.push(m) });
  assert.equal(result.ok, false);
  assert.match(result.error, /Missing required argument/);
});
