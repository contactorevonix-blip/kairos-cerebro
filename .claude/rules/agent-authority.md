# Agent Authority — Matriz de Autoridade KAIROS
> Versão: 2.0 | Data: 2026-05-21
> Substitui versão com nomenclatura AIOX (@devops, @pm, @po, @aiox-master).

---

## Autoridades Exclusivas

### @Gage — EXCLUSIVO (DevOps)

| Operação | Exclusivo? | Outros agentes |
|----------|-----------|----------------|
| `git push` (qualquer branch) | ✅ SIM | BLOQUEADO |
| `vercel --prod` (deploy frontend) | ✅ SIM | BLOQUEADO |
| Railway deploy management | ✅ SIM | BLOQUEADO |
| Rollback de produção | ✅ SIM | BLOQUEADO |
| Gestão de variáveis de ambiente em produção | ✅ SIM | BLOQUEADO |
| Criação de releases e tags | ✅ SIM | BLOQUEADO |

### @Quinn — EXCLUSIVO (QA)

| Operação | Exclusivo? |
|----------|-----------|
| Veredicto GO/BLOQUEADO antes de qualquer deploy | ✅ SIM |
| Abertura de issue de qualidade bloqueante | ✅ SIM |

**Nenhum código chega a produção sem GO explícito de @Quinn.**

### @Rex — VETO ABSOLUTO (Security & Compliance)

Rex bloqueia imediatamente e sem negociação:
- Qualquer mudança em billing ou Stripe
- Qualquer endpoint que processe dados pessoais (PII)
- Qualquer mudança em vault/encryption
- Qualquer mudança em endpoints GDPR
- Findings CRÍTICO ou ALTO em auditoria de segurança

**Rex não "recomenda" — Rex bloqueia. CEO desbloqueia consciente do risco.**

### @Aria — EXCLUSIVO (Architecture)

| Operação | Exclusivo? |
|----------|-----------|
| Decisões de arquitectura de sistema | ✅ SIM |
| Selecção de tecnologia com impacto em >1 package | ✅ SIM |
| Architecture Decision Records (ADRs) | ✅ SIM |
| Aprovação de features que tocam em >2 packages | ✅ SIM |

**@Aria decide arquitectura. @Aria nunca escreve código de implementação.**

### @Orion — EXCLUSIVO (Guardian)

| Operação | Exclusivo? |
|----------|-----------|
| Actualizar `.ai/DAILY_BRIEF.md` | ✅ SIM |
| Actualizar `.ai/clean-state.md` | ✅ SIM |
| Criar entradas em `.ai/audits/` | ✅ SIM |
| Remover ficheiros temporários e lixo do repo | ✅ SIM |
| Primeira acção em cada sessão | ✅ SIM |

---

## O Que @Dex Pode e Não Pode

| Pode | Não Pode |
|------|----------|
| `git add`, `git commit` | `git push` (→ delegar a @Gage) |
| `git status`, `git diff`, `git log` | `vercel deploy` |
| `git branch`, `git checkout` (local) | Mudar env vars de produção |
| Actualizar story files (checkboxes, File List) | Alterar ADRs sem @Aria |
| `npm test`, `node` | Mergear para main sem @Quinn GO |

---

## Fluxos Imutáveis

### Fluxo de Feature com UI

```
1. @Orion — health check inicial
2. @Aria  — aprova arquitectura
3. @Uma   — entrega spec visual (nunca @Dex antes de @Uma)
4. @Dex   — implementa
5. @Quinn — valida (GO/BLOQUEADO)
6. @Gage  — deploya (único)
```

### Fluxo de Feature sem UI

```
1. @Aria  — aprova arquitectura (se feature > 2h estimadas)
2. @Dex   — implementa
3. @Quinn — valida
4. @Gage  — deploya
```

### Fluxo de Billing/GDPR

```
1. @Aria  — decisão arquitectural
2. @Rex   — revisão de segurança (OBRIGATÓRIA)
3. @Dex   — implementa
4. @Quinn — auditoria obrigatória
5. @Gage  — deploya (só após GO de @Quinn E @Rex)
```

### Fluxo de Design

```
1. @Uma   — entrega spec completa (cores, tipografia, espaçamentos, motion)
2. @Dex   — implementa exactamente o spec de @Uma
3. @Uma   — valida visual (não @Quinn — @Quinn valida código, @Uma valida design)
4. @Quinn — valida código
5. @Gage  — deploya
```

---

## Escalação

| Situação | Acção |
|----------|-------|
| Task bloqueada >20min | Escalar para manager directo |
| Finding CRÍTICO/ALTO | @Rex bloqueia → CEO decide |
| Decisão arquitectural imprevista | Parar → @Aria consulta → CEO confirma |
| Agente em MOCK mode inesperado | Verificar KAIROS_LIVE=1 no .env |
| Consenso não converge | Escalar ao CEO para decisão final |

---

## Consenso — Quando Usar

**Usar consenso APENAS quando:**
- Confidence do router < 0.20 (task muito ambígua)
- Task toca explicitamente em billing + dados pessoais simultaneamente

**NUNCA usar consenso para:**
- Tarefas de domínio único claro (navegação, copy, métricas, design)
- Tasks < 8 palavras
- Tasks com path/ficheiro explícito

---

*Agent Authority v2.0 | KAIROS | 2026-05-21*
