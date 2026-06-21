# PRD: EPIC-XX — Agent Architecture Hardening

**Version:** 1.0  
**Status:** DRAFT (awaiting @po validation)  
**Created:** 2026-06-21  
**Owner:** Morgan (PM)  

---

## Executive Summary

The AIOX agent framework has 3 critical gaps in enforcement and synchronization that prevent reliable operation at scale. This epic formalizes the fixes needed to harden the agent architecture and ensure Constitutional compliance.

**Impact:** Unblocks agent ecosystem, enables expert cloning, prevents authority violations  
**Effort:** 40-50 story points  
**Timeline:** 2-3 weeks  
**Business Case:** Agent system is foundational to AIOX; gaps undermine reliability and extensibility

---

## Problem Statement

### Current State

- **2-Layer Divergence:** 12 core agents in L1 (`.aiox-core/development/agents/`) vs 59 in L2 (`.claude/skills/AIOX/agents/*/`). No sync guarantee.
- **Authority Gaps:** `whenToUse` field is declarative but not enforced at runtime. @dev can be told to run `*create-story` without blocking.
- **Routing Gaps:** `workflow-chains.yaml` is incomplete. Auto-routing suggestions don't work across agent handoffs.

### Risk Impact

| Gap | Risk | Severity |
|-----|------|----------|
| 2-Layer divergence | Agent definitions drift; SKILL.md becomes stale | CRITICAL |
| Authority gaps | Constitutional Art. II violations go undetected | CRITICAL |
| Routing gaps | Agents don't auto-suggest next steps; manual coordination required | HIGH |

---

## Requirements

### FR-1: 2-Layer Sync (Source of Truth)

**Requirement:** L1 (`.aiox-core/development/agents/*.md`) is ALWAYS canonical. L2 (SKILL.md) is auto-generated.

**Acceptance Criteria:**
- [x] Validator checks L1 ≡ L2 byte-for-byte (except comments)
- [x] CI gate blocks commits if divergence detected
- [x] `aiox sync-agents --fix` auto-repairs diverged files
- [x] Baseline audit documents existing divergences

### FR-2: Authority Enforcement at Activation

**Requirement:** Pre-flight check during agent activation blocks forbidden operations with helpful redirect.

**Acceptance Criteria:**
- [x] Agent reads `whenToUse` field for exclusive operations
- [x] User request matched against whitelist
- [x] Blocked operations show: WHY + which agent CAN do it + suggested command
- [x] HALT before proceeding (no silent failures)

### FR-3: Workflow Chains Completion

**Requirement:** Complete all 4 primary workflows in `workflow-chains.yaml` with conditional routing.

**Acceptance Criteria:**
- [x] SDC (Story Development Cycle) fully mapped
- [x] QA Loop (review-fix iterations) fully mapped
- [x] Spec Pipeline (gather → assess → research → write → critique → plan) fully mapped
- [x] Brownfield Discovery (10-phase assessment) fully mapped
- [x] Router resolves conditionals (e.g., FAIL verdict loops back to @dev)
- [x] Agent activation step 3.5 shows auto-suggestions

### NFR-1: No Breaking Changes

**Requirement:** Fixes are additive. No changes to agent personas, commands, or existing workflows.

### NFR-2: Constitution Alignment

**Requirement:** All fixes enforce AIOX Constitution articles:
- Art. I: CLI First (no UI required)
- Art. II: Agent Authority (exclusive operations enforced)
- Art. III: Story-Driven (no code without story)

---

## Solution Architecture

### High-Level Approach

```
BEFORE                          AFTER
├─ L1: 12 agents                ├─ L1: 12 agents (canonical)
├─ L2: 59 SKILLs (diverged)     ├─ L2: auto-compiled from L1
├─ No sync guarantee            ├─ CI gate enforces sync
├─ No authority check           ├─ Pre-flight validation
└─ Incomplete routing           └─ Auto-routing suggestions
```

### Component Breakdown

| Component | Owner | Effort | Dependencies |
|-----------|-------|--------|--------------|
| Agent Sync Validator | @dev | 10-15h | None |
| Authority Enforcement Gate | @dev | 8-10h | Sync validator (done first) |
| Workflow Router | @dev | 11-13h | None (parallel) |

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| 2-Layer sync | 100% match L1→L2 | CI gate never blocks on divergence |
| Authority enforcement | 0 Art. II violations | Hook metrics: violationsBlocked > 0 |
| Auto-routing | ≥80% handoffs suggest next | Agent activation logs > 10 suggestions |
| Zero regressions | All 258 tests pass | npm test, TypeScript, linting all green |

---

## Scope Definition

### IN SCOPE
- Validator for L1↔L2 sync
- Pre-flight authority checks at activation
- Complete workflow-chains.yaml
- Auto-routing router logic
- CI gate enforcement
- Testing & documentation

### OUT OF SCOPE
- Agent persona redesigns
- New agent types
- UI for agent management
- Agent cloning template (will be separate epic)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking CI on existing repos | MEDIUM | Use `--fix` flag to auto-repair before enforcing |
| False positives in auth checks | MEDIUM | Extensive unit tests (20+ scenarios) before merge |
| Incomplete workflow chains | MEDIUM | Audit all 4 workflows upfront; use checklist |

---

## Go/No-Go Criteria

**GO if:**
- Architecture review (Aria) confirms design ✅
- All 3 fixes have clear implementation steps
- Timeline estimates are validated
- Legal/Security: No compliance risks

**NO-GO if:**
- Would require changes to Constitution (Art. I-VII)
- Breaking changes to existing agents
- Estimated effort > 60 story points

---

## Next Steps

1. **@po validation:** Review this PRD (10-point checklist)
2. **@pm epic creation:** Define epic structure + 3 stories
3. **@sm story drafting:** Create detailed acceptance criteria per fix
4. **@dev implementation:** Sequential (Fix 1 → Fix 2 → Fix 3)
5. **@qa gate:** Quality verification before push

---

## Appendix A: Research Findings

**Source:** Deep research by Aria (Architect) — see SESSION-2026-06-21-AGENT-RESEARCH.md

### Key Findings

1. **Agent Definition Structure:** 5 core layers (Identity, Communication, Authority, Execution, Capability) all standardized
2. **2-Layer Architecture:** L1 core definitions exist but L2 SKILLs sometimes diverge
3. **Authority Model:** Declarative (in `whenToUse`) but not enforced at runtime
4. **Maturity Progression:** Bronze (identity only) → Silver (+ authority) → Gold (+ commands) → Platinum (+ tools/memory)

### Audit Results

- 12 core agents: 7/8 completeness criteria met
- 47 extended agents: 4/8 criteria met (SKILL.md present only)
- Missing: workflow-chains integration, unified sync policy

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| PM | Morgan | 2026-06-21 | DRAFT → awaiting validation |
| PO | Pax | — | PENDING |
| Architect | Aria | — | PENDING (research complete) |

