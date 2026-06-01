---
name: aiox-governance-gates
description: Bob mode, Tier System, Decision Heuristics e IDS Gates G1-G6 do AIOX — fronteiras e thresholds reais
metadata:
  type: project
---

Mecanismos de governança/decisão do AIOX (verificados em código).

**Why:** Extraídos numa masterclass de pontos cegos; são thresholds duros que determinam bloqueios reais.
**How to apply:** Ao recomendar criação de squads/automações ou ao explicar porque um gate bloqueia.

**Bob Mode** (`@pm user_profile=bob`, `pm.md`): regra `NEVER_EMULATE_AGENTS`. Bob orquestra spawnando agentes em terminais SEPARADOS (TerminalSpawner), nunca simula respostas no próprio contexto. Corre cleanup de lifecycle (sessões >30d, snapshots >90d) e verifica sessão existente antes do greeting. Toggle: `*toggle-profile` (bob↔advanced).

**Tier System** (`tier-system-framework.md`): Tier 0 (diagnóstico) corre SEMPRE primeiro e recomenda tier de execução. Tier 1 core (gate exige score >= 7.0 por dimensão), Tier 2 systematizers, Tier 3 format, Tools = utilitários (não agentes).

**Decision Heuristics** (`decision-heuristics-framework.md`):
- Coherence Scan: `consistency` peso 1.0 = VETO. Coerência supera capacidade (capability peso só 0.3).
- Automation: NUNCA automatizar sem guardrails (VETO). 3x repetida sem automação = falha de design.
- Scope Complexity Gate (blocking): VETO criação direta de squad se >= 10 workflows OU >= 8 agentes → exige PRD.

**IDS** (`.claude/rules/ids-principles.md`):
- Hierarquia REUSE (>=90%) > ADAPT (60-89%, mudança <=30%, não quebrar usedBy) > CREATE (justificar + registar em 24h).
- Gates G1-G6: só **G5 (@qa)** e **G6 (@devops/CI)** bloqueiam merge. G1-G4 são advisory/informational (G4 @dev só loga métricas).
- Override: `--override-ids --override-reason "..."` fica em audit trail.

Relacionado: [[aiox-framework-governance]], [[synapse-engine-internals]].
