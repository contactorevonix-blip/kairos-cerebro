'use strict';

/**
 * Unit tests for Squad Template Generation — Story 8.3.3
 * Run: node --test tests/squad-creator/squad-template-generator.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  generateSquad,
  createSquad,
  loadBaseTemplate,
  loadMentorAgent,
  validateSquad,
  slugify,
  toYaml,
  parseSimpleYaml,
  normalizeDependencies,
  normalizeAuthority,
} = require('../../squads/squad-creator/core/squad-template-generator');

// ---------------------------------------------------------------------------
// Fixture: a temporary mentor agent .md file with a faithful agent YAML block.
// ---------------------------------------------------------------------------

function writeMentorFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'squad-mentor-'));
  const md = [
    '# mentor',
    '',
    '```yaml',
    'agent:',
    '  name: Dex',
    '  id: dev',
    '  title: Full Stack Developer',
    '  icon: "DEV"',
    'persona:',
    '  role: Expert Senior Software Engineer',
    '  style: Extremely concise, pragmatic, solution-focused',
    'persona_profile:',
    '  archetype: Builder',
    '  communication:',
    '    tone: pragmatic',
    '    emoji_frequency: low',
    '    vocabulary:',
    '      - construir',
    '      - implementar',
    '      - testar',
    '    greeting_levels:',
    '      minimal: dev ready',
    '      named: Dex the Builder ready',
    'dependencies:',
    '  tasks:',
    '    - dev-develop-story.md',
    '    - apply-qa-fixes.md',
    '  checklists:',
    '    - story-dod-checklist.md',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'dev.md'), md, 'utf8');
  return dir;
}

const FIXED_NOW = new Date('2026-06-11T10:00:00.000Z');

function genOpts(agentsDir) {
  return { agentsDir, now: FIXED_NOW, tasksDir: path.join(os.tmpdir(), 'no-tasks-here') };
}

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

test('slugify produces filesystem-safe ids', () => {
  assert.equal(slugify('Fraud Scoring Squad'), 'fraud-scoring-squad');
  assert.equal(slugify('  Multiple   Spaces  '), 'multiple-spaces');
  assert.equal(slugify('Acentuação & símbolos!'), 'acentuacao-simbolos');
});

// ---------------------------------------------------------------------------
// loadBaseTemplate (AC4)
// ---------------------------------------------------------------------------

test('AC4: loadBaseTemplate falls back to bundled default when no file found', () => {
  const { template, source } = loadBaseTemplate(['/nonexistent/squad-tmpl.yaml']);
  assert.equal(source, 'bundled-default');
  assert.equal(template.aiox.type, 'squad');
});

test('AC4: loadBaseTemplate reads the shipped squad template', () => {
  // Uses the real default candidates (shipped squad-template/squad.yaml).
  const { template, source } = loadBaseTemplate();
  assert.ok(source.length > 0);
  assert.ok(template && typeof template === 'object');
});

// ---------------------------------------------------------------------------
// loadMentorAgent
// ---------------------------------------------------------------------------

test('loadMentorAgent parses a mentor agent file', () => {
  const dir = writeMentorFixture();
  const agent = loadMentorAgent('dev', { agentsDir: dir });
  assert.equal(agent.agent.id, 'dev');
  assert.equal(agent.persona_profile.communication.tone, 'pragmatic');
});

test('loadMentorAgent throws on missing mentor file', () => {
  assert.throws(() => loadMentorAgent('ghost', { agentsDir: os.tmpdir() }), /not found/);
});

// ---------------------------------------------------------------------------
// normalizeDependencies / normalizeAuthority (AC2)
// ---------------------------------------------------------------------------

test('AC2: normalizeDependencies flattens to sorted type:name list', () => {
  const deps = normalizeDependencies({
    tasks: ['b.md', 'a.md'],
    checklists: ['c.md'],
  });
  assert.deepEqual(deps, ['checklists:c.md', 'tasks:a.md', 'tasks:b.md']);
});

test('AC2: normalizeDependencies returns [] when absent', () => {
  assert.deepEqual(normalizeDependencies(undefined), []);
});

test('AC2: normalizeAuthority returns inherited marker when none declared', () => {
  const auth = normalizeAuthority({ agent: { id: 'dev' } });
  assert.equal(auth.inherited_from, 'dev');
  assert.ok(typeof auth.note === 'string');
});

// ---------------------------------------------------------------------------
// generateSquad (AC1, AC2, AC5)
// ---------------------------------------------------------------------------

test('AC2: generated squad includes metadata, agents, deps, authority', () => {
  const dir = writeMentorFixture();
  const { squad, meta } = generateSquad(
    { mentor: 'dev', name: 'Fraud Squad', focus: 'fraud-scoring' },
    genOpts(dir),
  );

  assert.equal(meta.squadId, 'fraud-squad');
  assert.equal(squad.squad_id, 'fraud-squad');
  assert.equal(squad.focus_area, 'fraud-scoring');
  assert.equal(squad.created_from, '@dev');

  // Agent definition with voice + thinking DNA applied.
  assert.equal(squad.agents.length, 1);
  const agentDef = squad.agents[0];
  assert.ok(agentDef.voice_dna, 'voice_dna applied');
  assert.equal(agentDef.voice_dna.tone, 'direct + pragmatic');
  assert.ok(agentDef.thinking_dna, 'thinking_dna applied');

  // Inherited dependencies (from mentor dependencies.tasks/checklists).
  assert.ok(squad.dependencies.includes('tasks:dev-develop-story.md'));
  assert.ok(squad.dependencies.includes('checklists:story-dod-checklist.md'));

  // Inherited authority present.
  assert.ok(squad.authority);
});

test('AC5: generated squad includes audit trail "Created from @{mentor} on {date}"', () => {
  const dir = writeMentorFixture();
  const { squad } = generateSquad(
    { mentor: 'dev', name: 'Fraud Squad', focus: 'fraud-scoring' },
    genOpts(dir),
  );
  assert.equal(squad.audit.created_from, 'Created from @dev on 2026-06-11');
  assert.equal(squad.audit.mentor, 'dev');
  assert.ok(squad.audit.dna_sources.voice);
  assert.ok(squad.audit.dna_sources.thinking);
});

test('generateSquad throws on missing required params', () => {
  assert.throws(() => generateSquad({ name: 'x', focus: 'y' }), /mentor is required/);
  assert.throws(() => generateSquad({ mentor: 'dev', focus: 'y' }), /name is required/);
  assert.throws(() => generateSquad({ mentor: 'dev', name: 'x' }), /focus is required/);
});

// ---------------------------------------------------------------------------
// validateSquad
// ---------------------------------------------------------------------------

test('validateSquad flags missing required fields', () => {
  const { valid, missing } = validateSquad({ name: 'x' });
  assert.equal(valid, false);
  assert.ok(missing.includes('squad_id'));
  assert.ok(missing.includes('audit'));
});

test('validateSquad passes for a complete generated squad', () => {
  const dir = writeMentorFixture();
  const { squad } = generateSquad(
    { mentor: 'dev', name: 'Fraud Squad', focus: 'fraud-scoring' },
    genOpts(dir),
  );
  assert.equal(validateSquad(squad).valid, true);
});

// ---------------------------------------------------------------------------
// toYaml / parseSimpleYaml round-trip (AC mitigation: no syntax errors)
// ---------------------------------------------------------------------------

test('toYaml + parseSimpleYaml round-trips scalars, maps, and lists', () => {
  const obj = {
    name: 'Fraud Squad',
    squad_id: 'fraud-squad',
    version: '0.1.0',
    dependencies: ['tasks:a.md', 'tasks:b.md'],
    nested: { a: 1, b: 'two' },
    agents: [{ id: 'x', role: 'lead' }],
  };
  const yaml = toYaml(obj);
  const parsed = parseSimpleYaml(yaml);
  assert.equal(parsed.name, 'Fraud Squad');
  assert.equal(parsed.squad_id, 'fraud-squad');
  assert.deepEqual(parsed.dependencies, ['tasks:a.md', 'tasks:b.md']);
  assert.equal(parsed.nested.b, 'two');
  assert.equal(parsed.agents[0].id, 'x');
});

test('generated squad.yaml re-parses without throwing', () => {
  const dir = writeMentorFixture();
  const { squad } = generateSquad(
    { mentor: 'dev', name: 'Fraud Squad', focus: 'fraud-scoring' },
    genOpts(dir),
  );
  const yaml = toYaml(squad);
  const reparsed = parseSimpleYaml(yaml);
  assert.equal(reparsed.squad_id, 'fraud-squad');
  assert.equal(reparsed.created_from, '@dev');
});

// ---------------------------------------------------------------------------
// createSquad (AC3): writes squads/{squad-id}/squad.yaml
// ---------------------------------------------------------------------------

test('AC3: createSquad writes squads/{squad-id}/squad.yaml', () => {
  const mentorDir = writeMentorFixture();
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'squad-out-'));
  const result = createSquad(
    { mentor: 'dev', name: 'Fraud Squad', focus: 'fraud-scoring' },
    { ...genOpts(mentorDir), baseDir },
  );

  const expected = path.join(baseDir, 'squads', 'fraud-squad', 'squad.yaml');
  assert.equal(result.outPath, expected);
  assert.equal(result.squadId, 'fraud-squad');
  assert.ok(fs.existsSync(expected), 'squad.yaml written to disk');

  const written = fs.readFileSync(expected, 'utf8');
  const parsed = parseSimpleYaml(written);
  assert.equal(parsed.squad_id, 'fraud-squad');
  assert.equal(parsed.created_from, '@dev');
});

// ---------------------------------------------------------------------------
// Integration: real shipped @dev mentor agent (AC1/AC2 end-to-end)
// ---------------------------------------------------------------------------

test('integration: generates a squad from the real @dev agent', () => {
  const realAgentsDir = path.join(__dirname, '..', '..', '.aiox-core', 'development', 'agents');
  if (!fs.existsSync(path.join(realAgentsDir, 'dev.md'))) {
    // Skip gracefully if the shipped agent file is unavailable.
    return;
  }
  const { squad } = generateSquad(
    { mentor: 'dev', name: 'Kairos Fraud Squad', focus: 'fraud-detection' },
    { agentsDir: realAgentsDir, now: FIXED_NOW },
  );
  assert.equal(squad.created_from, '@dev');
  assert.equal(squad.agents[0].voice_dna.tone, 'direct + pragmatic');
  assert.ok(Array.isArray(squad.dependencies));
  assert.equal(validateSquad(squad).valid, true);
});
