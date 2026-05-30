# Task: IDS Duplicate Check
# Agent: forge-classifier (Compass)
# Gate: G05

## Objectivo
Verificar se existe sistema similar em outputs/ ou entity registry antes de criar novo.
Aplicar REUSE > ADAPT > CREATE (princípio IDS do AIOX).

## Inputs
- `intent.yaml`
- `classification.yaml`
- `squads/system-factory/outputs/` (sistemas já criados)
- `.aiox-core/data/entity-registry.yaml`

## Processo

### Passo 1 — Scan de outputs/
Verificar se existe sistema com:
- Mesmo tipo (ex: saas-api)
- Domínio similar (ex: "fraud scoring" vs "fraud detection")
- Stack idêntica

### Passo 2 — Similaridade Score
Para cada sistema encontrado:
- Calcula similaridade de domínio (0-100%)
- Calcula similaridade de features (0-100%)
- Score combinado

### Passo 3 — Decisão IDS

**REUSE (similaridade >= 90%):**
- Apresentar sistema existente ao utilizador
- Sugerir usar/adaptar em vez de criar
- Aguardar decisão humana

**ADAPT (similaridade 60-89%):**
- Apresentar sistema base como ponto de partida
- Listar diferenças necessárias (< 30% do sistema)
- Confirmar que mudanças não quebram consumidores existentes

**CREATE (similaridade < 60% ou sem match):**
- Sem sistema similar encontrado
- Justificação documentada
- Avançar para pipeline completo

## Output
```yaml
ids_check:
  systems_scanned: 3
  similar_systems: []
  decision: "CREATE"
  justification: "Nenhum sistema similar encontrado em outputs/"
  status: "PASS"
```

Ou com match:
```yaml
ids_check:
  systems_scanned: 3
  similar_systems:
    - name: "kairos-check-v1"
      similarity: 85
      path: "outputs/kairos-check-v1/"
  decision: "ADAPT"
  recommendation: "Adaptar kairos-check-v1 em vez de criar do zero"
  status: "HUMAN_DECISION_REQUIRED"
```

## Critérios de Completude
- [ ] outputs/ escaneado
- [ ] Entity registry verificado
- [ ] Decisão IDS tomada
- [ ] Se REUSE/ADAPT: apresentado ao utilizador para decisão
