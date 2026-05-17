'use client';

import { motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const TABS = ['curl', 'Node.js', 'Python', 'Go'] as const;
type Tab = typeof TABS[number];

const SNIPPETS: Record<Tab, ReactElement> = {
  curl: (
    <pre className="text-sm leading-relaxed font-mono">
      <span style={{ color: '#555' }}>$ </span>
      <span style={{ color: '#00DC82' }}>curl</span>
      <span style={{ color: '#fff' }}> -X POST \{'\n'}</span>
      <span style={{ color: '#555' }}>  https://api.kairoscheck.net/</span>
      <span style={{ color: '#fff' }}>v1/check \{'\n'}</span>
      <span style={{ color: '#555' }}>  -H </span>
      <span style={{ color: '#FFB800' }}>'Authorization: Bearer kc_live_••••'</span>
      <span style={{ color: '#fff' }}> \{'\n'}</span>
      <span style={{ color: '#555' }}>  -d </span>
      <span style={{ color: '#FFB800' }}>'&#123;"domain":"suspicious-deals99.com"&#125;'</span>
    </pre>
  ),
  'Node.js': (
    <pre className="text-sm leading-relaxed font-mono">
      <span style={{ color: '#888' }}>import</span>
      <span style={{ color: '#fff' }}> &#123; KairosCheck &#125; </span>
      <span style={{ color: '#888' }}>from</span>
      <span style={{ color: '#FFB800' }}> 'kairos-check'</span>{'\n\n'}
      <span style={{ color: '#888' }}>const</span>
      <span style={{ color: '#fff' }}> kairos </span>
      <span style={{ color: '#888' }}>=</span>
      <span style={{ color: '#00DC82' }}> new KairosCheck</span>
      <span style={{ color: '#fff' }}>(&#123; apiKey: </span>
      <span style={{ color: '#FFB800' }}>process.env.KAIROS_API_KEY</span>
      <span style={{ color: '#fff' }}> &#125;){'\n\n'}</span>
      <span style={{ color: '#888' }}>const</span>
      <span style={{ color: '#fff' }}> result </span>
      <span style={{ color: '#888' }}>= await</span>
      <span style={{ color: '#fff' }}> kairos.</span>
      <span style={{ color: '#00DC82' }}>check</span>
      <span style={{ color: '#fff' }}>(&#123;{'\n'}  domain: </span>
      <span style={{ color: '#FFB800' }}>'suspicious-deals99.com'</span>
      <span style={{ color: '#fff' }}>{'\n'}&#125;){'\n\n'}</span>
      <span style={{ color: '#555' }}>// result.verdict → </span>
      <span style={{ color: '#FF4444' }}>'BLOCK'</span>
    </pre>
  ),
  Python: (
    <pre className="text-sm leading-relaxed font-mono">
      <span style={{ color: '#888' }}>from</span>
      <span style={{ color: '#fff' }}> kairos_check </span>
      <span style={{ color: '#888' }}>import</span>
      <span style={{ color: '#fff' }}> Client{'\n\n'}</span>
      <span style={{ color: '#fff' }}>client </span>
      <span style={{ color: '#888' }}>= </span>
      <span style={{ color: '#00DC82' }}>Client</span>
      <span style={{ color: '#FFB800' }}>("kc_live_••••"</span>
      <span style={{ color: '#fff' }}>){'\n\n'}</span>
      <span style={{ color: '#fff' }}>result </span>
      <span style={{ color: '#888' }}>= </span>
      <span style={{ color: '#fff' }}>client.</span>
      <span style={{ color: '#00DC82' }}>check</span>
      <span style={{ color: '#fff' }}>(domain=</span>
      <span style={{ color: '#FFB800' }}>"suspicious-deals99.com"</span>
      <span style={{ color: '#fff' }}>){'\n\n'}</span>
      <span style={{ color: '#555' }}>print</span>
      <span style={{ color: '#fff' }}>(result.verdict)  </span>
      <span style={{ color: '#555' }}># </span>
      <span style={{ color: '#FF4444' }}>BLOCK</span>
    </pre>
  ),
  Go: (
    <pre className="text-sm leading-relaxed font-mono">
      <span style={{ color: '#888' }}>import</span>
      <span style={{ color: '#FFB800' }}> "github.com/kairoscheck/go"</span>{'\n\n'}
      <span style={{ color: '#fff' }}>client </span>
      <span style={{ color: '#888' }}>:= </span>
      <span style={{ color: '#fff' }}>kairos.</span>
      <span style={{ color: '#00DC82' }}>New</span>
      <span style={{ color: '#fff' }}>(kairos.</span>
      <span style={{ color: '#00DC82' }}>Config</span>
      <span style={{ color: '#fff' }}>&#123;{'\n'}  APIKey: </span>
      <span style={{ color: '#FFB800' }}>os.Getenv("KAIROS_API_KEY")</span>
      <span style={{ color: '#fff' }}>,{'\n'}&#125;){'\n\n'}</span>
      <span style={{ color: '#fff' }}>res, _ </span>
      <span style={{ color: '#888' }}>:= </span>
      <span style={{ color: '#fff' }}>client.</span>
      <span style={{ color: '#00DC82' }}>Check</span>
      <span style={{ color: '#fff' }}>(ctx, &amp;kairos.</span>
      <span style={{ color: '#00DC82' }}>CheckRequest</span>
      <span style={{ color: '#fff' }}>&#123;{'\n'}  Domain: </span>
      <span style={{ color: '#FFB800' }}>"suspicious-deals99.com"</span>
      <span style={{ color: '#fff' }}>,{'\n'}&#125;)</span>
    </pre>
  ),
};

const SIGNALS = ['disposable_domain', 'ip_reputation_low', 'domain_age_7d', 'mx_missing', 'asn_datacenter'];

function Gauge({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * score;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#1f1f1f" strokeWidth={4} />
        <motion.circle
          cx={48} cy={48} r={r}
          fill="none"
          stroke="#FF4444"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease, delay: 0.4 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FF4444', fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>
          0.94
        </span>
        <span style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-geist-mono)', marginTop: 2 }}>SCORE</span>
      </div>
    </div>
  );
}

export default function CodeDemo() {
  const [tab, setTab] = useState<Tab>('curl');
  return (
    <section className="section-y" style={{ background: '#000', borderTop: '1px solid #1f1f1f' }}>
      <div className="container-kc">

        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Integration</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}
            className="heading-two-tone">
            <span>Live in 5 minutes.</span>
            <br />
            <span>Any language.</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: '3fr 2fr' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Code */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#080808', border: '1px solid #1f1f1f' }}>
            <div className="flex" style={{ borderBottom: '1px solid #1f1f1f' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-3 text-xs font-medium font-mono transition-colors"
                  style={{
                    color: tab === t ? '#fff' : '#444',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: tab === t ? '1px solid #00DC82' : '1px solid transparent',
                    cursor: 'pointer',
                    marginBottom: -1,
                  }}>
                  {t}
                </button>
              ))}
            </div>
            <div className="p-6" style={{ minHeight: 240 }}>
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
                {SNIPPETS[tab]}
              </motion.div>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl p-7 flex flex-col gap-5" style={{ background: '#080808', border: '1px solid #1f1f1f' }}>
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Live result</p>
              <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>suspicious-deals99.com</p>
            </div>

            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm font-mono"
                style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#FF4444' }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease }}
                viewport={{ once: true }}
              >
                BLOCK
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Gauge score={0.94} />
              </motion.div>
            </div>

            <div>
              <p className="font-mono text-xs mb-2" style={{ color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Signals</p>
              <div className="flex flex-wrap gap-1.5">
                {SIGNALS.map((s, i) => (
                  <motion.span key={s}
                    className="font-mono text-xs px-2.5 py-1 rounded-md"
                    style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', color: 'rgba(255,68,68,0.7)' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    viewport={{ once: true }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.div className="flex items-center gap-2"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              transition={{ delay: 1.2 }} viewport={{ once: true }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00DC82' }} />
              <span className="font-mono text-sm" style={{ color: '#00DC82' }}>47ms</span>
              <span className="text-xs" style={{ color: '#444' }}>response time</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
