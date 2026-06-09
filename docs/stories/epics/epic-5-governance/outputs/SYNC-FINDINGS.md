# SYNC-FINDINGS: Framework Governance Audit Results

> **Story:** 5.2 — Framework Governance Sync-Complete Workflow
> **Phase:** Phase 2 — Task 2.1 (Synthesize Findings)
> **Author:** @architect (Aria)
> **Generated:** 2026-06-08
> **Source of truth:** 4 diagnostic JSONs in `docs/stories/epics/epic-5-governance/outputs/` (Phase 1 — Tasks 1.1–1.4). Nothing in this document is invented; every issue traces to a JSON finding, verified against the live repo where load-bearing.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total issues found** | **13** (5 constitution violations + 4 ambiguities + 3 data refs + structure cluster, see Note) |
| **Critical path blockers** | **1** (V-DRIFT-004 — constitutional version drift; unblocks all boundary-gate coherence) |
| **Estimated remediation effort** | **~17.5h** (range 14–21h) |
| **Compliance trajectory** | Constitution 62% → 100% · Data 94% → 100% · Structure 83% → 95% · Routing 0% → 80%+ |
| **Gate verdict** | `blocking_for_phase2: false` — **CLEARED to proceed to Tasks 2.2–2.5** |

**Note on issue count.** The 13 headline issues are the *actionable* findings: 5 constitution violations (V-ART5-001/002/005, V-ART67-003, V-DRIFT-004), 4 constitution ambiguities (AMB-001..004), 3 data-integrity defects (2 broken refs + 1 path error), plus the structure layer's **7 registered-but-unwired orphans** treated as one remediation cluster and 1 phantom-routing failure pattern (FP-01). Counting the unwired orphans individually and the 5 failure patterns, the raw finding total is **~24**. Either way the gate threshold (≥5 issues with proposed solutions) is comfortably met.

**Headline diagnosis.** The framework's *enforcement skeleton is sound* — every NON-NEGOTIABLE constitutional gate (Art. I, II) and the story-driven / no-invention gates (Art. III, IV) work as designed, confirmed by real gate-logs. The damage is concentrated in three soft spots:

1. **Quality gates (Art. V) are non-operational** — `lint` is a hard-coded `exit 0`, `build` script is absent. The MUST gates exist on paper but verify nothing.
2. **Constitutional version drift** — rules and hooks enforce Art. VII and Art. IV-A, but the formal Constitution (v1.0.0) never defines them. Gates apply law the Constitution does not contain.
3. **The routing/auto-activation layer is shipped-but-inert** — 100% of 80 task suggestions fell below the activation threshold; `taskAutoActivationRate = 0`. This is the single biggest threat to Story 5.2's "sync-complete / zero-setup" promise.

There are **zero CRITICAL constitutional violations** and **zero data-loss or security exposures**. This is a coherence-and-quality remediation, not a firefight.

---

## Section 1: Issues Summary (by severity)

### CRITICAL
*None.* No NON-NEGOTIABLE gate is failing; no data loss; no security exposure. (Confirmed by all 4 JSONs — `by_severity.CRITICAL: 0`, impact band MODERATE, integrity 94/100.)

### HIGH

| ID | Title | Impact | Effort |
|----|-------|--------|--------|
| **V-DRIFT-004** | Constitution version drift — Art. VII & Art. IV-A enforced but undefined | Gates apply rules the formal Constitution (v1.0.0) does not contain → authority invalid in a dispute. **Critical-path blocker** for all boundary-gate coherence. | 2–3h |
| **V-ART5-001** | `lint` gate disabled (`echo … && exit 0`) | Art. V MUST ("lint passa sem erros") is unverifiable; gate always green regardless of code state. Verified live in package.json. | 1.5–3h |
| **V-ART5-002** | `build` gate missing (no `scripts.build`) | Art. V MUST ("build completa com sucesso") would fail with "Missing script: build". `kairos:web:build` exists but is not wired to the canonical gate. Verified live. | 1–2h |
| **FP-01** | Task auto-activation never triggers (all 80 suggestions < threshold) | `taskAutoActivationRate = 0`; max score 65 vs threshold 70. Story 5.2's routing assist is **inert in practice**, silently degrading the sync-complete goal. | 3–5h |

### MEDIUM

| ID | Title | Impact | Effort |
|----|-------|--------|--------|
| **V-ART67-003** | `frameworkProtection: false` contradicts 97 active deny rules | Config says boundary unprotected; reality (settings.json + hook) protects L1/L2. Confusing source-of-truth. Verified live (`frameworkProtection: false`). | 0.5–1h |
| **FP-02** | Task category mislabeling (~30% in wrong bucket) | 24/80 suggestions default to catch-all `qa`/`db`; compounds FP-01 and surfaces noise. | 1.5–2.5h |
| **FP-03** | Story traceability gap — task-log written with `storyId: "unknown"` | Breaks the per-story audit chain the sync workflow depends on (Art. III). | 1–2h |
| **DATA-REF-01** | Broken refs (2) + path error (1) | `document-gotchas.md → capture-session-insights.md` (missing), `smart-routing.md → @business-chief` (shim missing), `tool-response-filtering.md → .mcp.json` (missing). All 3 confirmed live. | 1–1.5h |
| **STRUCT-ORPHANS** | 7 registered-but-unwired artifacts (3 MEDIUM checklists + 4 LOW templates) | Registered in install manifest but unreachable by any agent/task/workflow — dead capability. | 2–3h |

### LOW

| ID | Title | Impact | Effort |
|----|-------|--------|--------|
| **V-ART5-005** | Narrow `npm test` scope (excludes `tests/hooks/`) | Local `npm test` does not exercise the constitutional-gate suite (covered only in CI). | 0.5h |
| **AMB-001** | Art. II Gate text says "no gate needed" but 2 hooks enforce it | Constitution understates real enforcement mechanism. | 0.5h |
| **AMB-002** | `enforcement-gates.md` documents Art. IV as WARN; hook is BLOCK-by-default (commit f458793) | Doc/behavior drift on canonical severity. | 0.5h |
| **AMB-004** | Art. VI "mesmo módulo" undefined → ESLint gate non-deterministic | Reviewer-dependent interpretation of the relative-import exception. | 0.5h |
| **FP-04 / FP-05** | Gate audit trail is smoke-test fixtures, not organic traffic | Measurement gap: no real-world gate-reliability evidence. Watch-item, not a defect. | 0.5h (tagging) |

---

## Section 2: Root Cause Analysis

### Category A — Constitution (compliance 62/100, verdict NEEDS_WORK)

**What went wrong.** Two distinct failures. (1) *Quality gates are theatre*: Art. V declares MUST gates for lint and build, but `lint` is a literal `exit 0` and `build` does not exist. (2) *Version drift*: the Constitution froze at v1.0.0 (Last Amended 2025-01-30) while rules/hooks evolved to enforce Art. VII (Framework Boundary) and Art. IV-A (Incremental Development) — articles the formal document never defines.

**Why it happened.** The lint disable is a *deliberate* decision (ADR-001, zero-dep JS core) that was never reflected back into the Constitution as a formal exception — so the document and the build now disagree. The version drift is a propagation failure: amendments were implemented at the enforcement layer (rules + `.cjs` hooks) but never round-tripped to `constitution.md`. Classic "code is ahead of the contract."

**Impact.** A gate that enforces an undefined article is *legally void* under the framework's own authority model — in an agent-boundary dispute, the blocked party could correctly argue "Art. VII does not exist." This is why V-DRIFT-004 is the critical-path blocker: until the Constitution names what the gates enforce, every boundary decision rests on sand.

### Category B — Structure (consistency 83/100, verdict ACCEPTABLE)

**What went wrong.** 22 orphan artifacts; of these, **7 are "registered-but-unwired"** — present in the install manifest but referenced by no agent dependency block, task, or workflow, so they cannot be invoked through normal flows. The other 15 are benign scaffolding (squad templates, example files).

**Why it happened.** Artifacts were authored and registered in the manifest but the wiring step (adding them to an agent's `dependencies` block or a workflow) was skipped or lost. The 3 checklists (brownfield-compatibility, issue-triage, memory-audit) and 4 templates (code-intel-integration-pattern, 3× ptc-*) are real capability that nobody can reach.

**Impact.** Dead capability, not breakage. The framework *thinks* it offers brownfield-compatibility checking and PTC validation, but no path reaches them. Low operational harm, but it violates the gold-standard heuristic "never lose capability" — these are capabilities lost *silently*.

### Category C — Data Integrity (94/100, strongest dimension)

**What went wrong.** 0 YAML errors, 0 dependency cycles, 0 frontmatter issues. Only 3 defects: 2 broken cross-references and 1 invalid path. All three confirmed against the live repo (targets genuinely missing).

**Why it happened.** Reference rot. `capture-session-insights.md` was renamed/removed without updating `document-gotchas.md`; `@business-chief` is referenced in `smart-routing.md` but its command shim does not exist (the squad agent may live elsewhere or be unbuilt); `.mcp.json` is referenced as a path glob in `tool-response-filtering.md` but the file is absent.

**Impact.** Minimal — these are documentation/routing pointers, not executable dependencies. None block a workflow. But each is a small lie the framework tells about itself, and they erode trust in the audit.

### Category D — Failure Patterns (impact 42/100, MODERATE)

**What went wrong.** The *enforcement gates are fine* — the 15 "block" events are the system correctly blocking what it should. The real failure is the **routing layer**: 100% of suggestions score below the activation threshold (max 65 vs 70), so auto-activation is dead (`rate 0`), and ~30% of suggestions land in the wrong category. Separately, one task-log was emitted with `storyId: "unknown"`, breaking traceability.

**Why it happened.** (FP-01) The relevance-scoring formula systematically under-scores even good matches — a 213-task generic corpus dilutes story-specific signal, and weak storyType→category matching caps the best config-story match at ~63. (FP-02) Classification falls back to default buckets (`qa`/`db`) when no confident category is parsed from frontmatter. (FP-03) The story-context resolver couldn't bind a story at emit time and wrote "unknown" instead of failing loudly.

**Impact.** This is the **biggest threat to Story 5.2's thesis**. The sync-complete workflow assumes routing helps orchestrate; with auto-activation permanently off, governance silently degrades to manual task selection — defeating "zero-setup." Note: the gate-log evidence (FP-04/05) is dominated by Story 1.16 smoke-test fixtures, so claims of "battle-tested gates" are currently unsupported by production data (a measurement gap, not a defect).

---

## Section 3: Remediation Roadmap

> Sequencing rule: **V-DRIFT-004 first** (it unblocks all boundary-gate coherence and lets AMB-001/003 resolve cleanly). Quality gates (Art. V) second (they are HIGH and self-contained). Routing recalibration (FP-01/02) third (highest effort, needs measurement loop). Data + ambiguity cleanup last (LOW risk, fast).

### Phase 2.2: Violations Fix (Task 2.2)

Fix in this order (dependencies noted):

1. **V-DRIFT-004 (HIGH, 2–3h) — DO FIRST.** Amend `constitution.md`: formally add **Art. VII (Framework Boundary)** and **Art. IV-A (Incremental Development)**; bump version 1.0.0 → **1.1.0** (MINOR, new principles); update "Last Amended". *Unblocks:* AMB-001, AMB-003, V-ART67-003 coherence.
   > Constitution edits are L1 (`.aiox-core/constitution.md`). Route through `@aiox-master *propose-modification` — do **not** hand-edit. (See Blockers §5.)
2. **V-ART5-001 (HIGH, 1.5–3h).** Re-activate `lint` against a zero-dep-compatible ESLint config **OR** formalize ADR-001 as an explicit Art. V exception in the Constitution. Decision belongs to @architect; current `echo … exit 0` is verified live.
3. **V-ART5-002 (HIGH, 1–2h).** Define `scripts.build` — delegate to `kairos:web:build` (which exists) or make it an explicit documented no-op for the zero-dep backend, **OR** amend Art. V to make the build gate conditional on buildable targets.
4. **V-ART67-003 (MEDIUM, 0.5–1h).** Set `frameworkProtection: true` in `core-config.yaml` to match the 97 active deny rules, **OR** document that settings.json is the source of truth. (Resolves AMB-003.)
5. **V-ART5-005 (LOW, 0.5h).** Add `tests/hooks/*.test.js` to the `npm test` command so local validation covers the constitutional-gate suite.

### Phase 2.3: Data Fix (Task 2.3)

| Defect | Fix | Effort |
|--------|-----|--------|
| `document-gotchas.md → capture-session-insights.md` (missing) | Re-point to the renamed task, or remove the dead reference. | 0.25h |
| `smart-routing.md → @business-chief` (shim missing) | Confirm whether the business squad agent exists elsewhere; create the shim or correct the handle. | 0.5h |
| `tool-response-filtering.md → .mcp.json` (missing) | Correct the path glob or remove the stale reference. | 0.25h |
| **STRUCT-ORPHANS** (7 unwired) | Wire the 3 checklists + 4 templates into the relevant agent `dependencies`/workflows, **or** deliberately deregister them from the manifest. (Capability-preservation: prefer wiring.) | 2–3h |

### Phase 2.4: Clarification (Task 2.4) — resolve ambiguities

| ID | Resolution | Effort |
|----|-----------|--------|
| AMB-001 | Update Art. II Gate field to reference `enforce-agent-authority.cjs` as the real enforcement mechanism. | 0.25h |
| AMB-002 | Update `enforcement-gates.md` (Gate Inventory + Override) to reflect **BLOCK-by-default** for Art. IV, consistent with commit f458793 and live gate-logs. | 0.25h |
| AMB-003 | Resolved by V-ART67-003 (flag alignment) + a documenting note. | (folded) |
| AMB-004 | Define "mesmo módulo" operationally (e.g. "same directory or direct subdirectory of the feature") so the ESLint relative-import gate is deterministic. | 0.5h |

### Phase 2.5: Improvements / Prevention (Task 2.5)

| Item | Prevention mechanism | Effort |
|------|---------------------|--------|
| **FP-01** | Recalibrate task-suggestion scoring so a confident category+storyType match clears ~70 (or lower threshold to observed top-quartile ~60); then re-measure `taskAutoActivationRate`. | 3–5h |
| **FP-02** | Fix classification to read a real `category` from task frontmatter instead of defaulting to `qa`/`db`; add a validation pass rejecting catch-all collapse. | 1.5–2.5h |
| **FP-03** | Make the story-context resolver fail loudly (or queue) instead of writing `storyId: "unknown"`; bind active story before any task-log emit. | 1–2h |
| **FP-04/05** | Tag smoke-test gate events (`source: "test"`) so production failure metrics separate from fixture noise — enables real gate-reliability claims. | 0.5h |
| **Drift guard** | Add a CI check that fails if a rule/hook references a constitutional article not defined in `constitution.md` (prevents the next V-DRIFT). | (recommended, 1h — optional) |

---

## Section 4: Success Metrics (before / after)

| Metric | Before | Target | Effort |
|--------|--------|--------|--------|
| Constitution Compliance | 62% | 100% | ~8h (V-DRIFT-004 + Art. V trio + AMBs) |
| Data Integrity | 94% | 100% | ~1h (3 refs) + ~2.5h (orphan wiring) |
| Structure Consistency | 83% | ≥95% | ~2.5h (wire 7 orphans) |
| Framework Routing (auto-activation) | 0% (inert) | ≥80% match-clears-threshold | ~5h (FP-01 + FP-02) |
| Audit Traceability | `unknown` leaks possible | 0 unknown-story task-logs | ~1.5h (FP-03) |

**Aggregate effort:** ~17.5h central estimate (14–21h range). Phase split: 2.2 ≈ 6h · 2.3 ≈ 3.5h · 2.4 ≈ 1.25h · 2.5 ≈ 7h.

---

## Section 5: Dependencies & Blockers

### Critical-path ordering

```
V-DRIFT-004 (amend Constitution: Art. VII + IV-A, v1.1.0)
   │  unblocks coherence for ↓
   ├─► AMB-001 (Art. II gate text)
   ├─► AMB-003 (frameworkProtection meaning)
   └─► V-ART67-003 (flag alignment)   ← safe to set true once Art. VII is formally defined

V-ART5-001 (lint) ─┐
V-ART5-002 (build) ─┤ independent of each other; both gate Art. V → 100%
V-ART5-005 (test)  ─┘

FP-02 (category fix) ──► FP-01 (score recalibration)
   │  mislabeling compounds under-scoring, so fix classification BEFORE/WITH recalibration
FP-03 (traceability) — independent, parallelizable
```

### Hard blockers (process, not technical)

1. **L1 Constitution edit (V-DRIFT-004, AMB-001/004).** `.aiox-core/constitution.md` is L1 (NEVER modify directly). All constitutional amendments MUST route through **`@aiox-master *propose-modification`** + IDS impact assessment. @architect *designs* the amendment; @architect/@dev do **not** hand-edit L1. This is the single governance gate that paces Phase 2.2.
2. **L2 rules edits (AMB-002, V-ART5-005 if touching enforcement-gates.md).** `.claude/rules/` and `.aiox-core/development/` are L2 (extend-only / NEVER modify). Route framework-rule changes through the same proposal path.
3. **No blockers for L3/L4 fixes.** `core-config.yaml` (V-ART67-003), `package.json` scripts (V-ART5-001/002/005), and the SYNAPSE scoring/classification code (FP-01/02/03) are mutable — no governance gate beyond normal SDC.

### Cross-phase dependency

- **FP-01 needs a measurement loop**: recalibrate → re-run task-logs → re-read `taskAutoActivationRate`. Budget one extra iteration. Do FP-02 first so the recalibration isn't fighting mislabeled categories.

---

## Appendices

### Appendix A — Detailed issue list (traceability to source JSONs)

| Issue ID | Source JSON | Severity | Status verified live |
|----------|-------------|----------|----------------------|
| V-ART5-001 | constitution-violations.json | HIGH | YES — `lint = echo … exit 0` |
| V-ART5-002 | constitution-violations.json | HIGH | YES — no `scripts.build`; `kairos:web:build` exists |
| V-ART67-003 | constitution-violations.json | MEDIUM | YES — `frameworkProtection: false` |
| V-DRIFT-004 | constitution-violations.json | MEDIUM→HIGH* | YES — constitution v1.0.0, no Art. VII/IV-A |
| V-ART5-005 | constitution-violations.json | LOW | YES — `npm test` scope = sniper-api + ws |
| AMB-001..004 | constitution-violations.json | LOW | partial (textual) |
| FP-01 | failure-patterns.json | HIGH | (metrics) `taskAutoActivationRate: 0` |
| FP-02 | failure-patterns.json | MEDIUM | (metrics) 24/80 miscategorized |
| FP-03 | failure-patterns.json | MEDIUM | YES — `unknown.json` present |
| FP-04/05 | failure-patterns.json | LOW | (metrics) smoke-test fixtures |
| DATA-REF (×2) | data-integrity-report.json | MEDIUM | YES — both targets missing |
| PATH-ERR (×1) | data-integrity-report.json | MEDIUM | YES — `.mcp.json` missing |
| STRUCT-ORPHANS (×7) | baseline-audit.json | 3×MEDIUM + 4×LOW | (manifest) registered-but-unwired |

\* *Severity re-rated to HIGH for sequencing: although the source JSON labels V-DRIFT-004 MEDIUM, it is the critical-path blocker — every boundary gate enforces articles the Constitution does not define. Rated HIGH here on impact-to-coherence, documented per Architect-First "trade-off analysis" rule.*

### Appendix B — Complexity / effort breakdown

| Phase | Issues | Effort (central) | Risk |
|-------|--------|-----------------|------|
| 2.2 Violations | 5 (1 HIGH-blocker, 2 HIGH, 1 MED, 1 LOW) | ~6h | L1/L2 process gate |
| 2.3 Data + orphans | 3 refs + 7 orphans | ~3.5h | Low (capability-preservation judgment) |
| 2.4 Clarification | 4 ambiguities | ~1.25h | Low |
| 2.5 Improvements | FP-01/02/03 + tagging + drift-guard | ~7h | Medium (FP-01 needs measurement loop) |
| **Total** | **13 actionable (≈24 raw)** | **~17.5h** | — |

### Appendix C — Confidence notes

- **Constitution & Data findings: HIGH confidence.** Empirically verified against the live repo (package.json, core-config.yaml, constitution.md header, broken-ref targets all confirmed by @architect during synthesis).
- **Failure-pattern findings: MEDIUM-HIGH confidence** (per source JSON). Routing-quality patterns (FP-01/02) have strong quantitative evidence (80 suggestions, hook-metrics). Gate-enforcement patterns (FP-04/05) are weak-evidence because the gate-logs are dominated by Story 1.16 smoke-test fixtures from a single day (2026-06-08) — operational failure history is thin.
- **Effort estimates** carry ±25% uncertainty; FP-01 is the widest band (3–5h) because scoring recalibration requires an empirical re-measurement loop, not a one-shot edit.
- **Nothing invented.** Per Constitution Art. IV (No Invention), every statement traces to a Phase-1 JSON finding or a live-repo verification performed during this synthesis.

---

## Gate Decision

| Gate criterion | Result |
|----------------|--------|
| Findings ≥ 5 issues | **PASS** (13 actionable, ~24 raw) |
| Solution proposed for each | **PASS** (every issue has a remediation in §3) |
| Roadmap executable (sequence, effort, blockers) | **PASS** (§3 + §5) |
| `blocking_for_phase2` | **`false`** — cleared to proceed to Tasks 2.2–2.5 |

**Recommendation:** Proceed to **Task 2.2 (Violations Fix)**, starting with **V-DRIFT-004** routed through `@aiox-master *propose-modification`. Fix FP-02 before FP-01 in Phase 2.5.
