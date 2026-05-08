// KAIROS — Billing & Monetization
//
// Three concerns under one roof:
//   1. Plan catalogue (price points, rate limits, entitlements).
//   2. Stripe webhook verification (HMAC-SHA256 over `<timestamp>.<body>`).
//   3. Usage metering (idempotent counters per tenant per period).
//
// Zero-dependency: we speak Stripe's webhook protocol directly. No SDK pull,
// no supply-chain risk.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

const STRIPE_WEBHOOK_TOLERANCE_S = 5 * 60; // 5 minutes — Stripe's recommendation.

// ─── PLAN CATALOGUE ──────────────────────────────────────────────────────────
//
// Free tier exists to power the browser extension and seed the reputation
// graph. Pro is the consumer plan (1.97/mo). Pro+ is small business. B2B
// pilot is the institutional plan that talks to banks. Enterprise is
// custom.

const PLANS = {
  free: {
    id: 'kairos_free',
    name: 'KAIROS Free',
    priceEurMonthly: 0,
    rateLimitPerMinute: 30,
    entitlements: { browserExtension: true, apiAccess: true, webhook: false, signedFeed: false, supportSla: 'community' },
  },
  pro: {
    id: 'kairos_pro',
    name: 'KAIROS Pro',
    priceEurMonthly: 1.97,
    rateLimitPerMinute: 120,
    entitlements: { browserExtension: true, apiAccess: true, webhook: false, signedFeed: false, supportSla: 'email-72h' },
  },
  business: {
    id: 'kairos_business',
    name: 'KAIROS Business',
    priceEurMonthly: 19.97,
    rateLimitPerMinute: 600,
    entitlements: { browserExtension: true, apiAccess: true, webhook: true, signedFeed: false, supportSla: 'email-24h' },
  },
  b2b_pilot: {
    id: 'kairos_b2b_pilot',
    name: 'KAIROS Institutional Pilot',
    priceEurMonthly: 499,
    rateLimitPerMinute: 6_000,
    entitlements: { browserExtension: true, apiAccess: true, webhook: true, signedFeed: true, supportSla: '8h-business' },
  },
  enterprise: {
    id: 'kairos_enterprise',
    name: 'KAIROS Enterprise',
    priceEurMonthly: null, // custom
    rateLimitPerMinute: 60_000,
    entitlements: { browserExtension: true, apiAccess: true, webhook: true, signedFeed: true, supportSla: '1h-priority' },
  },
};

function planById(id) {
  for (const p of Object.values(PLANS)) if (p.id === id) return p;
  return null;
}

function planEntitlement(planId, key) {
  const p = planById(planId);
  if (!p) return null;
  return p.entitlements[key] ?? null;
}

// ─── STRIPE WEBHOOK VERIFICATION ─────────────────────────────────────────────

function parseStripeSignatureHeader(header) {
  const out = { t: null, v1: [] };
  if (!header) return out;
  for (const part of String(header).split(',')) {
    const [k, v] = part.split('=');
    if (!k || v === undefined) continue;
    if (k.trim() === 't') out.t = v.trim();
    else if (k.trim() === 'v1') out.v1.push(v.trim());
  }
  return out;
}

function verifyStripeSignature({ rawBody, header, secret, toleranceSeconds = STRIPE_WEBHOOK_TOLERANCE_S, now = Math.floor(Date.now() / 1000) }) {
  if (!rawBody || !header || !secret) return { valid: false, reason: 'missing-input' };
  const parsed = parseStripeSignatureHeader(header);
  if (!parsed.t || parsed.v1.length === 0) return { valid: false, reason: 'malformed-header' };
  const ts = Number(parsed.t);
  if (!Number.isFinite(ts)) return { valid: false, reason: 'bad-timestamp' };
  if (Math.abs(now - ts) > toleranceSeconds) return { valid: false, reason: 'timestamp-out-of-tolerance' };
  const signedPayload = `${parsed.t}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  for (const candidate of parsed.v1) {
    if (candidate.length !== expected.length) continue;
    if (crypto.timingSafeEqual(Buffer.from(candidate, 'utf8'), Buffer.from(expected, 'utf8'))) {
      return { valid: true };
    }
  }
  return { valid: false, reason: 'no-signature-match' };
}

// ─── EVENT HANDLER ───────────────────────────────────────────────────────────
// Maps the relevant Stripe events to KAIROS plan changes. Caller is expected
// to plug in db setters via opts.{onSubscription, onCancellation}.

const RELEVANT_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
]);

function handleStripeEvent(event, { onSubscription = () => {}, onCancellation = () => {} } = {}) {
  if (!event || !RELEVANT_EVENTS.has(event.type)) return { handled: false, type: event && event.type };
  const sub = event.data && event.data.object;
  if (!sub) return { handled: false, type: event.type };
  if (event.type === 'customer.subscription.deleted') {
    onCancellation({ customerId: sub.customer, subscriptionId: sub.id });
    return { handled: true, type: event.type };
  }
  const planLookupKey = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.lookup_key;
  const plan = planById(planLookupKey) || PLANS.free;
  onSubscription({ customerId: sub.customer, subscriptionId: sub.id, planId: plan.id, status: sub.status });
  return { handled: true, type: event.type, planId: plan.id };
}

// ─── USAGE METERING ──────────────────────────────────────────────────────────
//
// Per-tenant per-month verification counter, persisted to disk. Stripe usage
// records are pushed periodically (out of scope for the in-process module —
// CLI command `billing:export-usage` reads this file).

function periodKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function usageFile(dir = DEFAULT_DIR) { return path.join(dir, 'usage.json'); }

function readUsage(dir = DEFAULT_DIR) {
  const file = usageFile(dir);
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function writeUsage(usage, dir = DEFAULT_DIR) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = usageFile(dir);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(usage, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function meterUsage({ tenantId, units = 1, dir = DEFAULT_DIR } = {}) {
  if (!tenantId) throw new Error('meterUsage: tenantId required');
  const usage = readUsage(dir);
  const period = periodKey();
  if (!usage[tenantId]) usage[tenantId] = {};
  usage[tenantId][period] = (usage[tenantId][period] || 0) + units;
  writeUsage(usage, dir);
  return usage[tenantId][period];
}

function currentUsage({ tenantId, dir = DEFAULT_DIR } = {}) {
  const usage = readUsage(dir);
  return (usage[tenantId] && usage[tenantId][periodKey()]) || 0;
}

// ─── WEBHOOK IDEMPOTENCY ─────────────────────────────────────────────────────
// Stripe retries failed deliveries — we must process each event.id exactly once.
// Persisted to disk so restarts don't reset the dedup window.

const PROCESSED_EVENTS_FILE = 'stripe-processed-events.json';
const IDEMPOTENCY_RETENTION = 1000; // keep the last 1000 ids in memory

function processedEventsPath(dir = DEFAULT_DIR) {
  return path.join(dir, PROCESSED_EVENTS_FILE);
}

function readProcessedEvents(dir = DEFAULT_DIR) {
  const file = processedEventsPath(dir);
  if (!fs.existsSync(file)) return { ids: [] };
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { ids: [] }; }
}

function writeProcessedEvents(state, dir = DEFAULT_DIR) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = processedEventsPath(dir);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

// Returns true if this is the first time we see eventId; false if it's a replay.
// Atomic at the JSON-file level: read, mutate, atomic-rename.
function claimEventId(eventId, dir = DEFAULT_DIR) {
  if (!eventId) return false;
  const state = readProcessedEvents(dir);
  if (state.ids.includes(eventId)) return false;
  state.ids.push(eventId);
  if (state.ids.length > IDEMPOTENCY_RETENTION) {
    state.ids = state.ids.slice(-IDEMPOTENCY_RETENTION);
  }
  writeProcessedEvents(state, dir);
  return true;
}

function isEventProcessed(eventId, dir = DEFAULT_DIR) {
  if (!eventId) return false;
  const state = readProcessedEvents(dir);
  return state.ids.includes(eventId);
}

module.exports = {
  PLANS,
  planById,
  planEntitlement,
  parseStripeSignatureHeader,
  verifyStripeSignature,
  handleStripeEvent,
  meterUsage,
  currentUsage,
  readUsage,
  claimEventId,
  isEventProcessed,
  RELEVANT_EVENTS,
};
