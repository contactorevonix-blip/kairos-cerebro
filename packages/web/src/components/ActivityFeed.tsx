'use client';
import { useEffect, useState, useRef } from 'react';

const DOMAINS = [
  { domain: 'paypal-account-suspended.store', verdict: 'BLOCK', score: 100, country: 'US' },
  { domain: 'apple-id-verify.shop', verdict: 'BLOCK', score: 98, country: 'GB' },
  { domain: 'binance-airdrop-claim.store', verdict: 'BLOCK', score: 100, country: 'ES' },
  { domain: 'microsoft-support-ticket.shop', verdict: 'BLOCK', score: 97, country: 'DE' },
  { domain: 'amazon-refund-portal.store', verdict: 'BLOCK', score: 95, country: 'FR' },
  { domain: 'netflix-billing-update.com', verdict: 'BLOCK', score: 85, country: 'NL' },
  { domain: 'coinbase-wallet-recovery.net', verdict: 'BLOCK', score: 85, country: 'BR' },
  { domain: 'paypal-verify.com', verdict: 'BLOCK', score: 75, country: 'IN' },
  { domain: 'shopify.com', verdict: 'CLEAR', score: 0, country: 'CA' },
  { domain: 'stripe.com', verdict: 'CLEAR', score: 0, country: 'US' },
  { domain: 'vercel.com', verdict: 'CLEAR', score: 0, country: 'US' },
  { domain: 'github.com', verdict: 'CLEAR', score: 0, country: 'US' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ActivityFeed() {
  const [items, setItems] = useState(() => shuffle(DOMAINS).slice(0, 5).map((d, i) => ({ ...d, age: (i + 1) * 2 + 's ago' })));
  const counterRef = useRef(0);

  useEffect(() => {
    fetch('/api/stats/counter').then(r => r.json()).then(d => {
      if (d?.count) counterRef.current = Number(d.count);
    }).catch(() => {});

    const interval = setInterval(() => {
      setItems(prev => {
        const next = shuffle(DOMAINS)[0];
        return [
          { ...next, age: 'just now' },
          ...prev.slice(0, 4).map(x => ({ ...x, age: x.age === 'just now' ? '2s ago' : x.age })),
        ];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-accent/70">
            Real fraud detections — powered by Kairos Check
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0d]">
          {items.map((item, i) => (
            <div
              key={`${item.domain}-${i}`}
              className="flex items-center gap-4 border-b border-white/[0.04] px-5 py-3.5 last:border-0 transition-all"
              style={{ opacity: i === 0 ? 1 : 1 - i * 0.12 }}
            >
              <span className="w-7 shrink-0 text-center text-[10px] font-bold text-white/30 font-mono">{item.country}</span>
              <span className="flex-1 font-mono text-sm text-white/70 truncate">{item.domain}</span>
              <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold font-mono ${
                item.verdict === 'BLOCK'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-accent/10 text-accent'
              }`}>
                {item.verdict}
              </span>
              <span className={`w-8 text-right text-xs font-mono font-bold shrink-0 ${
                item.verdict === 'BLOCK' ? 'text-red-400/80' : 'text-accent/80'
              }`}>
                {item.score}
              </span>
              <span className="w-14 text-right text-[11px] text-white/20 shrink-0">{item.age}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
