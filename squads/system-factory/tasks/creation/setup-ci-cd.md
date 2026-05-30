# Task: Setup CI/CD
# Agent: forge-builder (Forge) + delegate @aiox-devops

## Objectivo
Configurar pipelines de CI (testes/lint) e CD (deploy) via GitHub Actions, com environments de staging e production e secrets injectados pelo CI (nunca no repositório).

## Inputs
- Projecto scaffolded com package.json (G24)
- `outputs/{system_name}/architecture/architecture.md` (alvo de deploy: Railway/Vercel/etc.)
- Código + testes (G27)

## Processo
1. **CI workflow:** em cada PR/push correr install → lint → typecheck → testes. Falha bloqueia merge.
2. **CD workflow:** em merge para main → build → deploy para **staging**; deploy para **production** com aprovação manual ou tag.
3. Definir os dois **environments** (staging, production) com protecção em production.
4. Declarar secrets como referências do CI (`${{ secrets.X }}`) — nenhum secret hardcoded.
5. Adicionar status checks obrigatórios (testes verdes antes de merge).
6. @aiox-devops é o owner de push/deploy; esta task gera a configuração, a execução de push fica delegada.

## Output
`.github/workflows/`:
```yaml
ci_cd:
  workflows:
    - .github/workflows/ci.yml      # lint + test em PR
    - .github/workflows/deploy.yml  # CD staging + production
  environments: [staging, production]
  production_requires_approval: true
  secrets_referenced: ["DATABASE_URL", "STRIPE_KEY"]
  secrets_hardcoded: false
```

## Critérios de Completude
- [ ] CI corre lint + typecheck + testes em PR
- [ ] CD faz deploy para staging e production
- [ ] Environments staging e production definidos
- [ ] Production protegido (aprovação/tag)
- [ ] Secrets via CI, nenhum hardcoded
- [ ] Status checks obrigatórios configurados
