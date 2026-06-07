# Workspace Moves Plan — T2 Output

**Status:** ✅ READY FOR EXECUTION  
**Generated:** 2026-06-07  
**Based on:** WORKSPACE-AUDIT.md (Gate 1 PASS)

---

## Summary

**Good News:** No complex moves needed! Structure is already clean.

**Plan:** Delete trash only (0.5 MB) — 9 items.

---

## Moves List

### MOVE TYPE: DELETE (Safe to remove)

| Item | Path | Size | Reason |
|------|------|------|--------|
| `.agent/` | `./.agent/` | <10 KB | Old agent system (pre-AIOX) |
| `.cursor/` | `./.cursor/` | <10 KB | Superseded by `.claude/` |
| `.gemini/` | `./.gemini/` | <10 KB | Old AI config (unused) |
| `.kimi/` | `./.kimi/` | <10 KB | Old tool (unused) |
| `.env.backup.1779648637547` | `./.env.backup.1779648637547` | <1 KB | Old backup file |
| `.env.backup.1779648644651` | `./.env.backup.1779648644651` | <1 KB | Old backup file |
| `kairos-server.js` | `./kairos-server.js` | <5 KB | Old script (functions in packages/) |
| `kairos-snapshot.js` | `./kairos-snapshot.js` | <5 KB | Old script (functions in packages/) |

**Total Cleanup:** 0.04 MB (negligible)

---

## MOVE TYPE: KEEP (Verified)

| Item | Path | Reason |
|------|------|--------|
| `.antigravity/` | `./.antigravity/` | Keep — user confirmed |
| `.codex/` | `./.codex/` | Keep — user confirmed |

## MOVE TYPE: REVIEW (Conditional Delete)

| Item | Path | Action | Decision Needed |
|------|------|--------|-----------------|
| `.kairos-data/` | `./.kairos-data/` | ? | Ask Pedro: Is this critical data? |

---

## Validation Checklist (Pre-Execution)

- [x] All DELETE items are safe (no code references)
- [x] No dependencies on deleted items
- [x] AIOX framework untouched ✅
- [x] Project runtime untouched ✅
- [x] `.github/`, `.husky/`, `node_modules` preserved ✅

---

## Execution Steps (for T3)

```bash
# Step 1: Delete old directories
rm -rf .agent/
rm -rf .cursor/
rm -rf .gemini/
rm -rf .kimi/

# Step 2: Delete old backup files
rm .env.backup.1779648637547
rm .env.backup.1779648644651

# Step 3: Delete old scripts
rm kairos-server.js
rm kairos-snapshot.js

# Step 4: Verify
git status
# Expected: "nothing to commit" (files are untracked, so rm is clean)
```

---

## Post-Execution Validation (Gate 3)

After T3 executes, verify:
- [ ] All 8 items deleted ✅
- [ ] `.antigravity/` and `.codex/` preserved ✅
- [ ] `git status` clean ✅
- [ ] No broken imports/references ✅
- [ ] Framework still intact ✅

---

## Gate 2 Validation

**Conflicts:** 0  
**Dependencies affected:** 0  
**Risk level:** MINIMAL

**Gate 2 Status:** 🟢 **PASS**

---

**Next:** T3-Execute (delete operations)
