# Constitutional Enforcement Gates

> **Story:** 1.16 — Constitutional Enforcement Gates
> **Constitution:** `.aiox-core/constitution.md` (Articles I-VII)
> **Status:** Active

Automated gates that detect and block violations of the AIOX Constitution at
the Claude Code hook layer (`PreToolUse`). Each gate is a dependency-free
`.cjs` hook that reads the tool input, decides allow/block/override, records
metrics, and writes a decision log.

## Gate Inventory

| Article | Gate | Hook | Trigger (matcher) | Severity |
|---------|------|------|-------------------|----------|
| II — Agent Authority | Block remote git/PR from non-@devops | `.claude/hooks/enforce-agent-authority.cjs` | `Bash(*git push*)` | BLOCK |
| III — Story-Driven | Block code commit without an active story | `.claude/hooks/enforce-story-driven.cjs` | `Bash(git commit*)` | BLOCK |
| IV — No Invention | Flag spec statements without requirement traceability | `.claude/hooks/enforce-no-invention.cjs` | `Write` / `Edit` (`*spec.md`) | WARN (BLOCK if strict) |
| V — Quality First | Block merge when quality gate failed | `.claude/hooks/enforce-quality-gates.cjs` | `Bash(git merge*)` | BLOCK |
| VI-VII — Framework Boundary | Block Write/Edit to L1/L2 paths | `.claude/hooks/enforce-quality-gates.cjs` | `Write` / `Edit` | BLOCK |

Shared utility: `.claude/hooks/lib/gate-logger.cjs` (metrics + decision logging
+ active-agent resolution).

## Gate Priority

`Art. II (devops)` > `Art. III (story-driven)` > `Art. IV (no-invention)` >
`Art. V (quality)` > `Art. VI-VII (boundary)`.

## Override Policy

Overrides are **rare, explicit, and always audit-logged** to `.aiox/gate-logs/`.
A blocked gate is the default; an override is a deliberate, recorded exception.

| Override | Where | Allows | Audit |
|----------|-------|--------|-------|
| `--skip-devops-check` | in the `git push` command | non-@devops to push | logged as `override` (Art. II) + `overridesUsed++` |
| `[no-story-req]` | in the commit message | a config-only commit without a story | logged as `override` (Art. III) + `overridesUsed++` |
| `--force-gate` / `AIOX_FORCE_GATE=1` | in the `git merge` command / env | merge despite failing quality gate | logged as `override` (Art. V) + `overridesUsed++` |
| `AIOX_NO_INVENTION_STRICT=1` | env | flips Art. IV from WARN to BLOCK | n/a (changes severity, not an override) |

**Not overridable here:** framework-boundary writes (Art. VI-VII). The
`settings.json` deny rules are the hard backstop; route legitimate framework
changes through `@aiox-master *propose-modification`.

### Override examples

```bash
# Art. II — allow a non-@devops push (rare, audit-logged)
git push origin main --skip-devops-check

# Art. III — config-only commit with no story
git commit -m "chore: update editorconfig [no-story-req]"

# Art. V — force a merge despite a failing quality gate
git merge feature/x --force-gate
```

## Metrics (AC5)

Tracked in `.synapse/metrics/hook-metrics.json` under `enforcement`:

| Field | Meaning |
|-------|---------|
| `gatesEnforced` | Total times a gate was evaluated against a matching action |
| `violationsDetected` | Actions that violated a gate (before override consideration) |
| `violationsBlocked` | Violations that were blocked (no override) |
| `overridesUsed` | Violations allowed through an explicit override |

Metrics are merged idempotently — re-running a gate never double-counts a
single decision beyond its own invocation, and a missing metrics file is
recreated.

## Gate Decision Logs (AC6)

Every decision is appended to `.aiox/gate-logs/{article}-{YYYY-MM-DD}.jsonl`
(directory created on first decision). One JSON object per line:

```json
{"timestamp":"2026-06-08T19:00:00.000Z","article":"art-ii-agent-authority","gate":"agent-authority","decision":"block","reason":"git push is exclusive to @devops ...","agent":"@dev","operation":"git push"}
```

`decision` is one of: `allow`, `block`, `override`, `warn`, `warn-and-proceed`.

## Graceful Degradation

All gates follow the AIOX principle that **enforcement tooling must never block
development by failing**:

- Metrics/log write failures are swallowed (`gate-logger.cjs` never throws).
- Art. III / Art. V degrade to `warn-and-proceed` when their data source can't
  be read (e.g. `docs/stories/` unreadable, quality status unknown).
- Only the NON-NEGOTIABLE Art. II gate blocks on a parse failure (fail-safe).

## Active-Agent Resolution

`enforce-agent-authority.cjs` resolves the active agent in this order:
env vars (`AIOX_ACTIVE_AGENT`, `AIOX_AGENT`, `ACTIVE_AGENT`, `CLAUDE_AGENT_NAME`,
`CLAUDE_CODE_AGENT`, `AIOX_CURRENT_AGENT`) → inline command-scoped var →
`session.active_agent.id` in `hook-metrics.json` (set by
`agent-activation-tracker.cjs`).

## Testing

`tests/hooks/enforcement.test.js` covers every gate (block, allow, override,
warn) using `node:test`:

```bash
node --test tests/hooks/enforcement.test.js
```

## Related

- `.aiox-core/constitution.md` — Articles I-VII
- `.claude/rules/agent-authority.md` — delegation matrix
- `.claude/rules/story-lifecycle.md` — story status transitions
- `.claude/hooks/enforce-git-push-authority.cjs` — prior Art. II hook (kept as defence-in-depth)
