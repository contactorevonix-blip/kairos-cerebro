'use strict';

/**
 * HYPERDRIVE — Intelligence Engine
 *
 * Detecta padrões em tasks similares dos últimos 7 dias e sugere atalhos
 * (skip de fases, agentes recomendados, custo/duração esperados).
 *
 * Inputs:
 *   - ledger: objecto com .events (array) ou .filter() — produzido por loaders/ledger.js
 *   - kg:     knowledge graph (opcional — usado para boost de similaridade)
 *
 * Output do detectPatterns(task):
 *   {
 *     similar_count,           // nº de tasks similares relevantes
 *     similar_tasks,           // top-5 com {runId, similarity, ...}
 *     shortcut_available,      // true se houver evidência suficiente
 *     recommended_agents,      // agentes mais usados em tasks similares
 *     expected_duration_ms,    // mediana
 *     expected_cost_usd,       // mediana
 *     avg_quality_score,       // média qualidade
 *     success_rate,            // 0..1
 *     suggestions: [           // atalhos accionáveis
 *       { type, reason, confidence, action }
 *     ],
 *     reasoning                // explicação textual curta
 *   }
 */

const WINDOW_MS              = 7 * 24 * 60 * 60 * 1000;
const MIN_SAMPLES_SHORTCUT   = 3;     // mínimo de tasks similares para sugerir atalho
const SIMILARITY_THRESHOLD   = 0.35;  // só conta como "similar" acima disto
const HIGH_CONFIDENCE_QUALITY = 7;    // quality_score médio mínimo p/ atalho forte

// Stopwords PT+EN para tokenização da descrição
const STOPWORDS = new Set([
  'a','o','e','é','de','do','da','dos','das','um','uma','no','na','nos','nas',
  'em','para','por','com','que','se','sem','sobre','até','ao','aos','à','às',
  'the','a','an','of','to','in','on','for','and','or','with','is','are','be',
  'this','that','it','as','at','by','from','task','tarefa','quando','após',
  'each','cada','mais','menos','muito','pouco','já','vai','ser','fazer',
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

function jaccard(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function median(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** Indexa o ledger num mapa runId → { created, started, completed, failed, postmortem } */
function indexByRun(events) {
  const runs = new Map();
  for (const e of events) {
    const runId = e.payload?.runId || e.payload?.task_id;
    if (!runId) continue;
    if (!runs.has(runId)) runs.set(runId, { runId, events: [] });
    runs.get(runId).events.push(e);
  }

  const out = [];
  for (const r of runs.values()) {
    const created   = r.events.find(e => e.type === 'TaskCreated');
    const started   = r.events.find(e => e.type === 'TaskStarted');
    const completed = r.events.find(e => e.type === 'TaskCompleted');
    const failed    = r.events.find(e => e.type === 'TaskFailed');
    const pm        = r.events.find(e => e.type === 'PostMortemCreated');
    if (!created && !started) continue;

    const description = created?.payload?.task || '';
    const domain      = started?.payload?.domain || pm?.payload?.domain;
    const agents      = started?.payload?.agents || [];
    const timestamp   = created?.timestamp || started?.timestamp;
    const finishedAt  = (completed || failed)?.timestamp;
    const durationMs  = pm?.payload?.duration_ms
      || (timestamp && finishedAt ? new Date(finishedAt).getTime() - new Date(timestamp).getTime() : null);

    out.push({
      runId:        r.runId,
      description,
      domain,
      agents,
      timestamp,
      success:      Boolean(completed) && !failed,
      cost_usd:     completed?.payload?.costUsd ?? null,
      quality:      completed?.payload?.quality_score ?? null,
      confidence:   started?.payload?.confidence ?? null,
      duration_ms:  durationMs,
      tokens:       new Set(tokenize(description)),
    });
  }
  return out;
}

class IntelligenceEngine {
  constructor(ledger, kg) {
    this.ledger = ledger;
    this.kg     = kg;
    this._windowMs = WINDOW_MS;
  }

  /**
   * Detecta padrões em tasks similares dos últimos 7 dias.
   * @param {object} task - { description, domain, files? }
   * @returns {object} análise estruturada com sugestões de atalho
   */
  detectPatterns(task = {}) {
    const events = this._events();
    const since  = Date.now() - this._windowMs;
    const runs   = indexByRun(events).filter(r => {
      const t = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return t >= since;
    });

    const queryTokens = new Set(tokenize(task.description || ''));
    const queryDomain = task.domain;

    // Calcular similaridade para cada run
    const scored = runs.map(r => {
      const textSim   = jaccard(queryTokens, r.tokens);
      const domainSim = queryDomain && r.domain === queryDomain ? 1 : 0;
      // Score: 60% texto + 40% domínio (se ambos existem)
      const similarity = queryDomain
        ? 0.6 * textSim + 0.4 * domainSim
        : textSim;
      return { ...r, similarity, text_similarity: textSim };
    });

    const similar = scored
      .filter(r => r.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity);

    // Métricas agregadas
    const durations = similar.map(r => r.duration_ms).filter(v => v != null && v > 0);
    const costs     = similar.map(r => r.cost_usd).filter(v => v != null && v > 0);
    const qualities = similar.map(r => r.quality).filter(v => v != null);
    const successes = similar.filter(r => r.success).length;

    const agentFreq = new Map();
    for (const r of similar) {
      for (const a of r.agents) agentFreq.set(a, (agentFreq.get(a) || 0) + 1);
    }
    const recommendedAgents = [...agentFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([agent, count]) => ({
        agent,
        usage_rate: similar.length ? count / similar.length : 0,
        count,
      }));

    const expectedDuration = median(durations);
    const expectedCost     = median(costs);
    const avgQuality       = mean(qualities);
    const successRate      = similar.length ? successes / similar.length : null;

    // Decisão de atalho
    const shortcutAvailable =
      similar.length >= MIN_SAMPLES_SHORTCUT &&
      (successRate ?? 0) >= 0.7 &&
      (avgQuality ?? 0) >= HIGH_CONFIDENCE_QUALITY;

    // Sugestões accionáveis
    const suggestions = [];

    if (shortcutAvailable) {
      const topAgent = recommendedAgents[0];
      if (topAgent && topAgent.usage_rate >= 0.6) {
        suggestions.push({
          type: 'route_to_agent',
          reason: `${topAgent.agent} resolveu ${topAgent.count}/${similar.length} tasks similares (qualidade ${avgQuality.toFixed(1)}/10)`,
          confidence: Math.min(0.95, 0.5 + topAgent.usage_rate * 0.4 + (avgQuality / 10) * 0.1),
          action: { agent: topAgent.agent },
        });
      }
    }

    if (similar.length >= MIN_SAMPLES_SHORTCUT && successRate >= 0.85 && avgQuality >= 8) {
      suggestions.push({
        type: 'skip_consensus',
        reason: `${successes}/${similar.length} tasks similares concluídas com qualidade média ${avgQuality.toFixed(1)} — consenso desnecessário`,
        confidence: 0.80,
        action: { force_consensus: false },
      });
    }

    if (expectedDuration && expectedDuration < 60_000) {
      suggestions.push({
        type: 'short_task_boost',
        reason: `Tasks similares concluem em ${Math.round(expectedDuration / 1000)}s — aplicar fast-path`,
        confidence: 0.75,
        action: { short_task_boost: true },
      });
    }

    if (expectedCost && expectedCost > 1.0) {
      suggestions.push({
        type: 'cost_budget_warning',
        reason: `Tasks similares custaram em média $${expectedCost.toFixed(2)} — alocar budget`,
        confidence: 0.70,
        action: { reserve_budget_usd: Math.ceil(expectedCost * 1.2 * 100) / 100 },
      });
    }

    if (similar.length === 0) {
      suggestions.push({
        type: 'no_precedent',
        reason: 'Nenhuma task similar nos últimos 7 dias — executar pipeline completo com cautela',
        confidence: 0.50,
        action: { force_consensus: true },
      });
    }

    const reasoning = this._explain(similar, recommendedAgents, {
      successRate, avgQuality, expectedDuration, expectedCost,
    });

    return {
      similar_count:        similar.length,
      similar_tasks:        similar.slice(0, 5).map(r => ({
        runId:       r.runId,
        similarity:  Math.round(r.similarity * 100) / 100,
        description: r.description.slice(0, 120),
        domain:      r.domain,
        success:     r.success,
        duration_ms: r.duration_ms,
        cost_usd:    r.cost_usd,
        quality:     r.quality,
      })),
      shortcut_available:   shortcutAvailable,
      recommended_agents:   recommendedAgents,
      expected_duration_ms: expectedDuration,
      expected_cost_usd:    expectedCost != null ? Math.round(expectedCost * 10000) / 10000 : null,
      avg_quality_score:    avgQuality != null ? Math.round(avgQuality * 100) / 100 : null,
      success_rate:         successRate != null ? Math.round(successRate * 100) / 100 : null,
      suggestions,
      reasoning,
      window_days:          this._windowMs / (24 * 60 * 60 * 1000),
    };
  }

  /**
   * Decide se consenso multi-agente é necessário.
   * Critérios:
   *   - confidence baixa
   *   - palavra "crítico" na descrição
   *   - sem precedente E domínio sensível
   */
  shouldUseConsensus(task = {}, confidence = 0.5) {
    const desc = (task.description || '').toLowerCase();
    if (desc.includes('crítico') || desc.includes('critico') || desc.includes('critical')) return true;
    if (confidence < 0.65) return true;

    // Se não há precedente em domínios sensíveis, exige consenso
    const sensitiveDomains = ['security', 'payments', 'gdpr', 'infra'];
    if (sensitiveDomains.includes(task.domain)) {
      const pattern = this.detectPatterns(task);
      if (pattern.similar_count < 2) return true;
    }

    return false;
  }

  // ---- helpers privados ----

  _events() {
    if (Array.isArray(this.ledger)) return this.ledger;
    if (this.ledger?.events) return this.ledger.events;
    if (typeof this.ledger?.filter === 'function') {
      return this.ledger.filter(() => true);
    }
    return [];
  }

  _explain(similar, agents, { successRate, avgQuality, expectedDuration, expectedCost }) {
    if (!similar.length) {
      return 'Sem precedente nos últimos 7 dias. Recomenda-se execução completa com consenso.';
    }
    const parts = [];
    parts.push(`${similar.length} task(s) similares nos últimos 7 dias`);
    if (successRate != null) parts.push(`success rate ${(successRate * 100).toFixed(0)}%`);
    if (avgQuality != null) parts.push(`qualidade média ${avgQuality.toFixed(1)}/10`);
    if (expectedDuration) parts.push(`duração mediana ${Math.round(expectedDuration / 1000)}s`);
    if (expectedCost) parts.push(`custo mediano $${expectedCost.toFixed(3)}`);
    if (agents[0]) parts.push(`agente dominante ${agents[0].agent}`);
    return parts.join(' · ');
  }
}

module.exports = { IntelligenceEngine };
