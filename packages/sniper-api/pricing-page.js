'use strict';

function renderPricingPage() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing — Kairos Check</title>
  <meta name="description" content="Fraud detection API for indie devs and solo founders. Starter from €29/month. No sales call. Cancel anytime.">
  <link rel="canonical" href="${base}/pricing">
  <meta property="og:title" content="Pricing — Kairos Check">
  <meta property="og:description" content="OSINT-first fraud detection API. Self-serve. No contract. Cancel anytime.">
  <meta property="og:url" content="${base}/pricing">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kairos Check">
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600&family=jetbrains-mono:400" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Kairos Check API",
    "description": "OSINT-first fraud detection API for developers",
    "offers": [
      { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Starter", "price": "29", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Pro", "price": "79", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Scale", "price": "199", "priceCurrency": "EUR" }
    ]
  }
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    :root {
      --bg: #0a0a0a; --surface: #111111; --surface-2: #1a1a1a;
      --border: #1f1f1f; --border-strong: #2a2a2a;
      --text: #f5f5f5; --text-secondary: #a3a3a3; --text-tertiary: #737373;
      --accent: #00d97e; --accent-hover: #00b369;
      --danger: #ef4444;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
      --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
      --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem; --text-3xl: 3.5rem;
      --lh-tight: 1.1; --lh-snug: 1.3; --lh-normal: 1.6;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; }

    a.skip-nav {
      position: absolute; top: -100%; left: 1rem;
      background: var(--accent); color: #000; padding: 0.5rem 1rem;
      border-radius: 4px; font-size: var(--text-sm); font-weight: 600; text-decoration: none;
      z-index: 100;
    }
    a.skip-nav:focus { top: 1rem; }

    nav {
      position: sticky; top: 0; z-index: 50;
      border-bottom: 1px solid var(--border);
      background: rgba(10,10,10,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      padding: 0 1.5rem; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { font-size: var(--text-base); font-weight: 600; color: var(--text); text-decoration: none; letter-spacing: -0.01em; }
    .nav-logo span { color: var(--accent); }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: var(--text-sm); transition: color 150ms ease-out; }
    .nav-links a:hover { color: var(--text); }
    .nav-links a.active { color: var(--text); }

    main { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }

    /* Hero */
    .hero { text-align: center; padding: 5rem 0 3rem; }
    .hero h1 { font-size: clamp(2rem, 5vw, var(--text-3xl)); font-weight: 600; line-height: var(--lh-tight); letter-spacing: -0.03em; color: var(--text); }
    .hero p { margin-top: 1rem; font-size: var(--text-lg); color: var(--text-secondary); line-height: var(--lh-snug); max-width: 540px; margin-left: auto; margin-right: auto; }

    /* Free tier banner */
    .free-banner {
      margin: 2rem auto; max-width: 560px;
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 8px; padding: 1rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    }
    .free-banner p { font-size: var(--text-sm); color: var(--text-secondary); }
    .free-banner p strong { color: var(--text); }
    .btn-ghost {
      display: inline-block; padding: 0.5rem 1rem;
      border: 1px solid var(--border-strong); border-radius: 6px;
      font-size: var(--text-sm); font-weight: 500; color: var(--text); text-decoration: none;
      transition: border-color 150ms ease-out, background 150ms ease-out;
      cursor: pointer; background: transparent; font-family: var(--font-sans);
      white-space: nowrap;
    }
    .btn-ghost:hover { border-color: var(--text-secondary); background: var(--surface-2); }

    /* Pricing grid */
    .plans {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1px; background: var(--border); border-radius: 12px; overflow: hidden;
      margin: 1rem 0 4rem;
    }
    .plan {
      background: var(--surface); padding: 2rem;
      display: flex; flex-direction: column;
      transition: background 150ms ease-out;
    }
    .plan:hover { background: var(--surface-2); }
    .plan.featured {
      background: var(--surface-2);
      position: relative;
    }
    .plan.featured::before {
      content: 'Most popular';
      position: absolute; top: 0; right: 1.5rem;
      background: var(--accent); color: #000;
      font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
      padding: 0.25rem 0.75rem; border-radius: 0 0 6px 6px;
    }
    .plan-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; }
    .plan-price { margin-top: 1rem; }
    .plan-price .amount { font-size: var(--text-3xl); font-weight: 600; letter-spacing: -0.04em; color: var(--text); line-height: 1; }
    .plan-price .period { font-size: var(--text-sm); color: var(--text-tertiary); margin-left: 0.25rem; }
    .plan-price .vat { display: block; font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 0.25rem; }
    .plan-desc { margin-top: 0.75rem; font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--lh-normal); }
    .plan-divider { height: 1px; background: var(--border); margin: 1.5rem 0; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.625rem; flex: 1; }
    .plan-features li { font-size: var(--text-sm); color: var(--text-secondary); padding-left: 1.25rem; position: relative; }
    .plan-features li::before { content: '✓'; position: absolute; left: 0; color: var(--accent); font-size: var(--text-xs); top: 0.1em; }
    .plan-cta { margin-top: 2rem; }
    .btn-primary {
      display: block; width: 100%; padding: 0.75rem 1rem; text-align: center;
      background: var(--accent); color: #000; border: none; border-radius: 6px;
      font-size: var(--text-sm); font-weight: 600; cursor: pointer; font-family: var(--font-sans);
      transition: background 150ms ease-out, transform 150ms ease-out;
      text-decoration: none;
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-outline {
      display: block; width: 100%; padding: 0.75rem 1rem; text-align: center;
      background: transparent; color: var(--text); border: 1px solid var(--border-strong); border-radius: 6px;
      font-size: var(--text-sm); font-weight: 500; cursor: pointer; font-family: var(--font-sans);
      transition: border-color 150ms ease-out, transform 150ms ease-out;
      text-decoration: none;
    }
    .btn-outline:hover { border-color: var(--text-secondary); transform: translateY(-1px); }
    .btn-outline:active { transform: translateY(0); }
    .btn-disabled { opacity: 0.5; cursor: default; pointer-events: none; }

    /* Error message */
    .checkout-error { display: none; margin-top: 0.5rem; font-size: var(--text-xs); color: var(--danger); text-align: center; }

    /* FAQ */
    .faq { max-width: 680px; margin: 0 auto 6rem; }
    .faq h2 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 2rem; }
    .faq-item { border-top: 1px solid var(--border); padding: 1.5rem 0; }
    .faq-item:last-child { border-bottom: 1px solid var(--border); }
    .faq-q { font-size: var(--text-base); font-weight: 500; color: var(--text); margin-bottom: 0.75rem; }
    .faq-a { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--lh-normal); }
    .faq-a a { color: var(--accent); text-decoration: none; }
    .faq-a a:hover { text-decoration: underline; }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem 1.5rem;
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
    }
    .footer-brand { font-size: var(--text-sm); color: var(--text-tertiary); }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { font-size: var(--text-sm); color: var(--text-tertiary); text-decoration: none; transition: color 150ms ease-out; }
    .footer-links a:hover { color: var(--text-secondary); }

    @media (max-width: 640px) {
      .hero { padding: 3rem 0 2rem; }
      .hero h1 { font-size: 2rem; }
      .free-banner { flex-direction: column; align-items: flex-start; }
      .plans { grid-template-columns: 1fr; }
      footer { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to content</a>

  <nav aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Kairos<span>Check</span></a>
      <div class="nav-links">
        <a href="/docs">Docs</a>
        <a href="/pricing" class="active" aria-current="page">Pricing</a>
      </div>
    </div>
  </nav>

  <main id="main-content">
    <section class="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading">Fraud detection that fits in<br>5 minutes of code</h1>
      <p>OSINT-first. GDPR-native. Self-serve. No sales call.</p>
    </section>

    <div class="free-banner" role="complementary" aria-label="Free tier">
      <p><strong>Free tier included.</strong> 50 checks/month, no card required. Get your API key instantly.</p>
      <a href="/docs/quickstart" class="btn-ghost">Get free key</a>
    </div>

    <section aria-label="Pricing plans">
      <div class="plans">

        <article class="plan" aria-labelledby="plan-starter">
          <div class="plan-name">Starter</div>
          <div class="plan-price">
            <span class="amount">€29</span><span class="period">/month</span>
            <span class="vat">+ VAT where applicable</span>
          </div>
          <p class="plan-desc">For indie devs shipping their first product with payments.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Starter features">
            <li>5,000 checks / month</li>
            <li>All 8 OSINT scoring layers</li>
            <li>Webhook on block/review events</li>
            <li>Audit trail (CSV export)</li>
            <li>Email support (48h)</li>
          </ul>
          <div class="plan-cta">
            <button class="btn-outline checkout-btn" data-tier="starter">Get started</button>
            <p class="checkout-error" aria-live="polite"></p>
          </div>
        </article>

        <article class="plan featured" aria-labelledby="plan-pro">
          <div class="plan-name">Pro</div>
          <div class="plan-price">
            <span class="amount">€79</span><span class="period">/month</span>
            <span class="vat">+ VAT where applicable</span>
          </div>
          <p class="plan-desc">For growing SaaS products with real transaction volume.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Pro features">
            <li>25,000 checks / month</li>
            <li>SLA 99.9% uptime</li>
            <li>GDPR endpoints (Art.15 / Art.17)</li>
            <li>Batch API (up to 50 items)</li>
            <li>Reputation graph queries</li>
          </ul>
          <div class="plan-cta">
            <button class="btn-primary checkout-btn" data-tier="pro">Get started</button>
            <p class="checkout-error" aria-live="polite"></p>
          </div>
        </article>

        <article class="plan" aria-labelledby="plan-scale">
          <div class="plan-name">Scale</div>
          <div class="plan-price">
            <span class="amount">€199</span><span class="period">/month</span>
            <span class="vat">+ VAT where applicable</span>
          </div>
          <p class="plan-desc">For platforms and marketplaces at volume. Still fully self-serve.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Scale features">
            <li>100,000 checks / month</li>
            <li>Priority async support (email)</li>
            <li>Reputation graph full access</li>
            <li>Audit trail with chain verification</li>
            <li>Custom webhook retry policy</li>
          </ul>
          <div class="plan-cta">
            <button class="btn-outline checkout-btn" data-tier="scale">Get started</button>
            <p class="checkout-error" aria-live="polite"></p>
          </div>
        </article>

      </div>
    </section>

    <section class="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently asked questions</h2>

      <div class="faq-item">
        <p class="faq-q">Can I cancel at any time?</p>
        <p class="faq-a">Yes. Cancel from your <a href="/portal">billing portal</a> with one click. Your subscription stays active until the end of the billing period — no prorating, no penalty.</p>
      </div>

      <div class="faq-item">
        <p class="faq-q">Is there a refund policy?</p>
        <p class="faq-a">If you're not satisfied within the first 14 days of a paid subscription, contact <a href="mailto:support@kairoscheck.net">support@kairoscheck.net</a> for a full refund. No questions asked.</p>
      </div>

      <div class="faq-item">
        <p class="faq-q">Is Kairos Check GDPR-compliant?</p>
        <p class="faq-a">Yes. Kairos Check is OSINT-first — we score signals derived from public data, not personal data you submit. Requests are pseudonymized before storage. No personal data is sold or shared. Infrastructure runs in the EU. See our <a href="/privacy">Privacy Policy</a> for the full picture.</p>
      </div>

      <div class="faq-item">
        <p class="faq-q">What does the free tier include?</p>
        <p class="faq-a">50 checks per month, no credit card required. You get a real API key instantly via our <a href="/docs/quickstart">quickstart guide</a>. The free tier uses the same 8-layer scoring engine as paid plans — no degraded results. Webhooks and audit trail are not included.</p>
      </div>

      <div class="faq-item">
        <p class="faq-q">Can I upgrade or downgrade mid-cycle?</p>
        <p class="faq-a">Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the next billing cycle. Manage everything from your <a href="/portal">billing portal</a> — no email required.</p>
      </div>
    </section>
  </main>

  <footer>
    <p class="footer-brand">&copy; ${new Date().getFullYear()} Kairos Check</p>
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>

  <script>
    document.querySelectorAll('.checkout-btn').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        var tier = btn.dataset.tier;
        var errorEl = btn.parentElement.querySelector('.checkout-error');
        btn.disabled = true;
        btn.textContent = 'Redirecting…';
        errorEl.style.display = 'none';
        try {
          var res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: tier })
          });
          var data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error(data.error || 'Checkout unavailable');
          }
        } catch (err) {
          errorEl.textContent = err.message || 'An error occurred. Please try again.';
          errorEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Get started';
        }
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { renderPricingPage };
