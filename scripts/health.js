#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — Health Check
 * Verifica todos os componentes em <30s.
 * Usage: npm run kairos:health
 */

const fs     = require('node:fs');
const path   = require('node:path');
const http   = require('node:http');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m' };
  return `${m[code]||''}${t}${m.reset}`;
}

const checks = [];
let allOk = true;

function pass(name, detail = '') {
  checks.push({ name, ok: true, detail });
  console.log(`  ${c('green', '✅')} ${name.padEnd(42)} ${c('dim', detail)}`);
}

function fail(name, detail = '', fix = '') {
  allOk = false;
  checks.push({ name, ok: false, detail, fix });
  console.log(`  ${c('red', '❌')} ${name.padEnd(42)} ${c('red', detail)}`);
  if (fix) console.log(`     ${c('yellow', '→')} ${c('dim', fix)}`);
}

function warn(name, detail = '') {
  checks.push({ name, ok: 'warn', detail });
  console.log(`  ${c('yellow', '⚠️ ')} ${name.padEnd(42)} ${c('yellow', detail)}`);
}

function httpGet(url, timeoutMs = 3000) {
  return new Promise(resolve => {
    const req = http.get(url, { timeout: timeoutMs }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }); }
        catch { resolve({ ok: res.statusCode < 400, status: res.statusCode }); }
      });
    });
    req.on('error', () => resolve({ ok: false, error: 'connection refused' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
  });
}

async function main() {
  console.log(c('bold', '\n┌────────────────────────────────────────────────┐'));
  console.log(c('bold', '│        KAIROS HYPERDRIVE — HEALTH CHECK         │'));
  console.log(c('bold', '└────────────────────────────────────────────────┘\n'));

  const start = Date.now();

  // 1. Ledger
  const ledgerPath = process.env.KAIROS_LEDGER_PATH
    || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
  if (fs.existsSync(ledgerPath)) {
    const lines = fs.readFileSync(ledgerPath, 'utf8').trim().split('\n').filter(Boolean);
    pass('Ledger existe', `${lines.length} eventos`);
  } else {
    warn('Ledger não existe', 'será criado na primeira task');
  }

  // 2. Knowledge graph
  const kgPath = path.join(ROOT, '.claude', 'memory', 'knowledge-graph.json');
  if (fs.existsSync(kgPath)) {
    pass('Knowledge graph existe', kgPath.split('/').pop());
  } else {
    warn('Knowledge graph não existe', 'será criado na primeira task');
  }

  // 3. Agent files (11 esperados)
  const agentsDir = path.join(ROOT, '.claude', 'agents');
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    agents.length >= 11
      ? pass('Agent files carregados', `${agents.length} agentes`)
      : warn('Agent files incompletos', `${agents.length}/11 encontrados`);
  } else {
    fail('Pasta .claude/agents/ não existe', '', 'Criar .claude/agents/ com os 11 ficheiros de agente');
  }

  // 4. HyperDrive index
  try {
    const { KairosHyperdrive } = require(path.join(ROOT, 'packages/hyperdrive/src/index.js'));
    const hd = new KairosHyperdrive();
    pass('KairosHyperdrive carrega', `${hd.agents?.length} agentes, ${hd.ledger?.length} eventos`);
  } catch (err) {
    fail('KairosHyperdrive falhou ao carregar', err.message.slice(0, 60), 'node packages/hyperdrive/src/cli.js --help');
  }

  // 5. Check-engine HTTP
  const ceRes = await httpGet('http://localhost:4000/health');
  ceRes.ok
    ? pass('check-engine :4000/health', `${ceRes.status} ${ceRes.body?.ok ? 'ok' : ''}`)
    : warn('check-engine não responde em :4000', 'node packages/check-engine/src/index.js para arrancar');

  // 6. Web dev server
  const webRes = await httpGet('http://localhost:3000/');
  webRes.ok
    ? pass('Web :3000/', `${webRes.status}`)
    : warn('Web dev server não responde em :3000', 'npm run kairos:web:dev para arrancar');

  // 7. Env vars críticas
  const required = ['KAIROS_ANTHROPIC_API_KEY'];
  const missing  = required.filter(k => !process.env[k]);
  missing.length === 0
    ? pass('Env vars críticas', required.join(', '))
    : fail('Env vars em falta', missing.join(', '), `Adicionar a .env: ${missing[0]}=sk-ant-...`);

  // 8. Budget
  try {
    const { getBudgetStatus } = require(path.join(ROOT, 'packages/hyperdrive/src/providers/anthropic.js'));
    const b = getBudgetStatus();
    b.exceeded
      ? fail('Budget excedido', `$${b.taskCostUsd} / $${b.hardStop}`, 'Aguardar reset ou aumentar KAIROS_TASK_HARD_STOP_USD')
      : pass('Budget OK', `$${b.taskCostUsd.toFixed(4)} / $${b.hardStop}`);
  } catch { warn('Budget não verificável', 'provider não carregou'); }

  // 9. Models configurados
  const models = {
    KAIROS_MODEL_SENIOR:   process.env.KAIROS_MODEL_SENIOR   || 'claude-opus-4-7 (default)',
    KAIROS_MODEL_EXECUTOR: process.env.KAIROS_MODEL_EXECUTOR || 'claude-sonnet-4-6 (default)',
    KAIROS_MODEL_UTILITY:  process.env.KAIROS_MODEL_UTILITY  || 'claude-haiku-4-5-20251001 (default)',
  };
  pass('Modelos configurados', Object.values(models).map(m => m.split('-').slice(-1)[0]).join(' / '));

  // 10. npm test rápido (só contar, não correr)
  const testFiles = [
    path.join(ROOT, 'tests'),
    path.join(ROOT, 'packages/sniper-api'),
  ];
  const testCount = testFiles.reduce((n, dir) => {
    try { return n + fs.readdirSync(dir).filter(f => f.endsWith('.test.js')).length; } catch { return n; }
  }, 0);
  pass('Test files encontrados', `${testCount} ficheiros .test.js`);

  // Sumário
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const ok  = checks.filter(c => c.ok === true).length;
  const bad = checks.filter(c => c.ok === false).length;
  const wrn = checks.filter(c => c.ok === 'warn').length;

  console.log('');
  console.log(c('bold', '─────────────────────────────────────────────────'));
  console.log(`  ${c('green', `✅ ${ok} OK`)}  ${c('red', `❌ ${bad} FAIL`)}  ${c('yellow', `⚠️  ${wrn} WARN`)}  ${c('dim', `(${elapsed}s)`)}`);

  if (!allOk) {
    console.log(`\n  ${c('red', 'Sistema não está 100% saudável.')} Corrigir itens acima.\n`);
    process.exit(1);
  } else {
    console.log(`\n  ${c('green', '✅ Sistema saudável.')}\n`);
  }
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(2); });
