# 🚀 Cont 52 Startup Prompt

**Copy-paste this para iniciar Cont 52 com contexto completo**

---

```
Cont 52 iniciando: EPIC-13 stories completion + @dev implementation start

CHECKPOINT:
- Cont 50: ✅ Production deployment (5 commits) + EPIC-13 PRD created
- Cont 51: ✅ EPIC-13 PRD validated (10/10 @po PASS) + stories 13.1-13.2 created
- Status: Awaiting completion of stories 13.3-13.10 + @dev implementation

AGENDA:
1. Complete remaining stories (13.3-13.10) from template
2. @po validate all 10 stories (10-point checklist each)
3. @dev implements story 13.1 (foundation layer loader)
4. @qa validates 13.1 when dev marks Ready for Review

FILES READY:
- EPIC-13 PRD: docs/stories/epics/EPIC-13-PRD.md (validated ✅)
- Stories 13.1-13.2: docs/stories/13.{1,2}.story.md (templates ✅)
- Story template: .aiox/handoffs/HANDOFF-CONT51-TO-CONT52-STORIES-COMPLETE.md (reference)

NEXT IMMEDIATE ACTION:
Create stories 13.3-13.10 using the template from 13.1-13.2 as reference.

DEPENDENCY CHAIN (for @dev planning):
- 13.1 (blocks all)
  → 13.2-13.6 (parallel after 13.1)
    → 13.7 (memory, depends on all)
      → 13.8-13.10 (sequential)

Let's bora!
```

---

## Prompt alternativo (mais direto):

```
@dev: Implement story 13.1 (SYNAPSE Foundation Layer Loader)

Source: docs/stories/13.1.story.md
PRD: docs/stories/epics/EPIC-13-PRD.md

Key points:
- Core loader engine for 8-layer SYNAPSE activation
- Validate DAG before execution
- Load Constitution + Global rules
- Atomic transitions (all-or-nothing)
- Log to .aiox/context-load-logs/
- Performance: <2s cold, <500ms cached
- Blocks stories 13.2-13.10

Ready when you see this. Go!
```
