# KAIROS — STRATEGY LOCK
> Data: 2026-05-09
> Constraints: faceless, automated, SEO-driven, self-serve only, ACV ≤ €199/mês
> Propósito: travar wedge, ICP, GTM e produto antes de mais construção

---

## DIAGNÓSTICO PRÉ-SECÇÕES (leitura fria do código)

O produto está hoje posicionado para B2B enterprise: "for banks, platforms, and teams", tier "Pilot" (Banks & PSPs), tier "Enterprise" (global programmes), CLI com `kairos tenant:create`, `kairos key:create`. Tudo isto exige sales calls, procurement, procurement approval e identidade pública do founder. Nenhum disto é compatível com os constraints do operador. Existe uma contradição estrutural entre o produto construído e a forma como pode ser vendido. A estratégia abaixo resolve essa contradição escolhendo um dos dois lados — não tenta servir ambos.

---

## 1. PRODUTO PRINCIPAL — DECIDE

### Análise por opção

**Opção A — Extensão Chrome B2C freemium**
- TAM real: ~300M compradores online EU + PT + BR que usam Chrome. Mas extensões de segurança com tier pago têm taxa de conversão <2%. A €4/mês médios: precisas de 2.500 utilizadores pagantes para €10K MRR. Para ter 2.500 pagantes com 2% conversão: 125.000 instalações.
- Fricção de monetização: **8/10** (alto). Consumidores não pagam por segurança que não sentem imediatamente. VirusTotal, Google SafeBrowsing, ScamAdviser são grátis. A proposta tem de ser radicalmente superior para converter.
- Defensibilidade: **baixa**. Google SafeBrowsing já está no Chrome nativo. ScamAdviser tem 10 anos de dados. Sem network effect de utilizadores em escala, o scoring é inferior.
- Compatível com faceless: sim.

**Opção B — API self-serve developer-first**
- TAM real: ~500K devs EU + US a construir SaaS com pagamentos online (Stripe ecosystem). ~100K com budget para ferramentas anti-fraude (estão a pagar Stripe Radar, Sift, Signifyd). At €49/mês médios: 204 clientes = €10K MRR.
- Fricção de monetização: **4/10** (baixa). Devs têm cartão, têm budget de ferramentas, compram sem calls se a documentação for boa.
- Defensibilidade: **média-alta**. OSINT-only + zero external deps + GDPR-first + auditável = diferenciação real da Stripe Radar (só funciona dentro da Stripe) e Sift (enterprise, contrato).
- Compatível com faceless: sim. Stripe-style: docs excelentes, API key, cartão.

**Opção C — Data product**
- TAM real: depende de quem compra dados de fraude — tipicamente empresas de compliance, seguradoras, bancos. Todos exigem outreach.
- Fricção de monetização: **9/10** (muito alta). Dados precisam de volume antes de terem valor. Sem volume, não há compradores. Sem compradores, não há receita para construir volume. Chicken-and-egg puro.
- Incompatível com faceless: o comprador de dados quer falar com alguém antes de pagar.

**Opção D — Combo: extensão como front-door, API como monetização**
- Extensão grátis → gera dados de reputação anónimos → melhora scoring API → API mais precisa → devs pagam.
- Este é o flywheel clássico (Cloudflare: utilizadores grátis → dados de rede → produto enterprise melhor).
- Risco: requer construir e manter dois produtos em paralelo com recursos de um fundador solo.
- Mas: a extensão v0.2.0 já existe. A API já existe. O custo marginal de manter ambas é baixo.

### Recomendação: **Opção D** com B como motor de receita primário

Justificação fria:
- A extensão **já existe** (v0.2.0). Distribuir custa $5 (Chrome Web Store). Custo marginal ≈ zero.
- A API **já está em produção** no Railway. Só falta documentação técnica de qualidade e pricing claro.
- Juntos criam o único activo defensável de longo prazo: dados de reputação que nenhum concorrente sem utilizadores pode replicar.
- A extensão sozinha não monetiza bem. A API sozinha não tem flywheel. Juntas têm ambas.
- **Sequência:** Publicar extensão (semana 1) → tráfego orgânico Chrome Store → dados entram no grafo → lançar docs API (semana 2-3) → SEO técnico traz devs → primeiros pagamentos.

---

## 2. WEDGE EM 1 FRASE

**V1 — Consumer angle (B2C anti-scam)**
"KAIROS é o escudo anti-fraude para compradores online portugueses e brasileiros que precisam de saber se um site é seguro antes de pagar, sem confiar em avaliações Google que podem ser compradas."
- Pro: mercado de massa, alto volume de pesquisa.
- Contra: WTP próximo de zero, Google SafeBrowsing já resolve 80% dos casos, diferenciação difícil.

**V2 — Developer angle (API self-serve)**
"KAIROS é a API de scoring de fraude para indie devs e founders de SaaS que precisam de detetar entidades suspeitas em produção sem pagar enterprise, sem assinar contrato e sem falar com ninguém."
- Pro: dor real, budget existe, processo de compra totalmente self-serve, defensibilidade técnica.
- Contra: mercado menor em volume absoluto, exige docs técnicas excelentes.

**V3 — Long-tail SEO angle (utility-first)**
"KAIROS é a ferramenta gratuita que classifica qualquer domínio, mensagem ou número de telefone como fraude em segundos, com scoring explicável e auditável."
- Pro: compatível com SEO de massa, zero atrito de entrada, dados de utilizador gerados passivamente.
- Contra: dificuldade de converter utilizadores gratuitos em pagantes sem identidade clara de produto.

**Recomendação: V2 como proposta comercial, V3 como mecanismo de aquisição SEO.**
V1 é a persona da extensão Chrome — não a proposta que justifica €29/mês.

---

## 3. ICP COMPATÍVEL COM FACELESS — 3 CANDIDATOS, ESCOLHE 1

### Candidato 1 — Consumidor PT/BR a comprar online
- Quem: adulto 25-50 anos, compra online 2-4x/mês, perdeu dinheiro ou conhece alguém que perdeu.
- Descoberta: "é [site] seguro", "golpe online", "[site] fraude", "comprar em [site] é seguro".
- Dor: receio de perder €50-500 numa compra num site desconhecido.
- WTP: €0-3/mês. Maioria paga zero. Converte só após experiência negativa concreta.
- Volume PT: ~3M compradores online ativos. BR: ~100M.
- Por que não VirusTotal/ScamAdviser: interface técnica, em inglês, não cobre IBAN/telefone PT, sem português.
- **Veredicto: ICP fraco.** Alta escala, baixo WTP, alto custo de suporte, churn brutal. Serve como base de dados, não como cliente pagante.

### Candidato 2 — Indie dev / solo founder a integrar pagamentos
- Quem: dev solo ou equipa de 1-3 a construir SaaS com Stripe. Europeu ou brasileiro. Produto em produção ou próximo disso.
- Descoberta: "fraud detection API", "detect fraudulent users api", "stripe radar alternative", "how to prevent fake signups", "anti-fraud api for saas".
- Dor: chargebacks, signups falsos com cartões roubados, contas comprometidas, bloqueados pela Stripe por ratio de fraude alto.
- WTP: €29-99/mês. Paga ferramentas sem pensar (Sentry, PostHog, Resend, Loops). Tem cartão.
- Volume EU: ~500K devs ativos a construir SaaS. ~50K com problema de fraude activo.
- Por que não Stripe Radar: só funciona dentro da Stripe, sem OSINT, sem auditoria exportável para reguladores, sem cobertura de domínios externos.
- Por que não Sift/Signifyd: enterprise pricing (€500/mês+), requerem calls comerciais, incompatível com estágio de seed.
- **Veredicto: ICP forte.** Self-serve, paga, encontra via SEO técnico, zero outreach necessário.

### Candidato 3 — Operador Shopify pequeno que perdeu dinheiro a chargebacks
- Quem: loja Shopify PT/BR/EU com 50-500 pedidos/mês. Produto físico ou digital. Perdeu €500+ em chargebacks no último ano.
- Descoberta: "prevenir chargebacks shopify", "shopify fraud detection app", "como reduzir chargebacks".
- Dor: chargebacks custam ~€15-25 de taxa além do valor, e acima de 1% ratio a Stripe congela a conta.
- WTP: €29-79/mês. É custo de negócio, amortiza num único chargeback evitado.
- Volume EU: ~500K lojas Shopify EU, ~50K PT/BR, estimativa de 5-10% com problema activo de chargebacks.
- Por que não Shopify Protect: não disponível em PT/BR, só US/CA. Por que não Kount/Riskified: enterprise pricing.
- **Veredicto: ICP bom mas canal de distribuição mais complexo.** Requer app na Shopify App Store (aprovação demorada, comissão 20%) ou integração directa (mais fricção para merchant).

### Recomendação: **Candidato 2 — Indie dev / solo founder**

Motivo frio: é o único ICP que:
1. Encontra o produto via SEO sem outreach ativo.
2. Paga €29-99/mês por cartão sem aprovação de compras.
3. Integra por API, que é exactamente o que o produto é hoje.
4. Gera casos de uso que alimentam SEO técnico (tutoriais, documentação, comparações).
5. Tem escala suficiente para business viável: 200 clientes × €49 = €9.800 MRR.

---

## 4. MOTOR DE AQUISIÇÃO — SEO PROGRAMÁTICO

### 4.1 Arquétipos de Página

**Arquétipo 1 — `/check/[domain]`**
- Exemplo: `/check/shopinfast.com`, `/check/criptobonanza.io`
- Intent: verificação de site antes de comprar / integrar.
- Volume keywords long-tail: "is [domain] safe" gera individualmente 10-50K pesquisas/mês para sites conhecidos; para long-tail de sites desconhecidos, agrega centenas de milhares/mês.
- Geração de conteúdo: score KAIROS real (camadas 1-8) + sinais: idade domínio, WHOIS, SSL, redirects, fingerprint NLP + label "BLOCK / REVIEW / ALLOW" + razões explicáveis.
- CTA: "Instalar extensão Chrome" (B2C) + "Integrar API" (B2B dev).

**Arquétipo 2 — `/verify/phone/[prefix]-[country]`**
- Exemplo: `/verify/phone/351912-pt`, `/verify/phone/55-11-br`
- Intent: "é este número fraud?" — pesquisas de vítimas e consumidores cautelosos.
- Volume: moderado. PT: ~50K pesquisas/mês em variações. BR: 10x mais.
- Geração: sinais OSINT de números de telefone + padrões de uso + denúncias públicas.
- CTA: extensão (B2C) + alertas via API (dev).

**Arquétipo 3 — `/fraud-database/[category]`**
- Exemplo: `/fraud-database/dropshipping-scams`, `/fraud-database/fake-investment-platforms`
- Intent: informação editorial sobre tipos de fraude — alto tráfego informacional.
- Volume: alto, competição moderada. "Dropshipping scam" → 30K/mês EN; "golpe investimento" → 20K/mês PT/BR.
- Geração: dados agregados de scoring KAIROS por categoria + casos reais (domínios BLOCK já no grafo) + guia de prevenção.
- CTA: extensão ("verifica antes de comprar").

**Arquétipo 4 — `/api/use-cases/[platform]`**
- Exemplo: `/api/use-cases/shopify`, `/api/use-cases/stripe`, `/api/use-cases/woocommerce`
- Intent: dev a procurar solução técnica específica — alto intent de compra.
- Volume: menor (centenas a poucos milhares/mês por keyword) mas qualificado. "Fraud detection API Shopify" → dev pronto a pagar.
- Geração: tutorial de integração real + código de exemplo + pricing table.
- CTA: API key gratuita → upgrade pago.

**Arquétipo 5 — `/compare/[competitor]`**
- Exemplo: `/compare/stripe-radar`, `/compare/scamadviser`, `/compare/virustotal`
- Intent: comparação de alternativas — utilizador em avaliação final, pronto a decidir.
- Volume: baixo mas conversão altíssima. "Stripe Radar alternative" → 2-5K/mês EN.
- Geração: tabela de comparação objectiva (features, pricing, limitações, cobertura geográfica).
- CTA: "Experimenta a API grátis (50 checks)".

### 4.2 Escala

| Período | Páginas | Foco |
|---------|---------|------|
| Mês 1 | 500 | Arquétipo 1: 500 domínios known-scam (dados já existem no grafo) |
| Mês 3 | 5.000 | Arquétipos 1+2+3: expansão PT/BR/EN, telefones, categorias |
| Mês 6 | 25.000 | Todos os arquétipos: EU multilíngue, casos de uso API, comparações |

**Anti-penalização Google:**
- Cada página tem dados únicos gerados pela engine (não é template vazio com texto gerado por LLM sem dados reais).
- Minimum 400 palavras por página + score real + sinais específicos do domínio/número.
- Canonical correto, robots.txt limpo, sitemap dinâmico (já existe em `/sitemap.xml` na codebase).
- Não publicar centenas de páginas de golpe — crescimento gradual (50/semana → 200/semana → 500/semana).
- Interna linking: páginas de categoria linkam para domínios individuais, domínios linkam para categorias.

### 4.3 Backlinks / Autoridade sem identidade pessoal

1. **Dataset público semanal**: JSON exportado de "100 domínios BLOCK desta semana" em `/api/public/weekly-threats` → outros sites de segurança e blogs referenciam automaticamente.
2. **Comunidades anónimas**: Reddit r/Scams, r/portugal, r/PPC, HackerNews — dados partilhados, não self-promotion; KAIROS como fonte.
3. **Integrações GitHub**: plugin de integração (KAIROS SDK em npm) → cada repositório que usa cria backlink indirecto via readme e discussões.
4. **Press via dados**: comunicados de imprensa anónimos (marca KAIROS, sem nome) sobre estatísticas de fraude PT/BR — PÚBLICO, JORNAL, DINHEIRO VIVO são veículos que publicam dados sem exigir entrevista.
5. **Guest posts de dados**: artigos técnicos assinados como "KAIROS Research Team" em blogs de segurança — sem nome real, com dados reais do grafo.

---

## 5. PRICING HIPÓTESE — SELF-SERVE ONLY

**Tier 0 — Free — €0/mês**
- Limite: 50 verificações/mês, sem SLA, sem webhook
- Para quem: dev a testar e integrar, utilizador avulso da landing
- Justificação vs grátis: verificações reais com scoring explicável vs VirusTotal (binário, sem OSINT PT/BR, sem auditoria)

**Tier 1 — Starter — €29/mês**
- Limite: 5.000 verificações/mês, webhook, audit trail CSV
- Para quem: indie dev com produto em produção, loja Shopify pequena
- Justificação: amortiza num único chargeback evitado (~€20-30 de custo de chargeback)

**Tier 2 — Pro — €79/mês**
- Limite: 25.000 verificações/mês, SLA 99.9%, GDPR endpoints, batch API
- Para quem: SaaS em crescimento com 1K-10K utilizadores, Shopify médio
- Justificação: equivale a 1 hora de developer a implementar solução caseira por mês

**Tier 3 — Scale — €199/mês**
- Limite: 100.000 verificações/mês, priority support assíncrono (email), reputation graph query
- Para quem: plataforma de médio porte, marketplace, fintech seed
- Justificação: tecto do self-serve — qualquer coisa acima exige pessoa a gerir a relação, portanto não existe

**ELIMINADOS imediatamente:**
- Tier "Pilot" (Banks & PSPs) — exige call, incompatível
- Tier "Enterprise" (Global programmes) — exige contrato, incompatível
- CTA "Talk to us" — eliminar da landing completamente

Todos cobráveis via Stripe, cartão, sem contrato, sem onboarding humano.

---

## 6. EXTENSÃO + API: ARQUITECTURA COMERCIAL

**Fluxo: extensão → grafo → API → pagamento**

```
Utilizador instala extensão (grátis)
    ↓
Extensão escaneia domínio visitado → score KAIROS
    ↓
Score anónimo (sem PII) entra no grafo de reputação
    ↓
Grafo mais rico → API mais precisa
    ↓
Dev integra API, paga €29-199/mês
    ↓
Receita financia infra → extensão melhora → mais utilizadores → mais dados
```

**Dados que a extensão recolhe (sem PII):**
- Domínio visitado + score devolvido pela engine
- Tempo de permanência (proxy de confiança — utilizador ficou ou saiu)
- Clique no alerta (confirmação de percepção de risco)
- País do utilizador (via IP anonimizado — só país, não IP completo)

Estes dados não existem em nenhum concorrente sem extensão instalada. São o moat.

**Premium vs Free (extensão):**
- Free: badge de score, alerta manual, scan on-click
- Premium €4/mês: scan automático de cada página, alertas push, histórico de 30 dias, sem limite de scans diários

**Premium vs Free (API):**
- Free 50 req/mês: score básico, sem SLA, sem webhook, sem audit trail
- Paid: webhook em tempo real, audit trail GDPR exportável, batch, SLA, reputation graph query

---

## 7. STOP-DOING LIST IMEDIATA

1. **PARAR de construir/manter tiers Enterprise e Pilot.** Toda a lógica de `kairos tenant:create`, billing plans enterprise, "Talk to us" CTA — incompatível com faceless. Mantém o código (não destruir), mas remove da landing e da estratégia.

2. **PARAR de iterar na landing page.** Foram 8 iterações de design para uma página com zero visitantes orgânicos. O problema não é conversão, é aquisição. Com 0 visitas, a melhor landing do mundo vale zero.

3. **PARAR de ignorar o Stripe verification como bloqueante passivo.** Charges_enabled: false significa zero receita mesmo que alguém queira pagar agora. É o bloqueante nº1 e não avançou porque foi tratado como "depois".

4. **PARAR de construir CLI features para operadores enterprise** (`vault:set`, `tenant:create`, `compliance:purge` via CLI). O ICP self-serve usa API, não CLI de servidor. CLI é útil para Pedro, não para clientes.

5. **PARAR de adiar a Chrome Web Store submission.** A extensão v0.2.0 está pronta. O único bloqueio são 3 PNGs de ícone. Cada dia sem publicar é um dia sem dados do flywheel e sem aquisição passiva via Store search.

---

## 8. CUSTOMER DISCOVERY SEM OUTREACH

**Mecanismo 1 — Google Trends + Search Console**
- Método: Google Trends para "is [site] safe", "fraude online portugal", "fraud detection api". Google Search Console após publicar primeiras 50 páginas SEO.
- Métrica de sucesso: ≥500 impressões orgânicas nas primeiras 4 semanas nas 50 páginas. Se < 100: keywords erradas ou indexação lenta.

**Mecanismo 2 — Páginas SEO como sondas**
- Método: publicar 10 páginas /check/[known-scam-domain] com domínios que já têm volume de pesquisa ("is wish.com safe", "olx fraude"). Medir via Search Console em 30 dias.
- Métrica de sucesso: ≥1 clique orgânico por página por semana. Confirma que o arquétipo tem procura real.

**Mecanismo 3 — Reddit lurking passivo**
- Método: ler (não postar) r/portugal, r/Scams, r/SideProject, r/indiehackers durante 2 semanas. Registar posts que mencionam fraude online, chargeback, verificação de site.
- Métrica de sucesso: ≥3 posts/semana com dor que KAIROS resolve e sem solução satisfatória mencionada. Se sim: procura real não servida.

**Mecanismo 4 — Chrome Web Store analytics passivo**
- Método: após publicar extensão, observar: (a) installs orgânicos/semana sem marketing; (b) queries que trouxeram utilizadores (Store search); (c) reviews espontâneas.
- Métrica de sucesso: ≥50 instalações orgânicas nas primeiras 4 semanas sem qualquer promoção. Prova que o Store search funciona como canal.

**Mecanismo 5 — Análise de alternativas gratuitas**
- Método: instalar ScamAdviser, MetaCert, Web of Trust. Ler reviews de 1-2 estrelas. Extrair feature requests e dores não resolvidas.
- Métrica de sucesso: ≥5 patterns de dores repetidos que KAIROS já resolve (ou pode resolver com pouco esforço). Cada pattern é um ângulo de mensagem.

---

## 9. PRIMEIRO MILESTONE COMERCIAL

**Não é:** signup, instalação da extensão, visita à landing, demo pública usada.

**É:** Primeiro pagamento real processado pelo Stripe (€29+).

- **Métrica precisa:** `payment_intent.succeeded` no Stripe com `amount ≥ 2900` (€29) e `charges_enabled: true`.
- **Threshold:** 1 pagamento. Um. Real. Com cartão. Sem reversal.
- **Prazo:** 60 dias a partir de hoje → 2026-07-09.
- **Pré-condições não negociáveis:** (1) Stripe verification concluída; (2) Extensão publicada na Chrome Web Store; (3) Docs API online com pricing self-serve claro; (4) Pelo menos 50 páginas SEO indexadas.
- **Como medir automaticamente:** webhook `payment_intent.succeeded` → já existe na codebase → log no audit trail → email de notificação (configurar via Stripe dashboard).

Sem este milestone em 60 dias, o produto está em modo de construção indefinida — não em modo de negócio.

---

## 10. PRECISA INPUT HUMANO

Estas são as únicas questões que o Claude Code não pode inferir do código ou do histórico:

1. **Identidade da marca pública:** O produto aparece na Chrome Web Store como "KAIROS" ou como "Synkra KAIROS" ou como outra coisa? Isso determina o domínio, o nome da extensão, e a estratégia SEO. PRECISA DECISÃO.

2. **Stripe verification:** O documento de identidade foi uploaded em dashboard.stripe.com ou não? Enquanto `charges_enabled: false`, zero receita possível mesmo que tudo o resto funcione. Qual é o estado real agora?

3. **Entidade legal para cobrar:** Para cobrar €29/mês a clientes europeus legalmente, precisa de entidade — ENI, Lda, ou similar com NIF/NIPC PT. Tens? Sem isto, o Stripe vai eventualmente pedir e suspender payouts.

4. **Orçamento para infraestrutura de distribuição:** €5 conta Google developer (Chrome Web Store) + €8-15/ano domínio (kairos.fyi ou similar) + €0 Railway (actual). Total: ~€20. Há orçamento? Sem domínio próprio, o SEO programático não funciona (kairos-cerebro-production.up.railway.app não rankeia).

5. **Tolerância a conteúdo gerado automaticamente:** O SEO programático a 25.000 páginas implica geração automática de conteúdo com dados reais mas texto estruturado. O Pedro aceita publicar sob a marca KAIROS conteúdo que não foi revisto manualmente página a página? Se não, a escala é impossível. Esta é uma decisão editorial com consequências na estratégia.

---

*Gerado: 2026-05-09 | Versão: 1.0 | Autor: Claude Code (Agente Principal KAIROS)*
*Próxima revisão: quando Stripe verification concluída ou 2026-06-09, o que ocorrer primeiro.*
