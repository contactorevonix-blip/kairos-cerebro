# Task: Deploy Production
# Agent: forge-verifier (Sentinel) + delegate @aiox-devops
# Pré-condição: Human checkpoint aprovado (generate-verdict)

## Objectivo
Após aprovação humana, fazer o deploy do sistema para produção, validar health check e correr smoke tests no ambiente de produção.

## Inputs
- `outputs/{system_name}/elite-verdict.md` (human_checkpoint.decision == approved)
- CI/CD configurado (setup-ci-cd)
- Sistema validado em staging

## Processo
1. Confirmar que o human checkpoint foi **aprovado**. Sem aprovação → ABORT.
2. @aiox-devops (owner exclusivo de deploy/push) executa o deploy para produção via pipeline CD.
3. Verificar **health check** em produção (`/health`, `/ready`).
4. Correr **smoke tests** contra produção (os mesmos fluxos críticos da fase de criação).
5. Monitorizar erros/latência nos primeiros minutos. Plano de rollback pronto se algo falhar.
6. Registar URL de produção e confirmação de deploy.

## Output
Confirmação de deployment + URL:
```yaml
deploy_production:
  approved_by_human: true
  deployed_by: "@aiox-devops"
  production_url: "https://api.{system_name}.net"
  health_check: ok
  smoke_tests_prod:
    total: 6
    passing: 6
  rollback_ready: true
  deployed_at: "2026-05-30T18:00:00Z"
```

## Critérios de Completude
- [ ] Human checkpoint confirmado como aprovado
- [ ] Deploy executado por @aiox-devops
- [ ] Health check em produção OK
- [ ] Smoke tests em produção a passar
- [ ] Monitorização inicial + rollback pronto
- [ ] URL de produção registada
