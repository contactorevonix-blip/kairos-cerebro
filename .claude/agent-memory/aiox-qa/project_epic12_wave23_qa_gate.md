---
name: epic12-wave23-qa-gate
description: EPIC-12 Wave 2+3 (12.5-12.14) QA gate = CONCERNS — work sound (all suites green, no regressions, no invention) but @dev self-signed gates / skipped @qa
metadata:
  type: project
---

EPIC-12 Wave 2+3 QA gate (2026-06-20): verdict **CONCERNS** (Done with notes, ready for @devops push).

Gate file: `docs/qa/gates/12.5-12.14-wave2-3-qa-gate.yml`. All 14 EPIC-12 stories `Done`.

**Work is technically sound (independently reproduced, not story-trust):**
- enforcement.test.js 34/34 (EPIC-9 baseline intact); full hooks suite 275/275; integration 39/39; wave2-3 hook suites 65/65. lint + typecheck clean.
- Prior 12.1 MultiEdit-matcher gap is now RESOLVED (matcher registered in settings.json; test passes).
- Art. IV discipline strong: 12.6 gap-matrix honestly flags non-persisted gap-prose as `TRACED (range)` instead of fabricating; cited refs all resolve; CON-5/NFR-3.2/FR-4.2/FR-5.4 present in requirements.json.

**Why CONCERNS (PROCESS not product):**
- **PROC-001 (medium):** Stories 12.5-12.10, 12.12, 12.13 went Ready→InProgress→Done in one @dev step, skipping InReview + the @qa gate. No active Wave 3 story had a @qa-authored QA Results section. @qa supplied them retroactively this review.
- **PROC-002 (medium):** Gate files 12.11-epic-qa-gate.yml + 12.14-barrier-synchronization.yml carry `reviewer: 'Dex (@dev)'` — @dev self-signed its own QA gate, the exact self-sign-off Story 12.13 AC1 exists to prevent. @qa reproduced + overrode both verdicts (confirmed PASS).
- **REL-001 (low):** 12.11 gate records metrics 53/35/27/8 but hook-metrics.json is a cumulative live counter (read 26/17/13/4 at review) — moving target. Prefer aggregating from immutable gate-logs JSONL.

**Carried from Wave 2:** [[duplicate-story-1-16-id-collision]] context; 12.3 AC7/FR-4.2 aggregate expansion (REQ-001) already CONCERNS, routed to @po — see [[epic12-wave2-fr42-scope-gap]].

**How to apply:** @dev must stop at InReview and hand to @qa; @qa (not @dev) authors gate files + the InReview→Done transition. Relates to [[epic12-wave1-barrier-gate]] and [[epic12-wave2-barrier-gate]].
