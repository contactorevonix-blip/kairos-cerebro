# Story 82.2 — L3-L7 re-enablement (EPIC-82 continuation)

**Epic:** EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7)  
**Story ID:** 82.2  
**Status:** Draft  
**Created:** 2026-06-27 (Cont 84)  
**Author:** River (@sm)  
**Depends on:** Story 82.1 (COMPLETE)

---

## 📋 Overview

Complete SYNAPSE L3-L7 layer re-enablement by wiring the manifest parser to the engine, implementing lazy-activation triggers per layer, and fixing the L7 command parser to handle `[*command]` delimiters correctly. This story closes gaps G2-G5 (manifest wiring, L3-L7 disabled, command parsing) and unblocks the L2 agent injection from Story 82.1.

**Key Context:** The audit (Cont 83) found L3-L7 were hard-disabled via `DEFAULT_ACTIVE_LAYERS=[0,1,2]` not because the code was broken, but because its data inputs (parsed manifest, active workflow/task flags) were never wired to the engine. This story connects those pieces.

---

## ✅ Acceptance Criteria

### AC1: Manifest wiring to engine (FR-3, Gap G2)
- [ ] `engine.js` calls `parseManifest()` on startup and caches the result in `engine.manifest`
- [ ] Engine passes `manifest.domains` into layer L2 context so `l2-agent.js:59` domain lookup succeeds for active agent
- [ ] Fallback: if manifest parse empty, L2 still attempts direct file load `.synapse/agent-{id}` (FR-4 fallback)
- [ ] Unit test: `parseManifest()` called ≥1 time per engine lifecycle
- [ ] Integration test: active agent domain resolves to correct rule file

### AC2: Lazy activation triggers (FR-5, Gap G3)
- [ ] L3 (workflow): activates only if `session.active_workflow` is set; else skipped (0 rules)
- [ ] L4 (task): activates only if `session.active_task` is set; else skipped
- [ ] L5 (squad): activates only if `session.active_squad` is set; else skipped
- [ ] L6 (keyword): activates only if keyword match found in prompt; else skipped
- [ ] L7 (star-command): activates only if `*command` token present in prompt; else skipped
- [ ] Replace `DEFAULT_ACTIVE_LAYERS` hard list with per-layer trigger evaluation in engine
- [ ] Unit test: each layer returns `[]` (no rules) when trigger condition is false
- [ ] Unit test: each layer returns rules when trigger condition is true

### AC3: L7 command parser fix (FR-11, Gap G5)
- [ ] `.synapse/commands` file format documented: command blocks delimited by `[*command]` markers (not `#` comments)
- [ ] `l7-star-command.js:139-166` (`_parseCommandBlocks`) updated to detect and extract `[*command]` ... `[*end]` blocks (or equivalent)
- [ ] Test data: `.synapse/commands-test.yaml` with `[*brief]`, `[*dev]`, `[*qa]` sample blocks
- [ ] Unit test: `_parseCommandBlocks()` extracts all blocks, matching command name
- [ ] Integration test: `synapse-diagnostics` detects `*command` in prompt and reports L7 rules count > 0

### AC4: Session context persistence bridge (FR-1, FR-2, Part 2)
- [ ] Verify Story 82.1 wrote `active_agent.id` to sessions file (`fr-1-bridge.cjs`)
- [ ] Extend to write `active_workflow` and `active_task` in same bridge hook (if not already done in 82.1)
- [ ] Test: on prompt with detected workflow (e.g., `*draft`), session file has `active_workflow.id = "story_development"`
- [ ] Test: on prompt with detected task (e.g., "Story 82.3"), session file has `active_task = "82.3"`

### AC5: Integration test suite (FR-12, NFR-4)
- [ ] Create `tests/SYNAPSE-L3-L7-integration.test.js` covering:
  - Full pipeline (L0 + L1 + L2 agent + L3 workflow) for a session with active agent + active workflow
  - Pipeline with L7 `*command` token, verify L7 rules injected
  - Lazy activation: prompt with no active workflow → L3 skipped, 0 rules
  - Determinism: same session state + prompt → identical output (golden snapshot)
  - Timeout respect: all combinations execute within 100ms cap
- [ ] Golden snapshots: `.snapshots/synapse-L{2-7}*.golden.txt` per layer
- [ ] Test pass rate: 100% (no skipped/xfail tests)

### AC6: `synapse-diagnostics` acceptance gate (FR-12)
- [ ] Update `synapse-diagnostics.js` to report per-layer status (L0-L7):
  - `status`: active / skipped / error
  - `rules_count`: number of rules produced (or 0 if skipped)
  - `duration_ms`: layer execution time
- [ ] Gate criteria: session with active agent + `*command` in prompt MUST report:
  - L2 status = active, rules_count > 0
  - L7 status = active, rules_count > 0
  - No ERROR layers
- [ ] CLI: `node diagnostics/synapse-diagnostics.js --check` exits 0 (PASS) or 1 (FAIL)
- [ ] Validation: run diagnostics on real session; confirm L2-L7 wired

### AC7: No regressions (NFR-5)
- [ ] L0 Constitution output identical to prior (no changes)
- [ ] L1 Global output identical to prior (no changes)
- [ ] Sessions with no active agent produce same rules as Cont 83 (backward compat)
- [ ] Run full test suite: `npm test` pass, coverage not decreased

### AC8: Framework boundary compliance (CON-1)
- [ ] Engine changes documented as amendment proposal (if L1 core touched)
- [ ] Hook changes (L4) require no amendment (freely modifiable)
- [ ] All changes pass `enforce-quality-gates.cjs` (framework boundary hook)

---

## 📊 Story Details

**Epic Context Reference:** `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md` (§2-3: Requirements + Design)

**Dependency Chain:**
```
Story 82.1 (L1 enforcement + session write bridge)
    ↓
Story 82.2 (THIS) — manifest wire, lazy activation, L7 parser
    ↓
Story 82.3 (L2 agent context tests)
    ↓
Stories 82.4-82.6 (L3-L7 content expansion, edge cases, performance)
```

**In Scope (82.2):**
- Manifest parser wiring to engine
- Per-layer lazy activation triggers (L3-L7)
- L7 command block parser fix
- Extend session bridge for active_workflow + active_task (if 82.1 didn't)
- Integration tests (L2-L7 full pipeline)
- synapse-diagnostics gate

**Out of Scope (82.3-82.6):**
- Content creation for L3-L7 domain files (story 82.3+)
- Performance optimization (story 82.5)
- Edge cases (story 82.6)

---

## 🛠️ Technical Notes

### Manifest Wiring (AC1)

**Current state:**
- `domain-loader.js:49` exports `parseManifest()` (exists, tested)
- `engine.js:236` constructs engine with no manifest passed
- No layer can resolve domains from manifest

**Change required:**
```javascript
// engine.js:190 (startup)
const manifest = parseManifest(cwd);  // Load once
engine.manifest = manifest;           // Cache

// engine.js:300+ (layer processing)
const context = {
  domains: engine.manifest?.domains || {},
  // ... other context
};
const result = layer._safeProcess(context);
```

### Lazy Activation Algorithm

Replace this:
```javascript
const DEFAULT_ACTIVE_LAYERS = [0, 1, 2];
for (const layerId of DEFAULT_ACTIVE_LAYERS) { ... }
```

With this:
```javascript
const LAYER_TRIGGERS = {
  0: () => true,                                 // L0 always
  1: () => true,                                 // L1 always
  2: () => session.active_agent?.id != null,    // L2 if agent
  3: () => session.active_workflow?.id != null, // L3 if workflow
  4: () => session.active_task != null,         // L4 if task
  5: () => session.active_squad != null,        // L5 if squad
  6: () => prompt.includes('keyword'),          // L6 if keyword (mock for now)
  7: () => /\*\w+/.test(prompt),                // L7 if *command token
};

for (let layerId = 0; layerId <= 7; layerId++) {
  if (!LAYER_TRIGGERS[layerId]()) {
    metrics.layerSkipped[layerId]++;
    continue;
  }
  const result = layers[layerId]._safeProcess(context);
  // ...
}
```

### L7 Command Parser

**Current `.synapse/commands` format (broken):**
```
# [*brief]
Some rule...

# [*dev]
Another rule...
```

Strips comments first → delimiters lost → `_parseCommandBlocks()` finds 0 matches.

**Fixed format (YAML):**
```yaml
'[*brief]': |
  SYNAPSE_OUTPUT_STYLE: ultra-concise
  [rule content]

'[*dev]': |
  SYNAPSE_OUTPUT_STYLE: developer-focused
  [rule content]
```

Or **inline delimiters** (clearer):
```
[*brief]
SYNAPSE_OUTPUT_STYLE: ultra-concise
[*brief-end]

[*dev]
SYNAPSE_OUTPUT_STYLE: developer-focused
[*dev-end]
```

Parser detects `[*{cmd}]` markers, extracts until `[*{cmd}-end]` or next `[*other]`.

---

## 📝 Definition of Done

- [ ] All ACs 1-8 verified
- [ ] `npm run lint` passes (no errors/warnings)
- [ ] `npm run typecheck` clean
- [ ] `npm test` passes (100% relevant test coverage, no skipped)
- [ ] `npm run build` succeeds
- [ ] CodeRabbit review: no CRITICAL issues
- [ ] `synapse-diagnostics` gate: PASS (with test session)
- [ ] File list updated below
- [ ] Story status: Ready for Review (signed off by @dev)

---

## 📂 File List

**To be updated by @dev during implementation:**

| File | Type | Change | Notes |
|------|------|--------|-------|
| `.aiox-core/core/synapse/engine.js` | modify | Add manifest load + lazy triggers | L1 core; amendment if needed |
| `.aiox-core/core/synapse/l7-star-command.js` | modify | Fix command parser for `[*cmd]` delimiters | L1 core; amendment if needed |
| `.aiox-core/core/synapse/layer-triggers.js` | create | LAYER_TRIGGERS config object | L1 core helper; new file |
| `.claude/hooks/fr-1-bridge.cjs` | modify | Extend for active_workflow + active_task | L4 hook (from 82.1) |
| `.synapse/commands` | modify | Adopt new delimiter format, add test blocks | L4 config |
| `.synapse/commands-test.yaml` | create | Test fixture: `[*brief]`, `[*dev]`, `[*qa]` blocks | L4 test data |
| `tests/SYNAPSE-L3-L7-integration.test.js` | create | Full L2-L7 pipeline tests + golden snapshots | L4 test |
| `tests/snapshots/synapse-L*.golden.txt` | create | Golden output per layer (AC5) | L4 test artifact |
| `diagnostics/synapse-diagnostics.js` | modify | Add per-layer status reporting | L4 tool |

---

## 🔄 Workflow & Handoff

**Next Steps (after @po validation):**

1. **@dev implementation** (Cont 84-85)
   - Start with AC1 (manifest wiring) — unblocks L2
   - Then AC2 (lazy triggers)
   - Then AC3 (L7 parser) in parallel
   - Then AC5-6 (tests + diagnostics)
   - Validate ACs 4, 7, 8 at end

2. **@qa gate** (Cont 85)
   - Verify all ACs 1-8
   - Run integration test suite (AC5)
   - Run `synapse-diagnostics` gate (AC6)
   - Regression check (AC7)

3. **@devops push** (Cont 85-86)
   - PR creation + merge
   - Deploy to Railway (if applicable)

---

## 🚨 Known Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Framework boundary (CON-1) | Engine edit may need amendment | Prepare amendment proposal early; test on local branch first |
| Lazy activation + regression | Backward compat break | AC7 ensures Sessions without active agent = same output as Cont 83 |
| Command parser format change | Existing `.synapse/commands` may break | Detect old format, fallback, add migration guide in docs |
| 100ms timeout pressure | L3-L7 + manifest parse may exceed | Lazy activation (only active layers) + caching manifest mitigates |

---

## 📌 Related Documents

- **PRD:** `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md` (FRs, NFRs, constraints, design decisions)
- **Story 82.1:** `epic-82.story-1.story.md` (L1 enforcement gap — COMPLETE)
- **Audit findings:** `.synapse/AUDIT.md` (gaps G1-G5 documented, Cont 83)
- **Constitution:** `.aiox-core/constitution.md` (Art. IV-A IDS, Art. VI-VII framework boundary)

---

**Status:** 🟡 Draft → awaiting @po validation (10-point checklist)  
**Estimate:** 13 SP (manifest + lazy activation + parser + tests + diagnostics)  
**Priority:** High (unblocks L2-L7 pipeline)
