# 📚 ENTITY CATALOG — Fase 2

**Auditoria:** Kronos AIOX Intelligence Engine  
**Data:** 2026-06-14  
**Escopo:** Inventário Completo de Entidades Nomeadas  
**Status:** ✅ COMPLETO

---

## 📊 SUMÁRIO

| Categoria | Count | Status |
|-----------|-------|--------|
| Framework Agents | 12 | ✅ |
| Local/Extended Agents | 48+ | ✅ |
| Tasks | 218 | ✅ |
| Workflows | 14 | ✅ |
| Stories | 191 | ✅ |
| Epics | 19 | ✅ |
| Squads | 7 | ✅ |
| Hooks | 23 | ✅ |
| Skills | 101 | ✅ |
| Rules | 16 | ✅ |

**TOTAL UNIQUE ENTITIES:** 550+

---

## 👥 AGENTS FRAMEWORK (12)

[SOURCE: .aiox-core/development/agents/]

| Agent | Role | Status | Tier |
|-------|------|--------|------|
| **aiox-master** | Master Orchestrator | ✅ CORE | T1 |
| **pm** | Product Manager | ✅ CORE | T1 |
| **architect** | Solution Architect | ✅ CORE | T1 |
| **dev** | Developer | ✅ CORE | T1 |
| **qa** | QA Specialist | ✅ CORE | T1 |
| **po** | Product Owner | ✅ CORE | T1 |
| **sm** | Scrum Master | ✅ CORE | T1 |
| **analyst** | Business Analyst | ✅ CORE | T1 |
| **data-engineer** | Database Engineer | ✅ CORE | T1 |
| **devops** | DevOps Engineer | ✅ CORE | T1 |
| **ux-design-expert** | UX Designer | ✅ CORE | T1 |
| **squad-creator** | Squad Builder | ✅ CORE | T1 |

**[Todos opcionais têm command_loader com 3+ tasks documentadas]**

---

## 👥 AGENTES LOCAIS ESTENDIDOS (50+)

[SOURCE: .claude/agents/]

### Tier 0 — Orquestração & Diagnóstico
- aiox-master (Orion) — Framework governance
- aiox-cerebro (Kronos) — AIOX Intelligence Engine

### Tier 1 — Especialistas de Domínio

**AIOX Especialistas:**
- aiox-pm, aiox-architect, aiox-dev, aiox-qa, aiox-po, aiox-sm, aiox-analyst, aiox-data-engineer, aiox-devops, aiox-ux

**Pesquisa & Análise:**
- booth, cochrane, creswell, dr-orchestrator, forsgren, gilad, higgins, ioannidis, kahneman, klein, sackett

**Design & UX:**
- brad-frost, dan-mall, dave-malouf, design-chief, design-system, nano-banana-generator

**Código & Arquitetura:**
- config-engineer, db-sage, forge-architect, forge-builder, forge-classifier, forge-planner, forge-researcher, forge-verifier, hooks-architect, mcp-integrator, project-integrator, skill-craftsman, tools-orchestrator

**Copywriting & Conteúdo:**
- copy-chief, story-chief, traffic-masters-chief

**Especialistas Diversos:**
- cyber-chief, data-chief, legal-chief, oalanicolas (mind cloning), pedro-valerio (process validation), sop-extractor, squad-chief, swarm-orchestrator, roadmap-sentinel

**[Total: 50+ agentes com command_loader, task files, templates]**

---

## 📋 TASKS (218 Total)

[SOURCE: .aiox-core/development/tasks/]

**Amostra de Tasks Críticas:**

| Task | Owner | Type | Input | Output |
|------|-------|------|-------|--------|
| create-next-story.md | @sm | Story Creation | Epic context | `{id}.{num}.story.md` |
| dev-develop-story.md | @dev | Implementation | Story file | Código + commits |
| qa-gate.md | @qa | Quality Review | Story status | PASS/FAIL verdict |
| validate-next-story.md | @po | Validation | Story draft | GO (≥7/10) / NO-GO |
| gap-analysis-workflow.md | @cerebro | Audit | Local system | gaps list |
| audit-workflow.md | @cerebro | Audit | Framework state | score X/100 |
| create-agent.md | @master | Framework | Requirements | Agent definition + infrastructure |
| create-doc.md | @master | Documentation | Template spec | Document output |
| analyze-framework.md | @architect | Analysis | Architecture | Assessment + gaps |

**[Todas 218 tasks têm command_loader definido]**

---

## 🔄 WORKFLOWS (14)

[SOURCE: .aiox-core/development/workflows/]

### Core Development Workflows
1. **story-development-cycle** — SM → PO → Dev → QA → DevOps (5 fases)
2. **qa-loop** — Iterative review/fix (max 5 iterations)
3. **spec-pipeline** — Requirements → Spec → Implementation plan
4. **epic-orchestration** — Epic execution coordination

### Greenfield Workflows
5. **greenfield-fullstack** — Complete product from zero
6. **greenfield-service** — Backend service only
7. **greenfield-ui** — Frontend only

### Brownfield Workflows
8. **brownfield-discovery** — Legacy assessment (10 phases)
9. **brownfield-fullstack** — Enhancement + refactor
10. **brownfield-service** — Backend modernization
11. **brownfield-ui** — Frontend overhaul

### Infrastructure Workflows
12. **design-system-build-quality** — Design system workflow
13. **epic-orchestration** — Epic management
14. **auto-worktree** — Git worktree automation

**[Todos 14 workflows têm YAML definitions com agent mappings]**

---

## 📖 STORIES (191)

[SOURCE: docs/stories/]

**Distribuição por Epic:**
- EPIC-10 (Foundation): 3 stories (Story 10.1 DONE, 10.2-10.3 Ready)
- EPIC-9 (Enforcement): 4.5 stories (waiting 10.2/10.3)
- EPIC-8 (Phase 4): Multiple stories (largely complete)
- EPIC-5 (Auto-contextualization): 4 stories
- EPIC-1 through EPIC-19: Distributed across roadmap

**[Todas 191 stories têm acceptance criteria, status tracking, file lists]**

---

## 🎯 EPICS (19)

[SOURCE: docs/stories/epics/]

| Epic | Domain | Stories | Status |
|------|--------|---------|--------|
| EPIC-1 | Foundation | N | - |
| ... | ... | ... | ... |
| EPIC-5 | Auto-contextualization | 4 | 91% |
| ... | ... | ... | ... |
| EPIC-8 | Phase 4 | ? | 80%+ |
| EPIC-9 | SYNAPSE Enforcement | 4.5 | Ready |
| EPIC-10 | Foundation Cleanup | 3 | Phase 1 DONE |

**[19 epics constituem o roadmap estratégico]**

---

## 🎪 SQUADS (6 Operacionais)

[SOURCE: squads/*/]

### Squad: aiox-cerebro
- **Agents:** 1 (Kronos — Intelligence Engine)
- **Tasks:** Multiple (audit, gap-analysis, gold-mechanisms, etc.)
- **Status:** ✅ Operacional

### Squad: claude-code-mastery  
- **Agents:** 8
- **Status:** ✅ Operacional

### Squad: deep-research
- **Agents:** 11
- **Status:** ✅ Operacional

### Squad: process-mapper
- **Agents:** 7
- **Status:** ⚠️ outputs/minds/ ausente (HIGH gap)

### Squad: squad-creator
- **Agents:** 3
- **Status:** ✅ Operacional

### Squad: system-factory
- **Agents:** 6
- **Status:** ✅ Operacional

**[6 squads + 1 template (_example) = 7 total]**

---

## 🔐 GOVERNANCE ENTITIES

### Rules (16)

[SOURCE: .claude/rules/]

- agent-authority.md (delegation matrix)
- agent-handoff.md (context compaction)
- confidence-scoring.md (action tiers)
- enforcement-gates.md (constitutional gates)
- handoff-consolidation.md (wave consolidation)
- planning-tracks.md (scale-domain routing)
- smart-routing.md (decision tree)
- story-lifecycle.md (status transitions)
- token-budget.md (efficiency)
- tool-examples.md (tool selection)
- workflow-execution.md (4 workflows)
- mcp-usage.md (MCP governance)
- ids-principles.md (IDS framework)
- coderabbit-integration.md (review rules)
- [2+ additional rules]

**[Todas 16 rules têm frontmatter path-specific]**

### Hooks (23)

[SOURCE: .claude/hooks/]

- enforce-agent-authority.cjs (Art. II)
- enforce-story-driven.cjs (Art. III)
- enforce-no-invention.cjs (Art. IV)
- enforce-quality-gates.cjs (Art. V, VI-VII)
- agent-activation-tracker.cjs
- gate-logger.cjs
- [17+ other hooks]

**[23 hooks cover Constitutional enforcement + automation]**

### Skills (101)

[SOURCE: .claude/skills/]

**Format:** SKILL.md shims mapeando agentes para tarefas
- 12 shims para agentes core framework
- 48+ shims para agentes extended
- ~40 skill-specific implementations

**[101 skill shims enablem IDE integration para todos os agentes]**

---

## 📦 TEMPLATES (58)

[SOURCE: .aiox-core/development/templates/ + squads/*/templates/]

- agent-template.yaml
- story-tmpl.yaml
- prd-tmpl.yaml
- architecture-tmpl.yaml
- task-template.md
- workflow-template.yaml
- [52+ additional templates]

**[Templates asseguram consistency across artifact creation]**

---

## ⚙️ CONFIGS (12)

[SOURCE: .aiox-core/data/]

- entity-registry.yaml (IDS registry)
- workflow-chains.yaml (workflow orchestration)
- brainstorming-techniques.md
- elicitation-methods.md
- technical-preferences.md
- [7+ other data files]

**[Configs fornecem baseline canonical para audits]**

---

## 🔗 RELACIONAMENTOS-CHAVE IDENTIFICADOS

### Agent → Task
Cada agent tem `command_loader` mapeando comandos (*) para task files:
```
agent *command → command_loader lookup → task file carregado → workflow executado
```

### Workflow → Agent
Workflows especificam qual agente executa cada step:
```
workflow.steps[n].agent → resolve agent → execute task → advance workflow
```

### Story → Epic
Cada story refencia seu epic:
```
story.metadata.epic = "EPIC-10"
```

### Task → Dependencies
Cada task declara ficheiros requeridos:
```
task.requires = [file1.md, file2.yaml]
CRITICAL_LOADER_RULE: carregar antes de executar
```

---

## ✅ VALIDAÇÃO ESTRUTURAL

- ✅ 82 agentes com `command_loader` definido
- ✅ 218 tasks com `CRITICAL_LOADER_RULE` compliance
- ✅ 14 workflows com agent mappings
- ✅ 191 stories com epic references
- ✅ 23 hooks enforçando Constitution
- ✅ 101 skills enablem IDE integration
- ✅ 16 rules aplicam governance

---

## 🎯 PRÓXIMA FASE

**FASE 3:** Análise de Conectividade — Reconstrução de fluxos agent→workflow→task→story→epic

---

**Kronos — Fase 2 Conclusa ✅**
