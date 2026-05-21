#!/usr/bin/env node
'use strict';

/**
 * KAIROS — Pattern Detector
 * Analisa ledger dos últimos 30 dias, detecta padrões, guarda em patterns.json.
 * Usage: npm run kairos:patterns
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT         = path.resolve(__dirname, '..');
const LEDGER       = process.env.KAIROS_LEDGER_PATH || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
const PATTERNS_OUT = path.join(ROOT, '.claude', 'memory', 'patterns.json');
const WINDOW_DAYS  = 30;

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', dim:'\x1b[2m', cyan:'\x1b[36m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function main() {
  console.log(c('bold', '\n🔍 KAIROS — Análise de Padrões\n'));

  if (!fs.existsSync(LEDGER)) {
    console.log(c('yellow', '  Ledger não existe — sem padrões para detectar.'));
    return;
  }

  const allEvents = fs.readFileSync(LEDGER, 'utf8').trim().split('\n')
    .filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

  const since  = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events = allEvents.filter(e => new Date(e.timestamp).getTime() > since);

  console.log(`  Total ledger: ${allEvents.length} eventos | Últimos ${WINDOW_DAYS}d: ${events.length} eventos\n`);

  const patterns = { generated_at: new Date().toISOString(), window_days: WINDOW_DAYS };

  // ─── 1. COMBOS DE AGENTES COM MELHOR PERFORMANCE ────────────────────────
  const combos = {};
  const completed = events.filter(e => e.type === 'TaskCompleted');

  for (const ev of completed) {
    const agent  = ev.actor || ev.payload?.agent || 'unknown';
    const domain = ev.payload?.domain || 'unknown';
    const key    = `${agent}:${domain}`;
    if (!combos[key]) combos[key] = { count: 0, totalCost: 0 };
    combos[key].count++;
    combos[key].totalCost += ev.payload?.costUsd || 0;
  }

  const topCombos = Object.entries(combos)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([key, v]) => ({ combo: key, ...v, avg_cost: v.count > 0 ? v.totalCost / v.count : 0 }));

  console.log(c('bold', '  Top combos agente:domínio:'));
  for (const combo of topCombos) {
    console.log(`    ${c('cyan', combo.combo.padEnd(28))} ${combo.count}x  avg $${combo.avg_cost.toFixed(4)}`);
  }
  patterns.top_combos = topCombos;

  // ─── 2. DOMÍNIOS COM TAXA DE FALHA >20% ─────────────────────────────────
  const domainFails = {};
  for (const ev of events) {
    const d = ev.payload?.domain || 'unknown';
    if (!domainFails[d]) domainFails[d] = { ok: 0, fail: 0 };
    if (ev.type === 'TaskCompleted') domainFails[d].ok++;
    if (ev.type === 'TaskFailed')    domainFails[d].fail++;
  }

  const highFailDomains = Object.entries(domainFails)
    .map(([d, v]) => ({ domain: d, ...v, rate: v.ok + v.fail > 0 ? v.fail / (v.ok + v.fail) : 0 }))
    .filter(d => d.rate > 0.2 && d.ok + d.fail >= 3)
    .sort((a, b) => b.rate - a.rate);

  if (highFailDomains.length > 0) {
    console.log(c('bold', '\n  Domínios com alta taxa de falha (>20%):'));
    for (const d of highFailDomains) {
      console.log(`    ${c('red', d.domain.padEnd(16))} ${Math.round(d.rate * 100)}% fail (${d.fail}/${d.ok + d.fail})`);
    }
  } else {
    console.log(c('dim', '\n  Nenhum domínio com taxa de falha >20% nos últimos 30 dias. ✅'));
  }
  patterns.high_fail_domains = highFailDomains;

  // ─── 3. TASKS QUE DEMORAM MAIS QUE O ESTIMADO ────────────────────────────
  // (baseado em tasks que custaram >2x a média)
  const costs = completed.map(e => e.payload?.costUsd || 0).filter(c => c > 0);
  const avgCost = costs.length > 0 ? costs.reduce((s, c) => s + c, 0) / costs.length : 0;
  const expensiveTasks = completed
    .filter(e => (e.payload?.costUsd || 0) > avgCost * 2)
    .map(e => ({ task: (e.payload?.task || '').slice(0, 60), cost: e.payload?.costUsd || 0, domain: e.payload?.domain }))
    .slice(0, 5);

  if (expensiveTasks.length > 0) {
    console.log(c('bold', '\n  Tasks mais caras (>2x média):'));
    for (const t of expensiveTasks) {
      console.log(`    $${t.cost.toFixed(4)} ${c('dim', t.domain?.padEnd(12) || '')} ${t.task}`);
    }
  }
  patterns.expensive_tasks   = expensiveTasks;
  patterns.avg_cost_per_task = Math.round(avgCost * 10000) / 10000;

  // ─── 4. PADRÕES DE CUSTO POR HORA DO DIA ─────────────────────────────────
  const byHour = Array(24).fill(0).map(() => ({ count: 0, totalCost: 0 }));
  for (const ev of completed) {
    const h = new Date(ev.timestamp).getHours();
    byHour[h].count++;
    byHour[h].totalCost += ev.payload?.costUsd || 0;
  }
  const peakHour = byHour.reduce((best, h, i) => h.count > byHour[best].count ? i : best, 0);
  patterns.peak_hour = peakHour;
  patterns.total_cost_window = costs.reduce((s, c) => s + c, 0);

  // ─── GUARDAR ──────────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(PATTERNS_OUT), { recursive: true });
  fs.writeFileSync(PATTERNS_OUT, JSON.stringify(patterns, null, 2), 'utf8');

  console.log(`\n  ${c('green', '✅')} ${Object.keys(patterns).length - 2} categorias de padrões detectadas`);
  console.log(`  ${c('dim', 'Hora de pico: ' + peakHour + 'h | Custo médio/task: $' + avgCost.toFixed(4))}`);
  console.log(`  ${c('dim', 'Guardado em: ' + PATTERNS_OUT)}\n`);
}

main();
