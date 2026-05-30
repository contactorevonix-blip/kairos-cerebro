# Task: Squad Activation Plan
# Agent: forge-planner (Cartographer)

## Objectivo
Para cada fase da implementação, definir qual o squad/agent activo e os handoffs entre eles, garantindo continuidade de contexto durante a fase de criação.

## Inputs
- `outputs/{system_name}/planning/roadmap.md`
- `outputs/{system_name}/planning/agent-creation-plan.md` (G23)
- `outputs/{system_name}/planning/dependency-map.yaml`

## Processo
1. Para cada milestone do roadmap, identificar o squad/agent responsável pela execução.
2. Definir os handoffs entre fases (quem entrega o quê a quem) seguindo o protocolo agent-handoff.
3. Mapear pontos de delegação (ex.: @aiox-data-engineer para migrations, @aiox-devops para CI/CD).
4. Definir o gatilho de activação de cada squad (quando começa) e a condição de saída (quando termina).
5. Garantir que cada agent novo (do agent-creation-plan) está activado antes da milestone que o precisa.

## Output
`outputs/{system_name}/planning/squad-activation-plan.yaml`
```yaml
squad_activation_plan:
  phases:
    - milestone: M1
      active_squad: system-factory
      lead_agent: forge-builder
      delegates: ["@aiox-dev"]
      activation_trigger: "planning.status == complete"
      exit_condition: "M1 stories DONE"
      handoff_to: M2
    - milestone: M2
      active_squad: system-factory
      lead_agent: forge-builder
      delegates: ["@aiox-dev", "@aiox-data-engineer"]
      activation_trigger: "M1 complete"
      exit_condition: "M2 stories DONE"
      handoff_to: verification
  handoff_protocol: ".claude/rules/agent-handoff.md"
```

## Critérios de Completude
- [ ] Cada milestone tem squad/agent activo definido
- [ ] Handoffs entre fases especificados
- [ ] Pontos de delegação mapeados
- [ ] Gatilhos de activação e condições de saída definidos
- [ ] Agents novos activados antes das milestones dependentes
