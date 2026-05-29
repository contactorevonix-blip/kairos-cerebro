# Technical Debt Assessment — FINAL
**Gerado por:** @architect (Aria) — Brownfield Discovery Fase 8
**Data:** 2026-05-24
**Versão:** 1.0 — Documento Final
**Incorpora:** Fases 1-7 (system-architecture · db-audit · frontend-spec · DRAFT · db-specialist-review · ux-specialist-review · qa-review)

---

## Resumo Executivo

| Área | Críticos | Altos | Médios | Baixos | Total |
|---|---|---|---|---|---|
| Sistema / Arquitectura | 2 | 5 | 4 | 0 | 11 |
| Base de Dados | 3 | 5 | 3 | 0 | 11 |
| Frontend / UX | 0 | 5 | 4 | 3 | 12 |
| **TOTAL** | **5** | **15** | **11** | **3** | **34** |

**Esforço total estimado:** 72–112 horas

**P0 esta semana:** 6 horas de configuração — sem mudança de código — elimina 3 riscos críticos.

> Os 5 itens críticos são todos **configuração operacional**, não falhas de código. O código está bem escrito.

---

## Acções P0 — Esta Semana (6h, sem código)

> Estas acções não requerem deploy. São verificações e configurações no Railway dashboard.

| Acção | Onde | Tempo | Risco se ignorado |
|---|---|---|---|
| Verificar volume Railway montado em `/app/.kairos-data` | Railway Dashboard → Service → Volumes | 30 min | Todos os dados perdem-se em cada deploy |
| Confirmar `NODE_ENV=production` definido | Railway → Variables | 5 min | Dashboard abre sem autenticação em modo dev |
| Confirmar `KAIROS_ADMIN_TOKEN` definido | Railway → Variables | 5 min | Dashboard sem protecção se NODE_ENV errado |
| Configurar backup R2 (4 env vars) | Railway → Variables + Cloudflare R2 | 2h | Sem redundância dos dados |
| Testar: `curl -I https://kairoscheck.net/dashboard` | Terminal | 5 min | Confirma 401 em produção |
| Agendar `node bin/backup-volume.js` | Railway → Cron ou startup script | 30 min | Script existe mas nunca corre |

---

## 1. Débitos de Sistema / Arquitectura

### CRÍTICOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| DT-002 | Sem testes unitários na maioria dos packages | Regressões silenciosas em produção | Nenhum package tem suite de testes |
| DT-003 | `docs/` inexistente — sem documentação | AIOX não funciona, onboarding impossível | **Resolvido parcialmente por este workflow** |

### ALTOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| DT-001 | Base de dados JSON on-disk | Não escala acima de ~1M registos; sem transactions | Intencional como MVP — threshold documentado no código |
| DT-004 | Sem PostgreSQL — queries impossíveis | Sem relatórios, analytics, debugging por data/score | Migração: 40–80h quando atingir volume |
| DT-005 | `packages/web` não desenvolvido | Confusão arquitectural — directório vazio com `node_modules` | **Remover** (ver UX-003) |
| DT-006 | `.aiox/` inexistente | Handoffs e memória do sistema ausentes | **Resolvido parcialmente por este workflow** |
| DT-007 | `.env.example` incompleto | Onboarding novo dev = horas de debugging | Actualizar após P0 configurado |

### MÉDIOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| DT-008 | `sniper-db` sem índices — O(n) em todas as leituras | Degradação com volume | Aceitável até ~50K registos |
| DT-009 | Event bus JSONL sem rotação de logs | Ficheiro cresce indefinidamente | Arquivar entradas > 90 dias |
| DT-010 | `outreach-mailer.js` em `lib/` em vez de package | Acoplamento incorrecto | Baixo risco operacional |
| DT-011 | Múltiplos scripts em `bin/` sem orquestração clara | Confusão sobre o que correr e quando | Documentar em `.env.example` e README |

---

## 2. Débitos de Base de Dados

### CRÍTICOS (configuração operacional — não código)

| ID | Débito | Impacto | Acção |
|---|---|---|---|
| DB-003 | Volume Railway pode não estar montado em `/app/.kairos-data` | Todos os dados apagados em cada deploy | Verificar Railway → Volumes (30 min) |
| DB-011 | `KAIROS_ADMIN_TOKEN` / `NODE_ENV` não verificados no Railway | Dashboard acessível sem auth em ambiente não-production | Verificar Railway → Variables (10 min) |
| DB-013 | R2 backup configurado no código mas 4 env vars em falta | Zero redundância — dados só existem no volume Railway | Criar bucket R2 + definir vars (2h) |

> **Nota @data-engineer:** O código está correcto. `Dockerfile` cria `/app/.kairos-data` como mount point explícito. `bin/backup-volume.js` existe com implementação sofisticada (SHA-256, S3 SigV4, zero deps). O risco é operacional puro.

### ALTOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| DB-001 | JSON on-disk sem locking multi-processo | Corrupção de ficheiros com 2+ processos simultâneos | 1 réplica activa → risco imediato baixo. Activar Redis (DB-007) resolve este |
| DB-002 | `verifications.jsonl` sem rotação | Cresce para GB em produção com volume | Arquivar entradas > 90 dias |
| DB-004 | Sem sistema de migrations | Schema implícito — registos antigos ficam incompletos | Necessário antes de qualquer schema change |
| DB-007 | Redis adapter não activo em produção | Reputation graph só funciona single-process | 2 env vars no Railway: `KAIROS_RG_ADAPTER=redis` + `KAIROS_REDIS_URL` |
| DB-012 | R2 backup existe mas não está configurado | Script nunca corre em produção | Parte do P0 — ver DB-013 |

### MÉDIOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| DB-005 | `api_keys.json` lido inteiro em cada request | O(n) — lento com muitos tenants | Aceitável até ~1K tenants |
| DB-006 | Sem índices em nenhuma "tabela" | Lookup = scan completo | Só relevante acima de ~10K registos |
| DB-008 | Token ledger sem visão agregada | Impossível auditar economia de tokens global | Criar endpoint `/api/admin/tokens/summary` |
| DB-009 | `referrals.jsonl` sem schema formal | Inconsistência de campos garantida | Schema JSONL simples resolve |
| DB-010 | Backup existe mas não agendado | Script manual — nunca corre sem trigger | Parte do P0 |

---

## 3. Débitos de Frontend / UX

### ALTOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| UX-001 | HTML em template literals JS | Impossível manter, testar, reutilizar | Técnica válida para SSR simples — migração para framework é P3 |
| UX-002 | CSS duplicado em cada ficheiro | Mudança de design = editar 8+ ficheiros | **Fix: `styles.js` partilhado — 4h, máximo impacto** |
| UX-004 | Sem componentes reutilizáveis | Header, footer, botões duplicados | Depende de UX-002 resolvido primeiro |
| UX-008 | Design tokens não centralizados | Definidos em `trust-pages.js`, não partilhados | Resolver junto com UX-002 — mesma tarefa |
| UX-012 | Counter hero usa dados calculados (`180 + days * 400`) | Credibilidade do produto com público técnico | `/api/stats/counter` também retorna fake — não só UI |

### MÉDIOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| UX-005 | Sem testes de UI | Regressões visuais invisíveis | Playwright é a escolha natural |
| UX-006 | Dashboard — verificar `NODE_ENV` e `KAIROS_ADMIN_TOKEN` no Railway | Se não configurado, auth não activa | Código robusto (fail-closed em produção) — verificação de config |
| UX-007 | Sem estados de loading/error no frontend | UX degradada durante API calls | Spinner + mensagem de erro básica |
| UX-010 | Mobile não verificado | Responsividade assumida, não testada | Testar 375px e 768px nas 3 páginas principais |

### BAIXOS

| ID | Débito | Impacto | Notas |
|---|---|---|---|
| UX-003 | `packages/web/` existe mas está vazio | Confusão mental — só `node_modules` | **Remover o directório** |
| UX-009 | Sem audit de acessibilidade (a11y) | WCAG compliance desconhecida | axe DevTools scan |
| UX-011 | `packages/web/` sem propósito definido | Resolvido por UX-003 | — |

---

## 4. Mapa de Dependências

```
P0 — Configuração Railway (esta semana)
│
├── DB-003: verificar volume Railway
│     └── bloqueia: DB-012 + DB-013 (backup só faz sentido se dados persistem)
│
├── DB-011: verificar NODE_ENV + KAIROS_ADMIN_TOKEN
│     └── depende de: acesso ao Railway dashboard
│
└── DB-013: configurar R2 (4 env vars)
      └── depende de: DB-003 verificado

P1 — Este mês
│
├── DB-007: activar Redis
│     └── fecha automaticamente: DB-001 (locking) em multi-processo
│
├── UX-002 + UX-008: styles.js partilhado + tokens centralizados
│     └── mesma tarefa — uma PR fecha dois débitos
│     └── desbloqueia: UX-004 (componentes)
│
└── UX-012: fix do counter
      └── independente

P2 — Próximo mês
│
├── UX-004: componentes partilhados
│     └── depende de: UX-002 resolvido
│
├── DT-002: testes unitários
│     └── independente — começar pelo sniper-engine
│
└── DT-004: avaliar PostgreSQL
      └── só urgente se > 10K verificações/dia
```

---

## 5. Matriz de Priorização Final

| Prioridade | IDs | Critério | Esforço |
|---|---|---|---|
| 🔴 P0 — Esta semana | DB-003, DB-011, DB-013 | Dados em risco, dashboard possivelmente aberto | 6h config |
| 🟠 P1 — Este mês | DB-007, UX-002+UX-008, UX-012, DB-002 | Estabilidade e credibilidade do produto | ~16h |
| 🟡 P2 — Próximo mês | DT-002, UX-004, DB-004, DT-007 | Qualidade e manutenibilidade | ~30-50h |
| 🟢 P3 — Backlog | UX-001 (framework), DT-004 (PostgreSQL), restantes | Escala e arquitectura futura | ~50-100h |

---

## 6. Esforço Total

| Prioridade | Horas | O que resolve |
|---|---|---|
| P0 — Esta semana | 6h | Dados seguros, dashboard protegido, backup activo |
| P1 — Este mês | 16h | Redis activo, CSS unificado, counter honesto |
| P2 — Próximo mês | 30–50h | Testes, componentes, documentação |
| P3 — Backlog | 50–100h | Framework frontend, PostgreSQL, escala |
| **Total** | **102–172h** | |

---

## 7. O Que Está BEM (não tocar)

| Ponto Forte | Detalhe |
|---|---|
| Audit chain SHA-256 | Hash chaining tamper-evident — raro em produtos desta fase |
| PII pseudonymizado antes de persistir | GDPR by design, não by compliance |
| API keys nunca em plaintext | Só SHA-256 em disco |
| Writes atómicos (tmp+rename) | Sem corrupção em crash |
| Idempotência com `requestId` UUID | Sem duplicados em retry |
| Auth via Bearer header (não ?token=) | Evita leakage em logs — boa decisão de segurança |
| Proof bar condicional | Só mostra dados reais quando existem — modelo a seguir |
| Zero dependências em produção | Node.js stdlib puro — deploy simples, sem supply chain risk |
| Bunny Fonts (GDPR-compliant) | Diferenciador real para mercado europeu |
| `bin/backup-volume.js` | Implementação sofisticada (SHA-256, S3 SigV4) — só precisa de activação |

---

*Fase 8 completa. Próximo: @analyst — Fase 9 (Executive Report com ROI e custos)*
