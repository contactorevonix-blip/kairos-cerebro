'use strict';

/**
 * CHECK ENGINE — Check Storage
 * JSONL append-only. Cada linha = um check completo.
 * Compatível com Railway volume (CHECKS_STORAGE_PATH env).
 */

const fs   = require('node:fs');
const path = require('node:path');

const STORAGE_PATH = process.env.CHECKS_STORAGE_PATH ||
  path.join(process.cwd(), '.kairos-data', 'check-engine-checks.jsonl');

function ensureDir() {
  const dir = path.dirname(STORAGE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function append(record) {
  try {
    ensureDir();
    fs.appendFileSync(STORAGE_PATH, JSON.stringify(record) + '\n', 'utf8');
    return true;
  } catch { return false; }
}

function readLast(n = 100) {
  try {
    const lines = fs.readFileSync(STORAGE_PATH, 'utf8')
      .trim().split('\n').filter(Boolean);
    return lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

function getById(checkId) {
  try {
    const lines = fs.readFileSync(STORAGE_PATH, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const rec = JSON.parse(lines[i]);
        if (rec.check_id === checkId) return rec;
      } catch {}
    }
  } catch {}
  return null;
}

function updateFeedback(checkId, feedback) {
  // JSONL append-only: adiciona linha de feedback linkada ao check_id
  return append({ type: 'feedback', check_id: checkId, ...feedback, ts: Date.now() });
}

function stats(windowHours = 168) {
  const since  = Date.now() - windowHours * 60 * 60 * 1000;
  const checks = readLast(10000).filter(r => r.type !== 'feedback' && r.ts > since);

  const byDecision = { accept: 0, review: 0, decline: 0 };
  let scoreSum = 0, timeSum = 0;

  for (const c of checks) {
    byDecision[c.decision]        = (byDecision[c.decision] || 0) + 1;
    scoreSum                     += c.score || 0;
    timeSum                      += c.execution_time_ms || 0;
  }

  const total = checks.length;
  return {
    total,
    by_decision:     byDecision,
    avg_score:       total ? Math.round(scoreSum / total * 10) / 10 : 0,
    avg_execution_ms: total ? Math.round(timeSum / total) : 0,
  };
}

module.exports = { append, readLast, getById, updateFeedback, stats };
