# PROCESS IMPROVEMENTS — Story 5.2 Task 2.5

> **Story:** 5.2 — Framework Governance Sync-Complete Workflow (epic-5-governance)
> **Phase:** Phase 2 — Task 2.5 (Process Improvements / Prevention)
> **Author:** @architect (Aria)
> **Generated:** 2026-06-09
> **Input:** `SYNC-FINDINGS.md` (Task 2.1 roadmap) + remediation outputs 2.2 (violations), 2.3 (data), 2.4 (`AMBIGUITIES-CLARIFIED.md`)
> **Source of truth:** Every improvement below prevents recurrence of a **real** Phase-1 finding (V-*, FP-*, DATA-REF, AMB-*, STRUCT-ORPHANS). Nothing is invented (Constitution Art. IV — No Invention). Each maps to a finding ID, traced in the Prevention Roadmap table.
> **Nature of this task:** **Document and propose**, not implement. All artifacts described here are built in future sessions (5.3–5.5) under their own stories. This task is non-blocking for Phase 3.

---

## 0. Why These Improvements (Root-Cause → Prevention map)

Phase 1 found that the framework's **enforcement skeleton is sound** but three soft spots recur. Each soft spot maps to a class of preventive control below — chosen so that the *next* drift is caught by a hook or runbook before it reaches an audit, instead of surfacing months later (the "drift-until-major-audit" anti-pattern this story exists to break).

| Phase-1 soft spot | Recurring finding(s) | Preventive control class |
|-------------------|----------------------|--------------------------|
| Quality gates non-operational | V-ART5-001/002/005 | **Hook 1** (Constitution Compliance Check — Art. V branch) |
| Constitutional version drift | V-DRIFT-004, AMB-001/004 | **Hook 1** (Art. VI-VII branch) + **Drift Guard** + **SOP-1** |
| Reference rot / data integrity | DATA-REF-01, STRUCT-ORPHANS | **Hook 2** (Data Integrity Check) + **SOP-2** |
| Routing/traceability inert | FP-01/02/03 | **Dashboard** (gate_health + traceability metrics) + **Runbook-1** |
| Measurement gap (fixtures ≠ prod) | FP-04/05 | **Dashboard** (source-tagged metrics) + **Runbook-2** |
| Process didn't catch L1 drift | V-DRIFT-004 propagation failure | **SOP-1** (Amendment Process) + **SOP-3** (Gate Failure Triage) |

> **Design note (Architect-First):** these are *detective + preventive* controls, not new enforcement gates. The NON-NEGOTIABLE gates (Art. I, II) already work. We are adding the **round-trip checks** that the framework was missing — the ones that would have caught V-DRIFT-004 the day a hook started enforcing an article the Constitution didn't define.

---

## 1. Validation Hooks (Pre-commit)

### Hook 1: Constitution Compliance Check

**Prevents:** V-ART5-001 (lint theatre), V-ART5-002 (missing build), V-DRIFT-004 (version drift), V-ART67-003 (flag contradiction)
**Trigger:** pre-commit (detects changes in `.aiox-core/`, `.claude/rules/`, `package.json`, `core-config.yaml`)
**Ação:** Run `constitution-validator` that checks, per article:

- **Art. I (CLI First):** CLI-facing features expose a CLI entry point (`bin/` or registered command).
- **Art. II (Agent Authority):** no `git push` / `gh pr` invocation outside a `@devops`-authorized path. *(Already hard-enforced by `enforce-agent-authority.cjs` — this is a redundant pre-commit advisory, defence-in-depth.)*
- **Art. III (Story-Driven):** committed code traces to an active story. *(Already enforced by `enforce-story-driven.cjs` — advisory mirror here.)*
- **Art. IV (No Invention):** spec statements trace to a requirement (FR/NFR/CON) or research finding. *(Mirrors `enforce-no-invention.cjs` — BLOCK-by-default per commit f458793 / AMB-002.)*
- **Art. V (Quality First):** `lint` / `typecheck` / `test` / `build` are **real** gates — fails if any is a literal `exit 0` stub or a missing script. **This is the branch that would have caught V-ART5-001/002.**
- **Art. VI-VII (Framework Boundary):** L1/L2 paths not modified; **and** `constitution.md` defines every article a rule/hook references (the **Drift Guard**, see below). **This is the branch that would have caught V-DRIFT-004.**

**Artefacto:** `.claude/hooks/validate-constitution.cjs` (zero-dep `.cjs`, same pattern as existing enforcement gates; graceful-degrade — never blocks dev by failing)
**Esforço:** 90m
**Traceability:** V-ART5-001, V-ART5-002, V-DRIFT-004, V-ART67-003 (`SYNC-FINDINGS.md` §1, §3.2)

### Hook 2: Data Integrity Check

**Prevents:** DATA-REF-01 (2 broken refs + 1 path error), STRUCT-ORPHANS (7 registered-but-unwired)
**Trigger:** pre-commit (detects changes in `.aiox-core/data/`, `.claude/rules/`, `.aiox-core/development/tasks/`, agent dependency blocks)
**Ação:** Validate YAML well-formedness + resolve cross-references:
- tasks → workflows, agents → rules, rules → tasks (the `document-gotchas → capture-session-insights` class of break)
- agent handles → command shims (the `@business-chief` class of break)
- path globs → real files (the `.mcp.json` class of break)
- **manifest reachability:** flag artifacts registered in the install manifest but referenced by no agent dependency / task / workflow (the STRUCT-ORPHANS class — surfaces dead capability *as it is created*, not 7 orphans later).

**Artefacto:** `.claude/hooks/validate-data-integrity.cjs`
**Esforço:** 45m
**Traceability:** DATA-REF-01, STRUCT-ORPHANS (`SYNC-FINDINGS.md` §1 MEDIUM, §3.3)

### Hook 3: Framework Boundary Protection (already exists)

**Prevents:** AMB-003 confusion (flag vs effective protection)
**Status:** Already implemented in `enforce-quality-gates.cjs` (L1/L2 write block) + `settings.json` deny rules.
**Enhancement:** Add detailed decision logging so an L1/L2 block message names **both** the rule and the effective source-of-truth (deny rules), clarifying AMB-003 ("`frameworkProtection: false` but writes blocked anyway") at the moment of the block instead of in a later audit.
**Esforço:** 15m
**Traceability:** AMB-003 (`AMBIGUITIES-CLARIFIED.md` §AMB-003), V-ART67-003 (`SYNC-FINDINGS.md` §1)

### Drift Guard (recommended add-on to Hook 1)

**Prevents:** V-DRIFT-004 recurrence (the single biggest coherence failure found)
**Ação:** CI/pre-commit check that **fails if any rule or `.cjs` hook references a constitutional article (`Art. N`) not defined in `constitution.md`.** This is the exact control whose absence let Art. VII and Art. IV-A be enforced for months while the Constitution stayed at v1.0.0.
**Artefacto:** folded into `.claude/hooks/validate-constitution.cjs` (Art. VI-VII branch) **or** standalone `.claude/hooks/validate-drift-guard.cjs`
**Esforço:** included in Hook 1's 90m (was the optional "~1h" in `SYNC-FINDINGS.md` §3.2)
**Traceability:** V-DRIFT-004 (`SYNC-FINDINGS.md` §2-A, §3.2 Drift guard row)

---

## 2. Governance Health Dashboard

**Prevents:** FP-04/05 (no organic gate-reliability evidence), drift-until-major-audit pattern (no weekly visibility)
**Objetivo:** Weekly compliance visibility so a >5% drop is seen in days, not at the next quarterly audit.

### Dashboard Metrics (JSON output)

```json
{
  "constitution_compliance": {
    "art_i_cli_first": 95,
    "art_ii_agent_authority": 100,
    "art_iii_story_driven": 92,
    "art_iv_no_invention": 88,
    "art_v_quality_first": 97,
    "art_vi_vii_boundary": 99
  },
  "data_integrity": {
    "yaml_errors": 0,
    "broken_references": 0,
    "dependency_cycles": 0,
    "manifest_orphans": 0,
    "overall_score": 97
  },
  "routing_health": {
    "task_auto_activation_rate": 0,
    "miscategorized_pct": 30,
    "unknown_story_logs": 1
  },
  "gate_health": {
    "gates_enforced": 250,
    "violations_blocked": 45,
    "overrides_used": 2,
    "source_organic": 0,
    "source_fixture": 250
  }
}
```

> **Design note:** the `routing_health` block surfaces FP-01/02/03 directly (`task_auto_activation_rate: 0` was *the* biggest threat to Story 5.2's thesis). The `source_organic` / `source_fixture` split in `gate_health` operationalizes the FP-04/05 measurement gap — it makes "battle-tested gates" claims falsifiable by separating smoke-test fixtures from production traffic.

**Artefacto:** `.aiox/dashboards/governance-health.json` (updated via CI / Runbook-1)
**Esforço:** 60m
**Traceability:** FP-04/05, FP-01/02/03 (`SYNC-FINDINGS.md` §2-D, §4)

---

## 3. Standard Operating Procedures (SOPs)

### SOP-1: Framework Amendment Process

**Prevents:** V-DRIFT-004 (amendments implemented at enforcement layer but never round-tripped to `constitution.md`), AMB-001/004 (text lagging behaviour)
**Quando:** Any amendment to `constitution.md`, rules, or doctrine
**Quem:** @aiox-master + @po + @architect
**Steps:**
1. Create issue: "Amendment: [title]"
2. Propose via `@aiox-master *propose-modification` (the mandatory L1 path — never hand-edit `constitution.md`)
3. Validate IDS impact (dependencies, gates affected)
4. Triple-sign: @po (policy), @architect (design), @aiox-master (governance)
5. Bump version (e.g. v1.0.0 → v1.1.0 MINOR for new principles) + update "Last Amended"
6. Changelog entry + audit trail
7. **Round-trip check:** confirm every newly-enforced article is now *defined* in `constitution.md` (closes the exact gap that produced V-DRIFT-004)

**Artefacto:** `.aiox-core/amendment-protocol.md` *(proposal — L2; routed via `*propose-modification`, not hand-written in this task)*
**Esforço:** 30m
**Traceability:** V-DRIFT-004, AMB-001, AMB-004 (`SYNC-FINDINGS.md` §3.2; `AMBIGUITIES-CLARIFIED.md` Decision B, C)

### SOP-2: Broken Reference Resolution

**Prevents:** DATA-REF-01 recurrence, STRUCT-ORPHANS de-registration decisions
**Quando:** Hook 2 (Data Integrity Check) flags a `broken_reference` or `manifest_orphan`
**Quem:** @data-engineer (lead) + @architect (design)
**Steps:**
1. Check whether the target lives in L1/L2 (if so, an L1/L2 boundary block applies — log for `*propose-modification`)
2. If the target is in L3/L4 (editable):
   - Option A: remove the dead reference (e.g. the `.mcp.json` stale glob)
   - Option B: re-point to an existing target (e.g. renamed task)
   - Option C: create the target (only if in-scope)
3. For `manifest_orphan`: prefer **wiring** into the relevant agent `dependencies`/workflow over deregistration (capability-preservation heuristic — "never lose capability silently")
4. Commit + emit JSON with the decision
5. Escalate if an L1 boundary is affected

**Artefacto:** `.claude/rules/data-integrity-remediation-sop.md` *(proposal — L2)*
**Esforço:** 30m
**Traceability:** DATA-REF-01, STRUCT-ORPHANS (`SYNC-FINDINGS.md` §2-B, §2-C, §3.3)

### SOP-3: Gate Failure Triage

**Prevents:** FP-03-class misfires (writing `storyId: "unknown"` instead of failing loudly), false-positive gate friction
**Quando:** An agent hits a gate block
**Quem:** Agent (triage) + @aiox-master (escalation)
**Steps:**
1. Is it a false positive (e.g. a `.json` file in `docs/` that shouldn't need a story)?
   - Yes: propose gate refinement via `*propose-modification`
   - No: fix the violation per the gate's requirement
2. Is the gate output misleading?
   - Log as documentation debt (`docs: clarify gate message X`)
3. Is it constitutional?
   - No: change the Constitution first (via SOP-1), not the code
   - Yes: proceed
4. **Never write a placeholder to pass the gate** (the FP-03 anti-pattern: `storyId: "unknown"`). Fail loudly or queue instead.

**Artefacto:** `.claude/rules/gate-failure-triage-sop.md` *(proposal — L2)*
**Esforço:** 30m
**Traceability:** FP-03 (`SYNC-FINDINGS.md` §2-D, §3.5 FP-03 row)

---

## 4. Runbooks

### Runbook-1: Weekly Compliance Audit

**Prevents:** drift-until-major-audit pattern (the structural reason Story 5.2 was needed at all)
**Purpose:** Detect drift early, every week, instead of at a one-off audit
**Frequency:** Mondays 09:00 (automated)
**Tasks:**
1. Run Constitution Validator (Hook 1 in batch mode)
2. Run Data Integrity Check (Hook 2 in batch mode)
3. Aggregate metrics → `governance-health.json`
4. Alert if any score drops >5% week-over-week
5. Post summary to the team channel

**Artefacto:** `.aiox/runbooks/weekly-compliance-audit.sh` (CLI-native, Art. I compliant)
**Esforço:** 45m
**Traceability:** prevents the root pattern behind the whole audit (`SYNC-FINDINGS.md` Executive Summary); consumes Hook 1 + Hook 2 + Dashboard

### Runbook-2: Quarterly Framework Review

**Prevents:** recurring-pattern blindness (FP-01..05 went unnoticed until a full audit)
**Purpose:** Detect patterns across a quarter — which failures recur, which rules need tuning, is auto-activation finally non-zero
**Frequency:** Q1/Q2/Q3/Q4 (manual, ~2h)
**Tasks:**
1. Review `gate-logs/` for patterns — and check `source_organic` vs `source_fixture` (FP-04/05: are claims now backed by real traffic?)
2. Review `task-logs/` for failed story associations (FP-03: any `storyId: "unknown"` leaked?)
3. Review `amendment-protocol` audit trail (was every amendment round-tripped per SOP-1?)
4. Check `task_auto_activation_rate` trend (FP-01: did recalibration move it off 0?)
5. Propose 1–2 process improvements for next quarter; create stories for them

**Artefacto:** `.aiox/runbooks/quarterly-framework-review.md`
**Esforço:** 30m
**Traceability:** FP-01/02/03/04/05 (`SYNC-FINDINGS.md` §2-D, §4)

---

## 5. Prevention Roadmap (summary)

| Improvement | Type | Effort | Owner | Target | Prevents (finding) |
|-------------|------|--------|-------|--------|--------------------|
| Constitution Validator (incl. Drift Guard) | Hook | 90m | @architect | Session 5.3 | V-ART5-001/002, V-DRIFT-004, V-ART67-003 |
| Data Integrity Validator | Hook | 45m | @data-engineer | Session 5.3 | DATA-REF-01, STRUCT-ORPHANS |
| Boundary Protection Enhancement | Hook | 15m | @devops | Session 5.3 | AMB-003 / V-ART67-003 |
| Governance Health Dashboard | Observability | 60m | @analyst | Session 5.4 | FP-04/05, FP-01/02/03 |
| Amendment Protocol SOP | Process | 30m | @aiox-master | Session 5.4 | V-DRIFT-004, AMB-001/004 |
| Broken Ref Remediation SOP | Process | 30m | @data-engineer | Session 5.4 | DATA-REF-01, STRUCT-ORPHANS |
| Gate Failure Triage SOP | Process | 30m | @dev | Session 5.4 | FP-03 |
| Weekly Audit Runbook | Automation | 45m | @architect | Session 5.5 | drift-until-audit pattern |
| Quarterly Review Runbook | Process | 30m | @aiox-master | Session 5.5 | FP-01..05 pattern blindness |

**Total effort for all improvements:** ~375 minutes ≈ **6.25 hours** (future sessions).

> **Consistency note vs `SYNC-FINDINGS.md` §3.5:** that roadmap scoped Phase-2.5 prevention at ~7h *including* the FP-01/02/03 code recalibration (3–5h + 1.5–2.5h + 1–2h) as implementation work. This task is **propose-only**: it documents the 9 standing controls (~6.25h to build later) that *prevent* those patterns recurring. The FP-01/02/03 code fixes themselves remain separate implementation stories — they are the *what to fix now*; these 9 controls are the *how to never need this audit again*.

---

## 6. Trade-off Analysis (Architect duty)

**Decision A — Detective controls over more enforcement gates.**
These 9 improvements are detective/preventive (hooks that *check*, runbooks that *audit*), not new NON-NEGOTIABLE gates.
- *Trade-off:* hard gates catch violations at commit time but add friction and false-positive risk (the FP-03 / SOP-3 problem). Weekly/quarterly detective controls have latency (up to 7 days) but zero dev friction and catch *drift* (slow divergence) that point-in-time gates miss. Given Phase-1 found **drift**, not active breakage, detective controls are the higher-leverage class here. The one exception — the **Drift Guard** — *is* a gate, because V-DRIFT-004 is the kind of error that must be blocked at source.

**Decision B — Wire orphans, don't deregister (SOP-2 default).**
- *Trade-off:* deregistration is cleaner and faster, but violates the gold-standard "never lose capability silently" heuristic. Default to wiring; deregister only on explicit owner authorization.

**Decision C — Propose-only, zero L1/L2 edits in this task.**
- *Trade-off:* implementing now would be faster end-to-end, but the artifacts touch L1 (`.aiox-core/amendment-protocol.md` doctrine) and L2 (`.claude/rules/*-sop.md`, `.claude/hooks/*.cjs`). All must route through `@aiox-master *propose-modification` per the framework-boundary governance the audit itself is enforcing. Hand-building them here would *reproduce the V-DRIFT-004 failure mode* (changing the system without round-tripping governance). Rejected.

---

## 7. Security & Backward-Compatibility Flags (Architect duty)

- **Security:** No improvement weakens a gate. The Drift Guard and Hook 1's Art. V branch *strengthen* posture by failing closed on stub gates (V-ART5-001's `exit 0`). Hook 3's enhanced logging adds no new exposure (logs decisions already made). All hooks follow the existing graceful-degradation rule — **enforcement tooling must never block development by failing** (`enforcement-gates.md`).
- **Backward-compat:** All 9 are additive — new hooks, new dashboards, new SOPs/runbooks. None modify existing gate behaviour. The only runtime-visible change is *more* pre-commit checks (advisory, graceful-degrade), so no existing workflow breaks. Zero breaking change expected.

---

## 8. Non-blocking Notes

These improvements are **future-focused**: the Phase-2.5 task is to **document and propose**, not to implement. Implementation happens in Sessions 5.3–5.5 (separate stories, owners assigned above).

All improvements align with **Art. I (CLI First)** — hooks and runbooks are CLI-native; the dashboard is observability (read-only JSON), not control. All L1/L2 artifacts (amendment-protocol, SOP rules, `.cjs` hooks) route through `@aiox-master *propose-modification` per **Art. VI-VII** governance, never hand-edited.

**Task 2.5 status:** Complete. 9 improvements proposed (3 hooks + 1 dashboard + 3 SOPs + 2 runbooks), each traced to a real Phase-1 finding (Art. IV), non-blocking, L1/L2 not modified. `ready_for_phase3: true`.
