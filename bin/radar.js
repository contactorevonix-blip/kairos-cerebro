#!/usr/bin/env node
// KAIROS Radar — oportunidades de mercado com dados reais
// Cruza: trends + competitor gaps + signals de crescimento
// Usage: node bin/radar.js [--json] [--topic "fraud detection"]
//
// Output: "Pedro, oportunidade X está a crescer 40%/mês. Concorrente Y falha em Z."
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const AIOX = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'helpers', 'aiox.cjs');
const TOPIC = (() => {
  const i = process.argv.indexOf('--topic');
  return i !== -1 ? process.argv[i + 1] : 'fraud detection API europe';
})();
const JSON_MODE = process.argv.includes('--json');

const COMPETITORS = ['seon.io', 'sumsub.com', 'sardine.ai', 'emailrep.io'];

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m',
};

function runAiox(args) {
  if (!require('fs').existsSync(AIOX)) {
    return { error: 'aiox.cjs não encontrado — verificar C:\\Users\\lealp\\.claude\\helpers\\' };
  }
  const result = spawnSync(process.execPath, [AIOX, ...args], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 30_000,
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
console.log(`${c.bold}${c.cyan}║       KAIROS Radar — Market Intel        ║${c.reset}`);
console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════╝${c.reset}\n`);
console.log(`${c.dim}  Tópico: ${TOPIC}${c.reset}`);
console.log(`${c.dim}  Competidores: ${COMPETITORS.join(', ')}${c.reset}\n`);

// Scout — tendências de mercado
console.log(`${c.bold}  1/2 — A analisar tendências de mercado...${c.reset}`);
const scout = runAiox(['scout', '--topic', TOPIC, '--adapt']);
if (scout.stdout) {
  console.log('\n' + scout.stdout.trim().split('\n').slice(0, 20).join('\n'));
} else {
  console.log(`${c.dim}  → Executar manualmente: node .claude/helpers/aiox.cjs scout --topic "${TOPIC}" --adapt${c.reset}`);
}

// Intel — gaps dos competidores (amostra com o primeiro)
console.log(`\n${c.bold}  2/2 — A analisar gap do competidor principal (${COMPETITORS[0]})...${c.reset}`);
const intel = runAiox(['intel', '--target', COMPETITORS[0], '--mode', 'features']);
if (intel.stdout) {
  console.log('\n' + intel.stdout.trim().split('\n').slice(0, 15).join('\n'));
} else {
  console.log(`${c.dim}  → Executar manualmente: node .claude/helpers/aiox.cjs intel --target ${COMPETITORS[0]} --mode features${c.reset}`);
}

console.log(`\n${c.bold}${c.green}  Próximo passo:${c.reset}`);
console.log(`  Para análise completa de todos os competidores:`);
COMPETITORS.forEach(c_ => {
  console.log(`  ${c.dim}node .claude/helpers/aiox.cjs intel --target ${c_} --mode features${c.reset}`);
});
console.log(`\n  Para agendar relatório semanal automático:`);
console.log(`  ${c.dim}→ Adicionar ao cron Railway ou usar /schedule no Claude Code${c.reset}\n`);
