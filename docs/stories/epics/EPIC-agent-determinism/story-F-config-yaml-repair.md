# Story F — Repair Malformed YAML in core-config.yaml

**Epic:** EPIC-agent-determinism  
**Story ID:** F  
**Priority:** P0  
**Status:** Done  
**Created:** 2026-06-14  
**Completed:** 2026-06-14  

## Context

The `.aiox-core/core-config.yaml` file had a malformed YAML structure with orphaned lines that had been displaced from their correct location in the `boundary:` section.

**Problem:**
- Lines 370-379 contained orphaned list items (`- .aiox-core/infrastructure/**`, etc.) that should have been under `boundary.protected:` and `boundary.exceptions:`
- These items were incorrectly nested after `autoClaude.qa:enabled: false`
- The `boundary:` section (lines 168-171) was incomplete, lacking the `protected:` and `exceptions:` keys

## Acceptance Criteria

- [x] **AC-F1:** Expand `boundary:` section to include `protected:` and `exceptions:` keys
- [x] **AC-F2:** Move orphaned list items from lines 373-379 to correct `boundary.protected:` location
- [x] **AC-F3:** Move `exceptions:` block from incorrect position to correct `boundary.exceptions:` location
- [x] **AC-F4:** Verify YAML syntax is valid (no parsing errors)
- [x] **AC-F5:** Verify `protected:` key name matches consumer schema (generate-settings-json.js:48)
- [x] **AC-F6:** Gate review by @architect — APPROVE verdict
- [x] **AC-F7:** No L1/L2 changes; only L3 (core-config.yaml) modified

## Implementation Summary

**Branch:** `claude/epic-agent-determinism-story-f-ghuhmv`

**Commits:**
1. `f7ca2a2` — Initial YAML structure repair (moved orphaned blocks to `boundary:`)
2. `bd98a19` — Corrected key name `deny:` → `protected:` to match consumer schema

**Changes:**
- Expanded `boundary:` section (lines 168-184) with properly formatted `protected:` and `exceptions:` keys
- Removed orphaned list items from after `autoClaude.qa:`
- Validated against:
  - `/home/user/kairos-cerebro/.aiox-core/infrastructure/scripts/generate-settings-json.js:48`
  - `/home/user/kairos-cerebro/.aiox-core/core/doctor/checks/settings-json.js:37`

## File List

- `.aiox-core/core-config.yaml` — YAML structure repaired (lines 168-184)

## Testing

- ✅ YAML syntax validation — PASS
- ✅ Schema key alignment (protected:) — PASS  
- ✅ Architecture gate review — APPROVE
- ✅ No operational impact today (frameworkProtection: false)
- ✅ Latent security gap fixed for 2026-06-19 re-enable

## Definition of Done

- [x] All acceptance criteria met
- [x] Code review passed (architecture gate)
- [x] YAML structure corrected
- [x] Schema alignment verified
- [x] No breaking changes to existing consumers
- [x] Story status: **Done**

---

**Owner:** @config-engineer (implementation) + @architect (gate)  
**Delivered:** 2026-06-14 15:45 UTC
