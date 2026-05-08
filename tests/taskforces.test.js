'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const sov = require('../packages/sovereign');

test('listTaskForces returns the three operational forces plus sovereign overlay', () => {
  const forces = sov.listTaskForces();
  const ids = forces.map((f) => f.id).sort();
  assert.deepEqual(ids, ['b2b-security', 'growth', 'infrastructure', 'sovereign-overlay']);
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
  // With 18 operational agents, each must be in exactly one force.
  const live = sov.listAgents().filter((a) => a.tier !== 'auxiliary');
  assert.equal(totalAcrossForces, live.length);
});

test('infrastructure force contains the engineering core', () => {
  const force = sov.listByTaskForce('infrastructure');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('architect'));
  assert.ok(ids.includes('dev'));
  assert.ok(ids.includes('devops'));
  assert.ok(ids.includes('data-engineer'));
});

test('growth force contains the distribution and conversion specialists', () => {
  const force = sov.listByTaskForce('growth');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('agent_ghost'));
  assert.ok(ids.includes('agent_psycho'));
  assert.ok(ids.includes('agent_copywriter'));
  assert.ok(ids.includes('ux-design-expert'));
  assert.ok(ids.includes('pm'));
});

test('b2b-security force contains the institutional and quality stack', () => {
  const force = sov.listByTaskForce('b2b-security');
  const ids = force.map((a) => a.id).sort();
  assert.ok(ids.includes('qa'));
  assert.ok(ids.includes('agent_sales'));
  assert.ok(ids.includes('agent_growth'));
  assert.ok(ids.includes('po'));
  assert.ok(ids.includes('sm'));
});
