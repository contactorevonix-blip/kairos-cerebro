# Story SCP-MVP.7 — Degradação Limpa

**ID:** SCP-MVP.7 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 4sp | **Type:** ADAPT (validação, não código novo — o socket `on_not_detected`/`on_partial` já existe)
**Source:** PRD FR-17, G16 | **README:** §Desinstalar

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** confirmação testada e documentada de que remover `squads/squad-creator-pro/` faz o
`squad-chief.md` base degradar limpo para `pro_mode=false` (sem file-not-found, sem crash, sem estado
inconsistente),
**so that** instalar/desinstalar o Pro seja seguro e reversível, tal como o README anuncia
("Desinstalar") e o NFR-5 exige.

---

## Acceptance Criteria

1. **AC1 — Teste real de remoção (não simulação teórica)**
   - Com o MVP completo (SCP-MVP.1-.6 Done), `squads/squad-creator-pro/` é temporariamente
     renomeado/movido (não apagado permanentemente sem backup — reversibilidade do próprio teste) para
     simular a ausência.
   - `squad-chief.md` é invocado/testado neste estado — confirma-se que `pro_detection.check_path`
     não encontra `config.yaml`, e `on_not_detected` dispara: `pro_mode: false`, uso exclusivo das 24
     tasks base, workflows base (`create-squad.yaml`, `validate-squad.yaml`), indicador `[PRO]` visível
     nos comandos que seriam exclusivos.

2. **AC2 — Zero file-not-found / zero crash**
   - Nenhum erro de "module not found" / "file not found" / excepção não tratada ocorre durante o
     teste de remoção. Qualquer referência residual a `squads/squad-creator-pro/` (se existir) falha
     graciosamente com a mensagem `response_template` já definida no socket (linhas 135-158 de
     `squad-chief.md`), não com um erro técnico cru.

3. **AC3 — Teste do caso `on_partial` (instalação incompleta)**
   - Além do caso "ausência total" (AC1), testar também o caso **parcial**: remover só 1 das 3 pastas
     obrigatórias (`agents/`, `tasks/`, ou `workflows/`) mantendo `config.yaml` — confirma-se que
     `on_partial` dispara (`pro_mode: false` + warning com `{missing_paths}` preenchido correctamente,
     não um placeholder literal `{missing_paths}` sem substituição).

4. **AC4 — Restauro pós-teste**
   - Depois dos testes AC1/AC3, `squads/squad-creator-pro/` é restaurado ao estado completo (resultado
     de SCP-MVP.1-.6) — o teste de degradação não deixa o repositório num estado degradado
     permanentemente.
   - `git status --short` final confirma que `squads/squad-creator-pro/` está no mesmo estado de
     conteúdo que tinha antes desta story começar (só ficheiros de relatório/prova são novos, se
     aplicável).

5. **AC5 — Base permanece intocado durante todo o processo**
   - `git status --short` confirma que nenhum ficheiro de `squads/squad-creator/` (incl.
     `squad-chief.md`) é alterado por esta story, em nenhum momento (nem durante os testes, nem depois).

6. **AC6 — Relatório de degradação documentado**
   - Um relatório curto (no Dev Agent Record, ou em
     `squads/squad-creator-pro/_mvp-validation/degradation-report.md`) resume: os 2 cenários testados
     (ausência total, parcial), o output exacto observado em cada, e a confirmação de que ambos
     degradam sem quebrar o base.

---

## Scope

### IN
- Teste real (mover/restaurar) da pasta `squads/squad-creator-pro/`
- Documentação do resultado

### OUT
- Qualquer mudança de código ao mecanismo `on_not_detected`/`on_partial` (já existe no base, NFR-6 —
  esta story só valida, não implementa)
- Suite de testes automatizada permanente (D3, Fase 3 — esta é uma validação manual/pontual da Fase 1)

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.6 Done** — testar a degradação de um pack incompleto (scaffold) prova menos do que testar
  a degradação do MVP completo e funcional.

**Artefactos:**
- `squads/squad-creator/agents/squad-chief.md` linhas 63-83 (`on_partial`, `on_not_detected` — read-only)

---

## Tasks / Subtasks

- [ ] **Task 1 — Backup/preparação**
  - [ ] 1.1 Confirmar `squads/squad-creator-pro/` está completo (SCP-MVP.6 Done)
  - [ ] 1.2 Preparar mecanismo reversível de remoção (mover para fora do repo temporariamente, ou
        renomear a pasta)

- [ ] **Task 2 — Testar ausência total (AC1, AC2)**
  - [ ] 2.1 Remover/mover a pasta
  - [ ] 2.2 Invocar/testar squad-chief, capturar output
  - [ ] 2.3 Confirmar `pro_mode: false`, zero crash

- [ ] **Task 3 — Testar caso parcial (AC3)**
  - [ ] 3.1 Restaurar a pasta completa, depois remover só 1 subpasta obrigatória
  - [ ] 3.2 Confirmar `on_partial`, warning com `{missing_paths}` substituído correctamente

- [ ] **Task 4 — Restaurar estado final (AC4)**
  - [ ] 4.1 Repor `squads/squad-creator-pro/` completo
  - [ ] 4.2 `git status --short` — confirmar conteúdo igual ao pré-story

- [ ] **Task 5 — Relatório + verificação do base (AC5, AC6)**
  - [ ] 5.1 Escrever o relatório de degradação
  - [ ] 5.2 Confirmar base intocado em todo o processo

---

## Dev Notes

### `on_not_detected` / `on_partial` (fonte: `squad-chief.md` L63-83, ler o ficheiro real antes de testar)
```yaml
on_partial:
  pro_mode: false
  warning: "Pro config.yaml found but installation incomplete (missing: {missing_paths}). Falling back to base mode."

on_not_detected:
  pro_mode: false
  actions:
    - "Use base tasks only (24 tasks)"
    - "Use base workflows only (create-squad.yaml, validate-squad.yaml) and behavioral commands"
    - "Show [PRO] indicator on pro-only commands"
    - "Show upgrade prompt when pro features requested"
```
Confirmar que `{missing_paths}` é de facto substituído por um valor real (ex.: "agents/") no output
observado — não um placeholder literal por template mal resolvido.

### Testing

- Esta story É o teste (validação manual pontual da Fase 1) — não há uma segunda camada de testes
  automatizados sobre ela (essa é a suite completa da Fase 3, D3, fora desta epic).

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
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-17/G16. Inclui teste do caso `on_partial` além da ausência total (AC3), não mencionado explicitamente pelo coordenador mas coberto pelo próprio mecanismo do socket — reforça NFR-5 (degradação não-destrutiva) com mais rigor do que só o caso binário. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Teste reversível (mover/restaurar, não apagar) respeita NEVER-003. `on_partial`/`on_not_detected` confirmados no socket (L63-83). Cobre ausência total + parcial. | @po (Pax) |
