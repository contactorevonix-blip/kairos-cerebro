'use client';
import Link from 'next/link';

function KairosLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-lg" x1="4" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00ff99" />
          <stop offset="100%" stopColor="#00c870" />
        </linearGradient>
        <filter id="nav-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feFlood floodColor="#00d97e" floodOpacity="0.45" result="c" />
          <feComposite in="c" in2="blur" operator="in" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z"
        fill="rgba(0,217,126,0.07)" stroke="url(#nav-lg)" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="7" y1="17" x2="27" y2="17" stroke="url(#nav-lg)" strokeWidth="0.5" strokeDasharray="2 3.5" opacity="0.3" />
      <path d="M12 10v14" stroke="url(#nav-lg)" strokeWidth="2.4" strokeLinecap="round" filter="url(#nav-glow)" />
      <path d="M12 17L22 10" stroke="url(#nav-lg)" strokeWidth="2.4" strokeLinecap="round" filter="url(#nav-glow)" />
      <path d="M12 17L22 24" stroke="url(#nav-lg)" strokeWidth="2.4" strokeLinecap="round" filter="url(#nav-glow)" />
      <circle cx="17" cy="2"    r="1.1" fill="#00d97e" opacity="0.55" />
      <circle cx="31" cy="9.5" r="1.1" fill="#00d97e" opacity="0.35" />
      <circle cx="3"  cy="9.5" r="1.1" fill="#00d97e" opacity="0.35" />
    </svg>
  );
}

const navLinks = [
  { href: '/docs',    label: 'Docs'    },
  { href: '/pricing', label: 'Pricing' },
  { href: '/status',  label: 'Status'  },
];

export default function Nav() {
  const openChat = () => {
    (document.getElementById('kc-bubble') as HTMLButtonElement | null)?.click();
  };

  return (
    <header
      aria-label="Site header"
      className="sticky top-0 z-50 h-[60px] border-b"
      style={{
        borderColor: 'var(--border)',
        background: 'rgba(8,8,8,0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label="Kairos Check">
          <KairosLogo />
          <span className="text-[15px] font-bold leading-none tracking-tighter text-white">
            Kairos<strong className="text-accent font-extrabold">Check</strong>
          </span>
        </Link>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3.5 py-2 text-sm text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/80"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth + CTA */}
        <div className="flex items-center gap-1">
          <div className="hidden h-4 w-px bg-white/[0.08] sm:block mx-2" aria-hidden="true" />

          <Link
            href="/login"
            className="hidden sm:block rounded-lg px-3.5 py-2 text-sm font-medium text-white/45 transition-colors hover:text-white/80"
          >
            Log in
          </Link>

          <Link
            href="/pricing"
            className="hidden sm:block rounded-[9px] border border-white/[0.12] bg-white/[0.05] px-4 py-[7px] text-sm font-semibold text-white/80 transition-all hover:border-accent/40 hover:bg-accent/[0.07] hover:text-accent"
          >
            Sign up
          </Link>

          <button
            onClick={openChat}
            aria-label="Open AI assistant"
            className="ml-1.5 flex items-center gap-1.5 rounded-[9px] bg-accent px-4 py-[9px] text-[13px] font-bold text-black transition-all hover:bg-[#00e888]"
            style={{ boxShadow: '0 0 0 0 rgba(0,217,126,0)', transition: 'background 150ms, box-shadow 150ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(0,217,126,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 0 rgba(0,217,126,0)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5C4.41 1.5 1.5 4.08 1.5 7.25c0 1.12.34 2.17.93 3.06L1.5 14.5l4.37-1.38A7.1 7.1 0 008 13c3.59 0 6.5-2.58 6.5-5.75S11.59 1.5 8 1.5z" fill="#000" />
            </svg>
            Ask AI
          </button>
        </div>
      </div>
    </header>
  );
}
