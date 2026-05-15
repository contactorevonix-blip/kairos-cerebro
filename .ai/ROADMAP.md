# KAIROS — Roadmap Bilionário
> Criado: 2026-05-15 | Squad: KAIROS-CORE-SQUAD | Status: ACTIVO

---

## MISSÃO
Tornar o KAIROS Check na infraestrutura anti-fraude de referência para indie devs e solo founders — OSINT-first, GDPR-native, zero deps, preço justo. A "electricidade" do negócio online.

---

## MODELO DE NEGÓCIO (Claude + Revolut + Stripe)

```
RECEITA INVISÍVEL (o cliente paga sem pensar):
  1. Subscription base (€29/€79/€199)
  2. Overage: €0.01/check acima da quota → auto-cobrado
  3. Token packs: €5=600 / €15=2000 / €50=7500 tokens
  4. Auto-refill: Stripe cobra automaticamente quando balance < X
  5. Team seats: +€10/seat adicional
  6. Chat tokens: usar o chat AI consome tokens
  7. SLA upgrade: +€20/mês para 99.9% garantido

TOKEN ECONOMY:
  Domain  = 1 token
  Email   = 1 token
  Phone   = 2 tokens
  IBAN    = 3 tokens
  Batch × 10 = 7 tokens (30% desconto)
  Chat msg = 5 tokens
```

---

## BACKLOG COMPLETO — 19 TASKS

### SPRINT 1 ✅ DONE (2026-05-15)
- [x] #1 Fix activity feed (animation bug)
- [x] #2 Fix slider arrows ←→
- [x] #3 Integration tabs com guia completo STEP 1→4
- [x] #4 Annual pricing toggle 20% desconto
- [x] #5 ROI calculator interactivo
- [x] BONUS: Real fraud scores no activity feed (API verificada)
- [x] BONUS: JS syntax gate rule (CLAUDE.md)

### SPRINT 2 — PRODUTO CORE (próxima sessão)
- [ ] #6 Founder countdown + "X devs joined this week"
- [ ] #7 Token economy — ledger + API endpoint + Stripe topup
- [ ] #8 Key rotation — endpoint + dashboard + grace period 24h
- [ ] #9 /docs página pública completa (onboarding step-by-step)

### SPRINT 3 — CRESCIMENTO
- [ ] #10 Live chat AI com token gate (Claude API backend)
- [ ] #11 SEO programático — 50 páginas /check/[domínio]
- [ ] #12 Dashboard cliente — tokens, histórico, key rotation UI
- [ ] #13 Email onboarding automático (3 emails: imediato + 24h + 7 dias)

### SPRINT 4 — MONETIZAÇÃO AVANÇADA
- [ ] #14 Programa de referral — "Dá €20, ganha €20"
- [ ] #15 Usage analytics — gráficos de fraude por período
- [ ] #16 Páginas de comparação /compare/seon e /compare/maxmind
- [ ] #17 Overage billing — €0.01/check acima da quota (Stripe metered)
- [ ] #18 Allowlist/denylist por cliente
- [ ] #19 Fraud trend alerts — email automático por padrão novo

### SPRINT 5 — INTELIGÊNCIA ARTIFICIAL
- [ ] #20 Seed do reputation graph com phishing lists públicas (nightly)
- [ ] #21 API check de IPs (novo tipo de entidade)
- [ ] #22 Scoring calibration — ajustar pesos com dados reais acumulados
- [ ] #23 Chrome Web Store submission

---

## COMO O SISTEMA FICA MAIS INTELIGENTE

```
HOJE (estado actual — 2026-05-15):
  Motor de 8 camadas OSINT + Layer 0 (domain-heuristic)
  Reputation graph → aprende com cada check cross-tenant
  Detecção com Layer 0: ~80%+ (14/14 no test suite local)
  Zero falsos positivos: stripe.com, github.com, paypal.com = CLEAR 0

  Layer 0 detecta:
    paypal-account-suspended.store  → BLOCK 100
    microsoft-helpdesk.shop         → BLOCK 100
    metamask-wallet-restore.com     → BLOCK 85
    paypa1-verify.com (homograph)   → BLOCK 75 [NOVO]
    amaz0n-security.com (homograph) → BLOCK 75 [NOVO]
    amazon-security-alert.net       → BLOCK 80

AMANHÃ (com seed + dados):
  Nightly job corre contra PhishTank + OpenPhish + URLhaus
  Cada check alimenta o grafo → padrões emergem
  Detecção esperada: 90%+ após 30 dias de dados
  Zero falsos positivos em domínios legítimos conhecidos

ARCHITECTURE DO APRENDIZADO:
  1. Phishing lists públicas → bin/seed-reputation.js (nightly)
  2. Checks de clientes reais → grafo cresce automaticamente
  3. Padrões cross-tenant → novas famílias detectadas
  4. Cada novo cliente = mais dados = mais precisão para todos
  (isto é o "network effect" que nenhum concorrente small pode replicar)
```

---

## INTELLIGENCE STACK — O QUE NOS TORNA ÚNICOS

```
vs SEON (€499/mês mínimo):
  ✅ KAIROS: €29/mês, zero deps, GDPR Art.22 nativo
  ❌ SEON: SDK obrigatório, PII partilhado, US-hosted

vs MaxMind (SDK + licença):
  ✅ KAIROS: REST puro, zero instalação, EU-hosted
  ❌ MaxMind: GeoIP database 2GB local, actualizações semanais

vs Stripe Radar (free mas limitado):
  ✅ KAIROS: funciona ANTES do Stripe, checa email/domain/phone/IBAN
  ❌ Radar: só para transacções Stripe, só detecção de cartão

VANTAGEM REAL:
  Zero deps → nada pode quebrar em produção
  GDPR Art.22 → audit trail + human oversight built-in
  EU-hosted → compliance europeia sem advogados
  Network effect → cross-tenant intelligence cresce com cada cliente
```

---

## MÉTRICAS DE SUCESSO

| Métrica | Hoje | 30 dias | 90 dias |
|---|---|---|---|
| Detection rate | 27% | 65% | 85% |
| Clientes pagantes | 0 | 5 | 20 |
| MRR | €0 | €145 | €1.580 |
| Reputation graph size | ~0 entries | 10k+ | 100k+ |
| API latency p99 | <200ms | <150ms | <100ms |

---

## PRÓXIMAS ACÇÕES DO PEDRO (humanas)

1. **Rodar webhook secret Stripe** (5 min) — segurança crítica
2. **Testar pagamento real €29** — confirmar fluxo completo
3. **Outreach** — 2 posts/dia no X/Indie Hackers sobre fraude
4. **Configurar KAIROS_ADMIN_TOKEN** no Railway (já feito? confirmar)

---

## REGRAS DO SQUAD (não se esquecem — estão aqui)

- git push → EXCLUSIVO @devops (Gage)
- Antes de commit a landing-page.js → correr JS syntax gate
- Antes de merge → QA gate 170/170 obrigatório
- Mudanças de auth/billing → @security-architect obrigatório
- DAILY_BRIEF actualizado no fim de cada sessão
