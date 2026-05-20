// KAIROS — The Sovereign (apex_ceo runtime)
// A real, deterministic, file-backed orchestrator that converts any task
// description into a binary SIM/NÃO decision plus a per-tier handoff plan,
// records the decision in an append-only audit trail, and returns the result
// in a format consumable by humans, CI pipelines or downstream agents.
//
// This is NOT an LLM agent. It is a workflow engine. It exists so that no
// change reaches production without the gates fired.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const registry = require('./agents-registry');
const policy = require('./policy');

const DEFAULT_DECISIONS_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');
const DECISIONS_FILE = 'sovereign-decisions.jsonl';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendDecision(record, dir = DEFAULT_DECISIONS_DIR) {
  ensureDir(dir);
  const file = path.join(dir, DECISIONS_FILE);
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function buildHandoffPlan(agentDir) {
  const tiersInOrder = [
    'discovery',
    'design',
    'execution',
    'gate',
    'sovereign',
  ];
  const plan = [];
  for (const tier of tiersInOrder) {
    const tierAgents = registry.listByTier(tier, agentDir);
    if (tierAgents.length === 0) continue;
    plan.push({
      tier,
      agents: tierAgents.map((a) => ({
        id: a.id,
        responsibility: a.responsibility,
      })),
    });
  }
  return plan;
}

function hashTask(taskText) {
  return crypto.createHash('sha256').update(taskText).digest('hex').substring(0, 16);
}

function decide({ task, brief = '', agentDir, decisionsDir } = {}) {
  if (!task || !String(task).trim()) {
    throw new Error('Sovereign requires a non-empty "task" description.');
  }
  const taskText = `${task}\n${brief}`.trim();
  const taskId = hashTask(taskText);

  const legalityViolations = policy.evaluateLegality(taskText);
  const productionCheck = policy.evaluateProductionReadiness(taskText);
  const handoff = buildHandoffPlan(agentDir);

  const sovereign = registry.getAgent('orion', agentDir);
  if (!sovereign) {
    // Fail-safe: if the orion persona file is missing, NO decision is
    // possible. The Sovereign refuses to act blind.
    const refusal = {
      taskId,
      timestamp: new Date().toISOString(),
      decision: 'NAO',
      rationale: 'orion persona missing; sovereign cannot rule.',
      handoff,
      legalityViolations: ['SOVEREIGN_PERSONA_MISSING'],
      productionReady: false,
    };
    appendDecision(refusal, decisionsDir);
    return refusal;
  }

  let decision = 'SIM';
  const rationaleParts = [];

  if (legalityViolations.length > 0) {
    decision = 'NAO';
    rationaleParts.push(`hard-policy-violation:${legalityViolations.length}`);
  }
  if (!productionCheck.passed) {
    // We do not auto-reject for missing production-readiness keywords; we
    // mark it for revision but allow proceeding through the handoff.
    rationaleParts.push(`production-readiness:incomplete(${productionCheck.matchedBands.length}/${productionCheck.requiredBands})`);
  } else {
    rationaleParts.push('production-readiness:ok');
  }

  const decisionRecord = {
    taskId,
    timestamp: new Date().toISOString(),
    task,
    briefPreview: String(brief).substring(0, 200),
    decision,
    rationale: rationaleParts.join('; '),
    sovereignAgent: { id: sovereign.id, title: sovereign.title },
    handoff,
    legalityViolations,
    productionReady: productionCheck.passed,
    productionCheck,
  };

  appendDecision(decisionRecord, decisionsDir);
  return decisionRecord;
}

function listDecisions(limit = 50, decisionsDir = DEFAULT_DECISIONS_DIR) {
  const file = path.join(decisionsDir, DECISIONS_FILE);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw) return [];
  const lines = raw.split('\n').filter(Boolean);
  return lines
    .slice(-limit)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

module.exports = {
  decide,
  listDecisions,
  listAgents: registry.listAgents,
  getAgent: registry.getAgent,
  listByTier: registry.listByTier,
  listByTaskForce: registry.listByTaskForce,
  listTaskForces: registry.listTaskForces,
  TASK_FORCES: registry.TASK_FORCES,
  buildHandoffPlan,
  policy,
};
