# EPIC-13: Full Context Determinism — PRD

**EPIC ID:** EPIC-13  
**Title:** Full Context Determinism  
**Status:** Draft  
**Date Created:** 2026-06-17  
**PM:** Morgan  
**Execution Track:** Standard (9-10 stories, 40-50sp, ~2-3 weeks)

---

## Executive Summary

EPIC-13 addresses a critical gap identified during Cont 49 CI/CD validation: agents activate with only **25% context** (2/8 SYNAPSE layers loaded, 73/500+ rules active) when they should have **100% context** (all 8 layers loaded, 500+ rules active).

**Root Cause:** Framework context loading system loads only Constitution + Global rules. Agent, Workflow, Task, Squad, Keyword, and Star-command layers are skipped.

**Solution:** Implement deterministic full-layer loading on agent activation + persistent memory to ensure 100% context availability.

**Business Impact:**
- ✅ Eliminates ambiguity in agent decision-making
- ✅ Prevents edge-case failures from missing rules
- ✅ Enables autonomous agent workflows with confidence ≥90%
- ✅ Reduces need for human clarification/override

---

## Problem Statement

### Current State
```json
{
  "layersLoaded": 2,
  "layersSkipped": 6,
  "totalRules": 73,
  "rulesNeeded": 500,
  "coverage": "14.6%"
}
```

### Gap Details
- **Constitution:** ✅ Loaded (via `.aiox-core/constitution.md`)
- **Global rules:** ✅ Loaded (via `.claude/rules/agent-authority.md`, `workflow-execution.md`, `ids-principles.md`)
- **Agent layer:** ❌ SKIPPED (`.claude/skills/AIOX/agents/*/SKILL.md` not loaded)
- **Workflow layer:** ❌ SKIPPED (`.aiox-core/development/workflows/*` not loaded)
- **Task layer:** ❌ SKIPPED (`.aiox-core/development/tasks/*` not loaded)
- **Squad layer:** ❌ SKIPPED (`.claude/rules/squad-*.md` not loaded)
- **Keyword layer:** ❌ SKIPPED (L6 domain rules on-demand)
- **Star-command layer:** ❌ SKIPPED (custom command rules)

### Risk if Not Fixed
- Agents may fail on edge cases not covered by Constitution + Global
- Decisions become non-deterministic (output varies with context luck)
- Violates EPIC-12 goal: "100% deterministic context"
- Prevents scaling to multi-agent autonomous workflows

---

## Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| O1 | Load all 8 SYNAPSE layers deterministically | 100% coverage (500+ rules) verified in `.synapse/metrics/` |
| O2 | Persist full context between sessions | `.synapse/sessions/{id}.json` contains full state; recovery time <100ms |
| O3 | Validate atomic transitions | No partial loads; layer failures are detected and rolled back |
| O4 | Measure token overhead | Cache keeps overhead <15% vs. baseline |

---

## Scope

### In Scope ✅
1. Load Constitution layer (Art. I-VII)
2. Load Global rules (16 files from `.claude/rules/`)
3. Load Agent layer (11 agent SKILL.md files)
4. Load Workflow layer (4 workflow definitions)
5. Load Task layer (task specs with inputs/outputs/gates)
6. Load Squad layer (squad configurations + authority)
7. Load Keyword layer (L6 domain rules, on-demand)
8. Implement memory persistence (session state)
9. Validate determinism (coverage, gaps, atomic transitions)
10. Optimize token usage (cache strategy, TTL)

### Out of Scope ❌
- Rewriting Constitution (Art. I-VII) — only load existing
- Creating new rules — only load documented ones
- Refactoring agent personas — only cache existing
- UI/dashboard for layer status — CLI-only per Art. I

---

## Functional Requirements (FRs)

### FR-1: Deterministic Layer Loader
| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Load Constitution (8 articles) from `.aiox-core/constitution.md` | P0 |
| FR-1.2 | Load Global rules (16 files) from `.claude/rules/*` | P0 |
| FR-1.3 | Load Agent layer (11 SKILL.md files) deterministically | P0 |
| FR-1.4 | Load Workflow layer (4 definitions) with task sequence validation | P1 |
| FR-1.5 | Load Task layer (task specs, inputs/outputs/gates) | P1 |
| FR-1.6 | Load Squad layer (squad configs + authority matrix) | P1 |
| FR-1.7 | Load Keyword layer on-demand (L6 domains) | P2 |

### FR-2: Memory Persistence
| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | Persist full context to `.synapse/sessions/{sessionId}.json` | P0 |
| FR-2.2 | Load persisted context on agent activation (recovery) | P0 |
| FR-2.3 | TTL validation (purge stale sessions >30d) | P1 |
| FR-2.4 | Atomic snapshot on state change (transactional) | P1 |

### FR-3: Validation & Monitoring
| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | Verify 100% rule coverage (layersLoaded=8, totalRules≥500) | P0 |
| FR-3.2 | Detect and report missing rules (gap analysis) | P0 |
| FR-3.3 | Validate atomic layer transitions (no partial loads) | P1 |
| FR-3.4 | Log all context loads to `.aiox/context-load-logs/` | P1 |

---

## Non-Functional Requirements (NFRs)

| Category | ID | Requirement | Target |
|---|---|---|---|
| **Performance** | NFR-1.1 | Layer load latency (cold start) | <2s |
| | NFR-1.2 | Layer load latency (cached) | <500ms |
| | NFR-1.3 | Memory overhead per context | <50MB |
| | NFR-1.4 | Token budget overhead | <15% vs. baseline |
| **Reliability** | NFR-2.1 | Context coverage | 100% (all 8 layers) |
| | NFR-2.2 | Atomic transitions | 100% (no partial loads) |
| | NFR-2.3 | Recovery success rate | >99% |
| **Traceability** | NFR-3.1 | Context load audit trail | Complete, immutable logs |
| | NFR-3.2 | Gap documentation | Zero ambiguity |

---

## Stories (8-10, ~40-50sp)

| # | Story | Layer | Description | Points | Dependencies |
|---|-------|-------|---|---|---|
| 13.1 | Foundation | Loader | Core SYNAPSE layer loader (8-layer sequence) | 5 | — |
| 13.2 | Agent layer | Loader | Load + cache agent SKILL.md with dependencies | 6 | 13.1 |
| 13.3 | Workflow layer | Loader | Load workflow definitions + task sequences | 5 | 13.1 |
| 13.4 | Task layer | Loader | Load task specs (inputs, outputs, gates) | 6 | 13.1 |
| 13.5 | Squad layer | Loader | Load squad configs + authority matrix | 5 | 13.1 |
| 13.6 | Keyword layer | Loader | Load L6 keyword domain rules (on-demand) | 4 | 13.1 |
| 13.7 | Memory | Persistence | Full context state → `.synapse/sessions/{id}.json` | 6 | 13.1-13.6 |
| 13.8 | Validation | Validation | Verify 100% coverage, detect gaps, atomic transitions | 6 | 13.1-13.7 |
| 13.9 | Performance | Optimization | Cache strategy, TTL, token budget tracking | 5 | 13.1-13.8 |
| 13.10 | QA | QA Gate | Acceptance criteria validation + runbook | 4 | 13.1-13.9 |

**Total:** 52sp over ~9 days (Standard Flow)

---

## Success Metrics

| Metric | Current | Target | Owner |
|---|---|---|---|
| Context coverage (rules loaded) | 73/500 (14.6%) | 500+/500 (100%) | @dev |
| Layers loaded | 2/8 (25%) | 8/8 (100%) | @dev |
| Context load latency (cold) | — | <2s | @dev |
| Context load latency (cached) | — | <500ms | @dev |
| Memory overhead | — | <15% | @dev |
| Gaps documented | 9 (from EPIC-12 audit) | 0 (all resolved) | @qa |
| Agent activation success rate | — | >99% | @qa |

---

## Acceptance Criteria (Generic)

1. [ ] All 8 SYNAPSE layers load deterministically on agent activation
2. [ ] `.synapse/metrics/hook-metrics.json` shows `layersLoaded: 8, totalRules: ≥500`
3. [ ] No gaps in rule coverage (all documented rules available)
4. [ ] Context persists to `.synapse/sessions/{id}.json` with TTL validation
5. [ ] Recovery from persisted context succeeds >99% of time
6. [ ] Token overhead <15% vs. baseline (measured)
7. [ ] All 4 pre-commit quality gates PASS (lint, typecheck, test, CodeRabbit)
8. [ ] Stories 13.1-13.10 all marked "Done" with full AC validation

---

## Timeline & Roadmap

### Phase 1: Foundation (Cont 51, ~3-4 days)
- Stories 13.1-13.6: Implement all 8 layer loaders
- Focus: Core loader engine, deterministic sequencing

### Phase 2: Persistence (Cont 51, ~2 days)
- Story 13.7: Memory persistence + session management
- Focus: Atomic snapshots, recovery

### Phase 3: Validation & Release (Cont 51-52, ~2-3 days)
- Stories 13.8-13.10: Validation, optimization, QA
- Focus: Coverage verification, performance tuning, documentation

---

## Dependencies & Risks

### Dependencies
- ✅ Cont 49 EPIC-12 complete (all 12 stories Done)
- ✅ Cont 50 production validation (smoke tests pass)
- ❌ EPIC-13 stories 13.1-13.6 sequential (each depends on previous layer)

### Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Layer load sequence deadlock | Low | CRITICAL | Validate DAG before implementation (story 13.1) |
| Token overhead >15% | Medium | HIGH | Implement cache strategy early (story 13.9) |
| Session persistence conflicts | Low | HIGH | Atomic transactions with rollback (story 13.7) |
| Scope creep (new L6 rules) | Medium | MEDIUM | Freeze rule set at planning (story 13.1) |

---

## Handoff Notes

**For Cont 51 (@sm to create full story details):**
1. Validate 8-layer DAG (directed acyclic graph) before implementation
2. Confirm `.claude/rules/*` file list (16 confirmed in audit)
3. Confirm `.claude/skills/AIOX/agents/*/SKILL.md` list (11 confirmed)
4. Define session ID format: `{date}-{agent}-{index}` or UUID?
5. Define cache invalidation strategy (TTL vs. event-based)

**For Cont 51+ (@dev to implement):**
- Start with 13.1 (Foundation): Build the core loader engine
- Stories 13.2-13.6 are parallelizable after 13.1 (each layer independent)
- Story 13.7 (Memory) depends on all layers (13.1-13.6)
- Stories 13.8-13.10 are sequential (validation → perf → QA)

---

## Approvals

**PM (Morgan):** Draft (ready for @po validation)  
**PO (Pax):** — (pending review)  
**Architecture (Aria):** — (pending review)

---

**EPIC-13 PRD Status:** 🟡 DRAFT — Ready for @po 10-point checklist validation
