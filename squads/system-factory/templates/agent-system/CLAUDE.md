# CLAUDE.md — Agent System
# Template version: 1.0.0 | system-factory/templates/agent-system
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** Agent System (squads, workflows, automação AIOX)
**Stack:** AIOX framework + Claude Code + Node.js + hooks (.cjs) + Python hooks (.py)
**Repositório:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **Constitution-First** — princípios inegociáveis definidos antes de qualquer feature; gates automáticos bloqueiam violações
2. **Task-First** — workflows são compostos por tasks conectadas, não por agents. Uma task validada é lei
3. **Agent Authority** — cada operação tem um dono exclusivo; ninguém invade o escopo de outro agent
4. **No Invention** — todo o output traça a uma fonte verificável (FR-*, NFR-*, research finding, [SOURCE:])
5. **Context Economy** — context budget é um recurso finito; minimizar tokens carregados por defeito

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` / `gh pr merge` | @devops EXCLUSIVO | todos os outros |
| Criação de agents/personas/DNA | @squad-chief / @architect | @dev directo |
| Criação de squads | @squad-chief EXCLUSIVO | — |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation (hooks, tasks, workflows) | @dev | — |
| MCP add/remove/configure | @devops EXCLUSIVO | todos os outros |
| Deploy / CI/CD pipeline | @devops EXCLUSIVO | todos os outros |
| Architecture / workflow design | @architect | — |
| Framework governance | @aiox-master | — |

**Escalation:** agent não consegue completar → @aiox-master medeia.

---

## 4. Hook Configuration

Cobertura de hooks mínima: **9/17 eventos Claude Code**.

**Obrigatórios (5):**

| Evento | Propósito |
|--------|-----------|
| `SessionStart` | Injectar contexto do projecto no início da sessão |
| `PreToolUse` | Gates de autoridade (ex: bloquear `git push` fora do @devops) |
| `PostToolUse` | Observabilidade — log de todas as tool calls |
| `Stop` | Limpeza de estado, persistência de progresso |
| `TaskCompleted` | Verificação antes de fechar uma task |

**Opcionais (recomendados):**

| Evento | Propósito |
|--------|-----------|
| `UserPromptSubmit` | Roteamento inteligente / injecção de regras contextuais |
| `SubagentStop` | Handoff entre agents com compactação de contexto |
| `ConfigChange` | Auditar mudanças de configuração |
| `PreCompact` | Preservar estado crítico antes de compactar contexto |

Hooks em `.cjs` (Node.js) ou `.py` (Python). Registados em `.claude/settings.json`.

---

## 5. Squad Conventions

**Estrutura de um squad:**
```
squads/{squad-name}/
├── squad.yaml          # manifesto: agents, workflows, chief
├── agents/             # personas (.md) com DNA
├── tasks/              # tasks atómicas e validáveis
├── workflows/          # sequências de tasks (.yaml)
├── checklists/         # gates de qualidade
├── data/               # dados de suporte (.yaml)
├── templates/          # scaffolds reutilizáveis
└── memory/             # MEMORY.md persistente do squad
```

**Naming:**
- Squad: `kebab-case` (ex: `system-factory`, `claude-code-mastery`)
- Agent: `kebab-case` com prefixo de domínio quando relevante (ex: `forge-builder`)
- Task: `kebab-case` verbo-objecto (ex: `detect-system-type`, `score-complexity`)
- Workflow: prefixo `wf-` (ex: `wf-universal-factory.yaml`)

**Activação:** `@{chief-agent}` ou `/{Squad-Alias}:agents:{agent}`

---

## 6. Agent DNA Standards

**Fidelidade mínima:** 85% por agent (medida contra fontes verificadas).

**Obrigatório em cada agent:**
- `voice_dna` — tom, vocabulário, padrões de fala, formatação característica
- `thinking_dna` — heurísticas de decisão, princípios, modo de raciocínio
- `whenToUse` — descrição específica e accionável (nunca vaga)
- Fontes com marcador `[SOURCE: ...]` para cada afirmação de DNA

**Proibido:**
- DNA inventado sem fonte verificável
- `whenToUse` genérico ("use para tarefas gerais")
- Persona sem voice_dna nem thinking_dna

---

## 7. Workflow Design Standards

**Cada task define:**
- `inputs` — o que recebe e de onde
- `outputs` — o que produz e para onde
- `preconditions` / `postconditions` — gates de entrada e saída
- `execution_modes` — interactive / yolo / pre-flight

**Cada workflow define:**
- Sequência de tasks (não de agents)
- Executor padrão de cada task
- Gates entre fases (human checkpoints quando crítico)
- Estado partilhado (ex: `pipeline-state.yaml`)

**Regra de ouro:** uma task validada executa conforme configurada, independente de quem a executa (agent, worker, clone ou humano).

---

## 8. Testing Requirements

**Smoke tests obrigatórios:**
- Cada agent activa sem erro e responde com a persona correcta
- Cada workflow corre end-to-end com inputs de exemplo
- Cada hook dispara no evento certo e produz o output esperado

**Validação de DNA:**
- Score de fidelidade ≥ 85% por agent
- Voice_dna e thinking_dna presentes e não-vazios

**Validação de cobertura:**
- ≥ 9/17 eventos de hook cobertos
- Todos os 5 hooks obrigatórios registados

**Antes de qualquer PR:** smoke tests passam 100%.

---

## 9. Deployment Pipeline

**Branches:**
- `main` → versão estável do sistema de agents
- `feat/*` → desenvolvimento de novos agents/workflows

**CI/CD (.github/workflows):**
1. Validação de manifesto (`squad.yaml` bem-formado)
2. Smoke tests de agents e workflows
3. Lint de hooks (`.cjs` / `.py`)

**Sync multi-IDE:** `.aiox-sync.yaml` mapeia squads → comandos por IDE. Após adicionar um squad, regenerar os comandos.

---

## 10. Performance Benchmarks

| Operação | Alvo |
|----------|------|
| Activação de agent | < 2s |
| SessionStart hook | < 500ms |
| PreToolUse gate | < 200ms |
| Handoff entre agents | < 379 tokens (compactado) |

**Alerta:** qualquer hook bloqueante > 1s degrada a experiência — investigar.

---

## 11. Error Handling Patterns

**Hooks:**
- Hook que falha NUNCA derruba a sessão — degradar graciosamente
- `PreToolUse` de gate: `process.exit(2)` para negar com mensagem clara
- Erros logados em local conhecido, nunca silenciados sem rasto

**Agents:**
- Agent que não consegue completar → escala para @aiox-master, não inventa
- Violação constitucional detectada → BLOCK + exigir fix antes de prosseguir

---

## 12. Observability & Monitoring

**Logging:**
- `PostToolUse` regista todas as tool calls (tool, input summary, duração)
- Métricas de hook em `.synapse/metrics/` (ou equivalente)

**Métricas a monitorar:**
- Taxa de activação de cada agent
- Tempo de execução por hook
- Handoffs entre agents (contagem e tamanho)
- Gates bloqueados (quantos e porquê)

---

## 13. Development Workflow

**Branches:**
```
main
└── feat/{agent-or-workflow-name}
└── fix/{hook-or-task-fix}
└── chore/{description}
```

**Commit format:**
```
feat: add forge-verifier agent [Story 2.1]
fix: corrige gate de push authority no PreToolUse
chore: sync squad commands multi-IDE
```

**PR checklist:**
- [ ] Smoke tests passam
- [ ] DNA fidelity ≥ 85% nos agents tocados
- [ ] Hooks novos registados em settings.json
- [ ] `.aiox-sync.yaml` actualizado se squad mudou

---

## 14. Onboarding Checklist

5 passos para começar a trabalhar neste sistema de agents:

1. **Clone e leitura de contexto:**
   ```bash
   git clone {GITHUB_URL}
   ```
   Ler `PROJECT.md`, `STATE.md` e a Constitution.

2. **Entender a Authority Matrix:** quem faz o quê (secção 3).

3. **Activar um agent de teste:**
   ```
   @{chief-agent}
   ```
   Confirmar que a persona carrega correctamente.

4. **Correr um workflow de exemplo:** seguir um `wf-*.yaml` com inputs de teste.

5. **Validar hooks:** confirmar que os 5 hooks obrigatórios disparam.

---

## 15. Quality Gates

**Antes de qualquer commit:**
- Smoke tests passam localmente
- Sem secrets em hooks ou config
- Manifesto `squad.yaml` bem-formado

**Antes de qualquer PR:**
- DNA fidelity ≥ 85%
- Cobertura de hooks ≥ 9/17
- Story actualizada (InReview)

**Antes de qualquer release:**
- PR reviewed
- Todos os agents activam sem erro
- Constitution gates verdes

---

## Secções Específicas Agent System

## 16. Agent Authority Matrix Detalhada

| Operação | Dono Exclusivo | Pode Delegar Para | Bloqueado Para |
|----------|----------------|-------------------|----------------|
| Criar agent / persona | @squad-chief | @architect (design) | @dev directo, @devops |
| Definir DNA (voice + thinking) | @squad-chief | @analyst (research de fontes) | @dev directo |
| Criar / remover squad | @squad-chief | — | todos os outros |
| `git push` / `git push --force` | @devops | — | TODOS os outros |
| `gh pr create` / `gh pr merge` | @devops | — | TODOS os outros |
| MCP add/remove/configure | @devops | — | TODOS os outros |
| CI/CD pipeline / release | @devops | — | TODOS os outros |
| Criar story | @sm | — | todos os outros |
| Validar story (10-point) | @po | — | todos os outros |
| Implementar hook/task/workflow | @dev | — | — |
| Arquitectura / workflow design | @architect | @data-engineer (DDL) | — |
| Framework governance | @aiox-master | (delega specialized work) | — |

**Princípio:** delegação é o default para trabalho especializado. Execução directa limita-se a governance e orquestração.

---

## 17. Hook Coverage Requirements

**Mínimo absoluto:** 9 de 17 eventos Claude Code cobertos.

**Obrigatórios (5) — o sistema não é válido sem estes:**

| Evento | Propósito | Severidade |
|--------|-----------|------------|
| `SessionStart` | Injectar contexto do projecto | MUST |
| `PreToolUse` | Gates de autoridade e segurança | MUST |
| `PostToolUse` | Observabilidade de tool calls | MUST |
| `Stop` | Persistência de estado ao terminar | MUST |
| `TaskCompleted` | Verificação antes de fechar task | MUST |

**Opcionais (recomendados) — somam para o 9/17:**

| Evento | Propósito | Severidade |
|--------|-----------|------------|
| `UserPromptSubmit` | Roteamento / injecção de regras | SHOULD |
| `SubagentStop` | Handoff com compactação de contexto | SHOULD |
| `ConfigChange` | Auditar mudanças de config | SHOULD |
| `PreCompact` | Preservar estado antes de compactar | SHOULD |
| `Notification` | Alertas ao utilizador | MAY |
| `SessionEnd` | Resumo final de sessão | MAY |

**Gate:** cobertura < 9/17 → sistema marcado NEEDS WORK na verificação elite.

---

## 18. Squad Configuration

**`.aiox-sync.yaml` obrigatório na raiz:**
- `active_ides` — IDEs para sincronização (claude, cursor, etc.)
- `squad_aliases` — mapeamento squad → prefixo de comando
- `active_squads` — lista de squads activos
- `sync_mappings` — origem → destinos por IDE (agents, tasks, checklists)

**Squad activation pattern:**
- `@{chief-agent}` — activação directa do chief do squad
- `/{Squad-Alias}:agents:{agent}` — activação por path completo

**Squad naming conventions:**
- Pasta do squad: `kebab-case`
- Alias no sync: `Title-Case` (ex: `system-factory` → `System-Factory`)
- Chief agent: `{domain}-chief` (ex: `squad-chief`, `business-chief`)

---

## 19. DNA Standards

**Fidelidade mínima:** 85% por agent.

**Componentes obrigatórios:**

| Componente | Conteúdo | Fonte |
|------------|----------|-------|
| `voice_dna` | Tom, vocabulário, padrões de fala, formatação | `[SOURCE: ...]` verificável |
| `thinking_dna` | Heurísticas, princípios, modo de raciocínio | `[SOURCE: ...]` verificável |

**Regras:**
- Cada afirmação de DNA traça a uma fonte com marcador `[SOURCE:]`
- Sem fonte verificável → DNA inválido (viola Article IV — No Invention)
- Fidelidade medida comparando output do agent contra exemplos reais da fonte
- Fidelidade < 85% → agent marcado NEEDS WORK

**Anti-padrões:** DNA inventado, persona genérica, `whenToUse` vago.

---

## 20. Context Budget Management

**Limites de token economy:**

| Artefacto | Limite | Razão |
|-----------|--------|-------|
| `CLAUDE.md` | < 200 linhas | Carregado sempre — cada linha custa em todas as sessões |
| `MEMORY.md` (index) | entradas de 1 linha, < 150 chars | Índice, não memória |
| Handoff entre agents | < 379 tokens | Compactação vs acumulação |
| Rules em `rules/` | frontmatter com `paths:` | Carregamento condicional |

**Quando usar deferred / tool search (tier 3):**
- Tools não-essenciais NÃO devem estar always-loaded
- Descobrir via tool search quando necessário (ADR-5)
- Always-loaded reservado para tier 1/2 e tier 3 essenciais

**Princípio:** o context window é finito. Tudo o que carrega por defeito compete com o trabalho real.
