# process-mapper — Spec

**Versão:** 1.1 | **Data:** 2026-06-03
**Author:** @pm (Morgan)
**Status:** APPROVED — pronto para Fase 6 PLAN (@architect)
**Critique:** APPROVED_WITH_CONDITIONS → 3 fixes aplicados (QA-01, QA-03, QA-05)
**Sources:** requirements.json · complexity.json · research.json

> **Art.IV Gate:** Todo statement neste documento rastreia para FR-*, NFR-*, CON-*, ADR-PM-*, ou RF-*.
> Statements sem rastreio = invenção = BLOQUEADO.

---

## 1. Sistema

**Nome:** `process-mapper` [FR-02: consumidor único, uso local]
**Filosofia:** "Torna o invisível visível. Nenhuma criação sem mapa validado." [FR-03, FR-04]
**Natureza:** Squad de observabilidade de processos — gera mapas visuais, não modifica código [CON-01]
**Localização de outputs:** `docs/process-maps/` (L4) [CON-01]

---

## 2. Features

---

### FEAT-01 — Geração de Fluxograma HTML Interactivo

**Rastreio:** FR-01 · RF-01 · RF-06

**O que é:** O squad gera um ficheiro `.html` para cada processo AIOX. O HTML é auto-contido (sem servidor), abre no browser, e mostra o fluxo completo com quality gates clicáveis e loops de retorno visíveis.

**Comportamento:**
- `@cartographer-chief *map-process {nome}` invoca `flow-architect` [FR-01, CON-02]
- `flow-architect` lê o ficheiro fonte do processo (ex: `.claude/rules/workflow-execution.md`) [NFR-02]
- Gera HTML em `docs/process-maps/{nome}.html` [CON-01]
- HTML contém: fases como blocos coloridos, quality gates como rombo com threshold ≥ X%, path YES (verde) e path NO (vermelho com destino explícito), loops de retorno com seta identificada [FR-06]
- Prova de conceito existente: `docs/process-maps/aiox-squad-creation-pipeline.html` [RF-01]

**O que NÃO faz:**
- Não requer servidor (sem Next.js, sem Railway, sem API) [CON-01]
- Não modifica ficheiros de processo — só lê [CON-03]

---

### FEAT-02 — Geração de SVG Figma-Compatível

**Rastreio:** FR-01 · RF-01 · T3 research

**O que é:** Para cada processo, o squad gera também um ficheiro `.svg` estruturado que importa directamente no Figma como vector group editável com layers nomeadas.

**Comportamento:**
- Invocado em conjunto com FEAT-01 (mesmo comando `*map-process`)
- Script Node.js gera SVG com `viewBox="0 0 900 600"` e elementos com `id` nomeados (ex: `id="phase-1"`, `id="qg-2"`) [RF-01 — "SVG com viewBox importa no Figma como vector group editável com layers identificáveis"]
- Output: `docs/process-maps/figma/{nome}.svg` [CON-01]
- Alternativa via Mermaid CLI (`@mermaid-js/mermaid-cli`): se instalado, gerar sintaxe Mermaid → converter para SVG [RF-01 — "Mermaid.js gera SVG nativo"]

**Dependência:** `@mermaid-js/mermaid-cli` verificado em `package.json` antes de usar [NFR-02 — zero invenção de tecnologias não validadas]

**Fallback obrigatório (QA-01):** Se `@mermaid-js/mermaid-cli` não estiver instalado, `flow-architect` gera o SVG via template Node.js directo — construindo o SVG como string com elementos `<rect>`, `<text>`, `<path>` e `viewBox="0 0 900 600"`. `@mermaid-js/mermaid-cli` é opcional: melhora qualidade visual mas não é bloqueante. O SVG gerado por template directo é o fallback garantido. [QA-01 fix · NFR-02]

---

### FEAT-03 — Coverage Audit (Tier 0 — process-auditor)

**Rastreio:** FR-04 · RF-05 · T1 research (Gene Kim Current State Map)

**O que é:** Antes de qualquer mapeamento, `process-auditor` executa um audit de cobertura — lista o que existe e o que falta. É o "Current State Map" (Gene Kim) do AIOX.

**Comportamento:**
- `@cartographer-chief *audit-coverage` invoca `process-auditor`
- `process-auditor` lê: `.aiox-core/development/tasks/` (lista ~100+ tasks), `.claude/rules/` (7 rules files), `squads/*/squad.yaml` (5 squads), `.aiox-core/development/workflows/` [NFR-02]
- Compara com `docs/process-maps/` — o que já tem mapa, o que não tem
- Gera `docs/process-maps/coverage-report.md` com: % de cobertura por domínio, lista de gaps por prioridade, próximas acções recomendadas [FR-04]
- Score alvo: ≥ 90% cobertura global [FR-04]

---

### FEAT-04 — Agent Maps (Swim-Lanes)

**Rastreio:** FR-04 · T2 research (Rummler-Brache) · RF-04

**O que é:** `agent-cartographer` gera diagramas de swim-lane para os 10 agentes AIOX — quem faz o quê, onde delegam, e onde os handoffs acontecem.

**Comportamento:**
- `@cartographer-chief *map-squad {nome-squad}` ou `*map-agents` invoca `agent-cartographer`
- Fonte de verdade: `.claude/rules/agent-authority.md` [NFR-02]
- Padrão: 1 swim lane por agente, actividades dentro da lane, handoffs como setas que cruzam lanes [RF-04 — "swim lanes = 1 lane por agente, handoffs explícitos"]
- Output: `docs/process-maps/agents/{agente}.html` (HTML interactivo) [CON-01]
- Handoffs marcados com símbolo visual distinto (diamante ou seta dupla) [RF-04 — "handoff points são onde mais erros acontecem — devem ser explicitamente marcados"]

---

### FEAT-05 — Structure Maps (L1-L4)

**Rastreio:** FR-04 · complexity.json ADR-PM-002

**O que é:** `structure-mapper` gera mapa visual da estrutura de pastas AIOX com código de cores por mutabilidade (L1=vermelho/imutável → L4=verde/sempre modificável).

**Comportamento:**
- `@cartographer-chief *map-structure` invoca `structure-mapper`
- Lê: `squads/*/` (estrutura real), `.aiox-core/` (estrutura real), `.claude/` (estrutura real) [NFR-02]
- **Fonte canónica para classificação L1-L4 (QA-03):** `.claude/CLAUDE.md` — secção "Framework vs Project Boundary" — tabela com paths por camada. `structure-mapper` lê este ficheiro como input para classificar cada pasta. [QA-03 fix · NFR-02]
- Código de cores: L1=`#EF4444` (nunca modificar), L2=`#F97316` (extend only), L3=`#EAB308` (mutable exceptions), L4=`#22C55E` (always modify) [CON-01 — derivado da tabela em .claude/CLAUDE.md]
- Output: `docs/process-maps/structure/aiox-layers.html` [CON-01]

---

### FEAT-06 — Gate Pré-Criação Automático (FR-03)

**Rastreio:** FR-03 · ADR-PM-001 · RF-02 · ADR-PM-002

**O que é:** Hook `UserPromptSubmit` que interceta comandos de criação de artefactos AIOX e verifica se existe mapa de processo validado antes de prosseguir.

**Comportamento:**
- Script: `.claude/hooks/process-map-gate.cjs` [ADR-PM-001]
- Adicionado como 4º hook em `UserPromptSubmit` em `.claude/settings.json` [RF-02 — "UserPromptSubmit tem 3 hooks activos — gate adiciona o 4º"]
- Síncrono (sem `async: true`) para bloquear efectivamente [RF-02 — "gate pré-criação DEVE ser síncrono"]
- Detecta comandos: `*create-*`, `*draft`, `*create-epic`, `*create-story`, `*create-agent`, `*create-squad` [FR-03]
- Se mapa não existe ou score < 90%: retorna mensagem bloqueante com instrução `*map-process {processo}` [FR-03, NFR-01]
- **Bypass de emergência:** flag `--skip-map-gate` no comando desactiva o gate para aquele comando [ADR-PM-001 — "bypass obrigatório"]
- **Activação:** APENAS após EPIC-PM-001 (Fase A — Process Maps) estar Done [ADR-PM-002 — "gate só activa depois de EPIC-PM-001 Done"]

---

### FEAT-07 — Actualização Automática de Mapas (FR-05)

**Rastreio:** FR-05 · ADR-PM-001 · RF-03

**O que é:** Hook `PostToolUse` que detecta modificações em ficheiros de processo e re-gera o mapa correspondente automaticamente.

**Comportamento:**
- Matcher: `Write` e `Edit` tools [RF-03 — "PostToolUse com matcher Write ou Edit para detectar modificações"]
- Assíncrono (`async: true`) para não bloquear o trabalho [RF-02 — "FR-05 pode ser async"]
- Filtro de path: **excluir** `docs/process-maps/**` do trigger para evitar loop [RF-03 — "risco de loop documentado e mitigado: excluir docs/process-maps/"]
- **Mapeamento ficheiro→processo (QA-05):** definido em `squads/process-mapper/data/process-registry.yaml`. Formato: `{source_file: path, maps_to: [processo1, processo2]}`. Exemplo: `{source_file: ".claude/rules/workflow-execution.md", maps_to: ["sdc", "qa-loop", "spec-pipeline", "brownfield"]}`. `evolution-tracker` cria e mantém este registry. Quando um processo novo é criado, o registry é actualizado manualmente ou via `*register-process`. [QA-05 fix · FR-05 · CON-03]
- Se re-geração falha: regista em `.aiox/process-map-errors.log` (não bloqueia) [NFR-01 — qualidade não pode bloquear trabalho em curso]

---

### FEAT-08 — Evolution Tracker

**Rastreio:** FR-04 (Domínio D5) · T1 research (Gene Kim Lead Time) · complexity.json

**O que é:** `evolution-tracker` regista e visualiza como o AIOX muda ao longo do tempo.

**Comportamento:**
- `@cartographer-chief *map-evolution` invoca `evolution-tracker`
- Lê: `git log` para detectar mudanças em ficheiros de processo [NFR-02]
- Lê: `STATE.md` para contexto de sessão [NFR-02]
- Output: `docs/process-maps/evolution/timeline.html` — linha do tempo visual de versões e mudanças de processo [CON-01]
- Regista: data da mudança, ficheiro afectado, tipo de mudança (nova fase, agente removido, threshold alterado) [FR-04]

---

## 3. Arquitectura Técnica

**Rastreio:** ADR-PM-001 · ADR-PM-002 · ADR-PM-003 · ADR-PM-004

### 3.1 Stack

| Componente | Tecnologia | Rastreio |
|-----------|-----------|---------|
| Geração HTML | Node.js script + template strings | ADR-PM-004 |
| Geração SVG | Node.js + `@mermaid-js/mermaid-cli` (se disponível) | RF-01 |
| Gate pré-criação | Claude Code hook `UserPromptSubmit` | ADR-PM-001 |
| Actualização automática | Claude Code hook `PostToolUse` | RF-03 |
| Coordenação de hooks | hooks-architect (claude-code-mastery squad) | ADR-PM-003 |

### 3.2 Estrutura de Ficheiros do Squad

```
squads/process-mapper/
├── squad.yaml
├── config.yaml
├── config/
│   ├── quality-gates.yaml
│   ├── model-routing.yaml
│   └── permissions.yaml
├── agents/
│   ├── cartographer-chief.md
│   ├── process-auditor.md
│   ├── flow-architect.md
│   ├── structure-mapper.md
│   ├── agent-cartographer.md
│   ├── evolution-tracker.md
│   └── map-validator.md
├── tasks/
│   ├── map-process.md
│   ├── map-squad.md
│   ├── audit-coverage.md
│   ├── map-evolution.md
│   ├── validate-map.md
│   └── generate-all-maps.md
├── workflows/
│   ├── wf-map-process.yaml
│   ├── wf-map-squad.yaml
│   ├── wf-audit-coverage.yaml
│   └── wf-map-evolution.yaml
├── checklists/
│   └── map-quality-checklist.md
├── data/
│   └── process-registry.yaml
└── hooks/
    ├── process-map-gate.cjs      (FR-03)
    └── process-map-updater.cjs   (FR-05)
```

### 3.3 Outputs em docs/

```
docs/process-maps/
├── coverage-report.md            (FEAT-03)
├── {processo}.html               (FEAT-01)
├── figma/
│   └── {processo}.svg            (FEAT-02)
├── agents/
│   └── {agente}.html             (FEAT-04)
├── structure/
│   └── aiox-layers.html          (FEAT-05)
└── evolution/
    └── timeline.html             (FEAT-08)
```

---

## 4. Quality Gates do Squad

**Rastreio:** NFR-01 · NFR-02

| Gate | Critério | Blocking |
|------|---------|---------|
| QG-PM-1 | Mapa rastreia para ficheiro real (map-validator score ≥ 90%) | SIM |
| QG-PM-2 | HTML abre no browser sem erros JavaScript | SIM |
| QG-PM-3 | SVG importa no Figma como vector group | SIM |
| QG-PM-4 | Coverage audit mostra ≥ 90% após Fase E | SIM |
| QG-PM-5 | Gate pré-criação não bloqueia comandos legítimos sem *create-* | SIM |
| QG-PM-6 | PostToolUse não entra em loop (docs/process-maps/ excluído) | SIM |

---

## 5. Out of Scope (v1.0)

**Rastreio:** FR-02 (consumidor único), CON-01, CON-02

- Interface web multi-utilizador ou partilha pública [FR-02 — só Pedro]
- Integração com Figma API (import automático) — output é ficheiro, não push [CON-01]
- Geração de mapas para projectos fora do AIOX [CON-03]
- Dashboards com actualizações em tempo real via websocket [CON-02 — CLI first]
- Mapeamento de código-fonte (funções, classes) — só processos AIOX [CON-03]

---

## 6. Rastreio Completo (Art.IV Compliance Check)

| Statement | Rastreia para |
|---------|--------------|
| "Squad gera HTML + SVG" | FR-01 |
| "Consumidor único — docs/ local" | FR-02 |
| "Gate pré-criação automático" | FR-03 |
| "Cobertura ≥ 90%" | FR-04 |
| "Actualização automática quando processo muda" | FR-05 |
| "Quality gates visíveis nos mapas" | FR-06 |
| "Qualidade > velocidade" | NFR-01 |
| "Cada elemento rastreia para ficheiro real" | NFR-02 |
| "5 domínios completos" | NFR-03 |
| "Outputs em docs/ (L4)" | CON-01 |
| "CLI first" | CON-02 |
| "Zero invenção" | CON-03 |
| "Push via @devops" | CON-04 |
| "Enterprise Track" | CON-05 |
| "UserPromptSubmit como mecanismo de gate" | ADR-PM-001, RF-02 |
| "Fase A antes de activar gate" | ADR-PM-002 |
| "Reutilizar hooks-architect" | ADR-PM-003 |
| "Node.js script para HTML, não inline" | ADR-PM-004 |
| "Swim lanes — 1 por agente" | RF-04, T2 research |
| "process-auditor faz Current State Map primeiro" | RF-05, T1 research |
| "3 fases independentes: HTML→swimlanes→hooks" | RF-06 |

**Statements sem rastreio encontrados:** 0
**Art.IV status:** COMPLIANT

---

*spec.md v1.0 — process-mapper — 2026-06-03*
*Próxima acção: @qa *critique docs/prd/process-mapper/spec.md*
