# IDS-OPS.2 Hook Registration Proposal

**Story:** IDS-OPS.2 (@sm Integration)  
**Status:** Done (Code + Tests), Blocked on L1 Registration  
**Date:** 2026-06-24  
**Requestor:** @dev (Dex) → @aiox-master (Orion)

---

## Proposal

Register the IDS decision engine hook (`ids-integration-sm-draft.cjs`) in `.claude/settings.json` PreToolUse matchers for `Write` and `Edit` operations.

**Rationale:**
- Hook is fully implemented (`tests/ids/sm-integration.test.js`, 24/24 passing)
- Coverage 93.27% line / 100% funcs (exceeds AC3 threshold ≥80%)
- Zero regressions (all existing tests pass)
- Completes AC1 of IDS-OPS.2 ("always call Decision Engine")
- Follows precedent of Story 1.19 (enforce-ids.cjs registration via proposal)

---

## Exact Changes Required

### 1. PreToolUse → Write (after enforce-ids.cjs)

Add this hook object to the `Write` matcher's `hooks` array:

```json
{
  "command": "node \".claude/hooks/ids-integration-sm-draft.cjs\"",
  "timeout": 4,
  "type": "command",
  "statusMessage": "A validar IDS G2 (@sm story creation - REUSE/ADAPT/CREATE)..."
}
```

**Location:** `.claude/settings.json` line ~151 (after enforce-ids.cjs entry in Write matcher)

### 2. PreToolUse → Edit (after enforce-ids.cjs)

Add the **same** hook object to the `Edit` matcher's `hooks` array:

```json
{
  "command": "node \".claude/hooks/ids-integration-sm-draft.cjs\"",
  "timeout": 4,
  "type": "command",
  "statusMessage": "A validar IDS G2 (@sm story creation - REUSE/ADAPT/CREATE)..."
}
```

**Location:** `.claude/settings.json` line ~181 (after enforce-ids.cjs entry in Edit matcher)

---

## Acceptance

✅ Hook code exists and is tested  
✅ Tests pass (24/24, coverage 93.27%)  
✅ Lint clean, TypeScript clean  
✅ Zero regressions  
✅ Story AC1 ("always call") is ready immediately upon registration  

**Once approved:** IDS-OPS.2 becomes fully operational. Story status: Done → Released.

---

## Framework Authority

- **Framework Boundary:** `.claude/settings.json` is L1 (NON-NEGOTIABLE, Art. VI-VII)
- **Authority:** @aiox-master (Orion) exclusive
- **Process:** Formal proposal (this document) per constitution-sync-guard.md precedent
- **Gate:** MUST validate hook command path and timeout before applying

---

**Created:** 2026-06-24 Cont 76  
**For:** @aiox-master *propose-modification
