---
name: project_epic8-phase2-open-questions
description: Open architecture questions flagged in EPIC-8 Phase 2 (IDS) stories 8.2.1-8.2.9, pending @architect/@po resolution
metadata:
  type: project
---

During creation of stories 8.2.1-8.2.9 (2026-06-11), several PRD ACs referenced infrastructure that doesn't clearly exist yet in the codebase. Each was preserved verbatim (Article IV — No Invention) but flagged in the story's Risks section with `[AUTO-DECISION]` markers for @po/@architect to resolve during `*validate-story-draft`.

**Open questions:**
1. **8.2.1/8.2.2 dependency direction conflict** — PRD body says 8.2.1 depends on 8.2.2 (auto-heal first); `docs/research/ids-enhancement-gaps.md` summary table says the reverse.
2. **8.2.4 AC2 hosting model** — `GET /api/ids/entity/{id}/score` assumes a REST API server exists in the AIOX core. No such server was found (Article I is CLI-First, NON-NEGOTIABLE). Needs @architect decision: CLI command vs REST endpoint vs attach to 8.2.7's dashboard server.
3. **8.2.5 AC4 registry schema** — `metadata.created_justification` implies adding a per-entity `metadata:` sub-key to `entity-registry.yaml` (823 entities). Current schema has no per-entity `metadata` block (only file-level). Additive change, needs @architect sign-off.
4. **8.2.7 AC1/AC5 dashboard** — `http://localhost:3000/ids` implies a persistent web server (port 3000 = common Next.js default, project's active preset is `nextjs-react`). No such server confirmed. AC5 "real-time webhook" likely needs reinterpretation as polling/file-watch given the file-based JSONL gate-log architecture (`.aiox/gate-logs/`).
5. **8.2.9 AC2 possible duplicate of 8.2.1 AC1** — both reference `.husky/pre-push` G6 wiring; 8.2.9 should verify 8.2.1's work before re-implementing.
6. **8.2.9 AC4 CI logging** — `.aiox/gate-logs/` is local-runtime; GitHub Actions runners need an alternative persistence (artifact upload or PR comment) since `.aiox/` doesn't survive CI runs.

**How to apply:** When @po runs `*validate-story-draft` on 8.2.1-8.2.9, these 6 items are the primary NO-GO/conditional-GO candidates. If @architect resolves the hosting-model questions (2, 4) generally (e.g., "AIOX gets a lightweight local API server for all IDS tooling"), that decision likely also applies to Phase 3 (Squad Creator) stories — check before drafting Phase 3.
