# Story SCP-MVP.4 — 10 Meta-Axiomas (Config)

**ID:** SCP-MVP.4 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 5sp | **Type:** CREATE (README só anuncia "10 meta-axiomas", sem detalhar quais — ver Nota)
**Source:** PRD FR-8, G7

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** os 10 meta-axiomas de validação profunda de squads definidos em
`squads/squad-creator-pro/config/axiomas.yaml`,
**so that** SCP-MVP.5 tenha uma base concreta e estruturada sobre a qual construir o scoring ponderado
e as veto conditions.

---

## ⚠️ Nota de scope importante (No Invention — Art. IV, fonte limitada)

O README público do Squad Creator Pro (única fonte permitida) **anuncia a existência** de "10
meta-axiomas" e alguns bullets sobre o que o scoring cobre (score ponderado, modernization score, veto
conditions — README §4), mas **não publica o conteúdo/nome exacto de cada um dos 10 axiomas** — isso é
implementação interna do produto pago. Esta story, portanto, **não pode "extrair" os 10 axiomas de
uma fonte** — tem de **derivá-los por composição legítima** a partir de material AIOX já existente e
verificável:

- `.aiox-core/constitution.md` (7 artigos — já usados como fonte no DNA do Alan Nicolas)
- `.claude/rules/` (agent-authority, ids-principles, story-lifecycle, karpathy-principles, etc.)
- `squads/squad-creator/checklists/squad-structural-completeness.md` e outras checklists de qualidade
  do base (já validam squads contra critérios estruturais)
- O próprio `SC_STRUCT_001` do `squad-chief.md` (gate de completude estrutural já existente)

Isto é **ADAPT/CREATE por composição de fontes reais do próprio AIOX**, não invenção — mas exige que
cada um dos 10 axiomas tenha uma justificação rastreável (`[SOURCE: ...]` para o artigo/regra/checklist
de onde deriva), seguindo o mesmo padrão de rastreabilidade usado no DNA do Alan Nicolas. **Marcar
explicitamente no ficheiro final que estes 10 axiomas são uma composição AIOX-native inspirada no
anúncio do README, não uma cópia do produto pago** (o produto pago não expõe o conteúdo).

---

## Acceptance Criteria

1. **AC1 — `squads/squad-creator-pro/config/axiomas.yaml` com exactamente 10 meta-axiomas**
   - Cada axioma tem, no mínimo: `id`, `nome`, `descricao`, `fonte` (`[SOURCE: ...]` para o
     artigo/regra/checklist AIOX de onde deriva), `peso` (para o scoring ponderado de SCP-MVP.5),
     `criterio_pass_fail` (o que constitui PASS vs FAIL nesta dimensão).
   - Nenhum dos 10 é uma cópia literal de um artigo da Constitution — cada um é uma **lente de
     avaliação de squad** derivada do princípio subjacente (ex.: se a Constitution tem "Art. IV No
     Invention", o axioma correspondente poderia ser algo como "Rastreabilidade de requisitos: todo
     comportamento de agente/task rastreia a uma fonte documentada" — reformulado como critério de
     auditoria de squad, não copiado verbatim).

2. **AC2 — Nota de proveniência explícita no topo do ficheiro**
   - Um comentário/campo `provenance:` explica: "Os 10 meta-axiomas são uma composição AIOX-native
     (Constitution + rules + checklists existentes), inspirada no anúncio do README do Squad Creator
     Pro (§4: '10 meta-axiomas'). O README não publica o conteúdo exacto de cada axioma (produto
     pago) — este ficheiro não é uma cópia, é uma derivação com fontes AIOX próprias, rastreável."

3. **AC3 — Cobertura temática mínima (evitar 10 axiomas redundantes ou triviais)**
   - Os 10 axiomas cobrem, entre si, pelo menos estas dimensões (mapeáveis 1:1 ou N:1 aos artigos/
     regras do AIOX): rastreabilidade de requisitos, autoridade de agentes, fronteira de framework
     (L1-L4), qualidade/testes, IDS (reuse antes de create), governança de gates/veto, completude
     estrutural de squad, documentação, segurança (sem secrets/dados privados), e consistência de
     persona/formato canónico. (O @dev pode reagrupar/renomear, desde que as 10 dimensões fiquem
     cobertas sem sobreposição excessiva.)

4. **AC4 — `peso` somado é 100 (ou normalizado, documentado)**
   - Os pesos dos 10 axiomas somam 100% (ou 1.0), preparando o terreno para o scoring ponderado de
     SCP-MVP.5 sem ambiguidade de normalização.

5. **AC5 — Zero edição fora de `squads/squad-creator-pro/`**
   - `git status --short` confirma alteração só dentro de `squads/squad-creator-pro/config/`.

---

## Scope

### IN
- `squads/squad-creator-pro/config/axiomas.yaml` (10 meta-axiomas + provenance)

### OUT
- Engine de scoring/veto (consome este ficheiro, mas é implementado em SCP-MVP.5)
- Qualquer alteração a `.aiox-core/constitution.md` ou `.claude/rules/` (só leitura, como fonte)

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.1 Done** — precisa de `squads/squad-creator-pro/config/` já existir.

**Paralela a:** SCP-MVP.2, SCP-MVP.3 (agentes diferentes, sem sobreposição de ficheiros).

**Artefactos (fontes de composição, read-only):**
- `.aiox-core/constitution.md`
- `.claude/rules/*.md`
- `squads/squad-creator/checklists/squad-structural-completeness.md`
- `squads/squad-creator/agents/squad-chief.md` (`SC_STRUCT_001`, linhas ~192-207)

---

## Tasks / Subtasks

- [ ] **Task 1 — Ler as fontes de composição**
  - [ ] 1.1 Ler `.aiox-core/constitution.md` (7 artigos)
  - [ ] 1.2 Ler `.claude/rules/` relevantes (agent-authority, ids-principles, story-lifecycle,
        karpathy-principles, enforcement-gates)
  - [ ] 1.3 Ler `squad-structural-completeness.md` + `SC_STRUCT_001`

- [ ] **Task 2 — Derivar os 10 axiomas com rastreabilidade (AC1, AC3)**
  - [ ] 2.1 Mapear cada axioma a uma fonte AIOX real, com `[SOURCE:]`
  - [ ] 2.2 Confirmar cobertura das 10 dimensões mínimas (AC3), sem redundância excessiva

- [ ] **Task 3 — Definir pesos e critérios PASS/FAIL (AC4)**
  - [ ] 3.1 Atribuir peso a cada axioma, somar 100
  - [ ] 3.2 Escrever `criterio_pass_fail` concreto e verificável por axioma

- [ ] **Task 4 — Nota de proveniência (AC2)**

- [ ] **Task 5 — Verificação final (AC5)**
  - [ ] 5.1 `git status --short`

---

## Dev Notes

### O que o README público realmente diz (§4, fonte única permitida)
Bullets confirmados no PRD: "10 meta-axiomas", "score ponderado por dimensão (PASS/FAIL)",
"modernization score", "veto conditions configuráveis". **Não há mais detalhe público** — qualquer
coisa além disto no ficheiro final é composição AIOX-native, não extracção do produto (ver Nota de
scope acima). Isto não é uma limitação a esconder — é o próprio modelo operativo do projecto (Art. IV
No Invention: onde a fonte é vaga, o PRD já tinha marcado `[INFERÊNCIA CONTROLADA]`).

### Exemplo de forma de entrada (ilustrativo — não prescritivo, @dev decide os nomes finais)
```yaml
provenance: |
  Os 10 meta-axiomas são uma composição AIOX-native (Constitution + rules + checklists
  existentes), inspirada no anúncio do README do Squad Creator Pro (§4: "10 meta-axiomas").
  O README não publica o conteúdo exacto (produto pago) — este ficheiro é uma derivação
  rastreável, não uma cópia.

axiomas:
  - id: AX-01
    nome: "Rastreabilidade de Requisitos"
    descricao: "Todo comportamento de agente/task rastreia a uma fonte documentada (spec, epic, DNA)."
    fonte: "[SOURCE: .aiox-core/constitution.md Art. IV — No Invention]"
    peso: 12
    criterio_pass_fail: "PASS se cada capacidade do squad citar a origem; FAIL se houver comportamento sem fonte rastreável."
  # ... (mais 9)
```

### Testing

- Sem testes automatizados. Verificação: soma de pesos = 100 (cálculo manual/script simples), presença
  de `[SOURCE:]` em cada axioma, cobertura das 10 dimensões (AC3, revisão manual).

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
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-8/G7. Nota de scope explícita: README não publica o conteúdo dos 10 axiomas (produto pago) — story define composição AIOX-native rastreável, não extracção, para não violar Art. IV No Invention. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Composição AIOX-native (não cópia do produto pago) alinhada com decisão Pedro #2. Fontes confirmadas no repo: `constitution.md`, `.claude/rules/*`, `squad-structural-completeness.md`, `SC_STRUCT_001`. Should-fix não-bloqueante: definir já o campo `veto` no schema para SCP-MVP.5 não o retro-estender. | @po (Pax) |
