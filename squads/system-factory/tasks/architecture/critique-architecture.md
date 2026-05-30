# Task: Critique Architecture
# Agent: forge-verifier (reviewer independente)
# Gate: G18 — BLOCKING LOOP

## Objectivo
Pontuar de forma independente a arquitectura em 5 critérios e decidir se está aprovada ou se volta ao G13 para revisão. Reviewer independente (não o autor da arquitectura).

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/architecture/data-model.md` (G15)
- `outputs/{system_name}/architecture/security-architecture.md` (G16)
- `outputs/{system_name}/architecture/spec-traceability.yaml` (G17)

## Critérios (0-5 cada)

| Critério | O que avalia |
|----------|--------------|
| completeness | Cobre todas as features e requisitos? |
| security | OWASP coberto, secrets seguros, RLS correcta? |
| scalability | Aguenta o crescimento esperado? |
| maintainability | Módulos coesos, baixo acoplamento, ADRs claros? |
| testability | A arquitectura permite testar fácil e isoladamente? |

## Processo

### Passo 1 — Avaliar cada critério (0-5)
Pontuar com justificação concreta por critério (não dar nota sem evidência no artefacto).

### Passo 2 — Calcular score médio
`avg = soma / 5`.

### Passo 3 — Decisão BLOCKING LOOP
- **avg < 4.0** → NEEDS_REVISION. Produzir lista específica de correcções. Volta ao G13. Incrementa iteração do loop.
- **avg >= 4.0** → APPROVED. Avança.

### Passo 4 — Controlo de iterações
Se max_iterations do verification-loop for atingido sem APPROVED, escalar para checkpoint humano.

## Output
`outputs/{system_name}/architecture/critique-report.md`
```markdown
# Architecture Critique — {system_name}

## Scores
- completeness: 4 — todas as FR cobertas; falta NFR de latência explícita.
- security: 5 — OWASP completo, RLS por tenant.
- scalability: 4 — workers escalam; rever pool de DB.
- maintainability: 4 — módulos coesos, ADR-001 claro.
- testability: 4 — interfaces injectáveis.

## Average: 4.2 → APPROVED
## Required fixes (se NEEDS_REVISION): n/a
iteration: 1
reviewed_by: forge-verifier
```

## Critérios de Completude
- [ ] Cada critério pontuado 0-5 com justificação
- [ ] Score médio calculado
- [ ] Veredicto APPROVED (>=4.0) ou NEEDS_REVISION (<4.0)
- [ ] Se NEEDS_REVISION: lista específica de correcções + volta a G13
- [ ] iteration registado; escala a humano se max atingido
