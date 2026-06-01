# AIOX — Pontos Cegos Avançados (Blind Spots)

> Extração com ZERO invenção. Cada ponto tem [FONTE: ficheiro] verificado em código real.
> Autor: Atlas (AIOX Analyst) · Data: 2026-06-01
> Repo de origem: `C:/Users/lealp/aiox-core-official/`

---

## PARTE 1 — Os 8 Layers do SYNAPSE (L0-L7)

O SYNAPSE é o motor de injeção de contexto. Cada prompt passa por até 8 processadores de camada
(`LayerProcessor`). Cada layer devolve `{ rules, metadata }` ou `null` (skip gracioso).

### PC-1: L0 valida a flag `nonNegotiable` no manifest — não é só carregar a Constitution
**Fonte:** `.aiox-core/core/synapse/layers/l0-constitution.js`
**O que é:** L0 carrega os 6 artigos constitucionais, mas além disso valida explicitamente `domain.nonNegotiable === true` no manifest e propaga essa flag nos metadata. Se o domínio constitution NÃO tiver `nonNegotiable: true`, as regras ainda carregam mas a flag fica `false`.
**Como usar:** Ao auditar o manifest do `.synapse`, verifica que o domínio CONSTITUTION tem `nonNegotiable: true` — sem isso, o SYNAPSE injeta as regras sem o selo de inegociável.
**Porque poucos sabem:** Toda a gente assume que "Constitution = inegociável" automaticamente. Na verdade é uma flag de manifest separada que pode estar errada e ninguém repara.

### PC-2: L1 combina DOIS ficheiros de domínio (global + context) numa ordem fixa
**Fonte:** `.aiox-core/core/synapse/layers/l1-global.js` (linhas 63-67)
**O que é:** L1 não é "regras globais" apenas. Lê `.synapse/global` E `.synapse/context` e funde-os SEMPRE com global primeiro, context segundo (`[...globalRules, ...contextRules]`). O ficheiro `context` é o que muda por bracket.
**Como usar:** Se queres regras que dependem do estado da sessão (ex: avisos de bracket), elas vão no domínio `context`, não no `global`.
**Porque poucos sabem:** A ordem é silenciosa no código; regras de `global` sempre "ganham" posição na injeção, o que importa quando o token budget corta no fim.

### PC-3: L2 deteta autoridade só por substring "AUTH" nas regras
**Fonte:** `.aiox-core/core/synapse/layers/l2-agent.js` (linha 80: `rules.some(r => r.toUpperCase().includes('AUTH'))`)
**O que é:** L2 carrega regras do agente ativo (via `agentTrigger` no manifest) e marca `hasAuthority: true` se QUALQUER regra contiver a string "AUTH" (case-insensitive). É deteção por substring, não semântica.
**Como usar:** Para garantir que as fronteiras de autoridade de um agente são reconhecidas, as regras de autoridade precisam literalmente da palavra "AUTH" (ex: "AUTHORITY", "git push AUTH").
**Porque poucos sabem:** Uma regra de autoridade escrita sem o token "AUTH" (ex: "só @devops pode fazer push") NÃO aciona `hasAuthority` — falha silenciosa.

### PC-4: L3 injeta a fase atual do workflow nos metadata
**Fonte:** `.aiox-core/core/synapse/layers/l3-workflow.js` (linha 80: `session.active_workflow?.current_phase`)
**O que é:** L3 não carrega só regras do workflow ativo — anexa `phase: session.active_workflow.current_phase` aos metadata. A deteção é via `workflowTrigger` no manifest, casado com `session.active_workflow.id`.
**Como usar:** Se o teu workflow tem regras dependentes de fase, o SYNAPSE já sabe a fase — mas só injeta as regras do ficheiro de domínio do workflow, não filtra por fase automaticamente.
**Porque poucos sabem:** A `phase` é metadata passiva, não um filtro. Quem espera "regras só da fase X" engana-se; carrega o domínio inteiro do workflow.

### PC-5: L4 não lê ficheiros — sintetiza regras da sessão em texto
**Fonte:** `.aiox-core/core/synapse/layers/l4-task.js` (linhas 61-69)
**O que é:** Diferente de L0-L3, o L4 NÃO carrega nenhum ficheiro de domínio. Lê `session.active_task` e gera literalmente três strings: `Active Task: {id}`, `Story: {story}`, `Executor: {executor_type}`. Skip se não houver task com `id`.
**Como usar:** O `executor_type` da task (clone/worker/human/agent) é injetado no contexto — é assim que o modelo "sabe" quem está a executar.
**Porque poucos sabem:** É o único layer puramente síntese-de-estado, sem I/O de ficheiro. Toda a gente assume que cada layer lê um `.synapse/<algo>`.

### PC-6: L5 (Squad) tem cache de 60s e namespacing automático com prefixo
**Fonte:** `.aiox-core/core/synapse/layers/l5-squad.js` (linhas 23, 143-159)
**O que é:** L5 varre `squads/*/.synapse/manifest`, faz cache em `.synapse/cache/squad-manifests.json` com TTL de 60.000ms, e prefixa CADA chave de domínio com `{SQUAD_NAME_UPPER}_`. Lê o modo de merge da meta-chave `{SQUAD}_EXTENDS` (valores: `extend`/`override`/`none`).
**Como usar:** Para um squad NÃO injetar regras no contexto global, define `{SQUAD}_EXTENDS: none` no manifest. O squad ativo (`session.active_squad`) é processado PRIMEIRO (prioridade).
**Porque poucos sabem:** O TTL de 60s significa que editas um manifest de squad e o efeito pode demorar até 1 minuto. E `EXTENDS: none` é um opt-out raríssimo de conhecer.

### PC-7: L6 (Keyword) faz dedup contra layers anteriores via metadata.source
**Fonte:** `.aiox-core/core/synapse/layers/l6-keyword.js` (linhas 84-89, 127-151)
**O que é:** L6 casa keywords `recall` do manifest contra o prompt, MAS antes verifica `loadedSources` (extraído de `metadata.source` e `metadata.agentId` dos layers anteriores) e SALTA domínios já carregados, registando-os em `skippedDuplicates`. Respeita `globalExclude` + `exclude` por domínio.
**Como usar:** Se um domínio já foi carregado por L2 (agente), o L6 não o re-injeta mesmo que a keyword case — evita duplicação de tokens.
**Porque poucos sabem:** A deduplicação é cross-layer e baseada em normalização de `source` (uppercase, `-`→`_`). Domínios com nomes ambíguos podem ser deduplicados por engano.

### PC-8: L7 deteta star-commands por regex e faz parsing de blocos `[*command]`
**Fonte:** `.aiox-core/core/synapse/layers/l7-star-command.js` (linha 20: `/\*([a-z][\w-]*)/gi`; linhas 139-166)
**O que é:** L7 procura padrões `*comando` no prompt (regex), depois faz parse do ficheiro `.synapse/commands` que usa cabeçalhos `[*command]` para delimitar blocos. Suporta múltiplos star-commands no mesmo prompt.
**Como usar:** `*brief`, `*dev`, `*plan`, `*review`, `*discuss`, `*debug`, `*explain` mudam o MODO de resposta injetando regras (ver PC-13).
**Porque poucos sabem:** O regex exige que o comando comece com letra `[a-z]`. `*1plan` não casa. E o nome do comando é sempre lowercased antes de procurar o bloco.

---

## PARTE 2 — Context Brackets (valores REAIS do código)

### PC-9: Os 4 brackets têm token budgets EXATOS e thresholds de % restante
**Fonte:** `.aiox-core/core/synapse/context/context-tracker.js` (linhas 29-46, 160-175)
**O que é:** Os brackets baseiam-se em % de contexto RESTANTE (não usado):
| Bracket | % restante | Token Budget |
|---------|-----------|--------------|
| FRESH | 60-100% | 800 |
| MODERATE | 40-60% | 1500 |
| DEPLETED | 25-40% | 2000 |
| CRITICAL | 0-25% | 2500 |
**Como usar:** Quanto mais contexto consumido, MAIOR o budget de injeção (CRITICAL injeta 2500 tokens) — porque o modelo precisa de mais reforço quando "esquece".
**Porque poucos sabem:** É contra-intuitivo: a maioria assumiria que se injeta MENOS quando o contexto está cheio. O SYNAPSE faz o oposto — reforça mais.

### PC-10: Layers ativos mudam por bracket — FRESH só corre 4 layers
**Fonte:** `.aiox-core/core/synapse/context/context-tracker.js` (linhas 147-152)
**O que é:**
- **FRESH:** apenas L0, L1, L2, L7 (lean) — memoryHints OFF, handoffWarning OFF
- **MODERATE:** todos os 8 (L0-L7) — memoryHints OFF
- **DEPLETED:** todos + memoryHints ON
- **CRITICAL:** todos + memoryHints ON + handoffWarning ON
**Como usar:** Em FRESH, regras de workflow (L3), task (L4), squad (L5) e keyword (L6) NÃO são injetadas. Se uma regra de squad "não aparece" no início da sessão, é porque estás em FRESH.
**Porque poucos sabem:** Explica o "fantasma" de regras que funcionam a meio da sessão mas não no início — é o bracket FRESH a saltar 4 layers.

### PC-11: O cálculo de tokens usa um multiplicador de segurança de 1.2x para XML
**Fonte:** `.aiox-core/core/synapse/context/context-tracker.js` (linhas 53, 207)
**O que é:** `XML_SAFETY_MULTIPLIER = 1.2`. A fórmula é `usedTokens = promptCount * avgTokensPerPrompt * 1.2`. Justificação no código: `chars/4` subestima tokens em XML em 15-25%, o 1.2x corrige (ref: NOG-9 research C6-token-budget.md).
**Como usar:** A estimativa de bracket é deliberadamente conservadora — chegas a DEPLETED/CRITICAL ~20% mais cedo do que a contagem nominal sugeriria.
**Porque poucos sabem:** É uma constante de calibração escondida. Sem ela, o SYNAPSE entraria em modo de reforço tarde demais para output XML-pesado (que é o caso do próprio SYNAPSE).

### PC-12: maxContext vem de core-config.yaml → models.registry e tem cache por raiz
**Fonte:** `.aiox-core/core/synapse/context/context-tracker.js` (linhas 99-137; default `maxContext: 200000`)
**O que é:** O tamanho da janela de contexto lê-se de `core-config.yaml → models.registry[models.active].contextWindow`. Se faltar, cai em 200.000 tokens. Tenta primeiro `.aios-core` (legacy) depois `.aiox-core`. Cache por raiz de projeto via `_modelConfigCache`.
**Como usar:** Mudar o modelo ativo no `core-config.yaml` muda os pontos de transição de bracket. Modelo com janela maior = mais prompts antes de DEPLETED.
**Porque poucos sabem:** O fallback duplo `.aios-core`→`.aiox-core` é resíduo de migração de marca; e os brackets são relativos ao modelo, não absolutos.

---

## PARTE 3 — Star-Commands (.synapse/commands)

### PC-13: Existem 7 modos de resposta + um sub-comando `*synapse` com 6 ações
**Fonte:** `.synapse/commands` (verificado integralmente)
**O que é:** Modos: `*brief` (bullets, máx 5 itens, sem preâmbulo), `*dev` (código sobre explicação, mudanças mínimas), `*review`, `*plan` (lista ficheiros + riscos + estima complexidade), `*discuss` (trade-offs + prós/contras), `*debug`, `*explain` (modo ensino com analogias).
**Como usar:** `*brief` força respostas telegráficas. `*plan` força o output a listar ficheiros a modificar com racional ANTES de implementar.
**Porque poucos sabem:** Estes são modos de SYNAPSE injetados via L7, não comandos de agente (`*help` etc). Funcionam em qualquer agente.

### PC-14: `*synapse` tem 6 sub-comandos de introspeção, incluindo `*synapse-diagnose`
**Fonte:** `.synapse/commands` (linhas 89-109)
**O que é:** `synapse help/status/debug/domains/session/reload` + o comando separado `*synapse-diagnose`. `status` mostra domínios e layers ativos; `debug` mostra tempos de parse e contagens de regras; `domains` lista todos os domínios com triggers; `session` mostra agente/workflow/bracket; `reload` força recarregamento do manifest do disco.
**Como usar:** `*synapse reload` é a forma de invalidar a cache (incluindo o TTL de 60s dos squads) sem reiniciar a sessão. `*synapse session` diz-te em que bracket estás.
**Porque poucos sabem:** A maioria não sabe que pode introspecionar o motor em runtime. `*synapse debug` revela quanto tempo cada domínio demorou a parsear.

---

## PARTE 4 — Bob Mode (@pm user_profile=bob)

### PC-15: Bob NUNCA emula agentes — spawna-os em terminais separados
**Fonte:** `.aiox-core/development/agents/pm.md` (linhas 144-167, regra `NEVER_EMULATE_AGENTS`)
**O que é:** Quando `user_profile === 'bob'`, o PM (Morgan→Bob) opera como orquestrador. Constraint crítica: NUNCA fingir ser outro agente (@dev, @qa) nem simular respostas deles no próprio contexto. Em vez disso, usa `TerminalSpawner.spawnAgent()` em terminais separados, faz polling até completar, e devolve o output coletado.
**Como usar:** Bob é o modo "assistido" para quem não quer gerir agentes manualmente. O workflow é: analyze → assign (ExecutorAssignment) → prepare (ficheiro de contexto) → spawn → wait (polling) → return.
**Porque poucos sabem:** É a defesa contra "context pollution" — cada agente spawnado tem contexto LIMPO. A maioria pensa que orquestração = simular agentes na mesma janela; Bob faz o oposto deliberadamente.

### PC-16: Bob verifica sessão existente ANTES de cumprimentar e corre cleanup de lifecycle
**Fonte:** `.aiox-core/development/agents/pm.md` (STEP 3.5, linhas 55-79)
**O que é:** Story 12.5 (AC6): com `user_profile=bob`, antes do greeting Bob corre `runStartupCleanup(projectRoot)` (limpa locks, sessões >30d, snapshots >90d) e depois `orchestrator._checkExistingSession()`. Se detetar sessão, oferece retomar; senão segue o greeting normal.
**Como usar:** Bob tem continuidade de sessão automática. Toggle entre modos: `*toggle-profile` (bob ↔ advanced).
**Porque poucos sabem:** O cleanup de data-lifecycle (30d sessões, 90d snapshots) é silencioso e só acontece em Bob mode. Em modo `advanced` o PM é um Product Manager standard sem orquestração.

---

## PARTE 5 — Agent Handoff (compactação de contexto)

### PC-17: O artefacto de handoff tem limites RÍGIDOS e descarta a persona anterior
**Fonte:** `.claude/rules/agent-handoff.md` (linhas 47-73)
**O que é:** Ao trocar de agente (`@agent`), a persona completa do agente anterior (~3-5K tokens) é DESCARTADA e substituída por um artefacto de ~379 tokens. Limites: máx 500 tokens/artefacto, máx 3 summaries retidos (o 4º descarta o mais antigo), máx 5 decisions, máx 10 files_modified, máx 3 blockers.
**Como usar:** Preserva-se SEMPRE: story ID+path, task atual, branch git, decisões arquiteturais, ficheiros modificados, blockers. Descarta-se: persona, lista de comandos, dependências, configs de tools, templates de greeting do agente anterior.
**Porque poucos sabem:** A redução é mensurável — 33% por troca, 57% após 2 trocas (@sm→@dev→@qa). E só ativa quando JÁ há um agente diferente ativo. Storage: `.aiox/handoffs/` (gitignored).

---

## PARTE 6 — Tier System (0-3 + Tools)

### PC-18: Tier 0 corre SEMPRE primeiro e recomenda o tier de execução
**Fonte:** `.aiox-core/development/data/tier-system-framework.md` (linhas 59-77, 262-285)
**O que é:** Tier 0 (Foundation & Diagnosis) corre obrigatoriamente antes de qualquer execução, estabelece baseline, identifica constraints e DEVOLVE o tier recomendado (1, 2 ou 3). Tier 1 = experts core; Tier 2 = systematizers (criadores de frameworks); Tier 3 = format specialists; Tools = NÃO são agentes (checklists/validadores aplicados DEPOIS).
**Como usar:** Routing por padrão de keyword: `audit/analyze/diagnose`→Tier 0; `create/write/build`→Tier 1; `systematize/framework`→Tier 2; `adapt/format/optimize`→Tier 3; `validate/check/review`→Tools.
**Porque poucos sabem:** "Tools" parecem agentes mas não são — são utilitários invocados via `*tool-name` APÓS a criação. E o Tier 0 é o único com execução garantida.

### PC-19: Cada tier tem um quality gate próprio; Tier 1 exige score >= 7.0
**Fonte:** `.aiox-core/development/data/tier-system-framework.md` (linhas 440-471)
**O que é:** Gates por tier: Tier 0 = `diagnosis-complete`; Tier 1 = `primary-output-complete` (deliverable cumpre requisitos, dimensões de qualidade score >= 7.0, sem blocking issues); Tier 2 = `system-validated`; Tier 3 = `format-optimized`.
**Como usar:** Output de um agente Tier 1 que pontue < 7.0 em qualquer dimensão de qualidade não passa o gate.
**Porque poucos sabem:** O threshold 7.0 é específico e aplica-se por dimensão, não à média.

---

## PARTE 7 — Decision Heuristics (coherence scoring)

### PC-20: A Coherence Scan dá poder de VETO ao critério `consistency` (peso 1.0)
**Fonte:** `.aiox-core/development/data/decision-heuristics-framework.md` (linhas 117-149)
**O que é:** A heurística `coherence_scan` (COH_001) valida fit de executor/recurso. Pesos: `consistency: 1.0` (VETO power), `system_fit: 0.8`, `capability: 0.3`. Se `consistency < 0.7` OU `detected_incoherence = true` → VETO imediato (reassign executor / trust violation).
**Como usar:** Capability (0.3) é o critério MENOS importante — um executor capaz mas incoerente com o sistema é REJEITADO. A coerência supera a capacidade.
**Porque poucos sabem:** Contra-intuitivo: o sistema prefere um executor coerente menos capaz a um capaz incoerente. `capability` tem threshold `null` (context-dependent).

### PC-21: NUNCA automatizar sem guardrails — é VETO absoluto
**Fonte:** `.aiox-core/development/data/decision-heuristics-framework.md` (linhas 151-193)
**O que é:** A `automation_decision` (AUT_001) tem `guardrails_present: 1.0` (VETO power). Regra: `IF automatability > 0.5 AND guardrails_present THEN AUTOMATE`. Constraint: "NEVER automate without guardrails". Regra de design: task repetida 3+ vezes SEM automação = "Design failure - immediate remediation".
**Como usar:** Qualquer automação DEVE ter guardrails + logs + escape manual. Tarefa repetida 2x = documentar e automatizar.
**Porque poucos sabem:** A "3x sem automação = falha de design" é uma regra de auto-crítica do processo que poucos aplicam.

### PC-22: O Scope Complexity Gate BLOQUEIA criação direta de squad com >= 10 workflows ou >= 8 agentes
**Fonte:** `.aiox-core/development/data/decision-heuristics-framework.md` (linhas 341-417)
**O que é:** `SC_SCP_001` (blocking: true). VETO se `workflows_mapped >= 10` (exige PRD com Epics/Stories) OU `agents_needed >= 8` (exige roadmap faseado). Warning (override permitido) se domínio novo sem precedente E workflows >= 5.
**Como usar:** Se vais criar um squad grande, o sistema FORÇA criar um PRD em `docs/projects/{domain}/prd.md` primeiro, dividido em Epics (Tier 0 Onboarding, Tier 1 Execução, etc).
**Porque poucos sabem:** Os números são thresholds duros (10 workflows / 8 agentes). Squad de Contabilidade com 54 workflows = VETO automático.

### PC-23: A hierarquia de decisão é REUSE > ADAPT > CREATE com limites de % de mudança
**Fonte:** `.claude/rules/ids-principles.md` (linhas 12-34)
**O que é:** REUSE (relevância >= 90%, sem modificação); ADAPT (relevância 60-89%, adaptabilidade >= 0.6, mudanças NÃO podem exceder 30% do artefacto original nem quebrar consumers/`usedBy`); CREATE (sem match, exige `evaluated_patterns` + `rejection_reasons` + registo no Entity Registry em 24h).
**Como usar:** Antes de criar qualquer artefacto novo, o IDS espera que justifiques porque não reusaste/adaptaste. Adaptar mais de 30% = deves criar, não adaptar.
**Porque poucos sabem:** O limite de 30% de mudança para "ADAPT" é uma fronteira quantitativa que distingue ADAPT de CREATE.

---

## PARTE 8 — IDS Gates G1-G6

### PC-24: Só G5 e G6 bloqueiam merge — G1-G4 são advisory/informational
**Fonte:** `.claude/rules/ids-principles.md` (linhas 36-78)
**O que é:**
| Gate | Agente | Tipo | Bloqueia? | Latência |
|------|--------|------|-----------|----------|
| G1 Epic Creation | @pm | Advisory | Não | <24h |
| G2 Story Creation | @sm | Advisory | Não | <24h |
| G3 Story Validation | @po | Soft Block | Soft (override) | <4h |
| G4 Dev Context | @dev | Informational | Não (só métricas) | <2s |
| G5 QA Review | @qa | Blocks Merge | SIM (entidade nova sem registo/justificação) | <30s |
| G6 CI/CD | @devops | Blocks Merge | SIM em CRITICAL, WARN em MEDIUM/LOW | <60s |
**Como usar:** O bloqueio real só acontece no QA (G5) e CI/CD (G6). G4 no @dev é puramente logging para métricas — não te impede de nada.
**Porque poucos sabem:** A maioria assume que todos os gates bloqueiam. Na prática, G1-G4 são "lembretes"; só os dois últimos têm dentes.

### PC-25: Override de IDS exige razão escrita e fica em audit trail
**Fonte:** `.claude/rules/ids-principles.md` (linhas 80-90)
**O que é:** Comando `--override-ids --override-reason "explicação"`. Permitido para: fix time-critical, adaptação introduziria risco inaceitável, ou artefacto existente está deprecated/frozen. Requisito: fica logado para auditoria.
**Como usar:** Podes furar o gate G5, mas tens de justificar por escrito e fica registado.
**Porque poucos sabem:** O override existe mas deixa rasto permanente — não é uma porta dos fundos silenciosa.

---

## PARTE 9 — Bónus (descobertos durante a pesquisa)

### PC-26: O Memory Bridge mapeia bracket → profundidade de memória (e é consumer-only)
**Fonte:** `.aiox-core/core/synapse/memory/memory-bridge.js` (linhas 24-38)
**O que é:** O bridge de memória (MIS) tem timeout de 15ms e mapeia: FRESH→skip (0 tokens), MODERATE→Layer 1 metadata (~50 tokens), DEPLETED→Layer 2 chunks (~200 tokens), CRITICAL→Layer 3 full content (~1000 tokens). É consumer-only: NUNCA modifica os stores de memória. No-op gracioso se o MIS não estiver instalado.
**Como usar:** Quanto mais depletado o contexto, MAIS memória profunda é recuperada (até 1000 tokens de conteúdo completo em CRITICAL). Casa com o LAYER_CONFIGS (memoryHints ON em DEPLETED/CRITICAL).
**Porque poucos sabem:** A profundidade de retrieval escala com a depleção — o sistema "puxa memórias mais ricas" precisamente quando está a ficar sem contexto. O feature-gate Pro foi removido (Story INS-4.11).

### PC-27: Cada layer tem timeout próprio e degradação graciosa (nunca crasha o pipeline)
**Fonte:** `.aiox-core/core/synapse/layers/layer-processor.js` (linhas 67-82); timeouts: L0=5ms, L1=10ms, L2=15ms, L3=15ms, L4=20ms, L5=20ms, L6=15ms, L7=5ms
**O que é:** `_safeProcess()` envolve cada `process()` com monitorização de tempo e try/catch. Se exceder o timeout, emite warning mas NÃO aborta. Se atirar erro, devolve `null` (skip) e guarda em `_lastError`. O pipeline nunca falha por causa de um layer.
**Como usar:** Um domínio mal-formado num layer não derruba o SYNAPSE — apenas esse layer é saltado e o resto injeta normalmente.
**Porque poucos sabem:** Os timeouts são por-layer e diferentes (L4/L5 têm o dobro de L0/L7). Um layer lento só gera warning no console, fácil de ignorar.

### PC-28: O semantic-handshake converte constraints de planeamento em assertions verificáveis (offline)
**Fonte:** `.aiox-core/core/synapse/context/semantic-handshake-engine.js` (cabeçalho + linhas 17-40)
**O que é:** Engine determinístico e offline (Story 483.1) que transforma constraints de planeamento em assertions validáveis ANTES da execução. Tipos: TECH_STACK, PATTERN, SECURITY, PERFORMANCE, IMPORTS, CUSTOM. Severidades: BLOCKER, WARNING. Fonte default: `@architect`.
**Como usar:** É o gate de pré-execução que garante que o @dev respeita as decisões do @architect (ex: "usar PostgreSQL" vira uma assertion BLOCKER).
**Porque poucos sabem:** Extrai um conjunto de "hard rules" do texto de planeamento automaticamente — a ponte determinística entre arquitetura e implementação.

---

## Resumo Executivo

| # | Ponto Cego | Categoria |
|---|-----------|-----------|
| PC-1..8 | Os 8 layers L0-L7 e os seus comportamentos não-óbvios | SYNAPSE Engine |
| PC-9..12 | Brackets com budgets/multiplicador/layers variáveis | Context Tracking |
| PC-13..14 | 7 modos + introspeção `*synapse` | Star-Commands |
| PC-15..16 | Bob orquestra spawnando, nunca emulando | Bob Mode |
| PC-17 | Handoff de 379 tokens com limites rígidos | Context Compaction |
| PC-18..19 | Tier 0 sempre primeiro, gates por tier | Tier System |
| PC-20..23 | Coherence VETO, no-automation-sem-guardrails, scope gate, REUSE>ADAPT>CREATE | Decision Heuristics |
| PC-24..25 | Só G5/G6 bloqueiam; override com audit trail | IDS Gates |
| PC-26..28 | Memory bridge escala com depleção, degradação graciosa, semantic handshake | Bónus |

**Confiança:** ALTA. Todos os 28 pontos foram verificados contra código-fonte real em `aiox-core-official`. Zero invenção.
**Limitação:** Não inspecionei o `engine.js` integralmente (apenas grep da ordem de pipeline) nem todos os collectors de diagnostics — há provavelmente mais pontos cegos na orquestração de truncamento de token budget que não foram extraídos.
