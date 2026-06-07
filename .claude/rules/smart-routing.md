# Smart Routing — Guia Automático para Pedro

## Comportamento obrigatório em TODAS as respostas

### ANTES de executar qualquer tarefa, sempre:

1. **Diagnosticar** o tipo de pedido:
   - É uma feature/endpoint novo? → story first via @sm
   - É código a escrever? → @dev com story, não directamente
   - É estratégia/negócio? → @business-chief
   - É configuração/hooks? → @hooks-architect ou @config-engineer
   - É arquitectura? → @architect
   - Não é claro? → fazer 1-2 perguntas de clarificação

2. **Mostrar o routing** antes de agir:
   ```
   → Diagnóstico: [tipo do pedido]
   → Melhor abordagem: [workflow/agent recomendado]
   → Vou: [o que vou fazer exactamente]
   ```

3. **Perguntar se há dúvidas** sobre o plano antes de executar

### Para pedidos de código SEMPRE:

- Antes de escrever código → verificar se existe story em `docs/stories/`
- Se não existe story → sugerir criar via `/AIOX:agents:sm *create-story`
- Se o pedido é vago → fazer perguntas: "o que deve devolver?", "que inputs recebe?", "que erros pode ter?"

### Para pedidos vagos:

Se o pedido não tem contexto suficiente:
- NUNCA inventar o que falta
- SEMPRE perguntar o mínimo necessário (máx 2-3 perguntas)
- Exemplo: "Antes de implementar, preciso saber: 1) que dados recebe o endpoint? 2) como deve validar o email?"

### Mostrar sempre ao Pedro:

Quando activar um agent ou workflow, mostrar:
```
A usar: @nome-do-agent
Porquê: [razão específica]
Comando: [comando exacto se relevante]
```

## Decision Tree — Workflow Routing

### 1. Story Type Detection

```
┌─ É um BUG? ──────────────────────────────→ Quick Flow (< 2h) → @dev (YOLO mode)
│
├─ É uma FEATURE NOVA? ─────────────────────→ Standard Flow → @sm *draft
│
├─ É REFACTOR/TECH-DEBT? ──────────────────→ Depends on scope:
│  ├─ Simples (< 5 files) → Quick Flow → @dev
│  └─ Complexo (> 5 files) → Standard Flow → @sm *draft
│
├─ É CONFIG/HOOKS? ───────────────────────→ @config-engineer ou @hooks-architect
│
├─ É ARQUITECTURA/DESIGN? ────────────────→ @architect (decisão de design)
│                                              então @sm *draft
│
└─ É PESQUISA/ANÁLISE? ──────────────────→ @analyst (research task)
                                              depois relatório → decision
```

### 2. Agent Assignment per Story Type

| Story Type | Primary Agent | Companions | Execution Mode |
|-----------|---------------|-----------|-----------------|
| Bug Fix | @dev | @qa (gate) | YOLO or Interactive |
| Feature | @sm (create) → @po (validate) → @dev | @qa (gate) | Interactive or Pre-Flight |
| Refactor (small) | @dev | @qa (gate) | YOLO |
| Refactor (large) | @sm (create) | @architect, @dev, @qa | Pre-Flight |
| Config | @config-engineer | @devops (MCP) | YOLO |
| Hooks | @hooks-architect | @qa (validation) | Interactive |
| Architecture | @architect | @dev (implement), @qa (validate) | Pre-Flight |
| Research | @analyst | — | YOLO (report-only) |

### 3. Workflow Routing for Standard Stories

**Story-Driven Cycle (SDC) for ALL features/epics:**

```
1. CREATE (@sm *draft)
   ↓
2. VALIDATE (@po *validate-story-draft)
   ├─ GO (≥7/10) → status: Ready
   └─ NO-GO → fixes → re-submit
   ↓
3. IMPLEMENT (@dev *develop-story)
   ├─ Mode: YOLO (simple) | Interactive (medium) | Pre-Flight (complex)
   ├─ Status: InProgress
   └─ CodeRabbit auto-heal (max 2 iterations)
   ↓
4. QA GATE (@qa *qa-gate)
   ├─ PASS → Done
   ├─ CONCERNS → Done (with notes)
   ├─ FAIL → return to @dev for fixes
   └─ WAIVED → Done (rare)
   ↓
5. PUSH (@devops *push) — EXCLUSIVE
```

### 4. Routing Logic per Execution Mode

| Mode | When | Who Decides | Effort |
|------|------|-----------|---------|
| **YOLO** | Clear, simple tasks | @dev | < 2h |
| **Interactive** | Medium complexity, needs checkpoints | @dev (with @po guidance) | 2-8h |
| **Pre-Flight** | Complex, ambiguous, high-risk | @sm (plan first) | > 8h |

## Contexto sobre Pedro

- Iniciante em Claude Code e AIOX — explicações sempre simples
- Prefere saber O QUE fazer e POR QUÊ antes de executar
- Fica frustrado quando Claude erra sem perguntar primeiro
- Stack: Node.js + Railway + Vercel + Stripe + PostgreSQL
- Projecto: Kairos Check (API de scoring de fraude)
