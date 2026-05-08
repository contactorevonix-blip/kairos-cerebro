// KAIROS Reputation Graph — Redis dual-write replicator
//
// Why dual-write: the hot path (queryPreVerdict + contribute) must remain
// synchronous and sub-millisecond. Hitting Redis on every API call is
// unacceptable cross-region. Instead we keep local JSON as the source of
// truth for hot reads, and asynchronously push every contribution and
// snapshot to Redis. Cold replicas (other regions, BI exports, partner
// feeds) read from Redis.
//
// Configure via env:
//   KAIROS_RG_REPLICATE_REDIS=1
//   KAIROS_REDIS_URL=redis://...
//   KAIROS_RG_NAMESPACE=prod-eu  (optional, defaults to "default")

'use strict';

const path = require('path');
const fs = require('fs');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

let redisAdapter = null;
let queue = [];
let timer = null;

function isEnabled() {
  return process.env.KAIROS_RG_REPLICATE_REDIS === '1' && Boolean(process.env.KAIROS_REDIS_URL);
}

function getRedis() {
  if (redisAdapter) return redisAdapter;
  if (!isEnabled()) return null;
  const { createRedisAdapter } = require('./adapters/redis-adapter');
  redisAdapter = createRedisAdapter({
    url: process.env.KAIROS_REDIS_URL,
    namespace: process.env.KAIROS_RG_NAMESPACE || 'default',
  });
  return redisAdapter;
}

function enqueueSnapshot(graph) {
  if (!isEnabled()) return;
  queue.push({ kind: 'snapshot', graph });
  scheduleFlush();
}

function enqueueContribution(record) {
  if (!isEnabled()) return;
  queue.push({ kind: 'contribution', record });
  scheduleFlush();
}

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => { flush().catch(() => { /* swallow; replication is best-effort */ }); }, 250);
}

async function flush() {
  timer = null;
  const r = getRedis();
  if (!r) { queue = []; return; }
  const batch = queue;
  queue = [];
  for (const item of batch) {
    try {
      if (item.kind === 'snapshot') await r.persistGraph(item.graph);
      if (item.kind === 'contribution') await r.appendContribution(item.record);
    } catch (err) {
      // Persist failed item to dead-letter queue for manual recovery.
      const dlq = path.join(DEFAULT_DIR, 'rg-dlq.jsonl');
      fs.appendFileSync(dlq, `${JSON.stringify({ at: new Date().toISOString(), error: err.message, item })}\n`);
    }
  }
}

module.exports = {
  isEnabled,
  enqueueSnapshot,
  enqueueContribution,
  flush,
};
