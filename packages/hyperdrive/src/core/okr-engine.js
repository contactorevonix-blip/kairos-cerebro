'use strict';

/**
 * KAIROS HYPERDRIVE — OKR Engine (implementação real)
 *
 * Calcula progresso real dos OKRs de cada agente com base em:
 *   1. Tasks completadas no ledger (TaskCompleted events)
 *   2. Taxa de sucesso por domínio
 *   3. Qualidade média (quality_score nos payloads)
 *   4. Heurísticas de keywords por KR
 *
 * OKRs são definidos na constituição do agente (.claude/agents/*.md)
 * e carregados pelo loaders/agents.js como strings de texto livre.
 *
 * Estrutura de retorno de progress():
 * {
 *   agentId:   '@Dex',
 *   period:    '7d',
 *   okrs: [
 *     {
 *       kr:          'Entregar código sem bugs críticos em produção',
 *       progress:    0.75,          // 0..1
 *       status:      'on-track',    // 'at-risk' | 'on-track' | 'completed' | 'not-started'
 *       evidence: {
 *         tasks_completed:  12,
 *         tasks_failed:      2,
 *         avg_quality:       8.8,
 *         success_rate:      0.86,
 *         matched_keywords:  ['código', 'bug', 'produção'],
 *       },
 *     },
 *   ],
 *   summary: {
 *     overall_progress: 0.72,
 *     tasks_total:      14,
 *     tasks_completed:  12,
 *     tasks_failed:      2,
 *     avg_quality:       8.8,
 *     success_rate:      0.86,
 *     period_days:       7,
 *     computed_at:       '2026-05-21T02:00:00.000Z',
 *   },
 * }
 */

const fs     = require('node:fs');
const path   = require('node:path');
const crypto = require('node:crypto');

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const DEFAULT_PERIOD_MS    = 7  * 24 * 60 * 60 * 1000;  // 7 dias
const LONG_PERIOD_MS       = 30 * 24 * 60 * 60 * 1000;  // 30 dias

// Thresholds de progresso
const PROGRESS_COMPLETED   = 0.90;  // ≥ 90% → completed
const PROGRESS_ON_TRACK    = 0.50;  // ≥ 50% → on-track
const PROGRESS_AT_RISK     = 0.20;  // ≥ 20% → at-risk
// < 20% → not-started

// Peso de cada sinal no cálculo de progresso de um KR
const WEIGHT_SUCCESS_RATE  = 0.40;
const WEIGHT_AVG_QUALITY   = 0.35;  // normalizado para 0..1 (score/10)
const WEIGHT_KEYWORD_MATCH = 0.25;  // % de keywords do KR que aparecem em tasks

// Número mínimo de tasks para o score ser estatisticamente válido
const MIN_TASKS_FOR_SIGNAL = 3;

// Fallback quando não há dados suficientes
const FALLBACK_PROGRESS    = 0.10;

// ─── KEYWORDS STOP-WORDS (ignorar no matching) ────────────────────────────────

const STOP_WORDS = new Set([
  'o', 'a', 'os', 'as', 'e', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'que', 'um',
  'uma', 'com', 'se', 'ao', 'à', 'ou', 'mas', 'mais', 'não',
  'sem', 'até', 'cada', 'todo', 'toda', 'todos', 'todas',
  'the', 'a', 'an', 'and', 'of', 'in', 'to', 'for', 'with',
  'on', 'at', 'by', 'or', 'not', 'no', 'all', 'each',
]);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Extrai keywords significativas de um texto.
 * Remove stop-words, pontuação, e palavras com < 3 chars.
 * @param {string} text
 * @returns {Set<string>}
 */
function extractKeywords(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-záàâãéèêíìîóòôõúùûçñ\s-]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
  );
}

/**
 * Calcula a % de keywords de um KR que estão presentes num corpus de tasks.
 * @param {string}   krText       - Texto do KR
 * @param {string[]} taskTexts    - Textos das tasks (description/payload)
 * @returns {number} 0..1
 */
function keywordMatchRatio(krText, taskTexts) {
  if (!krText || !taskTexts.length) return 0;

  const krKeywords     = extractKeywords(krText);
  if (!krKeywords.size) return 0;

  const corpusText     = taskTexts.join(' ').toLowerCase();
  const corpusKeywords = extractKeywords(corpusText);

  let matched = 0;
  for (const kw of krKeywords) {
    if (corpusKeywords.has(kw) || corpusText.includes(kw)) matched++;
  }

  return matched / krKeywords.size;
}

/**
 * Calcula o status qualitativo de um KR.
 * @param {number} progress - 0..1
 * @returns {'not-started'|'at-risk'|'on-track'|'completed'}
 */
function progressToStatus(progress) {
  if (progress >= PROGRESS_COMPLETED) return 'completed';
  if (progress >= PROGRESS_ON_TRACK)  return 'on-track';
  if (progress >= PROGRESS_AT_RISK)   return 'at-risk';
  return 'not-started';
}

/**
 * Lê o ledger JSONL em modo raw (sem dependência circular).
 * Usa KAIROS_LEDGER_PATH se disponível (isolamento de testes).
 * @returns {object[]} Array de eventos parsed
 */
function readLedgerEvents() {
  const ledgerPath = process.env.KAIROS_LEDGER_PATH
    || path.resolve(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'state-ledger.jsonl');

  try {
    const raw = fs.readFileSync(ledgerPath, 'utf8').trim();
    if (!raw) return [];
    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ─── OKR ENGINE ───────────────────────────────────────────────────────────────

class OKREngine {
  /**
   * @param {object} [options]
   * @param {number}  [options.periodMs=7d]  - Janela de análise em ms
   * @param {function} [options.getLedgerEvents] - Override para testes (injector)
   */
  constructor(options = {}) {
    this._periodMs       = options.periodMs      || DEFAULT_PERIOD_MS;
    this._getLedgerEvents = options.getLedgerEvents || readLedgerEvents;

    // Map: agentId → string[] de KRs
    this._okrs = new Map();

    // Cache de eventos por período (invalidado quando se chama refresh())
    this._cache = null;
    this._cacheAt = 0;
    this._cacheTtlMs = 60_000; // 1 minuto
  }

  // ─── API PÚBLICA ──────────────────────────────────────────────────────────

  /**
   * Define os OKRs de um agente.
   * @param {string}   agentId - e.g. '@Dex'
   * @param {string[]} okrs    - Array de strings descrevendo KRs
   */
  define(agentId, okrs) {
    if (!agentId || typeof agentId !== 'string') {
      throw new TypeError('agentId deve ser uma string não-vazia');
    }
    this._okrs.set(agentId, Array.isArray(okrs) ? okrs.filter(Boolean) : []);
  }

  /**
   * Calcula o progresso real dos OKRs de um agente com base no ledger.
   *
   * @param {string} agentId      - e.g. '@Dex'
   * @param {object} [opts]
   * @param {number}  [opts.periodMs]    - Override da janela de análise
   * @param {boolean} [opts.longPeriod]  - Usar janela de 30 dias
   * @returns {object} Estrutura completa de progresso
   */
  progress(agentId, opts = {}) {
    const periodMs = opts.longPeriod
      ? LONG_PERIOD_MS
      : (opts.periodMs || this._periodMs);

    const since      = Date.now() - periodMs;
    const periodDays = Math.round(periodMs / (24 * 60 * 60 * 1000));
    const events     = this._getEventsInWindow(since);

    // Filtrar eventos relevantes para este agente
    const agentEvents = this._filterAgentEvents(events, agentId, since);

    // Separar completed e failed
    const completed = agentEvents.filter(e => e.type === 'TaskCompleted');
    const failed    = agentEvents.filter(e => e.type === 'TaskFailed');
    const total     = completed.length + failed.length;

    // Métricas agregadas
    const successRate = total > 0 ? completed.length / total : null;
    const avgQuality  = this._calcAvgQuality(completed);

    // Textos das tasks completadas para keyword matching
    const taskTexts = this._extractTaskTexts(agentEvents, events);

    // KRs definidos para este agente
    const krDefinitions = this._okrs.get(agentId) || [];

    // Calcular progresso por KR
    const okrResults = krDefinitions.map(kr =>
      this._computeKRProgress(kr, {
        completed,
        failed,
        total,
        successRate,
        avgQuality,
        taskTexts,
      })
    );

    // Progresso global = média dos KRs (ou fallback se sem KRs)
    const overallProgress = krDefinitions.length > 0
      ? okrResults.reduce((s, kr) => s + kr.progress, 0) / okrResults.length
      : (successRate !== null ? successRate : FALLBACK_PROGRESS);

    return {
      agentId,
      period:   `${periodDays}d`,
      okrs:     okrResults,
      summary: {
        overall_progress: Math.round(overallProgress * 1000) / 1000,
        tasks_total:      total,
        tasks_completed:  completed.length,
        tasks_failed:     failed.length,
        avg_quality:      avgQuality,
        success_rate:     successRate !== null ? Math.round(successRate * 1000) / 1000 : null,
        period_days:      periodDays,
        computed_at:      new Date().toISOString(),
      },
    };
  }

  /**
   * Progresso de TODOS os agentes definidos.
   * @param {object} [opts] - Mesmas opções que progress()
   * @returns {object[]} Array de resultados por agente
   */
  progressAll(opts = {}) {
    const results = [];
    for (const agentId of this._okrs.keys()) {
      results.push(this.progress(agentId, opts));
    }
    return results.sort((a, b) =>
      b.summary.overall_progress - a.summary.overall_progress
    );
  }

  /**
   * Relatório de equipa — OKR health por agente, ordenado por risco.
   * @param {object} [opts]
   * @returns {object} Relatório consolidado
   */
  teamReport(opts = {}) {
    const all = this.progressAll(opts);

    const atRisk      = all.filter(r => r.summary.overall_progress < PROGRESS_ON_TRACK);
    const onTrack     = all.filter(r => r.summary.overall_progress >= PROGRESS_ON_TRACK && r.summary.overall_progress < PROGRESS_COMPLETED);
    const completed   = all.filter(r => r.summary.overall_progress >= PROGRESS_COMPLETED);

    const teamAvg = all.length > 0
      ? all.reduce((s, r) => s + r.summary.overall_progress, 0) / all.length
      : 0;

    return {
      team_overall_progress: Math.round(teamAvg * 1000) / 1000,
      agents_total:          all.length,
      at_risk:               atRisk.map(r => ({ agentId: r.agentId, progress: r.summary.overall_progress })),
      on_track:              onTrack.map(r => ({ agentId: r.agentId, progress: r.summary.overall_progress })),
      completed:             completed.map(r => ({ agentId: r.agentId, progress: r.summary.overall_progress })),
      details:               all,
      computed_at:           new Date().toISOString(),
    };
  }

  /**
   * Invalida o cache de eventos.
   * Útil após operações que escrevem no ledger.
   */
  refresh() {
    this._cache    = null;
    this._cacheAt  = 0;
  }

  // ─── INTERNOS ──────────────────────────────────────────────────────────────

  /**
   * Lê eventos do ledger com cache TTL.
   * @param {number} since - Timestamp ms de início da janela
   * @returns {object[]}
   */
  _getEventsInWindow(since) {
    const now = Date.now();

    // Cache hit
    if (this._cache && (now - this._cacheAt) < this._cacheTtlMs) {
      return this._cache;
    }

    const allEvents = this._getLedgerEvents();
    this._cache   = allEvents;
    this._cacheAt = now;
    return allEvents;
  }

  /**
   * Filtra eventos de um agente dentro de uma janela temporal.
   * Suporta dois formatos de evento:
   *   - actor === agentId  (agente emitiu o evento directamente)
   *   - payload.agent === agentId  (orchestrator registou em nome do agente)
   *
   * @param {object[]} events   - Todos os eventos do ledger
   * @param {string}   agentId  - ID do agente (com ou sem '@')
   * @param {number}   since    - Timestamp ms
   * @returns {object[]}
   */
  _filterAgentEvents(events, agentId, since) {
    // Normalizar o agentId para comparação case-insensitive
    const idLower = agentId.toLowerCase();

    return events.filter(e => {
      // Janela temporal
      if (new Date(e.timestamp).getTime() < since) return false;

      // Só eventos de task
      if (!['TaskCompleted', 'TaskFailed', 'TaskCreated', 'TaskStarted'].includes(e.type)) return false;

      // Correspondência de agente
      const actorMatch   = e.actor?.toLowerCase() === idLower;
      const payloadMatch = e.payload?.agent?.toLowerCase() === idLower;
      const agentsMatch  = Array.isArray(e.payload?.agents) &&
                           e.payload.agents.some(a => a.toLowerCase() === idLower);

      return actorMatch || payloadMatch || agentsMatch;
    });
  }

  /**
   * Calcula qualidade média a partir dos quality_score nos payloads.
   * @param {object[]} completedEvents
   * @returns {number|null}
   */
  _calcAvgQuality(completedEvents) {
    const scores = completedEvents
      .map(e => e.payload?.quality_score)
      .filter(s => typeof s === 'number' && !isNaN(s));

    if (!scores.length) return null;

    const avg = scores.reduce((s, q) => s + q, 0) / scores.length;
    return Math.round(avg * 10) / 10;
  }

  /**
   * Extrai textos das tasks para keyword matching.
   * Inclui: payload.task, payload.description, e runId correlacionado.
   *
   * @param {object[]} agentEvents  - Eventos filtrados do agente
   * @param {object[]} allEvents    - Todos os eventos (para lookup de TaskCreated)
   * @returns {string[]}
   */
  _extractTaskTexts(agentEvents, allEvents) {
    const texts = [];

    // Extrair directamente dos eventos do agente
    for (const e of agentEvents) {
      if (e.payload?.task)        texts.push(e.payload.task);
      if (e.payload?.description) texts.push(e.payload.description);
    }

    // Correlacionar via runId com TaskCreated (que tem o texto completo da task)
    const runIds = new Set(
      agentEvents
        .map(e => e.payload?.runId)
        .filter(Boolean)
    );

    if (runIds.size > 0) {
      for (const e of allEvents) {
        if (e.type === 'TaskCreated' && runIds.has(e.payload?.runId)) {
          if (e.payload?.task) texts.push(e.payload.task);
        }
      }
    }

    return texts;
  }

  /**
   * Computa o progresso de um único KR.
   *
   * Algoritmo composto por 3 sinais ponderados:
   *   1. success_rate  → 40%  (ratio de tasks completadas vs total)
   *   2. avg_quality   → 35%  (qualidade normalizada 0..1)
   *   3. keyword_match → 25%  (relevância das tasks para este KR)
   *
   * Se não há dados suficientes, usa FALLBACK_PROGRESS com penalidade.
   *
   * @param {string} kr                - Texto do KR
   * @param {object} metrics           - Métricas do agente
   * @param {object[]} metrics.completed
   * @param {object[]} metrics.failed
   * @param {number}  metrics.total
   * @param {number|null} metrics.successRate
   * @param {number|null} metrics.avgQuality
   * @param {string[]}    metrics.taskTexts
   * @returns {object}
   */
  _computeKRProgress(kr, metrics) {
    const { completed, failed, total, successRate, avgQuality, taskTexts } = metrics;

    // Sem dados suficientes → fallback baixo
    if (total < MIN_TASKS_FOR_SIGNAL) {
      const ratio = total / MIN_TASKS_FOR_SIGNAL;
      const progress = FALLBACK_PROGRESS * ratio;
      return {
        kr,
        progress:  Math.round(progress * 1000) / 1000,
        status:    progressToStatus(progress),
        evidence: {
          tasks_completed:  completed.length,
          tasks_failed:     failed.length,
          avg_quality:      avgQuality,
          success_rate:     successRate,
          keyword_match:    0,
          matched_keywords: [],
          signal:           'insufficient-data',
        },
      };
    }

    // Sinal 1: success rate (0..1)
    const srSignal = successRate ?? 0.5;

    // Sinal 2: qualidade normalizada (0..1), fallback 0.75 se ausente
    const qualNorm = avgQuality !== null ? (avgQuality / 10) : 0.75;

    // Sinal 3: keyword matching entre KR e corpus de tasks
    const krKeywords = extractKeywords(kr);
    const matchRatio = keywordMatchRatio(kr, taskTexts);
    const matchedKws = [...krKeywords].filter(kw =>
      taskTexts.join(' ').toLowerCase().includes(kw)
    );

    // Score ponderado
    const rawProgress =
      WEIGHT_SUCCESS_RATE  * srSignal   +
      WEIGHT_AVG_QUALITY   * qualNorm   +
      WEIGHT_KEYWORD_MATCH * matchRatio;

    // Clamp 0..1
    const progress = Math.min(1, Math.max(0, rawProgress));

    return {
      kr,
      progress:  Math.round(progress * 1000) / 1000,
      status:    progressToStatus(progress),
      evidence: {
        tasks_completed:  completed.length,
        tasks_failed:     failed.length,
        avg_quality:      avgQuality,
        success_rate:     Math.round(srSignal * 1000) / 1000,
        keyword_match:    Math.round(matchRatio * 1000) / 1000,
        matched_keywords: matchedKws,
        signal:           'computed',
      },
    };
  }
}

// ─── HELPERS EXPORTADOS (úteis para testes) ────────────────────────────────────

/**
 * Cria uma instância pré-populada com os agentes fornecidos.
 * @param {object[]} agents - Array de { id, okrs[] } da loadAgents()
 * @param {object}   [options]
 * @returns {OKREngine}
 */
function createFromAgents(agents, options = {}) {
  const engine = new OKREngine(options);
  for (const agent of agents) {
    if (agent.id && Array.isArray(agent.okrs)) {
      engine.define(agent.id, agent.okrs);
    }
  }
  return engine;
}

module.exports = {
  OKREngine,
  createFromAgents,
  // Constantes exportadas para testes
  PROGRESS_COMPLETED,
  PROGRESS_ON_TRACK,
  PROGRESS_AT_RISK,
  MIN_TASKS_FOR_SIGNAL,
  FALLBACK_PROGRESS,
  WEIGHT_SUCCESS_RATE,
  WEIGHT_AVG_QUALITY,
  WEIGHT_KEYWORD_MATCH,
  DEFAULT_PERIOD_MS,
  LONG_PERIOD_MS,
};
