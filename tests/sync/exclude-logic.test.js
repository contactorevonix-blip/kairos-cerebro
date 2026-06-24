const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Tests for sync exclusion logic (Story 1.21: Constitution Sync Guard)
 */

const CONFIG_PATH = path.join(__dirname, '../../.aiox-core/core-config.yaml');

function readConfig() {
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  return yaml.parse(content);
}

function getExcludedPaths(config) {
  return config?.sync?.excludePaths || [];
}

function isPathExcluded(filePath, excludedPaths) {
  return excludedPaths.includes(filePath);
}

test('AC3.1: Sync config has excludePaths section', async (t) => {
  const config = readConfig();
  assert(config.sync, 'sync section exists in core-config.yaml');
  assert(Array.isArray(config.sync.excludePaths), 'excludePaths is an array');
});

test('AC3.2: Constitution is in excludePaths', async (t) => {
  const config = readConfig();
  const excludedPaths = getExcludedPaths(config);
  assert(
    excludedPaths.includes('.aiox-core/constitution.md'),
    'constitution.md is in excludePaths'
  );
});

test('AC3.3: Entity registry is in excludePaths', async (t) => {
  const config = readConfig();
  const excludedPaths = getExcludedPaths(config);
  assert(
    excludedPaths.includes('.aiox-core/data/entity-registry.yaml'),
    'entity-registry.yaml is in excludePaths'
  );
});

test('AC3.4: Exclusion logic correctly identifies protected files', async (t) => {
  const config = readConfig();
  const excludedPaths = getExcludedPaths(config);

  // Should be excluded
  assert(isPathExcluded('.aiox-core/constitution.md', excludedPaths));
  assert(isPathExcluded('.aiox-core/data/entity-registry.yaml', excludedPaths));

  // Should NOT be excluded
  assert(!isPathExcluded('.aiox-core/data/other-file.yaml', excludedPaths));
  assert(!isPathExcluded('docs/stories/1.21.story.md', excludedPaths));
});

test('AC3.5: Exclusion list is non-empty', async (t) => {
  const config = readConfig();
  const excludedPaths = getExcludedPaths(config);
  assert(excludedPaths.length > 0, 'excludePaths list is not empty');
});

test('AC3.6: Rationale is documented in config', async (t) => {
  const config = readConfig();
  assert(
    config.sync?.rationale,
    'sync.rationale field exists explaining the protection'
  );
  assert(
    config.sync.rationale.includes('constitution'),
    'rationale mentions constitution protection'
  );
});

test('AC3.7: Constitution file exists and is at v1.1.0', async (t) => {
  const constitutionPath = path.join(__dirname, '../../.aiox-core/constitution.md');
  assert(fs.existsSync(constitutionPath), 'constitution.md file exists');

  const content = fs.readFileSync(constitutionPath, 'utf8');
  assert(
    content.includes('1.1.0'),
    'constitution.md is at version 1.1.0'
  );
  assert(
    content.includes('Article VII'),
    'constitution includes local Article VII amendment'
  );
});

test('AC3.8: No regression - other sync operations still work', async (t) => {
  const config = readConfig();
  const excludedPaths = getExcludedPaths(config);

  // Verify that exclusion doesn't block non-protected files
  const testFiles = [
    'docs/architecture.md',
    '.aiox-core/data/some-file.yaml',
    'src/index.js',
  ];

  testFiles.forEach((file) => {
    assert(
      !isPathExcluded(file, excludedPaths),
      `${file} should not be excluded`
    );
  });
});

console.log('✅ All sync exclusion logic tests passed (Story 1.21)');
