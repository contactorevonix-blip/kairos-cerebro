---
name: aiox-core-upstream
description: Repo upstream SynkraAI/aiox-core — o que é OURO para clonar (scripts CI/CD e squad claude-code-mastery)
metadata:
  type: project
---

Estamos a fazer cherry-pick do repo público `https://github.com/SynkraAI/aiox-core` para o KAIROS_CEREBRO.

**Why:** Decidir o que vale clonar sem importar lixo de publicação do framework.

**How to apply:** Ao avaliar artefactos do upstream, lembrar:
- Localmente NÃO existe `scripts/` na raiz. `squads/business/scripts/` tem 5 scripts próprios (pipeline-router, pre-task-check, quality-report, validate-squad, verify-sources) — sem sobreposição com scripts de framework do upstream.
- Temos `squads/business/` e `squads/squad-creator/`. NÃO temos o squad `claude-code-mastery` do upstream (7-8 agents sobre domínio Claude Code: hooks, MCP, skills, swarm, config) — candidato OURO.
- Scripts OURO (CI/qualidade reutilizáveis): `semantic-lint.js`, `code-intel-health-check.js`, `check-markdown-links.py`, `validate-registry-determinism.js`, `validate-aiox-core-deps.js`.
- Scripts BRONZE (só servem para publicar o npm package do framework SynkraAI): `validate-package-completeness.js`, `validate-manifest.js`, `generate-install-manifest.js`, `ensure-manifest.js`, `sign-manifest.*`, `validate-aiox-core-namespace.js`, `package-synapse.js`, `e2e/*`.

Relacionado: [[phantom-empire-gold-standard]]
