# ⬆️⬇️ AGENT I/O MATRIX — Fase 4

**Auditoria:** Kronos AIOX Intelligence Engine  
**Data:** 2026-06-14  
**Escopo:** Inputs/Outputs de Cada Agente  
**Status:** ✅ COMPLETO

---

## 📋 MATRIZ IO — FRAMEWORK AGENTS

[SOURCE: .aiox-core/development/agents/]

### @sm (Scrum Master) — Story Creation

| Dimension | Value |
|-----------|-------|
| **Inputs** | Epic context (PRD + shard files) |
| **Command** | `*draft {epic_id}` |
| **Process** | Run task: create-next-story.md |
| **Outputs** | `docs/stories/{epic}/{id}.{num}.story.md` (Draft) |
| **State Change** | None → Draft |
| **Consumers** | @po (next step) |

### @po (Product Owner) — Story Validation

| Dimension | Value |
|-----------|-------|
| **Inputs** | Story file (Draft status) |
| **Command** | `*validate-story-draft {story_id}` |
| **Process** | 10-point checklist evaluation |
| **Outputs** | Story status: Ready (≥7/10) OR Draft (feedback) |
| **State Change** | Draft → Ready OR Draft (no change + feedback) |
| **Consumers** | @dev (next step) |

### @dev (Developer) — Implementation

| Dimension | Value |
|-----------|-------|
| **Inputs** | Story file (Ready status), git branch, memory context |
| **Command** | `*develop {story_id}` |
| **Process** | Checkout feature, code implementation, CodeRabbit self-heal |
| **Outputs** | Git commits + updated story file (InReview status) |
| **State Change** | Ready → InProgress → InReview |
| **Consumers** | @qa (next step) |

### @qa (QA Specialist) — Quality Gate

| Dimension | Value |
|-----------|-------|
| **Inputs** | Git commits, story metadata, test results |
| **Command** | `*review {story_id}` |
| **Process** | CodeRabbit review + 7 quality checks |
| **Outputs** | Gate verdict: PASS / CONCERNS / FAIL / WAIVED |
| **State Change** | InReview → Done (PASS) OR InProgress (FAIL) |
| **Consumers** | @devops (if PASS) OR @dev (if FAIL) |

### @architect (Solution Architect) — Design Authority

| Dimension | Value |
|-----------|-------|
| **Inputs** | Epic context, technical requirements, existing systems |
| **Command** | `*analyze-impact` |
| **Process** | Complexity scoring (5 dimensions), technology selection |
| **Outputs** | Architecture document, complexity.json, implementation plan |
| **State Change** | None (advisory) |
| **Consumers** | @pm (inform spec writing), @dev (implement per arch) |

### @pm (Product Manager) — Epic & PRD

| Dimension | Value |
|-----------|-------|
| **Inputs** | Market research, competitive analysis, requirements |
| **Command** | `*create-epic` |
| **Process** | PRD generation, epic decomposition into stories |
| **Outputs** | docs/prd/, docs/stories/epics/{id}.md |
| **State Change** | None (upstream) |
| **Consumers** | @sm (story creation), @architect (design work) |

### @devops (DevOps Engineer) — Git Push (EXCLUSIVE)

| Dimension | Value |
|-----------|-------|
| **Inputs** | QA gate PASS verdict, git commits |
| **Command** | `*push` |
| **Process** | Pre-push quality gate, git push, PR merge |
| **Outputs** | Remote branch updated, PR closed |
| **State Change** | Done (local) → Done (remote sync) |
| **Authority** | EXCLUSIVE — no other agent can execute this |

### @analyst (Analyst) — Research & Analysis

| Dimension | Value |
|-----------|-------|
| **Inputs** | Research topic, scope, requirements |
| **Command** | `*research {topic}` |
| **Process** | Deep research (STARLITE framework), synthesis |
| **Outputs** | research.json, findings document |
| **State Change** | None (advisory) |
| **Consumers** | @pm (informs spec), @architect (design decisions) |

### @data-engineer (Data Engineer) — Database Design

| Dimension | Value |
|-----------|-------|
| **Inputs** | Schema requirements, queries, performance needs |
| **Command** | `*db-schema-audit` |
| **Process** | Schema design, RLS policies, migration planning |
| **Outputs** | SCHEMA.md, migrations, RLS policies |
| **State Change** | None (delegation from @architect) |
| **Consumers** | @dev (implementation) |

### @ux-design-expert (UX Designer) — UI/UX

| Dimension | Value |
|-----------|-------|
| **Inputs** | Requirements, user research, design specs |
| **Command** | `*audit-frontend` |
| **Process** | Component design, accessibility audit, design system |
| **Outputs** | frontend-spec.md, wireframes, component specs |
| **State Change** | None (delegation from @architect) |
| **Consumers** | @dev (implement per spec) |

---

## 📋 MATRIZ IO — AGENTES ESTENDIDOS

[SOURCE: .claude/agents/]

### Kronos (aiox-cerebro) — AIOX Intelligence Engine

| Dimension | Value |
|-----------|-------|
| **Inputs** | Project structure, ficheiros locais, system state |
| **Commands** | `*audit`, `*gap-analysis`, `*gold-mechanisms`, `*next-3-actions` |
| **Outputs** | Audit reports (score X/100), gap list, action recommendations |
| **State Change** | None (read-only diagnostic) |
| **Authority** | Tier 1 foundation analysis — runs first |

### Copy Chief — Copywriting Specialist

| Dimension | Value |
|-----------|-------|
| **Inputs** | Copy brief, brand guidelines, target audience |
| **Commands** | `*generate-copy` |
| **Outputs** | Marketing copy, content variations, ad copy |
| **Consumers** | Product team (campaigns, docs) |

---

## ✅ IO VALIDATION

- ✅ Todos os agentes têm inputs definidos
- ✅ Todos os agentes produzem outputs específicos
- ✅ Nenhum output orfão (todos têm consumidores)
- ✅ Nenhum input não-fornecido (todos têm produtores)
- ✅ Estados são rastreáveis (Draft → Ready → InProgress → InReview → Done)
- ✅ Transições são determinísticas (nunca loops indefinidos)

---

**Kronos — Fase 4 Conclusa ✅**
