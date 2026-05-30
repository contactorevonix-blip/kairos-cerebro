# Task: Create Stories
# Agent: forge-planner (Cartographer) + delegate @aiox-sm
# Gate: G20 (BLOCKING)

## Objectivo
Para cada epic, criar stories implementáveis seguindo o template AIOX. Cada story é uma unidade de trabalho com acceptance criteria verificáveis, pronta para o @aiox-dev implementar.

## Inputs
- `outputs/{system_name}/planning/epics.yaml` (G19)
- `outputs/{system_name}/architecture/architecture.md`
- Template de story AIOX (`.aiox-core/development/templates/story-tmpl.yaml`)

## Regras
- Mínimo **3 stories por epic**.
- Cada story segue o template AIOX: título, context, acceptance criteria, task list, file list, dev notes.
- Cada story tem 3-5 acceptance criteria, todos verificáveis (testáveis automaticamente quando possível).
- Stories pequenas o suficiente para serem implementadas e testadas num ciclo.

## Processo
1. Para cada epic em `epics.yaml`, derivar as stories que cumprem os `completion_criteria`.
2. Para cada story preencher o template AIOX:
   - **Title:** verbo + objecto (ex.: "Implementar endpoint POST /score").
   - **Context:** porquê esta story existe, ligação ao epic.
   - **Acceptance Criteria:** 3-5 ACs verificáveis (formato Given/When/Then ou afirmação testável).
   - **Task List:** passos técnicos `[ ]`.
   - **File List:** ficheiros a criar/modificar (preenchido durante implementação).
3. @aiox-sm aplica o template e garante consistência de estrutura entre stories.
4. Atribuir `id` sequencial por epic: `{epic_num}.{story_num}` (ex.: 1.1, 1.2).
5. **Gate G20 — BLOCK** se: epic com < 3 stories, OU story sem acceptance criteria, OU ACs vagos ("funciona bem", "rápido").

## Output
`outputs/{system_name}/planning/stories/{epic_id}/{story_id}.story.md` (um ficheiro por story)
```markdown
# Story 2.1: Implementar endpoint POST /score

## Status: Draft

## Context
Pertence ao EPIC-2 (Motor de scoring). Expõe o cálculo de risco via API.

## Acceptance Criteria
1. POST /score com payload válido devolve 200 + risk_score (0-100)
2. Resposta inclui breakdown por sinal (array de factores)
3. Payload inválido devolve 400 com mensagem de erro estruturada
4. Latência p95 < 800ms sob 50 req/s

## Task List
- [ ] Criar rota POST /score
- [ ] Validar payload com schema
- [ ] Integrar motor de scoring
- [ ] Testes unitários + integração

## File List
(preenchido durante implementação)

## Dev Notes
Reutilizar validador existente em src/validators/.
```

## Critérios de Completude
- [ ] Cada epic tem >= 3 stories
- [ ] Todas as stories seguem o template AIOX
- [ ] Cada story tem 3-5 acceptance criteria verificáveis
- [ ] Nenhum AC vago (todos testáveis/específicos)
- [ ] Cada story tem id sequencial {epic}.{story}
- [ ] Gate G20 verificado
