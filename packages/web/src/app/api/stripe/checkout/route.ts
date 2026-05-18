import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  priceId:   z.string().min(1),
  returnUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { priceId, returnUrl } = body;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${returnUrl ?? baseUrl}/dashboard?payment=success`;
  const cancelUrl  = `${returnUrl ?? baseUrl}/pricing`;

  /* Determine if one-time or subscription */
  const price = await stripe.prices.retrieve(priceId);
  const mode  = price.type === "recurring" ? "subscription" : "payment";

  /* Resolve or create Stripe customer for authenticated users */
  let customerId: string | undefined;
  if (session?.user?.id) {
    const sub = await db.subscription.findFirst({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });
    if (sub?.stripeCustomerId) {
      customerId = sub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email:    session.user.email ?? undefined,
        name:     session.user.name  ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer:             customerId,
    customer_email:       !customerId ? (session?.user?.email ?? undefined) : undefined,
    mode,
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          successUrl,
    cancel_url:           cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      userId:  session?.user?.id ?? "anonymous",
      priceId,
    },
    ...(mode === "subscription" && {
      subscription_data: {
        metadata: { userId: session?.user?.id ?? "" },
      },
    }),
  });

  return NextResponse.json({ url: checkoutSession.url });
}
