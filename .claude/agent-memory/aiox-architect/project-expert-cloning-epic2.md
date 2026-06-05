---
name: project-expert-cloning-epic2
description: EPIC-2 Expert Cloning architecture review — authority conflict (Art. II) and 5 scope CONCERNS that must be resolved before infra build
metadata:
  type: project
---

# EPIC-2 Expert Cloning — Architecture Review (2026-06-05)

Reviewed EPIC-2 (clone 3 expert specialists into CCM squad via 9-layer DNA + MCP Docker + Supabase). Verdict: **CONCERNS** — vision approved, build conditioned on fixes.

**Why:** Pedro asked for technical soundness validation before committing ~150h + infra. The 9-layer DNA spec is excellent; the failure is in boundary rigor.

**How to apply:** Any future expert-cloning work (EPIC-3 scaling Expert #2/#3) inherits these same architectural constraints. Re-check them.

## The blocker (FAIL): authority conflict — Constitution Art. II
- `EXPERT-SPECIALIZATIONS.md` gives experts "Exclusive Authority: Architecture decisions" — collides with Aria's exclusive authority (Art. II line 49) and `agent-authority.md`.
- Two exclusive authorities over one domain = invalid.
- **Resolution recommended (Opção A):** experts are ADVISORY specialists, not authority holders. Core agents (Aria, Orion, Gage) keep exclusive authority and consult experts. No Constitution amendment needed. This matches existing memory pattern: experts "inform", core agents "decide".
- Opção B (Constitutional amendment delegating sub-domain) creates circular dependency — Expert #2 (governance) would need to exist to legitimize Expert #1.

## 5 scope CONCERNS (doc-level fixes, not redesign)
- **C1 Art. I (CLI First):** MCP/REST is the entrypoint as designed — must wrap a canonical CLI (`aiox expert invoke <name>`), not be the source of truth.
- **C2 pgvector over-engineering:** DNA loads by expert_id (key lookup), not similarity. No precedent corpus exists yet. Start relational; add pgvector at scale only if precedent search proves value. Also makes <100ms trivial.
- **C3 cost model wrong:** Verified pricing — Supabase Pro $25/mo (pgvector free), Railway $5-20/mo. Real infra ~$30-50/mo, NOT $200. Dominant cost is Claude API tokens (9-layer DNA = big prompts), which the model omits. Risk: $200 number is invented (Art. IV) without volume estimate.
- **C4 LangGraph is a phantom:** cited as validated tech but no component in the data-flow uses it. It's Expert #3's domain *knowledge*, not the cloning system's *infra*. Remove or justify.
- **C5 RLS without tenancy model:** single-founder single-tenant project — RLS mentioned 4x with no roles/principals defined. Either define multi-tenant intent or use API-level access control. Security implication: misconfigured RLS = false security.
- **C6 fidelity baseline:** experts are synthesized from research, not real people. "Compare to real expert" is impossible. Measure internal consistency (same input → same decision pattern N times) + heuristic adherence instead.

## Sequencing
- Story 2.1 (research) can start NOW — independent of all concerns.
- Story 2.2 (infra) must wait for authority FAIL resolution + C1/C2/C3/C5 doc fixes (~3-4h @pm+@architect).

See [[project-control-plane-design]] for related multi-window orchestration arch.
