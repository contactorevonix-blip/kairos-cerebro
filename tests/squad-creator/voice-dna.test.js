'use strict';

/**
 * Unit tests for Voice DNA Extraction — Story 8.3.1
 * Run: node --test tests/squad-creator/voice-dna.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  extractVoiceDNA,
  saveVoiceDNA,
  parseAgentBlock,
  classifyTone,
  extractEmojiStyle,
  extractGreetingTemplate,
  loadToneClasses,
} = require('../../squads/squad-creator/core/voice-dna');

// Faithful subset of the real @dev (Dex) agent YAML structure.
const devAgent = {
  agent: { name: 'Dex', id: 'dev', title: 'Full Stack Developer', icon: '💻' },
  persona_profile: {
    archetype: 'Builder',
    communication: {
      tone: 'pragmatic',
      emoji_frequency: 'medium',
      vocabulary: ['construir', 'implementar', 'refatorar', 'resolver', 'otimizar', 'debugar', 'testar'],
      greeting_levels: {
        minimal: '💻 dev Agent ready',
        named: "💻 Dex (Builder) ready. Let's build something great!",
        archetypal: '💻 Dex the Builder ready to innovate!',
      },
      signature_closing: '— Dex, sempre construindo 🔨',
    },
  },
  persona: {
    role: 'Expert Senior Software Engineer & Implementation Specialist',
    style: 'Extremely concise, pragmatic, detail-oriented, solution-focused',
    identity: 'Expert who implements stories by reading requirements',
    focus: 'Executing story tasks with precision',
  },
};

test('AC4: @dev voice tone resolves to "direct + pragmatic"', () => {
  const dna = extractVoiceDNA(devAgent);
  assert.equal(dna.tone, 'direct + pragmatic');
});

test('AC2: DNA model includes all required fields', () => {
  const dna = extractVoiceDNA(devAgent);
  assert.equal(dna.agent_id, 'dev');
  assert.equal(typeof dna.tone, 'string');
  assert.ok(Array.isArray(dna.signature_vocab));
  assert.ok(dna.signature_vocab.length <= 10);
  assert.ok(dna.emoji_style && typeof dna.emoji_style.frequency === 'string');
  assert.ok(Array.isArray(dna.emoji_style.favorites));
  assert.equal(typeof dna.greeting_template, 'string');
});

test('AC2: signature_vocab uses explicit vocabulary when present', () => {
  const dna = extractVoiceDNA(devAgent);
  assert.deepEqual(dna.signature_vocab, [
    'construir', 'implementar', 'refatorar', 'resolver', 'otimizar', 'debugar', 'testar',
  ]);
});

test('AC2: emoji_style reads frequency from YAML and finds real emojis', () => {
  const style = extractEmojiStyle(devAgent.persona_profile.communication);
  assert.equal(style.frequency, 'medium');
  assert.ok(style.favorites.includes('💻'));
  assert.ok(style.favorites.includes('🔨'));
});

test('AC2: greeting_template parameterizes concrete tokens into placeholders', () => {
  const tmpl = extractGreetingTemplate(devAgent);
  assert.ok(tmpl.includes('{icon}'), 'icon should be parameterized');
  assert.ok(tmpl.includes('{name}'), 'name should be parameterized');
  assert.ok(tmpl.includes('{archetype}'), 'archetype should be parameterized');
  assert.ok(!tmpl.includes('Dex'), 'concrete name must not leak into template');
});

test('AC5: no invention — classifyTone honors declared tone class', () => {
  const classes = loadToneClasses();
  const tone = classifyTone(devAgent, classes);
  assert.equal(tone, 'direct + pragmatic');
});

test('AC5: classifyTone falls back to keyword heuristics when tone undeclared', () => {
  const analyst = {
    agent: { id: 'analyst' },
    persona: { style: 'rigorous, evidence-driven, analytical research approach' },
    persona_profile: { communication: {} },
  };
  const tone = classifyTone(analyst, loadToneClasses());
  assert.equal(tone, 'analytical + rigorous');
});

test('AC3: saveVoiceDNA writes to .aiox/squad-dnas/{agent-id}-voice.json', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-dna-'));
  const dna = extractVoiceDNA(devAgent);
  const outPath = saveVoiceDNA(dna, tmpDir);
  assert.equal(outPath, path.join(tmpDir, '.aiox', 'squad-dnas', 'dev-voice.json'));
  const written = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(written.agent_id, 'dev');
  assert.equal(written.tone, 'direct + pragmatic');
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('extractVoiceDNA throws on invalid input', () => {
  assert.throws(() => extractVoiceDNA(null), TypeError);
  assert.throws(() => extractVoiceDNA('not-an-object'), TypeError);
});

test('parseAgentBlock parses a YAML fenced agent block into the consumed shape', () => {
  const md = [
    '# dev', '', '```yaml',
    'agent:',
    '  name: Dex',
    '  id: dev',
    '  icon: 💻',
    'persona_profile:',
    '  archetype: Builder',
    '  communication:',
    '    tone: pragmatic',
    '    emoji_frequency: medium',
    '    vocabulary:',
    '      - construir',
    '      - implementar',
    'persona:',
    '  style: Extremely concise, pragmatic, solution-focused',
    '```', '',
  ].join('\n');

  const parsed = parseAgentBlock(md);
  assert.equal(parsed.agent.id, 'dev');
  assert.equal(parsed.persona_profile.communication.tone, 'pragmatic');
  assert.deepEqual(parsed.persona_profile.communication.vocabulary, ['construir', 'implementar']);

  const dna = extractVoiceDNA(parsed);
  assert.equal(dna.tone, 'direct + pragmatic');
});
