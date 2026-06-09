# META-FRAMEWORK ARCHITECTURE — QUESTION-DRIVEN DETERMINISTIC SYSTEM

**Status:** Pre-Implementation Design Document
**Version:** 1.0-draft
**Date:** 2026-06-09
**Author:** Orion (@aiox-master)

---

## EXECUTIVE SUMMARY

**FASE 1 (Este documento):** Construir o FRAMEWORK de como trabalharemos
- 10 Perguntas Estruturadas (decision tree)
- 4 Meta-Workflows (workflow de workflows)
- 12 Tasks Complexas (definem o processo)
- 8 Agentes (mapeados por autoridade)
- 6 Checklists (validação em cada fase)
- 3 Handoff Types (transições estruturadas)

**FASE 2 (Depois):** Usar framework para criar produto real
- Pedro responde 10 perguntas
- Sistema carrega AIOX completo
- Agentes executam tasks
- Workflows orquestram tudo
- Zero ambiguidades, zero invenção

---

## PARTE 1: ESTRUTURA DAS 10 PERGUNTAS

### Pergunta 1: INTENT (Contexto do que vamos criar)

**Tipo:** Open-ended (Pedro descreve o que quer)
**Carga automática:**
- STATE.md (contexto atual)
- Project vision
- Roadmap existente

**Outputs esperados:**
- Product vision statement
- Business goals (3-5)
- Success metrics

**Recomendação automática:** Baseada em similaridade a produtos existentes

---

### Pergunta 2: SCOPE CLASSIFICATION

**Tipo:** Multiple choice (recomendado)
**Opções:**
- [1] **Greenfield** — Novo produto, zero código existente
- [2] **Brownfield** — Adicionar a produto existente
- [3] **Refactor** — Redesenhar subsystem
- [4] **Integration** — Conectar sistemas
- [5] **Migration** — Mover de tech stack
- [6] **Performance** — Otimizar sistema
- [7] **Compliance** — Regular/GDPR/security
- [8] **Research** — Explorar antes de build
- [9] **Operations** — DevOps/infra
- [10] **Consolidation** — Unificar duplicação

**Output:**
- Scope classification ID
- Template workflow selecionado

---

### Pergunta 3: COMPLEXITY ASSESSMENT

**Tipo:** Guided questionnaire (sub-perguntas)
**Dimensions:**
- Ficheiros afectados (1-5)
- APIs externas (0-5)
- Changes de infra (1-5)
- Team familiarity (1-5, inversa)
- Risk / criticality (1-5)

**Scoring:**
- 5-8 = SIMPLE (QUICK flow)
- 9-15 = STANDARD (SDC flow)
- 16-25 = COMPLEX (Spec Pipeline + SDC)

**Output:**
- Complexity score
- Recommended workflow

---

### Pergunta 4: STAKEHOLDERS & AUTHORITIES

**Tipo:** Multi-select (checkbox)
**Opções:**
- Product Manager (@pm) — PRD, vision, prioritization
- Product Owner (@po) — Story validation, backlog
- Architect (@architect) — Design, tech decisions
- Developer (@dev) — Implementation
- QA (@qa) — Testing, quality gates
- DevOps (@devops) — Infrastructure, deployments
- Analyst (@analyst) — Research, data
- UX Designer (@ux) — Interface, experience

**Output:**
- Agent assignment map
- Authority matrix (exclusive ops per agent)

---

### Pergunta 5: TIMELINE & CONSTRAINTS

**Tipo:** Structured inputs
**Solicita:**
- Target completion date
- Resource constraints
- Critical dependencies
- Blocking factors

**Output:**
- Timeline estimate
- Critical path
- Risk assessment

---

### Pergunta 6: DOCUMENTATION STARTING POINT

**Tipo:** Multiple choice
**Opções:**
- [1] **Start from scratch** — Criar PRD, arch, specs
- [2] **Use existing PRD** — Refine, shard, validate
- [3] **Spike + research** — Explore before planning
- [4] **Quick definition** — Minimal docs, fast execution
- [5] **Customer feedback** — Requirements from users
- [6] **Competitive analysis** — Market-driven design

**Output:**
- Documentation phase strategy
- Templates loaded

---

### Pergunta 7: TECHNICAL ARCHITECTURE

**Tipo:** Guided questionnaire
**Solicita:**
- Frontend framework (React/Vue/etc)
- Backend runtime (Node/Python/Go/etc)
- Database (SQL/NoSQL/Graph/etc)
- Deployment (Vercel/Railway/Docker/etc)
- Integrations (APIs, services)

**Output:**
- Tech stack validated
- ADR (Architecture Decision Record) template
- Implementation templates

---

### Pergunta 8: QUALITY GATES & TESTING

**Tipo:** Multiple choice (recomendado)
**Opções:**
- [1] **Full QA** — Unit + integration + e2e + performance + security
- [2] **Standard QA** — Unit + integration + e2e
- [3] **Minimal QA** — Unit + smoke tests
- [4] **Custom** — Define gates específicas

**Output:**
- Quality gate definition
- Test architecture
- CodeRabbit config

---

### Pergunta 9: DEPLOYMENT STRATEGY

**Tipo:** Multiple choice
**Opções:**
- [1] **Continuous** — Auto-deploy on main merge
- [2] **Staged** — Staging → Production manual approval
- [3] **Canary** — Gradual rollout (10% → 50% → 100%)
- [4] **Feature flags** — Hide behind toggles
- [5] **Dark launch** — Deploy to prod, invisible to users

**Output:**
- Deployment workflow
- Rollback procedure
- Monitoring config

---

### Pergunta 10: FEEDBACK LOOP & ITERATION

**Tipo:** Structured choices
**Solicita:**
- Metrics to track (business + technical)
- Feedback sources (users, analytics, team)
- Review cadence (daily, weekly, etc)
- Iteration plan (sprints, waves)

**Output:**
- Observability setup
- Feedback collection SOP
- Iteration schedule

---

## PARTE 2: 4 META-WORKFLOWS

### Meta-Workflow 1: "Discovery & Planning"

**When:** Antes de qualquer code
**Stages:**
1. Gather Intent (Pergunta 1)
2. Assess Complexity (Pergunta 2-3)
3. Define Stakeholders (Pergunta 4)
4. Research Phase (Pergunta 8 → @analyst research)
5. Create PRD (Pergunta 5-6 → @pm create-prd)
6. Define Architecture (Pergunta 7 → @architect design)
7. Create Spec (Pergunta 8-9 → @pm write-spec)

**Output:** PRD + Architecture + Spec (ready for development)

---

### Meta-Workflow 2: "Incremental Epic Creation"

**When:** Após Discovery, antes de @dev
**Stages:**
1. Shard Spec (Pergunta 9 → @pm shard-doc)
2. Create Epics (Pergunta 10 → @pm create-epic)
3. Validate Epics (@po validate)
4. Create Stories (por epic, @sm draft)
5. Batch Stories (agrupa por sprint)
6. Load Backlogs (pronto para @dev)

**Output:** Story backlog com checkboxes, pronto para desenvolvimento

---

### Meta-Workflow 3: "Development Cycle"

**When:** Após backlog pronto
**Stages (repeating):**
1. Story selection (@sm or @po)
2. Implementation (@dev, mode: YOLO/Interactive/Pre-Flight)
3. Code review (@qa, gate: PASS/CONCERNS/FAIL)
4. Fixes (if FAIL, return to @dev)
5. Merge (@devops push)
6. Monitoring (metrics)
7. Next story (back to 1)

**Output:** Features merged to main, metrics tracked

---

### Meta-Workflow 4: "Operational Governance"

**When:** Contínuo
**Stages:**
1. Constitutional validation (Art. I-VII gates)
2. IDS registry check (REUSE/ADAPT/CREATE)
3. Agent authority enforcement (exclusive ops)
4. Story traceability (AC → code mapping)
5. Quality metrics (lint, test, build, CodeRabbit)
6. Handoff consolidation (5+ → RUN-LOG)
7. Documentation sync

**Output:** Metrics + logs + audit trail

---

## PARTE 3: 12 TASKS COMPLEXAS

### Task Group A: Discovery Phase

**Task A1: discovery-intent-gathering.md**
- Input: User intent (Pergunta 1)
- Agent: @analyst (research) + @pm (context)
- Output: Intent document + vision statement
- Checklist: 6 points (clarity, measurable, achievable)

**Task A2: discovery-complexity-assessment.md**
- Input: Scope (Pergunta 2) + dimensions (Pergunta 3)
- Agent: @architect (design assessment)
- Output: Complexity score + recommended workflow
- Checklist: 5 dimensions validated

**Task A3: discovery-research-synthesis.md**
- Input: Technology choices (Pergunta 7)
- Agent: @analyst (market intel) + @architect (tech validation)
- Output: Research report + findings + ADRs
- Checklist: 4 ADRs minimum, dependencies mapped

---

### Task Group B: Planning Phase

**Task B1: planning-prd-creation.md**
- Input: Intent + complexity + research
- Agent: @pm (exclusive story creation authority)
- Output: PRD (requirements.json + narrative)
- Checklist: 8 points (completeness, clarity, traceability)

**Task B2: planning-architecture-design.md**
- Input: Tech stack (Pergunta 7) + complexity
- Agent: @architect (exclusive design authority)
- Output: Architecture document + system diagram
- Checklist: 6 points (scalability, security, maintainability)

**Task B3: planning-spec-write.md**
- Input: PRD + Architecture
- Agent: @pm (write) + @architect (validate)
- Output: Spec.md com FR/NFR/CON traceability (Art. IV)
- Checklist: 7 points (no invention, complete coverage)

**Task B4: planning-epic-creation.md**
- Input: Spec (validated) + timeline
- Agent: @pm (exclusive epic creation)
- Output: 3-10 Epics com stories sharded
- Checklist: Epic structure, story count, dependency map

---

### Task Group C: Validation Phase

**Task C1: validation-spec-critique.md**
- Input: Spec.md (from B3)
- Agent: @qa (full review) + @architect (design validation)
- Output: Critique report + verdict (APPROVED/NEEDS_REVISION/BLOCKED)
- Checklist: 7 points (art. IV compliance, completeness)

**Task C2: validation-epic-validation.md**
- Input: Epics (from B4)
- Agent: @po (exclusive validation authority)
- Output: Epic status (READY/NEEDS_WORK) per epic
- Checklist: 10 points (scope, dependencies, AC clarity)

---

### Task Group D: Development Phase

**Task D1: development-story-creation.md**
- Input: Epic + stories sharded
- Agent: @sm (exclusive story creation)
- Output: Story files (.story.md) com checkboxes
- Checklist: 8 points (AC, file list, dependencies)

**Task D2: development-implementation.md**
- Input: Story (READY status)
- Agent: @dev (exclusive implementation)
- Output: Code + tests + PR
- Checklist: Story-dod-checklist (7 points)

**Task D3: development-qa-gate.md**
- Input: PR (from D2)
- Agent: @qa (exclusive quality authority)
- Output: Verdict (PASS/CONCERNS/FAIL)
- Checklist: 7-point quality gate

**Task D4: development-deployment.md**
- Input: PR (PASS or CONCERNS)
- Agent: @devops (exclusive push authority)
- Output: Main merged + monitoring active
- Checklist: 5 points (deployment, rollback, monitoring)

---

## PARTE 4: AGENT AUTHORITY MATRIX

| Agent | Exclusive Authority | Tasks Owned | Non-Negotiable |
|-------|-------------------|-------------|-----------------|
| **@pm** | Epic creation, PRD writing, spec writing | B1, B3, B4 | Must create PRD before spec |
| **@architect** | Architecture design, tech validation | B2, C1 (co-validate) | Must validate spec |
| **@analyst** | Research, market intel, data analysis | A1 (co), A3 | Provides findings, not decisions |
| **@po** | Story validation, backlog prioritization | C2 | Must approve epics before @sm |
| **@sm** | Story creation from approved epics | D1 | NEVER creates without @po approval |
| **@dev** | Implementation, code writing | D2 | Only implements READY stories |
| **@qa** | Quality gates, testing, review | C1 (co), D3 | PASS/FAIL decision is final |
| **@devops** | Git operations, deployments, MCP | D4 | ONLY authority for git push |

---

## PARTE 5: 6 CHECKLISTS (VALIDAÇÃO)

### Checklist 1: Constitutional Compliance

```
[ ] Art. I — CLI First: Code works 100% via CLI before UI
[ ] Art. II — Agent Authority: Exclusive ops honored
[ ] Art. III — Story-Driven: Story exists before code
[ ] Art. IV — No Invention: Specs traced to requirements
[ ] Art. V — Quality First: lint/test/build/CodeRabbit pass
[ ] Art. VI — Absolute Imports: All @/ imports
[ ] Art. VII — Boundary: L1/L2 untouched
```

### Checklist 2: IDS Compliance

```
[ ] Entity registry updated: All new components registered
[ ] REUSE check: Existing components consulted
[ ] ADAPT analysis: If adapted, changes < 30%, consumers ok
[ ] CREATE justification: If new, documented why
[ ] usedBy relationships: Mapped correctly
```

### Checklist 3: Task Execution

```
[ ] Input complete: All required fields provided
[ ] Output generated: All expected files created
[ ] Checklist passed: Sub-checklist 100% valid
[ ] Handoff ready: Next agent has context
[ ] Logged: Metrics recorded in .synapse/
```

### Checklist 4: Story Structure

```
[ ] Title: Clear, actionable, story-shaped
[ ] AC: >= 3, specific, testable
[ ] File List: Estimated files
[ ] Dependencies: Listed
[ ] Effort: Estimated in SP
[ ] Status: Draft → Ready → InProgress → Done
```

### Checklist 5: Code Quality

```
[ ] Lint: npm run lint → PASS
[ ] Type: npm run typecheck → PASS
[ ] Test: npm test → PASS + coverage not decreased
[ ] Build: npm run build → success
[ ] CodeRabbit: CRITICAL = 0, HIGH < 3
[ ] PR Review: No blocking comments
```

### Checklist 6: Handoff Quality

```
[ ] from_agent: Correct sender
[ ] to_agent: Correct receiver
[ ] story_id: Valid reference
[ ] ac_list: Complete acceptance criteria
[ ] branch: Exists and up-to-date
[ ] next_action: Clear and specific
```

---

## PARTE 6: HANDOFF TYPES

### Type 1: Task Handoff (agent → agent within task)

```yaml
handoff_type: task_handoff
from_agent: @pm
to_agent: @architect
task: planning-prd-creation → planning-architecture-design
context:
  prd_file: docs/prd.md
  reviewed_by: @pm
output_expected: architecture.md
next_action: validate tech stack against PRD
```

### Type 2: Workflow Handoff (phase → phase)

```yaml
handoff_type: workflow_handoff
from_phase: Discovery & Planning
to_phase: Incremental Epic Creation
agents_involved: [@pm, @architect, @qa]
artifacts:
  - docs/prd.md
  - docs/architecture.md
  - docs/spec.md (APPROVED)
preconditions:
  - spec_critique.verdict = APPROVED
next_action: shard spec + create epics
```

### Type 3: Story Handoff (agent → agent in SDC)

```yaml
handoff_type: story_handoff
from_agent: @po
to_agent: @sm
story_id: epic-1.story-1
status: READY (from validation)
ac_list: [AC1, AC2, AC3]
branch: feature/epic-1-story-1
next_action: @sm implements story
```

---

## PARTE 7: SYNAPSE INTEGRATION

### Metrics Tracked

```json
{
  "workflow_progress": {
    "discovery": { "completed": true, "time_hours": 8 },
    "planning": { "completed": true, "time_hours": 16 },
    "validation": { "completed": false, "time_hours": 4 },
    "development": { "in_progress": true, "stories_done": 2 }
  },
  "task_execution": {
    "total_tasks": 12,
    "completed": 6,
    "in_progress": 2,
    "blocked": 0
  },
  "agent_contribution": {
    "@pm": { "tasks": 3, "hours": 24 },
    "@architect": { "tasks": 2, "hours": 16 },
    "@analyst": { "tasks": 1, "hours": 8 },
    "@dev": { "tasks": 1, "hours": 6 }
  },
  "constitutional_gates": {
    "violations_detected": 0,
    "violations_blocked": 0,
    "overrides_used": 0
  },
  "ids_registry": {
    "entities_created": 5,
    "entities_reused": 3,
    "entities_adapted": 2
  }
}
```

---

## PARTE 8: TEMPLATES CARREGADOS AUTOMATICAMENTE

### By Discovery Phase
- `intent-template.md`
- `research-template.md`

### By Planning Phase
- `prd-tmpl.yaml`
- `architecture-tmpl.yaml`
- `spec-tmpl.md`
- `epic-tmpl.yaml`

### By Validation Phase
- `critique-template.md`
- `validation-checklist.md`

### By Development Phase
- `story-tmpl.yaml`
- `task-template.md`
- `pr-template.md`

### By Governance
- `handoff-tmpl.yaml`
- `sop-template.md`
- `decision-registry.yaml`

---

## PARTE 9: WORKFLOWS DEFINITION (YAML)

### Workflow Registry

```yaml
workflows:
  discovery-planning:
    name: "Discovery & Planning Phase"
    tasks:
      - a1-intent-gathering
      - a2-complexity-assessment
      - a3-research-synthesis
      - b1-prd-creation
      - b2-architecture-design
      - b3-spec-write
      - b4-epic-creation
    sequence: linear
    gates: [Art. IV validation on spec]
    exit_condition: "spec.critique.verdict == APPROVED && epics.all.status == READY"
    
  validation-phase:
    name: "Validation Phase"
    tasks:
      - c1-spec-critique
      - c2-epic-validation
    sequence: parallel (can run simultaneously)
    gates: [All checklists pass]
    exit_condition: "All epics READY, spec APPROVED"
    
  development-cycle:
    name: "Development Cycle (repeating)"
    tasks:
      - d1-story-creation
      - d2-implementation
      - d3-qa-gate
      - d4-deployment
    sequence: linear per story
    parallel_stories: 3 (max concurrent)
    gates: [Constitutional gates per agent]
    exit_condition: "All stories status == Done, main updated"
```

---

## PARTE 10: DETERMINISM VALIDATION

### Rule 1: Every Question Maps to Workflow

```
Question 1 (Intent) → Task A1 → Output
Question 2 (Scope) → Workflow selection → Task mapping
Question 3 (Complexity) → Quality gate level → Checklist count
...
Question 10 (Feedback) → Monitoring config → Metrics
```

### Rule 2: Every Task Has Deterministic Input/Output

```
Task B1 (PRD creation):
  INPUT: [Intent, Complexity, Research findings]
  PROCESS: @pm writes PRD following prd-tmpl.yaml
  OUTPUT: prd.md + requirements.json
  VALIDATION: PRD checklist (8 points)
  NEXT: Task B2 (architecture)
```

### Rule 3: Every Handoff Is Explicit

```
Handoff C1→C2:
  FROM: @qa (spec critique complete)
  TO: @po (epic validation ready)
  CONDITIONS: spec.verdict == APPROVED
  ARTIFACTS: spec.md, critique.json
  NEXT_ACTION: validate epics
```

### Rule 4: Zero Ambiguity In Agent Assignment

```
IF task requires @pm authority:
  THEN @pm executes (exclusive)
ELIF task requires @architect design:
  THEN @architect executes (exclusive)
ELIF task is collaborative:
  THEN primary agent leads, secondary reviews
ELSE:
  ERROR (ambiguous assignment)
```

---

## PRÓXIMAS FASES (APÓS CONFIRMAÇÃO)

### Phase 0 (NOW): Confirm architecture
- [ ] 10 Questions defined ✓
- [ ] 4 Meta-Workflows ✓
- [ ] 12 Tasks ✓
- [ ] 6 Checklists ✓
- [ ] Agent matrix ✓
- [ ] Ready to implement

### Phase 1: Implement Decision Engine
- [ ] Create question-router.cjs (L4 hook)
- [ ] Create workflow-loader.cjs (L4 hook)
- [ ] Create task-executor.cjs (L4 hook)
- [ ] Create handoff-generator.cjs (L4 hook)

### Phase 2: Populate Registries
- [ ] Update decision-registry.yaml (L3)
- [ ] Update workflow-registry.yaml (L3)
- [ ] Update task-registry.yaml (L3)
- [ ] Update agent-authority-matrix.yaml (L3)

### Phase 3: Validate System
- [ ] Test: Full 10-question flow
- [ ] Test: Constitutional gates pass
- [ ] Test: IDS compliance verified
- [ ] Test: Handoffs work correctly

### Phase 4: START REAL CREATION
- Pedro clica no primeiro [1]
- Sistema executa tudo determinísticamente
- Primeira feature criada com zero ambiguidade

---

## RESUMO EXECUTIVO

**Estamos construindo UM FRAMEWORK QUE CONSTRÓI FRAMEWORKS.**

✅ **10 Perguntas determinísticas** — cobrem 100% do espaço de decisão
✅ **4 Meta-Workflows** — orquestram tudo sem ambiguidade
✅ **12 Tasks executáveis** — definem como trabalhar
✅ **8 Agentes mapeados** — autoridades exclusivas respeitadas
✅ **6 Checklists** — validação em cada fase
✅ **3 Handoff types** — transições explícitas
✅ **AIOX completo** — carregado automaticamente
✅ **Zero invenção** — tudo baseado em registries

**Resultado:** Sistema 100% determinístico onde Pedro NUNCA escreve, só clica.

---

**ESTÁ PRONTO?** ✅

