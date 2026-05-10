'use strict';

const Stripe = require('stripe');

const TIER_TO_ENV = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_PRO',
  scale: 'STRIPE_PRICE_SCALE',
};

const QUOTA = { starter: 5000, pro: 25000, scale: 100000 };

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

async function createCheckoutSession({ tier, baseUrl }) {
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
    });
  } catch (err) {
    return { error: 'checkout_failed', status: 500, _internal: err.message };
  }

  return { url: session.url, sessionId: session.id, tier, quotaPerMonth: QUOTA[tier] };
}

module.exports = { createCheckoutSession, QUOTA };
