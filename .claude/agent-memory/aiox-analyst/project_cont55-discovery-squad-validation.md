---
name: cont55-discovery-squad-validation
description: CONT55 — skill aiox-discovery-squad tem knowledge base oco (stubs); as 5 estruturas determinísticas #26-#30 precisam de reconciliar com infra L2 existente, não greenfield
metadata:
  type: project
---

# CONT55 — Validação Discovery Squad + 5 Estruturas Determinísticas

**Skill `aiox-discovery-squad`** (`~/.claude/skills/aiox-discovery-squad/`): funciona como prompt-router mas o knowledge base é OCO — as pastas `references/ iteracoes/ reports/` contêm só `README.md` stubs que PROMETEM ficheiros inexistentes (RESEARCH-METHODOLOGY.md, PROBLEM-CATEGORIES.md, iteration-*.md, etc.). Números de ROI ("$2.46M-$4.78M", "$7.5M", "$1.9M-$3.7M" — três valores diferentes!) não têm suporte → tratar como estimativas não-verificadas (Art. IV No Invention). Versão inconsistente (frontmatter 1.0.0 vs rodapé 2.0).

**As 5 estruturas (#26-#30) em `.aiox/investigation-report-CONT54.md` linhas 318-474):**
- #26 QA Scoring (6/10): aritmética partida (máx ~5pts mas exige >=7); diverge de `qa-gate-tmpl.yaml` + `story-lifecycle.md` (7 checks, PASS/CONCERNS/FAIL/WAIVED). Best practice = threshold-por-condição, não soma agregada.
- #27 Dependency Graph (8/10): falta cycle-detection (Kahn). `depends_on`/`blocks` redundantes → eleger uma fonte única.
- #28 Handoff State Machine (7/10): vocabulário DRAFT/READY_FOR_REVIEW/CLOSED CONFLITA com lifecycle canónico Draft/Ready/InProgress/InReview/Done. Mistura lifecycle com handoff-compaction (já em `agent-handoff.md`).
- #29 Escalation (6/10): triggers de tempo (anti-pattern p/ agentes IA — usar nº tentativas); redunda com `qa-loop.yaml` (maxIterations+triggers) + `blocker-resolver.js`.
- #30 Decision Log (8/10): JSONL append-only é ótimo, MAS `# LEARNED auto-compression` reescreve eventos → quebra imutabilidade. `LEARNED` deve ir p/ `learned-patterns.yaml` (já existe).

**Why:** O @architect ia desenhar isto. Tema transversal = RECONCILIAÇÃO, não greenfield — o framework JÁ TEM story-lifecycle, qa-gate-tmpl, qa-loop, agent-handoff, gate-logs, learned-patterns.
**How to apply:** Qualquer design futuro destas estruturas deve estender artefactos L2 existentes (→ requer `@aiox-master *propose-modification` pois L2 é NEVER modify) ou criar ficheiros L3 que os referenciam. Ver [[aiox-governance-gates]].
