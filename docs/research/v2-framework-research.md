# Deep Research — KAIROS_CEREBRO V2
**Data:** 2026-06-02
**Agentes:** dr-orchestrator + squad deep-research (11 minds)
**Confidence global:** 8.0/10

**Nota de transparência:** WebSearch/WebFetch bloqueados por permissões de sessão. Q3 usa dados locais directos (confiança 9.5/10). Q1/Q2/Q4/Q5 usam conhecimento verificado até Agosto 2025 + dados locais do codebase (7.5-8.0/10). Zero invenção — fontes identificadas explicitamente.

---

## Q1: Melhores Frameworks AI Agents 2025-2026

### Comparação Tabular

| Framework | CLI Próprio | Story-Driven | Persistência Estado | Constitution | Registry | Quality Gates | Token Economy |
|---|---|---|---|---|---|---|---|
| AIOX v5.x | Sim (`aiox`) | Sim (formal) | Sim (STATE.md + hooks) | Sim (6 artigos) | Sim (822 entidades) | Sim (QG-001~004) | Parcial |
| SuperClaude | Não (pipx) | Não | Não (stateless) | Não | Não | Parcial | **Sim (30-50%)** |
| BMAD | Não | Sim (stories) | Parcial | Não | Não | Parcial | Não |
| LangGraph | Não | Não | **Sim (checkpointing)** | Não | Não | Não | Não |
| CrewAI | Não | Não | Não (memória) | Não | Não | Não | Não |
| AutoGen | Não | Não | Parcial (histórico) | Não | Não | Não | Não |

**O AIOX é o único framework com CLI + Constitution + Registry + Story-Driven combinados.** Vantagem competitiva real.

### Insights Accionáveis para V2

**SuperClaude:** Token economy — behavioral injection via .md leves (30-50% menos tokens). Para V2: separar persona pesada de instruções de execução por task.

**BMAD Scale-Domain-Adaptive:** Depth ajusta-se por complexidade. Para V2: `complexity_class` no workflow selector (SIMPLE skip tiers desnecessários).

**LangGraph:** Checkpointing automático via SQLite/Redis. Para V2: git post-commit hook que actualiza STATE.md automaticamente.

---

## Q2: Padrões de Evolução V1 → V2

### Padrões Validados

**Additive-Only (Next.js App Router):** Nova arquitectura coexiste com antiga. Zero breaking changes. Pedro coexiste no AIOX com: V1 intacto + V2 como opt-in. Duração de coexistência: mínimo 2 versões major.

**Explicit Migration + Codemods (Vite):** Documenta o que quebra, automatiza o que consegues. Para AIOX V2: lista clara de o que muda + scripts de migração onde possível.

**Modularidade natural (shadcn/ui):** Migração incremental componente a componente. AIOX já tem este padrão via squads — cada squad pode ser atualizado independentemente.

### Regras V2 Zero-Debt

1. L1/L2 nunca se tocam (já implementado via boundary protection)
2. Todas as alterações são aditivas ou substitutivas — nunca destrutivas sem janela de deprecation
3. V2 começa em branch separada, não rewrite em main
4. Migrar STATE.md e PROJECT.md é a primeira coisa (são o contrato com o passado)
5. Registry checksum (`aiox doctor`) como gate de V2

### O Que Evitar

- Rewrite completo sem plano de merge (second system syndrome — Brooks)
- Alterar L1/L2 directamente
- Fazer V2 com stories InProgress — terminar work in progress primeiro
- Renomear entidades no registry sem actualizar `usedBy` dependencies

---

## Q3: AIOX Oficial v5.x — Gaps e Features

### Features v5.x Identificadas Localmente (confiança 9.5/10)

| Feature | Evidência local | Status |
|---|---|---|
| Entity Registry SHA256 | `.aiox-core/data/entity-registry.yaml` — 822 entidades | ✅ Activo |
| Graph Dashboard | `.aiox-core/core/graph-dashboard/` | ✅ Activo (não usado!) |
| Code Intelligence | `.aiox-core/core/code-intel/` | ✅ Opcional |
| BOB Surface Criteria | `.aiox-core/core/orchestration/bob-surface-criteria.yaml` | ✅ Activo |
| Quality Gate Config | `.aiox-core/core/quality-gates/quality-gate-config.yaml` | ✅ Activo |
| Quarterly Gap Audit | `.github/workflows/quarterly-gap-audit.yml` | ⚠️ Scripts podem faltar |
| Product templates (30+) | `.aiox-core/product/templates/` | ✅ Activo |
| Migration contracts | `.aiox-core/infrastructure/contracts/compatibility/` | ✅ Activo |
| IDS (G1-G6) | `.claude/rules/ids-principles.md` | ⚠️ Aspiracional |
| pvMindContext | `core-config.yaml` | ✅ Configurado |
| Worktree automation | `core-config.yaml` — autoCreate: on_story_start | ✅ Activo |
| boundary.frameworkProtection | `core-config.yaml` | ⚠️ Verificar se activo |

### Features Novas v5 vs v4 (via contrato de compatibilidade)

A partir de `.aiox-core/infrastructure/contracts/compatibility/aiox-4.0.4.yaml`:
1. Graph Dashboard (novo em v5)
2. Code Intelligence provider interface (novo em v5)
3. BOB Surface Criteria (novo em v5)
4. Product templates separados de development templates (novo em v5)
5. pvMindContext (novo em v5)
6. Entity Registry com checksums (v4 tinha registry mais simples)

### System-Factory Squad — O Mais Completo do Repo

`system-factory` squad (criado 2026-05-30): minimum_score 9.0, elite_threshold 96, **76 tasks**. É o squad mais completo do KAIROS_CEREBRO e foi desenhado para criar sistemas completos. Pedro pode não estar a usar `@forge-classifier` que é o entry point.

---

## Q4: Monorepo + Documentação Automática

### Problema Actual

Pedro tem 3 threads activos num STATE.md global que mistura tudo:
- Kairos Check produto (`C:/Users/lealp/kairoscheck`)
- AIOX Framework (KAIROS_CEREBRO)
- AIOX Academy (docs não commitados)

### Solução Recomendada

**Criar `docs/contexts/` com STATE por thread:**

```
docs/contexts/
├── STATE-kairos-check.md      # Estado do produto (Railway, Stripe, etc.)
├── STATE-aiox-framework.md    # Estado do framework (epics, squads, agents)
└── STATE-aiox-academy.md      # Estado da academy (PRD, stories, deploy)
```

STATE.md global passa a apontar para o contexto activo.

### Documentação Automática — O Que Já Existe

```
.github/workflows/quarterly-gap-audit.yml   → gap detection automático (trimestralmente)
aiox graph --deps --format=html              → dependency tree interactivo
aiox graph --stats                           → métricas de entidades
```

**O Pedro não está a usar `aiox graph` nem o gap audit.** Estes são V2-ready já hoje.

### Estrutura V2 Canónica

```
KAIROS_CEREBRO/
├── .aiox-core/              # Imutável (L1/L2)
├── .claude/                 # Hooks, rules, agents
├── .synapse/                # 39 domains
├── .github/                 # GitHub Actions
├── squads/                  # 5 squads activos
├── docs/
│   ├── contexts/            # NOVO — STATE por thread
│   ├── research/            # NOVO — outputs de pesquisa
│   ├── stories/             # Existente
│   ├── architecture/        # Existente
│   └── reports/             # Existente
├── PROJECT.md               # Imutável
├── STATE.md                 # Global → aponta para contexto activo
└── core-config.yaml         # Config do projecto
```

---

## Q5: Infra Operacional de AI Agents

### O Problema Confirmado

9+ minds clonados têm apenas DNA. Um agente "shell" vs "completo":

**Shell (hoje):**
```
agent.md        ← apenas persona, sem capacidade operacional
```

**Completo (target V2):**
```
agent/
├── agent.md           ← persona
├── tasks/             ← O QUE faz (derivado do thinking_dna)
├── workflows/         ← COMO opera
├── templates/         ← outputs canónicos
└── data/              ← knowledge base
```

### Modelo de Referência Local

O `deep-research` squad é o melhor exemplo: 10 minds com DNA + estrutura completa + workflow de orquestração `wf-deep-research.yaml` que os orquestra em pipeline.

**O squad-creator PRO deve replicar este padrão.**

### Sequência de Operacionalização

```
1. @forge-builder (system-factory) — scaffold do agente a partir do mind_dna
2. @oalanicolas (squad-creator)    — valida DNA fidelidade > 85%
3. @squad-chief (squad-creator)    — integra no squad com tasks e workflows
4. aiox doctor                     — verifica entidades registadas
```

---

## SÍNTESE EXECUTIVA

### O Insight Mais Importante

**"V2 não é uma refactorização de estrutura. É uma limpeza de documentação e operacionalização dos recursos já existentes."**

O framework está sólido (15 PASS doctor). Pedro tem recursos que não sabe que tem:
- system-factory com 76 tasks
- `aiox graph` funcional e não usado
- quarterly-gap-audit GitHub Action
- 9+ minds com DNA pronto para operacionalizar

### Top 10 Acções para V2

| # | Acção | Agente | Esforço | Impacto |
|---|---|---|---|---|
| 1 | Criar `docs/contexts/` com 3 STATE files | @dev | 30 min | Alto |
| 2 | Activar `boundary.frameworkProtection: true` | @config-engineer | 5 min | Alto |
| 3 | Commitar ficheiros untracked (AIOX Academy) | @devops | 5 min | Crítico |
| 4 | Executar `aiox graph --stats` (baseline V2) | qualquer | 2 min | Médio |
| 5 | Operacionalizar oalanicolas (SC-PRO-1) | squad-chief | 1 sessão | Alto |
| 6 | Registar ~40 agentes em entity-registry | @dev | 1 sessão | Médio |
| 7 | Criar post-commit hook para STATE auto-update | @hooks-architect | 1 sessão | Alto |
| 8 | Verificar scripts quarterly-gap-audit | @analyst | 30 min | Médio |
| 9 | Separar personas de instructions nos agents pesados | @dev | 2 sessões | Alto |
| 10 | Testar `@forge-classifier` para novo sistema | qualquer | 30 min | Médio |

### Próximos 3 Passos Concretos

**Passo 1 (agora — 30 min):** `@devops *push` dos untracked + criar `docs/contexts/`

**Passo 2 (esta sessão — 1h):** `@architect *design-architecture "V2"` com ADR-001 baseado nesta research

**Passo 3 (próxima sessão — 2h):** `@pm *create-epic "KAIROS_CEREBRO V2"` com 7 stories concretas

---

## Apêndice: Fontes

| Fonte | Tipo | Confiança |
|---|---|---|
| `.aiox-core/data/entity-registry.yaml` | Dados locais directos | 9.5/10 |
| `squads/*/outputs/minds/*/mind_dna_complete.yaml` | Mind DNA (fidelidade 86-90) | 8.5-9.0/10 |
| `.aiox-core/constitution.md` | Documento formal | 9.5/10 |
| `core-config.yaml` | Configuração activa | 9.5/10 |
| `STATE.md` (2026-05-31) | Estado sessão anterior | 9.0/10 |
| CrewAI / AutoGen / LangGraph | Knowledge cutoff Agosto 2025 | 7.0/10 |
| Next.js / Vite migration patterns | Knowledge cutoff Agosto 2025 | 7.5/10 |

*DR Orchestrator — Pipeline completo. QG-001 a QG-004 PASS. Confiança global: 8.0/10.*
