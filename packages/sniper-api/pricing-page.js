'use strict';

function renderPricingPage() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing — Kairos Check</title>
  <meta name="description" content="Fraud detection API for indie devs and solo founders. Free tier included. Starter from €29/month. No contract. Cancel anytime.">
  <link rel="canonical" href="${base}/pricing">
  <meta property="og:title" content="Pricing — Kairos Check">
  <meta property="og:description" content="OSINT-first fraud detection API. Self-serve. No contract. Cancel anytime.">
  <meta property="og:url" content="${base}/pricing">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kairos Check">
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=jetbrains-mono:400,500" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Kairos Check API",
    "description": "OSINT-first fraud detection API for developers",
    "image": "https://kairoscheck.net/badge",
    "brand": { "@type": "Brand", "name": "Kairos Check" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "PT",
      "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
    },
    "offers": [
      { "@type": "Offer", "name": "Free",       "price": "0",   "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" },
      { "@type": "Offer", "name": "Starter",    "price": "29",  "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" },
      { "@type": "Offer", "name": "Growth",     "price": "59",  "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" },
      { "@type": "Offer", "name": "Pro",        "price": "99",  "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" },
      { "@type": "Offer", "name": "Scale",      "price": "249", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" },
      { "@type": "Offer", "name": "Enterprise", "price": "800", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://kairoscheck.net/pricing" }
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
      --accent-dim: rgba(0,217,126,0.08); --accent-border: rgba(0,217,126,0.28);
      --accent-glow: rgba(0,217,126,0.12);
      --danger: #ef4444;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
      --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
      --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem; --text-3xl: 3.5rem;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; }

    a.skip-nav {
      position: absolute; top: -100%; left: 1rem;
      background: var(--accent); color: #000; padding: 0.5rem 1rem;
      border-radius: 4px; font-size: var(--text-sm); font-weight: 600; text-decoration: none; z-index: 100;
    }
    a.skip-nav:focus { top: 1rem; }

    /* NAV */
    nav {
      position: sticky; top: 0; z-index: 50;
      border-bottom: 1px solid var(--border);
      background: rgba(10,10,10,0.88);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .nav-logo-text { font-size: var(--text-base); font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
    .nav-logo-text span { color: var(--accent); }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: var(--text-sm); transition: color 150ms; }
    .nav-links a:hover, .nav-links a.active { color: var(--text); }
    .nav-cta {
      background: var(--accent); color: #000; text-decoration: none;
      font-size: var(--text-sm); font-weight: 600; padding: 0.45rem 1rem;
      border-radius: 6px; transition: background 150ms;
    }
    .nav-cta:hover { background: var(--accent-hover); color: #000; }

    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }

    /* HERO */
    .pricing-hero { text-align: center; padding: 5rem 1.5rem 3rem; }
    .pricing-hero h1 {
      font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 700;
      line-height: 1.05; letter-spacing: -0.03em;
    }
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 20%, #00d97e 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .pricing-hero p {
      margin-top: 1rem; font-size: var(--text-lg); color: var(--text-secondary);
      line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;
    }

    /* TOGGLE */
    .billing-toggle {
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      margin: 2rem auto;
    }
    .toggle-label { font-size: var(--text-sm); color: var(--text-secondary); }
    .toggle-label.active { color: var(--text); font-weight: 500; }
    .toggle-btn {
      position: relative; width: 44px; height: 24px;
      background: var(--surface-2); border: 1px solid var(--border-strong);
      border-radius: 999px; cursor: pointer; transition: border-color 150ms;
      flex-shrink: 0;
    }
    .toggle-btn::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--text-secondary); transition: transform 200ms, background 150ms;
    }
    .toggle-btn.annual::after { transform: translateX(20px); background: var(--accent); }
    .toggle-btn.annual { border-color: var(--accent); }
    .save-badge {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
      background: rgba(0,217,126,0.12); color: var(--accent);
      border: 1px solid rgba(0,217,126,0.2); border-radius: 999px;
      padding: 0.15rem 0.5rem;
    }

    /* PRICING GRID */
    .plans-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 1rem; margin: 1rem 0 1.5rem; align-items: start;
    }
    @media (max-width: 900px) { .plans-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 540px) { .plans-grid { grid-template-columns: 1fr; } }

    .plan-card {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 12px; padding: 1.75rem;
      display: flex; flex-direction: column; transition: border-color 150ms;
    }
    .plan-card:hover { border-color: #3a3a3a; }
    .plan-card.featured {
      border: 1px solid var(--accent-border);
      background: linear-gradient(180deg, rgba(0,217,126,0.05) 0%, var(--surface) 40%);
      box-shadow: 0 0 0 1px var(--accent-border), 0 8px 40px var(--accent-glow);
      position: relative; transform: scale(1.025);
    }
    .plan-badge {
      position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: #000;
      font-size: 0.625rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 0.2rem 0.875rem; border-radius: 0 0 8px 8px; white-space: nowrap;
    }
    .plan-name {
      font-size: var(--text-xs); font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 1rem;
    }
    .plan-card.featured .plan-name { color: var(--accent); }
    .plan-price-row { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.25rem; }
    .plan-amount {
      font-size: 2.5rem; font-weight: 700; letter-spacing: -0.04em;
      line-height: 1; color: var(--text);
    }
    .plan-period { font-size: var(--text-sm); color: var(--text-tertiary); }
    .plan-vat { font-size: var(--text-xs); color: var(--text-tertiary); margin-bottom: 1rem; }
    .plan-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; }
    .plan-divider { height: 1px; background: var(--border); margin-bottom: 1.25rem; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; margin-bottom: 1.5rem; }
    .plan-features li {
      font-size: var(--text-sm); color: var(--text-secondary);
      display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.4;
    }
    .plan-features li::before {
      content: ''; flex-shrink: 0; width: 14px; height: 14px; margin-top: 2px;
      background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='7' cy='7' r='7' fill='%2300d97e' fill-opacity='0.15'/%3E%3Cpath d='M4.5 7L6.5 9L9.5 5.5' stroke='%2300d97e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-size: contain;
    }

    /* BUTTONS */
    .btn-plan-primary {
      display: block; width: 100%; padding: 0.75rem 1rem; text-align: center;
      background: var(--accent); color: #000; border: none; border-radius: 8px;
      font-size: var(--text-sm); font-weight: 700; cursor: pointer; font-family: var(--font-sans);
      position: relative; overflow: hidden;
      transition: background 150ms, transform 150ms, box-shadow 150ms;
      text-decoration: none;
    }
    .btn-plan-primary:hover {
      background: var(--accent-hover); transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0,217,126,0.25);
    }
    .btn-plan-primary::after {
      content: ''; position: absolute; top: -50%; left: -75%;
      width: 50%; height: 200%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
      transform: skewX(-20deg); transition: left 500ms ease;
    }
    .btn-plan-primary:hover::after { left: 150%; }
    .btn-plan-outline {
      display: block; width: 100%; padding: 0.75rem 1rem; text-align: center;
      background: transparent; color: var(--text-secondary);
      border: 1px solid var(--border-strong); border-radius: 8px;
      font-size: var(--text-sm); font-weight: 500; cursor: pointer; font-family: var(--font-sans);
      transition: border-color 150ms, color 150ms, transform 150ms;
      text-decoration: none;
    }
    .btn-plan-outline:hover { border-color: var(--text-tertiary); color: var(--text); transform: translateY(-1px); }
    .checkout-error { display: none; margin-top: 0.5rem; font-size: var(--text-xs); color: var(--danger); text-align: center; }

    /* TRUST ROW */
    .trust-row {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
      gap: 0.5rem 1.25rem; padding: 1.25rem 1.5rem; margin: 0 0 4rem;
    }
    .trust-item {
      display: flex; align-items: center; gap: 0.375rem;
      font-size: var(--text-xs); color: var(--text-tertiary);
    }
    .trust-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

    /* COMPARISON TABLE */
    .compare-section { margin: 0 0 5rem; overflow-x: auto; }
    .compare-section h2 {
      font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em;
      margin-bottom: 1.5rem; text-align: center;
    }
    .compare-table { width: 100%; border-collapse: collapse; min-width: 540px; }
    .compare-table th {
      text-align: left; padding: 0.625rem 1rem;
      font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--text-tertiary); border-bottom: 1px solid var(--border-strong);
    }
    .compare-table th:not(:first-child) { text-align: center; }
    .compare-table th.featured-col { color: var(--accent); }
    .compare-table td {
      padding: 0.75rem 1rem; font-size: var(--text-sm); color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table td.featured-col { background: rgba(0,217,126,0.03); }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td { background: var(--surface); }
    .compare-table tr:hover td.featured-col { background: rgba(0,217,126,0.05); }
    .check { color: var(--accent); font-size: 0.875rem; }
    .dash  { color: var(--border-strong); }

    /* FAQ */
    .faq-section { max-width: 680px; margin: 0 auto 6rem; }
    .faq-section h2 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 2rem; }
    .faq-item { border-top: 1px solid var(--border); padding: 1.25rem 0; }
    .faq-item:last-child { border-bottom: 1px solid var(--border); }
    .faq-q { font-size: var(--text-base); font-weight: 500; color: var(--text); margin-bottom: 0.625rem; }
    .faq-a { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.65; }
    .faq-a a { color: var(--accent); text-decoration: none; }
    .faq-a a:hover { text-decoration: underline; }

    /* FOOTER */
    .footer-inner {
      border-top: 1px solid var(--border); padding: 2.5rem 1.5rem;
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
    }
    .footer-brand { font-size: var(--text-xs); color: var(--text-tertiary); }
    .footer-links { display: flex; gap: 1.25rem; }
    .footer-links a { font-size: var(--text-xs); color: var(--text-tertiary); text-decoration: none; transition: color 150ms; }
    .footer-links a:hover { color: var(--text-secondary); }

    @media (max-width: 640px) {
      .pricing-hero { padding: 3rem 1.5rem 2rem; }
      .trust-row { justify-content: flex-start; }
      footer { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-nav">Skip to content</a>

  <nav aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Kairos Check home">
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
          <path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e"/>
          <path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-logo-text">Kairos<span>Check</span></span>
      </a>
      <div class="nav-links">
        <a href="/docs">Docs</a>
        <a href="/pricing" class="active" aria-current="page">Pricing</a>
        <a href="/status">Status</a>
        <a href="/" class="nav-cta">Get API key</a>
      </div>
    </div>
  </nav>

  <main id="main-content">

    <!-- HERO -->
    <section class="pricing-hero" aria-labelledby="pricing-h1">
      <h1 id="pricing-h1">Founding member pricing.<br><span class="gradient-text">Rate locked forever.</span></h1>
      <p>You're not buying a monthly plan. You're locking in the rate before prices go up — permanently. Cancel anytime, keep the rate if you come back within 30 days.</p>
    </section>

    <!-- FOUNDER BANNER -->
    <div style="max-width:860px;margin:0 auto 2rem;padding:0 1.5rem;">
      <div style="background:rgba(0,217,126,0.05);border:1px solid rgba(0,217,126,0.2);border-radius:12px;padding:1.125rem 1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--accent,#00d97e);flex-shrink:0;box-shadow:0 0 10px rgba(0,217,126,0.5);"></div>
        <div style="flex:1;">
          <p style="font-size:0.875rem;font-weight:600;color:#f5f5f5;margin-bottom:0.125rem;">Founding member programme — 50 spots</p>
          <p style="font-size:0.75rem;color:#a3a3a3;">As our network grows and detection improves, prices will reflect that. Founding members keep today's rate — forever. This is not a promotion. It's a price lock.</p>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-size:0.6875rem;color:#737373;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:0.25rem;">Spots remaining</p>
          <p style="font-family:monospace;font-size:1.25rem;font-weight:700;color:#f5f5f5;line-height:1;">50</p>
        </div>
      </div>
    </div>

    <!-- BILLING TOGGLE -->
    <div class="billing-toggle" role="group" aria-label="Billing period">
      <span class="toggle-label active" id="label-monthly">Monthly</span>
      <button class="toggle-btn" id="billing-toggle" aria-pressed="false" aria-label="Switch to annual billing"></button>
      <span class="toggle-label" id="label-annual">Annual <span class="save-badge">2 months free</span></span>
    </div>

    <!-- PRICING CARDS -->
    <div class="container">
      <div class="plans-grid" role="list">

        <!-- FREE -->
        <article class="plan-card" role="listitem" aria-labelledby="plan-free-name">
          <div class="plan-name" id="plan-free-name">Free</div>
          <div class="plan-price-row">
            <span class="plan-amount">€0</span>
          </div>
          <div class="plan-vat">forever · no card required</div>
          <p class="plan-desc">Try the full scoring engine. Real API key, real results.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Free tier features">
            <li>50 checks / month</li>
            <li>Domain + email scoring</li>
            <li>Score + verdict + signals</li>
            <li>No credit card</li>
          </ul>
          <a href="/docs/quickstart" class="btn-plan-outline">Get free key →</a>
        </article>

        <!-- SCALE — shown first for price anchoring: €249 makes €29 look like a steal -->
        <article class="plan-card" role="listitem" aria-labelledby="plan-scale-name">
          <div class="plan-name" id="plan-scale-name">Scale</div>
          <div class="plan-price-row">
            <span class="plan-amount" data-monthly="249" data-annual="199">€249</span>
            <span class="plan-period">/mo</span>
          </div>
          <div class="plan-vat" id="scale-vat">+ VAT · billed monthly</div>
          <p class="plan-desc">For platforms and marketplaces at volume.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Scale features">
            <li>15,000 tokens / month</li>
            <li>Everything in Pro</li>
            <li>SWIFT + CHECK + DEEP models</li>
            <li>Reputation graph priority access</li>
            <li>SLA 99.9% · Priority support</li>
          </ul>
          <button class="btn-plan-outline checkout-btn" data-tier="scale">Get started</button>
          <p class="checkout-error" aria-live="polite"></p>
        </article>

        <!-- GROWTH -->
        <article class="plan-card" role="listitem" aria-labelledby="plan-growth-name">
          <div class="plan-name" id="plan-growth-name">Growth</div>
          <div class="plan-price-row">
            <span class="plan-amount" data-monthly="59" data-annual="47">€59</span>
            <span class="plan-period">/mo</span>
          </div>
          <div class="plan-vat" id="growth-vat">+ VAT · billed monthly</div>
          <p class="plan-desc">For businesses growing beyond 150 signups/month.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Growth features">
            <li>1,000 tokens / month (~500 signups)</li>
            <li>All Starter features</li>
            <li>DEEP model (9 layers + graph)</li>
            <li>24h response cache (0.1 tokens/hit)</li>
            <li>Audit trail CSV export</li>
          </ul>
          <button class="btn-plan-outline checkout-btn" data-tier="growth">Get started</button>
          <p class="checkout-error" aria-live="polite"></p>
        </article>

        <!-- PRO — FEATURED -->
        <article class="plan-card featured" role="listitem" aria-labelledby="plan-pro-name">
          <div class="plan-badge" aria-label="Most popular plan">Most Popular</div>
          <div class="plan-name" id="plan-pro-name">Pro</div>
          <div class="plan-price-row">
            <span class="plan-amount" data-monthly="99" data-annual="79">€99</span>
            <span class="plan-period">/mo</span>
          </div>
          <div class="plan-vat" id="pro-vat">+ VAT · billed monthly</div>
          <p class="plan-desc">For serious SaaS products with real transaction volume.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Pro features">
            <li>3,000 tokens / month (~1,500 signups)</li>
            <li>All entity types: domain, email, phone, IBAN</li>
            <li>DEEP model (9 layers + graph)</li>
            <li>Batch API (100 items/call)</li>
            <li>GDPR Art.15/17/22 endpoints</li>
          </ul>
          <button class="btn-plan-primary checkout-btn" data-tier="pro">Get API key →</button>
          <p class="checkout-error" aria-live="polite"></p>
        </article>

        <!-- STARTER -->
        <article class="plan-card" role="listitem" aria-labelledby="plan-starter-name">
          <div class="plan-name" id="plan-starter-name">Starter</div>
          <div class="plan-price-row">
            <span class="plan-amount" data-monthly="29" data-annual="23">€29</span>
            <span class="plan-period">/mo</span>
          </div>
          <div class="plan-vat" id="starter-vat">+ VAT · billed monthly</div>
          <p class="plan-desc">For indie devs protecting their first product.</p>
          <div class="plan-divider" aria-hidden="true"></div>
          <ul class="plan-features" aria-label="Starter features">
            <li>300 tokens / month (~150 signups)</li>
            <li>Domain, email, phone, IBAN</li>
            <li>SWIFT + CHECK models</li>
            <li>Webhook on BLOCK/REVIEW</li>
            <li>Cancel anytime · Founding rate locked</li>
          </ul>
          <button class="btn-plan-outline checkout-btn" data-tier="starter">Get started</button>
          <p class="checkout-error" aria-live="polite"></p>
        </article>

      </div>

      <!-- Enterprise link -->
      <div style="text-align:center;margin-top:1.5rem;">
        <p style="font-size:.875rem;color:var(--text-secondary);">
          Need dedicated graph, custom patterns, and SLA guarantee?
          <a href="/enterprise" style="color:var(--accent);font-weight:600;">See Enterprise — €800/month →</a>
        </p>
      </div>

      <!-- TRUST ROW -->
      <div class="trust-row" aria-label="Purchase guarantees">
        <span class="trust-item"><span class="trust-dot" aria-hidden="true"></span>No contract</span>
        <span class="trust-item"><span class="trust-dot" aria-hidden="true"></span>Cancel anytime</span>
        <span class="trust-item"><span class="trust-dot" aria-hidden="true"></span>14-day money back</span>
        <span class="trust-item"><span class="trust-dot" aria-hidden="true"></span>EU-hosted · GDPR-native</span>
        <span class="trust-item"><span class="trust-dot" aria-hidden="true"></span>No sales call</span>
      </div>

      <!-- COMPARISON TABLE -->
      <section class="compare-section" aria-labelledby="compare-h2">
        <h2 id="compare-h2">Everything included</h2>
        <table class="compare-table" aria-label="Feature comparison by plan">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Free</th>
              <th scope="col">Starter</th>
              <th scope="col" class="featured-col">Pro</th>
              <th scope="col">Scale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly checks</td>
              <td>50</td>
              <td>5,000</td>
              <td class="featured-col">25,000</td>
              <td>100,000</td>
            </tr>
            <tr>
              <td>Domain, email, phone, IBAN scoring</td>
              <td>Domain + email</td>
              <td><span class="check">✓</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>Score + verdict + signals</td>
              <td><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>Webhook on BLOCK / REVIEW</td>
              <td><span class="dash">—</span></td>
              <td><span class="check">✓</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>Audit trail (CSV export)</td>
              <td><span class="dash">—</span></td>
              <td><span class="check">✓</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>Batch API (up to 100/call)</td>
              <td><span class="dash">—</span></td>
              <td><span class="dash">—</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>GDPR Art.15 / 17 endpoints</td>
              <td><span class="dash">—</span></td>
              <td><span class="dash">—</span></td>
              <td class="featured-col"><span class="check">✓</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>Reputation graph full access</td>
              <td><span class="dash">—</span></td>
              <td><span class="dash">—</span></td>
              <td class="featured-col"><span class="dash">—</span></td>
              <td><span class="check">✓</span></td>
            </tr>
            <tr>
              <td>SLA</td>
              <td>Best effort</td>
              <td>Best effort</td>
              <td class="featured-col">99.9%</td>
              <td>99.9%</td>
            </tr>
            <tr>
              <td>Support</td>
              <td>Community</td>
              <td>Email 48h</td>
              <td class="featured-col">Priority email</td>
              <td>Priority async</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- FAQ -->
      <section class="faq-section" aria-labelledby="faq-h2">
        <h2 id="faq-h2">Common questions</h2>

        <div class="faq-item">
          <p class="faq-q">Can I cancel at any time?</p>
          <p class="faq-a">Yes. Cancel from your <a href="/api/portal">billing portal</a> with one click. Your subscription stays active until the end of the billing period — no penalty, no notice period.</p>
        </div>

        <div class="faq-item">
          <p class="faq-q">Is there a refund policy?</p>
          <p class="faq-a">If you're not satisfied within the first 14 days, email <a href="mailto:support@kairoscheck.net">support@kairoscheck.net</a> for a full refund. No questions asked.</p>
        </div>

        <div class="faq-item">
          <p class="faq-q">What counts as one check?</p>
          <p class="faq-a">One API call to <code style="font-family:var(--font-mono);font-size:0.875em">/api/check</code> counts as one check, regardless of entity type (domain, email, phone, IBAN). Quota resets on the 1st of each month.</p>
        </div>

        <div class="faq-item">
          <p class="faq-q">Is Kairos Check GDPR-compliant?</p>
          <p class="faq-a">Yes. We score OSINT signals derived from public data. Inputs are pseudonymised before storage. No PII sold or shared. Infrastructure runs in the EU (Railway, Ireland). See our <a href="/privacy">Privacy Policy</a>.</p>
        </div>

        <div class="faq-item">
          <p class="faq-q">Can I upgrade or downgrade mid-cycle?</p>
          <p class="faq-a">Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the next billing cycle. Manage everything from your <a href="/api/portal">billing portal</a>.</p>
        </div>
      </section>
    </div>

  </main>

  <footer>
    <div class="footer-inner">
      <p class="footer-brand">&copy; ${new Date().getFullYear()} Kairos Check · EU-hosted · No data sold</p>
      <nav class="footer-links" aria-label="Footer navigation">
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
        <a href="/status">Status</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </div>
  </footer>

  <script>
    // Billing toggle — monthly / annual
    (function() {
      var isAnnual = false;
      var toggle = document.getElementById('billing-toggle');
      var labelMonthly = document.getElementById('label-monthly');
      var labelAnnual   = document.getElementById('label-annual');
      var amounts = document.querySelectorAll('.plan-amount[data-monthly]');
      var vats = {
        starter: document.getElementById('starter-vat'),
        pro:     document.getElementById('pro-vat'),
        scale:   document.getElementById('scale-vat'),
      };

      function update() {
        amounts.forEach(function(el) {
          el.textContent = '€' + (isAnnual ? el.dataset.annual : el.dataset.monthly);
        });
        var period = isAnnual ? '+ VAT · billed annually' : '+ VAT · billed monthly';
        Object.values(vats).forEach(function(el) { if (el) el.textContent = period; });
        toggle.classList.toggle('annual', isAnnual);
        toggle.setAttribute('aria-pressed', String(isAnnual));
        labelMonthly.classList.toggle('active', !isAnnual);
        labelAnnual.classList.toggle('active', isAnnual);
      }

      toggle.addEventListener('click', function() {
        isAnnual = !isAnnual;
        update();
      });
    })();

    // Checkout buttons
    document.querySelectorAll('.checkout-btn').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        var tier = btn.dataset.tier;
        var errorEl = btn.parentElement.querySelector('.checkout-error');
        var orig = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Redirecting…';
        if (errorEl) errorEl.style.display = 'none';
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
          if (errorEl) { errorEl.textContent = err.message || 'An error occurred. Please try again.'; errorEl.style.display = 'block'; }
          btn.disabled = false;
          btn.textContent = orig;
        }
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { renderPricingPage };
