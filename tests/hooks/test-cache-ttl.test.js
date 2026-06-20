/**
 * test-cache-ttl.test.js — Story 12.3 (NFR-1.3, research.json RT-3.cache_strategy)
 *
 * Validates the agent-context cache: hit/miss, 1h TTL freshness, persistence at
 * `.aiox/.agent-context-cache.json`, clearCache, corrupt-cache resilience, and
 * cache-hit-rate metrics (> 80% target after warm-up).
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  SurfaceReconciler,
  CACHE_TTL_MS,
  CACHE_RELATIVE_PATH,
  DEGRADATION_LEVEL,
} = require('../../.aiox-core/development/scripts/surface-reconciler');

function makeProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'surf-cache-'));
  const agentId = 'dev';
  const abs = path.join(root, '.claude', 'agents', `aiox-${agentId}.md`);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, '# dev\nUser surface content.', 'utf8');
  return { root, agentId, surfacePath: abs };
}

function cleanup(root) {
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

test('Agent-context cache TTL (NFR-1.3, RT-3.cache_strategy)', async (t) => {
  await t.test('AC4: TTL constant is exactly 1 hour', () => {
    assert.strictEqual(CACHE_TTL_MS, 60 * 60 * 1000, 'TTL must be 1h per RT-3');
  });

  await t.test('AC4: cache path is .aiox/.agent-context-cache.json', () => {
    assert.strictEqual(CACHE_RELATIVE_PATH, path.join('.aiox', '.agent-context-cache.json'));
  });

  await t.test('first reconcile is a miss; cache file is written', () => {
    const { root, agentId } = makeProject();
    try {
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.cacheHit, false, 'first call must be a miss');
      const cacheFile = path.join(root, CACHE_RELATIVE_PATH);
      assert.ok(fs.existsSync(cacheFile), 'cache file persisted');
      const store = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      assert.ok(store.agents[agentId], 'agent entry present in cache');
      assert.strictEqual(typeof store.agents[agentId].cachedAt, 'number');
    } finally {
      cleanup(root);
    }
  });

  await t.test('second reconcile is a fresh cache hit (L1)', () => {
    const { root, agentId } = makeProject();
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {} });
      recon.reconcile(agentId); // warm
      const r2 = recon.reconcile(agentId);
      assert.strictEqual(r2.cacheHit, true, 'second call hits cache');
      assert.strictEqual(r2.degradationLevel, DEGRADATION_LEVEL.CACHE_HIT);
      assert.strictEqual(r2.source, 'cache');
    } finally {
      cleanup(root);
    }
  });

  await t.test('forceRefresh bypasses a fresh cache', () => {
    const { root, agentId } = makeProject();
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {} });
      recon.reconcile(agentId);
      const r2 = recon.reconcile(agentId, { forceRefresh: true });
      assert.strictEqual(r2.cacheHit, false, 'forceRefresh must re-read surfaces');
    } finally {
      cleanup(root);
    }
  });

  await t.test('stale cache (> TTL) is a miss and gets re-read', () => {
    const { root, agentId } = makeProject();
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {} });
      recon.reconcile(agentId);
      // Backdate the cached entry beyond TTL.
      const cacheFile = path.join(root, CACHE_RELATIVE_PATH);
      const store = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      store.agents[agentId].cachedAt = Date.now() - (CACHE_TTL_MS + 1000);
      fs.writeFileSync(cacheFile, JSON.stringify(store), 'utf8');

      const r = recon.reconcile(agentId);
      assert.strictEqual(r.cacheHit, false, 'stale entry must miss');
    } finally {
      cleanup(root);
    }
  });

  await t.test('entry just under TTL is still a hit (boundary)', () => {
    const { root, agentId } = makeProject();
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {} });
      recon.reconcile(agentId);
      const cacheFile = path.join(root, CACHE_RELATIVE_PATH);
      const store = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      store.agents[agentId].cachedAt = Date.now() - (CACHE_TTL_MS - 5000); // 5s short of TTL
      fs.writeFileSync(cacheFile, JSON.stringify(store), 'utf8');

      const r = recon.reconcile(agentId);
      assert.strictEqual(r.cacheHit, true, 'entry within TTL must hit');
    } finally {
      cleanup(root);
    }
  });

  await t.test('clearCache removes the cache file (forces re-read)', () => {
    const { root, agentId } = makeProject();
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {} });
      recon.reconcile(agentId);
      assert.strictEqual(recon.clearCache(), true, 'clearCache reports removal');
      const r = recon.reconcile(agentId);
      assert.strictEqual(r.cacheHit, false, 'after clear, next call is a miss');
    } finally {
      cleanup(root);
    }
  });

  await t.test('corrupt cache file is treated as miss (graceful)', () => {
    const { root, agentId } = makeProject();
    try {
      const cacheFile = path.join(root, CACHE_RELATIVE_PATH);
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile, '{ this is not json', 'utf8');
      const r = new SurfaceReconciler({ projectRoot: root, logger: () => {} }).reconcile(agentId);
      assert.strictEqual(r.cacheHit, false, 'corrupt cache must not throw or false-hit');
      assert.strictEqual(r.error, null);
    } finally {
      cleanup(root);
    }
  });

  await t.test('NFR-1.3: cache hit rate exceeds 80% after warm-up (10 loads)', () => {
    const { root, agentId } = makeProject();
    const records = [];
    const metricsSink = { record: (r) => records.push(r) };
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {}, metricsSink });
      for (let i = 0; i < 10; i++) recon.reconcile(agentId); // 1 miss + 9 hits
      const hits = records.filter((r) => r.cacheHit).length;
      const rate = hits / records.length;
      assert.ok(rate > 0.8, `cache hit rate ${(rate * 100).toFixed(0)}% must exceed 80%`);
    } finally {
      cleanup(root);
    }
  });

  await t.test('metricsSink receives a record per reconcile', () => {
    const { root, agentId } = makeProject();
    const records = [];
    const metricsSink = { record: (r) => records.push(r) };
    try {
      const recon = new SurfaceReconciler({ projectRoot: root, logger: () => {}, metricsSink });
      recon.reconcile(agentId);
      recon.reconcile(agentId);
      assert.strictEqual(records.length, 2, 'one metrics record per reconcile call');
    } finally {
      cleanup(root);
    }
  });
});
