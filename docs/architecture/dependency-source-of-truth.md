# Dependency Source-of-Truth — Canonical Path Mapping

**Status:** Accepted
**Author:** @architect (Aria) + @skill-craftsman perspective (AC-D4)
**Date:** 2026-06-13
**Epic:** EPIC-agent-determinism (kairos-cerebro)
**Story:** D — `development/` vs `product/` (fonte de verdade) + agent-teams órfão
**Traces to:** F5 (agent-teams orphan), F6 (undocumented dev/ vs product/ overlap)
**Layer:** L4 (this doc). All L2 change recommendations are PROPOSALS — see AC-D5.
**Consumed by:** Story A (IDE-FILE-RESOLUTION rewrite), Story B (config paths)

---

## 1. Problem Statement (F5, F6)

AIOX agent definitions (`SKILL.md`) contain an `IDE-FILE-RESOLUTION` block that
declares a **single** path formula for **all** dependency types:

```yaml
IDE-FILE-RESOLUTION:
  - Dependencies map to .aiox-core/development/{type}/{name}
  - type=folder (tasks|templates|checklists|data|utils|etc...), name=file-name
  - Example: create-doc.md → .aiox-core/development/tasks/create-doc.md
```

This formula is **wrong for 4 of 6 dependency types**. Each agent's
`dependencies:` block lists `checklists`, `templates`, and `data` entries that
do **not** exist under `development/` — they live in `product/` and in the
top-level `.aiox-core/data/`. The formula "works" only for `tasks` and
`workflows`. The overlap between `development/` and `product/` was never
documented, so the formula silently resolves to non-existent paths for the
majority of dependencies.

### Verified ground truth (this audit, 2026-06-13)

Resolution test against the architect agent's own declared dependencies:

| Declared dependency | IDE-FILE-RESOLUTION says | Actually lives in | Formula correct? |
|---|---|---|---|
| `create-doc.md` (task) | `development/tasks/` | `development/tasks/` | YES |
| `architect-checklist.md` (checklist) | `development/checklists/` | `product/checklists/` | **NO** |
| `architecture-tmpl.yaml` (template) | `development/templates/` | `product/templates/` | **NO** |
| `technical-preferences.md` (data) | `development/data/` | `.aiox-core/data/` (top-level) | **NO** |
| `codebase-mapper.js` (script) | `development/scripts/` | `infrastructure/scripts/` | **NO** |

### Overlap counts (re-verified)

| Type | `development/` | `product/` | `data/` top-level | `infrastructure/` |
|---|---|---|---|---|
| checklists | 5 | 16 | — | — |
| templates | 35 (files, mostly scaffolding) | 96 (files) | — | 16 (project-bootstrap) |
| data | 3 | 16 | 21 | — |
| scripts | ~40 (runtime helpers) | — | — | ~90 (framework tooling) |

> Note on counts: the story header quotes "templates 11 vs 78". Those are
> top-level entry counts; the recursive **file** counts are 35 vs 96 (the
> `development/templates/` entries are mostly multi-file scaffolding bundles such
> as `service-template/` and `squad-template/`). Both views agree on direction:
> `product/` is the larger, agent-facing template store.

---

## 2. AC-D1 — Source-of-Truth Table (THE DECISION)

For each dependency **type**, exactly one directory is canonical. The decision
is grounded in **where the files agents actually declare as dependencies
resolve today**, corroborated by `product/README.md` ("Templates and checklists
are loaded as static files by agents") and `core-config.yaml`
(`dataLocation: .aiox-core/data`).

| Type | Canonical directory | Why (evidence) |
|---|---|---|
| **tasks** | `.aiox-core/development/tasks/` | All agent `tasks:` dependencies resolve here (e.g. `create-doc.md`, `execute-checklist.md`). `development/README.md` declares "115+ task definitions" here. |
| **workflows** | `.aiox-core/development/workflows/` | 14 workflow YAMLs (greenfield/brownfield/spec-pipeline/qa-loop/etc.) live only here. No `workflows/` exists under `product/`. |
| **checklists** | `.aiox-core/product/checklists/` | 16 of the agent-referenced checklists live here (`architect-checklist.md`, `pm-checklist.md`, `po-master-checklist.md`, `story-dod-checklist.md`, …). `product/README.md` declares this the checklist home. `development/checklists/` holds only 5 framework-internal files (see §3). |
| **templates** | `.aiox-core/product/templates/` | 96 agent-facing document templates (`prd-tmpl.yaml`, `architecture-tmpl.yaml`, `story-tmpl.yaml`, `qa-gate-tmpl.yaml`, …). `development/templates/` holds framework **scaffolding** bundles, not document templates (see §3). |
| **data** | `.aiox-core/data/` (top-level) | `core-config.yaml` sets `dataLocation: .aiox-core/data`. The agent-referenced `technical-preferences.md`, `workflow-chains.yaml`, `entity-registry.yaml`, `tool-registry.yaml` all live here. `product/data/` and `development/data/` are secondary, type-specific stores (see §3). |
| **scripts / utils** | `.aiox-core/infrastructure/scripts/` (default) **and** `.aiox-core/development/scripts/` (agent-runtime subset) **and** `.aiox-core/scripts/` (legacy fallback) | Three stores with a clear boundary — see §2.1. The agent-referenced `codebase-mapper.js` resolves to `infrastructure/scripts/`; `workflow-management.md` resolves to the legacy `.aiox-core/scripts/`. |

### 2.1 scripts/utils — the two-store distinction

There are two script directories, and the distinction is **functional, not
accidental**. Both are kept; neither is canonical-for-everything.

| Store | Path | Contains | Configured as |
|---|---|---|---|
| **Infrastructure scripts** | `.aiox-core/infrastructure/scripts/` | Framework tooling: validators (`validate-*.js`), generators (`*-generator.js`), analyzers, `codebase-mapper.js`, `config-loader.js`, sync tooling, QA orchestration. ~90 files. | `core-config.yaml` → `scriptsLocation.infrastructure` |
| **Development scripts** | `.aiox-core/development/scripts/` | Agent-runtime helpers: `agent-config-loader.js`, `activation-runtime.js`, greeting builders, `decision-log-*.js`, exit hooks. ~40 files. | `core-config.yaml` → `scriptsLocation.development` |
| **Legacy scripts** | `.aiox-core/scripts/` | Pre-reorg framework scripts not yet migrated: `workflow-management.md`, `session-context-loader.js`, `command-execution-hook.js`, `pm.sh`, `diagnostics/`, batch-migration `.ps1`/`.sh` scripts. ~15 files. | `core-config.yaml` → `scriptsLocation.legacy` (NEW — AC-E7.5) |

**Rule:** A script dependency resolves to `infrastructure/scripts/` by default
(framework utilities). Only the agent-lifecycle helpers (activation, greeting,
decision-log, exit-hooks) live in `development/scripts/`. A small set of
pre-reorg files (e.g. `workflow-management.md`, referenced by `aiox-master`)
remain in the legacy `.aiox-core/scripts/` directory and have NOT been moved.
When a SKILL declares a `scripts:` (or `utils:`) dependency, the resolver must
check `infrastructure/scripts/` first, then `development/scripts/`, then
`.aiox-core/scripts/` (legacy) — see the per-type mapping in §5.

---

## 3. AC-D2 — Disposition of NON-canonical directories

For each type, what to do with the files that sit in the non-canonical
directory. **All L2 mutations are PROPOSALS (AC-D5), never direct edits.**

### 3.1 `development/checklists/` (5 files) — KEEP, RE-SCOPE as framework-internal

| File | Referenced by | Classification |
|---|---|---|
| `agent-quality-gate.md` | not an agent dependency | Framework-internal (agent authoring/QA) |
| `brownfield-compatibility-checklist.md` | not an agent dependency | Framework-internal |
| `issue-triage-checklist.md` | not an agent dependency | Framework-internal |
| `memory-audit-checklist.md` | not an agent dependency | Framework-internal |
| `self-critique-checklist.md` | **dev SKILL** + tasks `plan-execute-subtask.md`, `build-autonomous.md` | **DUPLICATE — divergent** (see below) |

**Decision:** These 5 are **not** agent document-checklists; they are framework
authoring/process checklists. They are NOT duplicates of `product/checklists/`
(except `self-critique-checklist.md`). Keep them where they are, but they are
**out of scope** for the agent dependency resolver. Recommend the canonical
checklist resolver point ONLY at `product/checklists/`.

**`self-critique-checklist.md` is a real divergence**, not a clean duplicate:
- `development/checklists/self-critique-checklist.md` = 9184 bytes
- `product/checklists/self-critique-checklist.md` = 10518 bytes
- The two files **differ in content**.

The dev SKILL declares `self-critique-checklist.md` as a checklist dependency.
Under the canonical mapping (`checklists → product/`), it would resolve to the
**product** copy. Tasks `plan-execute-subtask.md` reference it via
`checklistRef: self-critique-checklist.md` (name only, no path).

> **PROPOSAL (L2, via `@aiox-master *propose-modification`):** Reconcile the two
> `self-critique-checklist.md` files. Recommended: designate
> `product/checklists/self-critique-checklist.md` as canonical (it is the larger,
> more complete version and aligns with the checklist source-of-truth), and
> either (a) delete the `development/` copy, or (b) if the divergence is
> intentional (a framework-authoring variant), rename the development copy to
> `agent-self-critique-checklist.md` to remove the name collision. Decision
> requires diffing both files — flagged for the proposal, NOT executed here.

### 3.2 `development/templates/` (scaffolding) — KEEP, distinct purpose

`development/templates/` does NOT hold agent document-templates. It holds:
- `service-template/` — code scaffolding (`.hbs` files for a TS service)
- `squad-template/` and `squad/` — squad authoring scaffolding
- `ptc-*.md`, `subagent-step-prompt.md`, `agent-handoff-tmpl.yaml` — framework prompt/process templates

**Decision:** No overlap-by-name with `product/templates/` document templates.
Keep both. The canonical **document-template** resolver points at
`product/templates/`. The scaffolding under `development/templates/` is consumed
by framework tooling (squad creator, service generator), not by the agent
dependency resolver.

**Documented exception (AC-E7.4 / Story E):** the **framework prompt/process
templates** named above — `subagent-step-prompt.md`, `ptc-*.md`,
`agent-handoff-tmpl.yaml` — are a distinct sub-case of `templates:` deps. When
an agent declares one of these specific files as a `templates:` dependency
(e.g. `aiox-master`'s reference to `subagent-step-prompt.md`), the resolver
falls back to `.aiox-core/development/templates/{name}` after checking
`product/templates/` (where the file does not exist). This does NOT change the
canonical directory for ordinary document templates — only for this named set
of framework prompt/process templates. No SKILL.md edit required; the existing
`subagent-step-prompt.md` reference resolves correctly under this fallback.

### 3.3 `development/data/` (3 files) — KEEP, framework-authoring data

| File | Referenced by |
|---|---|
| `decision-heuristics-framework.md` | task `create-agent.md` |
| `quality-dimensions-framework.md` | task `create-agent.md` (agent authoring) |
| `tier-system-framework.md` | task `create-agent.md` |

**Decision:** These are **framework-authoring** data consumed by the
`create-agent` task, distinct from agent-runtime data in top-level
`.aiox-core/data/`. Keep them. They are out of scope for the agent dependency
resolver (which points at top-level `data/`). No action required.

### 3.4 `product/data/` (16 files) — KEEP, domain reference data

`product/data/` holds domain knowledge bases (`rls-security-patterns.md`,
`test-levels-framework.md`, `elicitation-methods.md`, etc.). Note
`product/README.md` lists `technical-preferences.md` here, but the file has
**moved** to top-level `data/` (README is stale — see §3.6).

**Decision:** Keep. Where an agent declares a `data:` dependency, the resolver
must check **top-level `data/` first**, then `product/data/` as a fallback for
domain reference files (e.g. `rls-security-patterns.md` is referenced by
@data-engineer and lives only in `product/data/`).

### 3.5 `infrastructure/templates/` (16 files) — KEEP, project bootstrap

Project-bootstrap templates (gitignore, CI workflows, core-config templates).
Not agent document-templates. No action.

### 3.6 Stale documentation (non-L2-blocking, informational)

`product/README.md` lists `technical-preferences.md` under `product/data/`, but
that file now lives only in top-level `.aiox-core/data/`. The README is stale.

> **PROPOSAL (L2):** Update `product/README.md` to reflect that
> `technical-preferences.md` now resolves from top-level `data/`. Low priority,
> documentation-only.

---

## 4. AC-D3 — `development/agent-teams/` (F5 orphan)

### Evidence (Grep, this audit)

`agent-teams/` contains 5 files: `team-all.yaml`, `team-fullstack.yaml`,
`team-ide-minimal.yaml`, `team-no-ui.yaml`, `team-qa-focused.yaml`.

Grep for `agent-teams` / team names across consumption surfaces:

| Surface | Result |
|---|---|
| `.claude/skills/` (all SKILL.md) | **ZERO** references |
| `.aiox-core/development/agents/` (agent defs) | **ZERO** references |
| `core-config.yaml` | **ZERO** references |

The only references found are **non-consuming**:
- `.aiox-core/development/README.md` — the directory's own README (self-description)
- `.aiox-core/install-manifest.yaml`, `.installed-manifest.yaml`, `version.json` — packaging **inventory** (file hashes), not runtime consumption
- `.aiox-core/data/aiox-kb.md` — knowledge-base prose description
- This epic's docs — the audit itself
- Unrelated `roadmap-sentinel` / squad files — substring coincidence, not these teams

**Additional staleness signal:** `team-all.yaml` references agent IDs
`aiox-orchestrator` and `aiox-developer`, which are **not** current agent IDs
(current IDs are `dev`, `architect`, `pm`, … per `development/README.md`). The
team bundles also reference workflow files by bare name; while those workflows
exist in `development/workflows/`, nothing loads the team files to dereference
them.

### Decision: (b) MARK AS LEGACY (documented), with a path to (c) removal

`agent-teams/` is a **confirmed orphan**: zero runtime consumers, references
defunct agent IDs. It is a vestige of the upstream BMAD-style "agent bundle"
concept that the kairos-cerebro SKILL-based activation model replaced.

We choose **(b) legacy documented** over **(c) immediate removal** because:
- It is L2 — cannot be deleted directly (AC-D5).
- It is harmless (zero consumers) — no determinism risk if left in place.
- It is captured in `install-manifest.yaml`; removal must go through the
  manifest regeneration path to avoid integrity drift.

> **PROPOSAL (L2, via `@aiox-master *propose-modification`):** Mark
> `.aiox-core/development/agent-teams/` as DEPRECATED (add a `DEPRECATED.md` or
> frontmatter note inside the directory) in the near term, and schedule removal
> in a dedicated cleanup story that also regenerates `install-manifest.yaml`,
> `.installed-manifest.yaml`, and prunes the `aiox-kb.md` / `development/README.md`
> descriptions. Do NOT delete piecemeal — removal is a coordinated manifest
> operation. Until then, no agent or config may reference it (it is already
> referenced by none).

**Input to other stories:** agent-teams is NOT a dependency type in the resolver
and must NOT appear in the IDE-FILE-RESOLUTION mapping handed to Story A.

---

## 5. AC-D4 — HANDOFF TO STORY A (canonical IDE-FILE-RESOLUTION)

This is the explicit input Story A consumes. It replaces the single-formula
`IDE-FILE-RESOLUTION` block in every `SKILL.md` with a **per-type** mapping.
Copy-paste ready.

### 5.1 Replacement YAML block (drop-in for SKILL.md)

```yaml
IDE-FILE-RESOLUTION:
  - FOR LATER USE ONLY - NOT FOR ACTIVATION, when executing commands that reference dependencies
  - Dependencies map per-type to canonical directories (NOT a single {type} formula):
  - "  tasks      -> .aiox-core/development/tasks/{name}"
  - "  workflows  -> .aiox-core/development/workflows/{name}"
  - "  checklists -> .aiox-core/product/checklists/{name}"
  - "  templates  -> .aiox-core/product/templates/{name}   (fallback for named framework prompt/process templates - subagent-step-prompt.md, ptc-*.md, agent-handoff-tmpl.yaml: .aiox-core/development/templates/{name})"
  - "  data       -> .aiox-core/data/{name}   (fallback: .aiox-core/product/data/{name})"
  - "  scripts    -> .aiox-core/infrastructure/scripts/{name}   (fallback 1: .aiox-core/development/scripts/{name}, fallback 2 legacy: .aiox-core/scripts/{name})"
  - "  utils      -> alias of scripts (same resolution order)"
  - Example: create-doc.md (task)            -> .aiox-core/development/tasks/create-doc.md
  - Example: architect-checklist.md (chklst) -> .aiox-core/product/checklists/architect-checklist.md
  - Example: architecture-tmpl.yaml (tmpl)   -> .aiox-core/product/templates/architecture-tmpl.yaml
  - Example: subagent-step-prompt.md (tmpl)  -> .aiox-core/development/templates/subagent-step-prompt.md (fallback case)
  - Example: technical-preferences.md (data) -> .aiox-core/data/technical-preferences.md
  - Example: codebase-mapper.js (script)     -> .aiox-core/infrastructure/scripts/codebase-mapper.js
  - Example: workflow-management.md (script) -> .aiox-core/scripts/workflow-management.md (legacy fallback case)
  - IMPORTANT: Only load these files when user requests specific command execution
  - NOTE: agent-teams/ is DEPRECATED and is NOT a dependency type — never resolve it.
```

### 5.2 Canonical mapping table (machine-readable, for Story B / resolver code)

```yaml
dependency_source_of_truth:
  tasks:
    canonical: .aiox-core/development/tasks/
    fallback: []
  workflows:
    canonical: .aiox-core/development/workflows/
    fallback: []
  checklists:
    canonical: .aiox-core/product/checklists/
    fallback: []   # development/checklists is framework-internal, NOT a fallback
  templates:
    canonical: .aiox-core/product/templates/
    fallback: []   # development/templates is scaffolding, NOT document templates
    named_exceptions:   # AC-E7.4 — framework prompt/process templates
      files: [subagent-step-prompt.md, "ptc-*.md", agent-handoff-tmpl.yaml]
      fallback: [.aiox-core/development/templates/]
  data:
    canonical: .aiox-core/data/
    fallback: [.aiox-core/product/data/]   # domain reference data (e.g. rls-security-patterns.md)
  scripts:
    canonical: .aiox-core/infrastructure/scripts/
    fallback:   # AC-E7.5 — ordered fallback tiers
      - .aiox-core/development/scripts/   # agent-runtime helpers
      - .aiox-core/scripts/                # legacy, pre-reorg (e.g. workflow-management.md)
  utils:
    alias_of: scripts
  agent-teams:
    status: DEPRECATED
    canonical: null   # not a resolvable dependency type
```

### 5.3 Per-type rationale summary for Story A reviewers

- **tasks / workflows** → `development/` (unchanged; formula was already correct here).
- **checklists / templates** → `product/` (the actual home of agent-facing
  document checklists/templates; corroborated by `product/README.md`).
- **data** → top-level `.aiox-core/data/` (matches `dataLocation` in
  `core-config.yaml`); `product/data/` is a documented fallback for domain refs.
- **scripts/utils** → `infrastructure/scripts/` default, `development/scripts/`
  fallback for agent-lifecycle helpers.
- **agent-teams** → excluded (deprecated orphan).

---

## 6. AC-D5 — Boundary Compliance Statement

This story edited **only** L4 artifacts: this document
(`docs/architecture/dependency-source-of-truth.md`) and the story file. No L2
content (`development/`, `product/`, `infrastructure/`) was modified directly.

All L2 changes identified are recorded above as explicit **PROPOSALS** to be
routed through `@aiox-master *propose-modification`:
1. Reconcile divergent `self-critique-checklist.md` (§3.1).
2. Mark `agent-teams/` deprecated, then coordinated removal + manifest regen (§4).
3. Update stale `product/README.md` re: `technical-preferences.md` (§3.6).

SKILL.md edits (the IDE-FILE-RESOLUTION rewrite) are **explicitly out of scope**
for this story — they are Story A, which consumes §5 above as its input.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Local mapping diverges from upstream aiox-core convention | The mapping prioritizes what resolves to **real files today**. Divergence is documented; if material, propose upstream alignment via @aiox-master. |
| `data`/`scripts` fallback order masks a missing file | Resolver should log when it uses a fallback path so missing-canonical cases surface in diagnostics (Story B concern). |
| `self-critique-checklist.md` divergence causes wrong-copy load | Flagged as PROPOSAL; until reconciled, canonical mapping deterministically selects the `product/` copy — document this in Story A. |

---

## 8. Cross-references

- Epic: `docs/stories/epics/EPIC-agent-determinism/EPIC-agent-determinism.md`
- Story A (consumer): IDE-FILE-RESOLUTION rewrite in all `SKILL.md`
- Story B (consumer): config path determinism
- `core-config.yaml` → `dataLocation`, `scriptsLocation`, `ideSync`
- `.aiox-core/product/README.md`, `.aiox-core/development/README.md`
