/**
 * tests/auto-heal/story-validator.test.js
 * Story 8.4.2 — Self-Healing Story Validation
 */

const test = require('node:test');
const assert = require('node:assert');
const {
  validateStoryWithHealing,
  generateSuggestions,
  analyzeAC,
  detectScopeCreep,
  validateDependencies,
  complexityMismatch,
} = require('../../.aiox-core/core/auto-heal/story-validator');

test('analyzeAC: detects vague AC (< 3 clauses)', () => {
  const result = analyzeAC('User can login');
  assert.strictEqual(result.isVague, true);
  assert.strictEqual(result.clauses, 0);
});

test('analyzeAC: accepts clear AC (Given/When/Then)', () => {
  const acText =
    'Given user credentials When login clicked Then user authenticated';
  const result = analyzeAC(acText);
  assert.strictEqual(result.isVague, false);
  assert.strictEqual(result.clauses >= 3, true);
});

test('detectScopeCreep: identifies >10 AC items', () => {
  const story = {
    acceptanceCriteria: Array(12).fill('AC item'),
  };
  const result = detectScopeCreep(story);
  assert.strictEqual(result.isCreep, true);
  assert.strictEqual(result.count, 12);
});

test('detectScopeCreep: accepts <=10 AC items', () => {
  const story = {
    acceptanceCriteria: Array(8).fill('AC item'),
  };
  const result = detectScopeCreep(story);
  assert.strictEqual(result.isCreep, false);
});

test('validateDependencies: finds missing dependencies', () => {
  const story = {
    dependencies: ['story-1', 'story-999'],
  };
  const allStories = [
    { id: 'story-1', name: 'Story 1' },
    { id: 'story-2', name: 'Story 2' },
  ];
  const result = validateDependencies(story, allStories);
  assert.strictEqual(result.hasMissing, true);
  assert.deepStrictEqual(result.missing, ['story-999']);
});

test('validateDependencies: validates existing dependencies', () => {
  const story = {
    dependencies: ['story-1', 'story-2'],
  };
  const allStories = [
    { id: 'story-1', name: 'Story 1' },
    { id: 'story-2', name: 'Story 2' },
  ];
  const result = validateDependencies(story, allStories);
  assert.strictEqual(result.hasMissing, false);
});

test('complexityMismatch: detects high AC with low points', () => {
  const story = {
    acceptanceCriteria: Array(8).fill('AC item'),
    storyPoints: 2,
  };
  const result = complexityMismatch(story);
  assert.strictEqual(result.isMismatch, true);
});

test('complexityMismatch: accepts matched complexity', () => {
  const story = {
    acceptanceCriteria: Array(5).fill('AC item'),
    storyPoints: 8,
  };
  const result = complexityMismatch(story);
  assert.strictEqual(result.isMismatch, false);
});

test('generateSuggestions: identifies vague AC', () => {
  const story = {
    id: 'story-1',
    acceptanceCriteria: ['User can login'],
  };
  const suggestions = generateSuggestions(story);
  const vagueAC = suggestions.find((s) => s.type === 'vague_ac');
  assert.strictEqual(vagueAC !== undefined, true);
});

test('generateSuggestions: identifies scope creep', () => {
  const story = {
    id: 'story-1',
    acceptanceCriteria: Array(15).fill('AC item'),
  };
  const suggestions = generateSuggestions(story);
  const scopeCreep = suggestions.find((s) => s.type === 'scope_creep');
  assert.strictEqual(scopeCreep !== undefined, true);
});

test('validateStoryWithHealing: returns structured result', () => {
  const story = {
    id: 'story-1',
    acceptanceCriteria: ['User can login'],
    storyPoints: 3,
  };
  const result = validateStoryWithHealing(story);
  assert.strictEqual(result.storyId, 'story-1');
  assert.strictEqual(Array.isArray(result.suggestions), true);
  assert.strictEqual(result.refined_story !== undefined, true);
});

test('validateStoryWithHealing: approved when no HIGH severity issues', () => {
  const story = {
    id: 'story-1',
    acceptanceCriteria: [
      'Given precondition When action Then outcome',
      'Given another When test Then pass',
    ],
    storyPoints: 5,
  };
  const result = validateStoryWithHealing(story);
  assert.strictEqual(result.isApproved, true);
});

test('validateStoryWithHealing: rejected when HIGH severity issues', () => {
  const story = {
    id: 'story-1',
    acceptanceCriteria: Array(15).fill('AC item'),
    storyPoints: 3,
  };
  const result = validateStoryWithHealing(story);
  assert.strictEqual(result.isApproved, false);
});
