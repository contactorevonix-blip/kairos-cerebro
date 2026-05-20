'use strict';

/**
 * KAIROS HYPERDRIVE — Event Sourcing Ledger
 * Append-only event log com hash chain verificada.
 * Zero dependências externas.
 *
 * Schema de cada evento:
 *   id:        ULID (timestamp-based unique ID)
 *   timestamp: ISO8601
 *   actor:     AgentId | 'orchestrator' | 'human'
 *   type:      EventType (ver EVENT_TYPES)
 *   payload:   { ... }
 *   prevHash:  sha256 do evento anterior
 *   hash:      sha256(prevHash + canonicalJson(payload))
 */

const fs   = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Suporta override via env var para isolamento de testes
const LEDGER_PATH = process.env.KAIROS_LEDGER_PATH
  || path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'state-ledger.jsonl');

const EVENT_TYPES = {
  // Sistema
  SystemBoot:        'SystemBoot',
  RunInterrupted:    'RunInterrupted',
  SnapshotCreated:   'SnapshotCreated',
  LedgerVerified:    'LedgerVerified',
  // Tarefas
  TaskCreated:       'TaskCreated',
  TaskStarted:       'TaskStarted',
  TaskCompleted:     'TaskCompleted',
  TaskFailed:        'TaskFailed',
  // Consenso
  ProposalRequested: 'ProposalRequested',
  ProposalSubmitted: 'ProposalSubmitted',
  ConsensusReached:  'ConsensusReached',
  ConsensusEscalated:'ConsensusEscalated',
  // Código
  CodeGenerated:     'CodeGenerated',
  RedTeamStarted:    'RedTeamStarted',
  RedTeamPassed:     'RedTeamPassed',
  RedTeamFailed:     'RedTeamFailed',
  CommitCreated:     'CommitCreated',
  // Budget
  BudgetWarning:     'BudgetWarning',
  BudgetExceeded:    'BudgetHardStop',
};

/** Gera um ULID simples (timestamp + random) */
function ulid() {
  const ts  = Date.now().toString(36).toUpperCase().padStart(10, '0');
  const rnd = crypto.randomBytes(10).toString('hex').toUpperCase().slice(0, 16);
  return `${ts}${rnd}`;
}

/** JSON canónico (chaves ordenadas) para hashing determinístico */
function canonicalJson(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/** Lê o último evento para encadear o hash */
function lastHash() {
  try {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    if (!content) return '0'.repeat(64);
    const lines = content.split('\n').filter(Boolean);
    const last  = JSON.parse(lines[lines.length - 1]);
    return last.hash;
  } catch {
    return '0'.repeat(64);
  }
}

/** Adiciona um evento ao ledger */
function append(actor, type, payload = {}) {
  const prev    = lastHash();
  const id      = ulid();
  const timestamp = new Date().toISOString();
  const hashInput = prev + canonicalJson(payload);
  const hash    = crypto.createHash('sha256').update(hashInput).digest('hex');

  const event = { id, timestamp, actor, type, payload, prevHash: prev, hash };
  const line  = JSON.stringify(event) + '\n';

  fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });
  fs.appendFileSync(LEDGER_PATH, line, 'utf8');
  return event;
}

/** Verifica a integridade da hash chain */
function verify() {
  try {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    if (!content) {
      console.log('LEDGER: vazio — nenhum evento ainda.');
      return true;
    }

    const lines  = content.split('\n').filter(Boolean);
    let prevHash = '0'.repeat(64);
    let valid    = true;

    for (let i = 0; i < lines.length; i++) {
      const event    = JSON.parse(lines[i]);
      const expected = crypto.createHash('sha256')
        .update(event.prevHash + canonicalJson(event.payload))
        .digest('hex');

      if (event.prevHash !== prevHash) {
        console.error(`LEDGER FAIL: evento ${i} tem prevHash errado.`);
        valid = false;
      }
      if (event.hash !== expected) {
        console.error(`LEDGER FAIL: evento ${i} tem hash inválido.`);
        valid = false;
      }
      prevHash = event.hash;
    }

    if (valid) console.log(`LEDGER OK: ${lines.length} eventos verificados.`);
    return valid;
  } catch (err) {
    console.error('LEDGER ERROR:', err.message);
    return false;
  }
}

// CLI: node ledger.js --verify
if (require.main === module && process.argv.includes('--verify')) {
  process.exit(verify() ? 0 : 1);
}

module.exports = { append, verify, EVENT_TYPES, ulid };
