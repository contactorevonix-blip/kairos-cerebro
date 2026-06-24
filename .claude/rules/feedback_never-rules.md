---
name: never-rules
description: NEVER behaviors (11 critical prohibitions) that block execution
metadata:
  type: feedback
---

# NEVER Rules — Critical Prohibitions

These are non-negotiable. Violating triggers correction and escalation to Rule Escalation Protocol.

## NEVER-001: Implement without explicit delegation

**Rule:** Never assume a specialized agent role (e.g., @dev, @sm, @po, @qa, @devops) directly. Always delegate to the agent.

**Why:** Agent Authority (Art. II) requires specialization boundaries. Even Quick Flow (<2h) tasks must respect agent exclusivity.

**How to apply:** When story is ready for implementation, use `@agent *command` to delegate, never implement directly as Claude Code.

**Example violation:** Implemented IDS-OPS.1 directly as @dev instead of delegating to @aiox-dev *develop-story (Cont 77).

---

## NEVER-002: Ignore CLAUDE.md on session start

**Rule:** Never skip reading CLAUDE.md at session start. It contains Constitution and Agent Authority rules that override defaults.

**Why:** CLAUDE.md is the source of truth for project governance. Missing it causes Art. II violations (seen in Cont 77).

**How to apply:** First action each session: read and internalize CLAUDE.md + referenced rule files (agent-authority.md, smart-routing.md).

---

## NEVER-003: Delete without asking

**Rule:** Never delete files, branches, or code without explicit user approval first.

**Why:** Deletions are irreversible; lost work is worse than false caution.

**How to apply:** When deletion is necessary, ask "should I delete X?" and wait for explicit yes/no.

---

## NEVER-004: Invent features not in requirements

**Rule:** Never add features, endpoints, or behaviors not explicitly requested (Art. IV: No Invention).

**Why:** Scope creep ruins timelines; invented features go unused and create technical debt.

**How to apply:** If requirements seem incomplete, ask clarifying questions; never fill gaps with your assumptions.

---

## NEVER-005: Use mock data when real data exists

**Rule:** Never use fake/mock data in examples, tests, or documentation if real data is available.

**Why:** Mock data masks real-world edge cases; it lies to future readers.

**How to apply:** Always query actual sources (database, APIs, registries) before generating synthetic data.

---

## NEVER-006: Explain a correction (argue back)

**Rule:** Never argue with or explain away user feedback. Accept correction, apply it, move on.

**Why:** You're there to improve, not defend. Arguing wastes context and erodes trust.

**How to apply:** Feedback received → acknowledge → fix → proceed. No counter-arguments.

---

## NEVER-007: Batch without validating pattern first

**Rule:** Never apply a fix/change to 10+ files without testing the pattern on 1 first.

**Why:** Batch mistakes compound exponentially; one bad pattern = 10 bad files.

**How to apply:** Always "test-then-batch": fix one file, verify it works, then apply to the rest.

---

## NEVER-008: Modify core framework without governance

**Rule:** Never modify `.aiox-core/` (L1/L2 layers) without formal @aiox-master *propose-modification.

**Why:** Framework is the foundation; unauthorized changes break all projects using it.

**How to apply:** If framework change needed, route to @aiox-master with rationale. Never direct edits.

---

## NEVER-009: Check REUSE/ADAPT without IDS registry

**Rule:** Never create a new entity (task, template, agent, skill) without querying the IDS registry first (REUSE > ADAPT > CREATE).

**Why:** Duplicating existing work violates Art. IV-A (IDS); wastes effort on reinvention.

**How to apply:** Before CREATE, run `*ids check {intent}` and document why no REUSE/ADAPT matched.

---

## NEVER-010: Commit without story validation

**Rule:** Never commit product code to main branch without a story that passed @po validation.

**Why:** Story-Driven Development (Art. III) requires acceptance criteria and traceability.

**How to apply:** Story Ready → @dev implements → @qa validates → commit. Never skip.

---

## NEVER-011: Push secrets or sensitive data to git

**Rule:** Never commit API keys, tokens, passwords, or PII to git (even in branches).

**Why:** Secrets in git are permanent; they leak and can't be un-leaked.

**How to apply:** All secrets in `.env`, `.env.local`, or `settings.local.json` (gitignored). CI/CD reads from secure vaults.

---

**Last updated:** 2026-06-24 (Cont 77 — NEVER-001 and NEVER-002 formalized from Agent Authority violation)
