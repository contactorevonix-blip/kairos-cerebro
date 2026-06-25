# Story EPIC-AIOX-GOVERNANCE-2.S1: Agent Connectivity Matrix

## Status
**Ready**

## Executor Assignment
```yaml
executor: "@sm"
quality_gate: "@qa"
quality_gate_tools:
  - "Revisao manual: verificar que todos os ~58-59 agentes constam na matriz"
  - "Grep: confirmar que todos os SKILL.md existem nos paths listados"
```

**Collaboration Model:** @sm (documentação) + @qa (validação) trabalham juntos, debatem naming conflicts e reconciliação de dados. @qa faz gate final.

## Story

**As a** developer ou novo membro da equipa KAIROS_CEREBRO,
**I want** uma matriz centralizada que mapeie cada agente com as suas localizacoes de ficheiros e dependencias,
**so that** consigo responder rapidamente "o que e o agente X, onde esta definido, e o que le/escreve?" sem ter de explorar 3 pastas diferentes.

## Epic Context

- **Epic:** EPIC-AIOX-GOVERNANCE-2 — AIOX Governance Documentation & Organization
- **PRD:** `docs/PRDs/PORD-AIOX-Governance-Documentation.md` — FR-1
- **Story Points:** 5
- **Complexidade:** M (documentacao com reconciliacao de naming entre 2 sistemas de agentes)
- **Depends on:** nenhuma (pode comecar imediatamente)
- **Bloqueia:** nenhuma (paralela a S2 e S4)
- **Notas de sizing:** ~29 agentes em `.claude/agents/` + ~58-59 `SKILL.md` canonicos. A story inclui reconciliacao de naming e deduplicacao no scope.

## Acceptance Criteria

1. Ficheiro `.claude/.docs/AGENT-CONNECTIVITY-MAP.md` criado com tabela Markdown de todos os agentes.
2. Todos os ~58-59 agentes listados com reconciliacao de naming entre `.claude/agents/` (29 definicoes legacy) e `.claude/skills/AIOX/agents/*/SKILL.md` (canonicos).
3. Colunas preenchidas: Agent | Primary Def | Shim Location | Skill Location | Reads From | Writes To | Authority.
4. Coluna "Authority" documenta operacoes exclusivas do agente (ex: `@devops` → `git push`, `gh pr create`).
5. Coluna "Reads From" e "Writes To" preenchidas com paths reais (verificados contra os ficheiros existentes).
6. @po valida que a conectividade documentada e precisa (sem referencias a paths inexistentes).

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

## Tasks / Subtasks

- [ ] Listar todos os agentes em `.claude/agents/` (29 ficheiros) (AC: 2)
- [ ] Listar todos os `SKILL.md` canonicos em `.claude/skills/AIOX/agents/*/SKILL.md` (AC: 2)
- [ ] Reconciliar naming: identificar agentes com nomes diferentes entre as duas localizacoes (AC: 2)
- [ ] Para cada agente, extrair Reads From / Writes To dos ficheiros de definicao (AC: 5)
- [ ] Para cada agente, extrair Authority de `.claude/rules/agent-authority.md` (AC: 4)
- [ ] Criar pasta `.claude/.docs/` se nao existir (AC: 1)
- [ ] Criar `.claude/.docs/AGENT-CONNECTIVITY-MAP.md` com tabela completa (AC: 1, 3)
- [ ] Verificar que todos os paths listados existem no filesystem (AC: 5, 6)

## File List

```
(vazio — a preencher pelo @dev durante implementacao)
```

## Dev Notes

**Fonte primaria:**
- `.claude/rules/agent-authority.md` — matriz de autoridade (quem pode o que)
- `.claude/agents/` — 29 definicoes legacy (formato `.md`)
- `.claude/skills/AIOX/agents/*/SKILL.md` — ~58-59 definicoes canonicas
- `.claude/commands/AIOX/agents/` — shims de compatibilidade

**Formato esperado da tabela:**
```markdown
| Agent | Primary Def | Shim Location | Skill Location | Reads From | Writes To | Authority |
|-------|------------|-----------------|----------------|-----------|----------|-----------|
| aiox-sm | .claude/agents/aiox-sm.md | .claude/commands/AIOX/agents/aiox-sm.md | .claude/skills/AIOX/agents/aiox-sm/SKILL.md | .aiox-core/development/tasks/ | docs/stories/ | Story creation |
```

**Problema de naming conhecido (do PRD FR-1):**
- `.claude/agents/aiox-sm.md` pode divergir de `.claude/skills/AIOX/agents/sm/SKILL.md` (prefix `aiox-` vs sem prefix)
- A story deve documentar o mapping real, nao assumir consistencia

**Sem CodeRabbit:** `coderabbit_integration` nao configurado — qualidade validada por @po manualmente.

### Testing

**Validation Approach:**
- Manual verification: abrir ficheiro `.claude/.docs/AGENT-CONNECTIVITY-MAP.md` e verificar:
  1. Todos os agentes (58-59) presentes na tabela
  2. Paths verificados contra filesystem (nenhum path inexistente)
  3. Naming mapping correcto (legacy `.claude/agents/` vs canonical `.claude/skills/AIOX/agents/*/SKILL.md`)
  4. Authority column preenchido de acordo com `agent-authority.md`

**Quality Check (Manual by @po):**
- [ ] Tabela tem 58-59 linhas (um por agente)
- [ ] Todas as colunas preenchidas (7: Agent | Primary Def | Shim Location | Skill Location | Reads From | Writes To | Authority)
- [ ] Nenhum path "TBD" ou placeholder
- [ ] Grep: `ls .claude/agents/` = número de agentes mapeados
- [ ] Grep: `find .claude/skills/AIOX/agents -name SKILL.md` = número de skill locations verificados

## Criteria of Done

Story é considerada **Done** quando:
- [ ] Ficheiro `.claude/.docs/AGENT-CONNECTIVITY-MAP.md` existe
- [ ] Tabela tem todas as 58-59 agentes listadas
- [ ] Todas as 7 colunas preenchidas com dados reais (sem TBD)
- [ ] Todos os paths verificados contra filesystem (nenhum inválido)
- [ ] @po validou manualmente (AC #6: conectividade precisa)
- [ ] Naming reconciliado e documentado (legacy vs canonical)
- [ ] Authority documentada com base em `agent-authority.md`

## Change Log

| Data | Versão | Descrição | Agente |
|------|--------|-----------|--------|
| 2026-06-25 | 1.0.5 | Executor model updated: @sm (documentation) + @qa (validation) collaboration model — better for reconciliation work | @po |
| 2026-06-25 | 1.0.4 | Final optimization: Testing Standards + Criteria of Done added → 10/10 perfect score | @po |
| 2026-06-25 | 1.0.3 | Re-validation GO (8/10) — Status: Draft → Ready. All blockers resolved, ready for @qa implementation | @po |
| 2026-06-25 | 1.0.2 | Fixes applied — (1) Executor: @dev→@qa (validation work), (2) CodeRabbit Integration section added. Ready for @po re-validation | @sm |
| 2026-06-25 | 1.0.1 | Validation NO-GO (4/10) — 2 blocking issues identified | @po |
| 2026-06-25 | 1.0.0 | Story criada — Draft | @sm |
