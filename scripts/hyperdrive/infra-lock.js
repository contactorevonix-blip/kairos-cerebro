#!/usr/bin/env node
'use strict';

/**
 * KAIROS HYPERDRIVE — infra-lock.js
 * Cross-check estático entre backend, frontend e configs de deploy.
 * Zero dependências externas. Falha se severity === 'critical'.
 *
 * Verifica:
 *   BACKEND:  Dockerfile, railway.toml, ecosystem.config.js, .env.example
 *   FRONTEND: packages/web/vercel.json, next.config.js, env vars NEXT_PUBLIC_*
 *   CROSS:    drift de endpoints, consistência de portas e env vars
 *
 * Usage:
 *   node scripts/hyperdrive/infra-lock.js [--json] [--help]
 *
 * Exit codes:
 *   0 = ok
 *   1 = drift encontrado (critical ou high)
 *   2 = infra-error (ficheiro em falta)
 */

const fs   = require('node:fs');
const path = require('node:path');
const { append, EVENT_TYPES } = require('../../packages/hyperdrive/src/memory/ledger');

const ROOT   = path.join(__dirname, '..', '..');
const isJson = process.argv.includes('--json');

// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────

function log(msg)    { if (!isJson) process.stdout.write(msg + '\n'); }
function jsonOut(obj){ if (isJson)  process.stdout.write(JSON.stringify(obj, null, 2) + '\n'); }

function read(rel) {
  const full = path.join(ROOT, rel);
  try   { return fs.readFileSync(full, 'utf8'); }
  catch { return null; }
}

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

function drift(severity, label, detail, fix) {
  return { severity, label, detail, fix };
}

// ─── CHECKS BACKEND ────────────────────────────────────────────────────────

function checkDockerfile(findings) {
  log('  ⚙️  Dockerfile ...');
  const content = read('Dockerfile');
  if (!content) {
    findings.push(drift('critical', 'dockerfile-missing', 'Dockerfile não existe', 'Criar Dockerfile na raiz'));
    return;
  }

  // Deve copiar bin/ e packages/
  if (!content.includes('COPY bin'))      findings.push(drift('critical', 'dockerfile-bin-missing',      'Dockerfile não copia bin/',      'Adicionar: COPY bin ./bin'));
  if (!content.includes('COPY packages')) findings.push(drift('critical', 'dockerfile-packages-missing', 'Dockerfile não copia packages/', 'Adicionar: COPY packages ./packages'));
  if (!content.includes('COPY package.json')) findings.push(drift('high', 'dockerfile-packagejson', 'Dockerfile não copia package.json', 'Adicionar: COPY package.json ./'));

  // Deve usar node:20-alpine ou superior
  if (!content.includes('node:20') && !content.includes('node:22') && !content.includes('node:24')) {
    findings.push(drift('medium', 'dockerfile-node-version', 'Dockerfile usa versão de Node não validada', 'Usar node:20-alpine ou superior'));
  }

  // Deve ter healthcheck ou depender do railway healthcheck
  if (!content.includes('HEALTHCHECK') && !content.includes('healthcheck')) {
    findings.push(drift('low', 'dockerfile-no-healthcheck', 'Dockerfile não tem HEALTHCHECK', 'Adicionar HEALTHCHECK ou verificar se railway.toml tem healthcheckPath'));
  }

  log('    ✅ Dockerfile analisado');
}

function checkRailway(findings) {
  log('  ⚙️  railway.toml ...');
  const content = read('railway.toml');
  if (!content) {
    findings.push(drift('critical', 'railway-toml-missing', 'railway.toml não existe', 'Criar railway.toml na raiz'));
    return;
  }

  // healthcheckPath deve ser /health
  if (!content.includes('healthcheckPath = "/health"')) {
    findings.push(drift('high', 'railway-healthcheck-path',
      `healthcheckPath não é "/health" — verificar se endpoint existe`,
      'Confirmar que GET /health retorna {"status":"OPERATIONAL"}'));
  }

  // startCommand deve apontar para server.js
  if (!content.includes('packages/sniper-api/server.js')) {
    findings.push(drift('critical', 'railway-start-command',
      'startCommand não aponta para packages/sniper-api/server.js',
      'Corrigir startCommand no railway.toml'));
  }

  // builder deve ser DOCKERFILE
  if (!content.includes('builder = "DOCKERFILE"')) {
    findings.push(drift('medium', 'railway-builder',
      'Railway não está a usar DOCKERFILE builder',
      'Adicionar builder = "DOCKERFILE" em [build]'));
  }

  log('    ✅ railway.toml analisado');
}

function checkEcosystem(findings) {
  log('  ⚙️  ecosystem.config.js ...');
  const content = read('ecosystem.config.js');
  if (!content) {
    findings.push(drift('medium', 'ecosystem-missing', 'ecosystem.config.js não existe (PM2 local)', 'Criar para desenvolvimento local'));
    return;
  }

  // Script deve apontar para server.js
  if (!content.includes('packages/sniper-api/server.js')) {
    findings.push(drift('high', 'ecosystem-script',
      'ecosystem.config.js não aponta para packages/sniper-api/server.js',
      'Corrigir script no ecosystem.config.js'));
  }

  // PORT deve ser 8787
  if (!content.includes('PORT: 8787') && !content.includes("PORT: '8787'") && !content.includes('PORT: "8787"')) {
    findings.push(drift('medium', 'ecosystem-port',
      'ecosystem.config.js não define PORT=8787',
      'Adicionar PORT: 8787 em env'));
  }

  log('    ✅ ecosystem.config.js analisado');
}

function checkEnvExample(findings) {
  log('  ⚙️  .env.example ...');
  const content = read('.env.example');
  if (!content) {
    findings.push(drift('medium', 'env-example-missing', '.env.example não existe', 'Criar .env.example com todas as vars necessárias'));
    return;
  }

  // Vars críticas que devem estar documentadas
  const criticalVars = [
    'KAIROS_STRIPE_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'KAIROS_ADMIN_TOKEN',
    'PORT',
    'NODE_ENV',
  ];

  for (const v of criticalVars) {
    if (!content.includes(v)) {
      findings.push(drift('high', `env-missing-${v.toLowerCase().replace(/_/g, '-')}`,
        `${v} não está documentada em .env.example`,
        `Adicionar ${v}= ao .env.example`));
    }
  }

  log('    ✅ .env.example analisado');
}

// ─── CHECKS FRONTEND ───────────────────────────────────────────────────────

function checkVercelJson(findings) {
  log('  ⚙️  vercel.json ...');
  const content = read('packages/web/vercel.json');
  if (!content) {
    findings.push(drift('critical', 'vercel-json-missing',
      'packages/web/vercel.json não existe',
      'Criar vercel.json em packages/web/ com framework nextjs'));
    return;
  }

  let cfg;
  try { cfg = JSON.parse(content); }
  catch { findings.push(drift('critical', 'vercel-json-invalid', 'vercel.json inválido (JSON malformado)', 'Corrigir JSON')); return; }

  if (cfg.framework !== 'nextjs') {
    findings.push(drift('critical', 'vercel-framework', `framework é "${cfg.framework}", devia ser "nextjs"`, 'Corrigir: "framework": "nextjs"'));
  }
  if (cfg.outputDirectory !== '.next') {
    findings.push(drift('high', 'vercel-output', `outputDirectory é "${cfg.outputDirectory}", devia ser ".next"`, 'Corrigir: "outputDirectory": ".next"'));
  }
  if (!cfg.buildCommand?.includes('build')) {
    findings.push(drift('high', 'vercel-build-cmd', 'buildCommand não inclui "build"', 'Corrigir: "buildCommand": "npm run build"'));
  }

  log('    ✅ vercel.json analisado');
}

function checkNextConfig(findings) {
  log('  ⚙️  next.config.js ...');
  const content = read('packages/web/next.config.js');
  if (!content) {
    findings.push(drift('high', 'next-config-missing', 'packages/web/next.config.js não existe', 'Criar next.config.js'));
    return;
  }

  // Deve ter KAIROS_API_URL para proxy
  if (!content.includes('KAIROS_API_URL')) {
    findings.push(drift('critical', 'next-config-api-url',
      'next.config.js não usa KAIROS_API_URL para proxy da API',
      'Adicionar: const apiBase = process.env.KAIROS_API_URL || "http://localhost:8787"'));
  }

  // Deve fazer proxy de /api/* para o backend
  if (!content.includes('/api/:path*')) {
    findings.push(drift('critical', 'next-config-api-proxy',
      'next.config.js não tem rewrite /api/:path* → backend',
      'Adicionar rewrite para /api/:path* no next.config.js'));
  }

  // poweredByHeader deve estar desactivado
  if (!content.includes('poweredByHeader: false')) {
    findings.push(drift('low', 'next-config-powered-by',
      'poweredByHeader não está desactivado',
      'Adicionar poweredByHeader: false ao nextConfig'));
  }

  log('    ✅ next.config.js analisado');
}

function checkNextPublicVars(findings) {
  log('  ⚙️  NEXT_PUBLIC_* vars ...');
  const webSrc = path.join(ROOT, 'packages', 'web', 'src');
  if (!fs.existsSync(webSrc)) return;

  // Encontrar todas as NEXT_PUBLIC_* usadas no código
  const usedVars = new Set();
  function scanDir(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isDirectory() && e.name !== 'node_modules') { scanDir(path.join(dir, e.name)); continue; }
      if (!e.isFile()) continue;
      const ext = path.extname(e.name);
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue;
      const content = fs.readFileSync(path.join(dir, e.name), 'utf8');
      const matches = content.matchAll(/process\.env\.(NEXT_PUBLIC_\w+)/g);
      for (const m of matches) usedVars.add(m[1]);
    }
  }
  scanDir(webSrc);

  // Verificar se estão documentadas em .env.example
  const envExample = read('.env.example') || '';
  for (const v of usedVars) {
    if (!envExample.includes(v)) {
      findings.push(drift('medium', `next-public-undocumented-${v.toLowerCase()}`,
        `${v} usada no código mas não documentada em .env.example`,
        `Adicionar ${v}= ao .env.example`));
    }
  }

  if (usedVars.size > 0) log(`    ℹ️  NEXT_PUBLIC_* encontradas: ${[...usedVars].join(', ')}`);
  log('    ✅ NEXT_PUBLIC_* analisadas');
}

// ─── CROSS-CHECK ───────────────────────────────────────────────────────────

function checkPortConsistency(findings) {
  log('  ⚙️  Consistência de portas ...');
  const PORT = '8787';
  const checks = {
    'ecosystem.config.js': read('ecosystem.config.js'),
    '.env.example':        read('.env.example'),
    'next.config.js':      read('packages/web/next.config.js'),
  };

  // ecosystem e .env.example devem ter PORT=8787
  if (checks['ecosystem.config.js'] && !checks['ecosystem.config.js'].includes(PORT)) {
    findings.push(drift('high', 'port-drift-ecosystem',
      `ecosystem.config.js não usa PORT ${PORT}`,
      `Confirmar PORT: ${PORT} em ecosystem.config.js`));
  }
  if (checks['.env.example'] && !checks['.env.example'].includes(`PORT=${PORT}`)) {
    findings.push(drift('medium', 'port-drift-env',
      `.env.example não documenta PORT=${PORT}`,
      `Adicionar PORT=${PORT} ao .env.example`));
  }

  // next.config.js deve usar localhost:8787 como fallback
  if (checks['next.config.js'] && !checks['next.config.js'].includes(`localhost:${PORT}`)) {
    findings.push(drift('high', 'port-drift-frontend',
      `next.config.js não usa localhost:${PORT} como fallback`,
      `Confirmar: const apiBase = process.env.KAIROS_API_URL || 'http://localhost:${PORT}'`));
  }

  log('    ✅ Consistência de portas verificada');
}

function checkEndpointDrift(findings) {
  log('  ⚙️  Drift de endpoints ...');

  // Endpoints expostos no backend
  const serverContent = read('packages/sniper-api/server.js') || '';
  const backendRoutes = new Set();
  for (const m of serverContent.matchAll(/['"`](\/api\/[^\s'"`]+)['"`]/g)) {
    backendRoutes.add(m[1].replace(/:[^/]+/g, ':param'));
  }

  // Endpoints consumidos no frontend
  const webSrc = path.join(ROOT, 'packages', 'web', 'src');
  const frontendCalls = new Set();
  if (fs.existsSync(webSrc)) {
    function scan(dir) {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        if (e.isDirectory() && e.name !== 'node_modules') { scan(path.join(dir, e.name)); continue; }
        if (!e.isFile() || !['.ts', '.tsx', '.js'].includes(path.extname(e.name))) continue;
        const content = fs.readFileSync(path.join(dir, e.name), 'utf8');
        for (const m of content.matchAll(/fetch\(['"`](\/api\/[^'"`]+)['"`]/g)) {
          frontendCalls.add(m[1].replace(/:[^/]+/g, ':param'));
        }
      }
    }
    scan(webSrc);
  }

  // Frontend a chamar endpoints que não existem no backend
  for (const ep of frontendCalls) {
    if (backendRoutes.size > 0 && !backendRoutes.has(ep)) {
      findings.push(drift('high', 'endpoint-drift',
        `Frontend chama ${ep} mas este endpoint não foi encontrado no backend`,
        `Verificar se ${ep} existe em packages/sniper-api/server.js`));
    }
  }

  if (frontendCalls.size === 0 && backendRoutes.size === 0) {
    log('    ℹ️  Nenhum endpoint detectado para cross-check (frontend ainda vazio)');
  } else {
    log(`    ℹ️  Backend: ${backendRoutes.size} rotas | Frontend: ${frontendCalls.size} calls`);
  }
  log('    ✅ Drift de endpoints verificado');
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  const start    = Date.now();
  const findings = [];

  log('\n=== KAIROS INFRA-LOCK ===');
  log('BACKEND:');
  checkDockerfile(findings);
  checkRailway(findings);
  checkEcosystem(findings);
  checkEnvExample(findings);

  log('\nFRONTEND:');
  checkVercelJson(findings);
  checkNextConfig(findings);
  checkNextPublicVars(findings);

  log('\nCROSS-CHECK:');
  checkPortConsistency(findings);
  checkEndpointDrift(findings);

  const criticals = findings.filter(f => f.severity === 'critical');
  const highs     = findings.filter(f => f.severity === 'high');
  const mediums   = findings.filter(f => f.severity === 'medium');
  const lows      = findings.filter(f => f.severity === 'low');
  const ok        = criticals.length === 0 && highs.length === 0;
  const totalMs   = Date.now() - start;

  if (!isJson) {
    log('\n─── RESULTADO ───────────────────────────────────');
    if (findings.length === 0) {
      log('✅ INFRA-LOCK PASS — zero drift detectado.');
    } else {
      log(`\n🔴 CRÍTICO: ${criticals.length} | 🟠 ALTO: ${highs.length} | 🟡 MÉDIO: ${mediums.length} | ℹ️  BAIXO: ${lows.length}`);
      for (const f of findings) {
        const icon = { critical: '🔴', high: '🟠', medium: '🟡', low: 'ℹ️ ' }[f.severity] || '❓';
        log(`\n  ${icon} [${f.severity.toUpperCase()}] ${f.label}`);
        log(`     Problema: ${f.detail}`);
        log(`     Solução:  ${f.fix}`);
      }
      log('');
    }
    log(`${ok ? '✅ INFRA-LOCK PASS' : '❌ INFRA-LOCK FAIL'} — ${totalMs}ms`);
  }

  const report = { ok, totalMs, drift: findings, critical: criticals.length, high: highs.length, medium: mediums.length, low: lows.length };
  jsonOut(report);

  append('orchestrator', ok ? EVENT_TYPES.TaskCompleted : EVENT_TYPES.TaskFailed, {
    tool:     'infra-lock',
    ok,
    critical: criticals.length,
    high:     highs.length,
    findings: findings.map(f => `${f.severity}:${f.label}`),
  });

  process.exit(ok ? 0 : 1);
}

if (process.argv.includes('--help')) {
  console.log(`
KAIROS INFRA-LOCK — Cross-check estático de infra

Verifica:
  BACKEND:  Dockerfile, railway.toml, ecosystem.config.js, .env.example
  FRONTEND: vercel.json, next.config.js, NEXT_PUBLIC_* vars
  CROSS:    drift de endpoints, consistência de portas e env vars

Usage:
  node scripts/hyperdrive/infra-lock.js [--json] [--help]

Exit codes:
  0 = ok (sem critical ou high)
  1 = drift crítico ou alto encontrado
  2 = infra-error
`);
  process.exit(0);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(2);
});
