# Task: Infrastructure Design
# Agent: forge-architect (Atlas)
# Gate: (architecture task)

## Objectivo
Definir a infraestrutura do sistema: ambientes (dev/staging/prod), estratégia de deployment, escalabilidade e backup/recovery.

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/complexity.yaml` (G03)

## Processo

### Passo 1 — Ambientes
Definir dev / staging / prod: paridade entre eles, dados (seed vs anonimizado), variáveis de ambiente por ambiente.

### Passo 2 — Deployment strategy
Como o código chega a prod: CI/CD, build, migrations, rollback. Estratégia (rolling, blue-green, etc.) adequada à complexidade.

### Passo 3 — Scaling
Vertical vs horizontal. Onde está o gargalo (DB, workers). Auto-scaling se o PaaS suportar.

### Passo 4 — Backup & recovery
Frequência de backups da DB, retenção, teste de restauro, RPO/RTO alvo.

### Passo 5 — Observabilidade base
Logs, métricas e alertas mínimos para prod.

## Output
`outputs/{system_name}/architecture/infrastructure.md`
```markdown
# Infrastructure — {system_name}

## Environments
- dev: local + Docker; staging: Railway preview; prod: Railway.
- Paridade: mesmo Dockerfile; secrets por ambiente.

## Deployment
- CI/CD: push → build → migrate → deploy (rolling).
- Rollback: redeploy da imagem anterior.

## Scaling
- Horizontal nos workers de enrichment; DB vertical até réplica de leitura.

## Backup & Recovery
- DB: backup diário, retenção 30d, restauro testado mensalmente.
- RPO: 24h | RTO: 1h.

## Observability
- Logs estruturados, métricas de latência, alerta em error-rate > 1%.
```

## Critérios de Completude
- [ ] dev/staging/prod definidos com paridade e secrets
- [ ] Estratégia de deployment e rollback definida
- [ ] Estratégia de scaling adequada à complexidade
- [ ] Backup/recovery com RPO/RTO
- [ ] Observabilidade mínima definida
