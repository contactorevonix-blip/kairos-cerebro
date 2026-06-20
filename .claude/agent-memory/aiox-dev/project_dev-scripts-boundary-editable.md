---
name: dev-scripts-boundary-editable
description: .aiox-core/development/scripts/ is editable by @dev — NOT in deny rules nor PROTECTED_PREFIXES (unlike tasks/templates/checklists/workflows)
metadata:
  type: project
---

`.aiox-core/development/scripts/` is editable by @dev. Confirmed empirically in Story 12.3 (2026-06-20): Write to a new module + Edit to `unified-activation-pipeline.js` both succeeded at runtime with the Art. VI-VII boundary gate active.

**Why:** The deny list in `.claude/settings.json` covers `development/tasks/`, `development/templates/`, `development/checklists/`, `development/workflows/`, `infrastructure/`, `core/`, `constitution.md`, `bin/` — but NOT `development/scripts/`. The hook `enforce-quality-gates.cjs` `PROTECTED_PREFIXES` matches the same set and `isProtectedPath()` returns false for `development/scripts/*`.

**How to apply:** When a Story specs work in `.aiox-core/development/scripts/` (e.g. the activation pipeline, greeting-builder, agent-config-loader), implement it directly — no @aiox-master *propose-modification needed. This is a narrower truth than my EPIC-8 memories ([[project_epic8_phase3_l1_path_conflict]], [[project_epic8_phase4_l1_blocker]]) which were about genuine `core/` (L1) paths — those ARE blocked. `development/scripts/` is a grey zone that IS writable. Verify against current `settings.json` deny + `enforce-quality-gates.cjs` PROTECTED_PREFIXES before relying on this; the boundary set can change.
