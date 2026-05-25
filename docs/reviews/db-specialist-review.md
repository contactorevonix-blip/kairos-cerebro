# Database Specialist Review
**Gerado por:** @data-engineer (Dara) — Brownfield Discovery Fase 5
**Data:** 2026-05-24
**Revisão de:** docs/prd/technical-debt-DRAFT.md — Secção de Base de Dados

---

## Débitos Validados

| ID | Débito Original | Validação | Severidade Ajustada | Horas Est. |
|---|---|---|---|---|
| DB-001 | JSON sem locking multi-processo | ✅ Confirmo | ALTO (não CRÍTICO) — 1 réplica activa | 8h |
| DB-002 | `verifications.jsonl` sem rotação | ✅ Confirmo | ALTO | 4h |
| DB-003 | Perda de dados em deploy Railway | ⚠️ Parcialmente correcto — ver abaixo | CRÍTICO (operacional) | 2h |
| DB-004 | Sem sistema de migrations | ✅ Confirmo | ALTO | 16h |
| DB-005 | `api_keys.json` lido inteiro em cada request | ✅ Confirmo | MÉDIO (< 1K tenants não é problema) | 12h |
| DB-006 | Sem índices | ✅ Confirmo | MÉDIO | 8h |
| DB-007 | Redis não activo em produção | ✅ Confirmo | ALTO | 4h |
| DB-008 | Token ledger sem visão agregada | ✅ Confirmo | MÉDIO | 8h |
| DB-009 | `referrals.jsonl` sem schema formal | ✅ Confirmo | BAIXO | 2h |
| DB-010 | Sem backup formal | ⚠️ Incorrecto — ver abaixo | MÉDIO (configuração, não código) | 2h |

---

## Débitos Adicionados

| ID | Débito Novo | Severidade | Horas |
|---|---|---|---|
| DB-011 | `KAIROS_ADMIN_TOKEN` não obrigatório — dashboard público se não configurado | CRÍTICO | 1h |
| DB-012 | R2 backup existe mas não está configurado (4 env vars em falta) | ALTO | 2h |
| DB-013 | Railway volume não verificado — pode não estar montado | CRÍTICO | 2h |

---

## Correcções ao DRAFT

### DB-003 — Perda de dados em Railway

**O @architect estava parcialmente correcto.** A análise inicial assumiu que não havia mecanismo de persistência. Após análise do Dockerfile e de `bin/backup-volume.js`:

**O que existe (código está correcto):**
- `Dockerfile` cria `/app/.kairos-data` como mount point explícito
- Comentário no Dockerfile: *"Railway mounts the persistent volume here at runtime"*
- `bin/backup-volume.js` — backup completo para Cloudflare R2 (SHA-256, S3 SigV4, zero deps)

**O que está em risco (configuração operacional):**
1. **O volume Railway pode não estar montado** — se `KAIROS_DB_DIR` aponta para dentro do container sem volume, dados perdem-se em cada deploy
2. **O backup R2 não está configurado** — script existe mas requer 4 env vars (`R2_BACKUP_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) que podem não estar definidas no Railway

**Diagnóstico necessário (2h):**
```bash
# No Railway dashboard → verificar:
1. Existe um Volume montado em /app/.kairos-data ?
2. As 4 env vars R2_* estão configuradas?
3. KAIROS_ADMIN_TOKEN está definido?
```

### DB-010 — Backup formal

**Incorrecto no DRAFT.** O backup existe (`bin/backup-volume.js`), é sofisticado (zero deps, SHA-256, R2 SigV4), mas não está configurado operacionalmente. Severidade desce de CRÍTICO para MÉDIO.

---

## Recomendações por Prioridade

### P0 — Esta semana (bloqueante)

**1. Verificar e configurar volume Railway** (2h)
- Aceder ao Railway dashboard
- Confirmar que `/app/.kairos-data` tem volume persistente montado
- Se não tiver: criar volume no Railway e redeployar

**2. Configurar R2 backup** (2h)
- Criar bucket Cloudflare R2
- Adicionar 4 env vars ao Railway
- Testar: `node bin/backup-volume.js`

**3. Proteger o dashboard** (1h)
- Definir `KAIROS_ADMIN_TOKEN` no Railway
- Verificar que `/dashboard` retorna 401 sem token

### P1 — Este mês

**4. Rotação de `verifications.jsonl`** (4h)
- Arquivar entradas com mais de 90 dias para ficheiro separado
- Ou implementar leitura por janela temporal

**5. Activar Redis para reputation graph** (4h)
- Railway tem Redis nativo (add-on)
- Definir `KAIROS_RG_ADAPTER=redis` e `KAIROS_REDIS_URL`
- Testa multi-process sem corrupção

### P2 — Próximo mês

**6. Avaliar migração para PostgreSQL** (40-80h)
- Railway tem PostgreSQL nativo
- Reescrever `sniper-db/index.js` com `pg` ou Drizzle
- Threshold do código: >1M registos — pode não ser urgente ainda

---

## Respostas às Perguntas do @architect

**Q: Confirmas que DB-003 é crítico e imediato?**
R: Sim, mas é um problema de configuração (30 minutos de verificação), não de código. O código está correcto. A prioridade é confirmar se o volume está montado no Railway.

**Q: Volume Railway ou PostgreSQL?**
R: Volume Railway primeiro (rápido, zero mudança de código). PostgreSQL quando atingires >10K verificações por dia ou precisares de queries complexas.

**Q: Redis adapter pronto para activar?**
R: Sim. Requer só 2 env vars: `KAIROS_RG_ADAPTER=redis` e `KAIROS_REDIS_URL`. Railway tem Redis como add-on nativo.

**Q: Tempo para migrar para PostgreSQL?**
R: 40-80 horas. Reescrever `sniper-db/index.js` + criar schema SQL + migrations + testes. Não é urgente — o JSON serve até ~1M registos conforme documentado no próprio código.

---

## Esforço Total Estimado

| Prioridade | Horas | O que resolve |
|---|---|---|
| P0 (esta semana) | 5h | Dados seguros, dashboard protegido |
| P1 (este mês) | 8h | Rotação de logs, Redis activo |
| P2 (próximo mês) | 46-86h | PostgreSQL, índices, migrations |
| **Total** | **59-99h** | |

---

*Fase 5 completa. Próximo: @ux-design-expert — Fase 6 (Validação Frontend/UX)*
