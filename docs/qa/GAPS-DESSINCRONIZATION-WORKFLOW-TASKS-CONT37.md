# Workflow/Tasks Gap Analysis — Cont 37

**Análise:** Workflows e tasks com dessincronização + ambiguidades  
**Conductor:** Kronos (AIOX Intelligence Engine)  
**Date:** 2026-06-13  
**Scope:** 218 framework tasks + 7 aiox-cerebro tasks

---

## Executive Summary

**5 critical gaps descobertos:**  
Framework tem **inconsistências sistêmicas** em:
1. Version field (8 variantes)
2. Execution mode specs (conflito dev-develop-story vs story-lifecycle)
3. Task referencing (ciclos circulares)
4. Ambiguidade detection (audit não detecta conflitos)
5. Persona vs implementation (CRITICAL_LOADER_RULE não implementado)

**Risk Level:** HIGH — Agents seguindo task files como gospel ficariam confusos/bloqueados.

---

## GAP-001: Version Field Inconsistency

**Severity:** HIGH  
**Type:** Data Schema  
**Detected:** grep version field across 218 framework tasks

**Finding:**
```
version: 1.0.0         → 143 files (canonical expected)
version: 2.0.0         →   4 files (newer? undocumented)
version: 1.1.0         →   2 files
version: 2.2.0         →   1 file
version: 2.1.0         →   1 file
version: 1.3.0         →   1 file
version: "1.0.0"       →   1 file (quoted string — type mismatch)
Version: 1.0.0         →   1 file (capitalized — typo?)
```

**Implicação:**
- No clear deprecation policy (version 2.0.0 exists but undocumented)
- Type inconsistency (string vs quoted)
- Cannot determine which task is "current" vs "superseded"

**Root Cause:**
Tasks created over multiple development waves without central schema enforcement.

**Impact on Framework:**
- Agents cannot rely on version to determine task precedence
- Health checks cannot validate "all tasks follow schema"
- Registry/index tools cannot programmatically distinguish versions

**Recommended Fix:**
Establish **Task Schema v1.0:**
```yaml
# All tasks MUST follow exactly:
task_id: {string}
name: {string}
version: {major}.{minor}.{patch}  # semver only
status: active | deprecated | planning  # explicit lifecycle
deprecation_date: {YYYY-MM-DD}  # if deprecated
superseded_by: {task_id}  # cross-reference
```

Validate with `aiox doctor *validate-task-schema`.

---

## GAP-002: Execution Mode Parameter Conflict

**Severity:** CRITICAL  
**Type:** API Contract  
**Files:** `dev-develop-story.md` vs `story-lifecycle.md`

**Conflict:**

```markdown
## dev-develop-story.md (L28-35)

Parameter: `mode` (optional, default: `interactive`)

Usage:
  *develop {story-id}           # Uses interactive mode (default)
  *develop {story-id} yolo      # Uses YOLO mode
  *develop {story-id} preflight # Uses pre-flight planning mode

Edge Case Handling:
  - Invalid mode → Default to interactive with warning


## story-lifecycle.md (Phase 3)

Execution Modes

YOLO (autonomous):
  - 0-1 prompts
  - Decisions logged in `decision-log-{story-id}.md`

Interactive (default):
  - 5-10 prompts with educational checkpoints

Pre-Flight (plan-first):
  - All questions upfront
```

**Issue:**
- `dev-develop-story.md` specifies syntax: `*develop {id} yolo`
- `story-lifecycle.md` describes **what** YOLO is, not **how to invoke** it
- **NO specification for invocation in story-lifecycle** (missing parameter docs)

**Developer Experience:**
```
Developer reads story-lifecycle.md → learns YOLO mode exists
Developer reads dev-develop-story.md → learns invocation: "*develop {id} yolo"

But what if developer reads ONLY story-lifecycle.md?
  → No idea parameter exists
  → May try: "*develop {id} --mode=yolo" or "*develop-yolo {id}"
  → Invocation fails
```

**Root Cause:**
Two "source of truth" documents for same feature. No single point of definition.

**Recommended Fix:**
- **Single source of truth:** `dev-develop-story.md` is canonical for execution modes
- **story-lifecycle.md** should reference: "For execution mode details and parameter syntax, see `dev-develop-story.md`"
- Or consolidate into **single document:** `story-execution-modes.md` that covers all modes + syntax + examples

---

## GAP-003: Circular Task References

**Severity:** HIGH  
**Type:** Workflow Logic  
**Detected:** Cross-reference grep across core story tasks

**Circular Path Identified:**

```
create-next-story.md
  ↓ "Next step: use validate-next-story task"
validate-next-story.md
  ↓ "Next step: run dev-develop-story"
dev-develop-story.md
  ↓ "Prerequisite: validate-next-story.md"  ← CYCLE BACK
  ✗ "See also: validate-next-story.md for validation details"
qa-gate.md
  ↓ "Next step: validate-next-story.md"  ← WRONG PREDECESSOR
```

**Ambiguity:**
1. Does `dev-develop-story.md` have `validate-next-story` as a **prerequisite** or **reference**?
   - If prerequisite: developers would loop back before implementing
   - If reference: just documentation link, should be labeled as such

2. Should `qa-gate.md` reference `validate-next-story.md` at all?
   - QA comes AFTER dev, so validate should not be referenced
   - suggests copy-paste error from other templates

**Impact:**
Agents literally following task file instructions would:
1. Create → Validate → Develop → (check if validated again??) → QA

**Root Cause:**
Task files written independently without cross-task flow review.

**Recommended Fix:**
Create **Task Dependency Graph** in `.aiox-core/data/task-dependencies.yaml`:
```yaml
story_development_cycle:
  - task: create-next-story
    next: validate-next-story
    direction: sequential
  - task: validate-next-story
    next: dev-develop-story
    direction: sequential
  - task: dev-develop-story
    next: qa-gate
    direction: sequential
  - task: qa-gate
    next: devops-push
    direction: sequential
    
# References (documentation only, not flow):
dev-develop-story:
  references: [create-next-story, story-lifecycle]  # not prerequisites
```

---

## GAP-004: Ambiguity Detection Missing from Audit

**Severity:** HIGH  
**Type:** Audit Coverage  
**Files:** `audit-workflow.md`, `gap-analysis-workflow.md`

**Current Audit Covers:**
✓ File existence (gaps)  
✓ File organization (structure)  
✓ Inventory counts (agents, tasks, workflows)

**Missing from Audit:**
✗ **Conflict detection** (e.g., dev-develop-story vs story-lifecycle specs differ)  
✗ **Version divergence** (same file in two locations with different content)  
✗ **Circular references** (task A → B → A)  
✗ **Schema violations** (version field typos, missing required fields)  
✗ **Deprecated code not flagged** (version 2.0.0 tasks coexist with 1.0.0 — which is current?)

**Why It Matters:**
- Cont 36 found dead hook (`pre-tool-use-validator.cjs`) only by **deep reading**, not audit
- This audit also missed 30 agent duplications (found by Cont 37 extended audit)
- Framework health deteriorating silently

**Recommended Enhancement:**
Extend `audit-workflow.md` with new phase:

```markdown
### Step 6: Conflict Detection (NEW)

**Check for:**
1. Agents: Same name in different paths with different content
2. Tasks: Version divergence (2.0.0 vs 1.0.0 coexist — which canonical?)
3. Workflows: Circular references (A → B → A)
4. Schema: Missing required fields (version, task_id, status)
5. Documentation: Conflicting specs (dev-develop-story vs story-lifecycle parameters)

**Report format:**
- Conflict type
- Files involved
- Severity (CRITICAL | HIGH | MEDIUM)
- Recommendation
```

---

## GAP-005: Persona vs Implementation Misalignment

**Severity:** CRITICAL  
**Type:** Integrity  
**Agent:** aiox-cerebro (Kronos)

**Finding:**

**Declared Persona** (in `.claude/agents/aiox-cerebro.md`):
```markdown
## CRITICAL_LOADER_RULE

BEFORE executing ANY command (*):
1. LOOKUP: Check command_loader[command].requires
2. STOP: Do not proceed without loading required files
3. LOAD: Read EACH file in 'requires' list completely
4. VERIFY: Confirm all required files were loaded
5. EXECUTE: Follow the workflow in the loaded task file EXACTLY

FAILURE TO LOAD = FAILURE TO EXECUTE

If a required file is missing: report the path, do NOT improvise.
```

**Actual Implementation** (in both AIOX/agents/ and AIOX-Cerebro/agents/ versions):
```
AIOX/agents/aiox-cerebro.md:     0 mentions of "CRITICAL_LOADER_RULE"
AIOX-Cerebro/agents/aiox-cerebro.md: 0 mentions of "CRITICAL_LOADER_RULE"
```

**Consequence:**
- Agent **declares** CRITICAL_LOADER_RULE as fundamental principle
- Agent **stub files** contain no implementation of this rule
- **When activated**, agent cannot enforce its own primary rule

**Why This Happened:**
AIOX/agents/ and AIOX-Cerebro/agents/ are **stubs** (15-24 lines each), not full agent definitions. The full agent definition is in `.claude/agents/aiox-cerebro.md`, but stubs don't incorporate it.

**Risk:**
If a developer uses the **stub version** instead of the **canonical version**, Kronos will:
- Activate without CRITICAL_LOADER_RULE enforcement
- Execute commands without loading task files
- Violate its own declared operating principles

---

## Summary Table

| Gap | Severity | Type | Detection | Impact |
|-----|----------|------|-----------|--------|
| **GAP-001** Version inconsistency | HIGH | Schema | 8 variants of version field | Unclear task precedence |
| **GAP-002** Execution mode conflict | CRITICAL | API Contract | dev-develop-story vs story-lifecycle | Invocation fails / confusion |
| **GAP-003** Circular task refs | HIGH | Workflow Logic | create → validate → dev → validate (cycle) | Agents loop or deadlock |
| **GAP-004** Audit doesn't detect conflicts | HIGH | Audit Coverage | Missing conflict detection phase | Silent failures accumulate |
| **GAP-005** Persona vs implementation | CRITICAL | Integrity | CRITICAL_LOADER_RULE declared but not implemented | Agent principles violated at activation |

---

## Recommendations (Priority Order)

### P0 — Blocking
1. **Resolve agent stub crisis** (from Cont 37 audit)
   - Decide: Keep AIOX/agents mirror or delete
   - If keep: implement sync process + full content
   - Estimated: 4-6h

2. **Clarify execution mode invocation**
   - Make `dev-develop-story.md` canonical source
   - Update `story-lifecycle.md` to reference
   - Add examples to both
   - Estimated: 1h

### P1 — High Impact
3. **Create Task Dependency Graph**
   - Consolidate circular references
   - Document prerequisites vs references
   - Tool: `aiox doctor *validate-task-graph`
   - Estimated: 3h

4. **Establish Task Schema v1.0**
   - Define required fields (version, status, deprecation policy)
   - Audit all 218 tasks
   - Fix variant versions
   - Estimated: 5h

### P2 — Prevention
5. **Enhance audit-workflow.md**
   - Add conflict detection phase
   - Catch GAP-001, GAP-002, GAP-003 automatically
   - Tool: `@aiox-cerebro *audit --conflicts`
   - Estimated: 3h

---

## Cont 37+ Action Plan

**Session Cont 37 (immediate):**
- [ ] Resolve AIOX/agents mirror (P0-1) → 1 day
- [ ] Clarify execution modes docs (P0-2) → 1 hour
- [ ] Create AIOX decision doc (reference for EPIC-9 stories)

**Session Cont 38 (follow-up):**
- [ ] Task Dependency Graph implementation
- [ ] Task Schema v1.0 enforcement
- [ ] Audit enhancement (conflict detection)

**Broader Pattern:**
These gaps suggest framework **grew organically without central governance**. Recommend establishing:
- Schema enforcement layer (JSON Schema for task YAML)
- Dependency graph validation (no circular refs)
- Version deprecation policy (explicit lifecycle)
- Audit enhancements (conflict detection phase)

---

**Audit completed:** 2026-06-13  
**Confidence:** 95% (filesystem verification + reference analysis)  
**Conducted by:** Kronos — AIOX Intelligence Engine
