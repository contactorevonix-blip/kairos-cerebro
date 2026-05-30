# Task: Architecture Report
# Agent: forge-architect (Atlas)
# Gate: (output final da Fase 2 — Arquitectura)

## Objectivo
Compilar todos os outputs da Fase 2 num relatório único, apresentar o checkpoint humano de confirmação da arquitectura e marcar a fase como concluída no pipeline-state.

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/architecture/data-model.md` (G15)
- `outputs/{system_name}/architecture/security-architecture.md` (G16)
- `outputs/{system_name}/architecture/spec-traceability.yaml` (G17)
- `outputs/{system_name}/architecture/critique-report.md` (G18 — deve ser APPROVED)
- `outputs/{system_name}/architecture/adrs/*`

## Processo

### Passo 1 — Sumário executivo
Resumir as decisões de arquitectura em poucos bullets.

### Passo 2 — Compilar secções
Stack, boundaries, data model, security, traceability, critique, lista de ADRs — com link para cada artefacto.

### Passo 3 — Confirmar critique APPROVED
A arquitectura só fecha se o G18 for APPROVED (avg >= 4.0).

### Passo 4 — Human checkpoint (BLOCKING)
Apresentar ao humano para confirmação explícita da arquitectura antes de avançar para a Fase de implementação. Sem confirmação, não avança.

### Passo 5 — Actualizar pipeline-state
Marcar `architecture.status = "complete"`.

## Output
`outputs/{system_name}/architecture/architecture-report.md`
```markdown
# Architecture Report — {system_name}

## Executive Summary
- Stack: Node.js/Express/PostgreSQL/Railway/Stripe.
- 4 módulos; RLS por tenant; OWASP completo.

## Sections
- Tech Stack → tech-stack.yaml
- Boundaries → boundaries.md
- Data Model → data-model.md / schema.sql
- Security → security-architecture.md
- Traceability → spec-traceability.yaml (0 untraced)
- Critique → critique-report.md (4.2 APPROVED)
- ADRs: ADR-001

## Human Checkpoint
[ ] Arquitectura confirmada por: __________  data: ______
```
+ `outputs/{system_name}/pipeline-state.yaml` → `architecture.status: "complete"`

## Critérios de Completude
- [ ] Sumário executivo presente
- [ ] Todas as secções compiladas com link para o artefacto
- [ ] G18 confirmado APPROVED
- [ ] Human checkpoint apresentado e aguarda confirmação
- [ ] pipeline-state.yaml actualizado (architecture.status = "complete")
