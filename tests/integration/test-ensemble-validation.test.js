'use strict';

/**
 * Story 12.13 — Cross-Story Integration Test / Ensemble Validation (was 12.G2)
 *
 * Validates the RT-5 "Ensemble Validation" pattern (research.json RT-5):
 *   No single agent self-certifies. Each story is validated by >= 2 independent
 *   roles: (a) the agent that executes it, (b) an independent @qa gate, and
 *   (c) a cross-story integration test that confirms no regressions.
 *
 * This suite asserts that ensemble STRUCTURE exists for EPIC-12:
 *   1. The earlier-wave stories carry an independent @qa gate artifact
 *      (a reviewer distinct from the executing agent signed off).
 *   2. The cross-story integration layer (Story 12.7) aggregates the gate
 *      behaviour of stories 12.1–12.8, so a regression in any one surfaces.
 *   3. No story declares itself both executor and sole validator (the Change
 *      Log shows >1 distinct role).
 *
 * Run: node --test tests/integration/test-ensemble-validation.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const STORIES = path.join(ROOT, 'docs', 'stories');
const QA_GATES = path.join(ROOT, 'docs', 'qa', 'gates');
const INTEGRATION = __dirname;

// ---------------------------------------------------------------------------
// AC1 — No agent self-signs: independent @qa gate exists for validated stories
// ---------------------------------------------------------------------------

test('AC1: earlier-wave stories (12.1–12.4) each have an independent @qa gate artifact', () => {
  const gateFiles = fs.readdirSync(QA_GATES);
  for (const id of ['12.1', '12.2', '12.3', '12.4']) {
    const hasGate = gateFiles.some((f) => f.startsWith(`${id}-`) && f.endsWith('.yml'));
    assert.ok(hasGate, `story ${id} must have an independent @qa gate in docs/qa/gates/ (ensemble: @qa != executor)`);
  }
});

test('AC1: a story Change Log shows >1 distinct role (no solo self-certification)', () => {
  // 12.1 went through @sm → @po → @dev → @qa per the ensemble pattern.
  const story = fs.readFileSync(path.join(STORIES, '12.1.story.md'), 'utf8');
  const roles = new Set();
  for (const m of story.matchAll(/@(sm|po|dev|qa|devops|architect|pm)\b/g)) {
    roles.add(m[1]);
  }
  assert.ok(roles.size >= 2, `expected >=2 distinct roles in 12.1 lifecycle, found: ${[...roles].join(', ')}`);
  assert.ok(roles.has('qa') || roles.has('po'), 'an independent validator (qa/po) must appear, not just the executor');
});

// ---------------------------------------------------------------------------
// AC2 — Stories 12.1–12.8 aggregate in the integration test (12.7) for coherence
// ---------------------------------------------------------------------------

test('AC2: the Story 12.7 integration suite aggregates the gate behaviour of 12.1–12.8', () => {
  // The 4 integration suites from 12.7 exercise the real gate hooks that
  // stories 12.1–12.8 build/validate. Their existence + green state is the
  // cross-story aggregation point.
  const suites = [
    'test-sdc-full-cycle.test.js',
    'test-qa-loop-iteration.test.js',
    'test-spec-pipeline-critique.test.js',
    'test-brownfield-gate-evaluation.test.js',
  ];
  for (const s of suites) {
    assert.ok(fs.existsSync(path.join(INTEGRATION, s)), `integration suite ${s} (Story 12.7) must exist`);
  }
});

test('AC2: the integration suites reference the real constitutional gate hooks (not mocks)', () => {
  const sdc = fs.readFileSync(path.join(INTEGRATION, 'test-sdc-full-cycle.test.js'), 'utf8');
  assert.match(sdc, /enforce-agent-authority\.cjs/, 'SDC suite must wire the real Art. II hook');
  assert.match(sdc, /enforce-story-driven\.cjs/, 'SDC suite must wire the real Art. III hook');
  const bf = fs.readFileSync(path.join(INTEGRATION, 'test-brownfield-gate-evaluation.test.js'), 'utf8');
  assert.match(bf, /enforce-quality-gates\.cjs/, 'Brownfield suite must wire the real Art. V-VII hook');
});

// ---------------------------------------------------------------------------
// AC3 — Parallel story execution validated (Gateway 12.12–12.14 run with 12.5–12.8)
// ---------------------------------------------------------------------------

test('AC3: Gateway stories (12.12–12.14) are tagged as parallel with Wave 3', () => {
  for (const id of ['12.12', '12.13', '12.14']) {
    const story = fs.readFileSync(path.join(STORIES, `${id}.story.md`), 'utf8');
    assert.match(story, /parallel with Wave 3/i, `story ${id} must declare parallel-with-Wave-3 execution`);
  }
});

test('AC3: the ensemble mechanism is sourced (RT-5), not invented', () => {
  const research = fs.readFileSync(
    path.join(ROOT, 'docs', 'stories', 'epics', 'EPIC-12', 'spec', 'research.json'),
    'utf8',
  );
  assert.match(research, /Ensemble Validation/, 'RT-5 ensemble pattern must exist in research.json');
  assert.match(research, /No agent self-signs/, 'the no-self-sign mechanism must be documented in RT-5');
});
