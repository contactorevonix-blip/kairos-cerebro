# Story FWSYNC.1 — AIOX Core Sync Integrity: Triage & Repair

**ID:** FWSYNC.1 | **Epic:** Standalone (Framework Maintenance) | **Status:** Draft | **Points:** 5sp | **Type:** CREATE

---

## Summary

O `npm test` falha em **5 de 385 testes** (e nunca passou limpo) devido a dívida de integridade pré-existente: **16 `require()` internos partidos** em `.aiox-core/core/` e `.aiox-core/infrastructure/scripts/` (resultado de sync parcial do repositório oficial `SynkraAI/aiox-core`) e **5 testes órfãos** cujos módulos foram deliberadamente removidos no commit `69d6b50`. Nenhum destes problemas afecta o fluxo activo (hooks por-prompt funcionam; EPIC-82 está em andamento), mas bloqueiam o pre-push gate e impedem `npm test` de ser um sinal fiável.

Esta story realiza a **triagem e correcção** — compara o estado local com o oficial, toma decisões por gap (restaurar / remover / documentar dormente), resolve os testes órfãos e verifica `npm test` 0 falhas num checkout limpo.

**Não bloqueia** Story 82.x (independente, dívida pré-existente a Cont 84).

---

## Story

**As the** AIOX framework steward (Pedro),  
**I want** `.aiox-core/core/` e `.aiox-core/infrastructure/scripts/` limpos e coerentes (sem `require()` partidos, sem testes órfãos a referenciar módulos removidos),  
**so that** `npm test` passe 100% limpo num checkout fresco, o pre-push gate deixe de tropeçar nesta dívida e os resultados de teste voltem a ser um sinal fiável para o resto do projecto.

---

## Acceptance Criteria

1. **AC1 — Gap list produzido**
   - Uma comparação ficheiro-a-ficheiro de `.aiox-core/core/` e `.aiox-core/infrastructure/scripts/` local vs `github.com/SynkraAI/aiox-core` (main) está documentada no Dev Agent Record desta story.
   - Método: `gh api repos/SynkraAI/aiox-core/contents/.aiox-core/core --paginate` (e `/infrastructure/scripts`) para enumerar a árvore oficial; comparar com o estado local.
   - Output: tabela com colunas `Ficheiro | Local | Oficial | Diferença` para cada path em falta ou divergente.

2. **AC2 — Triagem decidida para cada um dos 16 `require()` partidos**
   - Para cada um dos 16 requires partidos identificados no audit report (ver Dev Notes), uma decisão é tomada: **restaurar do oficial** / **remover ficheiro local** / **deixar dormente + documentado**.
   - Critério de decisão: se o ficheiro que faz o `require()` é carregado por algum hook activo (`grep -r "require.*{ficheiro}"` em `.claude/hooks/`), restaurar; caso contrário, remover ou documentar como dormente.
   - Decisões documentadas no Dev Agent Record com justificação.

3. **AC3 — Decisões de triagem aplicadas**
   - Ficheiros marcados **restaurar**: copiados do oficial via `gh api repos/SynkraAI/aiox-core/contents/{path}` (base64 decode).
   - Ficheiros marcados **remover**: `git rm` do ficheiro local morto (o ficheiro que continha o `require()` partido, ou o próprio ficheiro em falta se órfão).
   - Ficheiros marcados **dormente**: entrada adicionada em `docs/qa/framework-dormant.md` com path, motivo e data.

4. **AC4 — Bug `permissions/index.js` corrigido**
   - O `require('./.aiox-core/core/permissions')` (path auto-referência mal-formado em `core/permissions/index.js`) é corrigido para um path relativo válido ou o `require` é removido se a dependência circular não existe.
   - Nota: este ficheiro é L1. Ver Constraints abaixo.

5. **AC5 — Testes órfãos resolvidos (Epic 5.3)**
   - Os 5 testes que falham são tratados por uma de duas opções (ver `[DECISION POINT]` em Dev Notes):
     - **Opção A — Skip-guard:** `existsSync` check antes do `require()` + `test.skip` se módulo ausente. Reversível. Preserva os 7 testes mock válidos em `engine.test.js`.
     - **Opção B — Remover:** Apagar `tests/context-registry/registry.test.js` inteiro; remover as 4 test-cases que falham em `tests/auto-contextualization/engine.test.js` (preservando os 7 mock-based).
   - A opção escolhida é documentada no Dev Agent Record com justificação (`[DECISION] Epic 5.3 — dormente ou morta?`).

6. **AC6 — `npm test` passa limpo**
   - `npm test` reporta **0 fail**, ≥380 pass num ambiente com `git checkout` limpo + `npm install`.
   - Output final do comando incluído no Dev Agent Record.

7. **AC7 — Pre-push gate sem trips de integridade**
   - `enforce-quality-gates.cjs` não bloqueia por nenhuma das causas de integridade identificadas no audit.
   - Verificação: `node tests/hooks/enforcement.test.js` PASS (sem regressões nos 39+ testes existentes).

---

## Scope

### IN

- Comparação local vs oficial de `.aiox-core/core/` e `.aiox-core/infrastructure/scripts/` (via `gh api`)
- Triagem dos 16 `require()` partidos identificados no audit report
- Aplicação das decisões (restaurar / remover / documentar)
- Correcção do bug `core/permissions/index.js` self-reference
- Resolução dos 5 testes órfãos (Epic 5.3): `tests/auto-contextualization/engine.test.js` + `tests/context-registry/registry.test.js`
- Criação ou actualização de `docs/qa/framework-dormant.md` para os ficheiros marcados "dormente"

### OUT

- Restauração completa de toda a pasta `pro/` do oficial (fora de scope; é uma subpasta grande e não-activa localmente)
- Feature work em qualquer subsistema afectado (memory, executors, synapse-memory-provider)
- EPIC-13 (constitutional enforcement hardening) — relacionado mas independente
- EPIC-82 (SYNAPSE Dynamic Injection) — independente, não bloqueado
- Qualquer modificação ao product code de Kairos Check (esta story é 100% framework maintenance)

---

## Dependencies

**Prerequisite Stories:**
- Story 82.2 Done/PASS/pushed (entregue antes de Cont 84; não bloqueia, mas convém não ter L1 deny rules em conflito simultâneo)

**Artefactos:**
- `docs/qa/audits/2026-06-27-aiox-framework-integrity-audit.md` — audit report primário (lista dos 16 requires + 2 testes órfãos)
- `github.com/SynkraAI/aiox-core` (PUBLIC, main) — fonte de verdade para restaurar ficheiros
- `git log --oneline | grep 69d6b50` — rationale do cleanup que removeu os módulos Epic 5.3

**Ferramentas:**
- `gh api repos/SynkraAI/aiox-core/contents/{path}` — leitura da árvore oficial
- `node -e "Buffer.from('{b64}','base64').toString()"` — decode de ficheiros do API
- `npm test` — validação final (0 fail)

---

## Constraints (L1 Friction — Padrão Recorrente)

**Atenção:** `.aiox-core/core/**` e `.aiox-core/infrastructure/scripts/**` são **Layer 1** (Art. VII, Constitution). Três camadas de protecção:

1. `settings.json` deny rules — bloqueia Write/Edit directos
2. Hook `enforce-quality-gates.cjs` — bloqueia na pre-tool-use layer
3. Husky pre-commit gate — bloqueia commits de L1 sem override

**Paths de resolução (escolher 1):**

- **Path A (recomendado para ficheiros a REMOVER):** `git rm` não é Write/Edit — o deny rule pode não aplicar. Testar primeiro sem lift.
- **Path B (para ficheiros a RESTAURAR/EDITAR):** Pedro levanta manualmente o deny rule em `.claude/settings.json` para a sessão (como em Story 82.2). Comunicar ao Pedro antes de começar Task 3.
- **Path C (formal):** `@aiox-master *propose-modification` — mais lento, para alterações estruturais permanentes.

Este padrão é recorrente (Story 82.1, 82.2, esta story). Ver `STATE.md` para o procedimento já estabelecido.

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| `npm test` confiável | 0 falhas = gate de qualidade volta a ser sinal real (não ruído) |
| Pre-push desbloqueado | O gate deixa de tropeçar em dívida pré-existente irrelevante |
| Manutenção futura | Sync futuro com SynkraAI/aiox-core parte de base limpa |
| Esforço baixo | 5sp; nenhuma feature nova; pure cleanup |

---

## Risks & Mitigations

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| L1 deny rules bloqueiam @dev em ficheiros a restaurar | Alta | Médio | Pedro levanta deny rule (procedimento já estabelecido em 82.2) |
| Restaurar ficheiros do oficial introduz novos require() partidos em cadeia | Média | Baixo | Testar com `npm test` após cada restauro; restaurar ficheiros de dependência primeiro |
| Epic 5.3 skip-guard é revertido se Epic 5.3 for revivida | Baixa | Baixo | Skip-guard é reversível por design; `existsSync` é removível sem lógica |
| `gh api` rate limit durante comparação exaustiva | Baixa | Baixo | Usar `--paginate`; autenticar com `gh auth login` se anónimo |

---

## Definition of Done

- [ ] AC1: Gap list documentado no Dev Agent Record
- [ ] AC2: Triagem decidida para todos os 16 requires partidos
- [ ] AC3: Decisões aplicadas (restaurar/remover/documentar)
- [ ] AC4: `permissions/index.js` bug corrigido
- [ ] AC5: Testes órfãos resolvidos (opção documentada)
- [ ] AC6: `npm test` → 0 fail, ≥380 pass
- [ ] AC7: `enforcement.test.js` PASS sem regressões
- [ ] Story status: InReview → @qa gate

---

## Tasks / Subtasks

- [ ] **Task 1 — Comparação local vs oficial (AC1)**
  - [ ] 1.1 Enumerar árvore oficial: `gh api repos/SynkraAI/aiox-core/contents/.aiox-core/core --paginate`
  - [ ] 1.2 Enumerar árvore local: `find .aiox-core/core -type f -name "*.js" | sort`
  - [ ] 1.3 Repetir para `infrastructure/scripts/`
  - [ ] 1.4 Produzir tabela de gaps e registar no Dev Agent Record

- [ ] **Task 2 — Triagem dos 16 requires (AC2)**
  - [ ] 2.1 Para cada require partido (lista em Dev Notes), verificar se o ficheiro consumidor está activo: `grep -r "require.*{ficheiro}" .claude/hooks/`
  - [ ] 2.2 Decidir: restaurar / remover / dormente
  - [ ] 2.3 Documentar decisão no Dev Agent Record

- [ ] **Task 3 — Aplicar decisões (AC3)**
  - [ ] 3.1 Comunicar a Pedro quais ficheiros L1 precisam de lift do deny rule (se aplicável)
  - [ ] 3.2 Restaurar: `gh api` → base64 decode → Write ao path local
  - [ ] 3.3 Remover: `git rm` dos ficheiros mortos
  - [ ] 3.4 Documentar dormentes em `docs/qa/framework-dormant.md`

- [ ] **Task 4 — Fix `permissions/index.js` (AC4)**
  - [ ] 4.1 Ler ficheiro: verificar o `require('./.aiox-core/core/permissions')` actual
  - [ ] 4.2 Se auto-referência: remover o require circular ou substituir por path relativo correcto (e.g., `'../permissions'` se já está em `core/permissions/`)
  - [ ] 4.3 Nota: L1 — coordenar com Task 3.1

- [ ] **Task 5 — Resolver testes órfãos Epic 5.3 (AC5)**
  - [ ] 5.1 Ler `git log --oneline | grep 69d6b50` → confirmar rationale do cleanup
  - [ ] 5.2 Decidir Opção A (skip-guard) ou Opção B (remover) — ver `[DECISION POINT]` em Dev Notes
  - [ ] 5.3 Aplicar decisão em `tests/auto-contextualization/engine.test.js` e `tests/context-registry/registry.test.js`

- [ ] **Task 6 — Verificação final (AC6 + AC7)**
  - [ ] 6.1 `npm test` → confirmar 0 fail
  - [ ] 6.2 `node tests/hooks/enforcement.test.js` → confirmar PASS sem regressões
  - [ ] 6.3 Registar output de `npm test` no Dev Agent Record

---

## Dev Notes

### Audit Report — Referência Primária

**Ficheiro:** `docs/qa/audits/2026-06-27-aiox-framework-integrity-audit.md`

Lê este ficheiro completo antes de começar. Contém:
- Lista exacta dos 16 ficheiros com `require()` partidos (Finding 1)
- Detalhe dos 5 testes órfãos e seus módulos removidos (Finding 2)
- Causa raiz: sync parcial do `SynkraAI/aiox-core` (pastas sincronizadas, ficheiros internos em falta)

### Os 16 `require()` partidos (da auditoria)

| Ficheiro (local) | Require() partido | Causa |
|------------------|-------------------|-------|
| `core/config/config-loader.js` | `./agent-config-loader` | não sincronizado |
| `core/execution/context-injector.js` | `../memory/memory-query` | `memory/` parcial |
| `core/execution/context-injector.js` | `../memory/session-memory` | `memory/` parcial |
| `core/execution/subagent-dispatcher.js` | `../memory/memory-query` | `memory/` parcial |
| `core/orchestration/executors/epic-4-executor.js` | `infrastructure/scripts/plan-tracker` | não sincronizado |
| `core/orchestration/executors/epic-4-executor.js` | `infrastructure/scripts/subtask-verifier` | não sincronizado |
| `core/orchestration/executors/epic-5-executor.js` | `infrastructure/scripts/stuck-detector` | não sincronizado |
| `core/orchestration/executors/epic-5-executor.js` | `infrastructure/scripts/rollback-manager` | não sincronizado |
| `core/orchestration/executors/epic-6-executor.js` | `infrastructure/scripts/qa-loop-orchestrator` | não sincronizado |
| `core/permissions/index.js` | `./.aiox-core/core/permissions` | path auto-referência (BUG) |
| `core/synapse/memory/synapse-memory-provider.js` | `../../../../pro/memory/memory-loader` | pasta `pro/` ausente localmente |
| `infrastructure/scripts/component-generator.js` | `./component-preview` | não sincronizado |
| `infrastructure/scripts/component-generator.js` | `./manifest-preview` | não sincronizado |
| `infrastructure/scripts/component-metadata.js` | `../../memory` | não sincronizado |
| `infrastructure/scripts/config-loader.js` | `./agent-config-loader` | não sincronizado |
| `infrastructure/scripts/improvement-validator.js` | `./dependency-manager` | não sincronizado |

**Nota sobre `pro/`:** A pasta `pro/` existe no oficial mas NÃO localmente. Restaurar `pro/memory/memory-loader.js` pode ser suficiente para o `synapse-memory-provider.js`, mas verificar se `pro/` tem mais dependências antes de restaurar só 1 ficheiro.

### [DECISION POINT] Epic 5.3 — dormente ou morta?

Antes de resolver AC5, determinar o estado real da Epic 5.3 (auto-contextualization):

```bash
git log --oneline | grep 69d6b50
git show 69d6b50 --stat | head -20
```

**Opção A — Skip-guard (dormente, reversível):**
- Preferida se Epic 5.3 pode ser revivida no futuro
- Em `tests/auto-contextualization/engine.test.js`: adicionar no topo
  ```js
  const { existsSync } = require('fs');
  const phase4Exists = existsSync('.synapse/context-engine/phases/phase4-validation.js');
  const phase5Exists = existsSync('.synapse/context-engine/phases/phase5-ids-check.js');
  ```
  e nos 4 tests que falham: `if (!phase4Exists) { test.skip(...); return; }`
- Em `tests/context-registry/registry.test.js`: skip-guard completo no topo
- Preserva os 7 testes mock que PASSAM em `engine.test.js`

**Opção B — Remover (morta, alinha com 69d6b50):**
- Preferida se o commit `69d6b50` teve intenção explícita de abandonar Epic 5.3
- Remover `tests/context-registry/registry.test.js` inteiramente
- Em `tests/auto-contextualization/engine.test.js`: remover apenas os 4 test-cases que fazem `require()` real (preservar os 7 mock-based)

**Documentar a decisão tomada** no Dev Agent Record com referência ao commit `69d6b50`.

### L1 Friction — Procedimento Estabelecido

Ver `STATE.md` + histórico de Story 82.1/82.2 para o procedimento de lift do deny rule em `.claude/settings.json`. O pattern é:
1. @dev lista os ficheiros L1 a modificar
2. Pedro levanta manualmente o deny rule
3. @dev aplica os diffs (staged)
4. Husky bloqueia commit → @devops faz o commit + push
5. Pedro repõe o deny rule

**Para ficheiros a REMOVER** (`git rm`): testar primeiro sem lift — a deny rule aplica-se a Write/Edit, não necessariamente a delete.

### Testing

- **Framework:** `node:test` (nativo Node.js) — igual ao padrão do projecto
- **Run:** `npm test` (jest? confirmar em `package.json`; o audit diz 385 testes totais)
- **Target:** 0 fail após esta story
- **Regressão:** `node tests/hooks/enforcement.test.js` — 39+ tests, todos devem continuar PASS

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-27 | 1.0 | Story criada (Draft) — audit Cont 84, 5 falhas npm test | @sm (River) |

---

## Dev Agent Record

*(Preenchido por @dev durante implementação)*

### Agent Model Used

### Debug Log References

### Gap List (AC1 output)

### Triage Decisions (AC2 output)

| Ficheiro | Require() | Decisão | Justificação |
|----------|-----------|---------|--------------|
| ... | ... | restaurar / remover / dormente | ... |

### [DECISION] Epic 5.3

**Opção escolhida:** *(A ou B)*
**Justificação:** *(referência ao git log 69d6b50)*

### Completion Notes

### `npm test` Final Output (AC6)

```
# colar output aqui
```

### File List

*(ficheiros criados/modificados/removidos)*
