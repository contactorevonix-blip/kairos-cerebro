// KAIROS Reputation Graph — Redis adapter (production, zero-dep RESP2 client)
//
// Speaks the Redis Serialization Protocol (RESP2) over a raw TCP socket. We
// intentionally avoid external SDKs to keep the supply chain locked-down and
// auditable. Performance is sufficient for the graph workload (1 GET + 1 SET
// per verification, both on the hot path of the API).
//
// Commands used: GET, SET, RPUSH, EXPIRE, PING, AUTH, SELECT, DEL.
// Sharding model: a single key holds the snapshot JSON. When scale demands it,
// upgrade to per-node hash keys (HSET reputation:node:<key> ...) — the public
// adapter interface does not change.

'use strict';

const net = require('node:net');
const { URL } = require('node:url');

const SNAPSHOT_KEY = 'kairos:rg:snapshot';
const CONTRIB_LIST_KEY = 'kairos:rg:contributions';

function encodeCommand(args) {
  let out = `*${args.length}\r\n`;
  for (const arg of args) {
    const s = typeof arg === 'string' ? arg : Buffer.isBuffer(arg) ? arg.toString('utf8') : String(arg);
    const buf = Buffer.from(s, 'utf8');
    out += `$${buf.length}\r\n${buf.toString('utf8')}\r\n`;
  }
  return Buffer.from(out, 'utf8');
}

function parseRespBuffer(buf, offset = 0) {
  // Minimal RESP2 parser — sufficient for GET/SET/RPUSH/PING/AUTH return values.
  if (offset >= buf.length) return null;
  const type = String.fromCharCode(buf[offset]);
  if (type === '+') {
    const end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    return { value: buf.slice(offset + 1, end).toString('utf8'), nextOffset: end + 2 };
  }
  if (type === '-') {
    const end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    const err = buf.slice(offset + 1, end).toString('utf8');
    const e = new Error(`REDIS_ERROR: ${err}`); e.code = 'REDIS_ERROR';
    return { value: e, nextOffset: end + 2 };
  }
  if (type === ':') {
    const end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    return { value: Number(buf.slice(offset + 1, end).toString('utf8')), nextOffset: end + 2 };
  }
  if (type === '$') {
    const end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    const length = Number(buf.slice(offset + 1, end).toString('utf8'));
    if (length === -1) return { value: null, nextOffset: end + 2 };
    const start = end + 2;
    if (start + length + 2 > buf.length) return null;
    return { value: buf.slice(start, start + length).toString('utf8'), nextOffset: start + length + 2 };
  }
  if (type === '*') {
    const end = buf.indexOf('\r\n', offset);
    if (end < 0) return null;
    const count = Number(buf.slice(offset + 1, end).toString('utf8'));
    if (count === -1) return { value: null, nextOffset: end + 2 };
    let cur = end + 2;
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const item = parseRespBuffer(buf, cur);
      if (!item) return null;
      out.push(item.value);
      cur = item.nextOffset;
    }
    return { value: out, nextOffset: cur };
  }
  return null;
}

function createConnection({ host, port, password, db, tls = false, connectTimeoutMs = 5_000 } = {}) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    sock.setNoDelay(true);
    sock.setTimeout(connectTimeoutMs, () => {
      sock.destroy(new Error('REDIS_CONNECT_TIMEOUT'));
    });
    sock.once('error', reject);
    sock.once('connect', async () => {
      sock.removeListener('error', reject);
      let buf = Buffer.alloc(0);
      const pending = [];
      sock.on('data', (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        while (pending.length > 0) {
          const parsed = parseRespBuffer(buf, 0);
          if (!parsed) break;
          buf = buf.slice(parsed.nextOffset);
          const { resolve: r, reject: rj } = pending.shift();
          if (parsed.value instanceof Error) rj(parsed.value);
          else r(parsed.value);
        }
      });
      sock.on('error', (err) => {
        while (pending.length > 0) pending.shift().reject(err);
      });

      function command(args) {
        return new Promise((r, rj) => {
          pending.push({ resolve: r, reject: rj });
          sock.write(encodeCommand(args));
        });
      }

      try {
        if (password) await command(['AUTH', password]);
        if (Number.isFinite(db)) await command(['SELECT', String(db)]);
        resolve({ sock, command });
      } catch (e) {
        sock.destroy();
        reject(e);
      }
    });
  });
}

function emptyGraph() {
  return { version: 1, updatedAt: new Date().toISOString(), nodes: {} };
}

function createRedisAdapter({ url = process.env.KAIROS_REDIS_URL, namespace = 'default' } = {}) {
  if (!url) throw new Error('redis-adapter: url required (KAIROS_REDIS_URL)');
  const parsed = new URL(url);
  const opts = {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password || undefined,
    db: parsed.pathname && parsed.pathname.length > 1 ? Number(parsed.pathname.substring(1)) : 0,
  };

  let conn = null;
  async function getConn() {
    if (conn && !conn.sock.destroyed) return conn;
    conn = await createConnection(opts);
    conn.sock.on('close', () => { conn = null; });
    return conn;
  }

  const key = (k) => `${k}:${namespace}`;

  async function loadGraph() {
    const c = await getConn();
    const raw = await c.command(['GET', key(SNAPSHOT_KEY)]);
    if (!raw) return emptyGraph();
    try { return JSON.parse(raw); } catch { return emptyGraph(); }
  }

  async function persistGraph(graph) {
    graph.updatedAt = new Date().toISOString();
    const c = await getConn();
    await c.command(['SET', key(SNAPSHOT_KEY), JSON.stringify(graph)]);
  }

  async function appendContribution(record) {
    const c = await getConn();
    await c.command(['RPUSH', key(CONTRIB_LIST_KEY), JSON.stringify(record)]);
    // Keep last 100k contributions to bound memory; older are exported elsewhere.
    await c.command(['LTRIM', key(CONTRIB_LIST_KEY), '-100000', '-1']);
  }

  async function invalidateCache() { /* Redis is the cache */ }

  async function disconnect() {
    if (conn) { try { conn.sock.destroy(); } catch { /* swallow */ } }
    conn = null;
  }

  return {
    type: 'redis',
    loadGraph,
    persistGraph,
    appendContribution,
    invalidateCache,
    disconnect,
  };
}

module.exports = { createRedisAdapter, encodeCommand, parseRespBuffer };
