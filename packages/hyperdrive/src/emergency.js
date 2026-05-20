'use strict';

/**
 * KAIROS HYPERDRIVE — Sistema de Emergência
 * Pausa instantânea via ficheiro-flag. Zero deps.
 *
 * Mecanismo:
 *   PAUSE_FLAG existe → qualquer agente que verifica para imediatamente
 *   PAUSE_FLAG removido → execução retoma
 *
 * Qualquer processo pode verificar isPaused() antes de cada step.
 */

const fs   = require('node:fs');
const path = require('node:path');
const { append, EVENT_TYPES } = require('./memory/ledger');

const MEMORY_DIR  = path.join(__dirname, '..', '..', '..', '.claude', 'memory');
const PAUSE_FLAG  = path.join(MEMORY_DIR, 'EMERGENCY_PAUSE');

function isPaused() {
  return fs.existsSync(PAUSE_FLAG);
}

function pause(reason = 'Manual') {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
  fs.writeFileSync(PAUSE_FLAG, JSON.stringify({
    reason,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  }), 'utf8');

  append('orchestrator', EVENT_TYPES.RunInterrupted, { reason, pid: process.pid });
  return { paused: true, reason, timestamp: new Date().toISOString() };
}

function resume() {
  if (!fs.existsSync(PAUSE_FLAG)) return { resumed: false, reason: 'Não estava pausado' };
  fs.unlinkSync(PAUSE_FLAG);
  append('orchestrator', EVENT_TYPES.SystemBoot, { action: 'resume', pid: process.pid });
  return { resumed: true, timestamp: new Date().toISOString() };
}

function getStatus() {
  if (!fs.existsSync(PAUSE_FLAG)) return { paused: false };
  try {
    const data = JSON.parse(fs.readFileSync(PAUSE_FLAG, 'utf8'));
    return { paused: true, ...data };
  } catch {
    return { paused: true, reason: 'unknown', timestamp: 'unknown' };
  }
}

/**
 * Verifica se está pausado e lança erro se sim.
 * Chamar antes de cada step crítico do orquestrador.
 */
function assertNotPaused() {
  if (isPaused()) {
    const status = getStatus();
    throw new Error(`HYPERDRIVE PAUSADO: ${status.reason}. Correr --resume para continuar.`);
  }
}

module.exports = { isPaused, pause, resume, getStatus, assertNotPaused, PAUSE_FLAG };
