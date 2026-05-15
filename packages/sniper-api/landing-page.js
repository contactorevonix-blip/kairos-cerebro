'use strict';

const { readGlobalMetrics } = require('../sniper-db');

function renderLandingPage() {
  const m = readGlobalMetrics() || {};
  const domainsScored = (m.verifyRequests || 0).toLocaleString('en');
  const threatsBlocked = (m.blocked || 0).toLocaleString('en');
  const avgMs = m.avgLatencyMs ? Math.round(m.avgLatencyMs) : null;
  const avgMsDisplay = avgMs ? `${avgMs}ms` : '&lt;200ms';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check — Fraud detection API for indie devs</title>
  <meta name="description" content="OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Self-serve. GDPR-native. Starts at €29/month.">
  <link rel="canonical" href="https://kairoscheck.net/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://kairoscheck.net/">
  <meta property="og:site_name" content="Kairos Check">
  <meta property="og:title" content="Kairos Check — Fraud detection API for indie devs">
  <meta property="og:description" content="OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Self-serve. GDPR-native. Starts at €29/month.">
  <meta property="og:image" content="https://kairoscheck.net/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Kairos Check — Fraud detection API for indie devs">
  <meta name="twitter:description" content="OSINT-first fraud scoring API. Self-serve. GDPR-native. Starts at €29/month.">
  <meta name="twitter:image" content="https://kairoscheck.net/og-image.png">

  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600&family=jetbrains-mono:400,500" rel="stylesheet">

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
      --danger: #ef4444; --warning: #f59e0b;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
      --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
      --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem; --text-3xl: 3rem;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; }

    .skip-link {
      position: absolute; top: -100%; left: 1rem; background: var(--accent); color: #000;
      padding: 0.5rem 1rem; font-weight: 600; font-size: var(--text-sm); border-radius: 0 0 6px 6px;
      text-decoration: none; z-index: 100;
    }
    .skip-link:focus { top: 0; }

    /* NAV */
    nav {
      position: sticky; top: 0; z-index: 50;
      border-bottom: 1px solid var(--border);
      background: rgba(10,10,10,0.92); backdrop-filter: blur(12px);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 1.5rem;
      height: 56px; display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .nav-logo-mark { flex-shrink: 0; display: block; }
    .nav-logo-text { font-size: var(--text-base); font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
    .nav-logo-text span { color: var(--accent); }
    .nav-links { display: flex; align-items: center; gap: 0.25rem; }
    .nav-link { color: var(--text-secondary); text-decoration: none; font-size: var(--text-sm); padding: 0.375rem 0.75rem; border-radius: 6px; transition: color 150ms; }
    .nav-link:hover { color: var(--text); }
    .nav-cta {
      background: var(--accent); color: #000; text-decoration: none; font-size: var(--text-sm);
      font-weight: 600; padding: 0.5rem 1rem; border-radius: 6px; transition: background 150ms;
    }
    .nav-cta:hover { background: var(--accent-hover); }
    @media (max-width: 480px) { .nav-links .nav-link:not(.nav-cta) { display: none; } }

    /* LAYOUT */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    section { padding: 5rem 0; }
    section + section { border-top: 1px solid var(--border); }

    /* HERO */
    .hero { padding: 6rem 0 4rem; position: relative; overflow: hidden; }
    .hero::before {
      content: '';
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute;
      top: -100px; left: 50%;
      transform: translateX(-50%);
      width: 700px; height: 500px;
      background: radial-gradient(ellipse at 50% 0%, rgba(0,217,126,0.09) 0%, transparent 65%);
      pointer-events: none; z-index: 0;
    }
    .hero .container { position: relative; z-index: 1; }

    /* GRADIENT TEXT */
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 20%, #00d97e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* LIVE DOT */
    .live-dot {
      display: inline-block;
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent); flex-shrink: 0;
      animation: live-pulse 2s ease-in-out infinite;
    }
    @keyframes live-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,217,126,0.5); }
      50% { box-shadow: 0 0 0 5px rgba(0,217,126,0); }
    }

    /* FADE UP */
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 0.55s ease-out both; }
    .fade-up-2 { animation: fade-up 0.55s 0.1s ease-out both; }
    .fade-up-3 { animation: fade-up 0.55s 0.2s ease-out both; }

    /* SOCIAL PROOF BAR */
    .hero-proof {
      display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
      margin-top: 1.75rem;
    }
    .hero-proof-item { display: flex; align-items: center; gap: 0.375rem; }
    .hero-proof-num {
      font-family: var(--font-mono); font-size: var(--text-sm);
      font-weight: 500; color: var(--text);
    }
    .hero-proof-label { font-size: var(--text-xs); color: var(--text-tertiary); }
    .hero-proof-sep { color: var(--border-strong); font-size: var(--text-xs); }
    .hero-kicker {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: rgba(0,217,126,0.08); border: 1px solid rgba(0,217,126,0.2);
      color: var(--accent); font-size: var(--text-xs); font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.08em;
      padding: 0.3rem 0.75rem; border-radius: 999px; margin-bottom: 1.5rem;
    }
    .hero-kicker::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
    .hero h1 {
      font-size: clamp(1.875rem, 5vw, 3rem); font-weight: 600;
      letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1.25rem;
      max-width: 700px;
    }
    .hero-lead {
      font-size: var(--text-lg); color: var(--text-secondary);
      line-height: 1.6; margin-bottom: 2rem; max-width: 560px;
    }
    .hero-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
    @media (max-width: 768px) { .hero-layout { grid-template-columns: 1fr; } }

    /* CODE BLOCK */
    .code-block {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 10px; overflow: hidden;
    }
    .code-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.625rem 1rem; border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .code-dots { display: flex; gap: 6px; }
    .code-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-strong); }
    .code-label { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-tertiary); }
    .code-copy-btn {
      background: none; border: 1px solid var(--border-strong); color: var(--text-secondary);
      font-size: 0.6875rem; font-family: var(--font-sans); padding: 0.25rem 0.625rem;
      border-radius: 4px; cursor: pointer; transition: all 150ms;
    }
    .code-copy-btn:hover { border-color: var(--text-secondary); color: var(--text); }
    .code-body { padding: 1.25rem; overflow-x: auto; }
    .code-body pre { font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.7; color: var(--text-secondary); white-space: pre; }
    .c-green { color: var(--accent); }
    .c-blue { color: #60a5fa; }
    .c-yellow { color: #fbbf24; }
    .c-dim { color: var(--text-tertiary); }

    /* LIVE DEMO */
    .demo-card {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 10px; padding: 1.5rem;
    }
    .demo-label {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 1rem;
    }
    .demo-input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .demo-input {
      flex: 1; background: var(--surface-2); border: 1px solid var(--border-strong);
      color: var(--text); font-family: var(--font-mono); font-size: var(--text-sm);
      padding: 0.625rem 0.875rem; border-radius: 6px; outline: none;
      transition: border-color 150ms;
    }
    .demo-input:focus { border-color: var(--accent); }
    .demo-input::placeholder { color: var(--text-tertiary); }
    .demo-btn {
      background: var(--accent); color: #000; border: none; font-size: var(--text-sm);
      font-weight: 600; font-family: var(--font-sans); padding: 0.625rem 1.25rem;
      border-radius: 6px; cursor: pointer; white-space: nowrap; transition: background 150ms;
      flex-shrink: 0;
    }
    .demo-btn:hover:not(:disabled) { background: var(--accent-hover); }
    .demo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .demo-result { min-height: 80px; display: flex; align-items: center; justify-content: center; }
    .demo-placeholder { font-size: var(--text-sm); color: var(--text-tertiary); font-style: italic; }
    .verdict-card { width: 100%; }
    .verdict-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .verdict-domain { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); }
    .verdict-badge {
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em;
      padding: 0.25rem 0.625rem; border-radius: 4px;
    }
    .verdict-ALLOW { background: rgba(0,217,126,0.15); color: var(--accent); }
    .verdict-REVIEW { background: rgba(245,158,11,0.15); color: var(--warning); }
    .verdict-BLOCK { background: rgba(239,68,68,0.15); color: var(--danger); }
    .verdict-score { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
    .verdict-signals { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .signal-chip {
      font-size: 0.6875rem; font-family: var(--font-mono);
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--text-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px;
    }
    .demo-note { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 0.875rem; }

    /* HERO CTAS */
    .hero-ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 2rem; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.375rem;
      background: var(--accent); color: #000; text-decoration: none;
      font-size: var(--text-sm); font-weight: 700; padding: 0.8rem 1.625rem;
      border-radius: 8px; position: relative; overflow: hidden;
      transition: background 150ms, transform 150ms, box-shadow 150ms;
    }
    .btn-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(0,217,126,0.3);
    }
    .btn-primary::after {
      content: '';
      position: absolute; top: -50%; left: -75%;
      width: 50%; height: 200%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: skewX(-20deg);
      transition: left 500ms ease;
    }
    .btn-primary:hover::after { left: 150%; }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.375rem;
      border: 1px solid var(--border-strong); color: var(--text-secondary); text-decoration: none;
      font-size: var(--text-sm); font-weight: 500; padding: 0.8rem 1.625rem;
      border-radius: 8px; transition: border-color 150ms, color 150ms;
    }
    .btn-secondary:hover { border-color: var(--text-tertiary); color: var(--text); }

    /* SECTION HEADERS */
    .section-label {
      font-size: var(--text-xs); font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 0.75rem;
    }
    .section-title { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
    .section-lead { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.6; max-width: 520px; }

    /* COMPARISON TABLE */
    .compare-table { width: 100%; border-collapse: collapse; margin-top: 2.5rem; }
    .compare-table th { text-align: left; padding: 0.75rem 1rem; font-size: var(--text-sm); font-weight: 600; border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); }
    .compare-table th:not(:first-child) { text-align: center; }
    .compare-table td { padding: 0.875rem 1rem; font-size: var(--text-sm); border-bottom: 1px solid var(--border); }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td { background: var(--surface); }
    .col-kairos { color: var(--accent); font-weight: 600; }
    .yes { color: var(--accent); }
    .no { color: var(--text-tertiary); }
    @media (max-width: 600px) {
      .compare-table { font-size: var(--text-xs); }
      .compare-table th, .compare-table td { padding: 0.625rem 0.5rem; }
    }

    /* USE CASE CARDS */
    .usecase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
    .usecase-card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; overflow: hidden; }
    .usecase-header { padding: 1.25rem 1.25rem 0; }
    .usecase-tag { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 0.5rem; }
    .usecase-title { font-size: var(--text-base); font-weight: 600; margin-bottom: 0.375rem; }
    .usecase-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem; }
    .usecase-code { background: var(--surface-2); border-top: 1px solid var(--border); padding: 1rem 1.25rem; overflow-x: auto; }
    .usecase-code pre { font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.7; color: var(--text-secondary); white-space: pre; }

    /* TRUST STRIP */
    .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-top: 2.5rem; }
    @media (max-width: 640px) { .trust-grid { grid-template-columns: repeat(2, 1fr); } }
    .trust-item { background: var(--surface); padding: 1.5rem 1.25rem; }
    .trust-number { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; color: var(--text); margin-bottom: 0.25rem; }
    .trust-desc { font-size: var(--text-xs); color: var(--text-tertiary); line-height: 1.5; }
    .trust-badges { display: flex; flex-wrap: wrap; gap: 0.625rem; margin-top: 2rem; }
    .trust-badge {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--surface); border: 1px solid var(--border-strong);
      font-size: var(--text-xs); color: var(--text-secondary);
      padding: 0.5rem 0.875rem; border-radius: 6px;
    }
    .trust-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

    /* PRICING */
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
    .pricing-card {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 10px; padding: 1.75rem; display: flex; flex-direction: column;
    }
    .pricing-card.featured {
      border: 1px solid rgba(0,217,126,0.35);
      background: linear-gradient(180deg, rgba(0,217,126,0.05) 0%, transparent 35%);
      box-shadow: 0 0 0 1px rgba(0,217,126,0.15), 0 8px 32px rgba(0,217,126,0.1);
      transform: scale(1.02);
      position: relative;
    }
    .pricing-badge {
      position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: #000;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 0.2rem 0.875rem; border-radius: 0 0 8px 8px; white-space: nowrap;
    }
    .pricing-tier { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 0.75rem; }
    .pricing-card.featured .pricing-tier { color: var(--accent); }
    .pricing-price { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.03em; margin-bottom: 0.25rem; }
    .pricing-price-sub { font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 1.25rem; }
    .pricing-features { list-style: none; flex: 1; }
    .pricing-features li { font-size: var(--text-sm); color: var(--text-secondary); padding: 0.375rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .pricing-features li::before { content: '✓'; color: var(--accent); font-weight: 600; flex-shrink: 0; }
    .pricing-cta-link {
      display: block; text-align: center; margin-top: 1.5rem;
      background: var(--accent); color: #000; text-decoration: none;
      font-size: var(--text-sm); font-weight: 600; padding: 0.75rem;
      border-radius: 6px; transition: background 150ms;
    }
    .pricing-cta-link:hover { background: var(--accent-hover); }
    .pricing-cta-ghost {
      display: block; text-align: center; margin-top: 1.5rem;
      border: 1px solid var(--border-strong); color: var(--text); text-decoration: none;
      font-size: var(--text-sm); font-weight: 500; padding: 0.75rem;
      border-radius: 6px; transition: border-color 150ms;
    }
    .pricing-cta-ghost:hover { border-color: var(--text-secondary); }
    .pricing-full-link { text-align: center; margin-top: 1.5rem; }
    .pricing-full-link a { color: var(--text-secondary); font-size: var(--text-sm); text-decoration: none; }
    .pricing-full-link a:hover { color: var(--text); }

    /* HOW IT WORKS */
    .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
    @media (max-width: 640px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-card {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 12px; padding: 1.75rem;
    }
    .step-number {
      font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600;
      color: var(--accent); letter-spacing: 0.08em; margin-bottom: 1rem;
    }
    .step-title { font-size: var(--text-base); font-weight: 600; margin-bottom: 0.5rem; }
    .step-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }
    .step-code {
      background: #0d0d0d; border: 1px solid var(--border);
      border-radius: 8px; padding: 0.875rem 1rem; overflow-x: auto;
    }
    .step-code pre { font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.6; color: var(--text-secondary); white-space: pre; }
    .step-connector { display: none; }

    /* FAQ */
    .faq-list { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0; }
    .faq-item { border-bottom: 1px solid var(--border); }
    .faq-item:first-child { border-top: 1px solid var(--border); }
    .faq-q {
      width: 100%; background: none; border: none; text-align: left;
      color: var(--text); font-family: var(--font-sans); font-size: var(--text-base);
      font-weight: 500; padding: 1.25rem 0; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center; gap: 1rem;
    }
    .faq-icon { flex-shrink: 0; color: var(--text-tertiary); transition: transform 200ms; font-size: 1.25rem; line-height: 1; }
    .faq-item.open .faq-icon { transform: rotate(45deg); }
    .faq-a {
      font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7;
      padding-bottom: 1.25rem; display: none; max-width: 620px;
    }
    .faq-item.open .faq-a { display: block; }

    /* FOOTER */
    footer {
      border-top: 1px solid var(--border);
      padding: 3rem 0;
    }
    .footer-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 1.5rem;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 1.5rem;
    }
    .footer-logo { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); }
    .footer-logo span { color: var(--accent); }
    .footer-tagline { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 0.25rem; }
    .footer-links { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .footer-link { color: var(--text-tertiary); text-decoration: none; font-size: var(--text-xs); padding: 0.25rem 0.5rem; border-radius: 4px; transition: color 150ms; }
    .footer-link:hover { color: var(--text-secondary); }
  </style>

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kairos Check",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "description": "OSINT-first fraud scoring API for indie devs and solo founders. Detect fraudulent domains, emails, phones and IBANs.",
    "url": "https://kairoscheck.net",
    "offers": {
      "@type": "Offer",
      "price": "29.00",
      "priceCurrency": "EUR",
      "priceValidUntil": "2027-01-01"
    }
  }
  </script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

  <nav aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Kairos Check home">
        <svg class="nav-logo-mark" width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
          <path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e"/>
          <path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-logo-text">Kairos<span>Check</span></span>
      </a>
      <div class="nav-links">
        <a href="/docs" class="nav-link">Docs</a>
        <a href="/pricing" class="nav-link">Pricing</a>
        <a href="/status" class="nav-link">Status</a>
        <a href="/pricing" class="nav-cta">Get API key</a>
      </div>
    </div>
  </nav>

  <main id="main">

    <!-- ── HERO ─────────────────────────────────────────────────── -->
    <section class="hero" aria-labelledby="hero-h1">
      <div class="container">
        <div class="hero-kicker fade-up"><span class="live-dot" aria-hidden="true"></span>Fraud API · Self-serve · GDPR-native</div>
        <div class="hero-layout">
          <div>
            <h1 id="hero-h1" class="fade-up-2">Stop fraud before it costs you a <span class="gradient-text">customer</span></h1>
            <p class="hero-lead fade-up-3">OSINT-first scoring in one POST call. No SDK. No sales call.<br>Starts at €29/month. Cancel anytime.</p>
            <div class="hero-ctas">
              <a href="/pricing" class="btn-primary">Get API key — €29 <span aria-hidden="true">→</span></a>
              <a href="/docs/quickstart" class="btn-secondary">Try free (50/month)</a>
            </div>
            <div class="hero-proof" aria-label="Live usage stats">
              <span class="hero-proof-item">
                <span class="hero-proof-num">${domainsScored || '0'}</span>
                <span class="hero-proof-label">domains scored</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num">${threatsBlocked || '0'}</span>
                <span class="hero-proof-label">threats blocked</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num">${avgMsDisplay}</span>
                <span class="hero-proof-label">avg latency</span>
              </span>
            </div>
          </div>
          <div>
            <div class="code-block" role="region" aria-label="API quickstart example">
              <div class="code-header">
                <div class="code-dots" aria-hidden="true">
                  <div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div>
                </div>
                <span class="code-label">quickstart.sh</span>
                <button class="code-copy-btn" id="hero-copy-btn" aria-label="Copy curl example to clipboard">Copy</button>
              </div>
              <div class="code-body">
                <pre id="hero-code"><span class="c-dim">$ </span><span class="c-green">curl</span> https://kairoscheck.net/api/check <span class="c-dim">\\</span>
  <span class="c-blue">-H</span> <span class="c-yellow">"Authorization: Bearer kc_live_&lt;your_key&gt;"</span> <span class="c-dim">\\</span>
  <span class="c-blue">-H</span> <span class="c-yellow">"Content-Type: application/json"</span> <span class="c-dim">\\</span>
  <span class="c-blue">-d</span> <span class="c-yellow">'{"domain":"suspicious-shop.io"}'</span>

<span class="c-dim">// Response</span>
{
  <span class="c-blue">"score"</span>: 73,
  <span class="c-blue">"verdict"</span>: <span class="c-yellow">"BLOCK"</span>,
  <span class="c-blue">"signals"</span>: [<span class="c-yellow">"reputation-complaint"</span>, <span class="c-yellow">"checkout-dna"</span>]
}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Live demo -->
        <div style="max-width:560px; margin-top:2rem;">
          <div class="demo-card" role="region" aria-label="Live domain check demo">
            <p class="demo-label">Live demo — no account required</p>
            <div class="demo-input-row">
              <input
                type="text"
                class="demo-input"
                id="demo-domain"
                placeholder="e.g. suspicious-site.io"
                aria-label="Domain to check"
                maxlength="128"
                autocomplete="off"
                spellcheck="false"
              >
              <button class="demo-btn" id="demo-btn" aria-live="polite">Check now</button>
            </div>
            <div class="demo-result" id="demo-result" aria-live="polite" aria-atomic="true">
              <p class="demo-placeholder">Enter any domain to see a real score.</p>
            </div>
            <p class="demo-note">Rate-limited to 10 checks/hour per IP. Domain checks only in demo.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ─────────────────────────────────────────── -->
    <section aria-labelledby="how-h2">
      <div class="container">
        <p class="section-label">How it works</p>
        <h2 class="section-title" id="how-h2">In production in 30 minutes</h2>
        <p class="section-lead">No agents. No sales call. No contract. Self-serve from day one.</p>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">01 — Get your key</div>
            <h3 class="step-title">Subscribe and get an API key instantly</h3>
            <p class="step-desc">Choose a plan, pay with card, receive your key by email. No waiting, no approval, no KYC.</p>
            <div class="step-code"><pre><span style="color:var(--accent)">x-api-key</span>: kc_live_xxxxxxxxxxxx</pre></div>
          </div>
          <div class="step-card">
            <div class="step-number">02 — One POST call</div>
            <h3 class="step-title">Send the domain, email, phone or IBAN</h3>
            <p class="step-desc">No SDK required. Works with any language that can make an HTTP request.</p>
            <div class="step-code"><pre><span style="color:var(--text-tertiary)">POST</span> /api/check
<span style="color:#60a5fa">"domain"</span>: <span style="color:#fbbf24">"susp.io"</span></pre></div>
          </div>
          <div class="step-card">
            <div class="step-number">03 — Act on the score</div>
            <h3 class="step-title">Block, flag for review, or allow</h3>
            <p class="step-desc">Every response includes a score (0–100), a verdict, and the exact signals that triggered it.</p>
            <div class="step-code"><pre><span style="color:#60a5fa">"verdict"</span>: <span style="color:var(--danger)">"BLOCK"</span>
<span style="color:#60a5fa">"score"</span>: <span style="color:var(--accent)">94</span></pre></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COMPARISON ────────────────────────────────────────────── -->
    <section aria-labelledby="compare-h2">
      <div class="container">
        <p class="section-label">Why Kairos Check</p>
        <h2 class="section-title" id="compare-h2">Why not Stripe Radar?</h2>
        <p class="section-lead">Stripe Radar is free and excellent — if your users pay through Stripe. Kairos Check solves the cases Radar can't.</p>
        <div style="overflow-x:auto;">
          <table class="compare-table" aria-label="Kairos Check vs Stripe Radar feature comparison">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Stripe Radar</th>
                <th scope="col" class="col-kairos">Kairos Check</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Works outside Stripe</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>Check domains, emails, phones, IBANs</td><td class="no">Cards only</td><td class="yes col-kairos">All 4</td></tr>
              <tr><td>OSINT signals (reputation, patterns)</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>Explainable scores with reasons</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>Audit trail exportable (GDPR Art.15)</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>GDPR Art.22 human oversight flag</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>Use before Stripe (pre-signup check)</td><td class="no">❌</td><td class="yes col-kairos">✅</td></tr>
              <tr><td>Price</td><td>Free (within Stripe)</td><td class="col-kairos">€29/mo standalone</td></tr>
            </tbody>
          </table>
        </div>
        <p style="margin-top:1.25rem; font-size:var(--text-sm); color:var(--text-tertiary);">
          Use Stripe Radar for card fraud. Use Kairos Check for everything before the card. <a href="/compare/stripe-radar" style="color:var(--accent); text-decoration:none;">Full comparison →</a>
        </p>
      </div>
    </section>

    <!-- ── USE CASES ─────────────────────────────────────────────── -->
    <section aria-labelledby="usecases-h2">
      <div class="container">
        <p class="section-label">Integration</p>
        <h2 class="section-title" id="usecases-h2">Three integrations, 10 lines each</h2>
        <p class="section-lead">Drop into any auth flow, checkout hook, or scheduled job.</p>
        <div class="usecase-grid">
          <article class="usecase-card">
            <div class="usecase-header">
              <p class="usecase-tag">Signup flow</p>
              <h3 class="usecase-title">Block fraudulent signups</h3>
              <p class="usecase-desc">Check a new user's email domain before creating an account.</p>
            </div>
            <div class="usecase-code">
              <pre>const res = await fetch(
  'https://kairoscheck.net/api/check',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + KC_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      domain: email.split('@')[1]
    })
  }
);
const { verdict } = await res.json();
if (verdict === 'BLOCK') throw new Error('Signup denied');</pre>
            </div>
          </article>
          <article class="usecase-card">
            <div class="usecase-header">
              <p class="usecase-tag">E-commerce</p>
              <h3 class="usecase-title">Pre-validate before checkout</h3>
              <p class="usecase-desc">Score the customer's domain before accepting a Stripe charge.</p>
            </div>
            <div class="usecase-code">
              <pre>// Shopify / Stripe webhook handler
app.post('/checkout/validate', async (req, res) => {
  const { email, domain } = req.body;
  const check = await kairosCheck({ domain });

  if (check.verdict === 'BLOCK') {
    return res.status(400).json({
      error: 'Order rejected by fraud check',
      ref: check.audit_id
    });
  }
  // proceed with payment...
});</pre>
            </div>
          </article>
          <article class="usecase-card">
            <div class="usecase-header">
              <p class="usecase-tag">Monitoring</p>
              <h3 class="usecase-title">Scan your customer base daily</h3>
              <p class="usecase-desc">Run a cron job to flag high-risk accounts before they charge back.</p>
            </div>
            <div class="usecase-code">
              <pre>// cron.js — runs daily at 2am
const customers = await db.getActiveCustomers();
for (const c of customers) {
  const { score, verdict } =
    await kairosCheck({ domain: c.domain });

  if (verdict === 'BLOCK' && c.riskScore < 70) {
    await db.flagForReview(c.id, { score });
    await notify.slack(c.id, score);
  }
}</pre>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ── TRUST SIGNALS ─────────────────────────────────────────── -->
    <section aria-labelledby="trust-h2">
      <div class="container">
        <p class="section-label">Trust</p>
        <h2 class="section-title" id="trust-h2">Built for production from day one</h2>
        <div class="trust-grid" role="list">
          <div class="trust-item" role="listitem">
            <div class="trust-number">${domainsScored || '0'}</div>
            <div class="trust-desc">Domains scored</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">${threatsBlocked || '0'}</div>
            <div class="trust-desc">Threats blocked</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">${avgMsDisplay}</div>
            <div class="trust-desc">Avg response time</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">99.9%</div>
            <div class="trust-desc">Uptime target &middot; <a href="/status" style="color:var(--accent);text-decoration:none;">live →</a></div>
          </div>
        </div>
        <div class="trust-badges" role="list" aria-label="Compliance signals">
          <div class="trust-badge" role="listitem"><div class="trust-badge-dot"></div> GDPR Art.6 / 22 compliant</div>
          <div class="trust-badge" role="listitem"><div class="trust-badge-dot"></div> OSINT-only inputs</div>
          <div class="trust-badge" role="listitem"><div class="trust-badge-dot"></div> EU-hosted (Railway Ireland)</div>
          <div class="trust-badge" role="listitem"><div class="trust-badge-dot"></div> SHA-256 audit chain</div>
          <div class="trust-badge" role="listitem"><div class="trust-badge-dot"></div> Zero PII stored in plaintext</div>
        </div>
      </div>
    </section>

    <!-- ── PRICING ───────────────────────────────────────────────── -->
    <section aria-labelledby="pricing-h2">
      <div class="container">
        <p class="section-label">Pricing</p>
        <h2 class="section-title" id="pricing-h2">Simple, honest pricing</h2>
        <p class="section-lead">No contracts. No calls. Cancel anytime. One chargeback avoided pays for months.</p>
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-tier">Free</div>
            <div class="pricing-price">€0</div>
            <div class="pricing-price-sub">50 checks/month · forever</div>
            <ul class="pricing-features" aria-label="Free tier features">
              <li>Domain + email checks</li>
              <li>Score + verdict + signals</li>
              <li>No credit card</li>
            </ul>
            <a href="/docs/quickstart" class="pricing-cta-ghost">Read the docs →</a>
          </div>
          <div class="pricing-card">
            <div class="pricing-tier">Starter</div>
            <div class="pricing-price">€29</div>
            <div class="pricing-price-sub">/month · 5,000 checks + VAT</div>
            <ul class="pricing-features" aria-label="Starter tier features">
              <li>5,000 checks/month</li>
              <li>Domain, email, phone, IBAN</li>
              <li>Webhook on BLOCK</li>
              <li>Audit trail (CSV export)</li>
              <li>Cancel anytime</li>
            </ul>
            <a href="/pricing" class="pricing-cta-ghost">Get started →</a>
          </div>
          <div class="pricing-card featured" aria-label="Most popular plan">
            <div class="pricing-badge">Most Popular</div>
            <div class="pricing-tier">Pro</div>
            <div class="pricing-price">€79</div>
            <div class="pricing-price-sub">/month · 25,000 checks + VAT</div>
            <ul class="pricing-features" aria-label="Pro tier features">
              <li>25,000 checks/month</li>
              <li>All Starter features</li>
              <li>GDPR Art.15/17 endpoints</li>
              <li>Batch API (up to 100/call)</li>
              <li>SLA 99.9% · Priority support</li>
            </ul>
            <a href="/pricing" class="pricing-cta-link">Get API key →</a>
          </div>
        </div>
        <div class="pricing-full-link">
          <a href="/pricing">Full pricing and comparison →</a>
        </div>
      </div>
    </section>

    <!-- ── FAQ ──────────────────────────────────────────────────── -->
    <section aria-labelledby="faq-h2">
      <div class="container" style="max-width:720px;">
        <p class="section-label">FAQ</p>
        <h2 class="section-title" id="faq-h2">Common questions</h2>
        <div class="faq-list" role="list">
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false">
              Why pay €29 if Stripe Radar is free?
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a">Stripe Radar only works inside Stripe and only on card transactions. Kairos Check works anywhere — before a user signs up, before a payment is initiated, on domains and emails you receive, or in a cron job. If your fraud happens outside the Stripe payment flow, Radar cannot help.</div>
          </div>
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false">
              How fast can I integrate?
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a">One POST request. No SDK required (though one is available). You need your API key, a domain/email/phone/IBAN to check, and an Authorization header. Most developers are in production in under 30 minutes. <a href="/docs/quickstart" style="color:var(--accent);">See the quickstart →</a></div>
          </div>
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false">
              What counts as a "check"?
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a">One API call to <code style="font-family:var(--font-mono);font-size:0.875em;">/api/check</code> counts as one check, regardless of the result or the entity type (domain, email, phone, IBAN). Quota resets on the 1st of each calendar month.</div>
          </div>
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false">
              Can I cancel anytime?
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a">Yes. Cancel directly from your Stripe billing portal — no email required, no call, no notice period. We also offer a 14-day refund on the first paid month. No questions asked.</div>
          </div>
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false">
              Where is my data stored?
              <span class="faq-icon" aria-hidden="true">+</span>
            </button>
            <div class="faq-a">All data is stored on EU infrastructure (Railway, Ireland region). We never store the raw input in plaintext — only a salted pseudonym and the resulting score. Your API key is stored as a SHA-256 hash only. See our <a href="/privacy" style="color:var(--accent);">privacy policy →</a></div>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer>
    <div class="footer-inner">
      <div>
        <a href="/" style="display:inline-flex;align-items:center;gap:0.5rem;text-decoration:none;">
          <svg width="16" height="18" viewBox="0 0 20 22" fill="none" aria-hidden="true">
            <path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e"/>
            <path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="footer-logo">Kairos<span>Check</span></span>
        </a>
        <div class="footer-tagline">OSINT-first fraud API. EU-hosted. No data sold.</div>
      </div>
      <nav aria-label="Footer navigation">
        <div class="footer-links">
          <a href="/docs" class="footer-link">Docs</a>
          <a href="/pricing" class="footer-link">Pricing</a>
          <a href="/examples" class="footer-link">Examples</a>
          <a href="/compare/stripe-radar" class="footer-link">vs Stripe Radar</a>
          <a href="/status" class="footer-link">Status</a>
          <a href="/changelog" class="footer-link">Changelog</a>
          <a href="/privacy" class="footer-link">Privacy</a>
          <a href="/terms" class="footer-link">Terms</a>
        </div>
      </nav>
    </div>
  </footer>

  <script>
    // Copy hero curl example
    (function() {
      var btn = document.getElementById('hero-copy-btn');
      var pre = document.getElementById('hero-code');
      if (!btn || !pre) return;
      btn.addEventListener('click', function() {
        var text = pre.innerText || pre.textContent || '';
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = 'Copied';
          setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
        }).catch(function() { btn.textContent = 'Failed'; setTimeout(function() { btn.textContent = 'Copy'; }, 2000); });
      });
    })();

    // Live demo
    (function() {
      var input = document.getElementById('demo-domain');
      var btn = document.getElementById('demo-btn');
      var result = document.getElementById('demo-result');

      function setResult(html) { result.innerHTML = html; }

      function verdictColor(v) {
        if (v === 'BLOCK') return 'var(--danger)';
        if (v === 'REVIEW') return 'var(--warning)';
        return 'var(--accent)';
      }

      async function runCheck() {
        var domain = (input.value || '').trim().replace(/^https?:\\/\\//, '').split('/')[0];
        if (!domain || domain.length < 3) {
          setResult('<p class="demo-placeholder">Enter a valid domain first.</p>');
          return;
        }
        btn.disabled = true;
        btn.textContent = 'Checking...';
        setResult('<p class="demo-placeholder">Scoring ' + domain + '…</p>');

        try {
          var res = await fetch('/api/check-public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: domain })
          });
          var data = await res.json();

          if (!res.ok || data.error) {
            var msg = data.error || ('Error ' + res.status);
            setResult('<p class="demo-placeholder">' + msg + '</p>');
            return;
          }

          var signals = Array.isArray(data.signals) ? data.signals : [];
          var chipsHtml = signals.length
            ? signals.slice(0, 5).map(function(s) { return '<span class="signal-chip">' + s + '</span>'; }).join('')
            : '<span class="signal-chip">no-signals</span>';

          setResult(
            '<div class="verdict-card">' +
              '<div class="verdict-header">' +
                '<span class="verdict-domain">' + domain + '</span>' +
                '<span class="verdict-badge verdict-' + data.verdict + '">' + data.verdict + '</span>' +
              '</div>' +
              '<div class="verdict-score" style="color:' + verdictColor(data.verdict) + '">' + data.score + '<span style="font-size:var(--text-base);color:var(--text-tertiary);font-weight:400"> /100</span></div>' +
              '<div class="verdict-signals">' + chipsHtml + '</div>' +
            '</div>'
          );
        } catch (e) {
          setResult('<p class="demo-placeholder">Network error. Try again.</p>');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Check now';
        }
      }

      btn.addEventListener('click', runCheck);
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') runCheck(); });
    })();

    // FAQ accordion
    (function() {
      var items = document.querySelectorAll('.faq-item');
      items.forEach(function(item) {
        var q = item.querySelector('.faq-q');
        q.addEventListener('click', function() {
          var isOpen = item.classList.contains('open');
          items.forEach(function(i) { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
          if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
        });
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
