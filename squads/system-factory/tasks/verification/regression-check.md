# Task: Regression Check
# Agent: forge-verifier (Sentinel)

## Objectivo
Correr a suite de testes completa para garantir que nada do que já existia foi quebrado pelas mudanças mais recentes (fixes do loop de verificação incluídos).

## Inputs
- Código após fixes do loop de verificação
- Suite de testes completa (unitários + integração)

## Processo
1. Correr a **full test suite** (não apenas os testes das stories novas).
2. Comparar com o baseline de testes anterior (todos os que passavam devem continuar a passar).
3. Para qualquer teste que passe a falhar → identificar a mudança que o quebrou e devolver ao owner.
4. Confirmar que os fixes do loop de verificação não introduziram regressões.
5. Registar contagens e diff face ao baseline.

## Output
`outputs/{system_name}/verification/regression-report.md`:
```yaml
regression_check:
  total_tests: 142
  passing: 142
  failing: 0
  newly_broken: []
  baseline_compared: true
  no_regressions: true
```

## Critérios de Completude
- [ ] Full test suite executada
- [ ] Comparação com baseline anterior
- [ ] Testes recém-quebrados identificados e devolvidos
- [ ] Fixes do loop não introduziram regressões
- [ ] no_regressions = true
