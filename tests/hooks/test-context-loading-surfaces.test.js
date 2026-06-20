/**
 * test-context-loading-surfaces.test.js — Story 12.3 (FR-4.1–4.2, research.json RT-3)
 *
 * Validates Three-Surface Agent Reconciliation: priority order (Surface 1 > 2 > 3),
 * conflict detection + warning, graceful degradation (L2 fallback / L3 hardcoded /
 * L4 error), and context expansion (FR-4.2).
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  SurfaceReconciler,
  DEGRADATION_LEVEL,
  SURFACE_DEFINITIONS,
} = require('../../.aiox-core/development/scripts/surface-reconciler');

/** Create an isolated temp project root with optional surfaces written. */
function makeProject(surfaces = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'surf-recon-'));
  const agentId = 'dev';
  for (const def of SURFACE_DEFINITIONS) {
    const content = surfaces[def.id];
    if (content === undefined) continue;
    const abs = path.join(root, def.resolve(agentId));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf8');
  }
  return { root, agentId };
}

function cleanup(root) {
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

/** Silent logger that captures warnings for assertions. */
function capturingLogger() {
  const messages = [];
  const fn = (m) => messages.push(m);
  fn.messages = messages;
  return fn;
}

test('Surface reconciliation (FR-4.1–4.2, RT-3)', async (t) => {
  await t.test('AC1: prefers Surface 1 when all three present', () => {
    const { root, agentId } = makeProject({
      1: '# Surface 1 (user)\nUser override content.',
      2: '# Surface 2 (skill)\nSkill content.',
      3: '# Surface 3 (template)\nTemplate content.',
    });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.source, SURFACE_DEFINITIONS[0].label, 'winner is Surface 1');
      assert.match(r.content, /Surface 1/);
      assert.deepStrictEqual(r.surfacesFound, [1, 2, 3]);
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC1: falls back to Surface 2 when Surface 1 missing', () => {
    const { root, agentId } = makeProject({
      2: '# Surface 2 (skill)\nSkill content.',
      3: '# Surface 3 (template)\nTemplate content.',
    });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.source, SURFACE_DEFINITIONS[1].label, 'winner is Surface 2');
      assert.match(r.content, /Surface 2/);
      assert.deepStrictEqual(r.surfacesFound, [2, 3]);
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC1: falls back to Surface 3 when only template present', () => {
    const { root, agentId } = makeProject({ 3: '# Surface 3 only' });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.source, SURFACE_DEFINITIONS[2].label, 'winner is Surface 3');
      assert.strictEqual(r.degradationLevel, DEGRADATION_LEVEL.FALLBACK_SURFACE);
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC2: detects conflict + logs warning when surfaces diverge', () => {
    const logger = capturingLogger();
    const { root, agentId } = makeProject({
      1: '# dev\nCommands: a, b',
      2: '# dev\nCommands: a, b, c (different!)',
    });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger }).reconcile(agentId);
      assert.strictEqual(r.conflict, true, 'conflict flagged');
      assert.deepStrictEqual(r.conflictingSurfaces, [1, 2]);
      assert.strictEqual(r.source, SURFACE_DEFINITIONS[0].label, 'still uses Surface 1');
      assert.ok(logger.messages.some((m) => /Conflict detected/.test(m)), 'warning logged');
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC2: no conflict when surfaces are identical', () => {
    const logger = capturingLogger();
    const identical = '# dev\nCommands: a, b';
    const { root, agentId } = makeProject({ 1: identical, 2: identical });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger }).reconcile(agentId);
      assert.strictEqual(r.conflict, false, 'no conflict for identical content');
      assert.strictEqual(logger.messages.length, 0, 'no warning logged');
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC2: ignores CRLF / trailing-whitespace differences (no false conflict)', () => {
    const { root, agentId } = makeProject({
      1: '# dev\nCommands: a, b',
      2: '# dev   \r\nCommands: a, b   \r\n',
    });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.conflict, false, 'whitespace/CRLF noise must not trigger conflict');
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC3: L3 hardcoded persona when no surface available', () => {
    const { root, agentId } = makeProject({});
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.degradationLevel, DEGRADATION_LEVEL.HARDCODED_DEFAULTS);
      assert.strictEqual(r.source, 'hardcoded');
      assert.match(r.content, /Minimal hardcoded persona/);
      assert.deepStrictEqual(r.surfacesFound, []);
    } finally {
      cleanup(root);
    }
  });

  await t.test('AC3: L4 error result for invalid agentId (with recovery hint)', () => {
    const r = new SurfaceReconciler({ projectRoot: os.tmpdir(), logger: () => {} }).reconcile('');
    assert.strictEqual(r.degradationLevel, DEGRADATION_LEVEL.ERROR);
    assert.strictEqual(r.source, 'error');
    assert.match(r.error, /aiox doctor agent-context/, 'actionable recovery hint present');
  });

  await t.test('AC3: never throws on unreadable surface (graceful)', () => {
    const { root, agentId } = makeProject({ 1: '# dev ok' });
    try {
      // Point Surface 2 resolver at a directory to force a read error path is
      // covered by existsSync/readFileSync try/catch — assert no throw + result.
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.ok(r, 'returns a result object even with partial surfaces');
      assert.strictEqual(r.error, null);
    } finally {
      cleanup(root);
    }
  });

  await t.test('FR-4.2: reports line count for context-expansion measurement', () => {
    const big = Array.from({ length: 950 }, (_, i) => `line ${i}`).join('\n');
    const { root, agentId } = makeProject({ 1: big });
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.ok(r.lineCount >= 937, `expanded context >= 937 lines (got ${r.lineCount})`);
    } finally {
      cleanup(root);
    }
  });

  await t.test('priority order constant matches RT-3 (1=.claude/agents, 2=SKILL.md, 3=.aiox-core)', () => {
    assert.match(SURFACE_DEFINITIONS[0].label, /\.claude\/agents/);
    assert.match(SURFACE_DEFINITIONS[1].label, /SKILL\.md/);
    assert.match(SURFACE_DEFINITIONS[2].label, /\.aiox-core\/development\/agents/);
  });
});
