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
               'search', 'index', 'list', 'tree', 'path', 'ficheiro', 'pasta'],
    agents:   ['@Orion', '@Dex'],
    weight:   0.8,
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

  // Domínio dominante
  const topDomain = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'backend';
  const topScore  = scores[topDomain] || 0;
  const total     = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  const confidence = Math.min(topScore / total, 1);

  // Detectar ficheiros sensíveis
  const touchesSensitive = files.some(f =>
    SENSITIVE_FILES.some(s => f.includes(s))
  );

  // Consenso obrigatório se:
  // - domain é auditoria (alwaysCritical)
  // - task tem "critical" explícito
  // - toca ficheiros sensíveis
  // - confidence baixa (< 0.4 — task ambígua)
  const critical =
    DOMAINS[topDomain]?.alwaysCritical === true ||
    lower.includes('critical') ||
    lower.includes('crítico') ||
    touchesSensitive ||
    confidence < 0.4;

  const agents = DOMAINS[topDomain]?.agents || ['@Dex', '@Aria'];

  return {
    domain:     topDomain,
    agents,
    critical,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
    touchesSensitive,
    scores, // debug
  };
}

module.exports = { classify, DOMAINS, SENSITIVE_FILES };
