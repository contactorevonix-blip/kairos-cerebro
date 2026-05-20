'use strict';

/**
 * KAIROS HYPERDRIVE — Provider Anthropic
 * Chama a Anthropic API via HTTPS nativo (zero deps externas).
 * Suporta prompt caching (90% desconto em rules/constitution).
 *
 * Modelos por tier:
 *   Sénior (consenso): claude-opus-4-7     → @Sage, @Oracle, @Aria
 *   Executor:          claude-sonnet-4-6   → @Dex, @Quinn, @Uma, @Rex, @Morgan, @Hermes
 *   Utilitário:        claude-haiku-4-5    → @Gage, @Orion
 */

const https = require('node:https');
const fs    = require('node:fs');
const path  = require('node:path');

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

  const tier      = AGENT_TIER[agentId] || 'executor';
  const model     = CONFIG.models[tier];
  const skill     = getAgentSkill(agentId);
  const constitution = getConstitution();

  const systemPrompt = role === 'consensus'
    ? `Estás no protocolo de consenso KAIROS HYPERDRIVE como ${agentId}.\n\nCONSTITUIÇÃO:\n${constitution}\n\nO TUE PERFIL:\n${skill}`
    : `Estás a executar uma task como ${agentId} no KAIROS HYPERDRIVE.\n\nCONSTITUIÇÃO:\n${constitution}\n\nO TEU PERFIL:\n${skill}`;

  const userMsg = role === 'consensus'
    ? `TASK: ${task}\n\nContexto adicional: ${JSON.stringify(ctx)}\n\nResponde em JSON válido:\n{"approach":"...","risks":"...","confidence":0.0}`
    : `TASK: ${task}\n\nContexto: ${JSON.stringify(ctx)}\n\nExecuta a tarefa e responde com o resultado.`;

  const body = {
    model,
    max_tokens: role === 'consensus' ? 512 : 2048,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }, // cache do system prompt — 90% desconto
      },
    ],
    messages: [{ role: 'user', content: userMsg }],
  };

  const response = await post('/v1/messages', body);
  const cost     = trackUsage(model, response.usage || {});
  const text     = response.content?.[0]?.text || '';

  // Extrair JSON se for consenso
  if (role === 'consensus') {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed    = JSON.parse(jsonMatch?.[0] || '{}');
      return {
        approach:   parsed.approach   || text,
        risks:      parsed.risks      || '',
        confidence: Number(parsed.confidence) || 0.5,
        agentId,
        model,
        costUsd: Math.round(cost * 10000) / 10000,
      };
    } catch {
      return { approach: text, risks: '', confidence: 0.5, agentId, model, costUsd: cost };
    }
  }

  return { text, agentId, model, costUsd: Math.round(cost * 10000) / 10000 };
}

module.exports = { invoke, resetTaskBudget, getBudgetStatus, CONFIG, AGENT_TIER };
