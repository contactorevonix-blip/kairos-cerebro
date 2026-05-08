// KAIROS — Agent Registry (real, file-backed)
// Reads agent personas from disk and exposes them as a typed registry.

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_AGENT_DIR = path.join(
  process.cwd(),
  '.aiox-core',
  'development',
  'agents'
);

// Roles authoritatively declared by KAIROS. Anything not here is treated as
// auxiliary persona without orchestration power.
//
// `taskForce` groups the 18 agents into 3 specialised forces for blitzscaling.
// Sovereign agents are above task forces (cross-cutting decision power).
const ROLE_INDEX = {
  'apex_ceo': { tier: 'sovereign', taskForce: 'sovereign-overlay', responsibility: 'final-binary-decision' },
  'aiox-master': { tier: 'sovereign', taskForce: 'sovereign-overlay', responsibility: 'framework-orchestration' },
  'analyst': { tier: 'discovery', taskForce: 'sovereign-overlay', responsibility: 'requirements-and-research' },
  'pm': { tier: 'discovery', taskForce: 'growth', responsibility: 'product-management' },
  'po': { tier: 'discovery', taskForce: 'b2b-security', responsibility: 'backlog-and-acceptance-criteria' },
  'sm': { tier: 'discovery', taskForce: 'b2b-security', responsibility: 'story-creation' },
  'architect': { tier: 'design', taskForce: 'infrastructure', responsibility: 'system-architecture' },
  'ux-design-expert': { tier: 'design', taskForce: 'growth', responsibility: 'ux-and-design-system' },
  'data-engineer': { tier: 'design', taskForce: 'infrastructure', responsibility: 'data-and-database' },
  'dev': { tier: 'execution', taskForce: 'infrastructure', responsibility: 'implementation' },
  'devops': { tier: 'execution', taskForce: 'infrastructure', responsibility: 'ci-cd-and-release' },
  'qa': { tier: 'gate', taskForce: 'b2b-security', responsibility: 'quality-and-test-architecture' },
  'squad-creator': { tier: 'meta', taskForce: 'sovereign-overlay', responsibility: 'agent-creation' },
  'agent_ghost': { tier: 'commercial', taskForce: 'growth', responsibility: 'faceless-distribution' },
  'agent_psycho': { tier: 'commercial', taskForce: 'growth', responsibility: 'ethical-neuromarketing' },
  'agent_copywriter': { tier: 'commercial', taskForce: 'growth', responsibility: 'multilingual-copy' },
  'agent_sales': { tier: 'commercial', taskForce: 'b2b-security', responsibility: 'pricing-and-stripe' },
  'agent_growth': { tier: 'commercial', taskForce: 'b2b-security', responsibility: 'b2b2c-distribution' },
};

const TASK_FORCES = {
  infrastructure: {
    id: 'infrastructure',
    name: 'Infrastructure Force',
    mandate: 'Global scalability, Redis, multi-region, performance, data integrity.',
  },
  growth: {
    id: 'growth',
    name: 'Growth Force',
    mandate: 'Browser extension, B2C distribution, conversion, copy, UX, faceless reach.',
  },
  'b2b-security': {
    id: 'b2b-security',
    name: 'B2B & Security Force',
    mandate: 'Banks, institutional pilots, signed feeds, quality, compliance, contracts.',
  },
  'sovereign-overlay': {
    id: 'sovereign-overlay',
    name: 'Sovereign Overlay',
    mandate: 'Cross-cutting decision authority and meta-orchestration.',
  },
};

function readAgentFile(file, dir) {
  const id = path.basename(file, '.md');
  const fullPath = path.join(dir, file);
  let content = '';
  try { content = fs.readFileSync(fullPath, 'utf8'); } catch { content = ''; }
  const titleMatch = content.match(/^#\s+(.+?)\s*$/m);
  const missionMatch = content.match(/^##\s+Mission\s*\n+([\s\S]*?)(\n##\s|$)/i);
  const role = ROLE_INDEX[id] || { tier: 'auxiliary', taskForce: 'unassigned', responsibility: 'unspecified' };
  return {
    id,
    title: titleMatch ? titleMatch[1].trim() : id,
    mission: missionMatch ? missionMatch[1].trim().split('\n')[0] : '',
    tier: role.tier,
    taskForce: role.taskForce,
    responsibility: role.responsibility,
    path: path.relative(process.cwd(), fullPath),
  };
}

function listAgents(dir = DEFAULT_AGENT_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readAgentFile(f, dir))
    .sort((a, b) => a.tier.localeCompare(b.tier) || a.id.localeCompare(b.id));
}

function getAgent(id, dir = DEFAULT_AGENT_DIR) {
  const all = listAgents(dir);
  return all.find((a) => a.id === id) || null;
}

function listByTier(tier, dir = DEFAULT_AGENT_DIR) {
  return listAgents(dir).filter((a) => a.tier === tier);
}

function listByTaskForce(forceId, dir = DEFAULT_AGENT_DIR) {
  return listAgents(dir).filter((a) => a.taskForce === forceId);
}

function listTaskForces(dir = DEFAULT_AGENT_DIR) {
  const all = listAgents(dir);
  return Object.values(TASK_FORCES).map((f) => ({
    ...f,
    agents: all.filter((a) => a.taskForce === f.id).map((a) => ({ id: a.id, title: a.title, tier: a.tier, responsibility: a.responsibility })),
  }));
}

module.exports = {
  DEFAULT_AGENT_DIR,
  ROLE_INDEX,
  TASK_FORCES,
  listAgents,
  getAgent,
  listByTier,
  listByTaskForce,
  listTaskForces,
};
