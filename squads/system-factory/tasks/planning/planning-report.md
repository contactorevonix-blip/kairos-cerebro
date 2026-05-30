# Task: Planning Report
# Agent: forge-planner (Cartographer)

## Objectivo
Output final da Fase 3 (Planning). Compilar todos os artefactos de planeamento num resumo executivo e actualizar o pipeline-state para desbloquear a Fase 4 (Creation).

## Inputs
- `outputs/{system_name}/planning/epics.yaml`
- `outputs/{system_name}/planning/stories/**/*.story.md`
- `outputs/{system_name}/planning/story-validation-report.md`
- `outputs/{system_name}/planning/dependency-map.yaml`
- `outputs/{system_name}/planning/risk-matrix.md`
- `outputs/{system_name}/planning/roadmap.md`
- `outputs/{system_name}/pipeline-state.yaml`

## Processo
1. Agregar contagens: N epics, M stories, L tasks/milestones.
2. Resumir a sequência de implementação e o caminho crítico.
3. Listar riscos CRITICAL e respectivas mitigações.
4. Confirmar que todos os gates da fase passaram: G19, G20, G21, G22, G23.
5. Actualizar `pipeline-state.yaml`: `planning.status = "complete"`, registar timestamp e ponteiros para artefactos.
6. Sinalizar pronto para Fase 4 (Creation).

## Output
`outputs/{system_name}/planning/planning-report.md`
```yaml
planning_report:
  summary:
    epics: 5
    stories: 18
    milestones: 4
  implementation_sequence: ["1.1", "1.2", "2.1", "2.2", "..."]
  critical_path: ["1.1", "2.1", "2.2"]
  critical_risks: 2
  gates_passed: [G19, G20, G21, G22, G23]
  ready_for_creation: true
pipeline_state_update:
  planning:
    status: complete
    completed_at: "2026-05-30T14:00:00Z"
    artifacts:
      - planning/epics.yaml
      - planning/dependency-map.yaml
      - planning/roadmap.md
```

## Critérios de Completude
- [ ] Contagens agregadas (epics/stories/milestones)
- [ ] Sequência de implementação e critical path resumidos
- [ ] Riscos CRITICAL listados com mitigação
- [ ] Todos os gates da fase confirmados (G19-G23)
- [ ] pipeline-state.yaml actualizado (planning.status = complete)
- [ ] ready_for_creation = true
