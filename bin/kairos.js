#!/usr/bin/env node
// KAIROS CLI — ponto de entrada único
// Usage: node bin/kairos.js <comando>

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BIN  = __dirname;

require('dotenv').config({ path: path.join(ROOT, '.env') });

const c = {
  bold: '\x1b[1m', reset: '\x1b[0m',
  cyan: '\x1b[36m', green: '\x1b[32m', dim: '\x1b[2m', yellow: '\x1b[33m',
};

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit', cwd: ROOT,
  });
  process.exit(result.status ?? 0);
}

function help() {
  console.log(`
${c.bold}${c.cyan}╔══════════════════════════════════════════╗${c.reset}
${c.bold}${c.cyan}║           KAIROS CLI                     ║${c.reset}
${c.bold}${c.cyan}╚══════════════════════════════════════════╝${c.reset}

${c.bold}PRODUTO${c.reset}
  ${c.green}start${c.reset}           Iniciar API server (porta 3000)
  ${c.green}stats${c.reset}           Dashboard — MRR, planos, verificações
  ${c.green}stats --json${c.reset}    Output JSON (para scripts/cron)

${c.bold}LEADS & DISTRIBUIÇÃO${c.reset}
  ${c.green}respond${c.reset}         Aprovar resposta a lead no terminal
  ${c.green}respond --file <f>${c.reset}  Processar ficheiro de leads

${c.bold}SISTEMA${c.reset}
  ${c.green}supervisor${c.reset}      Diagnóstico de logs — anomalias + causa raiz
  ${c.green}supervisor --watch${c.reset}  Modo contínuo (verifica cada 60s)
  ${c.green}radar${c.reset}           Market intel — tendências + gaps de competidores
  ${c.green}pipeline${c.reset}        Transforma sinais de mercado em leads accionáveis
  ${c.green}pipeline --auto${c.reset} Pipeline → responder (aprovação imediata)
  ${c.green}health${c.reset}          Health check rápido (API + dados)
  ${c.green}help${c.reset}            Este menu

${c.bold}EXEMPLOS${c.reset}
  ${c.dim}node bin/kairos.js start${c.reset}
  ${c.dim}node bin/kairos.js stats${c.reset}
  ${c.dim}node bin/kairos.js respond${c.reset}
`);
}

function health() {
  const fs = require('fs');
  const dbDir = process.env.KAIROS_DB_DIR || path.join(ROOT, '.kairos-data');
  const checks = [
    { name: 'DB dir',       ok: fs.existsSync(dbDir) },
    { name: 'tenants.json', ok: fs.existsSync(path.join(dbDir, 'tenants.json')) },
    { name: 'api_keys.json',ok: fs.existsSync(path.join(dbDir, 'api_keys.json')) },
    { name: 'STRIPE_KEY',   ok: !!process.env.STRIPE_SECRET_KEY },
    { name: 'RESEND_KEY',   ok: !!process.env.RESEND_API_KEY },
  ];

  console.log(`\n${c.bold}KAIROS Health Check${c.reset}\n`);
  let allOk = true;
  for (const { name, ok } of checks) {
    console.log(`  ${ok ? c.green + '✓' : '\x1b[31m✗'} ${name}${c.reset}`);
    if (!ok) allOk = false;
  }
  console.log(allOk ? `\n${c.green}${c.bold}Tudo OK.${c.reset}\n` : `\n${c.yellow}Alguns itens em falta — ver acima.${c.reset}\n`);
  process.exit(allOk ? 0 : 1);
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case 'start':
  case 'server':
    run(path.join(ROOT, 'packages', 'sniper-api', 'server.js'), rest);
    break;

  case 'stats':
    run(path.join(BIN, 'stats.js'), rest);
    break;

  case 'respond':
    run(path.join(BIN, 'responder.js'), rest);
    break;

  case 'supervisor':
  case 'monitor':
    run(path.join(BIN, 'supervisor.js'), rest);
    break;

  case 'radar':
    run(path.join(BIN, 'radar.js'), rest);
    break;

  case 'pipeline':
    run(path.join(BIN, 'pipeline.js'), rest);
    break;

  case 'health':
    health();
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    help();
    break;

  default:
    console.error(`\n  Comando desconhecido: "${cmd}"\n  Usa: node bin/kairos.js help\n`);
    process.exit(1);
}
