// ─── KAIROS HYPERDRIVE — Utilities ───────────────────────────────────────────

import type { AgentId, Domain, EventType, AgentMetrics } from '../types'

/** Formata uptime em ms para HH:MM:SS */
export function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Formata timestamp ISO para HH:MM:SS */
export function formatTime(iso: string): string {
  try {
    return iso.slice(11, 19)
  } catch {
    return '??:??:??'
  }
}

/** Formata timestamp ISO para data e hora legível */
export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Formata duração em ms para string legível */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m${Math.floor((ms % 60_000) / 1000)}s`
  return `${Math.floor(ms / 3_600_000)}h${Math.floor((ms % 3_600_000) / 60_000)}m`
}

/** Formata custo USD */
export function formatCost(usd: number): string {
  if (usd < 0.0001) return '$0.0000'
  return `$${usd.toFixed(4)}`
}

/** Cor do agente (accent) */
const AGENT_COLORS: Record<string, string> = {
  '@Orion':  '#6366f1', // indigo — Sovereign
  '@Aria':   '#a855f7', // purple — Architect
  '@Dex':    '#3b82f6', // blue — Engineer
  '@Gage':   '#f97316', // orange — DevOps
  '@Quinn':  '#22c55e', // green — QA
  '@Rex':    '#ef4444', // red — Security
  '@Uma':    '#ec4899', // pink — Design
  '@Sage':   '#eab308', // yellow — Business
  '@Morgan': '#06b6d4', // cyan — Growth
  '@Hermes': '#84cc16', // lime — Sales
  '@Oracle': '#8b5cf6', // violet — Analytics
}

export function agentColor(id: string): string {
  return AGENT_COLORS[id] ?? '#6b7280'
}

/** Cor dim (alpha 15%) do agente */
export function agentColorDim(id: string): string {
  const hex = agentColor(id).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r},${g},${b},0.12)`
}

/** Emoji / ícone por domain */
const DOMAIN_ICONS: Record<Domain | string, string> = {
  infra:        '🏗️',
  backend:      '⚙️',
  frontend:     '🎨',
  auditoria:    '🔒',
  refactor:     '♻️',
  docs:         '📝',
  navegacao:    '🧭',
  estrategia:   '🎯',
  crescimento:  '📈',
  vendas:       '💼',
  default:      '🤖',
}

export function domainIcon(domain: string): string {
  return DOMAIN_ICONS[domain] ?? '🤖'
}

/** Cor do tipo de evento */
export function eventTypeColor(type: EventType): string {
  if (type.includes('Completed') || type.includes('Passed') || type.includes('Reached')) {
    return 'var(--color-green)'
  }
  if (type.includes('Failed') || type.includes('Error') || type.includes('Exceeded')) {
    return 'var(--color-red)'
  }
  if (type.includes('Warning') || type.includes('Escalated')) {
    return 'var(--color-yellow)'
  }
  if (type.includes('Started') || type.includes('Created')) {
    return 'var(--color-blue)'
  }
  if (type.includes('Consensus')) {
    return 'var(--color-purple)'
  }
  if (type.includes('Snapshot') || type.includes('Boot')) {
    return 'var(--color-cyan)'
  }
  return 'var(--text-secondary)'
}

/** Classificação do Agent Score */
export function scoreClass(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'ELITE',    color: 'var(--color-green)'  }
  if (score >= 75) return { label: 'STRONG',   color: 'var(--color-blue)'   }
  if (score >= 60) return { label: 'ADEQUATE', color: 'var(--color-yellow)' }
  return             { label: 'CRITICAL', color: 'var(--color-red)'    }
}

/** Classnames condicional simples */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Cor de status de tarefa */
export function taskStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'var(--color-green)'
    case 'running':   return 'var(--color-blue)'
    case 'failed':    return 'var(--color-red)'
    case 'escalated': return 'var(--color-yellow)'
    case 'pending':   return 'var(--text-secondary)'
    default:          return 'var(--text-tertiary)'
  }
}

/** Top agente por score */
export function topAgent(agents: AgentMetrics[]): AgentMetrics | null {
  if (!agents.length) return null
  return agents.reduce((best, a) => a.score > best.score ? a : best)
}

/** Trunca string */
export function truncate(str: string, max: number): string {
  if (!str) return ''
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}
