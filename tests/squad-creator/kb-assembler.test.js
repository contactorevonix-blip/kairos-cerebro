'use strict';

/**
 * Unit tests for Knowledge Base Assembly — Story 8.3.6
 * Run: node --test tests/squad-creator/kb-assembler.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  assembleKB,
  saveKB,
  readKBMetadata,
  isKBStale,
  resolveMentorId,
  KB_SECTIONS,
  summarizeProjectContext,
  safeSquadId,
} = require('../../squads/squad-creator/core/kb-assembler');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function writeMentorFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-mentor-'));
  const md = [
    '# mentor',
    '',
    '```yaml',
    'agent:',
    '  name: Dex',
    '  id: dev',
    '  title: Full Stack Developer',
    'persona:',
    '  role: Expert Senior Software Engineer',
    '  style: Extremely concise, pragmatic, solution-focused',
    'persona_profile:',
    '  communication:',
    '    tone: pragmatic',
    '    vocabulary:',
    '      - build',
    '      - test',
    'dependencies:',
    '  tasks:',
    '    - dev-develop-story.md',
    '  checklists:',
    '    - story-dod-checklist.md',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'dev.md'), md, 'utf8');
  return dir;
}

function writeProjectKb(content = '# Project KB\n\nKairos Check fraud scoring context.\n') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-proj-'));
  const file = path.join(dir, 'aiox-kb.md');
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

function squadFixture() {
  return {
    name: 'Fraud Squad',
    squad_id: 'fraud-squad',
    focus_area: 'fraud-scoring',
    created_from: '@dev',
    audit: { mentor: 'dev' },
  };
}

const FIXED_NOW = new Date('2026-06-11T10:00:00.000Z');

function opts(agentsDir, projectKbPath, extra = {}) {
  return {
    agentsDir,
    projectKbPath,
    tasksDir: path.join(os.tmpdir(), 'kb-no-tasks'),
    now: FIXED_NOW,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// resolveMentorId
// ---------------------------------------------------------------------------

test('resolveMentorId reads created_from, then audit.mentor', () => {
  assert.equal(resolveMentorId({ created_from: '@qa' }), 'qa');
  assert.equal(resolveMentorId({ audit: { mentor: 'pm' } }), 'pm');
  assert.equal(resolveMentorId({}), null);
});

// ---------------------------------------------------------------------------
// assembleKB (AC2, AC4)
// ---------------------------------------------------------------------------

test('AC4: KB markdown has all six fixed sections in order', () => {
  const agentsDir = writeMentorFixture();
  const projectKbPath = writeProjectKb();
  const { markdown } = assembleKB(squadFixture(), opts(agentsDir, projectKbPath));

  let lastIdx = -1;
  for (const section of KB_SECTIONS) {
    const idx = markdown.indexOf(`## ${section}`);
    assert.ok(idx !== -1, `section "${section}" present`);
    assert.ok(idx > lastIdx, `section "${section}" in order`);
    lastIdx = idx;
  }
});

test('AC2: KB merges mentor profile + project context', () => {
  const agentsDir = writeMentorFixture();
  const projectKbPath = writeProjectKb('# Project KB\n\nUNIQUE_PROJECT_MARKER\n');
  const { markdown } = assembleKB(squadFixture(), opts(agentsDir, projectKbPath));

  assert.match(markdown, /Cloned from:\*\* @dev/);
  assert.match(markdown, /Full Stack Developer/); // mentor title
  assert.match(markdown, /UNIQUE_PROJECT_MARKER/); // project context merged
  assert.match(markdown, /story-dod-checklist\.md/); // inherited dependency
});

test('AC2: domain doc is appended when present', () => {
  const agentsDir = writeMentorFixture();
  const projectKbPath = writeProjectKb();
  const domainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-domain-'));
  const domainDocPath = path.join(domainDir, 'fraud-squad.md');
  fs.writeFileSync(domainDocPath, '# Fraud Domain\n\nDOMAIN_SPECIFIC_CONTENT\n', 'utf8');

  const { markdown } = assembleKB(
    squadFixture(),
    opts(agentsDir, projectKbPath, { domainDocPath }),
  );
  assert.match(markdown, /## Domain Documentation/);
  assert.match(markdown, /DOMAIN_SPECIFIC_CONTENT/);
});

test('assembleKB degrades gracefully when mentor agent is unavailable', () => {
  const projectKbPath = writeProjectKb();
  const { markdown, metadata } = assembleKB(
    { squad_id: 'ghost', created_from: '@nope' },
    opts(os.tmpdir(), projectKbPath),
  );
  // Still produces all sections, with honest placeholders.
  for (const section of KB_SECTIONS) assert.ok(markdown.includes(`## ${section}`));
  assert.match(markdown, /Mentor agent unavailable/);
  assert.equal(metadata.mentor, 'nope');
});

test('assembleKB throws without a squad_id', () => {
  assert.throws(() => assembleKB({}), /squad_id/);
});

// ---------------------------------------------------------------------------
// summarizeProjectContext (size mitigation)
// ---------------------------------------------------------------------------

test('summarizeProjectContext truncates oversized content with a note', () => {
  const big = 'x'.repeat(50000);
  const out = summarizeProjectContext(big, 1000);
  assert.ok(out.length < 50000);
  assert.match(out, /truncated for KB size/);
});

test('summarizeProjectContext returns small content unchanged', () => {
  assert.equal(summarizeProjectContext('small'), 'small');
});

// ---------------------------------------------------------------------------
// Metadata + staleness (AC5)
// ---------------------------------------------------------------------------

test('AC5: KB embeds metadata block readable by readKBMetadata', () => {
  const agentsDir = writeMentorFixture();
  const projectKbPath = writeProjectKb();
  const { markdown, metadata } = assembleKB(squadFixture(), opts(agentsDir, projectKbPath));

  const parsed = readKBMetadata(markdown);
  assert.ok(parsed, 'metadata block parsed');
  assert.equal(parsed.squad_id, 'fraud-squad');
  assert.equal(parsed.mentor, 'dev');
  assert.ok(parsed.sources, 'source fingerprints recorded');
  assert.deepEqual(parsed.squad_id, metadata.squad_id);
});

test('AC5: isKBStale flags missing metadata as stale', () => {
  const { stale, changed } = isKBStale(null);
  assert.equal(stale, true);
  assert.ok(changed.includes('<no-metadata>'));
});

test('AC5: isKBStale reports not-stale when source fingerprints unchanged', () => {
  // Use a real in-repo source (the project KB) so fingerprints resolve.
  const metadata = {
    sources: {
      project_kb: require('../../squads/squad-creator/core/kb-assembler')
        .fingerprint(path.join(__dirname, '..', '..', '.aiox-core', 'data', 'aiox-kb.md')),
    },
  };
  // If the project KB exists, an unchanged fingerprint → not stale.
  if (metadata.sources.project_kb) {
    const { stale } = isKBStale(metadata);
    assert.equal(stale, false);
  } else {
    // KB absent in this checkout — treated as not-stale (source skipped).
    const { stale } = isKBStale(metadata);
    assert.equal(stale, false);
  }
});

// ---------------------------------------------------------------------------
// saveKB (AC3): writes squads/{squad-id}/.aiox-core/kb/{squad-id}-kb.md
// ---------------------------------------------------------------------------

test('AC3: saveKB writes squads/{squad-id}/.aiox-core/kb/{squad-id}-kb.md', () => {
  const agentsDir = writeMentorFixture();
  const projectKbPath = writeProjectKb();
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-out-'));

  const result = saveKB(squadFixture(), opts(agentsDir, projectKbPath, { baseDir }));
  const expected = path.join(baseDir, 'squads', 'fraud-squad', '.aiox-core', 'kb', 'fraud-squad-kb.md');
  assert.equal(result.outPath, expected);
  assert.ok(fs.existsSync(expected), 'KB markdown written to disk');

  const written = fs.readFileSync(expected, 'utf8');
  assert.match(written, /# Knowledge Base — fraud-squad/);
  assert.ok(readKBMetadata(written), 'written KB carries metadata');
});

// ---------------------------------------------------------------------------
// safeSquadId
// ---------------------------------------------------------------------------

test('safeSquadId rejects unsafe ids', () => {
  assert.equal(safeSquadId('fraud-squad'), 'fraud-squad');
  assert.throws(() => safeSquadId('.hidden'), /unsafe/);
  assert.throws(() => safeSquadId('a b'), /unsafe/);
  assert.throws(() => safeSquadId(''), /required/);
});
