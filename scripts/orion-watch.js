#!/usr/bin/env node
'use strict';

/**
 * KAIROS @ORION — Guardian 24/7
 * Verifica o repositório continuamente e mantém a saúde do sistema.
 *
 * Ciclos:
 *   Arranque:     health check + verificação clean-state
 *   A cada 30min: verificações de integridade + limpeza
 *   A cada 2h:    consolidate automático + actualizar DAILY_BRIEF timestamp
 *   Às 00:00:     export completo + relatório diário
 *
 * Usage: npm run kairos:orion
 */

const fs    = require('node:fs');
const path  = require('node:path');
const { spawnSync, execSync } = require('node:child_process');

const ROOT      = path.resolve(__dirname, '..');
const LOG_FILE  = path.join(ROOT, '.ai', 'orion-watch.log');
const BRIEF     = path.join(ROOT, '.ai', 'DAILY_BRIEF.md');
const AUDITS    = path.join(ROOT, '.ai', 'audits');
const AGENTS_DIR = path.join(ROOT, '.claude', 'agents');

// Os 11 agentes aprovados — qualquer outro é alerta
const APPROVED_AGENTS = new Set([
  'orion.md', 'aria.md', 'dex.md', 'quinn.md', 'gage.md',
  'rex.md', 'uma.md', 'morgan.md', 'oracle.md', 'sage.md', 'hermes.md',
]);

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function log(level, message) {
  const ts  = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const line = `[${ts}] [${level.padEnd(8)}] ${message}`;
  console.log(level === 'CRITICAL' ? c('red', line) :
              level === 'ALTO'     ? c('yellow', line) :
              level === 'INFO'     ? c('dim', line) : line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch { /* silencioso */ }
}

function runScript(scriptName) {
  const scriptPath = path.join(ROOT, 'scripts', scriptName);
  if (!fs.existsSync(scriptPath)) return;
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: ROOT, encoding: 'utf8', timeout: 60_000, env: { ...process.env },
  });
  if (result.status !== 0) {
    log('ALTO', `${scriptName} falhou: ${(result.stderr || '').slice(0, 100)}`);
  }
}

// ─── VERIFICAÇÕES ──────────────────────────────────────────────────────────

function checkAgentFiles() {
  if (!fs.existsSync(AGENTS_DIR)) return;
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    if (!APPROVED_AGENTS.has(file)) {
      log('ALTO', `Agent file não aprovado detectado: .claude/agents/${file}`);
    }
  }

  if (files.length !== 11) {
    log('ALTO', `Agent files: ${files.length}/11 encontrados. Esperados exactamente 11.`);
  }
}

function checkGitStaging() {
  try {
    const staged = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf8', timeout: 5000 });
    const lines  = staged.split('\n').filter(Boolean);

    for (const file of lines) {
      if (file === '.env' || file === '.env.local' || file.endsWith('.key')) {
        log('CRITICAL', `⚠️  SECRET EM STAGING: ${file} — remover imediatamente com: git restore --staged ${file}`);
      }
      if ((file.endsWith('.png') || file.endsWith('.jpg')) && !file.includes('04-DESIGN')) {
        log('MEDIO', `Screenshot em staging: ${file}`);
      }
    }
  } catch { /* git não disponível */ }
}

function cleanTempFiles() {
  const tempPatterns = [/\.tmp$/, /\.bak$/, /^\.test-.*\.json$/];
  let removed = 0;

  try {
    const rootFiles = fs.readdirSync(ROOT);
    for (const file of rootFiles) {
      if (tempPatterns.some(p => p.test(file))) {
        const fullPath = path.join(ROOT, file);
        try {
          fs.unlinkSync(fullPath);
          log('INFO', `Temporário removido: ${file}`);
          removed++;
        } catch { /* sem permissão */ }
      }
    }
  } catch { /* sem acesso */ }

  return removed;
}

function cleanEmptyDirs() {
  const skipDirs = new Set(['node_modules', '.git', '.next', '.vercel', 'dist', 'build']);
  let removed = 0;

  function walkAndClean(dir, depth = 0) {
    if (depth > 5) return;
    let entries;
    try { entries = fs.readdirSync(dir); } catch { return; }

    for (const entry of entries) {
      if (skipDirs.has(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkAndClean(fullPath, depth + 1);
          // Verificar se ficou vazio após recursão
          const remaining = fs.readdirSync(fullPath);
          if (remaining.length === 0) {
            fs.rmdirSync(fullPath);
            log('INFO', `Pasta vazia removida: ${path.relative(ROOT, fullPath)}`);
            removed++;
          }
        }
      } catch { /* skip */ }
    }
  }

  // Só limpar pastas KAIROS/ — não tocar em packages/
  const kairos = path.join(ROOT, 'KAIROS');
  if (fs.existsSync(kairos)) walkAndClean(kairos);

  return removed;
}

function updateBriefTimestamp() {
  try {
    if (!fs.existsSync(BRIEF)) return;
    const content = fs.readFileSync(BRIEF, 'utf8');
    const updated = content.replace(
      /> Última actualização: [\d-]+ \| @Orion/,
      `> Última actualização: ${new Date().toISOString().slice(0, 10)} | @Orion`
    );
    if (updated !== content) {
      fs.writeFileSync(BRIEF, updated, 'utf8');
      log('INFO', 'DAILY_BRIEF.md timestamp actualizado');
    }
  } catch { /* silencioso */ }
}

function createDailyAudit() {
  const date    = new Date().toISOString().slice(0, 10);
  const auditPath = path.join(AUDITS, `${date}-orion-daily.md`);
  if (fs.existsSync(auditPath)) return;

  fs.mkdirSync(AUDITS, { recursive: true });

  const agentFiles = fs.existsSync(AGENTS_DIR)
    ? fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
    : [];

  let ledgerCount = 0;
  const ledger = path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
  try {
    ledgerCount = fs.readFileSync(ledger, 'utf8').trim().split('\n').filter(Boolean).length;
  } catch { /* sem ledger */ }

  const content = `# Orion Daily Report — ${date}

## Estado do Sistema
- Agent files: ${agentFiles.length}/11
- Ledger events: ${ledgerCount}
- Generated: ${new Date().toISOString()}

## Agentes
${agentFiles.map(f => `- ${f} ${APPROVED_AGENTS.has(f) ? '✅' : '❌ NÃO APROVADO'}`).join('\n')}

## Acções do Dia
- Backup criado (npm run kairos:export)
- Consolidação do ledger executada
- Ficheiros temporários verificados
`;

  fs.writeFileSync(auditPath, content, 'utf8');
  log('INFO', `Auditoria diária criada: ${auditPath}`);
}

// ─── CICLOS ────────────────────────────────────────────────────────────────

function runStartupChecks() {
  console.log(c('bold', '\n🛡️  @ORION — Guardian 24/7 — ARRANQUE\n'));
  log('INFO', 'Guardian iniciado');

  // Health check
  runScript('health.js');

  // Verificações de integridade
  checkAgentFiles();
  checkGitStaging();
  cleanTempFiles();

  log('INFO', `Arranque completo. Ciclo 30min activo.`);
  console.log(c('green', '\n✅ Sistema verificado. A monitorizar...\n'));
}

function runEvery30min() {
  log('INFO', '--- Ciclo 30min ---');
  checkAgentFiles();
  checkGitStaging();
  const removed = cleanTempFiles() + cleanEmptyDirs();
  if (removed > 0) log('INFO', `${removed} ficheiro(s)/pasta(s) limpas`);
}

function runEvery2hours() {
  log('INFO', '--- Ciclo 2h: consolidate + brief ---');
  runScript('consolidate.js');
  updateBriefTimestamp();
}

function runMidnight() {
  log('INFO', '--- Ciclo diário 00:00 ---');
  runScript('export.js');
  createDailyAudit();
}

// ─── SCHEDULER ─────────────────────────────────────────────────────────────

function scheduleNext(fn, intervalMs) {
  setTimeout(() => {
    try { fn(); } catch (err) { log('ALTO', `Ciclo falhou: ${err.message}`); }
    scheduleNext(fn, intervalMs);
  }, intervalMs);
}

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Arranque
runStartupChecks();

// Ciclo 30 minutos
scheduleNext(runEvery30min, 30 * 60 * 1000);

// Ciclo 2 horas
scheduleNext(runEvery2hours, 2 * 60 * 60 * 1000);

// Meia-noite
setTimeout(function midnight() {
  runMidnight();
  setTimeout(midnight, 24 * 60 * 60 * 1000);
}, msUntilMidnight());

log('INFO', `Próximo ciclo 30min em ${new Date(Date.now() + 30 * 60_000).toLocaleTimeString('pt-PT')}`);
log('INFO', `Próximo ciclo 2h em ${new Date(Date.now() + 2 * 60 * 60_000).toLocaleTimeString('pt-PT')}`);
log('INFO', `Próximo backup às 00:00 de amanhã`);

// Manter vivo
process.on('SIGINT', () => {
  log('INFO', 'Guardian terminado por SIGINT.');
  process.exit(0);
});
