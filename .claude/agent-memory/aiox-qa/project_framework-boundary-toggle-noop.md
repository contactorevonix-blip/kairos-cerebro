---
name: framework-boundary-toggle-noop
description: enforce-quality-gates.cjs runtime gate is a no-op for L1/L2 when boundary.frameworkProtection=false; deny rules in settings.json are the real backstop. Toggle window expired 2026-06-19.
metadata:
  type: project
---

The L1/L2 framework-boundary protection has TWO independent layers (defense-in-depth):
1. **Runtime hook** `.claude/hooks/enforce-quality-gates.cjs` → respects `boundary.frameworkProtection` in `.aiox-core/core-config.yaml`. When `false`, it allows L1/L2 writes (exit 0, logs an `allow` decision).
2. **Deny rules** in `.claude/settings.json` `permissions.deny` → block Write/Edit/MultiEdit to all L1/L2 path families at the Claude Code permission layer, INDEPENDENT of the toggle. This is the hard backstop.

As of 2026-06-20: `frameworkProtection: false` with `frameworkProtectionExpires: 2026-06-19` (EPIC-8 L1 auto-healing window — now EXPIRED). So the runtime hook currently does NOT block L1/L2 writes; only the deny rules do. Verified: `echo '{"tool_name":"Write","tool_input":{"file_path":".aiox-core/core/x.js"}}' | node .claude/hooks/enforce-quality-gates.cjs` → EXIT=0 in the real project cwd.

Story 12.1 (Framework Boundary Enforcement, QA PASS 2026-06-20) tests pass because they run in isolated temp cwds with no core-config.yaml → toggle defaults to enabled. Flagged as REL-001 (low) in gate 12.1.

**Why:** EPIC-8 Phase 4 temporarily disabled the toggle to allow L1 auto-healing writes; the window lapsed 2026-06-19 without re-enabling.
**How to apply:** When QA-ing any EPIC-12 boundary/gate story, do NOT assume the runtime hook blocks L1/L2 in production — verify the toggle state. AC "deny rules block writes" is satisfied by settings.json deny, not the hook. Recommend re-enabling `boundary.frameworkProtection: true` as a project-config item (separate from story scope). Related: [[duplicate-story-1-16-id-collision]], constitutional gates in `.claude/rules/enforcement-gates.md`.
