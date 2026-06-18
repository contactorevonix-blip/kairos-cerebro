# 🎯 PROMPT PARA CONT 55 — @ANALYST → @ARCHITECT HANDOFF

**Status:** Ready to execute  
**Sequence:** @analyst (Alex) → @architect (Aria)  
**Duration:** 2-3 hours  
**Value:** Framework validation + determinism implementation

---

## PASSO 1: @ANALYST (Alex) — Use the Skill

**Command:**
```
@analyst Analyze the aiox-discovery-squad skill and the 30 gaps we found:

1. Test the skill functionality (does it work as designed?)
2. Validate the 5 deterministic structures (are they complete?)
3. Identify any remaining ambiguities or gaps (what else is missing?)
4. Research best practices for:
   - QA scoring automation (how do other frameworks do it?)
   - Story dependency graphs (what tools/patterns exist?)
   - Deterministic handoff protocols (what's the gold standard?)
5. Propose improvements to the 5 structures based on research

Output: Research report with findings + recommendations for @architect
```

**Where to find everything:**
- Skill: `~/.claude/skills/aiox-discovery-squad/SKILL.md`
- Investigation: `.aiox/investigation-report-CONT54.md`
- Gaps: All 30 documented in investigation report

**Expected output:**
- ✅ Skill validation (works/doesn't work)
- ✅ 5 structures assessment (complete/incomplete)
- ✅ Research findings (best practices)
- ✅ Recommendations (improvements needed)
- ✅ Handoff for @architect

---

## PASSO 2: @ARCHITECT (Aria) — Design Implementation

**Exact prompt to pass to @architect:**

```
You are Aria, the System Architect. @analyst just completed research 
on our 30-gap investigation and 5 deterministic structures.

TASK: Design the implementation of the 5 deterministic structures:

1. QA Scoring Automático (Gap #26)
   - Where: .aiox-core/data/qa-checklist-scoring.yaml or .claude/rules/?
   - Enforcement: CLI hook or just documented?
   - Validation: Should we have enforce-qa-scoring.cjs hook?

2. Dependency Graph (Gap #27)
   - Where: .aiox-core/data/story-dependencies.yaml
   - Auto-enforcement: Can CLI prevent wrong order?
   - Blocking: Should blocked stories halt or warn?

3. Handoff Protocol (Gap #28)
   - State machine: Enforce at CLI level?
   - Context preservation: Automatic or manual?
   - Rollback: How to handle rejected stories?

4. Escalation Rules (Gap #29)
   - Auto-triggered: How to detect "blocked 1h"?
   - Context dump: What to include?
   - Human escalation: What's the threshold?

5. Decision Log (Gap #30)
   - Storage: .story-file.decision-log.jsonl?
   - Auto-compression: After how many entries?
   - Privacy: What decisions NOT to log?

DELIVERABLES:
- Architecture Decision Record (ADR) for each structure
- CLI hook definitions (if needed)
- YAML config templates (ready to use)
- Implementation order (dependencies between structures)
- Risks and mitigation

Your designs will inform @sm's story creation and @dev's implementation.
```

---

## 📋 FLOW CHART

```
CONT 55 Timeline:
├─ 10:00 @analyst: Use skill + validate 5 structures + research (1h)
├─ 11:00 @analyst: Generate research report (30min)
├─ 11:30 @architect: Receive @analyst findings (5min)
├─ 11:35 @architect: Design 5 structures implementation (1.5h)
└─ 13:05 @architect: Complete + handoff to @sm for CONT 56
```

---

## 🔗 FILES @ANALYST WILL NEED

**Read:**
1. `.aiox/investigation-report-CONT54.md` — All 30 gaps
2. `~/.claude/skills/aiox-discovery-squad/SKILL.md` — Skill definition
3. `PROJECT.md` — Project context
4. `.claude/CLAUDE.md` — Framework rules

**May Research:**
- Best practices for QA scoring (external sources)
- Dependency graph patterns (external sources)
- State machine design (external sources)

---

## 🔗 FILES @ARCHITECT WILL NEED

**From @analyst:**
1. Research report (output from @analyst)
2. Skill validation feedback

**From repo:**
1. `.aiox/investigation-report-CONT54.md`
2. `.aiox-core/constitution.md` (Art. I-VII)
3. `.claude/rules/*` (all rules)

---

## ✅ SUCCESS CRITERIA FOR CONT 55

**@analyst:**
- ✅ Skill tested (works or needs fixes)
- ✅ 5 structures validated (complete or incomplete)
- ✅ Research findings documented
- ✅ Recommendations clear
- ✅ Ready for @architect

**@architect:**
- ✅ 5 ADRs written (why design each way?)
- ✅ YAML configs templated (ready to copy)
- ✅ CLI hooks designed (if needed)
- ✅ Implementation order clear (dependencies)
- ✅ Ready for @sm to create stories

---

## 🚀 AFTER CONT 55

**CONT 56 (@sm creates stories):**
- Stories 13.3-13.6 created (from investigation report)
- Based on @architect designs
- Ready for @dev implementation

**CONT 57 (@dev implements):**
- 13.3: Audit Logging (2h)
- 13.4: Secrets Detection (2h)
- 13.5: QA Gate (2h)
- 13.6: Concurrent Writes (4h)

---

## 📞 BLOCKING QUESTIONS FOR @ARCHITECT

If @architect gets stuck, these are the decisions needed:

1. **Where do YAML configs live?**
   - Option A: `.aiox-core/data/` (framework level)
   - Option B: `.claude/rules/` (project level)
   - Option C: Split (some here, some there)

2. **Should enforcement be CLI-level or documentation-level?**
   - Option A: Strict enforcement (CLI hooks prevent violations)
   - Option B: Soft enforcement (warnings only)
   - Option C: Hybrid (critical rules enforced, others warned)

3. **How do we handle story rejection loops?**
   - Option A: Max 3 rejections → escalate
   - Option B: Max 5 rejections → escalate
   - Option C: No limit (human decides)

4. **What goes in decision log?**
   - Option A: All decisions (verbose)
   - Option B: Only architecture decisions (concise)
   - Option C: Both + auto-summarization (after 30 days)

---

## ✨ FINAL NOTE

**This is a high-quality handoff:**
- ✅ Skill is production-ready
- ✅ 30 gaps fully analyzed
- ✅ 5 deterministic structures designed
- ✅ Clear flow from @analyst → @architect → @sm → @dev

**No ambiguity. Clear path forward.**

---

**Ready for CONT 55? 🚀**
