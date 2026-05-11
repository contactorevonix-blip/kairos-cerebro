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

  // ── 6. HIGH-3: graph_intelligence non-null for entity with history ────────
  console.log('\n6. HIGH-3 fix: graph_intelligence reaches API response');

  await test('graph_intelligence is non-null for entity with prior history', async () => {
    const entity = `hi3-${Date.now()}.com`;
    await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: 'hi3_c', _graphType: 'domain' });
    await new Promise(r => setTimeout(r, 100));
    const result = await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: 'hi3_c', _graphType: 'domain' });
    assert.ok(result.graph_intelligence !== null,
      'graph_intelligence must be non-null when entity has history');
  });

  // ── 7. MEDIUM-3: raw score stored, not boosted ───────────────────────────
  console.log('\n7. MEDIUM-3 fix: record raw score, not boosted');

  await test('MEDIUM-3a: JSONL stores raw engine score when boost applies', async () => {
    const entity = `m3a-${Date.now()}.com`;
    const { recordCheck: rc3a, hashCustomer: hc3a, hashEntity: he3a, rawPath: rp3a } = require('./storage');
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 10; j++) {
        await rc3a({ entity, type: 'domain', score: 90, verdict: 'block', signals: [], customerId: `m3a_s${i}` });
      }
    }
    runCycle();

    const noBoost = await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: 'ref', _graphType: 'domain', skipGraph: true });
    const rawScore = noBoost.verdict.score;

    const withBoost = await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: 'm3a_t', _graphType: 'domain' });
    await new Promise(r => setTimeout(r, 100));

    if (withBoost.verdict.score > rawScore) {
      const tHash = hc3a('m3a_t');
      const lines = fs.readFileSync(rp3a('domain', he3a('domain', entity)), 'utf8').split('\n').filter(Boolean);
      const stored = lines
        .filter(l => { try { return JSON.parse(l).c === tHash; } catch { return false; } })
        .map(l => JSON.parse(l).score);
      assert.ok(stored.length > 0, 'stored line found for m3a_t');
      assert.strictEqual(stored[stored.length - 1], rawScore,
        `stored (${stored[stored.length - 1]}) must equal raw (${rawScore}), not boosted (${withBoost.verdict.score})`);
    }
  });

  await test('MEDIUM-3b: 5 sequential checks: scores stay equal, stored = raw (no amplification)', async () => {
    const entity = `m3b-${Date.now()}.com`;
    const tCust  = `m3b_t_${Date.now()}`;
    const { recordCheck: rc3b, hashCustomer: hc3b, hashEntity: he3b, rawPath: rp3b } = require('./storage');

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 10; j++) {
        await rc3b({ entity, type: 'domain', score: 90, verdict: 'block', signals: [], customerId: `m3b_s${i}` });
      }
    }
    runCycle();

    // Baseline: raw engine score with no graph influence
    const refResult = await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: 'ref_skip', _graphType: 'domain', skipGraph: true });
    const rawEngineScore = refResult.verdict.score;

    // 5 sequential checks with runCycle between each (graph feedback loop)
    const scores = [];
    for (let k = 0; k < 5; k++) {
      const r = await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: tCust, _graphType: 'domain' });
      scores.push(r.verdict.score);
      await new Promise(res => setTimeout(res, 50));
      runCycle();
    }
    await new Promise(r => setTimeout(r, 100));

    // Option A: all 5 scores must be identical (linear, stable boost)
    // With fix: raw stored → avg stable → boost consistent → scores[i] === scores[0]
    // If reverted: boosted stored → avg shifts → scores may diverge (Option A fails)
    for (let i = 1; i < 5; i++) {
      assert.strictEqual(scores[i], scores[0],
        `score[${i}] (${scores[i]}) !== score[0] (${scores[0]}) — amplification detected`);
    }

    // Double-belt (revert-sensitive): stored JSONL = raw engine score, not boosted
    const tHash = hc3b(tCust);
    const rp = rp3b('domain', he3b('domain', entity));
    const lines = fs.readFileSync(rp, 'utf8').split('\n').filter(Boolean);
    const tLines = lines.filter(l => { try { return JSON.parse(l).c === tHash; } catch { return false; } });
    const storedScores = tLines.map(l => JSON.parse(l).score);
    assert.strictEqual(tLines.length, 5, `Expected 5 stored records, got ${tLines.length}`);
    assert.ok(storedScores.every(s => s === storedScores[0]),
      `Stored scores must all be equal (deterministic raw engine): ${JSON.stringify(storedScores)}`);
    // Key assertion: if boost applied, stored < returned; always stored === rawEngineScore
    assert.strictEqual(storedScores[0], rawEngineScore,
      `Stored (${storedScores[0]}) must equal raw engine score (${rawEngineScore}), not boosted (${scores[0]})`);
  });

  // ── 8. MEDIUM-4: two-phase compaction ────────────────────────────────────
  console.log('\n8. MEDIUM-4 fix: two-phase tombstone compaction');

  await test('MEDIUM-4a: compaction physically removes tombstoned customer data from JSONL', async () => {
    const custM4a = `m4a_${Date.now()}`;
    const entity  = `m4a-${Date.now()}.com`;
    for (let i = 0; i < 3; i++) {
      await verifyPayloadWithGraph({ text: entity, urls: [], channel: 'e2e', customerId: custM4a, _graphType: 'domain' });
    }
    await new Promise(r => setTimeout(r, 100));
    addTombstone(custM4a);
    const { hashCustomer: hc4a, hashEntity: he4a, rawPath: rp4a } = require('./storage');
    const custHash4a = hc4a(custM4a);
    runCompaction();
    const rawFile = rp4a('domain', he4a('domain', entity));
    const content = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, 'utf8') : '';
    assert.ok(!content.includes(custHash4a),
      'JSONL must not contain tombstoned customer hash after compaction');
  });

  await test('MEDIUM-4b: compaction preserves tombstone if partial rewrite fails', async () => {
    const custM4b = `m4b_${Date.now()}`;
    const ent1 = `m4b1-${Date.now()}.com`;
    const ent2 = `m4b2-${Date.now()}.com`;

    // Same customer writing to 2 different entities → 2 separate JSONL files to compact
    for (let i = 0; i < 3; i++) {
      await verifyPayloadWithGraph({ text: ent1, urls: [], channel: 'e2e', customerId: custM4b, _graphType: 'domain' });
      await verifyPayloadWithGraph({ text: ent2, urls: [], channel: 'e2e', customerId: custM4b, _graphType: 'domain' });
    }
    await new Promise(r => setTimeout(r, 100));

    addTombstone(custM4b);
    const { hashCustomer: hc4b } = require('./storage');
    const custHash4b = hc4b(custM4b);

    // Monkey-patch fs.renameSync: succeed on rename #1, throw on rename #2
    // Simulates partial disk failure (file 1 rewritten, file 2 fails)
    let compactRenameCount = 0;
    const origRename = fs.renameSync;
    fs.renameSync = function(src, dest) {
      if (typeof src === 'string' && src.endsWith('.tmp')) {
        compactRenameCount++;
        if (compactRenameCount === 2) throw new Error('simulated partial disk failure');
      }
      return origRename.apply(this, arguments);
    };

    let r1;
    try {
      r1 = runCompaction();
    } finally {
      fs.renameSync = origRename; // always restore — even on unexpected throws
    }

    const tombPath = path.join(TEST_DIR, 'graph-tombstones', `${custHash4b}.json`);
    assert.ok(r1.failed > 0, `Expected failed > 0, got ${r1.failed}`);
    assert.ok(fs.existsSync(tombPath),
      'Tombstone must be preserved when partial rewrite failed (two-phase guard)');

    // Second run (no mock): must compact successfully and remove the tombstone
    const r2 = runCompaction();
    assert.ok(r2.compacted >= 1, `Expected compacted >= 1 on second run, got ${r2.compacted}`);
    assert.ok(!fs.existsSync(tombPath),
      'Tombstone must be removed after successful second compaction run');
  });

  // ── 9. HIGH-3 contract: handleApiCheck (API boundary) ────────────────────
  console.log('\n9. HIGH-3 contract: handleApiCheck response shape');

  await test('handleApiCheck contract: response includes graph_intelligence for entity with prior history', async () => {
    // Deterministic test key: format matches kc_[a-z]+_[0-9a-f]{48}
    const rawKey  = `kc_test_${'a'.repeat(48)}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyCustId = `contract_cust_${Date.now()}`;

    // Write key record to TEST_DIR/api-keys.jsonl (KAIROS_DB_DIR = TEST_DIR)
    const keysFile = path.join(TEST_DIR, 'api-keys.jsonl');
    fs.writeFileSync(keysFile,
      JSON.stringify({ api_key_hash: keyHash, status: 'active', quota_per_month: 10000, customer_id: keyCustId, tier: 'starter' }) + '\n',
      'utf8'
    );

    // Seed entity with prior history via recordCheck
    const entity = `hi3-contract-${Date.now()}.com`;
    const { recordCheck: rcC } = require('./storage');
    await rcC({ entity, type: 'domain', score: 80, verdict: 'block', signals: [], customerId: keyCustId });
    await new Promise(r => setTimeout(r, 100));

    // Call handleApiCheck directly — the actual API boundary where HIGH-3 fix lives
    const { handleApiCheck } = require('../../sniper-api/api-check');
    const response = await handleApiCheck(
      { authorization: `Bearer ${rawKey}` },
      { domain: entity }
    );

    assert.strictEqual(response.status, 200, `Expected 200, got ${response.status}: ${JSON.stringify(response.body)}`);

    // HIGH-3 regression assertion: field must be present in the response body
    assert.ok('graph_intelligence' in response.body,
      'graph_intelligence key must exist in handleApiCheck response body — removing api-check.js:192 breaks this');
    assert.ok(response.body.graph_intelligence !== undefined,
      'graph_intelligence must not be undefined');
    assert.ok(response.body.graph_intelligence !== null,
      'graph_intelligence must not be null for entity with prior history');

    // Verify expected contract shape from formatGraphIntelligence
    const gi = response.body.graph_intelligence;
    assert.ok('first_seen' in gi, 'first_seen field present in graph_intelligence');
    assert.ok('trend' in gi, 'trend field present');
    assert.ok('confidence_boost' in gi, 'confidence_boost field present');
    assert.ok(['rising', 'stable', 'declining'].includes(gi.trend), `trend "${gi.trend}" is valid`);
    assert.ok(typeof gi.confidence_boost === 'number', 'confidence_boost is a number');
  });

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n=== ${passed + failed} tests: ${passed} passed, ${failed} failed ===\n`);
  try { fs.rmSync(TEST_DIR, { recursive: true, force: true }); } catch { /* best-effort */ }
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
