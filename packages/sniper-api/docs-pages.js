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
            <a href="/docs/quickstart" class="${canonicalPath === '/docs/quickstart' ? 'active' : ''}">Quickstart</a>
          </div>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">API Reference</p>
          <div class="sidebar-links">
            <a href="/docs/api/check" class="${canonicalPath === '/docs/api/check' ? 'active' : ''}">/api/check</a>
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

const ROUTES = {
  '/docs': renderDocsOverview,
  '/docs/quickstart': renderDocsQuickstart,
  '/docs/api/check': renderDocsApiCheck,
  '/docs/pricing-faq': renderDocsPricingFaq,
};

function renderDocs(path) {
  const fn = ROUTES[path];
  if (!fn) return null;
  return fn();
}

module.exports = { renderDocs, ROUTES };
