# EPIC-SCP-MVP — Squad Creator Pro: Fase 1 (2 Especialistas Encarnados + Axioma + Socket)

**Epic ID:** EPIC-SCP-MVP | **Status:** Draft | **Owner:** @sm (River) | **Created:** 2026-07-02
**Fonte:** `docs/prd/squad-creator-pro-recreation-PRD.md` (APROVADO 2026-07-02, decisões D1-D3 em §0.1)
**Fase:** 1 de 3 (PRD §6) — MVP: `pro_mode=true` com @oalanicolas + @pedro-valerio reais (sem @thiago_finch, D2)

---

## Context

O `squad-creator` base já está fundido e canónico (EPIC-SQUAD-FUSION — **confirmado Done nesta
sessão**, commit `e4aa891`, QA gate CONCERNS→Done). O `squad-chief.md` base já contém um **socket de
auto-detecção Pro** funcional (`pro_detection`, linhas 53-100 do ficheiro actual): procura
`squads/squad-creator-pro/config.yaml`, verifica `agents/`, `tasks/`, `workflows/` não-vazios
(`integrity_check`), e se tudo presente activa `pro_mode=true` com um `command_override_map` que
aponta para nomes de ficheiro exactos dentro de `squads/squad-creator-pro/`.

O PRD (fonte única de requisitos — Art. IV, só o README público do produto pago é a spec permitida)
mapeia 16 gaps (G1-G16) entre o que o README do Squad Creator Pro anuncia e o que existe hoje. Esta
epic cobre exclusivamente a **Fase 1 (MVP)**, ajustada pelas decisões D1-D3 do Pedro (2026-07-02):

- **D1:** faseamento aprovado, MVP = Fase 1.
- **D2:** @thiago_finch **adiado para a Fase 2** (será clonado de fontes públicas reais, não
  persona-template) — **fora desta epic**.
- **D3:** suite de testes completa (17 casos + 19 scripts) fica na Fase 3, sem subset — **fora desta
  epic**.

**MVP redefinido (PRD §0.1):** encarnar @oalanicolas (FR-2) + @pedro-valerio (FR-3) + 10 meta-axiomas
e scoring/veto (FR-8, FR-9) + estrutura mínima que passa o `integrity_check` e faz o flip
`pro_mode=true` (FR-15) + degradação limpa validada (FR-17).

---

## Goal

`squads/squad-creator-pro/` passa a existir com estrutura suficiente para o socket do base activar
`pro_mode=true` **sem qualquer edição ao base**, com @oalanicolas e @pedro-valerio encarnados (DNA
real integrado, não cascas) e uma capacidade de Axioma Assessment funcional (10 meta-axiomas, scoring
ponderado, veto conditions) — provando a tese do Pedro ("se o Alan Nicolas conseguiu recriar o Pro só
com AIOX, nós também conseguimos") ao menor custo possível.

---

## Scope

**IN (rastreado a FR do PRD):**
- FR-2 — Encarnar @oalanicolas (DNA 370L integrado)
- FR-3 — Encarnar @pedro-valerio (persona/role Process Absolutist aprofundada)
- FR-8 — 10 meta-axiomas
- FR-9 — Scoring ponderado + modernization score + veto conditions
- FR-15 — Auto-detecção via socket existente (estrutura + `config.yaml` com nomes exactos)
- FR-17 — Degradação limpa

**OUT (fases posteriores ou fora de scope):**
- FR-1 (@thiago_finch) — Fase 2, D2
- FR-4, FR-5, FR-6 (pipeline `*clone-mind` formalizado, composição completa da mind com
  output-examples, fidelity ≥90) — Fase 2. **Nota:** o DNA actual do Alan Nicolas (370L) já contém
  `mental_frameworks`, `decision_heuristics`, `anti_patterns_he_rejects` (verificado nesta sessão,
  linhas 107/174/208) — estes SÃO integrados nesta epic (fazem parte do FR-2). O que falta é
  `output_examples` como schema formal — isso é FR-5, Fase 2, **fora desta epic**.
- FR-7 (model routing enforcement) — Fase 2
- FR-10, FR-11, FR-12 (resto), FR-13, FR-14 (workflows/tasks pro completos, suite de testes,
  benchmarks) — Fase 3
- FR-16 (delegação aos 3 especialistas) — parcial nesta epic (só 2 dos 3; o fluxo completo com
  @thiago_finch é Fase 2)

---

## ⚠️ Ambiguidade CRÍTICA para o Pedro — resolver antes do @po validar

**Conflito entre o pedido do coordenador e as Constraints do PRD aprovado sobre ONDE vivem os agentes
encarnados.**

O pedido do coordenador descreve escrita em dois locais: `squads/squad-creator-pro/` **e**
`squads/squad-creator/agents/` (os 2 agentes "encarnados"). Mas o PRD aprovado é explícito e não dá
margem para ambiguidade:

- **CON-1:** "Escrita exclusiva em `squads/squad-creator-pro/`. Nada fora disto."
- **NFR-4 (Boundary L4):** "Zero escrita em L1/L2 e **zero edição do `squad-creator` base**."
- **NFR-6:** "A entrega NÃO altera `squad-chief.md`."
- O próprio socket do base já assume este desenho: `on_detected.actions` diz **"Load pro agents:
  `squads/squad-creator-pro/agents/*.md`"** — ou seja, o mecanismo de detecção já espera os agentes
  encarnados dentro da pasta pro, não dentro da pasta base.

**Decisão tomada nesta epic (default, documentada — não assumida em silêncio):** as stories
SCP-MVP.2 e SCP-MVP.3 escrevem os agentes encarnados em `squads/squad-creator-pro/agents/`
(ficheiros NOVOS), lendo `squads/squad-creator/agents/{oalanicolas,pedro-valerio}.md` (as cascas
106L/95L) **só como referência estrutural, read-only, nunca editadas**. Isto respeita CON-1/NFR-4/NFR-6
ao pé da letra e é consistente com o `on_detected.actions` do socket já existente.

**Se o Pedro quisesse mesmo editar as cascas base** (interpretação do coordenador), isso violaria
CON-1/NFR-4/NFR-6 do PRD que ele próprio aprovou 2026-07-02 — recomenda-se **não fazer isso** sem uma
decisão explícita de amendment ao PRD. Sinalizado aqui para confirmação antes de @po validar; as
stories já assumem a leitura conforme-ao-PRD (escrita só em `squads/squad-creator-pro/`).

---

## Stories

| ID | Title | Points | Status |
|----|-------|--------|--------|
| [SCP-MVP.1](SCP-MVP.1-scaffold-squad-creator-pro.story.md) | Scaffold `squads/squad-creator-pro/` (passa integrity_check) | 4sp | Draft |
| [SCP-MVP.2](SCP-MVP.2-encarnar-oalanicolas.story.md) | Encarnar @oalanicolas (DNA 370L integrado) | 8sp | Draft |
| [SCP-MVP.3](SCP-MVP.3-encarnar-pedro-valerio.story.md) | Encarnar @pedro-valerio (Process Absolutist aprofundado) | 5sp | Draft |
| [SCP-MVP.4](SCP-MVP.4-10-meta-axiomas.story.md) | 10 Meta-Axiomas (config) | 5sp | Draft |
| [SCP-MVP.5](SCP-MVP.5-scoring-veto-engine.story.md) | Scoring Ponderado + Modernization Score + Veto Conditions | 8sp | Draft |
| [SCP-MVP.6](SCP-MVP.6-flip-socket-validacao-pro.story.md) | Flip do Socket + Validação `pro_mode=true` | 7sp | Draft |
| [SCP-MVP.7](SCP-MVP.7-degradacao-limpa.story.md) | Degradação Limpa | 4sp | Draft |

**Total:** 41sp | **Track:** Enterprise (PRD), execução Standard por epic | **Duração estimada:** 6-9 dias

---

## Dependencies (sequenciamento interno)

```
SCP-MVP.1 (scaffold) ─┬─→ SCP-MVP.2 (oalanicolas) ─┐
                       ├─→ SCP-MVP.3 (pedro-valerio) ─┬─→ SCP-MVP.5 (scoring/veto) ─┐
                       └─→ SCP-MVP.4 (10 axiomas) ─────┘                             ├─→ SCP-MVP.6 (flip+validação) ─→ SCP-MVP.7 (degradação)
                                                                                       ┘
```

- **.1** é pré-requisito de tudo (cria a árvore de directórios que as restantes populam).
- **.2** e **.3** são paralelas entre si (agentes diferentes); ambas dependem só de .1.
- **.4** (definição dos axiomas) é paralela a .2/.3; depende só de .1.
- **.5** (engine de scoring/veto) depende de **.3** (precisa do pedro-valerio encarnado para hospedar
  o comando) e **.4** (precisa dos axiomas definidos para pontuar).
- **.6** (flip + validação end-to-end) depende de **.2, .3, .5** — só faz sentido provar
  `pro_mode=true` com delegação depois de ambos os especialistas e o engine de axioma existirem.
- **.7** (degradação) depende de **.6** — testar remoção de um pack incompleto prova menos do que
  testar remoção do pack MVP completo.

---

## Constraints (NON-NEGOTIABLE — herdadas do PRD §4-5)

1. **CON-1 — Só L4, só `squads/squad-creator-pro/`.** Nenhuma story desta epic escreve fora desta
   pasta (ver Ambiguidade Crítica acima — inclui NÃO editar `squads/squad-creator/agents/*.md`).
2. **NFR-6 — Socket do base intocado.** `squads/squad-creator/agents/squad-chief.md` não é editado
   por nenhuma story desta epic.
3. **CON-3 / Art. IV — No Invention.** Cada AC rastreia a um FR do PRD (FR-2, FR-3, FR-8, FR-9, FR-15,
   FR-17). Traços de DNA "integrados" são os que já existem em
   `outputs/minds/alan-nicolas/mind_dna_complete.yaml` — nenhum traço/facto novo é inventado.
4. **CON-6 / IDS Art. IV-A — REUSE > ADAPT > CREATE.** Consultar `core/*.js`,
   `checklists/mind-validation.md`, `config/model-routing.yaml`, e a estrutura de `squad-chief.md`
   como referência antes de criar qualquer coisa nova.
5. **NFR-3 — Zero deps novas** sem aprovação explícita do Pedro.
6. **CON-4 — Push só @devops.**
7. **D2 (Pedro, 2026-07-02) — Sem @thiago_finch nesta epic.** Nenhuma story cria ou referencia um
   3.º especialista.

---

## Architecture Reference

- `docs/prd/squad-creator-pro-recreation-PRD.md` — fonte única de requisitos (FR/NFR/CON, §0.1 D1-D3)
- `squads/squad-creator/agents/squad-chief.md` linhas 50-100 (`pro_detection`) e 940-970
  (`mind_cloning_delegation`, referência de como o base já delega aos 2 especialistas locais — padrão
  a espelhar/estender no lado pro)
- `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` (370 linhas, DNA real)

---

## Riscos (achados de diagnóstico nesta sessão, não teóricos)

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| **DNA de Alan Nicolas ainda tem YAML sintacticamente inválido** (story `MIND-DNA-YAML-FIX.1`, Draft, não implementada — confirmado nesta sessão: `js-yaml`/`PyYAML` falham na linha 65) | Alta (é facto actual) | Médio | Se SCP-MVP.2 precisar de **parsing programático estrito** do ficheiro, `MIND-DNA-YAML-FIX.1` deve correr **antes**. Se a integração for feita por leitura/composição manual do texto (não por `yaml.load()` estrito), o risco não bloqueia — documentar a abordagem escolhida no Dev Agent Record de SCP-MVP.2. |
| **Ambiguidade CRÍTICA não resolvida pelo Pedro** (ver secção acima) | Média | Alto (retrabalho se @dev escrever no local errado) | @po confirma com o Pedro antes de mover SCP-MVP.2/.3 para Ready |
| **pedro-valerio não tem DNA extraído equivalente ao de Alan Nicolas** (confirmado nesta sessão: só existe `outputs/minds/alan-nicolas/`, nenhum ficheiro para pedro-valerio) | Alta (é facto actual) | Baixo-Médio | SCP-MVP.3 não pode "integrar DNA" no mesmo sentido que SCP-MVP.2 — a profundidade de pedro-valerio vem do casca existente + do engine de axioma (SCP-MVP.5), não de um ficheiro de mind cloning. AC de SCP-MVP.3 já reflecte isto — não inventar uma "DNA extraction" que não existe. |
| **`integrity_check` do socket só exige pastas não-vazias** — um scaffold "vazio mas tecnicamente não-vazio" (ficheiros stub triviais) já flipa `pro_mode=true` prematuramente, antes do conteúdo real (.2-.5) existir | Média | Médio | SCP-MVP.1 documenta explicitamente que é um scaffold honesto (stub identificável como tal), e SCP-MVP.6 é o gate formal que prova qualidade real antes de considerar a Fase 1 "pronta" |

---

## Definition of Done (Epic)

- [ ] SCP-MVP.1 a .7 com status Done
- [ ] `squads/squad-creator-pro/config.yaml` + `agents/`, `tasks/`, `workflows/` existem e passam
      `integrity_check` do socket base
- [ ] `squads/squad-creator-pro/agents/oalanicolas.md` (300+ linhas) integra o DNA real de
      `mind_dna_complete.yaml` (voice_dna, thinking_dna incl. mental_frameworks/decision_heuristics/
      anti_patterns_he_rejects, architecture_philosophy, aiox_design_decisions, aiox_journey)
- [ ] `squads/squad-creator-pro/agents/pedro-valerio.md` encarnado com capacidade de axioma assessment
- [ ] 10 meta-axiomas definidos e scoring ponderado + modernization score + veto conditions funcionais
- [ ] `*validate-squad` corre em `pro_mode=true` com delegação real a @oalanicolas + @pedro-valerio
- [ ] Remover `squads/squad-creator-pro/` degrada limpo para o modo base (zero file-not-found)
- [ ] `squads/squad-creator/agents/squad-chief.md` e as cascas base (`oalanicolas.md`,
      `pedro-valerio.md`) permanecem byte-idênticas ao estado pré-epic (diff vazio)
- [ ] Zero commits/push (autoridade @devops)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-07-02 | @sm (River) | Epic criado a partir de `docs/prd/squad-creator-pro-recreation-PRD.md` (APROVADO). Verificado `docs/stories/epics/` antes de CREATE — sem colisão "SCP"/"squad-creator-pro" (regra IDS/ALWAYS). Confirmado nesta sessão: EPIC-SQUAD-FUSION Done (commit e4aa891); socket `pro_detection` real em `squad-chief.md` L53-100; `squads/squad-creator-pro/` ainda não existe; DNA do Alan Nicolas (370L) tem estrutura real (`mental_frameworks`/`decision_heuristics`/`anti_patterns_he_rejects` dentro de `thinking_dna`, verificado por grep) mas ainda falha parse YAML estrito (story `MIND-DNA-YAML-FIX.1` Draft, não implementada); não existe ficheiro de DNA extraído para pedro-valerio. **Ambiguidade crítica sinalizada:** o pedido do coordenador descrevia escrita em `squads/squad-creator/agents/` para os agentes encarnados, o que contradiz CON-1/NFR-4/NFR-6 do PRD aprovado — as stories seguem o PRD (escrita só em `squads/squad-creator-pro/`), com a divergência documentada para confirmação do Pedro. | @sm (River) |

---

**Created by:** @sm (River) | **Date:** 2026-07-02 | **Next:** @po `*validate-story-draft` para SCP-MVP.1 a .7 (confirmar a Ambiguidade Crítica com o Pedro primeiro)
