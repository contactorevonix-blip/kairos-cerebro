"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Building2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tokenPacks = [
  { tokens: 100,    price: 9,   label: "Starter pack" },
  { tokens: 500,    price: 35,  label: "Growth pack",  popular: true },
  { tokens: 2000,   price: 99,  label: "Pro pack" },
  { tokens: 10000,  price: 349, label: "Enterprise pack" },
];

const plans = [
  {
    id:    "free",
    name:  "Free",
    desc:  "For individuals trying KAIROS",
    price: { monthly: 0 },
    icon:  Shield,
    color: "gray",
    features: [
      "5 checks per day",
      "3 lookups per day (IBAN/email/phone/link)",
      "Basic risk score",
      "Chatbot access",
      "Community support",
    ],
    cta: { label: "Start free", href: "/signup" },
  },
  {
    id:    "pro",
    name:  "Pro",
    desc:  "For teams and power users",
    price: { monthly: 29 },
    icon:  Zap,
    color: "blue",
    popular: true,
    tokens: 500,
    features: [
      "500 tokens/month included",
      "API access + SDK",
      "Webhook delivery",
      "Usage dashboard",
      "Priority support",
      "Batch verification",
      "CSV export",
    ],
    cta: { label: "Start Pro", href: "/signup?plan=pro" },
  },
  {
    id:    "enterprise",
    name:  "Enterprise",
    desc:  "For businesses with high volume",
    price: { monthly: 149 },
    icon:  Building2,
    color: "violet",
    tokens: 5000,
    features: [
      "5,000 tokens/month included",
      "Custom SLA & uptime guarantee",
      "White-label API",
      "Dedicated support",
      "SSO / SAML",
      "GDPR DPA included",
      "Custom integrations",
    ],
    cta: { label: "Contact sales", href: "/contact" },
  },
];

const colorMap: Record<string, string> = {
  gray:   "text-gray-11 bg-gray-6/40 border-gray-6",
  blue:   "text-blue-400 bg-blue-500/10 border-blue-500/30",
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/30",
};

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const discount = 0.8;

  function getPrice(base: number) {
    if (base === 0) return "Free";
    const p = billing === "annual" ? Math.floor(base * discount) : base;
    return `€${p}`;
  }

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="divider-glow mx-auto w-[600px] mb-20" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-medium text-blue-400 uppercase tracking-[0.1em] mb-4">
            Pricing
          </span>
          <h2 className="text-4xl lg:text-5xl font-semibold text-gray-12 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-10 mb-8">Start free. Scale when you need to.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-white/5 border border-white/8 rounded-2xl">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-kairos capitalize",
                  billing === b
                    ? "bg-white/10 text-gray-12 border border-white/10"
                    : "text-gray-10 hover:text-gray-12"
                )}
              >
                {b}
                {b === "annual" && (
                  <Badge variant="accent" className="text-2xs">-20%</Badge>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6",
                plan.popular
                  ? "border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-violet-600/5"
                  : "border-white/8 bg-white/2"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-black bg-blue-400 rounded-full px-3 py-1">
                    <Sparkles className="w-3 h-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div className={cn("inline-flex w-11 h-11 rounded-2xl border items-center justify-center mb-4", colorMap[plan.color])}>
                <plan.icon className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-semibold text-gray-12 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-10 mb-5">{plan.desc}</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-gray-12">{getPrice(plan.price.monthly)}</span>
                {plan.price.monthly > 0 && <span className="text-sm text-gray-10">/month</span>}
              </div>
              {plan.tokens && (
                <p className="text-xs text-blue-400 mb-5">{plan.tokens.toLocaleString()} tokens included</p>
              )}

              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-11">
                    <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "secondary"}
                className="w-full"
                asChild
              >
                <a href={plan.cta.href}>
                  {plan.cta.label}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Token packs */}
        <div>
          <h3 className="text-center text-xl font-semibold text-gray-12 mb-2">Token packs</h3>
          <p className="text-center text-sm text-gray-10 mb-8">One-time purchase. Never expires. Use across any feature.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tokenPacks.map((pack, i) => (
              <motion.a
                key={pack.tokens}
                href="#"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative card-feature p-4 text-center cursor-pointer transition-kairos",
                  pack.popular && "border-blue-500/30 bg-blue-500/5"
                )}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-2xs font-medium text-black bg-blue-400 rounded-full px-2 py-0.5">Popular</span>
                )}
                <div className="text-2xl font-bold text-gray-12 mb-0.5">{pack.tokens.toLocaleString()}</div>
                <div className="text-xs text-gray-10 mb-3">tokens</div>
                <div className="text-lg font-semibold text-blue-400">€{pack.price}</div>
                <div className="text-2xs text-gray-9 mt-1">€{(pack.price / pack.tokens).toFixed(3)}/token</div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
