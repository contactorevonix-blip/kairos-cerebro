// KAIROS — Webhook Outbox v1
// Reliable async delivery of high-severity events to partner endpoints.
// Features:
//   - HMAC-SHA256 signature on every payload (prevents spoofing/MITM)
//   - Exponential backoff retry (1s, 5s, 30s, 5m, 30m, 3h)
//   - Append-only outbox JSONL persistence
//   - Pluggable HTTP client (defaults to node:https) for testability
// Storage: outbox.jsonl (append-only) + outbox-state.json (last status per id)

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

const FILES = {
  outbox: 'outbox.jsonl',
  state: 'outbox-state.json',
};

const RETRY_SCHEDULE_MS = [1_000, 5_000, 30_000, 300_000, 1_800_000, 10_800_000];
const MAX_ATTEMPTS = RETRY_SCHEDULE_MS.length;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fpath(name, dir = DEFAULT_DIR) { return path.join(dir, FILES[name]); }

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function writeJsonAtomic(file, payload) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function appendJsonl(file, record) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function nowIso() { return new Date().toISOString(); }

function sign(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function loadState(dir = DEFAULT_DIR) {
  return readJson(fpath('state', dir), { byId: {} });
}

function persistState(state, dir = DEFAULT_DIR) {
  writeJsonAtomic(fpath('state', dir), state);
}

function enqueue({ url, secret, event, payload, dir = DEFAULT_DIR } = {}) {
  if (!url || !secret || !event || payload === undefined) {
    throw new Error('enqueue: url, secret, event and payload are required');
  }
  const id = crypto.randomUUID();
  const record = {
    id,
    enqueuedAt: nowIso(),
    url,
    event,
    payload,
    secretHash: crypto.createHash('sha256').update(String(secret)).digest('hex').substring(0, 12),
  };
  appendJsonl(fpath('outbox', dir), record);
  const state = loadState(dir);
  state.byId[id] = {
    id, url, event, status: 'pending', attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
  };
  persistState(state, dir);
  return record;
}

function listOutbox(dir = DEFAULT_DIR) {
  const file = fpath('outbox', dir);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

function findOutboxRecord(id, dir = DEFAULT_DIR) {
  return listOutbox(dir).find((r) => r.id === id) || null;
}

function defaultHttpClient(reqUrl, body, headers, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try { urlObj = new URL(reqUrl); }
    catch { return reject(new Error(`Invalid URL: ${reqUrl}`)); }
    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        method: 'POST',
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: `${urlObj.pathname || '/'}${urlObj.search || ''}`,
        headers,
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => { chunks += c; });
        res.on('end', () => resolve({ status: res.statusCode || 0, body: chunks.substring(0, 1000) }));
        res.on('error', reject);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function deliver({ id, secret, dir = DEFAULT_DIR, httpClient = defaultHttpClient } = {}) {
  if (!id || !secret) throw new Error('deliver: id and secret required');
  const state = loadState(dir);
  const entry = state.byId[id];
  if (!entry) throw new Error(`outbox entry not found: ${id}`);
  if (entry.status === 'delivered') return { status: 'already-delivered' };
  const record = findOutboxRecord(id, dir);
  if (!record) throw new Error(`outbox record not found: ${id}`);

  const body = JSON.stringify({
    id: record.id,
    enqueuedAt: record.enqueuedAt,
    event: record.event,
    payload: record.payload,
  });
  const signature = sign(secret, body);
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'x-kairos-event': record.event,
    'x-kairos-id': record.id,
    'x-kairos-signature': `sha256=${signature}`,
  };

  entry.attempts += 1;
  entry.lastAttemptAt = nowIso();

  try {
    const res = await httpClient(record.url, body, headers);
    if (res.status >= 200 && res.status < 300) {
      entry.status = 'delivered';
      entry.deliveredAt = nowIso();
      entry.lastError = null;
      persistState(state, dir);
      return { status: 'delivered', httpStatus: res.status };
    }
    entry.lastError = `HTTP ${res.status}: ${(res.body || '').substring(0, 200)}`;
  } catch (err) {
    entry.lastError = String(err.message || err);
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.status = 'failed';
    persistState(state, dir);
    return { status: 'failed', lastError: entry.lastError, attempts: entry.attempts };
  }
  const wait = RETRY_SCHEDULE_MS[entry.attempts - 1] || RETRY_SCHEDULE_MS[MAX_ATTEMPTS - 1];
  entry.nextAttemptAt = new Date(Date.now() + wait).toISOString();
  entry.status = 'pending';
  persistState(state, dir);
  return { status: 'pending', nextAttemptAt: entry.nextAttemptAt, attempts: entry.attempts };
}

function listPending(dir = DEFAULT_DIR) {
  const state = loadState(dir);
  const now = Date.now();
  return Object.values(state.byId).filter(
    (e) => e.status === 'pending' && new Date(e.nextAttemptAt).getTime() <= now
  );
}

function getStatus(id, dir = DEFAULT_DIR) {
  return loadState(dir).byId[id] || null;
}

module.exports = {
  enqueue,
  deliver,
  listPending,
  listOutbox,
  getStatus,
  sign,
  RETRY_SCHEDULE_MS,
  MAX_ATTEMPTS,
};
