# Task: Final Integration Test
# Agent: forge-builder (Forge)

## Objectivo
Executar smoke tests em todos os endpoints/fluxos críticos e verificar um deploy funcional em staging antes de entregar à fase de verificação.

## Inputs
- Código implementado (G27)
- CI/CD configurado (setup-ci-cd)
- Integrações wired (wire-integrations)

## Processo
1. Listar os fluxos/endpoints críticos (ex.: auth, scoring, billing).
2. Executar **smoke tests** end-to-end em cada um (mínimo 5 — alinhado a `smoke_tests_required: 5`).
3. Fazer deploy em **staging** e correr os smoke tests contra o ambiente real.
4. Verificar health check e logs em staging.
5. Registar resultados; qualquer smoke test FAIL devolve a story correspondente ao implement-stories.

## Output
`outputs/{system_name}/build/integration-test-report.md`:
```yaml
final_integration_test:
  smoke_tests:
    - flow: "auth — criar API key"
      env: staging
      result: PASS
    - flow: "scoring — POST /score"
      env: staging
      result: PASS
  total_smoke_tests: 6
  passing: 6
  staging_deploy: ok
  health_check_staging: ok
  all_pass: true
```

## Critérios de Completude
- [ ] Fluxos críticos listados
- [ ] >= 5 smoke tests executados
- [ ] Deploy em staging verificado
- [ ] Smoke tests correm contra staging
- [ ] Health check e logs em staging OK
- [ ] all_pass = true (ou stories FAIL devolvidas)
