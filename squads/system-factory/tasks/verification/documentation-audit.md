# Task: Documentation Audit
# Agent: forge-verifier (Sentinel)

## Objectivo
Auditar a documentação do sistema: README completo, API docs geradas, CHANGELOG actualizado e onboarding testado por execução real.

## Inputs
- `docs/` do projecto (generate-docs)
- `README.md`, `CHANGELOG.md`
- Código implementado

## Processo
1. **README:** verificar que cobre instalação, comandos, uso e que os comandos correspondem ao package.json real.
2. **API docs:** confirmar que todos os endpoints implementados estão documentados (sem endpoints fantasma nem em falta).
3. **CHANGELOG:** verificar que reflecte as mudanças desta entrega (versão, data, itens).
4. **Onboarding:** seguir o guia do zero (ambiente limpo) e confirmar que leva o sistema a correr — testar, não presumir.
5. Registar gaps de documentação como findings.

## Output
`outputs/{system_name}/verification/documentation-audit-report.md`:
```yaml
documentation_audit:
  readme_complete: true
  commands_match_package_json: true
  api_docs_coverage: "12/12 endpoints"
  changelog_updated: true
  onboarding_tested: true
  onboarding_result: "do zero até /health OK em 8 passos"
  findings: []
  verdict: PASS
```

## Critérios de Completude
- [ ] README completo e comandos alinhados ao package.json
- [ ] Todos os endpoints documentados (sem fantasma/em falta)
- [ ] CHANGELOG reflecte a entrega
- [ ] Onboarding testado por execução real do zero
- [ ] Gaps de documentação registados
