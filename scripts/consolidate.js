#!/usr/bin/env node
'use strict';

/**
 * KAIROS — Consolidate
 * Lê ledger, extrai padrões, actualiza knowledge-graph.json.
 * Usage: npm run kairos:consolidate
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT    = path.resolve(__dirname, '..');
const LEDGER  = process.env.KAIROS_LEDGER_PATH || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
const KG_PATH = path.join(ROOT, '.claude', 'memory', 'knowledge-graph.json');

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m', red:'\x1b[31m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function loadLedger() {
  if (!fs.existsSync(LEDGER)) return [];
  return fs.readFileSync(LEDGER, 'utf8').trim().split('\n')
    .filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

function loadKG() {
  try { return JSON.parse(fs.readFileSync(KG_PATH, 'utf8')); }
  catch { return { milestones: {}, patterns: {}, agents: {}, domains: {} }; }
}

function main() {
  console.log(c('bold', '\n🧠 KAIROS — Consolidação de Conhecimento\n'));

  const events = loadLedger();
  if (events.length === 0) {
    console.log(c('yellow', '  Ledger vazio — nada para consolidar.'));
    return;
  }

  console.log(`  ${c('cyan', events.length + ' eventos')} encontrados no ledger`);

  // ─── ANÁLISE POR AGENTE ──────────────────────────────────────────────────
  const agentStats = {};

  for (const ev of events) {
    // actor é normalmente 'orchestrator' — o agente real está em payload.agent
    const agent = ev.payload?.agent || (ev.actor !== 'orchestrator' ? ev.actor : null);
    if (!agent) continue;

    if (!agentStats[agent]) {
      agentStats[agent] = { tasks: 0, successes: 0, failures: 0, domains: {}, totalCost: 0 };
    }
    const s = agentStats[agent];

    if (ev.type === 'TaskCompleted') {
      s.tasks++;
      s.successes++;
      const domain = ev.payload?.domain || 'unknown';
      s.domains[domain] = (s.domains[domain] || 0) + 1;
      s.totalCost += ev.payload?.costUsd || 0;
    }
    if (ev.type === 'TaskFailed') {
      s.tasks++;
      s.failures++;
    }
  }

  // ─── ANÁLISE POR DOMÍNIO ─────────────────────────────────────────────────
  const domainStats = {};
  const completed = events.filter(e => e.type === 'TaskCompleted');

  for (const ev of completed) {
    const domain = ev.payload?.domain || 'unknown';
    if (!domainStats[domain]) domainStats[domain] = { count: 0, totalCost: 0, failures: 0 };
    domainStats[domain].count++;
    domainStats[domain].totalCost += ev.payload?.costUsd || 0;
  }

  for (const ev of events.filter(e => e.type === 'TaskFailed')) {
    const domain = ev.payload?.domain || 'unknown';
    if (!domainStats[domain]) domainStats[domain] = { count: 0, totalCost: 0, failures: 0 };
    domainStats[domain].failures++;
  }

  // ─── AGENTES MAIS USADOS ─────────────────────────────────────────────────
  const topAgents = Object.entries(agentStats)
    .sort((a, b) => b[1].tasks - a[1].tasks)
    .slice(0, 5);

  console.log('\n  ' + c('bold', 'Agentes mais activos:'));
  for (const [agent, s] of topAgents) {
    const rate = s.tasks > 0 ? Math.round((s.successes / s.tasks) * 100) : 0;
    const rateColor = rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red';
    console.log(`    ${agent.padEnd(12)} ${c(rateColor, rate + '%')} sucesso  ${s.tasks} tasks  $${s.totalCost.toFixed(4)}`);
  }

  // ─── DOMÍNIOS MAIS FREQUENTES ────────────────────────────────────────────
  const topDomains = Object.entries(domainStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  console.log('\n  ' + c('bold', 'Domínios mais frequentes:'));
  for (const [domain, s] of topDomains) {
    const total    = s.count + s.failures;
    const failRate = total > 0 ? Math.round((s.failures / total) * 100) : 0;
    const failColor = failRate > 20 ? 'red' : failRate > 10 ? 'yellow' : 'green';
    const avgCost  = s.count > 0 ? (s.totalCost / s.count).toFixed(4) : '0.0000';
    console.log(`    ${domain.padEnd(14)} ${s.count} tasks  ${c(failColor, failRate + '% fail')}  avg $${avgCost}`);
  }

  // ─── TASKS COM FALHAS ────────────────────────────────────────────────────
  const failures = events.filter(e => e.type === 'TaskFailed');
  if (failures.length > 0) {
    console.log(`\n  ${c('bold', 'Falhas recentes:')} ${failures.length} total`);
    for (const ev of failures.slice(-3)) {
      const task = ev.payload?.task || '';
      console.log(`    ${c('red', '❌')} ${task.slice(0, 60)}`);
    }
  }

  // ─── ACTUALIZAR KNOWLEDGE GRAPH ──────────────────────────────────────────
  const kg = loadKG();
  kg.patterns = kg.patterns || {};
  kg.agents   = kg.agents   || {};
  kg.domains  = kg.domains  || {};

  kg.patterns.last_consolidated  = new Date().toISOString();
  kg.patterns.total_events       = events.length;
  kg.patterns.total_completed    = completed.length;
  kg.patterns.total_failed       = failures.length;
  kg.patterns.success_rate       = completed.length > 0
    ? Math.round((completed.length / (completed.length + failures.length)) * 100)
    : 0;

  // Calibrar confidence baseado em success rate real
  for (const [agent, s] of Object.entries(agentStats)) {
    const rate = s.tasks >= 3 ? (s.successes / s.tasks) : null;
    kg.agents[agent] = {
      tasks:          s.tasks,
      success_rate:   rate !== null ? Math.round(rate * 100) / 100 : null,
      top_domain:     Object.entries(s.domains).sort((a,b) => b[1]-a[1])[0]?.[0] || null,
      total_cost_usd: Math.round(s.totalCost * 10000) / 10000,
      calibrated_at:  new Date().toISOString(),
    };
  }

  for (const [domain, s] of Object.entries(domainStats)) {
    const total = s.count + s.failures;
    kg.domains[domain] = {
      count:       s.count,
      fail_rate:   total > 0 ? Math.round((s.failures / total) * 100) / 100 : 0,
      avg_cost:    s.count > 0 ? Math.round((s.totalCost / s.count) * 10000) / 10000 : 0,
    };
  }

  fs.mkdirSync(path.dirname(KG_PATH), { recursive: true });
  fs.writeFileSync(KG_PATH, JSON.stringify(kg, null, 2), 'utf8');

  const patternsLearned = Object.keys(kg.agents).length + Object.keys(kg.domains).length;
  const agentsCalib     = Object.values(kg.agents).filter(a => a.success_rate !== null).length;

  console.log(`\n  ${c('green', '✅')} Aprendi ${c('bold', patternsLearned + '')} padrões, ${c('bold', agentsCalib + '')} agentes calibrados`);
  console.log(`  ${c('dim', 'Knowledge graph actualizado: ' + KG_PATH)}\n`);
}

main();
