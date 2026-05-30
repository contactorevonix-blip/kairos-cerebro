# Task: Agent & Squad Creation Plan
# Agent: forge-planner (Cartographer) + delegate @squad-creator
# Gate: G23

## Objectivo
Verificar se os agents e squads existentes cobrem todas as capacidades exigidas pelas stories. Onde existirem gaps, planear a criação de novos agents/squads via @squad-creator.

## Inputs
- `outputs/{system_name}/planning/stories/**/*.story.md`
- `outputs/{system_name}/classification/agent-squad-mapping.yaml` (G05)
- Registo de agents/squads existentes (`.claude/agents/`, `squads/*/squad.yaml`)

## Processo
1. Extrair de cada story as capacidades técnicas exigidas (ex.: pagamentos, ML scoring, scraping OSINT).
2. Para cada capacidade, fazer matching contra agents/squads existentes (coverage check).
3. Classificar cada capacidade: `COVERED` (agent existe) / `GAP` (sem cobertura).
4. Para cada GAP, decidir: criar **agent** (capacidade específica) ou **squad** (domínio inteiro com vários agents).
5. Se GAP exigir squad/agent novo → activar @squad-creator com o perfil necessário (DNA extraction se baseado em expert real).
6. Registar plano de criação com prioridade e ligação às stories que dependem dele.

## Output
`outputs/{system_name}/planning/agent-creation-plan.md`
```yaml
agent_creation_plan:
  coverage:
    - capability: "Validação de pagamentos Stripe"
      status: COVERED
      by: "@aiox-devops"
    - capability: "Scoring de fraude ML"
      status: GAP
      decision: create_agent
      agent_name: "fraud-scorer"
      priority: high
      blocks_stories: ["2.1", "2.2"]
      via: "@squad-creator"
  gaps_total: 1
  creations_planned: 1
```

## Critérios de Completude
- [ ] Todas as capacidades das stories extraídas
- [ ] Coverage check feito contra agents/squads existentes
- [ ] Cada GAP tem decisão (create_agent / create_squad)
- [ ] Plano liga cada criação às stories dependentes
- [ ] @squad-creator activado para GAPs (se existirem)
