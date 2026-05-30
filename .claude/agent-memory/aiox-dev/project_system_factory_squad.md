---
name: project-system-factory-squad
description: Estrutura e contratos do squad system-factory (pipeline universal de criação de sistemas)
metadata:
  type: project
---

Squad `system-factory` em `squads/system-factory/` — pipeline universal para criar sistemas de elite a partir de descrição em linguagem natural.

**Why:** Squad que orquestra criação ponta-a-ponta (classify → research → architecture → planning → creation → verification). Orchestrator é `forge-classifier`; 6 agentes forge-* (classifier, researcher, architect, planner, builder, verifier).

**How to apply:** O `squad.yaml` é o contrato — declara 4 workflows, 6 templates, 30 elite gates. Ao adicionar artefactos, preencher contratos já declarados em squad.yaml antes de inventar novos.

Workflows criados (2026-05-30): `wf-universal-factory.yaml` (30 gates G01-G30, 7 fases phase_0..phase_6), `wf-research-loop.yaml` (loop até research_confidence_score >= 8.0), `wf-quick-create.yaml` (fast path para complexity <= 8). Falta `wf-verification-loop.yaml` (declarado em squad.yaml linha 49, ainda inexistente).

Templates: `templates/saas-api/CLAUDE.md` criado (20 secções). squad.yaml prevê 6 templates no total — os outros 5 ainda em falta.

Tasks (2026-05-30): `tasks/classification/` com 10 tasks (G01-G05 e afins). `tasks/research/` com 15 tasks — 4 prévias (pico-formulation G06, competitive-intel G07, market-osint G08, tech-patterns G09) + 11 novas (pattern-recognition G10, evidence-audit G11, bias-check G11b, confidence-gate G12 loop, expand-sources, research-report, anti-pattern-research, regulatory-check, technology-risk, validate-sources, enrich-intelligence). `tasks/architecture/` com 13 tasks (select-stack G13, define-boundaries G14, design-data-model G15, security-architecture G16, spec-completeness G17, critique-architecture G18 loop, + api-contract, infrastructure-design, create-adr, performance-design, dependency-audit, architecture-report, brownfield-analysis). Formato de task: cabeçalho `# Task/# Agent/# Gate` + secções Objectivo/Inputs/Processo/Output(exemplo yaml)/Critérios de Completude. Gates BLOCKING: G13-G17; loops: G12 e G18.

**Nota de validação:** Este ambiente NÃO tem `js-yaml` (Node) nem Python/PyYAML disponíveis. Para validar YAML usar verificação de indentação inline em Node puro (sem tabs, indentação par).
