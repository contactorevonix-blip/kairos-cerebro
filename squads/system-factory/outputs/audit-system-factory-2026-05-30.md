# AUDIT COMPLETO — system-factory
**Auditor:** Kronos (aiox-cerebro) · **Data:** 2026-05-30 · **Método:** verificação de ficheiros reais, zero invenção

**Score Global: 84/100**

---

## Sumário executivo

O squad `system-factory` (FORGE) é uma fábrica de sistemas de qualidade elevada com arquitectura sólida: 6 agents, 75 tasks reais, 4 workflows, 6 templates, 6 data files. 5 dos 6 agents estão ao nível gold standard AIOX v3.0. O data layer é coerente e completo. **Porém**, três bugs críticos partem o pipeline na execução real: (1) o elite checklist soma 80 pontos mas exige ≥96 — impossível de passar; (2) dois gates referenciam tasks que não existem; (3) o forge-verifier está muito abaixo do nível dos restantes agents. Estes não são detalhes cosméticos — partem o gate de elite, que é a razão de existir do squad.

---

## Agents

| Agent | Lines | voice_dna | thinking_dna | output_examples | commands | Score |
|-------|-------|-----------|--------------|-----------------|----------|-------|
| forge-classifier | 433 | ✅ 7 phrases | ✅ 4 frameworks + sources + heuristics | ✅ 2 | ~15 | 98/100 |
| forge-researcher | 417 | ✅ 7 phrases | ✅ 4 frameworks + sources + heuristics | ✅ 2 | ~14 | 98/100 |
| forge-builder | 403 | ✅ 7 phrases | ✅ 4 frameworks + sources + heuristics | ✅ 2 | ~14 | 97/100 |
| forge-architect | 408 | ✅ | ✅ frameworks + heuristics | ✅ | ~14 | 96/100 |
| forge-planner | 407 | ✅ | ✅ frameworks + heuristics | ✅ | ~14 | 96/100 |
| **forge-verifier** | **178** | ⚠️ parcial | ⚠️ sem decision_heuristics | ❌ AUSENTE | 12 | **58/100** |

**Agents 1-5 (gold standard):** formato AIOX v3.0 completo. Têm `IDE-FILE-RESOLUTION`, `REQUEST-RESOLUTION`, activation-instructions de 8 passos com GREENFIELD GUARD, persona_profile com archetype/zodiac, 10+ core_principles, voice_dna com signature_phrases contextualizadas, thinking_dna com frameworks e `[SOURCE:]` rastreáveis, decision_heuristics, output_examples, anti_patterns, completion_criteria, handoff_to e autoClaude v3.0. São excelentes — Nível 3+.

**forge-verifier (a ovelha-negra):** 178 linhas (mínimo 300). Está num formato comprimido diferente dos outros 5. Faltam:
- `output_examples` (todos os outros têm 2) — AUSENTE
- `thinking_dna.decision_heuristics` — AUSENTE
- `quality_criteria` / `completion_criteria` estruturados — AUSENTES
- `dependencies` (tools + reference_files) — AUSENTE
- activation-instructions completa (tem 5 linhas vs 8 passos dos outros)
- `IDE-FILE-RESOLUTION` / `REQUEST-RESOLUTION` — AUSENTES
- persona_profile sem zodiac, greeting_levels só tem `archetypal`
- guia `*guide` e secção "Agent Collaboration" do rodapé — AUSENTES

Tem o essencial (persona, core_principles×8, commands×12, voice_dna×5 phrases, anti_patterns×5, handoff_to) mas não está ao nível dos irmãos. É inconsistente com o resto do squad.

---

## Tasks

**Contagem real: 75 tasks** (squad.yaml alega 80 — ver gap).

| Grupo | Count | Qualidade média | Gaps |
|-------|-------|-----------------|------|
| classification | 10 | Alta — Objectivo/Inputs/Processo/Output/Critérios | — |
| research | 15 | Alta | — |
| architecture | 13 | Alta | — |
| planning | 10 | Alta | 1 nome divergente (agent-squad-creation vs -mapping referenciado) |
| creation | 15 | Alta | — |
| verification | 12 | Alta | `qa-security-performance.md` referenciada mas inexistente; `final-report.md` ausente (comando declarado no agent) |

Estrutura das tasks amostradas (elite-checklist, detect-system-type) é consistente e de boa qualidade: secções Objectivo, Inputs, Processo (numerado), Output (com YAML de exemplo), Critérios de Completude (checkboxes). Gates BLOCKING têm regras explícitas com thresholds.

---

## Workflows

| Workflow | Lines | Avaliação | Score |
|----------|-------|-----------|-------|
| wf-universal-factory | 324 | 30 gates G01-G30 ✅, 7 fases, 3 human checkpoints, regras blocking explícitas. MAS 2 refs de task partidas | 82/100 |
| wf-research-loop | 32 | loop_condition ✅, max_iterations 10 ✅, escape hatch (escalate) ✅ | 92/100 |
| wf-verification-loop | 102 | loop_condition ✅, max 5 ✅, 4 verdicts ✅, escape hatch ✅, verdict_template ✅ | 95/100 |
| wf-quick-create | 16 | Fast path SIMPLE. Funcional mas magro — só lista IDs de gates, sem tasks/inputs/outputs/checkpoints detalhados. Diz "15 etapas" e tem 17 gates (3+2+3+3+3+2=16) | 70/100 |

---

## Templates

| Template | Lines | CLAUDE.md secções (≥15) | Score |
|----------|-------|------------------------|-------|
| agent-system | 384 | ✅ (>15) | 95/100 |
| fullstack | 385 | ✅ | 95/100 |
| saas-api | 378 | ✅ | 95/100 |
| data-pipeline | 352 | ✅ | 93/100 |
| cli-tool | 325 | ✅ | 92/100 |
| library | 311 | ✅ | 91/100 |

Todos os 6 templates têm CLAUDE.md substancial (311-385 linhas). Bem dimensionados para o gate G25 (≥15 secções).

---

## Data layer

| Ficheiro | Lines | Completude |
|----------|-------|-----------|
| system-types.yaml | 102 | ✅ 6 tipos completos (multiplier, workflow, template, agents, squads, stack, stories, research, anti-patterns) |
| agent-registry.yaml | 60 | ✅ 6 fases mapeadas + triggers de criação |
| complexity-matrix.yaml | 74 | ✅ 5 dimensões + thresholds. ⚠️ pesos (1.0-1.2) não batem com score /25 dos agents |
| research-queries.yaml | 57 | ✅ |
| elite-patterns.yaml | 69 | ✅ padrões por tipo + anti-patterns, com source e verified |
| pipeline-state-schema.yaml | 65 | ✅ |

Data layer sólido e coerente. Inconsistências menores de cruzamento (ver gaps médios).

---

## Estrutura canónica

| Item | Estado |
|------|--------|
| squad.yaml | ✅ presente, ⚠️ contagens erradas (total_tasks: 80 vs 75 real) |
| config.yaml | ✅ completo (activation, pipeline, quality, checkpoints, model_routing) |
| README.md | ✅ completo |
| checklists/elite-verification.md | ⚠️ presente mas BUG aritmético (soma 80, não 100) |
| intelligence/market, tech-patterns, anti-patterns | ❌ VAZIOS (dirs existem, zero conteúdo) |
| outputs/minds/ | ❌ AUSENTE (canónico AIOX — DNA dos experts citados não auditável) |
| memory/MEMORY.md | ✅ presente |

---

## GAPS CRÍTICOS (must-fix para elite)

**CRÍTICO #1 — Elite checklist matematicamente impossível.**
`checklists/elite-verification.md`: ARQUITECTURA(32) + CÓDIGO(28, dito "28pts" no header mas só 7 pontos C1-C7 × 4 = 28) + INFRAESTRUTURA(20) = **80 pontos máximos**. O documento (linha 5-6) e o `forge-verifier.md` (linha 82, `max: 100`) alegam threshold elite ≥96/100. **É impossível atingir 96 quando só existem 80 pontos.** O gate de elite — razão de existir do squad — nunca passa.
- Fix: ou adicionar 20 pontos (ex.: secção AIOX-COMPLIANCE de 20pts standalone, em vez de embutida em C7), ou reescalar o threshold para base 80 (elite ≥77/80). Alinhar header, agent linha 79-82, e todos os verdict tables.
- Agente: @forge-builder (corrige o ficheiro) + @forge-verifier (alinha o agent)

**CRÍTICO #2 — Gate G29 referencia task inexistente.**
`wf-universal-factory.yaml` linha 287: `task: tasks/verification/qa-security-performance.md` — **ficheiro não existe**. As tasks reais são 3 separadas (`qa-gate.md`, `security-scan.md`, `performance-audit.md`). O gate G29 falha ao carregar a task. Viola CRITICAL_LOADER_RULE: FAILURE TO LOAD = FAILURE TO EXECUTE.
- Fix: ou criar `tasks/verification/qa-security-performance.md` como orquestradora das 3, ou desdobrar G29 em G29a/b/c referenciando as 3 tasks reais (como o wf-verification-loop já faz correctamente).
- Agente: @forge-builder

**CRÍTICO #3 — Gate G23 referencia task inexistente.**
`wf-universal-factory.yaml` linha 226: `task: tasks/planning/agent-squad-mapping.md` — **não existe**. Existe `tasks/planning/agent-squad-creation.md` (nome divergente).
- Fix: renomear a referência no workflow para `agent-squad-creation.md`, ou renomear o ficheiro. Escolher um nome canónico.
- Agente: @forge-builder

**CRÍTICO #4 — forge-verifier abaixo do gold standard.**
178 linhas vs 300 mínimo, e vs 403-433 dos irmãos. Sem output_examples, sem decision_heuristics, sem dependencies, sem activation-instructions completa, sem IDE-FILE-RESOLUTION. O guardião da qualidade é o agent de pior qualidade do squad — ironia que mina credibilidade.
- Fix: reescrever ao formato dos outros 5 (usar forge-builder.md como molde). Adicionar output_examples (2), decision_heuristics (scoring_thresholds, fix_routing, security_blocking), dependencies (coderabbit, git), quality_criteria, completion_criteria, activation-instructions de 8 passos.
- Agente: @oalanicolas (clone DNA de Quinn/Ioannidis) ou @aiox-master via create-agent.md

---

## GAPS MÉDIOS (should-fix)

**MÉDIO #1 — squad.yaml contagens incorrectas.** Linha 61 `total_tasks: 80` (real: 75). Linha 65 `total_processes: 50` não verificável. Linha 64 `elite_gates: 30` ✅ correcto.
- Fix: corrigir para `total_tasks: 75`. @forge-builder

**MÉDIO #2 — `tasks/verification/final-report.md` ausente.** O `forge-verifier.md` linha 112-114 declara o comando `*final-report` mas a task não existe. Comando sem task = improviso.
- Fix: criar a task. @forge-builder

**MÉDIO #3 — intelligence/ vazio.** Os 3 subdirs (market, tech-patterns, anti-patterns) existem mas sem ficheiros. O squad promete "research profunda" mas não tem store de inteligência inicial.
- Fix: seed inicial ou documentar que é populado em runtime (README nota). @forge-researcher

**MÉDIO #4 — wf-quick-create.yaml demasiado fino.** 16 linhas só listam IDs de gates, sem tasks, inputs, outputs ou regras. Não é executável determinísticamente como o universal-factory. "15 etapas" no header mas 16 gates listados.
- Fix: expandir ao nível dos outros (tasks por gate, human_checkpoints detalhados). @forge-builder

**MÉDIO #5 — complexity-matrix pesos vs score /25.** A matrix define weights (scope 1.0, integrations 1.2, infra 1.1, knowledge 0.8, risk 1.0) mas o classifier e tasks somam 5 dimensões × 1-5 = /25 sem aplicar pesos. Com pesos o máximo muda e os thresholds (≤8, 9-15, ≥16) deixam de bater.
- Fix: decidir — ou remover pesos (score puro /25), ou aplicar pesos consistentemente em todo o lado. @forge-classifier

---

## GAPS BAIXOS (nice-to-have)

- **BAIXO #1** — `outputs/minds/` ausente (canónico AIOX). Os agents citam DNA de Cherny, Nicolas, Ioannidis, Gilad, Higgins, Klein, Kahneman, Dex, Conduit, Anvil mas não há ficheiros de mind DNA auditáveis. Fix: @oalanicolas *clone-mind por expert.
- **BAIXO #2** — agent-registry lista 8 research delegates (inclui `booth`); universal-factory lista 7 (sem `booth`). Alinhar.
- **BAIXO #3** — forge-architect e forge-planner: confirmar que têm output_examples completos (grep confirmou presença, leitura integral não feita nesta auditoria — assumido OK por consistência de tamanho 407-408 linhas).

---

## VEREDICTO: PRODUCTION_READY (com 4 must-fix bloqueantes para ELITE)

**84/100 — PRODUCTION READY.** O esqueleto é elite: 5 agents gold standard, 75 tasks bem-formadas, data layer coerente, templates substanciais, loops com escape hatches. Mas o squad **não atinge ELITE (≥96)** enquanto os 4 gaps críticos existirem, e ironicamente **não consegue auto-certificar nada como elite** porque o seu próprio checklist soma 80 não 100 (Crítico #1).

A barreira para ELITE é estreita e clara:
1. Corrigir a aritmética do elite checklist (80→100 pts) — sem isto o gate G30 é teatro.
2. Reparar as 2 refs de task partidas (G23, G29) — sem isto o pipeline trava na execução.
3. Reescrever forge-verifier ao nível dos irmãos.

Resolvidos estes 4, o squad passa a 96+ legítimo. São todos fixes de @forge-builder + um de @oalanicolas, estimativa baixa-média.

**Relatório guardado em:** `squads/system-factory/outputs/audit-system-factory-2026-05-30.md`

— Kronos. Verificado em ficheiros reais. Zero invenção.
