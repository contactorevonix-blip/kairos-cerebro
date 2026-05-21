'use strict';

/**
 * KAIROS HYPERDRIVE — Router Semântico
 * Classifica tasks por domínio e retorna ranking de agentes.
 * Heurísticas + keywords. Zero ML. Zero dependências.
 *
 * @typedef {'infra'|'backend'|'frontend'|'auditoria'|'refactor'|'docs'|'navegacao'|'estrategia'|'crescimento'|'vendas'} Domain
 *
 * @typedef {Object} RouterResult
 * @property {Domain} domain
 * @property {string[]} agents    - Agentes ordenados por relevância
 * @property {boolean} critical   - Requer consenso sénior
 * @property {number} confidence  - 0..1 confiança na classificação
 * @property {string[]} reasons   - Razões da classificação
 * @property {boolean} shortTaskBoost - true se boost de +0.20 foi aplicado (< 8 palavras)
 */

// ─── DOMÍNIOS E KEYWORDS ────────────────────────────────────────────────────

const DOMAINS = {
  infra: {
    keywords: ['dockerfile', 'railway', 'vercel', 'deploy', '.env', 'env var', 'nginx',
               'cloud', 'server', 'infra', 'ci/cd', 'github actions', 'pipeline',
               'port', 'ssl', 'https', 'domain', 'dns', 'cloudflare'],
    agents:   ['@Gage', '@Aria', '@Rex', '@Dex'],
    weight:   1.5,
  },
  backend: {
    keywords: ['sniper-api', 'server.js', 'endpoint', 'api', 'route', 'node.js',
               'webhook', 'stripe', 'billing', 'token', 'tenant', 'osint',
               'scoring', 'camada', 'layer', 'engine', 'sniper', 'vault', 'audit'],
    agents:   ['@Dex', '@Aria', '@Quinn', '@Rex'],
    weight:   1.3,
  },
  frontend: {
    keywords: ['next.js', 'nextjs', 'react', 'component', 'ui', 'css', 'tailwind',
               'shadcn', 'framer', 'gsap', 'animation', 'layout', 'page', 'hero',
               'landing', 'design', 'responsive', 'mobile', 'packages/web', 'tsx'],
    agents:   ['@Dex', '@Uma', '@Quinn', '@Aria'],
    weight:   1.2,
  },
  auditoria: {
    keywords: ['security', 'segurança', 'gdpr', 'vulnerability', 'audit', 'compliance',
               'injection', 'xss', 'csrf', 'secret', 'leak', 'pentest', 'threat',
               'pii', 'privacy', 'lgpd', 'encryption', 'auth', 'permission'],
    agents:   ['@Rex', '@Quinn', '@Aria', '@Dex'],
    weight:   2.0, // sempre crítico
    alwaysCritical: true,
  },
  refactor: {
    keywords: ['refactor', 'rename', 'clean', 'deprecated', 'remove', 'delete',
               'migrate', 'rewrite', 'reorganize', 'consolidate', 'simplify'],
    agents:   ['@Dex', '@Aria', '@Quinn'],
    weight:   1.1,
  },
  docs: {
    keywords: ['doc', 'readme', 'adr', 'comment', 'jsdoc', 'documentation',
               'spec', 'plan', 'brief', 'changelog', 'guide', 'tutorial'],
    agents:   ['@Orion', '@Aria', '@Morgan'],
    weight:   0.9,
  },
  navegacao: {
    keywords: ['file', 'folder', 'directory', 'repo', 'structure', 'find',
               'search', 'index', 'list', 'tree', 'path', 'ficheiro', 'pasta',
               'screenshot', 'browser_screenshot', 'browser_get_page', 'captura',
               'track a', 'track b', 'extrair', 'extraction', 'inventory',
               'auditoria', 'audit', 'verificar', 'verificação', 'inspecionar',
               'reportar', 'relatório', 'report', 'hardcoded', 'stubs', 'pré-deploy',
               'pre-deploy', 'correr testes', 'run tests', 'confirmar'],
    agents:   ['@Orion', '@Aria', '@Quinn'],
    weight:   1.5,
  },
  estrategia: {
    keywords: ['business', 'negócio', 'pricing', 'market', 'revenue', 'unit economics',
               'moat', 'competitor', 'adr', 'decision', 'architecture', 'strategy',
               'roadmap', 'milestone', 'product', 'feature', 'priorit'],
    agents:   ['@Sage', '@Oracle', '@Aria'],
    weight:   1.4,
  },
  crescimento: {
    keywords: ['seo', 'copy', 'marketing', 'growth', 'content', 'blog', 'social',
               'indie hackers', 'product hunt', 'twitter', 'newsletter', 'onboarding',
               'conversion', 'funil', 'landing page copy', 'email'],
    agents:   ['@Morgan', '@Hermes', '@Sage'],
    weight:   1.0,
  },
  vendas: {
    keywords: ['outreach', 'sales', 'b2b', 'client', 'lead', 'deal', 'pipeline',
               'proposal', 'cold', 'follow-up', 'closing', 'revenue', 'cliente'],
    agents:   ['@Hermes', '@Morgan', '@Sage'],
    weight:   1.1,
  },
};

// ─── FICHEIROS SENSÍVEIS (trigger consenso obrigatório) ─────────────────────

const SENSITIVE_FILES = [
  'Dockerfile', 'railway.toml', 'vercel.json', 'next.config',
  'package.json', 'bin/kairos.js', 'server.js',
  '.claude/rules/', '.env', 'packages/billing/', 'packages/vault/',
  'ADR-', 'stripe', 'webhook',
];

// ─── SHORT TASK BOOST ────────────────────────────────────────────────────────
// Tasks curtas (< 8 palavras) recebem confidence boost de +0.20.
// Razão: tasks muito curtas são normalmente comandos directos e não ambíguos
// (ex: "deploy", "correr testes", "fix stripe") — mereciam confiança alta mas
// a contagem de keywords é baixa. O boost compensa essa distorção.

const SHORT_TASK_WORD_THRESHOLD = 8;
const SHORT_TASK_CONFIDENCE_BOOST = 0.20;

/**
 * Conta palavras reais numa string (ignora pontuação e espaços extra).
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────

/**
 * Classifica uma task e retorna o domain + agentes recomendados.
 * @param {string} task           - Descrição da tarefa
 * @param {string[]} [files=[]]   - Ficheiros envolvidos (para detectar sensíveis)
 * @returns {RouterResult}
 */
function classify(task, files = []) {
  const lower   = task.toLowerCase();
  const scores  = {};
  const reasons = [];

  // Score por domain
  for (const [domain, cfg] of Object.entries(DOMAINS)) {
    let score = 0;
    const matched = [];
    for (const kw of cfg.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += cfg.weight;
        matched.push(kw);
      }
    }
    if (score > 0) {
      scores[domain] = score;
      reasons.push(`${domain}: [${matched.join(', ')}]`);
    }
  }

  // Se a task tem palavras de auditoria/verificação, infra perde peso —
  // "verificar o Railway" é navegacao, não deploy de infra.
  const AUDIT_OVERRIDE = ['verificar', 'verificação', 'auditoria', 'audit',
    'listar', 'reportar', 'relatório', 'report', 'inspecionar', 'confirmar',
    'correr testes', 'run tests', 'o que está', 'pré-deploy', 'pre-deploy'];
  if (AUDIT_OVERRIDE.some(kw => lower.includes(kw))) {
    if (scores['infra']) scores['infra'] *= 0.3;  // reduzir peso de infra drasticamente
  }

  // Domínio dominante
  const topDomain = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'backend';
  const topScore  = scores[topDomain] || 0;
  const total     = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  let   confidence = Math.min(topScore / total, 1);

  // ─── SHORT TASK BOOST ───────────────────────────────────────────────────
  // Tasks com menos de 8 palavras recebem +0.20 de confidence.
  // Aplica-se ANTES do cap em 1.0 (o cap já existe no Math.min abaixo).
  const wordCount    = countWords(task);
  const shortTaskBoost = wordCount < SHORT_TASK_WORD_THRESHOLD;

  if (shortTaskBoost) {
    confidence = Math.min(confidence + SHORT_TASK_CONFIDENCE_BOOST, 1);
    reasons.push(
      `short-task-boost: +${SHORT_TASK_CONFIDENCE_BOOST} (${wordCount} palavras < ${SHORT_TASK_WORD_THRESHOLD})`
    );
  }

  // Arredondar para 2 casas decimais
  confidence = Math.round(confidence * 100) / 100;

  // Detectar ficheiros sensíveis
  const touchesSensitive = files.some(f =>
    SENSITIVE_FILES.some(s => f.includes(s))
  );

  // Consenso obrigatório se:
  // - domain é auditoria (alwaysCritical)
  // - task tem "critical" explícito
  // - toca ficheiros sensíveis
  // - confidence baixa (< 0.4 — task ambígua)
  const minConfidence = process.env.KAIROS_MIN_CONFIDENCE
    ? Number(process.env.KAIROS_MIN_CONFIDENCE)
    : 0.4;

  const critical =
    DOMAINS[topDomain]?.alwaysCritical === true ||
    lower.includes('critical') ||
    lower.includes('crítico') ||
    touchesSensitive ||
    confidence < minConfidence;

  const agents = DOMAINS[topDomain]?.agents || ['@Dex', '@Aria'];

  return {
    domain:     topDomain,
    agents,
    critical,
    confidence,
    reasons,
    touchesSensitive,
    shortTaskBoost,
    wordCount,
    scores, // debug
  };
}

module.exports = { classify, DOMAINS, SENSITIVE_FILES, SHORT_TASK_WORD_THRESHOLD, SHORT_TASK_CONFIDENCE_BOOST };
