'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const wh = require('../packages/webhook-outbox');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-wh-')); }

test('enqueue persists outbox entry and tracks state pending', () => {
  const dir = tmp();
  const r = wh.enqueue({ url: 'https://partner.example/hook', secret: 's3cret', event: 'verification.blocked', payload: { x: 1 }, dir });
  assert.ok(r.id);
  const status = wh.getStatus(r.id, dir);
  assert.equal(status.status, 'pending');
  assert.equal(status.attempts, 0);
});

test('deliver marks status delivered on 2xx', async () => {
  const dir = tmp();
  const r = wh.enqueue({ url: 'https://partner.example/hook', secret: 's3cret', event: 'verification.blocked', payload: { x: 1 }, dir });
  let captured;
  const fakeClient = (url, body, headers) => {
    captured = { url, body, headers };
    return Promise.resolve({ status: 204, body: '' });
  };
  const out = await wh.deliver({ id: r.id, secret: 's3cret', dir, httpClient: fakeClient });
  assert.equal(out.status, 'delivered');
  // Signature verification: the partner side computes HMAC of the body and compares.
  const expected = crypto.createHmac('sha256', 's3cret').update(captured.body).digest('hex');
  assert.equal(captured.headers['x-kairos-signature'], `sha256=${expected}`);
  assert.equal(captured.headers['x-kairos-event'], 'verification.blocked');
  // State transitioned.
  assert.equal(wh.getStatus(r.id, dir).status, 'delivered');
});

test('deliver schedules retry on 5xx and counts attempts', async () => {
  const dir = tmp();
  const r = wh.enqueue({ url: 'https://partner.example/hook', secret: 's', event: 'e', payload: {}, dir });
  const fail = () => Promise.resolve({ status: 503, body: 'unavailable' });
  const out1 = await wh.deliver({ id: r.id, secret: 's', dir, httpClient: fail });
  assert.equal(out1.status, 'pending');
  assert.equal(out1.attempts, 1);
  const out2 = await wh.deliver({ id: r.id, secret: 's', dir, httpClient: fail });
  assert.equal(out2.attempts, 2);
});

test('deliver gives up after MAX_ATTEMPTS retries', async () => {
  const dir = tmp();
  const r = wh.enqueue({ url: 'https://partner.example/hook', secret: 's', event: 'e', payload: {}, dir });
  const fail = () => Promise.resolve({ status: 500, body: 'boom' });
  let last;
  for (let i = 0; i < wh.MAX_ATTEMPTS; i++) {
    last = await wh.deliver({ id: r.id, secret: 's', dir, httpClient: fail });
  }
  assert.equal(last.status, 'failed');
});

test('signature is content-bound: tampering with body breaks verification', () => {
  const sig = wh.sign('s', '{"x":1}');
  const expected = crypto.createHmac('sha256', 's').update('{"x":1}').digest('hex');
  assert.equal(sig, expected);
  const tamperedExpected = crypto.createHmac('sha256', 's').update('{"x":2}').digest('hex');
  assert.notEqual(sig, tamperedExpected);
});

test('listPending returns pending entries whose nextAttemptAt has elapsed', () => {
  const dir = tmp();
  wh.enqueue({ url: 'https://a.example/hook', secret: 's', event: 'e', payload: {}, dir });
  wh.enqueue({ url: 'https://b.example/hook', secret: 's', event: 'e', payload: {}, dir });
  const pending = wh.listPending(dir);
  assert.equal(pending.length, 2);
});
