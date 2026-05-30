# Task: QA Gate
# Agent: forge-verifier (Sentinel) + delegate @aiox-qa
# Gate: G29 (BLOCKING)

## Objectivo
Aplicar os 7 quality checks standard do @aiox-qa ao sistema construído e emitir um veredicto. FAIL devolve as stories específicas ao forge-builder com feedback accionável.

## Inputs
- Código + testes (G27)
- `outputs/{system_name}/creation/build-report.md` (G28)
- Stories implementadas

## Os 7 Quality Checks
1. **Requirements traceability** — cada AC tem teste correspondente.
2. **Test coverage** — testes cobrem caminhos críticos e edge cases.
3. **Code quality** — lint/typecheck limpos, sem code smells graves.
4. **Error handling** — erros tratados, sem crashes silenciosos.
5. **Security basics** — sem secrets, input validado.
6. **Performance** — sem regressões óbvias (N+1, loops caros).
7. **Documentation** — código e API documentados o suficiente.

## Processo
1. Executar os 7 checks com evidência real (correr testes, lint, typecheck).
2. Para cada check atribuir status e evidência.
3. Veredicto global:
   - **PASS** — todos os checks OK.
   - **CONCERNS** — checks OK mas com observações (dívida documentada).
   - **FAIL** — algum check crítico falha.
   - **WAIVED** — falha aceite explicitamente com justificação (human).
4. **Gate G29 — BLOCK** em FAIL → devolver as stories específicas ao forge-builder com feedback (qual check, qual story, qual ficheiro).

## Output
`outputs/{system_name}/verification/qa-report.md`:
```yaml
qa_gate:
  checks:
    - name: requirements_traceability
      status: PASS
      evidence: "62/62 ACs com teste"
    - name: test_coverage
      status: CONCERNS
      evidence: "84% — abaixo de 90% em scoring.js"
    - name: error_handling
      status: PASS
  verdict: CONCERNS
  failed_stories: []
  returned_to_builder: false
```

## Critérios de Completude
- [ ] Os 7 checks executados com evidência real
- [ ] Cada check com status + evidência
- [ ] Veredicto emitido (PASS/CONCERNS/FAIL/WAIVED)
- [ ] FAIL devolve stories específicas com feedback
- [ ] Gate G29 verificado
