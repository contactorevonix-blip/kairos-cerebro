# OPERATIONAL DECISION FRAMEWORK — INCREMENTAL DETERMINISTIC

**Status:** Awaiting Pedro Confirmation
**Version:** 1.0-draft
**Generated:** 2026-06-09

---

## FRAME 0: INITIAL DECISION TREE

Cada workflow começa com **UMA DECISÃO** (múltipla, clicável).

```
ENTRADA: Novo trabalho / Comando do Pedro
    ↓
DECISÃO 1: Que tipo de trabalho?
    ├─ Option A: Nova Feature / Produto
    ├─ Option B: Bug Fix / Hotfix
    ├─ Option C: Refactor / Tech Debt
    ├─ Option D: Configuração / Hooks
    ├─ Option E: Framework Governance
    └─ Option F: Pesquisa / Análise
    ↓
[cada opção carrega FRAME específica com suas próprias decisões]
```

---

## OPTION A: NOVA FEATURE / PRODUTO

### FRAME A1: Escopo & Complexidade

**INPUT:**
- Descrição da feature
- Contexto do negócio
- Constraints conhecidas

**DECISÃO A1:** Qual a escala de complexidade?

```
Opção A1.1: QUICK FLOW (< 2 horas, < 3 ficheiros)
  └─ Exemplo: Novo campo no formulário, config change
  
Opção A1.2: STANDARD FLOW (2-8 horas, < 10 ficheiros)
  └─ Exemplo: Nova endpoint, melhoria de feature existente
  
Opção A1.3: ENTERPRISE FLOW (> 8 horas, novo produto, > 10 ficheiros)
  └─ Exemplo: Nova subsystem, arquitectura, integração major
```

**OUTPUT FRAME A1:** Próxima decisão baseada em opção escolhida

---

## OPTION A1.1: QUICK FLOW (< 2h)

### FRAME A1.1.A: Agentes & Autoridades

**Agentes envolvidos:**
1. `@sm` — Story creation (EXCLUSIVE)
2. `@dev` — Implementation (YOLO mode)
3. `@qa` — QA gate (light)
4. `@devops` — Push (EXCLUSIVE)

**O que faz:**
- ✅ Cria story simples
- ✅ Implementa com IDS check (advisory)
- ✅ Light QA (CodeRabbit max 2 iterations)
- ✅ Git push

**O que NÃO faz:**
- ❌ Spec Pipeline (skip)
- ❌ Architecture review (@architect consulta não-obrigatória)
- ❌ Database schema changes (dados+schema = STANDARD ou acima)
- ❌ UI changes sem CLI primeiro

---

### FRAME A1.1.B: Task Sequence & Templates

**TASKS OBRIGATÓRIAS:**

| Seq | Agent | Task | Template | Input | Output |
|-----|-------|------|----------|-------|--------|
| 1 | @sm | `create-next-story.md` | `story-tmpl.yaml` | Feature desc | `docs/stories/{epic}/{num}.story.md` |
| 2 | @dev | `dev-develop-story.md` | `task-template.md` | Story + AC | Code + tests + File List |
| 3 | @qa | `qa-gate.md` | (checklist) | PR/code | Verdict: PASS/CONCERNS/FAIL |
| 4 | @devops | `*push` | (git) | PR approved | main branch updated |

**Templates loaded:**
- `.aiox-core/development/templates/story-tmpl.yaml`
- `.aiox-core/development/templates/task-template.md`
- `.aiox-core/development/checklists/story-dod-checklist.md`

**Gates invoked:**
- Art. III (story-driven) — story required
- Art. IV (no-invention) — AC = features only
- Art. V (quality) — lint/test/build pass
- IDS Pre-Action Hook (advisory) — REUSE check

---

### FRAME A1.1.C: Workflow Execution & Handoffs

**Workflow:** `story-development-cycle.yaml` (lite mode)

```yaml
workflow:
  name: story-development-cycle
  mode: quick-flow
  phases:
    1:
      name: Create
      agent: @sm
      task: create-next-story
      elicit: true  # user interaction required
      output: story file
      
    2:
      name: Implement
      agent: @dev
      task: dev-develop-story
      mode: YOLO
      ids_check: advisory
      coderabbit: light (max 2 iterations)
      output: code + tests
      
    3:
      name: QA Gate
      agent: @qa
      task: qa-gate
      checklist: story-dod-checklist
      output: verdict
      
    4:
      name: Push
      agent: @devops
      task: git-push
      conditions: 
        - verdict == PASS or CONCERNS
        - branch sync
      output: main merged
      
handoffs:
  @sm→@dev:
    story_id: {story-id}
    ac_list: [AC1, AC2, AC3...]
    branch: feature/{story-id}
    
  @dev→@qa:
    pr_url: {github-pr}
    files_modified: [file1, file2...]
    self_review: {notes}
    
  @qa→@devops:
    verdict: PASS|CONCERNS|FAIL
    comments: {feedback}
    if PASS: proceed to push
    if FAIL: return to @dev with fixes
```

---

### FRAME A1.1.D: Tools & Execution

**Tools utilizadas:**

| Tool | When | Agent | Purpose |
|------|------|-------|---------|
| `Read` | Story creation | @sm | Load epic context |
| `Write` | Story creation | @sm | Create story file |
| `Bash` | Implementation | @dev | npm run build, test |
| `Bash` (coderabbit) | Implementation | @dev | CodeRabbit self-heal |
| `Bash` | QA gate | @qa | Test execution |
| `Bash` | Push | @devops | git push, gh pr |
| `Glob` | IDS check | Any | Registry lookup |
| `Grep` | Traceability | Any | AC → code mapping |

**Ferramentas AIOX:**
- IDS Entity Registry (advisory check)
- CodeRabbit (integrated, self-heal max 2)
- Story Registry (`.aiox-core/data/story-registry.yaml`)

---

### FRAME A1.1.E: IDS Decision

**Before @dev starts:**

`*ids check "implement {feature-name}"`
- Registry query → existing components?
  - REUSE ≥ 90%? Use directly
  - ADAPT 60-89%? Modify + register change
  - CREATE? New artifact + document justification

**After @dev finishes:**

`*ids register {file-path} --type {component}`
- Auto-register new artifacts
- Update usedBy relationships

---

### FRAME A1.1.F: Exemplo Concreto (QUICK FLOW)

```
Pedro: "Quero adicionar um campo email_verified ao utilizador"

@sm *draft
  Story created: docs/stories/epic-1/2.1.story.md
  AC1: Email field appears in form
  AC2: Backend validates email format
  AC3: Tests cover validation

@dev *develop
  Implements AC1-3
  IDS check: form-component exists → ADAPT
  Tests written
  CodeRabbit: 1 iteration (MEDIUM issue auto-fixed)
  
@qa *qa-gate
  Verdict: PASS ✅

@devops *push
  PR merged to main ✅
```

---

## OPTION A1.2: STANDARD FLOW (2-8h)

### FRAME A1.2.A: Quando usar?

- Feature nova com 2-8 horas de trabalho
- Múltiplos ficheiros (< 10)
- Sem mudanças de arquitectura
- Envolve múltiplos agentes

**Exemplo:** Nova API endpoint com validação + tests

---

### FRAME A1.2.B: Agentes & Task Sequence

**Agentes:**
1. `@sm` — Story creation (EXCLUSIVE)
2. `@po` — Story validation (EXCLUSIVE, 10-point checklist)
3. `@dev` — Implementation (Interactive mode, IDS mandatory)
4. `@qa` — QA gate (full, 7-point checklist)
5. `@devops` — Push (EXCLUSIVE)

**Tasks:**

| Seq | Agent | Task | Mandatory | Output |
|-----|-------|------|-----------|--------|
| 1 | @sm | `create-next-story.md` | YES | Story file |
| 2 | @po | `validate-next-story.md` | YES (GO/NO-GO) | Checklist verdict |
| 3 | @dev | `dev-develop-story.md` | YES | Code + tests |
| 4 | @qa | `qa-gate.md` | YES | Verdict |
| 5 | @devops | `git-push.md` | YES | main merged |

**Templates:**
- `story-tmpl.yaml` (story)
- `task-template.md` (dev guide)
- `po-master-checklist.md` (validation)
- `story-dod-checklist.md` (QA)

---

### FRAME A1.2.C: Validation Checkpoint (@po)

**@po runs 10-point checklist:**
1. ✅ Story title clear & actionable
2. ✅ AC >= 3, specific & testable
3. ✅ File List estimated
4. ✅ Dependencies clear
5. ✅ No ambiguities
6. ✅ Acceptance criteria linked to business value
7. ✅ Story fits in epic/roadmap
8. ✅ No duplicate work (IDS check)
9. ✅ Effort estimation reasonable
10. ✅ Ready for @dev

**Decision:**
- Score ≥ 7 → GO (status: Ready)
- Score < 7 → NO-GO (feedback → @sm for fixes)

---

### FRAME A1.2.D: IDS Mandatory Check

**Before @dev implements:**

`*ids impact {each-AC}`
- Direct consumers of pattern?
- Indirect consumers?
- Risk level if modified?

**Decision:** REUSE/ADAPT/CREATE with documented justification

---

### FRAME A1.2.E: Workflow (STANDARD)

```yaml
workflow: story-development-cycle (standard mode)
  phase1:
    agent: @sm
    task: create-next-story.md
    elicit: true
    
  phase2:
    agent: @po
    task: validate-next-story.md
    checklist: po-master-checklist (10 points)
    decision: GO (≥7) | NO-GO
    if NO-GO: → @sm (fixes)
    
  phase3:
    agent: @dev
    task: dev-develop-story.md
    mode: Interactive
    ids: mandatory check before start
    coderabbit: light (max 2)
    output: PR
    
  phase4:
    agent: @qa
    task: qa-gate.md
    checklist: story-dod-checklist (7 points)
    decision: PASS | CONCERNS | FAIL
    if FAIL: → @dev (fixes)
    
  phase5:
    agent: @devops
    task: git-push.md
    conditions: verdict >= PASS
    output: main merged
```

---

## OPTION A1.3: ENTERPRISE FLOW (> 8h, novo produto)

### FRAME A1.3.A: Pré-requisito Obrigatório

**SPEC PIPELINE OBRIGATÓRIO antes de SDC**

```
@pm *gather-requirements
    ↓
@architect *assess-complexity
    ├─ Score 1-20
    ├─ IF score ≤ 8 → SIMPLE (skip phases 2-3)
    └─ IF score > 8 → continue
    ↓
@analyst *research (IF score > 8)
    ↓
@pm *write-spec
    ├─ FR-* (functional requirements)
    ├─ NFR-* (non-functional)
    ├─ CON-* (constraints)
    └─ Art. IV gate: ALL statements traced
    ↓
@qa *critique-spec
    ├─ Verdict: APPROVED (≥4/5) | NEEDS REVISION | BLOCKED
    ├─ IF APPROVED: proceed
    └─ IF NEEDS REVISION: @pm fixes → retry
    ↓
@architect *plan-implementation
    └─ implementation.yaml com first N stories
    ↓
THEN: @sm *draft (story 1)
```

---

### FRAME A1.3.B: Complexity Assessment (Dimensions)

**@architect scores 5 dimensions (1-5 each):**

| Dimension | Weight | Scoring |
|-----------|--------|---------|
| Scope | 1x | Files affected (1=1-2, 5=50+) |
| Integration | 1x | External APIs (1=0, 5=5+) |
| Infrastructure | 1x | Infra changes (1=none, 5=major) |
| Knowledge | 1x | Team familiarity (1=expert, 5=novel) |
| Risk | 1x | Criticality (1=low, 5=critical) |

**Formula:** Score = (S + I + IF + K + R) = 5-25 (normalized to 1-20)

---

### FRAME A1.3.C: Spec Pipeline Detailed

**Phase 1: @pm *gather**

INPUT:
- Product vision
- User stories
- Business goals

OUTPUT:
- `requirements.json`
```json
{
  "product": "Kairos Fraud Scoring API",
  "functional_requirements": [
    "FR-001: Accept user ID + transaction data",
    "FR-002: Return fraud score (0-1000)",
    "FR-003: Log decision to audit trail"
  ],
  "non_functional": [
    "NFR-001: Latency < 200ms p95",
    "NFR-002: 99.9% uptime SLA"
  ],
  "constraints": [
    "CON-001: GDPR compliance",
    "CON-002: PCI DSS for payment data"
  ]
}
```

**Phase 2: @architect *assess**

INPUT: `requirements.json`

OUTPUT: `complexity.json`
```json
{
  "score": 17,
  "class": "COMPLEX",
  "dimensions": {
    "scope": 4,
    "integration": 5,
    "infrastructure": 3,
    "knowledge": 4,
    "risk": 1
  },
  "recommendation": "Full spec pipeline + Brownfield discovery needed"
}
```

**Phase 3: @analyst *research** (IF score > 8)

INPUT: `requirements.json` + `complexity.json`

OUTPUT: `research.json`
```json
{
  "market_landscape": "...",
  "technology_patterns": ["ML fraud detection", "real-time scoring systems"],
  "competitive_analysis": "...",
  "findings": [
    "Finding-001: Industry standard = threshold-based + ML ensemble",
    "Finding-002: Critical: GDPR limits training data retention"
  ]
}
```

**Phase 4: @pm *write-spec**

INPUT: All above + `research.json`

OUTPUT: `spec.md`
- Art. IV gate: EVERY statement has FR-*/NFR-*/CON-*/Finding traceability
- Structure: Overview + FR section + NFR section + Constraints + Open Qs

**Phase 5: @qa *critique-spec**

INPUT: `spec.md`

OUTPUT: `critique.json`
```json
{
  "verdict": "APPROVED",
  "score": 4.2,
  "checks": [
    { "item": "Completeness", "score": 5 },
    { "item": "Traceability", "score": 4 },
    { "item": "Feasibility", "score": 4 },
    { "item": "Clarity", "score": 4 }
  ]
}
```

**Phase 6: @architect *plan-implementation**

INPUT: `spec.md` (APPROVED)

OUTPUT: `implementation.yaml`
```yaml
epics:
  - id: epic-001
    title: "Core Fraud Scoring Engine"
    stories:
      - "epic-001/story-001: Data ingestion pipeline"
      - "epic-001/story-002: ML model integration"
      - "epic-001/story-003: API endpoint + response format"
    
  - id: epic-002
    title: "Observability & Compliance"
    stories:
      - "epic-002/story-001: Audit logging"
      - "epic-002/story-002: GDPR data retention policy"
```

---

### FRAME A1.3.D: Agentes & Full SDC

After spec APPROVED:

1. **@sm *draft** → Creates first story from epic
2. **@po *validate** → 10-point checklist
3. **@dev *develop** → Implementation (Pre-Flight mode for first story)
4. **@qa *qa-gate** → Full 7-point gate
5. **@devops *push** → Merged
6. Repeat for next stories in epic

---

## OPTION B: BUG FIX / HOTFIX

### FRAME B1: Triage

**DECISÃO:** Severity?

```
Opção B1.1: CRITICAL (users impacted, revenue loss)
  → QUICK FLOW (< 1h)
  → Skip @po validation (only @qa gate)
  
Opção B1.2: HIGH (functional issue, workaround exists)
  → QUICK FLOW (< 2h)
  → Normal SDC
  
Opção B1.3: MEDIUM / LOW
  → STANDARD FLOW (batch fixes)
  → Can be bundled with other work
```

---

## OPTION C: REFACTOR / TECH DEBT

### FRAME C1: Scope Decision

**DECISÃO:** Complexity of refactor?

```
Opção C1.1: SIMPLE (< 5 files)
  → QUICK FLOW (@dev YOLO)
  → Story created by @sm
  
Opção C1.2: COMPLEX (> 5 files, multiple modules)
  → STANDARD FLOW
  → @architect involved for redesign
  → IDS mandatory (must justify why rewrite > adapt)
```

---

## OPTION D: CONFIGURATION / HOOKS

### FRAME D1: What component?

```
Opção D1.1: Settings.json / .claude/settings.json
  → @config-engineer
  → No story required (tag: [no-story-req])
  → Direct commit allowed
  
Opção D1.2: Hooks (.claude/hooks/*.cjs)
  → @hooks-architect
  → Story recommended
  → Needs testing in `tests/hooks/`
  
Opção D1.3: MCP / CI-CD
  → @devops (EXCLUSIVE)
  → Story required
  → Security review mandatory
```

---

## OPTION E: FRAMEWORK GOVERNANCE

### FRAME E1: Governance Type

```
Opção E1.1: NEW AGENT / TASK / WORKFLOW
  → @aiox-master *create
  → IDS check mandatory
  → *validate-component required
  
Opção E1.2: MODIFY FRAMEWORK COMPONENT
  → @aiox-master *propose-modification
  → Impact analysis mandatory
  → Approval required
  
Opção E1.3: DEPRECATE / REMOVE
  → @aiox-master *deprecate-component
  → Migration path required
  → 30-day notice period
```

---

## OPTION F: RESEARCH / ANALYSIS

### FRAME F1: Research Type

```
Opção F1.1: Market Research (competitive intel, trends)
  → @analyst *research
  → Output: Research report + findings
  
Opção F1.2: Technical Research (technology selection, POC)
  → @architect + @analyst
  → Output: ADR + implementation guidance
  
Opção F1.3: Data Analysis (metrics, performance)
  → @data-engineer
  → Output: Report + recommendations
```

---

## SUMMARY TABLE: DECISION → WORKFLOW MAPPING

| Input | Quick Flow | Standard Flow | Enterprise Flow |
|-------|-----------|---------------|-----------------|
| Bug fix (HIGH) | @sm→@dev→@qa→@devops | — | — |
| Feature (2h) | @sm→@dev→@qa→@devops | — | — |
| Feature (5h) | — | @sm→@po→@dev→@qa→@devops | — |
| New Product | — | — | Spec→@sm→@po→@dev→@qa→@devops |
| Refactor small | @sm→@dev→@qa→@devops | — | — |
| Refactor large | — | @architect→@sm→@po→@dev→@qa→@devops | — |

---

## EXECUTION RULES (NON-NEGOTIABLE)

### Input Validation (All flows)

- [ ] Intent is clear (not vague)
- [ ] No invention assumptions
- [ ] Constraints documented
- [ ] Success criteria defined

### Output Generation (All flows)

- [ ] Story file created + checkboxes updated
- [ ] File List maintained
- [ ] Handoff generated (if multi-agent)
- [ ] Logged to `.aiox/gate-logs/`

### No Invention Gate (Art. IV)

- [ ] All AC traced to requirements or research findings
- [ ] No "nice-to-have" features beyond scope
- [ ] Spec statements ≥ 90% traceable

### Quality First (Art. V)

- [ ] npm run lint — PASS
- [ ] npm run typecheck — PASS
- [ ] npm test — PASS
- [ ] CodeRabbit CRITICAL — 0 issues

### Agent Authority (Art. II)

- [ ] Only @devops pushes to remote
- [ ] Only @sm creates stories
- [ ] Only @po validates stories
- [ ] Delegation explicit, logged

---

## NEXT STEPS

**To execute ANY workflow:**

1. Pedro provides INPUT
2. Orion asks DECISÃO 1 (multiple choice)
3. Pedro clicks answer
4. Orion presents FRAME for that path
5. Repeat until execution phase
6. Agent switches automatically
7. Logging + handoff generated

**Example conversation:**

```
Pedro: "Quero adicionar 2FA ao login"

Orion: "🎯 DECISÃO 1: Que tipo de trabalho?"
[1] Nova Feature / Produto
[2] Bug Fix / Hotfix
[3] Refactor / Tech Debt
[4] Configuração / Hooks
[5] Framework Governance
[6] Pesquisa / Análise

Pedro: [1]

Orion: "✅ Nova Feature. DECISÃO 2: Escala de complexidade?"
[1] QUICK FLOW (< 2h, < 3 files)
[2] STANDARD FLOW (2-8h, < 10 files)
[3] ENTERPRISE FLOW (> 8h, novo produto)

Pedro: [1]

Orion: "✅ QUICK FLOW selecionado. Iniciando @sm *draft..."
[Loads story-tmpl.yaml]
[Story created]
"@sm pronto. @dev aguarda. Próxima decisão?"
```

---

**Confirmas este plano de OPERAÇÃO INCREMENTAL DETERMINÍSTICA?**

