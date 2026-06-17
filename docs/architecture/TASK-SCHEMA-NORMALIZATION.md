# Task Schema — Normalization Audit, Lifecycle Policy & Verify-Only Findings

> **Story:** [10.3 — Task Schema Normalization + Lifecycle + Circular-Ref Verify](../stories/10.3.story.md) · **Epic:** EPIC-10 (Framework Foundation Cleanup) · **Findings:** F5, F6, F7, F8
> **Generated:** 2026-06-14 · **Maintained by:** @dev / @architect
> **Scope note:** task files live in **L2** (`.aiox-core/development/tasks/`). `Edit`/`Write` to that path is **hard-denied** by `.claude/settings.json` (lines 465-466), independent of `boundary.frameworkProtection`. The metadata-fix portions of this story are therefore delivered as a **verified normalization proposal** to be applied via `@aiox-master *propose-modification` (see §6). The verify-only findings (AC5, AC6, and the AC2 re-verification) are completed here.

---

## 1. Canonical version format (AC1 — decision)

**Decision:** the canonical `version` metadata format is **`version: X.Y.Z`** — lowercase key, semver value, **no quotes**, no inline comment.

| Rule | Canonical | Non-canonical |
|------|-----------|---------------|
| Key casing | `version:` | `Version:` |
| Quoting | `1.0.0` | `"1.0.0"`, `'1.0.0'` |
| Value | semver `X.Y.Z` | bare `1`, `2` |

---

## 2. Version audit — VERIFIED STATE (Art. IV correction of the audit)

The Cont37 audit claimed **8 version variants** (6× `version: 2`, 1 capitalized, 1 quoted). Direct inspection of all 213 task `.md` files **corrects** this:

| Audit claim | Verified reality | Action |
|-------------|------------------|--------|
| 6 files `version: 2` (bare) | **NONE.** All multi-major versions are proper semver: `2.0.0` (improve-self, run-workflow-engine, security-scan, sync-documentation), `2.1.0` (environment-bootstrap), `2.2.0` (setup-mcp-docker), `1.1.0` (environment-bootstrap, setup-llm-routing), `1.3.0` (add-mcp). These are **legitimate, already-canonical** version values. | ✅ No fix — already canonical (AC2 closed) |
| `squad-creator-publish.md:63` `Version: 1.0.0` (capitalized) | **MISCLASSIFIED.** Line 63 is **inside a fenced code block** — example CLI output (`[SquadPublisher] Dry run mode … Version: 1.0.0`). It is example task *content*, not a metadata field. Same for `:204` (`version: 1.0.0  # Required`, inside an example `squad.yaml`). | ➖ Verify-only — must **NOT** be edited (AC7) |
| `story-checkpoint.md:14` `version: "1.0.0"` (quoted) | **REAL.** This is a genuine metadata field in the task's `yaml` block. The quotes are non-canonical. | 🔧 Fix proposed (§6) — blocked by L2 deny |

**Net real metadata variants to normalize: 1** (`story-checkpoint.md:14`). All others are either already canonical or example/code-block content out of scope.

---

## 3. Lifecycle policy (AC4 — definition)

**Policy:** a task's `status` metadata field declares its lifecycle state.

| `status` value | Meaning |
|----------------|---------|
| `active` | In use; the default for any production task |
| `deprecated` | Superseded; kept for back-compat. Pair with `superseded_by: <task-id>` |
| `planning` | Drafted but not yet wired into a workflow/agent |

**Current coverage:** `status:` appears as real metadata in only **4** tasks (`squad-creator-download`, `squad-creator-publish`, `squad-creator-sync-ide-command`, `squad-creator-sync-synkra` — all `status: active`). A few others contain `status:` only inside code-block examples (improve-self, init-project-status, plan-create-implementation).

**Critical subset to receive `status: active`** (story-cycle + tasks referenced in `.claude/rules/`):

| Task | Why critical |
|------|--------------|
| `create-next-story.md` | SDC Phase 1 (story-cycle) |
| `validate-next-story.md` | SDC Phase 2 (story-cycle) |
| `dev-develop-story.md` | SDC Phase 3 (story-cycle) |
| `qa-gate.md` | SDC Phase 4 (story-cycle) |
| `apply-qa-fixes.md` | Referenced in workflow-execution.md / smart-routing.md |
| `correct-course.md` | Referenced in rules router |
| `execute-checklist.md` | Referenced in rules router |

> `superseded_by:` is **not** added to all 213 tasks (OUT of scope) — only where a task is genuinely deprecated.

---

## 4. Circular-reference verify (AC5 — F7) — CLOSED, no defect

The audit claimed **3 circular task references** in the 4 story-cycle files. Direct inspection (`grep` for `next:`, `prerequisite:`, and cross-task names) proves **0 circular references**:

| File | Cross-references found | Circular? |
|------|------------------------|-----------|
| `create-next-story.md` | line 782: advisory suggestion that the PO *may optionally* run `validate-next-story` after a Complex draft | No — forward advisory, not a `next:`/`prerequisite:` loop |
| `validate-next-story.md` | none to other story-cycle tasks | No |
| `dev-develop-story.md` | none to other story-cycle tasks | No |
| `qa-gate.md` | Prerequisites (lines 222-226) reference "review-story task" only — **NOT** `validate-next-story` | No |

**There are zero literal `next:`/`prerequisite:` loops among the 4 files.** The audit finding F7 is formally **DISPROVEN** — there is nothing to fix. (Evidence reproducible via `tests/agents/task-schema-verify.test.js`.)

---

## 5. `task:` vs `task_id:` verify (AC6 — F8) — documented

The audit claimed `task_id` 218/218 (100%). Verified reality across 213 task `.md` files:

| Header style | Count | Notes |
|--------------|------:|-------|
| `task_id:` (V2 metadata) | **1** | `story-checkpoint.md` |
| `task:` (V1 header) | **163** | the dominant legacy format |
| (neither / other) | ~49 | newer tasks using prose or different frontmatter |

**Audit claim F8 is FALSE** — `task_id` is at 1/213, not 218/218. The real inconsistency is the **V1 `task:` vs V2 `task_id:`** split.

**Decision (AC6):** uniformizing all 163 `task:` headers to `task_id:` is **too additive and high-blast-radius** for this story (it touches 163 L2 files and risks changing how parsers key tasks). It is recorded as **explicit tech-debt**:

> **TECH-DEBT (EPIC-10 → future story):** Unify task header schema — migrate the 163 V1 `task:` headers to the V2 `task_id:` form, defining one canonical task-identity field. Estimated 5-8sp; must be metadata-only and parser-compatible; route via `@aiox-master *propose-modification` given the L2 deny rule.

---

## 6. Migration guide / proposal (AC1, AC3, AC4 — blocked by L2 deny)

The following edits are **metadata-only, additive, backward-compatible**, but cannot be applied directly because `.aiox-core/development/tasks/**` is hard-denied for `Edit`/`Write` in `.claude/settings.json`. They are proposed for application via `@aiox-master *propose-modification`:

### 6a. Version normalization (1 edit)

```diff
# .aiox-core/development/tasks/story-checkpoint.md  (line 14)
- version: "1.0.0"
+ version: 1.0.0
```

### 6b. Lifecycle `status: active` for the critical subset (7 edits)

Add `status: active` to the metadata block of each task in §3's critical subset that lacks it (`create-next-story`, `validate-next-story`, `dev-develop-story`, `qa-gate`, `apply-qa-fixes`, `correct-course`, `execute-checklist`). Insert directly under the existing `task:`/`task_id:` line, e.g.:

```diff
  task: qaGate()
+ status: active
```

### 6c. NOT to be changed (verify-only / out of scope)

- `squad-creator-publish.md:63` and `:204` — example code-block content, **leave as-is**.
- The 5 already-canonical multi-major semver versions — **leave as-is**.
- The 163 `task:` headers — recorded as tech-debt (§5), **not migrated now**.

### Application procedure

```
@aiox-master *propose-modification \
  --target ".aiox-core/development/tasks/" \
  --reason "EPIC-10 Story 10.3: metadata-only version normalization + lifecycle status (see docs/architecture/TASK-SCHEMA-NORMALIZATION.md §6)"
```

The proposal carries the diffs in 6a/6b verbatim. No executable task logic changes (AC7 preserved).

---

## 7. No-regression (AC7)

This story made **zero edits to any L2 task file** (the deny rule prevented it; the fixes are proposed, not applied). The only files changed are this doc and the verify test under `tests/` (both L4). All 213 tasks remain byte-identical and invocable. AC7 is preserved by construction.

---

## 8. AC status summary

| AC | Status | Evidence |
|----|--------|----------|
| AC1 (canonical version format) | Decided; 1 real fix proposed (blocked by L2 deny → §6a) | §1, §2 |
| AC2 (`version: 2` intentional vs error) | **Closed — no `version: 2` exists**; all multi-major are canonical semver | §2 |
| AC3 (capitalized/quoted fixes) | Capitalized = code-block (no-op); quoted = real fix proposed → §6a | §2, §6 |
| AC4 (lifecycle policy + subset) | Policy defined; application proposed (blocked by L2 deny → §6b) | §3, §6b |
| AC5 (circular-ref verify) | **Done — 0 circular refs, F7 disproven** | §4 |
| AC6 (`task:` vs `task_id:` verify) | **Done — F8 disproven (1/213, not 218/218); unification = tech-debt** | §5 |
| AC7 (no regression) | **Done — zero L2 edits; all tasks intact** | §7 |

---

## 9. Cross-references

- **Settings deny rule:** `.claude/settings.json` (lines 465-466 — `Edit/Write(.aiox-core/development/tasks/**)`)
- **Boundary:** `.aiox-core/constitution.md` (Art. VI-VII); `.claude/rules/enforcement-gates.md`
- **Resolution path:** `@aiox-master *propose-modification`
- **Verify test:** `tests/agents/task-schema-verify.test.js`
- **Epic:** [`docs/stories/epics/EPIC-10-REQUIREMENTS.md`](../stories/epics/EPIC-10-REQUIREMENTS.md)
