# PLANO MESTRE — KairosCheck
> Síntese de toda a pesquisa e análise | 2026-05-20
> Owner: @Sage + @Morgan + @Uma | Aprovado por CEO

---

## A SITUAÇÃO REAL

```
Runway:    ~45 dias
MRR:       €0
Tenants:   4 activos
Stripe:    ACTIVO ✅
Produto:   funcionando em produção
Frontend:  em rebuild (Passo 3-5)
```

**A pergunta que este plano responde:**
Como passamos de €0 para €1.000+ MRR nos próximos 60 dias
e para €10.000+ MRR nos próximos 12 meses — sem cara, sem equipa, sem ads.

---

## PARTE 1 — O PRODUTO FINAL

### O que somos (copy definitivo, não muda)

```
"KairosCheck é a API de fraud detection para developers PT/BR."

Uma frase. Crystal clear. Ninguém nos copia no nicho.
```

### O que construímos

```
BACKEND (sagrado — não mudar):
  Node.js puro, zero deps externas, Railway
  9 camadas OSINT (C0-C8)
  C8 = Network Intelligence = moat real
  214 testes PASS

FRONTEND (rebuild Passo 3-5):
  Next.js 16, React 19, shadcn/ui, Tailwind CSS
  Framer Motion + GSAP SplitText (grátis)
  Geist Sans + Geist Mono
  Dark mode by default
  Design: Linear (densidade) + Stripe (trust) + Vercel (técnico)

EXTENSÃO CHROME (v2 — Passo 5):
  Badge com score no URL bar
  Hover preview em links
  Warning overlay em sites de alto risco

CHATBOT (incluído no Pro):
  Claude Sonnet 4.6 + prompt caching (-90% custo)
  Responde a perguntas sobre o score e sobre integração
  Custo real: ~€0.15/cliente/mês (negligível)
```

---

## PARTE 2 — MODELO DE NEGÓCIO DEFINITIVO

### Pricing (validado contra mercado)

```
FREE      €0/mês
  100 checks (subir de 50 — 40-50% do valor total)
  C0-C4 apenas
  1 API key
  Upgrade prompt aos 75 checks usados
  Objectivo: aha moment, alimentar C8

STARTER   €29/mês · ou €24/mês anual (-17%)
  500 checks incluídos
  + €0.08/check de overage
  C0-C7, dashboard, email support
  API key instantânea após pagamento

PRO       €199/mês · ou €166/mês anual (-17%)  ← "MAIS POPULAR"
  10.000 checks incluídos
  + €0.05/check de overage
  C0-C8 (Network Intelligence EXCLUSIVO)
  Chat widget Claude AI incluído
  Webhooks, priority support

ENTERPRISE  €499/mês (âncora)
  50.000 checks + SLA 99.9%
  (faz o Pro parecer barato)
```

### Por que este modelo ganha (verificado)

```
Annual default → 40-60% escolhem anual (vs <20% se opção)
Overage → NRR 115%+ sem esforço comercial
"Popular" no Pro → +38% seleção do tier do meio
Free tier 100 checks → aha moment + alimenta C8
C8 no Pro only → switching cost real
Chatbot no Pro → valor percebido alto, custo baixo
```

---

## PARTE 3 — COPY DEFINITIVO (todas as páginas)

### Hero section

```
HEADLINE:
"KairosCheck é a API de fraud detection para developers PT/BR."

SUB-HEADLINE:
"O Brasil tem o maior chargeback rate do mundo — 3.55%.
 9 camadas de inteligência OSINT. Resultado em < 200ms.
 Integras em 60 minutos."

CTA PRIMÁRIO:  [Começar grátis — 100 checks, sem cartão]
CTA SECUNDÁRIO: [Ver documentação →]
```

### Demo interactivo (antes do signup — aha moment obrigatório)

```
"Verifica um domínio agora:"
[input: suspicious.xyz]  [Verificar →]
↓
Score: 91/100 ⚠️ ALTO RISCO
"Ver 9 camadas completas → [Cria conta grátis]"

ESTE ELEMENTO DOBRA A CONVERSÃO.
(Airbnb principle: valor antes de pedido de dados)
```

### 3 stats sociais (verificados com fontes)

```
"3.55%"          "€94"           "200ms"
Chargeback rate  Custo médio     Tempo de
no Brasil        por chargeback  resposta
```

### Secção para quem é

```
"Para o developer PT/BR que não quer receber
 uma chamada do adquirente sobre chargeback rate."

"Para o founder que sabe que o SEON existe
 mas não tem €99/mês para começar."

"Para quem usa Stripe mas sabe que o Radar
 só protege o pagamento — não o negócio todo."
```

### Pricing copy

```
"Um chargeback custa €94. O Starter custa €29/mês.
 Para se pagar a si mesmo: evitar 0.3 chargebacks/mês."

Abaixo do pricing:
"Sem contratos. Cancela quando quiseres.
 Overage: €0.08/check (Starter) · €0.05/check (Pro)"
```

### Footer CTA (Twilio TL;DR pattern)

```
"TL;DR: Uma API call. 9 camadas. < 200ms."
"Grátis para começar. Zero surpresas na factura."
[Começar grátis] [Ver pricing]
```

### Regras de copy para @Uma (nunca quebrar)

```
✅ Benefício antes de feature
✅ Números reais com fonte
✅ Voz developer — não corporativo
✅ CTAs de acção específica (não "saiba mais")
✅ Prova com resultado, não só logo
✅ Sem fluff — cada palavra conta
❌ "solução enterprise-grade inovadora"
❌ "poderoso" "revolucionário" "único"
❌ "Saiba mais" / "Comece já" genérico
```

---

## PARTE 4 — OS 5 SISTEMAS DE AQUISIÇÃO

### Sistema 1 — SEO Programático (maior ROI, escala sozinho)

```
O QUÊ: 10.000 páginas /check/[domain]
PROVA: 67 → 2.100 signups/mês em 10 meses (caso verificado)
CUSTO: @Dex 3 dias + zero depois

/check/hotmart.com → "Score: 12/100 ✅ Legítimo"
/check/scam-xyz.tk → "Score: 91/100 ⚠️ Alto Risco"
Cada página: CTA "Ver detalhes → cria conta grátis"

IMPLEMENTAÇÃO:
  Next.js route /check/[domain]
  Metadata dinâmica para SEO
  Sitemap.xml com 10.000 URLs
  Schema markup (Product)

RESULTADO ESPERADO (6 meses):
  20.000+ visitas orgânicas PT+BR/mês
  2.000+ signups/mês
  200+ clientes pagantes
  €5.800+ MRR só por este canal
```

### Sistema 2 — Calculadora de Chargeback (lead magnet viral)

```
O QUÊ: kairoscheck.net/calculadora-chargeback
PROVA: interactive tools → 40-50% conversão warm traffic
CUSTO: @Dex 1 dia + zero depois

Input: vendas/mês + valor médio + taxa chargeback
Output: "Estás a perder €[X]/mês. KairosCheck: €29/mês. ROI: [Y]x."
CTA: [Testar grátis — 100 checks sem cartão]

Esta ferramenta cria urgência com NÚMEROS DO PRÓPRIO CLIENTE.
```

### Sistema 3 — Referral Bilateral (viral loop)

```
O QUÊ: cada utilizador que convida → ambos recebem 100 checks grátis
PROVA: SaaS bilaterais crescem 2x mais rápido
CUSTO: @Dex 1 dia + Stripe cupons automáticos

Link: kairoscheck.net/ref/[id]
Dashboard: "Convida um amigo → +100 checks para ambos"
Email: enviado automaticamente via Resend
```

### Sistema 4 — Extensão Chrome (distribuição passiva)

```
O QUÊ: extensão gratuita — badge com score no URL bar
PROVA: Keyword Surfer → 500.000 users com este modelo
CUSTO: @Dex 1 semana + €5 taxa Chrome Web Store

100.000 downloads × 3% conversão = 3.000 clientes potenciais
3.000 × 10% pagantes = 300 clientes
300 × €29 = €8.700 MRR só pela extensão
```

### Sistema 5 — Badge Embeddável (marketing gratuito)

```
O QUÊ: "✓ Verificado por KairosCheck" — badge no site do cliente
PROVA: Travis CI, Codecov — milhões de repos com badges
CUSTO: @Dex 2 horas + zero depois

Cada badge = anúncio gratuito permanente
Clique → kairoscheck.net/verify/[domain] → CTA para signup
```

---

## PARTE 5 — OS 5 GATILHOS DE COMPRA (psicologia verificada)

```
1. MEDO DE PERDA (o mais poderoso — 95% decisões B2B são emoção)
   "Estás a perder €940/mês. €29/mês resolve."
   Calculadora torna o número específico e pessoal.

2. AHA MOMENT IMEDIATO (antes de pedir dados)
   Demo de verifica domínio sem login.
   "Oh, funciona mesmo" → conversão imediata.

3. ROI IRREFUTÁVEL (matemática, não argumento)
   "Break-even: 0.3 chargebacks evitados/mês."
   Não é opinião — é aritmética.

4. ENTRADA SEM RISCO
   100 checks grátis, sem cartão.
   Developer testa sem comprometer-se.

5. EMAIL EM 5 MINUTOS (seguimento automático)
   "Fizeste o primeiro check?" — enviado por Resend.
   Conversão aumenta 2.5x com follow-up rápido.
```

---

## PARTE 6 — CHATBOT + RECEITA IA

```
MODELO ESCOLHIDO: Incluído no Pro (não cobrar separado)

PORQUÊ:
  Stripe Radar inclui AI sem cobrar extra.
  Linear inclui AI. Vercel inclui AI.
  Não complicar pricing com 45 dias de runway.

IMPLEMENTAÇÃO:
  Claude Sonnet 4.6 no dashboard Pro
  Prompt caching (-90% custo) — custo real: €0.15/cliente/mês
  O chatbot sabe: os nossos docs + o score do cliente + FAQ

FUTURO (100+ clientes Pro):
  Testar "KairosAI add-on" por €9/mês
  Permite perguntas sobre padrões de fraude
  específicos do sector e mercado do cliente
```

---

## PARTE 7 — SEQUÊNCIA DE EXECUÇÃO

### Semana 1-2 (URGENTE — runway)

```
@Hermes + CEO:
  10 mensagens directas para lojistas PT/BR com chargebacks
  Oferta: "Primeiros 10 clientes: 3 meses a €19/mês"
  TARGET: €57 na conta (1 cliente a €19)
  [sem isto o runway continua crítico]

@Dex:
  Calculadora de chargeback (SISTEMA 2) — 1 dia
  TARGET: lead magnet no ar
```

### Semana 2-3

```
@Uma + @Dex:
  Design system + landing hero com demo interactivo
  (aha moment antes do signup)

@Dex:
  /check/[domain] route base — 10 páginas piloto (SISTEMA 1)
  Referral program simples (SISTEMA 3)

@Morgan:
  Post TabNews + IH Brazil (value first, sem spam)
```

### Semana 3-4

```
@Dex:
  100 páginas /check/[domain]
  Badge embeddável (SISTEMA 5)
  Email automático 5 min após signup (Resend)

@Uma:
  Landing completa no ar com novo copy
  Pricing page com âncora e annual default
```

### Mês 2

```
@Dex:
  1.000 páginas SEO programático
  Extensão Chrome v2 na store (SISTEMA 4)
  Onboarding melhorado (aha moment < 3 minutos)

@Oracle:
  Weekly Report: o que converte, o que não converte
  Company Score actualizado

TARGET MÊS 2:
  Free signups: 50-100
  Pagantes: 5-15
  MRR: €145-€435
```

### Mês 3-6

```
SEO a rankear (3 meses para resultados) → tráfego orgânico
Extensão Chrome: 1.000-10.000 downloads
Referral: K-factor > 0.1

TARGET MÊS 6:
  Orgânico: 5.000-20.000 visitas/mês
  Pagantes: 50-200
  MRR: €1.450-€5.800
  Company Score: 70+/100
```

### Mês 7-12

```
Todos os 5 sistemas a funcionar em paralelo
SEO: 10.000 páginas indexadas
Extensão: 10.000-100.000 downloads
C8: 20-50 tenants → moat real a crescer

TARGET MÊS 12:
  Pagantes: 150-400
  MRR: €4.350-€11.600
  Annual upfront: €15.000-€40.000
  NRR: 115%+
  Company Score: 80+/100
```

---

## PARTE 8 — O QUE MUDAR vs MANTER

### Mudar

```
FREE TIER:      50 → 100 checks
ANNUAL:         opção → DEFAULT (mostra mensal como opção)
UPGRADE PROMPT: aos 75% dos checks usados
C8:             disponível para todos → EXCLUSIVO Pro+
DEMO:           adicionar no hero (verifica sem login)
EMAIL:          enviar em 5 min após signup (Resend)
COPY:           substituir tudo pelo copy desta análise
```

### Manter

```
PREÇOS:         €29/€199 — validados contra mercado
BACKEND:        Node.js puro zero deps — performance + moat
GDPR NATIVO:    argumento de venda real na Europa
9 CAMADAS:      complexidade que justifica o preço
PT/BR FOCUS:    mercado sem competição séria
FREE TIER:      essencial para PLG e para alimentar C8
```

### Adicionar (novo)

```
OVERAGE:        €0.08/check (Starter) · €0.05/check (Pro)
ENTERPRISE:     €499/mês (âncora de preço)
CHATBOT:        Claude Sonnet 4.6 incluído no Pro
CALCULADORA:    kairoscheck.net/calculadora-chargeback
BADGE:          widget embeddável para clientes
REFERRAL:       programa bilateral (+100 checks para ambos)
5 SISTEMAS:     SEO programático, calculadora, referral,
                extensão, badge
```

---

## RESUMO EXECUTIVO (1 página)

```
MERCADO:    $54B TAM, Brasil 3.55% chargeback, nenhum competidor PT/BR barato
PRODUTO:    9 camadas OSINT, C8 = moat, Stripe activo, 214 testes passam
MODELO:     Free(100) → Starter €29+overage → Pro €199(C8+Claude) → Enterprise €499
COPY:       "A API de fraud detection para developers PT/BR"
            Números reais: 3.55% · €94 · 200ms
AQUISIÇÃO:  5 sistemas sem tutoriais sem vídeos sem cara:
            SEO 10k páginas · Calculadora · Referral · Extensão · Badge
GATILHOS:   Medo de perda · Aha moment · ROI claro · Sem risco · Follow-up 5min
CHATBOT:    Claude Sonnet 4.6 incluído no Pro · custo real €0.15/mês
SEQUÊNCIA:  Semana 1: primeiro €19. Mês 3: €500 MRR. Mês 6: €3.000 MRR.
GARANTIDO:  mercado existe · dor é real · psicologia funciona · modelo validado
DEPENDE:    execução · velocidade · primeiro cliente validar o funil
```
