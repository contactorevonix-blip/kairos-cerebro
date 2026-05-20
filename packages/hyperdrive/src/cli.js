#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — CLI Principal
 * node packages/hyperdrive/src/cli.js [command] [flags]
 *
 * Comandos:
 *   --task "<desc>"    Executar uma task
 *   --dashboard        Dashboard ANSI em tempo real
 *   --status           Estado actual (sem dashboard)
 *   --ledger [n]       Últimos n eventos do Ledger
 *   --verify           Verificar hash chain do Ledger
 *   --progress         Progresso dos milestones
 *   --emergency        Activar Emergency Pause
 *   --resume           Retomar após Emergency Pause
 *   --red-team <file>  Correr Red Team num ficheiro
 *   --dry-run          Planear sem executar (com --task)
 *   --consensus        Forçar consenso (com --task)
 *   --help             Esta mensagem
 */

const path = require('node:path');
const fs   = require('node:fs');

// Parse args
const args   = process.argv.slice(2);
const hasArg = (flag) => args.includes(flag);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

// ─── HELP ──────────────────────────────────────────────────────────────────

if (hasArg('--help') || args.length === 0) {
  console.log(`
${'\x1b[1m\x1b[36m'}KAIROS HYPERDRIVE${'\x1b[0m'} — Motor de Orquestração Multi-Agente

${'\x1b[33m'}Comandos:${'\x1b[0m'}
  --task "<desc>"    Executar uma task (add --consensus para forçar consenso)
  --dashboard        Dashboard ANSI em tempo real (Ctrl+E = Emergency Pause)
  --status           Estado actual resumido
  --ledger [n]       Últimos N eventos do Ledger (default: 10)
  --verify           Verificar integridade do Ledger
  --progress         Progresso dos milestones
  --emergency        Activar Emergency Pause instantâneo
  --resume           Retomar após Emergency Pause
  --red-team <file>  Correr Red Team num ficheiro
  --dry-run          Planear sem executar (usar com --task)
  --consensus        Forçar consenso sénior (usar com --task)

${'\x1b[33m'}Flags globais:${'\x1b[0m'}
  --json             Output em JSON
  --live             Forçar LIVE MODE (Anthropic API real)
  --help             Esta mensagem

${'\x1b[33m'}Exemplos:${'\x1b[0m'}
  node packages/hyperdrive/src/cli.js --dashboard
  node packages/hyperdrive/src/cli.js --task "adicionar endpoint /api/batch" --dry-run
  node packages/hyperdrive/src/cli.js --task "corrigir bug crítico no billing" --consensus
  node packages/hyperdrive/src/cli.js --red-team packages/sniper-api/server.js
  node packages/hyperdrive/src/cli.js --emergency
  node packages/hyperdrive/src/cli.js --resume
  node packages/hyperdrive/src/cli.js --ledger 20
  node packages/hyperdrive/src/cli.js --verify

${'\x1b[33m'}Budget:${'\x1b[0m'}
  Warn:  $${process.env.KAIROS_TASK_BUDGET_USD || 2}/task
  Stop:  $${process.env.KAIROS_TASK_HARD_STOP_USD || 3}/task
  Mode:  ${process.env.KAIROS_LIVE === '1' ? '\x1b[31mLIVE 🔴\x1b[0m' : '\x1b[37mMOCK ⚪\x1b[0m'}
`);
  process.exit(0);
}

// Force LIVE MODE se --live flag
if (hasArg('--live')) process.env.KAIROS_LIVE = '1';
const isJson = hasArg('--json');

function out(data) {
  if (isJson) { console.log(JSON.stringify(data, null, 2)); }
  else        { console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2)); }
}

// ─── COMANDOS ──────────────────────────────────────────────────────────────

async function main() {
  // ── EMERGENCY PAUSE ──
  if (hasArg('--emergency')) {
    const { pause } = require('./emergency');
    const result = pause('CLI --emergency pelo CEO');
    out(isJson ? result : `\n🚨 EMERGENCY PAUSE activado.\n   Retomar: node packages/hyperdrive/src/cli.js --resume\n`);
    return;
  }

  // ── RESUME ──
  if (hasArg('--resume')) {
    const { resume } = require('./emergency');
    const result = resume();
    out(isJson ? result : `\n✅ ${result.resumed ? 'Execução retomada.' : result.reason}\n`);
    return;
  }

  // ── STATUS ──
  if (hasArg('--status')) {
    const { getStatus }   = require('./emergency');
    const { getBudgetStatus } = require('./providers/anthropic');
    const { progressTowards } = require('./memory/knowledge-graph');
    const { countLedgerEvents } = _ledgerUtils();

    const emergency = getStatus();
    const budget    = getBudgetStatus();
    const rebuild   = progressTowards('rebuild-v1');
    const hd        = progressTowards('hyperdrive-v1');

    if (isJson) {
      out({ emergency, budget, rebuild, hyperdrive: hd, ledgerEvents: countLedgerEvents() });
    } else {
      console.log(`\n=== KAIROS HYPERDRIVE STATUS ===`);
      console.log(`Paused:      ${emergency.paused ? '🚨 SIM' : '✅ NÃO'}`);
      console.log(`Budget task: $${budget.taskCostUsd} / $${budget.hardStop}`);
      console.log(`Mode:        ${process.env.KAIROS_LIVE === '1' ? 'LIVE 🔴' : 'MOCK ⚪'}`);
      console.log(`Rebuild:     ${rebuild.percent}% (${rebuild.done}/${rebuild.total})`);
      console.log(`Hyperdrive:  ${hd.percent}% (${hd.done}/${hd.total})`);
      console.log(`Ledger:      ${countLedgerEvents()} eventos`);
      if (emergency.paused) console.log(`\n⚠️  Motivo: ${emergency.reason}`);
    }
    return;
  }

  // ── VERIFY LEDGER ──
  if (hasArg('--verify')) {
    const { verify } = require('./memory/ledger');
    const ok = verify();
    out(isJson ? { ok } : (ok ? '✅ Ledger OK — hash chain válida.' : '❌ Ledger CORROMPIDO.'));
    process.exit(ok ? 0 : 1);
    return;
  }

  // ── LEDGER TAIL ──
  if (hasArg('--ledger')) {
    const n       = parseInt(getArg('--ledger') || '10', 10);
    const LEDGER  = path.join(__dirname, '..', '..', '..', '.claude', 'memory', 'state-ledger.jsonl');
    try {
      const lines  = fs.readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean);
      const events = lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      if (isJson) { out(events); return; }
      console.log(`\n=== LEDGER — últimos ${events.length} eventos ===`);
      for (const ev of events) {
        const ts      = ev.timestamp?.slice(0, 19).replace('T', ' ') || '?';
        const payload = JSON.stringify(ev.payload || {}).slice(0, 80);
        console.log(`  ${ts}  ${(ev.actor || '?').padEnd(14)} ${(ev.type || '?').padEnd(24)} ${payload}`);
      }
    } catch { out('Ledger vazio ou não inicializado.'); }
    return;
  }

  // ── PROGRESS ──
  if (hasArg('--progress')) {
    const { progressTowards } = require('./memory/knowledge-graph');
    const rebuild = progressTowards('rebuild-v1');
    const hd      = progressTowards('hyperdrive-v1');
    if (isJson) { out({ rebuild, hyperdrive: hd }); return; }
    console.log(`\nRebuild v1:  ${rebuild.percent}% (${rebuild.done}/${rebuild.total})`);
    if (rebuild.remaining.length) console.log(`  Restante: ${rebuild.remaining.join(', ')}`);
    console.log(`\nHyperdrive:  ${hd.percent}% (${hd.done}/${hd.total})`);
    if (hd.remaining.length) console.log(`  Restante: ${hd.remaining.join(', ')}`);
    return;
  }

  // ── RED TEAM ──
  if (hasArg('--red-team')) {
    const file = getArg('--red-team');
    if (!file || !fs.existsSync(file)) {
      console.error(`Ficheiro não encontrado: ${file}`); process.exit(1);
    }
    const code   = fs.readFileSync(file, 'utf8');
    const { run, format } = require('./redteam/index');
    const opts   = { rexOnly: hasArg('--rex'), quinnOnly: hasArg('--quinn') };
    const report = run(code, file, opts);
    if (isJson) { out(report); }
    else        { console.log(format(report)); }
    process.exit(report.passed ? 0 : 1);
    return;
  }

  // ── DASHBOARD ──
  if (hasArg('--dashboard')) {
    const { start } = require('./dashboard');
    start({ fps: 1 });
    return; // dashboard corre indefinidamente até Ctrl+C ou Ctrl+E
  }

  // ── TASK ──
  if (hasArg('--task')) {
    const task = getArg('--task');
    if (!task) { console.error('--task requer uma descrição entre aspas.'); process.exit(1); }

    const { assertNotPaused } = require('./emergency');
    assertNotPaused();

    const { orchestrate } = require('./orchestrator');
    const files    = getArg('--files')?.split(',') || [];
    const opts     = {
      forceConsensus:   hasArg('--consensus'),
      dryRun:           hasArg('--dry-run'),
    };

    console.log(`\n[HYPERDRIVE] Iniciando task em ${process.env.KAIROS_LIVE === '1' ? 'LIVE' : 'MOCK'} mode...\n`);
    const result = await orchestrate(task, files, opts);

    if (isJson) { out(result); }
    else {
      console.log(`\n=== RESULTADO ===`);
      console.log(`OK:     ${result.ok ? '✅' : '❌'}`);
      console.log(`Mode:   ${result.mode}`);
      console.log(`Domain: ${result.domain}`);
      if (result.consensus?.reached) console.log(`Consenso: ronda ${result.consensus.round}, conf ${result.consensus.avgConfidence}`);
      if (result.execution?.text) console.log(`\nOutput:\n${result.execution.text}`);
      console.log(`\nBudget: $${result.budget?.taskCostUsd || 0} / $${result.budget?.hardStop || 3}`);
    }

    process.exit(result.ok ? 0 : 1);
    return;
  }

  // Nenhum comando reconhecido
  console.error('Comando não reconhecido. Correr --help para ver opções.');
  process.exit(1);
}

// Utilitário interno (sem módulo separado)
function _ledgerUtils() {
  const LEDGER = path.join(__dirname, '..', '..', '..', '.claude', 'memory', 'state-ledger.jsonl');
  return {
    countLedgerEvents: () => {
      try {
        return fs.readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean).length;
      } catch { return 0; }
    },
  };
}

main().catch(err => {
  console.error('\n❌ FATAL:', err.message);
  process.exit(2);
});
