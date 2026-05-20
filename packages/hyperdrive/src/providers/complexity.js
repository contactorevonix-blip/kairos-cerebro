'use strict';

/**
 * KAIROS HYPERDRIVE — Analisador de Complexidade de Tasks
 * Determina automaticamente o modelo óptimo baseado na complexidade.
 * Zero dependências externas.
 *
 * Score 0-10:
 *   0-3  → Haiku    (rápido, barato — $1/$5 por 1M tokens)
 *   4-7  → Sonnet   (equilibrado  — $3/$15 por 1M tokens)
 *   8-10 → Opus     (máxima capacidade — $5/$25 por 1M tokens)
 *
 * Filosofia: usar o modelo mais barato que resolve o problema.
 * Nunca usar Opus quando Haiku chega. Nunca usar Haiku quando é crítico.
 */

// ─── MODELOS (sincronizado com anthropic.js) ────────────────────────────────

const MODELS = {
  utility:  { id: 'claude-haiku-4-5-20251001', label: 'Haiku',  priceIn: 1.00, priceOut: 5.00  },
  executor: { id: 'claude-sonnet-4-6',          label: 'Sonnet', priceIn: 3.00, priceOut: 15.00 },
  senior:   { id: 'claude-opus-4-7',            label: 'Opus',   priceIn: 5.00, priceOut: 25.00 },
};

// ─── SCORING POR DOMÍNIO ────────────────────────────────────────────────────

const DOMAIN_BASE_SCORES = {
  auditoria:   9,  // sempre Opus — segurança não transige
  estrategia:  8,  // Opus — decisões com impacto a longo prazo
  infra:       7,  // Sonnet/Opus — configs de produção são críticas
  backend:     5,  // Sonnet — código de API, lógica de negócio
  refactor:    5,  // Sonnet — pode ter impacto inesperado
  vendas:      4,  // Sonnet — requer nuance mas não é técnico
  frontend:    4,  // Sonnet — UI/UX requer criatividade
  crescimento: 3,  // Haiku/Sonnet — copy e SEO são repetíveis
  docs:        2,  // Haiku — documentação é baixo risco
  navegacao:   1,  // Haiku — só leitura de ficheiros
};

// ─── KEYWORDS DE COMPLEXIDADE ───────────────────────────────────────────────

const HIGH_COMPLEXITY = [
  'critical', 'crítico', 'architecture', 'arquitectura', 'redesign',
  'migrate', 'migrar', 'security', 'segurança', 'gdpr', 'compliance',
  'stripe', 'billing', 'vault', 'encryption', 'auth', 'authentication',
  'database', 'schema', 'production', 'produção', 'emergency', 'urgente',
  'breaking change', 'api contract', 'backwards compatibility',
];

const MEDIUM_COMPLEXITY = [
  'refactor', 'optimize', 'otimizar', 'performance', 'cache',
  'webhook', 'endpoint', 'middleware', 'component', 'integration',
  'multi-step', 'complex', 'complexo', 'flow', 'pipeline',
];

const LOW_COMPLEXITY = [
  'comment', 'comentário', 'rename', 'renomear', 'typo', 'format',
  'readme', 'docs', 'jsdoc', 'log', 'console', 'simple', 'simples',
  'trivial', 'minor', 'pequeno', 'small',
];

// ─── FICHEIROS SENSÍVEIS (aumentam complexidade) ────────────────────────────

const SENSITIVE_FILES = [
  'stripe', 'billing', 'webhook', 'vault', 'auth', 'server.js',
  'railway.toml', 'Dockerfile', 'vercel.json', 'package.json',
  '.env', 'middleware', 'gdpr', 'compliance',
];

// ─── ANALYZER ──────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ComplexityResult
 * @property {number} score        - 0-10
 * @property {string} tier         - 'utility'|'executor'|'senior'
 * @property {string} modelId      - ID do modelo Claude
 * @property {string} modelLabel   - 'Haiku'|'Sonnet'|'Opus'
 * @property {string[]} reasons    - Factores que contribuíram para o score
 * @property {number} estimatedCostUsd  - Estimativa de custo (input only, assumindo 1000 tokens)
 */

/**
 * Analisa a complexidade de uma task e recomenda o modelo óptimo.
 * @param {string}   task     - Descrição da task
 * @param {string[]} files    - Ficheiros envolvidos
 * @param {string}   domain   - Domínio classificado pelo router
 * @param {object}   [opts]   - { forceOpus, forceSonnet, forceHaiku }
 * @returns {ComplexityResult}
 */
function analyze(task, files = [], domain = 'backend', opts = {}) {
  const reasons = [];
  let score = 0;

  // ── 1. Score base do domínio
  const baseScore = DOMAIN_BASE_SCORES[domain] ?? 5;
  score += baseScore;
  reasons.push(`domínio "${domain}" → base ${baseScore}`);

  // ── 2. Keywords de alta complexidade
  const taskLower = task.toLowerCase();
  const highMatches = HIGH_COMPLEXITY.filter(kw => taskLower.includes(kw));
  if (highMatches.length > 0) {
    const bonus = Math.min(3, highMatches.length);
    score += bonus;
    reasons.push(`keywords críticas: [${highMatches.slice(0, 3).join(', ')}] +${bonus}`);
  }

  // ── 3. Keywords de média complexidade (só se não há high)
  if (highMatches.length === 0) {
    const medMatches = MEDIUM_COMPLEXITY.filter(kw => taskLower.includes(kw));
    if (medMatches.length > 0) {
      score += 1;
      reasons.push(`keywords médias: [${medMatches.slice(0, 2).join(', ')}] +1`);
    }
  }

  // ── 4. Keywords de baixa complexidade (reduzem score)
  const lowMatches = LOW_COMPLEXITY.filter(kw => taskLower.includes(kw));
  if (lowMatches.length > 0 && highMatches.length === 0) {
    score = Math.max(0, score - 2);
    reasons.push(`keywords simples: [${lowMatches[0]}] -2`);
  }

  // ── 5. Ficheiros sensíveis
  const sensFiles = files.filter(f => SENSITIVE_FILES.some(s => f.toLowerCase().includes(s)));
  if (sensFiles.length > 0) {
    const bonus = Math.min(2, sensFiles.length);
    score += bonus;
    reasons.push(`ficheiros sensíveis: ${sensFiles.length} +${bonus}`);
  }

  // ── 6. Volume de ficheiros
  if (files.length > 10) { score += 2; reasons.push(`muitos ficheiros (${files.length}) +2`); }
  else if (files.length > 5) { score += 1; reasons.push(`vários ficheiros (${files.length}) +1`); }

  // ── 7. Comprimento da task (proxy de complexidade)
  if (task.length > 300) { score += 1; reasons.push(`task longa (${task.length} chars) +1`); }

  // ── 8. Forçar modelo (flags explícitas)
  if (opts.forceOpus)   { score = 10; reasons.push('forceOpus → 10'); }
  if (opts.forceSonnet) { score = 5;  reasons.push('forceSonnet → 5'); }
  if (opts.forceHaiku)  { score = 2;  reasons.push('forceHaiku → 2'); }

  // ── Cap final
  score = Math.max(0, Math.min(10, Math.round(score)));

  // ── Selecção do tier
  const tier = score >= 8 ? 'senior' : score >= 4 ? 'executor' : 'utility';
  const model = MODELS[tier];

  // Estimativa de custo (assumindo 1000 tokens de input)
  const estimatedCostUsd = (1000 / 1_000_000) * model.priceIn;

  return {
    score,
    tier,
    modelId:    model.id,
    modelLabel: model.label,
    reasons,
    estimatedCostUsd: Math.round(estimatedCostUsd * 100000) / 100000,
  };
}

/**
 * Explicação legível da decisão.
 */
function explain(result) {
  const lines = [
    `Score: ${result.score}/10 → ${result.modelLabel} (${result.tier})`,
    `Factores:`,
    ...result.reasons.map(r => `  · ${r}`),
    `Custo estimado: ~$${result.estimatedCostUsd}/1K tokens input`,
  ];
  return lines.join('\n');
}

module.exports = { analyze, explain, MODELS, DOMAIN_BASE_SCORES };
