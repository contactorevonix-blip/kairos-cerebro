'use strict';

/**
 * KAIROS HYPERDRIVE — Router Semântico v2.0
 * Classifica tasks por domínio e retorna o agente real do sistema KAIROS.
 * Baseado nos 11 agent files reais em .claude/agents/*.md
 *
 * Domínios e agentes primários:
 *   navegacao    → @Orion
 *   backend      → @Dex
 *   check-engine → @Dex
 *   frontend     → @Dex (com spec de @Uma)
 *   infra        → @Gage
 *   qa           → @Quinn
 *   seguranca    → @Rex
 *   arquitectura → @Aria
 *   design       → @Uma
 *   crescimento  → @Morgan
 *   analytics    → @Oracle
 *   estrategia   → @Sage
 *   vendas       → @Hermes
 *
 * @typedef {'navegacao'|'backend'|'check-engine'|'frontend'|'infra'|'qa'|
 *           'seguranca'|'arquitectura'|'design'|'crescimento'|
 *           'analytics'|'estrategia'|'vendas'} Domain
 *
 * @typedef {Object} RouterResult
 * @property {Domain} domain
 * @property {string[]} agents        - Agentes ordenados por relevância
 * @property {boolean} critical       - Requer consenso sénior
 * @property {number} confidence      - 0..1 confiança na classificação
 * @property {string[]} reasons       - Razões da classificação
 * @property {boolean} shortTaskBoost - true se boost foi aplicado (< 8 palavras)
 * @property {boolean} longTaskWarn   - true se aviso de task longa (> 20 palavras)
 */

const DOMAINS = {
  navegacao: {
    keywords: [
      'listar', 'lista os ficheiros', 'lista ficheiros', 'estrutura',
      'repo', 'pasta', 'encontrar', 'limpar', 'organizar', 'vistoria',
      'verificar repo', 'actualizar daily brief', 'clean-state',
      'guardian', 'orion', 'ficheiro', 'directory', 'folder', 'tree',
      'screenshot', 'captura', 'inventário', 'inventory', 'extrair',
      'extraction', 'auditoria', 'audit', 'verificar', 'verificação',
      'inspecionar', 'reportar', 'relatório', 'report', 'pré-deploy',
      'pre-deploy', 'correr testes', 'confirmar', 'run tests',
      'packages/', 'src/', '.ts', '.js', '.md',
    ],
    agents:  ['@Orion', '@Aria', '@Quinn'],
    weight:  1.6,
  },

  backend: {
    keywords: [
      'implementar', 'código', 'bug', 'fix', 'endpoint', 'node.js',
      'api route', 'server', 'função', 'módulo', 'refactor',
      'sniper-api', 'server.js', 'webhook', 'stripe', 'billing',
      'token', 'tenant', 'osint', 'scoring', 'camada', 'layer',
      'engine', 'sniper', 'vault', 'middleware', 'handler',
    ],
    agents:  ['@Dex', '@Aria', '@Quinn', '@Rex'],
    weight:  1.4,
  },

  'check-engine': {
    keywords: [
      'check-engine', 'fraud detection', 'check', 'fraude', 'score',
      'cpf', 'cnpj', 'email check', 'rules engine', 'signal',
      'ip check', 'disposable', 'tor', 'vpn', 'breach', 'hibp',
      'cep validator', 'mx validator', 'phone carrier',
    ],
    agents:  ['@Dex', '@Rex', '@Quinn'],
    weight:  1.4,
  },

  frontend: {
    keywords: [
      'next.js', 'nextjs', 'react', 'componente', 'página', 'tsx',
      'packages/web', 'landing', 'dashboard web', 'ui component',
      'tailwind', 'shadcn', 'framer', 'gsap', 'animation',
      'layout', 'responsive', 'mobile',
    ],
    agents:  ['@Dex', '@Uma', '@Quinn', '@Aria'],
    weight:  1.3,
  },

  infra: {
    keywords: [
      'deploy', 'push', 'vercel', 'railway', 'produção', 'rollback',
      'variáveis de ambiente', 'dockerfile', 'port', 'ssl', 'https',
      'domain', 'dns', 'cloudflare', 'ci/cd', 'github actions',
      'pipeline', 'release', 'nginx', 'server', 'cloud',
    ],
    agents:  ['@Gage', '@Aria', '@Rex', '@Dex'],
    weight:  1.5,
  },

  qa: {
    keywords: [
      'validar código', 'testar feature', 'review', 'go bloqueado',
      'verificar qualidade', 'npm test', 'quality gate', 'lighthouse',
      'playwright', 'wcag', 'acessibilidade', 'performance score',
      'test coverage', 'auditoria de código',
    ],
    agents:  ['@Quinn', '@Dex', '@Rex'],
    weight:  1.4,
    alwaysCritical: false, // QA é de domínio único claro — sem consenso
  },

  seguranca: {
    keywords: [
      'segurança', 'gdpr', 'compliance', 'stripe webhook', 'vault',
      'encryption', 'dados pessoais', 'auth', 'token', 'lgpd',
      'security', 'vulnerability', 'injection', 'xss', 'csrf',
      'secret', 'leak', 'pentest', 'threat', 'pii', 'privacy',
      'permission', 'aes', 'hash', 'salt',
    ],
    agents:  ['@Rex', '@Quinn', '@Aria', '@Dex'],
    weight:  2.0,
    alwaysCritical: true, // segurança é sempre crítica
  },

  arquitectura: {
    keywords: [
      'arquitectura', 'adr', 'decisão técnica', 'framework', 'estrutura',
      'tecnologia', 'design pattern', 'dependência', 'package',
      'integração', 'trade-off', 'monolito', 'microservice',
      'database schema', 'api design',
    ],
    agents:  ['@Aria', '@Dex', '@Rex'],
    weight:  1.4,
  },

  design: {
    keywords: [
      'design', 'ui spec', 'ux', 'visual', 'componente visual',
      'spec design', 'spec visual', 'cores', 'tipografia', 'animação', 'framer',
      'figma', 'mockup', 'wireframe', 'branding', 'palette',
      'oklch', 'token design', 'spacing', 'border radius', 'shadow',
    ],
    agents:  ['@Uma', '@Dex', '@Quinn'],
    weight:  1.3,
  },

  crescimento: {
    keywords: [
      'copy', 'seo', 'marketing', 'landing copy', 'email marketing',
      'product hunt', 'indie hackers', 'conversão', 'distribuição',
      'newsletter', 'twitter', 'social', 'content', 'blog',
      'funil', 'onboarding copy', 'cta', 'headline',
    ],
    agents:  ['@Morgan', '@Hermes', '@Sage'],
    weight:  1.1,
  },

  analytics: {
    keywords: [
      'métricas', 'mrr', 'runway', 'company score', 'weekly report',
      'números', 'analytics', 'forecast', 'kpi', 'benchmark',
      'revenue', 'churn', 'arr', 'nrr', 'ltv', 'cac',
      'unit economics', 'burn rate', 'cohort',
    ],
    agents:  ['@Oracle', '@Sage', '@Aria'],
    weight:  1.2,
  },

  estrategia: {
    keywords: [
      'estratégia', 'pricing', 'competidores', 'modelo de negócio',
      'go-to-market', 'mercado', 'posicionamento', 'roadmap',
      'decisão de produto', 'feature flag', 'milestone',
      'moat', '7 powers', 'switching cost', 'network effect',
    ],
    agents:  ['@Sage', '@Oracle', '@Aria'],
    weight:  1.3,
  },

  vendas: {
    keywords: [
      'vendas', 'outreach', 'lead', 'cliente', 'proposta', 'pipeline',
      'follow-up', 'primeiro cliente', 'receita', 'b2b',
      'cold email', 'deal', 'closing', 'demo', 'trial',
    ],
    agents:  ['@Hermes', '@Morgan', '@Sage'],
    weight:  1.1,
  },
};

// Ficheiros sensíveis — trigger crítico obrigatório
const SENSITIVE_FILES = [
  'Dockerfile', 'railway.toml', 'vercel.json', 'next.config',
  'package.json', 'bin/kairos.js', 'server.js',
  '.claude/rules/', '.env', 'packages/billing/', 'packages/vault/',
  'ADR-', 'stripe', 'webhook',
];

// Keywords decisivas: quando presentes, este domínio ganha sempre (override total)
const DECISIVE_KEYWORDS = [
  { pattern: /\bdeploy\b|\bfazer deploy\b|\brollback\b/i,   domain: 'infra' },
  { pattern: /\bsegurança\b|\bgdpr\b|\blgpd\b|\bvault\b/i,   domain: 'seguranca' },
  { pattern: /^copy\b|^copy para|^copy de|copy da landing/i, domain: 'crescimento' },
  { pattern: /spec visual|spec de design|spec para .*(design|ui|ux)/i, domain: 'design' },
];

// Palavras de auditoria/verificação — infra perde peso
const AUDIT_OVERRIDE = [
  'verificar', 'verificação', 'auditoria', 'audit',
  'listar', 'reportar', 'relatório', 'report', 'inspecionar', 'confirmar',
  'correr testes', 'run tests', 'o que está', 'pré-deploy', 'pre-deploy',
];

// Short task: < 8 palavras → +0.15 boost
const SHORT_TASK_WORDS = 8;
const SHORT_TASK_BOOST = 0.15;

// Long task: > 20 palavras → aviso
const LONG_TASK_WORDS = 20;

// Consenso: só quando confidence < 0.20 OU segurança obrigatória
const CONSENSUS_CONFIDENCE_THRESHOLD = 0.20;

// Rotação de agentes de navegação
let _navIndex = 0;
const NAV_ROTATION = ['@Orion', '@Aria', '@Quinn'];
function nextNavAgent() {
  const a = NAV_ROTATION[_navIndex % NAV_ROTATION.length];
  _navIndex++;
  return a;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Classifica uma task e retorna domain + agente primário.
 * @param {string} task
 * @param {string[]} [files=[]]
 * @returns {RouterResult}
 */
function classify(task, files = []) {
  const lower   = task.toLowerCase();
  const scores  = {};
  const reasons = [];

  // Score por domínio
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

  // Override: palavras de auditoria reduzem infra dramaticamente
  if (AUDIT_OVERRIDE.some(kw => lower.includes(kw))) {
    if (scores['infra']) scores['infra'] *= 0.3;
  }

  // Keyword decisiva: override total do domínio
  for (const { pattern, domain } of DECISIVE_KEYWORDS) {
    if (pattern.test(lower)) {
      reasons.push(`decisive-keyword → ${domain}`);
      const overrideDomain   = domain;
      const overrideAgents   = DOMAINS[overrideDomain]?.agents || ['@Dex'];
      const overrideConf     = 0.90;
      return {
        domain:         overrideDomain,
        agents:         overrideAgents,
        critical:       DOMAINS[overrideDomain]?.alwaysCritical === true,
        confidence:     overrideConf,
        reasons,
        touchesSensitive: files.some(f => SENSITIVE_FILES.some(s => f.includes(s))),
        shortTaskBoost: false,
        longTaskWarn:   false,
        wordCount:      countWords(task),
        scores,
      };
    }
  }

  // Domínio dominante
  const topDomain = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'backend';
  const topScore  = scores[topDomain] || 0;
  const total     = Object.values(scores).reduce((s, v) => s + v, 0) || 1;

  // Confidence base: 1 domínio claro → 0.90, 2 → 0.75, 3+ → 0.55
  const domainCount = Object.keys(scores).length;
  let confidence;
  if (domainCount === 0) {
    confidence = 0.40; // ambíguo
  } else if (domainCount === 1) {
    confidence = 0.90; // domínio único claro
  } else if (domainCount === 2) {
    confidence = 0.75;
  } else {
    confidence = Math.max(0.40, Math.min(0.55, topScore / total));
  }

  // Short task boost
  const wordCount      = countWords(task);
  const shortTaskBoost = wordCount < SHORT_TASK_WORDS;
  if (shortTaskBoost) {
    confidence = Math.min(0.95, confidence + SHORT_TASK_BOOST);
    reasons.push(`short-task-boost: +${SHORT_TASK_BOOST} (${wordCount} palavras)`);
  }

  // Long task warning
  const longTaskWarn = wordCount > LONG_TASK_WORDS;
  if (longTaskWarn) {
    console.log(`  ⚠️  Task longa (${wordCount} palavras > ${LONG_TASK_WORDS}) — considera dividir em sub-tasks.`);
    reasons.push(`long-task-warning: ${wordCount} palavras`);
  }

  confidence = Math.round(confidence * 100) / 100;

  // Ficheiros sensíveis
  const touchesSensitive = files.some(f =>
    SENSITIVE_FILES.some(s => f.includes(s))
  );

  // Consenso: só quando muito ambíguo OU segurança obrigatória
  const domainAlwaysCritical = DOMAINS[topDomain]?.alwaysCritical === true;
  const isBillingGDPR        = lower.includes('billing') && (lower.includes('dados pessoais') || lower.includes('gdpr'));
  const critical =
    domainAlwaysCritical ||
    isBillingGDPR ||
    touchesSensitive ||
    confidence < CONSENSUS_CONFIDENCE_THRESHOLD;

  // Navegação: rotação cíclica de agentes
  let agents = DOMAINS[topDomain]?.agents || ['@Dex', '@Aria'];
  if (topDomain === 'navegacao') {
    const primary = nextNavAgent();
    agents = [primary, ...NAV_ROTATION.filter(a => a !== primary)];
  }

  return {
    domain:     topDomain,
    agents,
    critical,
    confidence,
    reasons,
    touchesSensitive,
    shortTaskBoost,
    longTaskWarn,
    wordCount,
    scores, // debug
  };
}

module.exports = { classify, DOMAINS, SENSITIVE_FILES };
