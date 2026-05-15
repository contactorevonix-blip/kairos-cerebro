'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Stripe = require('stripe');
const { sendApiKeyEmail, keyPreview } = require('./email-sender');

const DB_DIR = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const KEYS_FILE = path.join(DB_DIR, 'api-keys.jsonl');
const EVENTS_FILE = path.join(DB_DIR, 'webhook-events.json');
const AUDIT_FILE = path.join(DB_DIR, 'webhook-audit.jsonl');
const MAX_STORED_EVENTS = 2000;

const PRICE_TO_TIER = () => ({
  [process.env.STRIPE_PRICE_STARTER]: 'starter',
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_SCALE]: 'scale',
});

const QUOTA = { starter: 5000, pro: 25000, scale: 100000 };

// ─── helpers ─────────────────────────────────────────────────────────────────

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}

function writeAtomic(file, data) {
  ensureDir();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function appendAudit(record) {
  ensureDir();
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(record) + '\n', 'utf8');
}

function generateApiKey() {
  const mode = process.env.STRIPE_MODE || 'test';
  const raw = `kc_${mode}_${crypto.randomBytes(24).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  // preview: "kc_test_" (8 chars) + 4 hex + "..." + 4 hex
  const preview = raw.slice(0, 12) + '...' + raw.slice(-4);
  return { raw, hash, preview };
}

function tierFromSubscription(subscription) {
  const map = PRICE_TO_TIER();
  for (const item of subscription.items.data) {
    const priceId = item.price.id;
    if (map[priceId]) return map[priceId];
  }
  return null;
}

// ─── idempotency ──────────────────────────────────────────────────────────────

function loadProcessedEvents() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8')) || [];
  } catch { return []; }
}

function isProcessed(eventId) {
  return loadProcessedEvents().includes(eventId);
}

function markProcessed(eventId) {
  const events = loadProcessedEvents();
  if (events.includes(eventId)) return;
  events.push(eventId);
  // cap size — keep newest
  const trimmed = events.length > MAX_STORED_EVENTS ? events.slice(-MAX_STORED_EVENTS) : events;
  writeAtomic(EVENTS_FILE, trimmed);
}

// ─── key storage ──────────────────────────────────────────────────────────────

function readKeys() {
  try {
    if (!fs.existsSync(KEYS_FILE)) return [];
    const lines = fs.readFileSync(KEYS_FILE, 'utf8').split('\n').filter(Boolean);
    return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

function appendKey(record) {
  ensureDir();
  fs.appendFileSync(KEYS_FILE, JSON.stringify(record) + '\n', 'utf8');
}

function updateKeyBySubscription(subscriptionId, patch) {
  ensureDir();
  const keys = readKeys();
  const updated = keys.map((k) => k.subscription_id === subscriptionId ? { ...k, ...patch } : k);
  // rewrite file atomically
  const tmp = `${KEYS_FILE}.${process.pid}.${Date.now()}.tmp`;
  const out = updated.map((r) => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync(tmp, out, 'utf8');
  fs.renameSync(tmp, KEYS_FILE);
  return updated.find((k) => k.subscription_id === subscriptionId) || null;
}

function findKeyBySubscription(subscriptionId) {
  return readKeys().find((k) => k.subscription_id === subscriptionId) || null;
}

// ─── event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(stripe, session) {
  // Token topup: one-time payment (no subscription) with pack metadata
  if (!session.subscription && session.metadata && session.metadata.pack) {
    const { creditTokens } = require('../sniper-db');
    const tenantId = session.metadata.tenant_id;
    const tokens   = parseInt(session.metadata.tokens, 10) || 0;
    const pack     = session.metadata.pack;
    if (tenantId && tokens > 0) {
      try {
        creditTokens(tenantId, tokens, 'stripe_topup', session.id);
        appendAudit({ timestamp: new Date().toISOString(), event_type: 'token_topup',
          customer_id: session.customer, tenant_id: tenantId, pack, tokens, session_id: session.id, success: true });
        return { credited: tokens, tenant_id: tenantId, pack };
      } catch (err) {
        appendAudit({ timestamp: new Date().toISOString(), event_type: 'token_topup',
          customer_id: session.customer, success: false, error: err.message });
        return { error: err.message };
      }
    }
    return { skipped: 'invalid_topup_metadata' };
  }

  if (!session.subscription) return { skipped: 'no_subscription' };

  const subscription = await stripe.subscriptions.retrieve(session.subscription, {
    expand: ['items.data.price'],
  });

  const tier = tierFromSubscription(subscription);
  if (!tier) {
    appendAudit({
      timestamp: new Date().toISOString(),
      event_type: 'checkout.session.completed',
      customer_id: session.customer,
      subscription_id: session.subscription,
      success: false,
      error: 'unknown_price_id',
    });
    return { skipped: 'unknown_price_id' };
  }

  // Idempotency: if a key already exists for this subscription, skip
  if (findKeyBySubscription(session.subscription)) {
    return { skipped: 'key_already_exists' };
  }

  const key = generateApiKey();
  const record = {
    api_key_hash: key.hash,
    api_key_preview: key.preview,
    customer_id: session.customer,
    subscription_id: session.subscription,
    email: session.customer_details?.email || null,
    tier,
    quota_per_month: QUOTA[tier],
    created_at: new Date().toISOString(),
    status: 'active',
  };

  appendKey(record);

  appendAudit({
    timestamp: new Date().toISOString(),
    event_type: 'checkout.session.completed',
    customer_id: session.customer,
    subscription_id: session.subscription,
    tier,
    quota_per_month: QUOTA[tier],
    api_key_preview: key.preview,
    success: true,
  });

  // Send API key via email — errors are non-fatal (customer can get key from /success)
  const toEmail = session.customer_details?.email || session.customer_email || null;
  if (toEmail) {
    sendApiKeyEmail({ toEmail, apiKey: key.raw, tier, customerId: session.customer })
      .then((emailResult) => {
        if (emailResult.ok) {
          appendAudit({
            timestamp: new Date().toISOString(),
            event: 'email.sent',
            customer_email: toEmail,
            api_key_preview: keyPreview(key.raw),
            resend_message_id: emailResult.resendId,
          });
        } else {
          appendAudit({
            timestamp: new Date().toISOString(),
            event: 'email.send.failed',
            customer_email: toEmail,
            api_key_preview: keyPreview(key.raw),
            error_message: emailResult.error,
          });
        }
      })
      .catch((err) => {
        appendAudit({
          timestamp: new Date().toISOString(),
          event: 'email.send.failed',
          customer_email: toEmail,
          api_key_preview: keyPreview(key.raw),
          error_message: err.message,
        });
      });
  }

  // Return raw key so /success can retrieve it — stored in memory only
  // The raw key is NOT persisted; /success reads it from a short-lived in-memory map
  return { ok: true, tier, rawKey: key.raw, subscriptionId: session.subscription };
}

async function handleSubscriptionUpdated(stripe, subscription) {
  const tier = tierFromSubscription(subscription);
  if (!tier) return { skipped: 'unknown_price_id' };

  const existing = findKeyBySubscription(subscription.id);
  if (!existing) return { skipped: 'no_key_for_subscription' };
  if (existing.tier === tier) return { skipped: 'tier_unchanged' };

  updateKeyBySubscription(subscription.id, { tier, quota_per_month: QUOTA[tier] });

  appendAudit({
    timestamp: new Date().toISOString(),
    event_type: 'customer.subscription.updated',
    customer_id: subscription.customer,
    subscription_id: subscription.id,
    old_tier: existing.tier,
    new_tier: tier,
    quota_per_month: QUOTA[tier],
    success: true,
  });

  return { ok: true, oldTier: existing.tier, newTier: tier };
}

async function handleSubscriptionDeleted(_stripe, subscription) {
  const existing = findKeyBySubscription(subscription.id);
  if (!existing) return { skipped: 'no_key_for_subscription' };

  updateKeyBySubscription(subscription.id, { status: 'cancelled' });

  appendAudit({
    timestamp: new Date().toISOString(),
    event_type: 'customer.subscription.deleted',
    customer_id: subscription.customer,
    subscription_id: subscription.id,
    tier: existing.tier,
    api_key_preview: existing.api_key_preview,
    success: true,
  });

  return { ok: true };
}

// ─── main handler (called from server.js) ─────────────────────────────────────

// In-memory map: subscriptionId → rawKey (cleared after retrieval by /success)
const pendingKeys = new Map();

async function handleWebhook({ rawBody, signature, logEvent }) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.KAIROS_STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logEvent('webhook.config.error', { error: 'STRIPE_WEBHOOK_SECRET not set' });
    return { status: 400, body: { error: 'webhook_not_configured' } };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    logEvent('webhook.config.error', { error: 'STRIPE_SECRET_KEY not set' });
    return { status: 400, body: { error: 'webhook_not_configured' } };
  }

  const stripe = Stripe(stripeKey);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    logEvent('webhook.signature.invalid', { error: err.message });
    return { status: 400, body: { error: 'invalid_signature' } };
  }

  // Idempotency guard
  if (isProcessed(event.id)) {
    logEvent('webhook.duplicate', { id: event.id, type: event.type });
    return { status: 200, body: { received: true, duplicate: true } };
  }

  let result = {};
  try {
    if (event.type === 'checkout.session.completed') {
      result = await handleCheckoutCompleted(stripe, event.data.object);
      if (result.rawKey) {
        pendingKeys.set(result.subscriptionId, result.rawKey);
        // Auto-clear after 10 min to limit exposure window
        setTimeout(() => pendingKeys.delete(result.subscriptionId), 10 * 60 * 1000).unref();
      }
    } else if (event.type === 'customer.subscription.updated') {
      result = await handleSubscriptionUpdated(stripe, event.data.object);
    } else if (event.type === 'customer.subscription.deleted') {
      result = await handleSubscriptionDeleted(stripe, event.data.object);
    } else {
      result = { skipped: 'unhandled_event_type' };
    }
    markProcessed(event.id);
  } catch (err) {
    appendAudit({
      timestamp: new Date().toISOString(),
      event_type: event.type,
      event_id: event.id,
      success: false,
      error: err.message,
    });
    logEvent('webhook.handler.error', { type: event.type, id: event.id, error: err.message });
    // Still return 200 — Stripe must not retry on our handler bugs
    return { status: 200, body: { received: true, error: 'handler_error' } };
  }

  logEvent('webhook.handled', { type: event.type, id: event.id, result: JSON.stringify(result) });
  return { status: 200, body: { received: true, type: event.type } };
}

function claimPendingKey(subscriptionId) {
  const raw = pendingKeys.get(subscriptionId);
  if (raw) pendingKeys.delete(subscriptionId);
  return raw || null;
}

// ─── KEY ROTATION (Stripe-model: new key immediately, old valid 24h) ──────────

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

function rotateKey(rawKey) {
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keys = readKeys();
  const idx = keys.findIndex((k) => k.api_key_hash === hash && k.status === 'active');
  if (idx < 0) return { ok: false, error: 'Key not found or already inactive' };

  const now = new Date().toISOString();
  const graceExpiresAt = new Date(Date.now() + GRACE_PERIOD_MS).toISOString();

  // Generate new key
  const newRaw = `kc_live_${crypto.randomBytes(24).toString('hex')}`;
  const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');

  // Mark old key as rotating (24h grace)
  keys[idx] = { ...keys[idx], status: 'rotating', rotating_at: now, grace_expires_at: graceExpiresAt };

  // Add new key record (inherits tier, tenant, subscription from old key)
  const newRecord = {
    ...keys[idx],
    api_key_hash: newHash,
    raw_key_preview: keyPreview(newRaw),
    status: 'active',
    created_at: now,
    last_used_at: null,
    rotating_at: undefined,
    grace_expires_at: undefined,
    rotated_from: hash.slice(0, 8),
  };
  delete newRecord.rotating_at;
  delete newRecord.grace_expires_at;
  keys.push(newRecord);

  // Atomic rewrite
  const tmp = `${KEYS_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, keys.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  fs.renameSync(tmp, KEYS_FILE);

  return {
    ok: true,
    new_key: newRaw,
    new_key_preview: keyPreview(newRaw),
    old_key_expires_at: graceExpiresAt,
    message: 'New key active immediately. Old key valid for 24 hours.',
  };
}

function isKeyActive(record) {
  if (!record) return false;
  if (record.status === 'active') return true;
  if (record.status === 'rotating' && record.grace_expires_at) {
    return new Date(record.grace_expires_at) > new Date();
  }
  return false;
}

module.exports = { handleWebhook, claimPendingKey, readKeys, findKeyBySubscription, rotateKey, isKeyActive, QUOTA };
