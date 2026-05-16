'use strict';

const Stripe = require('stripe');

const TIER_TO_ENV = {
  starter:    'STRIPE_PRICE_STARTER',
  growth:     'STRIPE_PRICE_GROWTH',
  pro:        'STRIPE_PRICE_PRO',
  scale:      'STRIPE_PRICE_SCALE',
  enterprise: 'STRIPE_PRICE_ENTERPRISE',
};

const QUOTA = { starter: 300, growth: 1000, pro: 3000, scale: 15000 };

// Token pack one-time prices (Pedro creates these in Stripe Dashboard)
const TOKEN_PACKS = {
  pack_100:  { env: 'STRIPE_PRICE_TOKENS_100',  tokens: 100,  label: '100 tokens' },
  pack_380:  { env: 'STRIPE_PRICE_TOKENS_380',  tokens: 380,  label: '380 tokens (+27% bonus)' },
  pack_1500: { env: 'STRIPE_PRICE_TOKENS_1500', tokens: 1500, label: '1,500 tokens (+50% bonus)' },
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return Stripe(key);
}

function resolvePrice(tier) {
  const envVar = TIER_TO_ENV[tier];
  if (!envVar) return null;
  return process.env[envVar] || null;
}

async function createCheckoutSession({ tier, baseUrl, refCode }) {
  if (!TIER_TO_ENV[tier]) {
    return { error: `Invalid tier: ${tier}`, status: 400 };
  }
  const priceId = resolvePrice(tier);
  if (!priceId) {
    return { error: 'checkout_unavailable', status: 503, _internal: `${TIER_TO_ENV[tier]} not configured` };
  }

  const origin = baseUrl || process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';

  let session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: { tier, source: 'pricing-page' },
      },
      ...(refCode ? { metadata: { ref_code: refCode } } : {}),
    });
  } catch (err) {
    return { error: 'checkout_failed', status: 500, _internal: err.message };
  }

  return { url: session.url, sessionId: session.id, tier, quotaPerMonth: QUOTA[tier] };
}

// Token pack checkout — one-time payment, tokens credited via webhook
async function createTopupSession({ pack, tenantId, baseUrl }) {
  const packConfig = TOKEN_PACKS[pack];
  if (!packConfig) return { error: `Invalid pack: ${pack}`, status: 400 };

  const priceId = process.env[packConfig.env];
  if (!priceId) {
    return { error: 'topup_unavailable', status: 503,
             _internal: `${packConfig.env} not configured in Railway env vars` };
  }

  const origin = baseUrl || process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&topup=1`,
      cancel_url:  `${origin}/pricing`,
      allow_promotion_codes: true,
      metadata: { tenant_id: tenantId || '', pack, tokens: String(packConfig.tokens) },
    });
    return { url: session.url, sessionId: session.id, pack, tokens: packConfig.tokens };
  } catch (err) {
    return { error: 'checkout_failed', status: 500, _internal: err.message };
  }
}

module.exports = { createCheckoutSession, createTopupSession, QUOTA, TOKEN_PACKS };
