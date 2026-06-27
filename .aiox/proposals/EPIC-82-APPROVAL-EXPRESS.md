# EPIC-82 L1 Amendment — APPROVAL EXPRESS REQUEST

**Date:** 2026-06-27  
**Priority:** URGENT (blocking Story 82.1 completion)  
**To:** @aiox-master (Orion)  
**From:** @dev (Dex)  
**Amendment ID:** ART-VII-2026-001

---

## Summary

**Request:** Formal approval for 2 L1 files in EPIC-82 to unblock Story 82.1 release.

**Context:**
- Story 82.1 (Activation Engine) is complete: 21/21 tests PASS, diagnostics OK
- Amendment proposal filed 2026-06-27 (`.aiox/proposals/EPIC-82-L1-amendment.md`)
- 2/4 L1 files already have informal approval (l2-agent.js, synapse-diagnostics.js marked as "LOW risk")
- 2/4 files pending: **engine.js** and **formatter.js** (MEDIUM risk, backward-compatible changes only)

**Blocker:** Story 82.1 task marked "AWAITING approval" — cannot touch L1 until formal response

---

## Files Requiring Approval

### 1. `.aiox-core/core/synapse/engine.js` (Story 82.2, 82.4, 82.6)

**Change:** Add optional 3rd parameter to `process()` method  
**Risk:** 🟡 MEDIUM (signature extension, 100% backward-compatible)  
**Lines:** ~40 changes

```javascript
// BEFORE
process(prompt, session) { ... }

// AFTER
process(prompt, session, processConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...processConfig };
  // ... pass manifest forward
}
```

**Why safe:**
- Existing calls with 2 args: ✅ WORK (default param handles it)
- No breaking API change
- Change localized to `engine.js` lines 263–328

---

### 2. `.aiox-core/core/synapse/output/formatter.js` (Story 82.2, 82.6)

**Change:** Extend output structure to include manifest metadata  
**Risk:** 🟡 MEDIUM (output structure extended, consumer-compatible)  
**Lines:** ~25 changes

```javascript
// BEFORE
return { layers: [...] }

// AFTER
return {
  layers: [...],
  manifest: { domains: {}, timestamp: ... },
  metadata: { ... }
}
```

**Why safe:**
- Consumers only read `layers` → unaffected
- New `manifest` key is additive
- Existing code: ✅ WORK

---

## Approval Checklist

Please confirm (yes/no):

- [ ] **Risk assessment accepted** — MEDIUM changes are acceptable for EPIC-82
- [ ] **Backward compatibility verified** — existing consumers unaffected
- [ ] **L1 boundary respected** — changes stay within core/synapse/ layers only
- [ ] **Implementation plan tracked** — Article VII governance maintained

---

## Next Step Upon Approval

Once approved:
1. Mark this document status: ✅ APPROVED
2. Story 82.1 proceeds with L1 modifications (FC-4 task unblocked)
3. Stories 82.2, 82.4, 82.6 use this approval as umbrella

---

**Status:** AWAITING RESPONSE  
**Urgency:** HIGH (Story 82.1 blocked, ready to release)  
**Timeline:** Same-day response requested if possible

