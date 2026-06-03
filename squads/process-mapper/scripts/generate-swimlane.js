#!/usr/bin/env node
'use strict';

/**
 * generate-swimlane.js — agent-cartographer (Tier 1)
 * Gera HTML de swim-lanes para agentes AIOX (Rummler-Brache pattern).
 * Story PM-2.1 — spec FEAT-04
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '../../..');
const AGENTS_DIR = path.join(ROOT, 'docs', 'process-maps', 'agents');
const FIGMA_DIR  = path.join(ROOT, 'docs', 'process-maps', 'figma', 'agents');

// ─── Data — 12 agentes AIOX (fonte: agent-authority.md) ──────────────────────

const AGENTS = [
  {
    id: 'aiox-master', name: '@aiox-master', persona: 'Orion',
    color: '#6366F1', tier: 'orchestrator',
    exclusive: ['Framework governance', 'Constitutional enforcement', 'Cross-agent orchestration'],
    blocked:   ['git push → @devops', 'gh pr create → @devops', 'MCP manage → @devops'],
    delegates: ['Story creation → @sm', 'Epic/PRD → @pm', 'Implementation → @dev', 'QA → @qa'],
  },
  {
    id: 'pm', name: '@pm', persona: 'Morgan',
    color: '#7C3AED', tier: 1,
    exclusive: ['*create-epic', '*execute-epic', 'EPIC-{ID}-EXECUTION.yaml', 'Requirements gathering', 'Spec writing'],
    blocked:   ['git push → @devops', 'Story validation → @po'],
    delegates: ['Story creation → @sm', 'Complexity → @architect'],
  },
  {
    id: 'po', name: '@po', persona: 'Pax',
    color: '#8B5CF6', tier: 1,
    exclusive: ['*validate-story-draft (10-point checklist)', 'Story context tracking', 'Backlog prioritization'],
    blocked:   ['git push → @devops', 'Story creation → @sm'],
    delegates: ['Implementation → @dev'],
  },
  {
    id: 'sm', name: '@sm', persona: 'River',
    color: '#A78BFA', tier: 1,
    exclusive: ['*draft / *create-story', 'Story template selection'],
    blocked:   ['git push → @devops', 'Story validation → @po', 'AC/scope changes → @po'],
    delegates: ['Validation → @po'],
  },
  {
    id: 'dev', name: '@dev', persona: 'Dex',
    color: '#0EA5E9', tier: 1,
    exclusive: ['Implementação de código', 'git add/commit/branch (local)', 'Story checkboxes + File List'],
    blocked:   ['git push → @devops', 'gh pr → @devops', 'AC/scope/title edits → @po'],
    delegates: ['Push/PR → @devops', 'QA → @qa'],
  },
  {
    id: 'qa', name: '@qa', persona: 'Quinn',
    color: '#10B981', tier: 1,
    exclusive: ['*qa-gate (7 checks)', 'QA Loop (max 5x)', 'Gate verdicts: PASS/FAIL/CONCERNS/WAIVED'],
    blocked:   ['git push → @devops', 'Story implementation → @dev'],
    delegates: ['Push após PASS → @devops', 'Fixes → @dev'],
  },
  {
    id: 'devops', name: '@devops', persona: 'Gage',
    color: '#F59E0B', tier: 1,
    exclusive: ['git push / git push --force', 'gh pr create / gh pr merge', 'MCP add/remove/configure', 'CI/CD pipeline', 'Releases e tags'],
    blocked:   [],
    delegates: [],
  },
  {
    id: 'architect', name: '@architect', persona: 'Aria',
    color: '#EC4899', tier: 1,
    exclusive: ['System architecture decisions', 'Technology selection', 'Complexity assessment'],
    blocked:   ['git push → @devops', 'DDL/queries → @data-engineer'],
    delegates: ['Schema design → @data-engineer', 'Query optimization → @data-engineer'],
  },
  {
    id: 'data-engineer', name: '@data-engineer', persona: 'Dara',
    color: '#F97316', tier: 1,
    exclusive: ['Schema design (DDL)', 'Query optimization', 'RLS policies', 'Migration planning'],
    blocked:   ['git push → @devops', 'App code → @dev', 'System architecture → @architect'],
    delegates: ['Push → @devops'],
  },
  {
    id: 'analyst', name: '@analyst', persona: 'Alex',
    color: '#14B8A6', tier: 1,
    exclusive: ['Research e análise', 'Competitive intelligence', 'Spec research (F3 Spec Pipeline)'],
    blocked:   ['git push → @devops'],
    delegates: ['Findings → @pm/@architect'],
  },
  {
    id: 'ux-design-expert', name: '@ux', persona: 'Uma',
    color: '#E879F9', tier: 1,
    exclusive: ['UX/UI design', 'Frontend architecture', 'Design system', 'Frontend spec'],
    blocked:   ['git push → @devops'],
    delegates: ['Implementation → @dev'],
  },
  {
    id: 'squad-creator', name: '@squad-creator', persona: 'Squad Chief',
    color: '#64748B', tier: 'meta',
    exclusive: ['*create-squad', '*validate-squad', '*clone-mind (via oalanicolas)', 'squad-registry management'],
    blocked:   ['git push → @devops'],
    delegates: ['Mind cloning → oalanicolas', 'Process validation → pedro-valerio', 'Push → @devops'],
  },
];

// ─── HTML generators ─────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function agentCard(agent) {
  const excl = agent.exclusive.map(e =>
    `<div class="op op-exclusive" title="EXCLUSIVO"><span class="op-icon">🔒</span>${esc(e)}</div>`
  ).join('');
  const blkd = agent.blocked.map(b =>
    `<div class="op op-blocked"><span class="op-icon">⛔</span>${esc(b)}</div>`
  ).join('');
  const dlg  = agent.delegates.map(d =>
    `<div class="op op-delegate"><span class="op-icon">➡️</span>${esc(d)}</div>`
  ).join('');

  return `
<div class="agent-col" id="agent-${esc(agent.id)}">
  <div class="agent-header" style="background:${agent.color}">
    <div class="agent-name">${esc(agent.name)}</div>
    <div class="agent-persona">${esc(agent.persona)}</div>
    <div class="agent-tier">Tier ${agent.tier}</div>
  </div>
  <div class="agent-body">
    ${excl ? `<div class="op-section"><div class="op-label">EXCLUSIVO</div>${excl}</div>` : ''}
    ${blkd ? `<div class="op-section"><div class="op-label">DELEGA</div>${blkd}</div>` : ''}
    ${dlg  ? `<div class="op-section"><div class="op-label">HANDOFF</div>${dlg}</div>` : ''}
  </div>
</div>`;
}

function generateAuthorityMap() {
  const cards = AGENTS.map(agentCard).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AIOX Agent Authority Map</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:24px 16px;min-height:100vh}
h1{text-align:center;font-size:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A78BFA;margin-bottom:4px}
.subtitle{text-align:center;font-size:12px;color:#6B7280;margin-bottom:24px}
.swimlane-grid{display:flex;gap:8px;overflow-x:auto;padding-bottom:16px;min-height:600px}
.agent-col{min-width:160px;max-width:200px;flex:1;border-radius:8px;border:1px solid rgba(255,255,255,.08);overflow:hidden;display:flex;flex-direction:column}
.agent-header{padding:10px 8px;text-align:center}
.agent-name{font-size:11px;font-weight:800;color:#fff;letter-spacing:.04em}
.agent-persona{font-size:10px;color:rgba(255,255,255,.7);margin-top:2px}
.agent-tier{font-size:9px;color:rgba(255,255,255,.5);margin-top:2px;text-transform:uppercase;letter-spacing:.08em}
.agent-body{flex:1;padding:8px;background:#0F1117;display:flex;flex-direction:column;gap:8px}
.op-section{display:flex;flex-direction:column;gap:3px}
.op-label{font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#4B5563;margin-bottom:2px;padding-top:2px;border-top:1px solid rgba(255,255,255,.05)}
.op{font-size:10px;padding:4px 6px;border-radius:4px;display:flex;align-items:flex-start;gap:4px;line-height:1.3}
.op-icon{flex-shrink:0;font-size:9px;margin-top:1px}
.op-exclusive{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#FCA5A5}
.op-blocked{background:rgba(107,114,128,.08);border:1px solid rgba(107,114,128,.15);color:#9CA3AF}
.op-delegate{background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);color:#A5B4FC}
.legend{display:flex;gap:16px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#9CA3AF}
.legend-dot{width:10px;height:10px;border-radius:2px}
</style>
</head>
<body>
<h1>AIOX Agent Authority Map</h1>
<p class="subtitle">12 agentes · Swim-lanes · fonte: agent-authority.md · Rummler-Brache pattern</p>
<div class="swimlane-grid">${cards}</div>
<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background:rgba(239,68,68,.4)"></div>🔒 Exclusivo (só este agente)</div>
  <div class="legend-item"><div class="legend-dot" style="background:rgba(107,114,128,.3)"></div>⛔ Delega para agente correcto</div>
  <div class="legend-item"><div class="legend-dot" style="background:rgba(99,102,241,.3)"></div>➡️ Handoff / Output</div>
</div>
</body>
</html>`;
}

// ─── Handoff flows ────────────────────────────────────────────────────────────

const FLOWS = [
  {
    id: 'git-push',
    title: 'Git Push Flow',
    steps: ['ANY agent', '→ @devops *push', '→ remote / PR'],
    color: '#F59E0B',
  },
  {
    id: 'story-flow',
    title: 'Story Flow (SDC)',
    steps: ['@sm *draft', '→ @po *validate', '→ @dev *develop', '→ @qa *gate', '→ @devops *push'],
    color: '#0EA5E9',
  },
  {
    id: 'epic-flow',
    title: 'Epic Flow',
    steps: ['@pm *create-epic', '→ @pm *execute-epic', '→ @sm *draft (por story)'],
    color: '#7C3AED',
  },
  {
    id: 'schema-flow',
    title: 'Schema Design Flow',
    steps: ['@architect (decide tech)', '→ @data-engineer (DDL + RLS)', '→ @dev (app code)', '→ @devops *push'],
    color: '#EC4899',
  },
];

function generateHandoffFlows() {
  const flows = FLOWS.map(f => {
    const steps = f.steps.map((s, i) => `
      <div class="step-item">
        <div class="step-box" style="border-color:${f.color};background:${f.color}18">${esc(s)}</div>
        ${i < f.steps.length - 1 ? `<div class="step-arrow" style="color:${f.color}">→</div>` : ''}
      </div>`).join('');
    return `
<div class="flow-block">
  <div class="flow-title" style="color:${f.color}">${esc(f.title)}</div>
  <div class="flow-steps">${steps}</div>
</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AIOX Handoff Flows</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:40px 24px}
h1{text-align:center;font-size:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A78BFA;margin-bottom:4px}
.subtitle{text-align:center;font-size:12px;color:#6B7280;margin-bottom:32px}
.flows{display:flex;flex-direction:column;gap:24px;max-width:800px;margin:0 auto}
.flow-block{border-radius:10px;border:1px solid rgba(255,255,255,.07);padding:16px 20px;background:#0F1117}
.flow-title{font-size:14px;font-weight:800;margin-bottom:12px;letter-spacing:.03em}
.flow-steps{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.step-item{display:flex;align-items:center;gap:6px}
.step-box{padding:6px 12px;border-radius:6px;border:1px solid;font-size:12px;font-weight:600;color:#E8EAF0}
.step-arrow{font-size:16px;font-weight:700;opacity:.7}
</style>
</head>
<body>
<h1>AIOX Handoff Flows</h1>
<p class="subtitle">4 flows canónicos · fonte: agent-authority.md</p>
<div class="flows">${flows}</div>
</body>
</html>`;
}

// ─── SVG generator ────────────────────────────────────────────────────────────

function generateAuthoritySVG() {
  const W = 1400, COL_W = 110, H = 500, START_X = 10;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="#0D0F14"/>`;
  svg += `<text x="${W/2}" y="22" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#A78BFA">AIOX Agent Authority Map — 12 Agentes</text>`;

  AGENTS.forEach((agent, i) => {
    const x = START_X + i * (COL_W + 5);
    svg += `<rect id="${agent.id}" x="${x}" y="32" width="${COL_W}" height="32" rx="4" fill="${agent.color}"/>`;
    svg += `<text x="${x + COL_W/2}" y="51" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="700" fill="#fff">${esc(agent.name)}</text>`;

    let y = 72;
    for (const e of agent.exclusive.slice(0, 3)) {
      svg += `<rect x="${x}" y="${y}" width="${COL_W}" height="18" rx="2" fill="${agent.color}22" stroke="${agent.color}55" stroke-width="0.5"/>`;
      const txt = e.length > 14 ? e.slice(0, 13) + '…' : e;
      svg += `<text x="${x+4}" y="${y+12}" font-family="Inter,sans-serif" font-size="7" fill="#FCA5A5">🔒 ${esc(txt)}</text>`;
      y += 22;
    }
  });

  svg += '</svg>';
  return svg;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  [AGENTS_DIR, FIGMA_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  const authorityPath = path.join(AGENTS_DIR, 'authority-map.html');
  fs.writeFileSync(authorityPath, generateAuthorityMap(), 'utf8');
  console.log(`✓ Authority Map → ${authorityPath}`);

  const handoffPath = path.join(AGENTS_DIR, 'handoff-flows.html');
  fs.writeFileSync(handoffPath, generateHandoffFlows(), 'utf8');
  console.log(`✓ Handoff Flows → ${handoffPath}`);

  const svgPath = path.join(FIGMA_DIR, 'authority-map.svg');
  fs.writeFileSync(svgPath, generateAuthoritySVG(), 'utf8');
  console.log(`✓ SVG Figma    → ${svgPath}`);
}

if (require.main === module) main();
module.exports = { generateAuthorityMap, generateHandoffFlows, generateAuthoritySVG, AGENTS };
