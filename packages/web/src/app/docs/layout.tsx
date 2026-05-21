'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const docs = [
    { href: '/docs', label: 'API Reference', section: 'Getting Started' },
    { href: '/docs/playground', label: 'Playground', section: 'Getting Started' },
    { href: '/docs/signals', label: 'Risk Signals', section: 'Understanding' },
    { href: '/docs/examples', label: 'Code Examples', section: 'Integration' },
    { href: '/docs/rate-limits', label: 'Rate Limits', section: 'Integration' },
  ]

  const grouped = docs.reduce((acc, doc) => {
    const section = acc.find(s => s.section === doc.section)
    if (section) {
      section.items.push(doc)
    } else {
      acc.push({ section: doc.section, items: [doc] })
    }
    return acc
  }, [] as any[])

  return (
    <div style={{ background: 'var(--kc-bg-base)', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        borderRight: '1px solid var(--kc-border-subtle)',
        background: 'var(--kc-bg-surface)',
        display: sidebarOpen ? 'block' : { '@media (max-width: 768px)': 'none' },
        overflowY: 'auto',
        position: { '@media (max-width: 768px)': 'fixed' },
        height: '100vh',
        zIndex: 40,
      }} className="hidden md:block">
        <div style={{ padding: '20px' }}>
          <Link href="/docs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            marginBottom: '32px',
          }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--kc-accent), #00ff88)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontSize: '12px',
              fontWeight: 700,
            }}>K</span>
            <span style={{ color: 'var(--kc-text-primary)', fontWeight: 700, fontSize: '14px' }}>
              Kairos<span style={{ color: 'var(--kc-accent)' }}>Check</span>
            </span>
          </Link>

          {grouped.map(group => (
            <div key={group.section} style={{ marginBottom: '32px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--kc-text-muted)',
                marginBottom: '12px',
              }}>
                {group.section}
              </div>
              {group.items.map(doc => {
                const isActive = pathname === doc.href
                return (
                  <Link key={doc.href} href={doc.href} style={{
                    display: 'block',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    color: isActive ? 'var(--kc-accent)' : 'var(--kc-text-secondary)',
                    background: isActive ? 'var(--kc-bg-elevated)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--kc-accent)' : '2px solid transparent',
                    paddingLeft: '10px',
                    transition: 'all 150ms ease',
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {doc.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          borderBottom: '1px solid var(--kc-border-subtle)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--kc-text-primary)',
              cursor: 'pointer',
              padding: '8px',
            }}
            className="md:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ color: 'var(--kc-text-muted)', fontSize: '13px' }}>
            Documentation
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/dashboard/keys" style={{
            background: 'var(--kc-accent)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 500,
          }}>
            Get API Key →
          </Link>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 32px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
