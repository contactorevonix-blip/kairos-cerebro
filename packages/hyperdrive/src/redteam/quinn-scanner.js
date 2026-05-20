'use strict';

/**
 * KAIROS HYPERDRIVE — @Quinn Scanner
 * Race conditions, edge cases, Stripe/Resend, Next.js, encoding.
 * Zero dependências.
 *
 * Detecta:
 *   - Promises sem .catch() ou try/catch
 *   - Race conditions em ficheiros JSON (write sem lock)
 *   - Stripe: webhook sem idempotência, sem retry, replay attacks
 *   - Resend: sem error handling em envio de email
 *   - Next.js: Date.now() e Math.random() em SSR (hydration mismatch)
 *   - Encoding: Buffer vs string sem encoding explícito
 *   - Timezone: new Date() sem UTC em código de server
 *   - Rate limiting: endpoints públicos sem throttle
 *   - Input: sem validação de tamanho/tipo
 */

const PATTERNS = [

  // ── PROMISES SEM CATCH ─────────────────────────────────────────────────
  {
    id:       'QA-001',
    severity: 'high',
    label:    'promise-no-catch',
    re:       /\.then\([^)]+\)(?!\s*\.catch)/,
    message:  'Promise com .then() sem .catch() — unhandled rejection em produção',
    fix:      'Adicionar .catch(err => ...) ou converter para async/await com try/catch.',
    category: 'async',
  },
  {
    id:       'QA-002',
    severity: 'high',
    label:    'async-no-try-catch',
    re:       /async\s+function[^{]+\{(?![^}]*try\s*\{)/,
    message:  'Função async sem try/catch — erros não tratados',
    fix:      'Envolver o corpo da função async em try { ... } catch (err) { ... }.',
    category: 'async',
  },
  {
    id:       'QA-003',
    severity: 'medium',
    label:    'floating-promise',
    re:       /^\s+(?:await\s+)?[a-zA-Z]+\.[a-zA-Z]+\([^)]*\)(?!\s*;?\s*\/\/|\s*\.catch|\s*\.then)/,
    message:  'Possível promise flutuante (não awaited e sem .catch)',
    fix:      'Usar await ou adicionar .catch() para garantir que erros são tratados.',
    category: 'async',
  },

  // ── RACE CONDITIONS ────────────────────────────────────────────────────
  {
    id:       'RACE-001',
    severity: 'critical',
    label:    'json-write-race-condition',
    re:       /fs\.writeFileSync\([^)]*\.json/,
    message:  'Escrita directa em ficheiro JSON — race condition com escritas concorrentes',
    fix:      'Usar escrita atómica: writeFileSync(.tmp) → renameSync(). Implementado em Ledger.',
    category: 'race',
  },
  {
    id:       'RACE-002',
    severity: 'high',
    label:    'appendfile-without-lock',
    re:       /fs\.appendFileSync|fs\.appendFile\(/,
    message:  'appendFile pode ter race condition com múltiplos processos',
    fix:      'Para JSONL atómico, usar o padrão do Ledger com flock ou file-level serialization.',
    category: 'race',
  },
  {
    id:       'RACE-003',
    severity: 'high',
    label:    'shared-state-mutation',
    re:       /(?:let|var)\s+\w+\s*=\s*\[\]|(?:let|var)\s+\w+\s*=\s*\{\}/,
    message:  'Estado mutável partilhado fora de request scope — risco de race condition',
    fix:      'Usar const com imutabilidade ou isolar estado por request.',
    category: 'race',
  },

  // ── STRIPE EDGE CASES ──────────────────────────────────────────────────
  {
    id:       'STRIPE-QA-001',
    severity: 'critical',
    label:    'stripe-webhook-replay-attack',
    re:       /constructEvent|stripe-signature/,
    message:  'Verificar se timestamp do webhook é validado (anti-replay)',
    fix:      'stripe.webhooks.constructEvent() valida automaticamente se o evento tem <5min. Não desactivar.',
    category: 'stripe',
    requiresManualReview: true,
  },
  {
    id:       'STRIPE-QA-002',
    severity: 'high',
    label:    'stripe-without-error-handling',
    re:       /stripe\.[a-z]+\.(create|retrieve|update|cancel)\(/,
    message:  'Operação Stripe sem verificação de erro — pode quebrar silenciosamente',
    fix:      'Envolver em try/catch. Stripe pode lançar StripeError, CardError, etc.',
    category: 'stripe',
  },
  {
    id:       'STRIPE-QA-003',
    severity: 'high',
    label:    'stripe-checkout-amount-trust',
    re:       /(?:amount|price).*(?:req\.|body\.|params\.)|(?:req\.|body\.|params\.).*(?:amount|price)/,
    message:  'Possível valor de pagamento vindo do cliente — nunca confiar no amount do client',
    fix:      'Calcular sempre o amount no servidor a partir do price_id. Nunca aceitar amount do body.',
    category: 'stripe',
  },

  // ── RESEND / EMAIL ─────────────────────────────────────────────────────
  {
    id:       'RESEND-001',
    severity: 'high',
    label:    'resend-no-error-handling',
    re:       /resend\.emails\.send\(/,
    message:  'Envio de email Resend sem error handling',
    fix:      'const { error } = await resend.emails.send(...); if (error) { ... }',
    category: 'resend',
  },
  {
    id:       'RESEND-002',
    severity: 'medium',
    label:    'email-without-retry',
    re:       /await.*send(?:Email|email)\(/,
    message:  'Envio de email sem lógica de retry',
    fix:      'Adicionar retry com backoff exponencial para emails críticos (API key, billing).',
    category: 'resend',
  },

  // ── NEXT.JS HYDRATION ──────────────────────────────────────────────────
  {
    id:       'NEXT-001',
    severity: 'high',
    label:    'date-now-in-ssr',
    re:       /Date\.now\(\)|new Date\(\)(?!.*suppressHydrationWarning)/,
    message:  'Date.now()/new Date() em componente — causa hydration mismatch',
    fix:      'Usar suppressHydrationWarning ou mover para useEffect. No servidor, usar timestamps fixos.',
    category: 'nextjs',
  },
  {
    id:       'NEXT-002',
    severity: 'high',
    label:    'math-random-in-ssr',
    re:       /Math\.random\(\)/,
    message:  'Math.random() em componente — valor diferente entre server e client',
    fix:      'Gerar IDs únicos no servidor e passar como prop. Ou usar useId() do React 18.',
    category: 'nextjs',
  },
  {
    id:       'NEXT-003',
    severity: 'medium',
    label:    'localstorage-in-ssr',
    re:       /localStorage\.|sessionStorage\./,
    message:  'localStorage/sessionStorage acedido fora de useEffect — quebra SSR',
    fix:      'Verificar: if (typeof window !== "undefined") ou mover para useEffect.',
    category: 'nextjs',
  },
  {
    id:       'NEXT-004',
    severity: 'medium',
    label:    'window-in-ssr',
    re:       /window\.[a-zA-Z]/,
    message:  'window objeto acedido fora de useEffect — undefined em SSR',
    fix:      'Usar: if (typeof window !== "undefined") { ... } ou mover para useEffect.',
    category: 'nextjs',
  },

  // ── ENCODING / TIMEZONE ────────────────────────────────────────────────
  {
    id:       'ENC-001',
    severity: 'medium',
    label:    'buffer-without-encoding',
    re:       /Buffer\.from\([^,)]+\)(?!\s*\.toString\()/,
    message:  'Buffer.from() sem encoding explícito — comportamento ambíguo',
    fix:      'Especificar encoding: Buffer.from(str, "utf8") ou Buffer.from(data, "hex")',
    category: 'encoding',
  },
  {
    id:       'TZ-001',
    severity: 'medium',
    label:    'new-date-without-utc',
    re:       /new Date\(\s*\)(?!.*[Uu][Tt][Cc])/,
    message:  'new Date() sem UTC — depende do timezone do servidor',
    fix:      'Usar new Date().toISOString() ou Date.UTC(...) para consistência entre deploys.',
    category: 'timezone',
  },

  // ── RATE LIMITING ──────────────────────────────────────────────────────
  {
    id:       'RATE-001',
    severity: 'high',
    label:    'public-endpoint-no-ratelimit',
    re:       /(?:router\.post|app\.post|res\.json)\s*\(\s*['"`]\/api\/(?!admin)/,
    message:  'Endpoint POST público sem evidência de rate limiting',
    fix:      'Adicionar rate limit: verificar KAIROS_PUBLIC_RATE_PER_MIN ou middleware de throttle.',
    category: 'ratelimit',
    requiresManualReview: true,
  },

  // ── INPUT VALIDATION ───────────────────────────────────────────────────
  {
    id:       'INPUT-001',
    severity: 'medium',
    label:    'no-input-length-check',
    re:       /(?:req\.body|body)\.[a-zA-Z]+(?!\s*\.(?:length|slice|substring|trim))/,
    message:  'Input do utilizador sem verificação de tamanho',
    fix:      'Validar length antes de processar: if (!input || input.length > MAX) return 400.',
    category: 'input',
  },
  {
    id:       'INPUT-002',
    severity: 'high',
    label:    'typeof-check-missing',
    re:       /(?:req\.body|params|query)\.[a-zA-Z]+\s*(?:\+|\.toLowerCase\(|\.trim\()/,
    message:  'Operação em input sem verificação de tipo — pode lançar se undefined',
    fix:      "Verificar: typeof input === 'string' && input.length > 0 antes de operar.",
    category: 'input',
  },
];

/**
 * @param {string} code
 * @param {string} [file='']
 * @returns {import('./rex-scanner').Finding[]}
 */
function scan(code, file = '') {
  const lines    = code.split('\n');
  const findings = [];

  for (const pattern of PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.re.test(lines[i])) {
        findings.push({
          id:       pattern.id,
          severity: pattern.severity,
          label:    pattern.label,
          message:  pattern.message,
          fix:      pattern.fix,
          category: pattern.category,
          file,
          line:     i + 1,
          snippet:  lines[i].trim().slice(0, 120),
          requiresManualReview: pattern.requiresManualReview || false,
        });
      }
    }
  }

  return findings;
}

module.exports = { scan, PATTERNS };
