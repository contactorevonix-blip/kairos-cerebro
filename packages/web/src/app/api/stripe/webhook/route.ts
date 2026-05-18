import { NextRequest, NextResponse } from "next/server";
import { stripe, TOKEN_PACK_AMOUNTS, PLAN_TOKEN_GRANT } from "@/lib/stripe";
import { db } from "@/lib/db";
import { creditTokens } from "@/lib/tokens";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session    = event.data.object;
  const userId     = session.metadata?.userId;
  const priceId    = session.metadata?.priceId ?? "";
  const customerId = typeof session.customer === "string" ? session.customer : undefined;

  if (!userId || userId === "anonymous") return;

  /* Token pack purchase */
  const tokenAmount = TOKEN_PACK_AMOUNTS[priceId];
  if (tokenAmount) {
    await creditTokens(
      userId,
      tokenAmount,
      `Token pack — ${tokenAmount} tokens`,
      "PURCHASE",
      { stripeSessionId: session.id, priceId }
    );
    return;
  }

  /* Subscription activated */
  if (session.mode === "subscription" && typeof session.subscription === "string") {
    const sub = await stripe.subscriptions.retrieve(session.subscription);
    const planItem = sub.items.data[0];
    const planKey  = planItem.price.lookup_key ?? "pro";
    const tokens   = PLAN_TOKEN_GRANT[planKey] ?? 500;

    await db.subscription.upsert({
      where:  { stripeSubscriptionId: session.subscription },
      update: {
        status:            sub.status,
        stripeCustomerId:  customerId,
        currentPeriodStart: new Date((sub as any).current_period_start * 1000),
        currentPeriodEnd:   new Date((sub as any).current_period_end   * 1000),
      },
      create: {
        userId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId:     customerId,
        planId:               planKey.toUpperCase() as any,
        status:               sub.status,
        currentPeriodStart:   new Date((sub as any).current_period_start * 1000),
        currentPeriodEnd:     new Date((sub as any).current_period_end   * 1000),
      },
    });

    await creditTokens(userId, tokens, `Subscription grant — ${tokens} tokens`, "GRANT", {
      stripeSubscriptionId: session.subscription,
    });
  }
}

async function handleInvoicePaid(event: Stripe.InvoicePaidEvent) {
  const invoice = event.data.object;
  const subId   = typeof invoice.subscription === "string" ? invoice.subscription : null;
  if (!subId) return;

  const dbSub = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subId },
  });
  if (!dbSub) return;

  /* Renewal — re-grant monthly tokens (skip first invoice, handled by checkout) */
  if (invoice.billing_reason === "subscription_cycle") {
    const planKey = dbSub.planId.toLowerCase();
    const tokens  = PLAN_TOKEN_GRANT[planKey] ?? 500;
    await creditTokens(dbSub.userId, tokens, `Monthly token renewal — ${tokens} tokens`, "GRANT", {
      stripeInvoiceId: invoice.id,
    });
  }
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const sub = event.data.object;
  const dbSub = await db.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
  });
  if (!dbSub) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data:  {
      status:             sub.status,
      cancelAtPeriodEnd:  sub.cancel_at_period_end,
      currentPeriodStart: new Date((sub as any).current_period_start * 1000),
      currentPeriodEnd:   new Date((sub as any).current_period_end   * 1000),
    },
  });
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event as Stripe.CheckoutSessionCompletedEvent);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event as Stripe.InvoicePaidEvent);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent);
        break;
      case "customer.subscription.deleted":
        await db.subscription.updateMany({
          where:  { stripeSubscriptionId: (event.data.object as Stripe.Subscription).id },
          data:   { status: "canceled" },
        });
        break;
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
