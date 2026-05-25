# Technical Debt — Executive Report
**Gerado por:** @analyst (Alex) — Brownfield Discovery Fase 9
**Data:** 2026-05-24
**Para:** Pedro Leal (solo founder, Kairos Check)
**Baseado em:** docs/prd/technical-debt-assessment.md

---

## A Situação em Uma Linha

O produto está tecnicamente sólido. Os 5 riscos críticos são configuração Railway, não código — todos resolvíveis esta semana em 6 horas.

---

## Estado Actual

| Métrica | Valor |
|---|---|
| Tenants activos | 0 (pré-revenue) |
| Verificações processadas | 0 (pré-launch) |
| Deploy em Railway | Activo |
| Volume Railway montado | **Desconhecido — verificar P0** |
| Dashboard protegido | **Desconhecido — verificar P0** |
| Backup activo | **Não** (script existe, não está configurado) |

---

## Riscos por Prioridade

### 🔴 P0 — Esta semana (6h, zero código)

**"Um deploy acidental pode apagar tudo antes do primeiro cliente pagar."**

| Risco | Cenário de falha | Probabilidade | Impacto |
|---|---|---|---|
| Volume Railway não montado | Pedro faz deploy → todos os dados apagados | Alta se nunca verificado | Perda total da base de dados |
| Dashboard sem autenticação | `NODE_ENV` ou `KAIROS_ADMIN_TOKEN` em falta no Railway | Média | Métricas e lista de tenants públicos |
| Sem backup R2 | Deploy com falha + sem volume = zero recuperação | Alta (sem backup activo) | Irrecuperável |

**O que isto significa na prática:**
- Se o primeiro cliente pagar hoje e Pedro fizer deploy amanhã sem volume montado → o cliente perde a API key → churn imediato + perda de confiança
- Se um competidor aceder ao `/dashboard` → vê tenants, métricas, actividade recente

**Custo de resolver:** 6 horas de configuração. Sem código. Sem deploy.
**Custo de não resolver:** Potencial perda do primeiro cliente pagante.

---

### 🟠 P1 — Este mês (16h, impacto directo no produto)

**"Pequenos problemas que os primeiros clientes vão notar."**

| Débito | Impacto para o cliente | Esforço |
|---|---|---|
| Counter hero com dados inventados | Dev que inspecciona a API vê `180 + days * 400` — desconfiança imediata | 4h |
| CSS duplicado (8+ ficheiros) | Cada bug visual requer 8 edições — velocidade de produto 8x mais lenta | 4h |
| Redis não activo | Reputation graph não funciona se houver >1 processo; limita escala | 4h (config Railway) |
| `verifications.jsonl` sem rotação | Com primeiros clientes activos, ficheiro cresce; primeiros sinais de degradação em semanas | 4h |

**Prioridade recomendada dentro do P1:**
1. Fix do counter (4h) — credibilidade imediata
2. Redis activo (4h) — só 2 env vars no Railway
3. CSS centralizado (4h) — velocidade de iteração
4. Rotação de logs (4h) — prevenção

---

### 🟡 P2 — Próximo mês (30–50h, fundações para crescimento)

| Débito | Quando se torna urgente |
|---|---|
| Sem testes unitários | Ao primeiro bug de regressão em produção com cliente real |
| Sem migrations de schema | Ao primeiro campo novo no modelo de dados |
| Mobile não verificado | Ao primeiro cliente que abre no telemóvel |
| Componentes UI partilhados | Quando houver 2ª iteração de design |

---

### 🟢 P3 — Backlog (50–100h, decisões de produto)

| Débito | Threshold para decidir |
|---|---|
| Migração para PostgreSQL | > 10.000 verificações/dia ou necessidade de queries complexas |
| Migração para Astro/Next.js | Depois de produto validado com receita recorrente |
| Testes de UI (Playwright) | Quando houver pipeline CI/CD formal |

---

## Roadmap de Execução

```
SEMANA 1 (6h) — Sem código
├── Verificar volume Railway             [30 min]
├── Verificar NODE_ENV + ADMIN_TOKEN     [10 min]
├── Criar bucket R2 + 4 env vars         [2h]
├── Testar backup: node bin/backup-volume.js  [30 min]
└── Agendar backup automático            [1h]

MÊS 1 (16h) — Código simples
├── Fix counter: ligar a dados reais ou remover  [4h]
├── Activar Redis: 2 env vars Railway     [4h]
├── styles.js: CSS + tokens centralizados [4h]
└── Rotação verifications.jsonl           [4h]

MÊS 2 (30–50h) — Fundações
├── Testes unitários: sniper-engine primeiro  [20h]
├── Mobile: testar 375px + 768px          [4h]
├── Componentes UI partilhados            [8h]
└── .env.example completo                 [2h]

BACKLOG — Quando houver produto validado
├── PostgreSQL (40–80h)
└── Framework frontend (80–200h)
```

---

## O Que Está Sólido (não tocar)

O produto tem fundações excepcionais para a fase em que está:

- **Segurança:** PII pseudonymizado, API keys nunca em plaintext, audit chain SHA-256, Bearer token (não ?token=)
- **GDPR by design:** Base legal documentada, pseudonymização nativa, direito ao apagamento
- **Zero dependências em produção:** Nenhum npm package em produção — sem supply chain risk, deploy simples
- **Backup sofisticado:** `bin/backup-volume.js` tem SHA-256, S3 SigV4 implementado do zero — só precisa de activação
- **Architecture adapter pattern:** Redis substitui JSON sem mudar código; PostgreSQL futuro planeado
- **Proof bar condicional:** Só mostra dados quando reais — princípio correcto que o counter deve seguir

---

## Resumo Executivo para o Founder

**O produto está pronto para os primeiros clientes — com uma condição:**

Antes de qualquer acção de aquisição (Product Hunt, HN, email para a lista), verificar os 3 itens P0 no Railway dashboard. São 6 horas. Se o volume não estiver montado e Pedro fizer deploy durante onboarding de um cliente, perde tudo.

Depois disso: o único débito que afecta directamente a percepção dos primeiros clientes é o counter falso. Um dev que inspecione `/api/stats/counter` e veja `180 + days * 400` fica desconfiante. Fix em 4 horas.

**O resto pode esperar até ter clientes pagantes.**

| Quando | O quê | Porquê agora |
|---|---|---|
| Esta semana | P0 (6h config) | Dados em risco hoje |
| Antes de lançar | Fix counter (4h) | Credibilidade com público técnico |
| Depois do 1º cliente | P1 restante (12h) | Estabilidade com carga real |
| Depois de MRR > €500 | P2 (30–50h) | Fundações para escalar |
| Depois de validação | P3 (50–100h) | Só se o negócio o justificar |

---

## Sinais de Mercado (dados reais — `leads_pending.json`)

| Sinal | Relevância para o débito |
|---|---|
| SEON duplicou preços em 5 semanas — clientes furiosos | Janela de oportunidade: produto estável + preço previsível é diferenciador |
| "Enterprise pricing excludes small European startups" (Reddit r/SaaS, score 90) | Público-alvo confirmado — eles aparecem ao produto |
| Mercado GDPR fraud detection a crescer 19.61%/ano (HN) | Urgência de ter produto production-ready antes da janela fechar |

**Implicação:** Os primeiros clientes podem aparecer nas próximas semanas via estes canais. O produto precisa de estar production-safe primeiro.

---

*Fase 9 completa. Próximo: @pm (Morgan) — Fase 10 (Epic + Stories prontas para desenvolvimento)*
