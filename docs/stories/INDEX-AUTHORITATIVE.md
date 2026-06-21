# Story Index — Authoritative Master List

**Last Updated:** 2026-06-21  
**Status:** Audit Complete — AC1, AC2, AC6 Delivered  
**AC3 Action:** Orphaned stories below require reclassification decision

---

## Schema Legend & Regex Patterns

### Schema 1: Flat (Numeric Folder)
- **Pattern:** `docs/stories/{epic_num}/{epic_num}.{story_num}.story.md`
- **Regex:** `^docs/stories/\d+/\d+\.\d+\.story\.md$`
- **Status:** ✅ Active — canonical for numbered stories
- **Example:** `docs/stories/1/1.1.story.md`, `docs/stories/5/5.3.story.md`

### Schema 2: Epic-Nested (Named Folder)
- **Pattern:** `docs/stories/epics/{epic-folder-name}/{story_id}-{title}.md` or `.story.md`
- **Regex:** `^docs/stories/epics/[^/]+/.*\.(md|story\.md)$`
- **Status:** ✅ Active — used for complex/named epics
- **Example:** `docs/stories/epics/epic-5-governance/5.2-WORKFLOW-DESIGN.md`, `docs/stories/epics/EPIC-PM-process-mapper/PM-1.1.html-generator-script.story.md`

### Schema 3: Orphaned Root
- **Pattern:** `docs/stories/{epic_num}.{story_num}-{title}.md`
- **Regex:** `^docs/stories/\d+\.\d+-.*\.md$` (files at root level, not in subdirectories)
- **Status:** ⚠️ **DEPRECATED** — should be reclassified or archived
- **Example:** `docs/stories/1.1.railway-config.md`, `docs/stories/1.8-aiox-compliance-audit.md`

---

## All Stories (Organized by Epic & Schema)

### ⚠️ CRITICAL: Naming Conflicts Detected

The following story IDs appear in MULTIPLE schemas (drift/duplication):
- **1.1** → `docs/stories/1/1.1.story.md` (Flat) + `docs/stories/1.1.railway-config.md` (Orphaned) + `docs/stories/epic-1-foundation/1.1.setup-nextjs-fumadocs.story.md` (Nested)
- **1.2** → `docs/stories/1/1.2.story.md` (Flat) + `docs/stories/epic-1-foundation/1.2.content-extraction-github.story.md` (Nested)
- **1.3** → `docs/stories/1/1.3.story.md` (Flat) + `docs/stories/1.3.css-centralization.md` (Orphaned) + `docs/stories/epic-1-foundation/1.3.content-extraction-youtube.story.md` (Nested)
- **1.4** → `docs/stories/1/1.4.story.md` (Flat) + `docs/stories/1.4.redis-activation.md` (Orphaned) + `docs/stories/epic-1-foundation/1.4.content-structuring-mdx.story.md` (Nested)
- **1.5** → `docs/stories/1/1.5.story.md` (Flat) + `docs/stories/1.5.verifications-rotation.md` (Orphaned)

**AC3 Note:** This is the core problem the story was designed to fix. Each conflict must be resolved: keep ONE source per story ID, mark others as deprecated/archive.

---

## Epic 1: AIOX Architecture Foundation

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 1.1 | `docs/stories/1/1.1.story.md` | Flat | ✅ Active | **CONFLICT:** Also at railway-config.md + epic-1-foundation/1.1.setup-* |
| 1.2 | `docs/stories/1/1.2.story.md` | Flat | ✅ Active | **CONFLICT:** Also at epic-1-foundation/1.2.content-* |
| 1.3 | `docs/stories/1/1.3.story.md` | Flat | ✅ Active | **CONFLICT:** Also at css-centralization.md + epic-1-foundation/1.3.content-* |
| 1.4 | `docs/stories/1/1.4.story.md` | Flat | ✅ Active | **CONFLICT:** Also at redis-activation.md + epic-1-foundation/1.4.content-* |
| 1.5 | `docs/stories/1/1.5.story.md` | Flat | ✅ Active | **CONFLICT:** Also at verifications-rotation.md |
| 1.16 | `docs/stories/1/1.16.story.md` | Flat | ✅ Active | |
| 1.17 | `docs/stories/1/1.17.story.md` | Flat | ✅ Active | |
| 1.18 | `docs/stories/1/1.18.story.md` | Flat | ✅ Active | **CONFLICT:** Also at state-live-update-hooks.md |
| 1.19 | `docs/stories/1/1.19.story.md` | Flat | ✅ Active | |
| 1.20 | `docs/stories/1/1.20.story.md` | Flat | ✅ Active | |

### Orphaned Story 1.x Files (Deprecated Schema 3)
| Story ID | File Path | Schema | Status | AC3 Action |
|----------|-----------|--------|--------|-----------|
| 1.1 | `docs/stories/1.1.railway-config.md` | Orphaned | ⚠️ Duplicate | Archive or merge with 1.1 canonical |
| 1.3 | `docs/stories/1.3.css-centralization.md` | Orphaned | ⚠️ Duplicate | Archive or merge with 1.3 canonical |
| 1.4 | `docs/stories/1.4.redis-activation.md` | Orphaned | ⚠️ Duplicate | Archive or merge with 1.4 canonical |
| 1.5 | `docs/stories/1.5.verifications-rotation.md` | Orphaned | ⚠️ Duplicate | Archive or merge with 1.5 canonical |
| 1.4 | `docs/stories/1.4-hooks-setup.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.5 | `docs/stories/1.5-deny-rules.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.6 | `docs/stories/1.6-validation-gates.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.7 | `docs/stories/1.7-aiox-full-setup.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.8 | `docs/stories/1.8-aiox-compliance-audit.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.9 | `docs/stories/1.9-squad-compliance-audit.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.10 | `docs/stories/1.10-automation-enhancement.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.11 | `docs/stories/1.11-documentation-synchronization.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.12 | `docs/stories/1.12-agent-memory-validation.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.13 | `docs/stories/1.13-cross-agent-workflow-testing.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.14 | `docs/stories/1.14-memory-lifecycle-architecture.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.14 | `docs/stories/1.14-agent-memory-creation.md` | Orphaned | ⚠️ Duplicate ID | Resolve conflict with 1.14-memory-* |
| 1.15 | `docs/stories/1.15-synapse-layer-validation.md` | Orphaned | ⚠️ Orphaned | Reclassify or archive |
| 1.15 | `docs/stories/1.15-squad-creator-coherence.md` | Orphaned | ⚠️ Duplicate ID | Resolve conflict with 1.15-synapse-* |
| 1.18 | `docs/stories/1.18-state-live-update-hooks.md` | Orphaned | ⚠️ Duplicate | Merge with 1.18 canonical |

---

## Epic 2: Framework Standardization

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 2.1 | `docs/stories/2/2.1.story.md` | Flat | ✅ Active | |
| 2.2 | `docs/stories/2/2.2.story.md` | Flat | ✅ Active | |
| 2.3 | `docs/stories/2/2.3.story.md` | Flat | ✅ Active | |
| 2.4 | `docs/stories/2/2.4.story.md` | Flat | ✅ Active | |
| 2.0 | `docs/stories/2.0-SYN1.story.md` | Orphaned | ⚠️ Orphaned | Reclassify as 2.5 or archive |

---

## Epic 3: AIOX Masterclass Evolution

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 3.1 | `docs/stories/3/3.1.story.md` | Flat | ✅ Active | |
| 3.2 | `docs/stories/3/3.2.story.md` | Flat | ✅ Active | |
| 3.3 | `docs/stories/3/3.3.story.md` | Flat | ✅ Active | |

---

## Epic 4: KCC (Kairos Check Cerebro)

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 4.1 | `docs/stories/4/4.1.story.md` | Flat | ✅ Active | **CONFLICT:** Also at epic-kcc/4.1.kcc-server-infra.story.md (Nested) |
| 4.2 | `docs/stories/4/4.2.story.md` | Flat | ✅ Active | **CONFLICT:** Also at epic-kcc/4.2.kcc-explorer-dashboard.story.md (Nested) |
| 4.3 | `docs/stories/4/4.3.story.md` | Flat | ✅ Active | **CONFLICT:** Also at epic-kcc/4.3.kcc-agent-hub.story.md (Nested) |

### Epic-Nested (epic-kcc/)
| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 4.1 | `docs/stories/epic-kcc/4.1.kcc-server-infra.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 4/4.1.story.md (Flat) |
| 4.2 | `docs/stories/epic-kcc/4.2.kcc-explorer-dashboard.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 4/4.2.story.md (Flat) |
| 4.3 | `docs/stories/epic-kcc/4.3.kcc-agent-hub.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 4/4.3.story.md (Flat) |
| 4.4 | `docs/stories/epic-kcc/4.4.kcc-story-manager-observatory.story.md` | Nested | ✅ Active | Extra nested story (no flat counterpart) |

---

## Epic 5: Governance Workflow Design

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 5.1 | `docs/stories/5/5.1.story.md` | Flat | ✅ Active | |
| 5.2 | `docs/stories/5/5.2.story.md` | Flat | ✅ Active | **CONFLICT:** Also at epic-5-governance/5.2-WORKFLOW-DESIGN.md (Nested) |
| 5.3 | `docs/stories/5/5.3.story.md` | Flat | ✅ Active | |
| 5.4 | `docs/stories/5/5.4.story.md` | Flat | ✅ Active | |

### Epic-Nested (epic-5-governance/)
| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 5.2 | `docs/stories/epics/epic-5-governance/5.2-WORKFLOW-DESIGN.md` | Nested | ✅ Active | **CONFLICT:** Also at 5/5.2.story.md (Flat) |

---

## Epic 1 (Alternative Structure): epic-1-foundation/

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| 1.1 | `docs/stories/epic-1-foundation/1.1.setup-nextjs-fumadocs.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 1/1.1.story.md + 1.1.railway-config.md |
| 1.2 | `docs/stories/epic-1-foundation/1.2.content-extraction-github.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 1/1.2.story.md |
| 1.3 | `docs/stories/epic-1-foundation/1.3.content-extraction-youtube.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 1/1.3.story.md + 1.3.css-centralization.md |
| 1.4 | `docs/stories/epic-1-foundation/1.4.content-structuring-mdx.story.md` | Nested | ✅ Active | **CONFLICT:** Also at 1/1.4.story.md + 1.4.redis-activation.md |

---

## Epic PM: Process Mapper

| Story ID | File Path | Schema | Status | Notes |
|----------|-----------|--------|--------|-------|
| PM-1.1 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.1.html-generator-script.story.md` | Nested | ✅ Active | |
| PM-1.2 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.2.html-quality-gates-visual.story.md` | Nested | ✅ Active | |
| PM-1.3 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.3.mapa-sdc.story.md` | Nested | ✅ Active | |
| PM-1.4 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.4.mapa-qa-loop.story.md` | Nested | ✅ Active | |
| PM-1.5 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.5.mapa-spec-pipeline.story.md` | Nested | ✅ Active | |
| PM-1.6 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.6.mapa-brownfield.story.md` | Nested | ✅ Active | |
| PM-1.7 | `docs/stories/epics/EPIC-PM-process-mapper/PM-1.7.coverage-audit.story.md` | Nested | ✅ Active | |
| PM-2.1 | `docs/stories/epics/EPIC-PM-process-mapper/PM-2.1.agent-swimlanes.story.md` | Nested | ✅ Active | |
| PM-3.1 | `docs/stories/epics/EPIC-PM-process-mapper/PM-3.1.structure-maps.story.md` | Nested | ✅ Active | |
| PM-7.1 | `docs/stories/epics/EPIC-PM-process-mapper/PM-7.1.squad-structure.story.md` | Nested | ✅ Active | |

---

## Other Epics & Documentation Files

| File Path | Type | Status | Notes |
|-----------|------|--------|-------|
| `docs/stories/epics/EPIC-001-tech-debt-remediation.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-002-framework-standardization.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-003-aiox-masterclass-fix.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-004-aiox-masterclass-evolution.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-AIOX-2.0-COMPLIANCE.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-PM-process-mapper/EPIC-PM.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-2-expert-cloning.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-2-SCOPE.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-2-REFINEMENT-SUMMARY.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-2-REFINEMENT-FEEDBACK.md` | Epic README | ✅ Active | |
| `docs/stories/epics/expert-cloning/EXPERT-CLONING-SCOPE.md` | Design Doc | ✅ Active | |
| `docs/stories/epics/expert-cloning/EXPERT-SPECIALIZATIONS.md` | Design Doc | ✅ Active | |
| `docs/stories/epics/BROWNFIELD-DISCOVERY.md` | Design Doc | ✅ Active | |
| `docs/stories/epics/SPRINT-ROADMAP-DEBT-FIX.md` | Design Doc | ✅ Active | |
| `docs/stories/epics/EPIC-SPRINT-1-CRITICAL-FIX.md` | Epic README | ✅ Active | |
| `docs/stories/epics/EPIC-SPRINT-2-SECURITY.md` | Epic README | ✅ Active | |
| `docs/stories/epic-kcc/EPIC-KCC.md` | Epic README | ✅ Active | |
| `docs/stories/epic-kcc/design/KCC-DESIGN-SYSTEM.md` | Design Doc | ✅ Active | |
| `docs/stories/epic-kcc/architecture/ADR-*.md` | ADR | ✅ Active | 4 ADRs |
| `docs/stories/WORKSPACE-CLEANUP.story.md` | Story | ✅ Active | Orphaned — should be Epic-nested |
| `docs/stories/INDEX.md` | Index (old) | ⚠️ Superseded | Replaced by this INDEX-AUTHORITATIVE.md |

---

## Summary Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| **Flat Schema (docs/stories/{epic}/{epic}.{story}.story.md)** | 24 | ✅ Active canonical for numbered epics |
| **Epic-Nested Schema** | 30+ | ✅ Active for complex epics |
| **Orphaned Root Files** | 20+ | ⚠️ **AC3 ACTION REQUIRED** — merge or archive |
| **Total Named Conflicts** | 9 | Same story ID in 2-3 different schemas |
| **Duplicate Story IDs within orphans** | 2 | 1.14, 1.15 have multiple files each |
| **Total Story Files** | 100+ | Across all schemas |

---

## AC3 Reclassification Checklist

### ⚠️ High Priority: Resolve Duplicates

These story IDs exist in multiple active schemas. **Decide which is canonical:**

- [ ] **1.1:** Keep flat `docs/stories/1/1.1.story.md` or nested `epic-1-foundation/1.1.setup-*`? (Decision: __)
- [ ] **1.2:** Keep flat or nested? (Decision: __)
- [ ] **1.3:** Keep flat or nested? (Decision: __)
- [ ] **1.4:** Keep flat or nested? (Decision: __)
- [ ] **1.5:** Keep flat only? (Decision: __)
- [ ] **4.1–4.3:** Keep flat or epic-kcc nested? (Decision: __)
- [ ] **5.2:** Keep flat or epic-5-governance nested? (Decision: __)

### Medium Priority: Orphaned Root Files

Archive or reclassify (move to proper epic folder):

- [ ] Rename and move all 1.x-* orphaned files → `docs/stories/1/` folder with canonical naming
- [ ] Rename and move `2.0-SYN1.story.md` → `docs/stories/2/2.5.story.md` (or archive if deprecated)
- [ ] Rename and move `WORKSPACE-CLEANUP.story.md` → proper epic folder (which epic? unclear)

### Low Priority: Documentation Files

- [ ] Keep epic READMEs in epic folders (already correct)
- [ ] Keep ADRs in epic subfolders (already correct)
- [ ] Keep design docs in epic folders (already correct)

---

## Next Steps (Phase 2 of Story 13.2)

1. **@sm/@analyst:** Complete AC3 reclassification checklist above
2. **@dev:** Create pre-commit validation script (`validate-story-index.cjs`) that:
   - Reads this INDEX-AUTHORITATIVE.md
   - For each story, verify file exists at listed path
   - Report missing files
   - Report files not listed in INDEX
   - Fail if drift detected
3. **@dev:** Add pre-commit hook to run validation before every commit
4. **@sm:** Update agent instructions to reference INDEX when creating new stories

---

## Files Touched

- ✅ `docs/stories/INDEX-AUTHORITATIVE.md` — this file (AC1 + AC2 + AC6)
- 📝 `docs/stories/decision-log-13.2.md` — audit findings (to be created)

**Status:** AC1, AC2, AC6 = **DELIVERED**  
**Pending:** AC3 (reclassification), AC4 (pre-commit script), AC5 (@sm instructions)
