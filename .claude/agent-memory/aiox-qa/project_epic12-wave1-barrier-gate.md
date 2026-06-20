---
name: epic12-wave1-barrier-gate
description: EPIC-12 Wave 1 (Framework Boundary + Agent Authority) cleared — 12.1 PASS + 12.2 PASS = Barrier Gate 1 met, Wave 2 may start (QA 2026-06-20).
metadata:
  type: project
---

EPIC-12 Wave 1 = Stories 12.1 (Framework Boundary Enforcement, Art. VI-VII) + 12.2 (Agent Authority Validation, Art. II / FR-2.1–2.4). Both QA PASS on 2026-06-20. **Barrier Gate 1 exit criteria met → Wave 2 may start.**

Story 12.2 verification highlights (Art. II gate hardening):
- `gate-logger.cjs` now exposes `resolveActiveAgent(command, cwd)` → `{ agent, source }` with 4-path detection (env → inline → session → default-DENY); `getActiveAgent` kept as retro-compat string wrapper. 199/199 hook tests (19 new + 21 EPIC-9 regression + 23 enforcement gates).
- `detectionSource` is an ADDITIVE JSONL field. Verified in the LIVE runtime log `art-ii-agent-authority-2026-06-20.jsonl`: pre-12.2 lines lack it, post-12.2 lines carry it → existing parsers unaffected. This is the strongest no-regression evidence — real runtime, not just tests.
- `@devops` entity in `.aiox-core/data/entity-registry.yaml` (line ~14729) carries `exclusiveOperations: [git push, git push --force, gh pr create, gh pr merge]` matching the gate's REMOTE_OPERATION_PATTERNS.
- default-DENY is fail-safe: empty agent → `isDevOpsAgent('')` = false → cannot pass Art. II.

**Why:** Wave-gated EPIC-12 — Phase 2+ stories were blocked until Wave 1 QA cleared.
**How to apply:** When QA-ing later EPIC-12 stories, treat 12.1/12.2 as the validated baseline for boundary + authority gates. For Art. II stories, the `git push` literal string in a Bash heredoc WILL trip the live gate (resolves agent as @unknown) — write story files via Edit/Write tool, not Bash heredocs. Related: [[framework-boundary-toggle-noop]].
