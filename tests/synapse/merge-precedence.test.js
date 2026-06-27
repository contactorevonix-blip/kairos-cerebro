'use strict';

/**
 * Story 82.2 — SYNAPSE Merge Logic, Layer Re-enablement and Conflict Resolution.
 *
 * Covers AC3 (dedup, attribution), AC4 (L0 wins over L7), AC5 (data-driven
 * precedence) and the FR-5 per-layer trigger evaluation (AC1/AC2) at the
 * engine merge-function level. Conflict cases use SYNTHETIC L7 rules — real
 * `.synapse/commands` parsing is Story 82.5 and out of scope here.
 *
 * Framework: node --test
 * Run: node --test tests/synapse/merge-precedence.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const {
  mergeResultsByPrecedence,
  loadPrecedence,
  computeActiveLayers,
  violatesConstitution,
} = require('../../.aiox-core/core/synapse/engine');

const SYNAPSE_PATH = path.join(process.cwd(), '.synapse');

// ---------------------------------------------------------------------------
// AC5 — Precedence is data-driven (loaded from .synapse/precedence.json)
// ---------------------------------------------------------------------------

test('AC5: precedence table is loaded from .synapse/precedence.json', () => {
  const prec = loadPrecedence(SYNAPSE_PATH);
  assert.strictEqual(prec.L0, 100, 'L0 highest precedence');
  assert.strictEqual(prec.L2, 80, 'L2 above workflow/global');
  assert.strictEqual(prec.L3, 70);
  assert.strictEqual(prec.L1, 30, 'L1 global is low precedence');
  assert.strictEqual(prec.L7, 10, 'L7 star-commands lowest (style only)');
});

test('AC5: swapping the precedence table changes the dedup winner (not hard-coded)', () => {
  // L1 given higher precedence than L2 -> L1 must now win the shared rule.
  const flipped = { L0: 100, L1: 80, L2: 30, L3: 70, L4: 60, L5: 50, L6: 40, L7: 10 };
  const results = [
    { rules: ['Shared rule X'], metadata: { layer: 1 } },
    { rules: ['Shared rule X'], metadata: { layer: 2 } },
  ];
  mergeResultsByPrecedence(results, flipped);
  assert.deepStrictEqual(results[0].rules, ['Shared rule X'], 'L1 keeps rule when given precedence');
  assert.deepStrictEqual(results[1].rules, [], 'L2 drops rule when demoted');
});

// ---------------------------------------------------------------------------
// AC3 — Same rule in L1 and L2 -> appears once, attributed to L2
// ---------------------------------------------------------------------------

test('AC3: identical rule in L1 and L2 is deduped, kept on L2 (higher precedence)', () => {
  const prec = loadPrecedence(SYNAPSE_PATH);
  const results = [
    { rules: ['Use absolute imports', 'L1 only rule'], metadata: { layer: 1 } },
    { rules: ['Use absolute imports', 'L2 only rule'], metadata: { layer: 2 } },
  ];
  mergeResultsByPrecedence(results, prec);
  const l1 = results.find(r => r.metadata.layer === 1).rules;
  const l2 = results.find(r => r.metadata.layer === 2).rules;

  assert.ok(l2.includes('Use absolute imports'), 'shared rule retained on L2');
  assert.ok(!l1.includes('Use absolute imports'), 'shared rule removed from L1');
  assert.deepStrictEqual(l1, ['L1 only rule']);
  assert.deepStrictEqual(l2, ['Use absolute imports', 'L2 only rule']);
});

test('AC3: dedup is case/whitespace insensitive', () => {
  const prec = loadPrecedence(SYNAPSE_PATH);
  const results = [
    { rules: ['Use   Absolute Imports.'], metadata: { layer: 1 } },
    { rules: ['use absolute imports'], metadata: { layer: 2 } },
  ];
  mergeResultsByPrecedence(results, prec);
  assert.deepStrictEqual(results.find(r => r.metadata.layer === 1).rules, []);
  assert.strictEqual(results.find(r => r.metadata.layer === 2).rules.length, 1);
});

// ---------------------------------------------------------------------------
// AC4 — L7 rule conflicting with an L0 constitutional rule is DROPPED
// ---------------------------------------------------------------------------

test('AC4: L0 wins — conflicting L7 directive dropped, L0 preserved', () => {
  const prec = loadPrecedence(SYNAPSE_PATH);
  const results = [
    { rules: ['Always delegate git push to devops'], metadata: { layer: 0 } },
    {
      rules: [
        'Never delegate git push to devops',      // conflicts with L0 -> drop
        'Use concise bullet points in responses',  // style only -> keep
      ],
      metadata: { layer: 7 },
    },
  ];
  mergeResultsByPrecedence(results, prec);
  const l0 = results.find(r => r.metadata.layer === 0).rules;
  const l7 = results.find(r => r.metadata.layer === 7).rules;

  assert.deepStrictEqual(l0, ['Always delegate git push to devops'], 'constitution untouched');
  assert.ok(!l7.some(r => /never delegate git push/i.test(r)), 'conflicting L7 rule dropped');
  assert.ok(l7.includes('Use concise bullet points in responses'), 'non-conflicting style rule kept');
});

test('AC4: violatesConstitution flags opposite-polarity same-subject rules only', () => {
  const constitution = ['Always delegate git push to devops'];
  assert.strictEqual(
    violatesConstitution('Never delegate git push to devops', constitution), true,
    'opposite polarity, same subject -> conflict',
  );
  assert.strictEqual(
    violatesConstitution('Use concise bullet points', constitution), false,
    'unrelated subject -> no conflict',
  );
  assert.strictEqual(
    violatesConstitution('Always delegate git push to devops', constitution), false,
    'same polarity, same subject -> not a conflict (reinforcement)',
  );
});

// ---------------------------------------------------------------------------
// FR-5 — Per-layer trigger evaluation (AC1 / AC2)
// ---------------------------------------------------------------------------

test('AC1: L3 activates when session.active_workflow is set; L0/L1 always on', () => {
  const layers = computeActiveLayers(
    { active_workflow: { id: 'story_development' } }, 'hello', { domains: {} },
  );
  assert.deepStrictEqual(layers, [0, 1, 3]);
});

test('AC2: no L4/L5/L6 triggers -> those layers skipped, L0/L1/L2 unaffected', () => {
  const layers = computeActiveLayers(
    { active_agent: { id: 'dev' } }, 'a normal prompt with no keywords', { domains: {} },
  );
  assert.deepStrictEqual(layers, [0, 1, 2]);
  assert.ok(!layers.includes(4) && !layers.includes(5) && !layers.includes(6));
});

test('FR-5: L6 keyword trigger fires on a manifest recall match', () => {
  const manifest = { domains: { SECURITY: { recall: ['sql injection', 'xss'] } } };
  const layers = computeActiveLayers({}, 'help me fix an sql injection bug', manifest);
  assert.ok(layers.includes(6), 'L6 active when a recall keyword matches');
});

test('FR-5: L7 star-command trigger fires when a *command is present', () => {
  const layers = computeActiveLayers({}, 'please run *develop 82.2', { domains: {} });
  assert.ok(layers.includes(7));
});

test('FR-5: all triggers off -> only L0/L1 (lazy default, no pipeline disable)', () => {
  const layers = computeActiveLayers({}, 'plain prompt', { domains: {} });
  assert.deepStrictEqual(layers, [0, 1]);
});
