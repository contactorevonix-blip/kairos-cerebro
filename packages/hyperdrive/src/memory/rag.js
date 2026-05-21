'use strict';

/**
 * KAIROS HYPERDRIVE — Ledger RAG
 * TF-IDF puro sobre o ledger de tasks bem-sucedidas.
 * Zero dependências externas.
 *
 * Algoritmo:
 *   TF(t,d)  = count(t,d) / total_terms(d)
 *   IDF(t)   = log(1 + N / (1 + df(t)))   [suavizado para corpus pequeno]
 *   TF-IDF   = TF × IDF
 *   Cosine similarity entre query e cada documento
 */

const fs   = require('node:fs');
const path = require('node:path');

// Stopwords PT + EN mais comuns
const STOPWORDS = new Set([
  // PT
  'a','ao','aos','as','com','da','das','de','do','dos','e','em','é',
  'eu','isso','isto','já','mais','mas','me','meu','minha','na','nas',
  'no','nos','não','o','os','ou','para','pela','pelas','pelo','pelos',
  'por','que','se','ser','seu','seus','sua','suas','também','te','tem',
  'tu','um','uma','uns','umas','são',
  // EN
  'a','an','and','are','as','at','be','been','by','do','for','from',
  'has','have','he','her','him','his','how','i','if','in','is','it',
  'its','just','me','my','no','not','of','on','or','our','out','she',
  'so','that','the','their','them','then','there','they','this','to',
  'up','us','was','we','were','what','when','where','which','who',
  'will','with','you','your',
]);

function tokenize(text) {
  return (text || '').toLowerCase()
    .replace(/[^a-záàãâéêíóôõúüç\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
}

function tf(tokens) {
  const counts = {};
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
  const total = tokens.length || 1;
  const result = {};
  for (const [t, c] of Object.entries(counts)) result[t] = c / total;
  return result;
}

function dotProduct(a, b) {
  let sum = 0;
  for (const k of Object.keys(a)) sum += (a[k] || 0) * (b[k] || 0);
  return sum;
}

function magnitude(vec) {
  return Math.sqrt(Object.values(vec).reduce((s, v) => s + v * v, 0));
}

function cosineSimilarity(a, b) {
  const mag = magnitude(a) * magnitude(b);
  return mag === 0 ? 0 : dotProduct(a, b) / mag;
}

class LedgerRAG {
  /**
   * @param {string} [ledgerPath] - path ao .jsonl do ledger
   */
  constructor(ledgerPath) {
    const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
    this._ledgerPath = ledgerPath ||
      process.env.KAIROS_LEDGER_PATH ||
      path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');

    this._docs    = [];   // { task, output, domain, agent, tfidf }
    this._idf     = {};   // term → IDF score
    this._loaded  = false;
  }

  /**
   * Lê e indexa o ledger. Chama uma vez; cached em memória.
   */
  load() {
    if (this._loaded) return this;

    if (!fs.existsSync(this._ledgerPath)) {
      this._loaded = true;
      return this;
    }

    try {
      const lines = fs.readFileSync(this._ledgerPath, 'utf8')
        .trim().split('\n').filter(Boolean);

      const rawDocs = [];

      for (const line of lines) {
        try {
          const ev = JSON.parse(line);
          // Só indexar TaskCompleted — representa tasks bem-sucedidas
          if (ev.type !== 'TaskCompleted') continue;
          const taskText = ev.payload?.task || '';
          if (!taskText) continue;

          rawDocs.push({
            task:   taskText,
            output: ev.payload?.output || taskText,
            domain: ev.payload?.domain || 'unknown',
            agent:  ev.payload?.agent  || ev.actor || 'unknown',
            cost:   ev.payload?.costUsd || 0,
          });
        } catch (_) {}
      }

      if (rawDocs.length === 0) {
        this._loaded = true;
        return this;
      }

      // Calcular DF (document frequency) por termo
      const df = {};
      const tokenizedDocs = rawDocs.map(d => {
        const tokens = tokenize(d.task + ' ' + d.output);
        for (const t of new Set(tokens)) df[t] = (df[t] || 0) + 1;
        return tokens;
      });

      const N = rawDocs.length;

      // Calcular IDF
      for (const [term, count] of Object.entries(df)) {
        this._idf[term] = Math.log(1 + N / (1 + count));
      }

      // Calcular TF-IDF de cada documento
      for (let i = 0; i < rawDocs.length; i++) {
        const tfScores  = tf(tokenizedDocs[i]);
        const tfidfVec  = {};
        for (const [term, tfScore] of Object.entries(tfScores)) {
          tfidfVec[term] = tfScore * (this._idf[term] || 0);
        }
        this._docs.push({ ...rawDocs[i], tfidf: tfidfVec });
      }

    } catch (_) {
      // Falha silenciosa — RAG não bloqueia execução
    }

    this._loaded = true;
    return this;
  }

  /**
   * Calcula TF-IDF vector de uma query.
   * @param {string} query
   * @returns {object} vector
   */
  tfidf(query) {
    const tokens   = tokenize(query);
    const tfScores = tf(tokens);
    const vec      = {};
    for (const [term, tfScore] of Object.entries(tfScores)) {
      vec[term] = tfScore * (this._idf[term] || 0);
    }
    return vec;
  }

  /**
   * Retorna os K documentos mais similares à query.
   * @param {string} query
   * @param {number} [k=3]
   * @returns {Array<{ task, domain, agent, score }>}
   */
  topK(query, k = 3) {
    this.load();

    if (this._docs.length < 5) return []; // skip se corpus muito pequeno

    const queryVec = this.tfidf(query);
    if (Object.keys(queryVec).length === 0) return [];

    const scored = this._docs.map(doc => ({
      task:   doc.task,
      output: doc.output,
      domain: doc.domain,
      agent:  doc.agent,
      score:  cosineSimilarity(queryVec, doc.tfidf),
    }));

    return scored
      .filter(d => d.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  /**
   * Formata hits para injecção no prompt do agente.
   * @param {Array} hits - resultado de topK()
   * @returns {string}
   */
  formatContext(hits) {
    if (!hits || hits.length === 0) return '';

    const lines = hits.map((h, i) =>
      `${i + 1}. [${h.domain}/${h.agent}] "${h.task.slice(0, 80)}" (similaridade: ${h.score.toFixed(2)})`
    );

    return `CONTEXTO HISTÓRICO — tasks similares resolvidas com sucesso:
${lines.join('\n')}
Usa este histórico como referência, não como regra.`;
  }

  /**
   * Invalida cache (útil após novos eventos no ledger).
   */
  invalidate() {
    this._docs   = [];
    this._idf    = {};
    this._loaded = false;
  }
}

module.exports = { LedgerRAG };
