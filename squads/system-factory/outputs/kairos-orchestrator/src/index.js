#!/usr/bin/env node
// index.js — Entry point CLI (Artigo I — CLI First).
// Uso:
//   node src/index.js            -> corre a orquestracao completa (15 fases)
//   node src/index.js --dry-run  -> corre as fases sem efeitos (validacao)
//   node src/index.js --status   -> imprime o estado actual do cerebro

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import { AgentRegistry } from './AgentRegistry.js';
import { KairosCerebro } from './KairosCerebro.js';
import { MeshNetwork } from './MeshNetwork.js';
import { Director } from './Director.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Raiz do projecto KAIROS_CEREBRO.
// src -> kairos-orchestrator -> outputs -> system-factory -> squads -> KAIROS_CEREBRO (5 niveis acima de src).
const PROJECT_ROOT = resolve(__dirname, '../../../../..');

async function loadConfig() {
  const raw = await readFile(join(__dirname, '../config/orchestrator.json'), 'utf-8');
  const cfg = JSON.parse(raw);
  // Resolve paths relativos a raiz do projecto.
  cfg.paths.agentsDir = join(PROJECT_ROOT, cfg.paths.agentsDir);
  cfg.paths.stateFile = join(PROJECT_ROOT, cfg.paths.stateFile);
  cfg.paths.cerebroState = join(PROJECT_ROOT, cfg.paths.cerebroState);
  return cfg;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const statusOnly = args.includes('--status');

  const config = await loadConfig();
  const cerebro = new KairosCerebro(config.paths.cerebroState);
  await cerebro.load();

  if (statusOnly) {
    console.log(JSON.stringify({
      phase: cerebro.state.phase,
      startedAt: cerebro.state.startedAt,
      lastUpdate: cerebro.state.lastUpdate,
      agentsRemembered: Object.keys(cerebro.state.crossMemory).length,
      selfHeals: cerebro.state.selfHealHistory.length,
      logs: cerebro.state.logs.length,
    }, null, 2));
    return;
  }

  const registry = new AgentRegistry(config.paths.agentsDir);
  const mesh = new MeshNetwork(cerebro, config.mesh);
  const director = new Director({ registry, mesh, cerebro, config });

  console.log(`KAIROS Orchestrator — ${dryRun ? 'DRY-RUN' : 'LIVE'} — raiz: ${PROJECT_ROOT}`);
  const result = await director.orchestrate({ dryRun });
  await cerebro.persist();
  console.log(`\nOrquestracao: ${result}. Self-heals: ${cerebro.state.selfHealHistory.length}.`);
}

main().catch((err) => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
