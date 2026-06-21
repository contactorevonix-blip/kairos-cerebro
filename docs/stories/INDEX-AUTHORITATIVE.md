# Story Index — Authoritative Master List

**Created:** 2026-06-21
**Owner:** @sm (River) / @analyst
**Source Story:** [13.2 — Story Numbering Authority Index](13.2.story-numbering-index.story.md) (EPIC-13: AIOX Setup Consolidation & Gap Resolution)
**Audit method:** Recursive scan of `docs/stories/**/*.md` (252 files audited, 2026-06-21)

> This file is the **single source of truth** for "does story X.Y exist, and where?"
> If a file under `docs/stories/` is not listed here, it is drift — run `npm run validate-story-index` to detect it.

---

## 1. Schema Legend

Three coexisting naming schemas were found in `docs/stories/`. None has been deprecated; all three are currently in active use by different epics/eras of the project.

### Schema A — Flat-root with dotted ID

**Pattern:** `docs/stories/{epic}.{story}.{slug?}.story.md` or `docs/stories/{epic}.{story}-{slug}.md`
**Regex:** `^docs/stories/(\d+(?:\.\d+){1,2})[.\-][^/]*\.(?:story\.)?md$`
**Examples:**
- `docs/stories/6.1.story.md`
- `docs/stories/8.1.1.story.md` (3-segment ID: epic.phase.story)
- `docs/stories/13.2.story-numbering-index.story.md`
- `docs/stories/1.8-aiox-compliance-audit.md`

### Schema B — Flat numbered subfolder

**Pattern:** `docs/stories/{epic}/{epic}.{story}.story.md`
**Regex:** `^docs/stories/(\d+)/\1\.(\d+)\.story\.md$`
**Examples:**
- `docs/stories/1/1.1.story.md`
- `docs/stories/5/5.3.story.md`

### Schema C — Epic-nested (named folder)

**Pattern:** `docs/stories/epics/{epic-folder}/{story-id}-{title}.md` or `docs/stories/{epic-folder}/{story-id}.{title}.story.md`
**Regex:** `^docs/stories/(?:epics/)?[a-zA-Z][^/]*/(\d+(?:\.\d+)*)[.\-][^/]*\.(?:story\.)?md$`
**Examples:**
- `docs/stories/epics/epic-5-governance/5.2-WORKFLOW-DESIGN.md`
- `docs/stories/epic-kcc/4.1.kcc-server-infra.story.md`
- `docs/stories/epic-1-foundation/1.1.setup-nextjs-fumadocs.story.md`
- `docs/stories/epics/EPIC-PM-process-mapper/PM-1.1.html-generator-script.story.md` (prefixed ID: `PM-1.1`)
- `docs/stories/_archive/EPIC-12-agent-testing/12.1.story.md` (archived variant of Schema C)

### Schema D — Orphaned / Ambiguous (matches none cleanly, or matches >1)

Anything not cleanly matching A/B/C, including:
- Root-level non-numbered docs (`INDEX.md`, `WORKSPACE-CLEANUP.story.md`, `decision-log-13.1.md`)
- Files where the SAME numeric ID exists in 2+ schemas simultaneously (see [Section 3 — ID Collisions](#3-id-collisions-critical))

---

## 2. Full Story Map (by Epic Number)

> Status pulled directly from each file's Status field at audit time (2026-06-21). Where ambiguous status text was used (e.g. "Done (QA Approved)", "Ready for Review"), the raw text is preserved.

### Epic 1 — multiple distinct lineages (see collisions)

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 1.1 | `docs/stories/1/1.1.story.md` | B | Done | Monitor Core lineage (EPIC-1: Monitor Core) |
| 1.1 | `docs/stories/1.1.railway-config.md` | A | Done | Kairos Check product lineage (Railway config) |
| 1.1 | `docs/stories/epic-1-foundation/1.1.setup-nextjs-fumadocs.story.md` | C | Done | Docs-site foundation lineage |
| 1.2 | `docs/stories/1/1.2.story.md` | B | Done | Monitor Core lineage |
| 1.2 | `docs/stories/1.2.counter-fix.md` | A | Ready | Kairos Check product lineage |
| 1.2 | `docs/stories/epic-1-foundation/1.2.content-extraction-github.story.md` | C | InReview | Docs-site foundation lineage |
| 1.3 | `docs/stories/1/1.3.story.md` | B | Done | Monitor Core lineage |
| 1.3 | `docs/stories/1.3.css-centralization.md` | A | Draft | Kairos Check product lineage |
| 1.3 | `docs/stories/epic-1-foundation/1.3.content-extraction-youtube.story.md` | C | Ready | Docs-site foundation lineage |
| 1.4 | `docs/stories/1/1.4.story.md` | B | Draft | Monitor Core lineage ("30-Day Archival Job") |
| 1.4 | `docs/stories/1.4-hooks-setup.md` | A | DONE | PHASE 4 tech-debt lineage |
| 1.4 | `docs/stories/1.4.redis-activation.md` | A | Draft | Kairos Check product lineage |
| 1.4 | `docs/stories/epic-1-foundation/1.4.content-structuring-mdx.story.md` | C | Ready | Docs-site foundation lineage |
| 1.5 | `docs/stories/1/1.5.story.md` | B | Draft | Monitor Core lineage ("Monitor API") |
| 1.5 | `docs/stories/1.5-deny-rules.md` | A | DONE | PHASE 4 tech-debt lineage |
| 1.5 | `docs/stories/1.5.verifications-rotation.md` | A | Draft | Kairos Check product lineage |
| 1.6 | `docs/stories/1.6-validation-gates.md` | A | Ready for Review | PHASE 4 tech-debt lineage |
| 1.7 | `docs/stories/1.7-aiox-full-setup.md` | A | Done | PHASE 4 tech-debt lineage |
| 1.8 | `docs/stories/1.8-aiox-compliance-audit.md` | A | Done | PHASE 4 tech-debt lineage |
| 1.9 | `docs/stories/1.9-squad-compliance-audit.md` | A | Done (QA Approved) | PHASE 4 tech-debt lineage |
| 1.10 | `docs/stories/1.10-automation-enhancement.md` | A | Done (QA Approved) | PHASE 4 tech-debt lineage |
| 1.11 | `docs/stories/1.11-documentation-synchronization.md` | A | Done (QA Approved) | PHASE 4 tech-debt lineage |
| 1.12 | `docs/stories/1.12-agent-memory-validation.md` | A | Done (QA Approved) | PHASE 4 tech-debt lineage |
| 1.13 | `docs/stories/1.13-cross-agent-workflow-testing.md` | A | Done (QA Approved) | PHASE 4 tech-debt lineage |
| 1.14 | `docs/stories/1.14-agent-memory-creation.md` | A | InReview | PHASE 4 lineage — "Create Agent MEMORY.md Files" |
| 1.14 | `docs/stories/1.14-memory-lifecycle-architecture.md` | A | InReview | PHASE 4 Tech Debt lineage — "Agent MEMORY.md Lifecycle Architecture" (DIFFERENT story, same ID) |
| 1.15 | `docs/stories/1.15-squad-creator-coherence.md` | A | Ready | PHASE 4 lineage — "Fix Squad-Creator Coherence" |
| 1.15 | `docs/stories/1.15-synapse-layer-validation.md` | A | Draft → Ready | DIFFERENT story, same ID — "Synapse Layer Validation" |
| 1.16 | `docs/stories/1/1.16.story.md` | B | Done | — |
| 1.17 | `docs/stories/1/1.17.story.md` | B | Done | — |
| 1.18 | `docs/stories/1/1.18.story.md` | B | Ready | — |
| 1.18 | `docs/stories/1.18-state-live-update-hooks.md` | A | Done | PHASE 4 lineage — DIFFERENT story, same ID |
| 1.19 | `docs/stories/1/1.19.story.md` | B | Done | "Fix Claude-Code-Mastery Coherence" |
| 1.19 | `docs/stories/1.19-epic-aiox-rastreabilidade.md` | A | Draft → Ready | This is actually an EPIC, not a story (mislabeled ID) |
| 1.20 | `docs/stories/1/1.20.story.md` | B | Done | "Handoff Consolidation Automation" |

### Epic 2 — multiple distinct lineages

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 2.0 | `docs/stories/2.0-SYN1-foundation-unblocking.md` | A | InProgress | SYN1 lineage |
| 2.0 | `docs/stories/2.0-SYN1.story.md` | A | Done | SYN1 lineage — possible duplicate/supersede of above |
| 2.1 | `docs/stories/2/2.1.story.md` | B | Draft | Control Core lineage |
| 2.1 | `docs/stories/2.1.synapse-hook-entry-point.md` | A | Done | SYNAPSE lineage |
| 2.2 | `docs/stories/2/2.2.story.md` | B | Draft | Control Core lineage |
| 2.2 | `docs/stories/2.2.commands-skills-sync.md` | A | Done | SYNAPSE lineage |
| 2.3 | `docs/stories/2/2.3.story.md` | B | Draft | Control Core lineage |
| 2.3 | `docs/stories/2.3.squad-structure-fixes.md` | A | Done | SYNAPSE lineage |
| 2.4 | `docs/stories/2/2.4.story.md` | B | Draft | Control Core lineage |
| 2.4 | `docs/stories/2.4.base-templates-sync.md` | A | Done | SYNAPSE lineage |
| 2.5 | `docs/stories/2.5.synapse-alan-nicolas-domain.md` | A | Done | SYNAPSE lineage |

### Epic 3 — multiple distinct lineages

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 3.1 | `docs/stories/3/3.1.story.md` | B | Draft | Data Durability lineage |
| 3.1 | `docs/stories/3.1.masterclass-fix-syntaxerror.md` | A | Done | Masterclass fix lineage |
| 3.2 | `docs/stories/3/3.2.story.md` | B | Draft | Data Durability lineage |
| 3.2 | `docs/stories/3.2.masterclass-fix-duplicate-ids.md` | A | Done | Masterclass fix lineage |
| 3.3 | `docs/stories/3/3.3.story.md` | B | Draft | Data Durability lineage |
| 3.3 | `docs/stories/3.3.masterclass-complete-missing-lessons.md` | A | Done | Masterclass fix lineage |
| 3.4 | `docs/stories/3.4.kairos-dashboard-live.md` | A | Done | Masterclass / dashboard lineage |
| 3.5 | `docs/stories/3.5.masterclass-chatbot-dashboard-improvements.md` | A | Done | Masterclass lineage |

### Epic 4

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 4.1 | `docs/stories/4/4.1.story.md` | B | Draft | CLI + Config lineage |
| 4.1 | `docs/stories/epic-kcc/4.1.kcc-server-infra.story.md` | C | Done | EPIC-KCC lineage |
| 4.2 | `docs/stories/4/4.2.story.md` | B | Draft | CLI + Config lineage |
| 4.2 | `docs/stories/epic-kcc/4.2.kcc-explorer-dashboard.story.md` | C | Ready | EPIC-KCC lineage |
| 4.3 | `docs/stories/4/4.3.story.md` | B | Draft | CLI + Config lineage |
| 4.3 | `docs/stories/epic-kcc/4.3.kcc-agent-hub.story.md` | C | (unread) | EPIC-KCC lineage |
| 4.4 | `docs/stories/epic-kcc/4.4.kcc-story-manager-observatory.story.md` | C | (unread) | EPIC-KCC lineage |

### Epic 5

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 5.1 | `docs/stories/5/5.1.story.md` | B | Draft | UI Layer lineage |
| 5.1 | `docs/stories/5.1-hook-automation-audit.md` | A | Ready | AIOX-OPS lineage |
| 5.2 | `docs/stories/5/5.2.story.md` | B | Draft | UI Layer lineage |
| 5.2 | `docs/stories/5/5.2.sync-complete.md` | B (variant) | Done | Sync report, not a story — should not carry story ID |
| 5.2 | `docs/stories/5.2-script-lifecycle-testing.md` | A | Ready | AIOX-OPS lineage |
| 5.2 | `docs/stories/epics/epic-5-governance/5.2-WORKFLOW-DESIGN.md` | C | Design Complete | Governance lineage — third 5.2 |
| 5.3 | `docs/stories/5/5.3.story.md` | B | Draft | UI Layer lineage |
| 5.3 | `docs/stories/5/5.3-governance-hooks.story.md` | B (variant) | Ready | DIFFERENT story than 5/5.3.story.md, same folder |
| 5.3 | `docs/stories/5.3-workflow-engine-activation.md` | A | Ready | AIOX-OPS lineage |
| 5.3.1 | `docs/stories/5.3.1.story.md` | A | Done | — |
| 5.3.2 | `docs/stories/5.3.2.story.md` | A | InReview | — |
| 5.3.3 | `docs/stories/5.3.3.story.md` | A | Done | — |
| 5.3.3 | `docs/stories/5.3.3-dev-review.md` | A (variant) | Implementation complete, awaiting @dev review | Dev-review companion doc, not a separate story |
| 5.3.4 | `docs/stories/5.3.4.story.md` | A | Done | — |
| 5.4 | `docs/stories/5/5.4.story.md` | B | Draft | UI Layer lineage |
| 5.4 | `docs/stories/5.4.story.md` | A | Draft | Flat-root duplicate of above (same epic numbering, different file) |
| 5.4 | `docs/stories/5.4-agent-handoff-automation.md` | A | Draft | AIOX-OPS lineage — third 5.4 |
| 5.5 | `docs/stories/5.5-cli-completeness.md` | A | Ready | AIOX-OPS lineage |
| 5.6 | `docs/stories/5.6-zero-setup-carregamento.md` | A | Ready | AIOX-OPS lineage |
| 5.7 | `docs/stories/5.7-gap-discovery-aiox-operacional.md` | A | Ready | AIOX-OPS lineage |
| 5.8 | `docs/stories/5.8-epic-delivery-validation.md` | A | Ready | AIOX-OPS lineage |

### Epic 6 — single lineage, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 6.1 | `docs/stories/6.1.story.md` | A | Ready |
| 6.2 | `docs/stories/6.2.story.md` | A | Ready |
| 6.3 | `docs/stories/6.3.story.md` | A | Ready |
| 6.4 | `docs/stories/6.4.story.md` | A | Ready |
| 6.5 | `docs/stories/6.5.story.md` | A | Ready |
| 6.6 | `docs/stories/6.6.story.md` | A | Ready |
| 6.7 | `docs/stories/6.7.story.md` | A | Ready |
| 6.8 | `docs/stories/6.8.story.md` | A | Ready |
| 6.9 | `docs/stories/6.9.story.md` | A | Ready |
| 6.10 | `docs/stories/6.10.story.md` | A | Done |

### Epic 7 — single lineage, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 7.1 | `docs/stories/7.1.story.md` | A | Draft |
| 7.2 | `docs/stories/7.2.story.md` | A | Done |
| 7.3 | `docs/stories/7.3.story.md` | A | Ready for Review |
| 7.4 | `docs/stories/7.4.story.md` | A | InReview |
| 7.5 | `docs/stories/7.5.story.md` | A | Done |
| 7.6 | `docs/stories/7.6.story.md` | A | Ready |
| 7.7 | `docs/stories/7.7.story.md` | A | Ready for Review |
| 7.8 | `docs/stories/7.8.story.md` | A | Draft |
| 7.9 | `docs/stories/7.9.story.md` | A | Done |
| 7.10 | `docs/stories/7.10.story.md` | A | InReview |
| 7.11 | `docs/stories/7.11.story.md` | A | Done |
| 7.12 | `docs/stories/7.12.story.md` | A | Done |
| 7.13 | `docs/stories/7.13.story.md` | A | Ready for Review |
| 7.14 | `docs/stories/7.14.story.md` | A | Ready for Review |

### Epic 8 — single lineage, no collisions (multi-phase IDs)

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 8.1.1–8.1.8 | `docs/stories/8.1.{1..8}.story.md` | A | Ready (all 8) |
| 8.2.1–8.2.9 | `docs/stories/8.2.{1..9}.story.md` | A | Ready (all 9) |
| 8.3.1–8.3.8 | `docs/stories/8.3.{1..8}.story.md` | A | Done (all 8) |
| 8.4.1–8.4.4 | `docs/stories/8.4.{1..4}.story.md` | A | Done (all 4) |

### Epic 9 — single lineage, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 9.1 | `docs/stories/9.1.story.md` | A | Done |
| 9.2 | `docs/stories/9.2.story.md` | A | InReview |
| 9.3 | `docs/stories/9.3.story.md` | A | InReview |
| 9.4 | `docs/stories/9.4.story.md` | A | InReview |
| 9.5 | `docs/stories/9.5.story.md` | A | InReview |

### Epic 10 — single lineage, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 10.1 | `docs/stories/10.1.story.md` | A | Done |
| 10.2 | `docs/stories/10.2.story.md` | A | Done |
| 10.3 | `docs/stories/10.3.story.md` | A | Done |

### Epic 11 — single lineage, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 11.1 | `docs/stories/11.1.story.md` | A | Done |
| 11.2 | `docs/stories/11.2.story.md` | A | Done |
| 11.3 | `docs/stories/11.3.story.md` | A | Ready |
| 11.4 | `docs/stories/11.4.story.md` | A | Ready |
| 11.5 | `docs/stories/11.5.story.md` | A | Ready |
| 11.6 | `docs/stories/11.6.story.md` | A | Ready |
| 11.7 | `docs/stories/11.7.story.md` | A | Ready |
| 11.8 | `docs/stories/11.8.story.md` | A | Ready |
| 11.9 | `docs/stories/11.9.story.md` | A | Ready |

### Epic 12 — active + archived parallel copies (intentional, not drift)

| ID | Path | Schema | Status | Notes |
|----|------|--------|--------|-------|
| 12.1–12.14 | `docs/stories/12.{1..14}.story.md` | A | Done (all 14) | Active/canonical copies |
| 12.1–12.12, 12.G1–12.G3 | `docs/stories/_archive/EPIC-12-agent-testing/12.*.story.md` | C (archive variant) | Done (12.1–12.12), Ready (G1, G2), Draft (G3) | Archived superseded versions — co-existing by design, prefixed by `_archive/` folder so not true collisions |

### Epic 13 — CRITICAL collisions (two distinct EPIC-13 definitions)

Two separate epic documents both claim the "EPIC-13" number with overlapping 13.1–13.7 story IDs:
- **EPIC-13-PRD.md** ("Full Context Determinism") — older, 13.1–13.10, mostly Done
- **EPIC-13.md** ("AIOX Setup Consolidation & Gap Resolution", created 2026-06-21 by @pm) — newer, 13.1–13.7, mostly Ready

| ID | Path | Schema | Status | Lineage |
|----|------|--------|--------|---------|
| 13.1 | `docs/stories/13.1.story.md` | A | Done | EPIC-13-PRD ("Full Context Determinism" lineage) |
| 13.1 | `docs/stories/13.1.agent-shim-consolidation.story.md` | A | Done | EPIC-13.md ("Agent Definition Shim Consolidation") |
| 13.2 | `docs/stories/13.2.story.md` | A | Done | EPIC-13-PRD ("Load Agent Definitions + Cache", 6sp) |
| 13.2 | `docs/stories/13.2.story-numbering-index.story.md` | A | Ready | EPIC-13.md ("Story Numbering Authority Index", 5sp) — **this story** |
| 13.3 | `docs/stories/13.3.story.md` | A | Ready | EPIC-13-PRD lineage |
| 13.3 | `docs/stories/13.3.ideSync-drift-verification.story.md` | A | Ready | EPIC-13.md ("ideSync Drift Verification") |
| 13.4 | `docs/stories/13.4.story.md` | A | Ready | EPIC-13-PRD lineage |
| 13.4 | `docs/stories/13.4.rules-load-order-matrix.story.md` | A | Ready | EPIC-13.md ("Rules Load Order Matrix") |
| 13.5 | `docs/stories/13.5.story.md` | A | Ready | EPIC-13-PRD lineage |
| 13.5 | `docs/stories/13.5.story-orphan-audit.story.md` | A | Ready | EPIC-13.md ("Story Orphan Audit & Reclassification") |
| 13.6 | `docs/stories/13.6.story.md` | A | Ready | EPIC-13-PRD lineage |
| 13.6 | `docs/stories/13.6.constitution-hook-verification.story.md` | A | Ready | EPIC-13.md ("Constitution Hook Verification") |
| 13.7 | `docs/stories/13.7.story.md` | A | Ready | EPIC-13-PRD lineage |
| 13.7 | `docs/stories/13.7.synapse-l1-l4-boundary.story.md` | A | Ready | EPIC-13.md ("Synapse L1/L4 Responsibility Boundary") |
| 13.8 | `docs/stories/13.8.story.md` | A | Ready | EPIC-13-PRD lineage only (EPIC-13.md stops at 13.7) |
| 13.9 | `docs/stories/13.9.story.md` | A | Ready | EPIC-13-PRD lineage only |
| 13.10 | `docs/stories/13.10.story.md` | A | Ready | EPIC-13-PRD lineage only |

> **See [Section 3](#3-id-collisions-critical) for resolution recommendation.**

### EPIC-PM (process-mapper) — prefixed schema, no collisions

| ID | Path | Schema | Status |
|----|------|--------|--------|
| PM-1.1 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.1.html-generator-script.story.md` | C | (unread) |
| PM-1.2 | `.../PM-1.2.html-quality-gates-visual.story.md` | C | (unread) |
| PM-1.3 | `.../PM-1.3.mapa-sdc.story.md` | C | (unread) |
| PM-1.4 | `.../PM-1.4.mapa-qa-loop.story.md` | C | (unread) |
| PM-1.5 | `.../PM-1.5.mapa-spec-pipeline.story.md` | C | (unread) |
| PM-1.6 | `.../PM-1.6.mapa-brownfield.story.md` | C | (unread) |
| PM-1.7 | `.../PM-1.7.coverage-audit.story.md` | C | (unread) |
| PM-2.1 | `.../PM-2.1.agent-swimlanes.story.md` | C | (unread) |
| PM-3.1 | `.../PM-3.1.structure-maps.story.md` | C | (unread) |
| PM-7.1 | `.../PM-7.1.squad-structure.story.md` | C | (unread) |

### EPIC-XX (placeholder epic, awaiting real number)

| ID | Path | Schema | Status |
|----|------|--------|--------|
| XX.1 | `docs/stories/epics/epic-xx/XX.1-agent-sync-validator.md` | C | Cancelled |
| XX.2 | `docs/stories/epics/epic-xx/XX.2-authority-enforcement.md` | C | InProgress |
| XX.3 | `docs/stories/epics/epic-xx/XX.3-workflow-chains-router.md` | C | InProgress |

> `XX` is a deliberate placeholder prefix (not a number) — does not collide with numeric schemas, but MUST be renumbered to a real epic before these stories leave InProgress.

### EPIC-1-foundation (docs-site) — Schema C, see Epic 1 collisions above

| ID | Path | Schema | Status |
|----|------|--------|--------|
| 1.1 | `docs/stories/epic-1-foundation/1.1.setup-nextjs-fumadocs.story.md` | C | Done |
| 1.2 | `docs/stories/epic-1-foundation/1.2.content-extraction-github.story.md` | C | InReview |
| 1.3 | `docs/stories/epic-1-foundation/1.3.content-extraction-youtube.story.md` | C | Ready |
| 1.4 | `docs/stories/epic-1-foundation/1.4.content-structuring-mdx.story.md` | C | Ready |

### Other (non-story documents living under `docs/stories/`)

| Path | Type | Notes |
|------|------|-------|
| `docs/stories/INDEX.md` | Index (different scope) | Index for "KAIROS_CEREBRO Monitor Control Plane" PRD — NOT this INDEX-AUTHORITATIVE. Kept as-is; scoped to its own PRD. |
| `docs/stories/WORKSPACE-CLEANUP.story.md` | Story (non-numeric ID) | Done. Valid story, intentionally non-numeric. |
| `docs/stories/decision-log-13.1.md` | Decision log | Companion doc to Story 13.1, not a story itself. |
| `docs/stories/EPIC-FRAMEWORK-HARDENING.md` | Epic doc | Created Cont 70, no stories drafted yet. |
| `docs/stories/epic-kcc/architecture/ADR-*.md` (4 files) | ADRs | Architecture decisions for EPIC-KCC, not stories. |
| `docs/stories/epic-kcc/design/KCC-DESIGN-SYSTEM.md` | Design doc | Not a story. |
| `docs/stories/epics/*.md` (epic definitions, PRDs, requirements, scope docs) | Epic-level docs | ~25 files — epic/PRD-level, not individual stories. Out of scope for story-ID collision analysis. |
| `docs/stories/epics/epic-5-governance/outputs/*.md` | Workflow outputs | Reports, not stories. |
| `docs/stories/5/5.2.sync-complete.md` | Sync report | Lives inside a story-numbered folder but is not itself a story — flagged as schema-ambiguous. |
| `docs/stories/5.3.3-dev-review.md` | Dev review companion | Companion to 5.3.3.story.md, not a separate story. |

---

## 3. ID Collisions (CRITICAL)

**26+ distinct story IDs have 2 or more files claiming them** (excluding intentional `_archive/` copies). This is the core problem Story 13.2 exists to solve.

| ID | # Files | Severity | Recommended Resolution |
|----|---------|----------|------------------------|
| 1.1, 1.2, 1.3 | 3 each | HIGH | Three unrelated products/epics share these IDs (Monitor Core, Kairos Check, Docs-site). Recommend prefixing non-AIOX-framework products' stories (e.g. `KC-1.1` for Kairos Check, `DOCS-1.1` for docs-site) so framework epics keep plain numeric IDs. |
| 1.4, 1.5 | 3 each | HIGH | Same as above plus PHASE 4 tech-debt lineage. |
| 1.14, 1.15, 1.18 | 2 each | MEDIUM | Same epic number, different unrelated stories — both PHASE 4 lineage. Needs manual disambiguation/renumbering within PHASE 4 epic. |
| 1.19 | 2 | MEDIUM | One is an epic mislabeled with a story-style ID (`1.19-epic-aiox-rastreabilidade.md`) — should be renamed to an `EPIC-*` filename, not a story ID. |
| 2.0–2.5 | 2 each | HIGH | Control Core (Schema B) vs SYNAPSE (Schema A) — fully distinct epics overloading "EPIC-2". |
| 3.1–3.3 | 2 each | HIGH | Data Durability (Schema B) vs Masterclass fixes (Schema A) — fully distinct epics overloading "EPIC-3". |
| 4.1–4.3 | 2 each | HIGH | CLI+Config (Schema B) vs EPIC-KCC (Schema C) overloading "EPIC-4". |
| 5.1–5.4 | 2–3 each | HIGH | UI Layer (Schema B) vs AIOX-OPS (Schema A) vs Governance (Schema C) vs a third flat-root 5.4 — multiple lineages over "EPIC-5". |
| **13.1–13.7** | **2 each** | **CRITICAL** | Two entire epic documents (`EPIC-13-PRD.md` and `EPIC-13.md`) both claim "EPIC-13" independently, with non-overlapping content but colliding IDs 13.1–13.7. **This is the collision that motivated Story 13.2 itself.** |

### Recommended resolution (documented for @pm / @architect — NOT executed by this story, which is audit/index-only per Scope)

1. **EPIC-13 rename:** One of the two EPIC-13 documents must be renumbered. Recommend renumbering `EPIC-13.md` ("AIOX Setup Consolidation & Gap Resolution", created 2026-06-21, currently mostly Backlog/Ready) to **EPIC-14**, since `EPIC-13-PRD.md` ("Full Context Determinism") has stories already Done (13.1, 13.2) and is further along. This is a Phase-1-blocking decision — flag to @pm before any more EPIC-13.md stories are implemented.
2. **Non-framework products (Kairos Check, EPIC-KCC, docs-site, Masterclass):** introduce a product prefix on new stories going forward (e.g. `KC-`, `KCC-` already partially used, `DOCS-`) to stop colliding with the core AIOX framework's epic numbering.
3. **PHASE 4 internal collisions (1.14, 1.15, 1.18, 1.19):** renumber the duplicate within PHASE 4 epic directly (low risk, single-epic scope).

---

## 4. Validation

This index is enforced by `scripts/validate-story-index.js` (`npm run validate-story-index`), which:
1. Parses every file path listed in Section 2 of this document.
2. Recursively scans `docs/stories/**/*.md` on disk.
3. Fails (exit 1) if:
   - A file exists on disk but is not listed in this INDEX (**undocumented drift**).
   - A file is listed in this INDEX but no longer exists on disk (**stale entry**).
4. Does NOT fail on documented collisions (Section 3) — those are known and tracked, not drift.

Run before every story-related commit:

```bash
npm run validate-story-index
```

See also: `.claude/rules/story-lifecycle.md` and the @sm workflow note in `.claude/commands/AIOX/agents/sm.md` (Section "Before creating a new story").

---

## 5. Maintenance

- **When @sm creates a new story:** add a row to the relevant epic section above (or a new section) BEFORE committing, then re-run `npm run validate-story-index` to confirm zero drift.
- **When a story moves status:** update only the Status column here — do not duplicate full story content into this index.
- **When a story file moves or is renamed:** update its Path here in the same commit.
- **When this index gets too large to scan visually (500+ stories):** consider splitting per-epic into `docs/stories/INDEX-AUTHORITATIVE/{epic}.md` with this file becoming a table-of-contents. Not needed at current scale (252 files).

---

*Audit completed by @sm (River) — 2026-06-21. Source: Story 13.2 (EPIC-13: AIOX Setup Consolidation & Gap Resolution).*
