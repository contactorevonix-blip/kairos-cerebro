#!/usr/bin/env node
// KAIROS Supervisor — anomalias, rollback automático, diagnostic payload
// Usage: node bin/supervisor.js [--watch] [--since 24h] [--json]
'use strict';

const fs   = require('fs');
const path = require('path');
const http  = require('http');
const https = require('https');

const DB_DIR  = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const BACKUP_DIR = path.join(DB_DIR, 'backups');
const WEBHOOK = process.env.SUPERVISOR_WEBHOOK_URL || '';
const WATCH   = process.argv.includes('--watch');
const SINCE_ARG = process.argv.includes('--since')
  ? process.argv[process.argv.indexOf('--since') + 1] : '24h';

function parseSince(s) {
  const m = s.match(/^(\d+)(h|d|m)$/);
  if (!m) return Date.now() - 86_400_000;
  const ms = { h: 3_600_000, d: 86_400_000, m: 2_592_000_000 }[m[2]];
  return Date.now() - Number(m[1]) * ms;
}
const SINCE = parseSince(SINCE_ARG);

// ── I/O ──────────────────────────────────────────────────────────────────────
function readJsonl(name) {
  const f = path.join(DB_DIR, name);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function readJson(name, fallback) {
  try {
    const f = path.join(DB_DIR, name);
    if (!fs.existsSync(f)) return fallback;
    return JSON.parse(fs.readFileSync(f, 'utf8')) || fallback;
  } catch { return fallback; }
}

// ── Rollback ─────────────────────────────────────────────────────────────────
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const files = ['tenants.json', 'api_keys.json'];
  const saved = [];
  for (const name of files) {
    const src = path.join(DB_DIR, name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(BACKUP_DIR, `${ts}_${name}`);
    fs.copyFileSync(src, dest);
    saved.push(dest);
  }
  return saved;
}

function rollback() {
  if (!fs.existsSync(BACKUP_DIR)) return { ok: false, reason: 'Sem backups disponíveis' };

  const backups = fs.readdirSync(BACKUP_DIR).sort().reverse();
  if (backups.length === 0) return { ok: false, reason: 'Sem backups disponíveis' };

  const restored = [];
  for (const b of backups.slice(0, 2)) {
    const nameParts = b.split('_');
    const fileName = nameParts.slice(3).join('_'); // remove timestamp prefix
    const dest = path.join(DB_DIR, fileName);
    try {
      fs.copyFileSync(path.join(BACKUP_DIR, b), dest);
      restored.push(fileName);
    } catch {}
  }

  return { ok: restored.length > 0, restored, backup: backups[0] };
}

// ── Diagnostic Payload ────────────────────────────────────────────────────────
function sendDiagnostic(payload) {
  const json = JSON.stringify(payload);

  // Persistir localmente sempre
  const diagFile = path.join(DB_DIR, 'diagnostics.jsonl');
  try { fs.appendFileSync(diagFile, json + '\n'); } catch {}

  // Enviar para webhook se configurado
  if (!WEBHOOK) return;

  const url = new URL(WEBHOOK);
  const mod = url.protocol === 'https:' ? https : http;
  const req = mod.request({
    hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(json) },
  }, res => {
    if (res.statusCode >= 400) console.error(`[supervisor] Webhook ${res.statusCode}`);
  });
  req.on('error', e => console.error(`[supervisor] Webhook falhou: ${e.message}`));
  req.write(json);
  req.end();
}

// ── Detectores ───────────────────────────────────────────────────────────────
function detectErrorSpikes(verifications) {
  const recent = verifications.filter(v => new Date(v.ts || v.createdAt).getTime() > SINCE);
  const errors = recent.filter(v => v.error || v.status === 'error' || v.score === null);
  const rate   = recent.length > 0 ? (errors.length / recent.length) * 100 : 0;
  return {
    total: recent.length, errors: errors.length,
    errorRate: Math.round(rate), spike: rate > 10,
    samples: errors.slice(0, 3).map(e => ({ ts: e.ts, error: e.error || e.status, tenantId: e.tenantId })),
  };
}

function detectLatency(verifications) {
  const recent = verifications.filter(v =>
    new Date(v.ts || v.createdAt).getTime() > SINCE && v.durationMs);
  const slow = recent.filter(v => v.durationMs > 2000);
  const avg  = recent.length
    ? Math.round(recent.reduce((s, v) => s + v.durationMs, 0) / recent.length) : 0;
  return { slowCount: slow.length, avgDuration: avg };
}

function detectQuotaAbuse(verifications) {
  const recent = verifications.filter(v => new Date(v.ts || v.createdAt).getTime() > SINCE);
  const byTenant = {};
  recent.forEach(v => { if (v.tenantId) byTenant[v.tenantId] = (byTenant[v.tenantId] || 0) + 1; });
  return Object.entries(byTenant)
    .filter(([, n]) => n > 500).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, n]) => ({ id: id.slice(0, 12) + '…', calls: n }));
}

// ── Diagnóstico + Acção ──────────────────────────────────────────────────────
function diagnoseAndAct(report) {
  const findings = [];

  if (report.errorSpike.spike) {
    const r = report.errorSpike;
    const finding = {
      severity: 'HIGH',
      cause: `Taxa de erro ${r.errorRate}% (${r.errors}/${r.total} checks)`,
      rootCause: r.samples[0]?.error || 'Fonte OSINT ou sniper-engine',
      action: 'rollback_attempted',
    };

    // Tentar rollback automático
    const rb = rollback();
    finding.rollback = rb;

    sendDiagnostic({
      ts: new Date().toISOString(), severity: 'HIGH',
      event: 'api:error_spike', ...finding,
      samples: r.samples,
    });

    findings.push(finding);
  }

  if (report.latency.avgDuration > 2000) {
    const finding = {
      severity: report.latency.avgDuration > 4000 ? 'HIGH' : 'MEDIUM',
      cause: `Latência elevada: ${report.latency.avgDuration}ms`,
      rootCause: 'Fonte OSINT lenta — considerar circuit breaker',
      action: 'diagnostic_sent',
    };
    sendDiagnostic({ ts: new Date().toISOString(), event: 'api:latency_spike', ...finding });
    findings.push(finding);
  }

  if (report.quotaAbuse.length > 0) {
    findings.push({
      severity: 'MEDIUM',
      cause: `${report.quotaAbuse.length} tenant(s) com uso anormal`,
      rootCause: 'Scraping, bug no cliente, ou candidato a upgrade',
      action: `Contactar: ${report.quotaAbuse.map(t => t.id).join(', ')}`,
    });
  }

  return findings;
}

// ── Output ───────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m',
};

function run() {
  // Criar backup preventivo antes de analisar
  createBackup();

  const verifications = readJsonl('verifications.jsonl');
  const report = {
    ts: new Date().toISOString(),
    since: new Date(SINCE).toISOString(),
    errorSpike: detectErrorSpikes(verifications),
    latency:    detectLatency(verifications),
    quotaAbuse: detectQuotaAbuse(verifications),
  };

  const findings = diagnoseAndAct(report);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ report, findings }, null, 2));
    return;
  }

  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║     KAIROS Supervisor — Diagnóstico      ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════╝${c.reset}`);
  console.log(`${c.dim}  Desde: ${report.since}${c.reset}\n`);

  console.log(`${c.bold}  Checks analisados:${c.reset} ${report.errorSpike.total}`);
  const ec = report.errorSpike.spike ? c.red : c.green;
  console.log(`  Taxa de erro:      ${ec}${report.errorSpike.errorRate}%${c.reset}`);
  console.log(`  Latência média:    ${c.bold}${report.latency.avgDuration}ms${c.reset}`);
  console.log(`  Backup criado:     ${c.dim}${BACKUP_DIR}${c.reset}`);
  if (WEBHOOK) console.log(`  Webhook:           ${c.dim}${WEBHOOK.slice(0, 40)}...${c.reset}`);

  if (findings.length === 0) {
    console.log(`\n${c.green}${c.bold}  ✓ Sistema saudável.${c.reset}\n`);
    return;
  }

  console.log(`\n${c.bold}  Anomalias (${findings.length}) — acções tomadas:${c.reset}\n`);
  findings.forEach((f, i) => {
    const col = f.severity === 'HIGH' ? c.red : c.yellow;
    console.log(`  ${i + 1}. ${col}[${f.severity}]${c.reset} ${f.cause}`);
    console.log(`     ${c.dim}Causa raiz: ${f.rootCause}${c.reset}`);
    console.log(`     ${c.bold}Acção:${c.reset} ${f.action}`);
    if (f.rollback) {
      const rb = f.rollback;
      console.log(`     ${rb.ok ? c.green + '✓ Rollback OK' : c.red + '✗ Rollback falhou'}: ${rb.restored?.join(', ') || rb.reason}${c.reset}`);
    }
    console.log();
  });
}

run();

if (WATCH) {
  const INTERVAL = 60_000;
  console.log(`${c.dim}  Modo watch — a verificar cada ${INTERVAL / 1000}s${c.reset}\n`);
  setInterval(run, INTERVAL);
}
