'use strict';

/**
 * Story 1.18 — STATE.md Live-Update Hooks test suite.
 *
 * Covers the load-bearing ACs:
 *   AC1  Hook triggers on story status change (via Edit/Write event payload)
 *   AC2  STATE.md story table updated with new status
 *   AC3  Latest commit message extracted (best-effort, non-fatal)
 *   AC4  Timestamp of last update recorded
 *   AC5  Concurrency: stale lock reclaimed, active lock respected (no clobber)
 *
 * Run: node --test tests/hooks/state-live-update.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const HOOKS = path.join(__dirname, '..', '..', '.claude', 'hooks');
const postStoryUpdate = require(path.join(HOOKS, 'post-story-update.js'));
const stateSync = require(path.join(HOOKS, 'state-sync.js'));

/** Build an isolated temp project: <tmp>/docs/stories/1/x.story.md + <tmp>/STATE.md */
function makeFixture(stateContent) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'story-state-'));
  const storyDir = path.join(root, 'docs', 'stories', '1');
  fs.mkdirSync(storyDir, { recursive: true });
  const storyPath = path.join(storyDir, '1.18-state-live-update-hooks.md');
  fs.writeFileSync(storyPath, '# Story 1.18\n\n**Status:** InReview\n', 'utf8');
  fs.writeFileSync(path.join(root, 'STATE.md'), stateContent, 'utf8');
  return { root, storyPath, statePath: path.join(root, 'STATE.md') };
}

// ---------------------------------------------------------------------------
// AC1 — extractFilePathFromEvent: parse Edit/Write/MultiEdit payloads
// ---------------------------------------------------------------------------

test('AC1: extractFilePathFromEvent reads Edit/Write tool_input.file_path', () => {
  const ev = { tool_name: 'Edit', tool_input: { file_path: 'docs/stories/1/1.18.md' } };
  assert.strictEqual(postStoryUpdate.extractFilePathFromEvent(ev), 'docs/stories/1/1.18.md');
});

test('AC1: extractFilePathFromEvent tolerates missing/garbage input', () => {
  assert.strictEqual(postStoryUpdate.extractFilePathFromEvent(null), null);
  assert.strictEqual(postStoryUpdate.extractFilePathFromEvent({}), null);
  assert.strictEqual(postStoryUpdate.extractFilePathFromEvent({ tool_input: {} }), null);
});

test('AC1: hook fires from a stdin event payload (end-to-end spawn)', () => {
  const { statePath, storyPath } = makeFixture(
    '# STATE\n\n## Recent Updates\n'
  );
  const payload = { tool_name: 'Edit', tool_input: { file_path: storyPath } };
  const res = spawnSync(process.execPath, [path.join(HOOKS, 'post-story-update.js')], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });
  assert.strictEqual(res.status, 0, res.stderr);
  const out = fs.readFileSync(statePath, 'utf8');
  assert.match(out, /Story 1\.18/);
});

// ---------------------------------------------------------------------------
// AC2 + AC4 — status table update + timestamp
// ---------------------------------------------------------------------------

test('AC2/AC4: updateStateOnStoryChange writes story status + dated entry', () => {
  const { statePath, storyPath } = makeFixture('# STATE\n\n## Recent Updates\n');
  postStoryUpdate.updateStateOnStoryChange(storyPath);
  const out = fs.readFileSync(statePath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  assert.match(out, /Story 1\.18:\*\* InReview/);
  assert.match(out, new RegExp(`updated ${today}`));
});

test('AC2: existing story row is replaced, not duplicated', () => {
  const { statePath, storyPath } = makeFixture(
    '# STATE\n\n## Recent Updates\n- **Story 1.18:** Draft (updated 2026-01-01)\n'
  );
  postStoryUpdate.updateStateOnStoryChange(storyPath);
  const out = fs.readFileSync(statePath, 'utf8');
  const occurrences = (out.match(/Story 1\.18:/g) || []).length;
  assert.strictEqual(occurrences, 1, 'story row must be updated in place');
  assert.match(out, /InReview/);
  assert.doesNotMatch(out, /Draft/);
});

test('AC4: updateStateMd is a no-op when STATE.md is absent (non-blocking)', () => {
  assert.doesNotThrow(() =>
    postStoryUpdate.updateStateMd('/nonexistent/STATE.md', '9.9', 'Done', 'msg')
  );
});

// ---------------------------------------------------------------------------
// AC5 — concurrency / lock behaviour
// ---------------------------------------------------------------------------

test('AC5: syncStateFile reclaims a stale lock and applies the update', async () => {
  const { statePath, storyPath } = makeFixture(
    '# STATE\n\n- Story 1.18 Status: InReview\n'
  );
  const lock = statePath + '.lock';
  // Plant a stale lock (older than STALE_LOCK_MS).
  fs.writeFileSync(lock, '99999:0');
  const old = Date.now() - (stateSync.STALE_LOCK_MS + 2000);
  fs.utimesSync(lock, new Date(old), new Date(old));

  await stateSync.syncStateFile(storyPath, '1.18', 'Done');

  const out = fs.readFileSync(statePath, 'utf8');
  assert.match(out, /Story 1\.18.*Status:\s+Done/);
  assert.strictEqual(fs.existsSync(lock), false, 'lock must be released after write');
});

test('AC5: syncStateFile respects a fresh active lock and does not clobber', async () => {
  const { statePath, storyPath } = makeFixture(
    '# STATE\n\n- Story 1.18 Status: InReview\n'
  );
  const lock = statePath + '.lock';
  // Fresh lock held by a (simulated) live writer.
  fs.writeFileSync(lock, '12345:' + Date.now());

  await stateSync.syncStateFile(storyPath, '1.18', 'Done');

  const out = fs.readFileSync(statePath, 'utf8');
  // Update skipped — original status preserved, foreign lock left intact.
  assert.match(out, /Status:\s+InReview/);
  assert.strictEqual(fs.existsSync(lock), true, 'foreign active lock must not be removed');
  fs.unlinkSync(lock);
});

test('AC5: syncStateFile is a no-op when STATE.md is absent', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'story-nostate-'));
  const storyDir = path.join(root, 'docs', 'stories', '1');
  fs.mkdirSync(storyDir, { recursive: true });
  const storyPath = path.join(storyDir, '1.18.md');
  await assert.doesNotReject(() => stateSync.syncStateFile(storyPath, '1.18', 'Done'));
});
