# Task: Spec Completeness
# Agent: forge-architect (Atlas) + delegate @aiox-pm (Morgan)
# Gate: G17 — BLOCKING

## Objectivo
Verificar que cada feature da spec rastreia para um requisito (FR-* ou NFR-*) e que existem zero features inventadas. Aplica o Artigo IV da Constitution AIOX — No Invention.

## Inputs
- `outputs/{system_name}/architecture/architecture-report.md` (draft)
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/research/research-report.md` (Fase 1)

## Princípio (Art. IV — No Invention)
Cada statement na spec MUST rastrear para FR-*, NFR-*, CON-* ou um finding de research. Nada inventado.

## Processo

### Passo 1 — Extrair todas as features/statements da spec
Listar cada feature, requisito não-funcional e decisão presente na arquitectura.

### Passo 2 — Mapear para requisito
Para cada item, identificar o FR-*/NFR-*/CON-* ou finding de research que o origina.

### Passo 3 — Marcar UNTRACED
Qualquer item sem origem é marcado UNTRACED.

### Passo 4 — Decisão BLOCKING
Qualquer UNTRACED → o gate G17 BLOQUEIA. Resolução: (a) ligar a um requisito real, ou (b) remover a feature. @aiox-pm decide se vira novo requisito formal.

## Output
`outputs/{system_name}/architecture/spec-traceability.yaml`
```yaml
traceability:
  - feature: "Score 0-100 OSINT"
    traces_to: "FR-01"
    status: TRACED
  - feature: "Webhook de score assíncrono"
    traces_to: "research-report.md#anti-pattern-sync"
    status: TRACED
  - feature: "Dashboard de analytics"
    traces_to: null
    status: UNTRACED
    resolution: "removido — não há FR; @aiox-pm não promoveu a requisito"
  summary:
    total: 12
    traced: 11
    untraced: 0   # após resolução
  verdict: PASS
```

## Critérios de Completude
- [ ] Todas as features/statements extraídos
- [ ] Cada item mapeado para FR/NFR/CON ou research finding
- [ ] Itens sem origem marcados UNTRACED
- [ ] Cada UNTRACED resolvido (ligado ou removido)
- [ ] BLOCK enquanto existir UNTRACED não resolvido
- [ ] verdict: PASS apenas com 0 untraced
