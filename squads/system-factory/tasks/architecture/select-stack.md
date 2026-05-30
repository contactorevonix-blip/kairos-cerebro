# Task: Select Stack
# Agent: forge-architect (Atlas)
# Gate: G13 — BLOCKING

## Objectivo
Seleccionar o tech stack do sistema com um ADR obrigatório que justifique cada decisão major. Sem ADR, o gate bloqueia.

## Inputs
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/complexity.yaml` (G03)
- `outputs/{system_name}/research/research-report.md` (Fase 1)
- `outputs/{system_name}/research/technology-risk.yaml`
- `data/system-types.yaml`

## Critérios de Pontuação (cada opção, 0-5)

| Critério | Pergunta |
|----------|----------|
| ecosystem | Maturidade de bibliotecas e integrações? |
| performance | Cumpre os requisitos de performance do tipo? |
| team-knowledge | A equipa/o founder já domina? |
| maintenance | Custo de manutenção a longo prazo? |
| cost | Custo de infraestrutura e licenças? |

## Processo

### Passo 1 — Listar opções por camada
Para o tipo detectado, listar 2-3 opções viáveis por camada (runtime, framework, DB, deploy, billing).

### Passo 2 — Pontuar cada opção
Aplicar os 5 critérios (0-5). Somar. A opção vencedora por camada é a de score mais alto, ajustada por technology-risk.

### Passo 3 — Seleccionar e justificar
Escolher o stack final. Cada decisão major gera entrada no ADR-001.

### Passo 4 — Criar ADR-001 (BLOCKING)
Sem ADR-001 com justificação por decisão, o gate G13 BLOQUEIA e não avança.

## Output
`outputs/{system_name}/architecture/tech-stack.yaml`
```yaml
tech_stack:
  runtime: "Node.js LTS"
  framework: "Express"
  database: "PostgreSQL"
  deploy: "Railway"
  billing: "Stripe"
  scores:
    runtime: { ecosystem: 5, performance: 4, team_knowledge: 5, maintenance: 4, cost: 5, total: 23 }
  adr: "architecture/adrs/ADR-001-tech-stack.md"
```
+ `outputs/{system_name}/architecture/adrs/ADR-001-tech-stack.md`

## Critérios de Completude
- [ ] Opções listadas por camada (2-3 cada)
- [ ] Cada opção pontuada nos 5 critérios
- [ ] Stack final seleccionado por score + risco
- [ ] ADR-001 criado com justificação por decisão major
- [ ] BLOCK aplicado se faltar ADR
