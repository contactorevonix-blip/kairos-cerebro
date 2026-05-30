# Task: Implement Stories
# Agent: forge-builder (Forge) + delegate @aiox-dev
# Gate: G27 (BLOCKING)

## Objectivo
Implementar todas as stories validadas, em sequência ditada pelas dependências, em modo YOLO. Cada story é implementada, testada e auto-criticada antes de ser marcada DONE.

## Inputs
- `outputs/{system_name}/planning/stories/**/*.story.md` (validadas, G21)
- `outputs/{system_name}/planning/dependency-map.yaml` (implementation_sequence)
- Projecto scaffolded (G24) + CLAUDE.md (G25)

## Processo
1. Percorrer `implementation_sequence` do dependency-map (foundation primeiro).
2. Para cada story, @aiox-dev em **YOLO mode**:
   - Implementar exactamente os acceptance criteria (sem inventar features).
   - Seguir IDS: SEARCH (procurar código reutilizável) → DECIDE (reuse/adapt/create) → LOG.
   - Escrever testes com a story (unitários + integração relevante).
   - Aplicar **self-critique checklist** após implementar.
   - Actualizar File List e checkboxes da story.
3. Correr testes da story. Story só fica DONE se todos os ACs passarem nos testes.
4. **Gate G27 — BLOCK** se story FAIL → devolver ao @aiox-dev com feedback específico (qual AC falhou, qual teste, qual ficheiro). Repetir até PASS.
5. Avançar para a próxima story só com a anterior DONE (respeitando paralelizáveis quando independentes).

## Output
Código no projecto + stories actualizadas:
```yaml
implementation:
  sequence_followed: true
  stories:
    - id: "1.1"
      status: DONE
      acs_passing: "4/4"
      tests_added: 6
      ids_decisions: ["reuse validator", "create scoring service"]
    - id: "2.1"
      status: DONE
      acs_passing: "4/4"
      tests_added: 8
  all_done: true
  failed_returned_to_dev: 0
```

## Critérios de Completude
- [ ] Stories implementadas na ordem do dependency-map
- [ ] Cada story implementa exactamente os ACs (sem invenção)
- [ ] IDS aplicado e logado por story
- [ ] Testes escritos e a passar por story
- [ ] Self-critique aplicado após cada story
- [ ] Todas as stories DONE (all_done = true)
- [ ] Gate G27 verificado (nenhuma story FAIL pendente)
