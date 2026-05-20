# KAIROS HYPERDRIVE — Relatório de Bootstrap (Fase 0)
> @Orion + @Aria | 2026-05-20 | Auditoria completa antes de qualquer código

---

## SUMÁRIO EXECUTIVO

O HYPERDRIVE foi concebido para uma base que é mais avançada do que o documento pressupunha.
Várias "fases" do documento já estão concluídas. O motor pode avançar mais rapidamente.
**Aguarda confirmação CEO antes da Fase 1.**

---

## 1. ESTADO REAL DO REPOSITÓRIO (verificado agora)

### O que já existe (que o documento HYPERDRIVE não sabia)

```
✅ packages/web/         — Next.js scaffold COMPLETO
   (Next.js 16.2.6, TypeScript, Tailwind v3, Framer Motion 12,
    Geist fonts, shadcn/ui, Zustand, App Router)
   → Fase 6 do HYPERDRIVE (Scaffold Frontend) = JÁ FEITA

✅ KAIROS/03-ENGENHARIA/adr/    — 11 ADRs aprovados
   ADR-001 a ADR-011 (TypeScript, Tailwind, State, Ficheiros,
   RSC Boundaries, Auth, SEO, Performance, API Contracts, GSAP, UI States)

✅ KAIROS/03-ENGENHARIA/specs/  — 16 specs verificadas
   OPERATIONAL_SYSTEM_COMPLETE.md, DESIGN_BRIEF, backgrounds-premium,
   browser-extension-v2, claude-api, competitive-advantage, design-systems,
   intelligent-components, motion-animations, nav-hover-intelligence,
   nextjs, resend, shadcn, stripe, tailwind-animate, text-animations, vercel

✅ KAIROS/02-PRODUTO/PLANO_MESTRE.md — síntese de toda a pesquisa
   TAM $54.61B, Brasil chargeback 3.55%, distribuição PT+BR mapeada

✅ .claude/skills/kairos-*  — 11 skills operacionais com cérebro real
   kairos-aria, kairos-dex, kairos-gage, kairos-hermes, kairos-morgan,
   kairos-oracle, kairos-orion, kairos-quinn, kairos-rex, kairos-sage, kairos-uma

✅ 214/214 testes PASS (verificado esta sessão)
✅ Stripe ACTIVO (charges_enabled: true)
✅ 4 tenants activos em produção
```

### O que NÃO existe (HYPERDRIVE precisa de criar)

```
❌ packages/hyperdrive/           — motor de orquestração
❌ .claude/memory/                — ledger + snapshots + knowledge graph
❌ scripts/hyperdrive/            — ferramentas de execução
❌ .claude/commands/kairos-hyperdrive.md  — comando CLI
```

---

## 2. OS 11 AGENTES — CAPACIDADES REAIS

*(Lidas dos ficheiros em .claude/agents/ e .claude/skills/kairos-*/SKILL.md)*

| Agente | Papel REAL (ficheiro) | Fundadores | Skill |
|--------|----------------------|-----------|-------|
| @Orion | Repository Guardian + Escriba 24/7 | Ray Dalio | kairos-orion |
| @Dex | Senior Engineer — código, nunca push | Collison + Musk | kairos-dex |
| @Quinn | QA Lead — GO/BLOQUEADO | Collison | kairos-quinn |
| @Gage | DevOps — único com deploy | Musk | kairos-gage |
| @Aria | Principal Architect — ADRs, decisões | Naval + Helmer | kairos-aria |
| @Uma | Design Intelligence — animações, sistema | Karri + Chesky | kairos-uma |
| @Sage | Business Architect — unit economics | Buffett + Helmer | kairos-sage |
| @Morgan | Growth Lead — SEO, copy, PT+BR | Collison + Karri | kairos-morgan |
| @Hermes | Sales & Revenue — pipeline, outreach | Flávio Augusto | kairos-hermes |
| @Oracle | Analytics — Company Score, reports | Buffett + Dalio | kairos-oracle |
| @Rex | Security + GDPR — veto absoluto | Buffett | kairos-rex |

**DIVERGÊNCIA DO DOCUMENTO HYPERDRIVE:**
O documento propõe Morgan=arquitectura, Oracle=estratégia, Sage=wisdom+tiebreaker.
**Estes papéis NÃO se aplicam — os ficheiros reais prevalecem.**
Em HYPERDRIVE, para consenso sénior: **@Sage + @Oracle + @Aria** (não Morgan+Oracle+Sage).

---

## 3. REGRAS VIGENTES (verificadas)

```
.claude/rules/:
  kairos-constitution.md  v1.1 ✅ (lei suprema, carrega automaticamente)
  ceo-protocol.md         v1.0 ✅ (196 linhas — checkpoints obrigatórios)
  agent-authority.md      v1.0 ✅ (autoridades exclusivas por agente)
  anti-hallucination.md   v1.0 ✅ (zero invenção)
  git-gate.md             v1.0 ✅ (só @Gage faz push)
  pre-flight-tools.md     v1.0 ✅ (comandos correctos Windows/Bash)
  coderabbit-integration.md v1.0 ✅
```

---

## 4. DISCREPÂNCIAS DOCUMENTO HYPERDRIVE vs REALIDADE

| Item no Documento | Realidade | Acção |
|-------------------|-----------|-------|
| "Scaffold Frontend (Fase 6)" | packages/web/ JÁ EXISTE | Fase 6 = SKIP |
| ".aiox-core/ legacy — mover" | JÁ REMOVIDO em Passo 0 | Fase 8 depreciação = SKIP |
| "Sem ADRs existentes" | 11 ADRs em KAIROS/03-ENGENHARIA/adr/ | Numerar a partir de ADR-012 |
| Agent roles (Morgan=arq, etc.) | Seguir ficheiros reais | Consenso: @Sage+@Oracle+@Aria |
| Scripts legacy no package.json | 6 scripts referem .aiox-core/ removido | Limpar no package.json |

### Scripts legacy a remover do package.json raiz

```
"lint:upstream"        → referencia .aiox-core/ removido
"typecheck:upstream"   → referencia .aiox-core/ removido
"test:upstream"        → referencia .aiox-core/ removido
"sync:ide"             → referencia .aiox-core/ removido
"sync:ide:check"       → referencia .aiox-core/ removido
"sync:skills:codex"    → referencia .aiox-core/ removido
"sync:skills:codex:global" → referencia .aiox-core/ removido
"validate:agents"      → referencia .aiox-core/ removido
```

---

## 5. MILESTONE ACTUAL (passos do rebuild)

```
Passo 0: Preparação              ✅ CONCLUÍDO (commit 531be71)
Passo 1: Skills + Specs          ✅ CONCLUÍDO (11 skills + 16 specs)
Pré-P2:  Limpeza + testes        ✅ CONCLUÍDO (commit 4595b6b)
Passo 2: Estratégia e negócio    ✅ CONCLUÍDO (Company Score 57/100)
Passo 3: Design System           ← EM CURSO (@Uma — next)
Passo 4: Arquitectura frontend   ✅ CONCLUÍDO (11 ADRs, commit ea046c3)
Passo 5: Implementação           ⬜ PENDENTE (@Dex)
Passo 6: Backend + deploy        ⬜ PENDENTE
```

---

## 6. CONFIGURAÇÃO HYPERDRIVE — LIVE MODE ECONÓMICO

```env
# .env.example — adicionar estas variáveis
KAIROS_LIVE=1
KAIROS_ANTHROPIC_API_KEY=           # Pedro preenche
KAIROS_MODEL_SENIOR=claude-opus-4-7     # @Sage+@Oracle+@Aria (consenso)
KAIROS_MODEL_EXECUTOR=claude-sonnet-4-6 # @Dex+@Quinn+@Uma+@Rex+@Morgan+@Hermes
KAIROS_MODEL_UTILITY=claude-haiku-4-5   # @Gage+@Orion
KAIROS_PROMPT_CACHE=1               # 90% desconto em rules/profiles
KAIROS_TASK_BUDGET_USD=2            # aviso por task
KAIROS_TASK_HARD_STOP_USD=3         # stop por task
KAIROS_MONTHLY_BUDGET_USD=20        # hard stop mensal
```

---

## 7. RISCOS IDENTIFICADOS

```
RISCO 1 — MÉDIO: packages/web/ tem código legado
  O web/ foi scaffolded mas pode ter componentes do design antigo.
  @Uma deve auditar antes de @Dex implementar Passo 3.

RISCO 2 — BAIXO: package.json tem scripts mortos (.aiox-core refs)
  Não bloqueiam nada mas são confusão. @Dex limpa no início da Fase 1.

RISCO 3 — ALTO: €0 MRR com 45 dias runway
  HYPERDRIVE deve correr em paralelo com @Hermes (outreach).
  Não pode bloquear a receita.

RISCO 4 — BAIXO: Numerar novos ADRs a partir de ADR-012
  Para não colidir com os 11 existentes.
```

---

## 8. PLANO DE EXECUÇÃO ADAPTADO (Fases 1-7)

*(Fase 0 = este relatório | Fase 6 e Fase 8 parcial = SKIP)*

```
FASE 1 — Infraestrutura Base (Prioridade: ALTA)
  @Dex + @Aria
  - Limpar scripts mortos do package.json raiz
  - Criar packages/hyperdrive/ (zero-dep, package.json minimalista)
  - Criar .claude/memory/ (Ledger + Snapshot + KG)
  - Adicionar scripts hyperdrive ao package.json raiz
  ↓ CEO confirma

FASE 2 — Ferramentas (Prioridade: ALTA)
  @Dex
  - Criar scripts/hyperdrive/hyper-diagnose.js
  - Criar scripts/hyperdrive/isolated-validate.js
  - Criar scripts/hyperdrive/infra-lock.js
  - Smoke test: npm run kairos:validate
  ↓ CEO confirma

FASE 3 — Orquestrador LIVE (Prioridade: ALTA)
  @Dex + @Aria
  - packages/hyperdrive/src/orchestrator.js
  - packages/hyperdrive/src/router.js
  - Consenso sénior: @Sage + @Oracle + @Aria (não Morgan+Oracle+Sage)
  - LIVE MODE desde início (com budget $3/task)
  ↓ CEO confirma

FASE 4 — Red Team (Prioridade: ALTA)
  @Dex + @Quinn + @Rex
  - packages/hyperdrive/src/redteam/
  - @Quinn: race conditions, edge cases, Stripe/Resend
  - @Rex: segurança, GDPR, secrets — (não @Aria que é architect)
  ↓ CEO confirma

FASE 5 — Interface CLI + Dashboard (Prioridade: MÉDIA)
  @Dex + @Uma (dashboard ANSI)
  - .claude/commands/kairos-hyperdrive.md
  - Dashboard ANSI em tempo real
  ↓ CEO confirma

FASE 6 — SKIP (packages/web/ já existe)

FASE 7 — Anthropic API + Prompt Caching (Prioridade: ALTA)
  @Dex + @Aria
  - packages/hyperdrive/src/providers/anthropic.js
  - Token accounting + budget enforcement
  - Prompt caching (rules + profiles = 90% off)
  ↓ CEO confirma

FASE 8 — Relatório Final + ADR-012
  @Orion + @Aria
  - ADR-012 em KAIROS/03-ENGENHARIA/adr/
  - Relatório final em KAIROS/11-CONHECIMENTO/sessoes/
  - .env.example actualizado
  ↓ CEO confirma
```

---

## PAUSA OBRIGATÓRIA — AGUARDA CEO

Esta é a única paragem obrigatória antes de qualquer código.

```
RESUMO DO QUE ENCONTRÁMOS:
  ✅ Muito mais feito do que o documento pressupunha
  ✅ Fases 6 e 8 parcial = SKIP (já feitas)
  ✅ 11 agentes com skills reais e operacionais
  ✅ 11 ADRs + 16 specs existentes
  ⚠️ Papéis de consenso ajustados: @Sage+@Oracle+@Aria
  ⚠️ Scripts mortos no package.json a limpar
  ⚠️ €0 MRR — HYPERDRIVE em paralelo com @Hermes

CEO: approvas o plano adaptado?
     Confirmas que @Dex avança para Fase 1?
```
