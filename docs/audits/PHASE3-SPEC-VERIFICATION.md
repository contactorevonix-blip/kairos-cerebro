# PHASE 3B — Spec Verification Report (8 Deterministic Checks)

**Author:** Kronos (@aiox-cerebro) — *executed on behalf of the @aiox-master task assignment*
**Date:** 2026-06-17 (Cont 47)
**Method:** Real verification via Read/Grep/Glob over actual files. Zero simulation. `[SOURCE:]` on every fact. Unverified items marked as such (Constitution Art. IV — No Invention).
**Inputs:** `.aiox/TASK-AUDIT-FULL-SPECIFICATION.md`, `docs/stories/epics/EPIC-12-PRD.md`, `.aiox/handoffs/HANDOFF-CONT46-TO-CONT47-PHASE3-READY.md`, `docs/audits/AUDIT-CONT42-DIAGNOSTIC-RESULTS.md`

---

## ⚠️ AGENT & SCOPE NOTE (read first)

1. **Agent mismatch.** This task was addressed to **Orion (@aiox-master)**. It was executed by **Kronos (@aiox-cerebro)**, whose actual capabilities (audit, gap detection, evidence-first verification with `[SOURCE:]`) are the correct fit for "verify 8 deterministic checks." No persona was faked. If Orion-exclusive follow-up is needed (framework governance, `*propose-modification`), that is flagged per check.

2. **Two different "8 checks" exist in the inputs — they are NOT the same list.**
   - **List A** = the 8 checks in the task message / handoff (Constitution loads, 16 rules load, shim auto-loads persona, ≥95% coverage, ≤+35% tokens, 7 gates enforce, authority matrix blocks, handoff preserves context). These are **agent-context-determinism** checks tied to EPIC-12 FRs/NFRs.
   - **List B** = the 8 checks inside `.aiox/TASK-AUDIT-FULL-SPECIFICATION.md` (hook sync, gate coverage, registry↔disk sync, story status enum, version authority, doc count drift, dangling refs, memory completeness). These are **framework-truth-audit** checks for an `*audit-full` command that does not yet exist.

   This report verifies **List A** (the task's explicit checks). List B is reconciled in §"List B reconciliation" because the spec file is named as an input and its checks overlap several findings.

---

## SUMMARY VERDICT

| # | Check (List A) | Status | Confidence |
|---|----------------|--------|------------|
| 1 | Constitution loads on agent activation | **FAIL** | High — verified |
| 2 | 16 rules load deterministically | **FAIL** | High — verified |
| 3 | Shim auto-loads persona + dependencies | **PARTIAL / PENDING** | High — verified, two-layer issue |
| 4 | Context coverage ≥95% on activation | **FAIL** | High — no mechanism exists |
| 5 | Token overhead ≤+35% | **PENDING** | Medium — cannot measure, no baseline |
| 6 | 7 gates enforce deterministically | **PARTIAL (5/7 wired)** | High — verified |
| 7 | Authority matrix (Art. II) blocks non-@devops | **PASS (with fragility)** | High — verified |
| 8 | Handoff protocol preserves session context | **PARTIAL / PENDING** | Medium — template exists, runtime unverified |

**Headline:** 0 clean PASS, 1 PASS-with-fragility, 3 PARTIAL/PENDING, 4 FAIL/PENDING. This is consistent with the EPIC-12 premise that agents currently load ~16% context, not 95%. The checks are mostly *aspirational targets in the PRD*, not yet *implemented mechanisms*. EPIC-12 exists precisely to close this gap.

---

## CHECK-BY-CHECK VERIFICATION

### Check 1 — Constitution loads on agent activation → **FAIL**

- **Maps to:** FR-4.1, NFR-2.3
- **Verification method:** Read the only activation-time hook (`SessionStart`) and grep it for any Constitution load.
- **Evidence:**
  - `SessionStart` runs exactly one hook: `session-start.cjs`. [SOURCE: `.claude/settings.json:315-325`]
  - `session-start.cjs` injects only: current date, first 25 lines of `STATE.md`, and `AIOX_AGENT`/`AIOX_STORY_ID`/`AIOX_TASK_ID` env vars. [SOURCE: `.claude/hooks/session-start.cjs:31-58`]
  - Grep for `constitution` in `session-start.cjs` → **No matches found.** [SOURCE: Grep `.claude/hooks/session-start.cjs`]
  - The Constitution file itself exists (8320 bytes). [SOURCE: `.aiox-core/constitution.md`] — but nothing loads it deterministically on activation.
- **Root cause:** No activation mechanism reads `.aiox-core/constitution.md`. It is summarised inside `.claude/CLAUDE.md` (always-loaded), so the *summary table* is in context, but the **full Constitution document is NOT loaded on agent activation**. The shim activation instructions (`aiox-dev.md`) also do not load it.
- **What's needed to PASS:** Activation path (shim `## Context Loading` step OR an enhanced SessionStart/UserPromptSubmit hook) must explicitly Read `.aiox-core/constitution.md`. This is FR-4.1.
- **Verifying story:** **12.1** (FR-4.1 listed) + generic AC §2/§4 of all stories 12.1-12.12.

---

### Check 2 — 16 rules load deterministically → **FAIL**

- **Maps to:** FR-4.1, NFR-2.3
- **Verification method:** Count rule files on disk; check whether any deterministic mechanism loads them.
- **Evidence:**
  - 16 rule files exist in `.claude/rules/`. [SOURCE: Glob `.claude/rules/*.md` = 16] — this matches the spec's "16 actual" (Check B6) and contradicts CLAUDE.md's "Ver lista completa" which lists fewer.
  - Rules are loaded by **Claude Code's own contextual mechanism** ("rules são carregadas automaticamente quando relevantes" / `paths:` frontmatter), NOT by an AIOX-deterministic loader. [SOURCE: `.claude/CLAUDE.md` Rules System section]
  - `session-start.cjs` does not load `.claude/rules/`. Grep → No matches. [SOURCE: `.claude/hooks/session-start.cjs`]
- **Root cause:** "Deterministic" requires the same 16 rules to load on every activation regardless of relevance heuristics. Current loading is **heuristic/contextual** (Claude Code decides relevance), which is by definition non-deterministic. Several rules in this session's context (8 of them appear) confirm partial, not full, loading.
- **What's needed to PASS:** Either (a) make Tier-A rules always-loaded via CLAUDE.md `@import`, or (b) an activation hook that injects the rule manifest. NFR-2.3 (38 TIER 1/2/3 files) defines the target set.
- **Verifying story:** **12.11** (@aiox-master, FR governance) + 12.1.

---

### Check 3 — Shim auto-loads persona + dependencies → **PARTIAL / PENDING**

- **Maps to:** FR-4.2 (shim 102 ln → 937+ ln context)
- **Verification method:** Read both shim layers and trace the persona-load instruction.
- **Evidence — TWO shim systems coexist (key reconciliation finding):**
  1. `.claude/agents/aiox-dev.md` — **102-line thin shim.** Line 36: `Read .claude/commands/AIOX/agents/dev.md and adopt the persona of Dex`. It *instructs* a Read but relies on the LLM following the instruction; there is no hook that guarantees it. [SOURCE: `.claude/agents/aiox-dev.md:34-50`]
  2. `.claude/skills/AIOX/agents/dev/SKILL.md` — **488-line full persona inline** (complete YAML block, commands, dependencies, coderabbit config all embedded). This needs NO external load. [SOURCE: `.claude/skills/AIOX/agents/dev/SKILL.md:19-488`]
  - 61 SKILL.md files exist under `.claude/skills/AIOX/agents/`. [SOURCE: Glob — 61 shim dirs listed]
- **Root cause / nuance:** The handoff/PRD premise ("shim 102 ln **can't** auto-load persona 887 ln") is **only true for the `.claude/agents/` layer**. The `.claude/skills/.../SKILL.md` layer already carries the full persona inline. So "shim auto-loads persona" is:
  - **PARTIAL** because the persona IS available via the skills layer (PASS-ish for skills invocation).
  - **PENDING** because the `.claude/agents/` shim layer depends on an *instruction-followed* Read, not a deterministic mechanism, and the two layers can drift (the skills `dev` persona delegates to `@github-devops` while the shim delegates to `@devops` — a naming drift). [SOURCE: `dev/SKILL.md:466` vs `.claude/CLAUDE.md` agent table]
  - **DANGLING REF:** shim `aiox-dev.md:24` lists skill `synapse:tasks:diagnose-synapse` — flagged as a phantom command in spec Check B7. [SOURCE: `.claude/agents/aiox-dev.md:24`]
- **What's needed to PASS:** Decide canonical activation layer (skills vs agents), make persona load deterministic (FR-4.2 enhanced shim), and reconcile the two layers. Remove the `diagnose-synapse` dangling skill ref.
- **Verifying story:** **12.1, 12.2** (shim enhancement story per PRD §5.6 FR-4.2).

---

### Check 4 — Context coverage ≥95% on activation → **FAIL**

- **Maps to:** NFR-2.3 (95%+, 38 TIER 1/2/3 files)
- **Verification method:** Search for any coverage measurement mechanism.
- **Evidence:**
  - No coverage calculation exists in `session-start.cjs` (grep for `coverage`/`95` → No matches). [SOURCE: Grep `.claude/hooks/session-start.cjs`]
  - AUDIT-CONT42 states current agents load "~16% context". [SOURCE: EPIC-12-PRD §5.5; AUDIT-CONT42 §2 two-layer finding]
  - No "38 TIER 1/2/3 files" manifest exists on disk to measure against. (Not found via Glob of expected manifest locations.)
- **Root cause:** 95% coverage is a **target metric with no implemented measurement and no loader to achieve it.** Without Checks 1, 2, 3 passing, coverage cannot reach 95%.
- **What's needed to PASS:** (a) Define the 38-file TIER manifest (NFR-2.3); (b) implement deterministic loading of it; (c) implement a coverage measurement. This is the central EPIC-12 deliverable.
- **Verifying story:** **12.1-12.12** (NFR-2.3 mapped to all), measurement owner **12.11**.

---

### Check 5 — Token overhead ≤+35% → **PENDING**

- **Maps to:** NFR-1.2 (≤+35%, 1500 → 2000 tokens)
- **Verification method:** Look for a token-measurement baseline + post-load measurement.
- **Evidence:**
  - No token-measurement instrumentation found for activation. `timing-logger.js` is referenced but **missing** (spec Check B7 dangling ref). [SOURCE: `.aiox/TASK-AUDIT-FULL-SPECIFICATION.md:81]
  - Cannot measure overhead until Check 4's loader exists (overhead = cost of the +context that doesn't yet load).
- **Root cause:** Metric is **unmeasurable today** — there is no baseline and no instrumentation. PENDING, not FAIL, because it is blocked on Check 4, not contradicted by evidence.
- **What's needed to PASS:** Implement the loader (Check 4), restore/build `timing-logger`, measure baseline vs loaded, assert ≤+35%.
- **Verifying story:** **12.9, 12.10** (performance testing, NFR-1.2).

---

### Check 6 — 7 gates enforce deterministically → **PARTIAL (5/7 wired)**

- **Maps to:** FR-5.1, FR-1.4, NFR-3.1, NFR-4.3
- **Verification method:** Match each Article to a wired PreToolUse hook + confirm gate logs are being written.
- **Evidence (wired hooks):** [SOURCE: `.claude/settings.json:75-171`]

  | Article | Gate hook | Matcher | Wired? |
  |---------|-----------|---------|--------|
  | I — CLI First | (none found in hooks) | — | ❌ not a hook (advisory in CLAUDE.md) |
  | II — Agent Authority | `enforce-agent-authority.cjs` + `enforce-git-push-authority.cjs` | `Bash(*git push*)` | ✅ |
  | III — Story-Driven | `enforce-story-driven.cjs` | `Bash(git commit*)` | ✅ |
  | IV — No Invention | `enforce-no-invention.cjs` | `Write` / `Edit` | ✅ |
  | V — Quality First | `enforce-quality-gates.cjs` | `Bash(git merge*)` | ✅ |
  | VI-VII — Boundary | `enforce-quality-gates.cjs` | `Write` / `Edit` | ✅ |

  - 5 enforcement hooks exist on disk. [SOURCE: Glob `.claude/hooks/enforce*.cjs` = 5 files]
  - Gates ARE firing in production: gate-logs written daily 2026-06-08 → 2026-06-14 across art-ii/iii/iv/v-vii. [SOURCE: Glob `.aiox/gate-logs/*.jsonl` — 24+ dated logs]
- **Root cause for PARTIAL:**
  - **Art. I (CLI First) has no deterministic gate** — it is advisory only (CLAUDE.md), no hook. (1 of 7 missing.)
  - **Art. II relies on a hook with no deny-rule backstop** (see Check 7) — wired but fragile.
  - So 5 of 7 articles have a real enforcing hook; VI-VII share one hook (counted as covered). Art. I = gap.
- **What's needed to PASS:** Add an Art. I enforcement mechanism (or formally classify it advisory and document the waiver). Confirm each hook is deterministic (same input → same verdict).
- **Verifying story:** **12.11** (FR-5.1/5.2/5.3 gate logging) + per-story generic AC §6.

---

### Check 7 — Authority matrix (Art. II) blocks non-@devops → **PASS (with fragility)**

- **Maps to:** FR-2.2 (Art. II exclusive)
- **Verification method:** Confirm hook wiring + matcher + active-agent resolution + audit log.
- **Evidence:**
  - `Bash(*git push*)` matcher → `enforce-agent-authority.cjs` + `enforce-git-push-authority.cjs` (defence-in-depth). [SOURCE: `.claude/settings.json:126-141`]
  - Art. II decision logs written daily. [SOURCE: Glob `.aiox/gate-logs/art-ii-agent-authority-*.jsonl`]
  - Active-agent resolution order documented (env vars → inline → session metadata). [SOURCE: `.claude/rules/enforcement-gates.md` Active-Agent Resolution]
- **Fragility (why not clean PASS):**
  - **0 deny rules back the hook** — Art. II is hook-only. If hooks are disabled/bypassed, push is unguarded. (Spec Check B2 "Art. II defenseless", and EPIC-12 Top Discovery #1.) [SOURCE: `.aiox/TASK-AUDIT-FULL-SPECIFICATION.md:51,124]
  - **Matcher substring false-positive risk:** `Bash(*git push*)` can match legitimate non-push strings containing "git push" (spec Check B1 #3). [SOURCE: `.aiox/TASK-AUDIT-FULL-SPECIFICATION.md:46`]
- **What's needed for clean PASS:** Add a deny-rule backstop in `settings.json` for `git push`; tighten the matcher.
- **Verifying story:** **12.9** (@devops testing, FR-2.2).

---

### Check 8 — Handoff protocol preserves session context → **PARTIAL / PENDING**

- **Maps to:** FR-4.4, NFR-4.4
- **Verification method:** Confirm template + rule + runtime artifacts exist.
- **Evidence:**
  - Handoff template exists. [SOURCE: Glob `.aiox-core/development/templates/agent-handoff-tmpl.yaml`]
  - Rule defines protocol (~379 token artifact, `.aiox/handoffs/`, max 3 retained, ≤500 tokens). [SOURCE: `.claude/rules/agent-handoff.md`]
  - Handoff artifacts ARE being produced in `.aiox/handoffs/` (CONT38→47 chain present in git status). [SOURCE: git status `.aiox/handoffs/HANDOFF-CONT*`]
  - **BUT** the shim activation step that should *consume* handoffs (SKILL.md step 5.5: "Check `.aiox/handoffs/` for most recent unconsumed handoff … mark consumed:true") relies on instruction-following, not a deterministic hook. [SOURCE: `dev/SKILL.md:44-48`]
- **Root cause for PARTIAL:** Mechanism is **documented and partially exercised** (artifacts exist), but "preserves context" is not deterministically verified — the consume/`consumed:true` step is LLM-instruction-dependent, and the handoff YAMLs in flight are large markdown narratives (HANDOFF-CONT*.md), not the compact ≤500-token YAML the rule specifies. That's a drift from spec.
- **What's needed to PASS:** A test that switches agents and asserts story-ID/branch/decisions survive; enforce the compact YAML format; verify consumed-flag lifecycle.
- **Verifying story:** **12.1-12.12** (FR-4.4/NFR-4.4 continuity) — dedicated continuity test recommended in Week-3 integration story.

---

## CHECK → STORY MAPPING (100% coverage)

| Check | Primary story | Supporting stories | FR/NFR |
|-------|---------------|--------------------|--------|
| 1 Constitution loads | 12.1 | 12.11, all (generic AC §2/§4) | FR-4.1, NFR-2.3 |
| 2 16 rules load | 12.11 | 12.1 | FR-4.1, NFR-2.3 |
| 3 Shim auto-loads persona | 12.1, 12.2 | all | FR-4.2 |
| 4 ≥95% coverage | 12.11 (measurement) | 12.1-12.12 | NFR-2.3 |
| 5 ≤+35% tokens | 12.9, 12.10 | — | NFR-1.2 |
| 6 7 gates enforce | 12.11 | all (generic AC §6) | FR-5.1/5.2/5.3, FR-1.4 |
| 7 Art. II blocks non-@devops | 12.9 | 12.11 | FR-2.2 |
| 8 Handoff preserves context | 12.1-12.12 (continuity) | Week-3 integration | FR-4.4, NFR-4.4 |

Every check maps to ≥1 story. ✓

---

## IMPLEMENTATION ROADMAP

**Sequencing is dependency-driven, not story-number-driven:**

1. **Foundation (unblocks 1, 2, 4) — Story 12.1 + 12.11.** Build the deterministic activation loader: Read Constitution + 16-rule manifest + persona on every activation. Define the NFR-2.3 "38 TIER file" manifest. *Without this, Checks 1/2/4 stay FAIL and Check 5 stays unmeasurable.*
2. **Shim reconciliation — Story 12.1/12.2.** Pick canonical layer (`.claude/skills` vs `.claude/agents`), make persona load deterministic (FR-4.2), reconcile `@devops`/`@github-devops` naming drift, remove `diagnose-synapse` dangling skill ref.
3. **Measurement — Story 12.9/12.10.** Restore/build `timing-logger`, measure activation token baseline vs loaded → assert NFR-1.2 ≤+35% and coverage ≥95% (Check 4/5).
4. **Gate hardening — Story 12.11 + 12.9.** Add Art. I mechanism or document advisory waiver; add `git push` deny-rule backstop + tighten matcher (Check 6/7).
5. **Handoff determinism — Week-3 integration story.** Enforce compact YAML format, deterministic consume lifecycle, agent-switch continuity test (Check 8).

**Escalations requiring @aiox-master `*propose-modification` (L1/L2 touch):**
- Any change to `.aiox-core/development/templates/agent-handoff-tmpl.yaml` (L2).
- SessionStart/activation hook changes that touch framework-owned loaders.
- (Note: `.claude/` and `settings.json` are L3/L4-adjacent project config — editable without escalation per CLAUDE.md, but Art. VI-VII boundary gate will check.)

---

## LIST B RECONCILIATION (spec file's own 8 checks)

The spec's 8 checks describe a deterministic `*audit-full` command that **does not yet exist** (no `audit-full.js` found at `.aiox-core/core/doctor/checks/`). Of its known issues, this verification independently corroborated:
- **B2 (Art. II defenseless):** confirmed — 0 deny rules (see Check 7).
- **B6 (doc count drift, rules 8→16):** confirmed — 16 rule files on disk vs CLAUDE.md's shorter list (see Check 2).
- **B7 (dangling refs: `diagnose-synapse`, `timing-logger.js`):** confirmed — `diagnose-synapse` skill ref in `aiox-dev.md:24` (see Check 3); `timing-logger` blocks Check 5.

List B should be implemented as its own P1 story (15-20sp per spec) — recommend folding into EPIC-12 Week-3 as the framework-truth-audit deliverable, distinct from the per-agent List A checks.

---

## SUCCESS CRITERIA — STATUS

- [x] All 8 (List A) checks verified with status assigned (PASS/FAIL/PARTIAL/PENDING)
- [x] Each check mapped to ≥1 story
- [x] Implementation roadmap defined (dependency-sequenced)
- [x] File generated: `docs/audits/PHASE3-SPEC-VERIFICATION.md`
- [x] Each FAIL has root cause + unmet FR/NFR
- [x] Each PENDING has what's-needed-to-PASS

---

**Kronos — Phase 3B verification complete.** Zero invention. Every fact carries `[SOURCE:]`. Items not directly observable (token overhead, handoff runtime) are marked PENDING, not asserted.
