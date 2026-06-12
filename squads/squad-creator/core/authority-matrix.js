'use strict';

/**
 * Authority Matrix Extraction — Story 8.3.5
 *
 * Extracts a mentor agent's authority profile — EXCLUSIVE operations, BLOCKED
 * operations, and ALLOWED operations — so a cloned squad inherits the mentor's
 * authority constraints and cannot escalate privileges beyond the mentor.
 *
 * Constitutional compliance (Art. IV — No Invention):
 *   The authoritative source is the shipped delegation matrix in
 *   `.claude/rules/agent-authority.md` (markdown tables). Each operation an
 *   agent owns/blocks is parsed from those tables — never fabricated. The
 *   mentor agent YAML `persona.exclusive_authority` is used as a supplementary
 *   signal only. Absent data yields an empty bucket, not invented permissions.
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#835-authority-matrix-15sp
 *
 * @module squads/squad-creator/core/authority-matrix
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');

const AUTHORITY_RULE_PATH = path.join(PROJECT_ROOT, '.claude', 'rules', 'agent-authority.md');

/**
 * Map an agent persona id (e.g. "devops") to the heading label used in the
 * delegation matrix (e.g. "@devops (Gage)"). Matching is done by `@{id}` token.
 * @param {string} agentId
 * @returns {string}
 */
function agentToken(agentId) {
  return `@${String(agentId).replace(/^@/, '')}`;
}

/**
 * Whole-token containment test: does `text` contain `@{id}` NOT immediately
 * followed by another identifier char? Prevents `@dev` from matching `@devops`.
 * @param {string} text
 * @param {string} token e.g. "@dev"
 * @returns {boolean}
 */
function hasToken(text, token) {
  if (typeof text !== 'string') return false;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // `@dev` must not be followed by a word char (so `@devops` won't match).
  return new RegExp(`${escaped}(?![\\w-])`).test(text);
}

/**
 * Load the agent-authority delegation matrix markdown. Returns '' (not throw)
 * if unavailable — extraction degrades gracefully to YAML-only signals.
 * @param {string} [rulePath]
 * @returns {string}
 */
function loadAuthorityRule(rulePath = AUTHORITY_RULE_PATH) {
  try {
    return fs.readFileSync(rulePath, 'utf8');
  } catch (_err) {
    return '';
  }
}

/**
 * Parse a GitHub-flavored markdown table into an array of row objects keyed by
 * header cell. Dependency-free.
 * @param {string[]} lines Lines belonging to a single table (header + rows).
 * @returns {Array<Record<string,string>>}
 */
function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith('|'));
  if (rows.length < 2) return [];
  const headers = splitRow(rows[0]);
  // rows[1] is the separator (---). Data starts at index 2.
  const out = [];
  for (let i = 2; i < rows.length; i++) {
    const cells = splitRow(rows[i]);
    if (cells.length === 0) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] !== undefined ? cells[idx] : ''; });
    out.push(obj);
  }
  return out;
}

/**
 * @param {string} row
 * @returns {string[]}
 */
function splitRow(row) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

/**
 * Classify a matrix cell value into a category for an operation.
 * @param {string} value
 * @returns {'EXCLUSIVE'|'BLOCKED'|'ALLOWED'|'UNKNOWN'}
 */
function classifyCell(value) {
  const v = String(value).toUpperCase();
  // Whole-word matching so short tokens like "NO" don't match inside
  // "UNKNOWN"/"NOTE" (CodeRabbit major: substring false positives).
  const has = (word) => new RegExp(`\\b${word}\\b`).test(v);
  if (has('YES') || has('EXCLUSIVE')) return 'EXCLUSIVE';
  if (has('BLOCKED') || has('NO') || /\bNOT\s+OWN\b/.test(v)) return 'BLOCKED';
  if (has('ALLOWED') || has('LOCAL')) return 'ALLOWED';
  return 'UNKNOWN';
}

/**
 * Extract the authority matrix for a mentor agent.
 *
 * Strategy:
 *   1. From the delegation-matrix markdown, find the section for `@{agentId}`
 *      and parse its operation table(s).
 *   2. Classify each operation row into EXCLUSIVE / BLOCKED / ALLOWED.
 *   3. Supplement with the agent YAML `persona.exclusive_authority` note.
 *
 * @param {object} mentorAgent Parsed mentor agent object.
 * @param {object} [opts]
 * @param {string} [opts.rulePath] Override the authority rule file (testing).
 * @param {string} [opts.ruleText] Provide rule markdown directly (testing).
 * @returns {{agent_id: string, exclusive: string[], blocked: string[], allowed: string[], note: string|null, source: string}}
 */
function extractAuthorityMatrix(mentorAgent, opts = {}) {
  if (!mentorAgent || typeof mentorAgent !== 'object') {
    throw new TypeError('extractAuthorityMatrix: mentorAgent must be a parsed agent object');
  }
  const agent = mentorAgent.agent || {};
  const agentId = agent.id || agent.name || 'unknown';
  const token = agentToken(agentId);

  const ruleText = typeof opts.ruleText === 'string'
    ? opts.ruleText
    : loadAuthorityRule(opts.rulePath);

  const exclusive = [];
  const blocked = [];
  const allowed = [];

  if (ruleText) {
    const lines = ruleText.split('\n');

    // 1) Section-scoped tables: a heading mentioning `@{id}` owns the next table.
    const sectionRows = collectSectionTable(lines, token);
    for (const row of sectionRows) {
      const headers = Object.keys(row).map((h) => h.toLowerCase());
      const isTwoColumn =
        headers.some((h) => h.includes('allowed')) && headers.some((h) => h.includes('blocked'));
      if (isTwoColumn) {
        // Allowed | Blocked two-column style (e.g. @dev table).
        classifyTwoColumn(row, allowed, blocked);
        continue;
      }
      const op = row.Operation || row.Owns || row['Owns (delegated from @architect)'];
      if (!op) continue;
      const verdictCell = row['Exclusive?'] || row.Exclusive || '';
      const cat = classifyCell(verdictCell);
      if (cat === 'EXCLUSIVE') exclusive.push(op);
      else if (cat === 'BLOCKED') blocked.push(op);
      else allowed.push(op);
    }

    // 2) Global "EXCLUSIVE Authority" matrix rows where the agent is named.
    collectGlobalExclusive(lines, token, exclusive, blocked);
  }

  // 3) Supplement: agent YAML persona.exclusive_authority note (text signal).
  let note = null;
  const exAuth = mentorAgent.persona && mentorAgent.persona.exclusive_authority;
  if (exAuth) {
    if (typeof exAuth === 'string') note = exAuth;
    else if (typeof exAuth === 'object' && typeof exAuth.note === 'string') note = exAuth.note;
  }

  return {
    agent_id: agentId,
    exclusive: dedupe(exclusive),
    blocked: dedupe(blocked),
    allowed: dedupe(allowed),
    note,
    source: ruleText
      ? '.claude/rules/agent-authority.md + persona.exclusive_authority'
      : 'persona.exclusive_authority (rule file unavailable)',
  };
}

/**
 * Find the markdown section whose heading mentions `token` and return the rows
 * of the first table inside it.
 * @param {string[]} lines
 * @param {string} token e.g. "@devops"
 * @returns {Array<Record<string,string>>}
 */
function collectSectionTable(lines, token) {
  let inSection = false;
  const tableLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      // A new heading. Enter section if it references the token; else, if we
      // were already collecting, stop at the next heading.
      if (hasToken(line, token)) {
        inSection = true;
        continue;
      }
      if (inSection && tableLines.length > 0) break;
      inSection = hasToken(line, token);
      continue;
    }
    if (inSection && line.trim().startsWith('|')) {
      tableLines.push(line);
    } else if (inSection && tableLines.length > 0 && line.trim() === '') {
      // Blank line after a table ends it.
      break;
    }
  }
  return parseTable(tableLines);
}

/**
 * Scan a two-column "Allowed | Blocked" row (e.g. @dev table) and bucket cells.
 * @param {Record<string,string>} row
 * @param {string[]} allowed
 * @param {string[]} blocked
 */
function classifyTwoColumn(row, allowed, blocked) {
  for (const [header, value] of Object.entries(row)) {
    if (!value) continue;
    const h = header.toLowerCase();
    if (h.includes('allowed')) allowed.push(value);
    else if (h.includes('blocked')) blocked.push(value);
  }
}

/**
 * From the global delegation matrix, collect operations marked exclusive that
 * name the token, and operations explicitly blocked for the token.
 * @param {string[]} lines
 * @param {string} token
 * @param {string[]} exclusive
 * @param {string[]} blocked
 */
function collectGlobalExclusive(lines, token, exclusive, blocked) {
  const tableBlocks = extractAllTables(lines);
  for (const rows of tableBlocks) {
    for (const row of rows) {
      const values = Object.values(row).join(' ');
      const op = row.Operation || row.Allowed || '';
      if (!op) continue;
      // Operation that names this token as exclusive owner.
      if (hasToken(values, token) && /exclusive|only/i.test(values)) {
        exclusive.push(op);
      }
      if (hasToken(values, token) && /blocked/i.test(values)) {
        blocked.push(op);
      }
    }
  }
}

/**
 * Extract every markdown table in the document as an array of row-object arrays.
 * @param {string[]} lines
 * @returns {Array<Array<Record<string,string>>>}
 */
function extractAllTables(lines) {
  const tables = [];
  let current = [];
  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      current.push(line);
    } else if (current.length > 0) {
      tables.push(parseTable(current));
      current = [];
    }
  }
  if (current.length > 0) tables.push(parseTable(current));
  return tables.filter((t) => t.length > 0);
}

/**
 * Validate that a cloned squad's authority does not exceed the mentor's (AC3:
 * no privilege escalation). A clone may DROP authority but never ADD exclusive
 * operations the mentor lacks.
 * @param {object} mentorMatrix Result of extractAuthorityMatrix(mentor).
 * @param {object} cloneMatrix Proposed cloned-squad authority matrix.
 * @returns {{valid: boolean, escalations: string[]}}
 */
function validateNoEscalation(mentorMatrix, cloneMatrix) {
  const mentorExclusive = new Set((mentorMatrix && mentorMatrix.exclusive) || []);
  const mentorAllowed = new Set((mentorMatrix && mentorMatrix.allowed) || []);
  const cloneExclusive = (cloneMatrix && cloneMatrix.exclusive) || [];
  const cloneAllowed = (cloneMatrix && cloneMatrix.allowed) || [];

  const escalations = [];
  for (const op of cloneExclusive) {
    if (!mentorExclusive.has(op)) {
      escalations.push(`exclusive: "${op}" not held by mentor`);
    }
  }
  for (const op of cloneAllowed) {
    if (!mentorAllowed.has(op) && !mentorExclusive.has(op)) {
      escalations.push(`allowed: "${op}" not held by mentor`);
    }
  }
  return { valid: escalations.length === 0, escalations };
}

/**
 * Render an authority documentation markdown for a cloned squad (AC4). Lists
 * inherited exclusive operations + constraints.
 * @param {string} squadId
 * @param {object} matrix Result of extractAuthorityMatrix(mentor).
 * @returns {string} markdown
 */
function renderAuthorityDoc(squadId, matrix) {
  const lines = [];
  lines.push(`# Authority Matrix — ${squadId}`);
  lines.push('');
  lines.push(`> Inherited from \`@${matrix.agent_id}\` on ${new Date().toISOString().slice(0, 10)}.`);
  lines.push(`> Source: ${matrix.source}`);
  lines.push('');
  lines.push('## Inherited Exclusive Operations');
  lines.push('');
  if (matrix.exclusive.length === 0) {
    lines.push('_None — the mentor declares no exclusive operations._');
  } else {
    for (const op of matrix.exclusive) lines.push(`- ${op}`);
  }
  lines.push('');
  lines.push('## Blocked Operations');
  lines.push('');
  if (matrix.blocked.length === 0) lines.push('_None._');
  else for (const op of matrix.blocked) lines.push(`- ${op}`);
  lines.push('');
  lines.push('## Allowed Operations');
  lines.push('');
  if (matrix.allowed.length === 0) lines.push('_None recorded._');
  else for (const op of matrix.allowed) lines.push(`- ${op}`);
  lines.push('');
  lines.push('## Constraints (No Privilege Escalation — AC3)');
  lines.push('');
  lines.push(`- This squad inherits authority from \`@${matrix.agent_id}\` and MUST NOT exceed it.`);
  lines.push('- A cloned squad may DROP authority but may never ADD an exclusive operation the mentor lacks.');
  lines.push('- Example: a squad cloned from `@devops` inherits the `git push` exclusive, but cannot create global CI/CD rules beyond the mentor scope.');
  if (matrix.note) {
    lines.push('');
    lines.push('## Mentor Note');
    lines.push('');
    lines.push(`> ${matrix.note}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Persist the authority doc to `.aiox/squad-dnas/{squad-id}-authority.md` (AC4).
 * @param {string} squadId
 * @param {object} matrix
 * @param {string} [baseDir=process.cwd()]
 * @returns {string} absolute path written
 */
function saveAuthorityDoc(squadId, matrix, baseDir = process.cwd()) {
  if (!squadId || typeof squadId !== 'string') {
    throw new TypeError('saveAuthorityDoc: squadId is required');
  }
  // Harden against path traversal: strip any directory components and reject
  // ids that are not a safe slug (CodeRabbit major: path traversal).
  const safeId = path.basename(squadId);
  if (!/^[A-Za-z0-9._-]+$/.test(safeId) || safeId.startsWith('.')) {
    throw new TypeError(`saveAuthorityDoc: unsafe squadId "${squadId}"`);
  }
  const outDir = path.join(baseDir, '.aiox', 'squad-dnas');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safeId}-authority.md`);
  if (!path.resolve(outPath).startsWith(path.resolve(outDir))) {
    throw new Error('saveAuthorityDoc: resolved path escapes output directory');
  }
  fs.writeFileSync(outPath, renderAuthorityDoc(squadId, matrix), 'utf8');
  return outPath;
}

/**
 * @param {string[]} arr
 * @returns {string[]}
 */
function dedupe(arr) {
  return Array.from(new Set(arr.filter((v) => typeof v === 'string' && v.trim() !== '')));
}

module.exports = {
  extractAuthorityMatrix,
  validateNoEscalation,
  renderAuthorityDoc,
  saveAuthorityDoc,
  loadAuthorityRule,
  // exported for unit testing of internals
  parseTable,
  classifyCell,
  agentToken,
  hasToken,
};
