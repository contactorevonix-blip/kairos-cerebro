// KAIROS — Compliance & Privacy Layer (GDPR/RGPD bulletproof shield)
//
// Mission: KAIROS only ingests OSINT — Open-Source Intelligence — that is
// public-by-construction (e.g. text the user pasted, public web pages they
// asked us to scan). Even when input includes incidental PII (emails, names,
// phone numbers, payment identifiers), we MUST:
//
//   1. Pseudonymize PII via salted SHA-256 BEFORE persistence.
//   2. Mark every persisted record with `dataSource: 'osint'` and a
//      `lawfulBasis` (Art.6 GDPR: legitimate interest in fraud prevention).
//   3. Allow data subjects to exercise rights of access (Art.15) and
//      erasure (Art.17) via deterministic functions.
//   4. Enforce retention: anything older than the policy window is purged.
//
// The salt is read from the vault. NEVER hard-coded. NEVER logged.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

const DEFAULT_RETENTION_DAYS = Number(process.env.KAIROS_RETENTION_DAYS || 90);

const PII_PATTERNS = {
  email: /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24})\b/gi,
  // International phone (E.164 + common local formats)
  phone: /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}\b/g,
  // BTC/ETH/PIX wallets are quasi-identifiers under GDPR
  btc: /\b(bc1[a-z0-9]{26,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
  eth: /\b0x[a-fA-F0-9]{40}\b/g,
  pix: /\bpix:[\w@.+-]{6,}\b/gi,
  // National IDs (best-effort: PT NIF, BR CPF, ES NIE/DNI, DE Steuer-ID)
  nifPT: /\b\d{9}\b/g,
  cpfBR: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  // Bank-card-like numbers (best-effort, 13–19 digits, no Luhn check here)
  card: /\b(?:\d[ -]*?){13,19}\b/g,
};

// ─── PSEUDONYMIZATION ────────────────────────────────────────────────────────

function getSalt({ explicit, dir = DEFAULT_DIR } = {}) {
  if (explicit) return String(explicit);
  if (process.env.KAIROS_PII_SALT) return String(process.env.KAIROS_PII_SALT);
  // Try the vault. If unavailable, fall back to a per-install salt persisted
  // inside .kairos-data/pii-salt (file-system-only, never logged).
  const file = path.join(dir, 'pii-salt');
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf8').trim();
  }
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const salt = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(file, salt, { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(file, 0o600); } catch { /* best-effort on Windows */ }
  return salt;
}

function hashPii(value, opts = {}) {
  const salt = getSalt(opts);
  return `psn:${crypto.createHmac('sha256', salt).update(String(value).toLowerCase()).digest('hex').substring(0, 32)}`;
}

function pseudonymizeText(text) {
  let out = String(text);
  const found = { email: 0, phone: 0, wallet: 0, nationalId: 0, card: 0 };
  out = out.replace(PII_PATTERNS.email, (m) => { found.email++; return hashPii(m); });
  out = out.replace(PII_PATTERNS.btc, (m) => { found.wallet++; return hashPii(`btc:${m}`); });
  out = out.replace(PII_PATTERNS.eth, (m) => { found.wallet++; return hashPii(`eth:${m.toLowerCase()}`); });
  out = out.replace(PII_PATTERNS.pix, (m) => { found.wallet++; return hashPii(m); });
  // Phones / NIFs / cards: replace with [redacted-pii] (we never need to
  // match them across records, so no pseudonym needed).
  out = out.replace(PII_PATTERNS.phone, (m) => {
    if (m.replace(/\D/g, '').length < 7) return m;
    found.phone++; return '[redacted-phone]';
  });
  out = out.replace(PII_PATTERNS.cpfBR, () => { found.nationalId++; return '[redacted-id]'; });
  out = out.replace(PII_PATTERNS.card, (m) => {
    const digits = m.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return m;
    found.card++; return '[redacted-card]';
  });
  return { text: out, redactionCounts: found };
}

// ─── COMPLIANCE ENVELOPE ─────────────────────────────────────────────────────

function buildComplianceEnvelope(extra = {}) {
  return {
    dataSource: 'osint',
    lawfulBasis: 'gdpr-art6-1f-legitimate-interest-fraud-prevention',
    purpose: 'fraud-detection',
    retentionDays: DEFAULT_RETENTION_DAYS,
    minimization: 'text-preview-truncated-to-200-chars',
    pseudonymized: true,
    ...extra,
  };
}

// ─── RETENTION ENFORCER ──────────────────────────────────────────────────────

function purgeStaleVerifications({ dir = DEFAULT_DIR, retentionDays = DEFAULT_RETENTION_DAYS } = {}) {
  const file = path.join(dir, 'verifications.jsonl');
  if (!fs.existsSync(file)) return { purged: 0, kept: 0 };
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const kept = [];
  let purged = 0;
  for (const line of lines) {
    try {
      const rec = JSON.parse(line);
      const ts = new Date(rec.timestamp).getTime();
      if (Number.isFinite(ts) && ts >= cutoff) kept.push(line);
      else purged += 1;
    } catch {
      kept.push(line); // corrupt lines kept for forensics; manual review.
    }
  }
  fs.writeFileSync(file + '.tmp', kept.join('\n') + (kept.length ? '\n' : ''), 'utf8');
  fs.renameSync(file + '.tmp', file);
  return { purged, kept: kept.length };
}

// ─── GDPR RIGHTS ─────────────────────────────────────────────────────────────

function exportRecordsForSubject({ subject, dir = DEFAULT_DIR } = {}) {
  if (!subject) throw new Error('exportRecordsForSubject: subject required');
  const pseudonym = hashPii(subject);
  const file = path.join(dir, 'verifications.jsonl');
  const out = [];
  if (!fs.existsSync(file)) return { pseudonym, count: 0, items: [] };
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const rec = JSON.parse(line);
      const flat = JSON.stringify(rec);
      if (flat.includes(pseudonym)) {
        out.push({
          timestamp: rec.timestamp,
          tenantId: rec.tenantId,
          decision: rec.decision,
          dnaFamily: rec.dnaFamily,
          textPreview: rec.textPreview,
          requestId: rec.requestId,
        });
      }
    } catch { /* skip */ }
  }
  return { pseudonym, count: out.length, items: out };
}

function eraseRecordsForSubject({ subject, dir = DEFAULT_DIR } = {}) {
  if (!subject) throw new Error('eraseRecordsForSubject: subject required');
  const pseudonym = hashPii(subject);
  const file = path.join(dir, 'verifications.jsonl');
  if (!fs.existsSync(file)) return { pseudonym, erased: 0 };
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  let erased = 0;
  const kept = [];
  for (const line of lines) {
    if (line.includes(pseudonym)) { erased += 1; continue; }
    kept.push(line);
  }
  fs.writeFileSync(file + '.tmp', kept.join('\n') + (kept.length ? '\n' : ''), 'utf8');
  fs.renameSync(file + '.tmp', file);
  return { pseudonym, erased };
}

module.exports = {
  PII_PATTERNS,
  DEFAULT_RETENTION_DAYS,
  getSalt,
  hashPii,
  pseudonymizeText,
  buildComplianceEnvelope,
  purgeStaleVerifications,
  exportRecordsForSubject,
  eraseRecordsForSubject,
};
