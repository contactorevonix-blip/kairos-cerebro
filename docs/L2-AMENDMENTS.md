# L2 Amendments Proposal — Orphan Story Wiring Documentation

**Proposal:** Add orphan story wiring documentation to `.aiox-core/data/`  
**Date:** 2026-06-09  
**Phase:** Task 2.5 Phase 3 (Framework Governance)  
**Status:** Ready for @aiox-master *propose-modification

---

## Rationale

Phase 2 implemented story naming governance via `story-registry.yaml` (L3 — mutable). Two meta stories (INDEX.md, WORKSPACE-CLEANUP.story.md) don't follow standard naming patterns and are whitelisted in the registry.

This amendment documents the rationale and governance for these orphan stories in L2 (framework layer) to ensure:
- Constitution Art. III compliance (story-driven development)
- Clear boundaries between L1/L2 framework and L4 project runtime
- Auditability of all story references

---

## Amendment Details

### File Location
`.aiox-core/data/story-registry.yaml` (L3 — already created in Phase 2)

### Scope
Whitelisting meta stories (INDEX, WORKSPACE-CLEANUP) with resolver rules:
```yaml
whitelist:
  - id: 'INDEX'
    path: 'docs/stories/INDEX.md'
    type: 'meta'
    resolveAs: 'INDEX'
    rationale: 'Story catalogue and navigation hub'
    
  - id: 'WORKSPACE-CLEANUP'
    path: 'docs/stories/WORKSPACE-CLEANUP.story.md'
    type: 'meta'
    resolveAs: 'WORKSPACE-CLEANUP'
    rationale: 'Maintenance and workspace cleanup operations'
```

### Constitution Alignment

| Article | Principle | Status |
|---------|-----------|--------|
| **Art. I** | CLI First | ✅ Story registry is CLI-consumable (YAML) |
| **Art. II** | Agent Authority | ✅ @architect proposes, @aiox-master approves |
| **Art. III** | Story-Driven | ✅ All story references documented + whitelisted |
| **Art. IV** | No Invention | ✅ Derived from operational necessity (real files: INDEX.md, WORKSPACE-CLEANUP.story.md) |
| **Art. V** | Quality First | ✅ Tests validate resolver behavior (16/16 pass) |
| **Art. VI** | Absolute Imports | ✅ Not applicable to story naming |
| **Art. VII** | Framework Boundary | ✅ Registry in L3 (mutable), resolver in L4 hooks |

**Verdict:** ✅ All articles respected. No constitution amendment required.

---

## Implementation Summary

**What Changed (Phase 2):**
- Created `.aiox-core/data/story-registry.yaml` (L3 — mutable)
- Modified `.claude/hooks/task-auto-suggest.cjs` (L4 — loads registry, resolves storyId)
- Created `.claude/hooks/story-naming-validator.cjs` (L4 — validates naming)
- Created `docs/SOP-STORY-NAMING.md` (L4 — governance rules)
- Created `tests/hooks/test-story-traceability.test.js` (L4 — 16/16 tests pass)

**Impact:**
- FP-03 (Story traceability gap) eliminated
- unknown.json generation prevented
- Metrics accuracy restored (tasksActivated = real stories only)
- Governance infrastructure established

---

## Next Steps

1. **Approval:** @aiox-master reviews + approves via *propose-modification
2. **Commit:** @devops commits Phase 2 + Phase 3 changes
3. **Documentation:** Update changelog + STATE.md

---

## References

- Phase 2 Implementation: 5 deliverables (registry, hooks, SOP, tests)
- QA Gate: PASS (16/16 tests, lint clean, no CRITICAL issues)
- Story Registry: `.aiox-core/data/story-registry.yaml`
- SOP: `docs/SOP-STORY-NAMING.md`

---

*Amendment ready for @aiox-master approval. No constitution changes required.*
