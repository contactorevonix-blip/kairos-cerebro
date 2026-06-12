/**
 * tests/auto-heal/blocker-resolver.test.js
 * Story 8.4.4 — Automated Blocker Resolution
 */

const test = require('node:test');
const assert = require('node:assert');
const {
  checkBlockers,
  detectBlockers,
  generateWorkarounds,
  resolveBlocker,
  escalateBlocker,
  detectCircular,
} = require('../../.aiox-core/core/auto-heal/blocker-resolver');

test('detectBlockers: no blockers when dependencies done', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'Done' },
    { id: 'story-1', status: 'InProgress' },
  ];
  const blockers = detectBlockers('story-1', story, allStories);
  assert.strictEqual(blockers.length, 0);
});

test('detectBlockers: detects incomplete dependency', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'InProgress' },
    { id: 'story-1', status: 'Draft' },
  ];
  const blockers = detectBlockers('story-1', story, allStories);
  assert.strictEqual(blockers.length, 1);
  assert.strictEqual(blockers[0].type, 'dependency_not_done');
});

test('detectBlockers: detects missing dependency', () => {
  const story = { id: 'story-1', dependencies: ['story-missing'] };
  const allStories = [{ id: 'story-1', status: 'Draft' }];
  const blockers = detectBlockers('story-1', story, allStories);
  assert.strictEqual(blockers.length, 1);
  assert.strictEqual(blockers[0].type, 'dependency_not_found');
});

test('detectCircular: finds circular dependency', () => {
  const allStories = [
    { id: 'story-a', dependencies: ['story-b'] },
    { id: 'story-b', dependencies: ['story-c'] },
    { id: 'story-c', dependencies: ['story-a'] },
  ];
  const circular = detectCircular('story-a', allStories);
  assert.strictEqual(circular.length > 0, true);
});

test('detectCircular: no circular in linear chain', () => {
  const allStories = [
    { id: 'story-a', dependencies: ['story-b'] },
    { id: 'story-b', dependencies: ['story-c'] },
    { id: 'story-c', dependencies: [] },
  ];
  const circular = detectCircular('story-a', allStories);
  assert.strictEqual(circular.length, 0);
});

test('generateWorkarounds: creates options for incomplete dependency', () => {
  const blocker = { type: 'dependency_not_done', blockerStoryId: 'story-dep-1' };
  const workarounds = generateWorkarounds(blocker, 'story-1');
  assert.strictEqual(workarounds.length, 3);
  assert.strictEqual(workarounds[0].rank, 1);
  assert.strictEqual(workarounds[0].title, 'Work in parallel');
});

test('generateWorkarounds: creates options for circular dependency', () => {
  const blocker = {
    type: 'circular_dependency',
    blockerStoryIds: ['story-a', 'story-b', 'story-c'],
  };
  const workarounds = generateWorkarounds(blocker, 'story-1');
  assert.strictEqual(workarounds.length, 2);
  assert.strictEqual(workarounds[0].title, 'Break circle');
});

test('checkBlockers: returns blocked=false when no blockers', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'Done' },
    { id: 'story-1', status: 'InProgress' },
  ];
  const result = checkBlockers('story-1', story, allStories);
  assert.strictEqual(result.blocked, false);
  assert.strictEqual(result.blockers.length, 0);
});

test('checkBlockers: returns blocked=true when blockers exist', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'InProgress' },
    { id: 'story-1', status: 'Draft' },
  ];
  const result = checkBlockers('story-1', story, allStories);
  assert.strictEqual(result.blocked, true);
  assert.strictEqual(result.blockers.length, 1);
  assert.strictEqual(result.workarounds.length > 0, true);
});

test('checkBlockers: includes workarounds', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'Draft' },
    { id: 'story-1', status: 'Draft' },
  ];
  const result = checkBlockers('story-1', story, allStories);
  assert.strictEqual(result.workarounds.length > 0, true);
  assert.strictEqual(result.workarounds[0].rank, 1);
});

test('checkBlockers: limits workarounds to top 5', () => {
  const story = { id: 'story-1', dependencies: Array(10).fill('story-dep') };
  const deps = Array(10)
    .fill(null)
    .map((_, i) => ({ id: `story-dep-${i}`, status: 'Draft' }));
  const allStories = [...deps, { id: 'story-1', status: 'Draft' }];

  const result = checkBlockers('story-1', story, allStories);
  assert.strictEqual(result.workarounds.length <= 5, true);
});

test('resolveBlocker: logs resolution', () => {
  const blocker = { type: 'dependency_not_done' };
  const workaround = {
    rank: 1,
    title: 'Work in parallel',
    description: 'test',
  };
  const resolution = resolveBlocker('story-1', workaround, []);
  assert.strictEqual(resolution.storyId, 'story-1');
  assert.strictEqual(resolution.chosenWorkaround, 'Work in parallel');
});

test('escalateBlocker: marks as escalated', () => {
  const blockers = [
    {
      type: 'circular_dependency',
      blockerStoryIds: ['story-a', 'story-b'],
    },
  ];
  const result = escalateBlocker('story-1', blockers);
  assert.strictEqual(result.escalated, true);
  assert.strictEqual(result.storyId, 'story-1');
});

test('checkBlockers: returns estimated resolution time', () => {
  const story = { id: 'story-1', dependencies: ['story-dep-1'] };
  const allStories = [
    { id: 'story-dep-1', status: 'Draft', estimatedDaysToCompletion: 3 },
    { id: 'story-1', status: 'Draft' },
  ];
  const result = checkBlockers('story-1', story, allStories);
  assert.strictEqual(result.estimatedResolutionDays, 3);
});
