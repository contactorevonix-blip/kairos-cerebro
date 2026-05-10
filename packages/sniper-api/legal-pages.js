'use strict';

const FONT_LINK = `<link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600&family=jetbrains-mono:400" rel="stylesheet">`;

const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
  :root {
    --bg: #0a0a0a; --surface: #111111; --surface-2: #1a1a1a;
    --border: #1f1f1f; --border-strong: #2a2a2a;
    --text: #f5f5f5; --text-secondary: #a3a3a3; --text-tertiary: #737373;
    --accent: #00d97e;
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
    --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem;
  }
  html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  body { min-height: 100vh; }
  a.skip-nav { position: absolute; top: -100%; left: 1rem; background: var(--accent); color: #000; padding: 0.5rem 1rem; border-radius: 4px; font-size: var(--text-sm); font-weight: 600; text-decoration: none; z-index: 100; }
  a.skip-nav:focus { top: 1rem; }
  nav.top { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border); background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); }
  .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-size: var(--text-base); font-weight: 600; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 1.5rem; }
  .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: var(--text-sm); }
  .nav-links a:hover { color: var(--text); }
  main { max-width: 740px; margin: 0 auto; padding: 4rem 1.5rem 6rem; }
  h1 { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
  .meta { font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 3rem; }
  h2 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin: 2.5rem 0 1rem; }
  h3 { font-size: var(--text-lg); font-weight: 600; margin: 2rem 0 0.75rem; }
  p { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.75; margin-bottom: 1rem; }
  ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  li { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.75; margin-bottom: 0.25rem; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  strong { color: var(--text); font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: var(--text-sm); }
  th { text-align: left; padding: 0.625rem 1rem; border-bottom: 1px solid var(--border-strong); color: var(--text-tertiary); font-weight: 500; }
  td { padding: 0.625rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
  tr:last-child td { border-bottom: none; }
  footer { border-top: 1px solid var(--border); padding: 2rem 1.5rem; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .footer-brand { font-size: var(--text-sm); color: var(--text-tertiary); }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { font-size: var(--text-sm); color: var(--text-tertiary); text-decoration: none; }
  .footer-links a:hover { color: var(--text-secondary); }
`;

function navFooter(year) {
  return `
  <nav class="top" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Kairos<span>Check</span></a>
      <div class="nav-links">
        <a href="/docs">Docs</a>
        <a href="/pricing">Pricing</a>
      </div>
    </div>
  </nav>
  <footer>
    <p class="footer-brand">&copy; ${year} Kairos Check</p>
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>`;
}

function renderPrivacy() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  const year = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Kairos Check</title>
  <meta name="description" content="Kairos Check Privacy Policy. How we collect, use, and protect your data. GDPR-compliant, EU-hosted.">
  <link rel="canonical" href="${base}/privacy">
  ${FONT_LINK}
  <style>${BASE_CSS}</style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to content</a>
  ${navFooter(year)}
  <main id="main-content">
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: ${today} &middot; Controller: Kairos Check &middot; Contact: <a href="mailto:privacy@kairoscheck.net">privacy@kairoscheck.net</a></p>

    <h2>1. Who we are</h2>
    <p>Kairos Check operates at <strong>kairoscheck.net</strong> and provides a fraud detection API service. When this policy refers to "we", "us", or "our", it means Kairos Check. When it refers to "you", it means any user of our website or API.</p>

    <h2>2. What data we collect</h2>
    <h3>2.1 API usage data</h3>
    <p>When you use the <code>/api/check</code> endpoint, we process the value you submit (domain, email, phone, or IBAN) to score it for fraud risk. We do not store the raw submitted value in our audit trail — it is pseudonymized on ingestion using a salted one-way hash. We store: the request type, the fraud score, the verdict, and a timestamp.</p>

    <h3>2.2 Account and billing data</h3>
    <p>When you subscribe to a paid plan, Stripe collects your email address, card details, and billing address. We receive from Stripe: your email address, your Stripe customer ID, and your subscription status. We do not receive or store your card number or billing address.</p>

    <h3>2.3 API key data</h3>
    <p>We store a SHA-256 hash of your API key (never the key itself), your Stripe customer and subscription IDs, your tier, your quota, and your subscription status.</p>

    <h3>2.4 Technical logs</h3>
    <p>Our server logs contain: HTTP method, URL path (without query parameters containing personal data), response status code, and response time. Logs are retained for 30 days and then automatically deleted.</p>

    <h3>2.5 Cookies</h3>
    <p>We use no tracking cookies. We use no analytics. The only session-state on our site is a short-lived browser memory reference used to display your API key once on the <code>/success</code> page — this is never written to a cookie or localStorage.</p>

    <h2>3. Lawful basis for processing</h2>
    <table>
      <thead><tr><th>Processing activity</th><th>Lawful basis</th></tr></thead>
      <tbody>
        <tr><td>Providing the API service</td><td>Contract (GDPR Art. 6(1)(b))</td></tr>
        <tr><td>Billing and invoicing</td><td>Contract + Legal obligation (Art. 6(1)(b) and (c))</td></tr>
        <tr><td>Fraud detection on submitted entities</td><td>Legitimate interest (Art. 6(1)(f)) — improving the accuracy of our scoring model</td></tr>
        <tr><td>Security logs</td><td>Legitimate interest (Art. 6(1)(f)) — protecting service integrity</td></tr>
      </tbody>
    </table>

    <h2>4. Retention periods</h2>
    <table>
      <thead><tr><th>Data type</th><th>Retention</th></tr></thead>
      <tbody>
        <tr><td>API audit records (pseudonymized)</td><td>12 months from creation</td></tr>
        <tr><td>Billing records</td><td>7 years (legal obligation, Portuguese tax law)</td></tr>
        <tr><td>Server logs</td><td>30 days</td></tr>
        <tr><td>API key hash</td><td>Duration of subscription + 30 days after cancellation</td></tr>
      </tbody>
    </table>

    <h2>5. Your rights under GDPR</h2>
    <p>If you are in the European Economic Area, you have the following rights:</p>
    <ul>
      <li><strong>Access (Art. 15):</strong> Request a copy of all personal data we hold about you.</li>
      <li><strong>Rectification (Art. 16):</strong> Ask us to correct inaccurate data.</li>
      <li><strong>Erasure (Art. 17):</strong> Request deletion of your data ("right to be forgotten").</li>
      <li><strong>Portability (Art. 20):</strong> Receive your data in a machine-readable format.</li>
      <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interest.</li>
      <li><strong>Restriction (Art. 18):</strong> Ask us to restrict processing while a dispute is resolved.</li>
    </ul>
    <p>To exercise any right, email <a href="mailto:privacy@kairoscheck.net">privacy@kairoscheck.net</a>. We respond within 30 days. API customers may also use the <code>GET /gdpr/export</code> and <code>POST /gdpr/erase</code> endpoints with their pseudonymized subject reference.</p>

    <h2>6. Data residency</h2>
    <p>All Kairos Check infrastructure runs on <strong>Railway</strong> in the EU region. No personal data is transferred outside the EU in the ordinary course of business.</p>

    <h2>7. Sub-processors</h2>
    <table>
      <thead><tr><th>Sub-processor</th><th>Purpose</th><th>Location</th><th>Safeguard</th></tr></thead>
      <tbody>
        <tr><td>Stripe, Inc.</td><td>Payment processing and billing</td><td>United States</td><td>Standard Contractual Clauses + EU-US Data Privacy Framework</td></tr>
        <tr><td>Railway, Inc.</td><td>Infrastructure hosting</td><td>EU</td><td>EU-hosted, no transfer</td></tr>
      </tbody>
    </table>
    <p>We do not share your data with any other third parties for marketing, analytics, or advertising purposes.</p>

    <h2>8. Security</h2>
    <p>We apply the following security measures: HTTPS enforced on all endpoints; API keys stored as SHA-256 hashes only; audit trail protected by a cryptographic hash chain; HTTP security headers on all responses (HSTS, CSP, X-Frame-Options, Referrer-Policy).</p>

    <h2>9. Automated decision-making</h2>
    <p>Our fraud scoring (GDPR Art. 22) is informational. We return a score and verdict to your application — we do not take any automated decisions that produce legal or similarly significant effects on individuals. Your application maintains full control and human oversight over what action to take based on our scores.</p>

    <h2>10. Changes to this policy</h2>
    <p>We may update this policy when our practices change. Material changes will be communicated via email to active subscribers at least 14 days in advance. The "Last updated" date at the top of this page always reflects the current version.</p>

    <h2>11. Contact and complaints</h2>
    <p>For privacy questions: <a href="mailto:privacy@kairoscheck.net">privacy@kairoscheck.net</a>.</p>
    <p>You have the right to lodge a complaint with your national data protection authority. In Portugal, this is the <strong>CNPD</strong> (Comissão Nacional de Proteção de Dados) at <a href="https://www.cnpd.pt" rel="noopener noreferrer" target="_blank">cnpd.pt</a>.</p>
  </main>
</body>
</html>`;
}

function renderTerms() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  const year = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — Kairos Check</title>
  <meta name="description" content="Kairos Check Terms of Service. API usage, billing, cancellation, and liability terms. Governed by Portuguese law.">
  <link rel="canonical" href="${base}/terms">
  ${FONT_LINK}
  <style>${BASE_CSS}</style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to content</a>
  ${navFooter(year)}
  <main id="main-content">
    <h1>Terms of Service</h1>
    <p class="meta">Last updated: ${today} &middot; Governing law: Portugal &middot; Contact: <a href="mailto:support@kairoscheck.net">support@kairoscheck.net</a></p>

    <h2>1. Service description</h2>
    <p>Kairos Check (<strong>"Service"</strong>) is a fraud detection API operated at <strong>kairoscheck.net</strong>. It scores domains, email addresses, phone numbers, and IBANs for fraud risk using OSINT (Open Source Intelligence) signals. The Service is self-serve and API-first — there is no human onboarding, no sales process, and no custom contracts.</p>

    <h2>2. Acceptance</h2>
    <p>By creating an account, subscribing to a plan, or using the API, you agree to these Terms. You must be at least 18 years old or acting on behalf of a registered business entity. If you are accepting on behalf of a company, you represent that you have authority to bind that company.</p>

    <h2>3. Acceptable use</h2>
    <p>You may use the Service to integrate fraud detection into your own products and services. You may not:</p>
    <ul>
      <li>Resell, sublicense, or white-label the API output as a standalone product without explicit written permission.</li>
      <li>Use the Service to conduct mass surveillance, build profiling databases of individuals, or for any purpose that violates applicable law.</li>
      <li>Attempt to reverse-engineer the scoring model, probe rate limits for attack purposes, or circumvent quota enforcement.</li>
      <li>Submit false or synthetic data to manipulate scoring outcomes.</li>
      <li>Use the Service in any way that violates GDPR or other applicable privacy regulations.</li>
    </ul>
    <p>We reserve the right to suspend accounts that violate these terms without prior notice.</p>

    <h2>4. API rate limits and quota</h2>
    <p>Each plan includes a monthly check quota. Quota resets on the 1st of each calendar month at 00:00 UTC. Requests exceeding the quota receive a <code>429 Too Many Requests</code> response. Unused quota does not roll over. You can upgrade your plan at any time to increase your quota.</p>
    <table>
      <thead><tr><th>Plan</th><th>Monthly quota</th><th>Price</th></tr></thead>
      <tbody>
        <tr><td>Free</td><td>50 checks</td><td>€0</td></tr>
        <tr><td>Starter</td><td>5,000 checks</td><td>€29 + VAT</td></tr>
        <tr><td>Pro</td><td>25,000 checks</td><td>€79 + VAT</td></tr>
        <tr><td>Scale</td><td>100,000 checks</td><td>€199 + VAT</td></tr>
      </tbody>
    </table>

    <h2>5. Pricing and billing</h2>
    <p>All prices are in EUR and exclude VAT. EU B2B customers with a valid VAT ID benefit from the reverse charge mechanism. EU consumers pay VAT at their applicable national rate, added automatically at checkout by Stripe.</p>
    <p>Subscriptions are billed monthly in advance on the anniversary of your subscription start date. Stripe sends an invoice to your email address after each successful payment. You authorise Stripe to charge your payment method automatically on each billing date.</p>

    <h2>6. Auto-renewal and cancellation</h2>
    <p>Subscriptions renew automatically each month unless cancelled. You may cancel at any time via your <a href="/portal">billing portal</a> with no cancellation fee. Upon cancellation, your subscription remains active until the end of the current billing period. You will not be charged for subsequent periods.</p>
    <p>Downgrading to a lower plan takes effect at the next billing cycle. Upgrading takes effect immediately with proration.</p>

    <h2>7. Refund policy</h2>
    <p>If you are not satisfied with the Service, you may request a full refund within <strong>14 days</strong> of your first payment on any paid plan by emailing <a href="mailto:support@kairoscheck.net">support@kairoscheck.net</a>. After 14 days, no refunds are issued for the current billing period. Cancelling stops future charges but does not entitle you to a refund of the current period.</p>

    <h2>8. Service level</h2>
    <p>We target <strong>99.5% monthly uptime</strong> for the <code>/api/check</code> endpoint. This target excludes scheduled maintenance (announced 24 hours in advance) and force majeure events. We do not offer financial penalties for downtime below 99.0% under these self-serve terms. Current status is visible at <a href="/health">/health</a>.</p>

    <h2>9. Limitation of liability</h2>
    <p>The Service is provided "as is". To the maximum extent permitted by applicable law, Kairos Check shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
    <p>Our total liability to you for any claim arising under these Terms shall not exceed the total fees you paid to us in the <strong>12 months preceding the claim</strong>.</p>

    <h2>10. Fraud scores and GDPR Art. 22</h2>
    <p>Kairos Check provides scores as informational signals — not binding decisions. Under GDPR Article 22, automated decisions that produce legal or similarly significant effects on individuals require human review. You are responsible for ensuring that your use of our scores complies with this requirement. <strong>Do not use our scores as the sole basis for decisions that significantly affect individuals without human oversight.</strong></p>

    <h2>11. Intellectual property</h2>
    <p>The Service, its scoring models, and all associated software remain the intellectual property of Kairos Check. You retain ownership of any data you submit to the API. We retain anonymised, aggregated scoring data to improve the Service.</p>

    <h2>12. Termination</h2>
    <p>You may terminate your use of the Service at any time by cancelling your subscription and deleting your API keys. We may suspend or terminate your access immediately if you violate the Acceptable Use policy in section 3, if your payment fails and is not resolved within 7 days, or if required by law.</p>
    <p>Upon termination, your API keys are deactivated. Audit records are retained for 30 days then permanently deleted, unless a longer retention is required by law.</p>

    <h2>13. Changes to these Terms</h2>
    <p>We may update these Terms. Material changes will be communicated via email to active subscribers at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>

    <h2>14. Governing law and disputes</h2>
    <p>These Terms are governed by the law of <strong>Portugal</strong>. Any dispute shall be subject to the exclusive jurisdiction of the Portuguese courts, unless mandatory consumer protection law in your jurisdiction provides otherwise.</p>

    <h2>15. Contact</h2>
    <p>For billing questions: <a href="mailto:support@kairoscheck.net">support@kairoscheck.net</a>.<br>
    For legal notices: <a href="mailto:legal@kairoscheck.net">legal@kairoscheck.net</a>.<br>
    For privacy requests: <a href="mailto:privacy@kairoscheck.net">privacy@kairoscheck.net</a>.</p>
  </main>
</body>
</html>`;
}

module.exports = { renderPrivacy, renderTerms };
