"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-950/20 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="inline-flex w-16 h-16 rounded-3xl bg-blue-500/15 border border-blue-500/30 items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>

          <h2 className="text-4xl lg:text-6xl font-semibold text-gray-12 tracking-tight mb-6">
            Start protecting
            <br />
            <span className="text-gradient-blue">your business today</span>
          </h2>

          <p className="text-lg lg:text-xl text-gray-10 leading-relaxed mb-10 max-w-xl mx-auto">
            5 free checks every day. No credit card. No signup friction.
            Scale to enterprise when you’re ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link href="#demo">
                Try free now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="xl" asChild>
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-9">
            Trusted by 2,400+ developers and businesses across 40 countries
          </p>
        </motion.div>
      </div>
    </section>
  );
}
