'use strict';

/**
 * Story 5.3.2 — Registration Hook Integration test suite.
 *
 * Covers the auto-contextualization wiring added to
 * `.claude/hooks/agent-activation-tracker.cjs`:
 *   - Phases 1-4 run on agent activation and populate session.context_state (AC1/AC2/AC5)
 *   - context_state contains the required fields incl. phase_4_passed (AC5/AC6)
 *   - timeout path degrades gracefully (null context_state, agent not blocked) (AC3/AC4)
 *   - error path degrades gracefully (engine require failure) (AC4)
 *   - no agent → no engine run, no context_state, stdout still {} (AC4)
 *   - hook never emits to stdout beyond {} (AC4)
 *
 * Run: node --test tests/hooks/auto-contextualization-hook.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const HOOK_FILE = path.join(__dirname, '..', '..', '.claude', 'hooks', 'agent-activation-tracker.cjs');
const hook = require(HOOK_FILE);

/** Build a throwaway project root with a fake/real engine + metrics dir. */
function makeWorkspace(engineSource) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-ctx-'));
  const engineDir = path.join(root, '.synapse', 'context-engine');
  fs.mkdirSync(engineDir, { recursive: true });
  fs.mkdirSync(path.join(root, '.synapse', 'metrics'), { recursive: true });
  fs.writeFileSync(path.join(engineDir, 'engine.js'), engineSource, 'utf8');
  return root;
}

function cleanup(root) {
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch (_) {
    // best-effort
  }
}

/** A minimal in-memory ContextEngine matching the real Phases 1-4 API. */
const FAST_ENGINE = `
module.exports = class ContextEngine {
  async phase1_intake(s) { return { statement: s, intent_type: 'implementation', clarity_score: 0.8 }; }
  async phase2_gapAnalysis(intent) { return { gaps: [{ source: 'project-context' }, { source: 'story-context' }], gap_count: 2 }; }
  async phase3_contextCompletion(gaps) { return { context: {}, completeness: 0.5 }; }
  async phase4_validation(context) { return { passed: !!context.project, checks: [], can_proceed: !!context.project }; }
};
`;

/** An engine that never resolves Phase 1 → forces the timeout path. */
const HANGING_ENGINE = `
module.exports = class ContextEngine {
  async phase1_intake() { return new Promise(() => {}); }
  async phase2_gapAnalysis() { return { gaps: [], gap_count: 0 }; }
  async phase3_contextCompletion() { return { context: {}, completeness: 1 }; }
  async phase4_validation() { return { passed: true, checks: [], can_proceed: true }; }
};
`;

/** An engine that throws in Phase 1 → forces the error path. */
const THROWING_ENGINE = `
module.exports = class ContextEngine {
  async phase1_intake() { throw new Error('boom'); }
  async phase2_gapAnalysis() { return { gaps: [], gap_count: 0 }; }
  async phase3_contextCompletion() { return { context: {}, completeness: 1 }; }
  async phase4_validation() { return { passed: true, checks: [], can_proceed: true }; }
};
`;

// ---------------------------------------------------------------------------
// detectActiveAgent — unchanged behavior must hold (regression guard)
// ---------------------------------------------------------------------------

test('detectActiveAgent: @dev and /AIOX:agents:dev both detected', () => {
  assert.strictEqual(hook.detectActiveAgent('@dev implement X'), 'dev');
  assert.strictEqual(hook.detectActiveAgent('/AIOX:agents:qa review'), 'qa');
  assert.strictEqual(hook.detectActiveAgent('just a normal prompt'), null);
});

// ---------------------------------------------------------------------------
// runContextPhases1To4 — success path (AC1/AC2/AC5/AC6)
// ---------------------------------------------------------------------------

test('runContextPhases1To4: returns required context_state fields', async () => {
  const root = makeWorkspace(FAST_ENGINE);
  try {
    const state = await hook.runContextPhases1To4('@dev implement registration hook', root);
    assert.strictEqual(typeof state.phase_4_passed, 'boolean');
    assert.strictEqual(state.phase_4_passed, false); // context has no .project → informational false (AC6)
    assert.match(state.completed_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.strictEqual(state.intent_type, 'implementation');
    assert.strictEqual(state.completeness, 0.5);
    assert.deepStrictEqual(state.gaps_detected, ['project-context', 'story-context']);
  } finally {
    cleanup(root);
  }
});

test('runContextPhases1To4: does not leak engine console output to stdout (AC4)', async () => {
  const root = makeWorkspace(`
module.exports = class ContextEngine {
  async phase1_intake(s) { console.log('LEAK'); return { intent_type: 'x' }; }
  async phase2_gapAnalysis() { return { gaps: [] }; }
  async phase3_contextCompletion() { return { context: {}, completeness: 1 }; }
  async phase4_validation() { return { passed: true }; }
};
`);
  // Capture stdout while running phases
  const origWrite = process.stdout.write;
  let captured = '';
  process.stdout.write = (chunk, ...rest) => { captured += String(chunk); return origWrite.call(process.stdout, '', ...rest); };
  try {
    await hook.runContextPhases1To4('@dev x', root);
  } finally {
    process.stdout.write = origWrite;
    cleanup(root);
  }
  assert.ok(!captured.includes('LEAK'), 'engine console.log must be silenced');
});

// ---------------------------------------------------------------------------
// runContextPhasesGuarded — degradation paths (AC3/AC4)
// ---------------------------------------------------------------------------

test('runContextPhasesGuarded: timeout returns null (graceful degradation)', async () => {
  const root = makeWorkspace(HANGING_ENGINE);
  try {
    const start = Date.now();
    const state = await hook.runContextPhasesGuarded('@dev hang', root);
    const elapsed = Date.now() - start;
    assert.strictEqual(state, null);
    // Must resolve near the timeout budget, not hang forever
    assert.ok(elapsed >= hook.CONTEXT_PHASES_TIMEOUT_MS - 50, 'should wait for the timeout budget');
    assert.ok(elapsed < hook.CONTEXT_PHASES_TIMEOUT_MS + 1500, 'should not hang past the budget');
    // Degradation logged
    const log = fs.readFileSync(path.join(root, '.aiox', 'context-engine.log'), 'utf8');
    assert.match(log, /TIMEOUT/);
  } finally {
    cleanup(root);
  }
});

test('runContextPhasesGuarded: engine error returns null and logs (AC4)', async () => {
  const root = makeWorkspace(THROWING_ENGINE);
  try {
    const state = await hook.runContextPhasesGuarded('@dev boom', root);
    assert.strictEqual(state, null);
    const log = fs.readFileSync(path.join(root, '.aiox', 'context-engine.log'), 'utf8');
    assert.match(log, /ERROR/);
  } finally {
    cleanup(root);
  }
});

test('runContextPhasesGuarded: missing engine returns null (require failure)', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-ctx-noengine-'));
  try {
    const state = await hook.runContextPhasesGuarded('@dev x', root);
    assert.strictEqual(state, null);
  } finally {
    cleanup(root);
  }
});

test('runContextPhasesGuarded: empty statement returns null without running engine', async () => {
  const root = makeWorkspace(FAST_ENGINE);
  try {
    assert.strictEqual(await hook.runContextPhasesGuarded('', root), null);
    assert.strictEqual(await hook.runContextPhasesGuarded(null, root), null);
  } finally {
    cleanup(root);
  }
});

test('runContextPhasesGuarded: completes well under the 2s budget for a fast engine (AC3)', async () => {
  const root = makeWorkspace(FAST_ENGINE);
  try {
    const start = Date.now();
    const state = await hook.runContextPhasesGuarded('@dev implement X', root);
    const elapsed = Date.now() - start;
    assert.ok(state, 'fast engine should produce a context_state');
    assert.ok(elapsed < hook.CONTEXT_PHASES_TIMEOUT_MS, `expected <2s, got ${elapsed}ms`);
  } finally {
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// writeMetrics — context_state merge (AC5/AC7)
// ---------------------------------------------------------------------------

test('writeMetrics: merges active_agent and context_state into session', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-ctx-metrics-'));
  const metricsPath = path.join(root, '.synapse', 'metrics', 'hook-metrics.json');
  try {
    hook.writeMetrics(metricsPath, { existing: 1 }, 'dev', {
      phase_4_passed: false,
      completed_at: '2026-06-10T10:00:00.000Z',
      intent_type: 'implementation',
      completeness: 0.5,
      gaps_detected: ['project-context'],
    });
    const out = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    assert.strictEqual(out.existing, 1);
    assert.strictEqual(out.session.active_agent.id, 'dev');
    assert.strictEqual(out.session.context_state.phase_4_passed, false);
    assert.strictEqual(out.session.context_state.intent_type, 'implementation');
    assert.strictEqual(out.session.context_state.completeness, 0.5);
    assert.deepStrictEqual(out.session.context_state.gaps_detected, ['project-context']);
  } finally {
    cleanup(root);
  }
});

test('writeMetrics: null context_state omits context_state key (degradation)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-ctx-metrics2-'));
  const metricsPath = path.join(root, '.synapse', 'metrics', 'hook-metrics.json');
  try {
    hook.writeMetrics(metricsPath, {}, 'qa', null);
    const out = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    assert.strictEqual(out.session.active_agent.id, 'qa');
    assert.ok(!('context_state' in out.session), 'no context_state on degradation');
  } finally {
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// End-to-end: spawn the hook with stdin, verify stdout is exactly {} (AC4)
// and that no handoff artifact is created (AC7).
// ---------------------------------------------------------------------------

function spawnHook(payload, cwd) {
  return spawnSync(process.execPath, [HOOK_FILE], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd,
  });
}

test('e2e: agent activation writes context_state, stdout is {}, no handoff (AC4/AC5/AC7)', () => {
  const root = makeWorkspace(FAST_ENGINE);
  try {
    const res = spawnHook({ message: '@dev implement registration hook' }, root);
    assert.strictEqual(res.status, 0);
    assert.strictEqual(res.stdout.trim(), '{}', 'stdout must be exactly {}');

    const metrics = JSON.parse(fs.readFileSync(path.join(root, '.synapse', 'metrics', 'hook-metrics.json'), 'utf8'));
    assert.strictEqual(metrics.session.active_agent.id, 'dev');
    assert.ok(metrics.session.context_state, 'context_state must be populated');
    assert.strictEqual(typeof metrics.session.context_state.phase_4_passed, 'boolean');
    assert.match(metrics.session.context_state.completed_at, /^\d{4}-\d{2}-\d{2}T/);

    // AC7 — no handoff artifact created by Phases 1-4
    assert.ok(!fs.existsSync(path.join(root, '.aiox', 'handoffs')), 'no handoff dir should be created');
  } finally {
    cleanup(root);
  }
});

test('e2e: no agent → no context_state, stdout is {} (AC4)', () => {
  const root = makeWorkspace(FAST_ENGINE);
  try {
    const res = spawnHook({ message: 'just a normal prompt with no agent' }, root);
    assert.strictEqual(res.status, 0);
    assert.strictEqual(res.stdout.trim(), '{}');
    // metrics file should not have been written (no agent detected)
    assert.ok(!fs.existsSync(path.join(root, '.synapse', 'metrics', 'hook-metrics.json')));
  } finally {
    cleanup(root);
  }
});
