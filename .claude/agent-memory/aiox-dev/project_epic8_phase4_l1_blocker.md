---
name: epic8-phase4-l1-blocker
description: EPIC-8 Phase 4 (Auto-Healing) stories 8.4.1-8.4.4 spec their main modules under .aiox-core/core/ (L1, blocked by Art. VI-VII gate). Unlike Phase 3, these ARE genuine framework-core infra — relocating to L4 would be architecturally wrong. Resolution is upstream.
metadata:
  type: project
---

EPIC-8 Phase 4 stories 8.4.1-8.4.4 (Auto-Healing) each spec their MAIN module under `.aiox-core/core/` (L1 Framework Core), in the Acceptance Criteria themselves (not just File List), and the PRD `docs/prd/epic-8/phase-4-auto-healing.md` confirms the same paths at the design level:

- 8.4.1 AC/File List: `.aiox-core/core/gates/coderabbit-circuit-breaker.js`
- 8.4.2 AC1: `.aiox-core/core/auto-heal/story-validator.js`
- 8.4.3 AC1: `.aiox-core/core/gates/gate-retry.js`
- 8.4.4 AC1: `.aiox-core/core/auto-heal/blocker-resolver.js`

**Verified deterministically (2026-06-12)** via `require('./.claude/hooks/enforce-quality-gates.cjs').isProtectedPath(...)`:
- All four module paths → BLOCKED (L1, `.includes('.aiox-core/core/')`).
- The data files (`.aiox-core/data/{story-validation-patterns,blocker-patterns}.json`, `gate-retry-config.yaml`), `core-config.yaml` (L3), `.claude/rules/coderabbit-integration.md`, and all `tests/**` paths → allowed.
- `settings.json` allow-list covers existing L1 subdirs (code-intel, config, synapse, ...) but NOT the new `core/gates/` or `core/auto-heal/` dirs. Even if it did, the hook blocks regardless of settings.json.

**Why this differs from Phase 3 ([[project_epic8_phase3_l1_path_conflict]]):** In Phase 3 the blocked modules were a *product* (squad-creator) that legitimately belonged in `squads/` (L4), so @po's re-path to `squads/squad-creator/core/` was semantically correct. Phase 4 modules are *genuine framework-core infrastructure*: a quality-gate circuit breaker, retry logic for constitutional gates, story-validation auto-heal. They consume/extend the enforcement system itself (`.claude/hooks/`, `core-config.yaml gates.retry_policy`, `.aiox/gate-logs/`). Relocating them to `squads/` or `docs/` would be architecturally wrong — they ARE L1 by design.

**Why blocked (not auto-decided):** Art. VI-VII framework-boundary writes are NON-overridable at the @dev layer (`enforcement-gates.md`: "Not overridable here: framework-boundary writes ... route framework changes through @aiox-master *propose-modification"). User feedback [[feedback-git-push-authority]] / framework-governance: "Se o sistema bloqueia → PARAR, não contornar". So @dev cannot implement these 4 stories as specced, and cannot autonomously relocate genuine framework infra to L4.

**How to apply / resolution paths (upstream):**
1. Preferred: @aiox-master `*propose-modification` to author the 4 L1 modules through the framework-governance path (these are legitimate framework additions, matching the PRD intent), then @dev implements the L3 data files + L4 tests that consume them.
2. Alternative: toggle `core-config.yaml → boundary.frameworkProtection: false` for a framework-contributor session (the project default is `true`). This is a @aiox-master/@po decision, NOT a @dev one.
3. NOT acceptable: @dev silently re-pathing framework infra to `squads/`/`docs/` (architecturally wrong + governance violation).

Related: [[project_epic8_phase3_l1_path_conflict]] (same boundary class, opposite correct resolution).
