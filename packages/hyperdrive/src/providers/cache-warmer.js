'use strict';

/**
 * KAIROS HYPERDRIVE — Cache Warmer
 * Pré-aquece o prompt cache da Anthropic para todos os agentes.
 * Após warmup, cada call subsequente paga 90% menos no system prompt.
 *
 * Estratégia de cache em 2 blocos:
 *   Block 1 (TIER-1, cacheable): kairos-constitution.md — igual para todos os agentes
 *   Block 2 (TIER-2, cacheable): skill do agente — específico por agente
 *   Block 3 (não cacheado):      contexto da task — muda a cada call
 *
 * Savings:
 *   constitution (~3000 tokens × 11 agentes × 10 calls/sessão) = 330.000 tokens
 *   Sem cache: 330K × $3/1M = $0.99/sessão
 *   Com cache: 330K × $0.30/1M = $0.099/sessão  → -90% = $0.89 poupado
 */

const fs   = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const ROOT = path.join(__dirname, '..', '..', '..', '..');

const AGENTS = ['@Orion', '@Dex', '@Quinn', '@Gage', '@Aria', '@Uma',
                '@Sage', '@Morgan', '@Hermes', '@Oracle', '@Rex'];

// ─── ESTADO DO CACHE ────────────────────────────────────────────────────────

const _warmState = {
  warmed:     false,
  lastWarmMs: 0,
  agents:     {},        // agentId → { warmedAt, cacheTokens }
  totalSaved: 0,         // tokens poupados esta sessão
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos (TTL da Anthropic)

// ─── LEITURA DE FICHEIROS (com cache em memória) ────────────────────────────

const _fileCache = {};

function readCached(filepath) {
  if (_fileCache[filepath]) return _fileCache[filepath];
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    _fileCache[filepath] = content;
    return content;
  } catch {
    return null;
  }
}

function getConstitution() {
  return readCached(path.join(ROOT, '.claude', 'rules', 'kairos-constitution.md'))
    || '# KAIROS — operar com máxima exigência. 100M€ MRR.';
}

function getAgentSkill(agentId) {
  const name = agentId.replace('@', '').toLowerCase();
  return readCached(path.join(ROOT, '.claude', 'skills', `kairos-${name}`, 'SKILL.md'))
    || `${agentId} — operar segundo a KAIROS Constitution.`;
}

// ─── BUILDER DE SYSTEM PROMPT COM CACHE ────────────────────────────────────

/**
 * Constrói o system_prompt com blocos de cache Anthropic.
 * Block 1: constitution (shared, cacheable)
 * Block 2: agent skill (per-agent, cacheable)
 * Block 3: contexto dinâmico (não cacheado)
 *
 * @param {string} agentId
 * @param {string} [dynamicContext='']
 * @returns {Array} Anthropic messages[].system format
 */
function buildCachedSystem(agentId, dynamicContext = '') {
  const constitution = getConstitution();
  const skill        = getAgentSkill(agentId);

  const blocks = [
    // Block 1 — constitution partilhada (cache agressivo)
    {
      type: 'text',
      text: `# KAIROS CONSTITUTION\n\n${constitution}`,
      cache_control: { type: 'ephemeral' },
    },
    // Block 2 — skill do agente (cache por agente)
    {
      type: 'text',
      text: `# PERFIL DO AGENTE: ${agentId}\n\n${skill}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  // Block 3 — contexto dinâmico (nunca cacheado — muda por task)
  if (dynamicContext) {
    blocks.push({
      type: 'text',
      text: `# CONTEXTO DA TASK\n\n${dynamicContext}`,
      // sem cache_control → não cacheado
    });
  }

  return blocks;
}

// ─── WARMUP ─────────────────────────────────────────────────────────────────

/**
 * Aquece o cache para um agente específico.
 * Envia um request mínimo só para o Anthropic guardar o system prompt.
 * @param {string} agentId
 * @param {string} apiKey
 * @param {string} modelId
 * @returns {Promise<{agentId, cacheCreationTokens, cacheReadTokens, ok}>}
 */
async function warmAgent(agentId, apiKey, modelId) {
  const system = buildCachedSystem(agentId, '');
  const body   = JSON.stringify({
    model:      modelId,
    max_tokens: 1,  // mínimo possível — só queremos o cache write
    system,
    messages: [{ role: 'user', content: 'ok' }],
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'content-type':      'application/json',
        'content-length':    Buffer.byteLength(body),
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta':    'prompt-caching-2024-07-31',
      },
    };

    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          const usage = data.usage || {};
          resolve({
            agentId,
            ok:                  res.statusCode < 400,
            cacheCreationTokens: usage.cache_creation_input_tokens || 0,
            cacheReadTokens:     usage.cache_read_input_tokens     || 0,
            inputTokens:         usage.input_tokens                || 0,
          });
        } catch {
          resolve({ agentId, ok: false, cacheCreationTokens: 0, cacheReadTokens: 0, inputTokens: 0 });
        }
      });
    });

    req.on('error', () => resolve({ agentId, ok: false }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ agentId, ok: false, reason: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

/**
 * Aquece o cache para todos os agentes.
 * Chamar uma vez no início da sessão LIVE MODE.
 * @param {string} apiKey
 * @param {string} defaultModelId  - Modelo a usar para warmup (Sonnet recomendado)
 * @returns {Promise<{ok, results, totalCacheTokens}>}
 */
async function warmAll(apiKey, defaultModelId = 'claude-sonnet-4-6') {
  if (!apiKey) return { ok: false, reason: 'API key não configurada' };

  const now = Date.now();
  if (_warmState.warmed && (now - _warmState.lastWarmMs) < CACHE_TTL_MS) {
    return { ok: true, reason: 'cache ainda quente', results: [] };
  }

  console.log(`[CACHE WARMER] Aquecendo cache para ${AGENTS.length} agentes...`);

  // Aquece em paralelo (máx 3 simultâneos para não exceder rate limits)
  const results = [];
  for (let i = 0; i < AGENTS.length; i += 3) {
    const batch  = AGENTS.slice(i, i + 3);
    const batchR = await Promise.all(batch.map(a => warmAgent(a, apiKey, defaultModelId)));
    results.push(...batchR);
  }

  const ok                = results.every(r => r.ok);
  const totalCacheTokens  = results.reduce((s, r) => s + (r.cacheCreationTokens || 0), 0);
  const totalInputTokens  = results.reduce((s, r) => s + (r.inputTokens || 0), 0);

  _warmState.warmed    = ok;
  _warmState.lastWarmMs = now;

  for (const r of results) {
    _warmState.agents[r.agentId] = {
      warmedAt:     new Date().toISOString(),
      cacheTokens:  r.cacheCreationTokens || 0,
    };
  }

  const successCount = results.filter(r => r.ok).length;
  console.log(`[CACHE WARMER] ${successCount}/${AGENTS.length} agentes aquecidos. ${totalCacheTokens} tokens em cache.`);

  return { ok, results, totalCacheTokens, totalInputTokens };
}

/**
 * Estima a poupança de tokens por sessão com cache activo.
 * @param {number} callsPerSession   - Número de chamadas estimadas
 * @param {number} avgSystemTokens   - Tokens médios no system prompt
 * @returns {object}
 */
function estimateSavings(callsPerSession = 20, avgSystemTokens = 4000) {
  const sonnetInput    = 3.00;   // $/1M tokens
  const sonnetCache    = 0.30;   // $/1M tokens (cache read, 90% off)
  const totalTokens    = avgSystemTokens * callsPerSession;
  const costWithout    = (totalTokens / 1_000_000) * sonnetInput;
  const costWith       = (totalTokens / 1_000_000) * sonnetCache;
  const saved          = costWithout - costWith;
  const savingsPct     = Math.round(saved / costWithout * 100);

  return {
    callsPerSession,
    avgSystemTokens,
    totalTokens,
    costWithoutCache: Math.round(costWithout * 10000) / 10000,
    costWithCache:    Math.round(costWith * 10000) / 10000,
    savedUsd:         Math.round(saved * 10000) / 10000,
    savingsPct,
  };
}

function isWarm() { return _warmState.warmed && (Date.now() - _warmState.lastWarmMs) < CACHE_TTL_MS; }
function getWarmState() { return { ..._warmState }; }

module.exports = { warmAll, warmAgent, buildCachedSystem, estimateSavings, isWarm, getWarmState };
