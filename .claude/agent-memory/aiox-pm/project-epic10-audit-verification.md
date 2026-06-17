---
name: epic10-audit-verification
description: Direct-inspection verification of the Cont37 Framework Audit's 12 findings before grounding EPIC-10. Several audit claims were FALSE or mis-scoped.
metadata:
  type: project
---

# EPIC-10 Audit Verification (Cont 37 audit re-checked 2026-06-13)

EPIC-10 (Framework Foundation Cleanup) is grounded on the Cont37 audit
(`docs/qa/COMPREHENSIVE-FRAMEWORK-AUDIT-FINAL-CONT37.md`, score 35/100). Before
writing requirements I verified every claim by filesystem inspection (Art. IV).
Result: the audit over-stated severity. Corrected ground truth:

**Orphan folders (audit said 6 undocumented):**
- `.kairos-data/` — 1,880 files (NOT 3,054). GITIGNORED (0 tracked). Contains
  Kairos Check **product runtime data** (api_keys.json, leads_*, market_intel.jsonl,
  tenants.json, backups). Not framework, not orphan code — it is product L4 data.
- `.codex/` (28 files, git-tracked) and `.antigravity/` (16 files, git-tracked) are
  **ideSync targets** explicitly configured in `core-config.yaml` → `ideSync.targets`
  (`.codex/agents`, `.antigravity/rules/agents`). NOT mysterious orphans — generated
  mirrors of `.aiox-core/development/agents` (the single source).
- `governance/` (9 files, git-tracked) has its own README.md + evolution-pipeline.md.
  Documented internally, just not cross-linked from PROJECT/CLAUDE/STATE.
- Real gap = **documentation/layer-assignment**, NOT existence-mystery.

**Agent duplication (audit said 30 divergent duplicates):**
- Single source of truth EXISTS: `core-config.yaml` → `ideSync.source: .aiox-core/development/agents`.
- The many `agents/` dirs (`.claude/commands/*`, `.claude/skills/*`, `.codex`, `.antigravity`,
  `.github`) are **sync targets by design**. Real risk = drift detection / divergence,
  not "no canonical source". `ideSync.validation.failOnDrift: true` already set.

**Task schema (audit said 8 variants, circular refs, task_id 100%):**
- VERIFIED real: version field deviations — 6 files `version: 2`, 1 `Version: 1` (capitalized,
  squad-creator-publish.md:63), 1 `version: "1...` (quoted, story-checkpoint.md:14).
- VERIFIED real: `status:` only in 7 tasks, `superseded_by:` in 0 — no lifecycle tracking.
- FALSE: "task_id 218/218 (100%)" — only 5 have `task_id`; 163 use `task:` V1 header.
- FALSE: "3 circular task references" — qa-gate.md Prerequisites do NOT reference
  validate-next-story; zero literal next:/prerequisite: loops in the 4 story-cycle tasks.
  The only cross-ref is an advisory suggestion in create-next-story.md:782 (correct, not circular).

**Why:** The audit conflated "exists but not cross-documented" with "orphan/broken", and
asserted circular refs that aren't in the files. EPIC-10 must fix the REAL gaps (docs,
layer assignment, schema normalization, drift detection) and explicitly DEBUNK the false ones.
**How to apply:** When EPIC-10 stories are drafted by @sm, scope 10.3 to schema-version
normalization + lifecycle fields ONLY; drop the circular-ref fix (no defect to fix — verify-only AC).
See [[no-invention-verify-gaps]].
