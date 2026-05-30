# Task: Activate Squads
# Agent: forge-builder (Forge)
# Gate: G28

## Objectivo
Activar os squads identificados no planeamento para o projecto criado e registar essa activação no `.aiox-sync.yaml` do projecto.

## Inputs
- `outputs/{system_name}/planning/squad-activation-plan.yaml`
- `outputs/{system_name}/planning/agent-creation-plan.md`
- Squads disponíveis (`squads/*/squad.yaml`)

## Processo
1. Ler o squad-activation-plan e listar os squads a activar para o projecto.
2. Para cada squad, confirmar que existe e está pronto (se foi criado em G23, validar criação).
3. Activar cada squad no contexto do projecto (registar redirects/aliases conforme o IDE alvo).
4. Actualizar `.aiox-sync.yaml` do projecto com os squads activos, agents e respectivos triggers.
5. Confirmar que os agents necessários por milestone estão acessíveis.

## Output
`.aiox-sync.yaml` actualizado no projecto:
```yaml
aiox_sync:
  active_squads:
    - id: system-factory
      agents: [forge-builder, forge-verifier]
    - id: claude-code-mastery
      agents: [hooks-architect]
  activated_at: "2026-05-30T15:00:00Z"
  project: "{system_name}"
```

## Critérios de Completude
- [ ] Squads do plano listados
- [ ] Cada squad confirmado como existente/pronto
- [ ] Squads activados no contexto do projecto
- [ ] .aiox-sync.yaml actualizado com squads/agents/triggers
- [ ] Agents por milestone acessíveis
