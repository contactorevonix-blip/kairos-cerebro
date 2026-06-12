# Squad Parity Testing Guide

> Story 8.3.8 — Integration Tests (capstone for EPIC-8 Phase 3, Squad Creator).

## Purpose

A cloned squad must behave like its mentor. This guide describes how parity is
measured, what counts as an acceptable difference, and how to run/extend the
parity suite.

## The Four Parity Dimensions (AC1)

| Dimension | What it checks | Source modules |
|-----------|----------------|----------------|
| **Voice** | Cloned greeting/tone/vocab/emoji match the mentor's Voice DNA | `voice-dna.js` (8.3.1), `squad-template-generator.js` (8.3.3) |
| **Command** | Every mentor command is callable in the cloned squad | `skill-validator.js` (8.3.4), `thinking-dna.js` (8.3.2) |
| **Workflow** | Decision trees / command→task chains resolve identically | `thinking-dna.js` (8.3.2) |
| **Authority** | Exclusive ops inherited; the clone never escalates privilege | `authority-matrix.js` (8.3.5) |

Each dimension yields a score in `[0, 1]`. The overall parity score is their
mean.

## Threshold (AC2)

- **Current threshold:** `0.90` (per the story's risk mitigation — start at 90%).
- **Target:** `0.95`, to be adopted after 3+ real squads have been validated.

Both values live in `tests/squad-creator/fixtures/expected-outputs.json`
(`parityThreshold`, `targetThreshold`). Raising the threshold is a one-line
change there; no test code changes are required.

## Acceptable Differences (AC3)

A clone is intentionally *not* byte-identical to its mentor. The following are
**expected customizations**, documented in `expected-outputs.json` under
`documentedDifferences`, and are NOT parity defects:

1. **Identity** — the cloned agent id is `{squad-id}-lead`; its name carries a
   `(cloned)` suffix.
2. **Role** — the cloned role is `{focus} specialist (cloned from @{mentor})`,
   reflecting the deliberate focus-area input.
3. **Template location** — the KB and rules-override templates live under
   `squads/squad-creator/templates/` (L4) rather than
   `.aiox-core/development/templates/` (L2), because the L2 templates directory
   is blocked by the framework-boundary deny rule (Art. VI-VII). This follows
   the @po precedent of relocating blocked L1/L2 artefacts to L4.

Any difference *not* on this list should fail a parity test — that is the point.

## Regression (AC4)

Parity should be re-checked whenever a mentor's KB or the project KB changes.
The KB assembler embeds source fingerprints (size + mtime) in an
`<!-- AIOX-KB-METADATA -->` block; `isKBStale(metadata)` compares them to the
current on-disk state and returns `{ stale, changed }`. Wire this into CI to
re-run the parity suite when `stale === true`.

## Zero False Positives (AC5)

The suite is built so that:

- A clean clone scores parity = 1.0 (no spurious failures).
- A *real* escalation (clone adds an exclusive op the mentor lacks) IS rejected.
- A *real* constitutional conflict (overriding a NON-NEGOTIABLE/MUST rule) IS
  flagged; a legitimate SHOULD-level override (e.g. `absolute-imports.md`) is
  NOT flagged.

## Running

```bash
# Parity suite only
node --test tests/squad-creator/squad-parity.test.js

# Entire Phase 3 squad-creator suite (all 8.3.x modules)
node --test tests/squad-creator/*.test.js
```

## Fixtures

| File | Purpose |
|------|---------|
| `tests/squad-creator/fixtures/mentor-agents.js` | Self-contained mentor agent markdown + temp-dir writers for agents/tasks/rules |
| `tests/squad-creator/fixtures/expected-outputs.json` | Parity benchmarks, thresholds, and the documented-differences allowlist |

## Extending to a New Mentor

1. Add a mentor markdown constant + writer to `mentor-agents.js`.
2. Add its expected voice/commands/chains to `expected-outputs.json`.
3. Reuse the `cloneContext()` helper pattern in `squad-parity.test.js` against
   the new fixture.
4. Once 3+ real mentors pass at `>= 0.95`, raise `parityThreshold` to `0.95`.
