'use strict';

/**
 * Knowledge Base Assembly — Story 8.3.6
 *
 * Assembles a complete knowledge base for a cloned squad by merging three real
 * sources (Art. IV — No Invention):
 *
 *   1. Mentor agent KB     — the mentor's persona/profile + extracted DNA
 *   2. Project context     — `.aiox-core/data/aiox-kb.md`
 *   3. Domain docs         — optional `docs/squad-domains/{squad-id}.md`
 *
 * Output: a single markdown file at
 *   `squads/{squad-id}/.aiox-core/kb/{squad-id}-kb.md`  (AC3)
 *
 * The KB has fixed sections (AC4): Agent Profile, Skills, Commands,
 * Dependencies, Rules, Project Context. A metadata block at the top records the
 * source-file fingerprints (size + mtime) so a caller can detect when a source
 * changed and trigger a rebuild (AC5 — auto-update tracking).
 *
 * Dependency-free: reuses the squad-creator's tolerant YAML parser + extractors.
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#836-knowledge-base-assembly-2sp
 *
 * @module squads/squad-creator/core/kb-assembler
 */

const fs = require('fs');
const path = require('path');

const { loadMentorAgent } = require('./squad-template-generator');
const { extractVoiceDNA } = require('./voice-dna');
const { extractThinkingDNA } = require('./thinking-dna');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const PROJECT_KB_PATH = path.join(PROJECT_ROOT, '.aiox-core', 'data', 'aiox-kb.md');

/** Fixed KB section order (AC4). */
const KB_SECTIONS = [
  'Agent Profile',
  'Skills',
  'Commands',
  'Dependencies',
  'Rules',
  'Project Context',
];

/**
 * Compute a lightweight fingerprint (size + mtime) of a file for change
 * detection (AC5). Returns null if the file is absent.
 * @param {string} filePath
 * @returns {{path: string, size: number, mtimeMs: number}|null}
 */
function fingerprint(filePath) {
  try {
    const st = fs.statSync(filePath);
    return {
      path: relProject(filePath),
      size: st.size,
      mtimeMs: Math.round(st.mtimeMs),
    };
  } catch (_err) {
    return null;
  }
}

/**
 * Project-relative POSIX path for stable metadata across platforms.
 * @param {string} abs
 * @returns {string}
 */
function relProject(abs) {
  return path.relative(PROJECT_ROOT, abs).split(path.sep).join('/');
}

/**
 * Read a file's contents, returning '' (not throwing) when absent.
 * @param {string} filePath
 * @returns {string}
 */
function readOptional(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_err) {
    return '';
  }
}

/**
 * Resolve the mentor agent id a squad was cloned from.
 * @param {object} squad
 * @returns {string|null}
 */
function resolveMentorId(squad) {
  const cf = typeof squad.created_from === 'string' ? squad.created_from.replace(/^@/, '') : null;
  if (cf) return cf;
  if (squad.audit && typeof squad.audit.mentor === 'string') return squad.audit.mentor;
  return null;
}

/**
 * Render the Agent Profile section from mentor agent + voice DNA.
 * @param {object} mentorAgent
 * @param {object} voiceDNA
 * @returns {string}
 */
function renderAgentProfile(mentorAgent, voiceDNA) {
  const agent = mentorAgent.agent || {};
  const persona = mentorAgent.persona || {};
  const lines = [];
  lines.push(`- **Cloned from:** @${agent.id || agent.name || 'mentor'}`);
  if (agent.name) lines.push(`- **Mentor name:** ${agent.name}`);
  if (agent.title) lines.push(`- **Title:** ${agent.title}`);
  if (persona.role) lines.push(`- **Role:** ${persona.role}`);
  if (persona.style) lines.push(`- **Style:** ${persona.style}`);
  if (voiceDNA && voiceDNA.tone) lines.push(`- **Tone:** ${voiceDNA.tone}`);
  if (voiceDNA && Array.isArray(voiceDNA.signature_vocab) && voiceDNA.signature_vocab.length) {
    lines.push(`- **Signature vocabulary:** ${voiceDNA.signature_vocab.join(', ')}`);
  }
  if (lines.length === 0) lines.push('_No mentor profile available._');
  return lines.join('\n');
}

/**
 * Render the Skills section from thinking DNA workflow chains.
 * @param {object} thinkingDNA
 * @returns {string}
 */
function renderSkills(thinkingDNA) {
  const chains = (thinkingDNA && thinkingDNA.workflow_chains) || {};
  const keys = Object.keys(chains);
  if (keys.length === 0) return '_No inherited skill chains._';
  return keys
    .sort()
    .map((cmd) => `- \`*${cmd}\` → ${chains[cmd].join(' → ')}`)
    .join('\n');
}

/**
 * Render the Commands section from the mentor's parsed commands (when present).
 * @param {object} mentorAgent
 * @returns {string}
 */
function renderCommands(mentorAgent) {
  const commands = Array.isArray(mentorAgent.commands) ? mentorAgent.commands : [];
  const named = commands.filter((c) => c && typeof c.name === 'string');
  if (named.length === 0) {
    return '_Mentor commands are declared in the mentor agent definition (list-of-maps; '
      + 'see Skills for the inherited command→task chains)._';
  }
  return named
    .map((c) => `- \`*${c.name}\`${c.description ? ` — ${c.description}` : ''}`)
    .join('\n');
}

/**
 * Render the Dependencies section from the mentor's declared dependencies.
 * @param {object} mentorAgent
 * @returns {string}
 */
function renderDependencies(mentorAgent) {
  const deps = mentorAgent.dependencies;
  if (!deps || typeof deps !== 'object') return '_No declared dependencies._';
  const lines = [];
  for (const type of Object.keys(deps).sort()) {
    const value = deps[type];
    if (!Array.isArray(value) || value.length === 0) continue;
    lines.push(`- **${type}:** ${value.map((v) => String(v).split('#')[0].trim()).join(', ')}`);
  }
  return lines.length ? lines.join('\n') : '_No declared dependencies._';
}

/**
 * Render the Rules section. References the framework constitution + inherited
 * rules; squad-specific overrides are managed by the rules-inheritor (8.3.7).
 * @param {object} thinkingDNA
 * @returns {string}
 */
function renderRules(thinkingDNA) {
  const recovery = (thinkingDNA && thinkingDNA.error_recovery) || {};
  const lines = [];
  lines.push('- Inherits the AIOX Constitution (Articles I–VII).');
  lines.push('- Inherits mentor `.claude/rules/` (see squad rules overrides for customizations).');
  const errs = Object.keys(recovery);
  if (errs.length) {
    lines.push('- **Error recovery (inherited):**');
    for (const err of errs.sort()) lines.push(`  - ${err}: ${recovery[err]}`);
  }
  return lines.join('\n');
}

/**
 * Truncate the project KB to a reasonable embed size, keeping the head and
 * noting the truncation (AC mitigation: KB too large / slow reads).
 * @param {string} text
 * @param {number} [maxChars=20000]
 * @returns {string}
 */
function summarizeProjectContext(text, maxChars = 20000) {
  if (!text) return '_Project KB unavailable._';
  if (text.length <= maxChars) return text.trim();
  const head = text.slice(0, maxChars).trim();
  return `${head}\n\n> _…truncated for KB size; full project KB at \`.aiox-core/data/aiox-kb.md\`._`;
}

/**
 * Assemble the complete KB markdown + metadata for a squad (AC2, AC4, AC5).
 *
 * @param {object} squad The generated squad object (must include squad_id).
 * @param {object} [opts]
 * @param {string} [opts.agentsDir] Override agents dir (testing).
 * @param {string} [opts.tasksDir] Override tasks dir (testing).
 * @param {string} [opts.projectKbPath=PROJECT_KB_PATH] Override project KB.
 * @param {string} [opts.domainDocPath] Explicit domain doc path (else derived).
 * @param {string} [opts.baseDir=process.cwd()] Project root for domain-doc lookup.
 * @param {Date} [opts.now] Deterministic timestamp.
 * @returns {{markdown: string, metadata: object}}
 */
function assembleKB(squad, opts = {}) {
  if (!squad || typeof squad !== 'object' || !squad.squad_id) {
    throw new TypeError('assembleKB: squad must be an object with a squad_id');
  }
  const squadId = squad.squad_id;
  const now = opts.now instanceof Date ? opts.now : new Date();
  const baseDir = opts.baseDir || process.cwd();
  const mentor = resolveMentorId(squad);

  // 1) Mentor KB (profile + DNA).
  let mentorAgent = null;
  if (mentor) {
    try {
      mentorAgent = loadMentorAgent(mentor, { agentsDir: opts.agentsDir });
    } catch (_err) {
      mentorAgent = null;
    }
  }
  const voiceDNA = mentorAgent ? extractVoiceDNA(mentorAgent) : null;
  const thinkingDNA = mentorAgent
    ? extractThinkingDNA(mentorAgent, { tasksDir: opts.tasksDir })
    : null;

  // 2) Project context.
  const projectKbPath = opts.projectKbPath || PROJECT_KB_PATH;
  const projectKb = readOptional(projectKbPath);

  // 3) Domain doc (optional).
  const domainDocPath = opts.domainDocPath
    || path.join(baseDir, 'docs', 'squad-domains', `${squadId}.md`);
  const domainDoc = readOptional(domainDocPath);

  // Section bodies (AC4 fixed order).
  const bodies = {
    'Agent Profile': mentorAgent
      ? renderAgentProfile(mentorAgent, voiceDNA)
      : '_Mentor agent unavailable; profile not inherited._',
    Skills: thinkingDNA ? renderSkills(thinkingDNA) : '_No inherited skills._',
    Commands: mentorAgent ? renderCommands(mentorAgent) : '_No inherited commands._',
    Dependencies: mentorAgent ? renderDependencies(mentorAgent) : '_No inherited dependencies._',
    Rules: thinkingDNA ? renderRules(thinkingDNA) : renderRules(null),
    'Project Context': summarizeProjectContext(projectKb),
  };

  // Metadata for change detection (AC5).
  const metadata = {
    squad_id: squadId,
    mentor,
    assembled_at: now.toISOString(),
    generator: 'squads/squad-creator/core/kb-assembler.js',
    sources: {
      mentor_agent: mentor
        ? fingerprint(path.join(opts.agentsDir || path.join(PROJECT_ROOT, '.aiox-core', 'development', 'agents'), `${mentor}.md`))
        : null,
      project_kb: fingerprint(projectKbPath),
      domain_doc: domainDoc ? fingerprint(domainDocPath) : null,
    },
  };

  const lines = [];
  lines.push(`# Knowledge Base — ${squadId}`);
  lines.push('');
  lines.push('<!-- AIOX-KB-METADATA');
  lines.push(JSON.stringify(metadata, null, 2));
  lines.push('-->');
  lines.push('');
  lines.push(`> Assembled ${now.toISOString().slice(0, 10)} · cloned from \`@${mentor || 'unknown'}\``);
  lines.push('');
  for (const section of KB_SECTIONS) {
    lines.push(`## ${section}`);
    lines.push('');
    lines.push(bodies[section]);
    lines.push('');
  }
  if (domainDoc) {
    lines.push('## Domain Documentation');
    lines.push('');
    lines.push(domainDoc.trim());
    lines.push('');
  }

  return { markdown: lines.join('\n'), metadata };
}

/**
 * Read the embedded metadata block from a previously-written KB file.
 * @param {string} kbMarkdown
 * @returns {object|null}
 */
function readKBMetadata(kbMarkdown) {
  if (typeof kbMarkdown !== 'string') return null;
  const m = kbMarkdown.match(/<!-- AIOX-KB-METADATA\s*([\s\S]*?)\s*-->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (_err) {
    return null;
  }
}

/**
 * Decide whether a KB needs rebuilding by comparing stored source fingerprints
 * to the current on-disk fingerprints (AC5 — auto-update detection).
 * @param {object} metadata Previously stored KB metadata.
 * @param {object} [opts] Same source-path overrides as assembleKB.
 * @returns {{stale: boolean, changed: string[]}}
 */
function isKBStale(metadata, opts = {}) {
  if (!metadata || !metadata.sources) return { stale: true, changed: ['<no-metadata>'] };
  const changed = [];
  for (const [key, stored] of Object.entries(metadata.sources)) {
    if (!stored) continue; // source wasn't present at assembly time
    const current = fingerprint(path.join(PROJECT_ROOT, stored.path));
    if (!current || current.size !== stored.size || current.mtimeMs !== stored.mtimeMs) {
      changed.push(key);
    }
  }
  void opts;
  return { stale: changed.length > 0, changed };
}

/**
 * Assemble and persist the KB to
 * `squads/{squad-id}/.aiox-core/kb/{squad-id}-kb.md` (AC3).
 * @param {object} squad
 * @param {object} [opts] {baseDir, ...assembleKB opts}
 * @returns {{outPath: string, markdown: string, metadata: object}}
 */
function saveKB(squad, opts = {}) {
  const { markdown, metadata } = assembleKB(squad, opts);
  const baseDir = opts.baseDir || process.cwd();
  const safeId = safeSquadId(squad.squad_id);
  const outDir = path.join(baseDir, 'squads', safeId, '.aiox-core', 'kb');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safeId}-kb.md`);
  if (!path.resolve(outPath).startsWith(path.resolve(path.join(baseDir, 'squads', safeId)))) {
    throw new Error('saveKB: resolved path escapes squad directory');
  }
  fs.writeFileSync(outPath, markdown, 'utf8');
  return { outPath, markdown, metadata };
}

/**
 * Harden a squad id against path traversal.
 * @param {string} squadId
 * @returns {string}
 */
function safeSquadId(squadId) {
  if (!squadId || typeof squadId !== 'string') {
    throw new TypeError('squadId is required');
  }
  const safe = path.basename(squadId);
  if (!/^[A-Za-z0-9._-]+$/.test(safe) || safe.startsWith('.')) {
    throw new TypeError(`unsafe squadId "${squadId}"`);
  }
  return safe;
}

module.exports = {
  assembleKB,
  saveKB,
  readKBMetadata,
  isKBStale,
  resolveMentorId,
  fingerprint,
  KB_SECTIONS,
  // exported for unit testing of internals
  renderAgentProfile,
  renderSkills,
  renderDependencies,
  summarizeProjectContext,
  safeSquadId,
};
