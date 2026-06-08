'use strict';

/**
 * Story 1.16 — Constitutional Enforcement Gates test suite.
 *
 * Covers every gate scenario (block / allow / override / warn) using node:test.
 * Pure-function level (deterministic, no stdin) plus end-to-end spawn checks
 * that the block decision exits with code 2 and emits a deny payload.
 *
 * Run: node --test tests/hooks/enforcement.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const HOOKS = path.join(__dirname, '..', '..', '.claude', 'hooks');

const authority = require(path.join(HOOKS, 'enforce-agent-authority.cjs'));
const storyDriven = require(path.join(HOOKS, 'enforce-story-driven.cjs'));
const noInvention = require(path.join(HOOKS, 'enforce-no-invention.cjs'));
const quality = require(path.join(HOOKS, 'enforce-quality-gates.cjs'));
const gl = require(path.join(HOOKS, 'lib', 'gate-logger.cjs'));

/** Spawn a hook with a JSON stdin payload; return { code, stdout, stderr }. */
function runHook(hookFile, payload, env = {}) {
  const res = spawnSync(process.execPath, [path.join(HOOKS, hookFile)], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// ---------------------------------------------------------------------------
// AC1 — Art. II Agent Authority
// ---------------------------------------------------------------------------

test('AC1: git push detected as a remote operation', () => {
  assert.ok(authority.findRemoteOperation('git push origin main'));
  assert.ok(authority.findRemoteOperation('gh pr create --title x'));
  assert.strictEqual(authority.findRemoteOperation('git status'), null);
});

test('AC1: force push matches the most specific pattern', () => {
  const op = authority.findRemoteOperation('git push --force origin main');
  assert.strictEqual(op.operation, 'git push --force');
});

test('AC1: override flag detected', () => {
  assert.ok(authority.hasOverride('git push origin main --skip-devops-check'));
  assert.ok(!authority.hasOverride('git push origin main'));
});

test('AC1: @dev push blocks (exit 2, deny)', () => {
  const { code, stdout } = runHook(
    'enforce-agent-authority.cjs',
    { tool_input: { command: 'git push origin main' } },
    { AIOX_ACTIVE_AGENT: 'dev' },
  );
  assert.strictEqual(code, 2);
  assert.match(stdout, /deny/);
  assert.match(stdout, /Article II/);
});

test('AC1: @devops push allowed (exit 0, no deny)', () => {
  const { code, stdout } = runHook(
    'enforce-agent-authority.cjs',
    { tool_input: { command: 'git push origin main' } },
    { AIOX_ACTIVE_AGENT: 'devops' },
  );
  assert.notStrictEqual(code, 2);
  assert.doesNotMatch(stdout, /"permissionDecision":"deny"/);
});

test('AC1: override flag allows non-@devops push', () => {
  const { code, stdout } = runHook(
    'enforce-agent-authority.cjs',
    { tool_input: { command: 'git push origin main --skip-devops-check' } },
    { AIOX_ACTIVE_AGENT: 'dev' },
  );
  assert.notStrictEqual(code, 2);
  assert.doesNotMatch(stdout, /"permissionDecision":"deny"/);
});

// ---------------------------------------------------------------------------
// AC2 — Art. III Story-Driven
// ---------------------------------------------------------------------------

test('AC2: commit command detected', () => {
  assert.ok(storyDriven.isCommit('git commit -m "x"'));
  assert.ok(!storyDriven.isCommit('git status'));
});

test('AC2: override tag detected in message', () => {
  assert.ok(storyDriven.hasOverrideTag('git commit -m "chore: x [no-story-req]"'));
  assert.ok(!storyDriven.hasOverrideTag('git commit -m "feat: x"'));
});

test('AC2: extractCommitMessage pulls -m content', () => {
  assert.strictEqual(storyDriven.extractCommitMessage('git commit -m "hello world"'), 'hello world');
});

test('AC2: this repo has at least one valid story (allows commit)', () => {
  // Story 1.16 itself is at InProgress, so the live repo must pass.
  const result = storyDriven.hasValidStory(path.join(__dirname, '..', '..'));
  assert.strictEqual(result.found, true);
});

test('AC2: override tag allows commit even with no story dir (exit 0)', () => {
  const { code } = runHook(
    'enforce-story-driven.cjs',
    { tool_input: { command: 'git commit -m "chore: editorconfig [no-story-req]"' } },
  );
  assert.notStrictEqual(code, 2);
});

// ---------------------------------------------------------------------------
// AC3 — Art. IV No Invention
// ---------------------------------------------------------------------------

test('AC3: spec file detected', () => {
  assert.ok(noInvention.isSpecFile('docs/specs/foo-spec.md'));
  assert.ok(!noInvention.isSpecFile('docs/readme.md'));
});

test('AC3: untraceable normative line flagged as invention', () => {
  const content = [
    '# Spec',
    'The system MUST encrypt data at rest.', // invention — no reference
    'The API MUST rate-limit requests (FR-12).', // traced — ok
    'This is a descriptive sentence.', // not normative
  ].join('\n');
  const inventions = noInvention.findInventions(content);
  assert.strictEqual(inventions.length, 1);
  assert.match(inventions[0].text, /encrypt data at rest/);
});

test('AC3: research citation counts as traceable', () => {
  const content = 'The cache MUST expire after 5m [research: redis-ttl].';
  assert.strictEqual(noInvention.findInventions(content).length, 0);
});

test('AC3: default mode warns (exit 0), strict mode blocks (exit 2)', () => {
  const payload = {
    tool_input: { file_path: 'docs/x-spec.md', content: 'It MUST do magic.' },
  };
  const warn = runHook('enforce-no-invention.cjs', payload);
  assert.notStrictEqual(warn.code, 2);

  const strict = runHook('enforce-no-invention.cjs', payload, { AIOX_NO_INVENTION_STRICT: '1' });
  assert.strictEqual(strict.code, 2);
  assert.match(strict.stdout, /Article IV/);
});

// ---------------------------------------------------------------------------
// AC4 — Arts. V-VII Quality + Framework Boundary
// ---------------------------------------------------------------------------

test('AC4: protected L1/L2 paths detected', () => {
  assert.ok(quality.isProtectedPath('.aiox-core/core/synapse/x.js'));
  assert.ok(quality.isProtectedPath('.aiox-core/development/tasks/foo.md'));
  assert.ok(quality.isProtectedPath('.aiox-core/constitution.md'));
  assert.ok(quality.isProtectedPath('bin/aiox.js'));
  assert.ok(!quality.isProtectedPath('docs/stories/1/1.16.story.md'));
  assert.ok(!quality.isProtectedPath('packages/sniper-api/server.js'));
});

test('AC4: merge command detected', () => {
  assert.ok(quality.isMergeCommand('git merge feature/x'));
  assert.ok(!quality.isMergeCommand('git commit -m "x"'));
});

test('AC4: force flag detected', () => {
  assert.ok(quality.hasForce('git merge x --force-gate'));
  assert.ok(!quality.hasForce('git merge x'));
});

test('AC4: write to protected path blocks (exit 2, deny)', () => {
  const { code, stdout } = runHook(
    'enforce-quality-gates.cjs',
    { tool_input: { file_path: '.aiox-core/core/synapse/engine.js', content: 'x' } },
  );
  assert.strictEqual(code, 2);
  assert.match(stdout, /Framework boundary/);
});

test('AC4: write to project path allowed (exit 0)', () => {
  const { code } = runHook(
    'enforce-quality-gates.cjs',
    { tool_input: { file_path: 'docs/stories/1/note.md', content: 'x' } },
  );
  assert.notStrictEqual(code, 2);
});

// ---------------------------------------------------------------------------
// AC5 — Metrics + AC6 — Gate logs (gate-logger.cjs in an isolated cwd)
// ---------------------------------------------------------------------------

test('AC5: recordMetrics accumulates enforcement counters', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-metrics-'));
  gl.recordMetrics({ gatesEnforced: 1, violationsDetected: 1 }, tmp);
  gl.recordMetrics({ gatesEnforced: 1, violationsBlocked: 1, overridesUsed: 1 }, tmp);

  const metrics = JSON.parse(
    fs.readFileSync(path.join(tmp, '.synapse', 'metrics', 'hook-metrics.json'), 'utf8'),
  );
  assert.strictEqual(metrics.enforcement.gatesEnforced, 2);
  assert.strictEqual(metrics.enforcement.violationsDetected, 1);
  assert.strictEqual(metrics.enforcement.violationsBlocked, 1);
  assert.strictEqual(metrics.enforcement.overridesUsed, 1);

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('AC6: logGateDecision creates .aiox/gate-logs and appends a record', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-logs-'));
  const file = gl.logGateDecision(
    { article: 'art-ii-agent-authority', gate: 'agent-authority', decision: 'block', reason: 'test' },
    tmp,
  );
  assert.ok(file);
  assert.ok(fs.existsSync(path.join(tmp, '.aiox', 'gate-logs')));
  const content = fs.readFileSync(file, 'utf8').trim();
  const record = JSON.parse(content);
  assert.strictEqual(record.decision, 'block');
  assert.strictEqual(record.article, 'art-ii-agent-authority');
  assert.ok(record.timestamp);

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('AC5: gate-logger never throws on unwritable paths', () => {
  // A path that cannot be created (null byte) — must degrade, not throw.
  assert.doesNotThrow(() => gl.recordMetrics({ gatesEnforced: 1 }, '\0invalid'));
  assert.doesNotThrow(() => gl.logGateDecision({ article: 'x', decision: 'allow' }, '\0invalid'));
});
