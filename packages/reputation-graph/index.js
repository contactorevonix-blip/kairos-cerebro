// KAIROS — Reputation Graph
// Cross-tenant network-effect intelligence. Every verification globally
// contributes to a shared, time-decaying reputation per entity:
//   - domain (apex, public-suffix-aware best-effort) — OSINT, stored plaintext
//   - URL (full)                                     — OSINT, stored plaintext
//   - email                                          — pseudonymized (psn:<sha256>)
//   - wallet (BTC/ETH/PIX)                           — pseudonymized
//
// Storage abstraction: see packages/reputation-graph/adapters/.
//   - JSON adapter (default): single-process, on-disk, sync.
//   - Redis adapter (production): multi-region, multi-process, async.
// Top-level API stays sync — Redis can be wired as a dual-write replicator
// (see packages/reputation-graph/replicator.js) without changing callers.
//
// Privacy: PII is pseudonymized via @kairos/compliance BEFORE it ever touches
// disk. Plaintext only lives inside the in-memory request context.

'use strict';

const path = require('path');
const crypto = require('crypto');

const { createAdapter } = require('./adapters');
const compliance = require('../compliance');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

const DEFAULT_HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DECISION_WEIGHT = { block: 1.0, review: 0.4, allow: -0.15 };
const MAX_SCORE = 100;
const MIN_SCORE = 0;

const adapterCache = new Map();
function getAdapter(dir = DEFAULT_DIR) {
  if (!adapterCache.has(dir)) {
    adapterCache.set(dir, createAdapter({ dir, mode: 'json' }));
  }
  return adapterCache.get(dir);
}

function nowIso() { return new Date().toISOString(); }

// ─── ENTITY EXTRACTION ────────────────────────────────────────────────────────

function extractDomainFromUrl(rawUrl) {
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.substring(4);
    return host || null;
  } catch {
    return null;
  }
}

function extractEntities(text = '', urls = []) {
  const safe = String(text);
  const out = { domains: new Set(), urls: new Set(), emails: new Set(), wallets: new Set() };

  for (const u of urls || []) {
    if (typeof u === 'string' && u.length > 0) out.urls.add(u);
  }
  const urlRx = /https?:\/\/[^\s"'<>]+/gi;
  let m;
  while ((m = urlRx.exec(safe)) !== null) out.urls.add(m[0]);

  for (const u of out.urls) {
    const d = extractDomainFromUrl(u);
    if (d) out.domains.add(d);
  }
  const bareRx = /\b([a-z0-9-]+(?:\.[a-z0-9-]+){0,3}\.(?:com|net|org|io|co|app|me|xyz|top|click|live|online|site|loan|gq|tk|ml|cf|ga|pw|icu|vip|info|biz|store|shop))\b/gi;
  while ((m = bareRx.exec(safe)) !== null) out.domains.add(m[1].toLowerCase());

  const emailRx = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}\b/gi;
  while ((m = emailRx.exec(safe)) !== null) out.emails.add(m[0].toLowerCase());

  const btcRx = /\b(bc1[a-z0-9]{26,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
  const ethRx = /\b0x[a-fA-F0-9]{40}\b/g;
  const pixRx = /\bpix:[\w@.+-]{6,}\b/gi;
  while ((m = btcRx.exec(safe)) !== null) out.wallets.add(`btc:${m[0]}`);
  while ((m = ethRx.exec(safe)) !== null) out.wallets.add(`eth:${m[0].toLowerCase()}`);
  while ((m = pixRx.exec(safe)) !== null) out.wallets.add(m[0].toLowerCase());

  return {
    domains: Array.from(out.domains).slice(0, 50),
    urls: Array.from(out.urls).slice(0, 50),
    emails: Array.from(out.emails).slice(0, 50),
    wallets: Array.from(out.wallets).slice(0, 50),
  };
}

// Pseudonymize PII entities for graph storage. Domains and URLs are public
// OSINT and pass through unchanged; emails and wallets are hashed with a
// per-installation salt — collisions are cryptographically improbable, so
// matching across requests still works.
function pseudonymizeForStorage(entities) {
  return {
    domains: entities.domains.slice(),
    urls: entities.urls.slice(),
    emails: entities.emails.map((e) => compliance.hashPii(e)),
    wallets: entities.wallets.map((w) => compliance.hashPii(w)),
  };
}

function flattenForGraph(entities) {
  return [
    ...entities.domains.map((d) => ({ type: 'domain', id: d })),
    ...entities.urls.map((u) => ({ type: 'url', id: u })),
    ...entities.emails.map((e) => ({ type: 'email', id: e })),
    ...entities.wallets.map((w) => ({ type: 'wallet', id: w })),
  ];
}

// ─── GRAPH SCORING ───────────────────────────────────────────────────────────

function decay(score, lastSeenIso, halfLifeMs = DEFAULT_HALF_LIFE_MS) {
  if (!lastSeenIso) return score;
  const elapsed = Date.now() - new Date(lastSeenIso).getTime();
  if (elapsed <= 0) return score;
  return score * Math.pow(0.5, elapsed / halfLifeMs);
}

function clampScore(s) {
  if (!Number.isFinite(s)) return 0;
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, s));
}

function nodeKey(type, id) { return `${type}:${id}`; }

function pickTopFamily(node) {
  const fams = node.dnaFamilies || {};
  let topKey = null;
  let topCount = 0;
  for (const [k, c] of Object.entries(fams)) {
    if (c > topCount) { topKey = k; topCount = c; }
  }
  return topKey ? { family: topKey, count: topCount } : null;
}

// ─── PRE-VERDICT QUERY ───────────────────────────────────────────────────────

function queryPreVerdict({ text, urls = [], dir = DEFAULT_DIR, halfLifeMs } = {}) {
  const adapter = getAdapter(dir);
  const graph = adapter.loadGraph();
  const entities = pseudonymizeForStorage(extractEntities(text, urls));
  const flat = flattenForGraph(entities);

  const matched = [];
  let topScore = 0;
  let topEntity = null;

  for (const e of flat) {
    const node = graph.nodes[nodeKey(e.type, e.id)];
    if (!node) continue;
    const decayed = clampScore(decay(node.score, node.lastSeen, halfLifeMs));
    matched.push({
      type: e.type,
      id: e.id,
      score: Math.round(decayed),
      hits: node.hits,
      tenants: (node.tenants || []).slice(0, 5),
      lastSeen: node.lastSeen,
      topFamily: pickTopFamily(node),
    });
    if (decayed > topScore) {
      topScore = decayed;
      topEntity = { type: e.type, id: e.id };
    }
  }

  return {
    networkScore: Math.round(topScore),
    topEntity,
    matched,
    extractedEntityCount: flat.length,
  };
}

// ─── CONTRIBUTION (post-verdict update) ──────────────────────────────────────

function contribute({
  text = '',
  urls = [],
  decision,
  score = 0,
  tenantId = 'unknown',
  dnaFamily = null,
  dir = DEFAULT_DIR,
  halfLifeMs,
} = {}) {
  if (!decision) throw new Error('contribute: decision required');
  const adapter = getAdapter(dir);
  const entities = pseudonymizeForStorage(extractEntities(text, urls));
  const graph = adapter.loadGraph();
  const decisionWeight = DECISION_WEIGHT[decision] ?? 0;
  const contributionRecord = {
    timestamp: nowIso(),
    tenantId,
    decision,
    score,
    dnaFamily,
    entityCounts: {
      domains: entities.domains.length,
      urls: entities.urls.length,
      emails: entities.emails.length,
      wallets: entities.wallets.length,
    },
    compliance: compliance.buildComplianceEnvelope({ pseudonymized: true }),
  };

  const flat = flattenForGraph(entities);
  for (const e of flat) {
    const k = nodeKey(e.type, e.id);
    let node = graph.nodes[k];
    if (!node) {
      node = {
        type: e.type, id: e.id,
        score: 0, hits: 0,
        firstSeen: nowIso(), lastSeen: nowIso(),
        tenants: [], decisions: { block: 0, review: 0, allow: 0 },
        dnaFamilies: {},
      };
      graph.nodes[k] = node;
    }
    node.score = clampScore(decay(node.score, node.lastSeen, halfLifeMs));
    const delta = decisionWeight * (Number(score) / 100) * 25;
    node.score = clampScore(node.score + delta);
    node.hits += 1;
    node.lastSeen = nowIso();
    node.decisions[decision] = (node.decisions[decision] || 0) + 1;
    if (!node.tenants.includes(tenantId)) {
      node.tenants.push(tenantId);
      if (node.tenants.length > 50) node.tenants = node.tenants.slice(-50);
    }
    if (dnaFamily) {
      node.dnaFamilies[dnaFamily] = (node.dnaFamilies[dnaFamily] || 0) + 1;
    }
  }

  adapter.persistGraph(graph);
  adapter.appendContribution(contributionRecord);
  return { entitiesUpdated: flat.length };
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

function listTopEntities({ limit = 50, type = null, dir = DEFAULT_DIR, halfLifeMs } = {}) {
  const adapter = getAdapter(dir);
  const graph = adapter.loadGraph();
  const items = Object.values(graph.nodes)
    .filter((n) => !type || n.type === type)
    .map((n) => ({
      type: n.type,
      id: n.id,
      score: Math.round(clampScore(decay(n.score, n.lastSeen, halfLifeMs))),
      hits: n.hits,
      tenants: n.tenants.length,
      lastSeen: n.lastSeen,
      topFamily: pickTopFamily(n),
    }))
    .sort((a, b) => b.score - a.score);
  return items.slice(0, limit);
}

// ─── SIGNED EXPORT FEED ──────────────────────────────────────────────────────

function signFeed({ secret, dir = DEFAULT_DIR, minScore = 50 } = {}) {
  if (!secret) throw new Error('signFeed: secret required (use the vault)');
  const items = listTopEntities({ limit: 10_000, dir }).filter((i) => i.score >= minScore);
  const body = {
    version: 1,
    generatedAt: nowIso(),
    minScore,
    count: items.length,
    items,
  };
  const payload = JSON.stringify(body);
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return { body, signature, payload };
}

function verifyFeed({ payload, signature, secret }) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ─── INTROSPECTION ───────────────────────────────────────────────────────────

function loadGraph(dir = DEFAULT_DIR) {
  return getAdapter(dir).loadGraph();
}

function emptyGraph() {
  return { version: 1, updatedAt: nowIso(), nodes: {} };
}

module.exports = {
  // queries
  queryPreVerdict,
  listTopEntities,
  // mutations
  contribute,
  // util
  extractEntities,
  extractDomainFromUrl,
  pseudonymizeForStorage,
  // export
  signFeed,
  verifyFeed,
  // testing helpers
  loadGraph,
  emptyGraph,
};
