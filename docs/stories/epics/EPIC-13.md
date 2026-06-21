# EPIC-13: AIOX Setup Consolidation & Gap Resolution

**Epic ID:** EPIC-13  
**Title:** AIOX Setup Consolidation & Gap Resolution  
**Created:** 2026-06-21  
**Owner:** @pm (Morgan)  
**Status:** Backlog → In Planning

---

## 🎯 Vision

Remove structural ambiguities in KAIROS_CEREBRO's AIOX framework setup by consolidating agent definitions, story numbering, rule loading, and framework boundaries. Enforce single-source-of-truth for all framework metadata.

**Driver:** Gaps discovered in QA audit (Session Cont 67, 2026-06-21) blocking smooth operations.

---

## 📋 Stories (7 Total)

### Phase 1 (Critical) — Week 1

#### **13.1 — Agent Definition Shim Consolidation** 🔴 CRITICAL
- **Owner:** @dev (implementation) / @architect (design)
- **Effort:** 8 sp (research + consolidation)
- **Status:** Backlog
- **Link:** [Story 13.1 to be created by @sm]

**What:** Consolidate agent definitions across L1 (`.aiox-core/development/agents/`), L3 legacy (`.claude/agents/`), L3 shimmed (`.claude/commands/AIOX/agents/`), and L3 generated (`.claude/skills/AIOX/agents/*/SKILL.md`).

**Why:** Agents can diverge; changes in L2 don't propagate to Claude Code skills.

**AC:**
- [ ] Identify true source of truth (L2 vs generated SKILL.md)
- [ ] Verify all ideSync targets in sync (`.codex/`, `.antigravity/`, `.claude/skills/`)
- [ ] Remove dead `.claude/agents/` copies or mark deprecated
- [ ] Pre-commit validates no orphaned agent definitions

---

#### **13.2 — Story Numbering Authority Index** 🔴 CRITICAL
- **Owner:** @sm (story creation) / @analyst (audit)
- **Effort:** 5 sp
- **Status:** Backlog
- **Link:** [Story 13.2 to be created by @sm]

**What:** Create `docs/stories/INDEX-AUTHORITATIVE.md` as single source of truth for story locations. Map 3 coexisting schemas (flat, epic-nested, orphaned).

**Why:** @sm can't reliably check if story exists without ambiguity (3 possible schemas).

**AC:**
- [ ] INDEX-AUTHORITATIVE.md created with all stories mapped
- [ ] Regex patterns documented for each schema
- [ ] Pre-commit validation: `npm run validate-story-index`
- [ ] @sm workflow updated to reference INDEX

---

### Phase 2 (High) — Week 2

#### **13.3 — ideSync Drift Verification** 🟠 HIGH
- **Owner:** @devops (CI/CD gate)
- **Effort:** 3 sp
- **Status:** Backlog
- **Link:** [Story 13.3 to be created by @sm]

**What:** Create `npm run verify-ideSync` pre-commit gate. Fail if agent definitions drift between source (L2) and targets (`.codex/`, `.antigravity/`, `.claude/skills/`, etc.).

**Why:** No automated detection of drift currently; can silently diverge.

**AC:**
- [ ] `verify-ideSync` script created + integrated into pre-commit
- [ ] Detects missing agents, extra agents, stale files
- [ ] CI/CD gate blocks merge if drift found

---

#### **13.4 — Rules Load Order Matrix** 🟠 HIGH
- **Owner:** @architect (design)
- **Effort:** 3 sp
- **Status:** Backlog
- **Link:** [Story 13.4 to be created by @sm]

**What:** Document "Rules Load Order Matrix" in `docs/architecture/RULES-LOAD-ORDER.md`. Clarify precedence: Constitution Art. > `.claude/rules/` > `.aiox-core/development/workflows/`.

**Why:** Unclear which rules apply when; no single document explains load order.

**AC:**
- [ ] Rules Load Order Matrix published
- [ ] All `.claude/rules/*.md` classified by trigger
- [ ] Dead code removed from enforcement-gates.cjs
- [ ] CLAUDE.md references matrix

---

#### **13.5 — Story Orphan Audit & Reclassification** 🟠 HIGH
- **Owner:** @analyst (audit) / @sm (reclassification)
- **Effort:** 5 sp
- **Status:** Backlog
- **Link:** [Story 13.5 to be created by @sm]

**What:** Audit all stories in `docs/stories/` root. Move to proper epics or archive. Consolidate duplicates (e.g., `1/1.8.story.md` vs `1.8-*.md`).

**Why:** Orphaned files make story numbering ambiguous; duplicates create confusion.

**AC:**
- [ ] All orphaned stories audited + classified
- [ ] Duplicates consolidated
- [ ] Stories moved to proper epic folders
- [ ] Archive folder created
- [ ] INDEX-AUTHORITATIVE.md updated

---

### Phase 3 (Medium) — Week 3

#### **13.6 — Constitution Hook Verification** 🟡 MEDIUM
- **Owner:** @qa (verification)
- **Effort:** 5 sp
- **Status:** Backlog
- **Link:** [Story 13.6 to be created by @sm]

**What:** Verify all Art. I–VII enforcement hooks exist, load, and work. Document graceful degradation for Art. III–V.

**Why:** Constitution declares enforcement, but some hooks are missing or degrade gracefully.

**AC:**
- [ ] All Art. I–VII hooks verified as existent + loaded
- [ ] Dead code removed from enforcement hooks
- [ ] Constitution updated with actual enforcement level
- [ ] Tests added for each hook

---

#### **13.7 — Synapse L1/L4 Responsibility Boundary** 🟡 MEDIUM
- **Owner:** @architect (design)
- **Effort:** 3 sp
- **Status:** Backlog
- **Link:** [Story 13.7 to be created by @sm]

**What:** Document Synapse responsibility boundary. Draw clear line between L1 (motor code in `.aiox-core/core/synapse/`) and L4 (runtime state in `.synapse/`).

**Why:** Unclear inverted dependencies; can cause confusion during modifications.

**AC:**
- [ ] Synapse responsibility boundary documented
- [ ] L1 exports (interfaces) vs L4 state (files) clarified
- [ ] Dependency diagram added
- [ ] Test: no cross-boundary logic violations

---

## 📊 Release Phases

| Phase | Stories | Timeline | Owner | Dependencies |
|-------|---------|----------|-------|-------------|
| **Phase 1** | 13.1, 13.2 | Week 1 | @pm → @sm → @dev | — |
| **Phase 2** | 13.3, 13.4, 13.5 | Week 2 | @devops, @architect, @analyst | 13.1, 13.2 |
| **Phase 3** | 13.6, 13.7 | Week 3 | @qa, @architect | — |

---

## 🎯 Success Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| All 7 gaps resolved | ✅ 100% | @pm |
| ideSync drift gate active | ✅ Pre-commit | @devops |
| @sm can validate stories unambiguously | ✅ Yes | @sm |
| Constitution enforcement verified | ✅ All hooks present + working | @qa |
| Rules load order documented | ✅ PUBLIC doc | @architect |

---

## 👥 Stakeholders

| Role | Interest | Cadence |
|------|----------|---------|
| @dev (Dex) | Story numbering clarity (13.2) | Weekly |
| @sm (River) | Story index for validation (13.2) | Daily during Phase 1 |
| @qa (Quinn) | Hook verification (13.6) | Weekly |
| @architect (Aria) | Rules (13.4), Synapse (13.7) | Weekly |
| @devops (Gage) | ideSync gate (13.3) | ASAP |

---

## 📝 Notes

- **Assumption 1:** 3-week distributed timeline (not sequential)
- **Assumption 2:** No code refactoring required; mostly documentation + consolidation
- **Assumption 3:** Graceful degradation in Art. III–V is intentional; not upgraded to MUST
- **Assumption 4:** Story orphans are either moved or archived (no deletion without audit)

---

## 📎 References

- **QA Audit Report:** Session 2026-06-21 (Cont 67) — @qa identified 7 gaps
- **PRD:** `docs/prd/EPIC-13-PRD.md`
- **Constitution:** `.aiox-core/constitution.md` (Art. I–VII)
- **Framework Boundary:** `docs/ARCHITECTURE.md` (L1–L4 model)

---

**Status:** Backlog → Ready for @sm *draft  
**Created by:** Morgan (@pm)  
**Last updated:** 2026-06-21

---

## 🚀 Next Steps

1. ✅ **Epic created** → `docs/stories/epics/EPIC-13.md`
2. **@sm drafts 7 stories** → `*create-story` for 13.1–13.7
3. **@po validates stories** → `*validate-story-draft`
4. **@dev implements Phase 1** → 13.1 + 13.2 (Week 1)
5. **@dev implements Phase 2** → 13.3–13.5 (Week 2)
6. **@qa implements Phase 3** → 13.6 + 13.7 (Week 3)
7. **@devops pushes** → Final merge to main

---

**Ready para @sm começar *create-story para 13.1–13.7?**
