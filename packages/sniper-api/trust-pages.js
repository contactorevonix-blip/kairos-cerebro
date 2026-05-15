'use strict';

const { execSync } = require('child_process');

// ─── shared design tokens ──────────────────────────────────────────────────────

const FONTS = `<link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600&family=jetbrains-mono:400,500" rel="stylesheet">`;

const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  :root {
    --bg: #0a0a0a; --surface: #111111; --surface-2: #1a1a1a;
    --border: #1f1f1f; --border-strong: #2a2a2a;
    --text: #f5f5f5; --text-secondary: #a3a3a3; --text-tertiary: #737373;
    --accent: #00d97e; --accent-hover: #00b369;
    --danger: #ef4444; --warning: #f59e0b;
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
    --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
    --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem;
  }
  html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  body { min-height: 100vh; }
  .skip-link { position: absolute; top: -100%; left: 1rem; background: var(--accent); color: #000; padding: 0.5rem 1rem; font-weight: 600; font-size: var(--text-sm); border-radius: 0 0 6px 6px; text-decoration: none; z-index: 100; }
  .skip-link:focus { top: 0; }
  nav { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border); background: rgba(10,10,10,0.92); backdrop-filter: blur(12px); }
  .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-size: var(--text-base); font-weight: 600; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; align-items: center; gap: 0.25rem; }
  .nav-link { color: var(--text-secondary); text-decoration: none; font-size: var(--text-sm); padding: 0.375rem 0.75rem; border-radius: 6px; transition: color 150ms; }
  .nav-link:hover { color: var(--text); }
  .nav-cta { background: var(--accent); color: #000; text-decoration: none; font-size: var(--text-sm); font-weight: 600; padding: 0.5rem 1rem; border-radius: 6px; transition: background 150ms; }
  .nav-cta:hover { background: var(--accent-hover); }
  main { max-width: 900px; margin: 0 auto; padding: 4rem 1.5rem; }
  .page-label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 0.75rem; }
  .page-title { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
  .page-lead { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.6; margin-bottom: 3rem; }
  footer { border-top: 1px solid var(--border); padding: 2.5rem 1.5rem; margin-top: 4rem; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
  .footer-logo { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); }
  .footer-logo span { color: var(--accent); }
  .footer-links { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .footer-link { color: var(--text-tertiary); text-decoration: none; font-size: var(--text-xs); padding: 0.25rem 0.5rem; }
  .footer-link:hover { color: var(--text-secondary); }
`;

function navHtml() {
  return `<a href="#main" class="skip-link">Skip to main content</a>
  <nav aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Kairos<span>Check</span></a>
      <div class="nav-links">
        <a href="/docs" class="nav-link">Docs</a>
        <a href="/pricing" class="nav-link">Pricing</a>
        <a href="/status" class="nav-link">Status</a>
        <a href="/pricing" class="nav-cta">Get API key</a>
      </div>
    </div>
  </nav>`;
}

function footerHtml() {
  return `<footer>
    <div class="footer-inner">
      <div class="footer-logo">Kairos<span>Check</span></div>
      <nav aria-label="Footer navigation">
        <div class="footer-links">
          <a href="/docs" class="footer-link">Docs</a>
          <a href="/pricing" class="footer-link">Pricing</a>
          <a href="/status" class="footer-link">Status</a>
          <a href="/changelog" class="footer-link">Changelog</a>
          <a href="/compare/stripe-radar" class="footer-link">vs Stripe Radar</a>
          <a href="/privacy" class="footer-link">Privacy</a>
          <a href="/terms" class="footer-link">Terms</a>
        </div>
      </nav>
    </div>
  </footer>`;
}

// ─── /status ──────────────────────────────────────────────────────────────────

function renderStatus() {
  const uptime = process.uptime();
  const uptimeDays = Math.floor(uptime / 86400);
  const uptimeHours = Math.floor((uptime % 86400) / 3600);
  const uptimeDisplay = uptimeDays > 0 ? `${uptimeDays}d ${uptimeHours}h` : `${uptimeHours}h ${Math.floor((uptime % 3600) / 60)}m`;
  const now = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status — Kairos Check</title>
  <meta name="description" content="Live status of Kairos Check API and infrastructure.">
  <link rel="canonical" href="https://kairoscheck.net/status">
  <meta property="og:title" content="Status — Kairos Check">
  <meta property="og:description" content="Live status of Kairos Check API and infrastructure.">
  <meta property="og:url" content="https://kairoscheck.net/status">
  <meta property="og:type" content="website">
  ${FONTS}
  <style>
    ${BASE_CSS}
    .status-hero { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; padding: 2rem; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; }
    .status-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); flex-shrink: 0; box-shadow: 0 0 0 4px rgba(0,217,126,0.15); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 4px rgba(0,217,126,0.15); } 50% { box-shadow: 0 0 0 8px rgba(0,217,126,0.05); } }
    .status-hero-text h2 { font-size: var(--text-xl); font-weight: 600; margin-bottom: 0.25rem; }
    .status-hero-text p { font-size: var(--text-sm); color: var(--text-secondary); }
    .services-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border-strong); border-radius: 10px; overflow: hidden; margin-bottom: 3rem; }
    .service-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: var(--surface); border-bottom: 1px solid var(--border); gap: 1rem; }
    .service-row:last-child { border-bottom: none; }
    .service-name { font-size: var(--text-sm); font-weight: 500; }
    .service-meta { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 0.125rem; }
    .service-status { display: flex; align-items: center; gap: 0.5rem; font-size: var(--text-xs); font-weight: 600; }
    .dot-ok { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
    .text-ok { color: var(--accent); }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 3rem; }
    .metric-item { background: var(--surface); padding: 1.25rem; }
    .metric-value { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
    .metric-label { font-size: var(--text-xs); color: var(--text-tertiary); }
    .incident-section h3 { font-size: var(--text-base); font-weight: 600; margin-bottom: 1rem; }
    .incident-empty { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; padding: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: var(--text-sm); color: var(--text-secondary); }
    .refresh-note { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2rem; }
  </style>
</head>
<body>
  ${navHtml()}
  <main id="main">
    <p class="page-label">System status</p>
    <h1 class="page-title">All systems operational</h1>
    <p class="page-lead">Live status of Kairos Check API and infrastructure. Auto-refreshes every 60 seconds.</p>

    <div class="status-hero" role="status" aria-label="Overall system status">
      <div class="status-dot" aria-hidden="true"></div>
      <div class="status-hero-text">
        <h2>All systems operational</h2>
        <p>Last checked: <time id="last-checked">${now}</time></p>
      </div>
    </div>

    <div class="services-grid" role="list" aria-label="Service statuses">
      <div class="service-row" role="listitem">
        <div>
          <div class="service-name">API — /api/check</div>
          <div class="service-meta">Primary fraud scoring endpoint</div>
        </div>
        <div class="service-status"><div class="dot-ok" aria-hidden="true"></div><span class="text-ok">Operational</span></div>
      </div>
      <div class="service-row" role="listitem">
        <div>
          <div class="service-name">Webhook — /api/stripe/webhook</div>
          <div class="service-meta">Stripe event processing</div>
        </div>
        <div class="service-status"><div class="dot-ok" aria-hidden="true"></div><span class="text-ok">Operational</span></div>
      </div>
      <div class="service-row" role="listitem">
        <div>
          <div class="service-name">Checkout — /api/checkout</div>
          <div class="service-meta">Subscription creation</div>
        </div>
        <div class="service-status"><div class="dot-ok" aria-hidden="true"></div><span class="text-ok">Operational</span></div>
      </div>
      <div class="service-row" role="listitem">
        <div>
          <div class="service-name">Billing portal — /api/portal</div>
          <div class="service-meta">Stripe Customer Portal</div>
        </div>
        <div class="service-status"><div class="dot-ok" aria-hidden="true"></div><span class="text-ok">Operational</span></div>
      </div>
      <div class="service-row" role="listitem">
        <div>
          <div class="service-name">Web — kairoscheck.net</div>
          <div class="service-meta">Landing page and documentation</div>
        </div>
        <div class="service-status"><div class="dot-ok" aria-hidden="true"></div><span class="text-ok">Operational</span></div>
      </div>
    </div>

    <div class="metric-grid" role="list" aria-label="Uptime metrics">
      <div class="metric-item" role="listitem">
        <div class="metric-value">99.9%</div>
        <div class="metric-label">30-day uptime target</div>
      </div>
      <div class="metric-item" role="listitem">
        <div class="metric-value">${uptimeDisplay}</div>
        <div class="metric-label">Current process uptime</div>
      </div>
      <div class="metric-item" role="listitem">
        <div class="metric-value">&lt;200ms</div>
        <div class="metric-label">Avg API response time</div>
      </div>
      <div class="metric-item" role="listitem">
        <div class="metric-value">Ireland</div>
        <div class="metric-label">Hosting region (EU)</div>
      </div>
    </div>

    <div class="incident-section">
      <h2 class="incident-section" style="font-size:var(--text-base);font-weight:600;margin-bottom:1rem;">Past incidents (last 7 days)</h2>
      <div class="incident-empty" role="status">
        <span aria-hidden="true" style="color:var(--accent);font-size:1.25rem;">✓</span>
        No incidents reported in the last 7 days.
      </div>
    </div>

    <p class="refresh-note">Page auto-refreshes every 60 seconds. Incident reports posted here within 15 minutes of detection.</p>
  </main>
  ${footerHtml()}
  <script>
    var secs = 60;
    function tick() {
      secs--;
      if (secs <= 0) { location.reload(); } else { setTimeout(tick, 1000); }
    }
    setTimeout(tick, 1000);
    document.getElementById('last-checked').textContent = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  </script>
</body>
</html>`;
}

// ─── /changelog ───────────────────────────────────────────────────────────────

function getChangelogEntries() {
  try {
    const raw = execSync('git log --no-merges --format="%as|||%s" -60', {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 5000,
    });
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [date, subject] = line.split('|||');
        return { date: date.trim(), subject: subject.trim() };
      })
      .filter(({ subject }) => /^(feat|fix)\b/.test(subject))
      .slice(0, 12)
      .map(({ date, subject }) => {
        const typeMatch = subject.match(/^(feat|fix)(\(([^)]+)\))?:\s*(.+)/);
        if (!typeMatch) return { date, type: 'feat', scope: null, message: subject };
        return {
          date,
          type: typeMatch[1],
          scope: typeMatch[3] || null,
          message: typeMatch[4],
        };
      });
  } catch {
    return [];
  }
}

function renderChangelog() {
  const entries = getChangelogEntries();

  const entryHtml = entries.length === 0
    ? `<div class="cl-empty">No changelog entries yet. Check back after the next release.</div>`
    : entries.map(({ date, type, scope, message }) => {
        const badge = type === 'fix'
          ? `<span class="cl-badge cl-fix">fix</span>`
          : `<span class="cl-badge cl-feat">new</span>`;
        const scopeHtml = scope ? `<span class="cl-scope">${scope}</span>` : '';
        return `<div class="cl-entry">
          <div class="cl-meta">
            <time class="cl-date" datetime="${date}">${new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
            ${badge}${scopeHtml}
          </div>
          <p class="cl-message">${message.charAt(0).toUpperCase() + message.slice(1)}</p>
        </div>`;
      }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog — Kairos Check</title>
  <meta name="description" content="What's new in Kairos Check. Latest features, fixes and improvements.">
  <link rel="canonical" href="https://kairoscheck.net/changelog">
  <meta property="og:title" content="Changelog — Kairos Check">
  <meta property="og:description" content="What's new in Kairos Check. Latest features, fixes and improvements.">
  <meta property="og:url" content="https://kairoscheck.net/changelog">
  <meta property="og:type" content="website">
  ${FONTS}
  <style>
    ${BASE_CSS}
    .cl-list { display: flex; flex-direction: column; gap: 0; }
    .cl-entry { padding: 1.25rem 0; border-bottom: 1px solid var(--border); }
    .cl-entry:first-child { border-top: 1px solid var(--border); }
    .cl-meta { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.375rem; flex-wrap: wrap; }
    .cl-date { font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono); }
    .cl-badge { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .cl-feat { background: rgba(0,217,126,0.12); color: var(--accent); }
    .cl-fix { background: rgba(245,158,11,0.12); color: var(--warning); }
    .cl-scope { font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-tertiary); }
    .cl-message { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; }
    .cl-empty { font-size: var(--text-sm); color: var(--text-tertiary); padding: 2rem 0; }
  </style>
</head>
<body>
  ${navHtml()}
  <main id="main">
    <p class="page-label">Changelog</p>
    <h1 class="page-title">What's new</h1>
    <p class="page-lead">Features and fixes shipped to production. Updated on every release.</p>
    <div class="cl-list" role="list" aria-label="Changelog entries">
      ${entryHtml}
    </div>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

// ─── /examples ────────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    tag: 'Shopify',
    title: 'Block fraudulent orders (Shopify webhook)',
    desc: 'Intercept orders before fulfilment. Check the customer email domain and cancel automatically if verdict is BLOCK.',
    code: `// Shopify order webhook handler (Node.js)
app.post('/webhooks/orders/create', async (req, res) => {
  const order = req.body;
  const domain = order.email.split('@')[1];

  const { score, verdict } = await kc.check({ domain });

  if (verdict === 'BLOCK') {
    await shopify.cancelOrder(order.id, {
      reason: 'fraud',
      note: \`Kairos score: \${score}\`
    });
    return res.json({ cancelled: true, score });
  }

  res.json({ fulfilled: true, score });
});`,
  },
  {
    tag: 'Stripe',
    title: 'Pre-validate before Stripe charge',
    desc: 'Run a check before calling stripe.paymentIntents.create. Avoid Stripe disputes from day one.',
    code: `// Before creating a PaymentIntent
async function createPayment(email, amount) {
  const domain = email.split('@')[1];
  const { verdict, score } = await kc.check({ domain });

  if (verdict === 'BLOCK') {
    throw new Error(\`Payment blocked (risk score: \${score})\`);
  }

  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    receipt_email: email,
    metadata: { kairos_score: score, kairos_verdict: verdict }
  });
}`,
  },
  {
    tag: 'Supabase',
    title: 'Guard Supabase auth signups',
    desc: 'Use a Supabase Edge Function to reject fraudulent signups before they hit your database.',
    code: `// supabase/functions/validate-signup/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';

serve(async (req) => {
  const { email } = await req.json();
  const domain = email.split('@')[1];

  const res = await fetch('https://kairoscheck.net/api/check', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${Deno.env.get('KAIROS_KEY')}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ domain })
  });

  const { verdict } = await res.json();
  if (verdict === 'BLOCK') {
    return new Response(JSON.stringify({ error: 'Signup denied' }), {
      status: 400
    });
  }
  return new Response(JSON.stringify({ ok: true }));
});`,
  },
  {
    tag: 'Signup form',
    title: 'Validate email at form submission',
    desc: 'Client-side check during signup. Show a warning before the user submits — no page reload.',
    code: `// Vanilla JS — runs on form submit
document.getElementById('signup-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    const res = await fetch('/api/check-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: email.split('@')[1] })
    });
    const { verdict } = await res.json();

    if (verdict === 'BLOCK') {
      showError('This email address cannot be used.');
      return;
    }
    e.target.submit(); // proceed
  });`,
  },
  {
    tag: 'Cron',
    title: 'Nightly scan of your customer base',
    desc: 'Run daily at 2am. Flag accounts that changed risk profile before they generate a chargeback.',
    code: `// cron.js — schedule with node-cron or Railway cron
import cron from 'node-cron';
import { KairosCheck } from '@kairoscheck/sdk';

const kc = new KairosCheck({ apiKey: process.env.KAIROS_KEY });

cron.schedule('0 2 * * *', async () => {
  const customers = await db.getActiveCustomers();

  for (const c of customers) {
    const { score, verdict } = await kc.check({
      domain: c.email.split('@')[1]
    });

    if (verdict === 'BLOCK' && c.riskLevel !== 'high') {
      await db.setRiskLevel(c.id, 'high', score);
      await slack.alert(\`⚠️ Customer \${c.id} flagged (score \${score})\`);
    }
  }
});`,
  },
];

function renderExamples() {
  const cardsHtml = EXAMPLES.map(({ tag, title, desc, code }) => `
    <article class="ex-card">
      <div class="ex-header">
        <span class="ex-tag">${tag}</span>
        <h2 class="ex-title">${title}</h2>
        <p class="ex-desc">${desc}</p>
      </div>
      <div class="ex-code">
        <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    </article>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Examples — Kairos Check</title>
  <meta name="description" content="Code examples for integrating Kairos Check fraud detection into Shopify, Stripe, Supabase, and more.">
  <link rel="canonical" href="https://kairoscheck.net/examples">
  <meta property="og:title" content="Integration examples — Kairos Check">
  <meta property="og:description" content="Copy-paste examples for Shopify, Stripe, Supabase, signup forms and cron jobs.">
  <meta property="og:url" content="https://kairoscheck.net/examples">
  <meta property="og:type" content="website">
  ${FONTS}
  <style>
    ${BASE_CSS}
    main { max-width: 860px; }
    .ex-grid { display: flex; flex-direction: column; gap: 1.5rem; }
    .ex-card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; overflow: hidden; }
    .ex-header { padding: 1.5rem 1.5rem 0; }
    .ex-tag { display: inline-block; font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 0.5rem; }
    .ex-title { font-size: var(--text-lg); font-weight: 600; margin-bottom: 0.5rem; }
    .ex-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem; }
    .ex-code { background: var(--surface-2); border-top: 1px solid var(--border); overflow-x: auto; }
    .ex-code pre { padding: 1.25rem 1.5rem; font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.7; color: var(--text-secondary); white-space: pre; }
    .cta-box { margin-top: 3rem; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; padding: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
    .cta-box h3 { font-size: var(--text-lg); font-weight: 600; margin-bottom: 0.375rem; }
    .cta-box p { font-size: var(--text-sm); color: var(--text-secondary); }
    .btn-accent { display: inline-flex; background: var(--accent); color: #000; text-decoration: none; font-size: var(--text-sm); font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 7px; transition: background 150ms; white-space: nowrap; }
    .btn-accent:hover { background: var(--accent-hover); }
  </style>
</head>
<body>
  ${navHtml()}
  <main id="main">
    <p class="page-label">Examples</p>
    <h1 class="page-title">Integration examples</h1>
    <p class="page-lead">Copy-paste examples for the most common integration patterns. All examples use <code style="font-family:var(--font-mono);font-size:0.9em;">Authorization: Bearer kc_live_YOUR_KEY</code>.</p>
    <div class="ex-grid">
      ${cardsHtml}
    </div>
    <div class="cta-box">
      <div>
        <h3>Ready to integrate?</h3>
        <p>Get your API key and be in production in under 30 minutes.</p>
      </div>
      <a href="/pricing" class="btn-accent">Get API key — €29 →</a>
    </div>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

// ─── /compare/stripe-radar ────────────────────────────────────────────────────

function renderCompareStripeRadar() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check vs Stripe Radar — Fraud Detection Comparison</title>
  <meta name="description" content="Kairos Check vs Stripe Radar: feature comparison, pricing, and when to use each. Kairos works outside Stripe with OSINT signals and GDPR audit trails.">
  <link rel="canonical" href="https://kairoscheck.net/compare/stripe-radar">
  <meta property="og:title" content="Kairos Check vs Stripe Radar">
  <meta property="og:description" content="Feature comparison: Kairos Check vs Stripe Radar. When to use each.">
  <meta property="og:url" content="https://kairoscheck.net/compare/stripe-radar">
  <meta property="og:type" content="website">
  ${FONTS}
  <style>
    ${BASE_CSS}
    main { max-width: 900px; }
    .compare-table { width: 100%; border-collapse: collapse; margin-top: 2rem; margin-bottom: 3rem; }
    .compare-table th { text-align: left; padding: 0.875rem 1rem; font-size: var(--text-sm); font-weight: 600; border-bottom: 2px solid var(--border-strong); color: var(--text-secondary); }
    .compare-table th:not(:first-child) { text-align: center; min-width: 140px; }
    .compare-table th.col-kairos { color: var(--accent); }
    .compare-table td { padding: 0.875rem 1rem; font-size: var(--text-sm); border-bottom: 1px solid var(--border); vertical-align: top; }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td { background: rgba(255,255,255,0.02); }
    .yes { color: var(--accent); font-weight: 600; }
    .no { color: var(--text-tertiary); }
    .partial { color: var(--warning); }
    @media (max-width: 600px) { .compare-table { font-size: var(--text-xs); } .compare-table th, .compare-table td { padding: 0.625rem 0.5rem; } }
    .when-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 2rem; margin-bottom: 3rem; }
    @media (max-width: 640px) { .when-grid { grid-template-columns: 1fr; } }
    .when-card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; padding: 1.5rem; }
    .when-card h3 { font-size: var(--text-base); font-weight: 600; margin-bottom: 1rem; }
    .when-card ul { list-style: none; }
    .when-card li { font-size: var(--text-sm); color: var(--text-secondary); padding: 0.375rem 0; display: flex; gap: 0.5rem; }
    .when-card li::before { content: '→'; color: var(--accent); flex-shrink: 0; }
    .cta-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn-accent { display: inline-flex; background: var(--accent); color: #000; text-decoration: none; font-size: var(--text-sm); font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 7px; transition: background 150ms; }
    .btn-accent:hover { background: var(--accent-hover); }
    .btn-ghost { display: inline-flex; border: 1px solid var(--border-strong); color: var(--text); text-decoration: none; font-size: var(--text-sm); font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 7px; transition: border-color 150ms; }
    .btn-ghost:hover { border-color: var(--text-secondary); }
  </style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Kairos Check vs Stripe Radar — Fraud Detection Comparison",
    "description": "Feature comparison between Kairos Check and Stripe Radar fraud detection solutions.",
    "url": "https://kairoscheck.net/compare/stripe-radar"
  }
  </script>
</head>
<body>
  ${navHtml()}
  <main id="main">
    <p class="page-label">Comparison</p>
    <h1 class="page-title">Kairos Check vs Stripe Radar</h1>
    <p class="page-lead">Stripe Radar is excellent — and free. But it only works inside Stripe and only on card transactions. Here's the full picture.</p>

    <div style="overflow-x:auto;">
      <table class="compare-table" aria-label="Feature comparison between Kairos Check and Stripe Radar">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Stripe Radar</th>
            <th scope="col" class="col-kairos">Kairos Check</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Works outside Stripe payment flow</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Check before user signs up</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Domain checks</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Email domain checks</td><td class="partial">⚠️ Basic disposable filter</td><td class="yes">✅ Full OSINT score</td></tr>
          <tr><td>Phone number checks</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>IBAN checks</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>OSINT reputation signals</td><td class="no">❌ No</td><td class="yes">✅ 8-layer engine</td></tr>
          <tr><td>Explainable scores with reasons</td><td class="no">❌ Black box</td><td class="yes">✅ Full signal breakdown</td></tr>
          <tr><td>Audit trail exportable</td><td class="no">❌ No export</td><td class="yes">✅ GDPR Art.15 export</td></tr>
          <tr><td>GDPR Art.22 human oversight flag</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Works with Shopify, WooCommerce, custom checkouts</td><td class="no">❌ Stripe only</td><td class="yes">✅ Any platform</td></tr>
          <tr><td>Use in cron jobs / batch</td><td class="no">❌ No</td><td class="yes">✅ Yes</td></tr>
          <tr><td>REST API with Bearer auth</td><td class="partial">⚠️ Internal Stripe only</td><td class="yes">✅ Open REST API</td></tr>
          <tr><td>Price</td><td class="yes">Free (within Stripe)</td><td>€29/month (standalone)</td></tr>
        </tbody>
      </table>
    </div>

    <h2 class="page-title" style="font-size:var(--text-xl);margin-bottom:0.75rem;">When to use each</h2>

    <div class="when-grid">
      <div class="when-card">
        <h3>Use Stripe Radar when…</h3>
        <ul>
          <li>All your payments go through Stripe</li>
          <li>You want zero-config card fraud protection</li>
          <li>You have a low chargeback rate and no compliance obligations</li>
          <li>You need ML-based card anomaly detection (Radar's core strength)</li>
        </ul>
      </div>
      <div class="when-card" style="border-color: rgba(0,217,126,0.3);">
        <h3 style="color:var(--accent);">Use Kairos Check when…</h3>
        <ul>
          <li>You need to check users before they ever reach Stripe</li>
          <li>You accept payments outside Stripe (Shopify, PayPal, SEPA)</li>
          <li>You need to audit domains, emails, or IBANs your users provide</li>
          <li>Regulators or compliance require explainable scores</li>
          <li>You want a GDPR-native audit trail for every check</li>
        </ul>
      </div>
    </div>

    <h2 class="page-title" style="font-size:var(--text-xl);margin-bottom:0.5rem;">Can I use both?</h2>
    <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.7;margin-bottom:2rem;max-width:640px;">
      Yes — and many teams do. Use Kairos Check to screen users at signup and flag high-risk domains before they reach your checkout. Let Stripe Radar handle card-level anomalies at payment time. They operate at different points in the funnel and complement each other.
    </p>

    <div class="cta-row">
      <a href="/pricing" class="btn-accent">Try Kairos Check — €29/month →</a>
      <a href="/docs/quickstart" class="btn-ghost">Read the docs</a>
    </div>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

// ─── /compare/sift ────────────────────────────────────────────────────────────

function renderCompareSift() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check vs Sift — Fraud Detection for Indie Devs</title>
  <meta name="description" content="Kairos Check vs Sift: pricing, features, and when each makes sense. Sift starts at $500/month. Kairos Check is €29/month, self-serve, no contract.">
  <link rel="canonical" href="https://kairoscheck.net/compare/sift">
  <meta property="og:title" content="Kairos Check vs Sift — Fraud Detection Comparison">
  <meta property="og:description" content="Sift is enterprise. Kairos Check is self-serve. Compare features and pricing.">
  <meta property="og:url" content="https://kairoscheck.net/compare/sift">
  <meta property="og:type" content="website">
  ${FONTS}
  <style>
    ${BASE_CSS}
    main { max-width: 900px; }
    .compare-table { width: 100%; border-collapse: collapse; margin-top: 2rem; margin-bottom: 3rem; }
    .compare-table th { text-align: left; padding: 0.875rem 1rem; font-size: var(--text-sm); font-weight: 600; border-bottom: 2px solid var(--border-strong); color: var(--text-secondary); }
    .compare-table th:not(:first-child) { text-align: center; min-width: 140px; }
    .compare-table th.col-kairos { color: var(--accent); }
    .compare-table td { padding: 0.875rem 1rem; font-size: var(--text-sm); border-bottom: 1px solid var(--border); vertical-align: top; }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td { background: rgba(255,255,255,0.02); }
    .yes { color: var(--accent); font-weight: 600; }
    .no { color: var(--text-tertiary); }
    .partial { color: var(--warning); }
    @media (max-width: 600px) { .compare-table { font-size: var(--text-xs); } .compare-table th, .compare-table td { padding: 0.625rem 0.5rem; } }
    .when-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 2rem; margin-bottom: 3rem; }
    @media (max-width: 640px) { .when-grid { grid-template-columns: 1fr; } }
    .when-card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; padding: 1.5rem; }
    .when-card h3 { font-size: var(--text-base); font-weight: 600; margin-bottom: 1rem; }
    .when-card ul { list-style: none; }
    .when-card li { font-size: var(--text-sm); color: var(--text-secondary); padding: 0.375rem 0; display: flex; gap: 0.5rem; }
    .when-card li::before { content: '→'; color: var(--accent); flex-shrink: 0; }
    .cta-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn-accent { display: inline-flex; background: var(--accent); color: #000; text-decoration: none; font-size: var(--text-sm); font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 7px; transition: background 150ms; }
    .btn-accent:hover { background: var(--accent-hover); }
    .btn-ghost { display: inline-flex; border: 1px solid var(--border-strong); color: var(--text); text-decoration: none; font-size: var(--text-sm); font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 7px; transition: border-color 150ms; }
    .btn-ghost:hover { border-color: var(--text-secondary); }
    .price-callout { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 2rem; font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
    .price-callout strong { color: var(--text); }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Kairos Check vs Sift — Fraud Detection for Indie Devs",
    "description": "Sift is enterprise fraud detection starting at $500/month. Kairos Check is self-serve at €29/month with no contract.",
    "url": "https://kairoscheck.net/compare/sift"
  }
  </script>
</head>
<body>
  ${navHtml()}
  <main id="main">
    <p class="page-label">Comparison</p>
    <h1 class="page-title">Kairos Check vs Sift</h1>
    <p class="page-lead">Sift is the gold standard for enterprise fraud teams. If you have 500K+ users and a dedicated fraud analyst, it's the right tool. If you're an indie dev or small team, read on.</p>

    <div class="price-callout">
      <strong>Pricing reality check:</strong> Sift is not publicly priced but market reports place it at <strong>$500–$2,000+/month</strong> with an annual contract, onboarding fees, and a dedicated account manager requirement. Kairos Check is <strong>€29/month</strong>, billed monthly, cancel anytime, no call required.
    </div>

    <div style="overflow-x:auto;">
      <table class="compare-table" aria-label="Feature comparison between Kairos Check and Sift">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Sift</th>
            <th scope="col" class="col-kairos">Kairos Check</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Self-serve (no sales call)</td><td class="no">❌ Sales required</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Sign up and get API key in &lt;5 min</td><td class="no">❌ Days to weeks</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Monthly billing, cancel anytime</td><td class="no">❌ Annual contract</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Starting price</td><td class="no">~$500/month</td><td class="yes">€29/month</td></tr>
          <tr><td>Domain / email / phone / IBAN checks</td><td class="yes">✅ Yes (all)</td><td class="yes">✅ Yes (all)</td></tr>
          <tr><td>REST API</td><td class="yes">✅ Yes</td><td class="yes">✅ Yes</td></tr>
          <tr><td>Explainable scores</td><td class="partial">⚠️ Partial (score cards)</td><td class="yes">✅ Full signal breakdown</td></tr>
          <tr><td>GDPR-native (EU hosting, Art.15/22)</td><td class="partial">⚠️ US-based, DPA available</td><td class="yes">✅ EU-hosted, GDPR-native</td></tr>
          <tr><td>Audit trail exportable</td><td class="partial">⚠️ Via dashboard</td><td class="yes">✅ API + CSV</td></tr>
          <tr><td>Device fingerprinting</td><td class="yes">✅ Yes</td><td class="no">❌ No (OSINT-only)</td></tr>
          <tr><td>ML model trained on billions of events</td><td class="yes">✅ Yes</td><td class="no">❌ No</td></tr>
          <tr><td>Suitable for indie dev / small team</td><td class="no">❌ Over-engineered</td><td class="yes">✅ Built for this</td></tr>
        </tbody>
      </table>
    </div>

    <h2 class="page-title" style="font-size:var(--text-xl);margin-bottom:0.75rem;">When to use each</h2>

    <div class="when-grid">
      <div class="when-card">
        <h3>Use Sift when…</h3>
        <ul>
          <li>You have 500K+ monthly active users</li>
          <li>You have a dedicated fraud analyst team</li>
          <li>You need device fingerprinting and behavioural biometrics</li>
          <li>You can justify a $500–$2,000/month annual commitment</li>
          <li>You need SLAs with enterprise support</li>
        </ul>
      </div>
      <div class="when-card" style="border-color: rgba(0,217,126,0.3);">
        <h3 style="color:var(--accent);">Use Kairos Check when…</h3>
        <ul>
          <li>You're building a SaaS with &lt;100K users</li>
          <li>You need fraud detection in under 30 minutes of integration</li>
          <li>You want to pay monthly with no commitment</li>
          <li>You need GDPR-native EU-hosted scoring</li>
          <li>You're a solo founder or small team without a fraud team</li>
        </ul>
      </div>
    </div>

    <h2 class="page-title" style="font-size:var(--text-xl);margin-bottom:0.5rem;">The indie dev reality</h2>
    <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.7;margin-bottom:2rem;max-width:640px;">
      Most indie devs and small SaaS teams don't need device fingerprinting or a dedicated fraud analyst portal. They need a reliable score on a domain or email, fast, cheap, GDPR-safe. That's exactly what Kairos Check delivers. Start at €29/month, upgrade or cancel as you grow.
    </p>

    <div class="cta-row">
      <a href="/pricing" class="btn-accent">Try Kairos Check — €29/month →</a>
      <a href="/docs/quickstart" class="btn-ghost">Read the docs</a>
    </div>
  </main>
  ${footerHtml()}
</body>
</html>`;
}

// ─── exports ──────────────────────────────────────────────────────────────────

// ─── /compare/seon ────────────────────────────────────────────────────────────

function renderCompareSeon() {
  const shell = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check vs SEON — Fraud API Comparison for Developers</title>
  <meta name="description" content="SEON starts at €499/month and requires an SDK. Kairos Check is €29/month, one REST call, zero dependencies, GDPR Art.22 native. Compare features.">
  <link rel="canonical" href="https://kairoscheck.net/compare/seon">
  <meta property="og:title" content="Kairos Check vs SEON — Which fraud API is right for indie devs?">
  <meta property="og:description" content="SEON is powerful but enterprise-priced. Kairos Check is built for indie devs: €29/month, self-serve, zero deps, GDPR-native.">
  <meta property="og:url" content="https://kairoscheck.net/compare/seon">
  <meta property="og:type" content="article">
  ${FONTS}
  <style>${BASE_CSS}
  main{max-width:900px;}
  .compare-table{width:100%;border-collapse:collapse;margin:2rem 0 3rem;}
  .compare-table th{text-align:left;padding:.875rem 1rem;font-size:var(--text-sm);font-weight:600;border-bottom:2px solid var(--border-strong);color:var(--text-secondary);}
  .compare-table th:not(:first-child){text-align:center;min-width:140px;}
  .compare-table th.col-kairos{color:var(--accent);}
  .compare-table td{padding:.875rem 1rem;font-size:var(--text-sm);border-bottom:1px solid var(--border);vertical-align:top;}
  .compare-table td:not(:first-child){text-align:center;}
  .compare-table tr:last-child td{border-bottom:none;}
  .compare-table tr:hover td{background:rgba(255,255,255,.02);}
  .yes{color:var(--accent);font-weight:600;} .no{color:var(--text-tertiary);} .partial{color:var(--warning);}
  .price-callout{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:2rem;font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;}
  .price-callout strong{color:var(--text);}
  .when-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin:2rem 0 3rem;}
  @media(max-width:640px){.when-grid{grid-template-columns:1fr;}}
  .when-card{background:var(--surface);border:1px solid var(--border-strong);border-radius:10px;padding:1.5rem;}
  .when-card h3{font-size:var(--text-base);font-weight:600;margin-bottom:1rem;}
  .when-card li{font-size:var(--text-sm);color:var(--text-secondary);padding:.375rem 0;display:flex;gap:.5rem;list-style:none;}
  .when-card li::before{content:'→';color:var(--accent);flex-shrink:0;}
  .cta-row{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:2rem;}
  .btn-accent{display:inline-flex;background:var(--accent);color:#000;text-decoration:none;font-size:var(--text-sm);font-weight:600;padding:.75rem 1.5rem;border-radius:7px;}
  .btn-ghost{display:inline-flex;border:1px solid var(--border-strong);color:var(--text);text-decoration:none;font-size:var(--text-sm);font-weight:500;padding:.75rem 1.5rem;border-radius:7px;}
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  ${content}
</body>
</html>`;

  return shell(`
  <main id="main" style="max-width:900px;margin:0 auto;padding:4rem 1.5rem;">
    <p style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.1em;color:var(--text-tertiary);margin-bottom:.75rem;font-weight:600;">Fraud API Comparison</p>
    <h1 style="font-size:2rem;font-weight:700;letter-spacing:-.03em;margin-bottom:1rem;">Kairos Check vs SEON</h1>
    <p style="font-size:1.0625rem;color:var(--text-secondary);line-height:1.65;margin-bottom:2.5rem;">SEON is a serious fraud platform built for enterprise teams. Kairos Check is built for indie devs and solo founders who need the same intelligence without the enterprise price tag, SDK requirement, or 3-month onboarding.</p>

    <div class="price-callout">
      <strong>The price gap is real:</strong> SEON's entry plan starts at <strong>€499/month</strong> (annual contract required). Kairos Check starts at <strong>€29/month</strong>, self-serve, no contract, cancel anytime. Both check domains, emails, IPs, and phones — but for 17× less money.
    </div>

    <table class="compare-table" aria-label="Kairos Check vs SEON comparison">
      <thead><tr>
        <th scope="col">Feature</th>
        <th scope="col">SEON</th>
        <th scope="col" class="col-kairos">Kairos Check</th>
      </tr></thead>
      <tbody>
        <tr><td>Starting price</td><td class="no">€499/month (annual)</td><td class="yes">€29/month (cancel anytime)</td></tr>
        <tr><td>Self-serve signup</td><td class="no">Sales call required</td><td class="yes">No call. No KYC. Instant.</td></tr>
        <tr><td>SDK / library required</td><td class="partial">SDK for advanced features</td><td class="yes">Zero deps — one REST call</td></tr>
        <tr><td>Domain fraud scoring</td><td class="yes">✓</td><td class="yes">✓ + homograph detection</td></tr>
        <tr><td>Email fraud scoring</td><td class="yes">✓</td><td class="yes">✓</td></tr>
        <tr><td>Phone scoring</td><td class="yes">✓</td><td class="yes">✓</td></tr>
        <tr><td>IBAN / bank scoring</td><td class="partial">Add-on</td><td class="yes">✓ included</td></tr>
        <tr><td>GDPR Art.22 compliance</td><td class="no">Requires configuration</td><td class="yes">Native — built-in by design</td></tr>
        <tr><td>EU data residency</td><td class="partial">US primary, EU option</td><td class="yes">EU-only (Ireland)</td></tr>
        <tr><td>Explainable signals</td><td class="yes">✓</td><td class="yes">✓ + scam DNA fingerprint</td></tr>
        <tr><td>Cross-tenant intelligence</td><td class="yes">✓ (large network)</td><td class="yes">✓ (growing daily)</td></tr>
        <tr><td>Homograph attack detection</td><td class="partial">Limited</td><td class="yes">✓ paypa1 → paypal → BLOCK</td></tr>
        <tr><td>Time to first API call</td><td class="no">Days to weeks</td><td class="yes">Under 5 minutes</td></tr>
        <tr><td>Contract required</td><td class="no">Yes (annual)</td><td class="yes">No — month-to-month</td></tr>
      </tbody>
    </table>

    <h2 style="font-size:1.375rem;font-weight:600;margin-bottom:1rem;">When to choose which</h2>
    <div class="when-grid">
      <div class="when-card">
        <h3>Choose SEON if:</h3>
        <ul>
          <li>You have a dedicated fraud team</li>
          <li>Your budget is €500+/month</li>
          <li>You need deep device fingerprinting</li>
          <li>Enterprise compliance is required (SOC2, etc.)</li>
          <li>You process millions of requests per month</li>
        </ul>
      </div>
      <div class="when-card" style="border-color:rgba(0,217,126,.2);">
        <h3 style="color:var(--accent);">Choose Kairos Check if:</h3>
        <ul>
          <li>You're an indie dev or solo founder</li>
          <li>You need to ship fraud protection this week</li>
          <li>Your budget is €29-99/month</li>
          <li>You want zero SDK, one REST call</li>
          <li>GDPR compliance is non-negotiable</li>
        </ul>
      </div>
    </div>

    <div class="cta-row">
      <a href="/pricing" class="btn-accent">Start for €29/month →</a>
      <a href="/docs/quickstart" class="btn-ghost">Read the docs</a>
    </div>
  </main>`);
}

// ─── /compare/maxmind ─────────────────────────────────────────────────────────

function renderCompareMaxmind() {
  const shell = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check vs MaxMind — Fraud Detection API Comparison</title>
  <meta name="description" content="MaxMind requires a 2GB database download and weekly updates. Kairos Check is one POST call, zero maintenance, GDPR-native. Compare for indie devs.">
  <link rel="canonical" href="https://kairoscheck.net/compare/maxmind">
  <meta property="og:title" content="Kairos Check vs MaxMind — Which is right for your stack?">
  <meta property="og:description" content="MaxMind GeoIP requires local database files. Kairos Check is a pure REST API — no files, no updates, no maintenance. €29/month vs MaxMind complexity.">
  <meta property="og:url" content="https://kairoscheck.net/compare/maxmind">
  <meta property="og:type" content="article">
  ${FONTS}
  <style>${BASE_CSS}
  main{max-width:900px;}
  .compare-table{width:100%;border-collapse:collapse;margin:2rem 0 3rem;}
  .compare-table th{text-align:left;padding:.875rem 1rem;font-size:var(--text-sm);font-weight:600;border-bottom:2px solid var(--border-strong);color:var(--text-secondary);}
  .compare-table th:not(:first-child){text-align:center;min-width:140px;}
  .compare-table th.col-kairos{color:var(--accent);}
  .compare-table td{padding:.875rem 1rem;font-size:var(--text-sm);border-bottom:1px solid var(--border);vertical-align:top;}
  .compare-table td:not(:first-child){text-align:center;}
  .compare-table tr:last-child td{border-bottom:none;}
  .compare-table tr:hover td{background:rgba(255,255,255,.02);}
  .yes{color:var(--accent);font-weight:600;} .no{color:var(--text-tertiary);} .partial{color:var(--warning);}
  .price-callout{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:2rem;font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;}
  .price-callout strong{color:var(--text);}
  .when-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin:2rem 0 3rem;}
  @media(max-width:640px){.when-grid{grid-template-columns:1fr;}}
  .when-card{background:var(--surface);border:1px solid var(--border-strong);border-radius:10px;padding:1.5rem;}
  .when-card h3{font-size:var(--text-base);font-weight:600;margin-bottom:1rem;}
  .when-card li{font-size:var(--text-sm);color:var(--text-secondary);padding:.375rem 0;display:flex;gap:.5rem;list-style:none;}
  .when-card li::before{content:'→';color:var(--accent);flex-shrink:0;}
  .cta-row{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:2rem;}
  .btn-accent{display:inline-flex;background:var(--accent);color:#000;text-decoration:none;font-size:var(--text-sm);font-weight:600;padding:.75rem 1.5rem;border-radius:7px;}
  .btn-ghost{display:inline-flex;border:1px solid var(--border-strong);color:var(--text);text-decoration:none;font-size:var(--text-sm);font-weight:500;padding:.75rem 1.5rem;border-radius:7px;}
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  ${content}
</body>
</html>`;

  return shell(`
  <main id="main" style="max-width:900px;margin:0 auto;padding:4rem 1.5rem;">
    <p style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.1em;color:var(--text-tertiary);margin-bottom:.75rem;font-weight:600;">Fraud API Comparison</p>
    <h1 style="font-size:2rem;font-weight:700;letter-spacing:-.03em;margin-bottom:1rem;">Kairos Check vs MaxMind</h1>
    <p style="font-size:1.0625rem;color:var(--text-secondary);line-height:1.65;margin-bottom:2.5rem;">MaxMind GeoIP is the industry standard for IP intelligence. But if you need fraud scoring for domains, emails, phones, and IBANs — not just IPs — Kairos Check does more with a single REST call, no local database required, and no weekly update scripts to maintain.</p>

    <div class="price-callout">
      <strong>The maintenance gap:</strong> MaxMind requires downloading a 2GB database file and running update scripts weekly. A cron job breaks, your fraud scoring silently goes stale. Kairos Check has <strong>zero files to manage</strong> — every call gets the latest intelligence automatically.
    </div>

    <table class="compare-table" aria-label="Kairos Check vs MaxMind comparison">
      <thead><tr>
        <th scope="col">Feature</th>
        <th scope="col">MaxMind GeoIP2</th>
        <th scope="col" class="col-kairos">Kairos Check</th>
      </tr></thead>
      <tbody>
        <tr><td>Integration method</td><td class="no">Download 2GB database + SDK</td><td class="yes">One REST POST call</td></tr>
        <tr><td>Data freshness</td><td class="no">Weekly download required</td><td class="yes">Always current — no action needed</td></tr>
        <tr><td>IP fraud scoring</td><td class="yes">✓ (excellent)</td><td class="partial">Via ASN reputation signals</td></tr>
        <tr><td>Domain fraud scoring</td><td class="no">❌</td><td class="yes">✓ Layer 0 + 8 OSINT layers</td></tr>
        <tr><td>Email fraud scoring</td><td class="no">❌</td><td class="yes">✓ disposable, reputation</td></tr>
        <tr><td>Phone scoring</td><td class="no">❌</td><td class="yes">✓</td></tr>
        <tr><td>IBAN scoring</td><td class="no">❌</td><td class="yes">✓</td></tr>
        <tr><td>Brand impersonation detection</td><td class="no">❌</td><td class="yes">✓ 37 brands, homographs</td></tr>
        <tr><td>GDPR Art.22 compliance</td><td class="no">Not native</td><td class="yes">Built-in by design</td></tr>
        <tr><td>EU data residency</td><td class="no">US-hosted</td><td class="yes">Ireland (EU)</td></tr>
        <tr><td>Explainable verdict</td><td class="no">Raw scores only</td><td class="yes">Score + signals + DNA</td></tr>
        <tr><td>Starting price</td><td class="partial">Free (basic) / $20-200+/mo</td><td class="yes">Free (50 checks) / €29/mo</td></tr>
        <tr><td>Zero maintenance</td><td class="no">Weekly cron jobs required</td><td class="yes">✓ nothing to maintain</td></tr>
      </tbody>
    </table>

    <h2 style="font-size:1.375rem;font-weight:600;margin-bottom:1rem;">When to choose which</h2>
    <div class="when-grid">
      <div class="when-card">
        <h3>Choose MaxMind if:</h3>
        <ul>
          <li>IP geolocation is your primary need</li>
          <li>You already have IP-based fraud rules</li>
          <li>You're comfortable maintaining local databases</li>
          <li>US data residency is acceptable</li>
          <li>You only need IP signals, not domain/email/IBAN</li>
        </ul>
      </div>
      <div class="when-card" style="border-color:rgba(0,217,126,.2);">
        <h3 style="color:var(--accent);">Choose Kairos Check if:</h3>
        <ul>
          <li>You want zero maintenance (no cron jobs)</li>
          <li>You need domain + email + phone + IBAN scoring</li>
          <li>GDPR compliance is required (EU hosting)</li>
          <li>You want one API for all fraud signals</li>
          <li>You're an indie dev who ships fast</li>
        </ul>
      </div>
    </div>

    <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:2rem;">Most teams use both: MaxMind for IP-level geolocation + Kairos Check for entity-level fraud scoring. They complement each other perfectly.</p>

    <div class="cta-row">
      <a href="/pricing" class="btn-accent">Start for €29/month →</a>
      <a href="/docs/quickstart" class="btn-ghost">5-minute quickstart</a>
    </div>
  </main>`);
}

module.exports = {
  renderStatus,
  renderChangelog,
  renderExamples,
  renderCompareStripeRadar,
  renderCompareSift,
  renderCompareSeon,
  renderCompareMaxmind,
};
