#!/usr/bin/env node
/**
 * post-tool-use-observer.cjs
 *
 * Observabilidade total: intercepta TODOS os tool events após execução.
 * Regista em log diário + actualiza métricas JSON.
 * Em falha: escreve para stderr (aparece como status message).
 *
 * Padrão: async: true — corre em background, nunca bloqueia a resposta.
 * Saída: sempre exit 0 — observação pura, sem controlo de fluxo.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(process.cwd(), '.claude', 'logs');
const today = new Date().toISOString().split('T')[0];
const LOG_FILE = path.join(LOGS_DIR, `session-${today}.log`);
const METRICS_FILE = path.join(LOGS_DIR, `metrics-${today}.json`);

// Garantir que logs/ existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');

    const toolName  = event.tool_name || 'unknown';
    const isError   = event.tool_response?.is_error === true;
    const ts        = new Date().toISOString();
    const status    = isError ? 'FAIL' : 'OK  ';

    // ─── Log diário ──────────────────────────────────────────────────────────
    // Formato: [timestamp] STATUS tool_name
    fs.appendFileSync(LOG_FILE, `[${ts}] ${status} ${toolName}\n`);

    // ─── Métricas ─────────────────────────────────────────────────────────────
    let metrics = { _session: { calls: 0, errors: 0 } };
    try {
      if (fs.existsSync(METRICS_FILE)) {
        metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      }
    } catch { /* ficheiro corrompido — recomeçar */ }

    if (!metrics[toolName]) metrics[toolName] = { calls: 0, errors: 0 };
    metrics[toolName].calls++;
    metrics._session.calls++;

    if (isError) {
      metrics[toolName].errors++;
      metrics._session.errors++;
    }

    metrics._last_updated = ts;
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));

    // ─── Status em falha ──────────────────────────────────────────────────────
    // stderr aparece como nota informativa; não afecta o fluxo
    if (isError) {
      process.stderr.write(`[observer] Tool falhou: ${toolName}\n`);
    }

  } catch (_) {
    // Falha silenciosa — nunca quebrar o flow do Claude
  }

  process.exit(0);
});
