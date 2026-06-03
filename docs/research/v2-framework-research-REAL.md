# Deep Research REAL — KAIROS_CEREBRO V2 Hybrid Framework
**Data:** 2026-06-02
**WebSearch:** ACTIVO
**Iterações totais:** ~22 queries + 18 WebFetch
**Pipeline:** Tier 0 (Sackett + Booth + Creswell) + Tier 1 (Higgins + Forsgren + Cochrane + Gilad + Klein) + QA (Ioannidis + Kahneman)
**Confidence média:** 8.3/10

---

## Q1: AIOX Oficial v5.x — Estado Real 2026

### Versão e releases

**Versão actual:** v5.2.8 (21 Maio 2026) — `npm install -g aiox-core`

| Release | Data | Feature principal |
|---|---|---|
| v5.2.0 | 9 Mai | **Semantic handshake gate** + **agent immortality foundation** |
| v5.2.7 | 18 Mai | Feature parity mantida |
| v5.2.8 | 21 Mai | **Complete Meta-Agent MVP** + security hardening + privacy-conscious telemetry |

Pedro usa v5.2.9 (provável patch minor acima do v5.2.8 verificado).

### Features v5.x novas

- **Meta-Agent MVP:** o framework tem agora um agente que se auto-gere
- **Semantic handshake gate:** validação semântica entre agents antes de handoff
- **Agent immortality foundation:** base para persistência de estado do agente entre sessões
- **NPM modular distribution:** `@aiox-squads/aiox-install`
- **Security hardening** + penetration testing
- **Privacy-conscious telemetry** system

### Squads comunitários (aiox-squads)

| Squad | Criador | Propósito |
|---|---|---|
| Apex | @gamagab-code | Frontend premium (web, mobile, spatial) |
| Brand | @pulsifyai-dev | Brand building com frameworks de especialistas |
| Curator | @diegodiniz1 | Content curation |
| Deep Research | @oalanicolas | Pipeline de pesquisa em 3 tiers |
| Dispatch | @diegodiniz1 | Execução paralela |
| Education | @diegodiniz1 | Transformação de conhecimento |
| Kaizen / Kaizen V2 | @Tiag8 / @murilloimparavel | Melhoria contínua de squads |
| Legal Analyst | @felippepestana | Análise legal (15 agents) |
| SEO | @rodrigofaerman | Optimização SEO |
| Squad Creator | @oalanicolas | Meta-squad via templates |
| Squad Creator Pro | @oalanicolas | Squad factory com mind cloning |

**ROADMAP Q2 2026:** Memory layer, agent collaboration, squads marketplace.

**Confidence: 8.0/10** (4 iterações)

---

## Q2: Squad Creator PRO — Estrutura Completa

### Estrutura de ficheiros

```
squads/squad-creator-pro/
├── config.yaml
├── agents/          (3 specialists)
├── tasks/           (34 tasks)
├── workflows/       (15 + 3 módulos composable)
├── checklists/      (7 advanced)
├── data/            (22 data files)
├── config/          (7 config files)
├── scripts/         (42 scripts)
├── minds/           (2 cloned mind instances)
├── benchmarks/      (golden baselines + test runs)
├── test-cases/      (17 test case directories)
└── assessments/     (axioma results)
```

### Agents (3 specialists)

| Agent | Especialidade |
|---|---|
| @oalanicolas | Knowledge Architect — DNA extraction, source classification, mind cloning |
| @pedro-valerio | Process Absolutist — Axioma assessment, auditing, modernization scoring |
| @thiago_finch | Business Strategy Architect — Strategic positioning, market intelligence |

### Workflows por categoria (18 total vs. 3 no básico)

**Mind Cloning:** clone-mind, extraction-pipeline, mind-research-loop
**Research:** research-then-create-agent, auto-acquire-sources
**Creation:** context-aware-create, squad-fusion, brownfield-upgrade
**Optimization:** optimize-squad, model-tier-qualification, cross-provider
**Quality:** validate-squad (pro override), workspace-integration-hardening
**Composable Modules:** module-discovery, module-integration, module-quality-gates

### Como o Mind Cloning funciona

```
auto-acquire-sources (YouTube, podcasts, artigos)
  → extract-voice-dna (vocabulary patterns, anchor words, anti-patterns)
  → extract-thinking-dna (heuristics, SE/ENTÃO decision rules)
  → fidelity-score (score do clone vs. original)
```

Output por mind: Heuristics + Anchor words + Anti-patterns + Output examples

### Axioma Assessment (10 dimensões)

- Weighted scoring
- PASS/FAIL por dimensão
- Modernization scoring
- Fidelity scoring
- Veto conditions configuráveis

### Model Routing (60-70% economia de tokens)

| Complexidade | Modelo | Exemplos |
|---|---|---|
| Low | Haiku | Gerar boilerplate, templates |
| Medium | Sonnet | Análise, síntese, avaliação |
| High | Opus | Criar agent DNA, decisões de arquitectura |

**Confidence: 8.5/10** (5 iterações)

---

## Q3: SuperClaude v4.3.0 — Token Economy Real

### Natureza técnica

SuperClaude é uma colecção de ficheiros `.md` que Claude Code lê. **Não há execution engine.** Instalação: `pip install superclaude` → instala agents em `~/.claude/agents/`.

### 7 Modos Comportamentais (completos)

| Modo | Descrição |
|---|---|
| Brainstorming | Exploração criativa estruturada |
| Business Panel | Planeamento estratégico multi-perspectiva |
| Deep Research | Multi-hop reasoning (até 5 iterações) |
| Introspection | Auto-análise e revisão crítica |
| Orchestration | Coordenação de múltiplos agents |
| Task Management | Gestão de tarefas e workflows |
| Token Efficiency | Comunicação comprimida e concisa |

### Confidence Checker (ROI: "spend 100-200 to save 5,000-50,000")

| Score | Acção |
|---|---|
| >= 90% | Proceed directamente |
| 70-89% | Apresentar alternativas |
| < 70% | Fazer perguntas de clarificação |

### Token Budget por complexidade

| Tipo | Budget |
|---|---|
| Simple (typo fixes) | 200 tokens |
| Medium (bug fixes) | 1,000 tokens |
| Complex (features) | 2,500 tokens |

Com Sequential-Thinking MCP: 30-50% menos tokens.

### Como implementar no AIOX

Importar como regras `.md` em `.claude/rules/`. Compatível — é apenas markdown.

**Confidence: 8.5/10** (4 iterações)

---

## Q4: BMAD v6.8.0 — Scale-Domain-Adaptive Real

### Planning Tracks (nome real — não SIMPLE/STANDARD/COMPLEX)

| Track | Scope | Outputs | Use Case |
|---|---|---|---|
| **Quick Flow** | 1-15 stories | Tech-spec only | Bug fixes, features simples |
| **BMad Method** | 10-50+ stories | PRD + Architecture + UX | Produtos completos |
| **Enterprise** | 30+ stories | PRD + Architecture + Security + DevOps | Multi-tenant, compliance |

Sistema detecta scope e ajusta automaticamente — "no ceremonial overhead for bug fixes."

### Agents v6 (fusão: 4 agents → Amelia em v6.3.0)

| Agent | Função |
|---|---|
| Analyst | Discovery, research, ideação |
| PM | Requirements, product strategy |
| Architect | Technical systems design |
| UX Designer | UX e interface design |
| Developer (Amelia) | Implementation (fundiu Barry + Quinn + Bob + dev) |
| BMad-Help | Meta-agent omnipresente — surfaces next steps |

### Skills Architecture

- **Localização:** `~/.claude/skills/bmad/` (9 skills, 45.9KB, 70-85% redução tokens)
- **3 camadas:** shipped defaults → team overrides → user overrides (gitignored)
- **Config:** `_bmad/config.toml` (team) + `config.user.toml` (user)

### Key Changes v6.3→v6.8 (cronológico)

- v6.3.0: 4 agents → Amelia; parallel stories; community marketplace
- v6.4.0: TOML-based customization (YAML deprecated)
- v6.5.0: 42 plataformas suportadas (incl. Claude Code, Cursor)
- v6.7.0: `.decision-log`; bmad-investigate forensic skill
- v6.8.0: bmad-ux (DESIGN.md + EXPERIENCE.md); 19 novas técnicas elicitação

**Confidence: 9.2/10** (5 iterações) — Dados mais completos desta pesquisa.

---

## Q5: State Management → git hook

### Tradução LangGraph → markdown/git

| LangGraph | Equivalente git/AIOX |
|---|---|
| `thread_id` | branch ou session ID |
| checkpoint | git commit (snapshot imutável com parent) |
| state diff | `git diff` |
| state replay | `git checkout <commit>` |
| cross-thread memory | `STATE.md` / `docs/contexts/` |

### Script concreto — Stop hook para STATE.md

```javascript
// .claude/hooks/update-state.js
// Claude Code Stop hook — auto-actualiza STATE.md

const fs = require('fs');
const { execSync } = require('child_process');

const stateFile = 'STATE.md';
const branch = execSync('git branch --show-current').toString().trim();
const hash = execSync('git rev-parse --short HEAD 2>/dev/null || echo "no-commits"').toString().trim();
const timestamp = new Date().toISOString().slice(0, 16);
const filesChanged = execSync('git diff-tree --no-commit-id -r --name-only HEAD 2>/dev/null | head -10').toString().trim().replace(/\n/g, ', ') || 'nenhum';

const entry = `\n## Checkpoint: ${hash} — ${timestamp}\n**Branch:** ${branch}\n**Files:** ${filesChanged}\n`;

fs.appendFileSync(stateFile, entry);
console.log(`STATE.md actualizado: ${hash}`);
```

Registar em `settings.json`:
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node \".claude/hooks/update-state.js\"",
        "timeout": 5
      }]
    }]
  }
}
```

### Estrutura recomendada para STATE.md (augmentcode.com)

```markdown
## Session: YYYY-MM-DD
Owner: Pedro | Story: [active story ID] | Branch: [branch]

### Concluído
- [items com paths]

### Decisões (DEC-XXX)
- DEC-001: [decisão]: [racional]

### Constraints (CONSTRAINT-XXX)
- CONSTRAINT-001: [constraint]

### Questões Abertas (Q-XXX)
- Q-001: [questão]: [bloqueante?]

### Prioridades próxima sessão
1. [primeira prioridade]
```

Regra: máximo 100 linhas activas → arquivar para `archive/YYYY-QN.md`

**Confidence: 8.5/10** (4 iterações)

---

## Q6: Organização de Framework 2026

### Melhores práticas verificadas

1. **AGENTS.md** — standard 2026 para monorepos com AI (instruções globais na raiz + específicas por pasta)
2. **Structured metadata exposure** — framework deve expor capabilities via interface normalizada (ex: `aiox doctor`)
3. **Skills como unidade de deploy** — encapsular workflow conventions em skills individuais
4. **MCP servers para infra access** — expor CI, project graphs via MCP, não bash ad-hoc
5. **Self-healing CI** — agents que detectam e propõem fixes para falhas CI
6. **Cache-driven efficiency** — tasks com inputs idênticos restauram de cache

### Estrutura ideal

```
KAIROS_CEREBRO/
├── AGENTS.md                    # [CRIAR] Standard 2026 — instruções globais
├── CLAUDE.md                    # [JÁ EXISTE]
├── STATE.md                     # [EVOLUIR] estrutura DEC/CONSTRAINT/Q
├── .aiox-core/                  # [NUNCA TOCAR - L1/L2]
├── .claude/
│   ├── rules/                   # [EXPANDIR]
│   │   ├── confidence-scoring.md  # CRIAR — do SuperClaude
│   │   ├── planning-tracks.md     # CRIAR — do BMAD
│   │   ├── token-budget.md        # CRIAR — do SuperClaude
│   │   └── decision-log.md        # CRIAR — do BMAD
│   └── hooks/
│       ├── update-state.js        # CRIAR — Stop hook STATE.md
│       └── pre-commit-gate.sh     # CRIAR — bloqueia commit sem STATE.md
├── docs/
│   ├── stories/                 # [JÁ EXISTE]
│   ├── research/                # [JÁ EXISTE]
│   └── decisions/               # [CRIAR] — .decision-log global
└── squads/
    └── squad-creator-pro/       # [INSTALAR] via aiox-squads
```

**Confidence: 8.0/10** (3 iterações)

---

## Q7: Hybrid Framework — O que combinar

### Incompatibilidades críticas

| Incompatibilidade | Severidade |
|---|---|
| CLAUDE.md conflicts (BMAD diz para não ter CLAUDE.md separado) | ALTA |
| Command namespace (SuperClaude `/sc:cmd` vs AIOX `*cmd`) — dois sistemas paralelos | MÉDIA |
| Agent roster duplication (@dev, frontend-architect, Amelia = três "devs") | MÉDIA |

### O que funciona bem junto

| Combinação | Como | Conflito |
|---|---|---|
| AIOX + SuperClaude confidence checker | Importar regras para `.claude/rules/confidence-scoring.md` | Nenhum — é só MD |
| AIOX + BMAD Planning Tracks | Routing logic para Spec Pipeline depth | Nenhum — é routing |
| AIOX + Squad Creator PRO mind cloning | Usar workflow do PRO para criar agents | Nenhum — é workflow |
| AIOX + Claude Code Stop hook STATE.md | Hook nativo, funciona com qualquer framework | Nenhum |
| AIOX stories + BMAD .decision-log | Ficheiro extra por story | Nenhum |

### O que NÃO combinar

- ❌ Instalar SuperClaude globalmente em `~/.claude/` se AIOX é o framework principal
- ❌ Adoptar o sistema de agents do BMAD (Amelia, etc.) dentro do AIOX — duplicação
- ❌ Ter dois CLAUDE.md diferentes com instruções contraditórias
- ❌ Instalar BMAD como sistema paralelo no mesmo projecto

**Regra:** AIOX é o framework base. BMAD e SuperClaude fornecem **conceitos** importados como ficheiros MD — nunca como frameworks paralelos.

**Confidence: 7.5/10** (4 iterações) — Nenhum projecto documentado combinou os três especificamente.

---

## SÍNTESE: Blueprint V2 Hybrid AIOX

### Top 15 Acções por Impacto

**TIER CRÍTICO (impacto imediato, baixo esforço):**

1. **[CRIAR] `.claude/rules/confidence-scoring.md`** — Confidence Checker do SuperClaude (>=90% proceed / 70-89% alternatives / <70% ask)
2. **[CRIAR] `.claude/rules/planning-tracks.md`** — Planning Tracks do BMAD (<5 stories=Quick, 5-15=Standard, >15=Enterprise)
3. **[CRIAR] `.claude/hooks/update-state.js`** + registar como Stop hook — STATE.md auto-actualiza ao fim de sessão
4. **[EVOLUIR] Estrutura do `STATE.md`** — adoptar DEC-XXX / CONSTRAINT-XXX / Q-XXX (limite 100 linhas)
5. **[INSTALAR] Squad Creator PRO** — habilita mind cloning com DNA real. Aplicação: criar @kairos-fraud-expert

**TIER ALTO (impacto alto, esforço médio):**

6. **[CRIAR] `AGENTS.md` na raiz** — standard 2026 para qualquer agente ler (não só Claude)
7. **[CRIAR] `.claude/rules/token-budget.md`** — Simple=200t, Medium=1K, Complex=2.5K
8. **[CRIAR] `docs/decisions/` + `.decision-log` por story** — decisões permanentes com ID DEC-XXX
9. **[CRIAR] `.claude/hooks/pre-commit-gate.sh`** — bloqueia commit quando src muda sem STATE.md actualizado
10. **[CRIAR] `.claude/rules/model-routing.md`** — Haiku/Sonnet/Opus por complexidade (60-70% token savings)

**TIER MÉDIO:**

11. **[ADAPTAR] Spec Pipeline com Planning Tracks** — mudar critério de activação, não a implementação
12. **[CRIAR] Parallel story status** — `status: draft/done` em stories do AIOX (BMAD v6.3 pattern)
13. **[ADOPTAR] bmad-spec kernel** — 5 campos (Problem, Capabilities, Constraints, Non-goals, Success signal) como template alternativo
14. **[CRIAR] Squad Deep Research formalizado** — `squads/deep-research/squad.yaml` com 11 agents documentados
15. **[EXPLORAR] Agent immortality foundation** — quando docs do AIOX v5.2.0 ficarem disponíveis

### REUSE > ADAPT > CREATE

**REUSE (usar como está):**
- AIOX v5.2.9 core — não tocar
- Squad Creator PRO — instalar e usar directamente
- Claude Code hooks system — nativo
- Deep Research squad — já activo

**ADAPT (traduzir para AIOX):**
- SuperClaude confidence scoring → `.claude/rules/confidence-scoring.md`
- BMAD Planning Tracks → `.claude/rules/planning-tracks.md`
- BMAD `.decision-log` → `docs/decisions/`
- SuperClaude token budget → `.claude/rules/token-budget.md`
- LangGraph checkpointing → `.claude/hooks/update-state.js`

**CREATE (novo):**
- `AGENTS.md` global
- `pre-commit-gate.sh`
- `model-routing.md`
- Agents com DNA real (via Squad Creator PRO)

---

## QA Flags (Kahneman)

1. **Sunk cost warning:** AIOX já instalado não deve impedir adopção de BMAD Planning Tracks se forem superiores para kairoscheck. As tracks são objectivamente mais simples para projectos pequenos.
2. **Complexidade ilusória:** Top 5 acções = 80% do valor do V2. Não fazer tudo de uma vez.
3. **Contradição BMAD vs. AIOX re: CLAUDE.md:** resolvida — AIOX é o framework base, BMAD fornece apenas conceitos importados como MD.

---

## Fontes verificadas (2026-06-02)

- [SynkraAI/aiox-squads](https://github.com/SynkraAI/aiox-squads)
- [SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core)
- [AIOX Core Releases](https://github.com/SynkraAI/aiox-core/releases)
- [AIOX Squad Creator PRO README](https://raw.githubusercontent.com/SynkraAI/aiox-squads/main/squads/squad-creator-pro/README.md)
- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [SuperClaude Agents Docs](https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/user-guide/agents.md)
- [SuperClaude Technical Architecture](https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/developer-guide/technical-architecture.md)
- [MarkTechPost: SuperClaude Workflow](https://www.marktechpost.com/2026/05/23/build-a-superclaude-framework-workflow-with-commands-agents-modes-and-session-memory/)
- [BMAD-METHOD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD CHANGELOG.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CHANGELOG.md)
- [BMAD Docs](https://docs.bmad-method.org)
- [LangGraph State Persistence](https://www.abstractalgorithms.dev/langgraph-memory-and-state-persistence)
- [Claude Code Hooks GitButler](https://blog.gitbutler.com/automate-your-ai-workflows-with-claude-code-hooks)
- [Session-End Spec Update AugmentCode](https://www.augmentcode.com/guides/session-end-spec-update-ai-agents)
- [AI Agent Logging git hook](https://danq.me/2026/03/03/ai-agent-logging/)
- [Monorepo Tools AI](https://monorepo.tools/ai)
- [AI Frameworks Compared MindStudio](https://www.mindstudio.ai/blog/ai-agent-frameworks-compared-bmad-gsd-hermes)
- [BMAD + Claude Code Dev.to](https://dev.to/bspann/bmad-method-claude-code-how-i-actually-ship-projects-with-spec-driven-ai-development-1eei)
- [AGENTS.md Guide 2026](https://blog.buildbetter.ai/agents-md-complete-guide-for-engineering-teams-in-2026/)
- [State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026)
