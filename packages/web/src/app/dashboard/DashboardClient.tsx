"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Zap, ArrowRight, ExternalLink,
  TrendingUp, Activity, CreditCard, LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  user:         { id: string; name: string | null; email: string; image: string | null };
  balance:      { current: number; lifetime: number };
  transactions: { id: string; type: string; amount: number; description: string; createdAt: string }[];
  subscription: { planId: string; status: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null;
};

const txColors: Record<string, string> = {
  PURCHASE: "text-emerald-400",
  GRANT:    "text-blue-400",
  BONUS:    "text-violet-400",
  CONSUME:  "text-gray-10",
  REFUND:   "text-amber-400",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

async function openPortal() {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  const { url } = await res.json();
  if (url) window.location.href = url;
}

export default function DashboardClient({ user, balance, transactions, subscription }: Props) {
  const planLabel = subscription?.planId ?? "FREE";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-white/6 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-semibold text-sm text-gray-12">KAIROS</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-10">{user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-xs text-gray-10 hover:text-gray-12 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-12 mb-1">
            {user.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-gray-10">Manage your tokens, usage and billing.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Token balance",     value: balance.current.toLocaleString(),  icon: Zap,        color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Tokens used (all)",  value: (balance.lifetime - balance.current).toLocaleString(), icon: Activity,   color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
            { label: "Total earned",       value: balance.lifetime.toLocaleString(), icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Current plan",       value: planLabel,                         icon: Shield,      color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i * 0.07)} className="card-feature p-5">
              <div className={cn("inline-flex w-9 h-9 rounded-xl border items-center justify-center mb-3", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="text-xl font-bold text-gray-12 mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-10">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Transaction history */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-2 card-feature p-6">
            <h2 className="text-base font-semibold text-gray-12 mb-5 flex items-center justify-between">
              Recent activity
              <span className="text-xs text-gray-10 font-normal">{transactions.length} entries</span>
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-9">
                No activity yet. Run your first check below.
              </div>
            ) : (
              <div className="space-y-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          tx.type === "CONSUME"
                            ? "bg-gray-6/60 text-gray-10"
                            : "bg-blue-500/10 text-blue-400"
                        )}
                      >
                        {tx.type}
                      </span>
                      <span className="text-sm text-gray-11">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-medium", txColors[tx.type] ?? "text-gray-11")}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </span>
                      <span className="text-2xs text-gray-9">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Buy tokens */}
            <motion.div {...fadeUp(0.15)} className="card-feature p-5">
              <h3 className="text-sm font-semibold text-gray-12 mb-4">Buy tokens</h3>
              <div className="space-y-2">
                {[
                  { label: "100 tokens",    price: "€9",   href: "/api/stripe/checkout" },
                  { label: "500 tokens",    price: "€35",  href: "/api/stripe/checkout", popular: true },
                  { label: "2,000 tokens",  price: "€99",  href: "/api/stripe/checkout" },
                  { label: "10,000 tokens", price: "€349", href: "/api/stripe/checkout" },
                ].map((pack) => (
                  <Link
                    key={pack.label}
                    href="#pricing"
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-kairos text-sm",
                      pack.popular
                        ? "border-blue-500/30 bg-blue-500/8 hover:bg-blue-500/12"
                        : "border-white/8 hover:border-white/15 hover:bg-white/4"
                    )}
                  >
                    <span className="text-gray-12">{pack.label}</span>
                    <span className="text-blue-400 font-medium">{pack.price}</span>
                  </Link>
                ))}
              </div>
              <Button className="w-full mt-4" size="sm" asChild>
                <Link href="/#pricing">View all plans <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </motion.div>

            {/* Subscription */}
            <motion.div {...fadeUp(0.2)} className="card-feature p-5">
              <h3 className="text-sm font-semibold text-gray-12 mb-3">Subscription</h3>
              {subscription ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={subscription.status === "active" ? "success" : "warning"}>
                      {subscription.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-11">{subscription.planId} Plan</span>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <p className="text-xs text-gray-10 mb-4">
                      {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={openPortal}>
                    <CreditCard className="w-3.5 h-3.5" />
                    Manage billing
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-10 mb-4">You’re on the free plan. Upgrade for more tokens and API access.</p>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/#pricing">Upgrade <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick demo link */}
        <motion.div {...fadeUp(0.25)} className="mt-6 rounded-2xl border border-white/8 bg-gradient-to-r from-blue-600/8 to-violet-600/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-12 mb-1">Run a check now</p>
            <p className="text-xs text-gray-10">Use your tokens to verify IBANs, emails, phones or links.</p>
          </div>
          <Button asChild>
            <Link href="/#demo">Open Live Demo <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
