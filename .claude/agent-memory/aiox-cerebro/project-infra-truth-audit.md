---
name: project-infra-truth-audit
description: Auditoria de infraestrutura completa 2026-05-29 — score 71/100, gaps críticos de documentação fantasma vs realidade
metadata:
  type: project
---

Auditoria brutal de toda a infraestrutura KAIROS_CEREBRO (2026-05-29). Score global 71/100, nível NEEDS-WORK.

**Why:** Pedro pediu a verdade sem suavizar após clonar DNA de 8 experts de elite. Padrão de comparação = gold standard mundial.

**How to apply:** Antes de declarar "production-ready", verificar se estes gaps críticos foram corrigidos. Não confiar em STATE.md / READMEs sem verificar disco.

Gaps CRÍTICOS detectados (documentação que mente sobre a realidade):
1. `STATE.md` descreve "Business Squad" completo (7 agents, 48 tasks, score 9.2) que NÃO existe em `squads/business/` (Glob vazio). Também diz audit 84/100 quando real é 91/100, e agents em `.claude/agents/` quando estão em `.claude/commands/Claude-Code-Mastery/`.
2. `.claude/hooks/README.md` documenta 7 hooks Python (read-protection.py, sql-governance.py, mind-clone-governance.py etc.) que NÃO existem. Os reais são 5 .cjs (post-tool-use-observer, pre-commit-lint, enforce-git-push-authority, prompt-router, synapse-engine). Zero .py em `.claude/hooks/`.
3. `squads/squad-creator/squad.yaml` aponta para `agents/*.md` mas `squads/squad-creator/agents/` não existe — ficheiros estão soltos em `.claude/agents/`.

Estado real verificado:
- 4 squads em disco: claude-code-mastery (91/100), deep-research (88/100, 11 agents, fidelity 91-95, MELHOR squad mas invisível no CLAUDE.md), squad-creator (70/100), aiox-cerebro/Kronos (82/100).
- 18 mind DNAs reais e completos (8 ccm + 10 deep-research), fidelity ≥85. Genuínos, não fachada.
- Hooks: 4/17 eventos cobertos. Hooks Python de produção existem em `.aiox-core/monitor/hooks/` (10 ficheiros) — podem ser fonte para expandir cobertura.
- Lixo estrutural: `.aiox-core/node_modules/` versionado, `Desktop.code-workspace` em `.claude/agents/`.
- Naming incoerente: CLAUDE.md diz `@dev`, agente real é `@aiox-dev`.

Padrão raiz: a infra DECLARA mais do que EXISTE — viola Artigo IV (No Invention) na própria meta-camada.

Relacionado: [[project-ccm-squad-audit]]
