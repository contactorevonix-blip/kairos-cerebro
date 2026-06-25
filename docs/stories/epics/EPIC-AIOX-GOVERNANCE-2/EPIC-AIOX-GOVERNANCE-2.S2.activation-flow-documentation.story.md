# Story EPIC-AIOX-GOVERNANCE-2.S2: Activation Flow Documentation

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "Revisao manual: fluxo descrito corresponde ao comportamento real do sistema"
  - "Verificar que code examples sao executaveis (nao inventados)"
```

## Story

**As a** developer que quer criar ou modificar um agente KAIROS_CEREBRO,
**I want** documentacao clara do fluxo de activacao shim → skill → fallback,
**so that** sei exactamente qual ficheiro editar, qual a ordem de carregamento, e o que acontece quando um shim falha — sem ter de ler o codigo fonte dos hooks.

## Epic Context

- **Epic:** EPIC-AIOX-GOVERNANCE-2 — AIOX Governance Documentation & Organization
- **PRD:** `docs/PRDs/PORD-AIOX-Governance-Documentation.md` — FR-2
- **Story Points:** 3
- **Complexidade:** S (documentacao com diagrama ASCII — sem codigo novo)
- **Depends on:** nenhuma (paralela a S1 e S4)
- **Bloqueia:** nenhuma
- **Tipo:** Documentacao pura (markdown + diagrama ASCII)

## Acceptance Criteria

1. Ficheiro `.claude/.docs/AGENT-ACTIVATION-FLOW.md` criado com diagrama de fluxo e prosa explicativa.
2. Fluxo shim → skill → fallback documentado com diagrama ASCII step-by-step (mínimo 5 passos, conforme exemplo do PRD).
3. Logica do circuit breaker documentada: o que acontece quando o shim nao encontra o SKILL.md (fallback para `.claude/agents/*.md`).
4. Code examples concretos fornecidos para criar um novo agente correctamente (mostrando os 3 ficheiros necessarios: agent, command/shim, skill).
5. @qa valida clareza e correcteza: qualquer developer consegue seguir o guia para criar um agente sem ambiguidade.

## Tasks / Subtasks

- [ ] Verificar o fluxo real lendo `.claude/commands/AIOX/agents/sm.md` (exemplo de shim existente) (AC: 2)
- [ ] Verificar o SKILL.md canonico correspondente em `.claude/skills/AIOX/agents/sm/SKILL.md` (AC: 2)
- [ ] Criar pasta `.claude/.docs/` se nao existir (AC: 1)
- [ ] Criar diagrama ASCII do fluxo de activacao (AC: 2)
- [ ] Documentar circuit breaker (AC: 3)
- [ ] Escrever code examples para criacao de novo agente (AC: 4)
  - [ ] Exemplo: `.claude/agents/meu-agente.md` (definicao de persona)
  - [ ] Exemplo: `.claude/commands/AIOX/agents/meu-agente.md` (shim)
  - [ ] Exemplo: `.claude/skills/AIOX/agents/meu-agente/SKILL.md` (canonico)
- [ ] Criar `.claude/.docs/AGENT-ACTIVATION-FLOW.md` com todos os elementos acima (AC: 1, 5)

## File List

```
(vazio — a preencher pelo @dev durante implementacao)
```

## Dev Notes

**Fluxo a documentar (do PRD FR-2):**
```
1. User types: /AIOX:agents:squad-chief
   ↓
2. Legacy shim loads: .claude/commands/AIOX/agents/squad-chief.md
   ↓
3. Shim header redirects: "Read .claude/skills/AIOX/agents/squad-chief/SKILL.md"
   ↓
4. Skill payload executes (canonical activation)
   ↓
5. Agent persona loaded from .claude/agents/squad-chief.md (fallback)
```

**Ficheiros de referencia para verificacao:**
- `.claude/commands/AIOX/agents/sm.md` — shim real do @sm (River), ler para extrair o padrao exacto
- `.claude/skills/AIOX/agents/sm/SKILL.md` — skill canonico correspondente
- `.claude/agents/aiox-sm.md` — definicao de persona (se existir)

**Razao das 3 camadas (do PRD):** backward compatibility — utilizadores com `/AIOX:agents:*` guardados continuam a funcionar enquanto os skills canonicos evoluem.

**Circuit breaker:** quando SKILL.md nao existe, o shim deve ter fallback para o `.claude/agents/*.md` equivalente. Documentar exactamente quando isto acontece.

**Sem CodeRabbit:** `coderabbit_integration` nao configurado — qualidade validada por @qa manualmente.

## Change Log

| Data | Agente | Accao |
|------|--------|-------|
| 2026-06-25 | @sm (River) | Story criada — Draft |
