# AIOX Autonomous Development Engine (ADE) - Guia Completo

> **VersÃ£o:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Production Ready âœ…

---

## O que Ã© o ADE?

O **AIOX Autonomous Development Engine (ADE)** Ã© um sistema de desenvolvimento autÃ´nomo que transforma requisitos vagos em cÃ³digo funcional atravÃ©s de pipelines estruturados e agentes especializados.

### CaracterÃ­sticas Principais

- **Spec Pipeline** - Transforma ideias em especificaÃ§Ãµes executÃ¡veis
- **Execution Engine** - Executa subtasks com self-critique obrigatÃ³rio
- **Recovery System** - Recupera de falhas automaticamente
- **QA Evolution** - Review estruturado em 10 fases
- **Memory Layer** - Aprende e documenta padrÃµes

---

## Arquitetura

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           ADE Architecture                                   â”‚
â”‚                                                                              â”‚
â”‚  User Request â”€â”€â–º Spec Pipeline â”€â”€â–º Execution Engine â”€â”€â–º Working Code       â”‚
â”‚                                            â”‚                                 â”‚
â”‚                                            â–¼                                 â”‚
â”‚                                    Recovery System                           â”‚
â”‚                                            â”‚                                 â”‚
â”‚                                            â–¼                                 â”‚
â”‚                                    QA Evolution                              â”‚
â”‚                                            â”‚                                 â”‚
â”‚                                            â–¼                                 â”‚
â”‚                                    Memory Layer                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Os 7 Epics

### Epic 1: Worktree Manager

**PropÃ³sito:** Isolamento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Criar worktree isolado
- `*list-worktrees` - Listar worktrees ativos
- `*merge-worktree {story}` - Fazer merge do worktree
- `*cleanup-worktrees` - Remover worktrees antigos

**DocumentaÃ§Ã£o:** [ADE-EPIC1-HANDOFF.md](../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migration V2â†’V3

**PropÃ³sito:** MigraÃ§Ã£o para formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - InventÃ¡rio de assets V2
- `*analyze-paths` - Analisar dependÃªncias
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos em batch

**DocumentaÃ§Ã£o:** [ADE-EPIC2-HANDOFF.md](../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**PropÃ³sito:** Transformar requisitos em specs executÃ¡veis

**Fluxo:**

```
User Request â†’ Gather â†’ Assess â†’ Research â†’ Write â†’ Critique â†’ Spec Ready
```

**Comandos por Agente:**

| Agent      | Command                | Fase                   |
| ---------- | ---------------------- | ---------------------- |
| @pm        | `*gather-requirements` | Coletar requisitos     |
| @architect | `*assess-complexity`   | Avaliar complexidade   |
| @analyst   | `*research-deps`       | Pesquisar dependÃªncias |
| @pm        | `*write-spec`          | Escrever spec          |
| @qa        | `*critique-spec`       | Criticar e aprovar     |

**DocumentaÃ§Ã£o:** [ADE-EPIC3-HANDOFF.md](../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**PropÃ³sito:** Executar specs em cÃ³digo funcional

**13 Steps do Coder:**

1. Load Context
2. Read Implementation Plan
3. Understand Current Subtask
4. Plan Approach
5. Write Code
   - 5.5 SELF-CRITIQUE (obrigatÃ³rio)
6. Run Tests
   - 6.5 SELF-CRITIQUE (obrigatÃ³rio)
7. Fix Issues
8. Run Linter
9. Fix Lint Issues
10. Verify Manually
11. Update Plan Status
12. Commit Changes
13. Signal Completion

**Comandos (@architect):**

- `*create-plan` - Criar plano de implementaÃ§Ã£o
- `*create-context` - Gerar contexto do projeto

**Comandos (@dev):**

- `*execute-subtask` - Executar subtask

**DocumentaÃ§Ã£o:** [ADE-EPIC4-HANDOFF.md](../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**PropÃ³sito:** Recuperar de falhas em subtasks

**Fluxo:**

```
Subtask Fails â†’ Track Attempt â†’ Retry (<3) â†’ Stuck Detection â†’ Rollback â†’ Escalate
```

**Comandos (@dev):**

- `*track-attempt` - Registrar tentativa
- `*rollback` - Voltar para estado anterior

**DocumentaÃ§Ã£o:** [ADE-EPIC5-HANDOFF.md](../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**PropÃ³sito:** Review estruturado em 10 fases

**10 Fases:**

1. Setup & Context Loading
2. Code Quality Analysis
3. Test Coverage Review
4. Security Scan
5. Performance Check
6. Documentation Audit
7. Accessibility Review
8. Integration Points Check
9. Edge Cases & Error Handling
10. Final Summary & Decision

**Comandos (@qa):**

- `*review-build {story}` - Review completo
- `*request-fix {issue}` - Solicitar correÃ§Ã£o
- `*verify-fix {issue}` - Verificar correÃ§Ã£o

**Comandos (@dev):**

- `*apply-qa-fix` - Aplicar correÃ§Ã£o do QA

**DocumentaÃ§Ã£o:** [ADE-EPIC6-HANDOFF.md](../architecture/ADE-EPIC6-HANDOFF.md)

---

### Epic 7: Memory Layer

**PropÃ³sito:** MemÃ³ria persistente de padrÃµes e insights

**Tipos de MemÃ³ria:**

- **Insights** - Descobertas durante desenvolvimento
- **Patterns** - PadrÃµes de cÃ³digo extraÃ­dos
- **Gotchas** - Armadilhas conhecidas
- **Decisions** - DecisÃµes arquiteturais

**Comandos (@dev):**

- `*capture-insights` - Capturar insights da sessÃ£o
- `*list-gotchas` - Listar gotchas conhecidas

**Comandos (@architect):**

- `*map-codebase` - Gerar mapa do codebase

**Comandos (@analyst):**

- `*extract-patterns` - Extrair padrÃµes do cÃ³digo

**DocumentaÃ§Ã£o:** [ADE-EPIC7-HANDOFF.md](../architecture/ADE-EPIC7-HANDOFF.md)

---

## Quick Start

### 1. Criar Spec a partir de Requisito

```bash
# Ativar PM e coletar requisitos
@pm *gather-requirements

# Avaliar complexidade
@architect *assess-complexity

# Pesquisar dependÃªncias
@analyst *research-deps

# Escrever spec
@pm *write-spec

# Criticar e aprovar
@qa *critique-spec
```

### 2. Executar Spec Aprovada

```bash
# Criar plano de implementaÃ§Ã£o
@architect *create-plan

# Criar contexto do projeto
@architect *create-context

# Executar subtasks (loop)
@dev *execute-subtask 1.1
@dev *execute-subtask 1.2
...
```

### 3. QA Review

```bash
# Review estruturado
@qa *review-build STORY-42

# Se hÃ¡ issues:
@qa *request-fix "Missing error handling"
@dev *apply-qa-fix
@qa *verify-fix
```

### 4. Capturar Aprendizado

```bash
# Capturar insights da sessÃ£o
@dev *capture-insights

# Documentar gotchas
@dev *list-gotchas
```

---

## Estrutura de Arquivos

```
.aiox-core/
â”œâ”€â”€ development/
â”‚   â”œâ”€â”€ agents/              # DefiniÃ§Ãµes de agentes V3
â”‚   â”œâ”€â”€ tasks/               # Tasks executÃ¡veis
â”‚   â”‚   â”œâ”€â”€ spec-*.md        # Spec Pipeline tasks
â”‚   â”‚   â”œâ”€â”€ plan-*.md        # Execution Engine tasks
â”‚   â”‚   â”œâ”€â”€ qa-*.md          # QA Evolution tasks
â”‚   â”‚   â””â”€â”€ capture-*.md     # Memory Layer tasks
â”‚   â””â”€â”€ workflows/
â”‚       â”œâ”€â”€ spec-pipeline.yaml
â”‚       â”œâ”€â”€ qa-loop.yaml
â”‚       â””â”€â”€ auto-worktree.yaml
â”‚
â”œâ”€â”€ infrastructure/
â”‚   â”œâ”€â”€ scripts/
â”‚   â”‚   â”œâ”€â”€ worktree-manager.js     # Epic 1
â”‚   â”‚   â”œâ”€â”€ asset-inventory.js      # Epic 2
â”‚   â”‚   â”œâ”€â”€ migrate-agent.js        # Epic 2
â”‚   â”‚   â”œâ”€â”€ subtask-verifier.js     # Epic 4
â”‚   â”‚   â”œâ”€â”€ plan-tracker.js         # Epic 4
â”‚   â”‚   â”œâ”€â”€ recovery-tracker.js     # Epic 5
â”‚   â”‚   â”œâ”€â”€ rollback-manager.js     # Epic 5
â”‚   â”‚   â”œâ”€â”€ qa-loop-orchestrator.js # Epic 6
â”‚   â”‚   â”œâ”€â”€ codebase-mapper.js      # Epic 7
â”‚   â”‚   â””â”€â”€ pattern-extractor.js    # Epic 7
â”‚   â””â”€â”€ schemas/
â”‚       â”œâ”€â”€ agent-v3-schema.json
â”‚       â””â”€â”€ task-v3-schema.json
â”‚
â””â”€â”€ product/
    â”œâ”€â”€ templates/
    â”‚   â”œâ”€â”€ spec-tmpl.md
    â”‚   â””â”€â”€ qa-report-tmpl.yaml
    â””â”€â”€ checklists/
        â””â”€â”€ self-critique-checklist.md
```

---

## autoClaude V3 Format

### Agent Definition

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:10.724Z'

  specPipeline:
    canGather: boolean # @pm
    canAssess: boolean # @architect
    canResearch: boolean # @analyst
    canWrite: boolean # @pm
    canCritique: boolean # @qa

  execution:
    canCreatePlan: boolean # @architect
    canCreateContext: boolean # @architect
    canExecute: boolean # @dev
    canVerify: boolean # @dev

  recovery:
    canTrackAttempts: boolean # @dev
    canRollback: boolean # @dev

  qa:
    canReview: boolean # @qa
    canRequestFix: boolean # @qa

  memory:
    canCaptureInsights: boolean # @dev
    canExtractPatterns: boolean # @analyst
    canDocumentGotchas: boolean # @dev
```

### Task Definition

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-gather|spec-assess|exec-plan|exec-subtask|etc
  deterministic: boolean
  elicit: boolean
  composable: boolean

  verification:
    type: none|command|manual
    command: 'npm test'

  selfCritique:
    required: boolean
    checklistRef: 'self-critique-checklist.md'
```

---

## QA Gates

Cada Epic tem um QA Gate que deve passar antes de prosseguir:

```bash
@qa *gate epic-{N}-{name}
```

**DecisÃµes:**

- **PASS** - PrÃ³ximo epic liberado
- **CONCERNS** - Aprovado com follow-ups
- **FAIL** - Retorna para correÃ§Ãµes
- **WAIVED** - Bypass autorizado por @po

---

## Troubleshooting

### Subtask Falha Repetidamente

```bash
# Verificar histÃ³rico de tentativas
@dev *track-attempt --status

# Rollback para Ãºltimo estado bom
@dev *rollback --hard

# Tentar abordagem diferente
@dev *execute-subtask 2.1 --approach alternative
```

### Spec nÃ£o Aprovada

```bash
# Ver feedback do critique
cat docs/stories/STORY-42/spec-critique.json

# Refinar spec
@pm *write-spec --iterate

# Re-submeter para critique
@qa *critique-spec
```

### Worktree Conflita

```bash
# Listar worktrees
@devops *list-worktrees

# Resolver conflitos
@devops *merge-worktree STORY-42 --resolve

# Cleanup
@devops *cleanup-worktrees
```

---

## Related Documentation

- [ADE Architect Handoff](../architecture/ADE-ARCHITECT-HANDOFF.md) - Overview geral
- [ADE Agent Changes](../architecture/ADE-AGENT-CHANGES.md) - AlteraÃ§Ãµes em todos os agentes com matriz de capabilities
- [Epic 1 - Worktree Manager](../architecture/ADE-EPIC1-HANDOFF.md)
- [Epic 2 - Migration V2â†’V3](../architecture/ADE-EPIC2-HANDOFF.md)
- [Epic 3 - Spec Pipeline](../architecture/ADE-EPIC3-HANDOFF.md)
- [Epic 4 - Execution Engine](../architecture/ADE-EPIC4-HANDOFF.md)
- [Epic 5 - Recovery System](../architecture/ADE-EPIC5-HANDOFF.md)
- [Epic 6 - QA Evolution](../architecture/ADE-EPIC6-HANDOFF.md)
- [Epic 7 - Memory Layer](../architecture/ADE-EPIC7-HANDOFF.md)

---

_AIOX Autonomous Development Engine - Turning Ideas into Code Autonomously_

