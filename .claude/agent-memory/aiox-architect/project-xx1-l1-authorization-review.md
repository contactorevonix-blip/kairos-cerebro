---
name: xx1-l1-authorization-review
description: Architect NO-GO on XX.1 L1 write proposal (3 files) — duplicates Story 13.1 + ide-sync; reduce scope to 1-2 writes, route via @aiox-master
metadata:
  type: project
---

@architect (Aria) reviewed a proposal to authorize L1 writes for Story XX.1 "Agent Sync Validator" (3 files: `.aiox-core/core/validators/agent-sync-validator.cjs`, `.aiox-core/core/scripts/sync-agents.js`, `.claude/hooks/enforce-agent-sync.cjs`). Verdict: **NO-GO as proposed** (2026-06-21, Cont 68/69).

**Why (3 material defects found by auditing real code):**
1. **IDS duplication (Art. IV-A):** The validator + gate are ALREADY designed & ready-to-apply inside Story 13.1 (`docs/stories/decision-log-13.1.md`, Subtask 6 = `.claude/hooks/validate-agent-sync.cjs`, 90 lines). The CLI already exists: `.aiox-core/infrastructure/scripts/ide-sync/index.js` (story 6.19) has `sync` + `validate --strict`. XX.1 would build a 3rd parallel sync pipeline. XX.1 == 13.1 under different epic IDs (EPIC-XX vs EPIC-13).
2. **Wrong locations:** gates live in `.claude/hooks/` (not `.aiox-core/core/`); sync CLI lives in `.aiox-core/infrastructure/scripts/ide-sync/`. `.aiox-core/core/validators/` and `.aiox-core/core/scripts/` do NOT exist — proposal invents a new L1 tree.
3. **EPIC-8 precedent misapplied:** EPIC-8 L1 writes were unavoidable; here there ARE writable homes (the hook + ide-sync). Precedent justifies 1 write (the hook), not 3.

**How to apply:** Reduced legitimate scope = 1-2 deny-protected writes only: (1) `.claude/hooks/validate-agent-sync.cjs` [content ready in 13.1], (2) its `.claude/settings.json` PreToolUse `Bash(git commit*)` registration, (opt 3) `.aiox-core/core/README.md` source-of-truth section [content ready in 13.1 Subtask 7]. The two `.aiox-core/core/` .cjs files should be CUT (reuse ide-sync + 13.1 hook). Architect does NOT emit override tokens / edit settings.json — that is @aiox-master exclusive (Art. II). My output is the parecer; @aiox-master decides. Recommended path: Opt A = CONDITIONAL GO reduced-scope, but first @po/@pm must consolidate XX.1 ↔ 13.1 (same work). See [[control-plane-design]] family for prior L1-boundary patterns; mirrors aiox-dev memory [[epicxx-story-xx1-l1-blocker]].
