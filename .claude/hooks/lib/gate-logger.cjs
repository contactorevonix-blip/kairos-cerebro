#!/usr/bin/env node
'use strict';

/**
 * gate-logger.cjs
 *
 * Shared utility for Constitutional Enforcement Gates (Story 1.16).
 * Provides:
 *   - Metrics tracking in .synapse/metrics/hook-metrics.json
 *     (gatesEnforced, violationsDetected, violationsBlocked, overridesUsed)
 *   - Gate decision logging to .aiox/gate-logs/
 *   - Active-agent resolution (env + command-scoped)
 *
 * Dependency-free (Node core only) so it runs from a freshly installed AIOX
 * package on macOS, Linux, WSL, and Windows. NEVER throws — every helper
 * degrades gracefully so a logging failure can never block development.
 */

const fs = require('fs');
const path = require('path');

const METRICS_RELATIVE = path.join('.synapse', 'metrics', 'hook-metrics.json');
const GATE_LOGS_RELATIVE = path.join('.aiox', 'gate-logs');

const DEVOPS_AGENT_ALIASES = new Set([
  'devops',
  '@devops',
  'github-devops',
  '@github-devops',
  'aiox-devops',
  '@aiox-devops',
  'gage',
  '@gage',
]);

/** Read stdin synchronously (file descriptor 0). Returns '' on failure. */
function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

/** Parse JSON safely. Returns null on failure. */
function parseInput(rawInput) {
  try {
    return JSON.parse(rawInput || '{}');
  } catch {
    return null;
  }
}

/** Collapse line continuations and whitespace in a shell command. */
function normalizeCommand(command) {
  return String(command || '')
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Detect an agent declared inline in the command (e.g. AIOX_ACTIVE_AGENT=devops ...). */
function getCommandScopedAgent(command) {
  const match = String(command || '').match(
    /(?:^|\s)(?:export\s+)?(?:AIOX_ACTIVE_AGENT|AIOX_AGENT|ACTIVE_AGENT|CLAUDE_AGENT_NAME)=["']?(@?[a-z0-9-]+)["']?/i,
  );
  return match ? match[1].toLowerCase() : '';
}

/**
 * Resolve the active agent with a structured 4-path detection chain (Story 12.2).
 *
 * Detection order (first non-empty wins):
 *   1. `env`     — process environment variables
 *                  (AIOX_ACTIVE_AGENT → AIOX_AGENT → ACTIVE_AGENT →
 *                   CLAUDE_AGENT_NAME → CLAUDE_CODE_AGENT → AIOX_CURRENT_AGENT)
 *   2. `inline`  — an agent declared inline in the command itself
 *                  (e.g. `AIOX_ACTIVE_AGENT=devops git push`)
 *   3. `session` — the active agent persisted in hook-metrics.json by
 *                  agent-activation-tracker.cjs
 *   4. `default-DENY` — nothing resolved; the caller must fail safe (Art. II
 *                  blocks non-@devops, so an unknown agent is denied a push/PR).
 *
 * @param {string} command
 * @param {string} [cwd]
 * @returns {{ agent: string, source: 'env'|'inline'|'session'|'default-DENY' }}
 */
function resolveActiveAgent(command, cwd = process.cwd()) {
  // Path 1 — environment variables.
  const envCandidates = [
    process.env.AIOX_ACTIVE_AGENT,
    process.env.AIOX_AGENT,
    process.env.ACTIVE_AGENT,
    process.env.CLAUDE_AGENT_NAME,
    process.env.CLAUDE_CODE_AGENT,
    process.env.AIOX_CURRENT_AGENT,
  ];
  const envAgent = String(envCandidates.find(Boolean) || '').toLowerCase();
  if (envAgent) return { agent: envAgent, source: 'env' };

  // Path 2 — inline command-scoped declaration.
  const inlineAgent = getCommandScopedAgent(command);
  if (inlineAgent) return { agent: inlineAgent, source: 'inline' };

  // Path 3 — persisted session state.
  const sessionAgent = readSessionAgent(cwd);
  if (sessionAgent) return { agent: sessionAgent, source: 'session' };

  // Path 4 — nothing resolved. Fail safe: deny by default.
  return { agent: '', source: 'default-DENY' };
}

/**
 * Resolve the active agent from env vars, the command, or session state.
 *
 * Retro-compatible wrapper (EPIC-9 callers expect a lowercase string). Internally
 * delegates to {@link resolveActiveAgent}; use that directly when the detection
 * source is needed (Story 12.2 detectionSource logging).
 *
 * @param {string} command
 * @param {string} [cwd]
 * @returns {string} lowercase agent id ('' when unresolved)
 */
function getActiveAgent(command, cwd = process.cwd()) {
  return resolveActiveAgent(command, cwd).agent;
}

/** Read the active agent persisted by agent-activation-tracker.cjs. */
function readSessionAgent(cwd = process.cwd()) {
  try {
    const metricsPath = path.join(cwd, METRICS_RELATIVE);
    if (!fs.existsSync(metricsPath)) return '';
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    return String(metrics?.session?.active_agent?.id || '').toLowerCase();
  } catch {
    return '';
  }
}

function isDevOpsAgent(agent) {
  return DEVOPS_AGENT_ALIASES.has(String(agent || '').toLowerCase());
}

/**
 * Update enforcement metrics in hook-metrics.json (idempotent merge).
 * @param {object} delta - any of gatesEnforced/violationsDetected/violationsBlocked/overridesUsed
 * @param {string} [cwd]
 */
function recordMetrics(delta = {}, cwd = process.cwd()) {
  try {
    const metricsPath = path.join(cwd, METRICS_RELATIVE);
    let metrics = {};
    if (fs.existsSync(metricsPath)) {
      try {
        metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      } catch {
        metrics = {};
      }
    }

    const enforcement = {
      gatesEnforced: 0,
      violationsDetected: 0,
      violationsBlocked: 0,
      overridesUsed: 0,
      ...(metrics.enforcement || {}),
    };

    for (const key of Object.keys(delta)) {
      if (typeof enforcement[key] === 'number' && typeof delta[key] === 'number') {
        enforcement[key] += delta[key];
      }
    }

    metrics.enforcement = enforcement;
    metrics.enforcementUpdatedAt = new Date().toISOString();

    const dir = path.dirname(metricsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf8');
    return enforcement;
  } catch {
    // Never block on a metrics failure.
    return null;
  }
}

/**
 * Append a gate decision to .aiox/gate-logs/{article}-{yyyy-mm-dd}.jsonl.
 * Creates the directory on first use (AC6).
 * @param {object} entry - { article, gate, decision, reason, agent, command, override }
 * @param {string} [cwd]
 */
function logGateDecision(entry = {}, cwd = process.cwd()) {
  try {
    const logsDir = path.join(cwd, GATE_LOGS_RELATIVE);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const day = new Date().toISOString().slice(0, 10);
    const article = String(entry.article || 'gate').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const logFile = path.join(logsDir, `${article}-${day}.jsonl`);

    const record = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    fs.appendFileSync(logFile, JSON.stringify(record) + '\n', 'utf8');
    return logFile;
  } catch {
    // Never block on a logging failure.
    return null;
  }
}

/** Emit a PreToolUse permission decision and exit code (2 = block). */
function emitDecision(permissionDecision, permissionDecisionReason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision,
      permissionDecisionReason,
    },
    continue: permissionDecision !== 'deny',
  }));
}

module.exports = {
  METRICS_RELATIVE,
  GATE_LOGS_RELATIVE,
  DEVOPS_AGENT_ALIASES,
  readStdin,
  parseInput,
  normalizeCommand,
  getCommandScopedAgent,
  getActiveAgent,
  resolveActiveAgent,
  readSessionAgent,
  isDevOpsAgent,
  recordMetrics,
  logGateDecision,
  emitDecision,
};
