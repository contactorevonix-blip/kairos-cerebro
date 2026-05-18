"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Mail, Phone, Link2,
  ShieldCheck, AlertTriangle, XCircle,
  ArrowRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Mode = "iban" | "email" | "phone" | "link";

const modes: { id: Mode; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "iban",  label: "IBAN",  icon: CreditCard, placeholder: "NL91 ABNA 0417 1643 00" },
  { id: "email", label: "Email", icon: Mail,        placeholder: "user@company.com" },
  { id: "phone", label: "Phone", icon: Phone,       placeholder: "+351 912 345 678" },
  { id: "link",  label: "Link",  icon: Link2,       placeholder: "https://suspicious-site.com" },
];

type RiskLevel = "safe" | "suspicious" | "dangerous";

const riskMeta: Record<RiskLevel, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  safe:       { label: "Safe",       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", icon: ShieldCheck    },
  suspicious: { label: "Suspicious", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/25",   icon: AlertTriangle  },
  dangerous:  { label: "Dangerous",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/25",       icon: XCircle        },
};

type DemoResult = {
  score: number;
  risk:  RiskLevel;
  signals: string[];
  summary: string;
};

/* Simulated results for demo */
function simulateResult(mode: Mode, value: string): DemoResult {
  const v = value.toLowerCase();
  if (mode === "iban") {
    if (v.includes("nl91") || v.includes("gb")) return { score: 94, risk: "safe", signals: ["Valid checksum", "Known bank", "Low-risk country", "No fraud flags"], summary: "This IBAN passes all verification checks." };
    return { score: 42, risk: "suspicious", signals: ["Uncommon BIC", "Limited transaction history", "Monitor advised"], summary: "This IBAN shows some irregular patterns." };
  }
  if (mode === "email") {
    if (v.includes("@gmail") || v.includes("@company")) return { score: 88, risk: "safe", signals: ["Real domain", "MX records valid", "No breach history", "Not disposable"], summary: "Email address appears legitimate." };
    if (v.includes("@temp") || v.includes("@trash")) return { score: 8, risk: "dangerous", signals: ["Disposable provider", "Known fraud domain", "No MX records"], summary: "This is a throwaway address. Block it." };
    return { score: 55, risk: "suspicious", signals: ["New domain", "Low sending reputation", "Possible alias"], summary: "Treat with caution." };
  }
  if (mode === "phone") {
    if (v.startsWith("+351") || v.startsWith("+44")) return { score: 91, risk: "safe", signals: ["Valid carrier", "Mobile registered", "Low SIM-swap risk", "EU jurisdiction"], summary: "Phone number verified and low-risk." };
    return { score: 38, risk: "suspicious", signals: ["VoIP detected", "Carrier mismatch", "SIM swap indicator"], summary: "This number uses VoIP. Verify identity manually." };
  }
  /* link */
  if (v.includes("suspicious") || v.includes("phish") || v.includes("free")) return { score: 5, risk: "dangerous", signals: ["Phishing pattern detected", "Domain 3 days old", "Known malware host", "SSL mismatch"], summary: "Do not visit. Block this URL immediately." };
  return { score: 81, risk: "safe", signals: ["Clean domain", "Valid SSL", "No redirect chains", "No malware history"], summary: "URL appears safe and legitimate." };
}

export default function LiveDemo() {
  const [mode, setMode]       = useState<Mode>("iban");
  const [value, setValue]     = useState("");
  const [result, setResult]   = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [used, setUsed]       = useState(0);
  const FREE_LIMIT = 3;

  const current = modes.find((m) => m.id === mode)!;

  async function handleCheck() {
    if (!value.trim() || loading) return;
    if (used >= FREE_LIMIT) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    setResult(simulateResult(mode, value));
    setLoading(false);
    setUsed((n) => n + 1);
  }

  const meta = result ? riskMeta[result.risk] : null;

  return (
    <section id="demo" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-medium text-blue-400 uppercase tracking-[0.1em] mb-4">
            Live Demo
          </span>
          <h2 className="text-4xl lg:text-5xl font-semibold text-gray-12 tracking-tight mb-4">
            See KAIROS in action
          </h2>
          <p className="text-lg text-gray-10">
            {FREE_LIMIT - used > 0
              ? `${FREE_LIMIT - used} free checks remaining today — no signup needed.`
              : "You've used your free checks. Create an account for more."}
          </p>
        </motion.div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-white/8">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-white/4 rounded-2xl p-1 mb-6">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setResult(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-kairos",
                  mode === m.id
                    ? "bg-white/10 text-gray-12 border border-white/10"
                    : "text-gray-10 hover:text-gray-12"
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-3">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder={current.placeholder}
              className="flex-1 bg-white/5 border border-white/8 rounded-2xl px-5 py-3.5 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus:border-blue-500/40 transition-kairos font-mono"
              disabled={used >= FREE_LIMIT}
            />
            <Button
              onClick={handleCheck}
              disabled={!value.trim() || loading || used >= FREE_LIMIT}
              size="lg"
              loading={loading}
            >
              {loading ? "" : "Check"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && meta && (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Score card */}
                  <div className={cn("rounded-2xl border p-5", meta.bg)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <meta.icon className={cn("w-5 h-5", meta.color)} />
                        <span className={cn("font-semibold text-sm", meta.color)}>{meta.label}</span>
                      </div>
                      <Badge variant={result.risk === "safe" ? "success" : result.risk === "suspicious" ? "warning" : "danger"}>
                        {result.risk.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-gray-12">{result.score}</span>
                      <span className="text-sm text-gray-10">/100</span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          result.score > 70 ? "bg-emerald-500" :
                          result.score > 40 ? "bg-amber-500" : "bg-red-500"
                        )}
                      />
                    </div>
                    <p className="text-xs text-gray-10 mt-3 leading-relaxed">{result.summary}</p>
                  </div>

                  {/* Signals */}
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                    <h4 className="text-xs font-medium text-gray-10 uppercase tracking-wider mb-3">Detection signals</h4>
                    <ul className="space-y-2">
                      {result.signals.map((signal) => (
                        <li key={signal} className="flex items-center gap-2.5 text-sm text-gray-11">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            result.risk === "safe" ? "bg-emerald-500" :
                            result.risk === "suspicious" ? "bg-amber-500" : "bg-red-500"
                          )} />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upsell when limit hit */}
          {used >= FREE_LIMIT && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600/15 to-violet-600/10 border border-blue-500/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-12 mb-1">Free limit reached</p>
                <p className="text-xs text-gray-10">Get 100 checks for €9 or subscribe for unlimited access.</p>
              </div>
              <Button size="sm" asChild>
                <a href="#pricing">See plans <ArrowRight className="w-3.5 h-3.5" /></a>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
