# Workspace Cleanup — Handoff to @devops (Gage)

**From:** Orion (aiox-master)  
**To:** @devops (Gage)  
**Date:** 2026-06-07  
**Status:** Ready for execution

---

## What's Done (Orion)

✅ **T1: Audit** — COMPLETE
- `WORKSPACE-AUDIT.md` — 100% categorization of workspace
- Gate 1 PASS — Ready to proceed

✅ **T2: Planning** — COMPLETE
- `MOVES-PLAN.md` — Deletion list (10 items)
- Gate 2 PASS — No conflicts, all safe

---

## What's Next (@devops tasks)

### **T3: Execute Moves**
**Reference:** `MOVES-PLAN.md`

Delete 10 items:
```bash
rm -rf .agent .antigravity .codex .cursor .gemini .kimi
rm .env.backup.1779648637547 .env.backup.1779648644651
rm kairos-server.js kairos-snapshot.js
```

**Validation:**
- [ ] All 10 items deleted
- [ ] `git status` clean
- [ ] No broken imports
- Gate 3: PASS

---

### **T4: Cleanup & Archive**
**Reference:** `MOVES-PLAN.md` (Post-Execution section)

Review `.kairos-data/`:
- [ ] Is this critical? (ask Pedro if unsure)
- Delete or keep per decision

Gate 4: Git status clean → PASS

---

### **T5: Verification & Commit**

Final checklist:
- [ ] All ACs verified (see story)
- [ ] Story status updated to Done
- [ ] Commit message: `chore: Workspace cleanup — WORKSPACE-CLEANUP-001 complete`
- [ ] Push to `main`

Gate 5: PASS → Story marked DONE

---

## Story File

**Location:** `docs/stories/WORKSPACE-CLEANUP.story.md`
**Status:** Ready (T1+T2 DONE, Gates 1-2 PASS)
**File List:** Updated after each task
**Acceptance Criteria:** See story

---

## Notes

- Framework (`.aiox-core/`, `.claude/`) **untouched** ✅
- Project runtime (`packages/`, `docs/`, `squads/`) **untouched** ✅
- Zero risk operation — all deletes are trash/old items

---

**Ready to proceed?** → Start T3

— Orion, delegating correctly 🎯

---
