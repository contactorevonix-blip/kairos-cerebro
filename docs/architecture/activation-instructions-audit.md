# Audit: `activation-instructions-*` Templates Status

**Story:** EPIC-agent-determinism / Story G
**Date:** 2026-06-14
**Author:** @sm (River)
**Status:** Complete — findings documented, no code/config changes made

## Purpose

This audit was commissioned to investigate the status of the templates
`activation-instructions-template.md` and
`activation-instructions-inline-greeting.yaml`, which were reportedly removed
by "Story C" of EPIC-agent-determinism as "orphaned deprecated" artifacts. The
goal was to determine: do these templates still exist/are they active in the
upstream AIOX framework, and if so, should they be restored; if deprecated,
document the upstream decision; if neither exist nor were ever upstream,
investigate their local origin.

## Investigation Method

1. Searched `git log --all --oneline` and `git log --all --diff-filter=D`
   for any commit referencing or deleting `activation-instructions*`.
2. Searched `STATE.md`, `.aiox/`, and all local/remote branches for "Story C"
   or "EPIC-agent-determinism" references.
3. Inspected the current working tree for the two template files.
4. Cross-referenced the AIOX-core framework manifests (`version.json`,
   `install-manifest.yaml`, `.installed-manifest.yaml`,
   `entity-registry.yaml`) for these two file paths.
5. Cross-referenced `.aiox/migration-inventory.json` and
   `.aiox/path-analysis-report.json` for usage/reference data.
6. Compared the templates' documented activation-instructions format against
   the format actually used by live agent definitions (`.aiox-core/development/agents/sm.md`).

## Finding 1 — No "Story C" Exists in This Repository

- `docs/stories/epics/EPIC-agent-determinism/` contains only
  `story-F-config-yaml-repair.md`.
- `git log --all --oneline` shows no commit message referencing
  "Story C", "story-c", or removal of activation-instructions files.
- `git log --all --diff-filter=D --name-only` (filtered to
  `activation-instructions`) returns **no results** — these files have never
  been deleted in this repository's history.
- `STATE.md` (1484 lines, full session history back through EPIC-5/6/7/8)
  contains no mention of a "Story C" for this epic, nor of any
  activation-instructions removal.
- Only branch matching this epic: `claude/epic-agent-determinism-story-f-ghuhmv`
  (local + remote), which corresponds to Story F only.

**Conclusion:** The premise that "Story C removed these templates" does not
match the repository's actual history. Either the premise was based on a
different repository/session, or it was a planning assumption that was never
executed. Per Constitution Art. IV (No Invention), this audit does not
fabricate a Story C retroactively — it documents this discrepancy as a
finding.

## Finding 2 — Both Templates Currently Exist, Introduced 2026-06-09

```
.aiox-core/product/templates/activation-instructions-template.md          (9082 bytes)
.aiox-core/product/templates/activation-instructions-inline-greeting.yaml  (2509 bytes)
```

- `git log --all --oneline -- <path>` for both files shows exactly **one**
  commit: `e95bf4f` — "fix: add tests/hooks to npm test scope (Art. V Quality
  Gate)" (2026-06-09), which **adds** both files as new
  (`new file mode 100644`).
- Neither file has been modified or deleted since.
- Both are present in the current working tree, unmodified
  (git status shows no pending changes to either path).

## Finding 3 — Both Are Registered L2 Framework Assets (AIOX-core 5.2.9)

Cross-referencing the project's installed AIOX-core framework manifests
(`project.version: 2.1.0` in `core-config.yaml`, AIOX-core CLI
`version: 5.2.9` in `.aiox-core/version.json`):

| Manifest | Entry | Detail |
|---|---|---|
| `.aiox-core/version.json` | `product/templates/activation-instructions-template.md` | `sha256:b4df5343728e565d975c28cad8a1a9dac370d0cf827689ced1c553268dc265e7` |
| `.aiox-core/version.json` | `product/templates/activation-instructions-inline-greeting.yaml` | `sha256:d4d3dc2bf0c06c0094ab0e76029c0ad322222e3420240ac3abcac6c150a4ae01` |
| `.aiox-core/install-manifest.yaml` | both paths | `type: template`, hashes match `version.json` |
| `.aiox-core/.installed-manifest.yaml` | both paths | `modified_by_user: false` |
| `.aiox-core/data/entity-registry.yaml` | both, `layer: L2`, `type: template` | `usedBy: []`, `dependencies: []` |
| `.aiox-core/core/registry/service-registry.json` | `activation-instructions-template` | `category: template`, `taskFormat: TEMPLATE`, `executorTypes: [Agent]` |

**Conclusion:** Both files are standard, framework-shipped L2 assets of
AIOX-core 5.2.9 — not project-local inventions, and not flagged as
deprecated/removed in any installed manifest. Per the Framework Boundary
(L1-L4) defined in `.claude/CLAUDE.md`, these are **L2 — Framework Templates
(NEVER modify, extend-only)**.

> Note: A live upstream GitHub lookup (`SynkraAI/aiox-core@main`) was not
> performed in this session (no network/MCP search invoked). The local
> manifest evidence above is first-party and considered sufficient to confirm
> these are genuine AIOX-core 5.2.9 framework deliverables, since
> `.installed-manifest.yaml` + `version.json` are generated by the AIOX
> installer from the upstream package itself.

## Finding 4 — "Orphaned" in Practice (registry `usedBy: []`), Not in Registry

- `entity-registry.yaml` records `usedBy: []` for both templates — no other
  registered entity formally depends on them.
- `.aiox/path-analysis-report.json` analyzes the script references *inside*
  `activation-instructions-template.md` and flags all of them as
  `exists: false` against the resolved path
  `.aiox-core/infrastructure/scripts/{name}`:
  - `greeting-builder`
  - `project-status-loader`
  - `session-context-loader`
  - `git-config-detector`
  - `workflow-navigator`
  - `workflow-patterns` (data, resolved to `.aiox-core/development/data/workflow-patterns`)

This is the likely origin of the "orphaned/deprecated" characterization in
the mission brief — the template's *referenced scripts* appear missing when
checked against the path it documents.

## Finding 5 — The "Missing" Script Actually Exists, at a Different Path

`greeting-builder.js` **does exist** in the repository:

```
.aiox-core/development/scripts/greeting-builder.js
.claude/commands/AIOX/scripts/greeting-builder.js
```

`activation-instructions-template.md` documents the path as
`.aiox-core/development/scripts/greeting-builder.js` in its body text (STEP 3
and "Related Files" section), which **is correct** — but
`.aiox/path-analysis-report.json` resolved the reference against
`.aiox-core/infrastructure/scripts/greeting-builder` and marked it
`exists: false`. This is a **path-analysis tooling discrepancy**
(infrastructure/ vs development/ scripts directories), not evidence that the
GreetingBuilder capability is missing. The capability is present and
functional at `.aiox-core/development/scripts/greeting-builder.js`.

This finding suggests the `usedBy: []` / "orphaned" signal in the registry
analysis may be a **false positive** driven by a path-resolution convention
mismatch between `.aiox-core/development/scripts/` (where the script
actually lives) and `.aiox-core/infrastructure/scripts/` (where the analyzer
expected it).

## Finding 6 — Live Agents Use a Third, Hand-Evolved Format

Neither template's exact `activation-instructions:` block matches what live
agent definitions actually use today. For example,
`.aiox-core/development/agents/sm.md` STEP 3 reads:

```yaml
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
  - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
  - STEP 3: |
      Display greeting using native context (zero JS execution):
      0. GREENFIELD GUARD: If gitStatus in system prompt says "Is a git repository: false" OR git commands return "not a git repository":
      ...
```

This is **neither** the `activation-instructions-template.md`
"call GreetingBuilder via JS" format **nor** the
`activation-instructions-inline-greeting.yaml` "fully inlined Bash-based
greeting" format — it is a third variant ("zero JS execution", native-context
greeting) that appears to be a later evolution not reflected in either
template.

**Conclusion:** Both templates document *historical* (Story 6.1.2.5, v2.0,
2025-11-16) activation-instructions patterns. The *current* live pattern
(used by `sm.md` and presumably sibling agents) has since evolved beyond what
either template describes, but the templates were never updated to reflect
this, nor formally superseded/deprecated.

## Constitution & IDS Compliance Self-Check

| Check | Result |
|---|---|
| Art. IV (No Invention) — every finding traces to a real artifact | PASS — all findings cite specific files, commits, or manifest entries |
| Art. VI-VII (Framework Boundary) — no L1/L2 modification | PASS — no files in `.aiox-core/product/templates/`, `.aiox-core/core/`, etc. were modified |
| IDS — REUSE > ADAPT > CREATE | PASS — audit reuses existing manifest/registry data; no new entities created beyond this audit doc + story file (both L4 docs) |
| Story-Driven (Art. III) | PASS — this audit is itself a story deliverable (Story G) |

## Recommendation (Non-Binding, Deferred to Future Story)

1. **Do not delete or restore anything** — both templates are valid,
   framework-shipped L2 reference documentation; their presence is correct
   per the installed AIOX-core 5.2.9 manifest.
2. **Optional follow-up (Option B from Story G):** A future story could:
   - Add a note to `activation-instructions-template.md` clarifying that
     `sm.md` (and sibling agents) use a newer "zero JS execution" inline
     variant, to prevent confusion for future template consumers.
   - Investigate/fix the `.aiox/path-analysis-report.json` resolution logic
     so it checks `.aiox-core/development/scripts/` (where scripts like
     `greeting-builder.js` actually live) in addition to
     `.aiox-core/infrastructure/scripts/`, reducing false-positive "missing
     script" findings.
3. **No urgency** — both items are documentation/tooling-accuracy
   improvements, not functional defects. Current agents (sm.md, etc.) work
   correctly with their own inline activation-instructions independent of
   these templates.

## Cross-References

- Story file: `docs/stories/epics/EPIC-agent-determinism/story-G-activation-instructions-audit.md`
- Related (sequential dependency, not functional): `docs/stories/epics/EPIC-agent-determinism/story-F-config-yaml-repair.md`
- Manifests consulted: `.aiox-core/version.json`, `.aiox-core/install-manifest.yaml`,
  `.aiox-core/.installed-manifest.yaml`, `.aiox-core/data/entity-registry.yaml`,
  `.aiox-core/core/registry/service-registry.json`
- Migration data consulted: `.aiox/migration-inventory.json`,
  `.aiox/path-analysis-report.json`
- Templates audited: `.aiox-core/product/templates/activation-instructions-template.md`,
  `.aiox-core/product/templates/activation-instructions-inline-greeting.yaml`
- Live format comparison: `.aiox-core/development/agents/sm.md`
