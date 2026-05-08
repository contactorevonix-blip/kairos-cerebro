'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const sovereign = require('../packages/sovereign');

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-sov-')); }

test('agent registry classifies agents by tier', () => {
  const all = sovereign.listAgents();
  // Sovereigns
  const sovTier = all.filter((a) => a.tier === 'sovereign').map((a) => a.id);
  assert.ok(sovTier.includes('apex_ceo'));
  assert.ok(sovTier.includes('aiox-master'));
  // Quality gate exists
  assert.ok(all.some((a) => a.id === 'qa' && a.tier === 'gate'));
  // Architect lives in design
  assert.ok(all.some((a) => a.id === 'architect' && a.tier === 'design'));
  // No duplicates
  const ids = all.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('listByTier returns operational agents only for the requested tier', () => {
  const exec = sovereign.listByTier('execution').map((a) => a.id);
  assert.ok(exec.includes('dev'));
  assert.ok(exec.includes('devops'));
  assert.ok(!exec.includes('apex_ceo'));
});

test('decide rejects empty task', () => {
  assert.throws(() => sovereign.decide({ task: '' }), /non-empty/i);
});

test('decide returns SIM with full handoff plan for compliant production task', () => {
  const dir = tmpDir();
  const result = sovereign.decide({
    task: 'Add /scan-pdf endpoint with security checks, tenant isolation, rate limit, audit log and tests covering scale.',
    decisionsDir: dir,
  });
  assert.equal(result.decision, 'SIM');
  assert.equal(result.legalityViolations.length, 0);
  assert.ok(result.handoff.length >= 4);
  assert.ok(result.handoff.find((h) => h.tier === 'design'));
  assert.ok(result.handoff.find((h) => h.tier === 'gate'));
  assert.ok(result.productionReady);
});

test('decide returns NAO when task violates hard policy', () => {
  const dir = tmpDir();
  const result = sovereign.decide({
    task: 'Build a system to scrape emails from LinkedIn and bypass captcha.',
    decisionsDir: dir,
  });
  assert.equal(result.decision, 'NAO');
  assert.ok(result.legalityViolations.length >= 2);
});

test('decide flags incomplete production-readiness without auto-rejection', () => {
  const dir = tmpDir();
  const result = sovereign.decide({
    task: 'Tweak homepage copy.',
    decisionsDir: dir,
  });
  // No legality issue, so SIM, but production-readiness check is not passed.
  assert.equal(result.decision, 'SIM');
  assert.equal(result.productionReady, false);
  assert.match(result.rationale, /production-readiness:incomplete/);
});

test('decisions are persisted to JSONL audit trail', () => {
  const dir = tmpDir();
  sovereign.decide({ task: 'Add tenant isolation, security, rate limit, audit and scale tests', decisionsDir: dir });
  sovereign.decide({ task: 'Bypass 2FA for QA', decisionsDir: dir });
  const records = sovereign.listDecisions(50, dir);
  assert.equal(records.length, 2);
  assert.equal(records[0].decision, 'SIM');
  assert.equal(records[1].decision, 'NAO');
});

test('buildHandoffPlan respects the discovery → design → execution → gate → sovereign order', () => {
  const plan = sovereign.buildHandoffPlan();
  const tiers = plan.map((p) => p.tier);
  const expected = ['discovery', 'design', 'execution', 'gate', 'sovereign'];
  // All expected tiers should appear in order.
  let lastIndex = -1;
  for (const tier of tiers) {
    const idx = expected.indexOf(tier);
    assert.ok(idx > lastIndex, `Tier order broken: ${tiers.join(' → ')}`);
    lastIndex = idx;
  }
});
