'use client';
import Link from 'next/link';

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="lg1" x1="4" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00ff99" />
        <stop offset="100%" stopColor="#00c870" />
      </linearGradient>
      <filter id="gf" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feFlood floodColor="#00d97e" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="shadow" />
        <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path
      d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z"
      fill="rgba(0,217,126,0.08)"
      stroke="url(#lg1)"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <line x1="7" y1="17" x2="27" y2="17" stroke="#00d97e" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.35" />
    <path d="M12 10v14" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" filter="url(#gf)" />
    <path d="M12 17L22 10" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" filter="url(#gf)" />
    <path d="M12 17L22 24" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" filter="url(#gf)" />
    <circle cx="17" cy="2" r="1.2" fill="#00d97e" opacity="0.6" />
    <circle cx="31" cy="9.5" r="1.2" fill="#00d97e" opacity="0.4" />
    <circle cx="3" cy="9.5" r="1.2" fill="#00d97e" opacity="0.4" />
  </svg>
);

export default function Nav() {
  const openChat = () => {
    const bubble = document.getElementById('kc-bubble');
    if (bubble) bubble.click();
  };

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-white/[0.07] bg-[rgba(10,10,10,0.85)] backdrop-blur-[20px]"
      style={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
    >
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none" aria-label="Kairos Check home">
          <Logo />
          <span className="text-base font-bold tracking-tighter text-white leading-none">
            Kairos<strong className="text-accent font-extrabold">Check</strong>
          </span>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-0.5">
          <Link href="/docs" className="hidden sm:block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-md">Docs</Link>
          <Link href="/pricing" className="hidden sm:block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-md">Pricing</Link>
          <Link href="/status" className="hidden md:block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-md">Status</Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-[18px] bg-white/10 mx-2" aria-hidden="true" />

          <Link
            href="/login"
            className="hidden sm:block px-3.5 py-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors rounded-md"
          >
            Log in
          </Link>
          <Link
            href="/pricing"
            className="hidden sm:block px-4 py-[7px] text-sm font-semibold text-white border border-white/[0.14] rounded-[7px] bg-white/[0.05] hover:border-accent/50 hover:text-accent hover:bg-accent/[0.07] transition-all"
          >
            Sign up
          </Link>
          <button
            onClick={openChat}
            aria-label="Open AI chat"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-black bg-accent rounded-[7px] hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(0,217,126,0.35)] transition-all ml-1.5 whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5C4.41 1.5 1.5 4.08 1.5 7.25c0 1.12.34 2.17.93 3.06L1.5 14.5l4.37-1.38A7.1 7.1 0 008 13c3.59 0 6.5-2.58 6.5-5.75S11.59 1.5 8 1.5z" fill="#000" />
            </svg>
            Ask AI
          </button>
        </div>
      </div>
    </nav>
  );
}
