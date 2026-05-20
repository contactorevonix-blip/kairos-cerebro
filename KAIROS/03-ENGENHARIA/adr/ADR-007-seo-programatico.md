# ADR-007: SEO Programático — /check/[domain]

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + @Morgan + CEO

## Contexto
O maior canal de aquisição B2C confirmado pela pesquisa:
- Caso verificado: 67 → 2.100 signups/mês em 10 meses (Omnius)
- Estratégia: 10.000+ páginas para capturar long-tail PT+BR

## Decisão
**Next.js App Router com generateStaticParams + dynamicParams = true**

## Implementação

```tsx
// src/app/(public)/check/[domain]/page.tsx

import { Metadata } from 'next'

// Top 1000 domínios em build time
export async function generateStaticParams() {
  const topDomains = await fetch(`${process.env.BACKEND_URL}/api/top-domains`)
    .then(r => r.json())
  return topDomains.map((domain: string) => ({ domain }))
}

// Novos domínios: gerar on-demand + guardar em cache
export const dynamicParams = true
export const revalidate = 86400  // 24 horas

// SEO: título dinâmico por domínio
export async function generateMetadata({
  params
}: { params: { domain: string } }): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain)
  return {
    title: `${domain} — Verificação de Fraude | KairosCheck`,
    description: `Score de risco OSINT para ${domain}. Verifica se é fraude em < 200ms. API para developers PT/BR.`,
    openGraph: {
      title: `${domain} — Score de Fraude`,
      description: `Verificado por KairosCheck: ${domain}`,
    },
  }
}

export default async function CheckDomainPage({
  params
}: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)

  // Score público (sem auth) — só score básico, sem detalhes das 9 camadas
  const score = await getPublicScore(domain)

  return (
    <div>
      <h1>Verificação de Fraude — {domain}</h1>
      <ScoreDisplay score={score} domain={domain} />
      <CTASection />  {/* "Ver 9 camadas completas → criar conta grátis" */}
    </div>
  )
}
```

## Sitemap.ts (10.000+ URLs para Google)

```ts
// src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages = [
    { url: 'https://kairoscheck.net', lastModified: new Date() },
    { url: 'https://kairoscheck.net/pricing', lastModified: new Date() },
    { url: 'https://kairoscheck.net/docs', lastModified: new Date() },
    { url: 'https://kairoscheck.net/calculadora-chargeback', lastModified: new Date() },
  ]

  // Páginas /check/[domain] dos top domínios
  const topDomains = await fetch(`${process.env.BACKEND_URL}/api/top-domains`)
    .then(r => r.json())

  const checkPages = topDomains.map((domain: string) => ({
    url: `https://kairoscheck.net/check/${encodeURIComponent(domain)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...checkPages]
}
```

## Schema Markup (JSON-LD para Google)

```tsx
// Em cada página /check/[domain]
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `Verificação de Fraude — ${domain}`,
      "description": `Score de risco OSINT para ${domain}`,
      "provider": {
        "@type": "Organization",
        "name": "KairosCheck",
        "url": "https://kairoscheck.net"
      }
    })
  }}
/>
```

## Keywords Alvo PT+BR (verificadas por @Morgan)

```
"[domain] fraude"          → nossa página /check/[domain]
"verificar domínio seguro" → nossa landing
"checar site suspeito"     → nossa calculadora
"chargeback prevenção"     → blog post
"fraud detection api"      → docs
```

## Consequências
- Backend precisa de endpoint GET /api/public/check/[domain]
  (sem auth, rate limited, retorna score básico)
- 24h de cache por domínio no Next.js
- Google indexa em semanas, tráfego começa em 3-6 meses
