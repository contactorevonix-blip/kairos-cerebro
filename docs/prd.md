# AIOX Academy — Product Requirements Document
**Tipo:** Brownfield Enhancement PRD
**Versão:** 1.0 | **Data:** 2026-06-01
**Author:** @pm (Morgan) | **Research:** @analyst (Atlas)
**Status:** Draft → Review

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-06-01 | 1.0 | PRD inicial — baseado em research + brainstorm completo | Morgan (@pm) |

---

## 1. Intro — Análise e Contexto do Projecto

### 1.1 Analysis Source

**Document-project analysis disponível em:** `docs/brownfield-architecture.md`
**Research completo disponível em:** `docs/aiox-academy-research.md`

### 1.2 Current Project State

KAIROS_CEREBRO é o workspace principal de Pedro — um monorepo Node.js com motor de fraud scoring (sniper-engine, 8 camadas), API HTTP, billing Stripe, compliance GDPR, vault AES-256-GCM, e reputation graph cross-tenant. Pedro está a aprender AIOX simultaneamente a construir o Kairos Check.

**Problema central identificado:**
Pedro não tem um recurso prático, estruturado e completo que lhe ensine AIOX no contexto real do que está a construir. A documentação oficial existe mas está dispersa, sem ciclos de construção completos, sem prompts copy-paste, e sem progressão Starter → Elite por conceito.

### 1.3 Enhancement Description

Construir o **AIOX Academy** — um sistema de aprendizagem local (localhost:3000) com:
1. **Curso Completo** (~30 lições) onde cada lição inclui o ciclo AIOX completo de construção (todos os agentes relevantes, prompts copy-paste, templates, checkpoints, progressão Starter → Elite)
2. **Build Engine** — motor IA que recebe "quero construir X" e gera automaticamente o ciclo AIOX completo (workflow, agentes, prompts parametrizados, templates)

### 1.4 Enhancement Type

- [x] New Feature Addition (novo produto standalone)
- [x] Integration with New Systems (Claude API, GitHub SynkraAI, YouTube transcripts)

### 1.5 Impact Assessment

- [x] Minimal Impact — projecto NOVO, não modifica KAIROS_CEREBRO existente
- Sistema criado em directório separado: `C:\Users\lealp\aiox-academy\`

### 1.6 Goals

- Ensinar Pedro a usar AIOX correctamente — todos os agentes, todos os workflows, todos os comandos
- Eliminar confusão: "qual agente usar?", "que comando dar?", "que prompt escrever?"
- Gerar ciclos AIOX completos automaticamente para qualquer build request
- Ter tudo numa interface local bonita e organizada, acessível a qualquer momento
- Ser o prerequisito para Pedro depois construir o KAIROS com AIOX em velocidade máxima

### 1.7 Background Context

Alan Nicolas (criador de AIOX, @oalanicolas, 265K seguidores Instagram, 20.000+ alunos na Academia Lendária) tem conteúdo disponível publicamente no YouTube e no blog.aioxsquad.ai. O GitHub SynkraAI/aiox-core v5.2.8 (MIT) tem toda a documentação oficial. O curso da Academia Lendária (aiox.academialendaria.ai) tem 12 aulas em 4 módulos. Todo este conteúdo será a base do AIOX Academy, estruturado de forma muito mais prática e orientada ao ciclo completo de construção.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR1:** O sistema DEVE incluir um curso com no mínimo 30 lições organizadas em 5 módulos progressivos (Setup, Foundation, Build Cycles, Agent Creation, Advanced).

**FR2:** Cada lição DEVE conter o ciclo AIOX completo de construção para o que ensina: agentes necessários, prompts copy-paste por fase, templates a usar, checkpoints, e progressão Starter → Builder → Advanced → Elite.

**FR3:** O sistema DEVE incluir um Build Engine acessível via interface de pesquisa onde Pedro pode digitar "quero construir X" e receber o ciclo AIOX completo gerado automaticamente.

**FR4:** O Build Engine DEVE detectar o workflow correcto (SDC, Spec Pipeline, QA Loop, Brownfield) com base na intenção do utilizador.

**FR5:** O Build Engine DEVE gerar prompts parametrizados copy-paste para cada agente em cada fase do ciclo.

**FR6:** O Build Engine DEVE verificar se existe um squad adequado e, se não existir, incluir "Step 0: criar squad" no ciclo gerado.

**FR7:** O sistema DEVE funcionar em localhost:3000 sem necessidade de deploy externo.

**FR8:** Cada lição DEVE ter 30 variações/exemplos do conceito ensinado, organizadas por nível (Básico 1-10, Intermédio 11-20, Avançado 21-30).

**FR9:** O sistema DEVE incluir um catálogo completo de todos os comandos AIOX (*commands) com exemplos de uso para cada agente.

**FR10:** O conteúdo DEVE ser extraído de fontes reais: GitHub SynkraAI/aiox-core, blog.aioxsquad.ai, aiox.academialendaria.ai, YouTube @oalanicolas, Claude Code Docs (code.claude.com).

### 2.2 Non-Functional Requirements

**NFR1:** O sistema deve carregar cada página em menos de 2 segundos em localhost.

**NFR2:** O Build Engine deve gerar um ciclo completo em menos de 10 segundos (Claude API).

**NFR3:** O sistema deve funcionar offline para o conteúdo estático das lições (MDX).

**NFR4:** A interface deve ser visualmente premium — design system consistente, dark mode, tipografia legível.

**NFR5:** O código deve ter 0 secrets em git. A ANTHROPIC_API_KEY nunca pode ser commitada.

**NFR6:** O custo operacional da Claude API não deve exceder $5/mês para uso normal de Pedro.

### 2.3 Compatibility Requirements

**CR1:** O sistema não deve modificar nenhum ficheiro do KAIROS_CEREBRO existente.

**CR2:** O sistema deve ser um projecto Next.js independente em directório separado (`aiox-academy/`).

**CR3:** Conteúdo de fontes externas deve ser citado e referenciado (não plagiado — é material de aprendizagem pessoal).

**CR4:** A Claude API key deve ser lida de variável de ambiente local (`.env.local`, nunca commitado).

---

## 3. Technical Constraints

### 3.1 Tech Stack

| Categoria | Tecnologia | Versão | Notas |
|-----------|-----------|--------|-------|
| Framework | Next.js | 14+ (App Router) | Pedro já usa, Vercel-native |
| Docs Framework | Fumadocs | Latest | Next.js App Router native, 10k+ stars, MDX + RSC |
| Styling | Tailwind CSS + shadcn/ui | Latest | Rapid UI, consistente |
| Conteúdo | MDX | — | Lições como ficheiros .mdx |
| AI/Build Engine | Claude API (Anthropic) | — | Haiku 4.5 (parser) + Sonnet 4.6 (generator) |
| Search | Fuse.js | Latest | Local, sem dependência externa |
| Runtime | Node.js | ≥18 | Alinhado com KAIROS |
| Extracção YouTube | youtube-transcript-api | 1.2.4 | Python, grátis, sem API key |

### 3.2 Integration Approach

**Conteúdo estático (MDX):**
- Extraído do GitHub SynkraAI/aiox-core via GitHub API (público, MIT)
- Estruturado em ficheiros .mdx por lição
- Script Node.js de extracção: `scripts/extract-content.js`

**Build Engine (dinâmico):**
- API route: `POST /api/build-cycle`
- Intent Parser: Claude Haiku 4.5 → classifica intenção, detecta complexidade
- Cycle Generator: Claude Sonnet 4.6 → gera ciclo completo
- Prompt caching: contexto AIOX fixo cached → 90% desconto

**YouTube Transcripts:**
- Script Python: `scripts/extract-transcripts.py`
- Usa youtube-transcript-api (grátis, sem API key)
- Vídeos: 6 URLs confirmados do @oalanicolas

### 3.3 Code Organization

```
aiox-academy/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing / Home
│   ├── build/              # Build Engine UI
│   │   └── page.tsx
│   ├── lessons/            # Curso (gerado do MDX)
│   │   └── [slug]/
│   ├── agents/             # Páginas por agente
│   │   └── [agent]/
│   ├── workflows/          # Páginas por workflow
│   └── api/
│       └── build-cycle/    # Build Engine API route
│           └── route.ts
├── content/                # Ficheiros MDX das lições
│   ├── lessons/
│   ├── agents/
│   └── workflows/
├── lib/
│   ├── build-engine/       # Core do Build Engine
│   │   ├── intent-parser.ts
│   │   ├── workflow-selector.ts
│   │   ├── agent-mapper.ts
│   │   └── prompt-generator.ts
│   └── content/            # Helpers de conteúdo
├── scripts/                # Data pipeline
│   ├── extract-github.js   # Extrai docs SynkraAI
│   ├── extract-transcripts.py  # YouTube transcripts
│   └── build-content-db.js # Processa → MDX
├── .env.local              # ANTHROPIC_API_KEY (gitignored)
└── package.json
```

### 3.4 Deployment

- **Desenvolvimento:** `npm run dev` → localhost:3000
- **Produção local:** `npm run build && npm start`
- **Sem deploy externo** na Fase 1

### 3.5 Risk Assessment

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Claude API custos acima do esperado | Médio | Baixo | Prompt caching + Haiku para parsing |
| Conteúdo Academia Lendária inacessível sem login | Alto | Médio | Usar só conteúdo público (YouTube + blog) |
| Fumadocs learning curve | Baixo | Médio | Documentação boa, comunidade activa |
| Content pipeline demorado (extracção) | Médio | Médio | Fazer em paralelo com setup do site |

---

## 4. Epic Structure

**Decisão:** 5 epics sequenciais com dependências claras. Epic anterior é prerequisito do seguinte.

**Rationale:** Projecto novo de complexidade COMPLEX (>15 pts). Sequência garante que: (1) infra existe antes de conteúdo, (2) conteúdo existe antes de UI, (3) UI existe antes de Build Engine, (4) tudo existe antes de polish final.

---

## 5. Epics e Stories

---

### EPIC-1: Foundation — Setup + Data Pipeline

**Goal:** Projecto Next.js funcional em localhost + pipeline de extracção de conteúdo operacional.

**Integration Requirements:** Fumadocs configurado, Claude API key configurada localmente, scripts de extracção a funcionar.

---

#### Story 1.1 — Setup Next.js + Fumadocs

**As a** Pedro,
**I want** o projecto Next.js com Fumadocs configurado e a funcionar em localhost:3000,
**so that** tenha a base para construir todas as páginas do curso.

**Acceptance Criteria:**
1. `npx create-next-app@latest aiox-academy` executado com App Router
2. Fumadocs instalado e configurado (`fumadocs-ui`, `fumadocs-core`, `fumadocs-mdx`)
3. `npm run dev` abre localhost:3000 sem erros
4. Página inicial renderiza com layout Fumadocs
5. Dark mode funcional por defeito
6. Tailwind CSS + shadcn/ui configurados

**IV1:** `npm run build` completa sem erros
**IV2:** localhost:3000 carrega em < 2s

---

#### Story 1.2 — Content Extraction Pipeline (GitHub SynkraAI)

**As a** Pedro,
**I want** um script que extrai automaticamente a documentação do GitHub SynkraAI/aiox-core,
**so that** tenha o conteúdo oficial AIOX como base para as lições.

**Acceptance Criteria:**
1. Script `scripts/extract-github.js` funcional
2. Extrai: `development/agents/*.md`, `development/tasks/*.md`, `development/workflows/*.md`, `development/templates/*.yaml`, `constitution.md`
3. Output: `content/raw/github/` com ficheiros organizados
4. Log: número de ficheiros extraídos, erros se houver
5. Não requer auth (repo público MIT)

---

#### Story 1.3 — Content Extraction Pipeline (YouTube Transcripts)

**As a** Pedro,
**I want** um script que extrai as transcrições dos vídeos confirmados do @oalanicolas,
**so that** tenha os insights práticos do Alan Nicolas como base de conteúdo.

**Acceptance Criteria:**
1. Script `scripts/extract-transcripts.py` funcional com `youtube-transcript-api`
2. Extrai transcrições de 6 URLs confirmados:
   - https://www.youtube.com/watch?v=gEUtUdqiAyk
   - https://www.youtube.com/watch?v=G2KcYWSyIbI
   - https://www.youtube.com/watch?v=Mm0pAaofPOo
   - https://www.youtube.com/watch?v=cvba_dYjdEI
   - https://www.youtube.com/watch?v=Ut4ecAzE7o8
3. Output: `content/raw/youtube/[video-id].txt`
4. Sem API key necessária

---

#### Story 1.4 — Content Structuring (Raw → MDX)

**As a** Pedro,
**I want** um script que processa o conteúdo raw e o estrutura em ficheiros MDX de lições,
**so that** o Fumadocs possa renderizá-los como páginas.

**Acceptance Criteria:**
1. Script `scripts/build-content-db.js` funcional
2. Processa conteúdo raw → ficheiros `.mdx` em `content/lessons/`
3. Cada MDX tem frontmatter: `title`, `module`, `level`, `agents`, `workflow`, `duration`
4. Estrutura base das 8 lições do Módulo 1 gerada
5. Log: lições criadas, erros se houver

---

### EPIC-2: Course Modules — Conteúdo Completo das Lições

**Goal:** 30+ lições completas com ciclo AIOX por lição, organizadas em 5 módulos.

---

#### Story 2.1 — Template Universal de Lição

**As a** Pedro,
**I want** um template MDX reutilizável para todas as lições que inclua o ciclo AIOX completo,
**so that** todas as lições tenham consistência e não precise reescrever a estrutura.

**Acceptance Criteria:**
1. Template em `content/templates/lesson-template.mdx`
2. Secções obrigatórias: Conceito, Porquê, Workflow, Ciclo por Nível (Starter/Builder/Advanced/Elite), Prompts Copy-Paste, Templates, Checkpoints, 30 Variações
3. Componente `<AIOXCycle />` criado para renderizar ciclo visual
4. Componente `<PromptBlock />` para copy-paste de prompts
5. Componente `<CheckpointList />` para gates de qualidade

---

#### Story 2.2 — Módulo 0: Setup (3 lições)

**As a** Pedro,
**I want** as lições do Módulo 0 completas (instalar AIOX, configurar Claude Code, overview dos 12 agentes),
**so that** um iniciante consiga começar do zero.

**Acceptance Criteria:**
1. `L0.1 — Instalar AIOX em 5 minutos` criada com ciclo Starter
2. `L0.2 — Configurar Claude Code + AIOX` criada com comandos reais
3. `L0.3 — Os 12 agentes explicados` criada com cheatsheet visual
4. Cada lição usa template universal
5. Prompts copy-paste válidos e testados

---

#### Story 2.3 — Módulo 1: Foundation (8 lições)

**As a** Pedro,
**I want** as 8 lições do Módulo Foundation com ciclos completos,
**so that** consiga dominar a base do AIOX em 1-2 dias.

**Acceptance Criteria:**
1. `L1.1 — A Constitution (6 artigos)` — @aiox-master, exemplos reais
2. `L1.2 — Agent Authority Matrix` — todos os 12, visual, exemplos
3. `L1.3 — Primeiro @pm — criar PRD` — 3 agentes, prompts, template
4. `L1.4 — @sm + @po — story perfeita` — 3 agentes, 10-point checklist
5. `L1.5 — @dev — implementar sem medo` — YOLO vs Interactive vs Pre-Flight
6. `L1.6 — @qa + @devops — qualidade e deploy` — 7 quality checks, PR
7. `L1.7 — SDC completo` — 6 agentes, do zero ao deploy
8. `L1.8 — Mini-projecto: feature real` — todos os 12 agentes, ciclo Elite
9. Cada lição: 4 níveis + prompts copy-paste + 30 variações
10. Todas usam template universal

---

#### Story 2.4 — Módulo 2: Build Cycles (12 lições)

**As a** Pedro,
**I want** as 12 lições de Build Cycles com ciclos completos para construções reais,
**so that** saiba construir qualquer tipo de feature com o time AIOX completo.

**Acceptance Criteria:**
1. `L2.1 — Construir endpoint REST` — 8 agentes, 30 variações
2. `L2.2 — Construir auth system` — 9 agentes
3. `L2.3 — Construir database schema` — 6 agentes
4. `L2.4 — Construir UI component system` — 6 agentes
5. `L2.5 — Construir webhook + outbox` — 7 agentes
6. `L2.6 — Construir pipeline de testes` — 5 agentes
7. `L2.7 — Construir billing integration` — 8 agentes
8. `L2.8 — Construir compliance GDPR` — 7 agentes
9. `L2.9 — Construir CLI tool` — 6 agentes
10. `L2.10 — Construir design system` — 5 agentes
11. `L2.11 — Spec Pipeline completo` — 5 agentes
12. `L2.12 — Mini-projecto módulo completo` — todos os 12

---

#### Story 2.5 — Módulo 3: Agent Creation (6 lições)

**As a** Pedro,
**I want** as 6 lições sobre como criar agentes com mentes clonadas,
**so that** consiga criar qualquer agente especializado com o AIOX.

**Acceptance Criteria:**
1. `L3.1 — Criar agente custom do zero` — config.yaml completo (dados reais do blog.aioxsquad.ai)
2. `L3.2 — Voice DNA extraction` — extrair padrões de comunicação
3. `L3.3 — Thinking DNA cloning` — clonar modelos mentais
4. `L3.4 — Criar @alan-nicolas-agent` — tutor AIOX clonado
5. `L3.5 — Criar agente especializado` — expertise específica
6. `L3.6 — Mini-projecto: clone-agente próprio` — Pedro cria o seu clone

---

#### Story 2.6 — Módulo 4: Advanced Patterns (8 lições)

**As a** Pedro,
**I want** as 8 lições de padrões avançados,
**so that** domine epics, squads, skills e governance.

**Acceptance Criteria:**
1. `L4.1 — Epics: do conceito ao *execute-epic`
2. `L4.2 — QA Loop iterativo`
3. `L4.3 — Brownfield discovery`
4. `L4.4 — Criar squad do zero`
5. `L4.5 — Skills personalizadas`
6. `L4.6 — Synapse: sistema de regras`
7. `L4.7 — Hooks: automatizar tudo`
8. `L4.8 — MCP: integrar ferramentas`

---

#### Story 2.7 — Módulo 5: Master Builder (5 lições)

**As a** Pedro,
**I want** as 5 lições de master builder,
**so that** consiga construir sistemas completos do zero com AIOX em velocidade máxima.

**Acceptance Criteria:**
1. `L5.1 — AIOX em produção + governance completo`
2. `L5.2 — Multi-epic coordination`
3. `L5.3 — Build com 30 variações de qualquer feature`
4. `L5.4 — Criar o teu próprio framework sobre AIOX`
5. `L5.5 — Projecto final: sistema completo do zero`

---

### EPIC-3: Build Engine — Motor IA de Geração de Ciclos

**Goal:** Motor funcional que recebe intenção de build e gera ciclo AIOX completo automaticamente.

---

#### Story 3.1 — Intent Parser (Claude Haiku)

**As a** Pedro,
**I want** um intent parser que classifica o que quero construir,
**so that** o Build Engine saiba que workflow e agentes usar.

**Acceptance Criteria:**
1. API route `POST /api/build-cycle` criada
2. Intent Parser usa Claude Haiku 4.5
3. Classifica: tipo de build (endpoint/auth/ui/db/agent/skill/squad/other)
4. Detecta: complexidade (SIMPLE/STANDARD/COMPLEX)
5. Extrai: tecnologias mencionadas, contexto do projecto
6. Output: `{ type, complexity, technologies, workflow }` JSON
7. Prompt caching activado para sistema AIOX fixo

---

#### Story 3.2 — Workflow + Squad Selector

**As a** Pedro,
**I want** o sistema que selecciona o workflow correcto e verifica squads,
**so that** o ciclo gerado use os agentes e workflow certos.

**Acceptance Criteria:**
1. `lib/build-engine/workflow-selector.ts` implementado
2. SIMPLE → SDC directo
3. STANDARD → Spec Pipeline → SDC
4. COMPLEX → PRD + Epics + SDC
5. Squad checker: verifica se squad existe para o domínio
6. Se squad não existe: inclui "Step 0: criar squad" no output
7. Output: `{ workflow, agents[], squadRequired, squadExists }` JSON

---

#### Story 3.3 — Cycle Generator (Claude Sonnet)

**As a** Pedro,
**I want** o gerador de ciclos completos que produz prompts parametrizados por fase,
**so that** possa copiar e colar cada prompt directamente no Claude Code.

**Acceptance Criteria:**
1. `lib/build-engine/prompt-generator.ts` implementado
2. Usa Claude Sonnet 4.6
3. Gera para cada fase: agente + persona + prompt parametrizado + template + output esperado + checkpoint
4. Prompts têm `{{variáveis}}` substituídas pelo contexto do pedido
5. Output inclui 4 níveis (Starter/Builder/Advanced/Elite)
6. Prompt caching activado (contexto AIOX base cached)
7. Geração completa em < 10s

---

#### Story 3.4 — Build Engine UI

**As a** Pedro,
**I want** a interface do Build Engine em `/build`,
**so that** consiga usar o motor de forma intuitiva e ver o ciclo gerado.

**Acceptance Criteria:**
1. Página `/build` com campo de texto "O que queres construir?"
2. Selector de nível (Starter / Builder / Advanced / Elite)
3. Loading state durante geração
4. Output: ciclo por fases, cada fase expandível
5. Botão "Copy" em cada prompt
6. Badge de agente colorido por role
7. Timeline visual do ciclo (10 fases visíveis)
8. Responsive, funcional em localhost

---

### EPIC-4: Navigation + Agent Pages + Cheatsheets

**Goal:** Navegação completa, páginas de cada agente, e cheatsheets visuais.

---

#### Story 4.1 — Agent Pages (12 páginas)

**As a** Pedro,
**I want** uma página para cada um dos 12 agentes AIOX,
**so that** possa consultar rapidamente qualquer agente: quando usar, comandos, prompts.

**Acceptance Criteria:**
1. 12 páginas em `/agents/[agent]`
2. Cada página: card visual com ícone + nome + persona, quando usar ✅, nunca usar ❌, como activar, comandos com descrição, 10 prompts copy-paste mais usados, exemplo de conversa real
3. Design consistente com Fumadocs
4. Links cruzados entre agentes (quem colabora com quem)

---

#### Story 4.2 — Workflow Pages (4 páginas)

**As a** Pedro,
**I want** uma página para cada workflow AIOX (SDC, Spec Pipeline, QA Loop, Brownfield),
**so that** possa perceber visualmente cada workflow e quando usá-lo.

**Acceptance Criteria:**
1. 4 páginas em `/workflows/[workflow]`
2. Diagrama visual do workflow (ASCII art ou SVG)
3. Passo a passo por fase (expansível)
4. Exemplo real completo (do KAIROS)
5. Critérios de selecção (quando usar este workflow)

---

#### Story 4.3 — Cheatsheets Visuais

**As a** Pedro,
**I want** cheatsheets visuais de referência rápida,
**so that** possa consultar rapidamente sem ler documentação.

**Acceptance Criteria:**
1. `/cheatsheets/agents` — poster visual de todos os 12 agentes
2. `/cheatsheets/commands` — todos os *commands com output esperado
3. `/cheatsheets/constitution` — 6 artigos com exemplos reais
4. Design: legível, dark mode, compacto (cabe num ecrã)

---

### EPIC-5: Design + Polish + Local Setup

**Goal:** Interface premium, performance optimizada, setup de localhost simplificado.

---

#### Story 5.1 — Design System

**As a** Pedro,
**I want** um design system consistente e premium para o AIOX Academy,
**so that** a experiência visual seja clara e agradável de usar diariamente.

**Acceptance Criteria:**
1. Color system: dark mode por defeito, cores AIOX (verde #3CEABB como accent)
2. Typography: Inter para texto, JetBrains Mono para código/prompts
3. Componentes: cards de lição, prompt blocks, agent badges, cycle timeline
4. Consistência visual em todas as páginas

---

#### Story 5.2 — Search Funcional

**As a** Pedro,
**I want** search que encontra lições, agentes e comandos rapidamente,
**so that** possa navegar sem precisar de menus.

**Acceptance Criteria:**
1. Fuse.js integrado com Fumadocs search
2. Pesquisa em: títulos + conteúdo das lições + nomes de agentes + comandos
3. Resultados em < 100ms
4. Keyboard shortcut: `Cmd/Ctrl + K`

---

#### Story 5.3 — README + Local Setup Guide

**As a** Pedro,
**I want** um README claro com instruções de setup local,
**so that** consiga iniciar o sistema em qualquer sessão em < 1 minuto.

**Acceptance Criteria:**
1. `README.md` com: pré-requisitos, instalação, como correr, variáveis de ambiente
2. `.env.local.example` com placeholder para ANTHROPIC_API_KEY
3. `npm run dev` é o único comando necessário após setup inicial
4. `.env.local` em `.gitignore` (verificado)

---

## 6. Story Metadata Matrix

| Story | Título | Complexidade | Executor | Quality Gate | Depends On |
|-------|--------|-------------|----------|-------------|-----------|
| 1.1 | Setup Next.js + Fumadocs | S | @dev | @architect | — |
| 1.2 | Content Extraction (GitHub) | S | @dev | @architect | 1.1 |
| 1.3 | Content Extraction (YouTube) | S | @dev | @architect | 1.1 |
| 1.4 | Content Structuring (Raw → MDX) | M | @dev | @architect | 1.2, 1.3 |
| 2.1 | Template Universal de Lição | M | @ux-design-expert | @dev | 1.1 |
| 2.2 | Módulo 0: Setup (3 lições) | M | @dev | @architect | 2.1, 1.4 |
| 2.3 | Módulo 1: Foundation (8 lições) | L | @dev | @architect | 2.1, 1.4 |
| 2.4 | Módulo 2: Build Cycles (12 lições) | XL | @dev | @architect | 2.1, 1.4 |
| 2.5 | Módulo 3: Agent Creation (6 lições) | L | @dev | @architect | 2.1, 1.4 |
| 2.6 | Módulo 4: Advanced Patterns (8 lições) | L | @dev | @architect | 2.1, 1.4 |
| 2.7 | Módulo 5: Master Builder (5 lições) | M | @dev | @architect | 2.1, 1.4 |
| 3.1 | Intent Parser (Claude Haiku) | M | @dev | @architect | 1.1 |
| 3.2 | Workflow + Squad Selector | M | @dev | @architect | 3.1 |
| 3.3 | Cycle Generator (Claude Sonnet) | L | @dev | @architect | 3.1, 3.2 |
| 3.4 | Build Engine UI | M | @ux-design-expert | @dev | 3.3 |
| 4.1 | Agent Pages (12 páginas) | L | @dev | @architect | 1.1, 1.4 |
| 4.2 | Workflow Pages (4 páginas) | M | @dev | @architect | 1.1 |
| 4.3 | Cheatsheets Visuais | S | @ux-design-expert | @dev | 1.1 |
| 5.1 | Design System | M | @ux-design-expert | @dev | 1.1 |
| 5.2 | Search Funcional | S | @dev | @architect | 1.1, 2.x |
| 5.3 | README + Local Setup Guide | XS | @dev | @qa | — |

**Legenda Complexidade:** XS=1pt · S=2pt · M=3pt · L=5pt · XL=8pt

---

## 7. Squads e Agentes

### Agentes Base (já activos)
Todos os 12 agentes AIOX standard disponíveis para construção do AIOX Academy.

### Squads Comunidade (instalar de SynkraAI/aiox-squads)

| Squad | Comando de Install | Usado em |
|-------|-------------------|----------|
| Education | a confirmar com SynkraAI docs | Epic 2 — estrutura pedagógica |
| Apex | a confirmar | Epic 5 — frontend premium |
| Squad Creator Pro | a confirmar | Meta — criar squads custom |

### Squads Custom (criar)

| Squad | Criado com | Usado em |
|-------|-----------|----------|
| content-pipeline-squad | @squad-chief *create-squad | Epic 1 — extracção e estruturação |
| build-engine-squad | @squad-chief *create-squad | Epic 3 — Build Engine |

---

## 7. Critérios de Sucesso

- [ ] 30+ lições completas com ciclo AIOX por lição
- [ ] Build Engine funcional: input → ciclo completo em < 10s
- [ ] Interface local carrega em < 2s
- [ ] Zero secrets em git (ANTHROPIC_API_KEY sempre em .env.local)
- [ ] Pedro consegue encontrar qualquer agente/comando/prompt em < 30s
- [ ] Custo Claude API < $5/mês para uso normal

---

## 8. Out of Scope (Fase 1)

- Session tracking / Claude Code hooks integration
- Knowledge graph / adaptive learning
- Deploy público (Vercel, domínio)
- Auth / multi-user
- PLOS features (Reflection Loop, Pattern Mirror, etc.)
- Mobile responsiveness

---

*PRD criado por @pm (Morgan) com base no research de @analyst (Atlas) — 2026-06-01*
*Research completo: docs/aiox-academy-research.md*
*Projecto base documentado: docs/brownfield-architecture.md*
