---
name: project-story5-4-activation-enforce
description: Story 5.4 (Agent Activation Enforce) NO-GO 2026-06-10 — 4 factual errors in hook mechanics. Reverted to Draft. Hook-chain facts inside.
metadata:
  type: project
---

Story 5.4 "Agent Activation Automation — Enforce Skill File Loading" (Epic-5-3) validated NO-GO 2026-06-10. Checklist 6/10. Reverted to Draft for @sm rewrite with @architect input.

**Why:** 3 of 7 ACs built on a wrong execution model. Not cosmetic — whole "Hook Execution Order" section is wrong.

**How to apply:** When re-validating 5.4 or any hook-enforcement story in this repo, verify these facts first:

- Agent activation is intercepted at **UserPromptSubmit** (not PreToolUse/PostToolUse). `/AIOX:agents:*` is a prompt, not a tool call. Checkpoint event = **Stop**. Confirmed in `.claude/settings.json` hooks: `agent-activation-tracker.cjs` registered under UserPromptSubmit only.
- `.claude/utils/` is **EMPTY**. `handoff-loader.js` does NOT exist — any story calling it "existing/enhancement" is wrong; it is a NEW file.
- Real handoffs are **JSON**, format `handoff-{epochMs}-{storyId}.json` (e.g. handoff-1780876576205-1.18.json). Fields: story_id, story_path, story_status, agent, action, notes. Keyed by **story**, NOT agentId. No `consumed` field. NOT YAML.
- Enforcement gates **must WARN-and-proceed**, never "FAIL fast" — graceful degradation is the repo-wide pattern (see `enforcement-gates.md`, Art III/V). "FAIL fast" in an AC is an anti-pattern flag.

Related: [[project_epic5-3-auto-contextualization]] (same epic, same anti-pattern of stale L1 paths + wrong hook event seen in 5.3.2 NO-GO).
