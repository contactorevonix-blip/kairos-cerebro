#!/usr/bin/env node
// KAIROS Pipeline — transforma sinais de mercado em leads accionáveis
// Lê market_intel.jsonl → gera leads estruturados → alimenta responder.js
// Usage: node bin/kairos.js pipeline [--dry-run] [--auto]
'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT   = path.join(__dirname, '..');
const DB_DIR = process.env.KAIROS_DB_DIR || path.join(ROOT, '.kairos-data');
const DRY    = process.argv.includes('--dry-run');
const AUTO   = process.argv.includes('--auto'); // passa directamente ao responder

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', red: '\x1b[31m',
};

// ── leitura ───────────────────────────────────────────────────────────────────
function readJsonl(name) {
  const f = path.join(DB_DIR, name);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function appendJsonl(name, obj) {
  fs.appendFileSync(path.join(DB_DIR, name), JSON.stringify(obj) + '\n');
}

// ── transformar sinal de mercado em lead ─────────────────────────────────────
function signalToLead(intel) {
  if (intel.type === 'competitor_gap' && intel.target === 'seon.io') {
    return {
      type: 'twitter_complaint',
      platform: 'Twitter/X ou Reddit',
      competitor: 'SEON',
      complaint: intel.data?.complaint_1 || 'pricing duplicado sem aviso',
      problem: 'fraud API pricing instável',
      quote: intel.data?.complaint_1,
      url: 'https://twitter.com/search?q=seon+pricing',
      source: 'market_intel',
      signal_ts: intel.ts,
      score: 85,
    };
  }

  if (intel.type === 'market_signal' && intel.topic === 'indie_dev_pain') {
    return {
      type: 'reddit_complaint',
      platform: 'Reddit r/SaaS ou r/IndieHackers',
      problem: 'fraud detection APIs too expensive for indie projects',
      quote: 'Enterprise pricing excludes small European startups',
      url: 'https://reddit.com/r/SaaS/search?q=fraud+api+expensive',
      source: 'market_intel',
      signal_ts: intel.ts,
      score: 90,
    };
  }

  if (intel.type === 'market_size') {
    return {
      type: 'hn_thread',
      platform: 'Hacker News',
      topic: 'GDPR compliance in fraud detection APIs',
      context: `mercado a crescer ${intel.data?.cagr_pct}%/ano com enforcement crescente`,
      url: 'https://news.ycombinator.com/item?id=search&q=fraud+gdpr',
      source: 'market_intel',
      signal_ts: intel.ts,
      score: 70,
    };
  }

  return null;
}

// ── verificar leads já processados ───────────────────────────────────────────
function loadProcessed() {
  const f = path.join(DB_DIR, 'leads_processed.jsonl');
  if (!fs.existsSync(f)) return new Set();
  return new Set(
    fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l).signal_ts; } catch { return null; } })
      .filter(Boolean)
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
const intel     = readJsonl('market_intel.jsonl');
const processed = loadProcessed();
const pending   = [];

for (const signal of intel) {
  if (processed.has(signal.ts)) continue;
  const lead = signalToLead(signal);
  if (lead) pending.push(lead);
}

console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
console.log(`${c.bold}${c.cyan}║      KAIROS Pipeline — Lead Factory      ║${c.reset}`);
console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════╝${c.reset}\n`);

console.log(`  Sinais lidos:      ${c.bold}${intel.length}${c.reset}`);
console.log(`  Já processados:    ${c.dim}${processed.size}${c.reset}`);
console.log(`  Leads pendentes:   ${pending.length > 0 ? c.green + c.bold : c.dim}${pending.length}${c.reset}\n`);

if (pending.length === 0) {
  console.log(`  ${c.dim}Nenhum lead novo. Corre 'node bin/kairos.js radar' para gerar novos sinais.${c.reset}\n`);
  process.exit(0);
}

if (DRY) {
  console.log(`${c.bold}  [DRY RUN] Leads que seriam gerados:${c.reset}\n`);
  pending.forEach((l, i) => {
    console.log(`  ${i + 1}. [${l.type}] Score: ${c.bold}${l.score}${c.reset} — ${l.platform}`);
    console.log(`     ${c.dim}${l.quote?.slice(0, 80) || l.problem}${c.reset}\n`);
  });
  process.exit(0);
}

// Salvar leads em ficheiro para o responder processar
const leadsFile = path.join(DB_DIR, 'leads_pending.json');
fs.writeFileSync(leadsFile, JSON.stringify(pending, null, 2));

// Marcar sinais como processados
pending.forEach(l => appendJsonl('leads_processed.jsonl', { signal_ts: l.signal_ts, processed_at: new Date().toISOString() }));

// Publicar no Event Bus
try {
  const bus = require('../lib/event-bus');
  bus.publish('pipeline:leads_ready', { count: pending.length, file: leadsFile });
} catch {}

console.log(`${c.green}${c.bold}  ✓ ${pending.length} lead(s) prontos em leads_pending.json${c.reset}\n`);

pending.forEach((l, i) => {
  const score_color = l.score >= 85 ? c.green : c.yellow;
  console.log(`  ${i + 1}. ${score_color}[Score ${l.score}]${c.reset} ${l.type} — ${l.platform}`);
  console.log(`     ${c.dim}${l.quote?.slice(0, 90) || l.problem}${c.reset}`);
});

if (AUTO) {
  console.log(`\n${c.bold}  A passar para o responder...${c.reset}\n`);
  spawnSync(process.execPath, [path.join(ROOT, 'bin', 'responder.js'), '--file', leadsFile], {
    stdio: 'inherit', cwd: ROOT,
  });
} else {
  console.log(`\n  ${c.bold}Próximo passo:${c.reset} ${c.dim}node bin/kairos.js respond --file .kairos-data/leads_pending.json${c.reset}\n`);
}
