# SYNAPSE Enforcement Expansion Plan

**Date:** 2026-06-12 (Session Cont 35)  
**Status:** PLANNING PHASE  
**Owner:** @aiox-master (framework governance)

---

## Executive Summary

SYNAPSE has **16 documented rules** but only **4 enforcement hooks** covering ~60% of Constitution.

| Metric | Value | Status |
|--------|-------|--------|
| Rules documented | 16 | ✅ Complete |
| Hooks implemented | 4 | ⚠️ Partial |
| Coverage | ~60% | ❌ Incomplete |
| Critical gaps | 3 | 🔴 High risk |

---

## Current Enforcement Matrix (Rules → Hooks)

| Rule File | Severity | Scope | Hook Status | Coverage |
|-----------|----------|-------|-------------|----------|
| **enforcement-gates.md** | MUST | Art. I-VII | ✅ enforce-*-gates.cjs (4 hooks) | 65% |
| **agent-authority.md** | MUST | Agent delegation | ✅ enforce-agent-authority.cjs | 40% (git only) |
| **story-lifecycle.md** | MUST | Story validation | ✅ enforce-story-driven.cjs | 80% |
| **ids-principles.md** | MUST | IDS compliance | ⚠️ Partial (pre-commit only) | 50% |
| **agent-handoff.md** | SHOULD | Context optimization | ❌ No hook | 0% |
| **coderabbit-integration.md** | SHOULD | Code review | ✅ Integrated in gates | 70% |
| **planning-tracks.md** | SHOULD | Workflow routing | ❌ No hook | 0% |
| **workflow-execution.md** | SHOULD | Task orchestration | ❌ No hook | 0% |
| **story-lifecycle.md** | SHOULD | Status transitions | ⚠️ Partial (manual) | 30% |
| **tool-examples.md** | INFO | Tool selection | ❌ No hook | 0% |
| Others (6 rules) | SHOULD | Config/tokens/imports | ❌ No hooks | 0% |

---

## Critical Gaps (Enforcement NOT Blocking)

### 🔴 Gap 1: Agent Authority — Skills not covered
- **Rule:** agent-authority.md (MUST)
- **Issue:** `enforce-agent-authority.cjs` only blocks `git push`, not `Skill` invocations
- **Risk:** @pm can invoke @squad-creator (violates Art. II) → passes silently
- **Trigger:** `Skill` tool call with pattern `Skill(*{agent-name}*)`
- **Impact:** CRITICAL — permission violation undetected
- **Effort:** 2sp (expand existing hook)

### 🔴 Gap 2: Agent Activation not validated
- **Rule:** agent-authority.md (MUST)
- **Issue:** No hook for `@agent-name` invocations; authority not pre-validated
- **Risk:** @dev can invoke `@architect` (exceeds authority)
- **Trigger:** `Skill` tool call with pattern `Skill(*@{agent-name}*)`
- **Impact:** HIGH — agent hierarchy bypassed
- **Effort:** 3sp (new hook: enforce-agent-activation.cjs)

### 🔴 Gap 3: Absolute Imports not enforced
- **Rule:** Constitutional Art. VI (SHOULD)
- **Issue:** No blocking for relative imports `../../../` in code changes
- **Risk:** New code uses relative imports; linter warns but doesn't block commit
- **Trigger:** `Edit`/`Write` tool on `*.js`/`*.ts` files
- **Impact:** MEDIUM — code quality, not security
- **Effort:** 2sp (new hook: enforce-absolute-imports.cjs)

### ⚠️ Gap 4: Story Lifecycle transitions not enforced
- **Rule:** story-lifecycle.md (MUST)
- **Issue:** Stories can transition DRAFT→Done without @po validation
- **Risk:** @dev skips @po gate; invalid stories shipped
- **Trigger:** `Edit` to `docs/stories/*.md` (status field)
- **Impact:** HIGH — quality gate bypassed
- **Effort:** 2sp (expand enforce-story-driven.cjs)

### ⚠️ Gap 5: IDS compliance incomplete
- **Rule:** ids-principles.md (MUST)
- **Issue:** Only pre-commit hook exists; no runtime IDS checks
- **Risk:** Violations logged but not blocked; post-commit discovery
- **Trigger:** Post-tool-use on code modifications
- **Impact:** MEDIUM — detection only, no prevention
- **Effort:** 1.5sp (integrate ids-principles checks into gates)

---

## Hook Implementation Checklist

| Hook | File | Status | Effort | Triggers |
|------|------|--------|--------|----------|
| ✅ enforce-agent-authority (expand) | `.claude/hooks/enforce-agent-authority.cjs` | To-do | 2sp | Skill, Bash(git push) |
| ❌ enforce-agent-activation | `.claude/hooks/enforce-agent-activation.cjs` | NEW | 3sp | Skill(@*agent*) |
| ❌ enforce-absolute-imports | `.claude/hooks/enforce-absolute-imports.cjs` | NEW | 2sp | Edit/Write (*.js/*.ts) |
| ⚠️ enforce-story-lifecycle | `.claude/hooks/enforce-story-driven.cjs` (expand) | To-do | 2sp | Edit(docs/stories/) |
| ⚠️ enforce-ids-runtime | `.claude/hooks/post-tool-use-observer.cjs` (enhance) | To-do | 1.5sp | PostToolUse |

---

## CI/CD Integration Points

**Current gates in `.claude/settings.json`:**
```
PreToolUse hooks:
  - Bash(git commit*) → enforce-story-driven
  - Write/Edit → enforce-no-invention, enforce-quality-gates
  - WebSearch/WebFetch → allow-websearch-webfetch

PostToolUse hooks:
  - Write/Edit → post-story-update, process-map-updater
  - All → post-tool-use-observer
```

**New integration points:**
- PreToolUse: `Skill` matcher → enforce-agent-authority (expand)
- PreToolUse: `Edit(docs/stories/*.md)` → enforce-story-lifecycle
- PreToolUse: `Edit/Write(*.js/*.ts)` → enforce-absolute-imports
- PostToolUse: All → ids-runtime-check (new)

---

## Override Policy

Current overrides (audit-logged):
- `--skip-devops-check` on `git push` — allows non-@devops push with override flag
- `[no-story-req]` in commit message — bypasses story-driven gate
- `--force-gate` on `git merge` — bypasses quality gate

**Proposed:** Allow overrides ONLY for:
1. Framework contributors (boundary.frameworkProtection = false)
2. Emergency/critical-path situations (requires 2x senior approval)
3. Documented in `.aiox/overrides/` for audit trail

---

## Metrics Collection Schema

**What to track per hook execution:**

```json
{
  "hook": "enforce-agent-authority",
  "timestamp": "2026-06-12T21:00:00Z",
  "trigger": "Skill(@squad-creator)",
  "decision": "block|allow|warn|override",
  "agent_current": "@dev",
  "agent_required": "@pm",
  "reason": "Art. II violation: @squad-creator exclusive to @pm",
  "override_used": false,
  "override_reason": null
}
```

**Aggregate metrics in `.synapse/metrics/hook-metrics.json`:**
```json
{
  "enforcement": {
    "total_hooks_evaluated": 1245,
    "violations_detected": 42,
    "violations_blocked": 38,
    "overrides_allowed": 4,
    "by_article": {
      "art_i": { "evals": 120, "blocked": 0, "warn": 15 },
      "art_ii": { "evals": 180, "blocked": 18, "warn": 5, "override": 3 },
      "art_iii": { "evals": 230, "blocked": 12, "warn": 8 },
      "art_iv": { "evals": 340, "blocked": 8, "warn": 14 },
      "art_v": { "evals": 205, "blocked": 0, "warn": 12 },
      "art_vi": { "evals": 170, "blocked": 0, "warn": 0 }
    }
  }
}
```

---

## Proposed 3-Story Implementation Plan

### Story 1.17 — Expand enforce-agent-authority to Skills
- **Effort:** 2sp
- **Scope:** Extend `enforce-agent-authority.cjs` to detect Skill invocations
- **Triggers:** `Skill` tool + pattern `Skill(*@{agent}*)`
- **Implementation:** Add SKILL_INVOCATION_PATTERNS array; validate against delegation matrix
- **Tests:** 6 unit tests (agent boundary violations, valid invocations)
- **Owner:** @dev

### Story 1.18 — Create enforce-agent-activation.cjs
- **Effort:** 3sp
- **Scope:** New hook for `@agent-name` activation validation
- **Triggers:** `Skill` tool containing `@` character
- **Implementation:** Parse agent name; validate vs `.claude/rules/agent-authority.md` delegation matrix
- **Tests:** 8 unit tests (invalid agents, delegation chains, wildcards)
- **Owner:** @dev

### Story 1.19 — Create enforce-absolute-imports.cjs
- **Effort:** 2sp
- **Scope:** Block relative imports in code (Art. VI)
- **Triggers:** `Edit`/`Write` on `*.js`/`*.ts` with pattern `../`
- **Implementation:** Regex scan for `..` paths; WARN on 1st occurrence, BLOCK on 2nd+ in same file
- **Tests:** 5 unit tests (valid paths, exception handling, monorepo edge cases)
- **Owner:** @dev

**Total:** 7sp, Standard Flow (3 stories → @sm draft → @po validate → @dev implement → @qa gate → @devops push)

---

## Success Criteria

- ✅ All 3 hooks implemented + tests PASS
- ✅ Metrics populated in `.synapse/metrics/`
- ✅ Gate-logs showing decisions for new hooks
- ✅ Zero false positives in 7-day monitoring period
- ✅ Documentation updated: `.claude/rules/enforcement-gates.md` reflects new coverage

---

## Related Documents

- Gap Analysis: `docs/qa/SYNAPSE-ENFORCEMENT-GAP-ANALYSIS.md`
- Constitution: `.aiox-core/constitution.md`
- Agent Authority Matrix: `.claude/rules/agent-authority.md`
- Enforcement Rules: `.claude/rules/enforcement-gates.md`

---

**Next Action:** Create 3 stories (1.17, 1.18, 1.19) via @sm *draft
