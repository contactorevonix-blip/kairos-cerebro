/**
 * test-agent-authority-detection.test.js — Story 12.2
 * Validate @devops-Exclusive git push/PR Authority (FR-2.1–2.4, Constitution Art. II)
 *
 * Focuses on the structured 4-path active-agent detection chain introduced in
 * Story 12.2 (gate-logger.resolveActiveAgent) and its consumption by the Art. II
 * gate (enforce-agent-authority.cjs).
 *
 * Acceptance Criteria coverage:
 *   AC1 — 4 detection paths: env vars, inline scope, session state, fallback
 *   AC2 — Non-@devops push/PR attempts blocked
 *   AC3 — Detection order: AIOX_ACTIVE_AGENT → AIOX_AGENT → session → default-DENY
 *   AC4 — Override scenario (--skip-devops-check)
 *   AC5 — Metrics updated in .synapse/metrics/hook-metrics.json
 */

const test = require('node:test');
const { after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const gl = require(path.join(process.cwd(), '.claude', 'hooks', 'lib', 'gate-logger.cjs'));
const gate = require(path.join(process.cwd(), '.claude', 'hooks', 'enforce-agent-authority.cjs'));

// All env vars the detection chain reads, so we can fully isolate each test.
const AGENT_ENV_VARS = [
  'AIOX_ACTIVE_AGENT',
  'AIOX_AGENT',
  'ACTIVE_AGENT',
  'CLAUDE_AGENT_NAME',
  'CLAUDE_CODE_AGENT',
  'AIOX_CURRENT_AGENT',
];

function clearAgentEnv() {
  for (const key of AGENT_ENV_VARS) delete process.env[key];
}

// Track every temp dir we create so we can remove them after the run, win or fail.
const tempDirs = [];

/** Build a throwaway cwd with a hook-metrics.json carrying a session agent. */
function makeSessionCwd(sessionAgentId) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-auth-'));
  tempDirs.push(dir);
  const metricsPath = path.join(dir, '.synapse', 'metrics', 'hook-metrics.json');
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true });
  if (sessionAgentId !== undefined) {
    fs.writeFileSync(
      metricsPath,
      JSON.stringify({ session: { active_agent: { id: sessionAgentId } } }, null, 2),
      'utf8',
    );
  }
  return dir;
}

after(() => {
  for (const dir of tempDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup — never fail the suite on teardown
    }
  }
});

// ---------------------------------------------------------------------------
// AC1 — 4 detection paths
// ---------------------------------------------------------------------------
test('AC1 — resolveActiveAgent: Path 1 (env) resolves agent with source=env', () => {
  clearAgentEnv();
  try {
    process.env.AIOX_ACTIVE_AGENT = 'devops';
    const result = gl.resolveActiveAgent('git push origin main');
    assert.strictEqual(result.agent, 'devops');
    assert.strictEqual(result.source, 'env');
  } finally {
    clearAgentEnv();
  }
});

test('AC1 — resolveActiveAgent: Path 2 (inline) resolves command-scoped agent', () => {
  clearAgentEnv();
  const result = gl.resolveActiveAgent('AIOX_ACTIVE_AGENT=devops git push origin main', makeSessionCwd());
  assert.strictEqual(result.agent, 'devops');
  assert.strictEqual(result.source, 'inline');
});

test('AC1 — resolveActiveAgent: Path 3 (session) reads persisted active agent', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd('@dev');
  const result = gl.resolveActiveAgent('git push origin main', cwd);
  assert.strictEqual(result.agent, '@dev');
  assert.strictEqual(result.source, 'session');
});

test('AC1 — resolveActiveAgent: Path 4 (default-DENY) when nothing resolves', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd(); // metrics dir exists but no session agent
  const result = gl.resolveActiveAgent('git push origin main', cwd);
  assert.strictEqual(result.agent, '');
  assert.strictEqual(result.source, 'default-DENY');
});

test('AC1 — resolveActiveAgent: always returns a structured { agent, source }', () => {
  clearAgentEnv();
  const result = gl.resolveActiveAgent('git push', makeSessionCwd());
  assert.ok(Object.prototype.hasOwnProperty.call(result, 'agent'), 'has agent');
  assert.ok(Object.prototype.hasOwnProperty.call(result, 'source'), 'has source');
  assert.strictEqual(typeof result.agent, 'string', 'agent must be a string (never null/undefined)');
  assert.strictEqual(typeof result.source, 'string', 'source must be a string');
  assert.ok(
    ['env', 'inline', 'session', 'default-DENY'].includes(result.source),
    `source must be a known path, got ${result.source}`,
  );
});

// ---------------------------------------------------------------------------
// AC3 — Detection precedence order
// ---------------------------------------------------------------------------
test('AC3 — env wins over inline and session', () => {
  clearAgentEnv();
  try {
    process.env.AIOX_ACTIVE_AGENT = 'devops';
    const cwd = makeSessionCwd('@dev');
    const result = gl.resolveActiveAgent('AIOX_ACTIVE_AGENT=dev git push', cwd);
    assert.strictEqual(result.agent, 'devops');
    assert.strictEqual(result.source, 'env');
  } finally {
    clearAgentEnv();
  }
});

test('AC3 — AIOX_ACTIVE_AGENT wins over AIOX_AGENT within env path', () => {
  clearAgentEnv();
  try {
    process.env.AIOX_ACTIVE_AGENT = 'devops';
    process.env.AIOX_AGENT = 'dev';
    const result = gl.resolveActiveAgent('git push');
    assert.strictEqual(result.agent, 'devops');
    assert.strictEqual(result.source, 'env');
  } finally {
    clearAgentEnv();
  }
});

test('AC3 — inline wins over session when env is empty', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd('@dev');
  const result = gl.resolveActiveAgent('AIOX_ACTIVE_AGENT=devops git push', cwd);
  assert.strictEqual(result.agent, 'devops');
  assert.strictEqual(result.source, 'inline');
});

test('AC3 — session is used only when env and inline are empty', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd('@architect');
  const result = gl.resolveActiveAgent('git push origin main', cwd);
  assert.strictEqual(result.agent, '@architect');
  assert.strictEqual(result.source, 'session');
});

// ---------------------------------------------------------------------------
// Retro-compatibility — EPIC-9 callers expect a lowercase string
// ---------------------------------------------------------------------------
test('Retro-compat — getActiveAgent still returns a lowercase string', () => {
  clearAgentEnv();
  try {
    process.env.AIOX_ACTIVE_AGENT = 'DevOps';
    const agent = gl.getActiveAgent('git push');
    assert.strictEqual(typeof agent, 'string');
    assert.strictEqual(agent, 'devops');
  } finally {
    clearAgentEnv();
  }
});

test('Retro-compat — getActiveAgent returns empty string when unresolved', () => {
  clearAgentEnv();
  const agent = gl.getActiveAgent('git push', makeSessionCwd());
  assert.strictEqual(agent, '');
});

// ---------------------------------------------------------------------------
// AC2 — Non-@devops push/PR attempts blocked
// ---------------------------------------------------------------------------
test('AC2 — isDevOpsAgent recognises @devops aliases, rejects others', () => {
  assert.ok(gl.isDevOpsAgent('devops'), 'devops is allowed');
  assert.ok(gl.isDevOpsAgent('@devops'), '@devops is allowed');
  assert.ok(gl.isDevOpsAgent('gage'), 'gage (persona) is allowed');
  assert.strictEqual(gl.isDevOpsAgent('@dev'), false, '@dev is not devops');
  assert.strictEqual(gl.isDevOpsAgent(''), false, 'unknown agent is not devops');
});

test('AC2 — non-@devops resolution + remote op = candidate for block', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd('@dev');
  const { agent } = gl.resolveActiveAgent('git push origin main', cwd);
  const op = gate.findRemoteOperation('git push origin main');
  assert.ok(op, 'git push is a remote operation');
  assert.strictEqual(gl.isDevOpsAgent(agent), false, 'non-@devops agent must be blocked');
});

test('AC2 — default-DENY fallback is treated as non-@devops (fail safe)', () => {
  clearAgentEnv();
  const { agent, source } = gl.resolveActiveAgent('gh pr create --title x', makeSessionCwd());
  assert.strictEqual(source, 'default-DENY');
  assert.strictEqual(gl.isDevOpsAgent(agent), false, 'unresolved agent must not pass as @devops');
});

// ---------------------------------------------------------------------------
// AC4 — Override scenario (--skip-devops-check)
// ---------------------------------------------------------------------------
test('AC4 — override flag detected on a push command', () => {
  assert.ok(gate.hasOverride('git push origin main --skip-devops-check'));
});

test('AC4 — override flag absent on a plain push command', () => {
  assert.strictEqual(gate.hasOverride('git push origin main'), false);
});

test('AC4 — override applies even when agent is non-@devops (audit path)', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd('@dev');
  const { agent } = gl.resolveActiveAgent('git push --skip-devops-check', cwd);
  assert.strictEqual(gl.isDevOpsAgent(agent), false, 'agent is non-@devops');
  assert.ok(gate.hasOverride('git push --skip-devops-check'), 'override allows the push to proceed');
});

// ---------------------------------------------------------------------------
// AC5 — Metrics updated in hook-metrics.json
// ---------------------------------------------------------------------------
test('AC5 — recordMetrics increments enforcement counters idempotently', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd();
  gl.recordMetrics({ gatesEnforced: 1, violationsDetected: 1, violationsBlocked: 1 }, cwd);
  const after = gl.recordMetrics({ overridesUsed: 1 }, cwd);
  assert.strictEqual(after.gatesEnforced, 1);
  assert.strictEqual(after.violationsDetected, 1);
  assert.strictEqual(after.violationsBlocked, 1);
  assert.strictEqual(after.overridesUsed, 1);

  const metricsPath = path.join(cwd, '.synapse', 'metrics', 'hook-metrics.json');
  const persisted = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  assert.strictEqual(persisted.enforcement.violationsBlocked, 1, 'metrics persisted to disk');
  assert.ok(persisted.enforcementUpdatedAt, 'enforcementUpdatedAt timestamp written');
});

test('AC5 — logGateDecision persists detectionSource in the JSONL record', () => {
  clearAgentEnv();
  const cwd = makeSessionCwd();
  gl.logGateDecision(
    {
      article: gate.ARTICLE,
      gate: 'agent-authority',
      decision: 'block',
      reason: 'test',
      agent: '@dev',
      operation: 'git push',
      detectionSource: 'session',
    },
    cwd,
  );
  const day = new Date().toISOString().slice(0, 10);
  const logFile = path.join(cwd, '.aiox', 'gate-logs', `${gate.ARTICLE}-${day}.jsonl`);
  const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
  const record = JSON.parse(lines[lines.length - 1]);
  assert.strictEqual(record.detectionSource, 'session', 'detectionSource logged (additive field)');
  assert.strictEqual(record.decision, 'block');
  assert.ok(record.timestamp, 'timestamp present (existing parsers unaffected)');
});
