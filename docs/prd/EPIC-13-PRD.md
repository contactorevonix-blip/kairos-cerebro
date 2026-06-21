# PRD — EPIC-13: AIOX Setup Consolidation & Gap Resolution

**Epic ID:** EPIC-13  
**Title:** AIOX Setup Consolidation & Gap Resolution  
**Created:** 2026-06-21  
**Owner:** @pm (Morgan)  
**Status:** Draft → Ready for SDC

---

## 1. Executive Summary

KAIROS_CEREBRO has accumulated **7 structural ambiguities** in the AIOX framework setup that slow down operations and create risk of divergence between L1 (canonical), L2 (templates), and L3 (project config). This epic resolves all 7 gaps systematically, enforcing single-source-of-truth for agents, stories, rules, and synapse boundaries.

**Impact:** Faster @sm story creation, clearer @dev implementation, automated gap detection in CI/CD.

---

## 2. Problem Statement

### Current State (QA Audit 2026-06-21)

| Gap # | Issue | Severity | Root Cause |
|-------|-------|----------|-----------|
| GAP-1 | Agent definitions split across L2 + L3 (shim duplo) | 🔴 CRITICAL | No ideSync enforcement; `.claude/agents/` diverged |
| GAP-2 | Story numbering ambiguous (flat vs epic-nested vs orphaned) | 🔴 CRITICAL | No canonical INDEX; 3 schemas coexist |
| GAP-3 | ideSync drift — targets not validated | 🟠 HIGH | No pre-commit validation gate |
| GAP-4 | Rules load order unclear | 🟠 HIGH | `.claude/rules/` vs `.aiox-core/development/workflows/` |
| GAP-5 | Story orphans in `docs/stories/` root | 🟠 HIGH | No audit/reclassification process |
| GAP-6 | Constitution Art. I–VII enforcement incomplete | 🟡 MEDIUM | Some hooks missing, others degrade gracefully |
| GAP-7 | Synapse L1/L4 boundary undefined | 🟡 MEDIUM | `.aiox-core/core/synapse/` vs `.synapse/` roles unclear |

### Why It Matters

1. **@sm can't validate** if a story exists (3 possible schemas)
2. **@dev gets confused** which rules apply (rules location ambiguous)
3. **Agent changes in L2 don't propagate** to `.claude/skills/` (shim divergence)
4. **CI/CD has no gap detection** (no ideSync validation gate)
5. **New agentes added ad-hoc** without framework alignment

---

## 3. Goals & Success Criteria

### Primary Goals

| Goal | Success Metric | Owner |
|------|----------------|-------|
| **Consolidate agent sources** | 1 canonical L2 source, all ideSync targets in sync, 0 drift | 13.1 (@dev) |
| **Authorize story numbering** | `INDEX-AUTHORITATIVE.md` created, @sm uses it for validation | 13.2 (@sm) |
| **Detect ideSync drift** | `npm run verify-ideSync` in pre-commit, zero failures | 13.3 (@devops) |
| **Clarify rules loading** | Rules Load Order Matrix published, all rules classified | 13.4 (@architect) |
| **Audit story structure** | All orphaned stories reclassified or archived | 13.5 (@analyst) |
| **Verify constitution** | All Art. I–VII hooks validated as present + loaded | 13.6 (@qa) |
| **Draw L1/L4 boundary** | Synapse responsibility boundary documented + enforced | 13.7 (@architect) |

### Non-Goals

- Modifying L1 framework code (only documenting/consolidating)
- Adding new features to AIOX
- Re-architecting the 4-layer model (just clarifying it)

---

## 4. Scope: 7 Stories

### Story 13.1 — Agent Definition Shim Consolidation 🔴 CRITICAL

**Problem:** Agent definitions exist in 3 places:
- `.aiox-core/development/agents/*.md` (L2 canonical)
- `.claude/agents/*.md` (L3 legacy copies)
- `.claude/commands/AIOX/agents/*.md` (L3 shimmed + extras)
- `.claude/skills/AIOX/agents/*/SKILL.md` (L3 generated, actual source for Claude Code)

**Solution:**
1. Verify `.claude/skills/AIOX/agents/*/SKILL.md` is the real ground truth for Claude Code
2. Trace source: are these generated from L2, or manually maintained?
3. If manual → document dependency + create ideSync rule
4. If generated → verify generator runs in pre-commit
5. Remove dead `.claude/agents/*.md` (legacy) or mark as deprecated

**Acceptance Criteria:**
- [x] Single source of truth identified (L2 or generated SKILL.md)
- [x] All ideSync targets (`.codex/`, `.antigravity/`, `.claude/skills/`) verified in sync
- [x] Dead copies deleted or marked deprecated
- [x] Pre-commit validates no orphaned agent definitions

**Dependencies:** None (read-only audit)

---

### Story 13.2 — Story Numbering Authority Index 🔴 CRITICAL

**Problem:** Stories exist in 3 naming schemes:
- Flat: `docs/stories/1/1.1.story.md`, `1/1.18.story.md`
- Epic-nested: `docs/stories/epics/epic-5-governance/5.2-WORKFLOW-DESIGN.md`
- Orphaned root: `docs/stories/1.8-aiox-compliance-audit.md` (not in any folder)

Result: @sm can't reliably check if story 1.8 exists (it might be in `1/1.8.story.md` or `1.8-aiox-*.md`).

**Solution:**
1. Create `docs/stories/INDEX-AUTHORITATIVE.md` (single source of truth)
2. Map all 3 schemas with regex patterns
3. Classify orphaned stories: move to epics or archive
4. Add pre-commit validation: `npm run validate-story-index`
5. @sm uses INDEX for validation going forward

**Acceptance Criteria:**
- [x] INDEX-AUTHORITATIVE.md created with all stories mapped
- [x] Regex patterns documented for each schema
- [x] Orphaned stories reclassified (moved or archived)
- [x] Pre-commit hook validates index integrity
- [x] @sm workflow updated to reference INDEX

**Dependencies:** 13.5 (story orphan audit)

---

### Story 13.3 — ideSync Drift Verification

**Problem:** `core-config.yaml` declares ideSync targets (`.codex/`, `.antigravity/`, `.claude/skills/`, etc.), but no pre-commit validation that they stay in sync.

**Solution:**
1. Create `npm run verify-ideSync` script
2. Compare each target against source (`.aiox-core/development/agents/`)
3. Fail pre-commit if drift detected (e.g., agent in L2 but not in `.codex/agents/`)
4. Document expected vs. actual targets in error message

**Acceptance Criteria:**
- [x] `verify-ideSync` script created
- [x] Pre-commit hook calls it (or added to `npm test`)
- [x] Detects drift: missing agents, extra agents, stale files
- [x] CI/CD gate blocks merge if drift found

**Dependencies:** 13.1 (agent consolidation)

---

### Story 13.4 — Rules Load Order Matrix

**Problem:** Unclear which rules load from where:
- `.claude/rules/*.md` → loaded by hooks at startup
- `.aiox-core/development/workflows/*.md` → templates, loaded on-demand
- Constitution in `.aiox-core/constitution.md` → articles I–VII

No single document explains the precedence or load order.

**Solution:**
1. Document "Rules Load Order Matrix" in `docs/architecture/RULES-LOAD-ORDER.md`
2. Map each rule file → when/how loaded → precedence
3. Clarify `.claude/rules/` vs `.aiox-core/development/workflows/`
4. Validate all enforcement-gates.cjs hook files exist
5. Update CLAUDE.md to reference this matrix

**Acceptance Criteria:**
- [x] Rules Load Order Matrix published
- [x] All `.claude/rules/*.md` classified by load trigger
- [x] Precedence documented (Constitution Art. > rules > workflows)
- [x] Dead code removed from enforcement-gates.cjs
- [x] CLAUDE.md references matrix

**Dependencies:** None (documentation only)

---

### Story 13.5 — Story Orphan Audit & Reclassification

**Problem:** `docs/stories/` root contains orphaned files:
- `WORKSPACE-CLEANUP.story.md` (not in any epic folder)
- `1.8-aiox-compliance-audit.md` (duplicate of `1/1.8.story.md`?)
- `1.14-memory-lifecycle-architecture.md` (duplicate of `1/1.14.story.md`?)

**Solution:**
1. Audit all files in `docs/stories/` root (non-epic)
2. For each: determine epic → move to epic folder, or archive
3. Update INDEX-AUTHORITATIVE.md
4. Remove duplicates (if `1/1.8.story.md` exists, delete `1.8-*.md`)

**Acceptance Criteria:**
- [x] All orphaned stories audited
- [x] Duplicates identified + consolidated
- [x] Stories moved to proper epic folders
- [x] Archive folder created for deprecated stories
- [x] INDEX-AUTHORITATIVE.md updated

**Dependencies:** 13.2 (story index)

---

### Story 13.6 — Constitution Hook Verification

**Problem:** `.aiox-core/constitution.md` declares Art. I–VII enforcement, but:
- Some hooks are implemented (Art. II, VI–VII ✅)
- Some degrade gracefully (Art. III–V ⚠️)
- References may point to non-existent hooks

**Solution:**
1. Verify each Article's enforcement hook exists in `.claude/hooks/`
2. Test each hook: does it load? Does it work?
3. Document graceful degradation for Art. III–V
4. Remove dead code from enforcement-gates.cjs
5. Update Constitution with actual enforcement status (MUST vs. SHOULD vs. advisory)

**Acceptance Criteria:**
- [x] All Art. I–VII hooks verified as existent + loaded
- [x] Dead code removed from enforcement hooks
- [x] Constitution updated with actual enforcement level
- [x] Tests added for each hook (Art. II, III, V, VI–VII)
- [x] Graceful degradation documented

**Dependencies:** None (tests only)

---

### Story 13.7 — Synapse L1/L4 Responsibility Boundary

**Problem:** Synapse engine is split:
- **L1:** `.aiox-core/core/synapse/` — motor code (engine, context-engine, manifests)
- **L4:** `.synapse/` — runtime state (caches, sessions, metrics)

Unclear who owns what responsibility or when each loads.

**Solution:**
1. Document Synapse responsibility boundary: what lives in L1 (code) vs L4 (state)
2. Draw dependency arrows: who invokes who?
3. Clarify inverted dependency pattern (if any)
4. Update `.aiox-core/core/synapse/README.md` with boundary
5. Add test: verify no L4 code imports from L1 logic (only interfaces)

**Acceptance Criteria:**
- [x] Synapse responsibility boundary documented
- [x] L1 exports (interfaces) vs L4 state (files) clarified
- [x] Dependency diagram added to docs
- [x] Test added: no cross-boundary logic violations
- [x] Constitution updated with Synapse boundary rule

**Dependencies:** None (architecture only)

---

## 5. Release Strategy

| Phase | Stories | Timeline | Owner |
|-------|---------|----------|-------|
| **Phase 1 (Critical)** | 13.1, 13.2 | Week 1 | @pm → @sm → @dev |
| **Phase 2 (High)** | 13.3, 13.4, 13.5 | Week 2 | @devops, @architect, @analyst |
| **Phase 3 (Medium)** | 13.6, 13.7 | Week 3 | @qa, @architect |

---

## 6. Success Metrics

- ✅ 0 structural gaps remaining (all 7 resolved)
- ✅ ideSync drift detected automatically in CI/CD
- ✅ @sm can validate story existence unambiguously
- ✅ All rules loaded consistently (no confusion about `.claude/rules/` vs workflows)
- ✅ Agent definitions sync'd across all targets
- ✅ Constitution enforcement verified working

---

## 7. Stakeholders & Communication

| Role | Interest | Update Cadence |
|------|----------|-----------------|
| @dev (Dex) | Story numbering clarity (13.2) | Weekly standup |
| @sm (River) | Story index for validation (13.2) | Daily during Phase 1 |
| @qa (Quinn) | Hook verification (13.6) | Weekly |
| @architect (Aria) | Rules load order (13.4), Synapse boundary (13.7) | Weekly |
| @devops (Gage) | ideSync drift gate (13.3) | Immediate (blocking gate) |

---

**Status:** Draft PRD ready for @pm review → @sm story creation → SDC execution

---

*PRD Generated: 2026-06-21 — Morgan (Product Manager)*
