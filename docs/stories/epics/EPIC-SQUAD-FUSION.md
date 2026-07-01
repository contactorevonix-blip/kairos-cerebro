# EPIC-SQUAD-FUSION — Fusão squad-creator: Cablagem Canónica + Mind-Cloning

**Epic ID:** EPIC-SQUAD-FUSION | **Status:** Draft | **Owner:** @sm (River) | **Created:** 2026-07-01

---

## Context

`squads/squad-creator/` (local, L4) tem um diferenciador único no ecossistema AIOX — **mind-cloning**
(`core/voice-dna.js`, `core/thinking-dna.js`, agentes `oalanicolas` e `pedro-valerio`, DNA extraído em
`outputs/minds/alan-nicolas/mind_dna_complete.yaml`) — mas está cablado no **formato errado**
(frontmatter de subagent Claude Code: `--- name/model/tools ---` + markdown solto), o que significa
que os seus agentes **não ligam** às próprias tasks/templates/checklists do squad. Não há bloco `yaml`
operacional (`IDE-FILE-RESOLUTION` + `activation-instructions` + `commands` + `dependencies`) como
existe nos 12 agentes principais do AIOX e no squad-creator remoto
(`github.com/SynkraAI/aiox-squads/tree/main/squads/squad-creator`).

O remoto tem a cablagem canónica completa (24 tasks, 22 templates, 22 scripts, 30 docs, 9 checklists,
3 workflows) mas **não tem mind-cloning** — é um squad-creator genérico.

O Pedro decidiu **fundir**: puxar a base bem-cablada do remoto para `squads/squad-creator/` e enxertar
nela o mind-cloning local, convertendo os agentes de mind-cloning para o formato canónico. Ver brief
completo em `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` (diff estrutural secção 3,
plano de 3 fases secção 4, colisões secção 3.3, restrições secção 5).

---

## Goal

`squads/squad-creator/` passa a ter a cablagem canónica AIOX (todos os `agents/*.md` com bloco yaml
operacional, ligados a tasks/templates/checklists reais) **e** preserva o mind-cloning como
diferenciador funcional end-to-end — sem overwrite de `core/*.js` nem de `outputs/minds/`.

---

## Scope

**IN:**
- Puxar do remoto C (`SynkraAI/aiox-squads`, branch `main`, `squads/squad-creator/`): `agents/squad-chief.md`
  canónico, 9 checklists, `config/workflow-yaml-schema.yaml`, 10 ficheiros `data/`, 30 docs, `protocols/`,
  22 scripts, 24 tasks, 22 templates, 3 workflows, `package.json`, `requirements.txt`
- Preservar e verificar intactos os assets únicos do local B: `core/*.js` (7 ficheiros), `outputs/minds/`,
  `config/model-routing.yaml`, tasks de mind-cloning (7), `workflows/wf-clone-mind.yaml`,
  `checklists/mind-validation.md`
- Converter `oalanicolas.md` e `pedro-valerio.md` (e re-cablar `squad-chief.md`) para formato canónico
- Ligar `squad-chief` para delegar comandos de mind-cloning a `@oalanicolas`/`@pedro-valerio`
- Reconciliar colisões de nome (regra: base C vence formato; secção 3.3 do brief)
- Gate de validação: correr os validadores de C (`validate-squad-structure.py`, `coherence-validator.py`,
  `naming_validator.py`) + smoke test do mind-cloning end-to-end

**OUT:**
- `squad-creator-pro` remoto (só README, produto pago — nada para puxar)
- Qualquer modificação a `.aiox-core/` (L1/L2) — inclui não tocar no squad-creator nativo
  (`.aiox-core/development/agents/squad-creator.md`), que serve apenas de referência de formato
- Extracção de novo mind DNA (fora do scope; esta fusão preserva o DNA já extraído)
- Publicação/push do resultado (autoridade exclusiva @devops)

---

## Stories

| ID | Title | Points | Status |
|----|-------|--------|--------|
| [SQUAD-FUSION.1](SQUAD-FUSION.1-pull-canonical-wiring-base.story.md) | Pull Canonical Wiring Base (squad-chief.md + checklists + config + docs + protocols) | 3sp | Draft |
| [SQUAD-FUSION.2](SQUAD-FUSION.2-pull-remaining-package-assets.story.md) | Pull Remaining Package Assets (tasks, templates, scripts, workflows, package manifests) | 3sp | Draft |
| [SQUAD-FUSION.3](SQUAD-FUSION.3-preserve-verify-mind-cloning-core.story.md) | Preserve & Verify Mind-Cloning Core Assets | 2sp | Draft |
| [SQUAD-FUSION.4](SQUAD-FUSION.4-convert-mind-agents-canonical-format.story.md) | Convert oalanicolas.md + pedro-valerio.md to Canonical Format | 5sp | Draft |
| [SQUAD-FUSION.5](SQUAD-FUSION.5-wire-squad-chief-mind-delegation.story.md) | Wire squad-chief Delegation to Mind-Cloning Agents | 3sp | Draft |
| [SQUAD-FUSION.6](SQUAD-FUSION.6-reconcile-collisions-merge-config.story.md) | Reconcile Collisions + Merge config.yaml/CHANGELOG/README/HEADLINE | 4sp | Draft |
| [SQUAD-FUSION.7](SQUAD-FUSION.7-validation-gate.story.md) | Validation Gate — Structural Validators + Mind-Cloning Smoke Test | 4sp | Draft |

**Total:** 24sp | **Track:** Standard (SDC completo) | **Duração estimada:** 5-8 dias

---

## Dependencies (sequenciamento interno)

```
SQUAD-FUSION.1 ─┐
                 ├─→ SQUAD-FUSION.4 ─→ SQUAD-FUSION.5 ─┐
SQUAD-FUSION.2 ─┘                                       ├─→ SQUAD-FUSION.6 ─→ SQUAD-FUSION.7
SQUAD-FUSION.3 ─────────────────────────────────────────┘
```

- **.1 e .2** (Fase 1 — puxar base C) são paralelas entre si; ambas devem estar Done antes de **.4**
  (precisa do `squad-chief.md` canónico como referência de formato).
- **.3** (verificação do mind-cloning intacto) é independente e pode correr em paralelo com .1/.2.
- **.4** depende de .1 (formato canónico) e .3 (confirmação do que preservar).
- **.5** depende de .4 (agentes convertidos já existem para delegar).
- **.6** depende de .1, .2, .4, .5 (reconcilia tudo).
- **.7** (gate final) depende de .6.

---

## Constraints (NON-NEGOTIABLE — herdadas do brief secção 5)

1. **Art. IV-A IDS = ADAPT, nunca overwrite** de `core/*.js` nem `outputs/minds/`.
2. **Formato canónico obrigatório** em todos os `agents/*.md` finais (bloco yaml + activation-instructions
   + dependencies).
3. **Só L4** — nenhuma story desta epic escreve em `.aiox-core/` (L1/L2). Todo o trabalho fica em
   `squads/squad-creator/`.
4. **Mind-cloning funcional end-to-end** — se se perder, a fusão falhou (critério de aceitação da epic).
5. **Zero deps novas** sem aprovação explícita do Pedro (ver ambiguidade sobre `package.json`/
   `requirements.txt` de C na Change Log/handoff desta epic).
6. **Push só via @devops.**

---

## Architecture Reference

`docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` — diff estrutural completo (§3),
plano de fusão em 3 fases (§4), tabela de colisões (§3.3).

---

## Constitutional Alignment

| Artigo | Como esta epic reforça |
|--------|------------------------|
| IV-A (IDS) | ADAPT explícito — puxa base existente (C) em vez de recriar cablagem do zero; preserva REUSE do mind-cloning (B) |
| IV (No Invention) | Nenhuma funcionalidade nova inventada — só reconciliação estrutural de dois squads existentes |
| VI-VII (Framework Boundary) | Todo o trabalho fica em L4 (`squads/`); squad-creator nativo (`.aiox-core/development/agents/squad-creator.md`) usado só como referência, nunca editado |
| II (Agent Authority) | @sm cria as stories; push permanece exclusivo de @devops |

---

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Overwrite acidental de `core/*.js` ou `outputs/minds/` ao copiar a base C | Média | Alto (perde o diferenciador) | SQUAD-FUSION.3 corre ANTES de qualquer merge de config; diff explícito antes de qualquer `Write` sobre paths preservados |
| Conversão de `oalanicolas.md`/`pedro-valerio.md` perde comportamento (ex.: devil's advocate, veto conditions) | Média | Alto | SQUAD-FUSION.4 exige mapeamento 1:1 de cada secção do markdown solto para o bloco yaml canónico, revisto item a item |
| Scripts Python de C (22, incl. `validate-squad-structure.py`) exigem deps não instaladas (`requirements.txt`) | Alta | Médio | SQUAD-FUSION.7 corre `pip install -r requirements.txt` num ambiente isolado do squad; ver [AUTO-DECISION] sobre zero-deps na Change Log |
| Colisão de `config.yaml` perde secções `model-routing`/mind do local | Média | Alto | SQUAD-FUSION.6 faz merge explícito, não overwrite; AC lista as secções que têm de sobreviver |
| Squad-chief re-cablado quebra comandos hoje usados pelo Pedro (`/Chiefs:agents:squad-chief`) | Baixa | Médio | SQUAD-FUSION.5 mantém os comandos de activação existentes como alias no bloco `commands` canónico |

---

## Definition of Done (Epic)

- [ ] SQUAD-FUSION.1 a .7 com status Done
- [ ] Todos os `squads/squad-creator/agents/*.md` em formato canónico (bloco yaml + IDE-FILE-RESOLUTION
      + activation-instructions + commands + dependencies)
- [ ] `core/*.js` (7 ficheiros) e `outputs/minds/alan-nicolas/mind_dna_complete.yaml` byte-idênticos ao
      estado pré-fusão (diff vazio)
- [ ] `squad-chief` delega correctamente para `@oalanicolas` (Voice/Thinking DNA) e `@pedro-valerio`
      (axioma/veto) via comando canónico
- [ ] Validadores de C (`validate-squad-structure.py`, `coherence-validator.py`, `naming_validator.py`)
      correm e passam sobre `squads/squad-creator/`
- [ ] Smoke test end-to-end do mind-cloning (SQUAD-FUSION.7) demonstra que o fluxo de clonagem continua
      a funcionar após a fusão
- [ ] Nenhum ficheiro escrito fora de `squads/squad-creator/` (verificado por `git status` / `git diff --stat`)
- [ ] Zero commits/push (autoridade @devops, fora do scope destas stories)

---

## Ambiguidades para o Pedro (antes de @po validar)

1. **`package.json`/`requirements.txt` de C** declaram as deps dos 22 scripts do squad-creator (Node +
   Python). São deps **scoped ao squad** (não à raiz do repositório Kairos Check), mas tecnicamente são
   "deps novas". A restrição #5 ("zero deps novas sem aprovação") bloqueia isto até o Pedro confirmar se
   deps *scoped a `squads/squad-creator/`* estão implicitamente aprovadas pela decisão de fusão, ou se
   precisam de aprovação explícita em separado (SQUAD-FUSION.2 e .7 assumem que sim, mas fica marcado
   como pendente de confirmação).
2. ~~**`squad.yaml` (raiz local, só existe em B)**~~ — **RESOLVIDA.** [Decisão Pedro 2026-07-01]:
   `squad.yaml` e `config.yaml` são o MESMO conceito → **consolidados numa única fonte de verdade**,
   implementado em SQUAD-FUSION.6 AC3 (mapeamento campo-a-campo de `squad.yaml` para `config.yaml`,
   registado em `collision-resolution-log.md`; decisão sobre remover o ficheiro físico ou mantê-lo como
   stub fica registada no Dev Agent Record dessa story). Já não é ambiguidade em aberto.
3. **Execução real dos scripts Python de C (validadores)** — SQUAD-FUSION.7 assume que os validadores
   podem ser executados localmente (Python 3.12 já instalado nesta máquina, confirmado em
   SKILL-CREATOR.1). Se o Pedro preferir que a validação fique documentada mas não executada nesta
   ronda (ex.: por reserva sobre instalar `requirements.txt` de C sem revisão), AC3-AC5 de
   SQUAD-FUSION.7 precisam de ajuste (relatório dry-run em vez de execução real).
4. **Quais dos 30 docs de C são essenciais vs apenas referência** — alguns títulos (`MIGRATION-*`)
   sugerem contexto de migração que pode não se aplicar a este squad (não há um squad-creator antigo a
   migrar, é uma fusão). SQUAD-FUSION.1 assume "puxar todos os 30 tal como estão" (fiel ao remoto);
   confirmar se algum deve ser adaptado/anotado como N/A para este contexto.

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-07-01 | @sm (River) | Epic criado a partir de `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md`. Verificado `docs/stories/epics/` antes de CREATE — sem colisão de nome com "SQUAD-FUSION" (regra IDS/ALWAYS). Confirmado via `gh api` que a árvore de C corresponde ao brief e que `outputs/minds/alan-nicolas/mind_dna_complete.yaml` existe em `squads/squad-creator/outputs/minds/` (não em `outputs/minds/` da raiz, como o texto do brief poderia sugerir de forma ambígua — path correcto é relativo à raiz do squad). |
| 2026-07-01 | @sm (River) | **Correcção pós-amendment (SQUAD-FUSION.6 re-validada GO 9/10 pelo @po):** Ambiguidade 2 marcada como **RESOLVIDA** — reescrita para reflectir a decisão do Pedro (2026-07-01): `squad.yaml`=`config.yaml` → consolidados numa única fonte de verdade, implementado em SQUAD-FUSION.6 AC3. A redacção anterior ("SQUAD-FUSION.6 assume... preservar squad.yaml como está") contradizia essa decisão e foi corrigida. Nenhuma outra referência stale a "preservar squad.yaml" encontrada no resto do épico (Scope, Constraints, Risks, Definition of Done não mencionam `squad.yaml`). |

---

**Created by:** @sm (River) | **Date:** 2026-07-01 | **Next:** @po `*validate-story-draft` para SQUAD-FUSION.1 a .7
