#!/usr/bin/env node
'use strict';

/**
 * enforce-no-invention.cjs — Constitution Article IV (No Invention)
 * Story 1.16 AC3.
 *
 * PreToolUse hook (matcher: Write/Edit on a *spec.md file). Validates that
 * normative statements in a spec trace to a requirement reference:
 *   - FR-*  (functional requirement)
 *   - NFR-* (non-functional requirement)
 *   - CON-* (constraint)
 *   - a [research:...] / [finding:...] citation
 *
 * Normative statements are detected by the keywords MUST / MUST NOT / SHALL /
 * REQUIRED (the RFC-2119 vocabulary used in AIOX specs). A normative line with
 * NO traceable reference is an "invention".
 *
 * Default behaviour is BLOCK (Constitution Art. IV is MUST, not soft). Set
 * AIOX_NO_INVENTION_PERMISSIVE=1 to allow untraceable specs (rare: only for
 * draft specs before research phase).
 */

const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-iv-no-invention';

const NORMATIVE_RE = /\b(MUST NOT|MUST|SHALL NOT|SHALL|REQUIRED)\b/;
const REFERENCE_RE = /\b(FR-\d+|NFR-\d+|CON-\d+)\b|\[(research|finding)[:\]]/i;

function isSpecFile(filePath) {
  return /spec\.md$/i.test(String(filePath || ''));
}

/** Pull the content being written/edited from the tool input. */
function extractContent(toolInput) {
  if (!toolInput) return '';
  // Write provides `content`; Edit provides `new_string`.
  return String(toolInput.content || toolInput.new_string || '');
}

/**
 * Return the list of untraceable normative lines (inventions).
 * @param {string} content
 * @returns {Array<{line:number, text:string}>}
 */
function findInventions(content) {
  const inventions = [];
  const lines = String(content || '').split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('>')) return;
    if (NORMATIVE_RE.test(line) && !REFERENCE_RE.test(line)) {
      inventions.push({ line: idx + 1, text: line.slice(0, 160) });
    }
  });
  return inventions;
}

function isPermissive() {
  return process.env.AIOX_NO_INVENTION_PERMISSIVE === '1';
}

function main() {
  const input = gl.parseInput(gl.readStdin());
  if (!input) return;

  const toolInput = input?.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';
  if (!isSpecFile(filePath)) return;

  gl.recordMetrics({ gatesEnforced: 1 });

  const content = extractContent(toolInput);
  const inventions = findInventions(content);

  if (inventions.length === 0) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'no-invention',
      decision: 'allow',
      reason: 'All normative statements trace to a requirement reference.',
      file: filePath,
    });
    return;
  }

  gl.recordMetrics({ violationsDetected: 1 });

  const summary = inventions
    .map((i) => `  • L${i.line}: "${i.text}"`)
    .join('\n');

  // DEFAULT: BLOCK (Constitution Art. IV is MUST, not soft)
  if (!isPermissive()) {
    gl.recordMetrics({ violationsBlocked: 1 });
    const reason = `Spec contains ${inventions.length} untraceable normative statement(s) (Constitution Article IV — No Invention). Every MUST/SHALL/REQUIRED must trace to FR-*, NFR-*, CON-*, or a [research:] finding:\n${summary}`;
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'no-invention',
      decision: 'block',
      reason,
      file: filePath,
      inventions,
    });
    gl.emitDecision('deny', reason);
    process.exitCode = 2;
    return;
  }

  // Permissive mode (draft specs) — warn and proceed.
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'no-invention',
    decision: 'warn',
    reason: `${inventions.length} untraceable normative statement(s) (permissive mode).`,
    file: filePath,
    inventions,
  });
  process.stderr.write(
    `⚠️  Art. IV (No Invention): ${inventions.length} normative statement(s) without FR-/NFR-/CON-/research reference:\n${summary}\n` +
      'Add a requirement reference (RECOMMENDED).\n',
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  NORMATIVE_RE,
  REFERENCE_RE,
  isSpecFile,
  extractContent,
  findInventions,
  main,
};
