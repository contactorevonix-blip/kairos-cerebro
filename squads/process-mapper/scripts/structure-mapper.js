#!/usr/bin/env node
'use strict';

/**
 * structure-mapper.js — structure-mapper (Tier 1)
 * Gera mapas visuais de estrutura AIOX: L1-L4 layers + squad anatomy.
 * Story PM-3.1 — spec FEAT-05
 * Fonte canónica: .claude/CLAUDE.md secção "Framework vs Project Boundary" (QA-03 fix)
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '../../..');
const STRUCT_DIR  = path.join(ROOT, 'docs', 'process-maps', 'structure');
const FIGMA_DIR   = path.join(ROOT, 'docs', 'process-maps', 'figma', 'structure');

// ─── L1-L4 data — fonte: .claude/CLAUDE.md "Framework vs Project Boundary" ──

const LAYERS = [
  {
    id: 'L1',
    name: 'L1 — Framework Core',
    mutability: 'NEVER modify',
    rule: 'Protegido por deny rules em .claude/settings.json',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    paths: [
      { path: '.aiox-core/core/', desc: 'Motor do framework — lógica de execução, registry, sessions' },
      { path: '.aiox-core/constitution.md', desc: 'Princípios inegociáveis AIOX' },
      { path: 'bin/aiox.js', desc: 'CLI entry point' },
      { path: 'bin/aiox-init.js', desc: 'Inicialização de projecto' },
    ],
  },
  {
    id: 'L2',
    name: 'L2 — Framework Templates',
    mutability: 'NEVER modify (extend-only)',
    rule: 'Adicionar novos ficheiros OK; editar existentes BLOQUEADO',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.1)',
    paths: [
      { path: '.aiox-core/development/tasks/', desc: '~100+ task definitions executáveis' },
      { path: '.aiox-core/development/templates/', desc: 'Templates de documentos (PRD, story, etc.)' },
      { path: '.aiox-core/development/checklists/', desc: 'Checklists de qualidade' },
      { path: '.aiox-core/development/workflows/', desc: 'Workflow definitions' },
      { path: '.aiox-core/infrastructure/', desc: 'Infrastructure templates' },
    ],
  },
  {
    id: 'L3',
    name: 'L3 — Project Config',
    mutability: 'Mutable (exceptions)',
    rule: 'Allow rules em .claude/settings.json permitem modificações específicas',
    color: '#EAB308',
    bg: 'rgba(234,179,8,0.1)',
    paths: [
      { path: '.aiox-core/data/', desc: 'Entity registry, tool examples, mcp catalog' },
      { path: 'agents/*/MEMORY.md', desc: 'Memória persistente de cada agente' },
      { path: 'core-config.yaml', desc: 'Toggle boundary.frameworkProtection (true/false)' },
    ],
  },
  {
    id: 'L4',
    name: 'L4 — Project Runtime',
    mutability: 'ALWAYS modify',
    rule: 'Todo o trabalho do projecto vive aqui',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
    paths: [
      { path: 'docs/stories/', desc: 'Stories de desenvolvimento + epics' },
      { path: 'docs/prd/', desc: 'PRDs, specs, complexity, research, implementation plans' },
      { path: 'squads/', desc: 'Squad definitions, agents DNA, workflows, tasks' },
      { path: 'tests/', desc: 'Testes do projecto' },
      { path: 'packages/', desc: 'Código de produto (Kairos Check, etc.)' },
    ],
  },
];

// ─── Squad anatomy — fonte: squads/claude-code-mastery/ (estrutura real) ─────

const SQUAD_ANATOMY = {
  rootFiles: [
    { name: 'squad.yaml', desc: 'Definição do squad: agentes, tiers, handoffs, outputs' },
    { name: 'config.yaml', desc: 'Domínio, orchestrator, filosofia, capabilities' },
    { name: 'README.md', desc: 'Comandos, agentes, outputs, constraints' },
    { name: 'ARCHITECTURE.md', desc: 'Arquitectura detalhada do squad' },
    { name: 'CHANGELOG.md', desc: 'Histórico de mudanças' },
    { name: 'swipe-config.yaml', desc: 'Configuração de swipe patterns' },
    { name: 'tool-overrides.yaml', desc: 'Overrides de ferramentas específicas' },
  ],
  folders: [
    { name: 'agents/', desc: 'DNA de cada agente (voice + thinking + smoke tests)', layer: 'L4' },
    { name: 'tasks/', desc: 'Task definitions com veto_conditions e outputs', layer: 'L4' },
    { name: 'workflows/', desc: 'Workflow YAML com fases e quality gates', layer: 'L4' },
    { name: 'checklists/', desc: 'Quality checklists específicos do squad', layer: 'L4' },
    { name: 'data/', desc: 'Knowledge base, registries, benchmarks', layer: 'L4' },
    { name: 'config/', desc: 'quality-gates.yaml · model-routing.yaml · permissions.yaml', layer: 'L4' },
    { name: 'templates/', desc: 'Output templates específicos do squad', layer: 'L4' },
    { name: 'outputs/', desc: 'Outputs gerados (minds, reports, artefactos)', layer: 'L4' },
    { name: 'scripts/', desc: 'Scripts Node.js de automação do squad', layer: 'L4' },
    { name: 'hooks/', desc: 'Claude Code hooks específicos do squad', layer: 'L4' },
    { name: 'memory/', desc: 'MEMORY.md — memória persistente do squad', layer: 'L3' },
    { name: 'minds/', desc: 'DNA completo de elite minds clonados', layer: 'L4' },
  ],
};

// ─── HTML generators ─────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function generateLayersHTML() {
  const layerCards = LAYERS.map(l => {
    const pathRows = l.paths.map(p => `
      <div class="path-row">
        <code class="path-code" style="color:${l.color}">${esc(p.path)}</code>
        <span class="path-desc">${esc(p.desc)}</span>
      </div>`).join('');

    return `
<div class="layer-card" style="border-color:${l.color};background:${l.bg}">
  <div class="layer-header">
    <span class="layer-badge" style="background:${l.color}">${esc(l.id)}</span>
    <div>
      <div class="layer-name" style="color:${l.color}">${esc(l.name)}</div>
      <div class="layer-rule">${esc(l.mutability)}</div>
    </div>
  </div>
  <div class="layer-note">${esc(l.rule)}</div>
  <div class="layer-paths">${pathRows}</div>
</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AIOX Layer Map — L1 a L4</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:40px 24px;min-height:100vh}
h1{text-align:center;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A78BFA;margin-bottom:6px}
.subtitle{text-align:center;font-size:12px;color:#6B7280;margin-bottom:32px}
.layers{display:flex;flex-direction:column;gap:16px;max-width:800px;margin:0 auto}
.layer-card{border-radius:10px;border:1px solid;padding:16px 20px}
.layer-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:8px}
.layer-badge{font-size:11px;font-weight:900;padding:4px 10px;border-radius:5px;color:#fff;white-space:nowrap;letter-spacing:.08em}
.layer-name{font-size:15px;font-weight:800}
.layer-rule{font-size:11px;font-weight:700;color:#9CA3AF;margin-top:2px}
.layer-note{font-size:11px;color:#6B7280;margin-bottom:10px;padding-left:2px}
.layer-paths{display:flex;flex-direction:column;gap:6px}
.path-row{display:flex;align-items:baseline;gap:10px;background:rgba(255,255,255,.04);border-radius:6px;padding:6px 10px}
.path-code{font-size:12px;font-family:'Courier New',monospace;font-weight:600;white-space:nowrap;flex-shrink:0}
.path-desc{font-size:11px;color:#9CA3AF;line-height:1.4}
.legend{display:flex;gap:16px;justify-content:center;margin-top:24px;flex-wrap:wrap}
.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#9CA3AF}
.legend-dot{width:12px;height:12px;border-radius:3px}
</style>
</head>
<body>
<h1>AIOX Layer Map</h1>
<p class="subtitle">4 camadas de mutabilidade · fonte: .claude/CLAUDE.md "Framework vs Project Boundary"</p>
<div class="layers">${layerCards}</div>
<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div>L1 — NEVER modify</div>
  <div class="legend-item"><div class="legend-dot" style="background:#F97316"></div>L2 — Extend-only</div>
  <div class="legend-item"><div class="legend-dot" style="background:#EAB308"></div>L3 — Mutable (exceptions)</div>
  <div class="legend-item"><div class="legend-dot" style="background:#22C55E"></div>L4 — ALWAYS modify</div>
</div>
</body>
</html>`;
}

function generateSquadAnatomyHTML() {
  const fileRows = SQUAD_ANATOMY.rootFiles.map(f => `
    <div class="item-row">
      <code class="item-code" style="color:#60A5FA">${esc(f.name)}</code>
      <span class="item-desc">${esc(f.desc)}</span>
    </div>`).join('');

  const folderRows = SQUAD_ANATOMY.folders.map(f => {
    const col = f.layer === 'L3' ? '#EAB308' : '#22C55E';
    return `
    <div class="item-row">
      <code class="item-code" style="color:${col}">${esc(f.name)}</code>
      <span class="item-badge" style="background:${col}22;color:${col};border-color:${col}44">${f.layer}</span>
      <span class="item-desc">${esc(f.desc)}</span>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AIOX Squad Anatomy</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:40px 24px;min-height:100vh}
h1{text-align:center;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A78BFA;margin-bottom:6px}
.subtitle{text-align:center;font-size:12px;color:#6B7280;margin-bottom:32px}
.section{background:#0F1117;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px 20px;margin-bottom:16px;max-width:800px;margin-left:auto;margin-right:auto}
.section-title{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6B7280;margin-bottom:10px}
.item-row{display:flex;align-items:baseline;gap:8px;padding:5px 8px;border-radius:5px;background:rgba(255,255,255,.03);margin-bottom:4px;flex-wrap:wrap}
.item-code{font-size:12px;font-family:'Courier New',monospace;font-weight:600;flex-shrink:0}
.item-badge{font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;border:1px solid;letter-spacing:.08em;flex-shrink:0}
.item-desc{font-size:11px;color:#9CA3AF;line-height:1.4}
</style>
</head>
<body>
<h1>AIOX Squad Anatomy</h1>
<p class="subtitle">Estrutura canónica de um squad · fonte: squads/claude-code-mastery/ (estrutura real)</p>
<div class="section">
  <div class="section-title">Ficheiros Raiz (${SQUAD_ANATOMY.rootFiles.length} ficheiros)</div>
  ${fileRows}
</div>
<div class="section">
  <div class="section-title">Pastas (${SQUAD_ANATOMY.folders.length} pastas)</div>
  ${folderRows}
</div>
</body>
</html>`;
}

function generateLayersSVG() {
  const W = 900, H = 480;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="#0D0F14"/>`;
  svg += `<text x="${W/2}" y="24" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="#A78BFA">AIOX Layer Map — L1 a L4</text>`;

  LAYERS.forEach((l, i) => {
    const y = 40 + i * 108;
    svg += `<rect id="${l.id}" x="20" y="${y}" width="${W-40}" height="98" rx="7" fill="${l.color}18" stroke="${l.color}" stroke-width="1.5"/>`;
    svg += `<rect x="28" y="${y+10}" width="32" height="20" rx="3" fill="${l.color}"/>`;
    svg += `<text x="44" y="${y+24}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="900" fill="#fff">${l.id}</text>`;
    svg += `<text x="72" y="${y+24}" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="${l.color}">${esc(l.name)}</text>`;
    svg += `<text x="72" y="${y+38}" font-family="Inter,sans-serif" font-size="9" fill="#9CA3AF">${esc(l.mutability)}</text>`;

    let px = 28;
    for (const p of l.paths.slice(0, 4)) {
      const ptext = p.path.length > 18 ? p.path.slice(0, 17) + '…' : p.path;
      const pw = Math.min(ptext.length * 6.5 + 16, 200);
      svg += `<rect x="${px}" y="${y+48}" width="${pw}" height="20" rx="3" fill="${l.color}22" stroke="${l.color}55" stroke-width="0.5"/>`;
      svg += `<text x="${px+6}" y="${y+61}" font-family="Courier New,monospace" font-size="8" fill="${l.color}">${esc(ptext)}</text>`;
      px += pw + 6;
      if (px > W - 100) break;
    }
  });

  svg += '</svg>';
  return svg;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  [STRUCT_DIR, FIGMA_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  const layersPath = path.join(STRUCT_DIR, 'aiox-layers.html');
  fs.writeFileSync(layersPath, generateLayersHTML(), 'utf8');
  console.log(`✓ Layers Map  → ${layersPath}`);

  const anatomyPath = path.join(STRUCT_DIR, 'squad-anatomy.html');
  fs.writeFileSync(anatomyPath, generateSquadAnatomyHTML(), 'utf8');
  console.log(`✓ Squad Anatomy → ${anatomyPath}`);

  const svgPath = path.join(FIGMA_DIR, 'aiox-layers.svg');
  fs.writeFileSync(svgPath, generateLayersSVG(), 'utf8');
  console.log(`✓ SVG Figma   → ${svgPath}`);
}

if (require.main === module) main();
module.exports = { generateLayersHTML, generateSquadAnatomyHTML, LAYERS, SQUAD_ANATOMY };
