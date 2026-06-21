# Memory Index — aiox-qa

- [Business Squad Agent Structure](project_business-squad-agent-structure.md) — 7 agents do squad business têm persona excelente mas faltam frontmatter/activation/comandos (NEEDS_WORK 58/100, audit 2026-05-29)
- [Story ID Collisions PHASE 4](project_duplicate-story-1-16-id-collision.md) — 1.16/1.17 colisões RESOLVIDAS (renumeração→1.19/1.20); 1.17 Task-First + 1.18 PASS, 1.20 Handoff CONCERNS (zero testes p/ AC "no data lost")
- [Epic5 Constitution Validation](project_epic5-constitution-validation.md) — Story 5.2 colide entre 2 epics; Task 1.2 score 62 NEEDS_WORK (2 HIGH Art.V: lint/build off; drift Art VII/IV-A phantom na constitution)
- [aiox-cerebro Stress Test](project_aiox-cerebro-stress-test.md) — Kronos 6/8 PASS = USE WITH CAUTION; FAIL em layer-awareness (L1-L4) e contradictions (story-lifecycle/no-invention)
- [Framework Boundary Toggle No-op](project_framework-boundary-toggle-noop.md) — runtime gate é no-op p/ L1/L2 com frameworkProtection=false (expirou 2026-06-19); settings.json deny rules são o backstop real. Story 12.1 PASS.
- [EPIC12 Wave1 Barrier Gate](project_epic12-wave1-barrier-gate.md) — 12.1 PASS + 12.2 PASS = Barrier Gate 1 cleared (Wave 2 pode iniciar); Art. II 4-path detection + detectionSource additive verificado em log runtime real (QA 2026-06-20)
- [EPIC12 Wave2 Barrier Gate](project_epic12-wave2-barrier-gate.md) — 12.4 Art. IV two-layer no-invention gate PASS (31/31 tests, E2E exit 0/2); Barrier Gate 2 (12.3+12.4) cleared; pre-existing 12.1 MultiEdit test gap NÃO é blocker
- [EPIC12 Wave2 FR-4.2 Scope Gap](project_epic12-wave2-fr42-scope-gap.md) — 12.3 CONCERNS: AC7/FR-4.2 "937+ ln" é expansão AGREGADA do pipeline, NÃO o lineCount da surface vencedora (shim=102 ln); reconciler sozinho não satisfaz — routed @po
- [EPIC12 Wave2+3 QA Gate](project_epic12_wave23_qa_gate.md) — 12.5-12.14 CONCERNS: work sound (275/275 hooks, 0 regress, no invention) mas @dev pulou @qa gate + self-signed 12.11/12.14 (PROC-001/002); @qa supriu gates retroativamente. EPIC-12 APPROVED.
