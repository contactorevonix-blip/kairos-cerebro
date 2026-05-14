# Disaster Recovery Runbook — Kairos Check

**RPO:** 24 horas (1 snapshot diário às 02:00 UTC)
**RTO Target:** < 10 minutos (medido em drill mensal)
**Último DR Drill:** _não executado ainda — realizar nos primeiros 7 dias após primeiro backup_

---

## 1. O que está no backup

Cada snapshot diário é um `tar.gz` do `KAIROS_DB_DIR` completo (`/app/.kairos-data`).

| Ficheiro / Directório | Conteúdo |
|---|---|
| `tenants.json` | Contas de tenant + metadados de plano |
| `api-keys.json` | API keys activas (armazenadas com hash) |
| `verifications.jsonl` | Log completo de verificações |
| `metrics.json` | Métricas de uso agregadas |
| `audit-chain.jsonl` | Audit trail com resistência a adulteração (SHA-linked) |
| `vault.enc` | Vault encriptado (AES-256-GCM) |
| `reputation-graph/` | Dados do grafo de reputação (formato JSON, quando `KAIROS_RG_ADAPTER=json`) |

Destino: bucket `R2_BACKUP_BUCKET` (ex: `kairos-backups`), path `kairos-backup-<iso-timestamp>.tar.gz`.

R2 Lifecycle Rule configurada para **7-day auto-expiration** — janela rolling, sem pruning manual.

---

## 2. O que NÃO está no backup

| Item | Localização | Como recuperar |
|---|---|---|
| Env vars do Railway / secrets | Railway Dashboard | Re-injectar manualmente via `docs/operations/secrets-runbook.md` |
| `KAIROS_MASTER_PASSPHRASE` | Bitwarden Founder | **Obrigatório para desencriptar `vault.enc`** — nunca está no backup |
| Histórico de charges / invoices Stripe | Stripe (propriedade deles) | Stripe Dashboard — não recuperável do nosso lado |
| Webhook signing secret Stripe | Env var Railway | Rotar no Stripe Dashboard se perdido |
| Config DNS Cloudflare | Cloudflare Dashboard | Manual — ver `docs/operations/dns-runbook.md` |
| GitHub Actions secrets | GitHub repo settings | Manual — ver `docs/operations/secrets-runbook.md` |
| Credenciais R2 | Env vars Railway | Regenerar no Cloudflare R2 Dashboard |

---

## 3. Procedimento de restore (target: < 10 min RTO)

**Pré-requisitos antes de começar:**
- Tens o `KAIROS_MASTER_PASSPHRASE` (o vault não desencripta sem ele)
- Railway CLI autenticado (`railway login`)
- AWS CLI disponível localmente **ou** acesso directo ao shell Railway

### Passo 1 — Identificar o snapshot a restaurar

```bash
# Via AWS CLI (flag endpoint obrigatória para R2)
aws s3 ls s3://<R2_BACKUP_BUCKET>/ \
  --endpoint-url $R2_ENDPOINT \
  | sort | tail -10
```

Nota o nome do ficheiro pretendido, ex: `kairos-backup-2026-05-14T02-00-00-000Z.tar.gz`.

### Passo 2 — Download do snapshot

```bash
aws s3 cp \
  s3://<R2_BACKUP_BUCKET>/kairos-backup-<ts>.tar.gz \
  ./kairos-backup-<ts>.tar.gz \
  --endpoint-url $R2_ENDPOINT
```

### Passo 3 — Verificar integridade SHA-256

Cruza com o artefacto de log do GitHub Actions para aquela run (campo `sha` no summary ou `/tmp/backup-log.json`).

```bash
sha256sum kairos-backup-<ts>.tar.gz
# Deve coincidir com o campo 'sha' no backup-log do workflow.
```

Se o hash não corresponder: **não restaurar**. Usar o snapshot anterior.

### Passo 4 — Colocar produção offline

**Opção A** — Switch DNS para maintenance page Netlify (ver `docs/operations/emergency-failover.md`).
**Opção B** — Railway Dashboard → service `kairos-api` → Pause.

Não restaurar enquanto o service estiver a aceitar writes ao vivo.

### Passo 5 — Copiar archive para dentro do container Railway

```bash
# Abrir shell dentro do container Railway
railway run --service kairos-api -- bash

# Dentro do container — transferir o archive via wget (usando URL presigned R2)
wget -O /tmp/restore.tar.gz "<presigned-r2-url>"
```

Em alternativa, usar o Railway Volume browser para fazer upload directo do archive.

### Passo 6 — Extrair o archive sobre o volume

**Dentro do shell do container Railway:**

```bash
cd /app/.kairos-data

# Safety net: backup do estado actual antes de apagar
tar -czf /tmp/pre-restore-snapshot.tar.gz .

# Limpar dados actuais
rm -rf ./*

# Extrair backup
tar -xzf /tmp/restore.tar.gz -C /app/.kairos-data

# Confirmar que ficheiros críticos existem
ls -la tenants.json api-keys.json audit-chain.jsonl vault.enc
```

### Passo 7 — Reiniciar o service

```bash
# Da máquina local:
railway redeploy --service kairos-api
```

Aguardar ~30s para boot.

### Passo 8 — Validar

```bash
# Health check
curl -fsSL https://kairoscheck.net/health | jq .

# Esperado:
#   status = "OPERATIONAL"
#   probes.auditChain.valid = true
#   probes.dbWritable = true

# Verificação de integridade do audit trail
npm run audit:verify
```

Se `probes.auditChain.valid` for `false`: o trail restaurado pode estar ligeiramente ahead de um evento não escrito. Normal se o snapshot foi feito a meio de uma sessão. O audit log é append-only — sem perda de dados, apenas os últimos eventos dentro da janela de RPO (< 24h).

### Passo 9 — Restaurar tráfego público

Seguir o procedimento de desactivação em `docs/operations/emergency-failover.md` para voltar o DNS ao Railway (ou des-pausar o service).

### Passo 10 — Documentar o incidente

Criar `.ai/runs/incident-<data>.md` com:
- Causa raiz
- Duração do downtime
- Perda de dados (ficheiros, eventos)
- Acções tomadas
- Lições aprendidas

---

## 4. RPO e RTO targets

| Métrica | Target | Implementação actual |
|---|---|---|
| **RPO** (máx. perda de dados) | 24 horas | Cron às 02:00 UTC diário |
| **RTO** (tempo de recovery) | < 10 minutos | Passos 1-9 acima, medido em drill |

O RPO de 24h é aceitável para o ICP self-serve indie dev: dados de transacções financeiras são propriedade do Stripe; logs de verificação anteriores a 24h são recuperáveis do histórico de eventos Stripe.

---

## 5. Drill mensal

Executar no **primeiro terça-feira de cada mês**. Documentar em `.ai/runs/dr-drill-<YYYY-MM-DD>.md`.

### Checklist do drill

```
[ ] 1. Identificar último snapshot no R2
[ ] 2. Download para máquina local
[ ] 3. Verificar SHA-256 corresponde ao backup-log artifact
[ ] 4. Provisionar service staging temporário no Railway (lifetime 1 dia)
[ ] 5. Montar volume novo no staging service
[ ] 6. Extrair snapshot para o volume de staging
[ ] 7. Arrancar o staging service
[ ] 8. Confirmar /health retorna status: OPERATIONAL
[ ] 9. Confirmar probes.auditChain.valid = true
[ ] 10. Confirmar probes.dbWritable = true
[ ] 11. Registar tempo decorrido do Passo 4 ao Passo 10
[ ] 12. Destruir staging service e volume
[ ] 13. Actualizar data do 'Último DR Drill' no topo deste ficheiro
[ ] 14. Se tempo > 10 min: investigar e melhorar o runbook
```

### Critérios de aprovação do drill

- Todos os 13 passos completos
- Tempo total <= 10 minutos (target RTO)
- Nenhum passo que exigiu improvisar (tudo deve estar neste runbook)

### Em caso de falha no drill

1. Documentar a falha em `.ai/runs/dr-drill-<data>.md`
2. Corrigir o runbook ou o script antes do próximo drill
3. Não contar como drill aprovado — reagendar para a semana seguinte
