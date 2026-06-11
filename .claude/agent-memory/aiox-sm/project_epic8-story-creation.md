---
name: project_epic8-story-creation
description: EPIC-8 Framework Evolution story creation progress (Phase 1 + Phase 2 done, Phase 3-4 remaining)
metadata:
  type: project
---

EPIC-8 (Framework Evolution) story creation, driven by handoff `.aiox/handoffs/handoff-epic8-spec-to-stories.yaml` (@po → @sm, 2026-06-11).

**Status as of 2026-06-11:**
- Phase 1 (Observability): stories 8.1.1-8.1.8 created (Draft), 13.5sp — done in earlier session
- Phase 2 (IDS Enhancement): stories 8.2.1-8.2.9 created (Draft), 17sp — done this session
- Phase 3 (Squad Creator, 8.3.1-8.3.8, 15sp) and Phase 4 (Auto-Healing, 8.4.1-8.4.4, 5.5sp) — NOT yet created

**Why:** PO validated the Master PRD (9/10, GO) and 4 sharded PRDs (`docs/prd/epic-8/phase-{1,2,3,4}-*.md`); each phase PRD is the AC source of truth, extracted verbatim per Article IV (No Invention).

**How to apply:** Next @sm session should pick up Phase 3 (`docs/prd/epic-8/phase-3-squad-creator.md`, stories 8.3.1-8.3.8). Before drafting, check the [[project_epic8-phase2-open-questions]] memory for architecture decisions that may have been resolved by @po/@architect during Phase 2 validation — those decisions (especially CLI vs REST hosting model, dashboard hosting) likely recur in Phase 3 since Squad Creator also needs to register new agents in the entity registry (per PRD "Carry-forward to Phase 3").
