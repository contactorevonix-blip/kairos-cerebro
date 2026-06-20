'use strict';

/**
 * test-boundary-enforce.test.js — Story 12.1 (Framework Boundary Enforcement)
 *
 * Verifies that writes to L1 (Framework Core) and L2 (Framework Templates)
 * paths are reliably blocked, decisions are logged to .aiox/gate-logs/, and
 * the .claude/settings.json deny rules cover every L1/L2 path
 * (Constitution Art. VI-VII, FR-1.1–1.4).
 *
 * Story 12.11 aggregates this suite. Run:
 *   node --test tests/hooks/test-boundary-enforce.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const HOOKS = path.join(ROOT, '.claude', 'hooks');
const SETTINGS = path.join(ROOT, '.claude', 'settings.json');

const gate = require(path.join(HOOKS, 'enforce-quality-gates.cjs'));

/**
 * Spawn the gate with a JSON stdin payload in an isolated temp cwd.
 * Returns a `cleanup()` so callers that inspect `cwd` can remove the temp dir
 * once done; tests that ignore it are cleaned up via the global teardown below.
 */
const TEMP_DIRS = [];
function runGate(payload, env = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-boundary-'));
  TEMP_DIRS.push(cwd);
  const res = spawnSync(process.execPath, [path.join(HOOKS, 'enforce-quality-gates.cjs')], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd,
    env: { ...process.env, ...env },
  });
  const cleanup = () => fs.rmSync(cwd, { recursive: true, force: true });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '', cwd, cleanup };
}

test.after(() => {
  for (const dir of TEMP_DIRS) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best-effort cleanup */
    }
  }
});

// ---------------------------------------------------------------------------
// AC1 — enforce-quality-gates.cjs validates L1/L2 boundary (path detection)
// ---------------------------------------------------------------------------

test('AC1: L1 core paths are protected', () => {
  assert.ok(gate.isProtectedPath('.aiox-core/core/gate.js'), 'L1 core file');
  assert.ok(gate.isProtectedPath('.aiox-core/core/synapse/engine.js'), 'L1 nested');
  assert.ok(gate.isProtectedPath('.aiox-core/constitution.md'), 'constitution.md');
  assert.ok(gate.isProtectedPath('bin/aiox.js'), 'bin/aiox.js');
  assert.ok(gate.isProtectedPath('bin/aiox-init.js'), 'bin/aiox-init.js');
});

test('AC1: L2 template/task/checklist/workflow/infra paths are protected', () => {
  assert.ok(gate.isProtectedPath('.aiox-core/development/tasks/dev-develop-story.md'));
  assert.ok(gate.isProtectedPath('.aiox-core/development/templates/story-tmpl.md'));
  assert.ok(gate.isProtectedPath('.aiox-core/development/checklists/story-dod-checklist.md'));
  assert.ok(gate.isProtectedPath('.aiox-core/development/workflows/sdc.yaml'));
  assert.ok(gate.isProtectedPath('.aiox-core/infrastructure/docker-compose.yml'));
});

test('AC1: L3/L4 project paths are NOT protected', () => {
  assert.strictEqual(gate.isProtectedPath('docs/stories/12.1.story.md'), false, 'L4 story');
  assert.strictEqual(gate.isProtectedPath('tests/hooks/x.test.js'), false, 'L4 test');
  assert.strictEqual(gate.isProtectedPath('.aiox-core/data/preferences.md'), false, 'L3 data');
  assert.strictEqual(gate.isProtectedPath('squads/foo/bar.cjs'), false, 'L4 squad');
  assert.strictEqual(gate.isProtectedPath(''), false, 'empty path');
});

test('AC1: hardening — absolute Windows/POSIX paths resolve to project marker', () => {
  assert.ok(
    gate.isProtectedPath('C:\\Users\\x\\KAIROS_CEREBRO\\.aiox-core\\core\\gate.js'),
    'Windows absolute L1',
  );
  assert.ok(
    gate.isProtectedPath('/home/x/project/.aiox-core/development/tasks/t.md'),
    'POSIX absolute L2',
  );
});

test('AC1: hardening — prefix is boundary-anchored (no false positive on substring)', () => {
  // A genuine L4 path whose name merely *contains* a protected dir name must
  // NOT be flagged. `toProjectRelative` anchors at the first marker, so a path
  // with no marker stays as-is and fails the under-dir check.
  assert.strictEqual(
    gate.isProtectedPath('docs/notes-about-aiox-core-development-tasks.md'),
    false,
    'substring lookalike, no real marker',
  );
  assert.strictEqual(
    gate.isUnderDir('.aiox-core/development/tasksDB/x', '.aiox-core/development/tasks/'),
    false,
    'sibling dir with shared prefix is not under the protected dir',
  );
});

// ---------------------------------------------------------------------------
// AC1 + AC4 — end-to-end block, exit code 2, deny payload, gate-log written
// ---------------------------------------------------------------------------

test('AC1+AC4: Write to L1 blocks (exit 2, deny payload)', () => {
  const { code, stdout } = runGate({
    tool_name: 'Write',
    tool_input: { file_path: '.aiox-core/core/x.js', content: 'x' },
  });
  assert.strictEqual(code, 2, 'must exit 2 (block)');
  assert.match(stdout, /deny/, 'must emit deny decision');
  assert.match(stdout, /Art\. VI-VII|boundary/i, 'reason references boundary');
});

test('AC1+AC4: Edit to L2 task blocks (exit 2)', () => {
  const { code, stdout } = runGate({
    tool_name: 'Edit',
    tool_input: { file_path: '.aiox-core/development/tasks/x.md' },
  });
  assert.strictEqual(code, 2);
  assert.match(stdout, /deny/);
});

test('AC1: Write to L4 project path is allowed (no block)', () => {
  const { code, stdout } = runGate({
    tool_name: 'Write',
    tool_input: { file_path: 'docs/stories/x.md', content: 'x' },
  });
  assert.notStrictEqual(code, 2, 'L4 write must not block');
  assert.doesNotMatch(stdout, /deny/);
});

test('AC1: framework protection toggle off → allow with audit log', () => {
  const { code, stdout } = runGate(
    { tool_name: 'Write', tool_input: { file_path: '.aiox-core/core/x.js' } },
    { AIOX_FRAMEWORK_PROTECTION_DISABLED: '1' },
  );
  assert.notStrictEqual(code, 2, 'toggle off must not block');
  assert.doesNotMatch(stdout, /deny/);
});

// ---------------------------------------------------------------------------
// AC4 — Gate decisions logged to .aiox/gate-logs/
// ---------------------------------------------------------------------------

test('AC4: block decision is appended to .aiox/gate-logs/', () => {
  const { cwd } = runGate({
    tool_name: 'Write',
    tool_input: { file_path: '.aiox-core/core/x.js' },
  });
  const logsDir = path.join(cwd, '.aiox', 'gate-logs');
  assert.ok(fs.existsSync(logsDir), 'gate-logs directory created');
  const files = fs.readdirSync(logsDir).filter((f) => f.endsWith('.jsonl'));
  assert.ok(files.length >= 1, 'at least one gate-log file written');
  const lines = fs
    .readFileSync(path.join(logsDir, files[0]), 'utf8')
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l));
  const blocked = lines.find((e) => e.decision === 'block' && e.gate === 'framework-boundary');
  assert.ok(blocked, 'a framework-boundary block decision is logged');
  assert.ok(blocked.timestamp, 'decision has a timestamp');
  assert.ok(blocked.reason, 'decision has a reason');
});

// ---------------------------------------------------------------------------
// AC2 — Deny rules in .claude/settings.json block writes to L1/L2
// ---------------------------------------------------------------------------

test('AC2: settings.json is valid JSON with a permissions.deny array', () => {
  const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
  assert.ok(Array.isArray(settings.permissions?.deny), 'permissions.deny is an array');
});

test('AC2: every L1/L2 path family is denied for Write and Edit', () => {
  const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
  const deny = settings.permissions.deny;

  const requiredFamilies = [
    '.aiox-core/core/**',
    '.aiox-core/development/tasks/**',
    '.aiox-core/development/templates/**',
    '.aiox-core/development/checklists/**',
    '.aiox-core/development/workflows/**',
    '.aiox-core/infrastructure/**',
    '.aiox-core/constitution.md',
    'bin/aiox.js',
    'bin/aiox-init.js',
  ];

  for (const family of requiredFamilies) {
    assert.ok(deny.includes(`Write(${family})`), `Write deny missing for ${family}`);
    assert.ok(deny.includes(`Edit(${family})`), `Edit deny missing for ${family}`);
  }
});

test('AC2: no L1/L2 path is granted in the allow list', () => {
  const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
  const allow = settings.permissions.allow || [];
  // Allowed L3 exceptions only: .aiox-core/data/** and agents/*/MEMORY.md, plus Read.
  const offending = allow.filter((rule) => {
    const m = rule.match(/^(?:Write|Edit|MultiEdit)\((.+)\)$/);
    if (!m) return false;
    const p = m[1];
    return (
      gate.isProtectedPath(p.replace(/\/\*\*$/, '/x')) ||
      p === '.aiox-core/constitution.md' ||
      p.startsWith('bin/aiox')
    );
  });
  assert.deepStrictEqual(offending, [], `L1/L2 paths must not be in allow: ${offending.join(', ')}`);
});

// ---------------------------------------------------------------------------
// AC2 — MultiEdit is also covered (hardening: avoids gate bypass)
// ---------------------------------------------------------------------------

test('AC2: MultiEdit hook is registered for the framework-boundary gate', () => {
  const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
  const pre = settings.hooks?.PreToolUse || [];
  const multiEdit = pre.find((h) => h.matcher === 'MultiEdit');
  assert.ok(multiEdit, 'a MultiEdit PreToolUse matcher exists');
  const cmds = (multiEdit.hooks || []).map((h) => h.command).join(' ');
  assert.match(cmds, /enforce-quality-gates\.cjs/, 'MultiEdit runs the boundary gate');
});
