# Agent Audit Framework

**Version:** 1.0
**Created:** 2026-06-14
**Story:** 11.1 — Audit Framework Definition (EPIC-11)
**Owner:** @config-engineer (Sigil)
**Status:** Active

---

## 1. Purpose

This document defines the **single, reusable framework** for auditing every AIOX
agent (11 total) under EPIC-11 — Agent Infrastructure Readiness & Certification.

Without a consistent framework, each agent audit would be ad-hoc — different
sections, different scoring, different quality — making it impossible to compare
agent readiness across the roster. This framework removes that ambiguity. Every
audit produced for stories 11.2–11.8 MUST follow the 8-section checklist, the
report template, and the scoring guidelines defined here.

**Consumers of this framework:**

| Story | Agent(s) audited | Applies |
|-------|------------------|---------|
| 11.2 | @sm (River) — pilot | 8-section checklist + template + scoring |
| 11.3 | @pm (Morgan) | same |
| 11.4 | @dev (Dex) | same |
| 11.5 | @qa (Quinn) | same |
| 11.6 | @devops (Gage) | same |
| 11.7 | @architect + @analyst + @po (batch) | same |
| 11.8 | @data-engineer + @ux-design-expert + @aiox-master (batch) | same |
| 11.9 | Readiness matrix consolidation | reads scores from all reports |

**Design principles (AIOX-aligned):**

- **Simple** — happy-path first; document complexity, do not drown in it.
- **Reusable** — one template fits all 11 agents.
- **No invention** — every audit finding traces to an actual file, command, or
  reference. Auditors report what *is*, not what *should be*.
- **Deterministic** — the same agent audited twice yields the same score.

---

## 2. The 8-Section Audit Checklist

Every agent audit MUST cover these 8 sections, in this order. Sections 1–6
gather evidence; sections 7–8 act on it.

### Section 1 — Connectivity

**Question:** Does every file the agent references actually exist, at the correct path?

- [ ] List all files referenced by the agent (persona/SKILL, backup definition,
      tasks, templates, checklists, rules, memory, scripts, workflows).
- [ ] For each reference, confirm the file exists (`Read`/`Glob` it).
- [ ] Flag every broken, missing, or wrong-path reference as a gap (Section 3).
- [ ] Note layer (L1–L4) of each referenced file — references should respect the
      framework boundary.

**Evidence captured:** a connectivity table — `Reference → Path → Exists? → Layer`.

### Section 2 — Execution Trace

**Question:** What is the step-by-step input → output flow for the agent's commands?

- [ ] Document **at least 10 command flows** (e.g. `*help`, `*draft`, …).
- [ ] For each flow, capture: **input → steps → output → checkpoint**.
- [ ] Note where the flow hands off to another agent (and via which artifact).
- [ ] Mark any step whose behavior is ambiguous or undefined.

**Evidence captured:** numbered execution traces, one per command flow.

### Section 3 — Gaps

**Question:** What is missing, broken, or ambiguous?

- [ ] Collect every gap surfaced in Sections 1–2.
- [ ] Categorize each: **CRITICAL / HIGH / MEDIUM / LOW**.
- [ ] Give each gap a stable ID: `GAP-001`, `GAP-002`, …
- [ ] State the impact of each gap (what breaks, when).

**Severity rubric:**

| Severity | Meaning |
|----------|---------|
| CRITICAL | Agent cannot perform a core command (broken required file, undefined primary flow). |
| HIGH | A documented capability fails or is unreliable; a referenced file is wrong. |
| MEDIUM | Stale reference, minor ambiguity, missing-but-non-blocking checkpoint. |
| LOW | Cosmetic, wording, or nice-to-have improvement. |

### Section 4 — Invention Detection

**Question:** Is the agent doing more than its definition allows? (Constitution Art. IV — No Invention.)

- [ ] Compare the agent's documented authority (commands, scope) against its
      actual behavior in the traces.
- [ ] Flag any capability the agent exercises that is **not defined** in its persona.
- [ ] Flag any authority overreach (e.g. an agent performing an operation
      exclusive to another agent — see `.claude/rules/agent-authority.md`).
- [ ] Each invention becomes a gap (typically HIGH or CRITICAL).

**Evidence captured:** an invention table — `Observed behavior → Defined? → Verdict`.

### Section 5 — Coherence

**Question:** Are there contradictions within the agent's own specs, or against shared rules?

- [ ] Check the persona/SKILL against its backup definition for divergence.
- [ ] Check the agent's stated authority against `agent-authority.md`.
- [ ] Check the agent's status/lifecycle claims against `story-lifecycle.md`.
- [ ] Flag every contradiction (becomes a gap).

**Evidence captured:** a contradiction list — `Spec A says X / Spec B says Y → resolution`.

### Section 6 — Determinism Score

**Question:** Given the same input, will the agent behave the same way every time?

- [ ] Compute the determinism score using the formula in **Section 9**.
- [ ] Show the four sub-scores (Connectivity, Execution Clarity, Gap Resolution,
      Coherence), each out of 25%.
- [ ] Justify each sub-score with a one-line rationale referencing the evidence.
- [ ] State the resulting tier (production-ready / minimum-ready / not-ready).

**Evidence captured:** the score breakdown table + final score + tier.

### Section 7 — Fixes

**Question:** Were the critical gaps actually fixed?

- [ ] For each CRITICAL (and where feasible HIGH) gap, define a fix: `FIX-001`, …
- [ ] Link each fix to the gap it resolves (`FIX-001 → GAP-003`).
- [ ] Record the fix status: **APPLIED / DEFERRED / WONTFIX (with reason)**.
- [ ] Verify each applied fix (re-run the affected flow; confirm the reference now resolves).
- [ ] No CRITICAL gap may remain `DEFERRED` for a passing certification.

**Evidence captured:** a fix table — `Fix ID → Resolves → Status → Verification`.

### Section 8 — Readiness

**Question:** Is the agent certified production-ready?

- [ ] Restate the final determinism score and tier.
- [ ] Confirm: 0 CRITICAL gaps remaining.
- [ ] Record the certification verdict and the sign-off (@pm + @qa).
- [ ] Note the agent's **snapshot version** (the definition is frozen during the audit).

**Evidence captured:** the readiness statement + sign-off block.

---

## 3. Report Template

Every audit report (`docs/agents-ready/11.X-{agent}-audit-FINAL.md`) MUST use
this Markdown structure. Copy it verbatim and fill every field.

```markdown
# Agent Audit — {Agent Name} ({@agent-id})

**Story:** 11.X
**Auditor:** @config-engineer (Sigil)
**Date:** YYYY-MM-DD
**Snapshot version:** {agent definition hash / date frozen}
**Final determinism score:** X.X/10 — {TIER}
**Certification:** {CERTIFIED | MINIMUM CERTIFIED | NOT CERTIFIED}

---

## 1. Connectivity

| Reference | Path | Exists? | Layer |
|-----------|------|---------|-------|
| ... | ... | ✅/❌ | L1–L4 |

Summary: N/M references resolve. {list broken refs → GAP IDs}

## 2. Execution Trace

### Flow 1: *{command}
- **Input:** ...
- **Steps:** 1) ... 2) ... 3) ...
- **Output:** ...
- **Checkpoint:** ...
- **Handoff:** {next agent / artifact, or "none"}

### Flow 2: *{command}
...

(≥ 10 flows)

## 3. Gaps

| Gap ID | Severity | Description | Impact |
|--------|----------|-------------|--------|
| GAP-001 | CRITICAL/HIGH/MEDIUM/LOW | ... | ... |

## 4. Invention Detection

| Observed behavior | Defined in persona? | Verdict |
|-------------------|---------------------|---------|
| ... | yes/no | OK / INVENTION → GAP-00X |

## 5. Coherence

| Spec A | Spec B | Contradiction? | Resolution |
|--------|--------|----------------|------------|
| ... | ... | yes/no | ... |

## 6. Determinism Score

| Sub-score | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| Connectivity | 25% | XX% | ... |
| Execution Clarity | 25% | XX% | ... |
| Gap Resolution | 25% | XX% | ... |
| Coherence | 25% | XX% | ... |

**Determinism = (Connectivity + Execution Clarity + Gap Resolution + Coherence) / 4 = X.X/10**
**Tier:** {production-ready / minimum-ready / not-ready}

## 7. Fixes

| Fix ID | Resolves | Status | Verification |
|--------|----------|--------|--------------|
| FIX-001 | GAP-003 | APPLIED | re-ran *draft, path resolves ✅ |

## 8. Readiness

- Final score: X.X/10 ({TIER})
- CRITICAL gaps remaining: 0
- Verdict: {CERTIFIED | MINIMUM CERTIFIED | NOT CERTIFIED}
- Sign-off: @pm ________  @qa ________
- Snapshot version: {date / hash}
```

---

## 4. Scoring Formula

The determinism score is the **unweighted mean of four equally-weighted
sub-scores**, each expressed as a percentage (0–100%) and contributing 25%:

```
determinism = (connectivity + execution_clarity + gap_resolution + coherence) / 4
```

The four sub-scores map directly to the audit sections:

| Sub-score | Derived from | What 100% looks like |
|-----------|--------------|----------------------|
| **Connectivity** | Section 1 | Every referenced file exists at the correct path. |
| **Execution Clarity** | Section 2 | ≥ 10 flows documented, each with input→output→checkpoint, no ambiguous steps. |
| **Gap Resolution** | Sections 3 + 7 | All CRITICAL gaps fixed and verified. |
| **Coherence** | Sections 4 + 5 | No contradictions, no inventions. |

The percentage is scaled to a 0–10 score (e.g. mean of 85% → 8.5/10).

**Worked example:** Connectivity 100%, Execution Clarity 80%, Gap Resolution
100%, Coherence 90% → mean = 92.5% → **9.25/10** → production-ready.

---

## 5. Determinism Score Guidelines (0–10 Scale)

Use these tiers to interpret a score. Each tier has a concrete description and a
representative example so two auditors land on the same number.

| Score | Tier | Meaning | Example |
|-------|------|---------|---------|
| **9.0 – 10.0** | Exemplary | All references resolve, all flows crisp, zero gaps, zero contradictions. Behaves identically every run. | @sm with 100% connectivity, 12 documented flows, 0 open gaps. |
| **8.5 – 8.9** | Production-ready (target) | All CRITICAL/HIGH gaps fixed; at most minor MEDIUM/LOW notes; flows clear. | One stale MEDIUM memory reference noted but non-blocking. |
| **8.0 – 8.4** | Minimum-ready | Core flows work and CRITICAL gaps fixed, but ≥ 1 HIGH gap deferred or some flows under-documented. | 9 of 10 flows traced; one HIGH ambiguity in handoff logged as debt. |
| **6.0 – 7.9** | Not certified | A core flow is ambiguous or a referenced file is broken; behavior partly unpredictable. | A required task path is wrong; `*draft` may load the wrong template. |
| **0.0 – 5.9** | Failing | Multiple CRITICAL gaps; core commands cannot run deterministically. | Persona references 3 missing files; primary command undefined. |

**Certification thresholds (per EPIC-11):**

- **≥ 8.5/10** — CERTIFIED (production-ready). Target for the pilot (11.2) and the norm.
- **8.0 – 8.4/10** — MINIMUM CERTIFIED. Acceptable with documented, non-CRITICAL debt.
- **< 8.0/10** — NOT CERTIFIED. Return for further fixes before sign-off.
- **Hard rule:** any remaining CRITICAL gap caps the verdict at NOT CERTIFIED,
  regardless of the numeric score.

---

## 6. Example Report (Reference: @sm / River)

The following is an **illustrative, abbreviated** example showing what a *good*
audit looks like when the framework is applied. It is a worked sample for
guidance — the real, full @sm audit is delivered in Story 11.2. @sm (River) is
used because it is the simplest agent: no git push, no validation authority, no
implementation.

```markdown
# Agent Audit — River (@sm)

**Story:** 11.2 (illustrative excerpt)
**Auditor:** @config-engineer (Sigil)
**Date:** 2026-06-14
**Snapshot version:** sm/SKILL.md @ 2026-06-14
**Final determinism score:** 9.0/10 — Exemplary
**Certification:** CERTIFIED

## 1. Connectivity
| Reference | Path | Exists? | Layer |
|-----------|------|---------|-------|
| Persona SKILL | .claude/skills/AIOX/agents/sm/SKILL.md | ✅ | L4 |
| Backup definition | .aiox-core/development/agents/sm.md | ✅ | L2 |
| Primary task | .aiox-core/development/tasks/create-next-story.md | ✅ | L2 |
| Story template | .aiox-core/development/templates/story-tmpl.md | ✅ | L2 |
Summary: 4/4 references resolve. No broken refs.

## 2. Execution Trace (excerpt — full report documents ≥ 10)
### Flow 1: *help
- Input: user types *help
- Steps: 1) load command list from persona 2) filter by visibility 3) render
- Output: numbered command menu
- Checkpoint: menu shows only commands with 'key' visibility
- Handoff: none
### Flow 2: *draft
- Input: *draft (epic context present)
- Steps: 1) read epic 2) load create-next-story.md 3) render story-tmpl
         4) write docs/stories/{n}.story.md (status Draft)
- Output: new story file in Draft
- Checkpoint: story has AC + ≥ 1 task
- Handoff: @po *validate-story-draft (via handoff artifact)

## 3. Gaps
| Gap ID | Severity | Description | Impact |
|--------|----------|-------------|--------|
| GAP-001 | LOW | Greeting references optional script not always present | Cosmetic fallback only |

## 4. Invention Detection
| Observed behavior | Defined? | Verdict |
|-------------------|----------|---------|
| Local branch create | yes | OK |
| git push | n/a — never observed | OK (correctly blocked) |

## 5. Coherence
| Spec A | Spec B | Contradiction? | Resolution |
|--------|--------|----------------|------------|
| SKILL.md authority | agent-authority.md | no | aligned |

## 6. Determinism Score
| Sub-score | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| Connectivity | 25% | 100% | 4/4 refs resolve |
| Execution Clarity | 25% | 90% | 11 flows, all input→output→checkpoint |
| Gap Resolution | 25% | 100% | only 1 LOW gap, no CRITICAL |
| Coherence | 25% | 80% | minor wording divergence SKILL vs backup |
**Determinism = (100 + 90 + 100 + 80) / 4 = 92.5% → 9.0/10**
**Tier:** Exemplary

## 7. Fixes
| Fix ID | Resolves | Status | Verification |
|--------|----------|--------|--------------|
| FIX-001 | GAP-001 | DEFERRED | LOW severity, logged as debt |

## 8. Readiness
- Final score: 9.0/10 (Exemplary)
- CRITICAL gaps remaining: 0
- Verdict: CERTIFIED
- Sign-off: @pm ____  @qa ____
- Snapshot version: 2026-06-14
```

---

## 7. How to Run an Agent Audit (Quick Start)

1. **Freeze** the agent definition (record the snapshot version).
2. **Copy** the template from Section 3 into `docs/agents-ready/11.X-{agent}-audit-FINAL.md`.
3. **Walk Sections 1–6** in order, gathering evidence with `Read`/`Glob`/`Grep`.
4. **Score** using Sections 4 and 5.
5. **Fix** CRITICAL gaps (Section 7) and verify each fix.
6. **Certify** (Section 8) and route for @pm + @qa sign-off.
7. **Feed** the score into the readiness matrix (Story 11.9).

---

## 8. References

- `docs/prd/EPIC-11-AGENT-INFRASTRUCTURE-READINESS.md` — Epic PRD
- `docs/stories/epics/EPIC-11-REQUIREMENTS.md` — Epic requirements
- `docs/stories/11.2.story.md` — pilot audit (first consumer; scoring breakdown aligned here)
- `.claude/rules/agent-authority.md` — delegation matrix (Section 4 invention checks)
- `.claude/rules/story-lifecycle.md` — status transitions (Section 5 coherence checks)
- `.aiox-core/constitution.md` — Article IV (No Invention)

---

*Framework defined under Story 11.1 (EPIC-11) | 2026-06-14*
