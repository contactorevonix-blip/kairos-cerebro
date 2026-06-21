'use strict';

/**
 * Story 12.7 — Multi-Workflow Integration Testing
 * Workflow 3 of 4: Spec Pipeline (Phase 1-8)
 *
 * Validates the Spec Pipeline's enforceable behaviour, centred on the
 * constitutional gate that governs it — Art. IV (No Invention) — and the Phase 5
 * critique checklist delivered by Story 12.5.
 *
 * Run: node --test tests/integration/test-spec-pipeline-critique.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const HOOKS = path.join(ROOT, '.claude', 'hooks');

const noInvention = require(path.join(HOOKS, 'enforce-no-invention.cjs'));

function runHook(hookFile, payload, env = {}) {
  const res = spawnSync(process.execPath, [path.join(HOOKS, hookFile)], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// ---------------------------------------------------------------------------
// AC: Spec Pipeline Phase 1-8 flow — uses critique checklist from Story 12.5
// ---------------------------------------------------------------------------

test('Spec Pipeline: Phase 5 critique checklist (Story 12.5) exists and is the rubric', () => {
  const checklist = path.join(ROOT, '.claude', 'rules', 'spec-pipeline-critique-checklist.md');
  assert.ok(fs.existsSync(checklist), 'critique checklist from 12.5 must exist');
  const body = fs.readFileSync(checklist, 'utf8');
  // The 5 critique items required by RT-1.
  ['Persona Alignment', 'Determinism Verification', 'Boundary Enforcement',
    'Gate Coverage', 'Multi-Agent Interaction'].forEach((item) => {
    assert.match(body, new RegExp(item), `checklist must contain the "${item}" rubric item`);
  });
});

test('Spec Pipeline: critique gate template (Story 12.5) exists', () => {
  const tmpl = path.join(ROOT, 'docs', 'qa', 'spec-pipeline-critique-gate.md');
  assert.ok(fs.existsSync(tmpl), 'critique gate template from 12.5 must exist');
});

test('Spec Pipeline: verdict taxonomy is the bounded enum (APPROVED/NEEDS_REVISION/BLOCKED)', () => {
  const checklist = fs.readFileSync(
    path.join(ROOT, '.claude', 'rules', 'spec-pipeline-critique-checklist.md'), 'utf8');
  ['APPROVED', 'NEEDS_REVISION', 'BLOCKED'].forEach((v) => {
    assert.match(checklist, new RegExp(v), `verdict "${v}" must be defined`);
  });
});

// ---------------------------------------------------------------------------
// AC: Art. IV (No Invention) — the gate that protects the Spec Pipeline output
// ---------------------------------------------------------------------------

test('Spec Pipeline: a spec.md statement with no traceability is BLOCKED (Art. IV)', () => {
  const { code, stdout } = runHook(
    'enforce-no-invention.cjs',
    { tool_input: { file_path: 'docs/x-spec.md', content: 'The system MUST invent a feature.' } },
  );
  assert.strictEqual(code, 2, 'untraceable spec statement must be blocked');
  assert.match(stdout, /Article IV/);
});

test('Spec Pipeline: a traceable spec.md statement is ALLOWED (Art. IV)', () => {
  const { code } = runHook(
    'enforce-no-invention.cjs',
    { tool_input: { file_path: 'docs/x-spec.md', content: 'The API MUST rate-limit (FR-12).' } },
  );
  assert.notStrictEqual(code, 2, 'traceable spec statement must pass');
});

test('Spec Pipeline: research citation counts as traceable', () => {
  assert.strictEqual(
    noInvention.findInventions('The cache MUST expire after 5m [research: redis-ttl].').length, 0);
});

test('Spec Pipeline: non-spec docs are NOT subject to Art. IV (gate is scoped)', () => {
  assert.ok(noInvention.isSpecFile('docs/foo-spec.md'));
  assert.ok(!noInvention.isSpecFile('docs/readme.md'));
});

// ---------------------------------------------------------------------------
// AC: Art. IV gate module wired
// ---------------------------------------------------------------------------

test('Spec Pipeline: Art. IV gate module is wired and exposes its API', () => {
  assert.strictEqual(noInvention.ARTICLE, 'art-iv-no-invention');
  assert.ok(typeof noInvention.findInventions === 'function');
});
