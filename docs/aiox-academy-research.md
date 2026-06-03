# AIOX Academy — Research Completo
**Gerado por:** @analyst (Atlas) | **Data:** 2026-06-01
**Status:** Base completa para PRD

---

## FONTES VERIFICADAS

| Fonte | URL | Dados extraídos |
|-------|-----|-----------------|
| AIOX Blog | https://blog.aioxsquad.ai | 9 artigos completos |
| Academia Lendária | https://aiox.academialendaria.ai | Curso completo (12 aulas, 4 módulos) |
| Claude Code Docs | https://code.claude.com/docs/en/overview | Documentação oficial completa |
| GitHub SynkraAI | https://github.com/SynkraAI/aiox-core | v5.2.8, 12 agentes, MIT license |
| GitHub Squads | https://github.com/SynkraAI/aiox-squads | 13 squads comunitários |
| Alan Nicolas YouTube | https://youtube.com/@oalanicolas | 6+ vídeos confirmados |

---

## FONTE 1 — blog.aioxsquad.ai (9 artigos, Alan Nicolas, Maio 2026)

### Artigo 1: "Como criar um agent AIOX do zero"
**URL:** /como-criar-agent-aiox-do-zero | **Leitura:** 10 min

#### Os 4 Tipos de Executor
| Tipo | Invocação | Responsabilidade |
|------|-----------|------------------|
| Agent | Direto via slash command | Persona completa, decision framework |
| Worker | Via outro agent | Task específica, sem resposta ao user |
| Specialist | Via outro agent | Worker com expertise concentrada |
| Operator | Em loop com humano | Decisões que exigem aprovação |

#### Estrutura config.yaml (real)
```yaml
pack:
  name: meu-squad
  version: 1.0.0
  description: "O que esse squad faz em uma frase."
  icon: "🎯"

slash_prefix: "/meu-squad"
entry_agent: meu-squad-chief

agents:
  - id: meu-squad-chief
    methodology: orchestrator
    specialty: "Coordenação do domínio X"
    tier: orchestrator
  - id: meu-squad-worker
    methodology: pipeline-executor
    specialty: "Executor pesado"
    tier: worker

capabilities:
  - id: cap-1
    description: "Executa missão Y"
    activation: "*missao-y"

artifact_contracts:
  - artifact: missao-report
    template_path: "templates/missao-report.template.md"
    lifecycle_states: [PLACEHOLDER, DRAFT, POPULATED, APPROVED]

supported_modes:
  - CRIAR
  - EXECUTAR
```

#### Estrutura de Diretórios (real)
```
squads/meu-squad/
  config.yaml
  agents/
    meu-squad-chief.md
    meu-squad-worker.md
  tasks/
    missao-y.md
  workflows/
    full-mission.yaml
  templates/
    missao-report.template.md
  data/
  checklists/
  scripts/
```

#### Persona do Agent (estrutura real)
```yaml
agent:
  name: meu-squad-chief
  id: meu-squad-chief
  title: "Squad Orchestrator"
  whenToUse: "Use para [missão específica]"

persona:
  role: "Como o agent se identifica"
  style: "Adjetivos sobre tom"
  identity: "Frase em primeira pessoa"
  focus: "O que prioriza em cada interação"

commands:
  - "*help — Show numbered commands"
  - "*missao-y {input} — Executa missão Y"

core_principles:
  - DELEGATE_ALWAYS: "Como decide delegar"
  - VETO_RULES: "O que faz o agent parar"

handoff_to:
  - agent: "@devops"
    when: "Push, PR, deploy"
    contract: "Formato do handoff"
```

#### Validação local (comandos reais)
```bash
npm run validate:squads
npm run validate:squad-structure
npm run validate:reconciliation
npm run doctor
```

#### 3 Anti-Patterns Mais Frequentes
1. **Persona Vazia** → agent genérico sem identidade → incluir agent+persona+commands+core_principles+handoff_to
2. **Capability sem Task Definition** → 30-50% retrabalho → toda capability tem tasks/{name}.md
3. **Bypass de Authority** → hooks bloqueiam → agent deve delegar, não executar directamente

---

### Artigo 2: "CLI First AI Development"
**URL:** /cli-first-ai-development | **Leitura:** 7 min

#### Tese central
"GUIs escondem complexidade que a IA precisa expor para orquestrar bem"

#### Os 4 Pilares do Framework AIOX
1. **Constitution** — ficheiro markdown com regras não-negociáveis e approval gates
2. **Agents** — personas técnicas com autoridade delegada
3. **Workflows** — sequências de tasks em texto, versionadas
4. **Observability** — logs estruturados, métricas de execução, auditabilidade

#### 3 Pitfalls Reais (de 7.500+ sessões Claude Code)
1. **Vibe coding** → prompts soltos sem stories → tech debt não sustentável
2. **False autonomy** → agents sem safeguards → alucinações em escala
3. **Invisible debt** → scripts não versionados → repositório fragmentado

#### Plano de adopção (4 semanas)
- Semana 1: Claude Code + projecto real
- Semana 2: Constitution básica
- Semana 3: 2 agentes
- Semana 4: Observability logging

---

### Artigo 3: "Como orquestrar múltiplos AI agents sem virar caos"
**Key insight:** "authority delegation" é o diferencial entre orquestração efectiva e caos
**Dados:** baseado em 7.500+ sessões Claude Code

---

### Artigo 4: "BMAD vs AIOX em 10 dimensões"
**Key stat:** BMAD ~8 agentes, 6 contextos vs AIOX 473 agentes, 53 squads, 8 camadas
**Benchmark:** 5-way comparação, 10 dimensões, 88 práticas

---

### Artigo 5: "Vibe coding: o que é, quando faz sentido e onde vira armadilha"
**Conclusão:** funciona para protótipos descartáveis; cria debt em produção

---

### Artigos 6-9
- "Framework AI orchestration enterprise grátis" — compara LangGraph, CrewAI, AutoGen, AIOX
- "BMAD-METHOD vs AIOX: comparação técnica"
- "Por que a AIOX existe" — missão: restaurar controlo aos criadores e operadores
- "BMAD ou AIOX: quando usar cada um" — decision tree para 3 ICPs brasileiros

---

## FONTE 2 — Academia Lendária (aiox.academialendaria.ai)

### AIOX Prime — Estrutura Completa (12 aulas, 4 módulos)

#### Módulo 1 — Fundamentos (2 aulas)
| # | Título | Duração | Estado |
|---|--------|---------|--------|
| 1 | Crie seu Primeiro App no AI Studio | 15 min | Grátis |
| 2 | Claude Code: Guia COMPLETO para Iniciantes | 12:34 min | Novo |

#### Módulo 2 — Na Prática (2 aulas)
| # | Título | Duração |
|---|--------|---------|
| 1 | Vibecoding: Migre do Lovable para o Claude Code | 32 min |
| 2 | Migrando Automações por Sistemas Funcionais | 27:15 min |

#### Módulo 3 — Avançado (4 aulas)
| # | Título | Duração |
|---|--------|---------|
| 1 | AIOX Squad: Guia Completo para a Sua Primeira Equipe de IAs | 35:20 min |
| 2 | AIOX Squad: MAIS INTELIGENTE, ECONÔMICO e RÁPIDO | 29:40 min |
| 3 | AIOX: Economizou R$ 86.000 com Dev em 1h | 20 min |
| 4 | AIOX: Substitui um Time de R$ 2 Milhões/Ano | 25 min |

#### Módulo 4 — Resultados dos Alunos (4 aulas)
| # | Título | Duração |
|---|--------|---------|
| 1 | Depoimento: Resultados com AIOX | 10 min |
| 2 | Case: AIOX Core Platform em Ação | 15 min |
| 3 | Depoimento: Edu Garretano | 8 min |
| 4 | Case: Analytics e BI com AIOX (Atlantica Hotels) | 12 min |

#### Recursos Adicionais
- **Materiais & Guia**: 60+ artigos, agentes, workflows
- **Cohort Advanced**: Acesso a mentorias e estratégias avançadas

---

## FONTE 3 — Claude Code Docs (code.claude.com)

### Funcionalidades documentadas (todas)

| Funcionalidade | Docs URL | Relevância para o curso |
|----------------|----------|------------------------|
| Quickstart | /en/quickstart | Lição 0.2 |
| Memory (CLAUDE.md) | /en/memory | Lição 1.3 |
| Common Workflows | /en/common-workflows | Todas as lições Build Cycle |
| Best Practices | /en/best-practices | Lição 5.1 |
| Settings | /en/settings | Lição 0.2 |
| Skills | /en/skills | Lição 4.1 |
| Hooks | /en/hooks | Lição 4.7 |
| MCP | /en/mcp | Lição 4.8 |
| Sub-agents | /en/sub-agents | Lição 3.1 |
| Background Agents | /en/agent-view | Módulo 4 |
| Agent SDK | /en/agent-sdk/overview | Módulo 5 |
| CLI Reference | /en/cli-reference | Cheatsheet |
| GitHub Actions | /en/github-actions | Lição 4.7 |
| Routines | /en/routines | Lição avançada |
| Remote Control | /en/remote-control | Bónus |
| Channels | /en/channels | Bónus |
| VS Code | /en/vs-code | Setup |
| JetBrains | /en/jetbrains | Setup |
| Troubleshooting | /en/troubleshooting | AI Guide |

### Comandos Claude Code (CLI, reais da docs)
```bash
# Instalar (Windows PowerShell)
irm https://claude.ai/install.ps1 | iex

# Instalar (macOS/Linux)
curl -fsSL https://claude.ai/install.sh | bash

# Iniciar em projecto
cd your-project && claude

# Modo não-interactivo
claude -p "descrição da task"

# Pipeline
tail -200 app.log | claude -p "analisa anomalias"
git diff main --name-only | claude -p "review para security issues"
```

---

## FONTE 4 — GitHub SynkraAI/aiox-core

```
Versão: v5.2.8 (21 Maio 2026)
Licença: MIT
Install: npx aiox-core init <project-name>
```

### 12 Agentes Confirmados

| Tipo | Agentes |
|------|---------|
| Meta | aiox-master, aiox-orchestrator |
| Planning (Web UI) | analyst, pm, architect, ux-expert |
| Development (IDE) | sm, dev, qa, po, data-engineer, devops |

### Documentação framework (docs/framework/)
- coding-standards.md
- tech-stack.md
- source-tree.md
- config-override-guide.md
- entity-layer-classification.md
- memory-lifecycle.md
- performance-tips.md

---

## FONTE 5 — GitHub SynkraAI/aiox-squads (13 squads)

| Squad | Domínio | Uso no curso |
|-------|---------|-------------|
| **Education** | Educação | Base pedagógica do curso |
| Squad Creator Pro | Meta + Mind Cloning | Lição de clonagem |
| Deep Research | Pesquisa 3-tier | Research pipeline |
| Dispatch | Execução paralela | Advanced patterns |
| Apex | Frontend premium | UI/UX lessons |
| Brand | Branding | Design system |
| Curator | Curadoria | Content strategy |
| Legal Analyst | 15 agentes jurídicos | Advanced example |
| Kaizen / Kaizen V2 | Monitor + melhoria | Governance |
| SEO | SEO | Content ops |

### Arquitectura de Squads (real)
```
Tier 0 — Chief (orquestrador)
Tier 1 — Masters (especialistas primários)
Tier 2 — Specialists (subespecialistas)
Tier 3 — Support (utilitários)
```

---

## FONTE 6 — Alan Nicolas YouTube (@oalanicolas)

| Vídeo | URL | Mapeia para |
|-------|-----|-------------|
| "AIOX Squad: MAIS INTELIGENTE" | https://www.youtube.com/watch?v=gEUtUdqiAyk | Módulo 3 |
| **"Crie seu próprio AIOX — Curso GRATUITO"** | https://www.youtube.com/watch?v=G2KcYWSyIbI | Foundation completo |
| "Super Agentes Ep.01" | https://www.youtube.com/watch?v=Mm0pAaofPOo | Módulo agentes |
| "O Ano dos Agentes de IA" | https://www.youtube.com/watch?v=cvba_dYjdEI | Contexto/visão |
| "AIOX organizar dados saúde" | https://www.youtube.com/watch?v=Ut4ecAzE7o8 | Case real |
| Playlist Superagentes | https://www.youtube.com/playlist?list=PLwMtuCbkLj_Is4knvSKClvCFjqG6LhHEn | Serie completa |

---

## FERRAMENTAS PARA CONSTRUIR

| Ferramenta | Uso | Preço | URL |
|-----------|-----|-------|-----|
| **youtube-transcript-api** | Extrair transcrições YouTube | Grátis (open source) | github.com/jdepoix/youtube-transcript-api |
| **Supadata** | Transcript API com AI fallback | 100 grátis/mês | supadata.ai/youtube-transcript-api |
| **Fumadocs** | Framework docs Next.js | Open source | fumadocs.dev |
| **Next.js 14** | Framework site | Open source | nextjs.org |
| **Claude Haiku 4.5** | Intent parser (rápido) | $1/$5 por MTok | platform.claude.com |
| **Claude Sonnet 4.6** | Cycle generator | $3/$15 por MTok | platform.claude.com |
| **Vercel** | Deploy | Free tier | vercel.com |
| **Fuse.js** | Search local | Open source | fusejs.io |

### Custo estimado do Build Engine
- Com prompt caching: ~$0.015 por ciclo gerado
- Para uso pessoal (100 ciclos/mês): ~$1.50/mês

---

## STACK DEFINITIVA

```
Frontend:    Next.js 14 + Fumadocs + Tailwind + shadcn/ui
Deploy:      Vercel
Conteúdo:    MDX + GitHub API (SynkraAI) + YouTube transcripts
Build Engine: Claude Haiku (parser) + Sonnet (generator)
Search:      Fuse.js
```

---

## MAPEAMENTO DE CONTEÚDO → LIÇÕES

| Fonte | Conteúdo | Lição(ões) |
|-------|---------|-----------|
| Academia Lendária Mod 1, Aula 2 | Claude Code para Iniciantes (12min) | L0.2, L1.1 |
| Academia Lendária Mod 3, Aula 1 | AIOX Squad Guia Completo (35min) | L1.7, L2.1 |
| Blog: "Como criar agent do zero" | config.yaml, persona, validation | L3.1, L3.2 |
| Blog: "CLI First AI Development" | 4 pilares, 3 pitfalls | L1.2, L1.3 |
| Blog: "Como orquestrar agents" | Authority delegation | L1.3 |
| YouTube: Curso Gratuito AIOX | Walkthrough completo | Módulo 1 base |
| YouTube: Super Agentes Ep.01 | Agentes especializados | Módulo 2 |
| Claude Docs: Skills | /skills | L4.1 |
| Claude Docs: Hooks | /hooks | L4.7 |
| Claude Docs: Sub-agents | /sub-agents | L3.1 |
| Claude Docs: MCP | /mcp | L4.8 |
| GitHub: aiox-squads Education | Estrutura pedagógica | Base de todos os módulos |
| GitHub: Squad Creator Pro | Mind cloning + routing | L3.4, L3.5 |

---

*Research gerado por @analyst (Atlas) — 2026-06-01 — Zero invenção, apenas dados reais verificados*
