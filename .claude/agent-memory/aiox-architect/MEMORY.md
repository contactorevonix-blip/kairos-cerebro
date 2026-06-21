# Architect Agent Memory

## Pointers
- [Control Plane Design](project-control-plane-design.md) — Monitor+Control Plane arch for 150+ Claude Code windows (Node/Fastify/SQLite-WAL/WS/React), ADRs + existing-artifact anchors
- [EPIC-2 Expert Cloning Review](project-expert-cloning-epic2.md) — CONCERNS verdict: Art. II authority conflict (FAIL) + 5 scope fixes (CLI-first, pgvector cut, cost model, RLS, LangGraph) before infra build
- [Story 5.2 Governance Prevention](project-story52-governance-prevention.md) — Phase 2 complete: SYNC-FINDINGS + AMBIGUITIES + 9 preventive controls (PROCESS-IMPROVEMENTS.md, 6.25h, propose-only) tracing to V-DRIFT-004/FP-01..05/DATA-REF
- [SYNAPSE Enforcement EPIC-9](project-synapse-enforcement-epic9.md) — Cont 36: Option A under new EPIC-9 (9.0 retire dead validator → 9.1∥9.2). Real coverage ~22%; pre-tool-use-validator.cjs is dead code; Cont 35 docs contradict on scope
- [EPIC-12 Viability](project-epic12-viability.md) — AJUSTAR verdict: Three-Surface agent trap (.claude/agents/ has no generator), 3 synapse/** boundary blocks, pipeline PR-0+slots sequencing, tests/tasks REUSE collision
- [XX.1 L1 Authorization Review](project-xx1-l1-authorization-review.md) — NO-GO on 3-file L1 proposal: duplicates Story 13.1 + ide-sync (Art. IV-A). Reduce to 1-2 writes; cut the 2 .aiox-core/core/ files; @aiox-master decides, not @architect

## EPIC-ACT Wave 2 Quality Gate Review (2026-02-06)
- Reviewed: ACT-6 (Unified Activation Pipeline, 67 tests, APPROVED)
- Total EPIC-ACT: 255 tests pass across 4 test suites (0 regressions)
- UnifiedActivationPipeline: single entry point, 5-way parallel load, 3-phase sequential, GreetingBuilder final
- Timeout architecture: 150ms per-loader, 200ms total pipeline, fallback greeting on failure
- Timer leak concern: _timeoutFallback setTimeout not cancelled when pipeline wins the race (advisory, not blocking)
- generate-greeting.js refactored to thin wrapper; backward compatible
- All 12 agent .md files updated with unified STEP 3 reference
- *validate-agents command added to aiox-master (validate-agents.md task file)

## EPIC-ACT Wave 1 Quality Gate Review (2026-02-06)
- Reviewed: ACT-1 (config fix, merged), ACT-2 (user_profile audit, 31 tests), ACT-3 (ProjectStatusLoader, 90 tests), ACT-4 (PermissionMode, 67 tests)
- All 188 tests pass across 3 test suites
- Key patterns: fingerprint-based cache invalidation, file locking with wx flag, mode cycling (ask>auto>explore)
- PermissionMode reads from `.aiox/config.yaml`, NOT from `.aiox-core/core-config.yaml` - different config hierarchy
- GreetingPreferenceManager reads from `.aiox-core/core-config.yaml` (agentIdentity.greeting.preference)
- The *yolo command cycles PermissionMode; it does NOT directly change greeting preference

## Architecture Patterns to Track
- Agent activation: UnifiedActivationPipeline is now THE single entry point for all 12 agents (ACT-6)
- Previous two paths (Direct 9 agents + CLI wrapper 3 agents) are now unified
- generate-greeting.js is thin wrapper around UnifiedActivationPipeline (backward compat)
- user_profile cascades: config-resolver > validate-user-profile > greeting-preference-manager > greeting-builder
- Permission system: permission-mode.js + operation-guard.js + index.js (facade)
- ProjectStatusLoader: .aiox/project-status.yaml (runtime cache), separate from .aiox-core/ (framework config)
- PM agent bypasses bob mode restriction in _resolvePreference()

## Key File Locations
- Unified Pipeline: `.aiox-core/development/scripts/unified-activation-pipeline.js`
- Permissions: `.aiox-core/core/permissions/`
- Greeting system: `.aiox-core/development/scripts/greeting-builder.js`, `greeting-preference-manager.js`
- Project status: `.aiox-core/infrastructure/scripts/project-status-loader.js`
- User profile validation: `.aiox-core/infrastructure/scripts/validate-user-profile.js`
- Post-commit hook: `.aiox-core/infrastructure/scripts/git-hooks/post-commit.js` + `.husky/post-commit`
- Validate agents task: `.aiox-core/development/tasks/validate-agents.md`

## Pre-existing Test Failures (not EPIC-ACT related)
- squads/mmos-squad/ (6 suites): missing clickup module
- tests/core/orchestration/ (2 suites): greenfield-handler, terminal-spawner
