# EPIC-12 PRD — Agent Framework Testing Phase 1

**Status:** Ready for Story Creation  
**Created:** 2026-06-15 (Cont 42)  
**Updated:** 2026-06-15 (Cont 43) — enriched with research insights: §5.5 research-derived testing principles (spec-driven determinism, ensemble validation, barrier sync), §8.5 anti-patterns, §9.5 Production Readiness 7-domain checklist, §9.7 phase barriers  
**Owner:** @pm (Morgan) / @po (Pax)  
**Canonical file:** `docs/stories/epics/EPIC-12-PRD.md` (alias: `EPIC-12-AGENT-TESTING-PRD.md`)

---

## 1. EXECUTIVE SUMMARY

**What:** Comprehensive testing of AIOX framework agents (12), workflows (4), and gates (7) to validate synchronization and remediate audit gaps.

**Why:** Morgan's audit (Cont 40) identified 31 operational gaps + 21 ambiguities. EPIC-12 testing provides evidence trail for each gap remediation and validates framework integrity.

**Success:** 100% agent file coverage, zero agents skipped, all gaps explained/remediated, all workflows end-to-end tested.

**Effort:** 40-50 story points  
**Timeline:** 2-3 weeks  
**Team:** @dev (implementation), @qa (gates), @sm (story creation), @pm (PRD)

---

## 2. BUSINESS CONTEXT

### Problem Statement

Current AIOX framework state:
- 12 agents exist, but coverage is incomplete
- Agent activation chain has gaps (session field missing)
- @devops authority gates block certain operations
- Workflow state machine has edge case ambiguities
- 31 specific operational gaps verified
- 21 ambiguities in responsibility boundaries + state transitions

**Impact:**
- Cannot trust agent execution without validation
- Framework sync status unknown
- Cannot deploy with confidence

### Solution

Execute **Phase 1 Agent Framework Testing** — a structured, end-to-end audit using stories and quality gates to:
1. **Validate** each agent's syntax, dependencies, and workflow integration
2. **Test** all 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield)
3. **Enforce** all 7 constitutional gates (Art. I-VII)
4. **Remediate** all 31 gaps identified by Morgan
5. **Clarify** all 21 ambiguities (documentation updates)

---

## 3. SCOPE & CONSTRAINTS

### In Scope

✅ **12 Agents (all):**
- @dev, @qa, @architect, @pm, @po, @sm, @analyst, @data-engineer, @devops, @ux-design-expert, @aiox-master, @squad-creator

✅ **4 Workflows (all):**
- Story Development Cycle (SDC)
- QA Loop (iterative review)
- Spec Pipeline (pre-implementation)
- Brownfield Discovery (legacy assessment)

✅ **7 Gates (all):**
- Art. I: CLI First
- Art. II: Agent Authority (devops exclusive)
- Art. III: Story-Driven Development
- Art. IV: No Invention
- Art. V: Quality First
- Art. VI: Absolute Imports
- Art. VII: Framework Boundary

✅ **31 Gaps (all) + 21 Ambiguities (all):**
- Each gap receives testing task
- Each ambiguity receives documentation task
- Evidence trail required

### Out of Scope

❌ Implementation of new features (testing only)  
❌ Fixing L1/L2 code (L4 only, or escalate via `*propose-modification`)  
❌ Performance optimization (identified but not fixed in Phase 1)  
❌ New agent creation (testing existing agents only)

---

## 4. ACCEPTANCE CRITERIA

**Epic Success = ALL of the following:**

| Criterion | Target | How Measured |
|-----------|--------|--------------|
| **Agent Coverage** | 12/12 agents tested | Each agent has passing story (12.1-12.12) |
| **No Agents Skipped** | 0 skipped | @qa gate verifies all 12 stories PASS |
| **Workflow Testing** | 4/4 workflows end-to-end | SDC, QA Loop, Spec Pipeline, Brownfield all tested |
| **Gate Enforcement** | 7/7 gates verified active | Constitutional gates (Art. I-VII) all operational |
| **Gap Remediation** | 31/31 gaps explained | Story 12.6 (gap evidence) traces each gap to testing task or L1/L2 escalation |
| **Ambiguity Clarification** | 21/21 ambiguities documented | Documentation updates in `.claude/rules/` or story AC clarify all 21 |
| **File Coverage** | 100% | No orphaned agent files, all dependencies loaded |
| **QA Gate Result** | PASS on all stories | No FAIL verdicts, PASS or CONCERNS with notes |

---

## 5. TECHNICAL APPROACH (MAESTRO/SPECA Framework)

### Layer Validation (MAESTRO)

Each agent story follows MAESTRO multi-layer audit pattern:

| Layer | Agent Focus | Testing Task |
|-------|------------|--------------|
| **L1** Core Logic | @aiox-master | Verify agent definition, core commands load |
| **L2** Templates | @sm | Verify agent story templates apply correctly |
| **L3** Config | @po | Verify agent memory files, rules load |
| **L4** Runtime | @dev | Verify agent executes in real workflow |

### Specification Tracing (SPECA)

Each story validates agent against documented spec:
1. **Component mapping** — Agent file → `.claude/CLAUDE.md` specification
2. **Dependency tracing** — Agent commands → documented outputs
3. **Workflow integration** — Agent role in SDC/QA Loop/Spec Pipeline/Brownfield
4. **Gap comparison** — Actual vs Morgan's audit findings

### Research-Derived Testing Principles (Cont 43 research, 82/100)

Three patterns from `docs/research/2026-06-15-framework-architecture/` are MANDATORY in how each story is written and executed:

| Principle | What it means for EPIC-12 | Where applied |
|-----------|---------------------------|---------------|
| **Specification-Driven Determinism** | ACs are precise and reproducible, never vague natural language. Same spec → same verdict, regardless of which agent executes the test. No "should work well" — only measurable, binary criteria. | Every AC in 12.1-12.12 (source: research §3 / recommendations #3) |
| **Ensemble Validation** | No single agent self-certifies. Each tested agent is validated by ≥2 independent roles (the agent under test + @qa gate + cross-story integration). Multi-role agreement is required for PASS. | Per-story gate (§9) + Epic gate (source: research recommendations, EPIC-8 multi-model precedent) |
| **Barrier Synchronization** | Explicit phase gates. No story in Week N+1 starts until the Week N barrier (entry/exit criteria, §9.7) is cleared. Prevents partial-completion drift. | Phase gates (§9.7) + Timeline (§13) (source: research §4 synchronization) |

**Task-First contract model** (research recommendation #6): each story is written as a *task contract* (inputs / outputs / acceptance_criteria), with the agent as interchangeable executor. The contract is law; the executor is replaceable. This directly satisfies the audit insight that tasks — not agents — are the unit of guarantee.

---

## 5.5 ARCHITECTURE FOUNDATION (Phase 1 Architecture Design)

**Reference:** `docs/architecture/agent-context-determinism-architecture.md` (Aria, Cont 45)

### Problem Solved by This Architecture

**Current state:** Agents load ~16% context (ambiguous, gaps, invention risk)  
**Target state:** Agents load 95%+ context (deterministic, zero gaps, no invention)  

**Key gap identified:** Shim-persona integration (shim 102 ln can't auto-load persona 887 ln)  
**Solution:** Enhanced shim activation auto-loads persona + tasks + workflows + memory = 937+ lines context

### 5 Design Patterns (Research-Backed, 82/100 Coverage)

1. **Clean Architecture → L1/L2/L3/L4 Layering**
   - L1 (Framework core): immutable, deny-rule protected
   - L2 (Framework templates): extend-only
   - L3 (Project config): mutable with governance
   - L4 (Project runtime): always mutable

2. **Orchestrator-Worker → Central Agent Routing**
   - @aiox-master (Orion) orchestrates workflow, agent sequencing
   - Registry maps task types → agent responsibilities
   - Authority explicit (Art. II: devops exclusive)

3. **Spec-Driven Determinism → 150-Feature Specs**
   - PRDs: 30-50 lines structured (FRs/NFRs/edge cases/gates)
   - Stories: 10-15 lines + 5-10 AC (Given/When/Then)
   - Quality gates: 7 checks (code, tests, AC, regression, perf, security, docs)

4. **RAG + Knowledge Management → Multi-Tier Context Loading**
   - Tier A (Always): Constitution + rules + workflows
   - Tier B (On role): Agent-specific tasks/templates/memory
   - Tier C (On demand): Registry, configs (cached)
   - Result: 2500-4000 tokens (95%+ coverage, +35% overhead)

5. **Guardrails & Safety → 7 Constitutional Gates**
   - Art. I (CLI First), Art. II (Agent Authority), Art. III (Story-Driven), Art. IV (No Invention), Art. V (Quality First), Art. VI-VII (Boundary)
   - Gates enforced at hook layer (PreToolUse, etc.)
   - Decision logs + metrics for audit trail

---

## 5.6 FUNCTIONAL REQUIREMENTS (Derived from 5 Design Patterns)

### From Pattern 1: Clean Architecture (L1/L2/L3/L4)

| ID | Requirement | Acceptance | Maps to Stories |
|----|-------------|-----------|----------------|
| **FR-1.1** | L1 framework core (.aiox-core/core/) must be protected from writes | Deny rules in .claude/settings.json block all Write/Edit to L1 | 12.11 (@aiox-master) |
| **FR-1.2** | L2 framework templates must be extend-only (no overwrites) | Deny rules prevent Write/Edit to .aiox-core/development/ | 12.11 (@aiox-master) |
| **FR-1.3** | L4 project runtime (docs/stories/, squads/, tests/) must be always mutable | Write/Edit to L4 never blocked, full developer control | 12.1-12.6 all stories test L4 mutability |
| **FR-1.4** | Layer boundaries must be enforced at hook layer (PreToolUse) | enforce-quality-gates.cjs detects and blocks cross-layer violations | 12.11 + gate testing in all stories |

### From Pattern 2: Orchestrator-Worker

| ID | Requirement | Acceptance | Maps to Stories |
|----|-------------|-----------|----------------|
| **FR-2.1** | @aiox-master must route all tasks to appropriate specialized agents | Smart routing via .claude/rules/smart-routing.md decision tree works | 12.11 (@aiox-master) |
| **FR-2.2** | @devops authority (Art. II) must be enforced exclusively for git push/PR | enforce-agent-authority.cjs blocks non-@devops push/PR attempts | 12.9 (@devops testing) |
| **FR-2.3** | Agent authority must be explicit in .claude/rules/agent-authority.md | Agent matrix (who can do what) is canonical, no ambiguity | 12.11 (@aiox-master) + all agent stories |
| **FR-2.4** | Agent registry (entity-registry.yaml) must map task types → responsible agents | Registry lookups work, task routing is deterministic | 12.11 + 12.12 (@squad-creator) |

### From Pattern 3: Spec-Driven Determinism

| ID | Requirement | Acceptance | Maps to Stories |
|----|-------------|-----------|----------------|
| **FR-3.1** | PRDs must be structured (FRs/NFRs/edge cases/gates, 30-50 lines) | EPIC-12-PRD.md + story PRDs follow template, no vague language | 12.4 (@pm) |
| **FR-3.2** | Stories must have precise AC (Given/When/Then format, 5-10 ACs) | All story AC are measurable and reproducible (not "should work well") | 12.1-12.12 all stories have precise AC |
| **FR-3.3** | Acceptance criteria must be 100% traceable to requirements | Every AC traces to FR/NFR in this PRD, no invented criteria | 12.6 (@sm) gap traceability matrix |
| **FR-3.4** | CodeRabbit auto-review must detect pattern violations | Auto-review catches code outside spec scope | 12.1 (@dev) testing |

### From Pattern 4: RAG + Context Loading

| ID | Requirement | Acceptance | Maps to Stories |
|----|-------------|-----------|----------------|
| **FR-4.1** | Agent activation must load Tier A (Constitution + rules) deterministically | Agent loads .aiox-core/constitution.md + .claude/rules/* on activation | 12.1-12.12 all stories verify this |
| **FR-4.2** | Shim must auto-load persona (102 ln shim → 937+ ln context) | Shim activation reads persona + tasks + workflows + memory | 12.1-12.2 (shim enhancement story) |
| **FR-4.3** | Context loading must complete in <500ms on agent activation | Measured load time < 500ms, no timeout failures | 12.9-12.10 performance testing |
| **FR-4.4** | Agent memory must persist between sessions (handoff protocol) | Memory files in .claude/agent-memory/ auto-loaded, context carries forward | 12.1-12.12 all stories test session continuity |

### From Pattern 5: Guardrails & Safety

| ID | Requirement | Acceptance | Maps to Stories |
|----|-------------|-----------|----------------|
| **FR-5.1** | 7 Constitutional gates must be active and enforced | All 7 gates (Art. I-VII) function, violations are blocked/logged | 12.1-12.12 all stories + gate validation |
| **FR-5.2** | Gate decisions must be audit-logged (JSONL format) | .aiox/gate-logs/ contains timestamped decision logs, searchable | 12.11 (@aiox-master) |
| **FR-5.3** | No gate can fail silently | All gate verdicts recorded, metrics tracked in .synapse/metrics/ | 12.11 (@aiox-master) |
| **FR-5.4** | Art. IV (No Invention) must prevent spec statements without traceability | enforce-no-invention.cjs warns/blocks statements not traced to requirements | 12.1-12.6 all stories validate |

---

## 5.7 NON-FUNCTIONAL REQUIREMENTS (Derived from Guarantees)

### Performance & Efficiency

| ID | Requirement | Target | Maps to Stories |
|----|-------------|--------|----------------|
| **NFR-1.1** | Agent context load time | <500ms on activation | 12.9-12.10 |
| **NFR-1.2** | Token overhead for +95% context | ≤+35% (1500 → 2000 tokens) | 12.9-12.10 |
| **NFR-1.3** | Cache hit rate (session + agent levels) | >80% | 12.9-12.10 |
| **NFR-1.4** | Framework registry resolution | <100ms per entity lookup | 12.11-12.12 |

### Determinism & Reliability

| ID | Requirement | Target | Maps to Stories |
|----|-------------|--------|----------------|
| **NFR-2.1** | Zero ambiguities in agent authority | 100% authority explicit in agent-authority.md | 12.1-12.12 |
| **NFR-2.2** | Workflow state transition determinism | 100% (state transitions locked, no loops/skips) | 12.1-12.6 workflow testing |
| **NFR-2.3** | Context gap coverage on activation | 95%+ (38 TIER 1/2/3 files loaded) | 12.1-12.12 |
| **NFR-2.4** | Story status edge case coverage | 100% (Draft→Ready→InProgress→InReview→Done transitions all tested) | 12.1-12.5 |

### Quality & Auditability

| ID | Requirement | Target | Maps to Stories |
|----|-------------|--------|----------------|
| **NFR-3.1** | QA gate check coverage | 7/7 checks on every story | 12.2 (@qa) |
| **NFR-3.2** | Gap remediation evidence trail | 31/31 gaps traced to story or escalation | 12.6 gap matrix |
| **NFR-3.3** | Ambiguity clarification documentation | 21/21 ambiguities documented in .claude/rules/ | 12.1-12.12 |
| **NFR-3.4** | Agent file coverage | 100% (12/12 agents tested, 0 skipped) | 12.1-12.12 |

### Consistency & Traceability

| ID | Requirement | Target | Maps to Stories |
|----|-------------|--------|----------------|
| **NFR-4.1** | AC to FR/NFR traceability | 100% (every AC links to FR/NFR) | 12.1-12.12 story AC |
| **NFR-4.2** | No dangling file references | 0 (all agent files, templates, tasks exist) | 12.1-12.12 |
| **NFR-4.3** | Constitutional gate decision logs | 100% audit trail (JSONL, timestamped) | 12.11 gate logging |
| **NFR-4.4** | Hand-off context preservation | 100% (memory carries forward, zero loss between sessions) | 12.1-12.12 continuity testing |

---

## 6. STORY BREAKDOWN (12 Stories, ~4-5sp each)

### Core Agents (Stories 12.1-12.6) — Week 1

| Story | Agent | Focus | FRs | NFRs | Effort |
|-------|-------|-------|-----|------|--------|
| **12.1** | @dev | Developer implementation, YOLO/Interactive modes, CodeRabbit integration | FR-3.4, FR-4.1/4.4 | NFR-2.3, NFR-3.1 | 5sp |
| **12.2** | @qa | QA gates (PASS/CONCERNS/FAIL verdicts), evidence validation | FR-5.1/5.2/5.3, FR-3.3 | NFR-3.1, NFR-4.3 | 4sp |
| **12.3** | @architect | Architecture decisions, tech stack validation, design authority | FR-1.4, FR-2.3 | NFR-2.1, NFR-2.2 | 4sp |
| **12.4** | @pm | PRD creation, epic orchestration, requirements tracing | FR-3.1/3.2, FR-2.1 | NFR-4.1 (traceability) | 4sp |
| **12.5** | @po | Story validation (10-point checklist), backlog management | FR-3.3, FR-2.3 | NFR-2.4, NFR-3.2 | 4sp |
| **12.6** | @sm | Story creation from templates, epic context tracking | FR-3.2, FR-3.3 | NFR-3.3, NFR-4.2 | 4sp |

**Week 1 Subtotal:** 25sp

### Specialist Agents (Stories 12.7-12.12) — Week 2

| Story | Agent | Focus | FRs | NFRs | Effort |
|-------|-------|-------|-----|------|--------|
| **12.7** | @analyst | Research tasks, evidence gathering, gap analysis | FR-3.1, FR-5.4 | NFR-3.2, NFR-4.1 | 4sp |
| **12.8** | @data-engineer | Schema design, migrations, RLS policies | FR-1.3, FR-2.4 | NFR-2.3, NFR-4.2 | 4sp |
| **12.9** | @devops | git operations (exclusive), CI/CD, MCP management | FR-2.2 (Art. II exclusive), FR-5.1/5.2 | NFR-1.1/1.2/1.3, NFR-4.3 | 5sp |
| **12.10** | @ux-design-expert | UX/UI design, accessibility, component design | FR-1.3, FR-3.2 | NFR-2.3, NFR-4.2 | 4sp |
| **12.11** | @aiox-master | Framework governance, agent orchestration, constitutional enforcement | FR-1.1/1.2/1.4, FR-2.1/2.3, FR-5.1/5.2/5.3 | NFR-2.1, NFR-4.3, NFR-4.4 | 5sp |
| **12.12** | @squad-creator | Squad creation, agent cloning, team orchestration | FR-2.4, FR-4.2, FR-4.4 | NFR-2.3, NFR-4.4 | 4sp |

**Week 2 Subtotal:** 30sp

### Integration & Gap Remediation — Week 3

**Story 12.13** (implicit): Cross-story gap remediation + documentation updates  
**Story 12.14** (implicit): Integration testing (all workflows validated end-to-end)

**Week 3 Subtotal:** 10-15sp (depends on gap complexity)

**Total:** 40-50sp ✓

---

## 7. MORGAN'S AUDIT INTEGRATION

### 31 Gaps — Testing Mapping

**16 Operational Gaps:**
- Gap #1-#5: Agent activation chain issues → Stories 12.11, 12.1-12.6 test
- Gap #6-#10: @devops authority enforcement → Story 12.9 (devops testing)
- Gap #11-#16: Workflow state machine issues → Stories 12.1-12.6, workflow integration tests

**15 Kronos Ultra-Deep Gaps:**
- Gaps #17-#31: Framework infrastructure + integration → Stories 12.11, 12.12 + cross-story integration

**Evidence Collection (Story 12.6 expanded):**
- Create gap traceability matrix: Gap ID → Story ID → AC tested → Result (PASS/ESCALATE)
- Escalate unfixable L1/L2 gaps via `*propose-modification` with evidence

### 21 Ambiguities — Documentation Mapping

**11 Operational Ambiguities:**
- Story status edge cases → Updated in `.claude/rules/story-lifecycle.md`
- @sm vs @po boundaries → Updated in `.claude/rules/agent-authority.md`
- Workflow state transitions → Updated in `.claude/rules/workflow-execution.md`

**10 Kronos Ambiguities:**
- Agent handoff protocol → HANDOFF-CONT41-TO-CONT42 becomes template
- Registry sync timing → Documented in `.aiox-core/data/registry-update-log.md`

---

## 8. ACCEPTANCE CRITERIA PER STORY

### Generic AC (applies to all 12.1-12.12)

Each agent testing story MUST have:

```markdown
## Acceptance Criteria

### 1. Agent Definition Loaded
- [ ] Agent file (.claude/agents/{agent-name}.md) exists and is readable
- [ ] Agent persona, commands, dependencies clearly documented
- [ ] Agent authority scope matches Constitution (Art. II) and agent-authority.md
- **Maps to:** FR-2.3, NFR-2.1, NFR-4.4

### 2. Dependencies & Commands Validated
- [ ] All agent commands (*command) are defined and documented
- [ ] All referenced tools (Bash, Edit, Read, etc.) available
- [ ] All agent-specific rules loaded (from .claude/rules/)
- [ ] Context load time measured <500ms (if applicable)
- **Maps to:** FR-4.1, NFR-1.1, NFR-2.3

### 3. Memory Files Loaded
- [ ] Agent memory exists: .claude/agent-memory/{agent-name}/MEMORY.md
- [ ] Auto-memory imports working (if applicable)
- [ ] Previous session context accessible (handoff protocol)
- [ ] Session continuity verified (memory carries forward)
- **Maps to:** FR-4.4, NFR-4.4

### 4. Workflow Integration Tested
- [ ] Agent tested in Story Development Cycle (create → validate → implement → review → push)
- [ ] Agent tested in [1 other workflow: QA Loop OR Spec Pipeline OR Brownfield]
- [ ] No workflow blockers identified
- [ ] State transitions are deterministic (no loops, edge cases handled)
- **Maps to:** FR-2.1, NFR-2.2, NFR-2.4

### 5. Morgan's Gaps Addressed
- [ ] [Gap #X] verified as working OR escalated with reason
- [ ] [Gap #Y] verified as working OR escalated with reason
- [ ] (n=2-3 gaps per agent)
- [ ] Gaps traced to gap traceability matrix (Story 12.6)
- **Maps to:** NFR-3.2 (gap remediation evidence)

### 6. Constitutional Gates Tested
- [ ] Agent actions enforced against Art. II (agent authority) gate — FR-2.2
- [ ] Agent actions enforced against Art. III (story-driven) gate — FR-5.1
- [ ] Agent actions enforced against Art. IV (no invention) gate — FR-5.4
- [ ] Agent actions enforced against Art. VII (framework boundary) gate — FR-1.4
- **Maps to:** FR-5.1/5.2/5.3/5.4, NFR-3.1, NFR-4.3

### 7. No Dangling References (FR/NFR Traceability)
- [ ] All agent file references are valid (no 404s)
- [ ] All dependent files exist
- [ ] Every AC references at least 1 FR and 1 NFR (100% traceability)
- [ ] AC are precise, measurable, reproducible (not vague language)
- **Maps to:** FR-3.2/3.3, NFR-4.1, NFR-4.2
```
- [ ] Cross-references verified (agent → rules, agent → workflows)

### 8. Documentation Complete
- [ ] Agent role updated in PROJECT.md (if new)
- [ ] Agent tested scenarios documented in FILE LIST
- [ ] Any ambiguities from Morgan's audit clarified in story notes

### 9. QA Gate Ready
- [ ] No TypeScript errors (if applicable)
- [ ] No syntax errors in agent definition
- [ ] All AC checkboxes passing

### 10. Ready for Implementation (@dev)
- [ ] No blockers identified
- [ ] All test prerequisites met
- [ ] Clear next steps documented
```

---

## 8.5. ANTI-PATTERNS TO AVOID (Research §5)

The research flags three architectural anti-patterns that EPIC-12 stories MUST NOT introduce or perpetuate. Each story author/implementer checks against these:

| Anti-Pattern | Symptom in agent testing | Guard rail |
|--------------|--------------------------|------------|
| **Big Ball of Mud** | A story can't test @dev without entangling @qa logic; no perceivable boundary. | Each story tests ONE agent in isolation; cross-agent behavior tested only in the dedicated integration story (Week 3). |
| **Distributed Monolith** | Story 12.1 (@dev) cannot pass unless 12.2 (@qa) runs first — false modularity. | Stories are independent (research "avoid #2"). The test suite orchestrates dependencies; stories declare them but do not hard-couple. |
| **Security Architecture Debt** | Hardcoded credentials surface in `.claude/`, `.aiox-core/data/`, or agent memory during testing. | Security AC (see §9.5 Production Readiness) runs on every agent: zero secrets in agent files, git history, or memory. |

Plus three execution traps (research "Top 3 to avoid"): **Framework Reinvention** (REUSE > ADAPT > CREATE — reuse EPIC-8 auto-heal, don't build a new test harness), **Modularity Violations** (no inter-story hard dependencies), and **Golden Hammer** (do not reuse the @dev test template verbatim for @architect — customize ACs per agent domain).

---

## 9. QUALITY GATES (QA Checkpoint)

### Per-Story Gate (Stories 12.1-12.12)

**Gate Rule:** `@qa *qa-gate story={story-id}`

**Verdict Options:**
- ✅ **PASS** — All AC met, zero gaps, ready for integration
- ⚠️ **CONCERNS** — AC met but with notes (ambiguities clarified in story notes)
- ❌ **FAIL** — AC not met, return to @dev for fixes
- 🔇 **WAIVED** — Blocked by L1/L2 escalation, documented

### Epic Gate (Final, after all 12 stories)

**Gate Rule:** `@qa *qa-gate epic=EPIC-12`

**Verdict:** ALL stories PASS or (CONCERNS with complete notes) → EPIC-12 PASS

### 9.5. Production Readiness Checklist (7 Domains)

Per research recommendation #5, the testing framework itself must be production-ready BEFORE EPIC-12 ships. Target: **≥70% complete** at Epic gate (research §"Success Criteria" #7). Distributed as ~3-5sp across the 12 stories.

| # | Domain | Checklist items | Owner | Evidence |
|---|--------|-----------------|-------|----------|
| 1 | **Security** | No secrets in `.claude/`, `.aiox-core/data/`, or agent memory; git history clean; Art. II push-authority enforced; audit log of agent actions exists | @qa + @devops | `git log` scan + gate-logs |
| 2 | **Monitoring** | Agent execution metrics captured in `.synapse/metrics/hook-metrics.json`; error-rate tracking per agent; activation-tracker functional | @dev | hook-metrics.json deltas |
| 3 | **Performance** | SLO defined per agent task (p95 < 2s median response); no test exceeds 3x token budget | @qa | timing-logger data |
| 4 | **Error Handling** | Each agent degrades gracefully on bad input (invalid story ID → informative error, not crash); gates fail-safe not fail-open | @dev | error-path test in each story AC |
| 5 | **Backup / Persistence** | Test-suite results persisted (`.aiox/task-logs/12.*.json`); gate verdicts logged; gap-traceability matrix saved | @dev + @qa | task-logs present |
| 6 | **Configuration** | Test configs externalized (no hardcoded paths in stories); `core-config.yaml` drives behavior; boundary toggle respected | @po | config refs in stories |
| 7 | **Documentation** | Runbook for test failures; 21 ambiguities clarified in `.claude/rules/`; each agent's tested scenarios in File List | @sm + @analyst | rules/ + story File Lists |

**Gate rule:** Production Readiness is scored at the Epic gate as `(items passed) / (total applicable)`. < 70% → Epic gate is CONCERNS (not FAIL) with a remediation backlog; the 7-domain coverage carries into the V4 roadmap.

### 9.7. Phase Gates — Barrier Synchronization (Research §4)

Explicit barriers between phases. A barrier MUST clear before the next phase begins — no overlapping partial completion.

| Barrier | Entry criteria | Exit criteria (must ALL hold) |
|---------|----------------|-------------------------------|
| **B0 → Week 1** | PRD approved (this doc); Morgan's 31 gaps + 21 ambiguities extracted; 12 stories created + @po-validated (≥7/10) | All 12 stories status = Ready |
| **Week 1 → Week 2** | Core-agent stories (12.1-12.6) implemented | 12.1-12.6 all QA PASS/CONCERNS; zero FAIL outstanding |
| **Week 2 → Week 3** | Specialist-agent stories (12.7-12.12) implemented | 12.7-12.12 all QA PASS/CONCERNS; all 12 agents covered |
| **Week 3 → Done** | Integration + gap remediation executed | 31/31 gaps explained-or-escalated; 21/21 ambiguities documented; 4/4 workflows E2E; Production Readiness ≥70%; Epic gate PASS |

---

## 10. SUCCESS METRICS

### Quantitative

| Metric | Target | Unit |
|--------|--------|------|
| Agent Coverage | 12/12 | agents |
| Gap Remediation | 31/31 | gaps (explained/resolved) |
| Ambiguity Clarification | 21/21 | ambiguities (documented) |
| Workflow Testing | 4/4 | workflows |
| Gate Enforcement | 7/7 | gates verified |
| QA Verdicts | 12x PASS or CONCERNS | stories |
| File Coverage | 100% | of agent files |
| Production Readiness | ≥ 70% | of 7-domain checklist (§9.5) |
| Ensemble Validation | ≥ 2 roles per agent | independent validators (no self-cert) |
| Phase Barriers Cleared | 4/4 | B0→W1, W1→W2, W2→W3, W3→Done (§9.7) |

### Qualitative

- [ ] Framework consistency validated (no contradictions between agent definitions)
- [ ] Authority boundaries clear (no role confusion)
- [ ] Workflow state machine understood (edge cases documented)
- [ ] Governance rules enforceable (gates work as designed)
- [ ] Team confidence high (ready for production agent deployment)

---

## 11. DEPENDENCIES & BLOCKERS

### Pre-Requisites (MUST be done before 12.1)

- [ ] Morgan's audit read and extracted (31 gaps + 21 ambiguities details)
- [ ] 6 diagnostic commands executed (real framework data)
- [ ] EPIC-12 PRD approved (this document)

### Known Blockers

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| Gap #4, #11 require L1/L2 changes | 2 gaps unfixable in L4 | Escalate via `*propose-modification`, document in story 12.6 |
| Agent memory not loaded (session field missing) | Blocks activation | Story 12.11 addresses session field gap |
| @devops gate might be overly restrictive | Might FAIL story 12.9 | Adjust gate rules post-testing, document |

---

## 12. RESOURCES & REFERENCES

### Key Documents (Read Before Stories)

1. **Morgan's Audit** — `docs/audits/` or STATE.md lines 1-100
   - Extract: All 31 gaps with details
   - Extract: All 21 ambiguities with details

2. **Constitution** — `.aiox-core/constitution.md`
   - Reference: Art. I-VII enforcement rules

3. **Agent Authority** — `.claude/rules/agent-authority.md`
   - Reference: Agent delegation matrix

4. **Story Lifecycle** — `.claude/rules/story-lifecycle.md`
   - Reference: Status transitions, QA gate verdicts

5. **Framework Architecture** — `docs/ARCHITECTURE.md` (from Story 10.1)
   - Reference: Layer map, boundaries

### Research Document

- **Framework Audit Skills Research** — `docs/research/2026-06-15-framework-audit-skills/`
  - MAESTRO checklist (§ 3.1) — use for L1-L4 validation
  - SPECA methodology (§ 3.2) — use for specification tracing
  - Authority matrices (§ 4.2) — use for agent role testing
  - Gap categories (§ 2.1) — use to classify Morgan's gaps

---

## 13. TIMELINE

### Cont 42 (This Session) — ~4 hours

- [ ] Create EPIC-12 PRD (this document) — 30 min
- [ ] Create 12 testing stories (12.1-12.12) — 45 min
- [ ] @po validate all stories (10-point checklist) — 15 min
- [ ] Stories ready for @dev — All stories "Ready" status

### Cont 43-44 — Week 1-2

- [ ] @dev implements stories 12.1-12.6 (core agents) — ~3-4 days
- [ ] @qa gates each story — continuous
- [ ] @dev implements stories 12.7-12.12 (specialist agents) — ~3-4 days
- [ ] @qa final verification — day 10

### Cont 45 — Week 3

- [ ] Gap remediation + integration testing — 3-5 days
- [ ] Documentation updates (21 ambiguities) — 1-2 days
- [ ] Final QA gate (EPIC-12 verdict) — 1 day
- [ ] @devops push to remote — done

---

## 14. OWNERSHIP & ESCALATION

| Role | Responsibility |
|------|-----------------|
| **@pm (Morgan)** | EPIC-12 PRD (this doc), goal-setting, stakeholder comms |
| **@sm (River)** | Create 12 testing stories, epic context, dependencies |
| **@po (Pax)** | Validate 12 stories (10-point checklist), approvals |
| **@dev (Dex)** | Implement all 12 stories, bug fixes, integration |
| **@qa (Quinn)** | QA gates, verdict decisions, evidence validation |
| **@architect (Aria)** | Design review, architecture implications, L1/L2 escalations |
| **@devops (Gage)** | Final push, release management, CI/CD verification |

### Escalation Path

Gap unfixable in L4 → Story notes → @architect → `*propose-modification` → @aiox-master decision

---

## 15. SIGN-OFF

**PRD Status:** ✅ READY FOR STORY CREATION

**Approved By:** @pm (this session)  
**Reviewed By:** @po (pending)  
**Next Action:** @sm *create-story EPIC=12, create 12 testing stories

---

**End of PRD**
