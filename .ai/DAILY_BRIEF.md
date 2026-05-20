# KAIROS — Daily Brief
> Última actualização: 2026-05-20 | @Orion

---

## ESTADO DO SERVIDOR
- URL: https://kairoscheck.net
- Backend: Railway (Node.js) | Frontend: Vercel (Next.js — em rebuild)
- Stripe: **ACTIVO ✅** (charges_enabled: true — confirmado pelo CEO 2026-05-20)
- Tenants activos: 4

---

## O QUE FOI FEITO HOJE (2026-05-20)

### PASSO 1 — SKILLS: CONCLUÍDO ✅

**11 skills criadas** (uma por agente, estrutura nova com cérebro operacional):

| Skill | Agente | Função |
|---|---|---|
| kairos-orion | @Orion | Guardian 24/7, escriba, memória institucional |
| kairos-gage | @Gage | Deploy exclusivo — Railway + Vercel |
| kairos-quinn | @Quinn | QA lead — GO/BLOQUEADO, auditoria obrigatória |
| kairos-aria | @Aria | Architect — ADRs, decisões técnicas |
| kairos-dex | @Dex | Senior Engineer — código + testes |
| kairos-rex | @Rex | Security + GDPR — veto absoluto |
| kairos-uma | @Uma | Design Intelligence — animações, design system |
| kairos-sage | @Sage | Business model — unit economics, pricing |
| kairos-morgan | @Morgan | Growth — SEO, copy, distribuição PT+BR |
| kairos-hermes | @Hermes | Sales — pipeline, outreach, receita |
| kairos-oracle | @Oracle | Analytics — Company Score, Weekly Report |

**6 skills antigas arquivadas** em `.claude/skills/_archive/`:
  kairos-quality-gate, kairos-operator-rules, kairos-token-economy,
  kairos-stripe-billing-rules, kairos-design-system, kairos-conversion-design

**Melhorias das skills novas vs antigas:**
  ✅ Em PT-PT (antigas eram em inglês)
  ✅ CÉREBRO OPERACIONAL em cada skill (contexto completo da empresa)
  ✅ CEO Protocol integrado (formato de box obrigatório)
  ✅ Pasta KAIROS/ atribuída a cada agente
  ✅ O MEU PLANO (o que cada agente faz em cada Passo)
  ✅ Sem referências a AIOX, agentes antigos, sistemas obsoletos
  ✅ Arquitectura actualizada (Next.js, não mais vanilla)
  ✅ Stripe marcado como ACTIVO

**SPECS @Uma (Passo 1B) — PENDENTE:**
  10 docs de specs a criar com agent-browser:
  nextjs.md, shadcn.md, vercel.md, stripe.md, resend.md,
  claude-api.md, motion-animations.md, text-animations.md,
  design-systems.md, tailwind-animate.md
  → Guardar em KAIROS/03-ENGENHARIA/specs/
  → Requer sessão dedicada com agent-browser

---

## ESTADO DO REPOSITÓRIO (verificado por @Orion)

```
.claude/skills/ — 11 skills novas + 3 de sistema (architect-first, checklist-runner, etc.)
                  6 antigas em _archive/
.claude/agents/ — 11 agentes (orion, dex, quinn, gage, aria, uma, sage,
                   morgan, hermes, oracle, rex)
.claude/rules/  — kairos-constitution.md + ceo-protocol.md + outros
KAIROS/         — estrutura de 12 pastas (maioria vazia — a preencher nos Passos 2+)
packages/       — backend sagrado (não tocado)
```

---

## PRÓXIMO PASSO — PASSO 2: ESTRATÉGIA E NEGÓCIO

Antes de começar: CEO confirma.

Agenda:
  @Sage + @Morgan → definir:
    1. ICP detalhado PT+BR (quem são, qual a dor, onde estão)
    2. Pricing validado com dados de mercado
    3. Unit economics com números reais
    4. Go-to-market: 3 acções concretas nos próximos 30 dias
    5. Target: 1 cliente pagante antes do runway acabar

Paralelamente (pode correr antes do Passo 2):
  @Uma Passo 1B: specs de animações e design systems
  → Requer aprovação CEO antes de começar

---

## REGRAS QUE NUNCA MUDAM
- Só @Gage faz git push e vercel deploy
- @Quinn dá GO antes de qualquer deploy
- CEO confirma antes de cada fase
- @Orion é o primeiro de cada sessão
- Stripe ACTIVO — cada sessão tem de aproximar de €1 MRR
