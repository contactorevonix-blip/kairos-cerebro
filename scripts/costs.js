#!/usr/bin/env node
'use strict';

/**
 * KAIROS — Cost Analyser
 * Analisa custos no ledger e projecta mensal.
 * Usage: npm run kairos:costs
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT   = path.resolve(__dirname, '..');
const LEDGER = process.env.KAIROS_LEDGER_PATH || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', dim:'\x1b[2m', cyan:'\x1b[36m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function fmt(n) { return '$' + (n || 0).toFixed(4); }

function main() {
  console.log(c('bold', '\n💰 KAIROS — Análise de Custos\n'));

  if (!fs.existsSync(LEDGER)) {
    console.log(c('yellow', '  Ledger não existe — sem dados de custo.'));
    return;
  }

  const events = fs.readFileSync(LEDGER, 'utf8').trim().split('\n')
    .filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

  const costEvents = events.filter(e => (e.payload?.costUsd || 0) > 0);

  if (costEvents.length === 0) {
    console.log(c('yellow', '  Nenhum evento com custo encontrado.'));
    return;
  }

  // ─── TOTAIS ──────────────────────────────────────────────────────────────
  const totalCost = costEvents.reduce((s, e) => s + (e.payload.costUsd || 0), 0);
  const maxCost   = Math.max(...costEvents.map(e => e.payload.costUsd || 0));
  const minCost   = Math.min(...costEvents.map(e => e.payload.costUsd || 0));
  const avgCost   = totalCost / costEvents.length;

  // ─── POR AGENTE ──────────────────────────────────────────────────────────
  const byAgent = {};
  for (const ev of costEvents) {
    const a = ev.actor || ev.payload?.agent || 'unknown';
    if (!byAgent[a]) byAgent[a] = { count: 0, total: 0 };
    byAgent[a].count++;
    byAgent[a].total += ev.payload.costUsd || 0;
  }

  // ─── POR DOMÍNIO ─────────────────────────────────────────────────────────
  const byDomain = {};
  for (const ev of costEvents) {
    const d = ev.payload?.domain || 'unknown';
    if (!byDomain[d]) byDomain[d] = { count: 0, total: 0 };
    byDomain[d].count++;
    byDomain[d].total += ev.payload.costUsd || 0;
  }

  // ─── PROJECÇÃO MENSAL ─────────────────────────────────────────────────────
  const firstTs = new Date(costEvents[0].timestamp).getTime();
  const lastTs  = new Date(costEvents[costEvents.length - 1].timestamp).getTime();
  const daySpan = Math.max(1, (lastTs - firstTs) / (1000 * 60 * 60 * 24));
  const dailyAvg   = totalCost / daySpan;
  const monthlyProj = dailyAvg * 30;

  // ─── TASK MAIS CARA E MAIS BARATA ────────────────────────────────────────
  const mostExpensive = costEvents.reduce((max, e) => (e.payload.costUsd || 0) > (max.payload.costUsd || 0) ? e : max);
  const cheapest      = costEvents.reduce((min, e) => (e.payload.costUsd || 0) < (min.payload.costUsd || 0) ? e : min);

  // ─── DISPLAY ─────────────────────────────────────────────────────────────
  console.log(`  ${c('bold', 'Resumo global:')}`);
  console.log(`    Total:      ${c('cyan', fmt(totalCost))}  (${costEvents.length} tasks com custo)`);
  console.log(`    Média:      ${c('cyan', fmt(avgCost))} / task`);
  console.log(`    Máximo:     ${c('red', fmt(maxCost))}`);
  console.log(`    Mínimo:     ${c('green', fmt(minCost))}`);

  console.log(`\n  ${c('bold', 'Por agente (top 5):')}`)
  const topAgents = Object.entries(byAgent).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  for (const [a, v] of topAgents) {
    const avg = v.total / v.count;
    console.log(`    ${a.padEnd(14)} ${fmt(v.total).padEnd(12)} ${v.count}x  avg ${fmt(avg)}`);
  }

  console.log(`\n  ${c('bold', 'Por domínio (top 5):')}`)
  const topDomains = Object.entries(byDomain).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  for (const [d, v] of topDomains) {
    const avg = v.total / v.count;
    console.log(`    ${d.padEnd(14)} ${fmt(v.total).padEnd(12)} ${v.count}x  avg ${fmt(avg)}`);
  }

  console.log(`\n  ${c('bold', 'Tasks notáveis:')}`);
  console.log(`    Mais cara:  ${fmt(maxCost)} — ${(mostExpensive.payload?.task || 'n/a').slice(0, 60)}`);
  console.log(`    Mais barata:${fmt(minCost)} — ${(cheapest.payload?.task || 'n/a').slice(0, 60)}`);

  const projColor = monthlyProj > 50 ? 'red' : monthlyProj > 20 ? 'yellow' : 'green';
  console.log(`\n  ${c('bold', 'Projecção:')}`)
  console.log(`    Média diária:   ${fmt(dailyAvg)}`);
  console.log(`    Projecção 30d:  ${c(projColor, fmt(monthlyProj))}`);
  console.log(`    (baseado em ${daySpan.toFixed(1)} dias de histórico)\n`);
}

main();
