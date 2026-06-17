---
name: epic10-framework-cleanup
description: EPIC-10 Framework Foundation Cleanup — 3 stories validated 2026-06-13, all GO. Coherence remediation 35→80+ before EPIC-9 Enforcement.
metadata:
  type: project
---

EPIC-10 (Framework Foundation Cleanup) — pre-requisite to EPIC-9 Enforcement. Born from Cont37 audit (score 35/100). 3 stories, 22sp total.

**Why:** Cannot apply enforcement (EPIC-9) on a foundation whose source-of-truth is ambiguous. Audit findings were re-verified by direct filesystem inspection (Art. IV) — several audit claims were oversized/false, so EPIC-10 fixes REAL gaps AND formally disproves false findings (verify-only ACs).

**How to apply:** When validating/sequencing EPIC-10 work, remember 10.1→10.2 is critical path (10.1's docs/ARCHITECTURE.md layer-map informs 10.2); 10.3 runs fully parallel from start.

## Validation 2026-06-13 (all GO, status → Ready)
- **10.1** Folder Clarification & docs/ARCHITECTURE.md — 9/10. executor @analyst / gate @pm (Research type, compliant). 6sp MEDIUM. Doc-only, additive cross-links.
- **10.2** Agent SSoT + Drift Audit — 9/10. executor @dev / gate @qa. 8sp HIGH. Audit-first (drift report before re-sync), uses existing ideSync pipeline.
- **10.3** Task Schema Normalization — 9/10. executor @dev / gate @qa. 8sp HIGH. Metadata-only L2 edits.

## Verified facts (core-config.yaml at .aiox-core/core-config.yaml — NOT repo root)
- `ideSync.source: .aiox-core/development/agents` (single source EXISTS — confirmed)
- ideSync targets: claude-code, codex, gemini, github-copilot(format), cursor(condensed-rules), antigravity(cursor-style), kimi(kimi-skill) — per-IDE formats are intentional, not drift
- `ideSync.validation: strictMode:true, failOnDrift:true, failOnOrphaned:false` (confirmed)
- `boundary.frameworkProtection: false`, expires 2026-06-19 (EPIC-8 Phase 4) — 10.3's L2 metadata edits are allowed until then; after, route via @aiox-master *propose-modification
- `coderabbit_integration.enabled: true` → CodeRabbit validation step applies to all stories
- 10.3 version variants ALL confirmed real: 6 files `version: 2` (sync-documentation, setup-mcp-docker, security-scan, run-workflow-engine, improve-self, environment-bootstrap); `Version: 1.0.0` cap at squad-creator-publish.md:63; `version: "1.0.0"` quoted at story-checkpoint.md:14

## Strong points (why these scored high)
- Background sections grounded in real evidence (Art. IV exemplary) — every claim traced to filesystem
- Verify-only ACs (10.2 AC5 failOnDrift smoke test; 10.3 AC5 circular-ref absence, AC6 task_id) correctly disprove false audit findings rather than "fixing" non-defects
- No Regression ACs present in all 3 (10.1 AC7, 10.2 AC6, 10.3 AC7)
