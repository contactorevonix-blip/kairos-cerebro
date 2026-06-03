# EPIC-004: KAIROS COMMAND CENTER (KCC)

## Status
**GO FINAL** — Design ✅ · Arquitectura ✅ · @sm autorizado a criar stories Sprint 1

## Metadados

| Campo | Valor |
|-------|-------|
| Epic ID | EPIC-004 |
| Nome | KAIROS COMMAND CENTER |
| Produto | KAIROS_CEREBRO (ferramenta interna) |
| PM | Morgan (@pm) |
| Data criação | 2026-06-03 |
| Track | Enterprise |
| Sprints | 3 |
| Stories estimadas | 11 |
| Duração estimada | 3 semanas |

---

## Visão

**O quê:** Aplicação web interactiva local que transforma o KAIROS_CEREBRO de uma pasta de ficheiros num cockpit visual e operacional.

**Para quem:** Pedro Leal — solo founder, utilizador diário do KAIROS_CEREBRO.

**Porquê:** Pedro tem 40+ agentes, 100+ tasks, 5 squads, 15 stories, 12 hooks, 822 entidades no registry — e não consegue visualizar, descobrir, nem usar 90% deste poder. O KCC resolve a barreira de descoberta e acessibilidade.

**Tese central:** *"Liberdade criativa sobre uma fundação rígida e auditável — o KCC é o painel de instrumentos que torna a fundação visível."*

---

## Problema a Resolver

| Dor | Frequência | Severidade |
|-----|-----------|-----------|
| Não sabe qual agente usar | Diária | Alta |
| Não sabe em que fase do SDC está | Diária | Alta |
| Não sabe como construir agentes/squads | Semanal | Alta |
| Não usa 90% das tasks disponíveis | Constante | Média |
| Não sabe como fazer mind clones | Semanal | Alta |
| Perde o fio entre Kairos Check e Academy | Semanal | Média |
| Sem feedback do próximo passo | Diária | Alta |

---

## Solução — 9 Tabs

| Tab | Nome | Pasta fonte | Prioridade |
|-----|------|-------------|-----------|
| 1 | 🏠 Home Dashboard | STATE.md + .aiox/ + .synapse/ | Must Have |
| 2 | 📁 Explorer | KAIROS_CEREBRO/ (tree) | Must Have |
| 3 | 👥 Agent Hub | .aiox-core/development/agents/ + squads/ | Must Have |
| 4 | 📋 Story Manager | docs/stories/ | Must Have |
| 5 | 🔬 Creator Studio | squads/ + tasks/ create-* | Should Have |
| 6 | 💬 Problem Console | agentes + Claude API | Should Have |
| 7 | 📌 Mesa de Criação | claude-code-mastery squad | Should Have |
| 8 | 🔭 Observatory | .synapse/metrics/ + .aiox/ | Must Have |
| 9 | 📖 Manual | .claude/rules/ + constitution.md | Could Have |

---

## Arquitectura (a validar por @architect)

```
Entry point (CLI First — Constitution Art. I):
  node bin/kairos-command-center.js
  → Express.js server (port 3001)
  → Serve public/ (HTML + JS + CSS)
  → APIs: /api/files, /api/agents, /api/stories, /api/metrics
  → Write guard: só permite edição de ficheiros L4

Stack proposta:
  Backend: Node.js + Express.js
  Frontend: HTML + Vanilla JS (sem build step para MVP)
  Claude API: opcional (Mesa de Discussão + Problem Console)
  Leitura: filesystem directo do KAIROS_CEREBRO
```

---

## Design Visual (a definir por @ux-design-expert)

**Tema:** Dark mode — developer cockpit aesthetic
**Inspiração:** VSCode sidebar + Notion content + Linear kanban
**Layout:** Sidebar esquerda + área principal + painel direito + status bar
**Cores:** A definir por @ux (dark bg, neon accents, high contrast)

---

## MoSCoW — Priorização

### Must Have (Sprint 1 — MVP funcional)
- [FR-1] Server CLI com `node bin/kairos-command-center.js`
- [FR-2] File Explorer com tree visual e L1-L4 color coding
- [FR-3] Agent Hub com todos os 40+ agentes em cards
- [FR-4] Story Manager com kanban (Draft→Done)
- [FR-5] Observatory com métricas reais (hook-metrics.json)
- [FR-6] Home Dashboard com Next Action Banner
- [NFR-1] Write guard: nunca escreve em L1/L2
- [NFR-2] Read-only por defeito para L1/L2/L3

### Should Have (Sprint 2 — Studio funcional)
- [FR-7] Creator Studio — Agent Builder (7 fases)
- [FR-8] Mind Clone Lab (wf-clone-mind.yaml visual)
- [FR-9] Squad Architect (wf-create-squad.yaml visual)
- [FR-10] Problem Console com Claude API por agente
- [FR-11] Manual Interactivo (Constitution + Rules)

### Could Have (Sprint 3 — Mesa de Criação)
- [FR-12] Brainstorm Board com routing a especialistas CCM
- [FR-13] Build Studio (Hook Forge + Skill Workshop)
- [FR-14] Level Map (7 níveis Claude Code mastery)
- [FR-15] CCM Round Table (8 especialistas em debate)

### Won't Have (v2.0)
- Deploy público (Vercel) — só local nesta versão
- Multi-user — só Pedro nesta versão
- Mobile responsive — desktop only

---

## Definition of Done (Epic)

O EPIC-004 está **Done** quando:
- [ ] Sprint 1 completo: stories 4.1-4.4 com QA Gate PASS
- [ ] `node bin/kairos-command-center.js` abre KCC em localhost:3001
- [ ] 9 tabs visíveis e navegáveis (mesmo que não totalmente implementados)
- [ ] File Explorer mostra tree real do KAIROS_CEREBRO
- [ ] Agent Hub mostra todos os agentes com cards
- [ ] Home Dashboard mostra Next Action Banner com dados reais
- [ ] Observatory mostra hook-metrics.json em tempo real
- [ ] Write guard bloqueia escrita em L1/L2/L3 (teste manual)
- [ ] Sprint 2 + 3 planeados com stories validadas por @po

---

## Métricas de Sucesso

| Métrica | Baseline | Target |
|---------|---------|--------|
| Tempo a encontrar o agente certo | ~5 min (procura manual) | < 30s |
| Stories com QA Gate formal | 0/15 | 100% das novas |
| Tasks conhecidas por Pedro | ~10% | > 50% |
| Tempo de início de sessão | ~5 min (leitura STATE.md) | < 1 min |

---

## Dependências

| Dependência | Tipo | Status |
|------------|------|--------|
| Node.js v24+ | Técnica | ✓ Instalado |
| Express.js | Técnica | A instalar (packages/kcc/) |
| Claude API key | Técnica | Existe (não commitar) |
| .aiox-core/development/agents/ | Dados | ✓ 10 agents |
| squads/ (5 squads) | Dados | ✓ Existem |
| docs/stories/ (15 stories) | Dados | ✓ Existem |
| .synapse/metrics/hook-metrics.json | Dados | ✓ Existe |
| WORKFLOW-STATE.json | Dados | ✗ Criar em Sprint 1 |

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Claude API lenta (discussions) | Média | Médio | Streaming + spinner |
| Write acidental em L1/L2 | Baixa | Alto | Guard no server + deny rules |
| Scope creep (adicionar features mid-sprint) | Alta | Médio | Freeze scope por sprint |
| Dados escassos para métricas | Média | Baixo | Mostrar "dados insuficientes" |

---

## Estrutura de Stories (para @sm)

### Sprint 1 — MVP (Must Have)
```
docs/stories/epic-kcc/
├── 4.1.kcc-server-file-explorer.story.md
├── 4.2.kcc-home-dashboard-agent-hub.story.md
├── 4.3.kcc-story-manager-observatory.story.md
└── 4.4.kcc-write-guard-workflow-state.story.md
```

### Sprint 2 — Studio (Should Have)
```
├── 4.5.kcc-creator-studio-agent-builder.story.md
├── 4.6.kcc-mind-clone-squad-architect.story.md
├── 4.7.kcc-problem-console-claude-api.story.md
└── 4.8.kcc-manual-interactivo.story.md
```

### Sprint 3 — Mesa de Criação (Could Have)
```
├── 4.9.kcc-brainstorm-board.story.md
├── 4.10.kcc-build-studio-level-map.story.md
└── 4.11.kcc-ccm-round-table.story.md
```

---

## Gate 1 — Delegação para @sm

Após aprovação @po deste epic:
- @sm cria stories do Sprint 1 (4.1 a 4.4)
- Cada story com AC completos + File List
- @po valida cada story individualmente
- @dev implementa por ordem

**Agentes envolvidos neste epic:**
- @ux-design-expert (Uma) → wireframes + design system ANTES das stories
- @architect (Aria) → ADRs técnicos ANTES das stories
- @pm (Morgan) → este epic + coordenação
- @sm (River) → criação das stories Sprint 1
- @po (Pax) → validação do epic + cada story
- @dev (Dex) → implementação Sprint 1
- @qa (Quinn) → QA Gate cada story
- @devops (Gage) → push + PR após QA

---

## Próximos Passos Imediatos

1. **@po** → *validate-epic* (aprovação GO/NO-GO)
2. **@ux-design-expert** → wireframes dos 9 tabs + design tokens
3. **@architect** → ADRs: stack técnica, estrutura de ficheiros, API design
4. **@po** → valida wireframes + arquitectura
5. **@sm** → cria stories Sprint 1 (4.1 a 4.4)
6. **@po** → valida cada story individualmente
7. **@dev** → implementa Sprint 1

---

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @pm (Morgan) | Epic criado — baseado em brainstorm @analyst (Atlas) |
| 2026-06-03 | @analyst (Atlas) | Brainstorm + análise das 7 dores do Pedro |
| 2026-06-03 | @aiox-master (Orion) | Elicitação inicial — 9 perguntas |
| 2026-06-03 | @po (Pax) | Validação: CONDITIONAL GO (8/10) — 2 blockers, 2 concerns |
| 2026-06-03 | @ux (Uma) | Design System v1.0 entregue — blocker 1 resolvido |
| 2026-06-03 | @architect (Aria) | ADR-1 a ADR-4 entregues — blocker 2 resolvido |
| 2026-06-03 | @po (Pax) | GO FINAL (9.5/10) — @sm autorizado para Sprint 1 |
