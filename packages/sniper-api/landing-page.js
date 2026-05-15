'use strict';

const { readGlobalMetrics } = require('../sniper-db');

function renderLandingPage() {
  const m = readGlobalMetrics() || {};
  const rawRequests = m.verifyRequests || 0;
  const rawBlocked  = m.blocked || 0;
  const domainsScored = rawRequests.toLocaleString('en');
  const threatsBlocked = rawBlocked.toLocaleString('en');
  const avgMs = m.avgLatencyMs ? Math.round(m.avgLatencyMs) : null;
  const avgMsDisplay = avgMs ? `${avgMs}ms` : '&lt;200ms';
  // Only show live proof bar when there is real data — zeros destroy credibility
  const showProofBar = rawRequests > 0;

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
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&family=jetbrains-mono:400,500" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    :root {
      --bg: #060606; --surface: #0f0f0f; --surface-2: #161616;
      --border: rgba(255,255,255,0.07); --border-strong: rgba(255,255,255,0.11);
      --text: #f0f0f0; --text-secondary: #909090; --text-tertiary: #555555;
      --accent: #00d97e; --accent-hover: #00b369;
      --accent-dim: rgba(0,217,126,0.08); --accent-border: rgba(0,217,126,0.25);
      --accent-glow: rgba(0,217,126,0.12);
      --danger: #ef4444; --warning: #f59e0b;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
      --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
      --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.5rem; --text-3xl: 3.5rem;
      --radius: 14px;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font-sans); font-size: 0.9375rem; -webkit-font-smoothing: antialiased; }
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
      background: rgba(0,0,0,0.8); backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
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
    section { padding: 7rem 0; }
    section + section { border-top: 1px solid var(--border); }

    /* HERO */
    .hero { padding: 6rem 0 5rem; position: relative; overflow: hidden; }

    /* Grid overlay */
    .hero::before {
      content: '';
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%);
      pointer-events: none;
    }
    .hero .container { position: relative; z-index: 1; }

    /* ORBS — gradient depth spheres (like Anthropic, Vercel, Claude.ai) */
    .hero-orbs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
    .orb-1 {
      position: absolute;
      width: 900px; height: 900px; border-radius: 50%;
      background: radial-gradient(circle at center, rgba(0,217,126,0.2) 0%, rgba(0,217,126,0.05) 40%, transparent 70%);
      top: -500px; left: -250px;
      filter: blur(60px);
      animation: orb-drift 20s ease-in-out infinite alternate;
    }
    .orb-2 {
      position: absolute;
      width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(circle at center, rgba(0,160,255,0.1) 0%, transparent 65%);
      top: -200px; right: -200px;
      filter: blur(80px);
      animation: orb-drift 25s ease-in-out infinite alternate-reverse;
    }
    .orb-3 {
      position: absolute;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle at center, rgba(0,217,126,0.08) 0%, transparent 65%);
      bottom: -150px; left: 35%;
      filter: blur(70px);
    }
    @keyframes orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(30px,20px) scale(1.06); }
    }

    /* Noise grain overlay — adds tactile depth */
    .hero-noise {
      position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-repeat: repeat; background-size: 200px 200px;
    }

    @media (prefers-reduced-motion: reduce) {
      .orb-1, .orb-2, .orb-3 { animation: none; }
    }

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
      font-size: clamp(2rem, 4.5vw, 3.25rem); font-weight: 700;
      letter-spacing: -0.04em; line-height: 1.08; margin-bottom: 1.5rem;
      max-width: 620px;
    }
    .hero-lead {
      font-size: 1.1875rem; color: #b0b0b0;
      line-height: 1.65; margin-bottom: 2rem; max-width: 560px;
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

    /* LIVE DEMO — hero right column */
    .demo-wrap {
      width: 100%;
    }
    .demo-card {
      background: #0d0d0d;
      border: 1px solid var(--border-strong);
      border-radius: 14px; overflow: hidden;
      box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
    }
    .demo-header {
      background: #161616; border-bottom: 1px solid var(--border);
      padding: 0.625rem 1rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .demo-dots { display: flex; gap: 6px; }
    .demo-dot { width: 10px; height: 10px; border-radius: 50%; }
    .demo-dot.r { background: #ff5f57; }
    .demo-dot.a { background: #ffbd2e; }
    .demo-dot.g { background: #28c840; }
    .demo-title-bar {
      flex: 1; background: var(--surface-2); border: 1px solid var(--border);
      border-radius: 5px; padding: 0.2rem 0.75rem;
      font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-tertiary);
      display: flex; align-items: center; gap: 0.5rem;
    }
    .demo-title-bar .live-dot { width: 5px; height: 5px; }
    .demo-body { padding: 1.5rem; }
    .demo-label {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 1rem;
    }
    .demo-input-row {
      display: flex; gap: 0.5rem; margin-bottom: 1rem;
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 8px; padding: 0.375rem 0.375rem 0.375rem 1rem;
      transition: border-color 200ms;
    }
    .demo-input-row:focus-within { border-color: rgba(0,217,126,0.4); }
    .demo-input {
      flex: 1; background: none; border: none;
      color: var(--text); font-family: var(--font-mono); font-size: var(--text-sm);
      outline: none; padding: 0.25rem 0;
    }
    .demo-input::placeholder { color: var(--text-tertiary); }
    .demo-btn {
      background: var(--accent); color: #000; border: none; font-size: var(--text-sm);
      font-weight: 700; font-family: var(--font-sans); padding: 0.5rem 1.25rem;
      border-radius: 6px; cursor: pointer; white-space: nowrap;
      transition: background 150ms, transform 100ms;
      flex-shrink: 0;
    }
    .demo-btn:hover:not(:disabled) { background: var(--accent-hover); }
    .demo-btn:active:not(:disabled) { transform: scale(0.97); }
    .demo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .demo-result { min-height: 90px; display: flex; align-items: center; justify-content: center; }
    .demo-placeholder { font-size: var(--text-sm); color: var(--text-tertiary); }
    .demo-thinking {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: var(--text-sm); color: var(--text-tertiary); font-family: var(--font-mono);
    }
    .thinking-dots span {
      display: inline-block; width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent); opacity: 0.4; margin: 0 1px;
      animation: blink 1.2s ease-in-out infinite;
    }
    .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
    .verdict-card { width: 100%; }
    .verdict-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.875rem; }
    .verdict-domain { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); }
    .verdict-badge {
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em;
      padding: 0.3rem 0.75rem; border-radius: 999px;
    }
    .verdict-ALLOW { background: rgba(0,217,126,0.15); color: var(--accent); border: 1px solid rgba(0,217,126,0.25); }
    .verdict-REVIEW { background: rgba(245,158,11,0.15); color: var(--warning); border: 1px solid rgba(245,158,11,0.25); }
    .verdict-BLOCK { background: rgba(239,68,68,0.15); color: var(--danger); border: 1px solid rgba(239,68,68,0.25); }
    .verdict-score-row { display: flex; align-items: baseline; gap: 0.375rem; margin-bottom: 0.75rem; }
    .verdict-score { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; }
    .verdict-score-max { font-size: var(--text-sm); color: var(--text-tertiary); font-weight: 400; }
    .verdict-signals { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .signal-chip {
      font-size: 0.6875rem; font-family: var(--font-mono);
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--text-tertiary); padding: 0.2rem 0.625rem; border-radius: 4px;
    }
    .demo-note { font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }

    /* HOW IT WORKS — elite terminal style */
    .steps-flow { display: grid; grid-template-columns: 1fr 32px 1fr 32px 1fr; align-items: stretch; margin-top: 3rem; gap: 0; }
    @media (max-width: 900px) { .steps-flow { grid-template-columns: 1fr; gap: 1.5rem; } .step-arrow { display: none !important; } }
    .step-terminal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius); overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
      transition: box-shadow 300ms, border-color 300ms;
      display: flex; flex-direction: column; height: 100%;
    }
    .step-terminal:hover {
      border-color: rgba(0,217,126,0.2);
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,217,126,0.06);
    }
    .step-term-header {
      background: #1a1a1a; border-bottom: 1px solid var(--border);
      padding: 0.625rem 1rem;
      display: flex; align-items: center; gap: 0.75rem;
      flex-shrink: 0;
    }
    .step-term-dots { display: flex; gap: 5px; }
    .step-term-dot { width: 9px; height: 9px; border-radius: 50%; }
    .step-num-badge {
      margin-left: auto; background: rgba(0,217,126,0.1); border: 1px solid rgba(0,217,126,0.2);
      color: var(--accent); font-family: var(--font-mono);
      font-size: 0.625rem; font-weight: 700; letter-spacing: 0.06em;
      padding: 0.125rem 0.5rem; border-radius: 4px;
    }
    .step-term-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
    .step-term-code { margin-top: auto; }
    .step-term-title { font-size: var(--text-base); font-weight: 600; margin-bottom: 0.375rem; color: var(--text); }
    .step-term-desc { font-size: var(--text-sm); color: var(--text-tertiary); line-height: 1.55; margin-bottom: 1rem; }
    .step-term-code {
      background: rgba(0,0,0,0.4); border-radius: 6px;
      padding: 0.875rem 1rem; overflow-x: auto;
    }
    .step-term-code pre { font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.7; color: var(--text-secondary); white-space: pre; }
    .step-arrow {
      display: flex; align-items: center; justify-content: center;
      padding-top: 0; color: rgba(0,217,126,0.4); font-size: 1rem;
    }

    /* INTEGRATION — language tabs */
    .integration-tabs { display: flex; gap: 0; margin-top: 2.5rem; border-bottom: 1px solid var(--border); }
    .tab-btn {
      background: none; border: none; cursor: pointer; font-family: var(--font-sans);
      font-size: var(--text-sm); color: var(--text-tertiary);
      padding: 0.625rem 1.25rem; border-bottom: 2px solid transparent;
      transition: color 150ms, border-color 150ms; margin-bottom: -1px;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .tab-btn:hover { color: var(--text-secondary); }
    .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .integration-code {
      background: #0d0d0d; border: 1px solid var(--border-strong); border-top: none;
      border-radius: 0 0 12px 12px; overflow: hidden;
    }
    .integration-code-header {
      background: #161616; border-bottom: 1px solid var(--border);
      padding: 0.5rem 1rem;
      display: flex; align-items: center; justify-content: space-between;
    }
    .integration-filename { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-tertiary); }
    .integration-copy {
      background: none; border: 1px solid var(--border-strong); color: var(--text-secondary);
      font-size: 0.6875rem; font-family: var(--font-sans);
      padding: 0.2rem 0.625rem; border-radius: 4px; cursor: pointer; transition: all 150ms;
    }
    .integration-copy:hover { border-color: var(--text-secondary); color: var(--text); }
    .integration-body { padding: 1.5rem; overflow-x: auto; }
    .integration-body pre {
      font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.75;
      color: var(--text-secondary); white-space: pre;
      counter-reset: line;
    }
    .line { display: flex; }
    .line-num { user-select: none; color: var(--border-strong); width: 2rem; flex-shrink: 0; text-align: right; margin-right: 1.5rem; font-size: 0.6875rem; padding-top: 0.125rem; }

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
    .section-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; margin-bottom: 0.875rem; }
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
    .trust-number { font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.045em; color: var(--text); margin-bottom: 0.25rem; }
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
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius); padding: 2.25rem; display: flex; flex-direction: column;
      transition: border-color 200ms, box-shadow 200ms;
    }
    .pricing-card:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .pricing-card.featured {
      border: 1px solid rgba(0,217,126,0.35);
      background: linear-gradient(180deg, rgba(0,217,126,0.05) 0%, transparent 35%);
      box-shadow: 0 0 0 1px rgba(0,217,126,0.15), 0 8px 32px rgba(0,217,126,0.1);
      transform: scale(1.035);
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
    .pricing-price { font-size: clamp(2.25rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.045em; margin-bottom: 0.375rem; }
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

    /* TILT — applied via JS to all tiltable cards */
    .tilt-card {
      transform-style: preserve-3d;
      transition: transform 400ms ease, box-shadow 400ms ease;
      will-change: transform;
    }
    .tilt-card:hover {
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,217,126,0.06);
    }

    /* BROWSER FRAME — makes code look like a real screen */
    .browser-frame {
      border-radius: 12px; overflow: hidden;
      border: 1px solid var(--border-strong);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset;
    }
    .browser-bar {
      background: #1a1a1a; border-bottom: 1px solid var(--border);
      padding: 0.625rem 1rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .browser-dots { display: flex; gap: 6px; }
    .browser-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red    { background: #ff5f57; }
    .dot-amber  { background: #ffbd2e; }
    .dot-green  { background: #28c840; }
    .browser-url {
      flex: 1; background: var(--surface-2); border: 1px solid var(--border);
      border-radius: 5px; padding: 0.2rem 0.625rem;
      font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-tertiary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .browser-url span { color: var(--accent); }

    /* NETWORK INTELLIGENCE SECTION */
    .network-section { padding: 5rem 0; }
    .network-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-top: 3rem; }
    @media (max-width: 768px) { .network-grid { grid-template-columns: 1fr; gap: 2rem; } }
    .network-stat-row { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; }
    .network-stat {
      display: flex; align-items: center; gap: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius); padding: 1.125rem 1.25rem;
      transition: border-color 200ms, box-shadow 200ms;
    }
    .network-stat:hover { border-color: rgba(0,217,126,0.25); box-shadow: 0 0 20px rgba(0,217,126,0.05); }
    .network-stat-icon {
      width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
      background: rgba(0,217,126,0.1); border: 1px solid rgba(0,217,126,0.2);
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .network-stat-text { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; }
    .network-stat-text strong { color: var(--text); display: block; margin-bottom: 0.125rem; }

    /* HOW IT WORKS */
    .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
    @media (max-width: 640px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-card {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 12px; padding: 1.75rem;
      cursor: default;
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

    /* SCROLL REVEAL */
    .reveal {
      opacity: 0; transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .reveal.in-view { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }

    /* FINAL CTA SECTION */
    .final-cta {
      padding: 8rem 0; text-align: center; position: relative; overflow: hidden;
    }
    .final-cta::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,217,126,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .final-cta h2 {
      font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800;
      letter-spacing: -0.04em; line-height: 1.0; margin-bottom: 1.5rem;
    }
    .final-cta p {
      font-size: var(--text-lg); color: var(--text-secondary);
      margin-bottom: 2.5rem; max-width: 480px; margin-left: auto; margin-right: auto;
    }
    .final-cta .btn-primary {
      font-size: var(--text-base); padding: 1rem 2.5rem;
    }
    .final-cta-trust {
      margin-top: 1.25rem; display: flex; align-items: center; justify-content: center;
      gap: 1.25rem; flex-wrap: wrap;
    }
    .final-cta-trust span { font-size: var(--text-xs); color: var(--text-tertiary); }

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
    .kicker-sep { color: var(--border-strong); margin: 0 0.125rem; }
    .hero-cli {
      display: inline-flex; align-items: center; gap: 0.625rem;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 0.5rem 0.875rem;
      font-family: var(--font-mono); font-size: 0.75rem;
      color: var(--text-tertiary); margin-top: 1rem;
      cursor: default; max-width: 100%; overflow: hidden;
    }
    .hero-cli-prompt { color: var(--accent); font-weight: 700; }
    .hero-cli-cmd { color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex:1; }
    .hero-cli-copy {
      background: none; border: 1px solid var(--border-strong);
      color: var(--text-tertiary); font-family: var(--font-sans);
      font-size: 0.625rem; padding: 0.15rem 0.5rem; border-radius: 4px;
      cursor: pointer; flex-shrink: 0; transition: all 150ms;
    }
    .hero-cli-copy:hover { color: var(--text); border-color: var(--text-tertiary); }
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
      <!-- 3D background orbs -->
      <div class="hero-orbs" aria-hidden="true">
        <div class="orb-1"></div>
        <div class="orb-2"></div>
        <div class="orb-3"></div>
      </div>
      <div class="hero-noise" aria-hidden="true"></div>

      <div class="container">
        <div class="hero-kicker fade-up">
  <span class="live-dot" aria-hidden="true"></span>
  <span>Fraud API</span>
  <span class="kicker-sep">·</span>
  <span style="font-family:var(--font-mono)">138ms avg</span>
  <span class="kicker-sep">·</span>
  <span>8 OSINT layers</span>
  <span class="kicker-sep">·</span>
  <span>GDPR Art.5</span>
</div>
        <div class="hero-layout">
          <div>
            <h1 id="hero-h1" class="fade-up-2">Stop fraud before it costs you a <span class="gradient-text">customer</span></h1>
            <p class="hero-lead fade-up-3">OSINT-first scoring in one POST call. No SDK. No sales call.<br>Starts at €29/month. Cancel anytime.</p>
            <div class="hero-ctas">
              <a href="/pricing" class="btn-primary">Get API key — €29 <span aria-hidden="true">→</span></a>
              <a href="/docs/quickstart" class="btn-secondary">Try free (50/month)</a>
            </div>
            <div class="hero-cli" aria-label="Quick start command">
              <span class="hero-cli-prompt" aria-hidden="true">$</span>
              <span class="hero-cli-cmd">curl -X POST kairoscheck.net/api/check \\</span>
              <button class="hero-cli-copy" id="cli-copy" aria-label="Copy curl command">copy</button>
            </div>
            ${showProofBar ? `
            <div class="hero-proof" aria-label="Live usage stats">
              <span class="hero-proof-item">
                <span class="hero-proof-num">${domainsScored}</span>
                <span class="hero-proof-label">domains scored</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num">${threatsBlocked}</span>
                <span class="hero-proof-label">threats blocked</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num">${avgMsDisplay}</span>
                <span class="hero-proof-label">avg latency</span>
              </span>
            </div>` : `
            <div class="hero-proof" aria-label="Product guarantees">
              <span class="hero-proof-item">
                <span class="hero-proof-num" style="-webkit-text-fill-color:initial;background:none;">€29</span>
                <span class="hero-proof-label">to start</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num" style="-webkit-text-fill-color:initial;background:none;">&lt;200ms</span>
                <span class="hero-proof-label">avg response</span>
              </span>
              <span class="hero-proof-sep" aria-hidden="true">·</span>
              <span class="hero-proof-item">
                <span class="hero-proof-num" style="-webkit-text-fill-color:initial;background:none;">GDPR</span>
                <span class="hero-proof-label">native · EU-hosted</span>
              </span>
            </div>`}
          </div>
          <!-- Live demo — hero right column, visible immediately -->
          <div class="demo-wrap" style="margin:0;">
            <div class="demo-card" role="region" aria-label="Live domain fraud check">
              <div class="demo-header" aria-hidden="true">
                <div class="demo-dots">
                  <div class="demo-dot r"></div>
                  <div class="demo-dot a"></div>
                  <div class="demo-dot g"></div>
                </div>
                <div class="demo-title-bar">
                  <span class="live-dot"></span>
                  kairos check — live fraud scoring
                </div>
              </div>
              <div class="demo-body">
                <p class="demo-label"><span style="font-family:var(--font-mono);color:var(--accent)">POST</span> /api/check — no key required</p>
                <div class="demo-input-row">
                  <input
                    type="text"
                    class="demo-input"
                    id="demo-domain"
                    placeholder="e.g. suspicious-shop.io"
                    aria-label="Domain to check for fraud"
                    maxlength="128"
                    autocomplete="off"
                    spellcheck="false"
                  >
                  <button class="demo-btn" id="demo-btn">Check now</button>
                </div>
                <div class="demo-result" id="demo-result" aria-live="polite" aria-atomic="true">
                  <p class="demo-placeholder">Enter any domain to see a real fraud score.</p>
                </div>
                <p class="demo-note">10 free checks/hour per IP · Domain checks only in demo · Full API unlocks all entity types</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ─────────────────────────────────────────── -->
    <section aria-labelledby="how-h2" class="reveal">
      <div class="container">
        <p class="section-label">How it works</p>
        <h2 class="section-title" id="how-h2">In production in <span class="gradient-text">30 minutes</span></h2>
        <p class="section-lead">No agents. No sales call. No contract. Self-serve from day one.</p>
        <div class="steps-flow">

          <!-- Step 1 -->
          <div class="step-terminal tilt-card">
            <div class="step-term-header" aria-hidden="true">
              <div class="step-term-dots">
                <div class="step-term-dot" style="background:#ff5f57"></div>
                <div class="step-term-dot" style="background:#ffbd2e"></div>
                <div class="step-term-dot" style="background:#28c840"></div>
              </div>
              <span class="step-num-badge">STEP 01</span>
            </div>
            <div class="step-term-body">
              <div class="step-term-title">Get your API key</div>
              <div class="step-term-desc">Subscribe, pay with card, receive your key by email. Under 60 seconds. No KYC, no approval.</div>
              <div class="step-term-code"><pre><span style="color:var(--text-tertiary)">~</span> <span style="color:#28c840">✓</span> Subscription activated
<span style="color:var(--text-tertiary)">~</span> <span style="color:#28c840">✓</span> API key generated
<span style="color:var(--text-tertiary)">~</span> Key: <span style="color:var(--accent)">kc_live_</span><span style="color:var(--text-tertiary)">••••••••••••</span></pre></div>
            </div>
          </div>

          <div class="step-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>

          <!-- Step 2 -->
          <div class="step-terminal tilt-card">
            <div class="step-term-header" aria-hidden="true">
              <div class="step-term-dots">
                <div class="step-term-dot" style="background:#ff5f57"></div>
                <div class="step-term-dot" style="background:#ffbd2e"></div>
                <div class="step-term-dot" style="background:#28c840"></div>
              </div>
              <span class="step-num-badge">STEP 02</span>
              <button class="code-copy-btn" id="hero-copy-btn" style="margin-left:auto;" aria-label="Copy curl example to clipboard">Copy</button>
            </div>
            <div class="step-term-body">
              <div class="step-term-title">One POST call</div>
              <div class="step-term-desc">Domain, email, phone or IBAN. No SDK. Works with any language or platform.</div>
              <div class="step-term-code"><pre id="hero-code"><span style="color:var(--text-tertiary)">$</span> <span style="color:var(--accent)">curl</span> https://kairoscheck.net/api/check <span style="color:var(--text-tertiary)">\\</span>
  <span style="color:#60a5fa">-H</span> <span style="color:#fbbf24">"Authorization: Bearer kc_live_&lt;key&gt;"</span> <span style="color:var(--text-tertiary)">\\</span>
  <span style="color:#60a5fa">-H</span> <span style="color:#fbbf24">"Content-Type: application/json"</span> <span style="color:var(--text-tertiary)">\\</span>
  <span style="color:#60a5fa">-d</span> <span style="color:#fbbf24">'{"domain":"suspicious-shop.io"}'</span>

<span style="color:var(--text-tertiary)">// Response</span>
<span style="color:var(--text-tertiary)">{</span>
  <span style="color:#60a5fa">"score"</span>:   <span style="color:var(--accent)">73</span>,
  <span style="color:#60a5fa">"verdict"</span>: <span style="color:var(--danger)">"BLOCK"</span>,
  <span style="color:#60a5fa">"signals"</span>: [<span style="color:#fbbf24">"reputation-complaint"</span>, <span style="color:#fbbf24">"checkout-dna"</span>]
<span style="color:var(--text-tertiary)">}</span></pre></div>
            </div>
          </div>

          <div class="step-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>

          <!-- Step 3 -->
          <div class="step-terminal tilt-card">
            <div class="step-term-header" aria-hidden="true">
              <div class="step-term-dots">
                <div class="step-term-dot" style="background:#ff5f57"></div>
                <div class="step-term-dot" style="background:#ffbd2e"></div>
                <div class="step-term-dot" style="background:#28c840"></div>
              </div>
              <span class="step-num-badge">STEP 03</span>
            </div>
            <div class="step-term-body">
              <div class="step-term-title">Instant verdict</div>
              <div class="step-term-desc">Score 0–100, verdict, and the exact signals behind it. Explainable by design.</div>
              <div class="step-term-code"><pre><span style="color:var(--text-tertiary)">{</span>
  <span style="color:#60a5fa">"verdict"</span>: <span style="color:var(--danger)">"BLOCK"</span>,
  <span style="color:#60a5fa">"score"</span>:   <span style="color:var(--accent)">94</span>,
  <span style="color:#60a5fa">"ms"</span>:      <span style="color:#fbbf24">138</span>
<span style="color:var(--text-tertiary)">}</span></pre></div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── NETWORK INTELLIGENCE ─────────────────────────────────── -->

    <section class="network-section reveal" aria-labelledby="network-h2">
      <div class="container">
        <div class="network-grid">
          <div>
            <p class="section-label">Collective intelligence</p>
            <h2 class="section-title" id="network-h2">Gets smarter with<br>every <span class="gradient-text">customer</span></h2>
            <p class="section-lead">Every verification you run contributes to a shared reputation graph. The more we see, the more accurately we score — for everyone.</p>
            <div class="network-stat-row">
              <div class="network-stat tilt-card">
                <div class="network-stat-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="2.5" stroke="#00d97e" stroke-width="1.25"/><circle cx="12" cy="4" r="2.5" stroke="#00d97e" stroke-width="1.25"/><circle cx="12" cy="12" r="2.5" stroke="#00d97e" stroke-width="1.25"/><line x1="6.5" y1="7" x2="9.5" y2="5" stroke="#00d97e" stroke-width="1.25"/><line x1="6.5" y1="9" x2="9.5" y2="11" stroke="#00d97e" stroke-width="1.25"/></svg>
                </div>
                <div class="network-stat-text">
                  <strong>Shared reputation graph</strong>
                  Each domain, email and IBAN scored updates the collective intelligence. Your competitors' fraud becomes your protection.
                </div>
              </div>
              <div class="network-stat tilt-card">
                <div class="network-stat-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 4l6 2M5 10l6-2M3 6l10 4M3 10l10-4" stroke="#00d97e" stroke-width="1.25" stroke-linecap="round"/></svg>
                </div>
                <div class="network-stat-text">
                  <strong>Scam DNA fingerprinting</strong>
                  Fraud patterns are clustered into families. When a new variant appears, we recognise the family instantly — even on first sight.
                </div>
              </div>
              <div class="network-stat tilt-card">
                <div class="network-stat-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v5c0 3.3 2.7 5.8 6 6.5 3.3-.7 6-3.2 6-6.5V4L8 1.5z" stroke="#00d97e" stroke-width="1.25" stroke-linejoin="round"/><path d="M5.5 8l2 2 3-3" stroke="#00d97e" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="network-stat-text">
                  <strong>OSINT — zero PII shared</strong>
                  The graph learns from public signals only. No customer data is pooled. GDPR-compliant by design, not by policy.
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true">
            <!-- Network graph SVG visualization -->
            <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;display:block;margin:0 auto;">
              <!-- Connection lines -->
              <line x1="200" y1="160" x2="80"  y2="80"  stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="200" y1="160" x2="320" y2="80"  stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="200" y1="160" x2="80"  y2="240" stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="200" y1="160" x2="320" y2="240" stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="200" y1="160" x2="200" y2="40"  stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="200" y1="160" x2="200" y2="280" stroke="rgba(0,217,126,0.15)" stroke-width="1.5"/>
              <line x1="80"  y1="80"  x2="320" y2="80"  stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
              <line x1="80"  y1="240" x2="320" y2="240" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
              <!-- Outer nodes -->
              <circle cx="80"  cy="80"  r="28" fill="rgba(0,217,126,0.06)" stroke="rgba(0,217,126,0.2)" stroke-width="1"/>
              <circle cx="320" cy="80"  r="28" fill="rgba(0,217,126,0.06)" stroke="rgba(0,217,126,0.2)" stroke-width="1"/>
              <circle cx="80"  cy="240" r="28" fill="rgba(0,217,126,0.06)" stroke="rgba(0,217,126,0.2)" stroke-width="1"/>
              <circle cx="320" cy="240" r="28" fill="rgba(0,217,126,0.06)" stroke="rgba(0,217,126,0.2)" stroke-width="1"/>
              <circle cx="200" cy="40"  r="20" fill="rgba(0,160,255,0.06)" stroke="rgba(0,160,255,0.2)" stroke-width="1"/>
              <circle cx="200" cy="280" r="20" fill="rgba(0,160,255,0.06)" stroke="rgba(0,160,255,0.2)" stroke-width="1"/>
              <!-- Node labels -->
              <text x="80"  y="84"  text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(0,217,126,0.7)">DEV A</text>
              <text x="320" y="84"  text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(0,217,126,0.7)">DEV B</text>
              <text x="80"  y="244" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(0,217,126,0.7)">DEV C</text>
              <text x="320" y="244" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(0,217,126,0.7)">DEV D</text>
              <text x="200" y="43"  text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(0,160,255,0.7)">API</text>
              <text x="200" y="283" text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(0,160,255,0.7)">API</text>
              <!-- Central node — the intelligence core -->
              <circle cx="200" cy="160" r="44" fill="rgba(0,217,126,0.08)" stroke="rgba(0,217,126,0.3)" stroke-width="1.5"/>
              <circle cx="200" cy="160" r="32" fill="rgba(0,217,126,0.1)" stroke="rgba(0,217,126,0.25)" stroke-width="1"/>
              <text x="200" y="155" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="rgba(0,217,126,0.9)">KAIROS</text>
              <text x="200" y="169" text-anchor="middle" font-family="monospace" font-size="7" fill="rgba(0,217,126,0.6)">GRAPH</text>
              <!-- Pulsing ring animation -->
              <circle cx="200" cy="160" r="55" fill="none" stroke="rgba(0,217,126,0.08)" stroke-width="1">
                <animate attributeName="r" values="44;65;44" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
              </circle>
            </svg>
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

    <!-- ── INTEGRATION ───────────────────────────────────────────── -->
    <section aria-labelledby="integration-h2" class="reveal">
      <div class="container">
        <p class="section-label">Integration</p>
        <h2 class="section-title" id="integration-h2">Works with any stack</h2>
        <p class="section-lead">One REST endpoint. No SDK required. Copy, paste, ship.</p>

        <!-- Language tabs -->
        <div class="integration-tabs" role="tablist" aria-label="Code examples by language">
          <button class="tab-btn active" role="tab" aria-selected="true" aria-controls="tab-js" id="btn-js">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect width="14" height="14" rx="2" fill="#f7df1e"/><path d="M3.5 10.5l.875-.53c.17.3.325.555.7.555.357 0 .583-.14.583-.686V5.833h1.075v4.03c0 1.13-.661 1.644-1.627 1.644-.873 0-1.379-.452-1.64-.977l.034.97zm4.067-.14l.875-.507c.23.375.528.651 1.056.651.443 0 .727-.222.727-.527 0-.366-.292-.496-.783-.71l-.27-.116c-.777-.33-1.293-.745-1.293-1.62 0-.805.614-1.418 1.573-1.418.683 0 1.173.237 1.527.857l-.838.537c-.184-.33-.383-.46-.69-.46-.313 0-.512.198-.512.46 0 .322.199.452.659.652l.27.115c.914.392 1.43.792 1.43 1.69 0 .968-.76 1.496-1.782 1.496-.999 0-1.645-.477-1.96-1.1l.001-.013z" fill="#000"/></svg>
            JavaScript
          </button>
          <button class="tab-btn" role="tab" aria-selected="false" aria-controls="tab-python" id="btn-python">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect width="14" height="14" rx="2" fill="#3776ab"/><path d="M7 2C5.3 2 4.5 2.7 4.5 3.5v.5h5v.5H4.5c-.8 0-1.5.7-1.5 1.5v2c0 .8.7 1.5 1.5 1.5h.5v-.5c0-.8.7-1.5 1.5-1.5h2c.8 0 1.5.7 1.5 1.5V11c0 .8-.7 1.5-1.5 1.5H7C5.3 12.5 4.5 11.8 4.5 11v-.5h-2V11c0 1.7 1.3 2.5 4.5 2.5S11 12.7 11 11V9.5c0-1.7-1.3-2.5-4.5-2.5z" fill="#fff" opacity=".8"/></svg>
            Python
          </button>
          <button class="tab-btn" role="tab" aria-selected="false" aria-controls="tab-curl" id="btn-curl">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect width="14" height="14" rx="2" fill="#2d2d2d"/><path d="M2 7h10M7 2v10" stroke="#00d97e" stroke-width="1.5" stroke-linecap="round"/></svg>
            cURL
          </button>
          <button class="tab-btn" role="tab" aria-selected="false" aria-controls="tab-php" id="btn-php">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect width="14" height="14" rx="2" fill="#777bb4"/><text x="3" y="10" font-family="monospace" font-size="7" font-weight="bold" fill="#fff">PHP</text></svg>
            PHP
          </button>
        </div>

        <!-- JavaScript -->
        <div class="tab-panel active" id="tab-js" role="tabpanel" aria-labelledby="btn-js">
          <div class="integration-code">
            <div class="integration-code-header">
              <span class="integration-filename">fraud-check.js</span>
              <button class="integration-copy" data-copy-target="code-js">Copy</button>
            </div>
            <div class="integration-body">
              <pre id="code-js"><span style="color:var(--text-tertiary)">// Block fraudulent signups in Node.js / browser</span>
<span style="color:#c084fc">async function</span> <span style="color:#60a5fa">checkFraud</span>(domain) {
  <span style="color:#c084fc">const</span> res = <span style="color:#c084fc">await</span> <span style="color:#60a5fa">fetch</span>(<span style="color:#fbbf24">'https://kairoscheck.net/api/check'</span>, {
    method: <span style="color:#fbbf24">'POST'</span>,
    headers: {
      <span style="color:#fbbf24">'Authorization'</span>: <span style="color:#fbbf24">\`Bearer \${KC_API_KEY}\`</span>,
      <span style="color:#fbbf24">'Content-Type'</span>:  <span style="color:#fbbf24">'application/json'</span>,
    },
    body: <span style="color:#60a5fa">JSON.stringify</span>({ domain }),
  });

  <span style="color:#c084fc">const</span> { verdict, score, signals } = <span style="color:#c084fc">await</span> res.<span style="color:#60a5fa">json</span>();

  <span style="color:#c084fc">if</span> (verdict === <span style="color:#fbbf24">'BLOCK'</span>) <span style="color:#c084fc">throw new</span> <span style="color:#60a5fa">Error</span>(<span style="color:#fbbf24">'Signup denied'</span>);
  <span style="color:#c084fc">if</span> (verdict === <span style="color:#fbbf24">'REVIEW'</span>) <span style="color:#60a5fa">flagForReview</span>(domain, score);

  <span style="color:#c084fc">return</span> { verdict, score, signals };
}</pre>
            </div>
          </div>
        </div>

        <!-- Python -->
        <div class="tab-panel" id="tab-python" role="tabpanel" aria-labelledby="btn-python">
          <div class="integration-code">
            <div class="integration-code-header">
              <span class="integration-filename">fraud_check.py</span>
              <button class="integration-copy" data-copy-target="code-python">Copy</button>
            </div>
            <div class="integration-body">
              <pre id="code-python"><span style="color:var(--text-tertiary)"># Block fraudulent signups in Python</span>
<span style="color:#c084fc">import</span> requests

<span style="color:#c084fc">def</span> <span style="color:#60a5fa">check_fraud</span>(domain: str) -> dict:
    resp = requests.<span style="color:#60a5fa">post</span>(
        <span style="color:#fbbf24">"https://kairoscheck.net/api/check"</span>,
        headers={
            <span style="color:#fbbf24">"Authorization"</span>: <span style="color:#fbbf24">f"Bearer {KC_API_KEY}"</span>,
            <span style="color:#fbbf24">"Content-Type"</span>:  <span style="color:#fbbf24">"application/json"</span>,
        },
        json={<span style="color:#fbbf24">"domain"</span>: domain},
        timeout=<span style="color:#fbbf24">10</span>,
    )
    resp.<span style="color:#60a5fa">raise_for_status</span>()
    data = resp.<span style="color:#60a5fa">json</span>()

    <span style="color:#c084fc">if</span> data[<span style="color:#fbbf24">"verdict"</span>] == <span style="color:#fbbf24">"BLOCK"</span>:
        <span style="color:#c084fc">raise</span> <span style="color:#60a5fa">ValueError</span>(<span style="color:#fbbf24">"Signup denied"</span>)

    <span style="color:#c084fc">return</span> data  <span style="color:var(--text-tertiary)"># verdict, score, signals</span></pre>
            </div>
          </div>
        </div>

        <!-- cURL -->
        <div class="tab-panel" id="tab-curl" role="tabpanel" aria-labelledby="btn-curl">
          <div class="integration-code">
            <div class="integration-code-header">
              <span class="integration-filename">terminal</span>
              <button class="integration-copy" data-copy-target="code-curl">Copy</button>
            </div>
            <div class="integration-body">
              <pre id="code-curl"><span style="color:var(--text-tertiary)"># Quick test from your terminal</span>
<span style="color:#60a5fa">curl</span> https://kairoscheck.net/api/check <span style="color:#fbbf24">\\</span>
  <span style="color:#60a5fa">-H</span> <span style="color:#fbbf24">"Authorization: Bearer kc_live_YOUR_KEY"</span> <span style="color:#fbbf24">\\</span>
  <span style="color:#60a5fa">-H</span> <span style="color:#fbbf24">"Content-Type: application/json"</span> <span style="color:#fbbf24">\\</span>
  <span style="color:#60a5fa">-d</span> <span style="color:#fbbf24">'{"domain":"suspicious-shop.io"}'</span>

<span style="color:var(--text-tertiary)"># Response</span>
{
  <span style="color:#60a5fa">"verdict"</span>:  <span style="color:var(--danger)">"BLOCK"</span>,
  <span style="color:#60a5fa">"score"</span>:   <span style="color:var(--accent)">94</span>,
  <span style="color:#60a5fa">"signals"</span>: [<span style="color:#fbbf24">"newly-registered"</span>, <span style="color:#fbbf24">"checkout-dna"</span>],
  <span style="color:#60a5fa">"ms"</span>:      <span style="color:#fbbf24">138</span>
}</pre>
            </div>
          </div>
        </div>

        <!-- PHP -->
        <div class="tab-panel" id="tab-php" role="tabpanel" aria-labelledby="btn-php">
          <div class="integration-code">
            <div class="integration-code-header">
              <span class="integration-filename">FraudCheck.php</span>
              <button class="integration-copy" data-copy-target="code-php">Copy</button>
            </div>
            <div class="integration-body">
              <pre id="code-php"><span style="color:var(--text-tertiary)">// Block fraudulent signups in PHP</span>
<span style="color:#c084fc">function</span> <span style="color:#60a5fa">checkFraud</span>(<span style="color:#fbbf24">string</span> $domain): array {
    $resp = <span style="color:#60a5fa">json_decode</span>(<span style="color:#60a5fa">file_get_contents</span>(
        <span style="color:#fbbf24">'https://kairoscheck.net/api/check'</span>,
        <span style="color:#c084fc">false</span>,
        <span style="color:#60a5fa">stream_context_create</span>([<span style="color:#fbbf24">'http'</span> => [
            <span style="color:#fbbf24">'method'</span>  => <span style="color:#fbbf24">'POST'</span>,
            <span style="color:#fbbf24">'header'</span>  => <span style="color:#fbbf24">"Authorization: Bearer "</span> . KC_API_KEY . <span style="color:#fbbf24">"\r\n"</span>
                       . <span style="color:#fbbf24">"Content-Type: application/json\r\n"</span>,
            <span style="color:#fbbf24">'content'</span> => <span style="color:#60a5fa">json_encode</span>([<span style="color:#fbbf24">'domain'</span> => $domain]),
        ]])
    ), <span style="color:#c084fc">true</span>);

    <span style="color:#c084fc">if</span> ($resp[<span style="color:#fbbf24">'verdict'</span>] === <span style="color:#fbbf24">'BLOCK'</span>) {
        <span style="color:#c084fc">throw new</span> \<span style="color:#60a5fa">RuntimeException</span>(<span style="color:#fbbf24">'Signup denied'</span>);
    }
    <span style="color:#c084fc">return</span> $resp;
}</pre>
            </div>
          </div>
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
            <div class="trust-desc">Median latency</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">8</div>
            <div class="trust-desc">OSINT signal layers</div>
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
        <h2 class="section-title" id="pricing-h2">Simple, honest <span class="gradient-text">pricing</span></h2>
        <p class="section-lead">No contracts. No calls. Cancel anytime. One chargeback avoided pays for months.</p>
        <div class="pricing-grid">
          <div class="pricing-card tilt-card">
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
          <div class="pricing-card tilt-card">
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
          <div class="pricing-card featured tilt-card" aria-label="Most popular plan">
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

    <!-- ── FINAL CTA ─────────────────────────────────────────────── -->
    <section class="final-cta reveal" aria-labelledby="cta-h2">
      <div class="container">
        <h2 id="cta-h2">Start protecting your<br>revenue <span class="gradient-text">today</span></h2>
        <p>Join developers who stopped losing money to fraud. Setup in 30 minutes. No contract.</p>
        <a href="/pricing" class="btn-primary">Get API key — free to start <span aria-hidden="true">→</span></a>
        <div class="final-cta-trust">
          <span>No credit card for free tier</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>14-day money back</span>
          <span>·</span>
          <span>GDPR-native</span>
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
        btn.textContent = 'Analysing…';
        setResult('<div class="demo-thinking"><span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-tertiary)">Scoring ' + domain + '</span><span class="thinking-dots"><span></span><span></span><span></span></span></div>');

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
              '<div class="verdict-score-row">' +
                '<span class="verdict-score" style="color:' + verdictColor(data.verdict) + '">' + data.score + '</span>' +
                '<span class="verdict-score-max">/100</span>' +
              '</div>' +
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

    // Scroll reveal
    (function() {
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('in-view'); });
        return;
      }
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });
    })();

    // Integration language tabs
    (function() {
      var tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(function(btn) {
        btn.addEventListener('click', function() {
          tabs.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
          document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
          btn.classList.add('active');
          btn.setAttribute('aria-selected','true');
          var target = document.getElementById(btn.getAttribute('aria-controls'));
          if (target) target.classList.add('active');
        });
      });
      // Copy buttons
      document.querySelectorAll('.integration-copy').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var pre = document.getElementById(btn.dataset.copyTarget);
          if (!pre) return;
          navigator.clipboard.writeText(pre.innerText || pre.textContent || '').then(function() {
            btn.textContent = 'Copied ✓';
            setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
          }).catch(function() { btn.textContent = 'Failed'; setTimeout(function() { btn.textContent = 'Copy'; }, 2000); });
        });
      });
    })();

    // Tilt effect on all cards
    (function() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var cards = document.querySelectorAll('.tilt-card');
      cards.forEach(function(card) {
        // Store original transform to restore on leave
        var origTransform = getComputedStyle(card).transform;
        card.addEventListener('mouseenter', function() {
          origTransform = getComputedStyle(card).transform;
        });
        card.addEventListener('mousemove', function(e) {
          var r = card.getBoundingClientRect();
          var x = e.clientX - r.left;
          var y = e.clientY - r.top;
          var cx = r.width  / 2;
          var cy = r.height / 2;
          // Higher angles = more visible tilt; no scale so it doesn't look like zoom
          var rY =  ((x - cx) / cx) * 12;
          var rX = -((y - cy) / cy) * 8;
          card.style.transform = 'perspective(900px) rotateX(' + rX + 'deg) rotateY(' + rY + 'deg)';
          card.style.transition = 'transform 0ms';
        });
        card.addEventListener('mouseleave', function() {
          card.style.transition = 'transform 500ms cubic-bezier(0.23, 1, 0.32, 1)';
          card.style.transform = '';
        });
      });
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

    (function() {
      var btn = document.getElementById('cli-copy');
      if (!btn) return;
      btn.addEventListener('click', function() {
        navigator.clipboard.writeText("curl -X POST https://kairoscheck.net/api/check -H 'Authorization: Bearer YOUR_KEY' -H 'Content-Type: application/json' -d '{\"domain\":\"suspicious.io\"}'").then(function() {
          btn.textContent = 'copied ✓';
          setTimeout(function() { btn.textContent = 'copy'; }, 2000);
        });
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
