'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: number
  suffix: string
  prefix?: string
  label: string
  source: string
}

const STATS: StatItem[] = [
  { value: 3.55, suffix: '%',  label: 'Chargeback rate no Brasil',   source: 'Alphacomm 2024' },
  { value: 94,   suffix: '€',  prefix: '~', label: 'Custo médio por chargeback', source: 'Chargeflow 2024' },
  { value: 200,  suffix: 'ms', prefix: '<', label: 'Tempo de resposta da API',   source: 'benchmark interno' },
]

function Counter({ value, suffix, prefix = '', active }: StatItem & { active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const start = Date.now()
    const duration = 1500
    const isFloat = value % 1 !== 0

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = value * eased

      setCount(isFloat ? Math.round(current * 100) / 100 : Math.floor(current))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(value)
    }

    requestAnimationFrame(animate)
  }, [active, value])

  const displayed = value % 1 !== 0 ? count.toFixed(2) : count

  return (
    <span className="font-mono">
      {prefix}{displayed}{suffix}
    </span>
  )
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 border-y border-[var(--kc-border-subtle)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[var(--kc-text-primary)] mb-2">
                {active ? (
                  <Counter {...stat} active={active} />
                ) : (
                  <span className="font-mono">{stat.prefix}{stat.suffix === 'ms' ? '0' : '0'}{stat.suffix}</span>
                )}
              </div>
              <p className="text-sm text-[var(--kc-text-secondary)]">{stat.label}</p>
              <p className="text-xs text-[var(--kc-text-muted)] mt-0.5 font-mono">Fonte: {stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
