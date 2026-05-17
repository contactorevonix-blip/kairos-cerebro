import Link from 'next/link';

const links = [
  { href: '/docs',           label: 'Docs'    },
  { href: '/pricing',        label: 'Pricing' },
  { href: '/status',         label: 'Status'  },
  { href: '/legal/privacy',  label: 'Privacy' },
  { href: '/legal/terms',    label: 'Terms'   },
];

export default function Footer() {
  return (
    <footer className="border-t py-14" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="mx-auto max-w-content px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-[15px] font-bold tracking-tighter text-white">
              Kairos<span className="text-accent">Check</span>
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              OSINT-first fraud detection API. GDPR-native by design.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="transition-colors hover:text-white/70">{label}</Link>
            ))}
            <a href="mailto:hello@kairoscheck.net" className="transition-colors hover:text-white/70">Contact</a>
          </nav>
        </div>

        <div className="mt-10 border-t pt-6 text-[11px]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Kairos Check. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
