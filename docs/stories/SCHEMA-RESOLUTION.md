# Story Numbering Schema Resolution

**Status:** Research Document (supports EPIC-13.2 implementation)  
**Created:** 2026-06-21  
**Owner:** @architect (mapping) + @sm (execution via 13.2)  
**Data Source:** Audit 2026-06-21 (deterministic glob audit)

---

## Executive Summary

3 incompatible schema coexist in `docs/stories/`, preventing @sm from validating story existence unambiguously. This document maps all ~130+ stories across schemas and defines resolution strategy.

**Resolution:** Migrate all to Schema 2 (Epic-Nested), archive Schema 1, cleanup Schema 3.

---

## Current State — 3 Schemas Coexist

### Schema 1: Flat Numbering (Root)
**Location:** `docs/stories/{N}.{M}*.md`  
**Count:** ~80 files  
**Status:** TRANSITIONAL → ARCHIVE  
**Pattern:** `{EPIC}.{STORY}.story.md` or `{EPIC}.{STORY}-{descriptor}.md`

**Examples:**
```
docs/stories/1.1.railway-config.md
docs/stories/1.2.counter-fix.md
docs/stories/1.3.css-centralization.md
docs/stories/1.4.redis-activation.md
...
docs/stories/8.4.2.story.md
docs/stories/8.4.1.story.md
```

**Issues:**
- No clear EPIC folder association
- Duplicates possible (1.8.story.md vs 1.8-*.md variations)
- Orphaned files in root (not nested)
- Hard to validate: "does story 5.3.1 exist?" (need glob pattern)

---

### Schema 2: Epic-Nested (Canonical)
**Location:** `docs/stories/epics/EPIC-{N}/*` + `docs/stories/epics/EPIC-{N}/{N}.{M}.story.md`  
**Count:** ~40 EPICs + nested stories  
**Status:** CANONICAL (going forward)  
**Pattern:** Hierarchical, EPIC folder contains stories

**Examples:**
```
docs/stories/epics/EPIC-001-tech-debt-remediation.md
docs/stories/epics/EPIC-001/
docs/stories/epics/EPIC-013-PRD.md
docs/stories/epics/EPIC-013.md
docs/stories/epics/EPIC-13/13.1-agent-sync-validator.md
docs/stories/epics/EPIC-13/13.2-story-index.md
```

**Advantages:**
- EPIC context always explicit
- Folder structure mirrors story hierarchy
- Clear location rule: story lives in its EPIC folder
- Easy validation: check EPIC-folder existence

---

### Schema 3: Orphaned / Misclassified (Root)
**Location:** `docs/stories/{orphaned-name}.md`  
**Count:** ~15 files  
**Status:** TO-BE-RECLASSIFIED  
**Pattern:** No pattern (ad-hoc naming)

**Examples:**
```
docs/stories/INDEX.md
docs/stories/WORKSPACE-CLEANUP.story.md
docs/stories/2.0-SYN1.story.md
docs/stories/2.0-SYN1-foundation-unblocking.md (DUPLICATE!)
docs/stories/5.3.1.story.md
docs/stories/5.3.2.story.md
docs/stories/5.3.3-dev-review.md
docs/stories/5.3.3.story.md (DUPLICATE!)
docs/stories/5.3.4.story.md
docs/stories/5.4.story.md
docs/stories/6.1.story.md
... etc
```

**Issues:**
- Unclear which EPIC each belongs to
- Duplicates with slightly different names (5.3.3.story.md vs 5.3.3-dev-review.md)
- Some are review/draft files, not production stories
- Some should be merged into Schema 2

---

## Resolution Strategy

### Phase A: Audit & Classification (This Document)

**Classify all Schema 1 + 3 files:**
- **KEEP:** Story is still active (referenced in EPIC PRD or in-flight work)
- **MOVE:** Story should go to Schema 2 (epic-nested)
- **MERGE:** Duplicate — consolidate into one canonical version
- **ARCHIVE:** Story is done, move to `.archive/`
- **DELETE:** Not a story (is a note, review file, etc.)

---

### Phase B: Execution (EPIC-13.2 + 13.5)

#### Step 1: Create Archive Folder
```bash
mkdir -p docs/stories/.archive/schema-1-flat
mkdir -p docs/stories/.archive/schema-3-orphaned
```

#### Step 2: Migrate Schema 1 → Schema 2
For each Schema 1 file:
1. Determine EPIC (from {N} prefix)
2. Create EPIC folder if needed: `docs/stories/epics/EPIC-{N}/`
3. Move file: `docs/stories/{N}.{M}.* → docs/stories/epics/EPIC-{N}/{N}.{M}.story.md`
4. Update internal links (if any)

**Example:**
```bash
# Before
docs/stories/1.1.railway-config.md

# After
docs/stories/epics/EPIC-001/1.1.story.md
```

#### Step 3: Handle Duplicates (Schema 3)
For each duplicate pair:
1. Identify canonical version (prefer `.story.md` over `-descriptor.md`)
2. Merge content if both have substance
3. Delete duplicate, update references

**Example:**
```bash
# Before
docs/stories/5.3.3.story.md
docs/stories/5.3.3-dev-review.md

# After (merged)
docs/stories/epics/EPIC-005/5.3.3.story.md (contains both)
# (delete -dev-review)
```

#### Step 4: Reclassify Orphaned (Schema 3)
For each remaining Schema 3 file:
- **Is it a story?** If yes, move to Schema 2
- **Is it a review file?** If yes, move to `.archive/schema-3-orphaned/`
- **Is it metadata (INDEX, etc.)?** Keep in root with special naming: `_INDEX.md`

#### Step 5: Root Cleanup
After migration, `docs/stories/` root should contain ONLY:
```
docs/stories/
├── _INDEX.md                 (metadata, not a story)
├── WORKSPACE-CLEANUP.story.md (if still active; else archive)
├── epics/
│   ├── EPIC-001/
│   ├── EPIC-002/
│   ├── EPIC-013/
│   └── ...
├── .archive/
│   ├── schema-1-flat/        (all migrated flat files)
│   └── schema-3-orphaned/    (orphaned/metadata files)
└── .gitkeep
```

---

## Data Inventory (From Audit 2026-06-21)

### Schema 1 Flat Files (Exhaustive List)

**Group 1.x (EPIC-001 Tech Debt):**
- 1.1.railway-config.md ✅
- 1.2.counter-fix.md ✅
- 1.3.css-centralization.md ✅
- 1.4.redis-activation.md ✅
- 1.4-hooks-setup.md ✅
- 1.5.verifications-rotation.md ✅
- 1.5-deny-rules.md ✅
- 1.6-validation-gates.md ✅
- 1.7-aiox-full-setup.md ✅
- 1.8-aiox-compliance-audit.md ✅
- 1.9-squad-compliance-audit.md ✅
- 1.10-automation-enhancement.md ✅
- 1.11-documentation-synchronization.md ✅
- 1.12-agent-memory-validation.md ✅
- 1.13-cross-agent-workflow-testing.md ✅
- 1.14-agent-memory-creation.md ✅
- 1.14-memory-lifecycle-architecture.md ✅
- 1.15-squad-creator-coherence.md ✅
- 1.15-synapse-layer-validation.md ✅
- 1.18-state-live-update-hooks.md ✅
- 1.19-epic-aiox-rastreabilidade.md ✅
- 1.2.counter-fix.md ✅

**Group 2.x (EPIC-002 Framework Standardization):**
- 2.0-SYN1.story.md ✅
- 2.0-SYN1-foundation-unblocking.md ✅ (DUPLICATE)
- 2.1.synapse-hook-entry-point.md ✅
- 2.2.commands-skills-sync.md ✅
- 2.3.squad-structure-fixes.md ✅
- 2.4.base-templates-sync.md ✅
- 2.5.synapse-alan-nicolas-domain.md ✅

**Group 3.x (EPIC-003 Masterclass Fix):**
- 3.1.masterclass-fix-syntaxerror.md ✅
- 3.2.masterclass-fix-duplicate-ids.md ✅
- 3.3.masterclass-complete-missing-lessons.md ✅
- 3.4.kairos-dashboard-live.md ✅
- 3.5.masterclass-chatbot-dashboard-improvements.md ✅

**Group 5.x (EPIC-005 Governance):**
- 5.1-hook-automation-audit.md ✅
- 5.2-script-lifecycle-testing.md ✅
- 5.3-workflow-engine-activation.md ✅
- 5.3.1.story.md ✅
- 5.3.2.story.md ✅
- 5.3.3-dev-review.md ✅ (REVIEW FILE)
- 5.3.3.story.md ✅ (DUPLICATE)
- 5.3.4.story.md ✅
- 5.4-agent-handoff-automation.md ✅
- 5.4.story.md ✅ (DUPLICATE)
- 5.5-cli-completeness.md ✅
- 5.6-zero-setup-carregamento.md ✅
- 5.7-gap-discovery-aiox-operacional.md ✅
- 5.8-epic-delivery-validation.md ✅

**Group 6.x (EPIC-006 Configuration System):**
- 6.1.story.md ✅
- 6.2.story.md ✅
- 6.3.story.md ✅
- 6.4.story.md ✅
- 6.5.story.md ✅
- 6.6.story.md ✅
- 6.7.story.md ✅
- 6.8.story.md ✅
- 6.9.story.md ✅
- 6.10.story.md ✅

**Group 7.x (EPIC-007 QA Gates):**
- 7.1.story.md ✅
- 7.2.story.md ✅
- 7.3.story.md ✅
- 7.4.story.md ✅
- 7.5.story.md ✅
- 7.6.story.md ✅
- 7.7.story.md ✅
- 7.8.story.md ✅
- 7.9.story.md ✅
- 7.10.story.md ✅
- 7.11.story.md ✅
- 7.12.story.md ✅
- 7.13.story.md ✅
- 7.14.story.md ✅

**Group 8.x (EPIC-008 Agent Testing):**
- 8.1.1.story.md ✅
- 8.1.2.story.md ✅
- 8.1.3.story.md ✅
- ... (many 8.x.y.story.md files)

**Special/Metadata:**
- INDEX.md (METADATA)
- WORKSPACE-CLEANUP.story.md (unclear status)

---

## Validation Rules (for @sm to use in 13.2)

### Rule 1: Story Existence Query
**Before:** Had to check 3 glob patterns  
**After:** Single deterministic rule

```bash
# Check if story {EPIC}.{N} exists:
story_id="5.3.3"
epic_num=$(echo $story_id | cut -d. -f1)
story_num=$(echo $story_id | cut -d. -f2)

# Canonical location (Schema 2):
if [ -f "docs/stories/epics/EPIC-$(printf "%03d" $epic_num)/${story_id}.story.md" ]; then
  echo "Story found (canonical)"
  exit 0
fi

# ERROR: Not in Schema 2, cannot proceed
echo "Story $story_id not found in canonical location"
exit 1
```

### Rule 2: INDEX-AUTHORITATIVE.md
**File:** `docs/stories/INDEX-AUTHORITATIVE.md` (created by 13.2)

**Content:** Master list of all stories with their canonical locations

```markdown
# Story Index — Authoritative

| Story ID | EPIC | Title | Location | Status |
|---|---|---|---|---|
| 1.1 | EPIC-001 | Railway Config | docs/stories/epics/EPIC-001/1.1.story.md | LIVE |
| 1.2 | EPIC-001 | Counter Fix | docs/stories/epics/EPIC-001/1.2.story.md | LIVE |
| ... | ... | ... | ... | ... |
| 5.3.3 | EPIC-005 | Workflow Engine | docs/stories/epics/EPIC-005/5.3.3.story.md | LIVE |
| ... | ... | ... | ... | ... |
```

---

## Acceptance Criteria (EPIC-13.2)

- [ ] All Schema 1 files (flat) migrated to Schema 2 (epic-nested)
- [ ] All Schema 3 files (orphaned) reclassified or archived
- [ ] Duplicates merged or removed
- [ ] Root `docs/stories/` contains only:
  - `epics/` folder
  - `_INDEX.md` (metadata)
  - `.archive/` folder
  - `.gitkeep`
- [ ] `docs/stories/INDEX-AUTHORITATIVE.md` created with all stories mapped
- [ ] `npm run validate-story-index` command implemented (checks INDEX against reality)
- [ ] @sm workflow updated to reference INDEX-AUTHORITATIVE.md
- [ ] All epic-nested stories have consistent naming: `{EPIC-N}/{N}.{M}.story.md`

---

## Next Steps

1. **@architect (now):** Publish this document as reference
2. **@sm (13.2):** Use this to plan reclassification task
3. **@analyst (13.5):** Use audit data to reclassify orphans
4. **@dev (post-13.2):** Implement `npm run validate-story-index`

---

*Synapse audit complete. Schema resolution ready for EPIC-13.2 execution.*
