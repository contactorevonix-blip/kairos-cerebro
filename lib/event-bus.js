'use strict';

// Event Bus central — in-process EventEmitter + persistência JSONL para IPC cross-process
// Cross-process: cada script escreve em events.jsonl; supervisor lê e reage
// In-process: EventEmitter standard para módulos no mesmo processo

const EventEmitter = require('events');
const fs   = require('fs');
const path = require('path');

const DB_DIR = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const EVENTS_FILE = path.join(DB_DIR, 'events.jsonl');

class KairosBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(30);
  }

  // Publica evento in-process E persiste em disco para IPC
  publish(event, data = {}) {
    const entry = { ts: new Date().toISOString(), event, ...data };
    this.emit(event, entry);
    this.emit('*', entry); // wildcard listener

    try {
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
      fs.appendFileSync(EVENTS_FILE, JSON.stringify(entry) + '\n');
    } catch { /* não bloquear se o disco falhar */ }

    return entry;
  }

  // Lê eventos persistidos para outro processo processar
  readSince(ms = Date.now() - 3_600_000) {
    if (!fs.existsSync(EVENTS_FILE)) return [];
    return fs.readFileSync(EVENTS_FILE, 'utf8')
      .split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(e => e && new Date(e.ts).getTime() > ms);
  }

  // Filtra por tipo de evento
  readByType(eventName, ms) {
    return this.readSince(ms).filter(e => e.event === eventName);
  }
}

// Singleton — mesmo processo partilha sempre a mesma instância
const bus = new KairosBus();

// Eventos canónicos do Kairos
bus.EVENTS = {
  API_ERROR:        'api:error',
  API_CHECK:        'api:check',
  QUOTA_WARNING:    'quota:warning',
  QUOTA_EXCEEDED:   'quota:exceeded',
  SUPERVISOR_ALERT: 'supervisor:alert',
  CHURN_RISK:       'churn:risk',
  UPGRADE_SIGNAL:   'upgrade:signal',
  FIRST_CALL:       'tenant:first_call',
  UPGRADED:         'tenant:upgraded',
};

module.exports = bus;
