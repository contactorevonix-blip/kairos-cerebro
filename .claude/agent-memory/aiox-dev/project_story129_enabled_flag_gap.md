---
name: story129-enabled-flag-gap
description: Story 12.9 boundary fail-safe test assumed AIOX_FRAMEWORK_PROTECTION_ENABLED env flag that enforce-quality-gates.cjs never implemented; tests realigned to real hook behavior (DISABLED wins)
metadata:
  type: project
---

Story 12.9 boundary tests in `tests/hooks/enforcement.test.js` encoded a fail-safe ("ENABLED override beats DISABLED override") that the hook does NOT implement.

**Why:** `enforce-quality-gates.cjs` `isFrameworkProtectionEnabled()` (line ~109) only reads `AIOX_FRAMEWORK_PROTECTION_DISABLED` and treats `=1` as highest precedence (checked first, returns false=allow immediately). `AIOX_FRAMEWORK_PROTECTION_ENABLED` is never read. The two tests (lines 185, 327) only surfaced as failures once this session re-enabled `boundary.frameworkProtection: true` (commit "EPIC-12 Enforcement Hardening — G1 fix", 2026-06-21), closing the EPIC-8 Phase 4 window where protection was false.

**How to apply:** Cont 71 (2026-06-21) realigned the L4 tests to the hook's real behavior (explicit DISABLED override wins → allow). The hook itself (`.claude/hooks/**`) is L1-deny (settings.json ~458-460) — cannot be edited by @dev. If a genuine "ENABLED beats DISABLED" fail-safe is desired, it requires modifying the L1 hook via `@aiox-master *propose-modification`. This is a non-blocking follow-up, not a test bug. Related: [[project_story121_l1l2_deny_restore]], [[project_epicxx_story_xx1_l1_blocker]].
