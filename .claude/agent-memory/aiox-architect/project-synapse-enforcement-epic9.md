---
name: project-synapse-enforcement-epic9
description: SYNAPSE enforcement coherence decision (Cont 36) — Option A under new EPIC-9, with 3 ground-truth corrections the Cont 35 audit missed
metadata:
  type: project
---

# SYNAPSE Enforcement Sync — Architecture Decision (Session Cont 36, 2026-06-13)

**Decision:** Option A (Quick Win) over Option B (Full Sync), executed under a NEW **EPIC-9 (SYNAPSE Enforcement Sync)** — not shoehorned into fragmented EPIC-1.

**Why:** Only 2 gaps defeat a quality gate today — story-status transitions (Art. III) and agent-exclusive commands (Art. II). Both are 2sp hooks reusing existing `lib/gate-logger.cjs`. Option B's extra 4 stories are MEDIUM/LOW severity and the workflow-state-machine piece genuinely needs Spec Pipeline on its own, later.

**How to apply:** When this work resumes, run Standard SDC (not Enterprise/Spec Pipeline). Story order: 9.0 (retire dead validator, 0.5sp) → 9.1 ∥ 9.2 (parallel, 2sp each). New hooks register in settings.json: 9.1 under Edit/Write/MultiEdit on docs/stories/**; 9.2 under UserPromptSubmit/Skill.

## Three ground-truth corrections (Cont 35 audit docs were wrong)
1. **pre-tool-use-validator.cjs is DEAD CODE.** Exports `module.exports = async (context) =>` — wrong signature for a CLI-spawned hook (those read stdin + exit code 2 + stderr, like every enforce-*.cjs). It silently no-ops despite being registered with a universal matcher. Its claimed coverage (git-push, L1/L2, @sm-story-creation) is fictional. Retire it in 9.0.
2. **Story-ID collision.** Handoff proposed 1.17/1.18 but 1.18 + 1.19 already exist and EPIC-1 has duplicate 1.14/1.15 files. Must use EPIC-9.
3. **The two audit docs contradict on scope.** AUDIT.md: 1.17=story-lifecycle, 1.18=agent-commands. EXPANSION-PLAN.md: 1.17=skills, 1.18=activation, 1.19=imports. Resolve canonically: Phase 1 = story-lifecycle + agent-commands (CRITICAL); skills/activation/imports → Phase 2 (HIGH/MEDIUM). Mark EXPANSION-PLAN superseded.

## Real coverage was ~22%, not the 60-65% the expansion-plan summary claimed (inflated by counting dead/partial hooks as full).

## Phase 2 (deferred): workflow-state-machine (needs Spec Pipeline — COMPLEX), IDS runtime G4/G5, Art. I CLI-First WARN gate, MCP-governance hook.

## Security note: agent-resolution chain (env → inline → hook-metrics session.active_agent) is spoofable — fine for a convenience gate, document as advisory-not-airtight. Hard backstop stays settings.json deny rules.

Related: [[project-story52-governance-prevention]] (prior governance-prevention work)
