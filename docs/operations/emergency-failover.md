# Emergency Failover Runbook — Kairos Check

**Princípio cardinal:** O failover é uma **DECISÃO CONSCIENTE**, nunca automática.
Activação exige o Founder ou Gage no Cloudflare dashboard. Nenhum script activa isto sozinho.

**Failover site:** `<failover>.netlify.app` (ver `.ai/checkpoints/ataque-2-fase-2-5-bis.done`)
**Target de activação:** < 2 minutos desde decisão até tráfego em manutenção.

---

## 1. Quando activar

**Activar se:**
- Railway service down > 10 minutos e causa não é clara
- Corrupção maior de dados que exige restore offline (combinado com `docs/operations/disaster-recovery.md`)
- Incidente de segurança confirmado — breach que exige tirar tráfego offline imediatamente

**Não activar para:**
- Deploys planeados (usar rolling deploy — Railway faz isso automaticamente)
- Degradação de latência < 30s que está a auto-resolver
- Manutenção de rotina (se < 5 min, não vale a pena o switch)

---

## 2. Procedimento de activação (target: < 2 min)

**Pré-requisito:** confirmar que Railway está realmente down antes de activar.

```bash
# Confirmar que o problema é real (directo ao Railway domain, sem Cloudflare)
curl -fsSL https://<service>.up.railway.app/health
# Se isto retornar OPERATIONAL → o problema é no Cloudflare/DNS, não no Railway
# Se isto der timeout/500 → Railway está down → activar failover
```

**Passos:**

1. Cloudflare Dashboard → `kairoscheck.net` → **DNS**
2. Editar o record CNAME `@`:
   - **DE:** `<service>.up.railway.app` (Proxy **ON** — nuvem laranja)
   - **PARA:** `<failover>.netlify.app` (Proxy **OFF** — DNS only)
   - Motivo: Netlify SSL não suporta Cloudflare orange-cloud sem origin cert
3. Guardar. Propagação < 60s (Cloudflare edge).
4. Verificar:
   ```bash
   curl -fsSL https://kairoscheck.net | grep -i "maintenance"
   # Deve retornar o HTML da maintenance page
   ```
5. Documentar hora de activação + causa em `.ai/runs/incident-<data>.md`

---

## 3. Procedimento de desactivação (recovery)

**Antes de desactivar:** confirmar que o Railway está operacional.

```bash
# Confirmar Railway via domínio directo (bypass Cloudflare)
curl -fsSL https://<service>.up.railway.app/health | jq '.status'
# Deve retornar "OPERATIONAL"
```

**Passos:**

1. Cloudflare Dashboard → `kairoscheck.net` → **DNS**
2. Editar o record CNAME `@`:
   - **PARA:** `<service>.up.railway.app`
   - Re-activar **Proxy ON** (nuvem laranja)
3. Guardar.
4. Smoke test:
   ```bash
   curl -fsSL https://kairoscheck.net/health | jq '.status'
   # Deve retornar "OPERATIONAL"
   ```
5. Actualizar `.ai/runs/incident-<data>.md` com hora de recovery + duração total.

---

## 4. Procedimento de dry-run (sem failover real)

Executar esta simulação antes de precisar do failover a sério.

```bash
# Passo 1: Criar record DNS temporário de teste
# Cloudflare → DNS → Add record:
# Type: CNAME
# Name: maintenance-test
# Target: <failover>.netlify.app
# Proxy: OFF (DNS only)
# TTL: Auto

# Passo 2: Verificar que a maintenance page funciona
curl -fsSL https://maintenance-test.kairoscheck.net | grep -i "maintenance"
# Deve retornar o HTML da maintenance page

# Passo 3: Apagar o record temporário
# Cloudflare → DNS → apagar o record maintenance-test

# Passo 4: Documentar
# Criar .ai/runs/failover-drill-<data>.md com resultado
```

**Quando fazer o dry-run:**
- Após Fase 2.6 (DNS configurado) — imediatamente, antes de ir para produção
- Trimestralmente, como parte do calendário de operações

---

## 5. URLs críticos (preencher após setup)

| Item | URL / Valor |
|---|---|
| Failover Netlify | `<failover>.netlify.app` (ver checkpoint Fase 2.5.bis) |
| Railway direct (sem CF) | `<service>.up.railway.app` (ver checkpoint Fase 2.3) |
| Cloudflare Dashboard | `dash.cloudflare.com` |
| Railway Dashboard | `railway.app/dashboard` |

---

## 6. O que acontece durante o failover

| Sistema | Estado durante failover |
|---|---|
| Tráfego web | Redirected para maintenance page Netlify |
| Stripe webhooks | **Buffered pelo Stripe** — Stripe re-tenta por 72h; quando Railway voltar, os eventos chegam |
| API calls de clientes | Falham com connection error (não 503) — clientes devem ter retry na sua implementação |
| Dados em Railway volume | Intactos — volume persiste independente do service estar paused/down |
| Audit trail | Intacto — escrito antes do downtime |
| Reputação graph | Intacta — JSON no volume |
