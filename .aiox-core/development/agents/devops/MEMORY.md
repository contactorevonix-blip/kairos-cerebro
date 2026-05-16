# DevOps Agent Memory (Gage) — KAIROS Elite

## Regra Absoluta #1 — NUNCA ESQUECER
GIT PUSH → EXCLUSIVAMENTE GAGE.
Nenhum outro agente faz push. Nunca. Sem excepção.
Se outro agente tentar → BLOQUEAR imediatamente e reportar a Pedro.

## Protocolo de Push (seguir sempre esta ordem)
1. Receber autorização explícita do agente principal
2. Verificar: `npm test` → 214/214 PASS
3. Verificar: JS Syntax Gate PASS (se landing-page.js foi alterado)
4. `git push origin main`
5. Railway auto-deploya em ~90 segundos
6. Confirmar smoke test verde

## Infraestrutura KAIROS
| Componente | Detalhe |
|-----------|---------|
| Servidor | Railway — serviço: `kairos-cerebro` (NÃO kairos-api) |
| URL produção | https://kairoscheck.net |
| CDN | Cloudflare (Full SSL, não Strict) |
| Bot Fight Mode | ON (curl pode receber 403 — é normal) |
| Backup | Cloudflare R2 via POST /api/admin/backup-now |
| Monitoring | smoke-test.yml — cada 10 minutos |

## GitHub Actions (8 workflows activos)
| Workflow | Schedule | Função |
|----------|---------|--------|
| test.yml | PR + push não-main | 214 testes |
| deploy.yml | Push main | Tests + smoke |
| smoke-test.yml | Cada 10 min | Health check 24/7 |
| nightly-audit.yml | 03:00 UTC | Health check produção |
| nightly-seed.yml | 04:00 UTC | Reputation graph |
| volume-backup.yml | 02:00 UTC | Backup R2 |
| onboarding-emails.yml | 09:00 UTC | Follow-up emails |
| fraud-trend-alerts.yml | Segunda 08:00 UTC | Alertas fraude |

## GitHub Secrets (configurados)
- KAIROS_ADMIN_TOKEN ✅
- RAILWAY_TOKEN ✅

## Cloudflare — Regras Críticas
- Purgar cache após mudanças a assets estáticos (favicon, badge, etc.)
- Path: dash.cloudflare.com → kairoscheck.net → Caching → Purge Cache
- SSL: Full (não Strict) — origin certificate pendente

## Emails KAIROS (Cloudflare Email Routing → ProtonMail)
- security@kairoscheck.net → kairoscheck@protonmail.com
- support@kairoscheck.net → kairoscheck@protonmail.com
- hello@kairoscheck.net → kairoscheck@protonmail.com

## Princípio de Elite
"Push para main = deploy imediato em produção.
Uma linha errada pode derrubar o servidor e perder receita.
Medir duas vezes, cortar uma. Sem excepções."

## Exclusive Authority
- ONLY agent authorized for `git push`, `gh pr create`, `gh pr merge`
- Pre-push quality gates are MANDATORY

## Promotion Candidates

## Archived
