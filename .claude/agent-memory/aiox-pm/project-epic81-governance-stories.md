---
name: epic81-governance-stories
description: EPIC-81 CLAUDE.md governance — 3 stories created (FR-based split); Art. II "gate failure" claim debunked by gate-log inspection
metadata:
  type: project
---

EPIC-81 (CLAUDE.md Complete Governance Optimization) decomposto em 3 stories por cobertura de FR (não pela divisão por deliverable que o próprio PRD sugeria):
- EPIC-81.S1 (10sp): FR-1 Observalidade + FR-2 Audit Trail
- EPIC-81.S2 (8sp): FR-3 Hook Metrics + FR-4 Agent Authority
- EPIC-81.S3 (8sp): FR-5 Security + FR-6 Decision Clarity + FR-7 Doc Structure
Total 26sp. Ficheiros em `docs/stories/epics/EPIC-81-CLAUDE.md-Governance/`. Status Draft, prontas para @po.

**Why:** O PRD `docs/prd/EPIC-81-CLAUDE.md-Complete-Governance.md` foi escrito custom, sem usar `prd-tmpl.yaml` (existe em `.aiox-core/product/templates/`). Recomendação: ADAPT do template no próximo PRD (Art. IV-A IDS).

**Art. II "gate failure" 2026-06-24 20:54 — FALSO (verificado):** inspeccionei `.aiox/gate-logs/art-ii-agent-authority-2026-06-24.jsonl`. No timestamp T20:54 o override `--skip-devops-check` foi REGISTADO como `decision:"override"` (passou, audit-logged, como desenhado). ZERO casos de override rejeitado no ficheiro inteiro (55 allow / 110 block / 110 override). Os `block` intercalados são o padrão normal de dupla-avaliação do gate (loga block, depois override quando detecta a flag). NÃO é uma falha — é comportamento esperado.

**How to apply:** Se ressurgir "o gate Art. II está partido / bloqueou o override", relembrar que isto foi verificado a 2026-06-25 e o override funciona. Não abrir investigação sem nova evidência de um `override` que falhou de facto. Ver [[no-invention-verify-gaps]].
