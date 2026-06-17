# 🔗 CONNECTIVITY GRAPH — Fase 3

**Auditoria:** Kronos AIOX Intelligence Engine  
**Data:** 2026-06-14  
**Escopo:** Reconstrução de Fluxos Reais de Comunicação  
**Status:** ✅ COMPLETO

---

## 🎯 RESUMO EXECUTIVO

Sistema Kairos Cérebro usa **5 mecanismos de transporte principais:**

1. **Workflow Chains** — Sequências agent→agent via command execution
2. **File-Based State** — Stories em Markdown com status tracking
3. **Configuration Resolution** — core-config.yaml + rule resolution
4. **Memory Layer** — .claude/agent-memory/ persistence
5. **Hook Automation** — Event-triggered transitions

---

## 🔄 MECANISMO 1: WORKFLOW CHAINS

[SOURCE: .aiox-core/data/workflow-chains.yaml]

### Story Development Cycle (SDC) — PRIMARY FLOW

```
┌─── PHASE 1: CREATE ──────────────────────────────────────┐
│  Agent: @sm                                               │
│  Command: *draft                                          │
│  Task: create-next-story.md                              │
│  Input: Epic context (.aiox-core/data/ + memory)         │
│  Process:                                                 │
│    1. Carregar epic PRD                                  │
│    2. Gerar story.md com acceptance criteria            │
│    3. Atualizar file list                               │
│  Output: docs/stories/{epic}/{id}.{num}.story.md        │
│  State: Draft                                             │
└──────────────────────────────────────────────────────────┘
         ↓ (Status update → file write)
┌─── PHASE 2: VALIDATE ────────────────────────────────────┐
│  Agent: @po                                               │
│  Command: *validate-story-draft {story-id}              │
│  Task: validate-next-story.md                            │
│  Input: Story file (Draft status)                        │
│  Process:                                                 │
│    1. Ler story.md                                       │
│    2. Avaliar 10-point checklist                        │
│    3. Score ≥7/10 → GO | <7 → NO-GO                    │
│  Output: Story status updated, feedback comments        │
│  State: Ready (if GO) | Draft (if NO-GO)               │
│  Transport: File-based (story.md status field)          │
└──────────────────────────────────────────────────────────┘
         ↓ (Status: Ready)
┌─── PHASE 3: IMPLEMENT ──────────────────────────────────┐
│  Agent: @dev                                              │
│  Command: *develop {story-id}                           │
│  Task: dev-develop-story.md                             │
│  Input: Story file (Ready status)                        │
│  Process:                                                 │
│    1. Ler story AC                                       │
│    2. Checkout feature branch                           │
│    3. Implementar código                                │
│    4. Update story file list                            │
│    5. CodeRabbit self-heal (max 2 iterations)          │
│  Output: Git commits + story metadata                    │
│  State: InProgress → InReview                            │
│  Transport: Git commits + story file updates            │
└──────────────────────────────────────────────────────────┘
         ↓ (Status: InReview)
┌─── PHASE 4: QA GATE ────────────────────────────────────┐
│  Agent: @qa                                               │
│  Command: *review {story-id}                            │
│  Task: qa-gate.md                                        │
│  Input: Git commits, story metadata                      │
│  Process:                                                 │
│    1. CodeRabbit review (full mode)                     │
│    2. 7 quality checks (AC, tests, regression, etc.)    │
│    3. Verdict: PASS | CONCERNS | FAIL | WAIVED         │
│  Output: QA gate decision                                │
│  State: InReview → Done (if PASS) | InProgress (if FAIL)│
│  Transport: Gate decision file + story status           │
│  Loop: If FAIL → @dev *fix → @qa *review (max 5 iter)  │
└──────────────────────────────────────────────────────────┘
         ↓ (Status: Done)
┌─── PHASE 5: PUSH ───────────────────────────────────────┐
│  Agent: @devops (EXCLUSIVE)                              │
│  Command: *push                                          │
│  Task: github-devops-pre-push-quality-gate.md           │
│  Input: QA gate PASS                                     │
│  Process:                                                 │
│    1. Verificar gate status                              │
│    2. Git push origin                                    │
│    3. PR merge (se workflow permits)                     │
│  Output: Remote branch updated                           │
│  State: Remote sync complete                             │
│  Transport: Git protocol + GitHub API                    │
└──────────────────────────────────────────────────────────┘
```

**Transporte:** File-based state + Git commits + Status field updates

---

## 🔄 MECANISMO 2: FILE-BASED STATE TRACKING

[SOURCE: docs/stories/]

Cada story é um ficheiro Markdown com estado persistido:

```markdown
---
id: 10.1
epic: EPIC-10
title: Generate ARCHITECTURE.md Layer Map
status: Done          # ← STATE TRANSPORT
validation: 9/10      # ← METADATA
qa_gate: PASS         # ← VERDICT
---

## Acceptance Criteria
- [ ] AC1 (done)
- [ ] AC2 (done)
...

## File List
- docs/ARCHITECTURE.md (created)
- docs/stories/10.1.story.md (this file)
```

**Flow:** 
- Agent lê story.md
- Agent atualiza status + metadata
- Agent escreve story.md
- Next agent lê updated story.md
- Cycle continues

**Vantagem:** Estado é rastreável em git, auditável, human-readable

---

## 🔄 MECANISMO 3: CONFIGURATION RESOLUTION

[SOURCE: .aiox-core/core-config.yaml + .claude/rules/]

### Config Hierarchy (ordem de resolução)
```
.claude/settings.local.json
    ↓ (highest priority)
.claude/settings.json
    ↓
~/.claude/settings.json
    ↓
.aiox-core/core-config.yaml (PROJECT defaults)
    ↓
Hardcoded defaults in framework (lowest)
```

### Agent Activation Flow
```
Agent invocation (@dev *develop)
    ↓
Resolve config via hierarchy
    ↓
Load core-config.yaml (prdVersion, prdShardedLocation, etc.)
    ↓
Load .claude/rules/ (apply operational constraints)
    ↓
Load .claude/agent-memory/{agent}/ (persistent state)
    ↓
Execute agent with merged config
```

**Transport:** YAML parsing + memory file loading

---

## 🔄 MECANISMO 4: MEMORY LAYER PERSISTENCE

[SOURCE: .claude/agent-memory/]

### Agents with Persistent Memory
- aiox-dev (dev-focused context)
- aiox-pm (planning state)
- aiox-po (backlog state)
- aiox-architect (design decisions)

### Memory Flow
```
Agent startup
    ↓
Load .claude/agent-memory/{agent}/MEMORY.md
    ↓
Parse frontmatter + body
    ↓
Inject into agent context
    ↓
Agent executes with memory-enriched context
    ↓
Agent updates MEMORY.md (optional)
```

**Transport:** File I/O (Read/Write) + Markdown parsing

---

## 🔄 MECANISMO 5: HOOK AUTOMATION & EVENT DISPATCH

[SOURCE: .claude/hooks/]

### Hook Events & Triggers

| Hook | Event | Trigger | Effect |
|------|-------|---------|--------|
| `enforce-agent-authority.cjs` | PreToolUse | `git push` | Block if not @devops |
| `enforce-story-driven.cjs` | PreToolUse | `git commit` | Block if no active story |
| `enforce-quality-gates.cjs` | PreToolUse | `git merge` | Block if QA gate FAIL |
| `agent-activation-tracker.cjs` | SessionStart | Agent @X invoked | Track active agent |
| `gate-logger.cjs` | PostToolUse | Constitutional gate | Log decision to `.aiox/gate-logs/` |

### Hook Flow
```
User action (e.g., git push)
    ↓ PreToolUse event
Hook intercepts
    ↓ Call enforce-agent-authority.cjs
Evaluate: is_devops() && commit_has_story()
    ↓
Allow → Proceed
Block → Error + reason
```

**Transport:** Hook system (native Claude Code events)

---

## 🌐 COMPLETE CONNECTIVITY MAP

### AGENT ↔ AGENT

```
@sm *draft
    ↓ (command execution)
  Task: create-next-story.md loads
    ↓ (file output)
  Story created: docs/stories/epic-10/10.1.story.md
    ↓ (state = Draft)
@po detects Draft story
    ↓ (*validate command)
  Story validated: status → Ready
    ↓
@dev detects Ready story
    ↓ (*develop command)
  Implementation begins
```

**Transport Type:** File-based state polling + async command execution

### AGENT → WORKFLOW

```
Agent executes *command
    ↓ command_loader lookup
  Map command to task file
    ↓
  Load task file
    ↓ CRITICAL_LOADER_RULE compliance
  Read task workflow definition
    ↓
  Execute task steps (sequentially)
    ↓
  Output artifact (code, doc, etc.)
    ↓
  Update story state
    ↓
  Next agent detects state change
```

### WORKFLOW → TASK

```
workflow-chains.yaml defines:
  step: 2
    agent: "@po"
    command: "*validate-story-draft"
    task: validate-next-story.md
    ↓
Agent looks up task file via command_loader
    ↓
Task loaded + workflow instructions extracted
    ↓
Task executed (following internal workflow)
    ↓
Output written to story file
```

### TASK → STORY

```
task: create-next-story.md
  phase: 1 (Generate story)
    input: epic.md from core-config.prdShardedLocation
    output: docs/stories/{epic}/{id}.story.md
    ↓
Story file created with:
  - Acceptance criteria
  - File list
  - Status = Draft
  - Metadata
```

### STORY → EPIC

```
Story file contains:
  epic: EPIC-10
    ↓ (metadata reference)
Epic.md contains:
  stories: [10.1, 10.2, 10.3]
    ↓ (forward reference)
Rastreability chain:
  EPIC-10 PRD → story acceptance criteria → AC implementation
```

### CONFIG → AGENT

```
Agent activation:
  @dev *develop
    ↓
  Load core-config.yaml:
    prdVersion: v4
    prdShardedLocation: docs/prd/
    devLoadAlwaysFiles: [docs/ARCHITECTURE.md, ...]
    ↓
  Dev agent loads configured files automatically
    ↓
  Execution with enriched context
```

### MEMORY → AGENT

```
Agent startup:
  @pm *create-epic
    ↓
  Load .claude/agent-memory/aiox-pm/MEMORY.md
    ↓
  Extract persistent state:
    - prior epic decisions
    - team context
    - strategy notes
    ↓
  Agent uses memory in decision-making
    ↓
  May update MEMORY.md with new findings
```

### EVENT → WORKFLOW

```
Git push attempted
    ↓ PreToolUse hook
  enforce-agent-authority.cjs evaluates
    ↓
  Is active_agent == @devops? NO
    ↓
  Block with reason
    ↓
  Decision logged to .aiox/gate-logs/
```

---

## 📊 SYNCHRONIZATION PATTERNS

### Asynchronous (Default)
- Story status changes are visible to next agent via file read
- No real-time notification — agent detects via polling
- Latency: 0-5 seconds (file system updates)

### Synchronous (Explicit Handoff)
- When one agent explicitly calls another via command
- Example: @pm *create-epic → @sm *draft → @po *validate
- Each step blocks until previous completes

### Event-Driven (Hooks)
- Constitutional gates enforce via PreToolUse hooks
- Gate logger records all decisions
- Blocks actions that violate Constitution

---

## 🎯 PAYLOAD FORMATS

### Story File Payload
```yaml
---
id: 10.1
epic: EPIC-10
status: Done
validation: 9/10
qa_gate: PASS
file_list:
  - docs/ARCHITECTURE.md
  - docs/stories/10.1.story.md
---
[Markdown AC + implementation notes]
```

### Gate Decision Payload
```json
{
  "timestamp": "2026-06-14T10:00:00Z",
  "article": "art-ii-agent-authority",
  "decision": "block",
  "reason": "git push is exclusive to @devops",
  "agent": "@dev",
  "operation": "git push"
}
```

### Memory Payload
```yaml
---
name: dev-session-context
type: project
metadata:
  type: project
---
[Markdown notes about ongoing work]
```

---

## ✅ CONECTIVIDADE VALIDADA

- ✅ Agentes conectam via file-based state (191 stories)
- ✅ Workflows encadeiam agentes via command execution
- ✅ Configuração aplica-se globalmente via hierarchy
- ✅ Memória persiste entre sessões
- ✅ Hooks enforçam Constitutional constraints
- ✅ Sem dependências circulares observadas
- ✅ Todas as transições de estado são rastreáveis

---

## 🎯 PRÓXIMA FASE

**FASE 4:** Auditoria de Inputs/Outputs — Matriz detalhada de IO por agente

---

**Kronos — Fase 3 Conclusa ✅**
