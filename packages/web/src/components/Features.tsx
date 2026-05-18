"use client";

import { motion } from "framer-motion";
import {
  CreditCard, Mail, Phone, Link2, ShieldCheck,
  Zap, Globe, Lock, BarChart3, Code2, Webhook, Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: CreditCard,
    title: "IBAN Verification",
    desc: "Validate any IBAN against global bank registries. Detect fake accounts, money mule patterns and high-risk jurisdictions instantly.",
    accent: "blue",
    tag: "Most used",
  },
  {
    icon: Mail,
    title: "Email Intelligence",
    desc: "Detect disposable addresses, breached accounts, domain reputation and spoofing attempts with a single API call.",
    accent: "violet",
  },
  {
    icon: Phone,
    title: "Phone Scoring",
    desc: "Carrier lookup, VoIP detection, SIM swap risk and country-level fraud prevalence combined into one risk score.",
    accent: "cyan",
  },
  {
    icon: Link2,
    title: "Link & URL Scanning",
    desc: "Real-time phishing, malware and brand impersonation detection. Protect your users from malicious redirects.",
    accent: "emerald",
    tag: "New",
  },
  {
    icon: Zap,
    title: "<50ms Response",
    desc: "Edge-cached risk models and global infrastructure deliver sub-50ms median latency from anywhere in the world.",
    accent: "amber",
  },
  {
    icon: ShieldCheck,
    title: "GDPR Compliant",
    desc: "No PII stored. Data processed in-memory, purged immediately after scoring. SOC 2 Type II certified.",
    accent: "emerald",
  },
  {
    icon: Code2,
    title: "REST API + SDKs",
    desc: "Clean OpenAPI spec. Official SDKs for Node.js and Python. Drop-in integration in under 10 minutes.",
    accent: "blue",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    desc: "Real-time event delivery for async workflows. Retry logic, signature verification and delivery logs included.",
    accent: "violet",
  },
  {
    icon: BarChart3,
    title: "Usage Dashboard",
    desc: "Full visibility into your token usage, request volume and fraud patterns. Exportable to CSV or connected to BI tools.",
    accent: "cyan",
  },
];

const accentColors: Record<string, string> = {
  blue:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
  cyan:    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const colors = accentColors[feature.accent] ?? accentColors.blue;
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative card-feature p-6 group"
    >
      {feature.tag && (
        <span className="absolute top-4 right-4 text-2xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
          {feature.tag}
        </span>
      )}
      <div className={cn("inline-flex w-11 h-11 rounded-2xl border items-center justify-center mb-4", colors)}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-gray-12 mb-2 tracking-tight">{feature.title}</h3>
      <p className="text-sm text-gray-10 leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="divider-glow mx-auto w-[600px] mb-20" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-medium text-blue-400 uppercase tracking-[0.1em] mb-4">
            Capabilities
          </span>
          <h2 className="text-4xl lg:text-5xl font-semibold text-gray-12 tracking-tight mb-4">
            Everything you need to
            <br />
            <span className="text-gradient">stop fraud cold</span>
          </h2>
          <p className="text-lg text-gray-10 max-w-xl mx-auto leading-relaxed">
            One API, four verification layers. Built for B2C products and enterprise security teams.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
