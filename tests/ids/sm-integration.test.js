'use strict';

/**
 * tests/ids/sm-integration.test.js — Story IDS-OPS.2 (@sm IDS integration).
 *
 * Validates the PreToolUse hook `.claude/hooks/ids-integration-sm-draft.cjs`
 * that wires the IDS Decision Engine into @sm *draft.
 *
 * Coverage (AC3 — >=80%):
 *   - AC1: hook invokes the Decision Engine before story creation.
 *   - AC1: graceful degradation when the engine is unavailable / times out.
 *   - AC2: REUSE → ask (options surfaced); CREATE → allow silently.
 *   - AC2: ADAPT → ask (options surfaced).
 *   - AC2: REUSE/ADAPT rejected → user proceeds with CREATE (option 3 path).
 *
 * Runner: node:test (same pattern as IDS-OPS.1 cli-alias.test.js).
 * The subprocess is mocked via the injectable `runner` so tests are
 * deterministic and never depend on the live registry.
 */

const assert = require('node:assert');
const { test } = require('node:test');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const HOOK_PATH = path.resolve(__dirname, '..', '..', '.claude', 'hooks', 'ids-integration-sm-draft.cjs');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const hook = require(HOOK_PATH);

/** Run the hook as a PreToolUse subprocess, feeding `input` JSON on stdin. */
function runHookProcess(input) {
  const res = spawnSync('node', [HOOK_PATH], {
    cwd: PROJECT_ROOT,
    input: JSON.stringify(input),
    encoding: 'utf-8',
  });
  return { stdout: res.stdout, stderr: res.stderr, exitCode: res.status };
}

// ─── Mock runner factory ─────────────────────────────────────────────────────

/** Build a runner that returns a successful engine JSON payload. */
function mockRunner(payload, { status = 0 } = {}) {
  return () => ({ status, stdout: JSON.stringify(payload), stderr: '' });
}

/** Engine payloads for each decision class. */
function reusePayload(intent = 'render template') {
  return {
    intent,
    recommendations: [
      {
        entityId: 'render-template',
        entityPath: '.aiox-core/development/tasks/render-template.md',
        entityType: 'task',
        relevanceScore: 0.95,
        decision: 'REUSE',
        rationale: 'Excellent match (95% relevance).',
      },
    ],
    summary: { totalEntities: 833, matchesFound: 1, decision: 'REUSE', confidence: 'high' },
    rationale: 'Top recommendation: REUSE "render-template".',
  };
}

function adaptPayload(intent = 'workflow automation') {
  return {
    intent,
    recommendations: [
      {
        entityId: 'mcp-workflow',
        entityPath: '.aiox-core/development/tasks/mcp-workflow.md',
        entityType: 'task',
        relevanceScore: 0.72,
        decision: 'ADAPT',
        rationale: 'Good match (72% relevance) with adaptation potential.',
      },
    ],
    summary: { totalEntities: 833, matchesFound: 1, decision: 'ADAPT', confidence: 'medium' },
    rationale: 'Top recommendation: ADAPT "mcp-workflow".',
  };
}

function createPayload(intent = 'brand new capability xyz') {
  return {
    intent,
    recommendations: [],
    summary: { totalEntities: 833, matchesFound: 0, decision: 'CREATE', confidence: 'low' },
    rationale: 'No suitable match. CREATE justified.',
  };
}

const STORY_INPUT = {
  file_path: 'docs/stories/epics/9.9-some-new-thing.story.md',
  content: '# Story 9.9 — Render Template Engine\n\n## Summary\n\nA task to render templates.\n',
};

// ─── isStoryWrite ────────────────────────────────────────────────────────────

test('isStoryWrite: detects *.story.md writes', () => {
  assert.strictEqual(hook.isStoryWrite({ file_path: 'docs/stories/epics/1.1-x.story.md' }), true);
  assert.strictEqual(hook.isStoryWrite({ path: 'a/b/c.story.md' }), true);
});

test('isStoryWrite: ignores non-story writes', () => {
  assert.strictEqual(hook.isStoryWrite({ file_path: 'src/index.js' }), false);
  assert.strictEqual(hook.isStoryWrite({ file_path: 'README.md' }), false);
  assert.strictEqual(hook.isStoryWrite({}), false);
});

// ─── deriveIntent ────────────────────────────────────────────────────────────

test('deriveIntent: extracts title (strips "Story <id> —")', () => {
  const intent = hook.deriveIntent('# Story IDS-OPS.2 — @sm Integration\n\n## Summary\n\nIntegrar IDS.\n');
  assert.ok(intent.includes('@sm Integration'), 'should keep the human title');
  assert.ok(intent.includes('Integrar IDS'), 'should append the summary');
});

test('deriveIntent: falls back to filename slug when no title', () => {
  const intent = hook.deriveIntent('no heading here', 'docs/stories/epics/IDS-OPS.2-sm-ids-integration.story.md');
  assert.ok(intent.length > 0, 'should produce a non-empty intent');
  assert.ok(intent.includes('sm') || intent.includes('integration'), 'slug-derived intent');
});

test('deriveIntent: never returns empty', () => {
  assert.strictEqual(hook.deriveIntent('', ''), 'new story');
});

test('deriveIntent: truncates very long intents', () => {
  const longTitle = '# ' + 'word '.repeat(100);
  const intent = hook.deriveIntent(longTitle, '');
  assert.ok(intent.length <= 200, 'intent capped at MAX_INTENT_LEN');
});

// ─── runDecisionEngine ───────────────────────────────────────────────────────

test('runDecisionEngine: parses a REUSE payload', () => {
  const res = hook.runDecisionEngine('render template', { runner: mockRunner(reusePayload()) });
  assert.strictEqual(res.available, true);
  assert.strictEqual(res.decision, 'REUSE');
  assert.strictEqual(res.top.entityId, 'render-template');
});

test('runDecisionEngine: degrades on non-zero exit', () => {
  const res = hook.runDecisionEngine('x', { runner: () => ({ status: 1, stdout: '', stderr: 'boom' }) });
  assert.strictEqual(res.available, false);
  assert.ok(res.reason.includes('engine-exit-1'));
});

test('runDecisionEngine: degrades on timeout (spawn error)', () => {
  const timeoutRunner = () => ({ status: null, stdout: '', stderr: '', error: new Error('ETIMEDOUT') });
  const res = hook.runDecisionEngine('x', { runner: timeoutRunner });
  assert.strictEqual(res.available, false);
  assert.ok(res.reason.includes('engine-error'));
});

test('runDecisionEngine: degrades on malformed JSON', () => {
  const res = hook.runDecisionEngine('x', { runner: () => ({ status: 0, stdout: 'not json', stderr: '' }) });
  assert.strictEqual(res.available, false);
  assert.ok(res.reason.includes('parse-error'));
});

test('runDecisionEngine: degrades on missing summary', () => {
  const res = hook.runDecisionEngine('x', { runner: () => ({ status: 0, stdout: '{}', stderr: '' }) });
  assert.strictEqual(res.available, false);
  assert.ok(res.reason.includes('malformed-output'));
});

test('runDecisionEngine: degrades when runner throws', () => {
  const res = hook.runDecisionEngine('x', {
    runner: () => {
      throw new Error('spawn failed');
    },
  });
  assert.strictEqual(res.available, false);
  assert.ok(res.reason.includes('runner-threw'));
});

// ─── classifyDecision ────────────────────────────────────────────────────────

test('classifyDecision: maps each decision class', () => {
  assert.strictEqual(hook.classifyDecision({ available: true, decision: 'REUSE' }), 'reuse');
  assert.strictEqual(hook.classifyDecision({ available: true, decision: 'ADAPT' }), 'adapt');
  assert.strictEqual(hook.classifyDecision({ available: true, decision: 'CREATE' }), 'create');
  assert.strictEqual(hook.classifyDecision({ available: false }), 'degraded');
  assert.strictEqual(hook.classifyDecision(null), 'degraded');
});

// ─── evaluate (the integration decision core) ────────────────────────────────

test('AC2: REUSE → ask, with numbered options for @sm', () => {
  const v = hook.evaluate(STORY_INPUT, { runner: mockRunner(reusePayload()) });
  assert.strictEqual(v.action, 'ask');
  assert.strictEqual(v.permissionDecision, 'ask');
  assert.strictEqual(v.classification, 'reuse');
  assert.ok(v.reason.includes('1.'), 'option 1 present');
  assert.ok(v.reason.includes('2.'), 'option 2 present');
  assert.ok(v.reason.includes('3.'), 'option 3 (CREATE anyway) present');
  assert.ok(v.reason.includes('REUSE'), 'mentions REUSE');
  assert.ok(v.reason.includes('render-template'), 'names the candidate entity');
});

test('AC2: ADAPT → ask, with numbered options for @sm', () => {
  const v = hook.evaluate(STORY_INPUT, { runner: mockRunner(adaptPayload()) });
  assert.strictEqual(v.action, 'ask');
  assert.strictEqual(v.classification, 'adapt');
  assert.ok(v.reason.includes('ADAPT'), 'mentions ADAPT');
  assert.ok(v.reason.includes('mcp-workflow'), 'names the candidate entity');
  assert.ok(v.reason.includes('3.'), 'CREATE-anyway escape hatch present (reject path)');
});

test('AC2: CREATE → allow silently (no prompt)', () => {
  const v = hook.evaluate(STORY_INPUT, { runner: mockRunner(createPayload()) });
  assert.strictEqual(v.action, 'allow');
  assert.strictEqual(v.permissionDecision, 'allow');
  assert.strictEqual(v.classification, 'create');
});

test('AC2: REUSE rejected (option 3) is representable — ask surfaces CREATE escape hatch', () => {
  // The hook cannot itself capture the user choice (hooks are non-interactive),
  // but it MUST always offer option 3 (proceed with CREATE anyway), which is
  // the reject path. Verify it is present for both REUSE and ADAPT.
  const reuse = hook.evaluate(STORY_INPUT, { runner: mockRunner(reusePayload()) });
  const adapt = hook.evaluate(STORY_INPUT, { runner: mockRunner(adaptPayload()) });
  assert.ok(/Prosseguir com CREATE/i.test(reuse.reason), 'REUSE offers reject→CREATE');
  assert.ok(/Prosseguir com CREATE/i.test(adapt.reason), 'ADAPT offers reject→CREATE');
  assert.ok(/AUTO-DECISION/i.test(reuse.reason), 'reject path notes Change Log AUTO-DECISION');
});

test('AC1: graceful degradation — engine unavailable → allow (never blocks)', () => {
  const v = hook.evaluate(STORY_INPUT, { runner: () => ({ status: 1, stdout: '', stderr: 'down' }) });
  assert.strictEqual(v.action, 'allow', 'must allow when IDS is down');
  assert.strictEqual(v.classification, 'degraded');
  assert.ok(v.reason.includes('warn-and-proceed'));
});

test('AC1: graceful degradation — timeout → allow (never blocks)', () => {
  const v = hook.evaluate(STORY_INPUT, {
    runner: () => ({ status: null, stdout: '', stderr: '', error: new Error('ETIMEDOUT') }),
  });
  assert.strictEqual(v.action, 'allow');
  assert.strictEqual(v.classification, 'degraded');
});

test('AC1: non-story writes are skipped (engine not invoked)', () => {
  let called = false;
  const v = hook.evaluate(
    { file_path: 'src/app.js', content: 'x' },
    {
      runner: () => {
        called = true;
        return { status: 0, stdout: '{}', stderr: '' };
      },
    },
  );
  assert.strictEqual(v.action, 'allow');
  assert.strictEqual(v.classification, 'skip');
  assert.strictEqual(called, false, 'engine must not run for non-story writes');
});

test('AC1: Edit-style input (new_string) is also evaluated', () => {
  const v = hook.evaluate(
    { file_path: 'docs/stories/epics/9.9-x.story.md', new_string: '# Story 9.9 — Foo\n\n## Summary\n\nBar.\n' },
    { runner: mockRunner(reusePayload()) },
  );
  assert.strictEqual(v.classification, 'reuse');
});

// ─── main() — end-to-end via subprocess (PreToolUse contract) ────────────────

test('main: non-story write produces no blocking output, exit 0', () => {
  const res = runHookProcess({ tool_input: { file_path: 'src/app.js', content: 'x' } });
  assert.strictEqual(res.exitCode, 0, 'must not block non-story writes');
});

test('main: invalid stdin → allow (exit 0, never blocks @sm)', () => {
  const res = spawnSync('node', [HOOK_PATH], { cwd: PROJECT_ROOT, input: 'not-json', encoding: 'utf-8' });
  assert.strictEqual(res.status, 0, 'parse failure must not block');
});

test('main: real story write runs the live engine and never blocks (exit 0)', () => {
  // End-to-end against the real registry: the decision may be REUSE/ADAPT/CREATE
  // or degrade — in every case the hook must exit 0 (ask/allow, never deny).
  const res = runHookProcess({
    tool_input: {
      file_path: 'docs/stories/epics/9.99-throwaway-test.story.md',
      content: '# Story 9.99 — Throwaway Test\n\n## Summary\n\nA test story for hook coverage.\n',
    },
  });
  assert.strictEqual(res.exitCode, 0, 'hook must never block story creation');
  if (res.stdout && res.stdout.trim()) {
    // If it emitted a decision, it must be a valid PreToolUse `ask`/`allow` (never `deny`).
    const out = JSON.parse(res.stdout);
    assert.ok(out.hookSpecificOutput, 'PreToolUse output present when a decision is emitted');
    assert.notStrictEqual(
      out.hookSpecificOutput.permissionDecision,
      'deny',
      'story creation is never denied by G2',
    );
  }
});
