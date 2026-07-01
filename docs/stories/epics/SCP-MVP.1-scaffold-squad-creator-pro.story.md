# Story SCP-MVP.1 — Scaffold `squads/squad-creator-pro/`

**ID:** SCP-MVP.1 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 4sp | **Type:** CREATE (novo L4, sem match existente)
**Source:** PRD FR-15, G14 (Gap Analysis) | **Reference:** `squads/squad-creator/agents/squad-chief.md` L53-100 (`pro_detection`)

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** a estrutura mínima honesta de `squads/squad-creator-pro/` (config.yaml + `agents/`,
`tasks/`, `workflows/` não-vazios), com stubs claramente identificados como scaffold (não a versão
final rica das stories seguintes),
**so that** o socket `pro_detection` do `squad-chief.md` base consiga passar o `integrity_check` sem
qualquer edição ao base, preparando o terreno para as stories SCP-MVP.2-.6 preencherem o conteúdo real.

---

## Acceptance Criteria

1. **AC1 — `squads/squad-creator-pro/config.yaml` existe**
   - Contém, no mínimo: `squad: squad-creator-pro`, `version`, uma referência a `extends:` ou
     `base: squad-creator` (documentando a relação com o base, sem inventar um schema não suportado
     pelo socket — o socket só lê `check_path` e `integrity_check`, não valida o conteúdo interno de
     `config.yaml` além da sua existência).
   - O ficheiro declara explicitamente `scaffold_stage: true` (ou campo equivalente) — um marcador
     honesto de que o conteúdo ainda não é o final (removido/actualizado por SCP-MVP.6 quando a Fase 1
     estiver completa).

2. **AC2 — `squads/squad-creator-pro/agents/` não-vazio**
   - Contém pelo menos 1 ficheiro (pode ser um placeholder mínimo, ex.: um `.gitkeep`-like stub com
     nota explícita "preenchido por SCP-MVP.2/SCP-MVP.3" — não um agente falso a fingir estar completo).
   - Não contém `oalanicolas.md`/`pedro-valerio.md` "vazios" que pareçam finais — se um placeholder
     usar esses nomes, tem de ter um cabeçalho `<!-- SCAFFOLD STUB — ver SCP-MVP.2/.3 -->` inequívoco.

3. **AC3 — `squads/squad-creator-pro/tasks/` e `workflows/` não-vazios**
   - Mesma lógica do AC2: placeholders honestos, não conteúdo final.
   - `workflows/` inclui, no mínimo, um stub identificando os 5 nomes que o `command_override_map` do
     base espera (`wf-create-squad.yaml`, `wf-research-then-create-agent.yaml`,
     `wf-discover-tools.yaml`, `wf-brownfield-upgrade-squad.yaml`, `validate-squad.yaml`) — o conteúdo
     REAL desses workflows é scope de SCP-MVP.6 (só `validate-squad.yaml` precisa de ficar funcional
     no MVP, per PRD "Prova de sucesso"); aqui basta que os nomes existam para não quebrar o
     `command_override_map` se invocado prematuramente (falha controlada, não crash).

4. **AC4 — `integrity_check` passa**
   - Confirmação manual (leitura da lógica declarada em `squad-chief.md` `pro_detection.integrity_check`,
     linhas 57-65): `required_paths` = `agents/`, `tasks/`, `workflows/` — todas existem e não estão
     vazias após esta story.
   - Documentar no Dev Agent Record o resultado da verificação (lista de ficheiros em cada pasta).

5. **AC5 — Zero edição ao base**
   - `git status --short` (ou `git diff --stat`) confirma que **nenhum** ficheiro fora de
     `squads/squad-creator-pro/` é alterado por esta story — em particular,
     `squads/squad-creator/agents/squad-chief.md` fica byte-idêntico ao HEAD antes desta story.

6. **AC6 — Estrutura adicional prevista pelo PRD (config/)**
   - `squads/squad-creator-pro/config/` é criada (mesmo vazia ou com 1 placeholder) — usada pelas
     stories SCP-MVP.4 (axiomas) e possivelmente outras; o socket não a exige para `integrity_check`,
     mas o PRD (G7, FR-8) prevê "10 meta-axiomas... em `config/`".

---

## Scope

### IN
- `squads/squad-creator-pro/config.yaml`
- `squads/squad-creator-pro/agents/`, `tasks/`, `workflows/`, `config/` — estrutura + placeholders
  honestos

### OUT
- Conteúdo real dos agentes encarnados — SCP-MVP.2, SCP-MVP.3
- Conteúdo real dos workflows/axiomas — SCP-MVP.4, SCP-MVP.5, SCP-MVP.6
- Qualquer edição a `squads/squad-creator/` (base)

---

## Dependencies

**Prerequisite Stories:** Nenhuma (primeira story da epic).

**Artefactos:**
- `squads/squad-creator/agents/squad-chief.md` linhas 50-100 (ler `pro_detection` — não editar)
- `docs/prd/squad-creator-pro-recreation-PRD.md` FR-15, G14

---

## Tasks / Subtasks

- [ ] **Task 1 — Ler o socket (referência, read-only)**
  - [ ] 1.1 Ler `squads/squad-creator/agents/squad-chief.md` linhas 50-100 (`pro_detection` completo)
  - [ ] 1.2 Confirmar `required_paths` e `command_override_map` exactos (não assumir da memória — ler
        o ficheiro real, pode ter mudado)

- [ ] **Task 2 — Criar `config.yaml` (AC1)**
  - [ ] 2.1 Escrever `squads/squad-creator-pro/config.yaml` com `scaffold_stage: true`

- [ ] **Task 3 — Criar `agents/`, `tasks/`, `workflows/`, `config/` (AC2, AC3, AC6)**
  - [ ] 3.1 Criar as 4 pastas com placeholders honestos rotulados como scaffold

- [ ] **Task 4 — Verificar `integrity_check` (AC4)**
  - [ ] 4.1 Confirmar as 3 `required_paths` não-vazias, registar no Dev Agent Record

- [ ] **Task 5 — Verificação final (AC5)**
  - [ ] 5.1 `git status --short` — confirmar só `squads/squad-creator-pro/**` alterado

---

## Dev Notes

### `pro_detection.integrity_check` (fonte: `squad-chief.md` L57-65, ler o ficheiro real antes de implementar)
```yaml
integrity_check:
  required_paths:
    - "squads/squad-creator-pro/agents/"
    - "squads/squad-creator-pro/tasks/"
    - "squads/squad-creator-pro/workflows/"
  on_partial:
    pro_mode: false
    warning: "Pro config.yaml found but installation incomplete..."
```
Nota: `config/` **não está** em `required_paths` — não é exigida pelo socket, mas o PRD prevê o seu
uso para os axiomas (FR-8). Criá-la aqui evita retrabalho estrutural em SCP-MVP.4.

### `command_override_map` (fonte: `squad-chief.md` L85-90)
```yaml
command_override_map:
  create-squad: "squads/squad-creator-pro/workflows/wf-create-squad.yaml"
  create-agent: "squads/squad-creator-pro/workflows/wf-research-then-create-agent.yaml"
  discover-tools: "squads/squad-creator-pro/workflows/wf-discover-tools.yaml"
  upgrade-squad: "squads/squad-creator-pro/workflows/wf-brownfield-upgrade-squad.yaml"
  validate-squad: "squads/squad-creator-pro/workflows/validate-squad.yaml"
```

### Risco documentado na epic
O `integrity_check` só verifica pastas não-vazias — assim que esta story terminar, `pro_mode=true`
provavelmente já activa (mesmo com stubs). Isso é esperado e aceitável para o MVP incremental, desde
que os stubs sejam honestos (não fingam funcionalidade que só chega em SCP-MVP.2-.6). Documentar este
comportamento no Dev Agent Record para não surpreender o @po/@qa mais tarde.

### Testing

- Sem testes automatizados. Verificação: leitura manual da lógica do socket + confirmação de que as
  pastas/ficheiros existem (`ls`/`Glob`) + `git status --short`.

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-15/G14. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Socket `integrity_check`/`command_override_map` verificados byte a byte; ausência de `squad-creator-pro/` confirmada (CREATE legítimo). | @po (Pax) |
