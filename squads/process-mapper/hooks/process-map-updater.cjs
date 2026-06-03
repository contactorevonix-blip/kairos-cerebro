#!/usr/bin/env node
/**
 * process-map-updater.cjs — FR-05 actualização automática de mapas
 * PostToolUse hook: detecta Write/Edit em ficheiros de processo → re-gera mapa
 * Story PM-4.3 — spec FEAT-07
 *
 * Anti-loop: NUNCA accionar em docs/process-maps/ (o próprio squad escreve lá)
 * Registry: squads/process-mapper/data/process-registry.yaml
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'squads', 'process-mapper', 'data', 'process-registry.yaml');
const GENERATOR    = path.join(PROJECT_ROOT, 'squads', 'process-mapper', 'scripts', 'generate-process-map.js');
const PROCESSES_DIR = path.join(PROJECT_ROOT, 'squads', 'process-mapper', 'data', 'processes');
const MAPS_DIR      = path.join(PROJECT_ROOT, 'docs', 'process-maps');

// Anti-loop: ficheiros nestas pastas NUNCA triggeram re-geração
const EXCLUDED_PREFIXES = [
  'docs/process-maps/',
  'squads/process-mapper/scripts/',
  'squads/process-mapper/hooks/',
];

function readStdin() {
  return new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
    process.stdin.on('error', () => { resolve(''); });
    setTimeout(() => resolve(data), 3000);
  });
}

function parseRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return [];
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const mappings = [];
  const lines = raw.split('\n');
  let current = null;
  for (const line of lines) {
    const srcMatch = line.match(/^\s+-\s+source_file:\s+"?([^"]+)"?/);
    if (srcMatch) { current = { source_file: srcMatch[1], maps_to: [] }; mappings.push(current); }
    const mapsMatch = line.match(/maps_to:\s+\["?([^"\]]+)"?\]/);
    if (mapsMatch && current) {
      current.maps_to = mapsMatch[1].split(',').map(s => s.trim().replace(/["]/g,''));
    }
  }
  return mappings.filter(m => m.maps_to.length > 0);
}

function isExcluded(filePath) {
  const rel = filePath.replace(PROJECT_ROOT + '/', '').replace(/\\/g, '/');
  return EXCLUDED_PREFIXES.some(prefix => rel.startsWith(prefix));
}

function regenerate(processName) {
  const jsonPath = path.join(PROCESSES_DIR, `${processName}.json`);
  if (!fs.existsSync(jsonPath)) return false;
  const outPath = path.join(MAPS_DIR, `${processName}.html`);
  try {
    execSync(
      `node "${GENERATOR}" --config "${jsonPath}" --output "${outPath}"`,
      { cwd: PROJECT_ROOT, stdio: ['pipe','pipe','ignore'], timeout: 30000 }
    );
    return true;
  } catch { return false; }
}

async function main() {
  const raw  = await readStdin();
  let data   = {};
  try { data = JSON.parse(raw); } catch { /* não é JSON */ }

  const toolName  = (data.tool_name || data.toolName || '').toLowerCase();
  const toolInput = data.tool_input || data.toolInput || {};
  const filePath  = toolInput.file_path || toolInput.path || '';

  // Só activa em Write e Edit
  if (!['write', 'edit'].includes(toolName)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // Anti-loop: excluir pastas do próprio squad
  if (!filePath || isExcluded(filePath)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const registry = parseRegistry();
  const relPath  = filePath.replace(PROJECT_ROOT + '/', '').replace(/\\/g, '/');

  // Encontrar processos afectados
  const toRegenerate = new Set();
  for (const mapping of registry) {
    if (relPath.includes(mapping.source_file) || mapping.source_file.includes(relPath)) {
      for (const p of mapping.maps_to) toRegenerate.add(p);
    }
  }

  if (toRegenerate.size === 0) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  // Re-gerar assincronamente (não bloquear o utilizador)
  const results = [];
  for (const processName of toRegenerate) {
    const ok = regenerate(processName);
    results.push(`${ok ? '✓' : '✗'} ${processName}`);
  }

  // Registar em log (nunca bloquear)
  try {
    const logPath = path.join(PROJECT_ROOT, '.aiox', 'process-map-errors.log');
    const failed  = results.filter(r => r.startsWith('✗'));
    if (failed.length > 0) {
      const entry  = `${new Date().toISOString()} TRIGGER:${relPath} FAILED:${failed.join(',')}\n`;
      fs.appendFileSync(logPath, entry, 'utf8');
    }
  } catch { /* log não crítico */ }

  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
});
