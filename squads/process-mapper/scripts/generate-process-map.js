#!/usr/bin/env node
'use strict';

/**
 * generate-process-map.js
 * Gera HTML interactivo + SVG Figma-exportável para qualquer processo AIOX.
 * Story PM-1.1 — spec FEAT-01 + FEAT-02
 *
 * CLI:
 *   node generate-process-map.js --config path/to/process.json --output docs/process-maps/output.html
 *   node generate-process-map.js --test
 */

const fs   = require('fs');
const path = require('path');
const { phaseBlock, qualityGate, deliveryBlock, outOfScopeBlock, css } = require('./html-templates');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const MAPS_DIR     = path.join(PROJECT_ROOT, 'docs', 'process-maps');

// ─── Core generator ──────────────────────────────────────────────────────────

function generateProcessMap(config) {
  const { title = '', subtitle = '', planning_track, phases = [], quality_gates = [], out_of_scope, delivery } = config;

  let body = '';
  const gatesByPhase = {};
  for (const g of quality_gates) {
    gatesByPhase[g.after_phase] = g;
  }

  for (const phase of phases) {
    body += phaseBlock(phase);
    if (gatesByPhase[phase.id]) {
      body += qualityGate(gatesByPhase[phase.id]);
    }
  }

  if (out_of_scope) {
    body += outOfScopeBlock(out_of_scope);
  }

  if (delivery) {
    body += deliveryBlock(delivery.title, delivery.chips);
  }

  const trackBadge = planning_track
    ? `<span class="track-badge">${escHtml(planning_track)}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)}</title>
<style>${css()}</style>
</head>
<body>
<h1>${escHtml(title)}</h1>
<p class="subtitle">${escHtml(subtitle)}${trackBadge}</p>
<div class="pipeline">${body}</div>
</body>
</html>`;
}

// ─── SVG generator (fallback template — Mermaid CLI opcional) ──────────────

function generateSVG(config) {
  const { title = '', phases = [], quality_gates = [] } = config;
  const W = 900, PHASE_H = 90, GATE_H = 80, GAP = 24;
  const items = [];
  const gatesByPhase = {};
  for (const g of quality_gates) gatesByPhase[g.after_phase] = g;

  for (const p of phases) {
    items.push({ type: 'phase', data: p });
    if (gatesByPhase[p.id]) items.push({ type: 'gate', data: gatesByPhase[p.id] });
  }

  let totalH = 60;
  for (const it of items) totalH += (it.type === 'phase' ? PHASE_H : GATE_H) + GAP;
  totalH += 40;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}" width="${W}" height="${totalH}">`;
  svg += `<rect width="${W}" height="${totalH}" fill="#0D0F14"/>`;
  svg += `<text x="${W/2}" y="36" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="700" fill="#A78BFA">${escSvg(title)}</text>`;

  const PHASE_COLORS = { mapper:'#7C3AED', architect:'#0EA5E9', automation:'#F59E0B', qa:'#10B981', green:'#10B981' };
  let y = 56;

  for (const it of items) {
    const h = it.type === 'phase' ? PHASE_H : GATE_H;
    const d = it.data;
    if (it.type === 'phase') {
      const col = PHASE_COLORS[d.color] || '#7C3AED';
      svg += `<rect id="${escSvg(d.id)}" x="20" y="${y}" width="${W-40}" height="${h}" rx="8" fill="${col}18" stroke="${col}" stroke-width="1.5"/>`;
      svg += `<text x="36" y="${y+20}" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="${col}" letter-spacing="1.5">${escSvg(d.label||'')}</text>`;
      svg += `<text x="36" y="${y+40}" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="${col}">${escSvg(d.title||'')}</text>`;
      if (d.agent) svg += `<text x="36" y="${y+60}" font-family="Inter,sans-serif" font-size="11" fill="#9CA3AF">${escSvg(d.agent)}</text>`;
    } else {
      const cx = W/2;
      svg += `<rect id="${escSvg(d.id)}" x="${cx-130}" y="${y}" width="260" height="${h}" rx="8" fill="#ffffff08" stroke="#6366F1" stroke-width="2"/>`;
      svg += `<text x="${cx}" y="${y+18}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#818CF8">${escSvg(d.id||'')}</text>`;
      svg += `<text x="${cx}" y="${y+38}" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="#E8EAF0">Score ≥ ${d.threshold||70}%?</text>`;
      svg += `<text x="${cx-50}" y="${y+60}" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#F87171">NO</text>`;
      svg += `<text x="${cx+50}" y="${y+60}" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#34D399">YES</text>`;
    }
    y += h + GAP;
  }

  svg += '</svg>';
  return svg;
}

// ─── File I/O helpers ─────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeMap(name, htmlContent, svgContent) {
  ensureDir(MAPS_DIR);
  const htmlPath = path.join(MAPS_DIR, `${name}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const figmaDir = path.join(MAPS_DIR, 'figma');
  ensureDir(figmaDir);
  const svgPath = path.join(figmaDir, `${name}.svg`);
  fs.writeFileSync(svgPath, svgContent, 'utf8');

  return { htmlPath, svgPath };
}

// ─── Test data ────────────────────────────────────────────────────────────────

const TEST_CONFIG = {
  name: 'test-process',
  title: 'AIOX Process Mapper — Test Process',
  subtitle: 'Gerado por generate-process-map.js --test · Story PM-1.2',
  planning_track: 'Enterprise · 7 epics · 32 stories',
  phases: [
    {
      id: 'phase-1',
      label: 'Fase 1',
      title: 'Discovery & Process Design',
      agent: '@process-auditor',
      color: 'mapper',
      steps: [
        'Identificar domínio e escopo do processo',
        'Verificar artefactos existentes (IDS: REUSE > ADAPT > CREATE)',
        'Definir agentes envolvidos e autoridade',
      ],
    },
    {
      id: 'phase-2',
      label: 'Fase 2',
      title: 'Flow Architecture',
      agent: '@flow-architect',
      color: 'architect',
      steps: [
        'Gerar fluxograma HTML interactivo',
        'Gerar SVG Figma-exportável (template ou Mermaid CLI)',
        'Validar quality gates contra ficheiros reais',
      ],
    },
    {
      id: 'phase-3',
      label: 'Fase 3',
      title: 'Map Validation',
      agent: '@map-validator',
      color: 'qa',
      steps: [
        'Verificar fidelidade mapa vs ficheiros reais',
        'Score mínimo: 90%',
        'Registar no coverage-report.md',
      ],
    },
  ],
  quality_gates: [
    {
      id: 'QG-1',
      name: 'Discovery Validation',
      threshold: 70,
      after_phase: 'phase-1',
      path_no: 'Volta a Discovery',
      path_no_detail: 'Escopo fraco / artefacto duplicado',
      path_yes: 'Avança para Flow Architecture',
    },
    {
      id: 'QG-2',
      name: 'Map Fidelity',
      threshold: 90,
      after_phase: 'phase-2',
      path_no: 'Back to Flow Architect',
      path_yes: 'Avança para Validation',
    },
  ],
  out_of_scope: [
    'Interface web multi-utilizador',
    'Push automático para Figma API',
    'Mapeamento de código-fonte (funções, classes)',
  ],
  delivery: {
    title: 'MAPA VALIDADO',
    chips: ['HTML interactivo', 'SVG Figma', 'Score ≥ 90%', 'coverage-report actualizado'],
  },
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const isTest   = args.includes('--test');
  const cfgIdx   = args.indexOf('--config');
  const outIdx   = args.indexOf('--output');

  let config, outputPath;

  if (isTest) {
    config = TEST_CONFIG;
    outputPath = path.join(MAPS_DIR, 'test-process.html');
  } else if (cfgIdx >= 0) {
    const cfgFile = args[cfgIdx + 1];
    if (!cfgFile || !fs.existsSync(cfgFile)) {
      console.error(`Erro: ficheiro de config não encontrado: ${cfgFile}`);
      process.exit(1);
    }
    config = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    outputPath = outIdx >= 0 ? args[outIdx + 1] : path.join(MAPS_DIR, `${config.name || 'process'}.html`);
  } else {
    console.log('Uso:');
    console.log('  node generate-process-map.js --test');
    console.log('  node generate-process-map.js --config process.json [--output output.html]');
    process.exit(0);
  }

  const html = generateProcessMap(config);
  const svg  = generateSVG(config);
  const name = config.name || path.basename(outputPath, '.html');

  const { htmlPath, svgPath } = writeMap(name, html, svg);
  console.log(`✓ HTML → ${htmlPath}`);
  console.log(`✓ SVG  → ${svgPath}`);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escSvg(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

if (require.main === module) main();

module.exports = { generateProcessMap, generateSVG, writeMap };
