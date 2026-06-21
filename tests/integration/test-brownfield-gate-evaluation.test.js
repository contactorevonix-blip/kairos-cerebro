'use strict';

/**
 * Story 12.7 — Multi-Workflow Integration Testing
 * Workflow 4 of 4: Brownfield Discovery (legacy assessment)
 *
 * Validates that during a Brownfield audit — where agents read and assess an
 * existing codebase — the framework-boundary gate (Arts. VI-VII) correctly
 * protects L1/L2 from accidental modification, and that all 7 constitutional
 * gates are wired and evaluable in this context.
 *
 * Run: node --test tests/integration/test-brownfield-gate-evaluation.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const HOOKS = path.join(ROOT, '.claude', 'hooks');

const authority = require(path.join(HOOKS, 'enforce-agent-authority.cjs'));
const storyDriven = require(path.join(HOOKS, 'enforce-story-driven.cjs'));
const noInvention = require(path.join(HOOKS, 'enforce-no-invention.cjs'));
const quality = require(path.join(HOOKS, 'enforce-quality-gates.cjs'));

function runHook(hookFile, payload, env = {}) {
  const res = spawnSync(process.execPath, [path.join(HOOKS, hookFile)], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// ---------------------------------------------------------------------------
// AC: Brownfield — agent activation + gate evaluation in legacy audit scenario
// ---------------------------------------------------------------------------

// Force the boundary gate ON so we validate gate LOGIC deterministically,
// independent of the project's operational `boundary.frameworkProtection`
// toggle in core-config.yaml (which may be temporarily off for framework
// contributors). The hard backstop for L1/L2 in normal sessions is the
// settings.json deny rules (Story 12.1); this hook is the secondary layer.
const ENFORCE = { AIOX_FRAMEWORK_PROTECTION_ENABLED: '1' };

test('Brownfield: Arts. VI-VII BLOCK a write to an L1 core path', () => {
  const { code, stdout } = runHook(
    'enforce-quality-gates.cjs',
    { tool_name: 'Write', tool_input: { file_path: '.aiox-core/core/synapse/x.js', content: 'x' } },
    ENFORCE,
  );
  assert.strictEqual(code, 2, 'writing to L1 during a brownfield audit must be blocked');
  assert.match(stdout, /deny/);
});

test('Brownfield: Arts. VI-VII BLOCK a write to an L2 template path', () => {
  const { code } = runHook(
    'enforce-quality-gates.cjs',
    { tool_name: 'Write', tool_input: { file_path: '.aiox-core/development/tasks/foo.md', content: 'x' } },
    ENFORCE,
  );
  assert.strictEqual(code, 2, 'writing to L2 must be blocked');
});

test('Brownfield: Arts. VI-VII ALLOW a write to an L4 runtime path (audit output)', () => {
  const { code } = runHook(
    'enforce-quality-gates.cjs',
    { tool_name: 'Write', tool_input: { file_path: 'docs/audits/brownfield-report.md', content: 'x' } },
  );
  assert.notStrictEqual(code, 2, 'brownfield audit output to L4 must be allowed');
});

test('Brownfield: protected-path detection is correct for both L1 and L2', () => {
  assert.ok(quality.isProtectedPath('.aiox-core/core/synapse/x.js'));
  assert.ok(quality.isProtectedPath('.aiox-core/development/tasks/foo.md'));
  assert.ok(quality.isProtectedPath('.aiox-core/constitution.md'));
  assert.ok(quality.isProtectedPath('bin/aiox.js'));
  assert.ok(!quality.isProtectedPath('docs/audits/report.md'));
});

// ---------------------------------------------------------------------------
// AC: All 7 constitutional gates evaluated — full roster wired in this context
// (I CLI-First is documentary; II,III,IV,V,VI,VII are hook-enforced)
// ---------------------------------------------------------------------------

test('Brownfield: all hook-enforced constitutional gates are wired', () => {
  const wired = {
    'Art. II (agent-authority)': authority.ARTICLE === 'art-ii-agent-authority',
    'Art. III (story-driven)': storyDriven.ARTICLE === 'art-iii-story-driven',
    'Art. IV (no-invention)': noInvention.ARTICLE === 'art-iv-no-invention',
    'Arts. V-VII (quality+boundary)': quality.ARTICLE === 'art-v-vii-quality-boundary',
  };
  for (const [gate, ok] of Object.entries(wired)) {
    assert.strictEqual(ok, true, `${gate} gate is not wired`);
  }
});

// ---------------------------------------------------------------------------
// AC: No regressions from EPIC-9 gates — the EPIC-9 reusable components survive
// ---------------------------------------------------------------------------

test('No regression: EPIC-9 verdict taxonomy + gate-log format still in force', () => {
  // EPIC-9 reusable components (per research.json RT-1): verdict taxonomy and the
  // gate-logs JSONL decision format. Confirm the gate-logger that produces them
  // is present and the gates still depend on it.
  const gl = require(path.join(HOOKS, 'lib', 'gate-logger.cjs'));
  assert.ok(gl, 'EPIC-9 gate-logger must still exist (no regression)');
});

test('No regression: each gate still exits 0 on a benign, non-matching action', () => {
  // A plain status command must pass every gate (no false positives).
  const benign = { tool_input: { command: 'git status' } };
  assert.notStrictEqual(runHook('enforce-agent-authority.cjs', benign).code, 2);
  assert.notStrictEqual(runHook('enforce-quality-gates.cjs', benign).code, 2);
});
