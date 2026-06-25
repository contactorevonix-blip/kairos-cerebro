# Story EPIC-AIOX-GOVERNANCE-2.S4: Folder Structure Guide

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@po"
quality_gate_tools:
  - "Revisao manual: 9 pastas documentadas, boundary L1-L4 linkada correctamente"
  - "Verificar README.md actualizado com link para o guia"
```

## Story

**As a** developer novo ou qualquer membro da equipa KAIROS_CEREBRO,
**I want** uma referencia rapida que explique o proposito e as regras de mutabilidade de cada pasta de topo do projecto,
**so that** sei exactamente onde colocar um ficheiro novo sem violar o Framework Boundary (Art. VII) nem criar duplicacao.

## Epic Context

- **Epic:** EPIC-AIOX-GOVERNANCE-2 — AIOX Governance Documentation & Organization
- **PRD:** `docs/PRDs/PORD-AIOX-Governance-Documentation.md` — FR-4
- **Story Points:** 3
- **Complexidade:** S (documentacao pura — 9 pastas, sem codigo)
- **Depends on:** nenhuma (paralela a S1 e S2)
- **Bloqueia:** nenhuma
- **Tipo:** Documentacao pura (markdown)

## Acceptance Criteria

1. Ficheiro `.claude/.docs/FOLDER-STRUCTURE.md` criado com seccao dedicada a cada pasta de topo.
2. As 9 pastas de topo documentadas: `.claude/`, `.aiox-core/`, `.aiox/`, `.synapse/`, `docs/`, `squads/`, `outputs/`, `packages/`, `tests/`.
3. Cada pasta tem: Purpose (o que vai aqui), Mutability (NEVER/Exceptions/ALWAYS), Key Files (exemplos reais), Do NOT Put Here (exemplos de erros comuns).
4. Regras L1-L4 do Framework Boundary linkadas (referencia a `.claude/CLAUDE.md` seccao "Framework Boundary" e `core-config.yaml` seccao `boundary`).
5. `README.md` (raiz do projecto) actualizado com link para `.claude/.docs/FOLDER-STRUCTURE.md`.

## Tasks / Subtasks

- [ ] Listar todas as pastas de topo existentes no projecto com `ls` (AC: 2)
- [ ] Ler `core-config.yaml` seccao `boundary` para extrair paths L1/L2 protegidos (AC: 4)
- [ ] Ler `.claude/CLAUDE.md` seccao "Framework Boundary (L1-L4)" (AC: 4)
- [ ] Criar pasta `.claude/.docs/` se nao existir (AC: 1)
- [ ] Criar `.claude/.docs/FOLDER-STRUCTURE.md` com seccoes para as 9 pastas (AC: 1, 2, 3)
  - [ ] `.claude/` — Agent definitions, CLI config, rules
  - [ ] `.aiox-core/` — Framework core imutavel (L1) + templates (L2)
  - [ ] `.aiox/` — Runtime state, handoffs, gate-logs, error-log
  - [ ] `.synapse/` — Engine de contexto, metricas de hooks, session state
  - [ ] `docs/` — Stories, PRDs, architecture, research (L4 — sempre modificavel)
  - [ ] `squads/` — Squads de agentes especializados
  - [ ] `outputs/` — Saidas geradas (minds, reports)
  - [ ] `packages/` — Pacotes Node.js do framework
  - [ ] `tests/` — Testes automatizados
- [ ] Adicionar seccao "Quick Reference: Onde colocar X?" com exemplos concretos (AC: 3)
- [ ] Actualizar `README.md` com link para o guia (AC: 5)

## File List

```
(vazio — a preencher pelo @dev durante implementacao)
```

## Dev Notes

**Estrutura esperada por pasta (template do PRD FR-4):**
```markdown
## .claude/
- **Purpose:** Agent definitions, CLI configuration, development rules
- **Mutability:** Mixed (see Framework Boundary rules below)
- **Key Files:** CLAUDE.md, settings.json, agents/, skills/, rules/, hooks/
- **Do NOT Put Here:** Source code, user data, runtime state, stories
```

**Pastas a documentar (verificar se existem com ls antes de documentar):**
`.claude/`, `.aiox-core/`, `.aiox/`, `.synapse/`, `docs/`, `squads/`, `outputs/`, `packages/`, `tests/`

**Fonte das regras de mutabilidade:**
- `core-config.yaml` seccao `boundary.protected` → L1/L2 (NEVER)
- `core-config.yaml` seccao `boundary.exceptions` → L3 Config (Exceptions)
- `.claude/CLAUDE.md` tabela "Framework Boundary (L1-L4)" → referencia completa

**Erros comuns conhecidos (do PRD FR-4):**
- Colocar stories em `.aiox/` (devem ir em `docs/stories/`)
- Editar `.aiox-core/development/tasks/` (L2 — NEVER sem @aiox-master)
- Colocar state de runtime em `docs/` (deve ir em `.aiox/`)

**README.md:** Verificar se ja existe. Se existir, adicionar link no topo ou numa seccao "Project Structure". Se nao existir, apenas criar o link num comentario no FOLDER-STRUCTURE.md como nota.

**Sem CodeRabbit:** `coderabbit_integration` nao configurado — qualidade validada por @po manualmente.

## Change Log

| Data | Agente | Accao |
|------|--------|-------|
| 2026-06-25 | @sm (River) | Story criada — Draft |
