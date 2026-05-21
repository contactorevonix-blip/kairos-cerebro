'use strict';

/**
 * KAIROS HYPERDRIVE — Knowledge Graph local
 * JSON puro. Zero dependências. SQLite só com consenso se >10MB.
 *
 * Nós: Task | Decision | Artifact | AgentInsight | Milestone
 * Arestas: depends_on | blocks | supersedes | validates | derives_from
 */

const fs   = require('node:fs');
const path = require('node:path');

const KG_PATH = path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'knowledge-graph.json');

const MILESTONES = {
  'rebuild-v1': {
    label: 'Rebuild KairosCheck v1',
    steps: [
      'passo-0-preparacao',
      'passo-1-skills',
      'passo-2-estrategia',
      'passo-3-design-system',
      'passo-4-arquitectura',
      'passo-5-implementacao',
      'passo-6-backend-deploy',
    ],
  },
  'check-engine-v1': {
    label: 'Check-engine v1.0 (fraud signals PT-BR)',
    steps: [
      'ce-fase-1-ptbr-validators',
      'ce-fase-2-email-sources',
      'ce-fase-3-ip-sources',
      'ce-fase-4-rules-engine',
      'ce-fase-5-api-server',
      'ce-fase-6-testes-39',
    ],
  },
  'reorganizacao-sistema': {
    label: 'Reorganização Sistema — CLAUDE.md + router + authority',
    steps: [
      'reorg-claude-md',
      'reorg-agent-authority-v2',
      'reorg-router-13-dominios',
      'reorg-kairos-constitution-v12',
      'reorg-orion-watch-247',
    ],
  },
  'hyperdrive-v1': {
    label: 'KAIROS HYPERDRIVE v1',
    steps: [
      'hd-fase-0-auditoria',
      'hd-fase-1-infra',
      'hd-fase-2-ferramentas',
      'hd-fase-3-orquestrador',
      'hd-fase-4-redteam',
      'hd-fase-5-interface',
      'hd-fase-7-live',
      'hd-fase-8-relatorio',
    ],
  },
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(KG_PATH, 'utf8'));
  } catch {
    return { nodes: {}, edges: [], milestones: {} };
  }
}

function save(kg) {
  fs.mkdirSync(path.dirname(KG_PATH), { recursive: true });
  // Escrita atómica
  const tmp = KG_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(kg, null, 2), 'utf8');
  fs.renameSync(tmp, KG_PATH);
}

function addNode(id, type, data = {}) {
  const kg = load();
  kg.nodes[id] = { id, type, data, createdAt: new Date().toISOString() };
  save(kg);
  return kg.nodes[id];
}

function addEdge(from, to, relation) {
  const kg = load();
  kg.edges.push({ from, to, relation, createdAt: new Date().toISOString() });
  save(kg);
}

function markMilestoneStep(milestoneId, stepId, status = 'done') {
  const kg = load();
  if (!kg.milestones[milestoneId]) kg.milestones[milestoneId] = {};
  kg.milestones[milestoneId][stepId] = { status, doneAt: new Date().toISOString() };
  save(kg);
}

function progressTowards(milestoneId) {
  const kg        = load();
  const milestone = MILESTONES[milestoneId];
  if (!milestone) return { error: `Milestone '${milestoneId}' não encontrado.` };

  const done  = milestone.steps.filter(s => kg.milestones[milestoneId]?.[s]?.status === 'done');
  const total = milestone.steps.length;
  const pct   = Math.round((done.length / total) * 100);

  return {
    milestone: milestone.label,
    total,
    done: done.length,
    percent: pct,
    remaining: milestone.steps.filter(s => !done.includes(s)),
  };
}

function findPath(from, to) {
  const kg    = load();
  const edges = kg.edges;
  const queue = [[from]];
  const seen  = new Set([from]);

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === to) return path;

    for (const edge of edges) {
      if (edge.from === node && !seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push([...path, edge.to]);
      }
    }
  }
  return null;
}

// CLI: node knowledge-graph.js --progress
if (require.main === module && process.argv.includes('--progress')) {
  const rebuildProg  = progressTowards('rebuild-v1');
  const hyperdriveProg = progressTowards('hyperdrive-v1');
  console.log('\n=== MILESTONE PROGRESS ===');
  console.log(`${rebuildProg.milestone}: ${rebuildProg.percent}% (${rebuildProg.done}/${rebuildProg.total})`);
  console.log(`Restante: ${rebuildProg.remaining.join(', ')}`);
  console.log(`\n${hyperdriveProg.milestone}: ${hyperdriveProg.percent}% (${hyperdriveProg.done}/${hyperdriveProg.total})`);
  console.log(`Restante: ${hyperdriveProg.remaining.join(', ')}`);
}

module.exports = { addNode, addEdge, markMilestoneStep, progressTowards, findPath };
