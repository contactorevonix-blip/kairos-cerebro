'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const sov = require('../packages/sovereign');

test('listTaskForces returns the three operational forces plus sovereign overlay', () => {
  const forces = sov.listTaskForces();
  const ids = forces.map((f) => f.id).sort();
  assert.deepEqual(ids, ['growth', 'infrastructure', 'sovereign-overlay', 'strategy']);
});

test('every operational agent is assigned to exactly one task force', () => {
  const forces = sov.listTaskForces();
  const allAgents = new Set();
  let totalAcrossForces = 0;
  for (const f of forces) {
    for (const a of f.agents) {
      assert.ok(!allAgents.has(a.id), `agent ${a.id} appears in multiple forces`);
      allAgents.add(a.id);
      totalAcrossForces += 1;
    }
  }
  // 11 agents, each in exactly one force.
  const live = sov.listAgents().filter((a) => a.tier !== 'auxiliary');
  assert.equal(totalAcrossForces, live.length);
});

test('infrastructure force contains the engineering core', () => {
  const force = sov.listByTaskForce('infrastructure');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('aria'));
  assert.ok(ids.includes('dex'));
  assert.ok(ids.includes('gage'));
  assert.ok(ids.includes('quinn'));
  assert.ok(ids.includes('rex'));
});

test('growth force contains the distribution and revenue specialists', () => {
  const force = sov.listByTaskForce('growth');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('uma'));
  assert.ok(ids.includes('morgan'));
  assert.ok(ids.includes('hermes'));
});

test('strategy force contains the business intelligence stack', () => {
  const force = sov.listByTaskForce('strategy');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('sage'));
  assert.ok(ids.includes('oracle'));
});
