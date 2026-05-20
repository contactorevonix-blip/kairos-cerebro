#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — isolated-validate.js
 * Validação paralela com timeout individual por suite.
 * Zero dependências externas.
 *
 * Usage:
 *   node scripts/hyperdrive/isolated-validate.js [--scope <path>] [--json] [--help]
 *
 * Exit codes:
 *   0 = todos os checks passaram
 *   1 = um ou mais checks falharam
 *   2 = infra-error (ficheiro em falta, permissões)
 */

const { execFile } = require('node:child_process');
const fs    = require('node:path');
const path  = require('node:path');
const exist = require('node:fs').existsSync;
const { append, EVENT_TYPES } = require('../../packages/hyperdrive/src/memory/ledger');

const ROOT     = path.join(__dirname, '..', '..');
const isJson   = process.argv.includes('--json');
const scopeIdx = process.argv.indexOf('--scope');
const scope    = scopeIdx !== -1 ? process.argv[scopeIdx + 1] : null;

// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────

function log(msg) { if (!isJson) process.stdout.write(msg + '\n'); }
function jsonOut(obj) { if (isJson) process.stdout.write(JSON.stringify(obj) + '\n'); }

/** Corre um comando com timeout. Retorna { ok, stdout, stderr, durationMs } */
function run(cmd, args, opts = {}) {
  const start   = Date.now();
  const timeout = opts.timeout || 120_000; // 2 min default

  return new Promise(resolve => {
    const child = execFile(cmd, args, {
      cwd:     opts.cwd || ROOT,
      timeout,
      env:     { ...process.env, FORCE_COLOR: '0' },
    }, (err, stdout, stderr) => {
      const durationMs = Date.now() - start;
      resolve({
        ok:  !err,
        stdout: stdout?.trim() || '',
        stderr: stderr?.trim() || '',
        durationMs,
        exitCode: err?.code || 0,
      });
    });
  });
}

// ─── CHECKS ────────────────────────────────────────────────────────────────

async function checkTests() {
  log('  ⚙️  npm test ...');
  const r = await run('node', ['--test',
    'tests/*.test.js', 'packages/sniper-api/*.test.js'
  ].flatMap(p => {
    // expand glob manually para zero-dep
    const base = p.split('*.')[0];
    try {
      return require('node:fs').readdirSync(path.join(ROOT, base))
        .filter(f => f.endsWith('.test.js'))
        .map(f => path.join(base, f));
    } catch { return []; }
  }), { timeout: 60_000 });

  return {
    name:       'npm test',
    ok:         r.ok,
    durationMs: r.durationMs,
    detail:     r.ok ? 'testes passaram' : r.stderr || r.stdout,
  };
}

async function checkAuditVerify() {
  if (!exist(path.join(ROOT, 'bin', 'kairos.js'))) {
    return { name: 'audit:verify', ok: true, durationMs: 0, detail: 'bin/kairos.js não existe — skip' };
  }
  log('  ⚙️  audit:verify ...');
  const r = await run('node', ['bin/kairos.js', 'audit:verify'], { timeout: 30_000 });
  return {
    name:       'audit:verify',
    ok:         r.ok,
    durationMs: r.durationMs,
    detail:     r.ok ? 'audit chain ok' : r.stderr || r.stdout,
  };
}

async function checkWebBuild() {
  const webPkg = path.join(ROOT, 'packages', 'web', 'package.json');
  if (!exist(webPkg)) {
    return { name: 'web:build', ok: true, durationMs: 0, detail: 'packages/web não existe — skip' };
  }
  log('  ⚙️  next build ...');
  const r = await run('npm', ['run', 'build'], {
    cwd:     path.join(ROOT, 'packages', 'web'),
    timeout: 300_000, // 5 min
  });
  return {
    name:       'web:build',
    ok:         r.ok,
    durationMs: r.durationMs,
    detail:     r.ok ? 'build ok' : r.stderr?.slice(0, 500) || r.stdout?.slice(0, 500),
  };
}

async function checkConfigs() {
  log('  ⚙️  config files ...');
  const start   = Date.now();
  const checks  = [];
  const required = [
    'Dockerfile',
    'railway.toml',
    'ecosystem.config.js',
    'package.json',
    'bin/kairos.js',
    'packages/sniper-api/server.js',
  ];

  for (const rel of required) {
    const ok = exist(path.join(ROOT, rel));
    checks.push({ file: rel, exists: ok });
    if (!ok) log(`     ❌ ${rel} em falta`);
  }

  return {
    name:       'config-files',
    ok:         checks.every(c => c.exists),
    durationMs: Date.now() - start,
    detail:     checks.filter(c => !c.exists).map(c => `missing: ${c.file}`).join(', ') || 'todos os ficheiros presentes',
  };
}

// ─── RUNNER ────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  log('\n=== KAIROS ISOLATED-VALIDATE ===');
  if (scope) log(`   Scope: ${scope}`);

  // Se --scope, só corre checks relevantes ao path
  const runWeb = !scope || scope.includes('web');
  const runTests = !scope;

  const checks = [
    checkConfigs(),
    runTests ? checkTests()       : Promise.resolve({ name: 'npm test', ok: true, durationMs: 0, detail: 'skip (scope)' }),
    checkAuditVerify(),
    runWeb   ? checkWebBuild()    : Promise.resolve({ name: 'web:build', ok: true, durationMs: 0, detail: 'skip (scope)' }),
  ];

  const results  = await Promise.all(checks);
  const allOk    = results.every(r => r.ok);
  const failures = results.filter(r => !r.ok);
  const totalMs  = Date.now() - start;

  if (!isJson) {
    log('\nResultados:');
    for (const r of results) {
      const icon = r.ok ? '✅' : '❌';
      log(`  ${icon} ${r.name.padEnd(20)} ${r.durationMs}ms  ${r.detail}`);
    }
    log(`\n${allOk ? '✅ VALIDATION PASS' : '❌ VALIDATION FAIL'} — ${totalMs}ms total`);
  }

  const report = {
    ok:       allOk,
    totalMs,
    durations: Object.fromEntries(results.map(r => [r.name, r.durationMs])),
    failures:  failures.map(r => ({ name: r.name, detail: r.detail })),
    results,
  };

  jsonOut(report);

  append('orchestrator', allOk ? EVENT_TYPES.TaskCompleted : EVENT_TYPES.TaskFailed, {
    tool:     'isolated-validate',
    ok:       allOk,
    failures: failures.map(r => r.name),
    totalMs,
  });

  process.exit(allOk ? 0 : 1);
}

if (process.argv.includes('--help')) {
  console.log(`
KAIROS ISOLATED-VALIDATE — Validação paralela do projecto

Usage:
  node scripts/hyperdrive/isolated-validate.js [flags]

Flags:
  --scope <path>  Limita validação a subgrafo (ex: packages/web)
  --json          Output em JSON
  --help          Esta mensagem

Exit codes:
  0 = ok | 1 = falha | 2 = infra-error
`);
  process.exit(0);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(2);
});
