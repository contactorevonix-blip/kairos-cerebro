# Task: Validate Scope
# Agent: forge-classifier (Compass)
# Gate: G04 — BLOCKING

## Objectivo
Gate constitucional que bloqueia sistemas demasiado grandes sem PRD prévio.

## Inputs
- `intent.yaml`
- `complexity.yaml`
- Estimativa de workflows necessários

## Regras de Veto (BLOCK)

### VETO 1 — Scope excessivo
SE workflows_estimados > 10:
  → BLOCK: "Este sistema é demasiado grande para criação directa."
  → ACÇÃO: "Cria primeiro um PRD com @pm *create-epic. Divide em fases."

### VETO 2 — Agent count excessivo
SE agents_necessarios > 8:
  → BLOCK: "Demasiados agents para uma única iniciativa."
  → ACÇÃO: "Define roadmap faseado. Fase 1: core. Fase 2+: extensões."

### WARNING (não bloqueia)
SE workflows_estimados entre 5 e 10:
  → WARNING: "Sistema de média-alta complexidade. Considera PRD."
  → CONTINUA após confirmação do utilizador

## Estimativa de Workflows

Para cada tipo de sistema, estimar workflows baseado no número de features:
- 1-3 features → 1-3 workflows estimados
- 4-6 features → 4-6 workflows estimados
- 7+ features → 7+ workflows estimados

## Output
```yaml
scope_validation:
  workflows_estimated: 4
  agents_needed: 6
  veto_triggered: false
  warnings: []
  status: "PASS"
  message: "Scope dentro dos limites. Pipeline pode avançar."
```

Em caso de VETO:
```yaml
scope_validation:
  workflows_estimated: 14
  veto_triggered: true
  veto_reason: "workflows_estimated > 10"
  recommended_action: "Criar PRD com @pm *create-epic antes de avançar"
  status: "BLOCKED"
```

## Critérios de Completude
- [ ] Workflows estimados calculados
- [ ] Agents necessários identificados
- [ ] VETO checks executados
- [ ] Status definido (PASS/WARNING/BLOCKED)
