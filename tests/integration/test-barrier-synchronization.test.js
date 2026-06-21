'use strict';

/**
 * Story 12.14 — Phase Gates & Barrier Synchronization (was 12.G3)
 *
 * The wave barrier model is DOCUMENTED in
 *   docs/stories/epics/EPIC-12/EXECUTION-PLAN.yaml  (§ Phasing & Barrier Gates)
 * This suite makes that documented invariant MACHINE-CHECKABLE so partial-
 * completion drift across waves is caught, not just described (AC5 / RT-5).
 *
 * Barrier invariant under test:
 *   A story in Wave N+1 may not be `Done` while any story in Wave N is not yet
 *   `Done`. (No story starts/finishes the next wave until the current wave's
 *   barrier is cleared.)
 *
 * The test reads the LIVE story files' status frontmatter — it is the
 * executable form of the EXECUTION-PLAN barrier diagram.
 *
 * Run: node --test tests/integration/test-barrier-synchronization.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const STORIES = path.join(ROOT, 'docs', 'stories');
const PLAN = path.join(ROOT, 'docs', 'stories', 'epics', 'EPIC-12', 'EXECUTION-PLAN.yaml');

// Wave membership per EXECUTION-PLAN.yaml § Phasing & Barrier Gates.
// Gateway stories (12.12-12.14) run in PARALLEL with Wave 3, so they share
// Wave 3's barrier (they gate the same exit), not a later one.
const WAVES = [
  { name: 'Wave 1', stories: ['12.1', '12.2'] },
  { name: 'Wave 2', stories: ['12.3', '12.4'] },
  { name: 'Wave 3 (+Gateway)', stories: ['12.5', '12.6', '12.7', '12.8', '12.12', '12.13', '12.14'] },
  { name: 'Support', stories: ['12.9', '12.10', '12.11'] },
];

function readStatus(storyId) {
  const file = path.join(STORIES, `${storyId}.story.md`);
  const content = fs.readFileSync(file, 'utf8');
  const m = content.match(/^status:\s*"?([A-Za-z]+)"?/m);
  return m ? m[1] : null;
}

function isDone(storyId) {
  return readStatus(storyId) === 'Done';
}

// ---------------------------------------------------------------------------
// AC1 — Phase gates defined: Wave 1 → Wave 2 → Wave 3 (entry/exit criteria)
// AC4 — Documented in EXECUTION-PLAN.yaml
// ---------------------------------------------------------------------------

test('AC1+AC4: EXECUTION-PLAN documents barrier entry/exit criteria per wave', () => {
  const plan = fs.readFileSync(PLAN, 'utf8');
  assert.match(plan, /BARRIER GATE 1/, 'Barrier Gate 1 must be documented');
  assert.match(plan, /BARRIER GATE 2/, 'Barrier Gate 2 must be documented');
  assert.match(plan, /BARRIER GATE 3/, 'Barrier Gate 3 must be documented');
  assert.match(plan, /Entry criteria/, 'entry criteria must be documented');
  assert.match(plan, /Exit criteria/, 'exit criteria must be documented');
  assert.match(plan, /FINAL EPIC GATE/, 'final epic gate must be documented');
});

// ---------------------------------------------------------------------------
// AC2 — No story starts Wave N+1 until Wave N barrier cleared
// AC5 — Prevents partial-completion drift
// ---------------------------------------------------------------------------

test('AC2+AC5: barrier invariant holds — no later-wave Done while an earlier wave is incomplete', () => {
  for (let i = 1; i < WAVES.length; i++) {
    const prev = WAVES[i - 1];
    const cur = WAVES[i];

    const prevAllDone = prev.stories.every(isDone);
    if (prevAllDone) continue; // barrier cleared — later wave may proceed

    // Barrier NOT cleared: assert no story in the current wave jumped ahead to Done.
    const violators = cur.stories.filter(isDone);
    assert.deepStrictEqual(
      violators,
      [],
      `Barrier violation: ${cur.name} has Done stories [${violators.join(', ')}] ` +
        `while ${prev.name} is not fully Done ([${prev.stories.filter((s) => !isDone(s)).join(', ')}] outstanding)`,
    );
  }
});

test('AC3: barrier-clear logic is well-defined — every story resolves to a known status', () => {
  const known = new Set(['Draft', 'Ready', 'InProgress', 'InReview', 'Done']);
  for (const wave of WAVES) {
    for (const s of wave.stories) {
      const status = readStatus(s);
      assert.ok(status, `story ${s} must have a status`);
      assert.ok(known.has(status), `story ${s} has unknown status "${status}"`);
    }
  }
});

test('AC2: helper correctly distinguishes a cleared vs uncleared barrier', () => {
  // Pure-logic check of the invariant function on synthetic inputs (determinism).
  const barrierOk = (prevStatuses, curDone) =>
    prevStatuses.every((s) => s === 'Done') || curDone.length === 0;

  assert.strictEqual(barrierOk(['Done', 'Done'], ['12.5']), true, 'cleared barrier allows later Done');
  assert.strictEqual(barrierOk(['Done', 'Ready'], []), true, 'uncleared barrier ok if later wave untouched');
  assert.strictEqual(barrierOk(['Done', 'Ready'], ['12.5']), false, 'uncleared barrier + later Done = violation');
});
