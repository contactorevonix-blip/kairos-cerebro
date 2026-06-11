'use strict';

/**
 * Voice DNA Extraction — Story 8.3.1
 *
 * Extracts an AIOX agent's communication patterns (tone, signature vocabulary,
 * emoji style, greeting template) into a structured, cloneable DNA model.
 *
 * Constitutional compliance (Art. IV — No Invention):
 *   Every extracted field maps deterministically to an existing field in the
 *   agent YAML structure (`persona`, `persona_profile.communication`). When a
 *   source field is absent, the extractor falls back to documented defaults —
 *   it never fabricates vocabulary, tone, or greetings.
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#831-voice-dna-extraction-2sp
 *
 * Input contract:
 *   `agentYaml` is the PARSED agent definition object (the YAML block from an
 *   `.aiox-core/development/agents/{id}.md` file, already deserialized). This
 *   keeps the module dependency-free (no YAML parser in the runtime deps). A
 *   tolerant `parseAgentBlock(markdown)` helper is exported for callers that
 *   only have the raw markdown.
 *
 * @module squads/squad-creator/core/voice-dna
 */

const fs = require('fs');
const path = require('path');

const TONE_CLASSES_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '.aiox-core',
  'data',
  'squad-creator-tone-classes.json',
);

/**
 * Load the tone-classification reference (L3 config). Falls back to a minimal
 * inline table if the file is unavailable — extraction must never hard-fail.
 * @returns {{default_tone: string, classes: Record<string, {label: string, keywords: string[]}>}}
 */
function loadToneClasses() {
  try {
    const raw = fs.readFileSync(TONE_CLASSES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_err) {
    return {
      default_tone: 'neutral',
      classes: {
        pragmatic: {
          label: 'direct + pragmatic',
          keywords: ['pragmatic', 'concise', 'solution-focused', 'direct'],
        },
        neutral: { label: 'neutral', keywords: [] },
      },
    };
  }
}

/**
 * Normalize emoji_frequency to a canonical {frequency, favorites} model.
 * `frequency` is read directly from the agent YAML (low|medium|high|none);
 * `favorites` are the distinct emojis actually present in the greeting/closing.
 * @param {object} communication
 * @returns {{frequency: 'none'|'low'|'medium'|'high', favorites: string[]}}
 */
function extractEmojiStyle(communication) {
  const raw = (communication && communication.emoji_frequency) || 'none';
  const frequency = ['none', 'low', 'medium', 'high'].includes(raw) ? raw : 'none';

  // Collect emoji from greeting levels + signature closing (real source text).
  const sources = [];
  const levels = (communication && communication.greeting_levels) || {};
  for (const key of Object.keys(levels)) {
    if (typeof levels[key] === 'string') sources.push(levels[key]);
  }
  if (typeof (communication && communication.signature_closing) === 'string') {
    sources.push(communication.signature_closing);
  }

  // Emoji-range matcher (BMP pictographs + supplementary). Dependency-free.
  const emojiRegex =
    /[←-⇿⌀-➿⬀-⯿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/g;
  const found = new Set();
  for (const text of sources) {
    const matches = text.match(emojiRegex);
    if (matches) matches.forEach((e) => found.add(e));
  }

  return { frequency, favorites: Array.from(found) };
}

/**
 * Classify tone from agent persona text using keyword heuristics.
 * Reads from `persona.style`, `persona.role`, and `communication.tone`.
 * @param {object} agentYaml
 * @param {object} toneClasses
 * @returns {string} tone label (e.g. "direct + pragmatic")
 */
function classifyTone(agentYaml, toneClasses) {
  const persona = agentYaml.persona || {};
  const communication =
    (agentYaml.persona_profile && agentYaml.persona_profile.communication) || {};

  // If the YAML already declares a tone, honor the declared class first.
  const declaredTone = (communication.tone || '').toLowerCase().trim();
  if (declaredTone && toneClasses.classes[declaredTone]) {
    return toneClasses.classes[declaredTone].label;
  }

  const haystack = [persona.style, persona.role, persona.identity, persona.focus, declaredTone]
    .filter((v) => typeof v === 'string')
    .join(' ')
    .toLowerCase();

  let best = { tone: toneClasses.default_tone, score: 0 };
  for (const [tone, def] of Object.entries(toneClasses.classes)) {
    let score = 0;
    for (const kw of def.keywords) {
      if (haystack.includes(kw.toLowerCase())) score += 1;
    }
    if (score > best.score) best = { tone, score };
  }

  const chosen = toneClasses.classes[best.tone];
  return chosen ? chosen.label : toneClasses.default_tone;
}

/**
 * Extract signature vocabulary: top N words. Primary source is the explicit
 * `communication.vocabulary` array (authoritative). If absent, derive from
 * frequency of meaningful words across persona descriptions.
 * @param {object} agentYaml
 * @param {number} [topN=10]
 * @returns {string[]}
 */
function extractSignatureVocab(agentYaml, topN = 10) {
  const communication =
    (agentYaml.persona_profile && agentYaml.persona_profile.communication) || {};

  if (Array.isArray(communication.vocabulary) && communication.vocabulary.length > 0) {
    return communication.vocabulary.slice(0, topN);
  }

  // Fallback: frequency analysis over persona text (no invented words).
  const persona = agentYaml.persona || {};
  const text = [persona.style, persona.role, persona.identity, persona.focus]
    .filter((v) => typeof v === 'string')
    .join(' ')
    .toLowerCase();

  const STOP = new Set([
    'the', 'and', 'for', 'with', 'who', 'that', 'this', 'are', 'was', 'has',
    'will', 'you', 'your', 'from', 'into', 'expert', 'senior', 'specialist',
  ]);
  const counts = new Map();
  for (const word of text.match(/[a-zà-ú]{3,}/g) || []) {
    if (STOP.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([w]) => w);
}

/**
 * Extract a greeting template with {placeholders}. Prefers the `archetypal`
 * greeting level (richest), then `named`, then `minimal`. Concrete agent
 * tokens (name, icon) are parameterized into {placeholders} so the template
 * is reusable by a cloned squad.
 * @param {object} agentYaml
 * @returns {string}
 */
function extractGreetingTemplate(agentYaml) {
  const agent = agentYaml.agent || {};
  const communication =
    (agentYaml.persona_profile && agentYaml.persona_profile.communication) || {};
  const levels = communication.greeting_levels || {};

  let greeting = levels.archetypal || levels.named || levels.minimal || '';
  if (!greeting && agent.name) {
    greeting = `${agent.name} ready`;
  }

  // Parameterize known concrete tokens into placeholders (order matters:
  // archetype before name, since archetype may contain spaces).
  const archetype =
    (agentYaml.persona_profile && agentYaml.persona_profile.archetype) || '';
  if (agent.icon) greeting = greeting.split(agent.icon).join('{icon}');
  if (archetype) greeting = greeting.split(archetype).join('{archetype}');
  if (agent.name) greeting = greeting.split(agent.name).join('{name}');

  return greeting.trim();
}

/**
 * Extract the full Voice DNA model for an agent.
 * @param {object} agentYaml Parsed agent definition object.
 * @returns {{agent_id: string, tone: string, signature_vocab: string[], emoji_style: {frequency: string, favorites: string[]}, greeting_template: string, source: string}}
 */
function extractVoiceDNA(agentYaml) {
  if (!agentYaml || typeof agentYaml !== 'object') {
    throw new TypeError('extractVoiceDNA: agentYaml must be a parsed agent object');
  }

  const toneClasses = loadToneClasses();
  const agent = agentYaml.agent || {};
  const communication =
    (agentYaml.persona_profile && agentYaml.persona_profile.communication) || {};

  return {
    agent_id: agent.id || agent.name || 'unknown',
    tone: classifyTone(agentYaml, toneClasses),
    signature_vocab: extractSignatureVocab(agentYaml, 10),
    emoji_style: extractEmojiStyle(communication),
    greeting_template: extractGreetingTemplate(agentYaml),
    source: 'persona_profile.communication + persona',
  };
}

/**
 * Persist a Voice DNA object to `.aiox/squad-dnas/{agent-id}-voice.json`.
 * Creates the directory if needed. Returns the absolute output path.
 * @param {object} dna Result of extractVoiceDNA().
 * @param {string} [baseDir=process.cwd()] Project root.
 * @returns {string} absolute path written.
 */
function saveVoiceDNA(dna, baseDir = process.cwd()) {
  if (!dna || !dna.agent_id) {
    throw new TypeError('saveVoiceDNA: dna must include an agent_id');
  }
  const outDir = path.join(baseDir, '.aiox', 'squad-dnas');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${dna.agent_id}-voice.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(dna, null, 2)}\n`, 'utf8');
  return outPath;
}

/**
 * Tolerant helper: extract + minimally parse the YAML fenced block from an
 * agent markdown file into the shape this module consumes. Dependency-free.
 *
 * Supported subset (sufficient for ALL Voice DNA fields and the Thinking DNA
 * `dependencies.tasks` + `blocking` directives):
 *   - nested maps, scalar key: value pairs
 *   - scalar `- item` lists (e.g. communication.vocabulary, dependencies.tasks)
 *   - block scalars (`|`, `>`) are skipped (their body is not extracted)
 *
 * NOT supported: list-of-maps (e.g. the `commands:` array of `{name, ...}`
 * objects). Callers that need `commands` (Thinking DNA decision_framework /
 * workflow_chains) MUST parse the YAML upstream with a full parser and pass
 * the resulting object directly to extractVoiceDNA()/extractThinkingDNA().
 * This keeps the module dependency-free while staying honest about its limits.
 * @param {string} markdown Raw agent .md file contents.
 * @returns {object} parsed agent object (best-effort).
 */
function parseAgentBlock(markdown) {
  if (typeof markdown !== 'string') {
    throw new TypeError('parseAgentBlock: markdown must be a string');
  }
  const match = markdown.match(/```yaml\s*\n([\s\S]*?)\n```/);
  const body = match ? match[1] : markdown;

  const lines = body.split('\n');
  const root = {};
  // Frame stack. Each frame owns a map `node`, the indent its keys sit at
  // (`keyIndent`), and a `pendingKey` (empty-valued key whose child — nested
  // map or list — is resolved by the next deeper line).
  const stack = [{ keyIndent: -1, node: root, pendingKey: null }];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\s+$/, '');
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indent = rawLine.length - rawLine.trimStart().length;
    const content = rawLine.trim();

    // List item: append to the nearest frame whose pendingKey is set at a
    // shallower indent than this item.
    if (content.startsWith('- ')) {
      while (stack.length > 1 && indent <= stack[stack.length - 1].keyIndent) {
        stack.pop();
      }
      const frame = stack[stack.length - 1];
      if (frame.pendingKey !== null) {
        if (!Array.isArray(frame.node[frame.pendingKey])) frame.node[frame.pendingKey] = [];
        frame.node[frame.pendingKey].push(stripQuotes(content.slice(2).trim()));
      }
      continue;
    }

    const sep = content.indexOf(':');
    if (sep === -1) continue;
    const key = content.slice(0, sep).trim();
    const valuePart = content.slice(sep + 1).trim();

    // Resolve which frame this key belongs to.
    let top = stack[stack.length - 1];
    if (indent > top.keyIndent && top.pendingKey !== null) {
      // Descend into the pendingKey as a nested map.
      const child = {};
      top.node[top.pendingKey] = child;
      top.pendingKey = null;
      stack.push({ keyIndent: indent, node: child, pendingKey: null });
      top = stack[stack.length - 1];
    } else {
      // Sibling or shallower: pop frames until indent fits this key's level.
      while (stack.length > 1 && indent < stack[stack.length - 1].keyIndent) {
        stack.pop();
      }
      top = stack[stack.length - 1];
      // First key establishes this frame's key indent.
      if (top.keyIndent === -1 && top.node === root) top.keyIndent = indent;
      top.pendingKey = null;
    }

    if (valuePart === '|' || valuePart === '>') {
      // Block scalar: skip its indented body lines (not needed by extractors).
      const blockIndent = indent;
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        const nextTrim = next.trim();
        const nextIndent = next.length - next.trimStart().length;
        if (nextTrim === '' || nextIndent > blockIndent) i++;
        else break;
      }
      top.node[key] = '';
    } else if (valuePart === '') {
      top.pendingKey = key;
    } else {
      top.node[key] = stripQuotes(valuePart);
    }
  }
  return root;
}

/**
 * @param {string} s
 * @returns {string}
 */
function stripQuotes(s) {
  if ((s.startsWith('\'') && s.endsWith('\'')) || (s.startsWith('"') && s.endsWith('"'))) {
    return s.slice(1, -1);
  }
  return s;
}

module.exports = {
  extractVoiceDNA,
  saveVoiceDNA,
  parseAgentBlock,
  // exported for unit testing of internals
  classifyTone,
  extractSignatureVocab,
  extractEmojiStyle,
  extractGreetingTemplate,
  loadToneClasses,
};
