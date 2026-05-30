# Task: Bias Check
# Agent: forge-researcher (Oracle) + delegate @kahneman
# Gate: G11b

## Objectivo
Detectar vieses cognitivos na research antes de avançar para a arquitectura, garantindo que decisões futuras assentam em evidência e não em distorções de julgamento.

## Inputs
- `outputs/{system_name}/research/research-report.md` (draft)
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `outputs/{system_name}/research/evidence-audit.yaml` (G11)

## Vieses a verificar

### Viés de disponibilidade
Algo fácil de encontrar não é necessariamente o mais importante. Verificar se a research deu peso excessivo a fontes só por serem acessíveis (primeiros resultados de pesquisa, vendors com mais marketing).

### Viés de confirmação
A research confirma apenas o que já assumíamos no intent? Procurar evidência que contradiz a hipótese inicial — se não existe nenhuma, é sinal de alerta.

### Halo effect
Um concorrente parece melhor só porque é famoso? Separar reputação de mérito técnico medido.

### Viés de ancoragem
A primeira opção de stack/concorrente analisada está a enviesar todas as comparações seguintes?

## Processo
1. Para cada viés, percorrer a research e procurar sintomas concretos.
2. Para cada viés detectado, registar o local exacto (ficheiro + secção) e o impacto.
3. Propor uma mitigação accionável por cada flag (ex.: "procurar 1 fonte que contradiga X").
4. @kahneman valida que a verificação foi feita de forma estruturada, não superficial.

## Output
`outputs/{system_name}/research/bias-report.md`
```markdown
# Bias Report — {system_name}

## Availability bias
- FLAG: 4 dos 5 concorrentes vêm da primeira página de pesquisa.
- Mitigação: procurar 2 concorrentes de nicho menos visíveis.

## Confirmation bias
- OK: research inclui evidência contra OSINT-first (latência).

## Halo effect
- FLAG: Stripe Radar assumido como melhor sem benchmark directo.
- Mitigação: comparar PPV reportado vs concorrentes pequenos.

## Anchoring bias
- OK: stacks comparadas em critérios fixos.

## Veredicto: 2 flags, mitigações definidas — pode avançar com follow-up
reviewed_by: kahneman
```

## Critérios de Completude
- [ ] Os 4 vieses verificados explicitamente
- [ ] Cada flag tem local exacto (ficheiro + secção)
- [ ] Cada flag tem mitigação accionável
- [ ] Veredicto final registado
- [ ] reviewed_by: kahneman preenchido
