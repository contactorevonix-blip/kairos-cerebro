---
name: constitutional-enforcement-gates
description: Story 1.16 — how Constitution Art. II-VII are enforced via Claude Code PreToolUse hooks, override flags, and where metrics/logs live
metadata:
  type: project
---

Story 1.16 operationalized the AIOX Constitution as automated PreToolUse gates.

**Hooks** (in `.claude/hooks/`, all dependency-free `.cjs`):
- `enforce-agent-authority.cjs` — Art. II, blocks remote git/PR from non-@devops (override `--skip-devops-check`)
- `enforce-story-driven.cjs` — Art. III, blocks `git commit` with no story at Ready+ (override `[no-story-req]`)
- `enforce-no-invention.cjs` — Art. IV, flags spec.md MUST/SHALL lines without FR-/NFR-/CON-/`[research:]` refs (WARN; BLOCK if `AIOX_NO_INVENTION_STRICT=1`)
- `enforce-quality-gates.cjs` — Art. V-VII, blocks merge on failing quality status (override `--force-gate`) + blocks Write/Edit to L1/L2 paths
- `lib/gate-logger.cjs` — shared metrics + decision-log + active-agent resolution; never throws

**Why:** SYNAPSE L2+ layers were loading but Constitution enforcement was silent. Gates make violations blocking.

**How to apply:**
- Metrics live in `.synapse/metrics/hook-metrics.json` under `enforcement` (gatesEnforced/violationsDetected/violationsBlocked/overridesUsed).
- Decision logs go to `.aiox/gate-logs/{article}-{date}.jsonl` (dir kept by `.gitkeep`).
- Full override policy + examples documented in `.claude/rules/enforcement-gates.md`.
- The end-to-end spawn tests in `tests/hooks/enforcement.test.js` mutate the LIVE `hook-metrics.json` and create live gate-logs (cwd = repo root). Reset enforcement counters to 0 and delete `*.jsonl` after running for a clean baseline.
- `settings.json` previously referenced a phantom `pre-commit-story-enforcement.cjs` — now repointed to `enforce-story-driven.cjs`.
- A duplicate story-ID 1.16 existed (`docs/stories/1.16-claude-code-mastery-coherence.md` vs `docs/stories/1/1.16.story.md`); the coherence file was removed, resolving the collision.
