'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const billing = require('../packages/billing');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-billing-idem-')); }

test('claimEventId returns true on first call, false on replay', () => {
  const dir = tmp();
  assert.equal(billing.claimEventId('evt_abc', dir), true);
  assert.equal(billing.claimEventId('evt_abc', dir), false);
  assert.equal(billing.claimEventId('evt_abc', dir), false);
});

test('claimEventId persists across restarts (file-backed)', () => {
  const dir = tmp();
  billing.claimEventId('evt_xyz', dir);
  // Simulate "restart" by re-requiring the module fresh.
  const fresh = require('../packages/billing/index.js');
  assert.equal(fresh.isEventProcessed('evt_xyz', dir), true);
});

test('claimEventId without an id is rejected (no silent skip)', () => {
  const dir = tmp();
  assert.equal(billing.claimEventId(null, dir), false);
  assert.equal(billing.claimEventId(undefined, dir), false);
  assert.equal(billing.claimEventId('', dir), false);
});

test('idempotency window keeps the most recent 1000 ids', () => {
  const dir = tmp();
  for (let i = 0; i < 1100; i += 1) {
    billing.claimEventId(`evt_${i}`, dir);
  }
  // The very first one should have aged out.
  assert.equal(billing.isEventProcessed('evt_0', dir), false);
  // Recent ones must still be there.
  assert.equal(billing.isEventProcessed('evt_1099', dir), true);
});
