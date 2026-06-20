#!/usr/bin/env node
'use strict';

/**
 * enforce-spec-reference-validation.cjs — Constitution Article IV (No Invention),
 * Layer 2 (reference validation). Story 12.4 (FR-5.4).
 *
 * The Art. IV gate has two layers:
 *   - Layer 1 — enforce-no-invention.cjs: pattern detection. Flags normative
 *     statements (MUST/SHALL/REQUIRED) that carry NO requirement reference.
 *   - Layer 2 — THIS hook: reference validation. A statement may cite a
 *     reference (FR-12, NFR-5, CON-7) yet still be an "invention" if that
 *     reference does not actually exist in the project's requirements set.
 *
 * Together: pattern detection (L1) + reference validation (L2) = zero false
 * positives. A spec line is only accepted when its citation resolves to a real
 * requirement id.
 *
 * PreToolUse hook (matcher: Write/Edit on a *spec.md file). It:
 *   1. extracts every FR / NFR / CON reference cited in the content,
 *   2. loads the known requirement ids from the nearest requirements.json,
 *   3. blocks when a cited reference does not exist (a "dangling reference").
 *
 * Default behaviour is BLOCK (Art. IV is MUST). Graceful degradation: when no
 * requirements.json can be located/parsed, the validator cannot know the valid
 * set, so it WARNS and proceeds (it must never block development on a missing
 * data source — CON-3). Set AIOX_SPEC_REF_PERMISSIVE=1 to downgrade dangling
 * references from BLOCK to WARN (rare: drafts authored before requirements.json
 * is finalized).
 */

const fs = require('fs');
const path = require('path');
const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-iv-no-invention';

// Cited references in a spec line: FR-1.2, NFR-5, CON-7 (dotted or plain).
const REFERENCE_TOKEN_RE = /\b((?:FR|NFR|CON)-\d+(?:\.\d+)*)\b/gi;

function isSpecFile(filePath) {
  return /spec\.md$/i.test(String(filePath || ''));
}

/** Pull the content being written/edited from the tool input. */
function extractContent(toolInput) {
  if (!toolInput) return '';
  // Write provides `content`; Edit provides `new_string`.
  return String(toolInput.content || toolInput.new_string || '');
}

function isPermissive() {
  return process.env.AIOX_SPEC_REF_PERMISSIVE === '1';
}

/**
 * Extract every cited requirement reference from spec content.
 * Skips fenced code blocks (```...```) so example snippets aren't validated.
 * @param {string} content
 * @returns {Array<{ref:string, line:number}>}
 */
function extractReferences(content) {
  const refs = [];
  const seen = new Set();
  const lines = String(content || '').split(/\r?\n/);
  let inFence = false;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (/^```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    let match;
    REFERENCE_TOKEN_RE.lastIndex = 0;
    while ((match = REFERENCE_TOKEN_RE.exec(line)) !== null) {
      const ref = match[1].toUpperCase();
      const key = `${ref}@${idx + 1}`;
      if (!seen.has(key)) {
        seen.add(key);
        refs.push({ ref, line: idx + 1 });
      }
    }
  });

  return refs;
}

/**
 * Walk up from the spec file's directory looking for a requirements.json.
 * Checks each directory and a sibling `spec/` subfolder. Stops at the project
 * root (cwd) or after a sane depth limit.
 * @param {string} specFilePath
 * @param {string} [cwd]
 * @returns {string|null} absolute path to requirements.json, or null
 */
function findRequirementsFile(specFilePath, cwd = process.cwd()) {
  try {
    const start = path.dirname(path.resolve(cwd, String(specFilePath || '')));
    const root = path.resolve(cwd);
    let dir = start;

    for (let depth = 0; depth < 12; depth += 1) {
      const candidates = [
        path.join(dir, 'requirements.json'),
        path.join(dir, 'spec', 'requirements.json'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break; // filesystem root
      if (path.resolve(dir) === root) break; // do not escape the project
      dir = parent;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Read the set of known requirement ids (FR / NFR / CON) from a
 * requirements.json. Returns null when the file can't be read/parsed so the
 * caller can degrade gracefully (warn-and-proceed) rather than block.
 * @param {string} requirementsPath
 * @returns {Set<string>|null}
 */
function loadKnownReferences(requirementsPath) {
  try {
    const raw = fs.readFileSync(requirementsPath, 'utf8');
    const data = JSON.parse(raw);
    const ids = new Set();

    const collect = (arr) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (item && typeof item.id === 'string') {
          ids.add(item.id.toUpperCase());
        }
      }
    };

    collect(data.functional);
    collect(data.nonFunctional);
    collect(data.constraints);

    return ids;
  } catch {
    return null;
  }
}

/**
 * Compare cited references against the known set.
 * @param {Array<{ref:string, line:number}>} references
 * @param {Set<string>} known
 * @returns {Array<{ref:string, line:number}>} dangling (non-existent) references
 */
function findDanglingReferences(references, known) {
  if (!known) return [];
  return references.filter((r) => !known.has(r.ref.toUpperCase()));
}

function main() {
  const input = gl.parseInput(gl.readStdin());
  if (!input) return;

  const toolInput = input?.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';
  if (!isSpecFile(filePath)) return;

  gl.recordMetrics({ gatesEnforced: 1 });

  const content = extractContent(toolInput);
  const references = extractReferences(content);

  // Nothing cited — Layer 1 (pattern detection) already covers untraced lines.
  if (references.length === 0) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'spec-reference-validation',
      decision: 'allow',
      reason: 'No requirement references cited; nothing to validate at Layer 2.',
      file: filePath,
    });
    return;
  }

  const requirementsPath = findRequirementsFile(filePath);
  const known = requirementsPath ? loadKnownReferences(requirementsPath) : null;

  // Graceful degradation — cannot determine the valid set, so do not block.
  if (!known) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'spec-reference-validation',
      decision: 'warn-and-proceed',
      reason:
        'requirements.json not found or unreadable; reference validation skipped (warn-and-proceed).',
      file: filePath,
    });
    process.stderr.write(
      '⚠️  Art. IV (Reference Validation): could not locate a readable requirements.json — ' +
        'skipping Layer 2 reference validation (warn-and-proceed).\n',
    );
    return;
  }

  const dangling = findDanglingReferences(references, known);

  if (dangling.length === 0) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'spec-reference-validation',
      decision: 'allow',
      reason: `All ${references.length} cited reference(s) exist in ${path.basename(requirementsPath)}.`,
      file: filePath,
    });
    return;
  }

  gl.recordMetrics({ violationsDetected: 1 });

  const summary = dangling
    .map((d) => `  • L${d.line}: "${d.ref}" — not found in requirements.json`)
    .join('\n');

  // DEFAULT: BLOCK (Constitution Art. IV is MUST, not soft).
  if (!isPermissive()) {
    gl.recordMetrics({ violationsBlocked: 1 });
    const reason =
      `Spec cites ${dangling.length} reference(s) that do not exist in requirements ` +
      `(Constitution Article IV — No Invention, Layer 2). A citation must resolve to a ` +
      `real FR-*/NFR-*/CON- id:\n${summary}`;
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'spec-reference-validation',
      decision: 'block',
      reason,
      file: filePath,
      dangling,
      requirementsFile: requirementsPath,
    });
    gl.emitDecision('deny', reason);
    process.exitCode = 2;
    return;
  }

  // Permissive mode (draft specs) — warn and proceed.
  gl.recordMetrics({ overridesUsed: 1 });
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'spec-reference-validation',
    decision: 'override',
    reason: `${dangling.length} dangling reference(s) (permissive mode).`,
    file: filePath,
    dangling,
    requirementsFile: requirementsPath,
  });
  process.stderr.write(
    `⚠️  Art. IV (Reference Validation): ${dangling.length} cited reference(s) do not exist ` +
      `in requirements.json (permissive mode):\n${summary}\n` +
      'Cite an existing FR-/NFR-/CON- id (RECOMMENDED).\n',
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  REFERENCE_TOKEN_RE,
  isSpecFile,
  extractContent,
  isPermissive,
  extractReferences,
  findRequirementsFile,
  loadKnownReferences,
  findDanglingReferences,
  main,
};
