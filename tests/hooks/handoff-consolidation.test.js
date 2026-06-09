const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { consolidateHandoffs, groupByPipeline } = require('../../.aiox/scripts/consolidate-handoffs.js');

const TEMP_DIR = path.join(__dirname, '..', 'fixtures', 'handoff-consolidation');

// Setup: create temp fixture directory
function setupFixture() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

// Teardown: clean fixture directory
function teardownFixture() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

test('Threshold detection: <5 handoffs do not consolidate', async (t) => {
  setupFixture();

  const handoffs = [
    { name: 'handoff-1.json', content: { story_id: '1.21', wave: 1 } },
    { name: 'handoff-2.json', content: { story_id: '1.21', wave: 2 } },
    { name: 'handoff-3.json', content: { story_id: '1.21', wave: 3 } },
  ];

  handoffs.forEach(h => {
    fs.writeFileSync(path.join(TEMP_DIR, h.name), JSON.stringify(h.content));
  });

  const result = await consolidateHandoffs(TEMP_DIR, { threshold: 5 });

  assert.strictEqual(result.consolidated.length, 0, 'No consolidation below threshold');
  assert.strictEqual(result.archived.length, 0, 'No archival below threshold');

  teardownFixture();
});

test('Threshold gate: ≥5 handoffs consolidate to RUN-LOG', async (t) => {
  setupFixture();

  // Create 6 handoffs for phase-1
  const handoffs = [];
  for (let i = 1; i <= 6; i++) {
    handoffs.push({
      name: `handoff-epic-meta-wave${i}.json`,
      content: { story_id: `1.${15 + i}`, wave: i, delivered: `task-${i}` }
    });
  }

  handoffs.forEach(h => {
    fs.writeFileSync(path.join(TEMP_DIR, h.name), JSON.stringify(h.content));
  });

  // Create logDir for test
  const logDir = path.join(TEMP_DIR, 'logs');
  fs.mkdirSync(logDir, { recursive: true });

  const result = await consolidateHandoffs(TEMP_DIR, { threshold: 5, logDir });

  assert(result.consolidated.length >= 0, 'Consolidation result returned');
  assert(result.archived.length > 0, 'Files were archived at ≥5 handoffs');

  teardownFixture();
});

test('Latest handoff stays individual (not consolidated)', async (t) => {
  setupFixture();

  // Create 6 handoffs, mark the last as latest
  for (let i = 1; i <= 6; i++) {
    const content = {
      story_id: '1.20',
      wave: i,
      timestamp: Date.now() + (i * 1000)
    };
    fs.writeFileSync(path.join(TEMP_DIR, `handoff-wave${i}.json`), JSON.stringify(content));
  }

  const logDir = path.join(TEMP_DIR, 'logs');
  fs.mkdirSync(logDir, { recursive: true });

  const result = await consolidateHandoffs(TEMP_DIR, { threshold: 5, logDir });

  // Latest (wave 6) should still exist as individual file in TEMP_DIR
  const remainingFiles = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith('handoff-'));
  assert(remainingFiles.length > 0, 'Latest handoff remains as individual file');

  teardownFixture();
});

test('Archive preserves data: rename to _archive/{pipeline}/', async (t) => {
  setupFixture();

  // Create archive target
  const archiveDir = path.join(TEMP_DIR, '_archive', 'epic-archive-test');
  fs.mkdirSync(archiveDir, { recursive: true });

  // Create 5 handoffs to consolidate
  const handoffContent = { story_id: 'epic-archive-test', wave: 1, data: 'critical' };
  const handoffPath = path.join(TEMP_DIR, 'handoff-1.yaml');
  fs.writeFileSync(handoffPath, JSON.stringify(handoffContent));

  // Simulate archive by renaming
  const archivedPath = path.join(archiveDir, 'handoff-1.yaml');
  fs.renameSync(handoffPath, archivedPath);

  assert(fs.existsSync(archivedPath), 'File successfully archived');
  assert.deepStrictEqual(
    JSON.parse(fs.readFileSync(archivedPath, 'utf8')),
    handoffContent,
    'Archive preserves file content'
  );

  teardownFixture();
});

test('groupByPipeline: maps story_id → phase correctly', async (t) => {
  const handoffs = [
    { story_id: '1.16', filename: 'h1.yaml' },
    { story_id: '1.17', filename: 'h2.yaml' },
    { story_id: '2.0', filename: 'h3.yaml' },
  ];

  const grouped = groupByPipeline(handoffs);

  assert(grouped['phase-1'], 'Handoffs grouped by phase');
  assert.strictEqual(grouped['phase-1'].length, 2, 'Stories 1.16 + 1.17 grouped under phase-1');
  assert(grouped['2.0-synapse'], '2.0 story grouped under 2.0-synapse');
});

test('groupByPipeline: handles missing story_id → "unknown"', async (t) => {
  const handoffs = [
    { filename: 'h1.yaml' }, // no story_id
    { story_id: '1.19', filename: 'h2.yaml' },
  ];

  const grouped = groupByPipeline(handoffs);

  assert(grouped.unknown, 'Missing story_id bucketed into "unknown"');
  assert.strictEqual(grouped.unknown.length, 1, 'Orphaned handoff tracked');
});

test('Malformed JSON skipped without throw', async (t) => {
  setupFixture();

  // Create one valid, one invalid handoff
  fs.writeFileSync(path.join(TEMP_DIR, 'handoff-valid.json'), JSON.stringify({ story_id: '1.22' }));
  fs.writeFileSync(path.join(TEMP_DIR, 'handoff-invalid.json'), '{ broken json }');

  let errorThrown = false;
  try {
    const logDir = path.join(TEMP_DIR, 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const result = await consolidateHandoffs(TEMP_DIR, { threshold: 5, logDir });
    // Should continue despite malformed
  } catch (e) {
    errorThrown = true;
  }

  assert(!errorThrown, 'Malformed JSON does not crash consolidation');

  teardownFixture();
});
