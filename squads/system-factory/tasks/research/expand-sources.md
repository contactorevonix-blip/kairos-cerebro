# Task: Expand Sources
# Agent: forge-researcher (Oracle)
# Gate: (loop step — wf-research-loop, quando G12 score < 8.0)

## Objectivo
Quando o confidence-gate (G12) bloqueia com score < 8.0, identificar os gaps específicos da iteração anterior e definir uma estratégia concreta para obter mais fontes TIER_0 e fechar esses gaps.

## Inputs
- `outputs/{system_name}/research/confidence-score.yaml` (G12 — secção gaps)
- `outputs/{system_name}/research/evidence-audit.yaml` (G11)
- `outputs/{system_name}/research/bias-report.md` (G11b)

## Processo

### Passo 1 — Ler os gaps do G12
Cada gap diz qual componente ficou abaixo do alvo (ex.: poucos TIER_0, PICO sem resposta, bias não mitigado).

### Passo 2 — Mapear gap → acção de research
Para cada gap, definir a acção que o fecha:
- Poucos TIER_0 → identificar docs oficiais, benchmarks reproduzíveis, código aberto.
- PICO sem resposta → pesquisa dirigida à parte da questão sem evidência.
- Bias não mitigado → procurar fontes que contradigam a hipótese ou concorrentes menos visíveis.

### Passo 3 — Priorizar
Ordenar acções por impacto no score (componente com maior peso e maior défice primeiro).

### Passo 4 — Definir critério de paragem
Indicar que evidência específica é necessária para considerar o gap fechado nesta iteração.

## Output
`outputs/{system_name}/research/expanded-sources.md`
```markdown
# Expanded Sources — iteração {N}

## Gap 1: tier0_count baixo (peso 0.30)
- Acção: obter docs oficiais de pricing de 2 concorrentes (TIER_0).
- Fontes-alvo: pricing pages oficiais, changelog público.
- Critério de fecho: +2 fontes TIER_0 registadas.

## Gap 2: pico_answered parcial (peso 0.15)
- Acção: pesquisa dirigida ao Outcome (PPV real vs concorrentes).
- Critério de fecho: 1 benchmark reproduzível encontrado.

## Prioridade: Gap 1 > Gap 2 (maior peso)
```

## Critérios de Completude
- [ ] Cada gap do G12 mapeado para uma acção concreta
- [ ] Acções priorizadas por impacto no score
- [ ] Cada acção tem fontes-alvo e critério de fecho
- [ ] Output pronto a re-alimentar G07-G09 na próxima iteração
