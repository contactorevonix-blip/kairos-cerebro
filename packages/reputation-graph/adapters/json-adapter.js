// KAIROS Reputation Graph — JSON adapter (default, zero-dep)
// Implements the storage interface used by the graph in single-process or
// small-scale deployments. Atomic file rename + in-process LRU snapshot cache.

'use strict';

const fs = require('fs');
const path = require('path');

const FILES = {
  contributions: 'reputation-contributions.jsonl',
  snapshot: 'reputation-snapshot.json',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function nowIso() { return new Date().toISOString(); }

function emptyGraph() {
  return { version: 1, updatedAt: nowIso(), nodes: {} };
}

function createJsonAdapter({ dir }) {
  if (!dir) throw new Error('json-adapter: dir required');
  let cache = null;
  let cacheMtime = 0;

  const snapshotPath = () => path.join(dir, FILES.snapshot);
  const contribPath = () => path.join(dir, FILES.contributions);

  function loadGraph() {
    const file = snapshotPath();
    if (!fs.existsSync(file)) return emptyGraph();
    const stat = fs.statSync(file);
    if (cache && stat.mtimeMs === cacheMtime) {
      // Defensive deep clone to prevent caller mutations from poisoning the cache.
      return JSON.parse(JSON.stringify(cache));
    }
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw) return emptyGraph();
    try {
      cache = JSON.parse(raw);
      cacheMtime = stat.mtimeMs;
      return JSON.parse(JSON.stringify(cache));
    } catch {
      return emptyGraph();
    }
  }

  function persistGraph(graph) {
    graph.updatedAt = nowIso();
    ensureDir(dir);
    const file = snapshotPath();
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(graph, null, 2), 'utf8');
    fs.renameSync(tmp, file);
    cache = JSON.parse(JSON.stringify(graph));
    cacheMtime = fs.statSync(file).mtimeMs;
  }

  function appendContribution(record) {
    ensureDir(dir);
    fs.appendFileSync(contribPath(), `${JSON.stringify(record)}\n`, 'utf8');
  }

  function invalidateCache() { cache = null; cacheMtime = 0; }

  return {
    type: 'json',
    loadGraph,
    persistGraph,
    appendContribution,
    invalidateCache,
  };
}

module.exports = { createJsonAdapter, emptyGraph };
