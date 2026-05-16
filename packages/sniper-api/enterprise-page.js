'use strict';

function renderEnterprisePage() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="shortcut icon" href="/favicon.ico"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check Enterprise — Dedicated Fraud Intelligence</title>
  <meta name="description" content="Kairos Check Enterprise: dedicated reputation graph, custom fraud patterns, SLA 99.9%, team seats, SOC2 report. From €800/month. Self-serve.">
  <link rel="canonical" href="${base}/enterprise">
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&family=jetbrains-mono:400" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#060606;--surface:#0f0f0f;--surface-2:#161616;--border:rgba(255,255,255,.08);--border-strong:rgba(255,255,255,.12);--text:#f0f0f0;--text-secondary:#909090;--text-tertiary:#555;--accent:#00d97e;--font-sans:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',monospace;}
    html{background:var(--bg);color:var(--text);font-family:var(--font-sans);-webkit-font-smoothing:antialiased;}
    body{min-height:100vh;}
    nav{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border);background:rgba(0,0,0,.85);backdrop-filter:blur(20px);}
    .nav-inner{max-width:1100px;margin:0 auto;padding:0 1.5rem;height:56px;display:flex;align-items:center;justify-content:space-between;}
    .nav-logo{font-size:1rem;font-weight:600;color:var(--text);text-decoration:none;}
    .nav-logo span{color:var(--accent);}
    .hero{max-width:860px;margin:0 auto;padding:6rem 1.5rem 4rem;text-align:center;}
    .hero-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(0,217,126,.08);border:1px solid rgba(0,217,126,.2);color:var(--accent);font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;padding:.3rem .875rem;border-radius:999px;margin-bottom:1.5rem;}
    .hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-.04em;line-height:1.08;margin-bottom:1.25rem;}
    .hero p{font-size:1.125rem;color:var(--text-secondary);line-height:1.65;max-width:620px;margin:0 auto 2.5rem;}
    .price-tag{font-family:var(--font-mono);font-size:3rem;font-weight:800;letter-spacing:-.04em;color:var(--text);}
    .price-sub{font-size:.9375rem;color:var(--text-tertiary);margin-top:.25rem;}
    .btn-enterprise{display:inline-flex;background:var(--accent);color:#000;font-weight:700;font-size:1rem;padding:.875rem 2rem;border-radius:9px;text-decoration:none;border:none;cursor:pointer;font-family:var(--font-sans);transition:background 150ms;}
    .btn-enterprise:hover{background:#00b369;}
    .features{max-width:1100px;margin:0 auto;padding:3rem 1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;}
    .feature{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.75rem;}
    .feature-icon{font-size:1.75rem;margin-bottom:1rem;}
    .feature-title{font-size:1rem;font-weight:600;margin-bottom:.5rem;}
    .feature-desc{font-size:.875rem;color:var(--text-secondary);line-height:1.6;}
    .compare{max-width:860px;margin:0 auto;padding:2rem 1.5rem 5rem;}
    .compare h2{font-size:1.5rem;font-weight:700;margin-bottom:2rem;text-align:center;}
    table{width:100%;border-collapse:collapse;}
    th{text-align:left;padding:.75rem 1rem;font-size:.8125rem;font-weight:600;border-bottom:1px solid var(--border-strong);color:var(--text-tertiary);}
    th:not(:first-child){text-align:center;}
    td{padding:.875rem 1rem;font-size:.875rem;border-bottom:1px solid var(--border);}
    td:not(:first-child){text-align:center;}
    .yes{color:var(--accent);font-weight:600;}
    .no{color:var(--text-tertiary);}
    .ent-col{color:var(--accent);}
    .cta-section{text-align:center;padding:4rem 1.5rem 6rem;border-top:1px solid var(--border);}
    .cta-section h2{font-size:2rem;font-weight:700;margin-bottom:1rem;}
    .cta-section p{color:var(--text-secondary);margin-bottom:2rem;}
    .err{color:#ef4444;font-size:.875rem;margin-top:.75rem;display:none;}
  </style>
</head>
<body>
<nav><div class="nav-inner">
  <a href="/" class="nav-logo">Kairos<span>Check</span></a>
  <div style="display:flex;align-items:center;gap:1rem;">
    <a href="/pricing" style="color:var(--text-secondary);font-size:.875rem;text-decoration:none;">Pricing</a>
    <a href="/docs" style="color:var(--text-secondary);font-size:.875rem;text-decoration:none;">Docs</a>
    <a href="/pricing" style="background:var(--accent);color:#000;font-size:.875rem;font-weight:600;padding:.5rem 1rem;border-radius:6px;text-decoration:none;">Get started</a>
  </div>
</div></nav>

<div class="hero">
  <div class="hero-badge">Enterprise</div>
  <h1>Fraud intelligence<br>built for your business</h1>
  <p>Dedicated reputation graph. Custom fraud patterns. SLA guarantee. Everything Kairos Check offers — isolated, customised, and backed by a financial commitment.</p>
  <div style="margin-bottom:2rem;">
    <div class="price-tag">€800<span style="font-size:1.5rem;color:var(--text-secondary);">/mo</span></div>
    <div class="price-sub">Billed monthly · No annual lock-in · Cancel anytime</div>
  </div>
  <button class="btn-enterprise" onclick="startCheckout()">Start Enterprise →</button>
  <p class="err" id="checkout-err">Checkout unavailable — contact hello@kairoscheck.net</p>
  <p style="font-size:.8125rem;color:var(--text-tertiary);margin-top:1rem;">Self-serve · Active in minutes · No sales call</p>
</div>

<div class="features">
  <div class="feature">
    <div class="feature-icon">🔒</div>
    <div class="feature-title">Dedicated reputation graph</div>
    <div class="feature-desc">Your fraud data stays isolated. Your reputation graph is built exclusively from your checks — no cross-tenant data mixing. Maximum privacy.</div>
  </div>
  <div class="feature">
    <div class="feature-icon">⚙️</div>
    <div class="feature-title">Custom fraud patterns</div>
    <div class="feature-desc">Define your own fraud rules via API. Block specific domains, email patterns, or custom logic. Rules are applied before OSINT scoring.</div>
  </div>
  <div class="feature">
    <div class="feature-icon">📊</div>
    <div class="feature-title">SLA 99.9% — financial guarantee</div>
    <div class="feature-desc">If uptime drops below 99.9% in any month, you receive a service credit. Not a vague promise — a contractual obligation.</div>
  </div>
  <div class="feature">
    <div class="feature-icon">👥</div>
    <div class="feature-title">Team seats — up to 5 API keys</div>
    <div class="feature-desc">Issue separate API keys for different environments (staging, production) or team members. Full audit trail per key.</div>
  </div>
  <div class="feature">
    <div class="feature-icon">📋</div>
    <div class="feature-title">SOC2 audit report</div>
    <div class="feature-desc">Request a SOC2-style security report for your DPO or compliance team. Generated quarterly, delivered by email.</div>
  </div>
  <div class="feature">
    <div class="feature-icon">🛡️</div>
    <div class="feature-title">100,000 tokens/month</div>
    <div class="feature-desc">100k tokens included — enough for 50,000+ checks per month with the standard CHECK model. Top up as needed.</div>
  </div>
</div>

<div class="compare">
  <h2>Pro vs Enterprise</h2>
  <div style="overflow-x:auto;">
  <table>
    <thead><tr>
      <th>Feature</th>
      <th>Pro — €99/mo</th>
      <th class="ent-col">Enterprise — €800/mo</th>
    </tr></thead>
    <tbody>
      <tr><td>Monthly tokens</td><td>3,000</td><td class="yes ent-col">100,000</td></tr>
      <tr><td>Reputation graph</td><td>Shared (cross-tenant)</td><td class="yes ent-col">Dedicated (isolated)</td></tr>
      <tr><td>Custom fraud patterns</td><td class="no">❌</td><td class="yes ent-col">✅ Unlimited rules</td></tr>
      <tr><td>API keys</td><td>1</td><td class="yes ent-col">Up to 5 (team seats)</td></tr>
      <tr><td>SLA guarantee</td><td>Best effort</td><td class="yes ent-col">99.9% + financial credit</td></tr>
      <tr><td>SOC2 report</td><td class="no">❌</td><td class="yes ent-col">✅ Quarterly</td></tr>
      <tr><td>Support</td><td>Standard</td><td class="yes ent-col">Priority direct</td></tr>
      <tr><td>GDPR Art.15/17/22</td><td class="yes">✅</td><td class="yes ent-col">✅</td></tr>
      <tr><td>Batch API</td><td class="yes">✅</td><td class="yes ent-col">✅</td></tr>
    </tbody>
  </table>
  </div>
</div>

<div class="cta-section">
  <h2>Ready to protect your revenue at scale?</h2>
  <p>Self-serve setup in minutes. No sales call. No contract lock-in.</p>
  <button class="btn-enterprise" onclick="startCheckout()">Start Enterprise — €800/month →</button>
  <p class="err" id="checkout-err2">Checkout unavailable — contact <a href="mailto:hello@kairoscheck.net" style="color:var(--accent);">hello@kairoscheck.net</a></p>
  <p style="font-size:.8125rem;color:var(--text-tertiary);margin-top:1rem;">Questions? Chat on <a href="/" style="color:var(--accent);">kairoscheck.net</a> or email hello@kairoscheck.net</p>
</div>

<script>
async function startCheckout() {
  try {
    var res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: 'enterprise' }),
    });
    var data = await res.json();
    if (data.url) { window.location.href = data.url; return; }
    throw new Error(data.error || 'unavailable');
  } catch(e) {
    document.getElementById('checkout-err').style.display = 'block';
    document.getElementById('checkout-err2').style.display = 'block';
  }
}
</script>
</body>
</html>`;
}

module.exports = { renderEnterprisePage };
