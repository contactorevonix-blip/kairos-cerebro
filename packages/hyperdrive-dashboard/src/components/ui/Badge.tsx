import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  color?: string
  dimColor?: string
  style?: CSSProperties
  className?: string
  dot?: boolean
}

export function Badge({ children, color, dimColor, style, className, dot }: BadgeProps) {
  return (
    <span
      className={cn('badge', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-mono)',
        color: color ?? 'var(--text-secondary)',
        background: dimColor ?? 'rgba(255,255,255,0.05)',
        border: `1px solid ${color ? color + '28' : 'var(--border)'}`,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color ?? 'var(--text-secondary)',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}
