# Task: Roadmap
# Agent: forge-planner (Cartographer)

## Objectivo
Produzir a sequência de implementação em milestones, identificando quick wins e a ordem que maximiza valor entregue cedo, com base nas dependências e nos epics.

## Inputs
- `outputs/{system_name}/planning/epics.yaml`
- `outputs/{system_name}/planning/dependency-map.yaml` (G22)
- `outputs/{system_name}/planning/risk-matrix.md`

## Processo
1. Agrupar stories em milestones coerentes (cada milestone = conjunto entregável e demonstrável).
2. Ordenar milestones respeitando o `implementation_sequence` do dependency-map (foundation primeiro).
3. Identificar **quick wins**: stories de baixo esforço e alto valor, colocáveis cedo para momentum.
4. Mapear riscos CRITICAL às milestones onde devem ser mitigados.
5. Definir critério de "done" por milestone (o que tem de funcionar para fechar).

## Output
`outputs/{system_name}/planning/roadmap.md`
```yaml
roadmap:
  milestones:
    - id: M1
      name: "Foundation — auth + scaffold"
      stories: ["1.1", "1.2"]
      goal: "Cliente autentica e faz request básico"
      quick_wins: ["1.1"]
      mitigates_risks: []
    - id: M2
      name: "Core scoring"
      stories: ["2.1", "2.2", "2.3"]
      goal: "POST /score operacional end-to-end"
      quick_wins: []
      mitigates_risks: ["R1"]
  total_milestones: 4
  first_value_milestone: M1
```

## Critérios de Completude
- [ ] Stories agrupadas em milestones
- [ ] Milestones ordenadas por dependência
- [ ] Quick wins identificados
- [ ] Riscos CRITICAL mapeados a milestones
- [ ] Critério de done por milestone definido
