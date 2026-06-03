#!/usr/bin/env node
/**
 * process-map-gate.cjs — gate pré-criação automático
 * Story PM-6.1 + PM-6.2 — spec FEAT-06, ADR-PM-001
 *
 * Interceta comandos *create-*, *draft, *create-epic, *create-story, *create-agent, *create-squad
 * APENAS quando o prompt começa com @ ou * (não em perguntas naturais).
 * ADR-PM-002: só activo após EPIC-PM-001 Done.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const MAPS_DIR     = path.join(PROJECT_ROOT, 'docs', 'process-maps');

// Padrão de detecção: só activa se prompt começa com @ ou * seguido de create/draft
// QA-04: evitar falsos positivos em perguntas naturais
const GATE_PATTERN = /^[@*]\S*(create[-\s]|draft\b|create-epic|create-story|create-agent|create-squad)/i;

// Processos que têm mapa obrigatório por tipo de criação
const PROCESS_MAPS = {
  'create-squad':  ['sdc'],
  'create-epic':   ['spec-pipeline', 'sdc'],
  'create-story':  ['sdc'],
  'create-agent':  ['agent-authority'],
  'draft':         ['sdc'],
};

function hasValidMap(processName) {
  const htmlPath = path.join(MAPS_DIR, `${processName}.html`);
  return fs.existsSync(htmlPath);
}

function readStdin() {
  return new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
    process.stdin.on('error', () => { resolve(''); });
    // fallback timeout — nunca bloquear
    setTimeout(() => resolve(data), 2000);
  });
}

async function main() {
  const raw = await readStdin();
  let data = {};
  try { data = JSON.parse(raw); } catch { /* não é JSON — continuar */ }

  const prompt = (data.prompt || data.message || '').trim();

  // Se --skip-map-gate presente → bypass
  if (prompt.includes('--skip-map-gate')) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // Só activa se padrão de criação (@ ou * prefix)
  if (!GATE_PATTERN.test(prompt)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // Detectar que tipo de criação é
  const match = prompt.match(/\*(create-squad|create-epic|create-story|create-agent|draft)/i);
  const cmd = match ? match[1].toLowerCase() : null;
  const required = cmd ? (PROCESS_MAPS[cmd] || ['sdc']) : ['sdc'];

  const missing = required.filter(p => !hasValidMap(p));

  if (missing.length === 0) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // Gate activo — mapas em falta
  const suggestion = missing.map(m => `*map-process ${m}`).join(' e ');
  const msg = `[process-map-gate] Mapa de processo necessário antes de criar.\n` +
    `Falta: ${missing.join(', ')}\n` +
    `Gerar: @cartographer-chief ${suggestion}\n` +
    `Bypass: adicionar --skip-map-gate ao comando`;

  process.stdout.write(JSON.stringify({
    continue: false,
    reason: msg,
  }));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
});
