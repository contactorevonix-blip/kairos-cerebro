#!/usr/bin/env node
'use strict';

/**
 * enforce-agent-authority.cjs — Constitution Article II (Agent Authority)
 * Story 1.16 AC1.
 *
 * PreToolUse hook. Blocks remote Git/GitHub publication commands (git push,
 * gh pr create, gh pr merge) unless the active agent is @devops.
 *
 * Override: `--skip-devops-check` present in the command allows a non-@devops
 * push (rare, audit-logged as an override per the override policy in
 * .claude/rules/enforcement-gates.md).
 *
 * Adapted from enforce-git-push-authority.cjs (prior story) to add the
 * override flag, metrics tracking, and gate-decision logging (AC1 + AC5 + AC6).
 */

const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-ii-agent-authority';

const REMOTE_OPERATION_PATTERNS = [
  { pattern: /\bgit\s+push\b/i, operation: 'git push' },
  { pattern: /\bgh\s+pr\s+create\b/i, operation: 'gh pr create' },
  { pattern: /\bgh\s+pr\s+merge\b/i, operation: 'gh pr merge' },
  { pattern: /\bgit\s+push\s+--force\b/i, operation: 'git push --force' },
];

const OVERRIDE_FLAG = '--skip-devops-check';

function findRemoteOperation(command) {
  const normalized = gl.normalizeCommand(command);
  // Match the most specific pattern first (force push before plain push).
  return (
    REMOTE_OPERATION_PATTERNS.slice().reverse().find(({ pattern }) => pattern.test(normalized)) ||
    null
  );
}

function hasOverride(command) {
  return gl.normalizeCommand(command).includes(OVERRIDE_FLAG);
}

function main() {
  const input = gl.parseInput(gl.readStdin());

  if (!input) {
    gl.emitDecision(
      'deny',
      'Hook failed to parse PreToolUse input. Blocking remote Git operation for safety (Art. II); retry via @devops.',
    );
    process.exitCode = 2;
    return;
  }

  const command = input?.tool_input?.command || '';
  const operation = findRemoteOperation(command);

  // Not a remote operation — nothing to enforce.
  if (!operation) return;

  gl.recordMetrics({ gatesEnforced: 1 });

  const activeAgent = gl.getActiveAgent(command);

  // @devops is always allowed.
  if (gl.isDevOpsAgent(activeAgent)) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'agent-authority',
      decision: 'allow',
      reason: `Active agent is @devops (${activeAgent}).`,
      agent: activeAgent,
      operation: operation.operation,
    });
    return;
  }

  gl.recordMetrics({ violationsDetected: 1 });

  // Explicit override — allow but audit-log it.
  if (hasOverride(command)) {
    gl.recordMetrics({ overridesUsed: 1 });
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'agent-authority',
      decision: 'override',
      reason: `Override flag ${OVERRIDE_FLAG} used by non-@devops agent.`,
      agent: activeAgent || '@unknown',
      operation: operation.operation,
      override: OVERRIDE_FLAG,
    });
    process.stderr.write(
      `⚠️  Art. II override: ${operation.operation} allowed for ${activeAgent || '@unknown'} via ${OVERRIDE_FLAG} (audit-logged).\n`,
    );
    return;
  }

  // Block.
  gl.recordMetrics({ violationsBlocked: 1 });
  const reason = `${operation.operation} is exclusive to @devops (Constitution Article II). Current agent: ${activeAgent || '@unknown'}. Delegate to @devops, or pass ${OVERRIDE_FLAG} to override (audit-logged).`;
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'agent-authority',
    decision: 'block',
    reason,
    agent: activeAgent || '@unknown',
    operation: operation.operation,
  });
  gl.emitDecision('deny', reason);
  process.exitCode = 2;
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  REMOTE_OPERATION_PATTERNS,
  OVERRIDE_FLAG,
  findRemoteOperation,
  hasOverride,
  main,
};
