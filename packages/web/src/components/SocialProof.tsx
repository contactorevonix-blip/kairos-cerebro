'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SocialProof() {
  const [apiCount, setApiCount] = useState<string>('—');

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setApiCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  const stats = [
    { value: apiCount, label: 'API calls made', accent: false },
    { value: '4', label: 'developers in production', accent: true },
    { value: '0', label: 'fake reviews', accent: false },
  ];

  return (
    <section className="border-t border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-6 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">Transparent by design</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          No fake reviews.{' '}
          <span className="gradient-text">Real numbers.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[460px] text-base text-white/45">
          Launched in 2026. Real developers in production,
          zero fabricated testimonials. Your results will be the first case study.
        </p>

        <div className="mx-auto mt-12 grid max-w-[680px] grid-cols-3 gap-4">
          {stats.map(({ value, label, accent }) => (
            <div
              key={label}
              className={`rounded-2xl border p-6 ${
                accent
                  ? 'border-accent/15 bg-accent/[0.04]'
                  : 'border-white/[0.07] bg-[#0d0d0d]'
              }`}
            >
              <div
                className={`text-3xl font-extrabold tabular-nums tracking-tighter ${
                  accent ? 'text-accent' : 'text-white'
                }`}
              >
                {value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-white/30">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(0,217,126,0.4)]"
          >
            Become the first case study →
          </Link>
        </div>
      </div>
    </section>
  );
}
