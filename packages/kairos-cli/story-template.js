const path = require('path');

function normalizeStoryId(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    throw new Error('Missing story id. Use format like 1.1.1');
  }

  if (!/^\d+\.\d+\.\d+$/.test(raw)) {
    throw new Error('Invalid story id. Expected format N.N.N (example: 1.1.1)');
  }

  return raw;
}

function toStoryFilename(storyId) {
  return `story-${storyId}.md`;
}

function resolveStoryPath(projectRoot, storyId) {
  return path.join(projectRoot, 'docs', 'stories', toStoryFilename(storyId));
}

function buildStoryTemplate(options) {
  const storyId = normalizeStoryId(options.storyId);
  const title = (options.title || '').trim() || `Story ${storyId}`;
  const createdAt = new Date().toISOString();

  return `# Story ${storyId}: ${title}

## Status

Draft

## Story

As a KAIROS operator,
I want a clear implementation scope for story ${storyId},
so that I can execute and validate changes with confidence.

## Acceptance Criteria

- [ ] AC1: Scope is clearly defined
- [ ] AC2: Tests are listed before implementation starts
- [ ] AC3: File List is kept up to date during execution

## Tasks / Subtasks

- [ ] Define implementation tasks
  - [ ] Add or update code
  - [ ] Add or update tests
  - [ ] Run quality gates

## Dev Agent Record

### Agent Model Used

- kairos-cli-v1

### Debug Log References

- ${createdAt} - story scaffold created via kairos init-story

### Completion Notes List

- Pending implementation.

### File List

- docs/stories/story-${storyId}.md

### Change Log

- ${createdAt} - Initial story scaffold created.
`;
}

module.exports = {
  buildStoryTemplate,
  normalizeStoryId,
  resolveStoryPath,
  toStoryFilename,
};
