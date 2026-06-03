# Example Output — aiox-map Skill

## Sample Invocation

```
/aiox-map
```

## Expected Output (Markdown Report)

---

# AIOX Framework Cartography

**Framework:** Synkra AIOX v2.1  
**Audit Date:** 2026-06-03  
**Components Scanned:** 13 agents, 120+ tasks, 8 workflows, 6 checklists

---

## Agent Registry

| Agent ID | Persona | Role | Exclusive Operations | Blocked |
|----------|---------|------|----------------------|---------|
| `@dev` | Dex | Implementation | git add, git commit | git push, gh pr |
| `@qa` | Quinn | QA Gate | *qa-loop | git push |
| `@architect` | Aria | System Design | Architecture decisions | Code impl |
| `@pm` | Morgan | Epic Orchestration | *execute-epic | Story details |
| `@po` | Pax | Story Validation | *validate-story | Implementation |
| `@sm` | River | Story Creation | *create-story | Validation |
| `@analyst` | Alex | Research | *research | None |
| `@data-engineer` | Dara | Database | Schema design, RLS | App code |
| `@ux-design-expert` | Uma | UX/UI Design | Design decisions | Frontend impl |
| `@devops` | Gage | CI/CD + Push | **git push, gh pr create** | Framework mods |
| `@aiox-master` | Orion | Governance | Framework validation | Direct code |
| `@squad-creator` | Craft | Squad Creation | Squad design | Execution |
| `@business-chief` | Chief | Strategy | Epic decisions | Dev exec |

---

## Authority Matrix

### Exclusive Operations (Non-delegable)

| Operation | Owner | Reason | Reference |
|-----------|-------|--------|-----------|
| `git push` | @devops | Code integrity, audit trail | agent-authority.md:5 |
| `gh pr create/merge` | @devops | PR governance, release control | agent-authority.md:6 |
| `*execute-epic` | @pm | Epic orchestration, roadmap control | agent-authority.md:12 |
| `*validate-story` | @po | Story quality gates (10-point checklist) | agent-authority.md:25 |
| `*create-story` / `*draft` | @sm | Story derivation from PRD | agent-authority.md:30 |

### Delegation Patterns

```
@pm (epic) → @sm (*draft story)
@sm (story) → @po (*validate)
@po (validated) → @dev (*implement)
@dev (complete) → @qa (*qa-gate)
@qa (approved) → @devops (*push)
```

---

## Task Execution Map (Sample)

| Task | File | Executor | Inputs | Outputs | Complexity |
|------|------|----------|--------|---------|------------|
| create-next-story | .aiox-core/development/tasks/create-next-story.md | @sm | PRD + epic context | story.md (Draft) | STANDARD |
| validate-next-story | .aiox-core/development/tasks/validate-next-story.md | @po | story.md | Go/NoGo + checklist | SIMPLE |
| dev-develop-story | .aiox-core/development/tasks/dev-develop-story.md | @dev | story.md + AC | code + File List | STANDARD |
| qa-gate | .aiox-core/development/tasks/qa-gate.md | @qa | code | PASS/CONCERNS/FAIL | STANDARD |
| db-schema-audit | .aiox-core/development/tasks/db-schema-audit.md | @data-engineer | schema.sql | audit report | STANDARD |

---

## DNA Mental Model

### Core Principles

1. **Constitution First** (Art. I-VI inegociáveis)
   - CLI is source of truth
   - Agent authority non-negotiable
   - Story-driven development
   - No invention (specs only)
   - Quality gates before merge

2. **Authority Pattern**
   - Exclusive operations: @devops (git), @pm (epics), @po (validation), @sm (creation)
   - Delegation > Direct execution
   - Agent cannot exceed boundary

3. **Execution Layer (L1-L4)**
   - L1: Framework core (NEVER modify) → protected by deny rules
   - L2: Framework templates → extend-only
   - L3: Project config → mutable with exceptions
   - L4: Project runtime → always mutable

4. **Workflow Philosophy**
   - Story-Driven Cycle (SDC): create → validate → implement → qa → push
   - Spec Pipeline: gather → assess → research → write → critique → plan
   - QA Loop: review → fix (max 5 iterations)
   - Brownfield Discovery: 10-phase technical debt assessment

### Activation Patterns

**Quick Flow** (< 5 stories, < 2h)
→ @dev directly (bug fixes, config changes)

**Standard Flow** (5-15 stories)
→ @sm *draft → @po *validate → @dev *implement → @qa *qa-gate → @devops *push

**Enterprise Flow** (> 15 stories, complex epic)
→ @pm *create-epic → Spec Pipeline → Standard Flow

---

## Framework Boundaries (Layer Compliance)

| Layer | Status | Protected | Examples |
|-------|--------|-----------|----------|
| L1 Core | ✅ PROTECTED | .aiox-core/core/, bin/aiox.js | Code intelligence, execution engine |
| L2 Templates | ✅ PROTECTED | tasks/, workflows/, checklists/ | Cannot create new task structure |
| L3 Config | ⚠️ CONDITIONAL | .aiox-core/data/, MEMORY.md | Allow rules permit specific edits |
| L4 Runtime | ✅ MUTABLE | docs/stories/, squads/, tests/ | Always editable by users |

---

## Workflow Connectivity

```
PROJECT.md (root context)
    ↓
CLAUDE.md (rules + context)
    ↓
Constitution.md (inviolable principles)
    ├→ agent-authority.md (exclusive ops)
    ├→ workflow-execution.md (4 primary workflows)
    ├→ story-lifecycle.md (SDC phases)
    └→ planning-tracks.md (Quick/Standard/Enterprise)

Execution:
Epic (via @pm) → Stories (via @sm/@po) → Implementation (via @dev/@qa) → Deployment (via @devops)
```

---

## Dependency Analysis

**Strong dependencies:**
- @sm depends on: @po (validation), PROJECT.md (epic context)
- @dev depends on: story.md (AC), @qa (review), @architect (design)
- @devops depends on: @qa (approval), @dev (ready code)

**Weak dependencies:**
- @analyst can run independently (research)
- @architect can run independently (design decisions)
- @ux-design-expert can run independently (design)

---

## Structural Audit Results

✅ **Passed:**
- All 13 agents defined with clear authority boundaries
- No conflicting exclusive operations
- Delegation chain is valid (no cycles)
- Layer protection enforced via deny rules
- Constitution principles consistently applied

⚠️ **Observations:**
- 120+ tasks (consider archiving unused tasks)
- 3 external executors defined (codex, others)
- MCP governance delegated to @devops (correct)

❌ **Issues Found:**
- None — framework is structurally sound

---

## Quick Reference

**To activate an agent:** `@agent-name` or `/AIOX:agents:agent-name`

**To run an agent command:** `*command-name` (e.g., `*create-story`)

**To understand a workflow:** See `.claude/rules/workflow-execution.md`

**To check authority rules:** See `.claude/rules/agent-authority.md`

**To audit structure:** Run `/aiox-map --graph` for visual

---

*Generated by Anvil — AIOX Cartographer*  
*Source: .aiox-core/development/ + .claude/rules/*
