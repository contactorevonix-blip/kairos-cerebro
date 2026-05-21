'use client'

import Link      from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Key, History, Settings, LogOut, Zap } from 'lucide-react'

const NAV = [
  { href: '/dashboard',          label: 'Overview',  icon: LayoutDashboard },
  { href: '/dashboard/keys',     label: 'API Keys',  icon: Key },
  { href: '/dashboard/history',  label: 'Histórico', icon: History },
  { href: '/dashboard/settings', label: 'Definições',icon: Settings },
]

function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--kc-bg-surface)',
      borderRight: '1px solid var(--kc-border-subtle)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', padding: '24px 0',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '0 20px 24px',
        color: 'var(--kc-text-primary)',
        textDecoration: 'none', fontWeight: 700, fontSize: '16px',
        borderBottom: '1px solid var(--kc-border-subtle)',
        marginBottom: '16px',
      }}>
        <Zap size={18} style={{ color: 'var(--kc-accent)' }} />
        Kairos<span style={{ color: 'var(--kc-accent)' }}>Check</span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
              color:      active ? 'var(--kc-text-primary)' : 'var(--kc-text-secondary)',
              background: active ? 'var(--kc-bg-elevated)'  : 'transparent',
              textDecoration: 'none', fontSize: '14px', fontWeight: active ? 500 : 400,
              transition: 'all 0.15s',
            }}>
              <Icon size={16} style={{ opacity: active ? 1 : 0.7 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--kc-border-subtle)' }}>
        <Link href="/login" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '8px',
          color: 'var(--kc-text-muted)', textDecoration: 'none',
          fontSize: '14px',
        }}>
          <LogOut size={15} />
          Sair
        </Link>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--kc-bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
