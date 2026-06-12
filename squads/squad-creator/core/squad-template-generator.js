'use strict';

/**
 * Squad Template Generation — Story 8.3.3
 *
 * Generates a complete `squad.yaml` from an extracted mentor DNA (Voice DNA +
 * Thinking DNA) plus customization inputs (name, focus area), so a new squad
 * can be scaffolded with:
 *
 *   aiox squad create --mentor {agent} --name {name} --focus {focus}
 *
 * in under 10 minutes.
 *
 * Constitutional compliance (Art. IV — No Invention):
 *   Every field in the generated squad.yaml traces to one of:
 *     - the base squad template (`.aiox-core/development/templates/...`),
 *     - the extracted mentor DNA (voice-dna.js / thinking-dna.js — themselves
 *       derived deterministically from shipped agent YAML), or
 *     - an explicit customization input (name, focus).
 *   Nothing is fabricated. Absent inputs fall back to documented defaults.
 *
 * Dependency-free: emits YAML via a small, deterministic serializer (no
 * js-yaml in runtime deps — matching the rest of the squad-creator core).
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#833-squad-template-generation-2sp
 *
 * @module squads/squad-creator/core/squad-template-generator
 */

const fs = require('fs');
const path = require('path');

const { extractVoiceDNA, parseAgentBlock } = require('./voice-dna');
const { extractThinkingDNA } = require('./thinking-dna');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');

// AC4: base template. The story references `squad-tmpl.yaml`; the shipped
// template lives at `squad-template/squad.yaml`. Try the specced path first,
// then the real path, then a bundled default — generation must never hard-fail.
const TEMPLATE_CANDIDATES = [
  path.join(PROJECT_ROOT, '.aiox-core', 'development', 'templates', 'squad-tmpl.yaml'),
  path.join(PROJECT_ROOT, '.aiox-core', 'development', 'templates', 'squad-template', 'squad.yaml'),
];

const AGENTS_DIR = path.join(PROJECT_ROOT, '.aiox-core', 'development', 'agents');

/**
 * Minimal bundled fallback template (used only if no template file is found).
 * Mirrors the shipped `squad-template/squad.yaml` shape.
 * @returns {object}
 */
function defaultTemplate() {
  return {
    name: '{{squad-name}}',
    version: '0.1.0',
    description: '{{description}}',
    author: '{{author}}',
    license: 'MIT',
    aiox: { minVersion: '2.1.0', type: 'squad' },
    components: {
      agents: ['agents/*.yaml'],
      tasks: ['tasks/*.yaml'],
      workflows: ['workflows/*.yaml'],
      templates: ['templates/*.md'],
    },
    dependencies: [],
    keywords: ['aiox', 'squad'],
  };
}

/**
 * Load the base squad template as a parsed object. Tries each candidate path
 * in order; falls back to the bundled default. Never throws on a missing file.
 * @param {string[]} [candidates] Override candidate paths (for testing).
 * @returns {{template: object, source: string}}
 */
function loadBaseTemplate(candidates = TEMPLATE_CANDIDATES) {
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const parsed = parseSimpleYaml(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return { template: parsed, source: candidate };
      }
    } catch (_err) {
      // try next candidate
    }
  }
  return { template: defaultTemplate(), source: 'bundled-default' };
}

/**
 * Load a mentor agent's parsed YAML definition from
 * `.aiox-core/development/agents/{mentor}.md` (read-only L2, permitted).
 * @param {string} mentor Agent id (e.g. "dev", "qa", "architect").
 * @param {object} [opts]
 * @param {string} [opts.agentsDir] Override agents directory (for testing).
 * @returns {object} parsed agent object
 */
function loadMentorAgent(mentor, opts = {}) {
  if (!mentor || typeof mentor !== 'string') {
    throw new TypeError('loadMentorAgent: mentor must be a non-empty agent id string');
  }
  // Harden against path traversal: a mentor id is a safe slug, never a path
  // (CodeRabbit major: path traversal). No separators, no leading dot.
  if (!/^[A-Za-z0-9_-]+$/.test(mentor)) {
    throw new TypeError(`loadMentorAgent: unsafe mentor id "${mentor}"`);
  }
  const agentsDir = opts.agentsDir || AGENTS_DIR;
  const file = path.join(agentsDir, `${mentor}.md`);
  if (!path.resolve(file).startsWith(path.resolve(agentsDir))) {
    throw new Error('loadMentorAgent: resolved path escapes agents directory');
  }
  let markdown;
  try {
    markdown = fs.readFileSync(file, 'utf8');
  } catch (err) {
    throw new Error(`loadMentorAgent: mentor agent file not found: ${file}`, { cause: err });
  }
  return parseAgentBlock(markdown);
}

/**
 * Slugify a free-text squad name into a filesystem/registry-safe id.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Build a single cloned agent definition for the generated squad, with the
 * mentor's voice + thinking DNA applied. (AC2: voice/thinking DNA applied.)
 * @param {object} mentorAgent Parsed mentor agent object.
 * @param {object} voiceDNA Result of extractVoiceDNA(mentorAgent).
 * @param {object} thinkingDNA Result of extractThinkingDNA(mentorAgent).
 * @param {string} squadId
 * @param {string} focus
 * @returns {object}
 */
function buildAgentDefinition(mentorAgent, voiceDNA, thinkingDNA, squadId, focus) {
  const mentorMeta = mentorAgent.agent || {};
  const agentId = `${squadId}-lead`;
  return {
    id: agentId,
    name: mentorMeta.name ? `${mentorMeta.name} (cloned)` : agentId,
    role: `${focus} specialist (cloned from @${mentorMeta.id || mentorMeta.name || 'mentor'})`,
    voice_dna: {
      tone: voiceDNA.tone,
      signature_vocab: voiceDNA.signature_vocab,
      emoji_style: voiceDNA.emoji_style,
      greeting_template: voiceDNA.greeting_template,
    },
    thinking_dna: {
      decision_framework: thinkingDNA.decision_framework,
      workflow_chains: thinkingDNA.workflow_chains,
      error_recovery: thinkingDNA.error_recovery,
    },
  };
}

/**
 * Generate the complete squad definition object (pre-serialization).
 *
 * @param {object} params
 * @param {string} params.mentor Mentor agent id.
 * @param {string} params.name Human-readable squad name.
 * @param {string} params.focus Focus area for the new squad.
 * @param {object} [opts]
 * @param {string} [opts.agentsDir] Override agents directory (for testing).
 * @param {string[]} [opts.templateCandidates] Override template paths.
 * @param {string} [opts.tasksDir] Forwarded to thinking-dna extractor.
 * @param {Date} [opts.now] Override the timestamp (for deterministic tests).
 * @returns {{squad: object, meta: {squadId: string, mentor: string, templateSource: string}}}
 */
function generateSquad(params, opts = {}) {
  const { mentor, name, focus } = params || {};
  if (!mentor) throw new TypeError('generateSquad: params.mentor is required');
  if (!name) throw new TypeError('generateSquad: params.name is required');
  if (!focus) throw new TypeError('generateSquad: params.focus is required');

  const squadId = slugify(name);
  if (!squadId) {
    throw new Error(`generateSquad: name "${name}" produced an empty squad id`);
  }

  const now = opts.now instanceof Date ? opts.now : new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const mentorAgent = loadMentorAgent(mentor, opts);
  const voiceDNA = extractVoiceDNA(mentorAgent);
  const thinkingDNA = extractThinkingDNA(mentorAgent, { tasksDir: opts.tasksDir });

  const { template, source: templateSource } = loadBaseTemplate(opts.templateCandidates);

  // Inherited dependencies + authority (AC2). Dependencies come from the
  // mentor's declared `dependencies` (tasks/templates/checklists). Authority is
  // inherited from any declared mentor authority block, else an empty inherited
  // marker — never fabricated.
  const inheritedDependencies = normalizeDependencies(mentorAgent.dependencies);
  const inheritedAuthority = normalizeAuthority(mentorAgent);

  const agentDef = buildAgentDefinition(mentorAgent, voiceDNA, thinkingDNA, squadId, focus);

  // Start from the base template, then overlay generated metadata. Template
  // placeholders ({{...}}) are replaced; structural keys are preserved.
  const squad = {
    name,
    version: typeof template.version === 'string' && !template.version.includes('{{')
      ? template.version
      : '0.1.0',
    description: `${focus} squad cloned from @${mentor}`,
    // AC2: squad metadata
    squad_id: squadId,
    focus_area: focus,
    created_from: `@${mentor}`,
    aiox: sanitizeTemplateValue(template.aiox) || { minVersion: '2.1.0', type: 'squad' },
    // AC2: agent definitions with voice/thinking DNA applied
    agents: [agentDef],
    // AC2: inherited dependencies
    dependencies: inheritedDependencies,
    // AC2: inherited authority
    authority: inheritedAuthority,
    components: sanitizeTemplateValue(template.components) || {
      agents: ['agents/*.yaml'],
      tasks: ['tasks/*.yaml'],
      workflows: ['workflows/*.yaml'],
    },
    keywords: dedupe(['aiox', 'squad', focus.toLowerCase()].filter(Boolean)),
    // AC5: audit trail
    audit: {
      created_from: `Created from @${mentor} on ${dateStr}`,
      mentor,
      created_at: now.toISOString(),
      generator: 'squads/squad-creator/core/squad-template-generator.js',
      template_source: templateSource === 'bundled-default'
        ? 'bundled-default'
        : path.relative(PROJECT_ROOT, templateSource).split(path.sep).join('/'),
      dna_sources: {
        voice: voiceDNA.source,
        thinking: thinkingDNA.source,
      },
    },
  };

  return { squad, meta: { squadId, mentor, templateSource } };
}

/**
 * Normalize a mentor's dependencies block into a flat, sorted list of
 * "type:name" inherited references. Returns [] when none declared.
 * @param {*} dependencies
 * @returns {string[]}
 */
function normalizeDependencies(dependencies) {
  if (!dependencies || typeof dependencies !== 'object') return [];
  const out = [];
  for (const [type, value] of Object.entries(dependencies)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') out.push(`${type}:${item}`);
      }
    }
  }
  return dedupe(out).sort();
}

/**
 * Normalize a mentor's authority into an inherited authority object. Reads any
 * declared `authority`/`permissions` block; otherwise returns an inherited
 * marker referencing the mentor (no fabricated permissions).
 * @param {object} mentorAgent
 * @returns {object}
 */
function normalizeAuthority(mentorAgent) {
  const declared = mentorAgent.authority || mentorAgent.permissions;
  if (declared && typeof declared === 'object') {
    return { inherited_from: mentorAgent.agent && mentorAgent.agent.id, ...declared };
  }
  return {
    inherited_from: (mentorAgent.agent && mentorAgent.agent.id) || 'mentor',
    note: 'No explicit authority block on mentor; inherits mentor default scope.',
  };
}

/**
 * Validate a generated squad object has all AC2/AC5 required fields before
 * serialization (AC mitigation: no missing fields / syntax errors).
 * @param {object} squad
 * @returns {{valid: boolean, missing: string[]}}
 */
function validateSquad(squad) {
  const required = [
    'name', 'squad_id', 'focus_area', 'created_from',
    'agents', 'dependencies', 'authority', 'audit',
  ];
  const missing = required.filter((k) => squad[k] === undefined || squad[k] === null);
  if (Array.isArray(squad.agents) && squad.agents.length === 0) missing.push('agents (empty)');
  if (squad.audit && typeof squad.audit.created_from !== 'string') {
    missing.push('audit.created_from');
  }
  return { valid: missing.length === 0, missing };
}

/**
 * Generate and persist a squad.yaml to `squads/{squad-id}/squad.yaml`
 * (L4, not git-committed by default — dev scaffold). (AC3.)
 * @param {object} params {mentor, name, focus}
 * @param {object} [opts]
 * @param {string} [opts.baseDir=process.cwd()] Project root for output.
 * @returns {{outPath: string, squadId: string, yaml: string, squad: object}}
 */
function createSquad(params, opts = {}) {
  const { squad, meta } = generateSquad(params, opts);

  const validation = validateSquad(squad);
  if (!validation.valid) {
    throw new Error(`createSquad: generated squad is invalid, missing: ${validation.missing.join(', ')}`);
  }

  const yaml = toYaml(squad);
  // Round-trip sanity: a deterministic re-parse must not throw (AC mitigation).
  parseSimpleYaml(yaml);

  const baseDir = opts.baseDir || process.cwd();
  const outDir = path.join(baseDir, 'squads', meta.squadId);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'squad.yaml');
  fs.writeFileSync(outPath, yaml, 'utf8');

  return { outPath, squadId: meta.squadId, yaml, squad };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Replace any value that still contains a {{placeholder}} with undefined so the
 * caller can substitute a concrete default.
 * @param {*} value
 * @returns {*}
 */
function sanitizeTemplateValue(value) {
  if (typeof value === 'string' && value.includes('{{')) return undefined;
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((v) => sanitizeTemplateValue(v)).filter((v) => v !== undefined);
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const sv = sanitizeTemplateValue(v);
      if (sv !== undefined) out[k] = sv;
    }
    return out;
  }
  return value;
}

/**
 * @param {string[]} arr
 * @returns {string[]}
 */
function dedupe(arr) {
  return Array.from(new Set(arr));
}

/**
 * Deterministic, dependency-free YAML serializer for the squad object subset
 * we emit (scalars, nested maps, scalar arrays, arrays of maps). Keeps the
 * module free of a YAML runtime dependency.
 * @param {*} value
 * @param {number} [indent=0]
 * @returns {string}
 */
function toYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object') {
          const block = toYaml(item, indent + 1);
          // Re-flow the first key onto the "- " bullet line.
          const lines = block.split('\n');
          const firstContentIdx = lines.findIndex((l) => l.trim() !== '');
          lines[firstContentIdx] = `${pad}- ${lines[firstContentIdx].trim()}`;
          for (let i = firstContentIdx + 1; i < lines.length; i++) {
            if (lines[i].trim() !== '') lines[i] = `  ${lines[i]}`;
          }
          return lines.filter((l) => l.trim() !== '' || true).join('\n');
        }
        return `${pad}- ${scalar(item)}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return keys
      .map((key) => {
        const v = value[key];
        if (v !== null && typeof v === 'object') {
          if (Array.isArray(v) && v.length === 0) return `${pad}${key}: []`;
          if (!Array.isArray(v) && Object.keys(v).length === 0) return `${pad}${key}: {}`;
          return `${pad}${key}:\n${toYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${scalar(v)}`;
      })
      .join('\n');
  }

  return `${pad}${scalar(value)}`;
}

/**
 * Serialize a scalar with quoting only when needed.
 * @param {*} v
 * @returns {string}
 */
function scalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  // Quote if it contains YAML-significant characters or could be misparsed.
  if (
    s === '' ||
    /[:#[\]{},&*!|>'"%@`]/.test(s) ||
    /^[\s-]/.test(s) ||
    /[\s]$/.test(s) ||
    /^(true|false|null|yes|no|~)$/i.test(s) ||
    /^[-+]?[0-9]/.test(s)
  ) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

/**
 * Tolerant, dependency-free YAML parser sufficient for the templates and the
 * squad.yaml we emit (scalars, nested maps, scalar lists, list-of-maps).
 * Used to (a) load the base template and (b) round-trip-validate our output.
 * @param {string} text
 * @returns {object}
 */
function parseSimpleYaml(text) {
  if (typeof text !== 'string') {
    throw new TypeError('parseSimpleYaml: text must be a string');
  }
  const lines = text.split('\n');
  const root = {};
  // Stack of containers with their indent. A container is {indent, node, pendingKey}.
  const stack = [{ indent: -1, node: root, pendingKey: null, isList: false }];

  for (let raw of lines) {
    raw = raw.replace(/\s+$/, '');
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = raw.length - raw.trimStart().length;

    // Pop frames deeper than current indent.
    while (stack.length > 1 && indent < stack[stack.length - 1].indent) {
      stack.pop();
    }
    let frame = stack[stack.length - 1];

    if (trimmed.startsWith('- ') || trimmed === '-') {
      const itemContent = trimmed === '-' ? '' : trimmed.slice(2).trim();
      // The list belongs to the nearest pendingKey.
      let listFrame = frame;
      if (listFrame.pendingKey === null && stack.length > 1) {
        listFrame = stack[stack.length - 1];
      }
      const parent = listFrame.node;
      const key = listFrame.pendingKey;
      if (key === null) continue;
      if (!Array.isArray(parent[key])) parent[key] = [];

      // A fully-quoted item is always a scalar, even if it contains a colon.
      const isQuotedScalar =
        (itemContent.startsWith('"') && itemContent.endsWith('"') && itemContent.length > 1) ||
        (itemContent.startsWith('\'') && itemContent.endsWith('\'') && itemContent.length > 1);

      // Inline "key: value" after the dash -> start a map item.
      const colon = isQuotedScalar ? -1 : itemContent.indexOf(':');
      if (itemContent && colon !== -1) {
        const obj = {};
        const k = itemContent.slice(0, colon).trim();
        const val = itemContent.slice(colon + 1).trim();
        if (val === '') {
          // nested map item begins; push a frame for it
          parent[key].push(obj);
          obj[k] = undefined;
          stack.push({ indent: indent + 2, node: obj, pendingKey: k, isList: false });
        } else {
          obj[k] = coerce(stripQuotes(val));
          parent[key].push(obj);
          stack.push({ indent: indent + 2, node: obj, pendingKey: null, isList: false });
        }
      } else if (itemContent) {
        parent[key].push(coerce(stripQuotes(itemContent)));
      }
      continue;
    }

    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const val = trimmed.slice(colon + 1).trim();

    // Establish frame indent on first key.
    if (frame.indent === -1) frame.indent = indent;

    if (indent > frame.indent && frame.pendingKey !== null) {
      const child = {};
      frame.node[frame.pendingKey] = child;
      stack.push({ indent, node: child, pendingKey: null, isList: false });
    }
    // Re-resolve the active frame (either the freshly pushed child, or the
    // existing top after any pops). Siblings are handled by the pop loop above.
    frame = stack[stack.length - 1];

    if (val === '') {
      frame.pendingKey = key;
      frame.node[key] = undefined;
    } else if (val === '[]') {
      frame.node[key] = [];
      frame.pendingKey = null;
    } else if (val === '{}') {
      frame.node[key] = {};
      frame.pendingKey = null;
    } else {
      frame.node[key] = coerce(stripQuotes(val));
      frame.pendingKey = null;
    }
  }
  return root;
}

/**
 * @param {string} s
 * @returns {string}
 */
function stripQuotes(s) {
  if (typeof s !== 'string') return s;
  if ((s.startsWith('\'') && s.endsWith('\'')) || (s.startsWith('"') && s.endsWith('"'))) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return s;
}

/**
 * Coerce obvious scalar types from a YAML token.
 * @param {string} s
 * @returns {*}
 */
function coerce(s) {
  if (typeof s !== 'string') return s;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  return s;
}

module.exports = {
  generateSquad,
  createSquad,
  loadBaseTemplate,
  loadMentorAgent,
  validateSquad,
  slugify,
  toYaml,
  parseSimpleYaml,
  // exported for unit testing of internals
  normalizeDependencies,
  normalizeAuthority,
  buildAgentDefinition,
};
