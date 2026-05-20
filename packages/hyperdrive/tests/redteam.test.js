'use strict';

/**
 * KAIROS HYPERDRIVE — Testes Red Team
 * Verifica que @Rex e @Quinn apanham vulnerabilidades reais.
 * Código vulnerável é proposital — é o ponto dos testes.
 */

const test   = require('node:test');
const assert = require('node:assert/strict');

const { run, format }     = require('../src/redteam/index');
const { scan: rexScan }   = require('../src/redteam/rex-scanner');
const { scan: quinnScan } = require('../src/redteam/quinn-scanner');
const { sign, verify }    = require('../src/redteam/signing');

// ─── @REX — SEGURANÇA ───────────────────────────────────────────────────────

test('@Rex: detecta chave Stripe live hardcoded', () => {
  const code = `const stripe = require('stripe')('sk_live_abcdefghijklmnopqrstuvwx');`;
  const findings = rexScan(code, 'billing.js');
  const critical = findings.filter(f => f.severity === 'critical');
  assert.ok(critical.length > 0, 'Devia detectar chave Stripe live hardcoded');
  assert.ok(critical.some(f => f.label === 'stripe-live-key-hardcoded'));
});

test('@Rex: detecta webhook secret hardcoded', () => {
  const code = `const secret = 'whsec_abcdefghijklmnopqrstuvwxyz12345';`;
  const findings = rexScan(code, 'webhook.js');
  assert.ok(findings.some(f => f.label === 'stripe-webhook-secret-hardcoded'));
  assert.ok(findings.some(f => f.severity === 'critical'));
});

test('@Rex: detecta chave Anthropic hardcoded', () => {
  const code = `const key = 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';`;
  const findings = rexScan(code, 'ai.js');
  assert.ok(findings.some(f => f.label === 'anthropic-key-hardcoded'));
});

test('@Rex: detecta NEXT_PUBLIC_ com secret sensível', () => {
  const code = `const key = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;`;
  const findings = rexScan(code, 'config.ts');
  assert.ok(findings.some(f => f.label === 'server-env-in-client-bundle'));
  assert.ok(findings.some(f => f.severity === 'critical'));
});

test('@Rex: detecta timing attack em comparação de token', () => {
  const code = `if (req.headers.token === adminToken) { allow(); }`;
  const findings = rexScan(code, 'auth.js');
  assert.ok(findings.some(f => f.label === 'token-comparison-timing-attack'));
  assert.ok(findings.some(f => f.severity === 'high'));
});

test('@Rex: detecta possível XSS com innerHTML', () => {
  const code = `element.innerHTML = userInput;`;
  const findings = rexScan(code, 'ui.js');
  assert.ok(findings.some(f => f.label === 'innerhtml-assignment'));
});

test('@Rex: detecta command injection', () => {
  const code = `exec(\`ls \${req.query.path}\`)`;
  const findings = rexScan(code, 'files.js');
  assert.ok(findings.some(f => f.label === 'command-injection'));
  assert.ok(findings.some(f => f.severity === 'critical'));
});

test('@Rex: detecta PII em logs', () => {
  const code = `console.log('User email:', user.email);`;
  const findings = rexScan(code, 'user.js');
  assert.ok(findings.some(f => f.label === 'pii-in-logs'));
});

// ─── @QUINN — EDGE CASES ────────────────────────────────────────────────────

test('@Quinn: detecta race condition em escrita JSON', () => {
  const code = `fs.writeFileSync('./data.json', JSON.stringify(data));`;
  const findings = quinnScan(code, 'storage.js');
  assert.ok(findings.some(f => f.label === 'json-write-race-condition'));
  assert.ok(findings.some(f => f.severity === 'critical'));
});

test('@Quinn: detecta Date.now() em componente SSR', () => {
  const code = `const ts = Date.now();`;
  const findings = quinnScan(code, 'hero.tsx');
  assert.ok(findings.some(f => f.label === 'date-now-in-ssr'));
});

test('@Quinn: detecta Math.random() em SSR', () => {
  const code = `const id = Math.random().toString(36);`;
  const findings = quinnScan(code, 'card.tsx');
  assert.ok(findings.some(f => f.label === 'math-random-in-ssr'));
});

test('@Quinn: detecta localStorage fora de useEffect', () => {
  const code = `const token = localStorage.getItem('token');`;
  const findings = quinnScan(code, 'auth.tsx');
  assert.ok(findings.some(f => f.label === 'localstorage-in-ssr'));
});

test('@Quinn: detecta Resend sem error handling', () => {
  const code = `await resend.emails.send({ to: email, subject: 'Hello' });`;
  const findings = quinnScan(code, 'email.js');
  assert.ok(findings.some(f => f.label === 'resend-no-error-handling'));
});

test('@Quinn: detecta Stripe sem error handling', () => {
  const code = `await stripe.customers.create({ email: user.email });`;
  const findings = quinnScan(code, 'billing.js');
  assert.ok(findings.some(f => f.label === 'stripe-without-error-handling'));
});

test('@Quinn: detecta amount vindo do cliente (price tampering)', () => {
  const code = `const amount = req.body.amount;`;
  const findings = quinnScan(code, 'checkout.js');
  assert.ok(findings.some(f => f.label === 'stripe-checkout-amount-trust'));
});

// ─── RED TEAM COMPLETO ──────────────────────────────────────────────────────

test('Red Team: código vulnerável → passed=false, sem assinatura', () => {
  const vulnerableCode = `
    const key = 'sk_live_xxxxxxxxxxxxxxxxxxxxx';
    fs.writeFileSync('./data.json', JSON.stringify(data));
    element.innerHTML = userInput;
  `;
  const report = run(vulnerableCode, 'vulnerable.js');
  assert.equal(report.passed, false);
  assert.equal(report.signature, null);
  assert.ok(report.critical > 0 || report.high > 0);
});

test('Red Team: código limpo → passed=true, com assinatura @Rex', () => {
  const cleanCode = `
    'use strict';
    // Módulo simples sem vulnerabilidades
    const VERSION = '1.0.0';
    const MAX_LENGTH = 1000;
    function getVersion() { return VERSION; }
    function isValid(s) { return typeof s === 'string' && s.length <= MAX_LENGTH; }
    module.exports = { getVersion, isValid };
  `;
  const report = run(cleanCode, 'clean.js');
  assert.equal(report.passed, true);
  assert.ok(report.signature !== null, 'Código limpo deve ter assinatura @Rex');
});

test('Red Team: assinatura HMAC verificável', () => {
  const cleanCode = `const x = 42; module.exports = { x };`;
  const report    = run(cleanCode, 'simple.js');
  if (report.passed && report.signature) {
    const valid = verify(report, report.signature);
    assert.equal(valid, true);
  }
});

test('Red Team: dry-run com rexOnly', () => {
  const code = `const sk = 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx';`;
  const report = run(code, 'test.js', { rexOnly: true });
  assert.equal(report.coverage, 'rex');
  assert.ok(report.findings.length > 0);
});

test('Red Team: format() retorna string legível', () => {
  const code   = `const x = 42;`;
  const report = run(code, 'x.js');
  const output = format(report);
  assert.ok(typeof output === 'string');
  assert.ok(output.includes('RED TEAM REPORT'));
});

test('Red Team: tempo < 500ms para ficheiro normal', () => {
  const code   = 'const x = 1;\n'.repeat(500);
  const report = run(code, 'perf.js');
  assert.ok(report.durationMs < 500, `Demorou ${report.durationMs}ms`);
});
