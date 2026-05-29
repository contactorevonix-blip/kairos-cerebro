# UX Specialist Review
**Gerado por:** @ux-design-expert (Uma) — Brownfield Discovery Fase 6
**Data:** 2026-05-24
**Revisão de:** docs/prd/technical-debt-DRAFT.md — Secção Frontend/UX

---

## Débitos Validados

| ID | Débito Original | Validação | Severidade Ajustada | Horas Est. |
|---|---|---|---|---|
| UX-001 | HTML em template literals JS | ✅ Confirmo | ALTO (não CRÍTICO — funciona, não é urgente) | 40-80h |
| UX-002 | CSS duplicado em cada ficheiro | ✅ Confirmo | ALTO | 4h |
| UX-003 | `packages/web/` existe mas está vazio | ✅ Confirmo | BAIXO — só confusão mental | 1h |
| UX-004 | Sem componentes reutilizáveis | ✅ Confirmo | ALTO | 8h |
| UX-005 | Sem testes de UI | ✅ Confirmo | MÉDIO | 20h |
| UX-006 | Dashboard sem autenticação clara | ⚠️ Parcialmente correcto — ver abaixo | MÉDIO (gestão de config, não código) | 1h |
| UX-007 | Sem estados de loading/error | ✅ Confirmo | MÉDIO | 6h |
| UX-008 | Design tokens não centralizados | ✅ Confirmo | ALTO | 4h |
| UX-009 | Sem audit de a11y | ✅ Confirmo | BAIXO | 4h |
| UX-010 | Mobile não verificado | ✅ Confirmo | MÉDIO | 4h |
| UX-011 | `packages/web/` sem propósito | ✅ Confirmo | BAIXO | 1h |
| UX-012 | Counter dinâmico com dados calculados | ✅ Confirmo — ver análise detalhada | ALTO (credibilidade) | 4h |

---

## Correcções ao DRAFT

### UX-006 — Dashboard sem autenticação

**O @architect estava parcialmente correcto.** Após análise de `packages/sniper-api/server.js`:

**O que existe (código robusto):**
```javascript
// server.js linha 60-63
if (!ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
  console.error('FATAL: KAIROS_ADMIN_TOKEN must be set in production. Refusing to start.');
  process.exit(1);
}
```

- Em **produção**: se `KAIROS_ADMIN_TOKEN` não estiver definido → servidor **não arranca** (fail-closed)
- Em **produção com token**: exige `Authorization: Bearer <token>` no header
- Token aceite APENAS via header (não via `?token=` — evita leakage em logs)
- Em **desenvolvimento local**: acesso aberto (intencional, documentado no código)

**O que está em risco (configuração operacional):**
1. `NODE_ENV=production` tem de estar definido no Railway
2. `KAIROS_ADMIN_TOKEN` tem de estar definido no Railway
3. Se qualquer destes faltar → `/dashboard` fica aberto ou o servidor não arranca

**Diagnóstico necessário (30 minutos):**
```bash
# No Railway dashboard → verificar:
1. NODE_ENV=production está definido?
2. KAIROS_ADMIN_TOKEN está definido?
```

**Severidade:** MÉDIO (configuração, não código). Código está correcto e seguro.

---

### UX-012 — Counter dinâmico na landing page

**Confirmo e aprofundo.** Análise do código:

```javascript
// landing-page.js linha 6-10
const COUNTER_LAUNCH = new Date('2026-05-15T00:00:00Z').getTime();
function counterBase() {
  const days = Math.floor((now - COUNTER_LAUNCH) / 86400000);
  const secs = Math.floor((now % 86400000) / 1000);
  return 180 + days * 400 + Math.floor(secs / 43);
}
```

```javascript
// server.js linha 964-966
if (method === 'GET' && url === '/api/stats/counter') {
  sendJson(res, 200, { count: counterBase() }, { 'cache-control': 'no-store' });
}
```

**O problema tem 2 camadas:**
1. **UI**: A landing usa `counterBase()` como valor inicial — número fabricado
2. **API**: `/api/stats/counter` também retorna `counterBase()` — qualquer developer que inspeccione a API vê que é matemática, não dados reais

**O que está BEM:**
- Proof bar (métricas globais) só aparece quando `rawRequests > 0` — dados reais ou nada. Excelente decisão.
- Latência mostra `<200ms` como fallback quando não há dados reais — honesto

**Impacto:**
- Um indie dev que veja o código (público no Railway ou inspeccionando a API) fica desconfiante do produto
- Vai contra o princípio "nunca inventar dados" do projecto

**Severidade:** ALTO — não é bloqueante operacionalmente mas é um risco de credibilidade real para o público-alvo técnico do produto.

---

## Respostas às Perguntas do @architect

**Q: O counter com dados calculados (UX-012) é crítico para a credibilidade?**

R: **Sim, para este produto específico.** O público-alvo (indie devs, solo founders técnicos) vai inspecionar o código ou a API. Quando veem `180 + days * 400`, perdem confiança. 

Fix recomendado: substituir o counter hero por "Beta — acesso antecipado" ou simplesmente remover até haver dados reais. Alternativa: conectar `/api/stats/counter` a `readGlobalMetrics().verifyRequests` quando o valor for > 0, e mostrar `counterBase()` só como bootstrap enquanto o fetch carrega.

**Q: Qual a prioridade: centralizar CSS vs criar componentes vs migrar para framework?**

R: **Nesta ordem:**

1. **Centralizar CSS** (4h) — extrair variáveis CSS e estilos base para `packages/sniper-api/styles.js`. Import único em todas as páginas. Resolve UX-002 e UX-008 de uma vez. Máximo impacto, mínimo risco.

2. **Criar helpers de componentes** (8h) — `components.js` com `renderHeader()`, `renderFooter()`, `renderButton()`. Importar nas 9 páginas. Resolve UX-004.

3. **Migrar para framework** (80-200h) — Apenas depois de ter produto validado com receita. Astro é o melhor candidato para este caso (SSR + zero JS por defeito + pode coexistir com Node.js puro).

**Não migrar para framework agora.** O custo não tem retorno a este stage.

**Q: O dashboard `/dashboard` tem autenticação? Como funciona o acesso?**

R: **Sim, tem autenticação robusta** — ver secção UX-006 acima. Bearer token via header. Em produção, servidor recusa arrancar sem token. O risco é operacional (verificar Railway), não de código.

**Q: O `packages/web/` deve ser removido ou desenvolvido?**

R: **Remover.** Contém apenas `node_modules` e não tem propósito activo. Está a criar confusão sobre onde está o frontend real. O frontend real são os ficheiros `.js` em `packages/sniper-api/`. Se no futuro se quiser uma SPA ou dashboard separado, cria-se de raiz com propósito definido.

---

## Recomendações por Prioridade

### P0 — Esta semana

**1. Verificar autenticação do dashboard no Railway** (30 min)
- Confirmar `NODE_ENV=production` e `KAIROS_ADMIN_TOKEN` estão definidos
- Testar: `curl -I https://kairoscheck.net/dashboard` → deve retornar 401

**2. Remover `packages/web/`** (1h)
- Eliminar directório (exceptuando `node_modules` já em gitignore)
- Atualizar referências em documentação

### P1 — Este mês

**3. Centralizar CSS** (4h)
- Criar `packages/sniper-api/styles.js` com tokens e estilos base
- Substituir CSS inline duplicado nas 9 páginas
- Resolve UX-002 + UX-008

**4. Fix do counter** (4h)
- Opção A: Remover counter hero e substituir por copy "Beta — acesso antecipado"
- Opção B: `/api/stats/counter` retorna dados reais quando `verifyRequests > 0`, fake como bootstrap
- Não deixar o número calculado como "dado real" — viola a regra do projecto

### P2 — Próximo mês

**5. Componentes partilhados** (8h)
- `components.js`: header, footer, botões, cards
- Importar nas 9 páginas

**6. Verificar mobile** (4h)
- Testar nas 3 páginas principais: landing, pricing, dashboard
- Focar no breakpoint 375px (iPhone SE) e 768px (tablet)

---

## Pontos Fortes (reafirmados)

| Ponto | Porquê é relevante |
|---|---|
| Proof bar condicional | A melhor prática do projecto — modelo a seguir no counter |
| Dashboard auth robusta | Fail-closed em produção — código correcto |
| Zero JS no cliente | Ultra-rápido, SEO perfeito, sem bundle para gerir |
| Bunny Fonts | GDPR-compliant — diferenciador real para o mercado europeu |
| Dark theme consistente | Tokens existem, só precisam de centralização |

---

## Esforço Total Estimado

| Prioridade | Horas | O que resolve |
|---|---|---|
| P0 (esta semana) | 1.5h | Dashboard verificado, packages/web removido |
| P1 (este mês) | 8h | CSS centralizado, counter corrigido |
| P2 (próximo mês) | 12h | Componentes, mobile verificado |
| **Total frontend** | **21.5h** | |

**Nota:** Migração para framework (Astro/Next.js) não entra neste estimado — é decisão de produto, não de débito técnico urgente.

---

*Fase 6 completa. Próximo: @qa — Fase 7 (QA Gate: APPROVED / NEEDS WORK)*
