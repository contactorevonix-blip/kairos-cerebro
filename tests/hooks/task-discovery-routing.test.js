/**
 * @file task-discovery-routing.test.js
 * @version 1.0.0
 * @created 2026-06-08
 * @modified 2026-06-08
 * @description Regression tests for the FP-01 (auto-activation threshold) and
 *   FP-02 (category mislabeling) fixes applied to .aiox/task-discovery.js as
 *   part of Story 5.2 Framework Governance, Task 2.2 (Remediate Violations).
 * @resolves Story 5.2 (Framework Governance Sync-Complete) — FP-01, FP-02
 * @see docs/stories/epics/epic-5-governance/outputs/SYNC-FINDINGS.md
 */

const test = require('node:test');
const assert = require('node:assert');
const td = require('../../.aiox/task-discovery.js');

// --- FP-02: category inference no longer collapses into catch-all buckets ---

test('FP-02: generic create-* tasks resolve to their domain, not a catch-all', () => {
  // create-doc must be docs (was wrongly bucketed qa before the fix)
  assert.strictEqual(td.inferCategory('create-doc', '# Create a document'), 'docs');
  // create-workflow must be workflow
  assert.strictEqual(td.inferCategory('create-workflow', '# Build a workflow'), 'workflow');
  // create-agent must be squad (agent/persona domain)
  assert.strictEqual(td.inferCategory('create-agent', '# Create an agent persona'), 'squad');
});

test('FP-02: pre-push-quality-gate is devops, not db', () => {
  const cat = td.inferCategory('github-devops-pre-push-quality-gate', '# Pre-push quality gate');
  assert.strictEqual(cat, 'devops');
});

test('FP-02: id domain signal wins over body text noise', () => {
  // A db task whose body happens to mention "review" must stay db, not qa.
  const cat = td.inferCategory('db-migration', 'This task includes a review step and a checklist.');
  assert.strictEqual(cat, 'db');
});

test('FP-02: signal-free id falls back to content scan', () => {
  const cat = td.inferCategory('thing', 'This performs a database migration with sql.');
  assert.strictEqual(cat, 'db');
});

// --- FP-01: a confident match clears the auto-activation threshold ----------

test('FP-01: threshold constant is exported and equals 70', () => {
  assert.strictEqual(td.AUTO_ACTIVATION_THRESHOLD, 70);
});

test('FP-01: primary-category match + keyword + story-start clears 70', () => {
  const task = {
    id: 'add-mcp',
    name: 'Add MCP Server',
    category: 'config',
    triggers: ['story-start', 'workflow-phase'],
    keywords: ['mcp', 'add'],
  };
  // storyType config → primary category config → 60, + 'mcp' keyword hit (8)
  // + 'add' keyword hit (8) + story-start (5) = 81 >= 70.
  const score = td.scoreTask(task, 'config', 'add mcp server setup');
  assert.ok(score >= td.AUTO_ACTIVATION_THRESHOLD, `expected >=70, got ${score}`);
});

test('FP-01: an irrelevant task stays well below the threshold', () => {
  const task = {
    id: 'db-migration',
    name: 'DB Migration',
    category: 'db',
    triggers: ['workflow-phase'],
    keywords: ['migration'],
  };
  // storyType docs → categories [docs, qa]; db is not in the list → idx -1 → 0.
  const score = td.scoreTask(task, 'docs', 'write some readme documentation');
  assert.ok(score < td.AUTO_ACTIVATION_THRESHOLD, `expected <70, got ${score}`);
});

test('FP-01: suggestTasks reports threshold and autoActivate flags', () => {
  const registry = {
    taskCount: 2,
    tasks: [
      { id: 'add-mcp', name: 'Add MCP', category: 'config', triggers: ['story-start'], keywords: ['mcp', 'add'] },
      { id: 'db-migration', name: 'DB Migration', category: 'db', triggers: ['workflow-phase'], keywords: ['migration'] },
    ],
  };
  const res = td.suggestTasks('add mcp server config setup', { registry });
  assert.strictEqual(res.threshold, 70);
  assert.ok(Array.isArray(res.suggestions));
  const top = res.suggestions[0];
  assert.strictEqual(top.id, 'add-mcp');
  assert.strictEqual(top.autoActivate, true);
  assert.strictEqual(res.autoActivatable >= 1, true);
});
