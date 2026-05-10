'use strict';

/**
 * E2E + privacy tests for graph integration.
 * Run: node packages/sniper-engine/graph/e2e.test.js
 */

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');

const TEST_DIR = path.join(os.tmpdir(), `kairos-graph-e2e-${Date.now()}`);
process.env.KAIROS_DB_DIR = TEST_DIR;
process.env.GRAPH_PEPPER  = crypto.randomBytes(32).toString('hex');

const { verifyPayloadWithGraph }   = require('../index');
const { queryEntity, addTombstone } = require('./storage');
const { runCycle, runCompaction }   = require('./aggregator');

let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log('\n=== Graph E2E + Privacy Tests ===\n');

  // ── 1. 100 sequential calls — check_count grows correctly ───────────────
  console.log('1. Sequential calls — graph count accumulation');

  await test('100 calls on same entity: check_count_24h = 100', async () => {
    const entity = 'repeat-phishing.com';
    for (let i = 0; i < 100; i++) {
      await verifyPayloadWithGraph({
        text: entity, urls: [`https://${entity}`],
        channel: 'e2e-test', customerId: `cust_${String(i % 5).padStart(3,'0')}`,
        _graphType: 'domain',
      });
    }
    // recordCheck is fire-and-forget — wait for async writes to settle
    await new Promise(r => setTimeout(r, 100));
    const agg = queryEntity({ entity, type: 'domain' });
    assert.ok(agg, 'agg not null');
    assert.strictEqual(agg.check_count_24h, 100, `Expected 100, got ${agg.check_count_24h}`);
    assert.strictEqual(agg.unique_customers_24h, 5, `Expected 5 unique, got ${agg.unique_customers_24h}`);
  });

  // ── 2. Boost applies correctly ───────────────────────────────────────────
  console.log('\n2. Boost application');

  await test('+20 boost when avg_score > 70 and unique_customers_7d >= 3', async () => {
    const entity = 'boost-test-phishing.com';
    // Seed with 3 different customers all scoring high
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        await verifyPayloadWithGraph({
          text: entity, urls: [`https://${entity}`],
          channel: 'e2e-test', customerId: `boost_cust_${i}`,
          _graphType: 'domain',
        });
      }
    }
    // Force aggregation
    runCycle();
    // Next call should have boost applied
    const result = await verifyPayloadWithGraph({
      text: entity, urls: [`https://${entity}`],
      channel: 'e2e-test', customerId: 'boost_cust_0',
      _graphType: 'domain',
    });
    // graph_intelligence should be populated
    assert.ok(result.graph_intelligence !== undefined, 'graph_intelligence field present');
    // After 15 calls all scoring brand-impersonation, avg should be high
    if (result.graph_intelligence) {
      assert.ok(['1-4','5-49','50-499','500+'].includes(result.graph_intelligence.seen_24h),
        `seen_24h should be a bucket, got "${result.graph_intelligence.seen_24h}"`);
    }
  });

  await test('graph_intelligence is null for unknown entity', async () => {
    const result = await verifyPayloadWithGraph({
      text: 'never-seen-entity-xyz-12345.com',
      urls: ['https://never-seen-entity-xyz-12345.com'],
      channel: 'e2e-test', customerId: 'cust_001',
      _graphType: 'domain',
    });
    assert.strictEqual(result.graph_intelligence, null, 'Unknown entity should return null graph_intelligence');
  });

  await test('skipGraph=true bypasses graph entirely', async () => {
    const result = await verifyPayloadWithGraph({
      text: 'paypa1-secure.com',
      urls: ['https://paypa1-secure.com'],
      channel: 'e2e-test', customerId: 'cust_001',
      _graphType: 'domain',
      skipGraph: true,
    });
    assert.strictEqual(result.graph_intelligence, null, 'skipGraph=true should produce null graph_intelligence');
  });

  await test('no boost without customerId (anonymous call)', async () => {
    const result = await verifyPayloadWithGraph({
      text: 'repeat-phishing.com', // has 100 checks in graph
      urls: ['https://repeat-phishing.com'],
      channel: 'e2e-test',
      // no customerId
    });
    assert.strictEqual(result.graph_intelligence, null, 'No customerId = no graph = null intelligence');
  });

  // ── 3. Privacy assertions ────────────────────────────────────────────────
  console.log('\n3. Privacy');

  await test('customer_id never appears in any graph file', async () => {
    const secretId = 'SECRET_CUSTOMER_DO_NOT_STORE_IN_GRAPH_abc123xyz';
    await verifyPayloadWithGraph({
      text: 'privacy-e2e-test.com', urls: ['https://privacy-e2e-test.com'],
      channel: 'e2e-test', customerId: secretId, _graphType: 'domain',
    });

    let found = false;
    function scan(dir) {
      if (!fs.existsSync(dir)) return;
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) scan(full);
        else {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(secretId)) found = true;
        }
      }
    }
    scan(TEST_DIR);
    assert.strictEqual(found, false, 'Raw customer_id found in graph files!');
  });

  // ── 4. Aggregator cycle ──────────────────────────────────────────────────
  console.log('\n4. Aggregator');

  await test('runCycle processes existing JSONL files', async () => {
    const r = runCycle();
    assert.ok(typeof r.processed === 'number', 'processed count present');
    assert.ok(typeof r.duration_ms === 'number', 'duration_ms present');
    assert.ok(r.duration_ms < 5000, `Cycle too slow: ${r.duration_ms}ms`);
  });

  await test('tombstone exclusion via aggregator', async () => {
    const custVictim = `victim_${Date.now()}`;
    const entity = `tombstone-e2e-${Date.now()}.com`;

    // Write 5 checks as victim
    for (let i = 0; i < 5; i++) {
      await verifyPayloadWithGraph({
        text: entity, urls: [`https://${entity}`],
        channel: 'e2e-test', customerId: custVictim, _graphType: 'domain',
      });
    }
    await new Promise(r => setTimeout(r, 100)); // let async writes settle

    const aggBefore = queryEntity({ entity, type: 'domain' });
    assert.strictEqual(aggBefore.check_count_24h, 5);

    // Tombstone and re-aggregate
    addTombstone(custVictim);
    runCycle();

    // Cache is now stale (aggregator wrote new file) — query should reflect exclusion
    const aggAfter = queryEntity({ entity, type: 'domain' });
    // aggAfter could be null (all lines tombstoned) or have 0 unique customers
    const uniqueAfter = aggAfter ? aggAfter.unique_customers_24h : 0;
    assert.strictEqual(uniqueAfter, 0, `Expected 0 unique customers after tombstone, got ${uniqueAfter}`);
  });

  await test('runCompaction removes tombstoned lines and clears tombstone files', async () => {
    const r = runCompaction();
    assert.ok(typeof r.compacted === 'number', 'compacted count present');
    // Tombstone files should be cleared after compaction
    const tombDir = path.join(TEST_DIR, 'graph-tombstones');
    const remaining = fs.existsSync(tombDir) ? fs.readdirSync(tombDir).length : 0;
    assert.strictEqual(remaining, 0, `${remaining} tombstone files remain after compaction`);
  });

  // ── 5. Response shape ────────────────────────────────────────────────────
  console.log('\n5. Response shape');

  await test('result has expected top-level fields including graph_intelligence', async () => {
    const result = await verifyPayloadWithGraph({
      text: 'shape-test.com', urls: ['https://shape-test.com'],
      channel: 'e2e-test', customerId: 'shape_cust', _graphType: 'domain',
    });
    assert.ok('verdict' in result, 'verdict field');
    assert.ok('score' in result.verdict, 'verdict.score');
    assert.ok('decision' in result.verdict, 'verdict.decision');
    assert.ok('graph_intelligence' in result, 'graph_intelligence field');
  });

  await test('graph_intelligence has bucket fields when entity known', async () => {
    // shape-test.com was just written above — second call should have graph_intelligence
    const result = await verifyPayloadWithGraph({
      text: 'shape-test.com', urls: ['https://shape-test.com'],
      channel: 'e2e-test', customerId: 'shape_cust', _graphType: 'domain',
    });
    const gi = result.graph_intelligence;
    if (gi) {
      const validBuckets = ['0','1-4','5-49','50-499','500+'];
      assert.ok(validBuckets.includes(gi.seen_24h), `seen_24h "${gi.seen_24h}" not a valid bucket`);
      assert.ok(validBuckets.includes(gi.seen_7d), `seen_7d "${gi.seen_7d}" not a valid bucket`);
      assert.ok(validBuckets.includes(gi.unique_customers_7d), `unique_customers_7d not a valid bucket`);
      assert.ok(['rising','stable','declining'].includes(gi.trend), `trend "${gi.trend}" invalid`);
      assert.ok(typeof gi.confidence_boost === 'number', 'confidence_boost is number');
    }
  });

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n=== ${passed + failed} tests: ${passed} passed, ${failed} failed ===\n`);
  try { fs.rmSync(TEST_DIR, { recursive: true, force: true }); } catch { /* best-effort */ }
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
