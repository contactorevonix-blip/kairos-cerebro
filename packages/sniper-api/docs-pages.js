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
    --accent: #00d97e; --accent-hover: #00b369;
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
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
  .nav-links a:hover, .nav-links a.active { color: var(--text); }
  .layout { display: flex; max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem; gap: 4rem; }
  aside { width: 220px; flex-shrink: 0; }
  .sidebar { position: sticky; top: 80px; }
  .sidebar-section { margin-bottom: 2rem; }
  .sidebar-label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 0.75rem; }
  .sidebar-links { display: flex; flex-direction: column; gap: 0.25rem; }
  .sidebar-links a { font-size: var(--text-sm); color: var(--text-secondary); text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; }
  .sidebar-links a:hover { color: var(--text); background: var(--surface); }
  .sidebar-links a.active { color: var(--text); background: var(--surface); }
  article { flex: 1; min-width: 0; max-width: 680px; }
  h1 { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 0.5rem; }
  .doc-lead { font-size: var(--text-lg); color: var(--text-secondary); line-height: 1.5; margin-bottom: 2.5rem; }
  h2 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin: 2.5rem 0 1rem; }
  h3 { font-size: var(--text-lg); font-weight: 600; margin: 2rem 0 0.75rem; }
  p { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.7; margin-bottom: 1rem; }
  ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  li { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.7; margin-bottom: 0.25rem; }
  code { font-family: var(--font-mono); font-size: 0.875em; background: var(--surface-2); border: 1px solid var(--border); padding: 0.125rem 0.375rem; border-radius: 4px; color: var(--accent); }
  pre { font-family: var(--font-mono); font-size: 0.8125rem; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 8px; padding: 1.25rem; overflow-x: auto; margin-bottom: 1.5rem; line-height: 1.6; }
  pre code { background: none; border: none; padding: 0; color: var(--text-secondary); font-size: inherit; }
  .comment { color: var(--text-tertiary); }
  .pill { display: inline-block; font-size: var(--text-xs); font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 999px; }
  .pill-post { background: rgba(0,217,126,0.15); color: var(--accent); }
  .pill-get { background: rgba(59,130,246,0.15); color: #60a5fa; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: var(--text-sm); }
  th { text-align: left; padding: 0.625rem 1rem; border-bottom: 1px solid var(--border-strong); color: var(--text-tertiary); font-weight: 500; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 0.625rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .callout { background: var(--surface); border: 1px solid var(--border-strong); border-left: 3px solid var(--accent); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
  .callout p { margin-bottom: 0; font-size: var(--text-sm); }
  footer { border-top: 1px solid var(--border); padding: 2rem 1.5rem; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .footer-brand { font-size: var(--text-sm); color: var(--text-tertiary); }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { font-size: var(--text-sm); color: var(--text-tertiary); text-decoration: none; }
  .footer-links a:hover { color: var(--text-secondary); }
  @media (max-width: 768px) { .layout { flex-direction: column; padding: 2rem 1rem; gap: 2rem; } aside { width: 100%; } .sidebar { position: static; } }
`;

function shell(title, description, canonicalPath, activeNav, content) {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Kairos Check</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${base}${canonicalPath}">
  <meta property="og:title" content="${title} — Kairos Check">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${base}${canonicalPath}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kairos Check">
  ${FONT_LINK}
  <style>${BASE_CSS}</style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to content</a>
  <nav class="top" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Kairos<span>Check</span></a>
      <div class="nav-links">
        <a href="/docs" class="${activeNav === 'docs' ? 'active' : ''}">Docs</a>
        <a href="/pricing">Pricing</a>
      </div>
    </div>
  </nav>
  <div class="layout" id="main-content">
    <aside>
      <nav class="sidebar" aria-label="Documentation navigation">
        <div class="sidebar-section">
          <p class="sidebar-label">Getting started</p>
          <div class="sidebar-links">
            <a href="/docs" class="${canonicalPath === '/docs' ? 'active' : ''}">Overview</a>
            <a href="/docs/quickstart" class="${canonicalPath === '/docs/quickstart' ? 'active' : ''}">Quickstart — 5 min</a>
            <a href="/docs/api/authentication" class="${canonicalPath === '/docs/api/authentication' ? 'active' : ''}">Authentication</a>
          </div>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">API Reference</p>
          <div class="sidebar-links">
            <a href="/docs/api/check" class="${canonicalPath === '/docs/api/check' ? 'active' : ''}">/api/check</a>
            <a href="/docs/api/batch" class="${canonicalPath === '/docs/api/batch' ? 'active' : ''}">/api/check (batch)</a>
            <a href="/docs/api/webhooks" class="${canonicalPath === '/docs/api/webhooks' ? 'active' : ''}">Webhooks</a>
            <a href="/docs/api/errors" class="${canonicalPath === '/docs/api/errors' ? 'active' : ''}">Errors &amp; limits</a>
          </div>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">Guides</p>
          <div class="sidebar-links">
            <a href="/docs/guides/how-it-works" class="${canonicalPath === '/docs/guides/how-it-works' ? 'active' : ''}">How the intelligence works</a>
            <a href="/docs/guides/gdpr" class="${canonicalPath === '/docs/guides/gdpr' ? 'active' : ''}">GDPR compliance</a>
          </div>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">Billing</p>
          <div class="sidebar-links">
            <a href="/docs/pricing-faq" class="${canonicalPath === '/docs/pricing-faq' ? 'active' : ''}">Pricing FAQ</a>
          </div>
        </div>
      </nav>
    </aside>
    <article>
      ${content}
    </article>
  </div>
  <footer>
    <p class="footer-brand">&copy; ${new Date().getFullYear()} Kairos Check</p>
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/pricing">Pricing</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
</body>
</html>`;
}

function renderDocsOverview() {
  return shell(
    'Documentation',
    'Kairos Check API documentation. OSINT-first fraud detection for developers. Integrate in 5 minutes.',
    '/docs',
    'docs',
    `
    <h1>Kairos Check API</h1>
    <p class="doc-lead">OSINT-first fraud detection. One endpoint. No vendor lock-in. Integrate in 5 minutes.</p>

    <h2>What it does</h2>
    <p>Kairos Check scores any domain, email, phone number, or IBAN against 8 independent OSINT layers and returns a verdict — <code>allow</code>, <code>review</code>, or <code>block</code> — with a numeric score and the signals that drove it.</p>
    <p>Every response is auditable: you get a <code>ref</code> ID you can tie back to a specific check in your logs. No black box.</p>

    <h2>Integration in 60 seconds</h2>
    <p>Get an API key from the <a href="/pricing" style="color:var(--accent)">pricing page</a>, then make your first request:</p>
    <pre><code><span class="comment"># Replace YOUR_KEY with your kc_* key</span>
curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "suspicious-shop.io"}'</code></pre>

    <h3>Node.js</h3>
    <pre><code>const res = await fetch('https://kairoscheck.net/api/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ domain: 'suspicious-shop.io' }),
});
const { score, verdict, signals } = await res.json();
console.log(verdict); <span class="comment">// "allow" | "review" | "block"</span></code></pre>

    <h3>Python</h3>
    <pre><code>import httpx

r = httpx.post(
    "https://kairoscheck.net/api/check",
    headers={"Authorization": "Bearer YOUR_KEY"},
    json={"domain": "suspicious-shop.io"},
)
data = r.json()
print(data["verdict"])  <span class="comment"># "allow" | "review" | "block"</span></code></pre>

    <h2>Key concepts</h2>
    <ul>
      <li><strong>OSINT-only:</strong> we score public signals — domain age, WHOIS, SSL, abuse databases, NLP patterns. We never receive or store personal data you don't explicitly send.</li>
      <li><strong>GDPR-native:</strong> requests are pseudonymized on ingestion. You can export or erase all records tied to a data subject via the API.</li>
      <li><strong>Zero external deps:</strong> no third-party data brokers, no US services in the scoring path.</li>
      <li><strong>Quota-based:</strong> monthly checks reset on the 1st. Upgrade or downgrade any time from your <a href="/portal" style="color:var(--accent)">billing portal</a>.</li>
    </ul>

    <div class="callout"><p>Ready to integrate? Follow the <a href="/docs/quickstart" style="color:var(--accent)">Quickstart guide</a> to get your key and make your first live request.</p></div>
  `);
}

function renderDocsQuickstart() {
  return shell(
    'Quickstart',
    'Get your Kairos Check API key and make your first fraud detection request in under 5 minutes.',
    '/docs/quickstart',
    'docs',
    `
    <h1>Quickstart</h1>
    <p class="doc-lead">From zero to your first fraud score in under 5 minutes.</p>

    <h2>Step 1 — Get an API key</h2>
    <p>Go to <a href="/pricing" style="color:var(--accent)">kairoscheck.net/pricing</a> and choose a plan. After checkout, your API key is shown on the confirmation page. Copy it immediately — it is displayed only once.</p>
    <p>Your key looks like: <code>kc_live_a1b2c3d4e5f6...</code> (56 characters total).</p>

    <div class="callout"><p><strong>Free tier:</strong> Start with 50 checks/month at no cost — no credit card required. Read the <a href="/docs/pricing-faq" style="color:var(--accent)">Pricing FAQ</a> for details.</p></div>

    <h2>Step 2 — Make your first request</h2>
    <p>Send a <code>POST</code> to <code>/api/check</code> with your Bearer token and the entity to score:</p>
    <pre><code>curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "suspicious-shop.io"}'</code></pre>

    <h2>Step 3 — Read the response</h2>
    <pre><code>{
  "score": 72,
  "verdict": "block",
  "signals": [
    "Domain registered 3 days ago",
    "No SSL certificate",
    "Matches known phishing pattern"
  ],
  "dominant_threat": "phishing",
  "type": "domain",
  "query": "suspicious-shop.io",
  "timestamp": "2026-05-10T12:00:00.000Z",
  "ref": "a1b2c3d4"
}</code></pre>

    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>score</code></td><td>integer 0–100</td><td>Risk score. 0 = clean, 100 = certain fraud.</td></tr>
        <tr><td><code>verdict</code></td><td>string</td><td><code>allow</code> / <code>review</code> / <code>block</code></td></tr>
        <tr><td><code>signals</code></td><td>string[]</td><td>Human-readable reasons for the score.</td></tr>
        <tr><td><code>dominant_threat</code></td><td>string | null</td><td>Primary threat category detected.</td></tr>
        <tr><td><code>ref</code></td><td>string</td><td>Unique reference for audit trail lookup.</td></tr>
      </tbody>
    </table>

    <h2>Step 4 — Act on the verdict</h2>
    <pre><code>const { verdict } = await check({ domain: userSubmittedDomain });

if (verdict === 'block') {
  return res.status(422).json({ error: 'Domain flagged as fraudulent.' });
}
if (verdict === 'review') {
  await queue.add('manual-review', { domain, ref });
}
<span class="comment">// verdict === 'allow' → proceed normally</span></code></pre>

    <p>Next: read the full <a href="/docs/api/check" style="color:var(--accent)">/api/check reference</a> for all input types, error codes, and quota headers.</p>
  `);
}

function renderDocsApiCheck() {
  return shell(
    '/api/check Reference',
    'Complete reference for the Kairos Check /api/check endpoint. Input types, error codes, quota headers, and examples.',
    '/docs/api/check',
    'docs',
    `
    <h1>/api/check</h1>
    <p class="doc-lead">Score any domain, email, phone, or IBAN for fraud risk.</p>

    <p><span class="pill pill-post">POST</span> <code>https://kairoscheck.net/api/check</code></p>

    <h2>Authentication</h2>
    <p>Pass your API key as a Bearer token in the <code>Authorization</code> header:</p>
    <pre><code>Authorization: Bearer kc_live_YOUR_KEY_HERE</code></pre>

    <h2>Request body</h2>
    <p>Send <code>application/json</code>. At least one field is required.</p>
    <table>
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>domain</code></td><td>string</td><td>Domain name to score. e.g. <code>suspicious-shop.io</code></td></tr>
        <tr><td><code>email</code></td><td>string</td><td>Email address to score.</td></tr>
        <tr><td><code>phone</code></td><td>string</td><td>Phone number (any format). e.g. <code>+351912345678</code></td></tr>
        <tr><td><code>iban</code></td><td>string</td><td>IBAN to score. e.g. <code>PT50 0002 0123 1234 5678 9015 4</code></td></tr>
        <tr><td><code>region</code></td><td>object</td><td>Optional. <code>{"country": "PT"}</code>. Defaults to EU.</td></tr>
      </tbody>
    </table>

    <h2>Response — 200 OK</h2>
    <pre><code>{
  "score": 72,           <span class="comment">// 0–100, higher = more suspicious</span>
  "verdict": "block",    <span class="comment">// "allow" | "review" | "block"</span>
  "signals": [           <span class="comment">// reasons driving the score</span>
    "Domain registered 3 days ago",
    "Matches known phishing pattern"
  ],
  "dominant_threat": "phishing",  <span class="comment">// primary threat category or null</span>
  "type": "domain",      <span class="comment">// which field was scored</span>
  "query": "suspicious-shop.io",
  "timestamp": "2026-05-10T12:00:00.000Z",
  "ref": "a1b2c3d4"      <span class="comment">// unique reference ID for audit</span>
}</code></pre>

    <h2>Verdict thresholds</h2>
    <table>
      <thead><tr><th>Verdict</th><th>Score range</th><th>Recommended action</th></tr></thead>
      <tbody>
        <tr><td><code>allow</code></td><td>0–39</td><td>Proceed normally.</td></tr>
        <tr><td><code>review</code></td><td>40–69</td><td>Queue for manual review or add friction.</td></tr>
        <tr><td><code>block</code></td><td>70–100</td><td>Reject or escalate.</td></tr>
      </tbody>
    </table>

    <h2>Error responses</h2>
    <table>
      <thead><tr><th>Status</th><th>Body</th><th>Cause</th></tr></thead>
      <tbody>
        <tr><td><code>400</code></td><td><code>{"error": "Provide at least one of: domain, phone, iban, email"}</code></td><td>No scorable field provided.</td></tr>
        <tr><td><code>401</code></td><td><code>{"error": "Invalid API key"}</code></td><td>Key missing, malformed, revoked, or cancelled.</td></tr>
        <tr><td><code>429</code></td><td><code>{"error": "Monthly quota exceeded. Resets on 2026-06-01", "reset_at": "..."}</code></td><td>Monthly quota exhausted.</td></tr>
        <tr><td><code>500</code></td><td><code>{"error": "An error occurred.", "ref": "..."}</code></td><td>Internal error. Use <code>ref</code> to contact support.</td></tr>
      </tbody>
    </table>

    <h2>Quota headers</h2>
    <p>Quota is enforced monthly per API key. Check the response body on 429 for <code>reset_at</code>. To see your current usage, count your requests since the 1st of the current month using your own logs — or contact support with your key preview.</p>

    <h2>GDPR note</h2>
    <p>Under GDPR Art. 22, automated scoring must not be the sole basis for decisions affecting individuals. Kairos Check scores are informational. Your application must maintain human oversight for decisions with significant impact.</p>

    <h2>Examples</h2>
    <h3>Score an email</h3>
    <pre><code>curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "winner@lottery-claim-now.io"}'</code></pre>

    <h3>Score a phone number</h3>
    <pre><code>curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer kc_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"phone": "+351910000000", "region": {"country": "PT"}}'</code></pre>
  `);
}

function renderDocsPricingFaq() {
  return shell(
    'Pricing FAQ',
    'Questions about Kairos Check plans, limits, billing cycles, cancellation, VAT, and refunds.',
    '/docs/pricing-faq',
    'docs',
    `
    <h1>Pricing FAQ</h1>
    <p class="doc-lead">Everything about plans, quotas, billing, and cancellation.</p>

    <h2>Plans and limits</h2>

    <h3>What counts as a "check"?</h3>
    <p>One call to <code>POST /api/check</code> counts as one check, regardless of how many fields you include in the body. Batch requests are not yet available on the self-serve plans.</p>

    <h3>What happens when I hit my monthly quota?</h3>
    <p>Requests return <code>429 Too Many Requests</code> with a <code>reset_at</code> timestamp indicating when the counter resets (always the 1st of the next month at 00:00 UTC). Existing integrations will not break — they receive a clean error they can handle.</p>

    <h3>Do unused checks roll over?</h3>
    <p>No. Quota resets on the 1st of each month regardless of how much you used.</p>

    <h3>Can I upgrade mid-cycle?</h3>
    <p>Yes. Upgrades take effect immediately and are prorated by Stripe. You pay only for the remaining days on the new plan.</p>

    <h3>Can I downgrade mid-cycle?</h3>
    <p>Yes. Downgrades take effect at the start of the next billing cycle. Your current quota remains active until then.</p>

    <h2>Billing</h2>

    <h3>What currency do you charge in?</h3>
    <p>All prices are in EUR. Stripe handles currency conversion if your card is in a different currency.</p>

    <h3>Do prices include VAT?</h3>
    <p>No. Displayed prices exclude VAT. EU B2B customers (with valid VAT ID) benefit from the reverse charge mechanism. EU consumers will have VAT added at checkout according to their country rate.</p>

    <h3>When am I billed?</h3>
    <p>Monthly, on the same day you first subscribed. Stripe sends you an invoice by email.</p>

    <h3>What payment methods are accepted?</h3>
    <p>All major credit and debit cards via Stripe. No SEPA, no invoicing, no bank transfer — self-serve only.</p>

    <h2>Cancellation and refunds</h2>

    <h3>How do I cancel?</h3>
    <p>From your <a href="/portal" style="color:var(--accent)">billing portal</a> — one click, no email, no form. Your subscription stays active until the end of the current billing period.</p>

    <h3>What is the refund policy?</h3>
    <p>If you cancel within 14 days of your first payment on any plan, you may request a full refund by emailing <a href="mailto:support@kairoscheck.net" style="color:var(--accent)">support@kairoscheck.net</a>. After 14 days, no refunds are issued — you can always cancel to stop future charges.</p>

    <h3>What happens to my data after cancellation?</h3>
    <p>Your API key is deactivated immediately. Audit records tied to your key are retained for 30 days then permanently deleted, unless you request erasure sooner via the <a href="/privacy" style="color:var(--accent)">GDPR erasure endpoint</a>.</p>
  `);
}

function renderDocsAuthentication() {
  return shell(
    'Authentication',
    'How to authenticate with the Kairos Check API. Bearer tokens, key management, and security best practices.',
    '/docs/api/authentication', 'docs',
    `<h1>Authentication</h1>
    <p class="doc-lead">Every request to <code>/api/check</code> requires a Bearer token in the <code>Authorization</code> header. Your key is issued instantly when you subscribe — no approval queue, no KYC.</p>

    <h2>Your API key</h2>
    <p>API keys follow the format <code>kc_live_[48 hex chars]</code>. They are hashed with SHA-256 before storage — we never store your key in plaintext.</p>
    <pre><code><span class="comment"># Every authenticated request uses this header:</span>
Authorization: Bearer kc_live_your_key_here</code></pre>

    <div class="callout">
      <p><strong>Keep it secret.</strong> Treat your API key like a password. Do not commit it to version control. Use environment variables: <code>KC_API_KEY=kc_live_...</code></p>
    </div>

    <h2>Making your first authenticated request</h2>
    <pre><code>curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer kc_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"domain":"test.io"}'</code></pre>

    <h2>Key security</h2>
    <table>
      <thead><tr><th>Property</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Storage</td><td>SHA-256 hash only — never plaintext</td></tr>
        <tr><td>Transport</td><td>TLS 1.2+ required (enforced by Cloudflare)</td></tr>
        <tr><td>Rotation</td><td>Rotate anytime from your dashboard — old key valid 24h</td></tr>
        <tr><td>Revocation</td><td>Immediate — revoked key returns 401 within seconds</td></tr>
        <tr><td>Audit trail</td><td>Every check is logged with SHA-256 key hash, never raw key</td></tr>
      </tbody>
    </table>

    <h2>Environment variables (recommended)</h2>
    <pre><code><span class="comment"># .env (never commit this file)</span>
KC_API_KEY=kc_live_your_key_here

<span class="comment"># Node.js</span>
const key = process.env.KC_API_KEY;

<span class="comment"># Python</span>
import os; key = os.environ['KC_API_KEY']

<span class="comment"># PHP</span>
$key = $_ENV['KC_API_KEY'];

<span class="comment"># GitHub Actions / Railway</span>
<span class="comment"># Add KC_API_KEY as a secret in your environment settings</span></code></pre>

    <h2>Error responses</h2>
    <table>
      <thead><tr><th>Status</th><th>Error</th><th>Meaning</th></tr></thead>
      <tbody>
        <tr><td><code>401</code></td><td><code>Invalid API key</code></td><td>Key not found, revoked, or malformed</td></tr>
        <tr><td><code>429</code></td><td><code>Monthly quota exceeded</code></td><td>Upgrade your plan or wait for reset</td></tr>
      </tbody>
    </table>

    <p>Next: read the <a href="/docs/api/check" style="color:var(--accent)">/api/check reference</a> to see all entity types and response fields.</p>`
  );
}

function renderDocsBatch() {
  return shell(
    'Batch API',
    'Check up to 100 entities in a single POST call with the Kairos Check batch endpoint.',
    '/docs/api/batch', 'docs',
    `<h1>Batch API</h1>
    <p class="doc-lead">Check up to 100 entities in one POST call. Same response shape as <code>/api/check</code>, returned as an array. Batch calls count as 1 API call per entity checked.</p>

    <div class="callout">
      <p><strong>Available on:</strong> Starter (5k checks/mo), Pro (25k), Scale (unlimited). Batch is especially useful for nightly audits of existing user bases.</p>
    </div>

    <h2>Endpoint</h2>
    <pre><code>POST /api/check
Content-Type: application/json
Authorization: Bearer kc_live_your_key_here</code></pre>

    <h2>Request — batch format</h2>
    <p>Send an array of entity objects instead of a single object:</p>
    <pre><code>{
  "batch": [
    { "domain": "suspicious-shop.io" },
    { "email": "user@temp-mail.org" },
    { "domain": "stripe.com" },
    { "phone": "+351912345678" }
  ]
}</code></pre>

    <h2>Response</h2>
    <pre><code>{
  "results": [
    {
      "query": "suspicious-shop.io",
      "type": "domain",
      "verdict": "BLOCK",
      "score": 87,
      "signals": ["domain:brand-impersonation:stripe", "domain:high-risk-tld:.io"],
      "ref": "a1b2c3d4"
    },
    {
      "query": "user@temp-mail.org",
      "type": "email",
      "verdict": "REVIEW",
      "score": 42,
      "signals": ["disposable-email-provider"],
      "ref": "e5f6g7h8"
    }
  ],
  "count": 4,
  "checked": 4,
  "ms": 312
}</code></pre>

    <h2>Code example — Node.js</h2>
    <pre><code>const results = await fetch('https://kairoscheck.net/api/check', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.KC_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    batch: users.map(u => ({ email: u.email, domain: u.signupDomain }))
  }),
}).then(r => r.json());

const blocked = results.results.filter(r => r.verdict === 'BLOCK');
console.log(\`Blocked \${blocked.length} of \${users.length} signups\`);</code></pre>

    <h2>Limits</h2>
    <table>
      <thead><tr><th>Property</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Max entities per call</td><td>100</td></tr>
        <tr><td>Timeout</td><td>30 seconds</td></tr>
        <tr><td>Quota consumption</td><td>1 token per entity checked</td></tr>
        <tr><td>Mixed types</td><td>Yes — domain, email, phone, IBAN in same batch</td></tr>
      </tbody>
    </table>`
  );
}

function renderDocsWebhooks() {
  return shell(
    'Webhooks',
    'Receive real-time notifications when Kairos Check blocks or flags an entity. HMAC-verified, idempotent, GDPR-compliant.',
    '/docs/api/webhooks', 'docs',
    `<h1>Webhooks</h1>
    <p class="doc-lead">Get notified in real-time when a fraud check returns BLOCK or REVIEW. Webhooks are HMAC-SHA256 verified and delivered with retry logic. Configure once, receive forever.</p>

    <h2>Setup</h2>
    <p>Add your webhook URL in your dashboard. We send a POST request to your endpoint on every BLOCK or REVIEW verdict.</p>

    <h2>Payload format</h2>
    <pre><code>POST https://your-app.com/webhooks/kairos
Content-Type: application/json
X-Kairos-Signature: sha256=abc123...
X-Kairos-Event: check.blocked

{
  "event": "check.blocked",
  "timestamp": "2026-05-15T14:32:00.000Z",
  "data": {
    "query": "paypal-account-suspended.store",
    "type": "domain",
    "verdict": "BLOCK",
    "score": 100,
    "signals": ["domain:brand-impersonation:paypal", "domain:high-risk-tld:.store"],
    "ref": "a1b2c3d4"
  }
}</code></pre>

    <h2>Verifying the signature</h2>
    <p>Always verify the <code>X-Kairos-Signature</code> header before processing a webhook. This prevents attackers from sending fake events to your endpoint.</p>
    <pre><code><span class="comment">// Node.js verification</span>
const crypto = require('crypto');

function verifyKairosWebhook(rawBody, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

<span class="comment">// In your Express handler:</span>
app.post('/webhooks/kairos', express.raw({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-kairos-signature'];
  if (!verifyKairosWebhook(req.body, sig, process.env.KC_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body);
  <span class="comment">// Process event...</span>
  res.json({ received: true });
});</code></pre>

    <h2>Events</h2>
    <table>
      <thead><tr><th>Event</th><th>When fired</th></tr></thead>
      <tbody>
        <tr><td><code>check.blocked</code></td><td>Verdict is BLOCK (score ≥ 60)</td></tr>
        <tr><td><code>check.review</code></td><td>Verdict is REVIEW (score 30–59)</td></tr>
      </tbody>
    </table>

    <h2>Retry policy</h2>
    <p>If your endpoint returns anything other than 2xx, we retry up to 3 times with exponential backoff (1s, 4s, 16s). After 3 failures, the event is marked as failed in your dashboard.</p>

    <div class="callout">
      <p><strong>GDPR note:</strong> Webhook payloads contain the entity that was checked (e.g., the domain string) but never any PII from your users. The <code>ref</code> field links to your audit trail if you need to correlate.</p>
    </div>`
  );
}

function renderDocsErrors() {
  return shell(
    'Errors & Rate Limits',
    'Complete reference for Kairos Check API error codes, HTTP status codes, and rate limiting behaviour.',
    '/docs/api/errors', 'docs',
    `<h1>Errors &amp; Rate Limits</h1>
    <p class="doc-lead">All errors return JSON with an <code>error</code> field. HTTP status codes follow REST conventions. Rate limits are enforced per API key per calendar month.</p>

    <h2>HTTP status codes</h2>
    <table>
      <thead><tr><th>Status</th><th>Meaning</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td><code>200</code></td><td>Success</td><td>Read <code>verdict</code>, <code>score</code>, <code>signals</code></td></tr>
        <tr><td><code>400</code></td><td>Bad request</td><td>Check your JSON body — missing required field</td></tr>
        <tr><td><code>401</code></td><td>Unauthorized</td><td>API key missing, invalid, or revoked</td></tr>
        <tr><td><code>429</code></td><td>Quota exceeded</td><td>Upgrade plan or wait for monthly reset</td></tr>
        <tr><td><code>500</code></td><td>Server error</td><td>Retry with exponential backoff — we're paged immediately</td></tr>
      </tbody>
    </table>

    <h2>Error response format</h2>
    <pre><code>{
  "error": "Monthly quota exceeded. Resets on 2026-06-01.",
  "quota_per_month": 5000,
  "used": 5000,
  "reset_at": "2026-06-01T00:00:00.000Z"
}</code></pre>

    <h2>Rate limits</h2>
    <table>
      <thead><tr><th>Plan</th><th>Monthly quota</th><th>Overage</th></tr></thead>
      <tbody>
        <tr><td>Free</td><td>50 checks</td><td>No overage — blocked at limit</td></tr>
        <tr><td>Starter</td><td>5,000 checks</td><td>€0.01/check (coming soon)</td></tr>
        <tr><td>Pro</td><td>25,000 checks</td><td>€0.008/check (coming soon)</td></tr>
        <tr><td>Scale</td><td>Unlimited</td><td>—</td></tr>
      </tbody>
    </table>

    <h2>Quota headers</h2>
    <p>Every response includes quota information:</p>
    <pre><code>X-Quota-Limit: 5000
X-Quota-Used: 1247
X-Quota-Remaining: 3753
X-Quota-Reset: 2026-06-01T00:00:00.000Z</code></pre>

    <h2>Handling 429 gracefully</h2>
    <pre><code>const res = await fetch('https://kairoscheck.net/api/check', { ... });

if (res.status === 429) {
  const { reset_at } = await res.json();
  console.warn('Quota exceeded. Resets at:', reset_at);
  <span class="comment">// Allow the user through (fail open) or show a friction step</span>
  return { verdict: 'ALLOW', score: 0, note: 'quota_exceeded' };
}</code></pre>

    <div class="callout">
      <p><strong>Fail-open vs fail-closed:</strong> When quota is exceeded, we recommend failing open (allowing users through) rather than blocking everyone. Blocking all signups because of a quota is worse than missing a few fraudsters. Monitor your usage in the dashboard.</p>
    </div>`
  );
}

function renderDocsHowItWorks() {
  return shell(
    'How the intelligence works',
    'Deep-dive into the Kairos Check fraud detection architecture: Layer 0 domain heuristic, 8 OSINT signal layers, and cross-tenant reputation graph.',
    '/docs/guides/how-it-works', 'docs',
    `<h1>How the intelligence works</h1>
    <p class="doc-lead">Every Kairos Check call runs through 9 layers of analysis in under 200ms. Here's exactly what happens — and why it matters for your business.</p>

    <h2>Layer 0 — Domain name heuristic</h2>
    <p>Before any OSINT lookup, we analyse the entity string itself for known fraud patterns. This catches the attacks that bypass traditional databases.</p>
    <ul>
      <li><strong>Brand impersonation:</strong> 37 brands tracked. <code>paypal-account-suspended.store</code> → BLOCK score 100.</li>
      <li><strong>Homograph detection:</strong> <code>paypa1-verify.com</code> (where "1" replaces "l") → BLOCK score 75. Zero competitors catch this.</li>
      <li><strong>High-risk TLD matrix:</strong> 60+ TLDs including <code>.store</code>, <code>.shop</code>, <code>.xyz</code>, <code>.tk</code>.</li>
      <li><strong>Keyword combinations:</strong> domain names containing "security" + "verify" + brand name = confirmed phishing pattern.</li>
    </ul>

    <h2>Layers 1–8 — OSINT signal analysis</h2>
    <table>
      <thead><tr><th>Layer</th><th>What it checks</th><th>Signal examples</th></tr></thead>
      <tbody>
        <tr><td>1 — Core content</td><td>Phishing patterns, high-risk URL patterns, suspicious TLDs</td><td><code>high-risk-pattern</code>, <code>phishing-pattern</code></td></tr>
        <tr><td>2 — Guru-scam</td><td>Fake investment schemes, "get rich quick" patterns (50+ languages)</td><td><code>guaranteed-returns</code>, <code>passive-income-machine</code></td></tr>
        <tr><td>3 — Reputation</td><td>Known scam entities, complaint databases, review-site gaslighting</td><td><code>known-scam-entity</code></td></tr>
        <tr><td>4 — NLP heuristic</td><td>7-axis scam matrix: urgency, fake ROI, vague method, authority bait, FOMO, identity escape, easy money</td><td><code>scam-matrix:CONFIRMED</code></td></tr>
        <tr><td>5 — Live reputation</td><td>Real-time reputation evasion patterns, complaint camouflage</td><td><code>reputation-evasion</code></td></tr>
        <tr><td>6 — Checkout inspection</td><td>Hostile checkout funnels, aggressive upsell patterns</td><td><code>aggressive-funnel</code></td></tr>
        <tr><td>7 — N-gram similarity</td><td>Fuzzy matching against confirmed-scam corpus</td><td><code>ngram-match:0.87</code></td></tr>
        <tr><td>8 — Network intelligence</td><td>Cross-tenant reputation graph — entity seen by other customers</td><td><code>network-intelligence:score=95</code></td></tr>
      </tbody>
    </table>

    <h2>The cross-tenant reputation graph</h2>
    <p>This is our data moat. Every check you run contributes a signal to a shared reputation graph. When <code>paypal-customer-support.store</code> is flagged by one customer, every subsequent check of that domain by any customer gets a higher confidence score.</p>
    <p>The graph gets smarter every day — automatically — without anyone doing anything. It's the reason our detection rate improves month over month:</p>
    <table>
      <thead><tr><th>Month</th><th>Detection rate</th><th>What drove it</th></tr></thead>
      <tbody>
        <tr><td>Launch</td><td>50%</td><td>Layer 0 + static patterns only</td></tr>
        <tr><td>Month 1</td><td>~75%</td><td>Nightly seeder + first customer checks</td></tr>
        <tr><td>Month 3</td><td>~90%</td><td>Graph populated, patterns classified</td></tr>
        <tr><td>Month 12</td><td>95%+</td><td>Family fingerprinting, cross-tenant amplification</td></tr>
      </tbody>
    </table>

    <h2>Scoring thresholds</h2>
    <table>
      <thead><tr><th>Verdict</th><th>Score range</th><th>Recommended action</th></tr></thead>
      <tbody>
        <tr><td><code>BLOCK</code></td><td>60 – 100</td><td>Deny the request. Log the entity for your records.</td></tr>
        <tr><td><code>REVIEW</code></td><td>30 – 59</td><td>Apply friction: CAPTCHA, email verification, manual review queue.</td></tr>
        <tr><td><code>ALLOW</code></td><td>0 – 29</td><td>Proceed normally.</td></tr>
      </tbody>
    </table>

    <div class="callout">
      <p><strong>Zero PII:</strong> We analyse public signals only. We never store email content, message bodies, or any personal information beyond what you explicitly send in the <code>query</code> field. The audit trail stores only SHA-256 hashes.</p>
    </div>`
  );
}

function renderDocsGdpr() {
  return shell(
    'GDPR Compliance',
    'How Kairos Check is built for GDPR compliance by design. Article 6, 22, 15, 17 — all covered. EU-hosted, zero PII in logs.',
    '/docs/guides/gdpr', 'docs',
    `<h1>GDPR Compliance</h1>
    <p class="doc-lead">Kairos Check is GDPR-compliant by design, not by policy. Here's the legal basis for each check type, the data you process, and how we help you meet your obligations to data subjects.</p>

    <div class="callout">
      <p><strong>We are EU-hosted</strong> (Railway, Ireland data centre). No data leaves the EU. No US sub-processors for core functionality. No third-party analytics on our API endpoints.</p>
    </div>

    <h2>Legal basis — Article 6</h2>
    <p>Fraud prevention checks fall under <strong>Article 6(1)(f) — legitimate interests</strong>. Your legitimate interest in preventing financial fraud outweighs the minimal privacy impact of checking a domain name or email address.</p>
    <p>Domain names and email addresses are <strong>publicly available information</strong> (OSINT). We do not process special categories of data (Art. 9) under any circumstances.</p>

    <h2>Automated decision-making — Article 22</h2>
    <p>If you use a Kairos Check result to automatically reject a signup (fully automated decision), you are subject to Article 22 obligations. Our response includes a <code>signals</code> array specifically to enable human oversight:</p>
    <ul>
      <li>You can show users why a decision was made (Art. 22(3)).</li>
      <li>You can implement a "request human review" flow.</li>
      <li>The <code>ref</code> field links every decision to your immutable audit trail.</li>
    </ul>
    <p>We recommend using <code>BLOCK</code> verdicts as a trigger for your review queue rather than an automatic hard block, unless your legal team has confirmed Art. 22 compliance for your jurisdiction.</p>

    <h2>Data subject rights</h2>
    <table>
      <thead><tr><th>Right</th><th>Article</th><th>How Kairos Check helps</th></tr></thead>
      <tbody>
        <tr><td>Right of access</td><td>Art. 15</td><td>Export audit trail as CSV from your dashboard. Every check logged with <code>ref</code>, timestamp, verdict.</td></tr>
        <tr><td>Right to erasure</td><td>Art. 17</td><td><code>DELETE /api/erasure?query=[entity]</code> removes the entity from your audit trail and the reputation graph entry for your tenant.</td></tr>
        <tr><td>Right to object</td><td>Art. 21</td><td>The <code>REVIEW</code> verdict + human oversight workflow implements this.</td></tr>
        <tr><td>Data portability</td><td>Art. 20</td><td>Full CSV export of your check history available on request.</td></tr>
      </tbody>
    </table>

    <h2>What data we store</h2>
    <table>
      <thead><tr><th>Data</th><th>How stored</th><th>Retention</th></tr></thead>
      <tbody>
        <tr><td>API key</td><td>SHA-256 hash only — never plaintext</td><td>Until you delete your account</td></tr>
        <tr><td>Check entity (domain/email)</td><td>Hashed in audit trail; plaintext in check-audit.jsonl for your access</td><td>12 months, or until you delete</td></tr>
        <tr><td>Check result (verdict, score)</td><td>Stored in your tenant partition only</td><td>12 months</td></tr>
        <tr><td>IP address of caller</td><td>Not stored. Cloudflare logs may retain for 24h per their policy.</td><td>Cloudflare: 24h</td></tr>
      </tbody>
    </table>

    <h2>DPA (Data Processing Agreement)</h2>
    <p>If your organisation requires a DPA, email <a href="mailto:privacy@kairoscheck.net" style="color:var(--accent)">privacy@kairoscheck.net</a>. We use Standard Contractual Clauses (SCCs) where applicable.</p>

    <div class="callout">
      <p><strong>For your legal team:</strong> Kairos Check processes only publicly available information (OSINT). No biometric data, no special categories, no children's data. The processing purpose is fraud prevention — a recognised legitimate interest under GDPR recital 47.</p>
    </div>`
  );
}

const ROUTES = {
  '/docs': renderDocsOverview,
  '/docs/quickstart': renderDocsQuickstart,
  '/docs/api/check': renderDocsApiCheck,
  '/docs/api/authentication': renderDocsAuthentication,
  '/docs/api/batch': renderDocsBatch,
  '/docs/api/webhooks': renderDocsWebhooks,
  '/docs/api/errors': renderDocsErrors,
  '/docs/guides/how-it-works': renderDocsHowItWorks,
  '/docs/guides/gdpr': renderDocsGdpr,
  '/docs/pricing-faq': renderDocsPricingFaq,
};

function renderDocs(path) {
  const fn = ROUTES[path];
  if (!fn) return null;
  return fn();
}

module.exports = { renderDocs, ROUTES };
