'use strict';

/**
 * storage.test.js — Graph storage layer tests
 * Run: node packages/sniper-engine/graph/storage.test.js
 *
 * Covers:
 *  1. Basic recordCheck + queryEntity round-trip
 *  2. 1000 concurrent writes — integrity preserved
 *  3. Query performance p99 < 30ms
 *  4. Privacy: customer_id never stored plaintext
 *  5. Rate limit: max 1000 writes per customer per 24h
 *  6. Tombstone: tombstoned customer excluded from aggregation
 *  7. Count buckets: exact counts never exposed in formatGraphIntelligence
 *  8. Boost rules: unique_customers threshold (not raw count)
 */

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');

// Isolate tests to a temp directory
const TEST_DIR = path.join(os.tmpdir(), `kairos-graph-test-${Date.now()}`);
process.env.KAIROS_DB_DIR = TEST_DIR;
process.env.GRAPH_PEPPER  = crypto.randomBytes(32).toString('hex'); // 64 chars

const {
  recordCheck, queryEntity, computeBoost, formatGraphIntelligence,
  addTombstone, isTombstoned, hashCustomer, aggregate, toBucket,
} = require('./storage');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => { console.log(`  ✅ ${name}`); passed++; })
        .catch(err => { console.log(`  ❌ ${name}: ${err.message}`); failed++; });
    }
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

// ─── Test suite ──────────────────────────────────────────────────────────────

async function run() {
  console.log('\n=== Graph Storage Tests ===\n');
  console.log(`Test dir: ${TEST_DIR}\n`);

  // ── 1. Basic round-trip ──────────────────────────────────────────────────
  console.log('1. Basic round-trip');

  await asyncTest('recordCheck returns { recorded: true }', async () => {
    const r = await recordCheck({
      entity: 'paypa1-secure.com', type: 'domain',
      score: 95, verdict: 'block',
      signals: ['brand-impersonation:typosquat'],
      customerId: 'cust_001',
    });
    assert.strictEqual(r.recorded, true);
    assert.ok(r.hash, 'hash present');
  });

  await asyncTest('queryEntity returns aggregated data after write', async () => {
    const agg = queryEntity({ entity: 'paypa1-secure.com', type: 'domain' });
    assert.ok(agg, 'agg not null');
    assert.strictEqual(agg.check_count_24h, 1);
    assert.strictEqual(agg.unique_customers_24h, 1);
    assert.strictEqual(agg.avg_score_24h, 95);
  });

  await asyncTest('queryEntity returns null for unseen entity', async () => {
    const agg = queryEntity({ entity: 'definitely-not-seen.xyz', type: 'domain' });
    assert.strictEqual(agg, null);
  });

  await asyncTest('cache hit: second query is faster (aggregated cache written)', async () => {
    // Warm cache with first query (already done above)
    const t0 = Date.now();
    for (let i = 0; i < 100; i++) queryEntity({ entity: 'paypa1-secure.com', type: 'domain' });
    const elapsed = Date.now() - t0;
    assert.ok(elapsed < 100, `100 cache-hit queries in ${elapsed}ms (expected < 100ms)`);
  });

  // ── 2. Concurrent writes — integrity ────────────────────────────────────
  console.log('\n2. Concurrent writes (1000)');

  await asyncTest('1000 concurrent recordCheck preserve integrity', async () => {
    const entity = 'concurrent-test.com';
    const writes = Array.from({ length: 1000 }, (_, i) =>
      recordCheck({
        entity, type: 'domain',
        score: 70 + (i % 30), verdict: 'block',
        signals: [`sig-${i}`],
        customerId: `cust_${String(i % 50).padStart(3, '0')}`, // 50 unique customers
      })
    );
    const results = await Promise.all(writes);
    const recorded = results.filter(r => r.recorded).length;
    assert.ok(recorded > 0, `At least some writes recorded (got ${recorded})`);

    // Verify file integrity: every line must be valid JSON
    const agg = queryEntity({ entity, type: 'domain' });
    assert.ok(agg, 'agg not null after concurrent writes');
    assert.ok(agg.check_count_24h > 0, `check_count_24h = ${agg.check_count_24h}`);
    // unique customers capped at 50
    assert.ok(agg.unique_customers_24h <= 50, `unique_customers_24h ≤ 50, got ${agg.unique_customers_24h}`);
  });

  // ── 3. Query performance p99 < 30ms ─────────────────────────────────────
  console.log('\n3. Query performance');

  await asyncTest('queryEntity p99 < 30ms over 200 calls', async () => {
    // Seed a fresh entity with 200 raw events (no aggregated cache)
    const perfEntity = `perf-test-${Date.now()}.com`;
    for (let i = 0; i < 200; i++) {
      await recordCheck({
        entity: perfEntity, type: 'domain',
        score: 80, verdict: 'block',
        signals: [], customerId: `perf_${i}`,
      });
    }

    const latencies = [];
    for (let i = 0; i < 200; i++) {
      const t0 = Date.now();
      queryEntity({ entity: perfEntity, type: 'domain' });
      latencies.push(Date.now() - t0);
    }
    latencies.sort((a, b) => a - b);
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    console.log(`     p50=${latencies[Math.floor(latencies.length*0.5)]}ms p95=${latencies[Math.floor(latencies.length*0.95)]}ms p99=${p99}ms`);
    assert.ok(p99 < 30, `p99 = ${p99}ms (must be < 30ms)`);
  });

  // ── 4. Privacy: customer_id never stored plaintext ───────────────────────
  console.log('\n4. Privacy');

  await asyncTest('customer_id never appears in any JSONL file', async () => {
    const sensitiveId = 'SENSITIVE_CUSTOMER_ID_DO_NOT_LOG_cust_privacy_999';
    await recordCheck({
      entity: 'privacy-test.com', type: 'domain',
      score: 50, verdict: 'review',
      signals: [], customerId: sensitiveId,
    });

    // Scan all JSONL files for the raw customer_id
    let found = false;
    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scanDir(full);
        else if (entry.name.endsWith('.jsonl')) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(sensitiveId)) found = true;
        }
      }
    }
    scanDir(path.join(TEST_DIR, 'graph'));
    assert.strictEqual(found, false, 'Raw customer_id found in JSONL files!');
  });

  await asyncTest('customer_hash in JSONL is 16-char hex (HMAC output)', async () => {
    const entity = 'hmac-test.com';
    await recordCheck({
      entity, type: 'domain', score: 60, verdict: 'block',
      signals: [], customerId: 'test_hmac_customer',
    });

    const { hashEntity, rawPath } = require('./storage');
    const eh = hashEntity('domain', entity);
    const rp = rawPath('domain', eh);
    const lines = fs.readFileSync(rp, 'utf8').split('\n').filter(Boolean);
    const last = JSON.parse(lines[lines.length - 1]);
    assert.ok(/^[0-9a-f]{16}$/.test(last.c), `c="${last.c}" — must be 16 hex chars`);
  });

  await asyncTest('different GRAPH_PEPPER produces different customer_hash', () => {
    const id = 'same_customer';
    const h1 = hashCustomer(id);
    const oldPepper = process.env.GRAPH_PEPPER;
    process.env.GRAPH_PEPPER = crypto.randomBytes(32).toString('hex');
    const h2 = hashCustomer(id);
    process.env.GRAPH_PEPPER = oldPepper;
    assert.notStrictEqual(h1, h2, 'Same customer_id with different pepper must produce different hash');
  });

  // ── 5. Rate limit ────────────────────────────────────────────────────────
  console.log('\n5. Rate limit');

  await asyncTest('rate limit blocks after 1000 writes per customer', async () => {
    const limitedCustomer = `rate_limit_test_${Date.now()}`;
    let rateLimited = 0;
    // Send 1100 writes — first 1000 should pass, remainder should be rate-limited
    for (let i = 0; i < 1100; i++) {
      const r = await recordCheck({
        entity: `rl-entity-${i % 10}.com`, type: 'domain',
        score: 60, verdict: 'block', signals: [], customerId: limitedCustomer,
      });
      if (!r.recorded && r.reason === 'rate_limited') rateLimited++;
    }
    assert.ok(rateLimited >= 100, `Expected ≥100 rate-limited writes, got ${rateLimited}`);
  });

  // ── 6. Tombstone ─────────────────────────────────────────────────────────
  console.log('\n6. Tombstone');

  await asyncTest('tombstoned customer is rejected on recordCheck', async () => {
    const tombCust = `tombstone_cust_${Date.now()}`;
    addTombstone(tombCust);
    assert.strictEqual(isTombstoned(hashCustomer(tombCust)), true);
    const r = await recordCheck({
      entity: 'tombstone-test.com', type: 'domain',
      score: 80, verdict: 'block', signals: [], customerId: tombCust,
    });
    assert.strictEqual(r.recorded, false);
    assert.strictEqual(r.reason, 'tombstoned');
  });

  await asyncTest('tombstoned customer excluded from aggregation', async () => {
    const custA = `agg_cust_a_${Date.now()}`;
    const custB = `agg_cust_b_${Date.now()}`;
    const entity = `tombstone-agg-${Date.now()}.com`;

    // Both write records
    for (let i = 0; i < 5; i++) {
      await recordCheck({ entity, type: 'domain', score: 90, verdict: 'block', signals: [], customerId: custA });
      await recordCheck({ entity, type: 'domain', score: 90, verdict: 'block', signals: [], customerId: custB });
    }

    const aggBefore = queryEntity({ entity, type: 'domain' });
    assert.strictEqual(aggBefore.unique_customers_24h, 2, 'Should have 2 unique customers before tombstone');

    // Now tombstone custB and re-aggregate from raw lines
    addTombstone(custB);
    const custBHash = hashCustomer(custB);
    const tombstonedHashes = new Set([custBHash]);

    const { hashEntity, rawPath, aggregate } = require('./storage');
    const eh = hashEntity('domain', entity);
    const rp = rawPath('domain', eh);
    const lines = fs.readFileSync(rp, 'utf8').split('\n').filter(Boolean);
    const aggAfter = aggregate(lines, tombstonedHashes);

    assert.strictEqual(aggAfter.unique_customers_24h, 1, 'Should have 1 unique customer after tombstone exclusion');
  });

  // ── 7. Count buckets ─────────────────────────────────────────────────────
  console.log('\n7. Count buckets');

  test('toBucket maps correctly', () => {
    assert.strictEqual(toBucket(0),   '0');
    assert.strictEqual(toBucket(1),   '1-4');
    assert.strictEqual(toBucket(4),   '1-4');
    assert.strictEqual(toBucket(5),   '5-49');
    assert.strictEqual(toBucket(49),  '5-49');
    assert.strictEqual(toBucket(50),  '50-499');
    assert.strictEqual(toBucket(499), '50-499');
    assert.strictEqual(toBucket(500), '500+');
    assert.strictEqual(toBucket(999), '500+');
  });

  test('formatGraphIntelligence uses buckets not exact counts', () => {
    const agg = { check_count_24h: 12, check_count_7d: 45, unique_customers_7d: 3, first_seen: Date.now(), trend: 'rising' };
    const out = formatGraphIntelligence(agg, 20);
    assert.strictEqual(out.seen_24h, '5-49', `seen_24h should be "5-49", got "${out.seen_24h}"`);
    assert.strictEqual(out.seen_7d, '5-49');
    assert.strictEqual(out.unique_customers_7d, '1-4');
    assert.ok(!Object.values(out).some(v => v === 12 || v === 45 || v === 3), 'Exact counts must not appear in output');
  });

  // ── 8. Boost rules ───────────────────────────────────────────────────────
  console.log('\n8. Boost rules');

  test('computeBoost +20 when avg_score_24h > 70 and unique_customers_7d >= 3', () => {
    const agg = { avg_score_24h: 85, unique_customers_7d: 3, unique_customers_30d: 5, avg_score_7d: 80 };
    assert.strictEqual(computeBoost(agg), 20);
  });

  test('computeBoost -10 when avg_score_24h < 30 and unique_customers_30d >= 10', () => {
    const agg = { avg_score_24h: 5, unique_customers_7d: 2, unique_customers_30d: 10, avg_score_7d: 8 };
    assert.strictEqual(computeBoost(agg), -10);
  });

  test('computeBoost 0 when thresholds not met', () => {
    const agg = { avg_score_24h: 85, unique_customers_7d: 2, unique_customers_30d: 5, avg_score_7d: 80 };
    assert.strictEqual(computeBoost(agg), 0);
  });

  test('computeBoost 0 for null agg (graceful)', () => {
    assert.strictEqual(computeBoost(null), 0);
  });

  test('no boost from single customer (unique_customers_7d = 1, even if score high)', () => {
    const agg = { avg_score_24h: 99, unique_customers_7d: 1, unique_customers_30d: 1 };
    assert.strictEqual(computeBoost(agg), 0, 'Single customer must not trigger +20 boost');
  });

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n=== ${passed + failed} tests: ${passed} passed, ${failed} failed ===\n`);

  // Cleanup temp dir
  try { fs.rmSync(TEST_DIR, { recursive: true, force: true }); }
  catch { /* best-effort */ }

  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
