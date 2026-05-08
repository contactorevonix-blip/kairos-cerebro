'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const billing = require('../packages/billing');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-billing-')); }

function fakeStripeSignature({ secret, body, ts = Math.floor(Date.now() / 1000) }) {
  const signed = `${ts}.${body}`;
  const v1 = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return `t=${ts},v1=${v1}`;
}

test('plan catalogue includes free, pro, business, b2b_pilot and enterprise', () => {
  assert.ok(billing.planById('kairos_free'));
  assert.ok(billing.planById('kairos_pro'));
  assert.ok(billing.planById('kairos_business'));
  assert.ok(billing.planById('kairos_b2b_pilot'));
  assert.ok(billing.planById('kairos_enterprise'));
});

test('rate limits scale with plan tier', () => {
  const free = billing.planById('kairos_free').rateLimitPerMinute;
  const pro = billing.planById('kairos_pro').rateLimitPerMinute;
  const pilot = billing.planById('kairos_b2b_pilot').rateLimitPerMinute;
  assert.ok(free < pro);
  assert.ok(pro < pilot);
});

test('verifyStripeSignature accepts a properly signed payload within tolerance', () => {
  const body = JSON.stringify({ id: 'evt_1', type: 'invoice.paid' });
  const secret = 'whsec_test_secret';
  const header = fakeStripeSignature({ secret, body });
  const out = billing.verifyStripeSignature({ rawBody: body, header, secret });
  assert.equal(out.valid, true);
});

test('verifyStripeSignature rejects expired timestamps', () => {
  const body = JSON.stringify({ id: 'evt_2' });
  const secret = 'whsec_test_secret';
  const header = fakeStripeSignature({ secret, body, ts: Math.floor(Date.now() / 1000) - 60 * 60 });
  const out = billing.verifyStripeSignature({ rawBody: body, header, secret });
  assert.equal(out.valid, false);
  assert.equal(out.reason, 'timestamp-out-of-tolerance');
});

test('verifyStripeSignature rejects forged signatures', () => {
  const body = JSON.stringify({ id: 'evt_3' });
  const secret = 'whsec_test_secret';
  const header = fakeStripeSignature({ secret: 'wrong-secret', body });
  const out = billing.verifyStripeSignature({ rawBody: body, header, secret });
  assert.equal(out.valid, false);
});

test('handleStripeEvent maps subscription events to plan changes', () => {
  let observed = null;
  const event = {
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_123',
        customer: 'cus_abc',
        status: 'active',
        items: { data: [{ price: { lookup_key: 'kairos_b2b_pilot' } }] },
      },
    },
  };
  const handled = billing.handleStripeEvent(event, {
    onSubscription: (sub) => { observed = sub; },
  });
  assert.equal(handled.handled, true);
  assert.equal(handled.planId, 'kairos_b2b_pilot');
  assert.equal(observed.customerId, 'cus_abc');
  assert.equal(observed.planId, 'kairos_b2b_pilot');
});

test('handleStripeEvent ignores irrelevant events', () => {
  const handled = billing.handleStripeEvent({ type: 'charge.dispute.created', data: { object: {} } });
  assert.equal(handled.handled, false);
});

test('meterUsage increments the per-tenant per-period counter', () => {
  const dir = tmp();
  billing.meterUsage({ tenantId: 't1', units: 1, dir });
  billing.meterUsage({ tenantId: 't1', units: 2, dir });
  assert.equal(billing.currentUsage({ tenantId: 't1', dir }), 3);
  assert.equal(billing.currentUsage({ tenantId: 'other', dir }), 0);
});
