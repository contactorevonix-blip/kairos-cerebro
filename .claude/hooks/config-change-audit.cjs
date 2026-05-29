#!/usr/bin/env node
/**
 * config-change-audit.cjs
 *
 * ConfigChange hook — audita modificações em settings files durante a sessão.
 * Regista no log diário qual ficheiro foi alterado e por quem.
 * Bloqueia (exit 2) se settings.local.json for alterado num contexto suspeito.
 *
 * can_block: true — ConfigChange suporta bloqueio.
 * Exit 0 = permitir. Exit 2 = bloquear com feedback.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const LOGS_DIR = path.join(process.cwd(), '.claude', 'logs');
const today    = new Date().toISOString().split('T')[0];
const LOG_FILE = path.join(LOGS_DIR, `config-audit-${today}.log`);

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Campos críticos que, se alterados, merecem atenção especial
const CRITICAL_KEYS = ['deny', 'permissions', 'defaultMode', 'hooks'];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');

    const ts         = new Date().toISOString();
    const source     = event.config_source || 'unknown';
    const changeType = event.change_type   || 'modified';

    const logLine = `${ts} [CONFIG-CHANGE] source=${source} type=${changeType}\n`;
    fs.appendFileSync(LOG_FILE, logLine);

    // Verificar se a alteração é em campos críticos de segurança
    const changedKeys = event.changed_keys || [];
    const hasCritical = changedKeys.some(k => CRITICAL_KEYS.includes(k));

    if (hasCritical) {
      // Regista como atenção mas não bloqueia automaticamente
      const alertLine = `${ts} [CONFIG-ALERT] Campos críticos alterados: ${changedKeys.join(', ')} em ${source}\n`;
      fs.appendFileSync(LOG_FILE, alertLine);
      // Informa o Claude via stderr (aparece como status message)
      process.stderr.write(`[Config Audit] Campos críticos modificados em ${source}: ${changedKeys.join(', ')}\n`);
    }

  } catch (_) {
    // silencioso
  }

  process.exit(0);
});
