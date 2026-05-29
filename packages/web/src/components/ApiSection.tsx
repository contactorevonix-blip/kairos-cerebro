"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `// Install
npm install @kairos/sdk

// Verify an IBAN in one line
import { kairos } from '@kairos/sdk';

const result = await kairos.check({
  type:  'iban',
  value: 'NL91 ABNA 0417 1643 00',
});

console.log(result);
// {
//   score: 94,
//   risk: 'safe',
//   signals: ['Valid checksum', 'Known bank', ...],
//   latency_ms: 43
// }`;

export default function ApiSection() {
  return (
    <section id="api" className="relative py-24 lg:py-32">
      <div className="divider-glow mx-auto w-[600px] mb-20" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-xs font-medium text-blue-400 uppercase tracking-[0.1em] mb-4">
              API & SDKs
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-12 tracking-tight mb-5">
              Built for
              <br />
              developers first
            </h2>
            <p className="text-lg text-gray-10 leading-relaxed mb-6">
              Clean REST API with OpenAPI spec. Official SDKs for Node.js and Python.
              Integrate fraud detection in your product in under 10 minutes.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "OpenAPI 3.1 spec — auto-generated client",
                "Idempotent requests with retry logic",
                "Structured error codes — no guesswork",
                "Webhook signatures with HMAC-SHA256",
                "Rate limiting with X-RateLimit headers",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-11">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/docs">
                  Read the docs <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#pricing">See API plans</a>
              </Button>
            </div>
          </motion.div>

          {/* Right code block */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/10 bg-gray-3/60 overflow-hidden">
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-gray-2/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-10 font-mono">kairos.ts</span>
                </div>
              </div>
              {/* Code */}
              <pre className="p-5 text-xs font-mono text-gray-11 leading-relaxed overflow-x-auto scrollbar-thin">
                <code>
                  {codeExample.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line
                        .replace(/(import|const|await|console|from|npm)\b/g, '<span style="color:#60a5fa">$1</span>')
                        .replace(/(['`"][^'`"]*['`"])/g, '<span style="color:#4ade80">$1</span>')
                        .replace(/(\/\/.*)/g, '<span style="color:#636466">$1</span>')
                        .replace(/(\{|\}|\[|\])/g, '<span style="color:#c4b5fd">$1</span>') || " "}
                    </span>
                  ))}
                </code>
              </pre>
            </div>

            {/* Glow */}
            <div className="absolute -inset-px rounded-2xl bg-blue-500/5 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
