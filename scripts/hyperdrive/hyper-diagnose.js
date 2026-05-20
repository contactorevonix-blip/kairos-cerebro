#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — hyper-diagnose.js
 * Monitor de logs em tempo real com detecção de padrões críticos.
 * Zero dependências externas.
 *
 * Usage:
 *   node scripts/hyperdrive/hyper-diagnose.js [--json] [--once] [--help]
 *
 * Exit codes:
 *   0 = ok (nenhum erro crítico)
 *   1 = erro detectado
 *   2 = infra-error (ficheiro inacessível, permissões, etc.)
 */

const fs   = require('node:fs');
const path = require('node:path');
const { append, EVENT_TYPES } = require('../../packages/hyperdrive/src/memory/ledger');

const ROOT = path.join(__dirname, '..', '..');

// ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────

const LOG_FILES = [
  path.join(ROOT, 'dev.log'),
  path.join(ROOT, 'packages', 'web', 'dev.log'),
  path.join(ROOT, 'logs', 'kairos-error.log'),
  path.join(ROOT, 'logs', 'kairos-out.log'),
];

const PATTERNS = [
  // Stack traces
  { re: /Error:.*\n.*at /m,                severity: 'high',     label: 'stack-trace',           fix: 'Verificar stack trace e corrigir erro' },
  { re: /UnhandledPromiseRejection/,        severity: 'critical', label: 'unhandled-promise',     fix: 'Adicionar .catch() ou try/catch' },
  // Rede
  { re: /EADDRINUSE/,                       severity: 'high',     label: 'port-in-use',           fix: 'Porta já em uso — matar processo ou mudar porta' },
  { re: /ECONNREFUSED/,                     severity: 'high',     label: 'connection-refused',    fix: 'Backend não está a correr ou URL errada' },
  { re: /ENOTFOUND/,                        severity: 'medium',   label: 'dns-not-found',         fix: 'Verificar URL e DNS' },
  // Stripe
  { re: /stripe.*webhook.*error/i,          severity: 'critical', label: 'stripe-webhook',        fix: 'Verificar KAIROS_STRIPE_WEBHOOK_SECRET' },
  { re: /No signatures found/,              severity: 'critical', label: 'stripe-sig-missing',    fix: 'Header stripe-signature ausente' },
  { re: /Webhook signature verification/,   severity: 'critical', label: 'stripe-sig-fail',       fix: 'Secret errado ou payload modificado' },
  // Resend
  { re: /resend.*error/i,                   severity: 'high',     label: 'resend-error',          fix: 'Verificar RESEND_API_KEY e template' },
  { re: /email.*failed/i,                   severity: 'medium',   label: 'email-failed',          fix: 'Verificar configuração de email' },
  // Next.js
  { re: /Hydration failed/,                 severity: 'high',     label: 'nextjs-hydration',      fix: 'Mismatch server/client — verificar SSR' },
  { re: /hydration.*mismatch/i,             severity: 'high',     label: 'hydration-mismatch',    fix: 'Usar suppressHydrationWarning ou corrigir SSR' },
  { re: /Build error/,                      severity: 'critical', label: 'nextjs-build-error',    fix: 'Verificar erros de TypeScript e imports' },
  { re: /Module not found/,                 severity: 'high',     label: 'module-not-found',      fix: 'Verificar imports e dependências instaladas' },
  // Auth / GDPR
  { re: /Unauthorized|401/,                 severity: 'medium',   label: 'auth-failure',          fix: 'Token inválido ou expirado' },
  { re: /KAIROS_ADMIN_TOKEN/,               severity: 'high',     label: 'admin-token-missing',   fix: 'Configurar KAIROS_ADMIN_TOKEN no ambiente' },
  // Genérico
  { re: /FATAL/,                            severity: 'critical', label: 'fatal',                 fix: 'Erro fatal — investigar imediatamente' },
  { re: /out of memory/i,                   severity: 'critical', label: 'oom',                   fix: 'Memory leak — rever uso de memória' },
  { re: /SIGTERM|SIGKILL/,                  severity: 'medium',   label: 'process-killed',        fix: 'Processo terminado externamente' },
];

// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────

const isJson = process.argv.includes('--json');
const isOnce = process.argv.includes('--once');

function log(msg) {
  if (!isJson) process.stdout.write(msg + '\n');
}

function jsonOut(obj) {
  if (isJson) process.stdout.write(JSON.stringify(obj) + '\n');
}

function analyseContent(content, source) {
  const findings = [];
  for (const p of PATTERNS) {
    if (p.re.test(content)) {
      findings.push({ label: p.label, severity: p.severity, fix: p.fix, source });
    }
  }
  return findings;
}

// ─── SCAN ÚNICO ────────────────────────────────────────────────────────────

function scanOnce() {
  const allFindings = [];

  for (const logFile of LOG_FILES) {
    if (!fs.existsSync(logFile)) continue;
    try {
      const content  = fs.readFileSync(logFile, 'utf8');
      const findings = analyseContent(content, path.relative(ROOT, logFile));
      allFindings.push(...findings);
    } catch (err) {
      log(`⚠️  Não consigo ler ${logFile}: ${err.message}`);
    }
  }

  const criticals = allFindings.filter(f => f.severity === 'critical');
  const highs     = allFindings.filter(f => f.severity === 'high');
  const mediums   = allFindings.filter(f => f.severity === 'medium');

  const report = {
    ok:       allFindings.length === 0,
    total:    allFindings.length,
    critical: criticals.length,
    high:     highs.length,
    medium:   mediums.length,
    findings: allFindings,
    scanned:  LOG_FILES.filter(f => fs.existsSync(f)).map(f => path.relative(ROOT, f)),
  };

  if (!isJson) {
    log('\n=== KAIROS HYPER-DIAGNOSE ===');
    log(`Ficheiros analisados: ${report.scanned.join(', ') || 'nenhum'}`);
    if (allFindings.length === 0) {
      log('✅ Nenhum problema detectado.');
    } else {
      log(`\n🔴 CRÍTICO: ${criticals.length} | 🟠 ALTO: ${highs.length} | 🟡 MÉDIO: ${mediums.length}`);
      for (const f of allFindings) {
        const icon = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟠' : '🟡';
        log(`  ${icon} [${f.severity.toUpperCase()}] ${f.label} (${f.source})`);
        log(`     → ${f.fix}`);
      }
    }
  }

  jsonOut(report);

  if (criticals.length > 0) {
    append('orchestrator', EVENT_TYPES.TaskFailed, { tool: 'hyper-diagnose', findings: criticals });
    return 1;
  }
  return 0;
}

// ─── WATCH MODE ────────────────────────────────────────────────────────────

function watchMode() {
  log('👁  KAIROS HYPER-DIAGNOSE — modo watch activo');
  log(`   A monitorizar: ${LOG_FILES.filter(f => fs.existsSync(f)).map(f => path.relative(ROOT, f)).join(', ')}`);
  log('   Ctrl+C para parar\n');

  append('orchestrator', EVENT_TYPES.SystemBoot, { tool: 'hyper-diagnose', mode: 'watch' });

  for (const logFile of LOG_FILES) {
    if (!fs.existsSync(logFile)) continue;
    try {
      fs.watch(logFile, { persistent: true }, () => {
        const code = scanOnce();
        if (code !== 0) {
          log('\n⚠️  Problema detectado. Investigar e corrigir.');
        }
      });
    } catch (err) {
      log(`⚠️  Não consigo monitorizar ${logFile}: ${err.message}`);
    }
  }

  // Scan inicial
  scanOnce();
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────

if (process.argv.includes('--help')) {
  console.log(`
KAIROS HYPER-DIAGNOSE — Monitor de logs em tempo real

Usage:
  node scripts/hyperdrive/hyper-diagnose.js [flags]

Flags:
  --once    Scan único e sai (default: modo watch contínuo)
  --json    Output em JSON (para pipelines)
  --help    Esta mensagem

Exit codes:
  0 = ok
  1 = erro detectado
  2 = infra-error
`);
  process.exit(0);
}

if (isOnce) {
  process.exit(scanOnce());
} else {
  watchMode();
}
