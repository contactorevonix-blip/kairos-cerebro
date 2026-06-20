---
name: pre-push-test-race
description: Pre-push gate flakiness — node --test concurrency races on shared .synapse/context-registry.json; fixed with --test-concurrency=1
metadata:
  type: project
---

Pre-push quality gate (`scripts/validate-quality-gates.js` → `npm test`) intermittently failed on a non-deterministic race, not a regression.

**Why:** `node --test` runs suites concurrently. `tests/context-registry` and engine-backed suites (hooks, auto-contextualization) share the physical file `.synapse/context-registry.json`. Its atomic write (`writeFileSync` temp + `renameSync` in `.synapse/context-registry.js`) collides under concurrent access on Windows, throwing `Failed to write registry` and cancelling the Performance suite. Symptom in the gate output is `fail 0` but `cancelled 2` → `node --test` still exits non-zero → gate blocks the push.

**How to apply:** If the pre-push gate fails with cancelled (not failed) tests around context-registry, do NOT use `--no-verify`. The fix is already in `package.json`: the `test` script carries `--test-concurrency=1`, which serializes suites and makes it deterministic (258/258 + 7/7 ws PASS). Verify a suspected regression by running each group isolated first — if isolated passes but combined cancels, it's the shared-file race, not the code under push. Resolved Cont 66 (commit 97dd3a5).
