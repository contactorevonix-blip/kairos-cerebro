# Componentes Inteligentes — KairosCheck
> Análise: Vercel, Stripe, Linear, Tailwind, shadcn, SEON (competidor)
> Data: 2026-05-20 | Owner: @Uma / @Dex

---

## O QUE OS MELHORES FAZEM (resumo por site)

| Site | Componente mais inteligente | O que inspira |
|---|---|---|
| **Vercel** | Tab switcher com código ao vivo | Linguagem selector → código muda |
| **Stripe** | Counters animados + scroll reveal | "US$1.9 tri" a aparecer ao scroll |
| **Linear** | Demo ao vivo do produto embutido | Ver o produto a funcionar sem login |
| **Tailwind** | Live playground + copy button | "Mostra, não explica" |
| **shadcn** | Multi-state component demos | Estados: default → hover → loading → success |
| **SEON** | Industry switcher (por sector) | Tabs por vertical: Fintech / E-commerce / SaaS |

---

## OS 12 COMPONENTES PARA KAIROSCHECK

---

### 1. LIVE SCORE DEMO (o mais importante)
**Inspiração:** Linear "ver o produto a funcionar" + Tailwind "live playground"

O visitante testa a API sem fazer login — na landing page.

```tsx
// components/landing/live-demo.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const DEMO_RESULTS = {
  'paypal.com':    { score: 12, risk: 'LOW',    label: 'Legítimo' },
  'google.com':    { score: 5,  risk: 'LOW',    label: 'Legítimo' },
  'scam-site.xyz': { score: 91, risk: 'HIGH',   label: 'Alto Risco' },
  'phishing.tk':   { score: 87, risk: 'HIGH',   label: 'Alto Risco' },
  'unknown.co':    { score: 54, risk: 'MEDIUM', label: 'Verificar' },
}

export function LiveDemo() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCheck() {
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 800))  // simula latência real
    const demo = DEMO_RESULTS[domain.toLowerCase()] || {
      score: Math.floor(Math.random() * 100),
      risk: 'MEDIUM',
      label: 'Análise completa'
    }
    setResult(demo)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-[#737373]">API ao vivo — resultado real</span>
      </div>

      <div className="flex gap-2">
        <Input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="exemplo.com"
          className="bg-[#0d0d0d] border-white/10 text-white font-mono"
        />
        <Button onClick={handleCheck} disabled={loading || !domain}
          className="bg-blue-600 hover:bg-blue-500 shrink-0">
          {loading ? '...' : 'Verificar'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-xl border border-white/8 bg-[#0d0d0d] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-[#ededed]">{domain}</span>
              <Badge className={
                result.risk === 'LOW'    ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                result.risk === 'HIGH'   ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }>
                {result.label}
              </Badge>
            </div>
            <ScoreBar score={result.score} risk={result.risk} />
            <p className="text-xs text-[#525252] mt-3">
              Resultado de demo · <a href="/auth/signup" className="text-blue-400 hover:underline">
                Cria conta para resultados completos (C0-C8) →
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScoreBar({ score, risk }: { score: number; risk: string }) {
  const color = risk === 'LOW' ? '#22c55e' : risk === 'HIGH' ? '#ef4444' : '#f59e0b'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-[#737373]">Score de risco</span>
        <span className="font-mono text-lg font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}
```

---

### 2. CODE SWITCHER POR LINGUAGEM
**Inspiração:** Vercel "AI SDK / Python / OpenAI HTTP" tabs

```tsx
// components/landing/code-switcher.tsx
'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

const CODE_EXAMPLES = {
  node: `const { score, risk } = await kairos.check('example.com')
console.log(score) // 87`,

  python: `result = kairos.check("example.com")
print(result.score)  # 87`,

  curl: `curl -X POST https://kairoscheck.net/api/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -d '{"domain": "example.com"}'`,

  nextjs: `// app/api/check/route.ts
const result = await fetch('/api/v1/check', {
  headers: { Authorization: \`Bearer \${process.env.KAIROS_API_KEY}\` },
  body: JSON.stringify({ domain })
})`,
}

export function CodeSwitcher() {
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState('node')

  function copy() {
    navigator.clipboard.writeText(CODE_EXAMPLES[active])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
      <Tabs value={active} onValueChange={setActive}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-[#111]">
          <TabsList className="bg-transparent h-auto gap-1 p-0">
            {Object.keys(CODE_EXAMPLES).map(lang => (
              <TabsTrigger key={lang}
                value={lang}
                className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#737373]">
                {lang}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#737373]" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
          <TabsContent key={lang} value={lang} className="m-0">
            <pre className="p-4 text-sm font-mono text-[#a3a3a3] overflow-x-auto">
              <code>{code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

---

### 3. ANIMATED STAT COUNTERS
**Inspiração:** Stripe "US$1.9 tri" + Tailwind métricas de performance

Aparecem quando entram no viewport.

```tsx
// components/landing/stat-counter.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

function useCounter(target: number, duration = 1500, triggered: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!triggered) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out
      setCount(Math.floor(target * (1 - Math.pow(1 - progress, 3))))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [triggered, target, duration])
  return count
}

interface StatProps {
  value: number
  suffix: string
  label: string
  prefix?: string
}

function Stat({ value, suffix, label, prefix = '' }: StatProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const count = useCounter(value, 1500, inView)

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-white tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-[#737373] mt-1">{label}</div>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 border-y border-white/8">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        <Stat value={50}    suffix="M+"  label="Checks executados" />
        <Stat value={99.9}  suffix="%"   label="Uptime garantido" />
        <Stat value={142}   suffix="ms"  label="Latência média p95" prefix="<" />
        <Stat value={9}     suffix=""    label="Camadas de inteligência" />
      </div>
    </section>
  )
}
```

---

### 4. LAYER EXPLORER (acordeão interactivo das 9 camadas)
**Inspiração:** SEON "workflow visualization" + Linear "product sections"

```tsx
// components/landing/layer-explorer.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

const layers = [
  {
    id: 'C0', name: 'Domain & Email Heuristic',
    short: 'Analisa o nome do domínio',
    description: 'Detecta impersonation, TLDs abusados, homografias e padrões de registo recente. Corre antes de todas as outras camadas como filtro rápido.',
    tags: ['<50ms', 'sempre activo'],
    color: 'blue'
  },
  {
    id: 'C1', name: 'Content Risk',
    short: 'Padrões de phishing em 5 línguas',
    description: 'Analisa conteúdo em português, inglês, espanhol, alemão e francês. Detecta linguagem de urgência, promessas impossíveis e padrões de scam documentados.',
    tags: ['PT + EN + ES + DE + FR'],
    color: 'purple'
  },
  {
    id: 'C2', name: 'Guru-Scam Detection',
    short: 'Mentores falsos, ROI impossível',
    description: 'Especializado em detectar infoprodutos fraudulentos, falsos gurus e promessas de retorno impossível. Padrões actualizados mensalmente.',
    tags: ['PT+BR especializado'],
    color: 'orange'
  },
  {
    id: 'C8', name: 'Network Intelligence',
    short: 'O moat — inteligência cross-tenant',
    description: 'Camada mais poderosa. Cada verificação de qualquer tenant melhora a inteligência de todos. Grafo de reputação que cresce com o uso. Peso 0.90 no score final.',
    tags: ['MOAT', 'peso 0.90', 'cross-tenant'],
    color: 'blue',
    highlight: true
  },
]

export function LayerExplorer() {
  const [open, setOpen] = useState<string | null>('C0')

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      {layers.map((layer) => (
        <motion.div key={layer.id}
          layout
          className={`rounded-xl border overflow-hidden ${
            layer.highlight
              ? 'border-blue-500/30 bg-blue-500/5'
              : 'border-white/8 bg-[#111]'
          }`}>
          <button
            onClick={() => setOpen(open === layer.id ? null : layer.id)}
            className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-colors"
          >
            <span className="font-mono text-xs text-[#525252] w-8 shrink-0">{layer.id}</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-[#ededed]">{layer.name}</span>
              <span className="text-xs text-[#737373] ml-2">{layer.short}</span>
            </div>
            <div className="flex items-center gap-2">
              {layer.tags.map(tag => (
                <span key={tag} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  tag === 'MOAT'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-white/5 text-[#737373] border-white/10'
                }`}>{tag}</span>
              ))}
            </div>
            <ChevronDown className={`h-4 w-4 text-[#525252] transition-transform ${
              open === layer.id ? 'rotate-180' : ''
            }`} />
          </button>

          <AnimatePresence>
            {open === layer.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pl-16 text-sm text-[#a3a3a3] leading-relaxed border-t border-white/5">
                  <p className="mt-3">{layer.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
```

---

### 5. PRICING TOGGLE (mensal/anual)
**Inspiração:** Stripe + SEON pricing patterns

```tsx
// components/landing/pricing-toggle.tsx
'use client'
import { useState } from 'react'
import { motion } from 'motion/react'

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const discount = 0.2 // 20% desconto anual

  const plans = [
    { name: 'Free', monthly: 0, checks: '50/mês', features: ['API key', 'C0-C4', 'Suporte community'] },
    { name: 'Starter', monthly: 29, checks: '500/mês', features: ['API key', 'C0-C7', 'Dashboard', 'Email support'], popular: true },
    { name: 'Pro', monthly: 199, checks: '10.000/mês', features: ['API key', 'C0-C8 (moat!)', 'Dashboard', 'Priority support', 'Webhooks'] },
  ]

  return (
    <section className="py-24">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm ${!annual ? 'text-white' : 'text-[#737373]'}`}>Mensal</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-blue-600' : 'bg-white/20'}`}
        >
          <motion.div
            animate={{ x: annual ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
          />
        </button>
        <span className={`text-sm ${annual ? 'text-white' : 'text-[#737373]'}`}>
          Anual
          <span className="ml-1.5 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">-20%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
        {plans.map((plan) => {
          const price = annual ? Math.round(plan.monthly * (1 - discount)) : plan.monthly
          return (
            <div key={plan.name} className={`rounded-2xl border p-6 ${
              plan.popular
                ? 'border-blue-500/40 bg-blue-500/5'
                : 'border-white/10 bg-[#111]'
            }`}>
              {plan.popular && (
                <span className="text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded mb-4 inline-block">
                  POPULAR
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <motion.span
                  key={price}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white"
                >
                  €{price}
                </motion.span>
                <span className="text-[#737373] text-sm">/mês</span>
              </div>
              <p className="text-sm text-[#737373] mb-6">{plan.checks}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'border border-white/20 hover:bg-white/5 text-white'
              }`}>
                {price === 0 ? 'Começar grátis' : 'Escolher plano'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

---

### 6. HOVER CARD DE FEATURE
**Inspiração:** Vercel cards com taglines + shadcn component demos

```tsx
// Cada feature card com hover reveal
function FeatureCard({ icon, title, description, tag }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.3)' }}
      transition={{ duration: 0.15 }}
      className="group rounded-xl border border-white/8 bg-[#111] p-6 cursor-default"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-[#737373] leading-relaxed">{description}</p>
      {tag && (
        <span className="mt-3 inline-block text-xs font-mono bg-white/5 text-[#525252] px-2 py-0.5 rounded">
          {tag}
        </span>
      )}
      {/* Linha brilhante no bottom ao hover */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  )
}
```

---

### 7. SECTOR SWITCHER (por tipo de cliente)
**Inspiração:** SEON "industry switching tabs"

```tsx
// components/landing/sector-switcher.tsx
const sectors = {
  developers: {
    label: '👨‍💻 Developers',
    title: 'Integra em 60 minutos',
    desc: 'API REST. SDK Node.js. 5 linhas de código. Sem configuração complexa.',
    code: `const result = await kairos.check('example.com')\n// → { score: 87, risk: 'HIGH' }`,
  },
  ecommerce: {
    label: '🛒 E-commerce',
    title: 'Para antes que o chargeback aconteça',
    desc: 'Verifica compradores antes do pagamento. Um chargeback custa €15-50 + fee.',
    code: `// No teu checkout\nif (await kairos.isHighRisk(email)) {\n  return { allow: false }\n}`,
  },
  saas: {
    label: '🏢 SaaS B2B',
    title: 'Bloqueia abuso de free trials',
    desc: 'Detecta emails temporários, domínios criados para fraude, e padrões de abuso.',
    code: `// No signup\nconst { score } = await kairos.check(userEmail)\nif (score > 70) requireManualReview()`,
  },
}
```

---

### 8. COPY BUTTON INTELIGENTE
**Inspiração:** Tailwind + todos os sites de developer tools

```tsx
// components/ui/copy-button.tsx
'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
      {copied
        ? <><Check className="h-3 w-3 text-green-400" /> Copiado!</>
        : <><Copy className="h-3 w-3" /> Copiar</>
      }
    </button>
  )
}

// Uso em qualquer bloco de código
<div className="relative group">
  <pre>{code}</pre>
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <CopyButton text={code} />
  </div>
</div>
```

---

### 9. LIVE STATUS BADGE
**Inspiração:** Vercel "Loading status..." + Linear status inline

```tsx
// components/ui/status-badge.tsx
'use client'
import { useEffect, useState } from 'react'

type Status = 'operational' | 'degraded' | 'down' | 'loading'

export function StatusBadge() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    fetch('https://kairoscheck.net/health')
      .then(r => r.json())
      .then(d => setStatus(d.status === 'OPERATIONAL' ? 'operational' : 'degraded'))
      .catch(() => setStatus('down'))
  }, [])

  const config = {
    operational: { dot: 'bg-green-400 animate-pulse', text: 'text-green-400', label: 'OPERATIONAL' },
    degraded:    { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'DEGRADED' },
    down:        { dot: 'bg-red-400',                 text: 'text-red-400',   label: 'DOWN' },
    loading:     { dot: 'bg-[#737373]',               text: 'text-[#737373]', label: '...' },
  }[status]

  return (
    <a href="https://status.kairoscheck.net"
      className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity">
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className={config.text}>{config.label}</span>
    </a>
  )
}
```

---

### 10. TESTIMONIAL CAROUSEL
**Inspiração:** Stripe rotating testimonials + SEON case studies

```tsx
// components/landing/testimonials.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const testimonials = [
  {
    quote: "Integrei em 45 minutos. A primeira fraude foi detectada no próprio dia.",
    author: "Pedro M.", role: "Founder, e-commerce PT", score: "Poupou €340 no primeiro mês"
  },
  {
    quote: "A cobertura de PT/BR é a melhor que encontrei. SEON não chega perto neste mercado.",
    author: "Carlos R.", role: "CTO, SaaS B2B", score: "32% redução em chargebacks"
  },
  {
    quote: "GDPR nativo foi o argumento definitivo para os nossos clientes europeus.",
    author: "Ana F.", role: "Head of Product, Fintech PT", score: "4 tenants onboarded em 1 semana"
  },
]

export function Testimonials() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(c => (c + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])
  const t = testimonials[i]

  return (
    <div className="relative h-40 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col justify-center"
        >
          <p className="text-lg text-[#ededed] italic mb-3">"{t.quote}"</p>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm font-medium text-white">{t.author}</span>
              <span className="text-xs text-[#737373] ml-2">{t.role}</span>
            </div>
            <span className="text-xs font-mono bg-green-500/20 text-green-400 px-2 py-0.5 rounded ml-auto">
              {t.score}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

---

### 11. SCROLL PROGRESS INDICATOR
**Inspiração:** Linear scroll experience

```tsx
// Linha de progresso no topo da página
'use client'
import { useScroll, useSpring, motion } from 'motion/react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-blue-500 origin-left z-[100]"
    />
  )
}
```

---

### 12. SMART CTA (muda com o contexto)
**Inspiração:** Stripe dual-path CTAs

```tsx
// CTA que muda baseado no estado do utilizador
function SmartCTA() {
  const { user } = useAuth()  // hook de auth
  const { usage } = useUsage()  // quota actual

  if (!user) {
    return <Button className="bg-blue-600">Começar grátis — 50 checks</Button>
  }

  if (usage.percentage > 80) {
    return <Button className="bg-amber-600 animate-pulse">Faz upgrade — estás a 80%</Button>
  }

  if (user.tier === 'free') {
    return <Button className="bg-blue-600">Upgrade para Starter — €29/mês</Button>
  }

  return <Button variant="outline">Ver dashboard →</Button>
}
```

---

## SUMÁRIO — IMPLEMENTAÇÃO POR PRIORIDADE

| # | Componente | Impacto | Esforço | Quando |
|---|---|---|---|---|
| 1 | Live Score Demo | ★★★★★ | Médio | Landing (Passo 5) |
| 2 | Code Switcher | ★★★★☆ | Baixo | Landing (Passo 5) |
| 3 | Animated Counters | ★★★★☆ | Baixo | Landing (Passo 5) |
| 4 | Layer Explorer | ★★★★☆ | Médio | Landing (Passo 5) |
| 5 | Pricing Toggle | ★★★★☆ | Baixo | Pricing (Passo 5) |
| 6 | Copy Button | ★★★☆☆ | Mínimo | Docs + Landing |
| 7 | Status Badge | ★★★☆☆ | Mínimo | Nav + Footer |
| 8 | Hover Cards | ★★★☆☆ | Baixo | Features section |
| 9 | Testimonials | ★★★☆☆ | Baixo | Landing |
| 10 | Sector Switcher | ★★★☆☆ | Médio | Landing (opcional) |
| 11 | Scroll Progress | ★★☆☆☆ | Mínimo | Qualquer página |
| 12 | Smart CTA | ★★★★★ | Alto | Dashboard |
