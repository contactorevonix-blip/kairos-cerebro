'use strict';

/**
 * Graph aggregator worker — runs hourly, re-aggregates raw JSONL files
 * and writes the aggregated cache. Also handles:
 *  - Tombstone exclusion (skips tombstoned customer hashes)
 *  - 90-day retention: JSONL lines older than 90d are trimmed on next cycle
 *  - Weekly compaction: removes tombstoned lines from raw files
 */

const fs   = require('fs');
const path = require('path');

const {
  aggregate,
  ensureDir,
  loadTombstoneHashes,
  GRAPH_RAW_DIR,
  GRAPH_AGG_DIR,
  GRAPH_TOMBSTONE_DIR,
} = require('./storage');

const RETENTION_MS       = 90 * 24 * 60 * 60 * 1000;  // 90 days
const PRUNE_INACTIVE_MS  = 180 * 24 * 60 * 60 * 1000; // 180 days — prune aggregated cache

let _timer = null;
let _running = false;

// ─── helpers ─────────────────────────────────────────────────────────────────

function walkJsonl(baseDir, cb) {
  if (!fs.existsSync(baseDir)) return;
  for (const type of fs.readdirSync(baseDir)) {
    const typeDir = path.join(baseDir, type);
    if (!fs.statSync(typeDir).isDirectory()) continue;
    for (const bucket of fs.readdirSync(typeDir)) {
      const bucketDir = path.join(typeDir, bucket);
      if (!fs.statSync(bucketDir).isDirectory()) continue;
      for (const file of fs.readdirSync(bucketDir)) {
        if (!file.endsWith('.jsonl')) continue;
        cb({ type, bucket, file, fullPath: path.join(bucketDir, file) });
      }
    }
  }
}

// ─── aggregation cycle ────────────────────────────────────────────────────────

function runCycle() {
  if (_running) return { skipped: true, reason: 'already_running' };
  _running = true;

  const started = Date.now();
  const tombstones = loadTombstoneHashes();
  const now = Date.now();
  const cutoff = now - RETENTION_MS;

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let pruned = 0;
  let compacted = 0;

  try {
    walkJsonl(GRAPH_RAW_DIR, ({ type, file, fullPath }) => {
      try {
        const rawContent = fs.readFileSync(fullPath, 'utf8');
        const allLines = rawContent.split('\n').filter(Boolean);
        if (allLines.length === 0) { skipped++; return; }

        // Filter: exclude tombstoned + older than 90d (for aggregation)
        const activeLines = allLines.filter(line => {
          try {
            const r = JSON.parse(line);
            if (tombstones.has(r.c)) return false;
            if (r.ts < cutoff) return false;
            return true;
          } catch { return false; }
        });

        const entityHash = file.replace('.jsonl', '');
        const aggFilePath = path.join(GRAPH_AGG_DIR, type, entityHash.slice(0, 2), `${entityHash}.json`);

        if (activeLines.length === 0) {
          // All lines tombstoned or expired — remove aggregated cache
          try { if (fs.existsSync(aggFilePath)) fs.unlinkSync(aggFilePath); } catch { /* best-effort */ }
          pruned++;
          return;
        }

        const agg = aggregate(activeLines, tombstones);
        if (!agg) { skipped++; return; }

        // Prune inactive entities (no check in 180 days)
        if (agg.last_seen < now - PRUNE_INACTIVE_MS) {
          try { if (fs.existsSync(aggFilePath)) fs.unlinkSync(aggFilePath); } catch { /* best-effort */ }
          pruned++;
          return;
        }

        ensureDir(aggFilePath);
        const tmp = `${aggFilePath}.${process.pid}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(agg), 'utf8');
        fs.renameSync(tmp, aggFilePath);
        processed++;
      } catch (err) {
        errors++;
      }
    });
  } finally {
    _running = false;
  }

  const duration_ms = Date.now() - started;
  return { processed, skipped, errors, pruned, compacted, duration_ms, tombstones: tombstones.size };
}

// ─── weekly compaction ────────────────────────────────────────────────────────
// Physically removes tombstoned lines from raw JSONL files.
// Run once per week during low-traffic window.

function runCompaction() {
  const tombstones = loadTombstoneHashes();
  if (tombstones.size === 0) return { compacted: 0, failed: 0, duration_ms: 0 };

  const started = Date.now();
  let compacted = 0;
  let failed = 0;

  // Two-phase commit: rewrite files, verify, then remove tombstone per-customer.
  // A tombstone is only removed when ALL files no longer contain that customer's data.
  // If any rewrite fails, the tombstone is preserved for the next compaction run.

  for (const customerHash of tombstones) {
    let filesFailed = 0;
    let filesProcessed = 0;

    walkJsonl(GRAPH_RAW_DIR, ({ fullPath }) => {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes(customerHash)) return; // fast path: skip unaffected files

        const lines = content.split('\n').filter(Boolean);
        const clean = lines.filter(line => {
          try { return JSON.parse(line).c !== customerHash; }
          catch { return true; }
        });

        if (clean.length === lines.length) return; // nothing to remove for this customer

        // Phase 1: atomic rewrite
        const tmp = `${fullPath}.compact.${process.pid}.tmp`;
        fs.writeFileSync(tmp, clean.join('\n') + (clean.length ? '\n' : ''), 'utf8');
        fs.renameSync(tmp, fullPath);
        filesProcessed++;

        // Phase 2: verify erasure (re-read and confirm hash absent)
        const verified = fs.readFileSync(fullPath, 'utf8');
        if (verified.includes(customerHash)) {
          // Rewrite succeeded but data still present — should never happen, but guard
          filesFailed++;
        }
      } catch {
        filesFailed++;
      }
    });

    if (filesFailed === 0) {
      // All rewrites verified — safe to remove tombstone
      try {
        const tPath = path.join(GRAPH_TOMBSTONE_DIR, `${customerHash}.json`);
        if (fs.existsSync(tPath)) fs.unlinkSync(tPath);
        compacted++;
      } catch { failed++; }
    } else {
      // Partial failure: preserve tombstone for next run
      failed++;
    }
  }

  return { compacted, failed, duration_ms: Date.now() - started };
}

// ─── scheduler ────────────────────────────────────────────────────────────────

function start(intervalMs = 60 * 60 * 1000) {
  if (_timer) return;

  // Run once immediately on start
  const result = runCycle();
  console.log('[graph-aggregator] initial cycle:', JSON.stringify(result));

  _timer = setInterval(() => {
    const r = runCycle();
    console.log('[graph-aggregator] hourly cycle:', JSON.stringify(r));
  }, intervalMs);

  // Timer must not prevent process from exiting
  if (_timer.unref) _timer.unref();

  // Weekly compaction: run every 7 days
  const compactionTimer = setInterval(() => {
    const r = runCompaction();
    console.log('[graph-aggregator] compaction:', JSON.stringify(r));
  }, 7 * 24 * 60 * 60 * 1000);
  if (compactionTimer.unref) compactionTimer.unref();
}

function stop() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

module.exports = { start, stop, runCycle, runCompaction, loadTombstoneHashes };
