# Story EPIC-AIOX-GOVERNANCE-2.S3: Authority Registry & Hooks

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "node tests/hooks/validate-authority-registry.test.js"
  - "node .claude/hooks/validate-authority-registry.cjs --dry-run"
  - "Revisao manual do YAML: todos os 9 agentes mapeados, links validos"
```

## Story

**As a** agente AIOX (qualquer um dos 9 com autoridade exclusiva),
**I want** um registry YAML centralizado que mapeie cada operacao exclusiva ao seu agente, regra fonte, e hook de enforcement,
**so that** posso ser validado automaticamente na activacao e o sistema pode detectar violacoes de autoridade sem depender apenas de documentacao em prosa.

## Epic Context

- **Epic:** EPIC-AIOX-GOVERNANCE-2 — AIOX Governance Documentation & Organization
- **PRD:** `docs/PRDs/PORD-AIOX-Governance-Documentation.md` — FR-3
- **Story Points:** 8
- **Complexidade:** H (implementacao: YAML registry + validation hook CJS + testes >90% cobertura)
- **Depends on:** nenhuma (pode comecar independentemente de S1/S2/S4)
- **Bloqueia:** nenhuma
- **Tipo:** Standard SDC com build + testes (nao documentacao pura) — requer @qa gate

## Acceptance Criteria

1. Ficheiro `agent-authority-registry.yaml` criado em `.aiox-core/data/` com schema conforme PRD FR-3.
2. Todos os 9 agentes com operacoes exclusivas mapeados: `@devops` (git push, gh pr, MCP), `@sm` (story creation), `@po` (story validation), `@dev` (implementation), `@architect` (architecture decisions), `@data-engineer` (DDL/schema), `@qa` (quality verdicts), `@pm` (epic orchestration), `@aiox-master` (framework governance).
3. Cada entrada do registry linka para: `rule_source` (ficheiro em `.claude/rules/`), `agent_definition` (ficheiro em `.claude/agents/` ou `.claude/skills/`), `hook_enforcement` (hook CJS existente ou null se nao existir).
4. Hook de validacao `.claude/hooks/validate-authority-registry.cjs` criado e funcional: verifica que o registry esta completo (todos os agentes com operacoes exclusivas presentes) e que os paths referenciados existem no filesystem.
5. Testes para o hook de validacao com >90% de cobertura e pelo menos 5 edge cases cobertos (agente em falta, path invalido, operacao duplicada, registry vazio, YAML malformado).
6. Hook integrado no workflow de @dev: executado automaticamente na activacao do agente (ou via pre-commit, conforme decisao de integracao do @dev).
7. @qa valida: PASS gate — registry correcto, hook funcional, testes passam, cobertura >90%.

## Tasks / Subtasks

- [ ] Ler `.claude/rules/agent-authority.md` para extrair todas as operacoes exclusivas por agente (AC: 2)
- [ ] Ler hooks existentes em `.claude/hooks/` para identificar enforcement hooks ja existentes (AC: 3)
- [ ] Criar `.aiox-core/data/agent-authority-registry.yaml` com schema do PRD (AC: 1, 2, 3)
  - [ ] Mapear @devops: git push, gh pr create, gh pr merge, MCP add/remove/configure, CI/CD, Release/Tag
  - [ ] Mapear @sm: story creation (*draft, *create-story)
  - [ ] Mapear @po: story validation (*validate-story-draft), backlog prioritization
  - [ ] Mapear @dev: implementation (git add, git commit — nunca git push)
  - [ ] Mapear @architect: architecture decisions, technology selection
  - [ ] Mapear @data-engineer: schema DDL, migrations, RLS policies
  - [ ] Mapear @qa: quality verdicts (PASS/FAIL/CONCERNS/WAIVED)
  - [ ] Mapear @pm: epic orchestration (*create-epic, *execute-epic)
  - [ ] Mapear @aiox-master: framework governance, constitution enforcement
- [ ] Criar `.claude/hooks/validate-authority-registry.cjs` (AC: 4)
  - [ ] Validar que todos os 9 agentes com operacoes exclusivas estao no registry
  - [ ] Verificar que todos os paths (rule_source, agent_definition, hook_enforcement) existem
  - [ ] Output: PASS / WARN (paths em falta) / FAIL (agentes em falta)
- [ ] Criar testes em `tests/hooks/validate-authority-registry.test.js` (AC: 5)
  - [ ] Edge case: agente em falta no registry
  - [ ] Edge case: path de rule_source invalido
  - [ ] Edge case: operacao exclusiva duplicada em 2 agentes
  - [ ] Edge case: registry YAML vazio
  - [ ] Edge case: YAML malformado (syntax error)
  - [ ] Happy path: registry completo e correcto → PASS
- [ ] Integrar hook na activacao de @dev (PreToolUse ou hook de activacao) (AC: 6)
- [ ] Verificar cobertura de testes >90% (AC: 5, 7)

## File List

```
(vazio — a preencher pelo @dev durante implementacao)
```

## Dev Notes

**Schema esperado do registry (do PRD FR-3):**
```yaml
agents:
  aiox-devops:
    exclusive_operations:
      - git push
      - gh pr create
      - MCP add/remove
    rule_source: .claude/rules/agent-authority.md
    agent_definition: .claude/agents/aiox-devops.md
    hook_enforcement: .claude/hooks/enforce-agent-authority.cjs
    status: ACTIVE
```

**Hooks de enforcement ja existentes (verificar):**
- `.claude/hooks/enforce-agent-authority.cjs` — Art. II gate (bloqueia git push de nao-@devops)
- `.claude/hooks/enforce-story-driven.cjs` — Art. III gate

**Fonte de autoridade:**
- `.claude/rules/agent-authority.md` — matriz de delegacao completa (LEITURA OBRIGATORIA antes de criar o registry)
- `.claude/CLAUDE.md` — Agent Authority Matrix (secao "Agent Authority Matrix")

**Testing framework:** Usar `node:test` (nativo Node.js, sem dependencias externas) — padrao do projecto conforme `tests/hooks/enforcement.test.js` existente.

**Boundary L2 note:** `.aiox-core/data/` e uma excepcao permitida (L3 Config — ver core-config.yaml `boundary.exceptions`). O hook vai para `.claude/hooks/` (L4 Runtime — sempre modificavel).

**Integracao com hooks existentes:** Ver `.claude/rules/enforcement-gates.md` para o padrao de decision log (`.aiox/gate-logs/`) e metricas (`.synapse/metrics/hook-metrics.json`).

## Change Log

| Data | Agente | Accao |
|------|--------|-------|
| 2026-06-25 | @sm (River) | Story criada — Draft |
