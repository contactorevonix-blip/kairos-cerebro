---
name: epic8-phase2-ids
description: EPIC-8 Phase 2 (IDS Enhancement) — 9 stories 8.2.1-8.2.9 validated GO 2026-06-11 (avg 8.3/10). Q1-Q6 architecture resolutions inside.
metadata:
  type: project
---

# EPIC-8 Phase 2: IDS Enhancement — @po Validation (2026-06-11)

Binding PRD: `docs/prd/epic-8/phase-2-ids.md` (sharded). 17sp, Jul 6-19 2026. Closes IDS G6 gate + auto-heal + dashboard + impact graph.

**Verdict: 9/9 GO → all Ready.** Scores: 8.2.1:9 8.2.2:9 8.2.3:8 8.2.4:8 8.2.5:8 8.2.6:9 8.2.7:7 8.2.8:9 8.2.9:8 (avg 8.3). Strongest batch validated for this project — @sm pre-surfaced every arch question, benchmarked vs LIVE registry (823 entities) not stale PRD (474), preserved PRD wording verbatim (Art. IV clean).

**Why:** Phase 2 spec→story handoff; 6 arch questions (Q1-Q6) flagged by @sm needed @po resolution before Ready.
**How to apply:** When these stories reach @dev, the Q-resolutions below are the binding design constraints. None are blockers — all deferred to @architect/@dev at impl time.

## Architecture Resolutions (Q1-Q6)
- **Q1** 8.2.1 depends on 8.2.2 (PRD body authoritative over research table which reversed it). Impl order: 8.2.2 FIRST.
- **Q2** 8.2.4 AC2 `GET /api/ids/entity/{id}/score` IS PRD-required (line 120) — kept, but constrained CLI-first per Art. I (NON-NEGOTIABLE: CLI>Observability>UI). `aiox ids score {id}` primary; REST optional wrapper.
- **Q3** 8.2.5 AC4 `metadata.created_justification` = NEW additive per-entity schema field. VERIFIED: live registry has NO per-entity `metadata` key (only file-level). PRD-required (line 142). No 8.1.1 conflict (8.1.1=metrics schema, not entity-registry). No migration of 823 entities.
- **Q4** 8.2.7 dashboard `localhost:3000/ids` + webhook ARE PRD-required (lines 181/191) — kept, constrained observability-only per Art. I. webhook→file-watch acceptable over `.aiox/gate-logs/*.jsonl`. REUSE `aiox graph --format=html` first.
- **Q5** 8.2.1 = G6 gate logic + local `.husky/pre-push`; 8.2.9 = CI orchestration (`.github/workflows/ids-g6-gate.yml`) + PR comments + verify (not re-impl) pre-push. NOT a duplicate.
- **Q6** CI gate logs via GitHub Actions artifact upload + PR comment (`.aiox/gate-logs/` ephemeral in CI runner); local pre-push JSONL unchanged.

**Escalations: NONE.** Art. IV clean across all 9. Only constitutional tension = Art. I on Q2/Q4, handled as design constraint each story carries.

## Recommended dev waves (respect deps)
W1: 8.2.2 | W2: 8.2.1, 8.2.3, 8.2.6 | W3: 8.2.4 | W4: 8.2.5 | W5: 8.2.7 | W6: 8.2.9 | W7(capstone): 8.2.8

## Key verified facts
- Live `entity-registry.yaml`: 823 entities (NOT 474 per stale PRD/research). Per-entity fields: path, layer, type, purpose, keywords, usedBy, dependencies, externalDeps, plannedDeps, lifecycle, adaptability{score,constraints,extensionPoints}, checksum, lastVerified. NO per-entity `metadata`.
- Constitution Art. I CLI First = NON-NEGOTIABLE: "Dashboards apenas observam, NUNCA controlam". Gate: dev-develop-story.md WARN if UI before CLI.
- 8.1.1 (metrics schema) status=Ready; does NOT touch entity-registry schema.
- Existing REUSE candidates devs should hit first: `aiox graph` / graph-dashboard (`.aiox-core/core/graph-dashboard/`), `gate-logger.cjs`, `populate-entity-registry.js`.

## Closed (2026-06-11)
Step 12 DONE — all 9 stories flipped Draft→Ready + Change Log v1.1 entry per story (with Q-resolution note embedded). Handoff `handoff-epic8-spec-to-stories.yaml` updated: Phase 1 (8 Ready) + Phase 2 (9 Ready) confirmed, Q1-Q6 resolutions embedded as `architecture_resolutions`, dev waves recorded. @po task DONE for Phase 1+2. Phase 3 (8.3.1-8.3.8) + Phase 4 (8.4.1-8.4.4) pending @sm *draft in future session. NOTE: Change Log version used = `1.1` (matches existing `1.0` table scheme, not `1.1.0`).

## Phase 3 boundary blocker RESOLVED (2026-06-11, @po re-path)
4 Phase 3 stories (8.3.1 voice-dna, 8.3.2 thinking-dna, 8.3.3 squad-template-generator, 8.3.5 authority-matrix) had AC1 main module under `.aiox-core/core/squad-creator/` = **L1 Framework Core**. Art. VI-VII boundary gate (`enforce-quality-gates.cjs`, PROTECTED_PREFIXES `.includes('.aiox-core/core/')`) blocks all Write/Edit there, **NON-overridable** at @dev layer. @dev (Dex) correctly refused to contour the gate or self-relocate AC paths (AC = @po-owned spec) and escalated.
**Fix applied:** re-targeted AC1 + File List main-module path from L1 → L4 `squads/squad-creator/core/{module}.js`. Precedent: Task-First engine relocated to L4 for same conflict (Phase 4 1.17–1.19).
**Why:** `squads/` is L4 (ALWAYS modify) — DNA extraction/template-gen logic is identical from L4; squad-creator is project-runtime tooling, not framework core. No AC logic changed, quality score unaffected, all 4 remain Ready.
**How to apply:** Pattern for future Phase 3 stories whose deliverable lands under `.aiox-core/core/` → re-path to `squads/squad-creator/core/` BEFORE @dev, not after. Supporting paths that were already fine and NOT touched: `.aiox/squad-dnas/*` (L4 runtime), `.aiox-core/data/*` ref files (L3, allow-rule mutable), `.aiox-core/development/templates/squad-tmpl.yaml` (L2 read-only, reading permitted). Note: 8.3.4/8.3.6/8.3.7/8.3.8 not in this batch — verify their paths if/when they reach @dev.
