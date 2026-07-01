# Story SQUAD-FUSION.7 — Validation Gate: Structural Validators + Mind-Cloning Smoke Test

**ID:** SQUAD-FUSION.7 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 4sp | **Type:** ADAPT
**Reference:** Brief §4 Fase 3 ("Correr validadores de C como gate")

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** os validadores estruturais do squad-creator remoto (C) executados sobre
`squads/squad-creator/` pós-fusão, e um smoke test end-to-end do fluxo de mind-cloning,
**so that** exista prova objectiva (não apenas afirmação) de que a fusão produziu um squad
estruturalmente válido segundo os próprios critérios de C, e que o diferenciador de mind-cloning
continua funcional depois de toda a reconciliação.

---

## Acceptance Criteria

1. **AC1 — Dependências dos validadores instaladas (execução REAL por default)** *(AMENDMENT — decisão do Pedro registada 2026-07-01, ver Dev Notes)*
   - **[DECISÃO Pedro 2026-07-01]** deps scoped-to-squad (Node + Python dos 22 scripts de C) estão
     APROVADAS — isoladas a `squads/squad-creator/`, não tocam a raiz do repositório Kairos Check nem a
     imagem de produção Railway. A Ambiguidade 1 da epic está resolvida: **não há mais condição
     pendente**.
   - Esta story executa `pip install -r squads/squad-creator/requirements.txt` e/ou `npm install`
     **directamente**, sempre dentro de `squads/squad-creator/` (nunca na raiz do repositório), como
     primeiro passo (Task 1), sem depender de confirmação adicional.
   - Os AC2-AC5 correm em **modo de execução real** por default (os 3 validadores Python + o smoke test
     correm de facto, não são simulados).
   - O modo **dry-run documentado** (ver Dev Notes "Modo degradado") deixa de ser o comportamento
     condicional por falta de aprovação e passa a ser **apenas um fallback de erro**: só é usado se a
     instalação das deps falhar por um problema técnico real (ex.: conflito de versão, timeout de rede,
     pacote indisponível) — nesse caso, o erro exacto é registado no Dev Agent Record antes de degradar
     para dry-run, e o relatório final (AC7) marca claramente que o gate correu em modo degradado e
     porquê.

2. **AC2 — `validate-squad-structure.py` corre sobre `squads/squad-creator/`**
   - O script (copiado em SQUAD-FUSION.2) é executado apontando para `squads/squad-creator/` e o
     output completo (PASS/FAIL + quaisquer warnings) é registado no Dev Agent Record.
   - Se FAIL: os itens que falham são listados e, para cada um, é feita uma avaliação — é um problema
     real introduzido pela fusão, ou uma expectativa do validador que não se aplica a este squad
     híbrido (ex.: valida uma estrutura que C assume mas que foi legitimamente estendida com
     mind-cloning)? Cada FAIL tem de ter uma destas duas classificações, não pode ficar sem explicação.

3. **AC3 — `coherence-validator.py` corre sobre `squads/squad-creator/`**
   - Mesmo procedimento do AC2: execução real (ou dry-run se AC1 degradar), output registado,
     FAILs classificados.

4. **AC4 — `naming_validator.py` corre sobre `squads/squad-creator/`**
   - Mesmo procedimento do AC2/AC3. Este validador é particularmente relevante para confirmar que a
     conversão de `oalanicolas.md`/`pedro-valerio.md` (SQUAD-FUSION.4) segue as convenções de naming de
     C.

5. **AC5 — Smoke test end-to-end do mind-cloning**
   - É executado (ou simulado com o máximo de fidelidade possível sem custo de API real, a decidir
     pelo @dev) um ciclo mínimo do fluxo de clonagem:
     1. `squad-chief` recebe um pedido de clonagem (ex.: "clone a expert X")
     2. Delega a `@oalanicolas` (comando canónico definido em SQUAD-FUSION.4/.5)
     3. `@oalanicolas` referencia correctamente a task `extract-voice-dna.md`/`extract-thinking-dna.md`/
        `mind-research-loop.md` e o path de output `outputs/minds/{slug}/mind_dna_complete.yaml`
     4. `@pedro-valerio` é referenciado para revisão antes do handoff final
   - O teste confirma que os **paths e referências resolvem correctamente** (todos os ficheiros
     referenciados em `dependencies:`/`commands:` existem nos paths declarados) — não exige
     necessariamente invocar um LLM real para "clonar uma mente" de facto (isso seria um custo de API
     fora do scope de uma story de fusão estrutural); o critério mínimo aceitável é documentado no Dev
     Agent Record e aprovado implicitamente pelo @po na validação desta story.
   - Resultado: PASS (todas as referências resolvem, fluxo coerente) ou FAIL (referência quebrada,
     comando ambíguo, ciclo incoerente) — se FAIL, story não pode ser marcada Done sem correcção.

6. **AC6 — Verificação final de integridade dos assets protegidos**
   - Checksums de `core/*.js` e `outputs/minds/**` (regenerados) comparados byte-a-byte contra
     `_fusion-baseline/core-checksums.txt` e `minds-checksums.txt` (de SQUAD-FUSION.3) — zero diferença.
   - `git status --short`/`git diff --stat` confirma que toda a fusão ficou contida em
     `squads/squad-creator/` (nenhum ficheiro fora deste path foi tocado em qualquer story da epic).

7. **AC7 — Relatório final de fusão**
   - Um documento `squads/squad-creator/_fusion-baseline/FUSION-REPORT.md` resume: o que foi puxado de
     C (contagens), o que foi preservado de B (lista), as 9 colisões e como foram resolvidas
     (referenciando `collision-resolution-log.md` de SQUAD-FUSION.6), o resultado dos 3 validadores, o
     resultado do smoke test, e a confirmação de integridade dos checksums.

---

## Scope

### IN
- Execução (ou dry-run documentado, condicional) dos 3 validadores de C
- Smoke test estrutural do fluxo de mind-cloning
- Verificação final de checksums
- Relatório final de fusão

### OUT
- Correcção de bugs estruturais descobertos pelos validadores que exijam voltar a stories anteriores
  (se AC2/AC3/AC4 encontrarem FAILs reais — não classificáveis como "expectativa que não se aplica" —
  esta story documenta o achado e reabre a story de origem; não corrige silenciosamente fora do scope
  da story onde o problema foi introduzido)
- Push/commit (autoridade @devops)

---

## Dependencies

**Prerequisite Stories:**
- **SQUAD-FUSION.6 Done** — precisa de todas as colisões resolvidas e configs mescladas antes do gate
  final.
- **SQUAD-FUSION.3 Done** — precisa do baseline de checksums (AC6).

**Bloqueador conhecido:** Nenhum. *(Resolvido — [DECISÃO Pedro 2026-07-01]: deps scoped-to-squad
aprovadas. A Ambiguidade 1 da epic já não bloqueia esta story; ver AC1.)*

**Artefactos:**
- `squads/squad-creator/scripts/validate-squad-structure.py`, `coherence-validator.py`,
  `naming_validator.py` (de SQUAD-FUSION.2)
- `squads/squad-creator/_fusion-baseline/` (de SQUAD-FUSION.3)
- `squads/squad-creator/_fusion-baseline/collision-resolution-log.md` (de SQUAD-FUSION.6)

---

## Tasks / Subtasks

- [x] **Task 1 — Instalar dependências (AC1)** *(deps já aprovadas — [DECISÃO Pedro 2026-07-01])*
  - [x] 1.1 `pip install -r requirements.txt` real — `PyYAML>=6.0` (única dep) já satisfeita
  - [x] 1.2 `npm install` **não necessário** — única dep `js-yaml` resolve do root `node_modules` (Node upward resolution); instalar node_modules squad-local seria ruído (Simplicity). Documentado
  - [x] 1.3 N/A — instalação não falhou; execução REAL por default (não houve fallback dry-run)

- [x] **Task 2 — Correr `validate-squad-structure.py` (AC2)**
  - [x] 2.1 Executado (real). **FAIL** (7 sec + 14 orphans) — ambos classificados como expectativa do validador que não se aplica (falsos positivos de docs de C + threshold p/ squads pequenos), não defeitos da fusão. Fix de encoding: `PYTHONUTF8=1` (só stdout Windows)

- [x] **Task 3 — Correr `coherence-validator.py` (AC3)**
  - [x] 3.1 Executado (real). **SKIPPED_PRO_ONLY** (exit 0) — adapter só valida com squad-creator-pro (ausente); comportamento esperado, blocking_issues=0

- [x] **Task 4 — Correr `naming_validator.py` (AC4)**
  - [x] 4.1 Executado (real). **PASS** (0 issues) — confirma que a conversão .4 (oalanicolas/pedro-valerio) segue as convenções de naming de C

- [x] **Task 5 — Smoke test do fluxo de mind-cloning (AC5)**
  - [x] 5.1 Resolução de referências verificada (squad-chief → @oalanicolas → @pedro-valerio)
  - [x] 5.2 **PASS — 20/20 referências resolvem** (sem clonagem LLM, per critério mínimo)

- [x] **Task 6 — Verificação final de integridade (AC6)**
  - [x] 6.1 `sha256sum -c` vs baseline .3: 7 `core/*.js` + `mind_dna_complete.yaml` = todos OK
  - [x] 6.2 `git status --short`: fusão contida em `squads/squad-creator/`; zero produto fora do path

- [x] **Task 7 — Relatório final (AC7)**
  - [x] 7.1 `_fusion-baseline/FUSION-REPORT.md` escrito (contagens C, preservados B, 9 colisões, 3 validadores, smoke, checksums)

---

## Dev Notes

### [DECISÃO Pedro 2026-07-01] Deps scoped-to-squad APROVADAS → instalação permitida
O Pedro confirmou que as deps de `squads/squad-creator/package.json` e `requirements.txt` (Node + os
22 scripts Python/JS de C) são isoladas ao squad — não tocam a raiz do repositório Kairos Check nem a
imagem de produção Railway. Instalação **permitida e é o caminho por default** desta story (AC1, Task 1).
Isto substitui a condicionalidade original da story ("Ambiguidade 1 da epic") — já não há decisão
pendente do Pedro para este AC.

### Modo degradado (fallback de erro, NÃO default)
Só é usado se a instalação real (Task 1) falhar por um problema técnico (não por falta de aprovação —
essa já está dada). Em vez de executar os scripts Python reais, o @dev lê o código-fonte de cada
validador (`validate-squad-structure.py`, `coherence-validator.py`, `naming_validator.py`) e produz uma
verificação manual equivalente (ex.: replicar a lógica de verificação de estrutura de pastas via
`ls`/`Glob`, sem correr o script Python). Isto é estritamente pior do que execução real (menos
confiável) — é a excepção, não a norma, e fica claramente marcado como tal (com o erro técnico que
motivou a degradação) no relatório final (AC7).

### Critério mínimo do smoke test (AC5)
Este AC é deliberadamente definido como "resolução de referências", não "clonagem real de uma mente",
para evitar:
1. Custo de API (chamadas LLM reais) numa story de infraestrutura/fusão
2. Inventar um "expert de teste" fictício sem propósito real (risco de violar Art. IV No Invention se
   se criar dados de mind DNA fictícios só para o teste)

Se o @po considerar este critério insuficiente na validação da story, a alternativa (clonagem real de
um expert de teste, ex. reutilizando um já existente do `outputs/minds/` de outro squad como fixture)
deve ser proposta explicitamente antes da implementação — não decidir silenciosamente.

### Testing

- Execução real dos 3 scripts Python (preferencial) ou verificação manual equivalente (modo
  degradado). Outputs completos registados no Dev Agent Record — não resumir/omitir mensagens de
  erro dos validadores.

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
- `python -m pip install -r requirements.txt` (PyYAML já satisfeita); `node -e "require('js-yaml')"` (resolve do root)
- `PYTHONUTF8=1 python scripts/validate-squad-structure.py squad-creator --output json` (fix encoding cp1252 do stdout Windows)
- `python scripts/coherence-validator.py squad-creator` / `python scripts/naming_validator.py squads/squad-creator/`
- Replicação do security-scan (regex de THRESHOLDS) para identificar os 7 matches
- Smoke test Node: parse dos blocos yaml dos 3 agentes + `fs.existsSync` de cada referência
- `sha256sum -c _fusion-baseline/{core,minds}-checksums.txt`; `git status --short`

### Completion Notes
- **AC1 PASS** — deps aprovadas instaladas em modo REAL. `PyYAML` (única dep Python) satisfeita; `js-yaml` (única dep Node) resolve do root `node_modules` → `npm install` squad-local dispensado (evita ruído). Sem fallback dry-run (nada falhou).
- **AC2 — validate-squad-structure.py: FAIL, classificado** — 7 security issues (**falsos positivos**: exemplos de docs + os próprios regex de deteção dentro de `checklists/squad-checklist.md`, `data/squad-kb.md`, `tasks/qa-after-creation.md`, `tasks/validate-squad.md` — todos ficheiros **de C**, não segredos reais, não introduzidos pela fusão) + 14 orphan tasks (**threshold p/ squads pequenos** max 2; squad fundido tem 31 tasks legitimamente). Type-detector classificou "pipeline" (má-classificação de um meta/expert squad). Nenhum FAIL é defeito real da fusão → nenhuma story reaberta (Scope OUT respeitado).
- **AC3 — coherence-validator.py: SKIPPED_PRO_ONLY (exit 0)** — adapter só valida com `squad-creator-pro` (ausente). Comportamento esperado, blocking_issues=0.
- **AC4 — naming_validator.py: PASS (0 issues)** — confirma que a conversão .4 segue as convenções de naming de C (kebab/snake/camel).
- **AC5 — smoke test: PASS (20/20 referências resolvem)** — ciclo squad-chief → @oalanicolas (7 tasks + mind-validation + outputs/minds/) → @pedro-valerio (mind-validation) coerente e unidireccional. Sem clonagem LLM (critério mínimo aprovado pelo @po; evita custo API + Art. IV).
- **AC6 PASS** — checksums vs baseline: 7 core + mind_dna todos OK (Constraint #1 provado em toda a epic). `git status`: fusão 100% contida em `squads/squad-creator/` (16 M + 67 novos); zero `.aiox-core/`, zero produto fora do squad.
- **AC7 PASS** — `FUSION-REPORT.md` escrito.

### [AUTO-DECISION]
- Q: `npm install` squad-local? → **Não** (reason: `js-yaml` resolve do root via Node upward resolution; instalar node_modules em L4 seria ruído desnecessário — Simplicity; deps continuam "aprovadas", só não redundantemente instaladas).
- Q: corrigir os 7 "security issues"? → **Não** (reason: falsos positivos em docs canónicos de C — "C vence formato"; nenhum segredo real; não introduzidos pela fusão. Editar seria alterar exemplos legítimos de C).
- Q: reabrir story por causa do FAIL do validador estrutural? → **Não** (reason: nenhum FAIL é defeito real da fusão; ambos são expectativas do validador não-aplicáveis a um squad híbrido/grande — classificação exigida pelo AC2 cumprida).

### Dívida conhecida encaminhada
- `mind_dna_complete.yaml` falha strict YAML parse (pré-existente) — **NÃO corrigido** (Constraint #1 + decisão do Pedro de tratar numa story separada fora desta fusão). Registado no FUSION-REPORT §8.

### File List
**Criados (relocados para `docs/qa/squad-fusion/` em MNT-002 — originalmente em `squads/squad-creator/_fusion-baseline/`):**
- `docs/qa/squad-fusion/FUSION-REPORT.md`

**Instalação:** `pip install` (PyYAML, já satisfeita) — sem novos ficheiros no repo. `node_modules` NÃO criado no squad.
**Modificados/Apagados:** nenhum ficheiro do squad alterado nesta story (gate read-only + relatório).

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §4 Fase 3. AC1 e AC5 desenhados para não bloquear indefinidamente em decisões pendentes do Pedro (modo dry-run/critério mínimo documentados como fallback explícito). | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (8/10) — Status: Draft → Ready. [AUTO-DECISION] @po aprova o critério mínimo de smoke test do AC5 ("resolução de referências", sem clonagem LLM real) como suficiente para uma story de fusão estrutural (razão: exigir clonagem real violaria Art. IV No Invention por exigir expert fictício + custo API fora de scope). Ambiguidades 1/3 (instalar deps dos validadores) NÃO bloqueiam Ready — o fallback dry-run torna a story implementável sem a decisão; mas a decisão do Pedro é necessária ANTES de execução em confiança plena (ver secção "Decisões que requerem o Pedro"). | @po (Pax) |
| 2026-07-01 | 1.2 | **[DECISÃO Pedro 2026-07-01]** deps scoped-to-squad APROVADAS → instalação permitida. AC1 reescrito: a instalação (`pip install`/`npm install` dentro de `squads/squad-creator/`) passa a ser o primeiro passo por default (Task 1), sem condição pendente. O caminho de execução dos AC2-AC5 passa a ser REAL por default; o modo dry-run fica reclassificado como fallback de erro técnico (não como default por falta de aprovação). "Bloqueador conhecido" removido das Dependencies. | @sm (River) |
| 2026-07-01 | 1.3 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.4 | Development complete — Status: InProgress → Ready for Review. AC1-AC7 PASS (execução REAL). validate-structure FAIL só com falsos positivos/thresholds não-aplicáveis (classificados); coherence SKIP esperado; naming PASS; smoke 20/20; checksums OK (Constraint #1). FUSION-REPORT.md escrito. EPIC-SQUAD-FUSION estruturalmente completa. | @dev (Dex) |
| 2026-07-01 | 1.5 | QA Gate CONCERNS — Status: Ready for Review → Done. @qa reproduziu naming PASS, checksums 8/8, smoke refs; AC2 FAILs confirmados falsos-positivos (scanner maduro exclui-os) / threshold não-aplicável — não são defeitos (SEC-001/MNT-001). Achado novo: _fusion-baseline/ varrido pelos validadores (MNT-002, cleanliness). | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente da execução real dos validadores:
- **naming_validator.py**: PASS reproduzido (exit 0, 0 errors) com nome de dir resolvido. O FAIL inicial que observei foi artefacto de invocação minha (passei `.` como path).
- **security_scanner.py** (scanner maduro do squad, com exclude regex): só apanha 1 hit — a prosa do próprio `FUSION-REPORT.md` L72 a citar `-----BEGIN...PRIVATE KEY-----` — confirmando que TODOS os 7 "security issues" do validate-structure são falsos-positivos (valores de exemplo em definições de pattern SEC-001/002/003 em docs canónicos de C).
- **smoke test**: 13/13 referências de mind-cloning resolvem (subconjunto do 20/20 do @dev).
- **checksums**: 8/8 OK (Constraint #1).

**Decisão AC2:** o FAIL de `validate-squad-structure.py` NÃO é defeito da fusão. 7 security = falsos-positivos de docs canónicos de C; 14 orphans + classificação "pipeline" = threshold para squads pequenos não-aplicável a um squad meta fundido (31 tasks legítimas). Não requer WAIVER formal (não há problema real a dispensar) nem correcção. Classificado CONCERNS: rastreável, não-bloqueante.

**Achado novo @qa (MNT-002):** `_fusion-baseline/` (artefactos QA: FUSION-REPORT, log, checksums) vive dentro da árvore validada do squad e polui os scans. Follow-up de limpeza recomendado antes de shipping público.

### Gate Status

Gate: CONCERNS → docs/qa/gates/SQUAD-FUSION.7-validation-gate.yml
