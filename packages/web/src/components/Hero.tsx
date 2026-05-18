"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShieldWrapper from "@/components/ShieldWrapper";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
});

const stats = [
  { value: "99.7%",  label: "Accuracy" },
  { value: "<50ms", label: "Response time" },
  { value: "400+",   label: "Data signals" },
  { value: "GDPR",   label: "Compliant" },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-950/10 via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(200,220,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,220,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Copy */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <motion.div {...fadeUp(0)}>
              <Badge variant="accent" className="inline-flex">
                <Zap className="w-3 h-3" />
                Real-time fraud detection
              </Badge>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="flex flex-col gap-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-12 leading-[1.05] tracking-[-0.04em]">
                Trust nothing.
                <br />
                <span className="text-gradient-blue">Verify everything.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-10 leading-relaxed max-w-xl">
                KAIROS scores IBANs, emails, phone numbers and links in milliseconds.
                Stop fraud before it starts — free to try, enterprise-ready.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="#demo">
                  Try free — 5 checks/day
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/docs">
                  View API docs
                </Link>
              </Button>
            </motion.div>

            {/* Social proof strip */}
            <motion.div {...fadeUp(0.3)} className="flex items-center gap-4 text-xs text-gray-10">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                No card required
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All systems operational
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div {...fadeUp(0.4)} className="grid grid-cols-4 gap-4 pt-4 border-t border-white/6">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-xl font-semibold text-gray-12 tracking-tight">{s.value}</span>
                  <span className="text-xs text-gray-10">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D Shield */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative flex items-center justify-center"
          >
            {/* Shield glow backdrop */}
            <div className="absolute inset-0 bg-shield-glow pointer-events-none blur-3xl opacity-60" />

            <div className="relative w-full aspect-square max-w-[520px] mx-auto">
              <ShieldWrapper />
            </div>

            {/* Floating data cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -left-4 lg:-left-12 top-1/3 glass rounded-2xl p-3 text-xs"
            >
              <div className="flex items-center gap-2 text-gray-10 mb-1">IBAN check</div>
              <div className="font-mono text-emerald-400 font-medium">Score: 97/100 ✓</div>
              <div className="text-gray-11 mt-0.5">NL91 ABNA 0417...</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-4 lg:-right-12 bottom-1/3 glass rounded-2xl p-3 text-xs"
            >
              <div className="flex items-center gap-2 text-gray-10 mb-1">Link scan</div>
              <div className="font-mono text-red-400 font-medium">Risk: HIGH ⚠</div>
              <div className="text-gray-11 mt-0.5">Phishing detected</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
