import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  style?: CSSProperties
  accentColor?: string
  glow?: boolean
  action?: ReactNode
}

export function Card({ children, title, subtitle, className, style, accentColor, glow, action }: CardProps) {
  return (
    <div
      className={cn('card', className)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: glow && accentColor
          ? `0 0 0 1px ${accentColor}22, 0 4px 24px ${accentColor}14`
          : '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'box-shadow var(--transition-base), border-color var(--transition-base)',
        ...style,
      }}
    >
      {accentColor && (
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}00)`,
          }}
        />
      )}
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1, padding: title ? 'var(--space-4) var(--space-5)' : undefined }}>
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, color, icon, trend }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'border-color var(--transition-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: color ?? 'var(--text-secondary)', opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {(sub || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend && (
            <span style={{ fontSize: 11, color: trend === 'up' ? 'var(--color-green)' : trend === 'down' ? 'var(--color-red)' : 'var(--text-tertiary)' }}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
          {sub && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}
