#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — Overnight Runner
 * Executa lista de tasks sequencialmente via HYPERDRIVE LIVE.
 * Para às 08:00 de amanhã ou quando a lista acabar.
 *
 * Usage:
 *   npm run kairos:overnight
 *   npm run kairos:overnight -- --tasks scripts/custom-tasks.txt
 *   npm run kairos:overnight -- --dry-run
 */

const { execSync, spawnSync } = require('node:child_process');
const fs   = require('node:fs');
const path = require('node:path');

const ROOT         = path.resolve(__dirname, '..');
const TASKS_FILE   = process.argv.includes('--tasks')
  ? process.argv[process.argv.indexOf('--tasks') + 1]
  : path.join(__dirname, 'overnight-tasks.txt');
const RESULTS_FILE = path.join(__dirname, 'overnight-results.jsonl');
const DRY_RUN      = process.argv.includes('--dry-run');
const START_TIME   = Date.now();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function c(code, text) {
  const codes = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', white: '\x1b[37m' };
  return `${codes[code] || ''}${text}${codes.reset}`;
}

function elapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${String(m % 60).padStart(2,'0')}m`;
  if (m > 0) return `${m}m${String(s % 60).padStart(2,'0')}s`;
  return `${s}s`;
}

function getStopTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  return tomorrow.getTime();
}

function isStopping(stopAt) {
  return Date.now() >= stopAt;
}

function appendResult(record) {
  fs.appendFileSync(RESULTS_FILE, JSON.stringify(record) + '\n', 'utf8');
}

function extractBudget(output) {
  const m = output.match(/Budget:\s*\$([0-9.]+)\s*\/\s*\$([0-9.]+)\s*\(sessão:\s*\$([0-9.]+)\)/);
  if (!m) return { taskCost: 0, sessionCost: 0 };
  return { taskCost: parseFloat(m[1]), hardStop: parseFloat(m[2]), sessionCost: parseFloat(m[3]) };
}

function extractStatus(output) {
  if (output.includes('OK:     ✅')) return 'success';
  if (output.includes('OK:     ❌')) return 'failure';
  if (output.includes('ESCALADA AO HUMANO')) return 'escalated';
  if (output.includes('FATAL:')) return 'fatal';
  return 'unknown';
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  // Ler tasks
  if (!fs.existsSync(TASKS_FILE)) {
    console.error(`Tasks file não encontrado: ${TASKS_FILE}`);
    process.exit(1);
  }

  const tasks = fs.readFileSync(TASKS_FILE, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  if (tasks.length === 0) {
    console.error('Nenhuma task encontrada.');
    process.exit(1);
  }

  const stopAt = getStopTime();
  const stopAtStr = new Date(stopAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  console.log(c('bold', '\n┌─────────────────────────────────────────────────────────┐'));
  console.log(c('bold', '│         KAIROS HYPERDRIVE — OVERNIGHT RUNNER              │'));
  console.log(c('bold', '└─────────────────────────────────────────────────────────┘'));
  console.log(`  Tasks:     ${c('cyan', tasks.length.toString())}`);
  console.log(`  Mode:      ${DRY_RUN ? c('yellow', 'DRY-RUN') : c('red', 'LIVE 🔴')}`);
  console.log(`  Stop at:   ${c('yellow', `08:00 amanhã (${stopAtStr})`)}`);
  console.log(`  Results:   ${RESULTS_FILE}`);
  console.log('');

  let totalCost    = 0;
  let passed       = 0;
  let failed       = 0;
  let skipped      = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task    = tasks[i];
    const taskNum = i + 1;

    // Verificar hora de paragem
    if (isStopping(stopAt)) {
      console.log(c('yellow', `\n⏰ 08:00 atingido. Parando após ${taskNum - 1} tasks.`));
      skipped = tasks.length - i;
      break;
    }

    const bar     = `[${'█'.repeat(Math.round((i / tasks.length) * 20))}${'░'.repeat(20 - Math.round((i / tasks.length) * 20))}]`;
    const prefix  = `${c('bold', `[${taskNum}/${tasks.length}]`)} ${c('dim', bar)}`;

    console.log(`\n${prefix}`);
    console.log(`  ${c('cyan', '▶')} ${task.slice(0, 80)}${task.length > 80 ? '…' : ''}`);

    const taskStart = Date.now();

    const record = {
      task_num:   taskNum,
      task,
      started_at: new Date().toISOString(),
      dry_run:    DRY_RUN,
    };

    if (DRY_RUN) {
      console.log(`  ${c('yellow', '○')} DRY-RUN — skipped`);
      record.status   = 'dry_run';
      record.duration_ms = 0;
      record.cost_usd    = 0;
      appendResult(record);
      skipped++;
      continue;
    }

    try {
      const result = spawnSync('npm', ['run', 'kairos:hyperdrive', '--', '--task', task, '--live'], {
        cwd:      ROOT,
        encoding: 'utf8',
        timeout:  20 * 60 * 1000, // 20min por task
        env:      { ...process.env },
      });

      const output   = (result.stdout || '') + (result.stderr || '');
      const duration = Date.now() - taskStart;
      const budget   = extractBudget(output);
      const status   = result.status === 0 ? extractStatus(output) : 'error';

      totalCost += budget.taskCost || 0;

      record.status      = status;
      record.duration_ms = duration;
      record.cost_usd    = budget.taskCost || 0;
      record.session_cost= budget.sessionCost || 0;
      record.exit_code   = result.status;
      record.output_tail = output.slice(-500); // últimas 500 chars

      if (status === 'success') {
        passed++;
        console.log(`  ${c('green', '✅')} ${c('green', status.toUpperCase())} — ${elapsed(duration)} — $${budget.taskCost.toFixed(4)} — total: $${totalCost.toFixed(4)}`);
      } else {
        failed++;
        console.log(`  ${c('red', '❌')} ${c('red', status.toUpperCase())} — ${elapsed(duration)} — $${budget.taskCost.toFixed(4)}`);
        if (result.stderr) {
          console.log(`  ${c('dim', result.stderr.slice(0, 200))}`);
        }
      }

    } catch (err) {
      const duration = Date.now() - taskStart;
      record.status      = 'exception';
      record.error       = err.message;
      record.duration_ms = duration;
      record.cost_usd    = 0;
      failed++;
      console.log(`  ${c('red', '💥')} EXCEPTION: ${err.message.slice(0, 100)}`);
    }

    appendResult(record);

    // Progress summary a cada 5 tasks
    if (taskNum % 5 === 0) {
      const elapsedTotal = elapsed(Date.now() - START_TIME);
      console.log(c('dim', `\n  ── Progresso: ${taskNum}/${tasks.length} | ✅ ${passed} | ❌ ${failed} | $${totalCost.toFixed(4)} | ${elapsedTotal} ──`));
    }
  }

  // Relatório final
  const totalTime = elapsed(Date.now() - START_TIME);
  console.log(c('bold', '\n┌─────────────────────────────────────────────────────────┐'));
  console.log(c('bold', '│                  OVERNIGHT COMPLETO                      │'));
  console.log(c('bold', '└─────────────────────────────────────────────────────────┘'));
  console.log(`  ${c('green', '✅ Sucesso:')}    ${passed}`);
  console.log(`  ${c('red',   '❌ Falhou:')}     ${failed}`);
  console.log(`  ${c('yellow','○  Skipped:')}    ${skipped}`);
  console.log(`  ${c('cyan',  '💰 Custo:')}      $${totalCost.toFixed(4)}`);
  console.log(`  ${c('cyan',  '⏱  Tempo:')}      ${totalTime}`);
  console.log(`  ${c('dim',   '📄 Resultados:')} ${RESULTS_FILE}`);
  console.log('');

  appendResult({
    type: 'summary',
    completed_at: new Date().toISOString(),
    total_tasks: tasks.length,
    passed,
    failed,
    skipped,
    total_cost_usd: totalCost,
    duration_ms: Date.now() - START_TIME,
  });

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(2);
});
