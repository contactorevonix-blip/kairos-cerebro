#!/usr/bin/env node
'use strict';

/**
 * KAIROS — Knowledge Export
 * Exporta tudo para kairos-knowledge-backup-{data}.json
 * Usage: npm run kairos:export
 */

const fs   = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT         = path.resolve(__dirname, '..');
const LEDGER       = process.env.KAIROS_LEDGER_PATH || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
const KG_PATH      = path.join(ROOT, '.claude', 'memory', 'knowledge-graph.json');
const PATTERNS     = path.join(ROOT, '.claude', 'memory', 'patterns.json');
const POSTMORTEMS  = path.join(ROOT, '.claude', 'memory', 'postmortems.jsonl');
const AGENTS_DIR   = path.join(ROOT, '.claude', 'agents');
const BACKUPS_DIR  = path.join(ROOT, '.claude', 'backups');

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', yellow:'\x1b[33m', dim:'\x1b[2m', cyan:'\x1b[36m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function readJSONL(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').trim().split('\n')
    .filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function main() {
  console.log(c('bold', '\n📦 KAIROS — Knowledge Export\n'));

  const dateStr  = new Date().toISOString().slice(0, 10);
  const fileName = `kairos-knowledge-backup-${dateStr}.json`;
  const outGzip  = path.join(BACKUPS_DIR, fileName + '.gz');

  fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  // Recolher dados
  const ledgerEvents = readJSONL(LEDGER);
  const kg           = readJSON(KG_PATH);
  const patterns     = readJSON(PATTERNS);
  const postmortems  = readJSONL(POSTMORTEMS);

  // Agent profiles
  const agentProfiles = {};
  if (fs.existsSync(AGENTS_DIR)) {
    for (const file of fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))) {
      const id = file.replace('.md', '');
      agentProfiles[id] = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    }
  }

  const backup = {
    exported_at:     new Date().toISOString(),
    version:         '1.0',
    summary: {
      ledger_events:    ledgerEvents.length,
      postmortems:      postmortems.length,
      agent_profiles:   Object.keys(agentProfiles).length,
      has_kg:           kg !== null,
      has_patterns:     patterns !== null,
    },
    ledger:           ledgerEvents,
    knowledge_graph:  kg,
    patterns,
    postmortems,
    agent_profiles:   agentProfiles,
  };

  const json    = JSON.stringify(backup, null, 2);
  const gzipped = zlib.gzipSync(Buffer.from(json, 'utf8'));
  fs.writeFileSync(outGzip, gzipped);

  const sizeMb  = (gzipped.length / 1024 / 1024).toFixed(2);

  console.log(`  ${c('green', '✅')} Backup criado com:`);
  console.log(`     ${c('cyan', ledgerEvents.length + '')} eventos do ledger`);
  console.log(`     ${c('cyan', postmortems.length + '')} postmortems`);
  console.log(`     ${c('cyan', Object.keys(agentProfiles).length + '')} agent profiles`);
  console.log(`     ${c('cyan', patterns ? Object.keys(patterns).length + '' : '0')} categorias de patterns`);
  console.log(`\n  Ficheiro: ${c('dim', outGzip)}`);
  console.log(`  Tamanho:  ${c('dim', sizeMb + ' MB (comprimido)')}\n`);
}

main();
