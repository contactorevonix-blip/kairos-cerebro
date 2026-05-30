# Task: Risk Matrix
# Agent: forge-planner (Cartographer)

## Objectivo
Identificar riscos técnicos e de negócio do sistema a construir, classificá-los por probabilidade e impacto, e definir mitigações. Riscos CRITICAL exigem plano de mitigação antes de avançar para a fase de criação.

## Inputs
- `outputs/{system_name}/architecture/architecture.md`
- `outputs/{system_name}/planning/epics.yaml`
- `outputs/{system_name}/research/research-report.md`

## Processo
1. Brainstorm de riscos em duas categorias: **técnicos** (dependências, integrações frágeis, performance, dívida) e **de negócio** (compliance, custo, time-to-market, adopção).
2. Para cada risco atribuir `probability` (low/medium/high) e `impact` (low/medium/high).
3. Calcular severidade pela matriz:
   - high×high, high×medium → **CRITICAL**
   - medium×medium, high×low → **HIGH**
   - restantes médios → **MEDIUM**
   - low×low → **LOW**
4. Para cada risco definir `mitigation` accionável e `owner`.
5. **Riscos CRITICAL exigem plano de mitigação aprovado antes de avançar** — não bloqueia o pipeline automaticamente, mas é flag para o human checkpoint.

## Output
`outputs/{system_name}/planning/risk-matrix.md`
```yaml
risk_matrix:
  - id: R1
    category: technical
    description: "Dependência de API externa de OSINT sem SLA garantido"
    probability: high
    impact: high
    severity: CRITICAL
    mitigation: "Cache + fallback provider + circuit breaker"
    owner: forge-builder
  - id: R2
    category: business
    description: "GDPR — armazenamento de dados pessoais para scoring"
    probability: medium
    impact: high
    severity: CRITICAL
    mitigation: "Data minimization, retention policy, DPA"
    owner: forge-architect
  critical_count: 2
  mitigation_plans_required: 2
```

## Critérios de Completude
- [ ] Riscos técnicos E de negócio identificados
- [ ] Cada risco com probability + impact
- [ ] Severidade calculada pela matriz
- [ ] Cada risco com mitigation e owner
- [ ] Riscos CRITICAL têm plano de mitigação definido
