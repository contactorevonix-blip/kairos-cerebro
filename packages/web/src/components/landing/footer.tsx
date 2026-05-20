import Link from 'next/link'

const LINKS = {
  Produto: [
    { label: 'Como funciona', href: '/docs' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Status da API', href: '/status' },
    { label: 'Changelog', href: '/blog' },
  ],
  Developers: [
    { label: 'Quickstart', href: '/docs/quickstart' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'SDKs', href: '/docs/sdks' },
    { label: 'Webhooks', href: '/docs/webhooks' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'DPA (GDPR)', href: '/dpa' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--kc-border-subtle)] bg-[var(--kc-bg-surface)]">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-mono text-base font-bold text-[var(--kc-text-primary)]">
                Kairos<span className="text-[var(--kc-accent)]">Check</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--kc-text-muted)] leading-relaxed mb-4">
              A API de fraud detection para developers PT/BR.
              9 camadas OSINT. GDPR nativo.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--kc-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kc-success)]" />
              kairoscheck.net — OPERATIONAL
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[var(--kc-text-secondary)] uppercase tracking-wider mb-3">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[var(--kc-text-muted)] hover:text-[var(--kc-text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--kc-border-subtle)]
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[var(--kc-text-muted)]">
            © 2026 Kairos Check · kairoscheck.net · GDPR nativo · EU-hosted
          </p>
          <p className="text-[10px] text-[var(--kc-text-muted)] font-mono">
            API latência: {'<'}200ms · Uptime: 99.9%
          </p>
        </div>
      </div>
    </footer>
  )
}
