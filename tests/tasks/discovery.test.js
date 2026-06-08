'use strict';

/**
 * Story 1.17 — Task-First Automation test suite.
 *
 * Covers:
 *   AC1  Auto-discovery: registry built, 200+ tasks indexed, metadata extracted
 *   AC2  Story-type detection + ranked suggestions
 *   AC3  Workflow → anchor tasks (SDC etc.)
 *   AC4/AC6  Metrics counters written to hook-metrics.json
 *
 * Run: node --test tests/tasks/discovery.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const engine = require(path.join(__dirname, '..', '..', '.aiox', 'task-discovery.js'));

/** Build a temp dir of fake task .md files. */
function makeTasksDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content, 'utf8');
  }
  return dir;
}

// ---------------------------------------------------------------------------
// AC1 — discovery + metadata
// ---------------------------------------------------------------------------

test('AC1: real registry indexes 200+ AIOX tasks', () => {
  const reg = engine.buildRegistry(); // default .aiox-core/development/tasks
  assert.ok(reg.taskCount >= 200, `expected >=200 tasks, got ${reg.taskCount}`);
  assert.ok(Array.isArray(reg.tasks));
  assert.ok(reg.generatedAt);
});

test('AC1: each task entry has required metadata fields', () => {
  const reg = engine.buildRegistry();
  for (const t of reg.tasks.slice(0, 25)) {
    assert.ok(t.id, 'id');
    assert.ok(t.name, 'name');
    assert.ok(t.file.endsWith('.md'), 'file path');
    assert.ok(typeof t.category === 'string', 'category');
    assert.ok(Array.isArray(t.triggers) && t.triggers.length, 'triggers');
  }
});

test('AC1: frontmatter metadata overrides inference', () => {
  const dir = makeTasksDir({
    'sample.md': '---\ncategory: db\ntrigger_context: [pre-commit]\nautomated: true\ninteractive: false\n---\n# Sample\n',
  });
  const reg = engine.buildRegistry(dir);
  const t = reg.tasks[0];
  assert.strictEqual(t.category, 'db');
  assert.deepStrictEqual(t.triggers, ['pre-commit']);
  assert.strictEqual(t.automated, true);
  assert.strictEqual(t.interactive, false);
});

test('AC1: category inferred from filename when no frontmatter', () => {
  assert.strictEqual(engine.inferCategory('db-apply-migration', ''), 'db');
  assert.strictEqual(engine.inferCategory('fix-qa-issues', ''), 'qa');
  assert.strictEqual(engine.inferCategory('create-next-story', ''), 'feature');
  assert.strictEqual(engine.inferCategory('something-unknown', ''), 'general');
});

test('AC1: buildRegistry never throws on a missing dir', () => {
  const reg = engine.buildRegistry('/no/such/dir/xyz');
  assert.strictEqual(reg.taskCount, 0);
  assert.deepStrictEqual(reg.tasks, []);
});

// ---------------------------------------------------------------------------
// AC2 — story type detection + suggestions
// ---------------------------------------------------------------------------

test('AC2: detectStoryType classifies by keywords', () => {
  assert.strictEqual(engine.detectStoryType('Fix login bug'), 'bug');
  assert.strictEqual(engine.detectStoryType('Refactor the payment module'), 'refactor');
  assert.strictEqual(engine.detectStoryType('Design the auth architecture'), 'arch');
  assert.strictEqual(engine.detectStoryType('Implement new dashboard feature'), 'feature');
  assert.strictEqual(engine.detectStoryType(''), 'feature'); // safe default
});

test('AC2: suggestTasks returns ranked, capped suggestions', () => {
  const reg = engine.buildRegistry();
  const res = engine.suggestTasks('Implement a new feature endpoint', { registry: reg, limit: 5 });
  assert.strictEqual(res.storyType, 'feature');
  assert.ok(res.suggestions.length > 0 && res.suggestions.length <= 5);
  // Scores must be descending.
  for (let i = 1; i < res.suggestions.length; i++) {
    assert.ok(res.suggestions[i - 1].score >= res.suggestions[i].score);
  }
});

test('AC2: scoreTask rewards primary category match', () => {
  const feat = { category: 'feature', keywords: [], triggers: ['story-start'] };
  const docs = { category: 'docs', keywords: [], triggers: [] };
  assert.ok(engine.scoreTask(feat, 'feature', '') > engine.scoreTask(docs, 'feature', ''));
});

// ---------------------------------------------------------------------------
// AC3 — workflow anchor tasks
// ---------------------------------------------------------------------------

test('AC3: tasksForWorkflow returns SDC anchor tasks present in registry', () => {
  const reg = engine.buildRegistry();
  const sdc = engine.tasksForWorkflow('SDC', reg);
  const ids = sdc.map(t => t.id);
  assert.ok(ids.includes('dev-develop-story'), 'SDC should include dev-develop-story');
  assert.ok(ids.includes('create-next-story'), 'SDC should include create-next-story');
});

test('AC3: unknown workflow yields empty list (no throw)', () => {
  const reg = engine.buildRegistry();
  assert.deepStrictEqual(engine.tasksForWorkflow('Nope', reg), []);
});

// ---------------------------------------------------------------------------
// AC4 / AC6 — metrics
// ---------------------------------------------------------------------------

test('AC6: recordMetrics writes task counters to a metrics file', () => {
  const metricsPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'metrics-')), 'hook-metrics.json');
  const reg = engine.buildRegistry();
  const out = engine.recordMetrics(reg, { tasksActivated: 3 }, metricsPath);
  assert.ok(out);
  assert.strictEqual(out.tasksIndexed, reg.taskCount);
  assert.strictEqual(out.tasksActivated, 3);
  const written = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  assert.strictEqual(written.taskFirst.tasksIndexed, reg.taskCount);
});

test('AC6: recordMetrics preserves existing metrics keys', () => {
  const metricsPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'metrics-')), 'hook-metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify({ existing: { foo: 1 } }), 'utf8');
  const reg = engine.buildRegistry();
  engine.recordMetrics(reg, {}, metricsPath);
  const written = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  assert.deepStrictEqual(written.existing, { foo: 1 });
  assert.ok(written.taskFirst);
});
