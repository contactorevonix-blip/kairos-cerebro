---
paths:
  - "docs/stories/**"
  - ".aiox-core/development/**"
---

# Story Lifecycle — Detailed Rules

## Status Progression

```
Draft → Ready → InProgress → InReview → Done
```

| Status | Trigger | Agent | Action |
|--------|---------|-------|--------|
| Draft | @sm creates story | @sm | Story file created |
| Ready | @po validates (GO) | @po | **MUST update status field in story file from Draft → Ready** |
| InProgress | @dev starts implementation; @qa FAIL returns story | @dev / @qa | **MUST update status field: Ready → InProgress on dev start, or InReview → InProgress on QA FAIL** |
| InReview | @dev completes implementation | @dev | **MUST update status field from InProgress → InReview before QA handoff** |
| Done | @qa PASS, CONCERNS, or WAIVED | @qa | **MUST update status field from InReview → Done before @devops push** |

**CRITICAL:** The `Draft → Ready` transition is the responsibility of @po during `*validate-story-draft`. When verdict is GO (including conditional GO after fixes are applied), @po MUST update the story's Status field to `Ready` and log the transition in the Change Log. A story left in `Draft` after a GO verdict is a process violation.

**CRITICAL:** The `Ready → InProgress` and `InProgress → InReview` transitions are the responsibility of @dev during `*dev-develop-story`. @dev MUST log both transitions in the Change Log using the mandatory status-transition block in `dev-develop-story.md`.

**CRITICAL:** The `InReview → Done` and `InReview → InProgress` transitions are the responsibility of @qa during `*qa-gate`. PASS, CONCERNS, and WAIVED move the story to `Done`; FAIL returns it to `InProgress`. @qa MUST update the story status and Change Log before reporting the gate result.

**CRITICAL:** @devops does not change story status. @devops push/PR/release authority starts only after the story already reflects the QA gate outcome.

## Phase 1: Create (@sm)

**Task:** `create-next-story.md`
**Inputs:** PRD sharded, epic context
**Output:** `{epicNum}.{storyNum}.story.md`

## Phase 2: Validate (@po)

**Task:** `validate-next-story.md`

### 10-Point Validation Checklist

1. Clear and objective title
2. Complete description (problem/need explained)
3. Testable acceptance criteria (Given/When/Then preferred)
4. Well-defined scope (IN and OUT clearly listed)
5. Dependencies mapped (prerequisite stories/resources)
6. Complexity estimate (points or T-shirt sizing)
7. Business value (benefit to user/business clear)
8. Risks documented (potential problems identified)
9. Criteria of Done (clear definition of complete)
10. Alignment with PRD/Epic (consistency with source docs)

**Decision:** GO (≥7/10) or NO-GO (<7/10 with required fixes)

## Phase 3: Implement (@dev)

**Task:** `dev-develop-story.md`

### Execution Modes

**YOLO (autonomous):**
- 0-1 prompts
- Decisions logged in `decision-log-{story-id}.md`
- Best for: simple, deterministic tasks

**Interactive (default):**
- 5-10 prompts with educational checkpoints
- Confirmations at key decision points
- Best for: learning, complex decisions

**Pre-Flight (plan-first):**
- All questions upfront (10-15 prompts)
- Generates execution plan
- Then zero-ambiguity execution
- Best for: ambiguous requirements, critical work

### CodeRabbit Self-Healing in Dev Phase

```
iteration = 0
while CRITICAL issues found AND iteration < 2:
  auto-fix CRITICAL/HIGH
  iteration++
if CRITICAL persist after 2 iterations:
  HALT — manual intervention required
```

## Phase 4: QA Gate (@qa)

**Task:** `qa-gate.md`

### 7 Quality Checks

1. **Code review** — patterns, readability, maintainability
2. **Unit tests** — adequate coverage, all passing
3. **Acceptance criteria** — all met per story AC
4. **No regressions** — existing functionality preserved
5. **Performance** — within acceptable limits
6. **Security** — OWASP basics verified
7. **Documentation** — updated if necessary

### Gate Decisions

| Decision | Score | Action |
|----------|-------|--------|
| PASS | All checks OK | Approve, proceed to @devops push |
| CONCERNS | Minor issues | Approve with observations documented |
| FAIL | HIGH/CRITICAL issues | Return to @dev with feedback |
| WAIVED | Issues accepted | Approve with waiver documented (rare) |

### Gate File Structure

```yaml
storyId: STORY-42
verdict: PASS | CONCERNS | FAIL | WAIVED
issues:
  - severity: low | medium | high
    category: code | tests | requirements | performance | security | docs
    description: "..."
    recommendation: "..."
```

### Post-Gate Status Update (MANDATORY)

> **Origin:** Story 5.3.5 AC5 / PROC-001 — recurring Status-field drift across
> 5.3.2 (stale header), 5.3.3 (duplicate Status line), 5.3.4 (no Change Log /
> no recorded gate verdict), and STATE.md (stale branch/push status). This is the
> same lifecycle-hygiene pattern previously flagged in the 5.2 gate (REL-001).

**In the SAME step the verdict is decided — before reporting the gate result —
the gate owner MUST perform all of the following atomically:**

1. **Update the header `Status:` field** to reflect the verdict:
   - PASS / CONCERNS / WAIVED → `Done`
   - FAIL → `InProgress` (returns to @dev)
2. **Append a Change Log row** capturing the gate verdict, the status transition,
   and the date — e.g.
   `| {YYYY-MM-DD} | {version} | QA gate {VERDICT} — Status: InReview → {Done|InProgress} | @qa |`
3. **De-duplicate / sync any redundant Status lines** (e.g. a trailing footer
   "Status:" or "Ready for:" line) so the header `Status:` field is the single
   source of truth — no contradicting or stale status text may remain.

**A gate verdict reported without (1)+(2)+(3) performed in the same step is a
process violation.** Do not announce PASS/CONCERNS/FAIL/WAIVED until the story
file reflects the outcome.

> **Note:** This reinforcement lives here (L4 project runtime) and not in
> `.aiox-core/development/tasks/qa-gate.md`, which is L2 (framework-protected,
> NEVER modify — extend-only). It restates and operationalizes the qa-gate task's
> "Post-Gate Status Update" discipline as a repeatable, atomic checklist.

## QA Loop (Iterative Review-Fix)

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

**Commands:**
- `*qa-loop {storyId}` — Start full loop
- `*stop-qa-loop` — Pause and save state
- `*resume-qa-loop` — Resume from saved state
- `*escalate-qa-loop` — Force manual escalation

**Escalation triggers:**
- max_iterations_reached (default: 5)
- verdict_blocked
- fix_failure (after retries)
- manual_escalate (user command)

**Status:** Tracked in `qa/loop-status.json`

## Story File Update Rules

| Section | Who Can Edit |
|---------|-------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev |
| QA Results | @qa only |
| Change Log | Any agent (append only) |
