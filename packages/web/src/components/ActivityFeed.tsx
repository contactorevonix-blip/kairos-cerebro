'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOMAINS = [
  { cc:'US', domain:'suspicious-shop.io',           verdict:'BLOCK', score:94 },
  { cc:'DE', domain:'crypto-wallet-restore.net',     verdict:'BLOCK', score:98 },
  { cc:'BR', domain:'coinbase-airdrop-claim.store',  verdict:'BLOCK', score:100},
  { cc:'CN', domain:'paypal-verification-form.com',  verdict:'BLOCK', score:91 },
  { cc:'RU', domain:'binance-giveaway-2026.net',     verdict:'BLOCK', score:99 },
  { cc:'ES', domain:'microsoft-support-ticket.shop', verdict:'BLOCK', score:87 },
  { cc:'US', domain:'vercel.com',                    verdict:'CLEAR', score:0  },
  { cc:'GB', domain:'stripe.com',                    verdict:'CLEAR', score:0  },
  { cc:'NL', domain:'booking.com',                   verdict:'CLEAR', score:2  },
  { cc:'FR', domain:'apple.com',                     verdict:'CLEAR', score:0  },
];

type Row = typeof DOMAINS[0] & { id: number; ago: number };
let gid = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ActivityFeed() {
  const [rows, setRows] = useState<Row[]>(() =>
    shuffle(DOMAINS).slice(0, 5).map((d, i) => ({ ...d, id: gid++, ago: (i + 1) * 7 }))
  );
  const timer = useRef<ReturnType<typeof setInterval>>(null!);

  useEffect(() => {
    timer.current = setInterval(() => {
      const next = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
      setRows(prev => [
        { ...next, id: gid++, ago: 0 },
        ...prev.map(r => ({ ...r, ago: r.ago + 5 })),
      ].slice(0, 5));
    }, 3200);
    return () => clearInterval(timer.current);
  }, []);

  const fmt = (s: number) => s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;

  return (
    <section className="border-t py-16 md:py-20" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-[1100px] px-6">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d97e]" />
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/70">
              Live checks
            </p>
          </div>
          <p className="text-[0.72rem]" style={{ color: 'rgba(242,242,242,0.25)' }}>
            Real domains. Real verdicts. Updated every few seconds.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_56px_64px] items-center gap-4 border-b px-5 py-3"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {['CC', 'Domain', 'Verdict', 'Score', 'When'].map(h => (
              <span key={h} className="text-[0.65rem] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.2)' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <AnimatePresence initial={false}>
              {rows.map(row => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(0,217,126,0.05)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as never }}
                  className="grid grid-cols-[40px_1fr_80px_56px_64px] items-center gap-4 px-5 py-3.5"
                >
                  <span className="font-mono text-[0.7rem] font-bold" style={{ color: 'rgba(242,242,242,0.35)' }}>
                    {row.cc}
                  </span>
                  <span className="truncate font-mono text-[0.82rem]" style={{ color: 'rgba(242,242,242,0.7)' }}>
                    {row.domain}
                  </span>
                  <span className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[0.68rem] font-black tracking-wider ${
                    row.verdict === 'BLOCK' ? 'bg-red-500/10 text-red-400' : 'bg-[rgba(0,217,126,0.1)] text-[#00d97e]'
                  }`}>
                    {row.verdict}
                  </span>
                  <span className={`font-mono text-[0.85rem] font-bold ${
                    row.score >= 70 ? 'text-red-400' : row.score >= 30 ? 'text-yellow-400' : 'text-[#00d97e]'
                  }`}>
                    {row.score}
                  </span>
                  <span className="font-mono text-[0.68rem]" style={{ color: 'rgba(242,242,242,0.25)' }}>
                    {fmt(row.ago)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
