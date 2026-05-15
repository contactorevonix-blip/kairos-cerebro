// KAIROS SNIPER — Persistent Data Layer v1
// Zero-dependency JSON-backed store with atomic writes.
// Tables: tenants, api_keys (hashed), verifications, metrics.
// Designed to migrate to Postgres/Supabase when row count > 1e6.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_DB_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

const FILES = {
  tenants: 'tenants.json',
  apiKeys: 'api_keys.json',
  verifications: 'verifications.jsonl',
  metrics: 'metrics.json',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJsonAtomic(file, data) {
  const dir = path.dirname(file);
  ensureDir(dir);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function appendJsonl(file, record) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function dbPath(name, dir = DEFAULT_DB_DIR) {
  return path.join(dir, FILES[name]);
}

function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(String(rawKey)).digest('hex');
}

function generateRawApiKey() {
  return `ksk_${crypto.randomBytes(24).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

// ─── TENANTS ──────────────────────────────────────────────────────────────────

function listTenants(dir = DEFAULT_DB_DIR) {
  return readJson(dbPath('tenants', dir), []);
}

function upsertTenant(tenant, dir = DEFAULT_DB_DIR) {
  if (!tenant || !tenant.tenantId) {
    throw new Error('tenantId is required');
  }
  const tenants = listTenants(dir);
  const idx = tenants.findIndex((t) => t.tenantId === tenant.tenantId);
  const record = {
    tenantId: tenant.tenantId,
    name: tenant.name || tenant.tenantId,
    plan: tenant.plan || 'b2b-pilot',
    rateLimitPerMinute: Number.isFinite(tenant.rateLimitPerMinute)
      ? tenant.rateLimitPerMinute
      : 120,
    webhookUrl: tenant.webhookUrl || (idx >= 0 ? tenants[idx].webhookUrl : null) || null,
    webhookSecret: tenant.webhookSecret || (idx >= 0 ? tenants[idx].webhookSecret : null) || null,
    createdAt: idx >= 0 ? tenants[idx].createdAt : nowIso(),
    updatedAt: nowIso(),
  };
  if (idx >= 0) {
    tenants[idx] = { ...tenants[idx], ...record };
  } else {
    tenants.push(record);
  }
  writeJsonAtomic(dbPath('tenants', dir), tenants);
  return record;
}

function getTenant(tenantId, dir = DEFAULT_DB_DIR) {
  return listTenants(dir).find((t) => t.tenantId === tenantId) || null;
}

// ─── API KEYS (hashed) ────────────────────────────────────────────────────────

function listApiKeys(dir = DEFAULT_DB_DIR) {
  return readJson(dbPath('apiKeys', dir), []);
}

function createApiKey(tenantId, label = 'default', dir = DEFAULT_DB_DIR) {
  if (!tenantId) throw new Error('tenantId is required');
  const tenant = getTenant(tenantId, dir);
  if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

  const rawKey = generateRawApiKey();
  const record = {
    keyHash: hashApiKey(rawKey),
    tenantId,
    label,
    createdAt: nowIso(),
    lastUsedAt: null,
    revokedAt: null,
  };
  const keys = listApiKeys(dir);
  keys.push(record);
  writeJsonAtomic(dbPath('apiKeys', dir), keys);
  return { rawKey, record };
}

function revokeApiKey(rawKey, dir = DEFAULT_DB_DIR) {
  const keyHash = hashApiKey(rawKey);
  const keys = listApiKeys(dir);
  const idx = keys.findIndex((k) => k.keyHash === keyHash);
  if (idx < 0) return false;
  keys[idx].revokedAt = nowIso();
  writeJsonAtomic(dbPath('apiKeys', dir), keys);
  return true;
}

function findApiKey(rawKey, dir = DEFAULT_DB_DIR) {
  if (!rawKey) return null;
  const keyHash = hashApiKey(rawKey);
  const keys = listApiKeys(dir);
  const record = keys.find((k) => k.keyHash === keyHash && !k.revokedAt);
  if (!record) return null;
  return record;
}

function touchApiKey(rawKey, dir = DEFAULT_DB_DIR) {
  const keyHash = hashApiKey(rawKey);
  const keys = listApiKeys(dir);
  const idx = keys.findIndex((k) => k.keyHash === keyHash);
  if (idx < 0) return;
  keys[idx].lastUsedAt = nowIso();
  writeJsonAtomic(dbPath('apiKeys', dir), keys);
}

function rotateApiKey(tenantId, label = 'rotated', dir = DEFAULT_DB_DIR) {
  if (!tenantId) throw new Error('tenantId is required');
  const tenant = getTenant(tenantId, dir);
  if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

  const keys = listApiKeys(dir);
  const activeKeys = keys
    .filter((k) => k.tenantId === tenantId && !k.revokedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (activeKeys.length === 0) throw new Error(`No active keys found for tenant: ${tenantId}`);

  const oldKey = activeKeys[0];
  const rawKey = generateRawApiKey();
  const now = nowIso();
  const newRecord = {
    keyHash: hashApiKey(rawKey),
    tenantId,
    label,
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  };

  const updated = keys.map((k) =>
    k.keyHash === oldKey.keyHash ? { ...k, revokedAt: now } : k,
  );
  updated.push(newRecord);
  writeJsonAtomic(dbPath('apiKeys', dir), updated);

  return { rawKey, newRecord, oldRecord: oldKey };
}

// ─── VERIFICATIONS (audit trail, tamper-evident chain) ───────────────────────
//
// Every record carries a SHA-256 link to the previous record's hash, forming a
// hash chain. Anyone with the file can verify that no record was modified or
// deleted by replaying the chain — see `verifyAuditChain` below.

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function loadLastChainHash(dir = DEFAULT_DB_DIR) {
  const file = dbPath('verifications', dir);
  if (!fs.existsSync(file)) return GENESIS_HASH;
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw) return GENESIS_HASH;
  const lines = raw.trimEnd().split('\n').filter(Boolean);
  if (lines.length === 0) return GENESIS_HASH;
  try {
    const last = JSON.parse(lines[lines.length - 1]);
    return last.chainHash || GENESIS_HASH;
  } catch { return GENESIS_HASH; }
}

function computeChainHash(prevHash, body) {
  return crypto.createHash('sha256')
    .update(prevHash)
    .update('\u241e')
    .update(JSON.stringify(body))
    .digest('hex');
}

function recordVerification(entry, dir = DEFAULT_DB_DIR) {
  const body = {
    timestamp: nowIso(),
    tenantId: entry.tenantId || 'public',
    decision: entry.decision || 'unknown',
    score: Number(entry.score) || 0,
    trustLevel: entry.trustLevel || null,
    channel: entry.channel || 'unknown',
    sourceUrl: entry.sourceUrl || null,
    textPreview: entry.textPreview ? String(entry.textPreview).substring(0, 200) : null,
    redactionCounts: entry.redactionCounts || null,
    reasonCount: Number(entry.reasonCount) || 0,
    dnaFingerprint: entry.dnaFingerprint || null,
    dnaFamily: entry.dnaFamily || null,
    dnaSeverity: entry.dnaSeverity || null,
    requestId: entry.requestId || crypto.randomUUID(),
  };
  const prevHash = loadLastChainHash(dir);
  const chainHash = computeChainHash(prevHash, body);
  const record = { ...body, prevHash, chainHash };
  appendJsonl(dbPath('verifications', dir), record);
  return record;
}

function readVerifications(limit = 100, dir = DEFAULT_DB_DIR) {
  const file = dbPath('verifications', dir);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw) return [];
  const lines = raw.split('\n').filter(Boolean);
  const slice = lines.slice(-limit);
  return slice
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

// Replays the chain. Returns { valid, total, brokenAt? } so an auditor (or the
// /health probe) can prove integrity without trusting our service.
function verifyAuditChain(dir = DEFAULT_DB_DIR) {
  const file = dbPath('verifications', dir);
  if (!fs.existsSync(file)) return { valid: true, total: 0 };
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw) return { valid: true, total: 0 };
  const lines = raw.split('\n').filter(Boolean);
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < lines.length; i += 1) {
    let parsed;
    try { parsed = JSON.parse(lines[i]); }
    catch { return { valid: false, total: i, brokenAt: i, reason: 'JSON_PARSE' }; }
    if (parsed.prevHash !== prevHash) {
      return { valid: false, total: i, brokenAt: i, reason: 'PREV_HASH_MISMATCH' };
    }
    const { chainHash, prevHash: _ph, ...body } = parsed;
    const expected = computeChainHash(prevHash, body);
    if (expected !== chainHash) {
      return { valid: false, total: i, brokenAt: i, reason: 'HASH_MISMATCH' };
    }
    prevHash = chainHash;
  }
  return { valid: true, total: lines.length, headHash: prevHash };
}

// ─── METRICS (persistent global counters) ─────────────────────────────────────

function readGlobalMetrics(dir = DEFAULT_DB_DIR) {
  return readJson(dbPath('metrics', dir), {
    startedAt: nowIso(),
    verifyRequests: 0,
    blocked: 0,
    review: 0,
    allowed: 0,
    estimatedProtectedValueEur: 0,
    lastUpdatedAt: null,
  });
}

function updateGlobalMetrics(decision, dir = DEFAULT_DB_DIR) {
  const m = readGlobalMetrics(dir);
  m.verifyRequests += 1;
  if (decision === 'block') {
    m.blocked += 1;
    m.estimatedProtectedValueEur += 12;
  } else if (decision === 'review') {
    m.review += 1;
    m.estimatedProtectedValueEur += 4;
  } else {
    m.allowed += 1;
    m.estimatedProtectedValueEur += 1;
  }
  m.lastUpdatedAt = nowIso();
  writeJsonAtomic(dbPath('metrics', dir), m);
  return m;
}

// ─── BOOTSTRAP (creates demo tenants + keys on first boot) ───────────────────

function bootstrapIfEmpty(dir = DEFAULT_DB_DIR) {
  ensureDir(dir);
  const tenants = listTenants(dir);
  if (tenants.length > 0) {
    return { bootstrapped: false, tenants };
  }
  upsertTenant({ tenantId: 'kairos-internal', name: 'KAIROS Internal', plan: 'internal', rateLimitPerMinute: 600 }, dir);
  upsertTenant({ tenantId: 'demo-bank', name: 'Demo Bank Pilot', plan: 'b2b-pilot', rateLimitPerMinute: 120 }, dir);
  upsertTenant({ tenantId: 'demo-store', name: 'Demo Store', plan: 'white-label-starter', rateLimitPerMinute: 60 }, dir);
  const internal = createApiKey('kairos-internal', 'bootstrap-internal', dir);
  const bank = createApiKey('demo-bank', 'bootstrap-bank', dir);
  const store = createApiKey('demo-store', 'bootstrap-store', dir);
  return {
    bootstrapped: true,
    tenants: listTenants(dir),
    bootstrapKeys: { internal: internal.rawKey, bank: bank.rawKey, store: store.rawKey },
  };
}

// ─── ALLOWLIST / DENYLIST ─────────────────────────────────────────────────────
function listFilePath(tenantId, dir = DEFAULT_DB_DIR) {
  return path.join(dir, 'lists', `${String(tenantId).replace(/[^a-z0-9_-]/gi, '_')}.json`);
}

function getAllowDenyList(tenantId, dir = DEFAULT_DB_DIR) {
  const file = listFilePath(tenantId, dir);
  if (!fs.existsSync(file)) return { allow: [], deny: [] };
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { allow: [], deny: [] }; }
}

function addToList(tenantId, listType, entity, dir = DEFAULT_DB_DIR) {
  if (!['allow', 'deny'].includes(listType)) throw new Error('listType must be allow or deny');
  const lists = getAllowDenyList(tenantId, dir);
  const normalized = String(entity).toLowerCase().trim();
  if (!lists[listType].includes(normalized)) {
    lists[listType].push(normalized);
    ensureDir(path.dirname(listFilePath(tenantId, dir)));
    writeJsonAtomic(listFilePath(tenantId, dir), lists);
  }
  return lists;
}

function removeFromList(tenantId, listType, entity, dir = DEFAULT_DB_DIR) {
  if (!['allow', 'deny'].includes(listType)) throw new Error('listType must be allow or deny');
  const lists = getAllowDenyList(tenantId, dir);
  const normalized = String(entity).toLowerCase().trim();
  lists[listType] = lists[listType].filter(e => e !== normalized);
  writeJsonAtomic(listFilePath(tenantId, dir), lists);
  return lists;
}

// ─── REFERRAL SYSTEM ──────────────────────────────────────────────────────────
const REFERRALS_FILE = (dir = DEFAULT_DB_DIR) => path.join(dir, 'referrals.jsonl');
const REFERRAL_TOKENS = 500; // tokens credited to both parties

function saveReferral(record, dir = DEFAULT_DB_DIR) {
  ensureDir(dir);
  appendJsonl(REFERRALS_FILE(dir), { ...record, ts: nowIso() });
}

function listReferrals(dir = DEFAULT_DB_DIR) {
  const file = REFERRALS_FILE(dir);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function getReferralByCode(code, dir = DEFAULT_DB_DIR) {
  return listReferrals(dir).filter(r => r.code === code);
}

// ─── TOKEN ECONOMY ────────────────────────────────────────────────────────────
// Append-only ledger per tenant. Balance = sum of credits - sum of debits.
// Monthly subscription grants tokens at first check of each billing month.

const TOKEN_COSTS  = { domain: 1, email: 1, phone: 2, iban: 3 };
const MONTHLY_TOKENS = {
  free:       50,     // €0    — integrar e testar
  starter:    300,    // €29   — projecto pequeno (~150 signups/mês)
  growth:     1000,   // €59   — negócio a crescer (~500 signups/mês)
  pro:        3000,   // €99   — SaaS sério (~1500 signups/mês)
  scale:      15000,  // €249  — alto volume
  enterprise: 100000, // €800+ — grafo dedicado, custom
};

function tokenFilePath(tenantId, dir = DEFAULT_DB_DIR) {
  return path.join(dir, 'tokens', `${String(tenantId).replace(/[^a-z0-9_-]/gi, '_')}.jsonl`);
}

function readTokenLedger(tenantId, dir = DEFAULT_DB_DIR) {
  const file = tokenFilePath(tenantId, dir);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function getTokenBalance(tenantId, dir = DEFAULT_DB_DIR) {
  return readTokenLedger(tenantId, dir).reduce((sum, e) => {
    if (e.type === 'credit') return sum + (e.amount || 0);
    if (e.type === 'debit')  return sum - (e.amount || 0);
    return sum;
  }, 0);
}

function creditTokens(tenantId, amount, source, ref, dir = DEFAULT_DB_DIR) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Token amount must be positive');
  const balance = getTokenBalance(tenantId, dir);
  const newBalance = balance + amount;
  appendJsonl(tokenFilePath(tenantId, dir), {
    ts: nowIso(), type: 'credit', amount, balance: newBalance, source, ref,
  });
  return newBalance;
}

function debitTokens(tenantId, amount, entityType, ref, dir = DEFAULT_DB_DIR) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Token amount must be positive');
  const balance = getTokenBalance(tenantId, dir);
  if (balance < amount) return { ok: false, balance, needed: amount };
  const newBalance = balance - amount;
  appendJsonl(tokenFilePath(tenantId, dir), {
    ts: nowIso(), type: 'debit', amount, balance: newBalance, entity_type: entityType, ref,
  });
  return { ok: true, balance: newBalance };
}

function ensureMonthlyTokens(tenantId, tier, dir = DEFAULT_DB_DIR) {
  const monthKey = nowIso().slice(0, 7); // YYYY-MM
  const ledger = readTokenLedger(tenantId, dir);
  // Idempotent: only grant once per billing month
  if (ledger.some(e => e.type === 'credit' && e.source === 'monthly_grant' && e.ref === monthKey)) {
    return false; // already granted this month
  }
  const amount = MONTHLY_TOKENS[tier] || MONTHLY_TOKENS.free;
  creditTokens(tenantId, amount, 'monthly_grant', monthKey, dir);
  return true; // newly granted
}

function getTokenCost(entityType) {
  return TOKEN_COSTS[String(entityType).toLowerCase()] || 1;
}

function getTokenHistory(tenantId, limit = 50, dir = DEFAULT_DB_DIR) {
  const ledger = readTokenLedger(tenantId, dir);
  return ledger.slice(-limit).reverse();
}

module.exports = {
  // path
  DEFAULT_DB_DIR,
  // tenants
  listTenants,
  upsertTenant,
  getTenant,
  // api keys
  listApiKeys,
  createApiKey,
  revokeApiKey,
  rotateApiKey,
  findApiKey,
  touchApiKey,
  hashApiKey,
  generateRawApiKey,
  // verifications
  recordVerification,
  readVerifications,
  verifyAuditChain,
  // metrics
  readGlobalMetrics,
  updateGlobalMetrics,
  // bootstrap
  bootstrapIfEmpty,
  // allowlist/denylist
  getAllowDenyList,
  addToList,
  removeFromList,
  // referrals
  saveReferral,
  getReferralByCode,
  listReferrals,
  // token economy
  TOKEN_COSTS,
  MONTHLY_TOKENS,
  readTokenLedger,
  getTokenBalance,
  creditTokens,
  debitTokens,
  ensureMonthlyTokens,
  getTokenCost,
  getTokenHistory,
};
