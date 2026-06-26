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

**S1 code/ops hybrid resolved 2026-06-24 (Option B — clarify, NOT split):** S1 looked hybrid (margin calculator = code + sourcing = ops). Resolution: S1 builds NO software. The `calcMargin()` function + 5-case test suite + Supabase margin tracker all live in **S4 Task 2 + Task 8** — S4 is the formula's single code owner (S4 Dev Notes declare formula "exact — same as S1/S3"). Splitting S1 into S1a(calculator)+S1b(ops) was rejected: a separate S1a calculator duplicates S4 (Art. IV-A / NEVER-009, REUSE>CREATE). Instead, tagged every S1 AC/Task/Scope: **[MANUAL]** (founder-only real data — quotes, seller counts, spend), **[CALC]** (apply formula by hand or via 3rd-party FBA calculator, no code), **[VALIDATION]** (@po-gated pass/fail). S1→produces CSV of real quotes+hand-computed margins; S4→consumes CSV with code. They share the formula, not the implementation. **How to apply:** if S1 returns as a "dev story" with a calcMargin function/test/CLI, that is scope creep into S4 — reject it. Margin formula re-verified vs 02-financial-models.md lines 26-46 (€10+€0.50+€2.00=€12.50; €25−€3.75−€0.75−€12.50=€8 = 32% net).
