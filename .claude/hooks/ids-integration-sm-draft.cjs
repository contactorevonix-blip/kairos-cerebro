#!/usr/bin/env node
'use strict';

/**
 * ids-integration-sm-draft.cjs — IDS Decision Engine integration for @sm *draft
 * Story IDS-OPS.2 (Article IV-A, Gate G2 — Story Creation).
 *
 * PreToolUse hook (matcher: Write on a `*.story.md` file). Before @sm writes a
 * new story file, this hook invokes the IDS Decision Engine (Story IDS-OPS.1,
 * `aiox-ids ids:recommend --json`) with an intent derived from the story
 * title/description, and surfaces a REUSE/ADAPT recommendation to @sm so the
 * user can accept or reject it (AC2) BEFORE a potential duplicate is created.
 *
 * Decision handling (consistent with .claude/rules/ids-principles.md):
 *   - REUSE (>=90%)  → `ask` — @sm presents 1/2/3 options to the user.
 *   - ADAPT (60-89%) → `ask` — @sm presents 1/2/3 options to the user.
 *   - CREATE (no match) → `allow` silently — no ambiguity to resolve.
 *
 * Graceful degradation (AC1, Art. IV-A circuit breaker):
 *   The hook NEVER blocks story creation. If the Decision Engine is
 *   unavailable (registry corrupt, error, or timeout > 2s), the hook logs
 *   `warn-and-proceed` and allows the Write. Development is never blocked by an
 *   IDS failure.
 *
 * Framework Boundary: lives in `.claude/hooks/` (L4) and touches no L2 file —
 * the @architect-approved hook pattern (Story IDS-OPS.2 Framework Boundary
 * Alert, path #2).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-iv-a-ids-g2';
const GATE = 'ids-sm-draft';
const IDS_BIN = path.join('bin', 'aiox-ids.js');
const STORY_FILE_RE = /\.story\.md$/i;
const DECISION_ENGINE_TIMEOUT_MS = 2000; // Art. IV-A circuit breaker (2s).
const MAX_INTENT_LEN = 200;

/** Is this Write/Edit targeting a story file (the artefact @sm *draft creates)? */
function isStoryWrite(toolInput) {
  const filePath = toolInput && (toolInput.file_path || toolInput.path);
  return Boolean(filePath) && STORY_FILE_RE.test(String(filePath));
}

/**
 * Derive an IDS intent from the story content (title + summary/description).
 * Falls back to the filename slug when content has no usable title.
 * @param {string} content - the story markdown being written
 * @param {string} [filePath] - the target story path (slug fallback)
 * @returns {string} a non-empty intent string (<= MAX_INTENT_LEN chars)
 */
function deriveIntent(content, filePath) {
  const text = String(content || '');

  // 1. First markdown H1 (e.g. "# Story IDS-OPS.2 — @sm Integration").
  let title = '';
  const h1 = text.match(/^\s*#\s+(.+?)\s*$/m);
  if (h1) {
    title = h1[1]
      .replace(/^story\s+[A-Za-z0-9.\-]+\s*[—:-]\s*/i, '') // strip "Story <id> — "
      .replace(/[*_`#]/g, '')
      .trim();
  }

  // 2. Summary section (first non-empty line under "## Summary").
  let summary = '';
  const summaryBlock = text.match(/##\s*Summary\s*\n+([^\n]+)/i);
  if (summaryBlock) {
    summary = summaryBlock[1].replace(/[*_`]/g, '').trim();
  }

  let intent = [title, summary].filter(Boolean).join(' ').trim();

  // 3. Fallback: filename slug (e.g. "IDS-OPS.2-sm-ids-integration").
  if (!intent && filePath) {
    intent = path
      .basename(String(filePath))
      .replace(/\.story\.md$/i, '')
      .replace(/^[A-Za-z0-9.]+[-.]/, '') // drop leading id segment
      .replace(/[-_]+/g, ' ')
      .trim();
  }

  if (!intent) intent = 'new story';
  if (intent.length > MAX_INTENT_LEN) intent = intent.slice(0, MAX_INTENT_LEN).trim();
  return intent;
}

/**
 * Invoke the IDS Decision Engine via CLI (Art. I — CLI First) with a circuit
 * breaker. Returns a normalized result or an `{ available: false }` marker on
 * any failure/timeout (graceful degradation — never throws).
 *
 * @param {string} intent
 * @param {object} [opts]
 * @param {(cmd:string,args:string[],options:object)=>{status:number,stdout:string,stderr:string,error?:Error}} [opts.runner]
 *        injectable subprocess runner (defaults to spawnSync) — enables testing.
 * @param {string} [opts.cwd]
 * @param {number} [opts.timeoutMs]
 * @returns {{ available: boolean, decision?: string, confidence?: string, top?: object, summary?: object, reason?: string }}
 */
function runDecisionEngine(intent, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const runner = opts.runner || spawnSync;
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : DECISION_ENGINE_TIMEOUT_MS;
  const binPath = path.join(cwd, IDS_BIN);

  let result;
  try {
    result = runner('node', [binPath, 'ids:recommend', intent, '--type', 'task', '--json'], {
      cwd,
      encoding: 'utf-8',
      timeout: timeoutMs,
    });
  } catch (err) {
    return { available: false, reason: `runner-threw: ${err && err.message}` };
  }

  if (!result || result.error) {
    const reason = result && result.error ? String(result.error.message || result.error) : 'no-result';
    // spawnSync sets result.error (e.g. ETIMEDOUT) on timeout/spawn failure.
    return { available: false, reason: `engine-error: ${reason}` };
  }
  if (result.status !== 0) {
    return { available: false, reason: `engine-exit-${result.status}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (err) {
    return { available: false, reason: `parse-error: ${err && err.message}` };
  }

  const summary = parsed && parsed.summary;
  if (!summary || !summary.decision) {
    return { available: false, reason: 'malformed-output' };
  }

  const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  // Top recommendation that matches the overall decision (REUSE/ADAPT candidate).
  const top =
    recommendations.find((r) => r && r.decision === summary.decision) || recommendations[0] || null;

  return {
    available: true,
    decision: summary.decision,
    confidence: summary.confidence,
    top,
    summary,
  };
}

/**
 * Classify an engine result into the action the hook should take.
 * @param {object} engineResult - output of runDecisionEngine
 * @returns {'reuse'|'adapt'|'create'|'degraded'}
 */
function classifyDecision(engineResult) {
  if (!engineResult || !engineResult.available) return 'degraded';
  switch (engineResult.decision) {
    case 'REUSE':
      return 'reuse';
    case 'ADAPT':
      return 'adapt';
    default:
      return 'create';
  }
}

/**
 * Build the human-readable message @sm relays to the user as 1/2/3 options
 * (ALWAYS rule #1). Only called for REUSE/ADAPT.
 * @param {object} engineResult
 * @param {string} intent
 * @returns {string}
 */
function buildOptionsMessage(engineResult, intent) {
  const top = engineResult.top || {};
  const score =
    typeof top.relevanceScore === 'number' ? `${(top.relevanceScore * 100).toFixed(1)}%` : 'n/a';
  const isReuse = engineResult.decision === 'REUSE';
  const verb = isReuse ? 'REUSE' : 'ADAPT';

  const lines = [];
  lines.push(`IDS Decision Engine (Gate G2) — intent: "${intent}"`);
  lines.push(`Recommendation: ${verb} (${engineResult.confidence} confidence)`);
  if (top.entityId) {
    lines.push(`Candidate: ${top.entityId} [${top.entityType || 'entity'}] — relevance ${score}`);
  }
  if (top.entityPath) lines.push(`Path: ${top.entityPath}`);
  if (top.rationale) lines.push(`Why: ${top.rationale}`);
  lines.push('');
  lines.push('@sm: present these options to the user before creating the story:');
  if (isReuse) {
    lines.push(`  1. Reutilizar entidade existente (REUSE) — ${top.entityId || 'candidate'}`);
    lines.push(`  2. Adaptar a entidade existente (ADAPT) em vez de duplicar`);
    lines.push(`  3. Prosseguir com CREATE mesmo assim (registar [AUTO-DECISION] + motivo no Change Log)`);
  } else {
    lines.push(`  1. Adaptar entidade existente (ADAPT) — ${top.entityId || 'candidate'}`);
    lines.push(`  2. Reutilizar como referência (REUSE) se cobrir o caso`);
    lines.push(`  3. Prosseguir com CREATE mesmo assim (registar [AUTO-DECISION] + motivo no Change Log)`);
  }
  return lines.join('\n');
}

/**
 * Pure decision core (testable without stdin/process).
 * @param {object} toolInput - the PreToolUse tool_input
 * @param {object} [opts] - passed through to runDecisionEngine (runner/cwd/timeoutMs)
 * @returns {{ action: 'allow'|'ask', permissionDecision: 'allow'|'ask', reason: string, intent?: string, classification: string }}
 */
function evaluate(toolInput, opts = {}) {
  if (!isStoryWrite(toolInput)) {
    return { action: 'allow', permissionDecision: 'allow', reason: 'not-a-story-write', classification: 'skip' };
  }

  const content = toolInput.content || toolInput.new_string || '';
  const filePath = toolInput.file_path || toolInput.path || '';
  const intent = deriveIntent(content, filePath);

  const engineResult = runDecisionEngine(intent, opts);
  const classification = classifyDecision(engineResult);

  if (classification === 'degraded') {
    return {
      action: 'allow',
      permissionDecision: 'allow',
      reason: `IDS unavailable (${engineResult && engineResult.reason}) — proceeding (warn-and-proceed).`,
      intent,
      classification,
    };
  }

  if (classification === 'create') {
    return {
      action: 'allow',
      permissionDecision: 'allow',
      reason: `IDS: CREATE (no reusable match) — proceeding with new story.`,
      intent,
      classification,
    };
  }

  // REUSE or ADAPT — surface options to @sm (user accepts/rejects).
  return {
    action: 'ask',
    permissionDecision: 'ask',
    reason: buildOptionsMessage(engineResult, intent),
    intent,
    classification,
  };
}

function main() {
  const input = gl.parseInput(gl.readStdin());
  if (!input) {
    // Parse failure — never block @sm. Allow and proceed.
    process.exitCode = 0;
    return;
  }

  const toolInput = input.tool_input || {};
  if (!isStoryWrite(toolInput)) {
    // Not a story creation — nothing to do.
    return;
  }

  gl.recordMetrics({ gatesEnforced: 1 });

  const verdict = evaluate(toolInput);

  if (verdict.classification === 'degraded') {
    gl.logGateDecision({
      article: ARTICLE,
      gate: GATE,
      decision: 'warn-and-proceed',
      reason: verdict.reason,
      intent: verdict.intent,
    });
    return; // allow (no output needed)
  }

  if (verdict.classification === 'create') {
    gl.logGateDecision({
      article: ARTICLE,
      gate: GATE,
      decision: 'allow',
      reason: verdict.reason,
      intent: verdict.intent,
    });
    return;
  }

  // REUSE / ADAPT — ask the user (via @sm) before creating a duplicate.
  gl.recordMetrics({ violationsDetected: 1 });
  gl.logGateDecision({
    article: ARTICLE,
    gate: GATE,
    decision: 'ask',
    reason: `${verdict.classification.toUpperCase()} recommended for "${verdict.intent}" — user prompted.`,
    intent: verdict.intent,
  });
  gl.emitDecision('ask', verdict.reason);
  // `ask` does not block; it surfaces options. Exit 0 (the decision is in stdout).
  process.exitCode = 0;
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  GATE,
  DECISION_ENGINE_TIMEOUT_MS,
  isStoryWrite,
  deriveIntent,
  runDecisionEngine,
  classifyDecision,
  buildOptionsMessage,
  evaluate,
  main,
};
