import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0a] py-12">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-bold tracking-tighter text-white">
              Kairos<span className="text-accent">Check</span>
            </div>
            <p className="mt-1 text-xs text-white/30">
              OSINT-first fraud detection API. GDPR-native.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/35">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/status" className="hover:text-white transition-colors">Status</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@kairoscheck.net" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
        <div className="mt-8 border-t border-white/[0.04] pt-6 text-xs text-white/20">
          © {new Date().getFullYear()} Kairos Check. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
