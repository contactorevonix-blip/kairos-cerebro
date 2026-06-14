# Proposal — Deprecate Orphaned `activation-instructions-*` Templates (L2)

**Modification type:** `deprecate`
**Priority:** medium
**Status:** pending_review (awaiting `@aiox-master *propose-modification`)
**Origin:** `EPIC-agent-determinism`, Story C — "Deprecar/remover templates órfãos activation-instructions-*"
**Traces to:** F4
**Prepared by:** @skill-craftsman (Anvil)
**Date:** 2026-06-14

---

## Affected Components (L2 — read-only for this proposal)

| # | Path | Type | Version |
|---|------|------|---------|
| 1 | `.aiox-core/product/templates/activation-instructions-template.md` | Agent activation template | 2.0 (GreetingBuilder Integration, 2025-11-16) |
| 2 | `.aiox-core/product/templates/activation-instructions-inline-greeting.yaml` | Agent activation template ("Option A") | 2.0 (Story 6.1.2.5-T1, 2025-11-16) |

Both files live in `.aiox-core/product/templates/` — Layer L2 (Framework Templates).
Per `.claude/rules/agent-authority.md` and `.claude/rules/enforcement-gates.md`
(framework-boundary writes, Art. VI-VII), these files **cannot be edited or removed
directly** by any agent. The only legitimate execution path is governance via
`@aiox-master *propose-modification` (see "Recommended Action" and "Execution Path"
below).

---

## Justification — Abandoned Pattern vs. Real Pattern

### Pattern described by the two templates (ABANDONED)

Both files document a **GreetingBuilder-based / "Option A" inline-logic activation
pattern** from Story 6.1.2.5 (2025-11-16):

- `activation-instructions-template.md` (v2.0) prescribes:
  - `STEP 3: Build intelligent greeting using .aiox-core/development/scripts/greeting-builder.js`
  - A call to `buildGreeting(agentDefinition, conversationHistory)` that performs
    session-type detection, git-config caching, project-status loading, command
    filtering, and adaptive formatting — all via external JS execution
    (`greeting-builder.js`, `context-detector.js`, `git-config-detector.js`,
    `workflow-navigator.js`, `project-status-loader.js`).
  - `STEP 4: Display the greeting returned by GreetingBuilder`

- `activation-instructions-inline-greeting.yaml` ("Option A", v2.0) prescribes:
  - The same GreetingBuilder logic re-implemented **inline in YAML** inside
    `activation-instructions`, with explicit Bash calls (`git branch --show-current`,
    `git status --short | wc -l`, `git log -1 --pretty=format:"%s"`) executed by
    Claude during activation, plus session-type detection and command filtering
    performed step-by-step as literal instructions.
  - Maintenance note explicitly says: *"Use `.aiox-core/scripts/batch-update-greetings.js`
    to update all agents"* and *"All 11 agents will have similar inline logic"*.

### Pattern actually in use (REAL, canonical)

Every active SKILL.md in `.claude/skills/` (11 agents) uses a **"native context,
zero JS execution"** activation pattern with **STEP 1-6 inline**, e.g.:

```
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
  - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
  - STEP 3: |
      Display greeting using native context (zero JS execution):
      0. GREENFIELD GUARD: ...
      1. Show: "{icon} {persona_profile.communication.greeting_levels.archetypal}" + permission badge ...
      2. Show: "**Role:** {persona.role}" ...
      3. Show: "**Project Status:**" as natural language narrative from gitStatus in system prompt ...
      4. Show: "**Available Commands:**" -- list commands from the 'commands' section ...
      5. Show: "Type `*guide` for comprehensive usage instructions."
      5.5. Check `.aiox/handoffs/` for most recent unconsumed handoff artifact ...
      6. Show: "{persona_profile.communication.signature_closing}"
      # FALLBACK: If native greeting fails, run: node .aiox-core/development/scripts/unified-activation-pipeline.js {agent-id}
  - STEP 4: Display the greeting assembled in STEP 3
  - STEP 5: HALT and await user input
```

This is materially different from both deprecated templates:

| Aspect | Deprecated templates (v2.0, 2025-11-16) | Real pattern (current, all 11 agents) |
|---|---|---|
| Greeting generation | External JS (`greeting-builder.js`) or step-by-step Bash + inline YAML logic | Native LLM context narrative ("zero JS execution") |
| Git status | `git-config-detector.js` (5min cache) or live `git branch`/`git status`/`git log` Bash calls | Read from `gitStatus` already present in system prompt |
| Step count / structure | STEP 1-5 with STEP 3 doing all the heavy lifting via external call/inline logic | STEP 1-6, with STEP 3 broken into numbered sub-steps (0, 1-6, 5.5) including the Greenfield Guard and handoff-artifact check |
| Fallback | "Simple greeting on timeout or error" (GreetingBuilder internal) | Explicit fallback line: `node .aiox-core/development/scripts/unified-activation-pipeline.js {agent-id}` |
| Handoff/session-chain awareness | Not present | STEP 5.5 — `.aiox/handoffs/` + `workflow-chains.yaml` lookup |

The deprecated templates pre-date both the handoff-consolidation protocol
(`.claude/rules/agent-handoff.md`) and the unified-activation-pipeline fallback
mechanism now referenced by every agent.

---

## Evidence — Zero Consumers (AC-C1 Grep Verification)

Re-confirmed independently by @skill-craftsman (2026-06-14), per AC-C1:

```text
Grep "activation-instructions-template"        → .claude/skills/                         → 0 matches
Grep "activation-instructions-inline-greeting" → .claude/skills/                         → 0 matches
Grep "activation-instructions-template"        → .aiox-core/development/agents/          → 0 matches
Grep "activation-instructions-inline-greeting" → .aiox-core/development/agents/          → 0 matches
```

Zero references to either exact filename were found in the 11 agent SKILL.md files
or in `.aiox-core/development/agents/`. This corroborates the @po pre-validation
(2026-06-13 Change Log entry): hits for the generic YAML key `activation-instructions:`
are unrelated — they are the standard frontmatter key present in every agent
definition, not a reference to either deprecated template file.

**Conclusion:** both templates are orphaned. No SKILL.md, agent definition, or
ideSync process references them by name.

---

## Recommended Action

Given the **Risk** documented in Story C ("removing a template still used by
upstream/clone tooling — mitigate by preferring 'mark DEPRECATED' over 'remove'
when in doubt"), and the absence of any internal consumer:

> **Recommended: Add a `DEPRECATED` header + reason to both files. Do NOT remove.**

Suggested header (top of each file, preserving existing content below):

```markdown
> **⚠️ DEPRECATED (2026-06-14):** This template describes an ABANDONED activation
> pattern (GreetingBuilder / "Option A" inline-logic, v2.0, Story 6.1.2.5,
> 2025-11-16). The canonical pattern in use by all 11 agents is "native context,
> zero JS execution" with STEP 1-6 inline (see any `.claude/skills/*/SKILL.md`).
> Retained for historical reference only. Do not use as a basis for new agents.
> See `EPIC-agent-determinism`, Story C, and finding F4.
```

For the `.yaml` file, the equivalent should be added as a leading YAML comment
block (`#`-prefixed lines) to preserve YAML validity.

### Why "mark DEPRECATED" over "remove"

- Story C's Risk section explicitly prefers marking over removal "in case of
  doubt".
- Both files carry historical/architectural value (they document the evolution
  from manual STEPs → GreetingBuilder → inline-Option-A → current native-context
  pattern) and may be referenced by future ADRs or migration retrospectives.
- A header is non-breaking, reversible, and immediately signals intent to any
  human or agent who opens the file — satisfying the "no future misuse as
  reference" goal without the irreversibility of deletion.

---

## Execution Path (Governance, L2)

These files are L2 (`.aiox-core/product/templates/`) and protected by the
framework-boundary deny rules (`.claude/settings.json`, Art. VI-VII,
`.claude/rules/enforcement-gates.md`). This proposal does **not** modify them.

**Who executes:** `@aiox-master *propose-modification` is the correct governance
path to apply the `DEPRECATED` header to both files. Suggested invocation:

```bash
*propose-modification .aiox-core/product/templates/activation-instructions-template.md deprecate \
  --title "Deprecate orphaned activation-instructions-template.md (v2.0 GreetingBuilder pattern)" \
  --reason "Abandoned pattern superseded by native-context zero-JS activation (STEP 1-6 inline). Zero consumers confirmed (EPIC-agent-determinism, Story C, F4)." \
  --priority medium

*propose-modification .aiox-core/product/templates/activation-instructions-inline-greeting.yaml deprecate \
  --title "Deprecate orphaned activation-instructions-inline-greeting.yaml (v2.0 Option A)" \
  --reason "Abandoned pattern superseded by native-context zero-JS activation (STEP 1-6 inline). Zero consumers confirmed (EPIC-agent-determinism, Story C, F4)." \
  --priority medium
```

---

## Non-Regression (AC-C4)

This story/proposal makes **no changes** to any `SKILL.md`, agent activation
process, or `.claude/skills/` content. The two affected files remain unmodified
in L2; only this L4 proposal document was created. The canonical "native context,
zero JS execution" activation pattern (used by all 11 agents today) is unaffected
and continues to operate as-is.

---

## References

- Epic: `docs/stories/epics/EPIC-agent-determinism/`
- Story: `docs/stories/epics/EPIC-agent-determinism/story-C-deprecate-orphan-templates.md`
- Finding: F4
- Governance task: `.aiox-core/development/tasks/propose-modification.md`
- Deprecation task format reference: `.aiox-core/development/tasks/deprecate-component.md`
- Boundary rules: `.claude/rules/agent-authority.md`, `.claude/rules/enforcement-gates.md`
