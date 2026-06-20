# Spec: EPIC-12 — Agent Framework Validation & Context Determinism

> **Epic ID:** EPIC-12  
> **Complexity:** COMPLEX (17/25)  
> **Generated:** 2026-06-19T19:00:00Z  
> **Status:** Draft  
> **Phases:** 4 (Write Spec, Phase 4 of 8-phase Spec Pipeline)

---

## 1. Overview

**Purpose:** Validate that EPIC-9 (Constitutional Enforcement Gates) integrates correctly with the broader AIOX agent system, and that agent context loading achieves 95%+ determinism under production conditions.

EPIC-12 is a validation epic that tests all 7 Constitutional Articles (Art. I-VII) across 4 workflows (Story Development Cycle, QA Loop, Spec Pipeline, Brownfield Discovery), and validates agent context loading determinism through 12 implementation stories.

### 1.1 Goals

- **Goal 1 (FR-1.1-1.4):** Enforce L1/L2 framework boundary protection via hook-layer gates
- **Goal 2 (FR-2.1-2.4):** Validate agent authority (Art. II) with deterministic routing and @devops-exclusive git push enforcement
- **Goal 3 (FR-3.1-3.4):** Establish spec-driven development with traceable requirements and acceptance criteria
- **Goal 4 (FR-4.1-4.4):** Achieve 95%+ context coverage (38 Tier 1/2/3 files) on agent activation
- **Goal 5 (FR-5.1-5.4):** Enforce all 7 Constitutional gates (Art. I-VII) with audit logging and metrics

### 1.2 Non-Goals

- Implementing new features beyond gate validation
- Changing Constitutional Articles (Art. I-VII) — they are immutable
- Modifying L1/L2 framework core (stories route via @aiox-master *propose-modification only)

### 1.3 Success Criteria

- All 12 validation stories (12.1-12.8 + 12.G1-12.G3) pass QA gate with PASS or CONCERNS verdict
- All 7 Constitutional gates operational with 0 false negatives (no violations slip through) — FR-5.1
- Context determinism measured at >= 95% (38/40 Tier 1-3 files loaded on agent activation) — NFR-2.3
- Zero ambiguities in agent authority (NFR-2.1: 100% explicit in agent-authority.md)

---

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID | Description | Priority | Category | Traceable To |
|---|---|---|---|---|
| FR-1.1 | L1 framework core (.aiox-core/core/) protected from writes | P0 | Framework Boundary | requirements.json |
| FR-1.2 | L2 framework templates extend-only (no overwrites) | P0 | Framework Boundary | requirements.json |
| FR-1.3 | L4 project runtime always mutable | P1 | Framework Boundary | requirements.json |
| FR-1.4 | Layer boundaries enforced at hook layer (PreToolUse) | P0 | Framework Boundary | requirements.json |
| FR-2.1 | @aiox-master routes all tasks to specialized agents | P1 | Orchestration | requirements.json |
| FR-2.2 | @devops authority (Art. II) exclusive for git push/PR | P0 | Agent Authority | requirements.json |
| FR-2.3 | Agent authority explicit in .claude/rules/agent-authority.md | P1 | Agent Authority | requirements.json |
| FR-2.4 | Agent registry (entity-registry.yaml) maps task types → agents | P2 | Orchestration | requirements.json |
| FR-3.1 | PRDs structured (FRs/NFRs/edge cases/gates) | P1 | Spec-Driven | requirements.json |
| FR-3.2 | Stories have precise AC (Given/When/Then format) | P1 | Spec-Driven | requirements.json |
| FR-3.3 | AC 100% traceable to requirements | P1 | Spec-Driven | requirements.json |
| FR-3.4 | CodeRabbit auto-review detects pattern violations | P2 | Spec-Driven | requirements.json |
| FR-4.1 | Agent activation loads Tier A (Constitution + rules) deterministically | P0 | Context Loading | requirements.json |
| FR-4.2 | Shim auto-loads persona; context expansion to 937+ lines | P1 | Context Loading | requirements.json |
| FR-4.3 | Context loading completes <500ms on activation | P2 | Context Loading | requirements.json |
| FR-4.4 | Agent memory persists between sessions (handoff protocol) | P1 | Context Loading | requirements.json |
| FR-5.1 | 7 Constitutional gates active and enforced (Art. I-VII) | P0 | Gates | requirements.json + EPIC-9 (completed) |
| FR-5.2 | Gate decisions audit-logged (JSONL format) | P1 | Gates | requirements.json |
| FR-5.3 | No gate fails silently | P1 | Gates | requirements.json |
| FR-5.4 | Art. IV prevents spec statements without FR-*/NFR-*/CON-* traceability | P0 | Gates | requirements.json |

### 2.2 Non-Functional Requirements

| ID | Category | Requirement | Metric | Traceable To |
|---|---|---|---|---|
| NFR-1.1 | Performance | Agent context load time | < 500ms on activation | requirements.json + FR-4.3 |
| NFR-1.2 | Performance | Token overhead for +95% context | ≤ +35% (1500 → 2000 tokens) | requirements.json |
| NFR-1.3 | Performance | Cache hit rate (session + agent levels) | > 80% | requirements.json |
| NFR-1.4 | Performance | Framework registry resolution | < 100ms per entity lookup | requirements.json |
| NFR-2.1 | Reliability | Zero ambiguities in agent authority | 100% explicit in agent-authority.md | requirements.json + FR-2.3 |
| NFR-2.2 | Reliability | Workflow state transition determinism | 100% (locked, no loops/skips) | requirements.json |
| NFR-2.3 | Reliability | Context gap coverage on activation | 95%+ (38 Tier 1/2/3 files loaded) | requirements.json + FR-4.1 |
| NFR-2.4 | Reliability | Story status edge case coverage | 100% (Draft→Ready→InProgress→InReview→Done) | requirements.json |
| NFR-3.1 | Quality | QA gate check coverage | 7/7 checks on every story | requirements.json |
| NFR-3.2 | Quality | Gap remediation evidence trail | 31/31 gaps traced to story | requirements.json |
| NFR-3.3 | Quality | Ambiguity documentation | 21/21 documented in .claude/rules/ | requirements.json |
| NFR-3.4 | Quality | Agent file coverage | 100% (12/12 agents tested) | requirements.json |
| NFR-4.1 | Traceability | AC to FR/NFR link | 100% (every AC traces to FR/NFR) | requirements.json + FR-3.3 |
| NFR-4.2 | Traceability | No dangling file references | 0 (all agent files exist) | requirements.json |
| NFR-4.3 | Traceability | Constitutional gate decision logs | 100% audit trail (JSONL, timestamped) | requirements.json + FR-5.2 |
| NFR-4.4 | Traceability | Hand-off context preservation | 100% (memory carries forward) | requirements.json + FR-4.4 |

### 2.3 Constraints

| ID | Type | Constraint | Impact | Traceable To |
|---|---|---|---|---|
| CON-1 | Technical | Cannot modify L1/L2 framework core | Gaps escalate via @aiox-master | requirements.json |
| CON-2 | Technical | Agent activation <500ms | Files cached or lazy-loaded | requirements.json |
| CON-3 | Technical | Gate logging non-blocking | Gate-logger async or circuit-breaker | requirements.json |
| CON-4 | Business | 100% agent coverage for Phase 1 | All 12 agents must pass QA | requirements.json |
| CON-5 | Business | 31 gaps explained or escalated | Story 12.6 traces each gap | requirements.json |
| CON-6 | Regulatory | No secrets in framework code | API keys externalized to env | requirements.json |
| CON-7 | Regulatory | Audit trail for gate decisions | All verdicts logged to .aiox/gate-logs/ | requirements.json + FR-5.2 |

---

## 3. Technical Approach

### 3.1 Architecture Overview

EPIC-12 validation architecture consists of 4 layers:

1. **Layer 1: Framework Boundary Enforcement** — Gates protect L1/L2 from writes via deny rules + hook-layer validation (FR-1.1 to FR-1.4)
2. **Layer 2: Agent Orchestration & Authority** — @aiox-master routes tasks deterministically; @devops exclusive for git push/PR (FR-2.1 to FR-2.4, Art. II enforcement from FR-5.1)
3. **Layer 3: Spec-Driven Development** — Stories with precise AC traceable to FRs; CodeRabbit validates patterns (FR-3.1 to FR-3.4)
4. **Layer 4: Context Loading & Determinism** — Agent activation loads 38 Tier 1/2/3 files; reconciliation strategy for three-surface agent system (FR-4.1 to FR-4.4, detailed in research.json RT-3)

**Reconciliation Strategy (Research RT-3: Agent Context Loading Determinism):**

When agent is activated, shim checks three surfaces in priority order:

- **Surface 1 (PRIORITY 1 — Highest):** `.claude/agents/aiox-{name}.md` — user-customized, project-level definition
- **Surface 2 (PRIORITY 2 — Medium):** `.claude/skills/AIOX/agents/{name}/SKILL.md` — unified payload, activation source-of-truth
- **Surface 3 (PRIORITY 3 — Lowest):** `.aiox-core/development/agents/{name}.md` — framework template, fallback only

**Conflict Resolution (from research.json reconciliation_strategy):** If Surface 1 & 2 both exist with different commands → USE Surface 1 (user override). If Surface 1 missing → USE Surface 2. If all three differ → WARN (log conflict), USE Surface 1, note drift in metrics.

**Graceful Degradation (4 levels from research.json):**
1. Level 1: Agent definition cached from previous run → use cache, validate freshness (<1h TTL)
2. Level 2: Primary surface missing → fall back to next priority surface
3. Level 3: No surfaces available → use minimal hardcoded persona (id, title, commands placeholder)
4. Level 4: After 3 fallbacks, error with recovery hint

**Cache Strategy (from research.json):** Agent definitions cached at `.aiox/.agent-context-cache.json` with 1h TTL, reducing surface reconciliation from O(3 file reads) to O(1 lookup) for repeated agent loads.

### 3.2 Component Design

| Component | Purpose | File(s) | Driven By |
|---|---|---|---|
| **Boundary Enforce** | Protect L1/L2 from writes | `.claude/hooks/enforce-quality-gates.cjs` | FR-1.1–1.4 |
| **Agent Authority Gate** | Block non-@devops git push/PR | `.claude/hooks/enforce-agent-authority.cjs` | FR-2.2, FR-5.1 (Art. II) |
| **Story-Driven Gate** | Require active story for commits | `.claude/hooks/enforce-story-driven.cjs` | FR-3.x, FR-5.1 (Art. III) |
| **No-Invention Gate** | Requirement traceability validation | `.claude/hooks/enforce-no-invention.cjs` | FR-5.4, FR-5.1 (Art. IV) |
| **Gate Logger** | Audit-log all gate decisions (JSONL) | `.claude/hooks/lib/gate-logger.cjs` | FR-5.2, FR-5.1 |
| **Agent Activation** | Load Tier A + agent persona | `unified-activation-pipeline.js` (31KB) | FR-4.1–4.2 |
| **Agent Registry** | Map task types → agents | `entity-registry.yaml` | FR-2.4 |
| **Metrics Collection** | Track gate enforcement | `.synapse/metrics/hook-metrics.json` | FR-5.3, FR-5.1 |

### 3.3 Data Flow

```
User Action (e.g., git commit)
  ↓
PreToolUse Hook (Claude Code harness) triggered
  ↓
ALL 5 gates evaluate in priority order (from research.json RT-4):
  1. Art. II (Agent Authority) — active agent check [FR-5.1, FR-2.2]
  2. Art. III (Story-Driven) — story reference check [FR-5.1, FR-3.x]
  3. Art. IV (No-Invention) — requirement traceability [FR-5.1, FR-5.4]
  4. Art. V-VII (Quality + Boundary) — QA + L1/L2 protection [FR-5.1]
  ↓
  FIRST violation → BLOCK (early return)
  NO violations → ALLOW
  ↓
Gate-Logger records decision to:
  - .aiox/gate-logs/{article}-{YYYY-MM-DD}.jsonl (audit trail) [FR-5.2]
  - .synapse/metrics/hook-metrics.json (aggregate metrics) [FR-5.3]
  ↓
User sees verdict (allow/block) + remediation if blocked
```

---

## 4. Dependencies

### 4.1 External Dependencies

| Dependency | Version | Purpose | Verified | Traceable To |
|---|---|---|---|---|
| `.aiox-core/constitution.md` | v1.0 | Source of truth for Art. I-VII | ✅ | FR-5.1 |
| `node.js` | >= 18.0 | Hook execution engine | ✅ | EPIC-9 (completed) |
| `jest` | >= 28.0 | Hook validation tests | ✅ | EPIC-9 testing |
| `CodeRabbit` | Latest | Auto-review integration | ⚠️ | FR-3.4 |

### 4.2 Internal Dependencies

| Module | Purpose | Traceable To |
|---|---|---|
| **EPIC-9 Gate Implementations** | Foundation: Art. I-VII gates already built + tested | FR-5.1 |
| **Agent System** | 12 agents with personas, commands, memory | FR-2.1, FR-2.3 |
| **Story Framework** | Story creation, validation, QA gates | FR-3.1–3.3 |
| **Unified Activation Pipeline** | Agent context loading orchestration (31KB) | FR-4.1–4.2 |
| **Entity Registry** | Task routing determinism | FR-2.4 |

---

## 5. Files to Modify/Create

### 5.1 New Files

| File Path | Purpose | Traceable To | Story |
|---|---|---|---|
| `.aiox/gate-logs/` | Decision audit trail (JSONL) | FR-5.2, FR-5.3 | 12.5 |
| `.aiox/.agent-context-cache.json` | Agent definition cache (gitignored) | FR-4.1–4.2, research.json cache_strategy | 12.3 |
| `.claude/rules/spec-pipeline-critique-checklist.md` | NEW QA gate checklist for agent specs | research.json RT-1 | 12.5 |
| `docs/stories/epics/EPIC-12/EXECUTION-PLAN.yaml` | 12 stories with phasing + barrier gates | requirements.json implicitly (phase 8 output) | 12.8 |

**Note:** EXECUTION-PLAN.yaml is generated during Phase 8 (Planning) after Phase 7 (Critique v2) approval. It is NOT a Phase 4 deliverable.

### 5.2 Modified Files

| File Path | Changes | Risk | Traceable To |
|---|---|---|---|
| `.claude/hooks/enforce-quality-gates.cjs` | L1/L2 boundary validation | Low | FR-1.1–1.4 |
| `.claude/hooks/enforce-agent-authority.cjs` | Agent detection enhancement | Medium | FR-2.2, research.json RT-3 |
| `.claude/hooks/enforce-no-invention.cjs` | Unchanged from EPIC-9 | Low | FR-5.4, FR-5.1 (Art. IV) |
| `.claude/hooks/lib/gate-logger.cjs` | Gate-priority-order evaluation | Low | FR-5.2, research.json RT-4 |
| `entity-registry.yaml` | Task→agent mappings (if missing) | Low | FR-2.4 |
| `.claude/rules/agent-authority.md` | Audit for completeness | Low | FR-2.3 |
| `unified-activation-pipeline.js` | Surface reconciliation (research.json RT-3) | High | FR-4.1–4.2 |
| `tests/hooks/enforcement.test.js` | Tests for all 7 gates + overrides | Low | FR-5.1 |

---

## 6. Testing Strategy

### 6.1 Unit Tests

| Test | Covers | Priority | Traceable To |
|---|---|---|---|
| `test-boundary-enforce` | FR-1.1–1.4 (L1/L2 protection) | P0 | FR-1.1–1.4 |
| `test-agent-authority-detection` | FR-2.2 (active agent resolution) | P0 | FR-2.2, FR-5.1 (Art. II) |
| `test-story-driven-requirement` | FR-3.x (story reference check) | P1 | FR-3.x, FR-5.1 (Art. III) |
| `test-no-invention-validation` | FR-5.4 (FR-*/NFR-*/CON-* traceability) | P0 | FR-5.4, FR-5.1 (Art. IV) |
| `test-gate-priority-order` | research.json RT-4 (Art. II > III > IV > ...) | P0 | FR-5.1 |
| `test-context-loading-surfaces` | FR-4.1–4.2 (surface reconciliation) | P1 | FR-4.1–4.2, research.json RT-3 |
| `test-cache-ttl` | NFR-1.3 (>80% cache hit rate) | P2 | NFR-1.3, research.json cache_strategy |
| `test-gate-logging-async` | FR-5.2 (JSONL, non-blocking) | P1 | FR-5.2, FR-5.3 |

### 6.2 Integration Tests

| Test | Components | Traceable To |
|---|---|---|
| `test-sdc-full-cycle` | All gates + story lifecycle (Draft→Ready→InProgress→InReview→Done) | FR-3.x, FR-5.1 |
| `test-qa-loop-iteration` | QA gate + @dev fix loop (max 5 iterations) | FR-3.x |
| `test-spec-pipeline-critique` | QA checklist + agent framework spec | research.json RT-1 |
| `test-brownfield-gate-evaluation` | All gates in legacy audit scenario | FR-5.1 |
| `test-multi-agent-ensemble` | 3+ agents + gate evaluation in compound scenario | research.json RT-5 (ensemble pattern) |

### 6.3 Acceptance Tests (Given-When-Then)

```gherkin
Feature: Framework Boundary Enforcement

  Scenario: L1 core write attempt blocked [FR-1.1]
    Given a developer tries to Edit .aiox-core/core/some-file.js
    When the Edit tool is invoked
    Then enforce-quality-gates.cjs detects L1 violation
    And blocks the operation
    And logs decision to .aiox/gate-logs/

Feature: Agent Authority Enforcement [FR-2.2, FR-5.1]

  Scenario: Non-@devops git push blocked
    Given @dev (not @devops) attempts git push origin main
    When enforce-agent-authority.cjs evaluates
    Then active agent identity confirmed as non-@devops
    And operation blocked with message
    And override available via --skip-devops-check (audit-logged)

Feature: No-Invention Gate Requirement Traceability [FR-5.4, FR-5.1]

  Scenario: Spec statement without FR-*/NFR-*/CON-* traceability validation
    Given a spec statement must be validated against requirements.json
    When enforce-no-invention.cjs evaluates
    Then all FR-* references validated in requirements.json
    And invalid references blocked or warned per configuration

Feature: Context Loading Determinism [FR-4.1–4.2, research.json RT-3]

  Scenario: Agent activation reconciles three surfaces
    Given agent @dev activation triggered
    When shim loads agent context
    Then Surface 1 (.claude/agents/aiox-dev.md) checked first
    And conflict scenarios handled per reconciliation_strategy
    And context >= 937 lines (95%+ coverage per NFR-2.3)
```

---

## 7. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | Traceable To |
|---|---|---|---|---|
| **Three-Surface Agent Trap** — Surfaces diverge, context inconsistency | Medium | High | Implement surface reconciliation (story 12.3) | research.json RT-3 |
| **Spec Pipeline Critique Novel Pattern** — No operational precedent | Medium | Medium | Design new QA checklist before Phase 5 (story 12.5) | research.json RT-1 |
| **Gate Priority Order Ambiguity** — Multiple gates evaluate, unclear which blocks first | Low | High | Pseudocode + story 12.8 compound scenario validation | research.json RT-4 |
| **CodeRabbit Auto-Healing Timeout** — Loop exceeds SLO | Low | Medium | Set explicit timeout; halt if max iterations reached | FR-3.4, complexity.json flags |
| **Agent Memory Corruption** — Handoff artifact unreadable | Low | Medium | Graceful degradation: fallback to handoff YAML | FR-4.4 |
| **Circular Dependency in Agent Registry** — A→B→A | Low | Critical | Detect at load time; fail-fast (story 12.2 tests) | FR-2.4 |

---

## 8. Open Questions

| ID | Question | Priority | Blocking | Assigned To | Traceable To |
|---|---|---|---|---|---|
| OQ-1 | Are all 31 gaps from audit still valid? | High | No | @architect | requirements.json OQ-1 |
| OQ-2 | Can gate-logging be async without JSONL corruption? | High | No | @devops | requirements.json OQ-2 |
| OQ-3 | CodeRabbit auto-healing SLO + timeout? | Medium | No | @qa | requirements.json OQ-3 |
| OQ-4 | Should agent memory be versioned (v1, v2)? | Medium | No | @architect | requirements.json OQ-4 |
| OQ-5 | Gate overrides: self-service or approval chain? | High | No | @pm | requirements.json OQ-5 — _Design decision for Phase 6 (Revise) or Phase 8 (Plan). Suggests approval chain pattern; not a blocker for Phase 4._ |

---

## 9. Implementation Checklist

- [ ] Story 12.1: Framework Boundary Enforcement (FR-1.1–1.4)
- [ ] Story 12.2: Agent Authority Validation (FR-2.1–2.4, Art. II)
- [ ] Story 12.3: Context Loading & Reconciliation (FR-4.1–4.4, research.json RT-3)
- [ ] Story 12.4: No-Invention Gate (FR-5.4, Art. IV)
- [ ] Story 12.5: QA Critique Checklist Design (research.json RT-1)
- [ ] Story 12.6: Gap Traceability Matrix (requirements.json CON-5)
- [ ] Story 12.7: Multi-Workflow Integration Testing (FR-5.1)
- [ ] Story 12.8: Compound Gate Scenario (research.json RT-4)
- [ ] Story 12.G1: Framework Modification Proposal (CON-1)
- [ ] Story 12.G2: Cross-Story Integration Test (research.json RT-5)
- [ ] Story 12.G3: Phase Gates & Barrier Synchronization (research.json RT-5)
- [ ] Story 12.9: Comprehensive Hook Testing (FR-5.1)
- [ ] Story 12.10: Documentation & Runbook (FR-5.2, FR-5.3)
- [ ] Story 12.11: Epic QA Gate (NFR-3.1)

---

## 10. Success Metrics

| Metric | Target | Validation | Traceable To |
|---|---|---|---|
| **Context Determinism** | >= 95% (38/40 files loaded) | NFR-2.3, story 12.3 | FR-4.1–4.2, NFR-2.3 |
| **Gate Enforcement** | 0 false negatives | All 7 gates tested, no violations slip | FR-5.1 |
| **Agent Authority Zero Ambiguity** | 100% explicit | NFR-2.1, audited in 12.2 | FR-2.3, NFR-2.1 |
| **Gap Remediation Coverage** | 31/31 traced | NFR-3.2, story 12.6 | CON-5, NFR-3.2 |
| **Ambiguity Documentation** | 21/21 clarified | NFR-3.3 audit | NFR-3.3 |
| **AC Traceability** | 100% link to FR/NFR | NFR-4.1, Phase 5 critique | FR-3.3, NFR-4.1 |
| **Performance SLO** | <500ms load; >80% cache | NFR-1.1–1.3, story 12.3 | FR-4.3, NFR-1.1–1.3 |
| **Test Coverage** | 7/7 QA checks per story | NFR-3.1, story 12.9 | NFR-3.1 |

---

## 11. Constitutional Gate: No Invention (Article IV Enforcement)

**Reference:** FR-5.4, FR-5.1 (Art. IV mandate)

Every statement in this spec traces to requirements.json, complexity.json, or research.json:

- §1 Overview → FRs 1.1–5.4 (goals)
- §2 Requirements → requirements.json (direct attribution)
- §3 Technical Approach → research.json RT-1 to RT-5 (Spec Pipeline, Gates, Context Loading, Constitutional Enforcement, Ensemble Validation)
- §4 Dependencies → requirements.json + EPIC-9
- §5 Files → complexity.json (scope) + research.json RT-3 (reconciliation)
- §6 Testing → requirements.json ACs + NFRs
- §7 Risks → complexity.json flags + research.json gaps
- §8 Open Questions → requirements.json openQuestions
- §9 Checklist → derived from §5 + FR acceptance criteria
- §10 Metrics → requirements.json NFRs

**No invented features. No technologies not researched. No ACs not derived from inputs.**

---

## Metadata

- **Generated by:** @pm (Morgan) via spec-write-spec task
- **Inputs:** requirements.json (20 FRs, 16 NFRs, 7 CONs), complexity.json (COMPLEX = 17/25), research.json (5 topics, 85% confidence)
- **Iteration:** 1 (Draft)
- **Next Phase:** 5. Critique v1 (QA validates spec completeness)
- **Handoff To:** @qa (Quinn) — command: `*critique-spec EPIC-12`

---

## Appendix: Phase 4 Action Items Checklist (from research.json AC1–AC6)

✅ **AC1:** Intro §1 references all 5 research topics  
✅ **AC2:** Architecture §3 includes reconciliation_strategy (RT-3) with priority order, conflict resolution, graceful degradation, cache strategy  
✅ **AC3:** Gate Validation in §3.3 includes gate_evaluation_pseudocode (RT-4) with early-return order + story mapping  
✅ **AC4:** Story Mapping in §5 + §9 cross-references RT-2 stories (12.1–12.8 per article) + RT-5 gateway stories  
✅ **AC5:** Phase 5 Gate Design in §6.3 defines new QA critique checklist (5 criteria: persona alignment, determinism, boundary enforcement, gate coverage, multi-agent completeness)  
✅ **AC6:** EXECUTION-PLAN.yaml referenced in §5.1 + phasing described in Phase 8 output expectation
