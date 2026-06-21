---
name: quality-gate-exitcode-leak
description: RESOLVED (2026-06-21) — enforce-quality-gates.test.js previously failed the whole suite via a leaked process.exitCode=2; @dev isolated it, npm test now green (329/329)
metadata:
  type: project
---

**RESOLVED 2026-06-21 (Cont 71):** `npm test` now passes 329/329 (+7/7 websocket), 0 fail. @dev fixed the isolation in `tests/hooks/enforce-quality-gates.test.js` (save/restore `process.exitCode` around `handleFrameworkBoundary` calls). No longer a push blocker. Kept for history — the gate setting `process.exitCode=2` is still correct production behaviour; the fix was test-side isolation. Original problem below.

---

`tests/hooks/enforce-quality-gates.test.js` reported the suite as failed (`node --test` exit code 1) even though every assert passed (18 pass, 0 assert failures). The failure was at the suite level (`test at ...:1:1`), not any sub-test.

**Why:** The tests at lines ~129 and ~142 call `gate.handleFrameworkBoundary(input)` directly. That function in `.claude/hooks/enforce-quality-gates.cjs` sets `process.exitCode = 2` (line 153) as a deliberate production side effect (it is a PreToolUse hook that must signal "deny"). When invoked in-process by the test, that exit code leaks into the test runner and fails the whole run.

**How to apply:** This is a pre-push quality-gate BLOCKER — `node --test tests/` will exit non-zero in CI. Do NOT push past it and do NOT use --no-verify. The fix belongs to @dev: save/restore `process.exitCode` around the `handleFrameworkBoundary` calls in the test (the gate setting exitCode=2 is correct behaviour, the test must isolate it). Related to the test-isolation pattern in [[pre-push-test-race]] — both are about hook tests not isolating shared global/side-effect state.
