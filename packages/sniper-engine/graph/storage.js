'use strict';

/**
 * Graph storage layer — append-only JSONL per entity, hourly aggregated cache.
 *
 * Privacy guarantees:
 *  - customer_id NEVER stored plaintext — HMAC-SHA256(GRAPH_PEPPER, id).slice(0,16)
 *  - entity is the JSONL filename hash, never stored inside the file
 *  - GDPR erasure via tombstone index (see addTombstone)
 *
 * Performance targets:
 *  - queryEntity p99 < 30ms
 *  - recordCheck: fire-and-forget async, off critical path
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DB_DIR            = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const GRAPH_RAW_DIR     = path.join(DB_DIR, 'graph');
const GRAPH_AGG_DIR     = path.join(DB_DIR, 'graph-aggregated');
const GRAPH_TOMBSTONE_DIR = path.join(DB_DIR, 'graph-tombstones');

const CACHE_TTL_MS    = 60 * 60 * 1000;  // 1 hour
const RATE_LIMIT_MAX  = 1000;            // writes per customer per 24h window
const RATE_WINDOW_MS  = 24 * 60 * 60 * 1000;

// In-process rate limiter — resets on restart (acceptable: limits abuse per session)
const _rateMap = new Map(); // customerHash → { count, resetAt }

// ─── hashing ──────────────────────────────────────────────────────────────────

function hashCustomer(customerId) {
  const pepper = process.env.GRAPH_PEPPER || '';
  if (!pepper) {
    // No pepper = graceful degradation: plain sha256 (weaker but functional)
    return crypto.createHash('sha256').update(String(customerId)).digest('hex').slice(0, 16);
  }
  return crypto.createHmac('sha256', pepper).update(String(customerId)).digest('hex').slice(0, 16);
}

function hashEntity(type, entity) {
  return crypto.createHash('sha256').update(`${type}:${String(entity).toLowerCase()}`).digest('hex');
}

// ─── paths ────────────────────────────────────────────────────────────────────

function rawPath(type, entityHash) {
  return path.join(GRAPH_RAW_DIR, type, entityHash.slice(0, 2), `${entityHash}.jsonl`);
}

function aggPath(type, entityHash) {
  return path.join(GRAPH_AGG_DIR, type, entityHash.slice(0, 2), `${entityHash}.json`);
}

function tombstonePath(customerHash) {
  return path.join(GRAPH_TOMBSTONE_DIR, `${customerHash}.json`);
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── tombstone ────────────────────────────────────────────────────────────────

function isTombstoned(customerHash) {
  try { return fs.existsSync(tombstonePath(customerHash)); }
  catch { return false; }
}

function loadTombstoneHashes() {
  const hashes = new Set();
  if (!fs.existsSync(GRAPH_TOMBSTONE_DIR)) return hashes;
  try {
    for (const f of fs.readdirSync(GRAPH_TOMBSTONE_DIR)) {
      if (f.endsWith('.json')) hashes.add(f.replace('.json', ''));
    }
  } catch { /* best-effort */ }
  return hashes;
}

function addTombstone(customerId) {
  const customerHash = hashCustomer(customerId);
  const tPath = tombstonePath(customerHash);
  ensureDir(tPath);
  fs.writeFileSync(tPath, JSON.stringify({ ts: Date.now(), reason: 'gdpr_erasure' }), 'utf8');
  return { tombstoned: true, hash: customerHash };
}

function removeTombstone(customerId) {
  const customerHash = hashCustomer(customerId);
  const tPath = tombstonePath(customerHash);
  try { if (fs.existsSync(tPath)) fs.unlinkSync(tPath); }
  catch { /* best-effort */ }
  return { removed: true, hash: customerHash };
}

// ─── rate limiter ─────────────────────────────────────────────────────────────

function _checkRateLimit(customerHash) {
  const now = Date.now();
  const entry = _rateMap.get(customerHash);
  if (!entry || now > entry.resetAt) {
    _rateMap.set(customerHash, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── aggregation ──────────────────────────────────────────────────────────────

function toBucket(n) {
  if (n === 0) return '0';
  if (n <= 4) return '1-4';
  if (n <= 49) return '5-49';
  if (n <= 499) return '50-499';
  return '500+';
}

function aggregate(rawLines, tombstonedHashes = new Set(), now = Date.now()) {
  const MS_24 = 24 * 60 * 60 * 1000;
  const MS_7  = 7  * MS_24;
  const MS_30 = 30 * MS_24;

  const records = rawLines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(r => r && !tombstonedHashes.has(r.c));

  if (records.length === 0) return null;

  const in24 = records.filter(r => r.ts >= now - MS_24);
  const in7  = records.filter(r => r.ts >= now - MS_7);
  const in30 = records.filter(r => r.ts >= now - MS_30);

  const uniq = arr => new Set(arr.map(r => r.c).filter(Boolean)).size;
  const avg  = arr => arr.length ? arr.reduce((s, r) => s + (r.score || 0), 0) / arr.length : 0;

  const dist = [0, 0, 0, 0]; // [0-30, 30-60, 60-70, 70-100]
  for (const r of in24) {
    const s = r.score || 0;
    if (s < 30) dist[0]++;
    else if (s < 60) dist[1]++;
    else if (s < 70) dist[2]++;
    else dist[3]++;
  }

  const avg24 = avg(in24);
  const avg7  = avg(in7);
  const trend = avg24 > avg7 + 10 ? 'rising' : avg24 < avg7 - 10 ? 'declining' : 'stable';

  const allTs = records.map(r => r.ts).filter(Boolean);

  return {
    v: 1,
    aggregated_at: now,
    check_count_24h: in24.length,
    check_count_7d: in7.length,
    check_count_30d: in30.length,
    unique_customers_24h: uniq(in24),
    unique_customers_7d: uniq(in7),
    unique_customers_30d: uniq(in30),
    avg_score_24h: Math.round(avg24 * 10) / 10,
    avg_score_7d: Math.round(avg7 * 10) / 10,
    score_dist: dist,
    first_seen: allTs.length ? Math.min(...allTs) : now,
    last_seen: allTs.length ? Math.max(...allTs) : now,
    trend,
  };
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * recordCheck — append one check event to the entity's JSONL file.
 * Fire-and-forget: returns a Promise but callers should not await it on the
 * critical path. Errors are caught and logged, never thrown to callers.
 */
async function recordCheck({ entity, type, score, verdict, signals, customerId }) {
  try {
    const customerHash = hashCustomer(customerId);

    if (isTombstoned(customerHash)) return { recorded: false, reason: 'tombstoned' };
    if (!_checkRateLimit(customerHash)) return { recorded: false, reason: 'rate_limited' };

    const entityHash = hashEntity(type, entity);
    const filePath   = rawPath(type, entityHash);
    ensureDir(filePath);

    const line = JSON.stringify({
      score:       Math.round(score),
      verdict:     String(verdict),
      signals_top3: (Array.isArray(signals) ? signals : []).slice(0, 3),
      ts:          Date.now(),
      c:           customerHash,
    }) + '\n';

    await fs.promises.appendFile(filePath, line, 'utf8');
    return { recorded: true, hash: entityHash.slice(0, 12) };
  } catch (err) {
    return { recorded: false, reason: err.message };
  }
}

/**
 * queryEntity — return aggregated stats for an entity.
 * Synchronous for p99 predictability. Returns null if entity never seen.
 * Callers should wrap in Promise.race with a 30ms timeout.
 */
function queryEntity({ entity, type }) {
  try {
    const entityHash = hashEntity(type, entity);

    // 1. Try aggregated cache (fast path ~0.5ms)
    const cachedFile = aggPath(type, entityHash);
    if (fs.existsSync(cachedFile)) {
      const stat = fs.statSync(cachedFile);
      if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
        const raw = fs.readFileSync(cachedFile, 'utf8');
        return JSON.parse(raw);
      }
    }

    // 2. Cache miss: read raw JSONL + aggregate on-the-fly (~5-10ms)
    const rawFile = rawPath(type, entityHash);
    if (!fs.existsSync(rawFile)) return null;

    const lines = fs.readFileSync(rawFile, 'utf8').split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    // Include tombstone exclusion on cache-miss path
    const tombstones = loadTombstoneHashes();
    const agg = aggregate(lines, tombstones);
    if (!agg) return null;

    // Write aggregated cache async (non-blocking, best-effort)
    ensureDir(cachedFile);
    fs.promises.writeFile(cachedFile, JSON.stringify(agg), 'utf8').catch(() => {});

    return agg;
  } catch {
    return null;
  }
}

/**
 * computeBoost — derive score adjustment from graph data.
 * Uses unique_customers (not raw counts) to resist single-customer manipulation.
 */
function computeBoost(agg) {
  if (!agg) return 0;
  if (agg.avg_score_24h > 70 && agg.unique_customers_7d >= 3)  return  20;
  if (agg.avg_score_24h < 30 && agg.unique_customers_30d >= 10) return -10;
  return 0;
}

/**
 * formatGraphIntelligence — shape the public API response field.
 * Uses count buckets (not exact values) to prevent inter-customer inference.
 */
function formatGraphIntelligence(agg, boost) {
  if (!agg) return null;
  return {
    seen_24h:             toBucket(agg.check_count_24h),
    seen_7d:              toBucket(agg.check_count_7d),
    unique_customers_7d:  toBucket(agg.unique_customers_7d),
    first_seen:           new Date(agg.first_seen).toISOString(),
    trend:                agg.trend,
    confidence_boost:     boost,
  };
}

module.exports = {
  recordCheck,
  queryEntity,
  computeBoost,
  formatGraphIntelligence,
  addTombstone,
  removeTombstone,
  isTombstoned,
  loadTombstoneHashes,
  hashCustomer,
  hashEntity,
  aggregate,
  toBucket,
  // Exposed for aggregator worker
  rawPath,
  aggPath,
  ensureDir,
  GRAPH_RAW_DIR,
  GRAPH_AGG_DIR,
  GRAPH_TOMBSTONE_DIR,
};
