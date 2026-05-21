'use strict';

/**
 * KAIROS HYPERDRIVE — KG Enricher
 * Após cada task bem-sucedida, enriquece automaticamente o Knowledge Graph.
 *
 * Nodes criados/actualizados:
 *   Agent:   { id: "@Dex", successCount, domains[] }
 *   Pattern: { id: "pattern-backend-[hash]", task, domain, outputSummary }
 *   Domain:  { id: "domain-backend" }
 *
 * Edges criados:
 *   (@Dex) -[SOLVED]->  (pattern) com { confidence, timestamp, cost }
 *   (pattern) -[IN_DOMAIN]-> (domain)
 *   (pattern) -[SIMILAR_TO]-> (pattern2) se similaridade >= 0.6
 *
 * Integração:
 *   - Usa addNode/addEdge/load/save de knowledge-graph.js
 *   - Erros nunca bloqueiam a execução (try/catch no caller)
 */

const crypto = require('node:crypto');
const { addNode, addEdge } = require('./knowledge-graph');

// Threshold de similaridade para edge SIMILAR_TO
const SIMILARITY_THRESHOLD = 0.6;

function wordSet(text) {
  return new Set((text || '').toLowerCase().split(/\W+/).filter(w => w.length >= 3));
}

function jaccardSimilarity(textA, textB) {
  const a = wordSet(textA);
  const b = wordSet(textB);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function shortHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 8);
}

class KGEnricher {
  /**
   * Enriquece o KG com informação de uma task bem-sucedida.
   * @param {object} ledgerEvent - payload do evento TaskCompleted
   * @param {string} kgPath      - path ao knowledge-graph.json (opcional, para testes)
   * @returns {Promise<{ agentNode, patternNode, edgesAdded }>}
   */
  async enrich(ledgerEvent, kgPath) {
    // kgPath é ignorado — addNode/addEdge usam KG_PATH interno
    // mas aceitamos o argumento por compatibilidade com a spec

    const {
      agent  = 'unknown',
      domain = 'unknown',
      task   = '',
      output = task,
      costUsd = 0,
      confidence_real = 0.75,
    } = ledgerEvent || {};

    if (!ledgerEvent || (!task && (!agent || agent === 'unknown'))) {
      return { agentNode: null, patternNode: null, edgesAdded: 0 };
    }

    let edgesAdded = 0;

    // ─── 1. Agent node ──────────────────────────────────────────────────────
    const agentId = agent.startsWith('@') ? agent : `@${agent}`;
    let agentNode;
    try {
      const { load, save } = require('./knowledge-graph');
      const kg = load();
      const existing = kg.nodes?.[agentId];

      if (existing) {
        // Actualizar successCount e domains
        const data = existing.data || {};
        data.successCount = (data.successCount || 0) + 1;
        data.domains = [...new Set([...(data.domains || []), domain])];
        data.lastTaskAt = new Date().toISOString();
        kg.nodes[agentId] = { ...existing, data };
        save(kg);
        agentNode = kg.nodes[agentId];
      } else {
        agentNode = addNode(agentId, 'Agent', {
          successCount: 1,
          domains:     [domain],
          lastTaskAt:  new Date().toISOString(),
        });
      }
    } catch (_) { agentNode = null; }

    // ─── 2. Pattern node ────────────────────────────────────────────────────
    const patternId = `pattern-${domain}-${shortHash(task)}`;
    const patternSummary = output
      ? output.slice(0, 200)
      : task.slice(0, 200);

    let patternNode;
    try {
      patternNode = addNode(patternId, 'Pattern', {
        task:          task.slice(0, 200),
        domain,
        outputSummary: patternSummary,
        createdAt:     new Date().toISOString(),
      });
    } catch (_) { patternNode = null; }

    // ─── 3. Domain node ─────────────────────────────────────────────────────
    const domainId = `domain-${domain}`;
    try {
      const { load: loadKG } = require('./knowledge-graph');
      const kg = loadKG();
      if (!kg.nodes?.[domainId]) {
        addNode(domainId, 'Domain', { name: domain });
      }
    } catch (_) {}

    // ─── 4. Edges ───────────────────────────────────────────────────────────
    if (agentNode && patternNode) {
      try {
        addEdge(agentId, patternId, {
          type:       'SOLVED',
          confidence: confidence_real,
          timestamp:  new Date().toISOString(),
          cost:       costUsd,
        });
        edgesAdded++;
      } catch (_) {}
    }

    if (patternNode) {
      try {
        addEdge(patternId, domainId, {
          type:   'IN_DOMAIN',
          weight: 1,
        });
        edgesAdded++;
      } catch (_) {}
    }

    // ─── 5. SIMILAR_TO edges com padrões existentes ─────────────────────────
    try {
      const { load: loadKG } = require('./knowledge-graph');
      const kg = loadKG();
      const existingPatterns = Object.values(kg.nodes || {})
        .filter(n => n.type === 'Pattern' && n.id !== patternId && n.data?.domain === domain);

      for (const existingPat of existingPatterns.slice(0, 20)) {
        const sim = jaccardSimilarity(task, existingPat.data?.task || '');
        if (sim >= SIMILARITY_THRESHOLD) {
          addEdge(patternId, existingPat.id, {
            type:       'SIMILAR_TO',
            similarity: Math.round(sim * 100) / 100,
          });
          edgesAdded++;
          break; // Apenas 1 SIMILAR_TO por padrão novo para controlar crescimento
        }
      }
    } catch (_) {}

    return { agentNode, patternNode, edgesAdded };
  }
}

module.exports = { KGEnricher };
