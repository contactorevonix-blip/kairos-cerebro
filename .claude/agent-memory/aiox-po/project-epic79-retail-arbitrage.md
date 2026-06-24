---
name: epic79-retail-arbitrage
description: EPIC-79 Retail Arbitrage Validator — 5 stories S1-S5 all validated GO 2026-06-24 (avg 8.6), all Draft→Ready. Business/ops stories not full dev stories.
metadata:
  type: project
---

EPIC-79 (Retail Arbitrage Validator — Month 1, €300 test, Enterprise track, 26 sp). 5 stories validated GO by @po 2026-06-24, all Status Draft→Ready.

**Scores:** S1=9, S2=8, S3=9, S4=9, S5=8 (avg 8.6/10). All ≥7 → proceed to @sm *create-story (expand stubs to full dev stories).

**Why:** PM-created Epic stubs in custom business format (Description/AC/Scope/Dependencies/Business Value/Risks/References/Change Log) — NOT story-tmpl.yaml. They lack Tasks/Subtasks, Dev Notes, Testing, executor-assignment metadata. This is acceptable for pre-implementation business validation on Enterprise track; @sm fills the dev structure next.

**How to apply:** When these stories return for re-validation as full dev stories, expect (and require) Tasks/Subtasks + executor=@dev/quality_gate=@architect (S4 only true code story: Next.js+Supabase dashboard) + Dev Notes. S1/S2/S3/S5 are founder-ops/decision stories, not code — executor mapping is loose.

**Art. IV (No Invention) — VERIFIED PASS:** All financial claims trace to `docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md`: €2.00 FBA fee (line 35), 18% margin floor sits within documented 12-30% net range (line 52), 20% baseline, €120-150 Month-1 net (line 68), 5-15% return rate (line 55), electronics-clearance example (lines 28-46). No invented numbers.

**Common should-fix across all 5:** add Tasks/Subtasks + executor metadata when @sm expands. S5 should-fix: AC5 continue/pivot/stop branch thresholds could be more deterministic.

**CodeRabbit step:** N/A — `coderabbit_integration` key absent from core-config.yaml.

Stories folder: `docs/stories/epics/EPIC-79-retail-arbitrage/`. Niche=electronics clearance (provisional, S1 margin gate ≥18% on ≥3/5 confirms or S5 pivots).
