'use strict';

/**
 * Story 10.3 (EPIC-10) — Task Schema verify-only backstop.
 *
 * Makes the verify-only findings (AC5, AC6) and the AC2 re-verification
 * executable and reproducible, so the formal "this defect does not exist"
 * claims are inspectable, not asserted. These are READ-ONLY checks — the test
 * never edits any L2 task file (Edit/Write to .aiox-core/development/tasks/**
 * is hard-denied by .claude/settings.json).
 *
 * Run: node --test tests/agents/task-schema-verify.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const TASKS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '.aiox-core',
  'development',
  'tasks'
);

const STORY_CYCLE = [
  'create-next-story.md',
  'validate-next-story.md',
  'dev-develop-story.md',
  'qa-gate.md',
];

function readTask(name) {
  return fs.readFileSync(path.join(TASKS_DIR, name), 'utf8');
}

function listTaskFiles() {
  return fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith('.md'));
}

/** Strip fenced code blocks so we only inspect real metadata, not examples. */
function stripCodeFences(content) {
  return content.replace(/```[\s\S]*?```/g, '');
}

/**
 * Extract the first ```yaml fenced block that follows a `## Metadata` heading —
 * this is the canonical V2 task-metadata container. Returns '' if none.
 */
function extractMetadataBlock(content) {
  const m = content.match(/##\s*Metadata\s*\n+```ya?ml\s*\n([\s\S]*?)\n```/i);
  return m ? m[1] : '';
}

test('AC2: no bare `version: 2` anywhere; the ONLY non-canonical metadata version is story-checkpoint (quoted)', () => {
  // Part 1: there is no bare `version: <int>` metadata variant (the audit's
  // "6× version: 2" claim) — all multi-major versions are proper semver.
  // Scan only the canonical metadata block (column-0, V2 fenced metadata).
  const bareInts = [];
  for (const f of listTaskFiles()) {
    const meta = extractMetadataBlock(readTask(f));
    if (!meta) continue;
    for (const line of meta.split('\n')) {
      const m = line.match(/^version:\s*["']?(\d+)["']?\s*(?:#.*)?$/i);
      if (m) bareInts.push(`${f}: "${line.trim()}"`);
    }
  }
  assert.deepStrictEqual(
    bareInts,
    [],
    `Bare integer version variants found (audit F5 claim of "version: 2"):\n  ${bareInts.join('\n  ')}`
  );

  // Part 2: scan only the canonical metadata block of each task. The single
  // known real non-canonical value is story-checkpoint.md's quoted version.
  const nonCanonical = [];
  for (const f of listTaskFiles()) {
    const meta = extractMetadataBlock(readTask(f));
    if (!meta) continue;
    for (const line of meta.split('\n')) {
      const m = line.match(/^version:\s*(.+?)\s*$/i);
      if (!m) continue;
      const raw = m[1];
      const val = raw.replace(/^["']|["']$/g, '');
      if (raw !== val || !/^\d+\.\d+\.\d+$/.test(val)) {
        nonCanonical.push(`${f}: "${raw}"`);
      }
    }
  }
  assert.deepStrictEqual(
    nonCanonical,
    ['story-checkpoint.md: ""1.0.0""'],
    'Expected exactly one non-canonical metadata version (story-checkpoint.md ' +
      'quoted), proposed for fix via @aiox-master *propose-modification ' +
      '(docs/architecture/TASK-SCHEMA-NORMALIZATION.md §6a). Got:\n  ' +
      nonCanonical.join('\n  ')
  );
});

test('AC5 (F7): the 4 story-cycle tasks have ZERO circular references', () => {
  // A circular ref would be a story-cycle task declaring another story-cycle
  // task as a hard `next:`/`prerequisite:` in a way that forms a loop.
  const cycleIds = STORY_CYCLE.map((f) => f.replace('.md', ''));
  const loops = [];

  for (const f of STORY_CYCLE) {
    const body = stripCodeFences(readTask(f));
    // Look for literal next:/prerequisite: directives pointing at a sibling.
    const directiveLines = body
      .split('\n')
      .filter((l) => /^\s*(next|prerequisite|prerequisites)\s*:/i.test(l));
    for (const line of directiveLines) {
      for (const id of cycleIds) {
        if (id !== f.replace('.md', '') && line.includes(id)) {
          loops.push(`${f}: ${line.trim()}`);
        }
      }
    }
  }

  assert.deepStrictEqual(
    loops,
    [],
    `Circular story-cycle references detected:\n  ${loops.join('\n  ')}`
  );
});

test('AC5 (F7): qa-gate Prerequisites do NOT reference validate-next-story', () => {
  // The audit's specific claim was qa-gate → validate-next-story. Disprove it.
  const body = readTask('qa-gate.md');
  const prereqMatch = body.match(
    /##\s*Prerequisites\s*\n([\s\S]*?)(?=^##\s)/m
  );
  assert.ok(prereqMatch, 'qa-gate.md must have a Prerequisites section');
  assert.ok(
    !/validate-next-story/.test(prereqMatch[1]),
    'qa-gate Prerequisites must NOT reference validate-next-story (audit F7 claim)'
  );
});

test('AC6 (F8): task_id is NOT 100% — V1 `task:` header dominates', () => {
  let taskIdCount = 0;
  let taskHeaderCount = 0;
  const total = listTaskFiles().length;

  for (const f of listTaskFiles()) {
    const body = stripCodeFences(readTask(f));
    if (/^task_id:/m.test(body)) taskIdCount++;
    if (/^task:/m.test(body)) taskHeaderCount++;
  }

  // Audit claimed task_id 100%. Prove it is a tiny minority.
  assert.ok(
    taskIdCount < total * 0.1,
    `Expected task_id to be a small minority (audit F8 claimed 100%); ` +
      `got ${taskIdCount}/${total}`
  );
  assert.ok(
    taskHeaderCount > taskIdCount,
    `Expected V1 \`task:\` header to dominate over \`task_id:\`; ` +
      `task=${taskHeaderCount}, task_id=${taskIdCount}`
  );
});

module.exports = { STORY_CYCLE, listTaskFiles };
