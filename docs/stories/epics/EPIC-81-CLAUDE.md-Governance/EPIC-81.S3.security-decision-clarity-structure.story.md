# Story EPIC-81.S3: Security-First Rules + Decision Clarity + Documentation Structure

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "npm run lint  (CLAUDE.md é markdown válido)"
  - "grep -c 'Security by Default' CLAUDE.md  (secção existe)"
  - "node -e \"const l=require('fs').readFileSync('CLAUDE.md','utf8').split('\\n').length;process.exit(l>=120&&l<=150?0:1)\"  (budget 120-150 linhas)"
  - "grep -oE '\\.claude/rules/[a-z-]+\\.md' CLAUDE.md | sort -u | wc -l  (≤20 rule files referenciados, sem duplicação)"
```

## Story

**As a** Pedro (solo founder do Kairos Check),
**I want** CLAUDE.md com secção Security by Default, hierarquia de decisão IDS/gates explícita, e estrutura de 15 secções dentro do budget de 120-150 linhas,
**so that** todas as regras previnam erros reais (secrets em git, mock data, SQL injection), zero ambiguidades, e o documento seja completo sem ser bloated.

## Epic Context

- **Epic:** EPIC-81 — CLAUDE.md Complete Governance Optimization
- **PRD:** `docs/prd/EPIC-81-CLAUDE.md-Complete-Governance.md` — FR-5, FR-6, FR-7
- **PR de referência:** PR D (EPIC-81)
- **Story points:** 8
- **Complexidade:** M (documentação de segurança + clareza + reestruturação)
- **Cobre:** FR-5 (Security-First Rules) + FR-6 (Decision Clarity) + FR-7 (Documentation Structure)
- **Depends on:** EPIC-81.S1 + EPIC-81.S2 (as secções Observalidade/Audit/Metrics/Authority devem existir antes de fixar a estrutura final de 15 secções)
- **Blockers para:** Nenhuma (story de fecho do epic)

## Acceptance Criteria

1. **(FR-5.1)** CLAUDE.md contém secção "Security by Default" com 5 regras security-first e exemplos:
   - NEVER commit secrets (padrões explícitos: `.env`, `.env.local`, `*.key`, `credentials.*`)
   - NEVER log dados sensíveis (PII, tokens, API keys, passwords)
   - NEVER mock data se reais existem (rastreabilidade exige dados reais)
   - VALIDATE input externo (SQL injection, XSS, OWASP top 10)
   - ENCRYPT audit logs (considerar encriptação at-rest para compliance)
2. **(FR-5.2)** Checklist OWASP top 10 referenciado (self-serve para @dev)
3. **(FR-5.3)** Link explícito para secrets management (Railway/Vercel docs)
4. **(FR-6.1)** Hierarquia de decisão IDS explícita: query registry ANTES de cada CREATE; REUSE ≥90% > ADAPT 60-89% (<30% changes) > CREATE (sem match, registar em 24h)
5. **(FR-6.2)** Níveis de severidade de gate cristalinos: BLOCK (para execução, requer fix), WARN (permite, logged), INFO (logged only)
6. **(FR-6.3)** Sintaxe de override executável (não ambígua):
   - `git push --skip-devops-check` (logged, audit trail)
   - `git commit -m "msg [no-story-req]"` (config-only, audit trail)
   - `git merge --force-gate` (razão documentada, audit trail)
7. **(FR-7.1)** CLAUDE.md organizado em 15 secções (nenhuma regra dispersa) conforme lista do PRD secção 7.1
8. **(FR-7.2 / AC-1)** Total do ficheiro entre 120-150 linhas (comprehensive, não bloated)
9. **(FR-7.3)** Toda a regra previne um erro real (cita incidente passado ou risco potencial — sem fluff)
10. **(FR-7.4)** Os 20 ficheiros `.claude/rules/*.md` continuam referenciados (sem duplicação de conteúdo)
11. **(NFR-2)** Zero ambiguidades + zero referências circulares + links para source of truth

## Tasks / Subtasks

- [ ] Desenhar a secção "Security by Default" com 5 regras + exemplos (AC: 1) — *@architect*
- [ ] Referenciar checklist OWASP top 10 + secrets management Railway/Vercel (AC: 2, 3)
- [ ] Escrever IDS Decision Hierarchy explícita (AC: 4) — referenciar `ids-principles.md`
- [ ] Documentar níveis de gate severity (BLOCK/WARN/INFO) (AC: 5)
- [ ] Documentar sintaxe de override executável (3 comandos) (AC: 6) — referenciar `enforcement-gates.md`
- [ ] Reorganizar CLAUDE.md nas 15 secções definidas no PRD 7.1 (AC: 7) — *@architect*
- [ ] Aparar conteúdo para budget 120-150 linhas (AC: 8) — remover duplicações de `.claude/rules/`
- [ ] Verificar que toda regra previne erro real (AC: 9)
- [ ] Verificar que os 20 rule files continuam referenciados (AC: 10)
- [ ] Auditar ambiguidades + referências circulares (AC: 11)
- [ ] Bump versão CLAUDE.md → v3.1 + actualizar Version Log

## Scope

**IN:**
- Secção "Security by Default" (5 regras + exemplos + OWASP + secrets links)
- IDS Decision Hierarchy + gate severity + override syntax explícitos
- Reestruturação de CLAUDE.md em 15 secções, budget 120-150 linhas
- Bump de versão v3.0 → v3.1

**OUT:**
- Implementação de hooks de enforcement de segurança (já existem — `enforce-*.cjs`)
- Implementação de encriptação at-rest dos audit logs (AC-1 diz "considerar" — fora de scope de código)
- Criação de novos ficheiros `.claude/rules/*.md` (referência aos 20 existentes)
- Alteração da Constitution (`.aiox-core/constitution.md` — L1, protegido)

## Dev Notes

**Fonte da verdade (não inventar):** PRD secções FR-5, FR-6, FR-7, NFR-2, AC-1, AC-6, e a lista das 15 secções em PRD §7.1.

**Anti-bloat é o risco #1 do epic (Risk 1):** budget rígido 120-150 linhas. CLAUDE.md v3.0 actual já está em ~105 linhas (ver Version Log v3.0). As secções novas de S1/S2/S3 devem caber no incremento até 150 — caso contrário, cortar duplicação, NÃO exceder. Conteúdo detalhado vive em `.claude/rules/*.md`; CLAUDE.md referencia.

**Reuso (Art. IV-A IDS):** quase todo o conteúdo desta story já existe noutros sítios:
- Security: `feedback_never-rules.md` (NEVER-011 secrets, NEVER-005 mock data)
- IDS hierarchy: `ids-principles.md` + `.claude/CLAUDE.md`
- Gate severity + override syntax: `enforcement-gates.md` + `.claude/CLAUDE.md`
CLAUDE.md deve **referenciar/resumir**, não copiar (NFR-2: sem duplicação). ADAPT, não CREATE.

**Toda regra previne erro real (AC-9 / FR-7.3):** ancorar cada regra num incidente. Ex.: NEVER-001/002 vieram da violação de Agent Authority em Cont 77 (ver `feedback_never-rules.md`). Sem fluff.

**15 secções (FR-7.1):** Pedro / Language+Framework / Constitution / Agent Authority / SDC / Observalidade (NEW, de S1) / Audit (NEW, de S1) / Hook Metrics (NEW, de S2) / Security (NEW, esta story) / IDS / Quality Gates / Critical Commands / Tool Usage / Git Conventions / NEVER-ALWAYS.

### Testing

- **Localização:** validação CLI + revisão manual de ambiguidades
- **Standards:** markdown válido; contagem de linhas 120-150; 15 secções presentes; ≤20 rule files referenciados
- **Verificação de budget:** `wc -l CLAUDE.md` entre 120 e 150
- **Verificação de secções:** `grep "^## "` retorna 15 secções esperadas
- **Verificação de referências:** os 20 rule files de `.claude/rules/` continuam referenciados, sem duplicação de corpo

## Definition of Done

- [ ] AC 1-11 todos PASS
- [ ] Secção "Security by Default" com 5 regras + exemplos presente
- [ ] IDS hierarchy + gate severity + override syntax explícitos e não-ambíguos
- [ ] CLAUDE.md em 15 secções, 120-150 linhas (`wc -l` confirma)
- [ ] Os 20 rule files continuam referenciados, zero duplicação de corpo (NFR-2)
- [ ] Toda regra ancorada num erro real/risco (AC-9)
- [ ] Versão CLAUDE.md → v3.1 + Version Log actualizado
- [ ] `npm run lint` pass
- [ ] Story status actualizado conforme SDC
- [ ] Change Log actualizado
- [ ] Commit com referência `[Story EPIC-81.S3]`

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-25 | @pm (Morgan/Bob) | Story criada a partir de EPIC-81 PRD (FR-5 + FR-6 + FR-7) — Draft |
