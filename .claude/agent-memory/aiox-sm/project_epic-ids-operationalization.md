---
name: epic-ids-operationalization
description: EPIC-IDS-OPERATIONALIZATION criado Cont 76 (2 stories, 12-14sp); IDs renomeados de EPIC-2/2.1/2.2 para EPIC-IDS-OPS/IDS-OPS.1/IDS-OPS.2 por colisão de numeração
metadata:
  type: project
---

EPIC-IDS-OPERATIONALIZATION criado em 2026-06-24 (Cont 76), com 2 stories Draft (IDS-OPS.1 — IDS Decision Engine, 6-7sp; IDS-OPS.2 — @sm Integration, 6-7sp). Total 12-14sp, 5-7 dias, track Standard.

**Why renomeado de EPIC-2/2.1/2.2:** `docs/stories/INDEX-AUTHORITATIVE.md` Secção 3 documenta "EPIC-2" como HIGH severity collision (Control Core lineage Schema B vs SYNAPSE lineage Schema A já ocupam 2.0-2.5). Criar mais um EPIC-2 aumentaria a dívida de colisões já assinalada. Usei IDs não-numéricos (EPIC-IDS-OPS, stories IDS-OPS.1/IDS-OPS.2) seguindo Schema C (`docs/stories/epics/{epic-folder}/{story-id}-{title}.md`).

**How to apply:** Sempre que receber missão para criar epic/stories com número específico, verificar primeiro `docs/stories/INDEX-AUTHORITATIVE.md` Secção 2-3 antes de aceitar o número à letra — se colidir, propor [AUTO-DECISION] com ID alternativo e documentar a razão no próprio epic.

**Bloqueador conhecido (IDS-OPS.2):** `.aiox-core/development/tasks/create-next-story.md` é L2 (Framework Boundary, NEVER modify directamente) — a integração do Decision Engine no fluxo `*draft` não pode editar esse ficheiro sem passar por `@aiox-master *propose-modification`. 3 caminhos alternativos documentados na story (propose-modification / hook externo em `.claude/hooks/` / extensão via config L3). @dev/@architect devem resolver isto como Task 1 antes de codificar.

**Dependência sequencial:** IDS-OPS.2 não pode iniciar implementação antes de IDS-OPS.1 estar pelo menos InReview (precisa da API do decision engine estável).

Ficheiros criados:
- `docs/stories/epics/EPIC-IDS-OPERATIONALIZATION.md`
- `docs/stories/epics/IDS-OPS.1-ids-decision-engine.story.md`
- `docs/stories/epics/IDS-OPS.2-sm-ids-integration.story.md`
- `docs/architecture/ADR-IDS-DECISION-ENGINE.md`

Relacionado: [[project_epic-aiox-ops]] (precedente de naming AIOX-OPS), Story 1.19 (IDS Enforcement Wiring — prerequisite, InReview, hook registration bloqueado por Art. VI-VII).

Próximo passo: @po `*validate-story-draft` para ambas as stories.
