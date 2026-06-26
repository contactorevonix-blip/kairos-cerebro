# EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7) — Product Requirements Document (PRD)

**Status:** Draft (awaiting @po validation — PRD obrigatório antes de EPIC-82 ir para Ready)
**Author:** Morgan (@pm / Strategist)
**Type:** Brownfield enhancement (extends existing SYNAPSE engine — `.aiox-core/core/synapse/`)
**Track:** Enterprise (Spec Pipeline + PRD; 6 vertical-slice stories)
**Created:** 2026-06-26 (Cont 83)
**Constitutional anchor:** Art. IV (No Invention) — every requirement below traces to a verified code finding, not to the audit narrative.

---

## 0. Grounding Note (read first)

This PRD was written after direct inspection of the live code, not from the Cont-83 audit summary. The audit framing ("Layers 0-1 injected, Layers 2-7 not wired") is partially inaccurate and the requirements correct it. Verified state on 2026-06-26:

| Component | Audit said | Verified reality (file:line) | Impact |
|-----------|-----------|------------------------------|--------|
| L0 Constitution | injected | Works — file-based, no manifest dep (`l0-constitution.js`) | none |
| L1 Global | injected | Works — falls back to `.synapse/global` + `.synapse/context` (`l1-global.js:54-60`) | none |
| L2 Agent | not wired | Active in engine list but functionally dead. `engine.js:191` `DEFAULT_ACTIVE_LAYERS=[0,1,2]` includes L2, but `engine.js:236` constructs with no config, so `manifest.domains` is empty and `l2-agent.js:59-63` lookup fails; also `session.active_agent.id` is `null`. | G1 + G2 |
| L3-L7 | not wired | Disabled by `DEFAULT_ACTIVE_LAYERS=[0,1,2]` (NOG-18) plus the same manifest gap plus missing session context. | G3 |
| Manifest parsing | — | `parseManifest()` exists (`domain-loader.js:49`) but is never called by engine/runtime. | G2 |
| Activation tracker | writes active agent | `agent-activation-tracker.cjs:244` writes to `.synapse/metrics/hook-metrics.json`; engine reads session from `.synapse/sessions/{uuid}.json` (`hook-runtime.js:56-60`). Disconnect. | G1 |
| L7 command parsing | ready | `.synapse/commands` carries `[*brief]` as `#` comments, stripped by `loadDomainFile`, so `_parseCommandBlocks` finds 0 delimiters. Broken for current format. | G5 |
| Cache / session | needs build | `session-manager.js` + `sessions/` + `updateSession` (QW-1) exist; persist only `last_bracket`; TTL 168h exists. Mostly done. | G3 |
| Graceful degradation | needs build | Layers return `null` not throw; engine 100ms timeout; hook 5s silent-exit. Largely done. | G4 |

Net effect: the work is less "build from scratch" and more "connect existing parts that were never wired together". This lowers risk, but the integration surface (manifest → engine → session → layers → formatter) is broad. Estimate: 63 SP across 6 stories (within the 55-89 SP audit band).

---

## 1. Goals and Background Context

### Goals

- Make agent-specific context (L2) actually reach the model when an agent is active — today it never does.
- Re-enable workflow (L3), task (L4), squad (L5), keyword (L6) and star-command (L7) injection with lazy, on-demand activation so they only cost tokens when relevant.
- Close the activation bridge so `session.active_agent / active_workflow / active_task` are populated in the file the engine actually reads.
- Define a deterministic merge and conflict-resolution policy across the 17+ domain files, with Constitution (L0) always winning.
- Persist dynamic session state with a 7-day TTL aligned to the immortality system.
- Guarantee the engine never blocks a prompt and never injects malformed or untrusted content.
- Ship with an integration test suite plus the `synapse-diagnostics` script as an executable acceptance gate.

### Background Context

SYNAPSE is the context-injection engine that runs on every `UserPromptSubmit` (`.claude/hooks/synapse-engine.cjs`). It is designed as an 8-layer pipeline (L0 Constitution to L7 star-commands). The layer code (L0-L7), the manifest parser, the session manager, the formatter and the graceful-degradation scaffolding already exist and are tested for L0-L1. A prior performance audit (NOG-17/NOG-18) found L3-L7 "produced 0 rules" and hard-disabled them via `DEFAULT_ACTIVE_LAYERS=[0,1,2]`.

The root cause of "0 rules" was never the layers themselves — it was that the data they consume is never supplied: the parsed manifest is never handed to the engine, and the session's dynamic slots (`active_agent`, `active_workflow`, `active_task`) are never populated in the sessions file. Disabling the layers treated a symptom. EPIC-82 fixes the supply chain and then re-enables the consumers, turning SYNAPSE from a 2-layer static injector into the dynamic, agent-aware engine it was designed to be.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-26 | 0.1 | Initial PRD, grounded in direct code inspection (Cont 83) | Morgan (@pm) |

---

## 2. Requirements

### Functional Requirements

- FR-1 — Active-agent detection and session write. On each prompt, the system MUST detect the active agent (from `@agent` / `/AIOX:agents:agent` invocation or sustained session state) and persist `active_agent.id` plus `activated_at` into the sessions file the engine reads (`.synapse/sessions/{uuid}.json`), not only into `hook-metrics.json`. (Gap G1; `hook-runtime.js:56-60`, `agent-activation-tracker.cjs:244`.)

- FR-2 — Active-workflow and active-task detection. The system MUST detect an active workflow (for example `story_development`, `epic_creation`, `architecture_review`) and an active task/story id from session signals, and persist them to `active_workflow.{id,current_phase}` and `active_task`. When no signal exists the slot MUST remain `null` (no invention). (Gap G1; session schema v2.0, `l3-workflow.js:53`.)

- FR-3 — Manifest wiring. The engine MUST load the parsed manifest (`parseManifest()` from `domain-loader.js`) and pass `manifest.domains` into the layer context, so L2/L3 domain resolution by `agentTrigger`/`workflowTrigger` succeeds. (Gap G2; `engine.js:236`, `l2-agent.js:59`, `domain-loader.js:49`.)

- FR-4 — L2 agent injection. When `session.active_agent.id` is set and a matching domain exists, the engine MUST inject that agent's domain file (`.synapse/agent-{id}`) including all `*_AUTH_*` authority-boundary rules. If the domain key is unresolved but the convention file `.synapse/agent-{id}` exists, the engine MUST fall back to loading it directly. (Gap G2; `l2-agent.js:62-72`, fallback currently unreachable.)

- FR-5 — Layer re-enablement with lazy activation. L3-L7 MUST be eligible for injection again, but each layer MUST be lazily activated only when its trigger condition is met (L3: active_workflow set; L4: active_task set; L5: active_squad set; L6: keyword match in prompt; L7: `*command` present in prompt). Layers with no trigger MUST be skipped (0 rules) without being globally disabled, replacing `DEFAULT_ACTIVE_LAYERS` with per-layer trigger evaluation. (Gap G3; `engine.js:188-192,300-352`.)

- FR-6 — Deterministic merge. The engine MUST merge rules from all active layers into a single `<synapse-rules>` payload with stable, layer-ordered sections (L0 first to L7 last) and MUST de-duplicate identical rule strings across layers, keeping the highest-authority occurrence. (Gap G4; `output/formatter.js`.)

- FR-7 — Conflict resolution and precedence. When two layers carry conflicting directives on the same scope, precedence MUST be L0 Constitution (non-negotiable, never overridden) over L2 Agent authority over L3 Workflow over L4 Task over L5 Squad over L6 Keyword over L1 Global, with L7 star-commands modifying response style only (never overriding authority or constitution). The precedence MUST be encoded as data, not hard-coded per call. (Gap G4; design decisions 1 and 4.)

- FR-8 — Cache and session persistence. The system MUST persist `active_agent`, `active_workflow`, `active_task`, `active_squad`, and `history.{agents_activated,star_commands_used,domains_loaded_last}` across prompts in the sessions file, and MUST expire sessions older than the configured TTL (default 168h / 7 days, aligned with `immortality.sessionTTLHours`). (Gap G3; `session-manager.js`, `hook-runtime.js:6,70-80`, `core-config.yaml:122-126`.)

- FR-9 — Pre-injection validation. Before injecting any layer's rules, the engine MUST validate that the domain file parsed to a non-empty, well-formed rule list; a malformed or empty file MUST cause that layer to be skipped (logged), never an error or partial garbage. (Gap G4; design decision 5.)

- FR-10 — Graceful degradation (formalized). Any layer failure (missing file, parse error, timeout) MUST result in that layer being skipped while all other layers still inject; the hook MUST always emit a valid `UserPromptSubmit` payload and never block the prompt. (Gap G4; `engine.js:331-351`, `synapse-engine.cjs:104-108`.)

- FR-11 — Star-command routing (L7). The system MUST detect `*command` tokens in the prompt and inject the corresponding command block from `.synapse/commands`. The commands domain-file format and the L7 parser MUST be reconciled so command blocks (`*brief`, `*dev`, etc.) are actually extracted; the current `#`-commented `[*brief]` headers are stripped before parsing and MUST be fixed (parser reads `COMMANDS_RULE_{CMD}_{n}` keys, or the file exposes live `[*command]` delimiters). (Gap G5; `l7-star-command.js:139-166`, `.synapse/commands`.)

- FR-12 — Diagnostics as acceptance gate. `synapse-diagnostics` MUST report L2-L7 pipeline status (active/skipped/error plus rules produced) and MUST pass (no FAIL items) for a session with an active agent and a `*command` prompt. (Testing strategy; `diagnostics/synapse-diagnostics.js`.)

### Non-Functional Requirements

- NFR-1 — Latency. Full pipeline execution MUST stay within the existing `PIPELINE_TIMEOUT_MS = 100ms` hard cap (`engine.js:184`) and the hook MUST stay within its 5s safety timeout. Adding L3-L7 MUST NOT push median pipeline time above 100ms; lazy activation (FR-5) MUST keep the per-prompt active-layer count low (typically L0+L1+L2, plus L7 only when a command is present).

- NFR-2 — Token budget. Injected context MUST respect the bracket token budget (`getTokenBudget(bracket)`); the formatter MUST truncate or drop lowest-precedence layers first when the budget is exceeded, never the Constitution. Lazy loading (only active agent plus global by default) is the primary token-control mechanism (design decision 3). (Supports NFR-1.)

- NFR-3 — Security / no prompt injection. Domain files are repo-controlled (L3 config), but the engine MUST still sanitize injected content so it cannot break out of the `<synapse-rules>` envelope or smuggle directives: strip/escape envelope-breaking sequences, cap per-rule length and per-payload total size, and never echo the raw user prompt back into injected rules. (Constraint of FR-6/FR-11.)

- NFR-4 — Determinism. Given the same session state, prompt and domain files, the engine MUST produce byte-identical `<synapse-rules>` output (enables golden-snapshot tests). (Supports FR-12.)

- NFR-5 — Backward compatibility. Existing L0-L1 output MUST remain unchanged for sessions with no active agent (no regression for the common case); `SYNAPSE_LEGACY_MODE` behaviour MUST remain available as an escape hatch. (Constraint of FR-5.)

- NFR-6 — Observability. Per-layer metrics (status, duration, rules count) MUST continue to be written to `.synapse/metrics/hook-metrics.json` (`engine.js:396`) and MUST include the new L2-L7 layers. (Supports FR-12.)

- NFR-7 — Non-blocking guarantee. No code path in EPIC-82 MUST throw out of the hook; all I/O MUST be wrapped and all timeouts enforced; a logger or cache failure MUST be fire-and-forget. (Reinforces FR-10.)

### Constraints

- CON-1 — Framework boundary. `.aiox-core/core/synapse/**` is L1 Core (NEVER mutable directly). All engine changes MUST be routed through `@aiox-master *propose-modification` (Art. VI-VII). Story implementation MUST account for this; engine edits are amendments, not free edits. (`core-config.yaml:89-100`.)
- CON-2 — Hooks are L4 runtime. `.claude/hooks/**` is modifiable; the activation bridge (FR-1/FR-2) SHOULD live in the hook layer where possible to minimize L1 amendments.
- CON-3 — No new heavy dependencies. Hooks/engine are dependency-free `.cjs`/`.js` (except `js-yaml`, already used); no new npm packages.
- CON-4 — CLI-first (Art. I). All behaviour MUST be verifiable via CLI (`node -e`, `synapse-diagnostics`, `node --test`). (Per CON-4 itself.)
- CON-5 — Windows / Git-Bash environment. Path handling MUST use `path.join`; no POSIX-only assumptions. (Per CON-5.)
- CON-6 — IDS (Art. IV-A). Reuse existing modules (`parseManifest`, `session-manager`, `formatter`, layer processors): REUSE > ADAPT > CREATE; new files only for the activation bridge and tests.

---

## 3. Technical Design

### 3.1 Activation Algorithm (FR-1, FR-2)

```
on UserPromptSubmit(prompt, session_id, cwd):
  session = loadSession(session_id, .synapse/sessions) or createSession(...)

  # Agent detection
  agent = detectAgentFromPrompt(prompt)           # @x / /AIOX:agents:x, KNOWN_AGENTS
  if agent is null: agent = session.active_agent.id   # sticky across prompts
  if agent is not null:
      session.active_agent = { id: agent, activated_at: now, activation_quality: explicit|sticky }
      session.history.agents_activated.push(agent)     # dedup

  # Workflow detection (signal-driven, no invention)
  workflow = detectWorkflow(prompt, session)      # *create-epic->epic_creation,
                                                  # *draft->story_development, *qa-gate->arch_review
  session.active_workflow = workflow ? {id, current_phase} : session.active_workflow

  # Task detection
  task = detectStoryId(prompt) or session.active_task   # "Story 82.3", "82.3.story.md"
  session.active_task = task or null

  persistSession(session)                         # atomic write, FR-8
  return session                                  # engine consumes this
```

Design decision 1 (activation priority) [AUTO-DECISION]: Agent (L2) > Workflow (L3) > Global (L1) is honoured as injection precedence (FR-7), not mutual exclusion — all triggered layers inject; precedence only resolves conflicts. Reason: the layers are additive by design (`engine.js` accumulates `previousLayers`); exclusivity would discard valid context.

Bridge location [AUTO-DECISION]: the activation write moves into the SYNAPSE hook chain so the same sessions file the engine reads is updated (CON-2). The legacy write to `hook-metrics.json` is kept for diagnostics only and is no longer the source of truth for `active_agent`. Reason: eliminates the verified read/write disconnect (G1) without a second source of truth.

### 3.2 Merge Algorithm (FR-6, FR-7)

```
results = [ layerResult for each active layer, in layer order L0..L7 ]
merged = []; seen = {}
PRECEDENCE = { L0:100, L2:80, L3:70, L4:60, L5:50, L6:40, L1:30, L7:10 }   # L7 = style-only

for r in results sorted by PRECEDENCE desc:
    for rule in r.rules:
        key = normalize(rule)
        if key in seen: continue              # dedup, keep higher precedence (FR-6)
        if violatesConstitution(rule): drop   # L0 never overridden (FR-7)
        seen[key] = r.layer; merged.push({ layer: r.layer, rule })

# Rendered in layer order (L0 section first) for readability;
# token-budget trimming drops from lowest precedence up (NFR-2).
xml = formatSynapseRules(merged, ..., tokenBudget)
```

Design decision 4 (conflict resolution) [AUTO-DECISION]: a more-specific layer refines and may override a lower layer's directive, except L0 Constitution (non-negotiable) and L2 Agent authority (cannot be overridden by L3-L7 style/workflow rules). L7 affects output style only. Reason: matches the Constitution severity model (L0 = NON-NEGOTIABLE) and the Agent Authority Matrix (Art. II).

### 3.3 Cache / Session Schema (FR-8)

Extends the existing v2.0 sessions file (`.synapse/sessions/{uuid}.json`); slots already exist (no schema break):

```jsonc
{
  "uuid": "...", "schema_version": "2.0",
  "started": "ISO", "last_activity": "ISO", "prompt_count": 4,
  "active_agent":    { "id": "pm", "activated_at": "ISO", "activation_quality": "explicit|sticky" },
  "active_workflow": { "id": "epic_creation", "current_phase": "gather" },   // or null
  "active_task":     "82.3",                                                  // or null
  "active_squad":    null,
  "context":  { "last_bracket": "FRESH", "last_tokens_used": 0, "last_context_percent": 100 },
  "overrides": {},
  "history":  { "star_commands_used": ["brief"], "domains_loaded_last": ["agent-pm","global"], "agents_activated": ["pm"] }
}
```

TTL: `staleTTLHours` read from `core-config.yaml` (default 168h). Cleanup runs fire-and-forget on `prompt_count === 0` (`hook-runtime.js:70-80`).

Design decision 2 (cache TTL) [AUTO-DECISION]: 7 days (168h), aligned with `immortality.sessionTTLHours`. Reason: one coherent retention policy across SYNAPSE sessions and immortality logs; already the implemented default.

Design decision 3 (lazy loading) [AUTO-DECISION]: default per-prompt load = L0 + L1 (always) + L2 (active agent only) + L7 (only if `*command` present); L3-L6 load only when their session/keyword trigger fires. Reason: keeps the common-case payload small (NFR-2) and within the 100ms cap (NFR-1); avoids the NOG-17 "17 files every prompt" cost that motivated the original disable.

### 3.4 Error Handling

| Failure | Detection | Behaviour | Trace |
|---------|-----------|-----------|-------|
| Missing domain file | `loadDomainFile` returns `[]` | Layer skipped, logged | `domain-loader.js:161` |
| Malformed manifest | `parseManifest` empty domains | L2/L3 skip via no-match; L1 fallback | `domain-loader.js:53-60` |
| Layer throws | `layer._safeProcess` try/catch | `metrics.errorLayer`, continue | `engine.js:331-336` |
| Pipeline > 100ms | hrtime check | Remaining layers skipped | `engine.js:308-317` |
| Hook > 5s | `setTimeout` | `process.exit(0)`, empty context | `synapse-engine.cjs:92-98` |
| Session write fails | try/catch | Fire-and-forget, prompt unblocked | FR-10 / NFR-7 |
| Validation fail | rule list empty/malformed | Layer skipped, logged | FR-9 |

### 3.5 Security (NFR-3)

- Envelope integrity: strip `</synapse-rules>` / `<synapse-rules>` / `</system>`-like sequences from rule text before injection.
- Size caps: per-rule max length and per-payload max bytes; over-budget trims lowest precedence (NFR-2).
- No prompt echo: the user prompt is read for detection only and is never re-emitted inside injected rules.
- Trusted-source assumption documented: `.synapse/**` is version-controlled (L3); a compromised repo is out of scope, but the envelope/size guards bound blast radius.

### 3.6 Testing Strategy

- Unit (`node --test`): per-layer trigger/skip logic (L2-L7), manifest wiring, merge precedence, dedup, validation, sanitization (extend `tests/hooks/` and `tests/` synapse suites).
- Integration: full pipeline with a populated session (active agent + workflow + `*brief`) asserting L0,L1,L2,L3,L7 inject and L3-L6 skip cleanly; plus the inverse (no agent -> only L0,L1).
- Golden snapshot (NFR-4): byte-stable `<synapse-rules>` for fixed inputs.
- Diagnostics gate (FR-12): `synapse-diagnostics` returns 0 FAIL for the active-agent + command scenario.
- Performance: assert median pipeline < 100ms with all triggers firing.
- Graceful-degradation: delete each domain file in turn, assert the prompt still succeeds and other layers inject.

---

## 4. Epic List

- EPIC-82: SYNAPSE Dynamic Injection (Layers 2-7) — wire the existing-but-disconnected SYNAPSE layer pipeline so agent/workflow/task/squad/keyword/command context is injected dynamically, deterministically, and within budget, with full graceful degradation.

(Single epic — all stories deliver one coherent capability; splitting would create non-deployable enabler-only fragments.)

---

## 5. Epic 82 Details

Expanded goal: transform SYNAPSE from a static 2-layer (L0/L1) injector into the dynamic 8-layer engine it was architected to be, by (a) supplying the data the layers were starved of (manifest + session state), (b) re-enabling them with lazy triggers, (c) defining deterministic merge/conflict rules, and (d) hardening validation, caching and fallback — all verified by an integration suite and the diagnostics gate.

> Story sequencing: 82.1 (activation+manifest) unblocks L2; 82.2 (merge/re-enable) depends on 82.1; 82.3 (cache) and 82.4 (fallback/validation) build on the populated session; 82.5 (command routing) depends on the merge engine; 82.6 (integration tests) depends on all. Each story is a vertical slice delivering observable injection behaviour.

### Story 82.1 — Activation Engine and Manifest Wiring

As the SYNAPSE engine,
I want the active agent/workflow/task written to the sessions file and the parsed manifest supplied to the layers,
so that L2 agent context is actually injected when an agent is active.

- Scope IN: FR-1, FR-2, FR-3, FR-4 — session-file write of `active_agent/workflow/task`; `parseManifest()` wired into engine context; L2 domain resolution plus direct-file fallback.
- Scope OUT: L3-L7 re-enablement (82.2); persistence/history (82.3).
- Estimate: 13 SP. Prereq: none.

Acceptance Criteria
1. Given a prompt invoking `@pm`, when the hook runs, then `.synapse/sessions/{uuid}.json` has `active_agent.id == "pm"`.
2. Given `active_agent.id == "pm"`, when the engine runs, then L2 injects the `.synapse/agent-pm` rules including `AGENT_PM_AUTH_*` lines.
3. Given a manifest with `AGENT_PM_AGENT_TRIGGER=pm`, when the engine builds layer context, then `manifest.domains.AGENT_PM.agentTrigger == "pm"` is available to L2 (parseManifest is invoked).
4. Given no domain-key match but `.synapse/agent-pm` exists, when L2 runs, then it falls back to loading that file directly.
5. Given no agent in prompt and none in session, when the engine runs, then L0/L1 output is unchanged (no regression).
6. `synapse-diagnostics` reports L2 status active with rules > 0 for the active-agent case.

### Story 82.2 — Merge Logic, Layer Re-enablement and Conflict Resolution

As the SYNAPSE engine,
I want L3-L7 lazily re-enabled and all active layers merged with deterministic precedence,
so that the right context is combined without duplication or constitutional violations.

- Scope IN: FR-5, FR-6, FR-7 — replace `DEFAULT_ACTIVE_LAYERS` with per-layer trigger evaluation; precedence table; dedup; constitution-wins enforcement.
- Scope OUT: L7 file-format fix (82.5); validation/sanitization (82.4).
- Estimate: 13 SP. Prereq: 82.1.

Acceptance Criteria
1. Given `active_workflow.id == "story_development"`, when the engine runs, then L3 injects `.synapse/workflow-story-dev` rules.
2. Given no trigger for L4/L5/L6, when the engine runs, then those layers are skipped (0 rules) without disabling the pipeline.
3. Given the same rule text in L1 and L2, when merged, then it appears once, attributed to L2 (higher precedence).
4. Given an L7 style rule conflicting with an L0 constitutional rule, when merged, then the L0 rule is kept and the L7 directive dropped.
5. Precedence is data-driven (a table), not hard-coded inside `process()`.
6. Median pipeline time stays < 100ms with L0,L1,L2,L3,L7 active (measured via metrics).

### Story 82.3 — Cache Manager / Session Persistence

As a multi-prompt session,
I want active agent/workflow/task and history persisted with a 7-day TTL,
so that context survives across prompts and stale sessions are reclaimed.

- Scope IN: FR-8 — persist `active_*` and `history.*`; sticky agent across prompts; TTL cleanup via `staleTTLHours`.
- Scope OUT: detection logic (82.1).
- Estimate: 8 SP. Prereq: 82.1.

Acceptance Criteria
1. Given `@pm` on prompt 1 and a plain prompt 2, when prompt 2 runs, then `active_agent.id` is still `"pm"` (sticky).
2. Given a `*brief` command used, then `history.star_commands_used` contains `"brief"` (deduped).
3. Given `history.domains_loaded_last`, then it reflects the layers injected on the last prompt.
4. Given a session file older than `staleTTLHours` (default 168h), when a new session's first prompt runs, then the stale file is removed.
5. Session writes are atomic and fire-and-forget (a write failure never blocks the prompt).

### Story 82.4 — Validation and Graceful Degradation

As the SYNAPSE engine,
I want every layer validated and every failure isolated,
so that a bad or missing domain file never injects garbage and never blocks a prompt.

- Scope IN: FR-9, FR-10, NFR-3, NFR-7 — pre-injection syntax validation; envelope/size sanitization; formalized skip-on-failure across L2-L7.
- Scope OUT: new layer logic.
- Estimate: 8 SP. Prereq: 82.2.

Acceptance Criteria
1. Given a malformed/empty domain file, when its layer runs, then the layer is skipped (logged) and other layers still inject.
2. Given rule text containing a `</synapse-rules>`-like sequence, when injected, then the sequence is stripped/escaped (envelope intact).
3. Given a per-payload size over budget, when formatting, then lowest-precedence layers are trimmed first and L0 is never trimmed.
4. Given any layer throwing, when the engine runs, then the hook still emits a valid `UserPromptSubmit` payload.
5. The user prompt text is never echoed back inside injected rules.

### Story 82.5 — Command Routing (L7 Star-Commands)

As a user typing `*brief` / `*dev`,
I want the matching command block injected,
so that response-mode switching actually takes effect.

- Scope IN: FR-11 — reconcile `.synapse/commands` format with the L7 parser so blocks are extracted; wire L7 lazy trigger (only when `*command` in prompt).
- Scope OUT: new commands beyond those already in `.synapse/commands`.
- Estimate: 8 SP. Prereq: 82.2.

Acceptance Criteria
1. Given a prompt containing `*brief`, when the engine runs, then L7 injects the brief command's rules ("Use bullet points only", etc.).
2. Given a prompt with no `*command`, when the engine runs, then L7 is skipped (0 rules).
3. Given the current `.synapse/commands` file, when L7 parses it, then it extracts at least one rule for `*brief` (the `#`-comment-header stripping bug is resolved).
4. Multiple commands in one prompt (`*brief *dev`) each inject their block.
5. L7 rules are treated as style-only in conflict resolution (cannot override L0/L2 — verified against 82.2 precedence).

### Story 82.6 — Integration Tests and Diagnostics Gate

As the maintainer,
I want an end-to-end test suite plus the diagnostics gate,
so that dynamic injection is provably correct and stays correct.

- Scope IN: FR-12, NFR-4 — integration tests (agent+workflow+command and inverse); golden snapshots; perf assertion < 100ms; graceful-degradation matrix; `synapse-diagnostics` 0-FAIL gate.
- Scope OUT: none.
- Estimate: 13 SP. Prereq: 82.1-82.5.

Acceptance Criteria
1. Integration test: active `@pm` + `story_development` + `*brief` -> L0,L1,L2,L3,L7 inject; L4,L5,L6 skip — passes.
2. Integration test: no agent -> only L0,L1 inject (no regression) — passes.
3. Golden snapshot of `<synapse-rules>` is byte-stable for fixed inputs.
4. Graceful-degradation matrix: removing each domain file in turn keeps the prompt succeeding and other layers injecting.
5. Performance test: median pipeline < 100ms with all triggers firing.
6. `synapse-diagnostics` returns 0 FAIL items for the active-agent + command scenario.

---

## 6. Risk Assessment

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | L1 Core boundary (CON-1) blocks engine edits | High | High | Route engine changes via `@aiox-master *propose-modification`; keep activation bridge in L4 hooks where possible (FR-1/FR-2). Plan the amendment in 82.1 before coding. |
| R2 | Re-enabling L3-L7 reintroduces the NOG-17 latency that caused the original disable | Medium | High | Lazy triggers (FR-5) keep common-case at L0+L1+L2; enforce 100ms cap (NFR-1) plus perf test (82.6 AC5). |
| R3 | Sticky agent state goes stale (agent "remembered" after user moved on) | Medium | Medium | TTL plus explicit-over-sticky precedence; `activation_quality` field distinguishes explicit vs sticky; future `*reset` override. |
| R4 | Token-budget blowout when many layers fire | Medium | Medium | NFR-2 trim-from-lowest-precedence; lazy loading; size caps (NFR-3). |
| R5 | Prompt-injection via a tampered domain file | Low | High | Envelope/size sanitization (NFR-3); `.synapse/**` version-controlled plus code review. |
| R6 | Detection false positives (e.g. `@pm` inside a code block / quoted text) | Medium | Low | Constrain detection to known agents plus invocation patterns; sticky fallback reduces flapping; covered by 82.1 tests. |
| R7 | Two sources of truth for `active_agent` (sessions file vs hook-metrics.json) drift | Medium | Medium | Sessions file is the single source of truth (FR-1); hook-metrics is observability-only. |

Overall risk: Medium. The dominant risks are the L1 boundary process (R1) and latency regression (R2); both are mitigated by routing and lazy activation. Most building blocks already exist and are tested, lowering implementation risk.

---

## 6b. Checklist Results Report (pm-checklist, YOLO mode)

Validation run 2026-06-26 by @pm (Morgan), comprehensive mode.

| Category | Status | Notes |
|----------|--------|-------|
| 1. Problem Definition and Context | PASS | Problem (L2-7 functionally dead), impact (0 rules; 63 SP), and differentiation (root-cause vs the NOG-18 symptom disable) are explicit; success metrics = diagnostics 0-FAIL + <100ms. |
| 2. MVP Scope Definition | PASS | 6 vertical-slice stories with per-story IN/OUT scope and rationale; lazy loading is the minimization lever; validation via diagnostics + integration suite. |
| 3. User Experience Requirements | N/A | Backend context engine, no UI surface — justified exclusion. |
| 4. Functional Requirements | PASS | 12 FRs, each testable and traced to a file:line; story ACs in Given/When/Then; dependencies via 82.1->82.6 sequencing. |
| 5. Non-Functional Requirements | PASS | 7 NFRs cover latency (100ms cap), token budget, security/sanitization, determinism, backward-compat, observability, non-blocking. |
| 6. Epic and Story Structure | PASS | Single cohesive epic justified; stories sized 8-13 SP for single-AI-agent sessions; sequence + prereqs documented. |
| 7. Technical Guidance | PASS | §3 algorithms (activation/merge/cache), error-handling table, security model; 5 AUTO-DECISIONs with rationale; R1-R7 register; CON-1 boundary flagged for architect. |
| 8. Cross-Functional Requirements | PASS | Session data schema + retention (TTL) defined; integration is the internal hook chain; observability via hook-metrics (NFR-6). |
| 9. Clarity and Communication | PASS | Grounding table, change log, consistent terminology; approval path = @po validation. |

Executive summary: completeness ~95%. MVP scope = Just Right (6 stories, 63 SP, within the 55-89 audit band). Readiness = READY FOR ARCHITECT.

Top issues by priority:
- BLOCKER: none.
- HIGH (architect): CON-1 — confirm which `.aiox-core/core/synapse/**` edits need an `@aiox-master *propose-modification` L1 amendment vs which move to L4 hooks. Process gate, not a spec gap.
- MEDIUM: stories 82.1/82.2/82.6 are 13 SP — @sm may split each if a single AI-agent session risks context overflow.
- LOW: no live UAP `_active-agent.json` bridge spec'd; folded into FR-1 (sessions file = single source of truth).

Decision: READY FOR ARCHITECT (CON-1 boundary determination is the architect's first task).

---

## 7. Next Steps

### Architect Prompt
Review section 3 (Activation/Merge/Cache algorithms, error handling, security) and produce `implementation.yaml`: confirm which engine changes require an `@aiox-master *propose-modification` L1 amendment versus which can live in `.claude/hooks/**` (L4); assess complexity (expected STANDARD/COMPLEX); validate the precedence table and lazy-trigger model against `engine.js`.

### SM Prompt
Draft stories 82.1-82.6 from section 5 using `create-next-story.md`. Each story already has IN/OUT scope, estimate, prereq and testable ACs. Honour CON-1 (L1 boundary) in Dev Notes for any story touching `.aiox-core/core/synapse/**`. Sequence strictly 82.1 -> 82.2 -> (82.3, 82.4, 82.5) -> 82.6.

---

*PRD grounded by direct code inspection (Cont 83). Every FR/NFR/CON traces to a verified file:line. No invented behaviour (Art. IV).*
