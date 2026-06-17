# Memory Index — aiox-dev

- [System Factory Squad](project_system_factory_squad.md) — estrutura/contratos do squad system-factory; workflows e templates criados, ambiente sem js-yaml/Python
- [Constitutional Enforcement Gates](project_constitutional_enforcement_gates.md) — Story 1.16: hooks que aplicam Art. II-VII; override flags, métricas em hook-metrics.json, logs em .aiox/gate-logs/
- [PHASE 4 Stories 1.17/1.18/1.19](project_phase4_stories_117_118_119.md) — Task-First engine em .aiox/, STATE.md hooks (stdin+lock fix), CCM doc fix; engine relocado p/ L4 por deny rules
- [Story 5.2 Phase 2.2 Remediation](project_story52_phase2_remediation.md) — lint/build/frameworkProtection corrigidos; FP-01/02 já em 585acdb; lint scope=governança; gate Art.III bloqueia .json em docs/stories/outputs
- [EPIC-8 Phase 3 L1 Path Conflict](project_epic8_phase3_l1_path_conflict.md) — stories 8.3.x specam módulos em .aiox-core/core/squad-creator/ (L1); gate Art.VI-VII bloqueia Write/Edit; @dev não pode implementar como specced — BLOCKER
- [EPIC-8 Phase 4 L1 Blocker](project_epic8_phase4_l1_blocker.md) — stories 8.4.1-8.4.4 specam módulos em .aiox-core/core/{gates,auto-heal}/ (L1); são framework-core genuíno (≠ Phase 3) — relocar p/ L4 é errado; resolução upstream via @aiox-master *propose-modification — BLOCKER
- [CodeRabbit CLI Flag Change](project_coderabbit-cli-flag-change.md) — `--prompt-only` removido; usar `coderabbit review --agent -t uncommitted`; docs/tasks/skill ainda têm flag antiga
- [EPIC-10 Stories 10.2/10.3](project_epic10_stories_102_103.md) — 10.2: 0 content drift (root cause = core-config.yaml partido); 10.3: verify-only done mas fixes L2 bloqueados por settings.json deny (não pelo toggle) → propose-modification
