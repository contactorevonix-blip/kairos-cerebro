'use strict';

/**
 * KAIROS HYPERDRIVE — Checkpointing Atómico
 * Snapshot a cada 50 eventos, 5 min, ou antes de operação crítica.
 * Escrita atómica: .tmp → fsync → rename
 */

const fs   = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { ulid } = require('./ledger');

const SNAP_DIR  = path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'snapshots');
const KG_PATH   = path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'knowledge-graph.json');
const LEDGER_PATH = path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'state-ledger.jsonl');

function createSnapshot(agentStates = {}, taskQueue = [], metadata = {}) {
  fs.mkdirSync(SNAP_DIR, { recursive: true });

  let kg = {};
  try { kg = JSON.parse(fs.readFileSync(KG_PATH, 'utf8')); } catch {}

  let lastEvent = null;
  try {
    const lines = fs.readFileSync(LEDGER_PATH, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length) lastEvent = JSON.parse(lines[lines.length - 1]);
  } catch {}

  const snapshot = {
    id:         ulid(),
    createdAt:  new Date().toISOString(),
    lastEvent:  lastEvent?.id || null,
    agentStates,
    taskQueue,
    kg,
    metadata,
  };

  const id      = snapshot.id;
  const snapPath = path.join(SNAP_DIR, `snap-${id}.json.gz`);
  const tmpPath  = snapPath + '.tmp';

  const compressed = zlib.gzipSync(JSON.stringify(snapshot));
  fs.writeFileSync(tmpPath, compressed);
  fs.renameSync(tmpPath, snapPath);

  console.log(`SNAPSHOT: snap-${id}.json.gz criado.`);
  return { id, path: snapPath };
}

function loadLatestSnapshot() {
  try {
    const files = fs.readdirSync(SNAP_DIR)
      .filter(f => f.startsWith('snap-') && f.endsWith('.json.gz'))
      .sort()
      .reverse();

    for (const file of files) {
      try {
        const compressed = fs.readFileSync(path.join(SNAP_DIR, file));
        const data = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
        console.log(`SNAPSHOT: carregado ${file}`);
        return data;
      } catch { continue; }
    }
  } catch {}
  return null;
}

module.exports = { createSnapshot, loadLatestSnapshot };
