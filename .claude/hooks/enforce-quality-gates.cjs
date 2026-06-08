#!/usr/bin/env node
'use strict';

/**
 * enforce-quality-gates.cjs — Constitution Articles V-VII
 * Story 1.16 AC4.
 *
 * Two responsibilities:
 *
 *  1. Art. V (Quality First) — when a MERGE commit is attempted
 *     (`git merge` / `git commit --merge` / a commit on a merge), block if the
 *     recorded quality status is failing. Quality status is read from
 *     .synapse/metrics/hook-metrics.json (`quality.status`) when present.
 *     Unknown status => warn-and-proceed (never block on missing data).
 *
 *  2. Art. VI-VII (Framework Boundary) — block Write/Edit to protected L1/L2
 *     framework paths (.aiox-core/core/, .aiox-core/development/tasks|templates|
 *     checklists|workflows/, .aiox-core/infrastructure/, bin/aiox*.js,
 *     .aiox-core/constitution.md) unless explicitly allowed.
 *
 * Override: `--force-gate` in a command, or AIOX_FORCE_GATE=1, allows an
 * otherwise-blocked merge (audit-logged). Framework-boundary writes are not
 * overridable here (deny rules in settings.json are the hard backstop).
 */

const fs = require('fs');
const path = require('path');
const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-v-vii-quality-boundary';
const FORCE_FLAG = '--force-gate';

// L1 + L2 protected paths (normalized with forward slashes).
const PROTECTED_PREFIXES = [
  '.aiox-core/core/',
  '.aiox-core/development/tasks/',
  '.aiox-core/development/templates/',
  '.aiox-core/development/checklists/',
  '.aiox-core/development/workflows/',
  '.aiox-core/infrastructure/',
];
const PROTECTED_FILES = [
  '.aiox-core/constitution.md',
  'bin/aiox.js',
  'bin/aiox-init.js',
];

function normPath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function isProtectedPath(filePath) {
  const rel = normPath(filePath)
    .replace(/^([a-z]:)?\/?.*?(?=\.aiox-core\/|bin\/)/i, ''); // strip any absolute prefix up to the project marker
  const candidate = rel || normPath(filePath);
  if (PROTECTED_FILES.some((f) => candidate.endsWith(f))) return true;
  return PROTECTED_PREFIXES.some((prefix) => candidate.includes(prefix));
}

function isMergeCommand(command) {
  const c = gl.normalizeCommand(command);
  return /\bgit\s+merge\b/i.test(c) || /\bgit\s+commit\b[^|]*--merge\b/i.test(c);
}

function hasForce(command) {
  return gl.normalizeCommand(command).includes(FORCE_FLAG) || process.env.AIOX_FORCE_GATE === '1';
}

/** Read recorded quality status. Returns 'pass' | 'fail' | 'unknown'. */
function readQualityStatus(cwd = process.cwd()) {
  try {
    const metricsPath = path.join(cwd, gl.METRICS_RELATIVE);
    if (!fs.existsSync(metricsPath)) return 'unknown';
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const status = String(metrics?.quality?.status || '').toLowerCase();
    if (status === 'pass' || status === 'fail') return status;
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function handleFrameworkBoundary(input) {
  const toolInput = input?.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';
  if (!filePath || !isProtectedPath(filePath)) return false;

  gl.recordMetrics({ gatesEnforced: 1, violationsDetected: 1, violationsBlocked: 1 });
  const reason = `Framework boundary protection (Constitution Art. VI-VII): ${filePath} is L1/L2 (NEVER modify). Make project-layer (L4) changes instead, or route framework changes through @aiox-master *propose-modification.`;
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'framework-boundary',
    decision: 'block',
    reason,
    file: filePath,
  });
  gl.emitDecision('deny', reason);
  process.exitCode = 2;
  return true;
}

function handleMergeQuality(input) {
  const command = input?.tool_input?.command || '';
  if (!isMergeCommand(command)) return false;

  gl.recordMetrics({ gatesEnforced: 1 });
  const status = readQualityStatus();

  if (status === 'unknown') {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'quality-merge',
      decision: 'warn-and-proceed',
      reason: 'Quality status unknown — proceeding (no recorded gate result).',
    });
    return true;
  }

  if (status === 'pass') {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'quality-merge',
      decision: 'allow',
      reason: 'Quality gate status = pass.',
    });
    return true;
  }

  // status === 'fail'
  gl.recordMetrics({ violationsDetected: 1 });

  if (hasForce(command)) {
    gl.recordMetrics({ overridesUsed: 1 });
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'quality-merge',
      decision: 'override',
      reason: `Quality gate = fail but merge forced via ${FORCE_FLAG}/AIOX_FORCE_GATE.`,
      override: FORCE_FLAG,
    });
    process.stderr.write(`⚠️  Art. V override: merge forced despite failing quality gate (audit-logged).\n`);
    return true;
  }

  gl.recordMetrics({ violationsBlocked: 1 });
  const reason = `Merge blocked (Constitution Article V — Quality First): recorded quality gate status = FAIL. Fix lint/typecheck/test/CodeRabbit, or override with ${FORCE_FLAG} (audit-logged).`;
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'quality-merge',
    decision: 'block',
    reason,
  });
  gl.emitDecision('deny', reason);
  process.exitCode = 2;
  return true;
}

function main() {
  const input = gl.parseInput(gl.readStdin());
  if (!input) return;

  // Framework-boundary check (Write/Edit) takes priority.
  if (handleFrameworkBoundary(input)) return;
  // Merge-quality check (Bash).
  handleMergeQuality(input);
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  FORCE_FLAG,
  PROTECTED_PREFIXES,
  PROTECTED_FILES,
  isProtectedPath,
  isMergeCommand,
  hasForce,
  readQualityStatus,
  handleFrameworkBoundary,
  handleMergeQuality,
  main,
};
