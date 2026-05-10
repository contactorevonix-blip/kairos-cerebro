'use strict';

const Stripe = require('stripe');
const { claimPendingKey, findKeyBySubscription } = require('./stripe-webhook');

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
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;
    --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.125rem;
    --text-xl: 1.5rem; --text-2xl: 2.25rem;
  }
  html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
  main { width: 100%; max-width: 600px; }
  nav { position: fixed; top: 0; left: 0; right: 0; border-bottom: 1px solid var(--border); background: rgba(10,10,10,0.9); backdrop-filter: blur(12px); }
  .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; height: 56px; display: flex; align-items: center; }
  .nav-logo { font-size: var(--text-base); font-weight: 600; color: var(--text); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
`;

const FONT_LINK = `<link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600&family=jetbrains-mono:400" rel="stylesheet">`;

function renderProcessing(base) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="5">
  <title>Processing — Kairos Check</title>
  <meta name="robots" content="noindex">
  ${FONT_LINK}
  <style>
    ${BASE_CSS}
    .card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; padding: 2.5rem; text-align: center; }
    .spinner { width: 32px; height: 32px; border: 2px solid var(--border-strong); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
    p { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
  </style>
</head>
<body>
  <nav aria-label="Main navigation"><div class="nav-inner"><a href="/" class="nav-logo">Kairos<span>Check</span></a></div></nav>
  <main>
    <div class="card">
      <div class="spinner" aria-hidden="true"></div>
      <h1>Activating your subscription&hellip;</h1>
      <p>This takes a few seconds. This page refreshes automatically.</p>
    </div>
  </main>
</body>
</html>`;
}

function renderError(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error — Kairos Check</title>
  <meta name="robots" content="noindex">
  ${FONT_LINK}
  <style>
    ${BASE_CSS}
    .card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; padding: 2.5rem; text-align: center; }
    h1 { font-size: var(--text-xl); font-weight: 600; margin-bottom: 0.75rem; }
    p { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; }
    a { color: var(--accent); text-decoration: none; font-size: var(--text-sm); }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <nav aria-label="Main navigation"><div class="nav-inner"><a href="/" class="nav-logo">Kairos<span>Check</span></a></div></nav>
  <main>
    <div class="card">
      <h1>Something went wrong</h1>
      <p>${message}</p>
      <a href="/pricing">&larr; Back to pricing</a>
    </div>
  </main>
</body>
</html>`;
}

function renderSuccess({ rawKey, preview, tier, email }) {
  const curlExample = `curl -X POST https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer ${rawKey || preview}" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "suspicious-site.io"}'`;

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Active';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kairos Check</title>
  <meta name="robots" content="noindex">
  ${FONT_LINK}
  <style>
    ${BASE_CSS}
    body { padding-top: 80px; }
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0,217,126,0.1); border: 1px solid rgba(0,217,126,0.3); color: var(--accent); font-size: var(--text-sm); font-weight: 500; padding: 0.375rem 0.875rem; border-radius: 999px; margin-bottom: 1rem; }
    .badge::before { content: ''; width: 7px; height: 7px; background: var(--accent); border-radius: 50%; }
    h1 { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 0.5rem; }
    .subtitle { font-size: var(--text-base); color: var(--text-secondary); }
    .card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; padding: 1.5rem; }
    .card-label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 0.75rem; }
    .key-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .key-value { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--accent); background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 0.625rem 0.875rem; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; user-select: all; }
    .btn-copy { flex-shrink: 0; background: var(--accent); color: #000; border: none; border-radius: 6px; font-size: var(--text-sm); font-weight: 600; padding: 0.625rem 1rem; cursor: pointer; font-family: var(--font-sans); transition: background 150ms ease-out; }
    .btn-copy:hover { background: var(--accent-hover); }
    .btn-copy.copied { background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--border-strong); }
    .key-warning { margin-top: 0.75rem; font-size: var(--text-sm); color: #f59e0b; display: flex; align-items: flex-start; gap: 0.5rem; }
    .key-warning::before { content: '!'; font-weight: 700; flex-shrink: 0; }
    pre { font-family: var(--font-mono); font-size: 0.8125rem; color: var(--text-secondary); background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 1rem; overflow-x: auto; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
    .info-text { font-size: var(--text-sm); color: var(--text-secondary); }
    .links { display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-link { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--text); text-decoration: none; font-size: var(--text-sm); font-weight: 500; border: 1px solid var(--border-strong); border-radius: 6px; padding: 0.625rem 1rem; transition: border-color 150ms ease-out; }
    .btn-link:hover { border-color: var(--text-secondary); }
    .btn-link.accent { background: var(--accent); color: #000; border-color: var(--accent); }
    .btn-link.accent:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
    @media (max-width: 480px) { .key-row { flex-direction: column; align-items: stretch; } .btn-copy { width: 100%; } }
  </style>
</head>
<body>
  <nav aria-label="Main navigation"><div class="nav-inner"><a href="/" class="nav-logo">Kairos<span>Check</span></a></div></nav>
  <main>
    <div class="page">
      <header>
        <div class="badge">${tierLabel} plan active</div>
        <h1>Subscription active.<br>Welcome to Kairos Check.</h1>
        <p class="subtitle">Your API key is ready. Copy it now &mdash; it won&rsquo;t be shown again.</p>
      </header>

      <div class="card" role="region" aria-label="Your API key">
        <p class="card-label">Your API key</p>
        <div class="key-row">
          <code class="key-value" id="api-key" aria-label="API key value">${rawKey || preview}</code>
          <button class="btn-copy" id="copy-btn" aria-label="Copy API key to clipboard" onclick="copyKey()">Copy</button>
        </div>
        <p class="key-warning">Save this key now. It is shown only once and stored hashed — we cannot recover it.</p>
      </div>

      <div class="card" role="region" aria-label="Quickstart example">
        <p class="card-label">Quickstart &mdash; first request</p>
        <pre aria-label="curl example"><code>${curlExample}</code></pre>
      </div>

      <p class="info-text">Stripe sent you a confirmation email${email ? ` to <strong>${email}</strong>` : ''} with your invoice.</p>

      <div class="links">
        <a href="/docs/quickstart" class="btn-link accent">Read full docs &rarr;</a>
        <a href="/portal" class="btn-link">Manage subscription &rarr;</a>
      </div>
    </div>
  </main>

  <script>
    function copyKey() {
      var key = document.getElementById('api-key').textContent.trim();
      var btn = document.getElementById('copy-btn');
      navigator.clipboard.writeText(key).then(function() {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      }).catch(function() {
        btn.textContent = 'Failed';
        setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
      });
    }
  </script>
</body>
</html>`;
}

async function handleSuccess(sessionId) {
  // Validate session_id format
  if (!sessionId || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return { html: renderError('Invalid session ID.'), status: 400 };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { html: renderError('Service temporarily unavailable.'), status: 503 };
  }

  const stripe = Stripe(stripeKey);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  } catch (err) {
    return { html: renderError('Could not retrieve session. The link may have expired.'), status: 404 };
  }

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  if (!subscriptionId) {
    return { html: renderError('No subscription found for this session.'), status: 400 };
  }

  // Check if raw key is still in pending map (webhook just fired)
  const rawKey = claimPendingKey(subscriptionId);

  // Fetch stored record for metadata (tier, preview, email)
  const record = findKeyBySubscription(subscriptionId);

  if (!record && !rawKey) {
    // Webhook hasn't processed yet — show processing page
    return { html: renderProcessing(), status: 200 };
  }

  const tier = record?.tier || null;
  const preview = record?.api_key_preview || null;
  const email = record?.email || session.customer_details?.email || null;

  return {
    html: renderSuccess({ rawKey, preview, tier, email }),
    status: 200,
  };
}

module.exports = { handleSuccess };
