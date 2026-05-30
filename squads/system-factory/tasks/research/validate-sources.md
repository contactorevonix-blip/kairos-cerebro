# Task: Validate Sources
# Agent: forge-researcher (Oracle) + delegate @ioannidis
# Gate: (validação final de research — alimenta G12)

## Objectivo
Validação final das fontes: confirmar que cada fonte TIER_0 está acessível, actualizada (< 2 anos) e que o conjunto de fontes é independente (não todas do mesmo vendedor).

## Inputs
- `outputs/{system_name}/research/evidence-audit.yaml` (G11)
- Todos os ficheiros de research que citam fontes

## Processo

### Passo 1 — Listar fontes TIER_0 e TIER_1
Extrair do evidence-audit todas as fontes classificadas como verificadas.

### Passo 2 — Verificar acessibilidade
Cada fonte tem URL/referência resolúvel? Marcar BROKEN se inacessível.

### Passo 3 — Verificar actualidade
Data da fonte < 2 anos? Marcar STALE se mais antiga (com excepção justificada para fontes seminais).

### Passo 4 — Verificar independência
Quantas fontes vêm do mesmo vendor/autor? Se a maioria das TIER_0 vem de uma única origem, marcar SINGLE_SOURCE_RISK.

### Passo 5 — Revisão @ioannidis
Confirma que a independência é real e que fontes "neutras" não têm conflito de interesse oculto.

## Output
`outputs/{system_name}/research/validated-sources.yaml`
```yaml
validated_sources:
  total: 19
  accessible: 18
  broken: 1
  stale: 0
  unique_origins: 11
  single_source_risk: false
  issues:
    - source: "blog-x/2021-article"
      status: BROKEN
      action: "substituir ou rebaixar para INFERRED"
  reviewed_by: ioannidis
```

## Critérios de Completude
- [ ] Todas as fontes TIER_0/TIER_1 verificadas quanto a acessibilidade
- [ ] Actualidade (< 2 anos) verificada, excepções justificadas
- [ ] Independência avaliada (unique_origins vs total)
- [ ] single_source_risk determinado
- [ ] Cada issue tem acção corretiva
- [ ] reviewed_by: ioannidis preenchido
