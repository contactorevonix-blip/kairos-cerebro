/**
 * AIOX Masterclass — Lições 5.5 e 5.6
 *
 * Módulo 5.5 — Contexto & Tokens (6 lições)
 * Módulo 5.6 — Rituais de Sessão (5 lições)
 *
 * REGRA APLICADA: Zero invenção. Todo o conteúdo é extraído de ficheiros reais.
 * Cada lição cita o path verificado da fonte.
 *
 * Fontes verificadas (lidas com Read/Glob durante a extracção):
 * - C:/Users/lealp/aiox-core-official/.aiox-core/core/synapse/context/context-tracker.js
 * - C:/Users/lealp/aiox-core-official/.aiox-core/core/synapse/engine.js
 * - C:/Users/lealp/KAIROS_CEREBRO/.synapse/context (domain file L1)
 * - C:/Users/lealp/KAIROS_CEREBRO/.claude/hooks/session-start.cjs
 * - C:/Users/lealp/KAIROS_CEREBRO/.claude/hooks/precompact-session-digest.cjs
 * - C:/Users/lealp/aiox-core-official/.aiox-core/hooks/unified/runners/precompact-runner.js
 * - C:/Users/lealp/aiox-core-official/.aiox/session-digests/example-session-abc123-2026-02-09T18-30-45-123Z.yaml
 * - C:/Users/lealp/KAIROS_CEREBRO/STATE.md
 * - C:/Users/lealp/KAIROS_CEREBRO/PROJECT.md
 * - C:/Users/lealp/KAIROS_CEREBRO/.claude/CLAUDE.md
 * - C:/Users/lealp/KAIROS_CEREBRO/.claude/rules/agent-handoff.md
 *
 * @generated Kronos — AIOX Intelligence Engine
 * @date 2026-06-01
 */

const LESSONS_5_5_5_6 = {

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 5.5 — CONTEXTO & TOKENS
  // ═══════════════════════════════════════════════════════════════

  '5.5.1': {
    title: 'Como o Claude Code gere o context window',
    emoji: '🪟',
    tagline: 'O AIOX estima a percentagem de contexto restante a partir do número de prompts da sessão.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '📊', title: 'A janela de contexto tem um tamanho fixo',
        body: 'O modelo activo tem uma janela de contexto definida em core-config.yaml (models.registry → contextWindow). Se a config estiver indisponível, o AIOX usa o fallback DEFAULTS.maxContext = 200000 tokens. O context-tracker estima quanto resta com base no número de prompts já trocados na sessão. [Fonte: context-tracker.js linhas 59-62]'
      },
      {
        type: 'box', style: 'info', icon: '🧮', title: 'A fórmula de estimativa real',
        body: 'percent = 100 - ((promptCount * avgTokensPerPrompt * 1.2) / maxContext * 100), com o resultado limitado a 0-100. O avgTokensPerPrompt por defeito é 1500 tokens. O multiplicador 1.2 (XML_SAFETY_MULTIPLIER) corrige o facto de chars/4 subestimar 15-25% em output XML-heavy. [Fonte: context-tracker.js linhas 192-210, 53]'
      },
      {
        type: 'steps', title: 'O que o tracker calcula em cada prompt',
        steps: [
          { n: '1', title: 'Lê maxContext', body: 'getModelConfig() lê o contextWindow do modelo activo em core-config.yaml. Cacheia o resultado por project root (lê uma vez por processo). [context-tracker.js linhas 99-137]' },
          { n: '2', title: 'Estima tokens usados', body: 'usedTokens = promptCount * avgTokensPerPrompt * 1.2. Ex: 50 prompts * 1500 * 1.2 = 90000 tokens. [context-tracker.js linha 207]' },
          { n: '3', title: 'Converte em percentagem restante', body: 'Com maxContext 200000 e 90000 usados: 100 - (90000/200000*100) = 55% restante. [context-tracker.js linha 208]' },
          { n: '4', title: 'Classifica num bracket', body: '55% cai no bracket MODERATE. O bracket determina o orçamento de tokens e as camadas SYNAPSE activas. [ver lição 5.5.2]' },
        ]
      },
    ],
    checks: [
      'Sei que a janela de contexto por defeito é 200000 tokens (DEFAULTS.maxContext)',
      'Compreendo que a estimativa usa promptCount, não uma contagem real de tokens',
      'Sei que o multiplicador 1.2 existe para compensar a subestimativa em XML',
    ]
  },

  '5.5.2': {
    title: 'Os 4 brackets de contexto: FRESH, MODERATE, DEPLETED, CRITICAL',
    emoji: '🚦',
    tagline: 'Cada bracket tem um limiar de percentagem, um orçamento de tokens e um conjunto de camadas activas — todos definidos em código.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🎯', title: 'Os limiares exactos (percentagem RESTANTE)',
        body: 'FRESH: 60-100% restante. MODERATE: 40-60%. DEPLETED: 25-40%. CRITICAL: 0-25%. A função calculateBracket aplica >= 60 → FRESH, >= 40 → MODERATE, >= 25 → DEPLETED, senão CRITICAL. Se o valor não for um número válido, devolve CRITICAL por segurança. [Fonte: context-tracker.js linhas 29-34, 160-175]'
      },
      {
        type: 'steps', title: 'Orçamento de tokens e camadas por bracket',
        steps: [
          { n: '1', title: 'FRESH (60-100%)', body: 'tokenBudget 800. Injecção lean: apenas camadas L0 (Constitution), L1 (Global), L2 (Agent) e L7 (Star-Command). memoryHints: false, handoffWarning: false. [context-tracker.js linhas 30, 148]' },
          { n: '2', title: 'MODERATE (40-60%)', body: 'tokenBudget 1500. Todas as 8 camadas activas (L0-L7). memoryHints: false. [context-tracker.js linhas 31, 149]' },
          { n: '3', title: 'DEPLETED (25-40%)', body: 'tokenBudget 2000. Todas as camadas + memoryHints: true (sugestões de memória activadas). [context-tracker.js linhas 32, 150]' },
          { n: '4', title: 'CRITICAL (0-25%)', body: 'tokenBudget 2500. Todas as camadas + memoryHints: true + handoffWarning: true (aviso de handoff de sessão). [context-tracker.js linhas 33, 151]' },
        ]
      },
      {
        type: 'box', style: 'warn', icon: '⚠️', title: 'Contra-intuitivo: menos contexto = mais orçamento',
        body: 'O tokenBudget AUMENTA à medida que o contexto se esgota (800 → 2500). Isto é deliberado: quando o contexto está crítico, o AIOX injecta MAIS reforço de regras e avisos para manter a continuidade, em vez de menos. [Fonte: context-tracker.js linhas 41-46]'
      },
    ],
    checks: [
      'Decoro os 4 limiares: 60 / 40 / 25 como fronteiras',
      'Sei que FRESH só usa 4 camadas (L0,L1,L2,L7) e MODERATE usa as 8',
      'Compreendo que o orçamento de tokens cresce com a depleção (800→2500)',
    ]
  },

  '5.5.3': {
    title: 'Quando e como usar /compact',
    emoji: '🗜️',
    tagline: 'O /compact dispara o hook PreCompact, que captura o conhecimento da sessão antes de a conversa ser comprimida.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🔁', title: 'O que /compact realmente dispara',
        body: 'Quando o contexto é compactado (manual via /compact ou automático), o Claude Code emite o evento PreCompact. O hook recebe via stdin: session_id, transcript_path, cwd, hook_event_name e trigger ("auto" ou "manual"). [Fonte: precompact-session-digest.cjs linhas 9-16]'
      },
      {
        type: 'box', style: 'info', icon: '🧭', title: 'Gestão de bracket substituída por /compact nativo',
        body: 'Na versão actual (NOG-18), o SYNAPSE usa DEFAULT_ACTIVE_LAYERS = [0, 1, 2] e desactiva a filtragem completa por bracket. As camadas L3-L7 produziam 0 regras no audit NOG-17 (exigem contexto de sessão que nunca existe). O comentário do código diz textualmente: "Bracket management replaced by native /compact." [Fonte: engine.js linhas 186-192, 287-289]'
      },
      {
        type: 'steps', title: 'Quando usar /compact (sinais do bracket)',
        steps: [
          { n: '1', title: 'Bracket DEPLETED (25-40%)', body: 'O domain file recomenda: respostas concisas, saltar camadas opcionais, resumir progresso antes de cada acção. É a zona onde compactar começa a fazer sentido. [Fonte: .synapse/context linhas 15-19]' },
          { n: '2', title: 'Bracket CRITICAL (<25%)', body: 'A regra CONTEXT_RULE_CRITICAL_0 é explícita: "Context nearly exhausted — recommend session handoff". Compactar ou abrir nova sessão é a acção correcta. [Fonte: .synapse/context linha 22]' },
          { n: '3', title: 'Antes de compactar, documenta', body: 'CONTEXT_RULE_CRITICAL_3: "Document incomplete work in story file before session ends". Actualiza o ficheiro de story / STATE.md antes do compact. [Fonte: .synapse/context linha 25]' },
        ]
      },
    ],
    checks: [
      'Sei que /compact dispara o evento PreCompact com trigger "manual"',
      'Compreendo que a gestão por bracket foi substituída pelo /compact nativo (NOG-18)',
      'Sei que devo documentar trabalho incompleto antes de compactar (regra CRITICAL_3)',
    ]
  },

  '5.5.4': {
    title: 'Técnicas para preservar contexto',
    emoji: '🛟',
    tagline: 'STATE.md, session digests e os handoffs entre agentes preservam o que importa fora da janela de contexto.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '📄', title: 'STATE.md — memória persistente do projecto',
        body: 'O STATE.md guarda o estado da sessão actual em texto: última actualização, branch activa, último commit, o que foi feito, e próximos passos. As primeiras 25 linhas são reinjectadas em cada nova sessão pelo session-start hook — por isso o topo do ficheiro deve conter o estado mais crítico. [Fonte: STATE.md linhas 1-6; session-start.cjs linhas 37-44]'
      },
      {
        type: 'box', style: 'info', icon: '🧠', title: 'Session digests — conhecimento destilado',
        body: 'Antes de cada compact, o hook PreCompact extrai um digest da sessão para .aiox/session-digests/. O digest captura correcções do utilizador, padrões observados, axiomas aprendidos e um snapshot de contexto (agente activo, story, ficheiros modificados, decisões-chave). [Fonte: precompact-runner.js linhas 38-67; example-session-...yaml linhas 10-54]'
      },
      {
        type: 'box', style: 'info', icon: '🤝', title: 'Handoffs — compactar persona ao trocar de agente',
        body: 'Ao trocar de @agente, o AIOX compacta a persona anterior num artefacto de ~379 tokens em vez de reter a definição completa (~3-5K tokens). Redução de contexto: 33% por troca, 57% após duas trocas. [Fonte: agent-handoff.md — Compaction Limits, Example]'
      },
      {
        type: 'steps', title: 'Estratégia de preservação em camadas',
        steps: [
          { n: '1', title: 'Curto prazo — handoff artifact', body: 'Entre agentes na mesma sessão, máx 5 decisões, 10 ficheiros, 3 blockers. Descarta a persona, mantém o trabalho. [agent-handoff.md — Compaction Limits]' },
          { n: '2', title: 'Médio prazo — session digest', body: 'No compact, destila correcções/padrões/axiomas para YAML versionado (schema_version 1.0). [example-session-...yaml linha 2]' },
          { n: '3', title: 'Longo prazo — STATE.md', body: 'Estado do projecto entre sessões. Reinjectado no arranque. Editável à mão. [STATE.md + session-start.cjs]' },
        ]
      },
    ],
    checks: [
      'Mantenho o estado crítico nas primeiras 25 linhas do STATE.md',
      'Sei que o digest captura correcções, padrões, axiomas e snapshot',
      'Compreendo as três camadas: handoff (sessão), digest (compact), STATE.md (projecto)',
    ]
  },

  '5.5.5': {
    title: 'O que consome mais tokens',
    emoji: '🔥',
    tagline: 'Output XML-heavy, injecção de regras por camada e personas completas de agente são os maiores consumidores.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '📐', title: 'XML subestima a contagem de tokens em 15-25%',
        body: 'A regra chars/4 subestima o consumo real de output XML-heavy em 15-25%. Por isso o AIOX aplica o XML_SAFETY_MULTIPLIER = 1.2 a todas as estimativas. Output estruturado em XML/YAML custa mais tokens por carácter do que prosa simples. [Fonte: context-tracker.js linhas 48-53]'
      },
      {
        type: 'box', style: 'info', icon: '📚', title: 'Injecção de regras SYNAPSE por prompt',
        body: 'Cada prompt injecta regras das camadas activas. O orçamento varia de 800 tokens (FRESH) a 2500 (CRITICAL). No bracket MODERATE, todas as 8 camadas (L0-L7) injectam em simultâneo. Reduzir camadas activas é a forma directa de poupar tokens. [Fonte: context-tracker.js linhas 41-46, 147-152]'
      },
      {
        type: 'box', style: 'info', icon: '👤', title: 'Personas completas de agente',
        body: 'A definição completa de um agente custa ~3-5K tokens. É o maior pico de consumo numa troca de agente — daí o protocolo de handoff que a comprime para ~379 tokens. [Fonte: agent-handoff.md — Example]'
      },
      {
        type: 'steps', title: 'O que o domain file recomenda para poupar',
        steps: [
          { n: '1', title: 'MODERATE: resumir outputs longos', body: 'CONTEXT_RULE_MODERATE_1: "Monitor token usage — consider summarizing long outputs". [.synapse/context linha 12]' },
          { n: '2', title: 'MODERATE: exemplos concisos', body: 'CONTEXT_RULE_MODERATE_2: "Prefer concise code examples over verbose explanations". [.synapse/context linha 13]' },
          { n: '3', title: 'DEPLETED: saltar camadas opcionais', body: 'CONTEXT_RULE_DEPLETED_2: "Skip optional layers (L6 keyword domains) to conserve tokens". [.synapse/context linha 18]' },
        ]
      },
    ],
    checks: [
      'Sei que output XML/YAML custa ~20% mais tokens do que prosa (multiplicador 1.2)',
      'Compreendo que uma persona completa de agente custa 3-5K tokens',
      'Conheço as recomendações do domain file para poupar (resumir, conciso, saltar L6)',
    ]
  },

  '5.5.6': {
    title: 'O PreCompact hook — o que guarda antes de compactar',
    emoji: '💾',
    tagline: 'O PreCompact captura conhecimento da sessão num digest, sem nunca bloquear a operação de compactação.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '⚡', title: 'Fire-and-forget: nunca bloqueia',
        body: 'O hook dispara um processo-filho detached (spawn ... { detached: true, stdio: "ignore" }) e devolve imediatamente. O digest corre em segundo plano. Tem um timeout de segurança de 9000ms (HOOK_TIMEOUT_MS), e o runner subjacente um limite de 5000ms. Falhas são silenciosas — nunca escreve para stderr para não disparar "hook error" no Claude Code. [Fonte: precompact-session-digest.cjs linhas 31-32, 106-110, 133-136]'
      },
      {
        type: 'box', style: 'info', icon: '🧩', title: 'Open Core: extracção delegada ao aiox-pro',
        body: 'O runner detecta se o aiox-pro está disponível (isProAvailable). Se sim, carrega memory/session-digest/extractor.js e chama extractSessionDigest(context). Se NÃO, faz no-op gracioso e regista "aiox-pro not available, skipping session digest". A lógica de extracção vive no aiox-pro, não no core. [Fonte: precompact-runner.js linhas 18-19, 38-67]'
      },
      {
        type: 'steps', title: 'O que o digest captura (4 secções reais)',
        steps: [
          { n: '1', title: 'User Corrections', body: 'Correcções literais do utilizador durante a sessão. Ex: "the path should be .aiox/sessions/ not .aiox-sessions/". [example-session-...yaml linhas 10-14]' },
          { n: '2', title: 'Patterns Observed', body: 'Padrões recorrentes. Ex: "Test expectations must match implementation changes". [example-session-...yaml linhas 16-21]' },
          { n: '3', title: 'Axioms Learned', body: 'Verdades estruturais. Ex: "Hooks unified require runners/ directory to function". [example-session-...yaml linhas 23-29]' },
          { n: '4', title: 'Context Snapshot', body: 'Agente activo, story, epic, ficheiros modificados, comandos executados, decisões-chave. [example-session-...yaml linhas 31-54]' },
        ]
      },
      {
        type: 'box', style: 'info', icon: '🏷️', title: 'Cabeçalho do digest (frontmatter)',
        body: 'Cada digest tem: schema_version "1.0", session_id, timestamp ISO, duration_minutes, agent_context (ex: "@dev implementing Story MIS-3") e compact_trigger (ex: "context_limit_90%"). [Fonte: example-session-...yaml linhas 1-8]'
      },
    ],
    checks: [
      'Sei que o PreCompact é fire-and-forget e nunca bloqueia o compact',
      'Compreendo a arquitectura Open Core: core deteta, pro extrai',
      'Conheço as 4 secções do digest: Corrections, Patterns, Axioms, Snapshot',
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 5.6 — RITUAIS DE SESSÃO
  // ═══════════════════════════════════════════════════════════════

  '5.6.1': {
    title: 'O ritual de início de sessão',
    emoji: '🌅',
    tagline: 'O SessionStart hook injecta data, estado do projecto e contexto AIOX no início de cada conversa.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🚪', title: 'O que o session-start hook injecta',
        body: 'O hook SessionStart escreve para stdout, e esse stdout é injectado no context window do Claude no arranque. Injecta sempre a data actual, e condicionalmente o estado do projecto e o contexto AIOX. Faz exit 0 sempre — SessionStart nunca bloqueia. [Fonte: session-start.cjs linhas 5-15, 58-59]'
      },
      {
        type: 'steps', title: 'A sequência exacta de injecção',
        steps: [
          { n: '1', title: 'Data da sessão', body: 'Sempre injectada: "[Sessão iniciada: YYYY-MM-DD]" usando new Date().toISOString(). [session-start.cjs linhas 33-35]' },
          { n: '2', title: 'STATE.md (25 linhas)', body: 'Lê as primeiras 25 linhas do STATE.md e injecta-as entre marcadores "--- STATE.md (resumo) ---" e "--- fim STATE.md ---". Por isso o estado crítico deve estar no topo. [session-start.cjs linhas 37-44]' },
          { n: '3', title: 'Contexto AIOX', body: 'Se as env vars AIOX_AGENT, AIOX_STORY_ID ou AIOX_TASK_ID existirem, injecta "Agent:", "Story:", "Task:" sob o marcador "--- Contexto AIOX ---". [session-start.cjs linhas 47-56]' },
        ]
      },
      {
        type: 'box', style: 'info', icon: '🛡️', title: 'Leitura segura, sem falhas',
        body: 'A função readFileSafe envolve o readFileSync num try/catch e devolve null se o ficheiro não existir. Se o STATE.md faltar, o hook simplesmente salta essa secção sem erro. [Fonte: session-start.cjs linhas 24-26, 38-44]'
      },
    ],
    checks: [
      'Sei que o stdout do SessionStart é injectado no context window',
      'Sei que apenas as primeiras 25 linhas do STATE.md são injectadas',
      'Compreendo que o hook faz exit 0 sempre e nunca bloqueia o arranque',
    ]
  },

  '5.6.2': {
    title: 'STATE.md e PROJECT.md — estruturar para fast-resume',
    emoji: '🗂️',
    tagline: 'PROJECT.md guarda o que não muda; STATE.md guarda o que muda a cada sessão.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🏛️', title: 'PROJECT.md — contexto estável do projecto',
        body: 'O PROJECT.md descreve o produto, stack, estrutura de repositórios, quem é o utilizador, squads disponíveis, decisões arquitecturais e regras de ouro. É o contexto que raramente muda. Carregado automaticamente via @PROJECT.md no CLAUDE.md. [Fonte: PROJECT.md linhas 1-39; CLAUDE.md secção "Contexto do Projecto"]'
      },
      {
        type: 'box', style: 'info', icon: '📈', title: 'STATE.md — estado volátil da sessão',
        body: 'O STATE.md abre com os campos críticos: última actualização, branch activa, último commit. Depois documenta a sessão actual (o que foi feito), o estado git, e os próximos passos numerados. É o que muda a cada sessão. [Fonte: STATE.md linhas 1-6, 89-95]'
      },
      {
        type: 'steps', title: 'Como estruturar o topo do STATE.md (as 25 linhas que contam)',
        steps: [
          { n: '1', title: 'Linhas 1-6: metadados', body: 'Título, última actualização, branch activa, último commit. São a primeira coisa que o Claude vê no arranque. [STATE.md linhas 1-6]' },
          { n: '2', title: 'Acção principal da sessão', body: 'Logo a seguir, o resumo da acção principal — para que o "porquê" da sessão caiba nas 25 linhas injectadas. [STATE.md linhas 9-13]' },
          { n: '3', title: 'Detalhe abaixo da linha 25', body: 'Tabelas longas, logs e contexto extenso vão para baixo — não são injectados no arranque, mas ficam disponíveis se o Claude ler o ficheiro inteiro. [session-start.cjs linha 40]' },
        ]
      },
      {
        type: 'box', style: 'tip', icon: '🔗', title: 'Ambos carregam automaticamente',
        body: 'O CLAUDE.md usa @PROJECT.md e @STATE.md na secção "Contexto do Projecto (carrega automaticamente)". A instrução de sessão diz: "Início de sessão: lê PROJECT.md e STATE.md para ter contexto completo". [Fonte: CLAUDE.md]'
      },
    ],
    checks: [
      'Distingo PROJECT.md (estável) de STATE.md (volátil)',
      'Coloco metadados + acção principal nas primeiras 25 linhas do STATE.md',
      'Sei que ambos são carregados via @ no CLAUDE.md',
    ]
  },

  '5.6.3': {
    title: 'Fim de sessão — o que guardar e onde',
    emoji: '🌇',
    tagline: 'Ao fechar a sessão, actualiza-se o STATE.md com o feito, o em-curso e os próximos passos.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🔔', title: 'O gatilho do fim de sessão',
        body: 'A instrução de sessão no CLAUDE.md é explícita: "Fim de sessão: quando o utilizador diz \'acabámos\' ou \'commit\' ou \'até amanhã\', actualiza STATE.md com o que foi feito, o que está em curso, e os próximos passos." [Fonte: CLAUDE.md secção "Instruções de Sessão"]'
      },
      {
        type: 'steps', title: 'O que escrever no STATE.md ao fechar',
        steps: [
          { n: '1', title: 'Actualizar metadados', body: 'Última actualização (data de hoje), branch activa, último commit. [STATE.md linhas 3-5]' },
          { n: '2', title: 'O que foi feito', body: 'Resumo da sessão: acção principal e o que foi copiado/criado/corrigido. O STATE.md real usa tabelas por área. [STATE.md linhas 9-66]' },
          { n: '3', title: 'Estado git', body: 'Último commit e resultado do doctor. Ex: "doctor: 15 PASS | 0 WARN | 0 FAIL". [STATE.md linhas 70-74]' },
          { n: '4', title: 'Próximos passos', body: 'Lista numerada de acções pendentes com comando concreto. Ex: "kairos-infra-master — *workflow kairos-infra-master (Fase 0)". [STATE.md linhas 89-94]' },
        ]
      },
      {
        type: 'box', style: 'tip', icon: '✍️', title: 'Feedback memorizado vai junto',
        body: 'O STATE.md real inclui uma secção "Feedback memorizado" para registar regras aprendidas na sessão. Ex: "NUNCA git push directo — sempre @devops. Se sistema bloqueia → PARAR." Isto liga o fim de sessão à memória persistente. [Fonte: STATE.md linhas 64-66]'
      },
    ],
    checks: [
      'Reconheço os gatilhos "acabámos", "commit", "até amanhã"',
      'Sei guardar feito + em-curso + próximos passos no STATE.md',
      'Coloco o estado mais crítico no topo para a próxima injecção de 25 linhas',
    ]
  },

  '5.6.4': {
    title: 'Handoff entre agentes — o formato real do artefacto',
    emoji: '🤝',
    tagline: 'Trocar de agente compacta a persona anterior num artefacto YAML de ~379 tokens com limites estritos.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '🎯', title: 'Quando o protocolo activa',
        body: 'O handoff activa sempre que o utilizador invoca um novo agente (@agent-name ou /AIOX:agents:agent-name) e a sessão já tem um agente diferente activo. Antes de carregar o novo, gera-se mentalmente o artefacto de handoff. [Fonte: agent-handoff.md — When This Applies]'
      },
      {
        type: 'steps', title: 'Os campos do artefacto (formato real)',
        steps: [
          { n: '1', title: 'from_agent / to_agent', body: 'IDs do agente que sai e do que entra. [agent-handoff.md — Handoff Protocol YAML]' },
          { n: '2', title: 'story_context', body: 'story_id, story_path, story_status, current_task, branch — o estado de trabalho activo. [agent-handoff.md]' },
          { n: '3', title: 'decisions', body: 'Decisões-chave (máx 5). [agent-handoff.md — Compaction Limits]' },
          { n: '4', title: 'files_modified', body: 'Ficheiros criados/modificados (máx 10). [agent-handoff.md]' },
          { n: '5', title: 'blockers / next_action', body: 'Blockers activos (máx 3) e a acção que o agente entrante deve executar. [agent-handoff.md]' },
        ]
      },
      {
        type: 'box', style: 'info', icon: '📉', title: 'Os limites de compactação (valores reais)',
        body: 'Tamanho máximo do artefacto: 500 tokens. Resumos de agente retidos: 3 (o mais antigo é descartado no 4º switch). Máx 5 decisões, 10 ficheiros, 3 blockers. O artefacto típico ronda os ~379 tokens. [Fonte: agent-handoff.md — Compaction Limits]'
      },
      {
        type: 'box', style: 'info', icon: '💽', title: 'Onde fica guardado',
        body: 'Os artefactos guardam-se em .aiox/handoffs/ (runtime, gitignored). Formato do nome: handoff-{from}-to-{to}-{timestamp}.yaml. Template completo em .aiox-core/development/templates/agent-handoff-tmpl.yaml. [Fonte: agent-handoff.md — Storage, Template Reference]'
      },
    ],
    checks: [
      'Sei que o artefacto tem máx 500 tokens (típico ~379)',
      'Conheço os limites: 5 decisões, 10 ficheiros, 3 blockers, 3 resumos retidos',
      'Sei que o que SEMPRE se preserva é story ID, task actual, branch, decisões e ficheiros',
    ]
  },

  '5.6.5': {
    title: 'Session digests — o que são e como ler',
    emoji: '📜',
    tagline: 'Um digest é o conhecimento de uma sessão destilado em YAML versionado, gerado antes de cada compact.',
    blocks: [
      {
        type: 'box', style: 'info', icon: '📍', title: 'Onde vivem e como se chamam',
        body: 'Os digests guardam-se em .aiox/session-digests/. O ficheiro de exemplo real chama-se example-session-abc123-2026-02-09T18-30-45-123Z.yaml — o padrão inclui session_id e timestamp ISO no nome. São gerados pelo runner PreCompact em fire-and-forget. [Fonte: caminho do example-session yaml; precompact-runner.js linhas 38-67]'
      },
      {
        type: 'box', style: 'info', icon: '🏷️', title: 'Como ler o frontmatter',
        body: 'O topo do digest (entre ---) diz-te: schema_version, session_id, timestamp, duration_minutes (ex: 45), agent_context (ex: "@dev implementing Story MIS-3") e compact_trigger (ex: "context_limit_90%"). Lê isto primeiro para saber quando, quem e porquê. [Fonte: example-session-...yaml linhas 1-8]'
      },
      {
        type: 'steps', title: 'Como ler o corpo (4 secções)',
        steps: [
          { n: '1', title: 'User Corrections → o que evitar', body: 'Correcções literais do utilizador. Lê para não repetir os mesmos erros numa nova sessão. [example-session-...yaml linhas 10-14]' },
          { n: '2', title: 'Patterns Observed → como trabalhar', body: 'Padrões validados de abordagem. Ex: "Always verify consumer count before removing modules". [example-session-...yaml linhas 16-21]' },
          { n: '3', title: 'Axioms Learned → verdades do sistema', body: 'Factos estruturais. Ex: "Open Core pattern: aiox-core provides extension points, aiox-pro provides implementation". [example-session-...yaml linhas 23-29]' },
          { n: '4', title: 'Context Snapshot → onde parou', body: 'Agente, story, epic, ficheiros modificados (com nº de linhas), comandos executados e decisões-chave. É o fast-resume da sessão. [example-session-...yaml linhas 31-54]' },
        ]
      },
      {
        type: 'box', style: 'tip', icon: '🔄', title: 'Schema versionado para evolução futura',
        body: 'O digest começa em schema_version "1.0". Uma das decisões-chave registadas no próprio exemplo é "Schema versioning starting at v1.0 for future evolution" — o formato foi desenhado para evoluir sem quebrar leitores antigos. [Fonte: example-session-...yaml linhas 2, 52]'
      },
    ],
    checks: [
      'Sei que os digests vivem em .aiox/session-digests/ com session_id+timestamp no nome',
      'Leio primeiro o frontmatter (quem, quando, porquê compactou)',
      'Uso as 4 secções: Corrections (evitar), Patterns (como), Axioms (verdades), Snapshot (onde parou)',
    ]
  },

};

// Compatível com merge no CONTENT object do curso:
// Object.assign(CONTENT, LESSONS_5_5_5_6);
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LESSONS_5_5_5_6;
}
