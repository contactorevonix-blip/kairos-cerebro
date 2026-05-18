import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  appInfo: {
    name:    "KAIROS",
    version: "0.2.0",
  },
});

// ─── Product / Price catalog ────────────────────────────────────────────────
// These are created in your Stripe dashboard and referenced by price ID.
// Set them in .env as STRIPE_PRICE_* variables.

export const STRIPE_PRICES = {
  // Token packs (one-time)
  tokens_100:   process.env.STRIPE_PRICE_TOKENS_100   ?? "",
  tokens_500:   process.env.STRIPE_PRICE_TOKENS_500   ?? "",
  tokens_2000:  process.env.STRIPE_PRICE_TOKENS_2000  ?? "",
  tokens_10000: process.env.STRIPE_PRICE_TOKENS_10000 ?? "",
  // Subscriptions (recurring)
  pro:          process.env.STRIPE_PRICE_PRO          ?? "",
  enterprise:   process.env.STRIPE_PRICE_ENTERPRISE   ?? "",
} as const;

export const TOKEN_PACK_AMOUNTS: Record<string, number> = {
  [STRIPE_PRICES.tokens_100]:   100,
  [STRIPE_PRICES.tokens_500]:   500,
  [STRIPE_PRICES.tokens_2000]:  2000,
  [STRIPE_PRICES.tokens_10000]: 10000,
};

export const PLAN_TOKEN_GRANT: Record<string, number> = {
  pro:        500,
  enterprise: 5000,
};
