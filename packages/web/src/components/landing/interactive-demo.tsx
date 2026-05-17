'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart, UserX, Zap, Tag, Shield, Gauge, Copy, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── SCENARIO DATA ─────────────────────────────────────────── */
type Verdict = 'BLOCK' | 'REVIEW';

interface Scenario {
  id:       string;
  icon:     LucideIcon;
  label:    string;
  file:     string;
  verdict:  Verdict;
  score:    number;
  signals:  string[];
  action:   string;
  code:     string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'checkout', icon: ShoppingCart, label: 'Checkout fraud', file: 'checkout.ts',
    verdict: 'BLOCK', score: 0.94,
    signals: ['disposable_email', 'vpn_detected', 'ip_reputation_low', 'domain_age_7d'],
    action: 'Return 403 · Log event · Flag account',
    code: `import { KairosCheck } from '@kairos/check';

const kairos = new KairosCheck(process.env.KC_API_KEY);

// Called before payment processing
export async function validateCheckout(req) {
  const result = await kairos.check({
    domain: req.body.email.split('@')[1],
    ip: req.ip,
    email: req.body.email,
    scenario: 'checkout'
  });

  if (result.verdict === 'BLOCK') {
    // Score: 0.94 — disposable email + VPN detected
    return { blocked: true, reason: result.signals[0] };
  }

  return { blocked: false };
}`,
  },
  {
    id: 'signup', icon: UserX, label: 'Fake accounts', file: 'signup.ts',
    verdict: 'BLOCK', score: 0.87,
    signals: ['fake_name_pattern', 'temp_email', 'vpn_detected'],
    action: 'Block signup · Send alert · Add to blocklist',
    code: `import { KairosCheck } from '@kairos/check';

const kairos = new KairosCheck(process.env.KC_API_KEY);

export async function validateSignup(req) {
  const { email, name, ip } = req.body;

  const result = await kairos.check({
    email,
    ip,
    // Name pattern analysis
    metadata: { name }
  });

  if (result.verdict === 'BLOCK') {
    // Score: 0.87 — fake name pattern + temp email
    await logSuspiciousSignup({ email, ip, signals: result.signals });
    return res.status(403).json({ error: 'Signup not allowed' });
  }

  return createUser({ email, name });
}`,
  },
  {
    id: 'api', icon: Zap, label: 'API abuse', file: 'api-abuse.ts',
    verdict: 'BLOCK', score: 0.71,
    signals: ['rate_limit_exceeded', 'datacenter_ip', 'no_browser_fingerprint'],
    action: 'Rate limit · Log abuse · Revoke key',
    code: `import { KairosCheck } from '@kairos/check';

const kairos = new KairosCheck(process.env.KC_API_KEY);

// Middleware — runs on every API request
export async function abuseGuard(req, res, next) {
  const result = await kairos.check({
    ip: req.ip,
    apiKey: req.headers['x-api-key'],
    scenario: 'api_request'
  });

  if (result.score > 0.7) {
    // Score: 0.71 — datacenter IP + no browser fingerprint
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: 60
    });
  }

  next();
}`,
  },
  {
    id: 'coupon', icon: Tag, label: 'Coupon farming', file: 'coupon.ts',
    verdict: 'REVIEW', score: 0.55,
    signals: ['multiple_accounts', 'same_ip_cluster', 'promo_abuse_pattern'],
    action: 'Flag for review · Limit redemption · Alert team',
    code: `import { KairosCheck } from '@kairos/check';

const kairos = new KairosCheck(process.env.KC_API_KEY);

export async function validateCouponUse(req) {
  const { couponCode, email, ip } = req.body;

  const result = await kairos.check({
    email,
    ip,
    scenario: 'coupon_redemption',
    metadata: { couponCode }
  });

  if (result.verdict === 'REVIEW') {
    // Score: 0.55 — same IP cluster, possible multi-account
    await flagForManualReview({ email, couponCode, signals: result.signals });
    return { status: 'pending_review' };
  }

  return applyDiscount(couponCode);
}`,
  },
];

/* ── SYNTAX HIGHLIGHT ──────────────────────────────────────── */
function highlightCode(code: string): React.ReactNode[] {
  const keywords = /\b(import|export|from|const|let|var|async|await|if|return|new|function)\b/g;
  const strings  = /('.*?'|".*?")/g;
  const comments = /(\/\/.*)/g;
  const methods  = /\b(check|then|catch|json|log|status|split|push|map)\b(?=\s*[\.(])/g;

  return code.split('\n').map((line, li) => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    const tokens: { start: number; end: number; color: string; italic?: boolean }[] = [];

    const scanRe = (re: RegExp, color: string, italic?: boolean) => {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        tokens.push({ start: m.index, end: m.index + m[0].length, color, italic });
      }
    };

    scanRe(comments, '#3a3a3a', true);
    scanRe(strings, '#86efac');
    scanRe(keywords, '#c084fc');
    scanRe(methods, '#fbbf24');

    tokens.sort((a, b) => a.start - b.start);
    const merged: typeof tokens = [];
    for (const t of tokens) {
      if (merged.length === 0 || t.start >= merged[merged.length - 1].end) merged.push(t);
    }

    for (const t of merged) {
      if (t.start > last) parts.push(<span key={`t-${last}`} style={{ color: '#aaa' }}>{line.slice(last, t.start)}</span>);
      parts.push(<span key={`h-${t.start}`} style={{ color: t.color, fontStyle: t.italic ? 'italic' : 'normal' }}>{line.slice(t.start, t.end)}</span>);
      last = t.end;
    }
    if (last < line.length) parts.push(<span key={`e-${li}`} style={{ color: '#aaa' }}>{line.slice(last)}</span>);

    return (
      <div key={li} style={{ display: 'flex', lineHeight: 1.8 }}>
        <span style={{ width: 48, textAlign: 'right', paddingRight: 20, color: '#2a2a2a', fontSize: 12, userSelect: 'none', flexShrink: 0 }}>{li + 1}</span>
        <span style={{ flex: 1, paddingRight: 16 }}>{parts.length > 0 ? parts : <span>&nbsp;</span>}</span>
      </div>
    );
  });
}

/* ── GAUGE ─────────────────────────────────────────────────── */
function ScoreGauge({ score, verdict }: { score: number; verdict: Verdict }) {
  const color = verdict === 'BLOCK' ? '#FF4444' : '#FFB800';
  const r = 34; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="#1f1f1f" strokeWidth={5} />
        <motion.circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - circ * score }}
          transition={{ duration: 0.9, ease }}
        />
      </svg>
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>{score.toFixed(2)}</div>
        <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>SCORE</div>
      </div>
    </div>
  );
}

export default function InteractiveDemo() {
  const [active, setActive] = useState('checkout');
  const [mode, setMode] = useState<'strict' | 'balanced'>('strict');
  const [copied, setCopied] = useState(false);

  const scenario = SCENARIOS.find(s => s.id === active)!;
  const verdictColor = scenario.verdict === 'BLOCK' ? '#FF4444' : '#FFB800';
  const verdictDim   = scenario.verdict === 'BLOCK' ? 'rgba(255,68,68,' : 'rgba(255,184,0,';

  function handleCopy() {
    navigator.clipboard.writeText(scenario.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="section-y" style={{ background: '#000', borderTop: '1px solid #1a1a1a' }}>
      <div className="container-kc">

        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">How it works</span>
          <h2 className="heading-two-tone" style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span>See it in action.</span><br />
            <span>Any scenario.</span>
          </h2>
        </motion.div>

        <motion.div
          style={{ maxWidth: 1100, margin: '0 auto', background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 20, overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr 360px', height: 560 }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          {/* Sidebar */}
          <div style={{ background: '#080808', borderRight: '1px solid #1a1a1a', padding: '16px 0', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 11, color: '#333', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 20px', marginBottom: 12, fontFamily: 'var(--font-geist-mono)' }}>
              Scenarios
            </p>
            {SCENARIOS.map(s => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 20px', border: 'none',
                    borderLeft: `2px solid ${isActive ? '#00DC82' : 'transparent'}`,
                    background: isActive ? '#111' : 'transparent',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#0f0f0f'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={15} color={isActive ? '#00DC82' : '#333'} />
                  <div>
                    <p style={{ fontSize: 13, color: isActive ? '#fff' : '#444', transition: 'color 150ms' }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'var(--font-geist-mono)', marginTop: 2 }}>{s.file}</p>
                  </div>
                </button>
              );
            })}
            <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #1a1a1a' }}>
              <a href="#" style={{ fontSize: 12, color: '#00DC82', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >View all examples →</a>
            </div>
          </div>

          {/* Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Mac bar */}
            <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
              <div style={{ width: 1, height: 16, background: '#1a1a1a', margin: '0 4px' }} />
              <span style={{ fontSize: 13, color: '#fff', fontFamily: 'var(--font-geist-mono)', marginLeft: 4 }}>{scenario.file}</span>
              <button onClick={handleCopy} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#00DC82' : '#333', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 150ms', padding: 0 }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Code */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', fontFamily: 'var(--font-geist-mono)', fontSize: 13 }}>
              <AnimatePresence mode="wait">
                <motion.div key={active}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.2 }}
                >
                  {highlightCode(scenario.code)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Result panel */}
          <div style={{ borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', background: '#080808' }}>
            {/* Mode toggles */}
            <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-geist-mono)' }}>Live Result</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ id: 'strict', Icon: Shield }, { id: 'balanced', Icon: Gauge }].map(({ id, Icon }) => (
                  <button key={id} onClick={() => setMode(id as 'strict' | 'balanced')}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: mode === id ? '#1a1a1a' : 'transparent',
                      color: mode === id ? '#fff' : '#333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms',
                    }}><Icon size={14} /></button>
                ))}
              </div>
            </div>

            {/* Result content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  {/* Input */}
                  <div>
                    <p style={{ fontSize: 11, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-geist-mono)' }}>Input</p>
                    <p style={{ fontSize: 14, color: '#fff', fontFamily: 'var(--font-geist-mono)' }}>suspicious-deals99.com</p>
                    <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>45.33.32.156 · user@tempmail.xyz</p>
                  </div>

                  {/* Verdict + Score */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                      fontFamily: 'var(--font-geist-mono)',
                      background: `${verdictDim}0.08)`,
                      border: `1px solid ${verdictDim}0.25)`,
                      color: verdictColor,
                    }}>{scenario.verdict}</div>
                    <ScoreGauge score={scenario.score} verdict={scenario.verdict} />
                  </div>

                  {/* Signals */}
                  <div>
                    <p style={{ fontSize: 11, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-geist-mono)' }}>Signals</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {scenario.signals.map(s => (
                        <span key={s} style={{
                          fontFamily: 'var(--font-geist-mono)', fontSize: 11,
                          padding: '4px 10px', borderRadius: 8,
                          background: `${verdictDim}0.06)`,
                          border: `1px solid ${verdictDim}0.18)`,
                          color: `${verdictColor}b3`,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Latency */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00DC82', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: '#00DC82' }}>47ms</span>
                    <span style={{ fontSize: 12, color: '#333' }}>response time</span>
                  </div>

                  {/* Action */}
                  <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Recommended action</p>
                    <p style={{ fontSize: 13, color: '#fff' }}>{scenario.action}</p>
                    <a href="#" style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#00DC82', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >View in dashboard →</a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
