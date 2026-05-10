'use strict';

const Stripe = require('stripe');
const { readKeys } = require('./stripe-webhook');
const crypto = require('crypto');

function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function extractBearer(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const m = authHeader.match(/^Bearer\s+(kc_[a-z]+_[0-9a-f]{48})$/i);
  return m ? m[1] : null;
}

async function handlePortal(headers) {
  const rawKey = extractBearer(headers['authorization'] || headers['Authorization'] || '');
  if (!rawKey) return { status: 401, body: { error: 'Invalid API key' } };

  const hash = hashKey(rawKey);
  const record = readKeys().find((k) => k.api_key_hash === hash && k.status === 'active');
  if (!record) return { status: 401, body: { error: 'Invalid API key' } };
  if (!record.customer_id) return { status: 400, body: { error: 'No Stripe customer linked to this key' } };

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { status: 503, body: { error: 'Billing service unavailable' } };

  const stripe = Stripe(stripeKey);
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';

  let session;
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: record.customer_id,
      return_url: `${base}/docs`,
    });
  } catch (err) {
    return { status: 500, body: { error: 'Failed to create portal session' } };
  }

  return { status: 200, body: { url: session.url } };
}

module.exports = { handlePortal };
