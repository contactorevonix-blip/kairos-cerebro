# Task: Validate Stories
# Agent: forge-planner (Cartographer) + delegate @aiox-po
# Gate: G21 (BLOCKING LOOP)

## Objectivo
Validar cada story contra o checklist de 10 pontos do @po. Iterar (corrigir e revalidar) até todas as stories atingirem score >= 7/10.

## Inputs
- `outputs/{system_name}/planning/stories/**/*.story.md` (G20)
- Checklist @po (`.aiox-core/product/checklists/po-master-checklist.md`)

## 10-Point @po Checklist
1. Título claro e accionável
2. Context explica o porquê
3. Acceptance criteria presentes (3-5)
4. ACs são verificáveis/testáveis
5. Task list cobre todos os ACs
6. Dependências identificadas
7. Sem ambiguidade de scope
8. Dados/inputs especificados (sem invenção)
9. Edge cases e erros considerados
10. Estimativa razoável (story não é um epic disfarçado)

## Processo
1. Para cada story, percorrer os 10 pontos. Cada ponto vale 1.
2. Calcular `score = pontos_passados`. Decisão:
   - **score >= 7** → GO
   - **score < 7** → NO-GO, listar pontos falhados com fix específico.
3. Para cada NO-GO, devolver a story ao @aiox-sm/forge-planner com feedback accionável.
4. **LOOP:** corrigir → revalidar. Repetir até todas as stories serem GO.
5. **Gate G21 — BLOCK** enquanto existir qualquer story com score < 7.

## Output
`outputs/{system_name}/planning/story-validation-report.md`
```yaml
validation:
  total_stories: 18
  go: 18
  no_go: 0
  iterations: 2
  results:
    - story: "2.1"
      score: 9
      decision: GO
      failed_points: []
    - story: "2.3"
      score: 6
      decision: NO-GO
      failed_points: [4, 9]
      fixes_required:
        - "AC2 vago — quantificar 'rápido'"
        - "Faltam edge cases para payload vazio"
      resolved_in_iteration: 2
  all_go: true
```

## Critérios de Completude
- [ ] Todas as stories percorreram os 10 pontos
- [ ] Score calculado por story
- [ ] Stories NO-GO receberam fixes específicos
- [ ] Loop iterou até all_go = true
- [ ] Gate G21 verificado (nenhuma story < 7)
