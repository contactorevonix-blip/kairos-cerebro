# Story SQUAD-FUSION.3 — Preserve & Verify Mind-Cloning Core Assets

**ID:** SQUAD-FUSION.3 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 2sp | **Type:** ADAPT (verificação, sem escrita de produto)
**Source:** `squads/squad-creator/` local (B) — Brief §3.2

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** um baseline verificado (checksums + inventário) dos assets únicos de mind-cloning do
squad-creator local, capturado ANTES de qualquer merge de configuração ou reconciliação de colisões,
**so that** SQUAD-FUSION.6 e SQUAD-FUSION.7 tenham uma referência objectiva para provar que
`core/*.js`, `outputs/minds/**` e os artefactos de mind-cloning nunca foram sobrescritos — cumprindo o
Constraint #1 da epic (Art. IV-A: ADAPT, nunca overwrite destes paths).

---

## Acceptance Criteria

1. **AC1 — Inventário + checksum dos 7 ficheiros `core/*.js`**
   - É gerado um ficheiro `squads/squad-creator/_fusion-baseline/core-checksums.txt` com o output de
     `sha256sum` (ou equivalente `Get-FileHash`) para cada um dos 7 ficheiros:
     `authority-matrix.js`, `kb-assembler.js`, `rules-inheritor.js`, `skill-validator.js`,
     `squad-template-generator.js`, `thinking-dna.js`, `voice-dna.js`.
   - Este ficheiro é a referência que SQUAD-FUSION.7 (AC de verificação final) vai comparar contra o
     estado pós-fusão — checksums devem ser idênticos.

2. **AC2 — Inventário + checksum de `outputs/minds/`**
   - `squads/squad-creator/_fusion-baseline/minds-checksums.txt` regista o checksum de
     `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` (e qualquer outro
     ficheiro dentro de `outputs/minds/`, se existirem mais além do listado no brief).

3. **AC3 — Inventário dos artefactos de mind-cloning sem equivalente em C**
   - `squads/squad-creator/_fusion-baseline/mind-artifacts-inventory.md` lista, com path completo e
     checksum:
     - `config/model-routing.yaml`
     - Tasks: `analyze-synkra-repos.md`, `clone-synkra-approved.md`, `collect-sources.md`,
       `curate-synkra-content.md`, `extract-thinking-dna.md`, `extract-voice-dna.md`,
       `mind-research-loop.md`
     - `workflows/wf-clone-mind.yaml`
     - `checklists/mind-validation.md`
     - `memory/MEMORY.md`
   - Cada entrada indica se o ficheiro **colide por nome** com algo em C (nenhum destes 10 colide,
     segundo o brief §3.3 — confirmar aqui, não assumir).

4. **AC4 — Smoke test de leitura do mind DNA (sem escrita)**
   - É confirmado que `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` é YAML
     válido (`node -e "require('js-yaml').load(require('fs').readFileSync(path,'utf8'))"` ou
     equivalente Python) e que `core/voice-dna.js` e `core/thinking-dna.js` conseguem ser carregados
     sem erro de sintaxe (`node --check {file}` ou `node -e "require(...)"` se forem módulos CJS —
     confirmar formato exacto no Dev Agent Record).
   - Este é um smoke test de **leitura/sintaxe**, não um teste funcional completo (esse é
     SQUAD-FUSION.7, depois da fusão estar completa).

5. **AC5 — Baseline referenciado nas stories seguintes**
   - `squads/squad-creator/_fusion-baseline/` é criado nesta story e referenciado explicitamente em
     SQUAD-FUSION.6 (AC de reconciliação) e SQUAD-FUSION.7 (AC de verificação final) como a fonte da
     verdade para "byte-idêntico ao HEAD pré-fusão".

---

## Scope

### IN
- Geração de checksums/inventário (read-only sobre os assets existentes)
- Smoke test de sintaxe/leitura (sem executar lógica de negócio dos módulos)
- Criação da pasta `squads/squad-creator/_fusion-baseline/` (3 ficheiros novos)

### OUT
- Qualquer alteração a `core/*.js`, `outputs/minds/**`, ou aos 10 artefactos listados no AC3
- Merge ou reconciliação de colisões — SQUAD-FUSION.6
- Verificação funcional end-to-end do mind-cloning pós-fusão — SQUAD-FUSION.7

---

## Dependencies

**Prerequisite Stories:** Nenhuma (paralela a SQUAD-FUSION.1 e SQUAD-FUSION.2 — **deve correr o mais
cedo possível na epic**, idealmente antes ou em paralelo com .1/.2, para que o baseline capture o
estado verdadeiramente pré-fusão).

**Artefactos:**
- `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` §3.2

---

## Tasks / Subtasks

- [x] **Task 1 — Criar pasta de baseline**
  - [x] 1.1 Criar `squads/squad-creator/_fusion-baseline/`

- [x] **Task 2 — Checksums de `core/*.js` (AC1)**
  - [x] 2.1 Gerar checksum dos 7 ficheiros, escrever em `core-checksums.txt`

- [x] **Task 3 — Checksums de `outputs/minds/` (AC2)**
  - [x] 3.1 Listar recursivamente `outputs/minds/`, gerar checksum de cada ficheiro, escrever em `minds-checksums.txt`

- [x] **Task 4 — Inventário dos artefactos de mind-cloning (AC3)**
  - [x] 4.1 Para cada um dos 10 artefactos listados: confirmar existência, gerar checksum, confirmar
        ausência de colisão de nome com C (cross-check via `gh api`, não brief)
  - [x] 4.2 Escrever `mind-artifacts-inventory.md`

- [x] **Task 5 — Smoke test de sintaxe/leitura (AC4)**
  - [x] 5.1 Validar YAML de `mind_dna_complete.yaml` (achado: falha strict parse pré-existente — ver Dev Agent Record)
  - [x] 5.2 Validar sintaxe de `voice-dna.js` e `thinking-dna.js`
  - [x] 5.3 Registar resultado no Dev Agent Record

---

## Dev Notes

### Ficheiros a checksum (AC1)
```
squads/squad-creator/core/authority-matrix.js
squads/squad-creator/core/kb-assembler.js
squads/squad-creator/core/rules-inheritor.js
squads/squad-creator/core/skill-validator.js
squads/squad-creator/core/squad-template-generator.js
squads/squad-creator/core/thinking-dna.js
squads/squad-creator/core/voice-dna.js
```

### Path confirmado de `outputs/minds/` (AC2)
`squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` — **nota importante**: este
path é relativo à raiz do squad, não `outputs/minds/` na raiz do repositório (que não existe). O
`core-config.yaml` (raiz) tem `mindsLocation: outputs/minds`, mas isso refere-se à convenção
per-squad (`squads/{squad}/outputs/minds/`), confirmado por comparação com outros squads
(`squads/claude-code-mastery/outputs/minds/`, `squads/deep-research/outputs/minds/`, etc.).

### Comando de checksum sugerido (Windows/Git Bash)
```bash
sha256sum squads/squad-creator/core/*.js > squads/squad-creator/_fusion-baseline/core-checksums.txt
find squads/squad-creator/outputs/minds -type f -exec sha256sum {} \; > squads/squad-creator/_fusion-baseline/minds-checksums.txt
```

### Testing

- Sem testes automatizados formais — os "testes" desta story são os próprios comandos de verificação
  (checksum + `node --check`), cujos outputs ficam registados no Dev Agent Record e nos 3 ficheiros de
  baseline.

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Dev Agent Record

**Agent Model Used:** claude-opus-4-8 (Dex / @dev)

### Debug Log References
- `sha256sum` sobre os 7 `core/*.js` → `core-checksums.txt`
- `find squads/squad-creator/outputs/minds -type f -exec sha256sum {}` → `minds-checksums.txt` (1 ficheiro: `alan-nicolas/mind_dna_complete.yaml`)
- `sha256sum` sobre os 11 artefactos de mind-cloning → tabela em `mind-artifacts-inventory.md`
- Listagens remotas de C via `gh api ...contents/{dir}?ref=main --jq '.[].name'` (branch `main`) para confirmar não-colisão
- `node --check` sobre `voice-dna.js` e `thinking-dna.js`
- `js-yaml` (Node) + `PyYAML` (Python 3.12) sobre `mind_dna_complete.yaml`

### Completion Notes
- **AC1 PASS** — 7 checksums de `core/*.js` capturados em `core-checksums.txt`.
- **AC2 PASS** — `outputs/minds/` varrido recursivamente; único ficheiro (`mind_dna_complete.yaml`) com checksum em `minds-checksums.txt`.
- **AC3 PASS** — 11 artefactos inventariados com checksum; **não-colisão confirmada via `gh api`** (não assumida do brief) para todos. Brief §3.3 confirmado.
- **AC4 PARTIAL (achado honesto documentado)** — `voice-dna.js` e `thinking-dna.js` passam `node --check` (sintaxe JS OK). `mind_dna_complete.yaml` **falha parse YAML estrito** em `js-yaml` E `PyYAML` na linha 65 (`- "Squad" (equipa...)`: texto livre após escalar entre aspas). É **estado PRÉ-EXISTENTE** (a .3 corre antes de qualquer escrita da fusão), **não** introduzido pela epic. Consumo real do DNA não usa strict-load (`voice-dna.js` extrai blocos ` ```yaml ` de markdown via regex, não `yaml.load` deste ficheiro). **Não corrigido** — Constraint #1 proíbe escrita em `outputs/minds/**`. Encaminhado para .4/.7 avaliarem com o Pedro. Detalhe completo em `_fusion-baseline/mind-artifacts-inventory.md`.
- **AC5 PASS** — `_fusion-baseline/` criado e referenciado como fonte de verdade "byte-idêntico ao HEAD pré-fusão" para .6/.7.
- **Constraint #1 respeitado** — story 100% read-only sobre assets preservados; único write foi a nova pasta `_fusion-baseline/` (3 ficheiros novos, L4). `git status` confirma zero diff em `core/*.js` e `outputs/minds/**`.

### [AUTO-DECISION]
- Q: AC4 espera "YAML válido" mas o ficheiro falha parse estrito. Corrigir ou reportar? → **Reportar sem corrigir** (reason: Constraint #1 é NON-NEGOTIABLE — proíbe overwrite de `outputs/minds/**`; corrigir violaria a própria razão de existir da .3. Achado é pré-existente e o consumo real não depende de strict-parse. Default seguro = documentar + encaminhar, não tocar no asset).

### File List
**Criados (relocados para `docs/qa/squad-fusion/` em MNT-002 — originalmente em `squads/squad-creator/_fusion-baseline/`):**
- `docs/qa/squad-fusion/core-checksums.txt`
- `docs/qa/squad-fusion/minds-checksums.txt`
- `docs/qa/squad-fusion/mind-artifacts-inventory.md`

**Modificados:** nenhum (story read-only sobre assets existentes).
**Apagados:** nenhum.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §3.2. Story de verificação (read-only) para dar suporte objectivo ao Constraint #1 (Art. IV-A: nunca overwrite core/*.js nem outputs/minds/). | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Baseline de checksums é o mecanismo verificável que sustenta o Constraint #1 em .6/.7. 7 ficheiros core/*.js e outputs/minds/alan-nicolas/mind_dna_complete.yaml confirmados no filesystem. Deve correr o mais cedo possível (captura estado pré-fusão). | @po (Pax) |
| 2026-07-01 | 1.2 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.3 | Development complete — Status: InProgress → Ready for Review. AC1/2/3/5 PASS; AC4 PARTIAL (achado pré-existente documentado: `mind_dna_complete.yaml` falha strict YAML parse, não corrigido por Constraint #1). Baseline de 3 ficheiros criada. Zero diff nos assets preservados. | @dev (Dex) |
| 2026-07-01 | 1.4 | QA Gate CONCERNS — Status: Ready for Review → Done. Checksums 8/8 OK re-verificados por @qa; AC4 debt (parse estrito falha L65 em PyYAML+js-yaml) reproduzido — pré-existente, protegido por Constraint #1, encaminhado (MNT-001). | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: `sha256sum -c` vs `_fusion-baseline/` → 7 `core/*.js` + `mind_dna_complete.yaml` byte-idênticos (Constraint #1 cumprido). AC4 debt confirmado: parse YAML estrito falha na linha 65 em ambos PyYAML e js-yaml ("bad indentation of a sequence entry") — é pré-existente (checksum prova que não foi tocado), consumido por regex não strict-load, e correctamente encaminhado para story dedicada. Não é regressão da fusão.

### Gate Status

Gate: CONCERNS → docs/qa/gates/SQUAD-FUSION.3-preserve-verify-mind-cloning-core.yml
