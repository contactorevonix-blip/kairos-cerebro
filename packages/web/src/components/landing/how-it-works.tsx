'use client';

import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: '01',
    title: 'Add one line',
    code: "import { kairos } from '@kairos/check'",
  },
  {
    n: '02',
    title: 'Call the API',
    code: 'await kairos.check({ domain, ip, email })',
  },
  {
    n: '03',
    title: 'Ship with confidence',
    code: "if (result.verdict === 'BLOCK') return 403",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-y" style={{ background: '#000', borderTop: '1px solid #1f1f1f' }}>
      <div className="container-kc">

        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">How it works</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}
            className="heading-two-tone">
            <span>Three steps.</span>
            <br />
            <span>That's it.</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-10 left-0 right-0 hidden md:block" style={{ height: 1 }}>
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(0,220,130,0.2), transparent)' }} />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ n, title, code }, i) => (
              <motion.div
                key={n}
                className="flex flex-col items-center text-center gap-5 relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-80px' }}
              >
                {/* Step number */}
                <div className="relative">
                  <span style={{
                    fontSize: 64,
                    fontFamily: 'var(--font-geist-mono)',
                    fontWeight: 700,
                    color: 'rgba(0,220,130,0.12)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>
                    {n}
                  </span>
                  {/* Dot on line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full hidden md:block"
                    style={{ background: '#00DC82', boxShadow: '0 0 12px rgba(0,220,130,0.5)' }} />
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{title}</h3>

                <div className="w-full rounded-xl px-4 py-3 font-mono text-sm overflow-x-auto"
                  style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', color: '#00DC82', whiteSpace: 'nowrap' }}>
                  {code}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
