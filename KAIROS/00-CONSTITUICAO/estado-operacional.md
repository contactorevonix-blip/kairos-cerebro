# Estado Operacional — KairosCheck
> Owner: @Oracle + @Orion | Actualizar após cada fase concluída
> Última actualização: 2026-05-20

---

## EMPRESA

| Campo | Valor |
|---|---|
| Nome público | Kairos Check |
| Domínio | kairoscheck.net |
| CEO | Pedro, 21 anos, Ericeira |
| Modelo | Solo founder, faceless |
| Runway | ~45 dias sem nova receita |
| Modo | Guerra — 10-12h/dia, 6-7 dias/semana |

---

## PRODUTO

| Campo | Valor |
|---|---|
| Produto | KairosCheck — API fraud detection OSINT-first |
| Camadas | 9 (C0-C8) |
| Moat | C8 Network Intelligence (peso 0.90, cross-tenant) |
| Backend | Node.js puro, zero deps externas, Railway |
| Frontend | Next.js 16 + React 19, Vercel (em rebuild) |
| Coverage | PT+BR excelente, US+UK bom, DE/FR/ES parcial |
| Tenants | 4 activos |

---

## ESTADO TÉCNICO (2026-05-20)

| Componente | Estado |
|---|---|
| Backend API | ✅ OPERATIONAL (kairoscheck.net/health) |
| Stripe | ✅ ACTIVO (charges_enabled: true) |
| Testes | ✅ 214/214 PASS — 0 FAIL |
| Frontend | ⚙️ EM REBUILD (Passo 3-5) |
| Extensão Chrome | ✅ v0.2.0 pronta, aguarda v2 |
| CI/CD | ✅ Railway auto-deploy (git push → prod) |

---

## STACK TÉCNICA VERIFICADA

```
Backend:
  Runtime:     Node.js puro (v24.15.0)
  Storage:     JSON/JSONL atómicos em .kairos-data/
  Deploy:      Railway → auto-deploy via git push origin main
  Auth:        API keys SHA-256 (format: kc_live_...)
  Billing:     Stripe SDK (única excepção a zero deps)

Frontend (em rebuild):
  Framework:   Next.js 16 App Router
  UI:          shadcn/ui + Tailwind CSS + Radix UI
  Animações:   Framer Motion + GSAP SplitText (ambos GRÁTIS)
  Fonts:       GeistSans + GeistMono (via npm install geist)
  Deploy:      Vercel (root dir = packages/web/)
  CSS:         Design system OKLCH (ver OPERATIONAL_SYSTEM_COMPLETE.md)

Integrações:
  Pagamentos:  Stripe (ACTIVO ✅)
  Email:       Resend (Free tier: 3k/mês, 100/dia)
  AI:          Claude API — claude-sonnet-4-6 para chat widget
  DNS:         kairoscheck.net
```

---

## O PLANO — 6 PASSOS DO REBUILD

```
Passo 0: Preparação                    ✅ CONCLUÍDO (commit 531be71)
Passo 1: Skills + Specs                ✅ CONCLUÍDO (commits 25ea9c7 → 71f6a28)
         11 skills com cérebro operacional
         16 specs verificadas com fontes reais
         Pré-Passo 2: limpeza          ✅ CONCLUÍDO (commits 4595b6b → a9d65d8)
         214/214 testes, zero legado

Passo 2: Estratégia e negócio          ← PRÓXIMO (aguarda CEO confirm)
         @Sage: ICP PT+BR, unit economics, pricing
         @Morgan: canais, copy, go-to-market

Passo 3: Design System do zero         (@Uma)
         Nova identidade visual, tokens OKLCH, componentes

Passo 4: Arquitectura frontend         (@Aria)
         ADRs, RSC boundaries, estrutura Next.js

Passo 5: Implementação                 (@Dex + @Uma + @Quinn)
         Landing, dashboard, API keys, chat widget

Passo 6: Backend melhorado + deploy    (@Aria + @Dex + @Rex + @Quinn + @Gage)
         Resolver dívida técnica, C0 no engine, deploy final
```

---

## MÉTRICAS (estado honesto)

| Métrica | Valor | Fonte |
|---|---|---|
| MRR | €0 | Stripe (verificado) |
| Clientes pagantes | 0 | Stripe |
| Tenants activos | 4 | API |
| Runway | ~45 dias | estimativa CEO |
| Testes passing | 214/214 | npm test |
| Target 30 dias | €87+ MRR | @Oracle forecast |
| Target 60 dias | €300+ MRR | @Oracle forecast |

---

## CONCORRENTES

| Concorrente | Preço entrada | Fraqueza que exploramos |
|---|---|---|
| SEON | €99/mês | caro, complexo, sem PT/BR |
| Stripe Radar | só com Stripe | lock-in, não é geral |
| Sardine | >€1.500/mês | enterprise only, inacessível |
| **KairosCheck** | €0 | PT+BR, simple, GDPR nativo |

---

## RESTRIÇÕES SAGRADAS DO CEO

1. **Faceless** — sem vídeo, áudio identificável, fotos
2. **Solo** — sem equipa humana agora
3. **B2C self-serve PRIMEIRO** — antes de B2B
4. **PT + BR PRIMEIRO** — antes de qualquer outro mercado
5. **Zero deps externas** no backend de produção (excepto Stripe SDK)
