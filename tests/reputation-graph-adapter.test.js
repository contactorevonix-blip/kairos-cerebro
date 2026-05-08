'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createAdapter } = require('../packages/reputation-graph/adapters');
const { encodeCommand, parseRespBuffer } = require('../packages/reputation-graph/adapters/redis-adapter');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-rg-adapter-')); }

test('JSON adapter persists and reloads a graph snapshot', () => {
  const dir = tmp();
  const adapter = createAdapter({ dir, mode: 'json' });
  const g = { version: 1, updatedAt: '', nodes: { 'domain:foo.com': { type: 'domain', id: 'foo.com', score: 50, hits: 1, lastSeen: new Date().toISOString(), tenants: [], decisions: { block: 1, review: 0, allow: 0 }, dnaFamilies: {} } } };
  adapter.persistGraph(g);
  const reloaded = adapter.loadGraph();
  assert.ok(reloaded.nodes['domain:foo.com']);
  assert.equal(reloaded.nodes['domain:foo.com'].score, 50);
});

test('JSON adapter cache returns a fresh clone (no mutation poisoning)', () => {
  const dir = tmp();
  const adapter = createAdapter({ dir, mode: 'json' });
  adapter.persistGraph({ version: 1, updatedAt: '', nodes: { 'domain:x.com': { type: 'domain', id: 'x.com', score: 10, hits: 1, lastSeen: new Date().toISOString(), tenants: [], decisions: {}, dnaFamilies: {} } } });
  const a = adapter.loadGraph();
  a.nodes['domain:x.com'].score = 999;
  const b = adapter.loadGraph();
  assert.equal(b.nodes['domain:x.com'].score, 10);
});

test('createAdapter rejects unknown modes', () => {
  assert.throws(() => createAdapter({ mode: 'pigeon' }), /unknown adapter mode/);
});

test('Redis RESP encoder produces a valid array command', () => {
  const buf = encodeCommand(['SET', 'key', 'value']);
  const s = buf.toString('utf8');
  assert.match(s, /^\*3\r\n\$3\r\nSET\r\n\$3\r\nkey\r\n\$5\r\nvalue\r\n$/);
});

test('Redis RESP parser handles simple, bulk and array replies', () => {
  const ok = Buffer.from('+OK\r\n');
  assert.equal(parseRespBuffer(ok, 0).value, 'OK');

  const bulk = Buffer.from('$5\r\nhello\r\n');
  assert.equal(parseRespBuffer(bulk, 0).value, 'hello');

  const nullBulk = Buffer.from('$-1\r\n');
  assert.equal(parseRespBuffer(nullBulk, 0).value, null);

  const integer = Buffer.from(':42\r\n');
  assert.equal(parseRespBuffer(integer, 0).value, 42);

  const array = Buffer.from('*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n');
  assert.deepEqual(parseRespBuffer(array, 0).value, ['foo', 'bar']);

  const err = parseRespBuffer(Buffer.from('-ERR something\r\n'), 0);
  assert.ok(err.value instanceof Error);
  assert.equal(err.value.code, 'REDIS_ERROR');
});
