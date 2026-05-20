# Copy Library — KairosCheck
> Owner: @Morgan | Actualizar a cada iteração de copy aprovada
> Última actualização: 2026-05-20 | Passo 2

---

## PROPOSTA DE VALOR CORE

**1 frase:**
"O KairosCheck verifica qualquer domínio, email ou URL contra 9 camadas de inteligência OSINT — em menos de 200ms."

**1 parágrafo:**
"O Brasil tem a maior taxa de chargeback do mundo — 3.55%. Um chargeback custa em média €94. O KairosCheck detecta fraude antes de custares dinheiro. API simples. Zero dependências. GDPR nativo. Integras em 60 minutos."

---

## HEADLINES (para A/B test)

```
Versão A (dor directa):
  "Detecta fraude antes do chargeback acontecer."

Versão B (produto + prova):
  "API de fraud detection para developers PT/BR. 50 checks grátis."

Versão C (benefício técnico):
  "9 camadas de inteligência OSINT. Integras em 60 minutos."

Versão D (urgência de mercado):
  "O Brasil tem 3.55% de chargeback rate — o mais alto do mundo."
```

**Recomendação @Morgan:** testar A primeiro (foco na dor), depois C (para audiência técnica).

---

## SUB-HEADLINES

```
Para A:
  "Zero dependências externas. GDPR nativo.
   Starter: €29/mês. Free tier: 50 checks sem cartão."

Para C:
  "C0-C8: Domain Heuristic, Content Risk, Guru-Scam, Reputation,
   NLP, Live Forensics, Checkout Inspection, Fuzzy Match, Network Intel."
```

---

## CTAs POR CONTEXTO

| Contexto | CTA | Destino |
|---|---|---|
| Acima do fold | "Começar grátis — sem cartão" | /auth/signup |
| Pricing page Free | "Criar conta grátis" | /auth/signup |
| Pricing page Starter | "Começar Starter" | Stripe Checkout |
| Docs / API ref | "Get API key →" | /dashboard/keys |
| Blog post | "Testa agora — 50 checks grátis" | /auth/signup |
| Outreach email | "Criar conta em 2 minutos →" | /auth/signup |

---

## ÂNCORA DE PREÇO (obrigatória)

```
"Um chargeback custa em média €94 (custo + fee de disputa).
 O KairosCheck Starter custa €29/mês.
 Para se pagar a si mesmo: evitar menos de 1 chargeback/mês."

Fonte: Chargeflow 2024 ($94 average chargeback cost)
```

---

## TOM DA MARCA

**O que somos:** técnicos, directos, sem marketing agressivo
**Para quem:** developers — não directores de marketing
**Nunca:** "Revolucionamos", "Somos únicos", "O melhor do mundo"
**Sempre:** números reais, benchmarks verificados, integração rápida

**Referência de tom:** Stripe docs + Linear changelog + Anthropic blog
- Stripe: directo, exemplos de código primeiro
- Linear: opinionado, confiante, sem fluff
- Anthropic: transparente sobre limitações e capacidades

---

## COPY DE OUTREACH (para @Hermes)

### Email/DM — Versão 1 (foco na dor)
```
Assunto: Ferramenta de fraud detection para o teu e-commerce

Olá [nome],

Vi que tens um e-commerce em [país/nicho].
O Brasil tem uma taxa de chargeback de 3.55% — uma das mais altas do mundo.
Um chargeback típico custa €94 entre o valor perdido e os fees.

Construí o KairosCheck especificamente para developers PT/BR:
API com 9 camadas OSINT, integra em 60 minutos, começa grátis.

Tens 50 checks grátis sem cartão: kairoscheck.net

Pedro
```

### Email/DM — Versão 2 (foco técnico)
```
Assunto: API de fraud detection — 50 checks grátis

Olá [nome],

Construí uma API de fraud detection para o mercado PT/BR.
5 linhas de código, resultado em < 200ms.

Sem deps externas, GDPR nativo, free tier real.
Starter a €29/mês quando precisares de mais.

kairoscheck.net — testa agora, sem cartão.

Pedro
```

---

## COPY PARA COMUNIDADES (TabNews, IH Brazil, Reddit)

### Post TabNews (artigo técnico)
```
Título: "Como detecto fraude na minha API em Node.js — 9 camadas OSINT"
Conteúdo: tutorial técnico real, mostra o código, menciona KairosCheck no final
Tom: dev para dev, partilha conhecimento genuíno
```

### Post IH Brazil
```
Título: "I built a fraud detection API for PT/BR developers"
Conteúdo:
  - Problema: Brasil tem 3.55% chargeback rate
  - Solução: 9 camadas OSINT, Node.js puro, zero deps
  - Estado: 4 tenants, Stripe activo, free tier disponível
  - Ask: feedback de developers que já tiveram fraude
```

---

## KEYWORDS SEO (PT+BR)

| Keyword | Volume estimado | Dificuldade | Tipo |
|---|---|---|---|
| "detecção de fraude api" | baixo | baixa | bottom funnel |
| "chargeback prevenção brasil" | médio | média | informacional |
| "verificar domínio fraude" | baixo | baixa | transaccional |
| "api antifraude developer" | baixo | baixa | bottom funnel |
| "fraud detection brasil" | médio | alta | informacional |
| "checar dominio suspeito" | baixo | baixa | transaccional |

**Estratégia:** atacar keywords de baixo volume/dificuldade primeiro
com /check/[domain] pages (SEO programático).
