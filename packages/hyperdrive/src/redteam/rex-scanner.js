'use strict';

/**
 * KAIROS HYPERDRIVE — @Rex Scanner
 * Segurança, GDPR, Stripe security, secrets leak.
 * Zero dependências.
 *
 * Detecta:
 *   - Secrets hardcoded (Stripe keys, KAIROS tokens, API keys)
 *   - Injection: SQL, command, prompt
 *   - XSS: innerHTML, dangerouslySetInnerHTML
 *   - GDPR: PII em logs, endpoints expostos
 *   - Stripe: webhook sem HMAC, missing idempotency
 *   - Auth: endpoints admin sem verificação
 *   - Frontend: env vars sensíveis expostas ao client
 */

// ─── PADRÕES DE SEGURANÇA ───────────────────────────────────────────────────

const PATTERNS = [

  // ── SECRETS HARDCODED ──────────────────────────────────────────────────
  {
    id:       'SEC-001',
    severity: 'critical',
    label:    'stripe-live-key-hardcoded',
    re:       /sk_live_[a-zA-Z0-9]{20,}/,
    message:  'Chave Stripe live hardcoded no código',
    fix:      'Mover para process.env.STRIPE_SECRET_KEY. NUNCA commitar chaves live.',
    category: 'secrets',
  },
  {
    id:       'SEC-002',
    severity: 'critical',
    label:    'stripe-publishable-key-hardcoded',
    re:       /pk_live_[a-zA-Z0-9]{20,}/,
    message:  'Chave pública Stripe live hardcoded',
    fix:      'Usar process.env.STRIPE_PUBLISHABLE_KEY ou NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
    category: 'secrets',
  },
  {
    id:       'SEC-003',
    severity: 'critical',
    label:    'stripe-webhook-secret-hardcoded',
    re:       /whsec_[a-zA-Z0-9]{20,}/,
    message:  'Webhook secret Stripe hardcoded',
    fix:      'Mover para process.env.KAIROS_STRIPE_WEBHOOK_SECRET. Rolar o secret imediatamente.',
    category: 'secrets',
  },
  {
    id:       'SEC-004',
    severity: 'critical',
    label:    'anthropic-key-hardcoded',
    re:       /sk-ant-[a-zA-Z0-9\-]{20,}/,
    message:  'Chave Anthropic API hardcoded',
    fix:      'Mover para process.env.KAIROS_ANTHROPIC_API_KEY. Rolar a chave imediatamente.',
    category: 'secrets',
  },
  {
    id:       'SEC-005',
    severity: 'critical',
    label:    'generic-secret-hardcoded',
    re:       /(?:api[_-]?key|secret|password|token|passphrase)\s*[:=]\s*['"`][a-zA-Z0-9+/=]{16,}['"`]/i,
    message:  'Possível secret hardcoded detectado',
    fix:      'Usar variáveis de ambiente. Verificar se é um secret real.',
    category: 'secrets',
  },
  {
    id:       'SEC-006',
    severity: 'high',
    label:    'kairos-admin-token-hardcoded',
    re:       /KAIROS_ADMIN_TOKEN\s*=\s*['"`][^'"` \n]{8,}['"`]/,
    message:  'KAIROS_ADMIN_TOKEN com valor hardcoded',
    fix:      'Definir apenas em .env (gitignored) e Railway dashboard.',
    category: 'secrets',
  },

  // ── STRIPE SECURITY ────────────────────────────────────────────────────
  {
    id:       'STRIPE-001',
    severity: 'critical',
    label:    'stripe-webhook-no-hmac',
    re:       /stripe\.webhooks\.constructEvent|stripe-signature/,
    message:  'Verificar se HMAC do webhook Stripe está a ser validado',
    fix:      'Garantir: stripe.webhooks.constructEvent(body, sig, process.env.KAIROS_STRIPE_WEBHOOK_SECRET)',
    category: 'stripe',
    requiresManualReview: true,
  },
  {
    id:       'STRIPE-002',
    severity: 'high',
    label:    'stripe-no-idempotency-key',
    re:       /stripe\.[a-z]+\.(create|update)\(/,
    message:  'Operação Stripe sem idempotency key — risco de double-charge',
    fix:      'Adicionar idempotencyKey: crypto.randomUUID() a todas as operações Stripe críticas.',
    category: 'stripe',
  },
  {
    id:       'STRIPE-003',
    severity: 'high',
    label:    'stripe-raw-body-not-preserved',
    re:       /JSON\.parse\(req\.body\)|body.*json\(\)/,
    message:  'Possível parsing do body antes da verificação Stripe — invalida HMAC',
    fix:      'Para webhook Stripe, usar raw body (Buffer). Não parsear antes de constructEvent.',
    category: 'stripe',
  },
  {
    id:       'STRIPE-004',
    severity: 'medium',
    label:    'stripe-test-key-in-production',
    re:       /sk_test_|pk_test_|whsec_test/,
    message:  'Chave de teste Stripe em código (pode estar hardcoded)',
    fix:      'Usar variáveis de ambiente. Não commitar chaves de teste.',
    category: 'stripe',
  },

  // ── INJECTION ──────────────────────────────────────────────────────────
  {
    id:       'INJ-001',
    severity: 'critical',
    label:    'prompt-injection-risk',
    re:       /`[^`]*\$\{[^}]*(?:req\.|body\.|params\.|query\.)[^}]*\}[^`]*`/,
    message:  'Possível prompt injection — input do utilizador interpolado num template literal',
    fix:      'Sanitizar e validar input antes de interpolar em prompts ou queries.',
    category: 'injection',
  },
  {
    id:       'INJ-002',
    severity: 'critical',
    label:    'command-injection',
    re:       /exec\s*\(\s*[`'"].*\$\{|execSync\s*\(\s*[`'"].*\$\{/,
    message:  'Possível command injection — input interpolado em exec/execSync',
    fix:      'Usar execFile com args como array. Nunca interpolar input em strings de comando.',
    category: 'injection',
  },
  {
    id:       'INJ-003',
    severity: 'high',
    label:    'path-traversal',
    re:       /path\.join\([^)]*(?:req\.|body\.|params\.|query\.)[^)]*\)/,
    message:  'Possível path traversal — input do utilizador em path.join',
    fix:      'Validar e sanitizar paths. Usar path.resolve e verificar que fica dentro do directório esperado.',
    category: 'injection',
  },

  // ── XSS ───────────────────────────────────────────────────────────────
  {
    id:       'XSS-001',
    severity: 'high',
    label:    'innerhtml-assignment',
    re:       /\.innerHTML\s*=\s*(?!['"`]<)/,
    message:  'innerHTML com valor dinâmico — risco de XSS',
    fix:      'Usar textContent para texto puro. Se HTML é necessário, usar DOMPurify.sanitize().',
    category: 'xss',
  },
  {
    id:       'XSS-002',
    severity: 'high',
    label:    'dangerous-set-inner-html',
    re:       /dangerouslySetInnerHTML=\{\{__html:\s*(?!['"`])/,
    message:  'dangerouslySetInnerHTML com valor potencialmente não sanitizado',
    fix:      'Sanitizar sempre com DOMPurify antes de usar dangerouslySetInnerHTML.',
    category: 'xss',
  },

  // ── GDPR / PII ─────────────────────────────────────────────────────────
  {
    id:       'GDPR-001',
    severity: 'high',
    label:    'pii-in-logs',
    re:       /console\.(log|error|warn)\([^)]*(?:email|password|name|phone|iban|cpf|nif|birth)/i,
    message:  'Possível PII em logs — GDPR Art. 5(1)(f)',
    fix:      'Não logar dados pessoais. Usar IDs anónimos em logs.',
    category: 'gdpr',
  },
  {
    id:       'GDPR-002',
    severity: 'medium',
    label:    'missing-data-minimization',
    re:       /SELECT\s+\*\s+FROM|find\(\{\}\)/i,
    message:  'Query sem projecção — pode retornar mais dados pessoais do que necessário',
    fix:      'Especificar apenas os campos necessários. GDPR Art. 5(1)(c) — minimização.',
    category: 'gdpr',
  },

  // ── AUTH / ADMIN ────────────────────────────────────────────────────────
  {
    id:       'AUTH-001',
    severity: 'critical',
    label:    'admin-endpoint-no-auth',
    re:       /(?:\/api\/admin|\/dashboard)\b(?!.*(?:checkAdminAuth|adminAuth|Bearer|ADMIN_TOKEN))/,
    message:  'Possível endpoint admin sem verificação de autenticação',
    fix:      'Garantir que todos os endpoints /api/admin/* verificam KAIROS_ADMIN_TOKEN via Bearer.',
    category: 'auth',
    requiresManualReview: true,
  },
  {
    id:       'AUTH-002',
    severity: 'high',
    label:    'token-comparison-timing-attack',
    re:       /===\s*(?:token|key|secret|password)|(?:token|key|secret|password)\s*===/,
    message:  'Comparação de token com === — vulnerável a timing attack',
    fix:      'Usar crypto.timingSafeEqual() para comparação de tokens/secrets.',
    category: 'auth',
  },

  // ── FRONTEND — ENV VARS ─────────────────────────────────────────────────
  {
    id:       'ENV-001',
    severity: 'critical',
    label:    'server-env-in-client-bundle',
    re:       /NEXT_PUBLIC_(?:STRIPE_SECRET|KAIROS_ADMIN|ANTHROPIC|KAIROS_MASTER|WEBHOOK_SECRET)/,
    message:  'Variável de ambiente sensível exposta ao cliente via NEXT_PUBLIC_',
    fix:      'NEXT_PUBLIC_* são visíveis no browser. Nunca prefixar secrets com NEXT_PUBLIC_.',
    category: 'frontend',
  },
  {
    id:       'ENV-002',
    severity: 'high',
    label:    'process-env-in-client-component',
    re:       /process\.env\.[A-Z_]+(?!.*['"]use client['"])/,
    message:  'process.env em possível Client Component — só funciona em Server Components',
    fix:      'Verificar se este ficheiro tem "use client". process.env funciona só no servidor.',
    category: 'frontend',
  },
];

// ─── SCANNER ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Finding
 * @property {string} id
 * @property {'critical'|'high'|'medium'|'low'} severity
 * @property {string} label
 * @property {string} message
 * @property {string} fix
 * @property {string} category
 * @property {number} line
 * @property {string} snippet
 */

/**
 * @param {string} code        - Código a analisar
 * @param {string} [file='']  - Nome do ficheiro (para contexto)
 * @returns {Finding[]}
 */
function scan(code, file = '') {
  const lines    = code.split('\n');
  const findings = [];

  for (const pattern of PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.re.test(line)) {
        findings.push({
          id:       pattern.id,
          severity: pattern.severity,
          label:    pattern.label,
          message:  pattern.message,
          fix:      pattern.fix,
          category: pattern.category,
          file,
          line:     i + 1,
          snippet:  line.trim().slice(0, 120),
          requiresManualReview: pattern.requiresManualReview || false,
        });
      }
    }
  }

  return findings;
}

module.exports = { scan, PATTERNS };
