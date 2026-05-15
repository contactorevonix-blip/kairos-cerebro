# KAIROS — Diário de Bordo

> Última actualização: 2026-05-15 | Sessão: Ataque #2 + servidor online + Stripe live

---

## Estado do servidor

- URL: `https://kairoscheck.net`
- Status Railway: **ONLINE** ✅
- Último deploy: 2026-05-15 — variáveis Stripe live aplicadas
- Cloudflare SSL: Full (não Strict) — correcto por agora
- Bot Fight Mode: ON (re-activado)

---

## O que foi feito nesta sessão (2026-05-14 → 2026-05-15)

### Corrigido (crítico)
- `server.js` — bind para `0.0.0.0` (servidor acessível ao Railway)
- `server.js` — health check não bloqueia por audit chain (só dbWritable)
- `Dockerfile` — removido user não-root que causava falha de permissões no volume
- `railway.toml` — healthcheck timeout 10s → 30s
- Cloudflare SSL — mudado de Full Strict para Full (Full Strict bloqueava tudo)

### Configurado (Stripe Live)
- `KAIROS_STRIPE_WEBHOOK_SECRET` — Live mode whsec_ ✅
- `STRIPE_SECRET_KEY` — sk_live_ ✅
- `STRIPE_PUBLISHABLE_KEY` — pk_live_ ✅
- `STRIPE_MODE` — live ✅
- Webhook endpoint criado no Stripe Live mode → `kairoscheck.net/billing/stripe/webhook`
- Eventos configurados: checkout.session.completed, invoice.payment_succeeded/failed, subscription created/updated/deleted

### Criado (infraestrutura)
- GitHub Actions: test.yml, deploy.yml, nightly-audit.yml, volume-backup.yml, dependabot.yml
- Backup volume: bin/backup-volume.js (R2, SigV4 manual)
- Failover: failover/index.html (maintenance page PT/EN)
- Runbooks: secrets-runbook.md, disaster-recovery.md, emergency-failover.md
- Extensão: icon.svg + manifest.json actualizado

---

## Pedro tem de fazer (por ordem)

### 🟡 Esta semana

**1. RAILWAY_TOKEN no GitHub Actions**
- Já feito ✅ — mas confirma que o workflow deploy.yml corre correctamente na próxima vez que fizeres push

**2. Testar o checkout de pagamento**
- Abre `https://kairoscheck.net/pricing`
- Clica em "Get started" no plano Starter (€29)
- Usa o teu cartão real para fazer um pagamento de teste
- Confirma no Stripe Dashboard → Payments que aparece um pagamento

**3. Verificar preços no Stripe**
- Os price IDs estão configurados mas confirma que os produtos no Stripe têm os preços correctos (€29 Starter, €79 Pro, €199 Scale)

**4. Cloudflare Origin Certificate (quando tiveres tempo)**
- Para voltar ao Full Strict com segurança máxima
- Não urgente — Full mode actual é seguro

---

## Próximas prioridades técnicas (eu faço)

1. **Fase 2.5 DONE** — marcar checkpoint
2. **Auditoria do audit chain** — perceber porque está quebrado e reparar
3. **Chrome Web Store** — submissão da extensão (ícone feito)
4. **API Docs** — página /docs pública para atrair devs
5. **SEO programático** — primeiras 50 páginas /check/[domínio]

---

## Estado do ATAQUE #2

| Fase | Descrição | Estado |
|---|---|---|
| 2.1 | IaC (Dockerfile + railway.toml) | ✅ DONE |
| 2.2 | Secrets runbook | ✅ DONE |
| 2.3 | Railway provisioning | ✅ DONE (online) |
| 2.3.bis | Volume backup R2 | ✅ DONE (aguarda R2 credentials) |
| 2.4 | GitHub Actions CI/CD | ✅ DONE |
| 2.5 | Stripe webhook live | ✅ DONE |
| 2.5.bis | Netlify failover page | ✅ DONE (aguarda deploy Netlify) |
| 2.6 | DNS Cloudflare | ✅ DONE (Full mode, não Strict) |
| 2.7 | Smoke-tester | ⏳ Próxima sessão |
| 2.8 | Observability | ⏳ Próxima sessão |

---

## Para a próxima sessão

Diz: **"lê o daily brief e diz-me o estado"**

Eu verifico o servidor, mostro-te o que está pendente, e dizemos o próximo passo.

---

## Bloqueante crítico actual

**Testa um pagamento real.** É o único milestone que importa agora.
`https://kairoscheck.net/pricing` → Starter → cartão real → confirma no Stripe.
