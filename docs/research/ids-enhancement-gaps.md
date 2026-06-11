# IDS Enhancement Gaps — EPIC-8 Phase 2 Research

**Status:** DRAFT v0.1  
**Date:** 2026-06-11  
**Agent:** @analyst (Atlas)  
**Validation:** @architect (pending)

---

## Executive Summary

IDS (Incremental Development System) is 70% implemented with Gates G1-G5 active. **G6 (CI/CD Registry Integrity) is unimplemented.** Phase 2 aims to:
1. Complete G6 CI/CD gate
2. Add registry auto-heal capability
3. Implement impact analysis graph
4. Build IDS Health Dashboard

**Current Status:** 474 entities tracked in `.aiox-core/data/entity-registry.yaml`, metadata complete, relationships established. Manual workflows (G1-G5) proven. Automation (G6) needs implementation.

---

## Current IDS State (G1-G5)

### Gate Inventory

| Gate | Type | Status | Implementation |
|------|------|--------|-----------------|
| **G1** | Epic Creation advisory | ✅ Active (soft) | Query registry, display options |
| **G2** | Story Creation advisory | ✅ Active (soft) | Task/template matching |
| **G3** | Story Validation soft-block | ✅ Active | `*validate-story-draft` 10-point check |
| **G4** | Dev Context informational | ✅ Active | Pattern suggestions at story assignment |
| **G5** | QA Merge block | ✅ Active | `*qa-gate` checks for duplication |
| **G6** | CI/CD Registry Integrity | ❌ MISSING | Placeholder only |

### Registry Current State

**Source:** `.aiox-core/data/entity-registry.yaml`

```yaml
metadata:
  version: "1.0.0"
  entityCount: 474
  categories: 7  # tasks, templates, scripts, modules, agents, checklists, data
  checksumAlgorithm: "sha256"
```

**Entity Breakdown (Observed):**
- **Tasks:** 198 (develop-story, validate-next-story, qa-gate, etc.)
- **Modules:** 134 (gate-logger, registry-loader, etc.)
- **Scripts:** 67 (populate-entity-registry, etc.)
- **Templates:** 52 (story-tmpl.yaml, prd-tmpl.yaml, etc.)
- **Agents:** 12 (@dev, @qa, @sm, @pm, @analyst, etc.)
- **Checklists:** 4 (story-dod, architect-check, po-master)
- **Data Files:** 7 (aiox-kb.md, technical-preferences.md, etc.)

**Metadata Fields (Per Entity):**
- `path`, `type`, `purpose`, `keywords`
- `usedBy[]`, `dependencies[]`
- `adaptability.score` (0.0-1.0), `adaptability.constraints[]`, `adaptability.extensionPoints[]`
- `checksum`, `lastVerified`

**Relationship Tracking:** `usedBy` and `dependencies` resolve bidirectional relationships.

---

## Gap Analysis: G6 CI/CD Gate (MISSING)

### Requirement (from Constitution Art. IV-A)

**G6:** Registry Integrity Check — Automated gate in CI/CD pipeline to:
1. Verify all new artifacts are registered in entity registry
2. Detect orphaned artifacts (exist in repo but not in registry)
3. Validate checksum integrity (detect tampering)
4. Enforce "CREATE requires justification" rule
5. Sync registry if changes detected

**Trigger:** CI/CD pipeline (pre-merge hook)  
**Blocking:** YES on CRITICAL (missing registry entry), WARN on MEDIUM (stale checksum)

### Current Gap

❌ **No automated CI/CD validation**
- Manual review required for registry consistency
- No detection of orphaned artifacts created outside normal workflows
- No integrity checks (checksums calculated but not verified)
- Registry updates are manual (script `populate-entity-registry.js` must be run by dev)

### Proposed G6 Implementation (Phase 2: Story 8.2.1)

```bash
# CI/CD pre-merge hook (pseudo-code)

function G6_RegistryIntegrityCheck(branch) {
  changed_files = git_diff(main...branch)
  registry = load_entity_registry()
  
  for each changed_file in changed_files:
    if is_new_artifact(changed_file):
      entity = registry.find_by_path(changed_file)
      
      if entity == null:
        # NEW: Not in registry
        if has_justification(changed_file):
          WARN "New artifact without registry entry (justification provided)"
        else:
          BLOCK "New artifact must be registered (Story must cite IDS:CREATE rule)"
      else:
        # EXISTING: Verify integrity
        if verify_checksum(changed_file, entity.checksum) == false:
          WARN "Artifact modified; update registry entry"
  
  return PASS|WARN|BLOCK
}
```

---

## Gap 2: Registry Auto-Heal (MISSING)

### Problem

Registry gets out of sync when:
1. Dev creates artifact outside normal story workflow (quick fixes)
2. Checksum verification fails (legitimate modification, registry not updated)
3. Dependencies change (imports added/removed, relationships not updated)

**Current Workaround:** Manual script `populate-entity-registry.js` (must be run explicitly)

### Proposed Auto-Heal (Phase 2: Story 8.2.2)

**Trigger:** When G6 detects inconsistency, auto-repair options:

1. **Level 1: Lazy Sync** (WARN only)
   - Detect new artifact, auto-register with auto-generated purpose
   - User reviews + approves in PR

2. **Level 2: Full Sync** (BLOCK, requires override)
   - Re-scan all artifacts
   - Recalculate checksums
   - Rebuild relationship graph
   - Propose PR with registry changes

**Implementation:** New task `ids-auto-heal.md` (executable, idempotent)

---

## Gap 3: Impact Analysis Graph (MISSING)

### Current Limitation

Registry tracks `usedBy` and `dependencies`, but no analysis of:
- **Depth:** How many levels deep is a consumer chain?
- **Breadth:** How many artifacts would break if this one changes?
- **Risk:** What's the blast radius of a modification?

### Proposed Impact Analysis (Phase 2: Story 8.2.3)

**Graph Structure:**
```
Entity A
  ├─ used_by: [B, C]
  │   ├─ B used_by: [D, E]
  │   └─ C used_by: [F]
  └─ impact_score: 5 (total consumers if A changes)

Risk Levels:
- LOW: <= 3 consumers
- MEDIUM: 4-10 consumers
- HIGH: > 10 consumers
```

**CLI Command:**
```bash
aiox ids graph --entity create-story.md --format mermaid
aiox ids graph --impact --threshold high
```

---

## Gap 4: Adaptability Scoring Logic (UNCLEAR)

### Current State

**Adaptability Score Exists** but logic is undocumented:
```yaml
adaptability:
  score: 0.0-1.0
  constraints: []
  extensionPoints: []
```

**Problem:** No clear algorithm for assigning/updating scores.

### Proposed Scoring Rules (Phase 2: Story 8.2.4)

```
Score = (1.0 - modifiability_risk) * reusability_potential

Factors:
- Type: agents (0.0-0.3, low) → tasks (0.7-1.0, high)
- Consumers: many (lower) → few (higher)
- Stability: core/L1 (lower) → project/L4 (higher)
- Dependencies: many (lower) → few (higher)
```

**Examples:**
- Agent definition: 0.0-0.3 (changes break many consumers)
- Shared utility: 0.5-0.7 (adaptable, impact analysis needed)
- Specific task: 0.8-1.0 (high adaptability)

---

## Gap 5: Creation Justification Validator (MISSING)

### Requirement (Constitution Art. IV-A)

When creating new artifact, developer must provide:
```yaml
justification:
  evaluated_patterns: [entity-id-1, entity-id-2]  # Existing entities considered
  rejection_reasons:
    entity-id-1: "Requires PostgreSQL, we're using SQLite"
    entity-id-2: "Scope mismatch (auth vs scoring)"
  new_capability: "Fraud scoring integration with OSINT"
  register_within_24h: true  # Confirm registration commitment
```

### Current Gap

❌ No validator enforces this on new story/task creation

### Proposed Validator (Phase 2: Story 8.2.5)

- New task: `creation-justification-validator.md`
- Hook integration: Pre-commit check (already have framework)
- Workflow: `*validate-creation` command (manual verification)

---

## Gap 6: Change Log Automation (MISSING)

### Problem

Registry entries have `lastVerified` but no change history. When adapting an entity:
- No log of what changed
- No before/after comparison
- No impact analysis attached to change

### Proposed Automation (Phase 2: Story 8.2.6)

**New Structure:**
```yaml
entity:
  id: create-story
  path: .aiox-core/development/tasks/create-story.md
  changelog:
    - date: 2026-06-08
      modified_by: "@dev"
      change: "Added AI model selection step"
      impact: "3 consumers affected (validated)"
      story_ref: "7.5"
    - date: 2026-05-15
      modified_by: "@sm"
      change: "Restructured elicitation phase"
      impact: "1 consumer (backward compatible)"
```

---

## Phase 2 Stories Summary

| Story | Gap | Effort | Dependencies |
|-------|-----|--------|--------------|
| 8.2.1 | G6 CI/CD Gate | 2sp | entity-registry.yaml stable |
| 8.2.2 | Registry Auto-Heal | 2sp | 8.2.1 |
| 8.2.3 | Impact Analysis Graph | 2sp | 8.2.1, 8.2.2 |
| 8.2.4 | Adaptability Scoring | 2sp | 8.2.3 |
| 8.2.5 | Creation Justification Validator | 1.5sp | None |
| 8.2.6 | Change Log Automation | 1.5sp | 8.2.5 |
| 8.2.7 | IDS Health Dashboard | 2sp | 8.2.1-8.2.6 |
| 8.2.8 | Documentation + Training | 1.5sp | All |
| 8.2.9 | CI/CD Integration | 2sp | 8.2.1, 8.2.7 |
| | **TOTAL** | **~17sp** | |

---

## Risk Assessment

| Gap | Risk | Mitigation |
|-----|------|-----------|
| G6 automation bugs | HIGH | Test with 5 pre-existing PRs, validate registry state |
| Auto-heal collisions | MEDIUM | Dry-run mode, require approval for changes |
| Impact graph performance | LOW | Lazy-load with caching, test with 474 entities |
| Scoring logic disagreement | MEDIUM | Validate with @architect, document decision rationale |

---

## Success Metrics for Phase 2

- [ ] G6 gate blocks new unregistered artifacts (zero orphans)
- [ ] Auto-heal recovers from 100% of detected inconsistencies
- [ ] Impact graph computes in <500ms for 474 entities
- [ ] Adaptability scores stable across 3 query runs
- [ ] Creation validator prevents justification bypass (0 false negatives)

---

## Timeline

**Week 1 (Jun 11-15):** Research + validation (THIS document)  
**Week 4 (Jun 29-Jul 12):** Stories 8.2.1-8.2.9 executed  
**Week 5 (Jul 5):** G6 CI/CD gate live in production

---

## Next Steps (Handoff to @pm)

1. **@architect Validation** — Review gap analysis, confirm feasibility
2. **Spec Pipeline** — Convert to Phase 2 PRD (sharded by story)
3. **Story Creation** — 9 stories, acceptance criteria per gap

---

*Research by @analyst (Atlas), Validation pending by @architect (Aria)*
