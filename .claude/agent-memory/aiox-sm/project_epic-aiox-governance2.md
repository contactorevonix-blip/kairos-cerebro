---
name: project-epic-aiox-governance2
description: EPIC-AIOX-GOVERNANCE-2 — 4 stories Draft criadas 2026-06-25; governance documentation (19sp total); S3 é implementação, S1/S2/S4 são docs puras
metadata:
  type: project
---

EPIC-AIOX-GOVERNANCE-2 (Organization & Documentation) — 4 stories Draft criadas em 2026-06-25.

**Why:** Estrutura do projecto é intencional (L1-L4 layers + shim/skill activation) mas documentação fragmentada — developers não sabem qual ficheiro editar, qual a fonte de autoridade, nem onde colocar ficheiros novos.

**How to apply:** Verificar estado destas stories antes de criar qualquer nova story relacionada com agent governance ou folder structure.

Stories e paths:
- S1 (5sp): `docs/stories/epics/EPIC-AIOX-GOVERNANCE-2/EPIC-AIOX-GOVERNANCE-2.S1.agent-connectivity-matrix.story.md` — AGENT-CONNECTIVITY-MAP.md; @dev + @po
- S2 (3sp): `docs/stories/epics/EPIC-AIOX-GOVERNANCE-2/EPIC-AIOX-GOVERNANCE-2.S2.activation-flow-documentation.story.md` — AGENT-ACTIVATION-FLOW.md; @dev + @qa
- S3 (8sp): `docs/stories/epics/EPIC-AIOX-GOVERNANCE-2/EPIC-AIOX-GOVERNANCE-2.S3.authority-registry-hooks.story.md` — agent-authority-registry.yaml + validate-authority-registry.cjs + tests; @dev + @qa
- S4 (3sp): `docs/stories/epics/EPIC-AIOX-GOVERNANCE-2/EPIC-AIOX-GOVERNANCE-2.S4.folder-structure-guide.story.md` — FOLDER-STRUCTURE.md; @dev + @po

Total: 19sp | S1/S2/S4 parallel, S3 independent | Todas status: Draft

PRD: `docs/PRDs/PORD-AIOX-Governance-Documentation.md`
Output principal de S3: `.aiox-core/data/agent-authority-registry.yaml` + `.claude/hooks/validate-authority-registry.cjs`
