# 🔧 AGENT AUTO-LOADING REQUIREMENTS
**For:** Phase 1 Architecture Design (@architect)  
**Status:** Master specification of what each agent MUST load on activation  
**Purpose:** 100% deterministic context loading (95%+ coverage, zero ambiguity)

---

## 🎯 CENTRAL REQUIREMENT (From Pedro)

**When any agent is activated or called:**
```
Agent activation (@dev, @architect, @pm, etc.)
    ↓
AUTOMATIC DETERMINISTIC LOADING of:
    1. All rules (16 files from .claude/rules/)
    2. Full hierarchy & authority (Art. I-VII)
    3. Agent-specific dependencies (tasks, workflows, templates, skills)
    4. Agent-specific memory (continuity between sessions)
    5. Context bindings (what this agent can/must do)
    6. Zero ambiguity, zero invention — everything is explicit
```

---

## 📋 UNIVERSAL LOAD (ALL AGENTS)

**Every agent, on activation, MUST load:**

### Tier 1: Constitution & Authority (NON-NEGOTIABLE)

```
.aiox-core/constitution.md                    → Articles I-VII (enforcement baseline)
.claude/rules/agent-authority.md              → Who can do what (CRITICAL)
.claude/rules/enforcement-gates.md            → Art. II/III/IV/V/VI/VII gates
.claude/rules/confidence-scoring.md           → 90%/70%/< 70% decision tiers
```

### Tier 2: Process Framework (REQUIRED)

```
.claude/rules/workflow-execution.md           → 4 workflows (SDC, QA Loop, Spec Pipeline, Brownfield)
.claude/rules/story-lifecycle.md              → Status transitions (Draft → Ready → InProgress → InReview → Done)
.claude/rules/ids-principles.md               → REUSE > ADAPT > CREATE
.claude/rules/smart-routing.md                → Decision tree (quick flow vs standard vs enterprise)
.claude/rules/planning-tracks.md              → Task complexity routing
```

### Tier 3: Quality & Safety (MANDATORY)

```
.claude/rules/token-budget.md                 → Effort budgets (simple/medium/complex)
.claude/rules/tool-examples.md                → Concrete tool usage patterns
.claude/rules/tool-response-filtering.md      → Response normalization
.claude/rules/mcp-usage.md                    → MCP governance (@devops exclusive)
.claude/rules/coderabbit-integration.md       → Auto code review pipeline
```

### Tier 4: Integration & Memory (CONTEXT)

```
.claude/rules/agent-handoff.md                → Handoff protocol (context compaction)
.claude/rules/handoff-consolidation.md        → RUN-LOG consolidation (5+ threshold)
.claude/rules/agent-memory-imports.md         → Memory lifecycle & CLAUDE.md ownership
PROJECT.md                                    → Project context (Kairos Check)
STATE.md                                      → Current session state
docs/ARCHITECTURE.md                          → System architecture
.aiox/gotchas.md                              → Known issues & fixes
```

### Tier 5: Data & Registry (OPERATIONAL)

```
.aiox-core/data/entity-registry.yaml          → 828 entities + dependencies
.aiox-core/data/registry-update-log.jsonl     → Change history
.synapse/metrics/hook-metrics.json            → Gate enforcement metrics
core-config.yaml                              → Framework configuration
```

---

## 🎯 AGENT-SPECIFIC LOAD (By Agent Role)

### @dev (Dex) — Developer

**Base:** Universal Load (above)

**Specific Tasks:**
```
.aiox-core/development/tasks/dev-develop-story.md
.aiox-core/development/tasks/dev-codereview.md
.aiox-core/development/tasks/dev-testing.md
```

**Workflows:**
```
Story Development Cycle (SDC) — Phase 3: Implement
QA Loop (iterative review-fix)
```

**Templates:**
```
story-implementation-tmpl.yaml
code-review-template.md
test-checklist.md
```

**Skills:**
```
.claude/skills/AIOX/agents/dev/SKILL.md
dev-specific commands (*develop-story, *qa-loop, *request-review)
```

**Authority:**
```
✅ CAN: git add, git commit, git status, git branch, git merge (local)
✅ CAN: Update story File List, checkboxes, Dev Notes
❌ CANNOT: git push (delegate to @devops)
❌ CANNOT: gh pr create/merge (delegate to @devops)
❌ CANNOT: Modify AC or scope (delegate to @po)
```

**Memory:**
```
.claude/agent-memory/aiox-dev/
  ├─ MEMORY.md                    → Agent-specific learnings
  ├─ execution-history.md         → Past stories implemented
  └─ decision-log.md              → Key decisions made
```

---

### @qa (Quinn) — QA & Testing

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/qa-gate.md
.aiox-core/development/tasks/qa-loop.md
.aiox-core/development/tasks/qa-review.md
.aiox-core/development/tasks/coderabbit-integration.md
```

**Workflows:**
```
QA Gate (Phase 4 quality checks: 7 checks)
QA Loop (iterative review-fix, max 5 iterations)
Specification Critique (Spec Pipeline Phase 5)
```

**Templates:**
```
qa-gate-template.yaml
qa-checklist-7-points.md
issue-tracking-template.md
waiver-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/qa/SKILL.md
qa-specific commands (*qa-gate, *qa-loop, *qa-review, *escalate-qa-loop)
```

**Authority:**
```
✅ CAN: Mark story Done/InReview via gate verdict
✅ CAN: Return story to @dev with feedback
✅ CAN: PASS/CONCERNS/FAIL/WAIVED decisions
❌ CANNOT: Change story title/AC/scope
❌ CANNOT: Implement code fixes (delegate to @dev)
```

**Memory:**
```
.claude/agent-memory/aiox-qa/
  ├─ qa-history.md               → Gate results
  ├─ recurring-issues.md          → Patterns found across stories
  └─ quality-metrics.md           → Coverage trends
```

---

### @architect (Aria) — Architecture & Design

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/create-doc.md (mode: Pre-Flight Planning)
.aiox-core/development/tasks/architecture-design.md
.aiox-core/development/tasks/complexity-assessment.md
.aiox-core/development/tasks/dependency-analysis.md
```

**Workflows:**
```
Spec Pipeline (Phase 2: Assess complexity, Phase 6: Plan implementation)
Brownfield Discovery (Phase 1: System architecture analysis)
```

**Templates:**
```
architecture-tmpl.yaml
system-diagram-template.md
adr-template.md (Architecture Decision Record)
complexity-assessment-tmpl.yaml
```

**Skills:**
```
.claude/skills/AIOX/agents/architect/SKILL.md
architect-specific commands (*design-architecture, *assess-complexity, *adr)
```

**Authority:**
```
✅ CAN: Design system architecture
✅ CAN: Specify technology decisions
✅ CAN: Identify high-level data architecture
❌ CANNOT: Implement code (delegate to @dev)
❌ CANNOT: Detailed query optimization (delegate to @data-engineer)
❌ CANNOT: UI/UX decisions (delegate to @ux-design-expert)
```

**Memory:**
```
.claude/agent-memory/aiox-architect/
  ├─ design-decisions.md          → Past ADRs
  ├─ technology-rationale.md      → Why X chosen over Y
  └─ pattern-library.md           → Design patterns used
```

---

### @pm (Morgan) — Product Manager

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/create-doc.md (mode: PRD creation)
.aiox-core/development/tasks/prd-creation.md
.aiox-core/development/tasks/epic-management.md
.aiox-core/development/tasks/requirements-gathering.md
```

**Workflows:**
```
Spec Pipeline (Phase 1: Gather, Phase 4: Write Spec, Phase 6 Plan approved)
EPIC orchestration (*execute-epic, *create-epic)
```

**Templates:**
```
prd-tmpl.yaml
epic-tmpl.yaml
requirements-gathering-tmpl.md
spec-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/pm/SKILL.md
pm-specific commands (*create-epic, *execute-epic, *prd-review)
```

**Authority:**
```
✅ CAN: Create/execute epics (*execute-epic, *create-epic)
✅ CAN: Write specs and PRDs
✅ CAN: Gather requirements
✅ CAN: Manage EPIC-{ID}-EXECUTION.yaml
❌ CANNOT: Validate stories (delegate to @po)
❌ CANNOT: Create individual stories (delegate to @sm)
```

**Memory:**
```
.claude/agent-memory/aiox-pm/
  ├─ epic-history.md             → Past epics + outcomes
  ├─ market-research.md           → Competitive intel, user insights
  └─ roadmap-decisions.md         → Strategic choices
```

---

### @po (Pax) — Product Owner

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/validate-next-story.md
.aiox-core/development/tasks/backlog-management.md
.aiox-core/development/tasks/story-validation.md
```

**Workflows:**
```
Story Development Cycle (Phase 2: Validate, 10-point checklist)
```

**Templates:**
```
story-validation-checklist-10.md
acceptance-criteria-tmpl.md
story-context-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/po/SKILL.md
po-specific commands (*validate-story-draft, *prioritize-backlog)
```

**Authority:**
```
✅ CAN: Validate stories (10-point checklist, GO/NO-GO)
✅ CAN: Manage epic context
✅ CAN: Prioritize backlog
✅ CAN: Modify story title/AC/scope (only before Ready)
❌ CANNOT: Create stories (delegate to @sm)
❌ CANNOT: Implement code (delegate to @dev)
```

**Memory:**
```
.claude/agent-memory/aiox-po/
  ├─ validation-patterns.md       → Common GO/NO-GO reasons
  ├─ epic-context.md              → Active epics + priorities
  └─ backlog-decisions.md         → Why X prioritized over Y
```

---

### @sm (River) — Scrum Master

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/create-next-story.md
.aiox-core/development/tasks/story-creation.md
.aiox-core/development/tasks/story-breakdown.md
```

**Workflows:**
```
Story Development Cycle (Phase 1: Create)
```

**Templates:**
```
story-tmpl.md (with title, description, AC, scope, dependencies, complexity)
story-breakdown-template.md
epic-shard-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/sm/SKILL.md
sm-specific commands (*draft, *create-story, *create-next-story)
```

**Authority:**
```
✅ CAN: Create stories from epic/PRD (*draft, *create-story)
✅ CAN: Select story templates
✅ CAN: Breakdown epics into stories
❌ CANNOT: Validate stories (delegate to @po)
❌ CANNOT: Implement code (delegate to @dev)
```

**Memory:**
```
.claude/agent-memory/aiox-sm/
  ├─ story-patterns.md            → Templates reused
  ├─ breakdown-history.md         → Past epic→story sharding
  └─ complexity-learnings.md      → Why estimates were/weren't accurate
```

---

### @analyst (Alex) — Research & Analysis

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/research.md
.aiox-core/development/tasks/competitive-analysis.md
.aiox-core/development/tasks/audit-gaps.md
```

**Workflows:**
```
Spec Pipeline (Phase 3: Research)
Brownfield Discovery (Phase 2: Audit)
```

**Templates:**
```
research-report-template.md
competitive-analysis-template.md
gap-analysis-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/analyst/SKILL.md
analyst-specific commands (*research, *analyze, *audit)
```

**Authority:**
```
✅ CAN: Conduct research
✅ CAN: Analyze frameworks, patterns, gaps
✅ CAN: Reconcile contradictory findings
❌ CANNOT: Make implementation decisions (report findings only)
```

**Memory:**
```
.claude/agent-memory/aiox-analyst/
  ├─ research-sources.md          → Validated sources
  ├─ pattern-library.md           → Design patterns found
  └─ audit-findings.md            → Gap discoveries
```

---

### @data-engineer (Dara) — Database & Data

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/schema-design.md
.aiox-core/development/tasks/migration-planning.md
.aiox-core/development/tasks/db-audit.md
.aiox-core/development/tasks/rls-policies.md
```

**Workflows:**
```
Spec Pipeline (Phase 2: Architect delegates to @data-engineer)
Brownfield Discovery (Phase 2: Database audit)
```

**Templates:**
```
schema-design-template.sql
migration-template.sql
rls-policy-template.sql
db-audit-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/data-engineer/SKILL.md
data-engineer-specific commands (*design-schema, *plan-migration, *audit-db)
```

**Authority:**
```
✅ CAN: Design detailed DDL (delegated from @architect)
✅ CAN: Optimize queries
✅ CAN: Implement RLS policies
✅ CAN: Plan migrations
❌ CANNOT: Make top-level architecture decisions (delegate to @architect)
```

**Memory:**
```
.claude/agent-memory/aiox-data-engineer/
  ├─ schema-history.md            → Past designs
  ├─ migration-learnings.md        → What worked/failed
  └─ performance-notes.md          → Optimization patterns
```

---

### @devops (Gage) — CI/CD, Git Operations

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/git-push.md
.aiox-core/development/tasks/pr-creation.md
.aiox-core/development/tasks/release-management.md
.aiox-core/development/tasks/mcp-management.md
```

**Workflows:**
```
All workflows (final step: @devops *push)
```

**Templates:**
```
commit-message-template.md (conventional commits)
pr-template.md
release-notes-template.md
```

**Skills:**
```
.claude/skills/AIOX/agents/devops/SKILL.md
devops-specific commands (*push, *create-pr, *release, *mcp-*)
```

**Authority (EXCLUSIVE):**
```
✅ CAN ONLY (exclusive): git push, gh pr create/merge, release management, MCP add/remove
❌ CANNOT: Anything else (delegate to appropriate agent)
```

**Memory:**
```
.claude/agent-memory/aiox-devops/
  ├─ push-history.md              → Commits pushed
  ├─ pr-learnings.md              → Review patterns
  └─ release-notes.md             → Past releases
```

---

### @ux-design-expert (Uma) — UX/UI Design

**Base:** Universal Load

**Specific Tasks:**
```
.aiox-core/development/tasks/design-system.md
.aiox-core/development/tasks/wireframe-design.md
.aiox-core/development/tasks/component-design.md
.aiox-core/development/tasks/accessibility-audit.md
```

**Workflows:**
```
Brownfield Discovery (Phase 3: Frontend spec audit)
Spec Pipeline (design review)
```

**Templates:**
```
wireframe-template.md
design-system-template.md
component-spec-template.md
accessibility-checklist.md
```

**Skills:**
```
.claude/skills/AIOX/agents/ux-design-expert/SKILL.md
ux-specific commands (*design-wireframe, *audit-accessibility)
```

**Authority:**
```
✅ CAN: Design UI/UX, create wireframes, define design systems
✅ CAN: Audit accessibility
❌ CANNOT: Make business decisions (delegate to @pm)
❌ CANNOT: Implement frontend code (that's implementation, @dev does it)
```

**Memory:**
```
.claude/agent-memory/aiox-ux-design-expert/
  ├─ design-patterns.md           → Reusable patterns
  ├─ accessibility-learnings.md   → WCAG compliance notes
  └─ user-research.md             → Usability insights
```

---

### @aiox-master (Orion) — Framework Governance

**Base:** Universal Load + Framework-specific

**All Tasks (framework-level):**
```
.aiox-core/core/ (L1) — reads only (never modifies)
.aiox-core/development/ (L2) — reads only (never modifies)
.aiox-core/data/ (L3) — reads + writes (for registry, config)
docs/, squads/, tests/ (L4) — reads + writes
```

**Specific Tasks:**
```
.aiox-core/development/tasks/framework-validation.md
.aiox-core/development/tasks/agent-orchestration.md
.aiox-core/development/tasks/constitution-enforcement.md
.aiox-core/development/tasks/propose-modification.md
```

**Authority (Framework Governance ONLY):**
```
✅ CAN: Framework governance, agent orchestration, workflow-engine mode
✅ CAN: Propose L1/L2 modifications (via *propose-modification)
❌ CANNOT: git push (delegate to @devops)
❌ CANNOT: PR/release (delegate to @devops)
❌ CANNOT: Story creation (delegate to @sm)
❌ CANNOT: Story validation (delegate to @po)
```

**Memory:**
```
.claude/agent-memory/aiox-cerebro/
  ├─ constitution-audit.md        → Art. I-VII enforcement
  ├─ framework-gaps.md            → Known framework issues
  ├─ modification-history.md      → L1/L2 proposals made
  └─ agent-coordination.md        → Cross-agent orchestration notes
```

---

## 📊 LOADING SEQUENCE (Deterministic)

**Every agent activation follows this order:**

```
1. Load Constitution (Art. I-VII) — NON-NEGOTIABLE
2. Load Authority Rules (who can do what)
3. Load Enforcement Gates (prevent violations)
4. Load Workflow Framework (SDC, QA Loop, Spec, Brownfield)
5. Load Story Lifecycle (status transitions)
6. Load Quality & Safety Rules
7. Load Agent-Specific Tasks
8. Load Agent-Specific Workflows
9. Load Agent-Specific Templates
10. Load Agent-Specific Skills
11. Load Agent Memory (session continuity)
12. Load Project Context (PROJECT.md, STATE.md, ARCHITECTURE.md)
13. Load Registry & Data (entity-registry.yaml, config)
14. Load .aiox/gotchas.md (known issues)

Result: Agent has 95%+ context, zero ambiguity, fully deterministic
```

---

## ✅ PHASE 1 REQUIREMENT (For @architect)

**Design the "Auto-Loading System" that implements this specification.**

Key challenges to solve:
- **Lazy vs eager loading:** When to load all 16 rules vs on-demand?
- **Token efficiency:** How to keep overhead at +35% but coverage at 95%?
- **Shim-Persona integration:** How does shim (102 ln) auto-load persona (887 ln)?
- **Memory persistence:** How does session continuity work (handoff protocol)?
- **Cache strategy:** What should be cached vs re-loaded each activation?

---

**Document prepared for Cont 45 (@architect Phase 1)**
