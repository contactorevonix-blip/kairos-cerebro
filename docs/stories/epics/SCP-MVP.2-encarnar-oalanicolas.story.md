# Story SCP-MVP.2 — Encarnar @oalanicolas (DNA 370L Integrado)

**ID:** SCP-MVP.2 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 8sp | **Type:** ADAPT (REUSE do DNA + do casca estrutural, componha num agente novo)
**Source:** PRD FR-2, G2 | **Reference:** `outputs/minds/alan-nicolas/mind_dna_complete.yaml` (370L) + `squads/squad-creator/agents/oalanicolas.md` (106L, read-only)

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** um `squads/squad-creator-pro/agents/oalanicolas.md` que integra o DNA real de 370 linhas já
extraído (`voice_dna`, `thinking_dna` incl. `mental_frameworks`/`decision_heuristics`/
`anti_patterns_he_rejects`, `architecture_philosophy`, `aiox_design_decisions`, `aiox_journey`,
`verification`), em vez do casca actual de 106 linhas,
**so that** @oalanicolas deixe de ser uma casca genérica e passe a responder com o modelo mental real
do Alan Nicolas quando delegado pelo squad-chief em modo pro.

---

## Acceptance Criteria

1. **AC1 — Novo ficheiro `squads/squad-creator-pro/agents/oalanicolas.md`, formato canónico, 300+ linhas**
   - Segue o mesmo formato canónico AIOX do casca base (ACTIVATION-NOTICE + bloco yaml +
     `IDE-FILE-RESOLUTION` + `activation-instructions` + `agent`/`persona`/`commands`/`dependencies`).
   - `{root}` para este agente é `squads/squad-creator-pro` (dependencies resolvem para
     `squads/squad-creator-pro/{type}/{name}` — não para o base, salvo REUSE explícito documentado,
     ver AC5).
   - Atinge no mínimo 300 linhas de conteúdo substantivo (não infladas com repetição — cada secção
     adicional face ao casca de 106L tem de corresponder a conteúdo real do DNA de 370L).

2. **AC2 — `voice_dna` integrado**
   - A persona do agente reflecte, no mínimo: `signature_phrases` (8 frases com `[SOURCE:]`),
     `vocabulary_markers` (termos cunhados), `tone` (registo/estilo/didáctica), `writing_patterns`,
     `voice_gaps` (honestidade sobre o que não foi capturado — não omitir os `[GAP]`).
   - Cada afirmação de voz preserva a citação `[SOURCE: ...]` original do DNA — não reformular
     perdendo a rastreabilidade (Art. IV / NFR-7).

3. **AC3 — `thinking_dna` integrado, incluindo as 3 subsecções verificadas**
   - `mental_frameworks` (linha 107 do DNA), `decision_heuristics` (linha 174), `anti_patterns_he_rejects`
     (linha 208) — todas as três presentes e substantivamente reflectidas no agente, não apenas
     mencionadas de passagem.
   - `first_principles`, `how_he_handles_complexity`, `human_in_the_loop_philosophy` (dentro de
     `architecture_philosophy`, a partir da linha 239) também integrados.

4. **AC4 — `architecture_philosophy`, `aiox_design_decisions`, `aiox_journey` integrados**
   - Estas 3 secções do DNA (linhas 237-323) ficam reflectidas na persona/conhecimento do agente —
     são o que torna @oalanicolas capaz de explicar o AIOX com o modelo mental do seu criador, não
     apenas extrair DNA de terceiros.

5. **AC5 — Comandos preservados + REUSE explícito das tasks de mind-cloning do base**
   - Os comandos já existentes no casca (`*clone-mind`, `*extract-voice-dna`, `*extract-thinking-dna`,
     `*research-sources`, `*help`, `*exit`) são preservados no agente pro.
   - `dependencies.tasks` referencia as tasks de mind-cloning **já existentes no base**
     (`squads/squad-creator/tasks/{extract-voice-dna,extract-thinking-dna,mind-research-loop,...}.md`)
     via caminho explícito cross-squad (REUSE — Art. IV-A, CON-6; não duplicar essas tasks dentro de
     `squads/squad-creator-pro/tasks/`, o que violaria "extend-only" e criaria duas fontes de verdade).
   - Documentar no Dev Agent Record a forma exacta de referência cross-squad usada (o formato canónico
     `{root}/{type}/{name}` assume `{root}` fixo por agente — se o formato não suportar cross-root
     nativamente, documentar a solução escolhida: path absoluto explícito no `dependencies`, ou
     comentário inline explicando o REUSE, sem inventar um mecanismo de resolução novo não suportado
     pelo parser real do IDE-FILE-RESOLUTION).

6. **AC6 — Fidelidade/honestidade preservada**
   - O `fidelity_score` (overall 86, com breakdown por dimensão) e a secção `verification` (fontes
     verificadas, `gaps`, `distinction_extracted_vs_inferred`) do DNA são reflectidos no agente — não
     apagados nem inflacionados. O agente **não afirma fidelidade 100%** nem esconde os `[GAP]`.

7. **AC7 — `output_examples` explicitamente FORA de scope (correcção de scope vs FR-5)**
   - O agente **não** inclui uma secção formal `output_examples` (pares input/output) — essa
     formalização é FR-5 (Fase 2, fora desta epic). Se o @dev achar útil ilustrar com 1-2 exemplos
     informais, pode fazê-lo, mas não apresentar como o schema `output_examples` completo do FR-5.

8. **AC8 — Zero edição ao base**
   - `git status --short` confirma que `squads/squad-creator/agents/oalanicolas.md` (o casca) e
     `outputs/minds/alan-nicolas/mind_dna_complete.yaml` (o DNA fonte) ficam byte-idênticos ao HEAD
     antes desta story. Ambos são só **lidos**, nunca escritos por esta story.

---

## Scope

### IN
- `squads/squad-creator-pro/agents/oalanicolas.md` (novo, 300+ linhas)

### OUT
- Qualquer edição a `squads/squad-creator/agents/oalanicolas.md` (casca base, read-only)
- Qualquer edição a `outputs/minds/alan-nicolas/mind_dna_complete.yaml` (fonte, read-only —
  correcção do YAML inválido é a story separada `MIND-DNA-YAML-FIX.1`, fora desta epic)
- FR-5 (schema formal `output_examples`) — Fase 2
- FR-4 (pipeline `*clone-mind` formalizado como orquestração multi-step testável) — Fase 2; os
  comandos existem (AC5) mas a orquestração completa/testada é Fase 2

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.1 Done** — precisa de `squads/squad-creator-pro/agents/` já existir.

**Risco/dependência mole (não hard-blocker):**
- `outputs/minds/alan-nicolas/mind_dna_complete.yaml` **falha parsing YAML estrito** (`js-yaml`,
  `PyYAML`) — confirmado nesta sessão, erro na linha 65 (`bad indentation of a sequence entry`), com
  mais 3 problemas em cadeia (linhas 315, 319-320, colisão de chave `source:`). A story
  `MIND-DNA-YAML-FIX.1` (Draft, não implementada) corrige isto. **Se o @dev usar `yaml.load()`/
  `js-yaml.load()` programático para extrair o conteúdo, esta story fica bloqueada até
  `MIND-DNA-YAML-FIX.1` estar Done.** Se a integração for feita por leitura de texto/composição manual
  (ler o `.yaml` como Markdown/texto estruturado, copiar o conteúdo semântico para o agente novo — que
  é perfeitamente viável dado que o ficheiro é legível e só falha *parsing estrito*, não leitura), a
  story pode prosseguir sem esperar. **Decisão de abordagem é do @dev, registada no Dev Agent Record.**

**Artefactos:**
- `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` (370 linhas, read-only)
- `squads/squad-creator/agents/oalanicolas.md` (106 linhas, read-only, referência estrutural)

---

## Tasks / Subtasks

- [ ] **Task 1 — Ler as 2 fontes (read-only)**
  - [ ] 1.1 Ler `mind_dna_complete.yaml` completo (370 linhas)
  - [ ] 1.2 Ler `oalanicolas.md` casca (106 linhas) — estrutura canónica de referência
  - [ ] 1.3 Decidir e registar a abordagem de extracção (parse estrito vs leitura textual — ver risco
        acima)

- [ ] **Task 2 — Compor `agent`/`persona` com voice_dna + thinking_dna (AC2, AC3)**
  - [ ] 2.1 Integrar `signature_phrases`, `vocabulary_markers`, `tone`, `writing_patterns`, `voice_gaps`
  - [ ] 2.2 Integrar `mental_frameworks`, `decision_heuristics`, `anti_patterns_he_rejects`

- [ ] **Task 3 — Integrar architecture_philosophy + aiox_design_decisions + aiox_journey (AC4)**

- [ ] **Task 4 — Preservar comandos + REUSE das tasks do base (AC5)**
  - [ ] 4.1 Copiar/adaptar os 6 comandos do casca
  - [ ] 4.2 Referenciar as tasks de mind-cloning do base (cross-root, documentar mecanismo)

- [ ] **Task 5 — Reflectir fidelidade/honestidade (AC6, AC7)**
  - [ ] 5.1 Incluir `fidelity_score` + `verification`/`gaps`
  - [ ] 5.2 Confirmar que NÃO existe secção `output_examples` formal

- [ ] **Task 6 — Verificação final (AC1, AC8)**
  - [ ] 6.1 Contar linhas (`wc -l` ou equivalente) — confirmar ≥300
  - [ ] 6.2 `git status --short` — confirmar casca e DNA fonte intocados

---

## Dev Notes

### Estrutura do DNA (verificada nesta sessão, `mind_dna_complete.yaml`)
```
mind: (linha 12)
fidelity_score: (24) — overall 86
voice_dna: (41)
  signature_phrases (44), vocabulary_markers (63), tone (77), writing_patterns (83), voice_gaps (90)
thinking_dna: (97)
  mental_frameworks (107), decision_heuristics (174), anti_patterns_he_rejects (208)
architecture_philosophy: (237)
  first_principles (239), how_he_handles_complexity (247), human_in_the_loop_philosophy (254)
aiox_design_decisions: (273)
aiox_journey: (306)
  evolution (311), problems_being_solved (316)
verification: (328)
  sources_checked (329), gaps (347), distinction_extracted_vs_inferred (354)
note_for_pedro: (363)
```
**Nota:** `output_examples` **não existe** como chave neste ficheiro — confirmar isto antes de
inventar uma secção com esse nome (AC7).

### Formato canónico de referência (casca actual, 106 linhas)
Ver `squads/squad-creator/agents/oalanicolas.md` — já está no formato correcto (ACTIVATION-NOTICE +
bloco yaml + `agent`/`persona`/`commands`/`dependencies`), resultado de SQUAD-FUSION.4/.5. Usar como
template estrutural directo, só expandindo o conteúdo de `persona`.

### Testing

- Sem testes automatizados de comportamento. Verificação: contagem de linhas (AC1), presença de cada
  subsecção do DNA (AC2-AC4, revisão manual linha a linha), `git status --short` (AC8).

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
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-2/G2. Estrutura do DNA verificada por leitura directa nesta sessão (não assumida); confirmado que `output_examples` não existe no ficheiro actual (FR-5/Fase 2, corrige potencial overclaim); confirmado risco de YAML inválido (`MIND-DNA-YAML-FIX.1` Draft) como dependência mole, não hard-blocker. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. DNA fonte confirmado em `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml`; escrita só em `squad-creator-pro/` (decisão Pedro #1 confirma o path escolhido pelo @sm). Should-fix não-bloqueante: usar o path completo do DNA de forma consistente no corpo (o body usa a forma abreviada `outputs/minds/...`). | @po (Pax) |
