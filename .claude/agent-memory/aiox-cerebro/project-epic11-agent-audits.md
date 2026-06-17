---
name: epic11-agent-audits
description: EPIC-11 agent readiness audits — Story 11.2 @sm pilot done (8.75/10 CERTIFIED), 3 systemic patterns flagged for 11.3-11.12
metadata:
  type: project
---

# EPIC-11 — Agent Infrastructure Readiness Audits

**Framework:** `docs/AGENT-AUDIT-FRAMEWORK.md` (Story 11.1, DONE) — 8 sections, determinism = mean of 4×25% sub-scores (Connectivity / Execution Clarity / Gap Resolution / Coherence). Cert thresholds: ≥8.5 CERTIFIED, 8.0-8.4 MINIMUM, <8.0 NOT CERTIFIED; any open CRITICAL caps at NOT CERTIFIED.

**Story 11.2 (@sm / River) — PILOT DONE 2026-06-15.** Report: `docs/agents-ready/11.2-river-sm-audit-FINAL.md` (2910 words). Score **8.75/10 CERTIFIED**. 2 HIGH connectivity gaps found & fixed in-audit (FIX-001/002).

**Why:** 11.2 is the template for the other 10 audits (11.3-11.12). Pending @pm + @qa sign-off per AC.

**How to apply (3 systemic patterns for 11.3-11.12):**
1. **Path-resolution gap is systemic.** IDE-FILE-RESOLUTION maps `{type}/{name}` → `.aiox-core/development/{type}/`, but story-tmpl.yaml and story-draft-checklist.md actually live under `.aiox-core/product/`. `Glob` EVERY dependency path explicitly — do not trust default resolution. Likely affects other agents.
2. **`@github-devops` vs `@devops` alias is repo-wide** (6 SKILL files via Grep). Log as the SAME shared GAP in each audit; recommend ONE normalization story, not per-agent edits.
3. **Confirm canonical layer per agent before scoring.** For @sm the SKILL.md is the full canonical persona and `.claude/commands/AIOX/agents/sm.md` is a thin legacy shim — REVERSE of the dev/qa shim pattern from Cont 42. Don't assume which layer is authoritative.

**Fix discipline:** apply fixes only to L4 SKILL (`.claude/skills/...`), never to L2 backup (`.aiox-core/development/agents/...`) — route L2 changes via `@aiox-master *propose-modification`.

Related: [[infra-truth-audit]], [[system-factory-audit]]
