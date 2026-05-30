# Task: Create Squad
# Agent: forge-builder (Forge) + delegate @squad-creator
# Trigger: Activado por G23 quando um squad novo é necessário

## Objectivo
Criar um squad novo quando o agent-creation-plan identifica um domínio sem cobertura. Usa o @squad-creator; se o squad for baseado num expert real, aplica DNA extraction.

## Inputs
- `outputs/{system_name}/planning/agent-creation-plan.md` (decisão create_squad)
- Perfil do domínio em falta (capacidades, expert de referência se existir)

## Processo
1. Confirmar a decisão `create_squad` vinda do G23 e o domínio alvo.
2. Activar @squad-creator com o perfil: nome, domínio, agents previstos, orchestrator.
3. Se baseado num **expert real** → DNA extraction (princípios, heurísticas, vocabulário do expert) para moldar a persona.
4. Gerar a estrutura do squad: `squad.yaml`, agents, tasks, workflows base.
5. Validar o squad.yaml (contratos coerentes, sem tabs, indentação par — ambiente sem js-yaml/Python).
6. Registar o novo squad para activação posterior (activate-squads, G28).

## Output
`squads/{new_squad}/`:
```yaml
squad_created:
  id: fraud-intel
  path: "squads/fraud-intel/"
  orchestrator: fraud-chief
  agents: [fraud-chief, fraud-scorer, osint-hunter]
  dna_extracted_from: "expert: <referência>"
  squad_yaml_valid: true
  ready_for_activation: true
```

## Critérios de Completude
- [ ] Decisão create_squad confirmada (G23)
- [ ] @squad-creator activado com perfil completo
- [ ] DNA extraction feito (se baseado em expert)
- [ ] Estrutura do squad gerada (squad.yaml + agents + tasks)
- [ ] squad.yaml validado (indentação/contratos)
- [ ] Squad registado para activação
