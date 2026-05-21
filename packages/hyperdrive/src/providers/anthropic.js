'use strict';

/**
 * KAIROS HYPERDRIVE — Provider Anthropic (v2 — Fase 7)
 * Chama a Anthropic API via HTTPS nativo (zero deps externas).
 * Selecção automática de modelo por complexidade da task.
 * Prompt caching agressivo em 2 blocos (constitution + skill).
 *
 * Selecção de modelo (Fase 7):
 *   Score 0-3  → Haiku   (tasks simples: docs, navegação)
 *   Score 4-7  → Sonnet  (tasks médias: backend, frontend)
 *   Score 8-10 → Opus    (tasks críticas: auditoria, estratégia, billing)
 *
 * Cache strategy:
 *   Block 1: kairos-constitution.md (shared, ephemeral) → 90% off em reads
 *   Block 2: agent skill file (per-agent, ephemeral) → 90% off em reads
 *   Block 3: task context (dinâmico, não cacheado)
 */

const https      = require('node:https');
const fs         = require('node:fs');
const path       = require('node:path');
const { analyze: analyzeComplexity } = require('./complexity');
const { buildCachedSystem }          = require('./cache-warmer');

const ROOT = path.join(__dirname, '..', '..', '..', '..');

// ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────

const CONFIG = {
  apiKey:       process.env.KAIROS_ANTHROPIC_API_KEY || '',
  baseUrl:      'api.anthropic.com',
  apiVersion:   '2023-06-01',
  betaHeader:   'prompt-caching-2024-07-31',
  models: {
    senior:    process.env.KAIROS_MODEL_SENIOR   || 'claude-opus-4-7',
    executor:  process.env.KAIROS_MODEL_EXECUTOR || 'claude-sonnet-4-6',
    utility:   process.env.KAIROS_MODEL_UTILITY  || 'claude-haiku-4-5-20251001',
  },
  budgetPerTask: Number(process.env.KAIROS_TASK_HARD_STOP_USD || 3),
  warnPerTask:   Number(process.env.KAIROS_TASK_BUDGET_USD    || 2),
  isLive:        process.env.KAIROS_LIVE === '1',
};

// Preços por 1M tokens (input/output) em USD
const PRICING = {
  'claude-opus-4-7':          { input: 5.00,  output: 25.00, cacheWrite: 6.25, cacheRead: 0.50 },
  'claude-sonnet-4-6':        { input: 3.00,  output: 15.00, cacheWrite: 3.75, cacheRead: 0.30 },
  'claude-haiku-4-5-20251001':{ input: 1.00,  output: 5.00,  cacheWrite: 1.25, cacheRead: 0.10 },
};

// Mapa de agente → tier
const AGENT_TIER = {
  '@Sage': 'senior', '@Oracle': 'senior', '@Aria': 'senior',
  '@Dex': 'executor', '@Quinn': 'executor', '@Uma': 'executor',
  '@Rex': 'executor', '@Morgan': 'executor', '@Hermes': 'executor',
  '@Gage': 'utility', '@Orion': 'utility',
};

// ─── BUDGET TRACKER ────────────────────────────────────────────────────────

let taskCostUsd = 0;
let sessionCostUsd = 0;

function resetTaskBudget() { taskCostUsd = 0; }

function trackUsage(model, usage) {
  const prices = PRICING[model] || PRICING['claude-sonnet-4-6'];
  const cost =
    (usage.input_tokens  / 1_000_000) * prices.input  +
    (usage.output_tokens / 1_000_000) * prices.output +
    ((usage.cache_creation_input_tokens || 0) / 1_000_000) * prices.cacheWrite +
    ((usage.cache_read_input_tokens     || 0) / 1_000_000) * prices.cacheRead;

  taskCostUsd    += cost;
  sessionCostUsd += cost;
  return cost;
}

function getBudgetStatus() {
  return {
    taskCostUsd:    Math.round(taskCostUsd    * 10000) / 10000,
    sessionCostUsd: Math.round(sessionCostUsd * 10000) / 10000,
    warnThreshold:  CONFIG.warnPerTask,
    hardStop:       CONFIG.budgetPerTask,
    exceeded:       taskCostUsd >= CONFIG.budgetPerTask,
    warned:         taskCostUsd >= CONFIG.warnPerTask,
  };
}

// ─── CHAMADA HTTPS NATIVA ──────────────────────────────────────────────────

function post(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: CONFIG.baseUrl,
      path:     endpoint,
      method:   'POST',
      headers: {
        'content-type':     'application/json',
        'content-length':   Buffer.byteLength(data),
        'x-api-key':        CONFIG.apiKey,
        'anthropic-version': CONFIG.apiVersion,
        'anthropic-beta':   CONFIG.betaHeader,
      },
    };

    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString());
          if (res.statusCode >= 400) {
            reject(new Error(`Anthropic API ${res.statusCode}: ${parsed.error?.message || JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error(`Failed to parse Anthropic response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── SISTEMA PROMPT COM CACHE ──────────────────────────────────────────────

let _constitutionCache = null;

function getConstitution() {
  if (_constitutionCache) return _constitutionCache;
  try {
    _constitutionCache = fs.readFileSync(
      path.join(ROOT, '.claude', 'rules', 'kairos-constitution.md'), 'utf8'
    );
  } catch {
    _constitutionCache = '# KAIROS — operar com máxima exigência. 100M€ MRR. Zero bajulação.';
  }
  return _constitutionCache;
}

function getAgentSkill(agentId) {
  const name = agentId.replace('@', '').toLowerCase();
  try {
    return fs.readFileSync(
      path.join(ROOT, '.claude', 'skills', `kairos-${name}`, 'SKILL.md'), 'utf8'
    );
  } catch {
    return `Agente ${agentId} — operar com máxima exigência segundo a KAIROS Constitution.`;
  }
}

// ─── MOCK MODE (KAIROS_LIVE !== '1') ──────────────────────────────────────

function mockResponse(agentId, task, role) {
  // Stubs determinísticos baseados no task hash
  const hash = [...task].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const confidence = 0.70 + (hash % 20) / 100; // 0.70..0.89
  return {
    approach:   `[MOCK] ${agentId} recomenda abordar "${task.slice(0, 60)}" via ${role}`,
    risks:      `[MOCK] Risco principal: complexidade de implementação`,
    confidence: Math.round(confidence * 100) / 100,
    agentId,
    mock: true,
  };
}

// ─── INVOKE ────────────────────────────────────────────────────────────────

/**
 * Invoca um agente para uma task.
 * @param {string} agentId    - Ex: '@Dex', '@Sage'
 * @param {string} task       - Descrição da tarefa
 * @param {string} role       - Papel nesta invocação ('consensus'|'execute'|'review')
 * @param {object} [ctx={}]   - Contexto adicional (propostas anteriores, etc.)
 * @returns {Promise<AgentResponse>}
 */
async function invoke(agentId, task, role = 'execute', ctx = {}) {
  if (!CONFIG.isLive) {
    return mockResponse(agentId, task, role);
  }

  if (!CONFIG.apiKey) throw new Error('KAIROS_ANTHROPIC_API_KEY não configurada. Definir no .env');

  const budget = getBudgetStatus();
  if (budget.exceeded) throw new Error(`Budget da task excedido ($${budget.taskCostUsd.toFixed(4)} >= $${budget.hardStop})`);
  if (budget.warned)   console.warn(`⚠️  BUDGET AVISO: $${budget.taskCostUsd.toFixed(4)} / $${budget.warnThreshold} por task`);

  // ── SELECÇÃO AUTOMÁTICA DE MODELO (Fase 7) ────────────────────────────────
  // Para consenso → usar sempre senior (decisão crítica)
  // Para execução → complexidade determina o modelo
  let modelId;
  let complexityResult = null;

  if (role === 'consensus') {
    modelId = CONFIG.models.senior; // Opus — consenso é sempre crítico
  } else {
    const domain = ctx.route?.domain || 'backend';
    const files  = ctx.files || [];
    complexityResult = analyzeComplexity(task, files, domain, {
      forceOpus:   ctx.forceOpus,
      forceSonnet: ctx.forceSonnet,
      forceHaiku:  ctx.forceHaiku,
    });
    modelId = complexityResult.modelId;

    // Override: agentes de segurança/architecture nunca descem abaixo de Sonnet
    const alwaysAtLeastSonnet = ['@Rex', '@Aria', '@Sage', '@Oracle'];
    if (alwaysAtLeastSonnet.includes(agentId) && modelId === CONFIG.models.utility) {
      modelId = CONFIG.models.executor;
      if (complexityResult) complexityResult.reasons.push('override: agente sénior → mínimo Sonnet');
    }
  }

  // ── PROMPT CACHING (2 blocos) ─────────────────────────────────────────────
  const dynamicCtx = Object.keys(ctx).length > 0
    ? `Contexto: ${JSON.stringify(ctx, null, 2).slice(0, 1000)}`
    : '';
  const systemBlocks = buildCachedSystem(agentId, dynamicCtx);

  const userMsg = role === 'consensus'
    ? `TASK: ${task}\n\nResponde em JSON:\n{"approach":"...","risks":"...","confidence":0.0}`
    : `TASK: ${task}\n\nExecuta e responde com o resultado.`;

  const body = {
    model:      modelId,
    max_tokens: role === 'consensus' ? 512 : 2048,
    system:     systemBlocks,  // 2 blocos cacheados + contexto dinâmico
    messages:   [{ role: 'user', content: userMsg }],
  };

  const response = await post('/v1/messages', body);
  const cost     = trackUsage(modelId, response.usage || {});
  const text     = response.content?.[0]?.text || '';
  const cacheHit = (response.usage?.cache_read_input_tokens || 0) > 0;

  // Extrair JSON se for consenso
  if (role === 'consensus') {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed    = JSON.parse(jsonMatch?.[0] || '{}');
      return {
        approach:        parsed.approach   || text,
        risks:           parsed.risks      || '',
        confidence:      Number(parsed.confidence) || 0.5,
        agentId,
        model:           modelId,
        costUsd:         Math.round(cost * 10000) / 10000,
        cacheHit,
        complexity:      complexityResult,
        usage:           response.usage,
      };
    } catch {
      return { approach: text, risks: '', confidence: 0.5, agentId, model: modelId, costUsd: cost, cacheHit };
    }
  }

  return {
    text,
    agentId,
    model:      modelId,
    costUsd:    Math.round(cost * 10000) / 10000,
    cacheHit,
    complexity: complexityResult,
    usage:      response.usage,
  };
}

// ─── INVOKE WITH TOOLS (agentic loop) ─────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 20;

/**
 * Invoca um agente com tool execution real (agentic loop).
 * O modelo chama ferramentas de filesystem até produzir uma resposta final.
 *
 * @param {string}   agentId  - Ex: '@Oracle', '@Dex'
 * @param {string}   task     - Descrição completa da tarefa
 * @param {string[]} [files]  - Ficheiros de contexto (passados no system prompt)
 * @param {object}   [opts]   - { modelId, forceOpus, forceSonnet, forceHaiku }
 * @returns {Promise<{text, agentId, model, toolCalls, iterations, costUsd, usage}>}
 */
async function invokeWithTools(agentId, task, files = [], opts = {}) {
  if (!CONFIG.isLive) {
    return {
      text:       `[MOCK] ${agentId} executaria com tools: ${task.slice(0, 100)}`,
      agentId,
      toolCalls:  [],
      iterations: 0,
      mock:       true,
    };
  }

  if (!CONFIG.apiKey) throw new Error('KAIROS_ANTHROPIC_API_KEY não configurada. Definir no .env');

  const budget = getBudgetStatus();
  if (budget.exceeded) throw new Error(`Budget excedido ($${budget.taskCostUsd.toFixed(4)} >= $${budget.hardStop})`);

  const { TOOL_DEFINITIONS }    = require('../tools/definitions');
  const { execute: executeTool } = require('../tools/executor');

  // Selecção de modelo — mesmo sistema que invoke()
  const domain          = opts.domain || 'backend';
  const complexityResult = analyzeComplexity(task, files, domain, opts);
  let modelId            = opts.modelId || complexityResult.modelId;

  // Agentes sénior nunca descem abaixo de Sonnet
  const alwaysAtLeastSonnet = ['@Rex', '@Aria', '@Sage', '@Oracle'];
  if (alwaysAtLeastSonnet.includes(agentId) && modelId === CONFIG.models.utility) {
    modelId = CONFIG.models.executor;
  }

  // System prompt com cache
  const fileCtx      = files.length > 0 ? `\nFicheiros de contexto: ${files.join(', ')}` : '';
  const systemBlocks = buildCachedSystem(agentId, fileCtx);

  const allToolCalls = [];
  // Instrução explícita: usar ferramentas, não descrever — corrige o padrão de "planeamento sem acção"
  const taskWithDirective = `${task}\n\nIMPORTANTE: Usa as ferramentas disponíveis para EXECUTAR a tarefa. Não descreves o que farias — ages directamente. Quando terminares, chama write_file para guardar o resultado e responde com um resumo do que foi feito.`;
  let messages       = [{ role: 'user', content: taskWithDirective }];
  let iterations     = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const nowBudget = getBudgetStatus();
    if (nowBudget.exceeded) {
      throw new Error(`Budget excedido na iteração ${iterations} ($${nowBudget.taskCostUsd.toFixed(4)})`);
    }

    // Na primeira iteração forçar uso de ferramentas (tool_choice: any).
    // Nas iterações seguintes deixar o modelo decidir (pode responder com texto).
    const body = {
      model:        modelId,
      max_tokens:   Number(process.env.KAIROS_MAX_TOKENS || 8192),
      system:       systemBlocks,
      tools:        TOOL_DEFINITIONS,
      tool_choice:  iterations === 1 ? { type: 'any' } : { type: 'auto' },
      messages,
    };

    const response = await post('/v1/messages', body);
    trackUsage(modelId, response.usage || {});

    // Resposta final (sem mais tool calls)
    if (response.stop_reason === 'end_turn' || response.stop_reason === 'max_tokens') {
      const text = (response.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');

      return {
        text,
        agentId,
        model:      modelId,
        toolCalls:  allToolCalls,
        iterations,
        costUsd:    Math.round(getBudgetStatus().taskCostUsd * 10000) / 10000,
        usage:      response.usage,
      };
    }

    // O modelo quer usar ferramentas
    if (response.stop_reason === 'tool_use') {
      // Adicionar resposta do assistente ao histórico
      messages.push({ role: 'assistant', content: response.content });

      // Executar cada tool_use block e recolher resultados
      const toolResults = [];
      for (const block of (response.content || [])) {
        if (block.type !== 'tool_use') continue;

        let result;
        try {
          console.log(`  [TOOL] ${block.name}(${JSON.stringify(block.input).slice(0, 100)})`);
          result  = await executeTool(block.name, block.input);
          allToolCalls.push({ name: block.name, input: block.input, ok: true });
        } catch (err) {
          result  = { error: err.message };
          allToolCalls.push({ name: block.name, input: block.input, ok: false, error: err.message });
        }

        toolResults.push({
          type:        'tool_result',
          tool_use_id: block.id,
          content:     JSON.stringify(result),
        });
      }

      // Adicionar resultados como mensagem do user
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // Stop reason inesperado — terminar com o que temos
    break;
  }

  const finalText = messages
    .filter(m => m.role === 'assistant')
    .flatMap(m => (Array.isArray(m.content) ? m.content : [{ type: 'text', text: m.content }]))
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  return {
    text:       finalText || `[LIMITE] Atingido máximo de ${MAX_TOOL_ITERATIONS} iterações`,
    agentId,
    model:      modelId,
    toolCalls:  allToolCalls,
    iterations,
    costUsd:    Math.round(getBudgetStatus().taskCostUsd * 10000) / 10000,
    error:      iterations >= MAX_TOOL_ITERATIONS ? 'max_iterations' : 'unknown_stop',
  };
}

module.exports = { invoke, invokeWithTools, resetTaskBudget, getBudgetStatus, CONFIG, AGENT_TIER };
