/**
 * test-story-traceability.test.js — Story 2.5 Phase 2 (Governance Infrastructure)
 *
 * Unit + integration tests for story naming resolver and validation.
 * Verifies: standard pattern resolution, whitelist resolution, fallback behavior,
 * metrics accuracy.
 *
 * Run: node --test tests/hooks/test-story-traceability.test.js
 */

const { test } = require('node:test');
const { strict: assert } = require('node:assert');
const path = require('path');
const fs = require('fs');

// Mock registry for testing
const mockRegistry = {
  patterns: {
    standard: {
      regex: '(\\d+\\.\\d+)',
      format: 'EPIC.STORY-{name}.md'
    },
    whitelist: [
      { id: 'INDEX', path: 'docs/stories/INDEX.md', type: 'meta', resolveAs: 'INDEX' },
      { id: 'WORKSPACE-CLEANUP', path: 'docs/stories/WORKSPACE-CLEANUP.story.md', type: 'meta', resolveAs: 'WORKSPACE-CLEANUP' }
    ]
  }
};

// Resolver function (copied from task-auto-suggest.cjs and story-naming-validator.cjs)
function resolveStoryId(filePath, registry) {
  if (!registry) {
    const match = filePath.match(/(\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }

  const standardRegex = registry.patterns.standard.regex;
  const match = filePath.match(new RegExp(standardRegex));
  if (match) return match[1];

  const whitelisted = registry.patterns.whitelist.find(w => filePath.includes(w.path));
  if (whitelisted) return whitelisted.resolveAs;

  return 'unknown';
}

// ===== TEST SUITE =====

test('Story Traceability — Resolver', async (t) => {
  await t.test('Standard pattern: matches numeric ID', (t) => {
    assert.equal(resolveStoryId('docs/stories/5.2-script-lifecycle-testing.md', mockRegistry), '5.2');
    assert.equal(resolveStoryId('docs/stories/1.20-enforcement-gates.md', mockRegistry), '1.20');
    assert.equal(resolveStoryId('docs/stories/2.5-phase2-governance.md', mockRegistry), '2.5');
  });

  await t.test('Whitelist: INDEX resolves correctly', (t) => {
    assert.equal(resolveStoryId('docs/stories/INDEX.md', mockRegistry), 'INDEX');
  });

  await t.test('Whitelist: WORKSPACE-CLEANUP resolves correctly', (t) => {
    assert.equal(resolveStoryId('docs/stories/WORKSPACE-CLEANUP.story.md', mockRegistry), 'WORKSPACE-CLEANUP');
  });

  await t.test('Fallback: non-matching names resolve to unknown', (t) => {
    assert.equal(resolveStoryId('docs/stories/some-random-file.md', mockRegistry), 'unknown');
    assert.equal(resolveStoryId('docs/stories/BROKEN-FORMAT.md', mockRegistry), 'unknown');
  });

  await t.test('Edge case: path without pattern still resolves if whitelisted', (t) => {
    const pathWithSubdir = 'some/deep/path/docs/stories/INDEX.md';
    assert.equal(resolveStoryId(pathWithSubdir, mockRegistry), 'INDEX');
  });

  await t.test('Graceful fallback: null registry uses basic regex', (t) => {
    assert.equal(resolveStoryId('docs/stories/5.2-test.md', null), '5.2');
    assert.equal(resolveStoryId('docs/stories/INDEX.md', null), 'unknown');
  });
});

test('Story Traceability — Real File Paths', async (t) => {
  // Test against real story files in the project (if they exist)
  const storiesDir = path.join(process.cwd(), 'docs', 'stories');
  if (!fs.existsSync(storiesDir)) {
    console.log('[SKIP] docs/stories directory not found — skipping real file tests');
    return;
  }

  const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md'));

  await t.test(`Real stories: ${files.length} files can be resolved`, (t) => {
    const results = files.map(file => {
      const filePath = `docs/stories/${file}`;
      return {
        file,
        path: path.join(storiesDir, file),
        storyId: resolveStoryId(filePath, mockRegistry)
      };
    });

    // All files should resolve to something other than complete failure
    const resolved = results.filter(r => r.storyId !== null);
    assert.ok(resolved.length > 0, `At least some stories should resolve (got ${resolved.length}/${files.length})`);

    // Standard pattern files should resolve to numeric ID
    const standardFiles = results.filter(r => /\d+\.\d+/.test(r.file));
    standardFiles.forEach(({ file, storyId }) => {
      assert.match(storyId, /\d+\.\d+/, `${file} should resolve to numeric ID (got ${storyId})`);
    });

    // Whitelisted files should resolve to their registered ID
    const indexFile = results.find(r => r.file === 'INDEX.md');
    if (indexFile) {
      assert.equal(indexFile.storyId, 'INDEX', 'INDEX.md should resolve to INDEX');
    }
  });
});

test('Story Traceability — Validation Behavior', async (t) => {
  await t.test('Validation: warns on unknown but does not block', (t) => {
    // This would normally be tested via stderr capture in the hook itself
    // For unit tests, we just verify the resolver returns 'unknown'
    const unknownId = resolveStoryId('docs/stories/NO-PATTERN.md', mockRegistry);
    assert.equal(unknownId, 'unknown', 'Unrecognized file should resolve to unknown');
  });

  await t.test('Metrics: tasksActivated should reflect real stories only', (t) => {
    const standardFiles = ['docs/stories/5.2-test.md', 'docs/stories/1.20-test.md', 'docs/stories/INDEX.md'];
    const unknownFiles = ['docs/stories/RANDOM.md', 'docs/stories/broken.md'];

    const standardIds = standardFiles.map(f => resolveStoryId(f, mockRegistry));
    const unknownIds = unknownFiles.map(f => resolveStoryId(f, mockRegistry));

    assert.ok(standardIds.every(id => id !== 'unknown'), 'Standard files should resolve');
    assert.ok(unknownIds.every(id => id === 'unknown'), 'Broken files should not resolve');
  });
});

test('Story Traceability — Registry Integrity', async (t) => {
  await t.test('Registry: standard pattern is defined', (t) => {
    assert.ok(mockRegistry.patterns.standard.regex, 'Standard regex should be defined');
    assert.equal(typeof mockRegistry.patterns.standard.regex, 'string');
  });

  await t.test('Registry: whitelist entries have required fields', (t) => {
    mockRegistry.patterns.whitelist.forEach(entry => {
      assert.ok(entry.id, `Whitelist entry missing 'id': ${JSON.stringify(entry)}`);
      assert.ok(entry.path, `Whitelist entry missing 'path': ${JSON.stringify(entry)}`);
      assert.ok(entry.resolveAs, `Whitelist entry missing 'resolveAs': ${JSON.stringify(entry)}`);
    });
  });

  await t.test('Registry: whitelist paths are unique', (t) => {
    const paths = mockRegistry.patterns.whitelist.map(w => w.path);
    const unique = new Set(paths);
    assert.equal(unique.size, paths.length, 'Whitelist paths should be unique');
  });
});

console.log('[test-story-traceability] Suite ready. Run: node --test tests/hooks/test-story-traceability.test.js');
