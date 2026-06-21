# Memory Index — aiox-dev

- [System Factory Squad](project_system_factory_squad.md) — estrutura/contratos do squad system-factory; workflows e templates criados, ambiente sem js-yaml/Python
- [Constitutional Enforcement Gates](project_constitutional_enforcement_gates.md) — Story 1.16: hooks que aplicam Art. II-VII; override flags, métricas em hook-metrics.json, logs em .aiox/gate-logs/
- [PHASE 4 Stories 1.17/1.18/1.19](project_phase4_stories_117_118_119.md) — Task-First engine em .aiox/, STATE.md hooks (stdin+lock fix), CCM doc fix; engine relocado p/ L4 por deny rules
- [Story 5.2 Phase 2.2 Remediation](project_story52_phase2_remediation.md) — lint/build/frameworkProtection corrigidos; FP-01/02 já em 585acdb; lint scope=governança; gate Art.III bloqueia .json em docs/stories/outputs
- [EPIC-8 Phase 3 L1 Path Conflict](project_epic8_phase3_l1_path_conflict.md) — stories 8.3.x specam módulos em .aiox-core/core/squad-creator/ (L1); gate Art.VI-VII bloqueia Write/Edit; @dev não pode implementar como specced — BLOCKER
- [EPIC-8 Phase 4 L1 Blocker](project_epic8_phase4_l1_blocker.md) — stories 8.4.1-8.4.4 specam módulos em .aiox-core/core/{gates,auto-heal}/ (L1); são framework-core genuíno (≠ Phase 3) — relocar p/ L4 é errado; resolução upstream via @aiox-master *propose-modification — BLOCKER
- [CodeRabbit CLI Flag Change](project_coderabbit-cli-flag-change.md) — `--prompt-only` removido; usar `coderabbit review --agent -t uncommitted`; docs/tasks/skill ainda têm flag antiga
- [EPIC-10 Stories 10.2/10.3](project_epic10_stories_102_103.md) — 10.2: 0 content drift (root cause = core-config.yaml partido); 10.3: verify-only done mas fixes L2 bloqueados por settings.json deny (não pelo toggle) → propose-modification
- [Story 12.1 L1/L2 deny restore](project_story121_l1l2_deny_restore.md) — L1/L2 movidos de allow→deny em settings.json (estavam errados desde EPIC-8); isProtectedPath endurecido. MultiEdit PreToolUse matcher adicionado 2026-06-20 (faltava de facto) — teste AC2 boundary-enforce passa
- [CodeRabbit gate-log false positives](project_coderabbit-gatelog-false-positives.md) — CodeRabbit revê .aiox/gate-logs & task-logs (runtime gitignored) como source; CRITICAL/major daí são out-of-scope p/ stories @dev
- [dev/scripts boundary editable](project_dev-scripts-boundary-editable.md) — .aiox-core/development/scripts/ NÃO está em deny rules nem PROTECTED_PREFIXES; @dev escreve lá direto (≠ core/ L1). Confirmado Story 12.3 (2026-06-20)
- [Story 12.4 Art. IV Layer 2](project_story124_art4_layer2.md) — NEW enforce-spec-reference-validation.cjs valida refs FR/NFR/CON contra requirements.json (L2); AC "150/150 traceable" entregue como mechanism guarantee; GOTCHA: `*/` em comentários .cjs parte o parser
- [EPIC-12 Wave 3 Complete](project_epic12_wave3_complete.md) — só 12.11/12.14 faltavam (resto já Done); stories de verificação/agregação; barrier test + gate files; EPIC-12 APPROVED (hooks 275/275, 0 regressões)
