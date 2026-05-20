// KAIROS — Agent Registry (real, file-backed)
// Reads agent personas from disk and exposes them as a typed registry.

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_AGENT_DIR = path.join(
  process.cwd(),
  '.claude',
  'agents'
);

// Roles authoritatively declared by KAIROS — the 11-agent system.
// `taskForce` groups agents into 3 specialised forces + sovereign overlay.
const ROLE_INDEX = {
  // Sovereign — cross-cutting guardian and escriba
  'orion':  { tier: 'sovereign',  taskForce: 'sovereign-overlay', responsibility: 'repository-guardian-and-escriba' },
  // Infrastructure force — build, ship, secure
  'aria':   { tier: 'design',     taskForce: 'infrastructure',    responsibility: 'system-architecture-and-adrs' },
  'dex':    { tier: 'execution',  taskForce: 'infrastructure',    responsibility: 'implementation-and-tests' },
  'gage':   { tier: 'execution',  taskForce: 'infrastructure',    responsibility: 'deploy-and-ci-cd' },
  'quinn':  { tier: 'gate',       taskForce: 'infrastructure',    responsibility: 'quality-and-audit' },
  'rex':    { tier: 'gate',       taskForce: 'infrastructure',    responsibility: 'security-and-gdpr' },
  // Growth force — design, reach, revenue
  'uma':    { tier: 'design',     taskForce: 'growth',            responsibility: 'design-intelligence-and-ux' },
  'morgan': { tier: 'commercial', taskForce: 'growth',            responsibility: 'seo-copy-and-distribution' },
  'hermes': { tier: 'commercial', taskForce: 'growth',            responsibility: 'sales-and-revenue' },
  // Strategy force — intelligence and economics
  'sage':   { tier: 'discovery',  taskForce: 'strategy',          responsibility: 'business-model-and-unit-economics' },
  'oracle': { tier: 'discovery',  taskForce: 'strategy',          responsibility: 'analytics-and-company-score' },
};

const TASK_FORCES = {
  infrastructure: {
    id: 'infrastructure',
    name: 'Infrastructure Force',
    mandate: 'Architecture, engineering, quality, security, deploy.',
  },
  growth: {
    id: 'growth',
    name: 'Growth Force',
    mandate: 'Design, copy, SEO, distribution, sales, revenue.',
  },
  strategy: {
    id: 'strategy',
    name: 'Strategy Force',
    mandate: 'Business model, unit economics, metrics, MRR tracking.',
  },
  'sovereign-overlay': {
    id: 'sovereign-overlay',
    name: 'Sovereign Overlay',
    mandate: 'Repository guardian, cross-cutting decision authority.',
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
