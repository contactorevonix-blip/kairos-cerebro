---
name: ids-ops2-l1-review
description: IDS-OPS.2 L1 amendment review — re-validated (Cont 76): content-anchored diff is unique & correct (supersedes wrong line-numbers); 3 ressalvas (existing mojibake, MultiEdit gap, overhead OK). @aiox-master executes, not @architect.
metadata:
  type: project
---

# IDS-OPS.2 L1 Amendment Review (2026-06-24, Cont 76)

Reviewed a `*propose-modification` request to register `ids-integration-sm-draft.cjs`
in `.claude/settings.json` (PreToolUse, Write + Edit matchers). Verdict: **AJUSTAR**
(fix line positions) before forwarding to @aiox-master.

**Why:** Same precedent as [[xx1-l1-authorization-review]] — L1 settings.json writes
are @aiox-master (Orion) exclusive (Art. VI-VII). @architect validates technically and
gives a recommendation; @architect does NOT execute the amendment.

**How to apply:** When asked to register a hook / edit settings.json, validate against
the real file state, then route to @aiox-master with a corrected diff. Never write
settings.json directly.

## Findings

1. **Wrong line positions (CRITICAL).** Proposal said "after enforce-ids.cjs line ~151"
   (Write) and "~180" (Edit). In the real file:
   - Write matcher's enforce-ids.cjs hook = lines 146-151; line 151 is the closing `}`
     of that hook, line 152 is the `]` closing the Write hooks array.
   - Edit matcher opens line 155; its enforce-ids.cjs = lines 175-180.
   Correct diff: change line 151 `}` → `},` and insert the new hook before line 152's `]`;
   same for line 180 → `},` + insert before line 181's `]`.

2. **5th-hook overhead (PERFORMANCE, advisory).** Claude Code matcher is bare `Write`/`Edit`
   (no path filter). Hook filters internally via `isStoryWrite()`. This becomes the 5th hook
   in each chain (no-invention → spec-reference → quality-gates → enforce-ids → ids-integration).
   BUT verified: `main()` returns at line 269 (after isStoryWrite check) BEFORE any spawn.
   The Decision Engine spawnSync only runs inside `evaluate()`→`runDecisionEngine()` for actual
   `.story.md` writes. So non-story writes pay only Node startup + stdin parse, not the engine. Acceptable.

3. **No security risk.** `intent` passed as argv array (line 113), not shell-interpolated → no injection.
   Circuit breaker (2s, lines 39/228-236) ensures IDS failure never blocks dev.

4. **QA gate is CONCERNS, not PASS.** REL-001 = registration pending (this amendment resolves it).
   MNT-001 = 7 ESLint warnings (cosmetic: unused `fs` line 30, escape `\-` line 63, 5 quote strings).
   `eslint --fix` would clear them → PASS. Non-blocking for the amendment.

## Re-validation (2nd delegation, content-anchored diff)

5. **Content-anchored diff supersedes line-numbers — and IS unique.** New delegation switched
   from line positions to old_string/new_string anchored on the trailing `"matcher"`. Verified
   against real file:
   - Edit 1 anchor = enforce-ids block + `"matcher": "Write"` ... `"matcher": "Edit"` → unique (lines 146-155).
   - Edit 2 anchor = enforce-ids block + `"matcher": "MultiEdit"` → unique (lines 175-184).
   Both resolve correctly. Safer than the line-numbers. APPROVED technically.

6. **CRITICAL: existing mojibake in file.** Lines 190/196/213/219 already have corrupted
   em-dashes (`ÃƒÂ¢...`) in MultiEdit/NotebookEdit statusMessages — NOT caused by this diff.
   @aiox-master MUST use the Edit tool (never PowerShell Set-Content) or risk propagating/worsening it.
   New statusMessage uses ASCII hyphen → no new mojibake risk.

7. **MultiEdit gap (advisory, non-blocking).** Diff covers Write + Edit matchers only. A story
   can be written via MultiEdit too, but `*draft` creates from scratch (Write), so AC1
   ("always calls") is satisfied. MultiEdit coverage = optional follow-up, not a release prereq.

**Recommendation: Option 1** — @aiox-master applies the 2 edits via Edit tool, verifies
JSON.parse, REL-001 resolves. MultiEdit registrable as follow-up without blocking.

## Key file locations
- Hook: `.claude/hooks/ids-integration-sm-draft.cjs` (L4, 328 lines, 93.27% coverage, 24/24 tests)
- Target: `.claude/settings.json` (L1, deny-rule protected at lines 509-511)
- QA gate: `docs/qa/gates/IDS-OPS.2-sm-ids-integration.yml` (CONCERNS, reviewer Quinn)
