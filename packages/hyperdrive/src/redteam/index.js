'use strict';

/**
 * KAIROS HYPERDRIVE — Red Team Orchestrator
 * Corre @Rex + @Quinn em paralelo. Gera RedTeamReport assinado.
 * Falha se há findings CRITICAL ou sem SignedApproval do @Rex.
 *
 * @typedef {Object} RedTeamReport
 * @property {boolean} passed
 * @property {string}  timestamp
 * @property {string}  file
 * @property {object[]} findings
 * @property {number}  critical
 * @property {number}  high
 * @property {number}  medium
 * @property {number}  low
 * @property {string}  coverage     - rex|quinn|full
 * @property {string|null} signature - HMAC-SHA256 do @Rex (só se passed)
 * @property {number}  durationMs
 */

const { scan: rexScan }   = require('./rex-scanner');
const { scan: quinnScan } = require('./quinn-scanner');
const { sign }            = require('./signing');
const { append, EVENT_TYPES } = require('../memory/ledger');

/**
 * Corre o Red Team num ficheiro ou snippet de código.
 * @param {string} code           - Código a analisar
 * @param {string} [file='']     - Nome do ficheiro (contexto)
 * @param {object} [opts={}]     - { rexOnly, quinnOnly }
 * @returns {RedTeamReport}
 */
function run(code, file = '', opts = {}) {
  const start = Date.now();

  append('redteam', EVENT_TYPES.RedTeamStarted, {
    file: file || '(snippet)',
    lines: code.split('\n').length,
    opts,
  });

  // Correr scanners em paralelo (síncrono mas independente)
  const rexFindings   = opts.quinnOnly ? [] : rexScan(code, file);
  const quinnFindings = opts.rexOnly   ? [] : quinnScan(code, file);

  // Deduplicar por id+linha (evita double-count se pattern é parecido)
  const seen     = new Set();
  const findings = [...rexFindings, ...quinnFindings].filter(f => {
    const key = `${f.id}:${f.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ordenar: critical → high → medium → low
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));

  const critical = findings.filter(f => f.severity === 'critical').length;
  const high     = findings.filter(f => f.severity === 'high').length;
  const medium   = findings.filter(f => f.severity === 'medium').length;
  const low      = findings.filter(f => f.severity === 'low').length;

  // Passed: zero critical E zero high
  const passed    = critical === 0 && high === 0;
  const timestamp = new Date().toISOString();

  const coverage = opts.rexOnly ? 'rex' : opts.quinnOnly ? 'quinn' : 'full';

  const report = {
    passed,
    timestamp,
    file:      file || '(snippet)',
    findings,
    critical,
    high,
    medium,
    low,
    coverage,
    signature: null,
    durationMs: Date.now() - start,
  };

  // @Rex assina se passou
  if (passed) {
    report.signature = sign(report);
  }

  append('redteam', passed ? EVENT_TYPES.RedTeamPassed : EVENT_TYPES.RedTeamFailed, {
    file:      report.file,
    critical,
    high,
    medium,
    low,
    passed,
    signed:    !!report.signature,
    durationMs: report.durationMs,
  });

  return report;
}

/**
 * Formata o relatório para output legível.
 * @param {RedTeamReport} report
 * @returns {string}
 */
function format(report) {
  const lines = [
    '\n=== KAIROS RED TEAM REPORT ===',
    `File:     ${report.file}`,
    `Passed:   ${report.passed ? '✅ YES' : '❌ NO'}`,
    `Duration: ${report.durationMs}ms`,
    `Coverage: ${report.coverage}`,
    '',
    `🔴 CRITICAL: ${report.critical}`,
    `🟠 HIGH:     ${report.high}`,
    `🟡 MEDIUM:   ${report.medium}`,
    `ℹ️  LOW:      ${report.low}`,
  ];

  if (report.findings.length > 0) {
    lines.push('\nFINDINGS:');
    for (const f of report.findings) {
      const icon = { critical: '🔴', high: '🟠', medium: '🟡', low: 'ℹ️ ' }[f.severity] || '❓';
      lines.push(`\n  ${icon} [${f.id}] ${f.label} (linha ${f.line})`);
      lines.push(`     ${f.message}`);
      lines.push(`     → ${f.fix}`);
      if (f.snippet) lines.push(`     Code: ${f.snippet}`);
      if (f.requiresManualReview) lines.push(`     ⚠️  Requer revisão manual`);
    }
  } else {
    lines.push('\n  ✅ Nenhum finding detectado.');
  }

  if (report.signature) {
    lines.push(`\n@Rex SignedApproval: ${report.signature.slice(0, 16)}...`);
  } else if (!report.passed) {
    lines.push('\n⛔ @Rex NÃO assinou — findings críticos ou altos presentes.');
    lines.push('   Corrigir todos os CRITICAL e HIGH antes de fazer commit.');
  }

  return lines.join('\n');
}

module.exports = { run, format };
