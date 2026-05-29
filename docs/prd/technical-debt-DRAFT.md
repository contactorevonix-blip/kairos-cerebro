# Technical Debt Assessment — DRAFT
**Para Revisão dos Especialistas**
**Gerado por:** @architect (Aria) — Brownfield Discovery Fase 4
**Data:** 2026-05-24
**Fontes:** system-architecture.md · db-audit.md · frontend-spec.md

---

## Resumo Executivo (DRAFT)

| Área | Críticos | Altos | Médios | Total |
|---|---|---|---|---|
| Sistema / Arquitectura | 3 | 4 | 4 | 11 |
| Base de Dados | 3 | 4 | 3 | 10 |
| Frontend / UX | 3 | 5 | 4 | 12 |
| **TOTAL** | **9** | **13** | **11** | **33** |

---

## 1. Débitos de Sistema / Arquitectura

*(Fonte: docs/architecture/system-architecture.md — validado por @architect)*

### CRÍTICOS

| ID | Débito | Impacto |
|---|---|---|
| DT-001 | Base de dados JSON on-disk — não escala nem suporta multi-replica | Perda de dados em deploy Railway (container efémero) |
| DT-002 | Sem testes unitários na maioria dos packages | Regressões silenciosas em produção |
| DT-003 | `docs/` inexistente — sem documentação do produto | AIOX não funciona, onboarding impossível |

### ALTOS

| ID | Débito | Impacto |
|---|---|---|
| DT-004 | Sem PostgreSQL — queries impossíveis sobre dados históricos | Sem relatórios, sem analytics, sem debugging |
| DT-005 | `packages/web` não desenvolvido | Confusão sobre arquitectura frontend |
| DT-006 | `.aiox/` inexistente | Memória do sistema ausente, handoffs falham |
| DT-007 | `.env.example` incompleto | Onboarding de novo dev = horas de debugging |

### MÉDIOS

| ID | Débito | Impacto |
|---|---|---|
| DT-008 | `sniper-db` sem índices — O(n) em todas as leituras | Degradação com volume |
| DT-009 | Event bus JSONL sem rotação de logs | Ficheiro cresce indefinidamente |
| DT-010 | `outreach-mailer.js` em `lib/` em vez de package | Acoplamento incorrecto |
| DT-011 | Múltiplos scripts em `bin/` sem orquestração clara | Confusão operacional |

---

## 2. Débitos de Base de Dados

*(Fonte: docs/architecture/db-audit.md — ⚠️ PENDENTE revisão de @data-engineer)*

### CRÍTICOS

| ID | Débito | Impacto |
|---|---|---|
| DB-001 | JSON on-disk sem locking multi-processo | 2 processos simultâneos corrompem ficheiros |
| DB-002 | `verifications.jsonl` sem rotação | Cresce para GB em produção com volume |
| DB-003 | **Dados perdem-se em cada deploy Railway** | Container efémero sem volume persistente = reset total |

### ALTOS

| ID | Débito | Impacto |
|---|---|---|
| DB-004 | Sem sistema de migrations | Schema evolui implicitamente — registos antigos ficam incompletos |
| DB-005 | `api_keys.json` lido inteiro em cada request | O(n) — lento com muitos tenants |
| DB-006 | Sem índices em nenhuma "tabela" | Lookup = scan completo |
| DB-007 | Redis adapter não activo em produção | Reputation graph não funciona em multi-replica |

### MÉDIOS

| ID | Débito | Impacto |
|---|---|---|
| DB-008 | Token ledger em JSONL por ficheiro — sem visão agregada | Impossível auditar economia de tokens globalmente |
| DB-009 | `referrals.jsonl` sem schema formal | Inconsistência de campos garantida |
| DB-010 | Sem backup formal de `.kairos-data/` | Dado crítico sem redundância |

---

## 3. Débitos de Frontend / UX

*(Fonte: docs/frontend/frontend-spec.md — ⚠️ PENDENTE revisão de @ux-design-expert)*

### CRÍTICOS

| ID | Débito | Impacto |
|---|---|---|
| UX-001 | HTML em template literals JS — sem separação de concerns | Impossível manter, testar ou reutilizar componentes |
| UX-002 | CSS duplicado em cada ficheiro de página | Qualquer mudança de design = editar 8+ ficheiros |
| UX-003 | `packages/web/` existe mas está vazio | Arquitectura frontend ambígua |

### ALTOS

| ID | Débito | Impacto |
|---|---|---|
| UX-004 | Sem componentes reutilizáveis (header, footer, botões) | Tudo duplicado |
| UX-005 | Sem testes de UI | Regressões visuais invisíveis |
| UX-006 | Dashboard sem autenticação clara | Exposição de métricas internas |
| UX-007 | Sem estados de loading/error no frontend | UX degradada durante erros |
| UX-008 | Design tokens não centralizados | Inconsistência visual futura |

### MÉDIOS

| ID | Débito | Impacto |
|---|---|---|
| UX-009 | Sem audit de acessibilidade (a11y) | WCAG compliance desconhecida |
| UX-010 | Mobile não verificado | Responsividade assumida, não testada |
| UX-011 | `packages/web/` sem propósito definido | Confusão arquitectural |
| UX-012 | Counter da landing com dados calculados, não reais | Credibilidade do produto em risco |

---

## 4. Matriz de Priorização Preliminar

| Prioridade | IDs | Critério |
|---|---|---|
| 🔴 P0 — Esta semana | DB-003, DB-001 | Perda de dados em produção |
| 🟠 P1 — Este mês | DT-001, DT-002, DB-002, DB-004 | Risco de estabilidade |
| 🟡 P2 — Próximo mês | UX-001, UX-002, DT-004, DB-007 | Dívida de manutenção |
| 🟢 P3 — Backlog | Restantes | Melhorias incrementais |

---

## 5. Perguntas para Especialistas

### Para @data-engineer (Fase 5):
1. Confirmas que DB-003 (perda de dados em Railway) é crítico e imediato?
2. Qual a recomendação: Volume Railway ou migrar para Railway PostgreSQL?
3. O Redis adapter está pronto para activar ou precisa de configuração adicional?
4. Estimas quanto tempo leva migrar `sniper-db` para PostgreSQL?

### Para @ux-design-expert (Fase 6):
1. O counter com dados calculados (UX-012) é crítico para a credibilidade do produto?
2. Qual a prioridade: centralizar CSS vs criar componentes vs migrar para framework?
3. O dashboard (`/dashboard`) tem autenticação? Como funciona o acesso?
4. O `packages/web/` deve ser removido ou desenvolvido?

---

*DRAFT completo. Aguarda validação dos especialistas nas Fases 5, 6 e 7.*
