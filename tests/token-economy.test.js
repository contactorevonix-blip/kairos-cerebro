'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use a temp dir so tests don't touch real data
let TEST_DIR;

before(() => {
  TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-token-test-'));
});

after(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

// Import with test dir
function db() {
  const mod = require('../packages/sniper-db');
  return mod;
}

describe('Token Economy — ledger', () => {

  it('new tenant starts with zero balance', () => {
    const { getTokenBalance } = db();
    assert.equal(getTokenBalance('tenant-new', TEST_DIR), 0);
  });

  it('creditTokens adds to balance', () => {
    const { creditTokens, getTokenBalance } = db();
    const newBal = creditTokens('tenant-a', 5000, 'monthly_grant', '2026-05', TEST_DIR);
    assert.equal(newBal, 5000);
    assert.equal(getTokenBalance('tenant-a', TEST_DIR), 5000);
  });

  it('debitTokens reduces balance', () => {
    const { creditTokens, debitTokens, getTokenBalance } = db();
    creditTokens('tenant-b', 100, 'monthly_grant', '2026-05', TEST_DIR);
    const result = debitTokens('tenant-b', 1, 'domain', 'ref-001', TEST_DIR);
    assert.equal(result.ok, true);
    assert.equal(result.balance, 99);
    assert.equal(getTokenBalance('tenant-b', TEST_DIR), 99);
  });

  it('debitTokens rejects when balance insufficient', () => {
    const { getTokenBalance, debitTokens } = db();
    const result = debitTokens('tenant-empty', 1, 'domain', 'ref-002', TEST_DIR);
    assert.equal(result.ok, false);
    assert.equal(result.balance, 0);
    assert.equal(result.needed, 1);
    assert.equal(getTokenBalance('tenant-empty', TEST_DIR), 0); // unchanged
  });

  it('multiple debits accumulate correctly', () => {
    const { creditTokens, debitTokens, getTokenBalance } = db();
    creditTokens('tenant-c', 10, 'test', 'r1', TEST_DIR);
    debitTokens('tenant-c', 1, 'domain', 'r2', TEST_DIR);
    debitTokens('tenant-c', 1, 'email', 'r3', TEST_DIR);
    debitTokens('tenant-c', 2, 'phone', 'r4', TEST_DIR);
    assert.equal(getTokenBalance('tenant-c', TEST_DIR), 6);
  });

  it('ensureMonthlyTokens grants once per month', () => {
    const { ensureMonthlyTokens, getTokenBalance } = db();
    const granted1 = ensureMonthlyTokens('tenant-d', 'starter', TEST_DIR);
    const granted2 = ensureMonthlyTokens('tenant-d', 'starter', TEST_DIR);
    assert.equal(granted1, true);
    assert.equal(granted2, false); // idempotent
    assert.equal(getTokenBalance('tenant-d', TEST_DIR), 5000); // only one grant
  });

  it('ensureMonthlyTokens uses correct amounts per tier', () => {
    const { ensureMonthlyTokens, getTokenBalance, MONTHLY_TOKENS } = db();
    ensureMonthlyTokens('tenant-free', 'free', TEST_DIR);
    ensureMonthlyTokens('tenant-pro', 'pro', TEST_DIR);
    ensureMonthlyTokens('tenant-scale', 'scale', TEST_DIR);
    assert.equal(getTokenBalance('tenant-free', TEST_DIR), MONTHLY_TOKENS.free);
    assert.equal(getTokenBalance('tenant-pro', TEST_DIR), MONTHLY_TOKENS.pro);
    assert.equal(getTokenBalance('tenant-scale', TEST_DIR), MONTHLY_TOKENS.scale);
  });

  it('getTokenCost returns correct costs per entity type', () => {
    const { getTokenCost } = db();
    assert.equal(getTokenCost('domain'), 1);
    assert.equal(getTokenCost('email'), 1);
    assert.equal(getTokenCost('phone'), 2);
    assert.equal(getTokenCost('iban'), 3);
    assert.equal(getTokenCost('unknown'), 1); // default
  });

  it('creditTokens rejects non-positive amounts', () => {
    const { creditTokens } = db();
    assert.throws(() => creditTokens('tenant-x', 0, 'test', 'r', TEST_DIR), /positive/);
    assert.throws(() => creditTokens('tenant-x', -5, 'test', 'r', TEST_DIR), /positive/);
  });

  it('getTokenHistory returns recent entries newest-first', () => {
    const { creditTokens, debitTokens, getTokenHistory } = db();
    creditTokens('tenant-h', 100, 'grant', 'r1', TEST_DIR);
    debitTokens('tenant-h', 1, 'domain', 'r2', TEST_DIR);
    debitTokens('tenant-h', 1, 'email', 'r3', TEST_DIR);
    const history = getTokenHistory('tenant-h', 10, TEST_DIR);
    assert.equal(history.length, 3);
    assert.equal(history[0].type, 'debit'); // newest first
    assert.equal(history[0].ref, 'r3');
    assert.equal(history[2].type, 'credit');
  });

  it('balance never goes negative — concurrent debit protection', () => {
    const { creditTokens, debitTokens, getTokenBalance } = db();
    creditTokens('tenant-safe', 2, 'grant', 'r0', TEST_DIR);
    // Try to debit 3 when balance is 2
    const result = debitTokens('tenant-safe', 3, 'iban', 'r1', TEST_DIR);
    assert.equal(result.ok, false);
    assert.equal(getTokenBalance('tenant-safe', TEST_DIR), 2); // unchanged
  });

  it('token ledger is append-only — all entries preserved', () => {
    const { creditTokens, debitTokens, readTokenLedger } = require('../packages/sniper-db');
    creditTokens('tenant-audit', 100, 'grant', 'g1', TEST_DIR);
    debitTokens('tenant-audit', 10, 'domain', 'd1', TEST_DIR);
    debitTokens('tenant-audit', 5, 'email', 'd2', TEST_DIR);
    creditTokens('tenant-audit', 50, 'topup', 'p1', TEST_DIR);
    const ledger = readTokenLedger('tenant-audit', TEST_DIR);
    assert.equal(ledger.length, 4); // all entries preserved
    assert.equal(ledger[0].type, 'credit');
    assert.equal(ledger[1].type, 'debit');
    assert.equal(ledger[3].source, 'topup');
  });

});
