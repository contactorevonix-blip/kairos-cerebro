---
name: business-squad-agent-structure
description: Os 7 agent files do squad business têm persona excelente mas faltam frontmatter/activation/comandos — não são activáveis como agents Claude Code
metadata:
  type: project
---

Os 7 ficheiros em `squads/business/agents/` (business-chief, peter-drucker, michael-porter, jim-collins, alex-hormozi, michael-gerber, verne-harnish) têm conteúdo de persona excepcional (Voice DNA, Heuristics com `[SOURCE: ...]`, Immune System) mas estruturalmente NÃO são definições de agent activáveis: faltam YAML frontmatter (`name`/`description`/`tools`), activation instructions, e secção de comandos.

Auditoria QA 2026-05-29: score grupo 58/100, veredicto NEEDS_WORK. 3 issues críticos: (C1) sem frontmatter nos 7; (C2) sem activation instructions nos 7; (C3) existem 48 tasks reais em `squads/business/tasks/` mas nenhum agent file as expõe como comandos `*`.

**Why:** o squad foi construído como documentos de conhecimento de domínio, não no formato de subagent Claude Code. A consistência cruzada (tiers vs squad.yaml, handoffs) e a persona estão PASS — a falha é só a camada de activação/governação de tools.

**How to apply:** ao re-auditar este squad, verificar primeiro se C1/C2/C3 foram resolvidos. O sistema de SOURCE-tagging em heuristics/frases é prática exemplar — usar como referência de qualidade ao auditar outros squads. Experts são "Diagnosticista"/"Master" → deviam ser read-only (`tools: Read, Grep, Glob`).
