"use client";

import { ShieldWrapper } from "@/components/three/shield-wrapper";
import { CodePanel }    from "@/components/ui/code-panel";
import { TryItInput }   from "@/components/sections/try-it-input";
import { CURL_EXAMPLE } from "@/lib/code-snippets";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-24">
      {/* Radial background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 50% 0%, rgba(59,130,246,0.08) 3%, transparent 70%)",
        }}
      />

      <div className="relative">
        {/* ── TOP ROW: copy left / shield right ── */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-14">
          {/* Copy */}
          <div
            className="flex flex-col"
            style={{ animation: "hero-text-slide-up-fade 1s ease-in-out" }}
          >
            <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Real-time fraud detection
            </span>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.05]">
              Trust nothing.<br />
              <span className="text-gray-400">Verify everything.</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-gray-400 max-w-md leading-relaxed">
              KAIROS scores IBANs, emails, phone numbers and links in
              milliseconds. Stop fraud before it starts — free to try,
              enterprise-ready.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/try"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Try free — 5 checks/day
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center h-12 px-5 rounded-2xl border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-colors"
              >
                View API docs
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                No card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All systems operational
              </span>
            </div>
          </div>

          {/* Shield */}
          <div
            className="h-[420px] md:h-[520px]"
            style={{ animation: "webgl-scale-in-fade 1.5s ease-in-out" }}
          >
            <ShieldWrapper className="w-full h-full" />
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 py-6 border-y border-white/[0.08]">
          {[
            { value: "99.7%",  label: "Accuracy" },
            { value: "<50ms",  label: "Response time" },
            { value: "400+",   label: "Data signals" },
            { value: "GDPR",   label: "Compliant" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── BOTTOM ROW: Try-it B2C / Code B2B ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <TryItInput />
          <CodePanel language="bash" code={CURL_EXAMPLE} />
        </div>
      </div>
    </section>
  );
}
