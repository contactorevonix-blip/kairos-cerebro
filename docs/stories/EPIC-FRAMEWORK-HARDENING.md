# 🔐 EPIC-FRAMEWORK-HARDENING — Constitutional Enforcement Hardening
**Status:** Created (Cont 70)  
**Sprint:** TBD  
**Effort:** 40-50sp over 2-3 weeks  
**Type:** Framework / Infrastructure  
**Priority:** CRITICAL — blocks reliable product development  

---

## Executive Summary

The AIOX framework has 13 critical enforcement gaps (discovered in Cont 70 audit) that break Constitutional Articles II-VII in practice. This epic closes them with hardening, testing, and governance.

**Impact:** Framework currently allows non-@devops agents to push to remote, non-@sm agents to create stories, and L1/L2 writes via MultiEdit/NotebookEdit.

---

## Context

**Discovery:** Cont 69 audit → Cont 70 comprehensive audit (Quinn + Aria + Orion)  
**Gaps:** 13 identified; 6 are structural failures; 4 are critical enforcement gaps  
**Previous Work:** EPIC-12 (Constitutional Enforcement, completed) defined gates but didn't harden them

---

## Acceptance Criteria

- [ ] **AC1:** All 13 gaps closed (G1-G13 addressed)
- [ ] **AC2:** Art. II (Agent Authority) enforcement 100% effective (no override normalization)
- [ ] **AC3:** Art. VI-VII (Framework Boundary) deny rules cover all ~470 L1/L2 files
- [ ] **AC4:** Rules system deterministic (all 17 rules have frontmatter + loading instrumentation)
- [ ] **AC5:** Git surface reconciliation complete (single source of truth for agents)
- [ ] **AC6:** Self-disarm protection (enforcement infrastructure itself protected)
- [ ] **AC7:** Quality gates 100% pass before close (lint, typecheck, test, integration)

---

## Stories

### 13.1 — Override Normalization Audit & Fix
**Gap:** G4 — 172 overrides; 86 are `@dev` pushing with `--skip-devops-check`  
**Story:** Audit override frequency per agent/operation, fix assumption that override = rare  
**Effort:** 8sp

### 13.2 — Story-Driven Gate Correlation Fix
**Gap:** G9 — Story existence check, not code correspondence  
**Story:** Implement gate that validates story AC matches committed files  
**Effort:** 13sp

### 13.3 — Quality Merge Gate Enforcement
**Gap:** G10 — Merge gate is opt-in (status unknown → proceed)  
**Story:** Make merge gate fail-default; quality gate must be PASS before merge allowed  
**Effort:** 8sp

### 13.4 — Bash Deny Rules Expansion
**Gap:** G6 from Quinn — no bash-level deny rules (cat .env, heredoc writes, sed contornable)  
**Story:** Add deny rules for shell write operations (echo, heredoc, sed, awk)  
**Effort:** 5sp

### 13.5 — MCP Governance Hardening
**Scope:** MCP add/remove/configure operations must go through @devops  
**Story:** Add gate to `.claude/rules/mcp-usage.md` enforcement  
**Effort:** 3sp

### 13.6 — Framework Integrity Testing
**Story:** Integration tests for all 13 gaps; verify gates block + allow correctly  
**Tests:** 13 scenarios × 3 agents = 39 test cases minimum  
**Effort:** 13sp

### 13.7 — Documentation Update (CLAUDE.md vs Reality)
**Story:** Audit CLAUDE.md claims vs actual deny rule coverage; reconcile  
**Effort:** 5sp

---

## Non-Included (Defer to Next Phase)

- Surface 2 cleanup (.claude/skills/AIOX/agents/ — 58 orphaned agents) — Phase 5 removed Surface 1; Phase 6 completes consolidation if time
- Override policy refinement (when is override legitimate?) — document in Art. II spec
- Pre-tool-use-validator.cjs archival (rewritten but redundant with enforce-gates.cjs) — audit first

---

## Definition of Done

- ✅ All 7 stories implemented + reviewed
- ✅ 100/100 integration tests PASS
- ✅ npm run lint PASS
- ✅ npm run typecheck PASS
- ✅ npm test PASS (include gate tests)
- ✅ CodeRabbit HIGH/CRITICAL = 0
- ✅ CLAUDE.md updated with real state
- ✅ @devops ready to push (no pre-push blockers)

---

## Related Artifacts

- `.claude/rules/enforcement-gates.md` — Constitutional gates (Art. II-VII)
- `.aiox-core/core-config.yaml` → `boundary.frameworkProtection` toggle
- `.claude/settings.json` → deny/allow rules
- `docs/qa/MASTER-AUDIT-CONT70.md` — Full audit with 13 gaps

---

## Handoff

**Created:** 2026-06-21 (Cont 70, Phase 6)  
**Ready for:** @sm to draft stories 13.1-13.7  
**Owner:** @architect (design) → @dev (implement) → @qa (verify)  
**Timeline:** TBD (estimated 2-3 weeks)

---

**Next Step:** @sm reviews this epic and creates individual stories 13.1-13.7 in standard format
