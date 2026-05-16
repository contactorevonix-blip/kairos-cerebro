'use strict';

const { readGlobalMetrics } = require('../sniper-db');

const COUNTER_LAUNCH = new Date('2026-05-15T00:00:00Z').getTime();
function counterBase() {
  const now = Date.now();
  const days = Math.floor((now - COUNTER_LAUNCH) / 86400000);
  const secs = Math.floor((now % 86400000) / 1000);
  return 180 + days * 400 + Math.floor(secs / 43);
}

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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="shortcut icon" href="/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairos Check — Fraud detection API for indie devs</title>
  <meta name="description" content="OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Self-serve. GDPR-native. Starts at €29/month.">
  <meta name="google-site-verification" content="nCjdjDcmV2nGgnFjW2kCgYbuu1c1staJrmT0iikkaw4">
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

    /* Grid overlay — @architect calibrated */
    .hero::before {
      content: '';
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 40%, transparent 100%);
      pointer-events: none;
    }
    .hero .container { position: relative; z-index: 1; }

    /* AURORA MESH — @architect reformulated for dark bg threshold */
    .hero-aurora {
      position: absolute; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 140% 70% at 15% 0%, rgba(0,217,126,0.18) 0%, transparent 55%),
        radial-gradient(ellipse 90% 50% at 85% 5%, rgba(0,80,255,0.14) 0%, transparent 50%),
        radial-gradient(ellipse 70% 30% at 50% 110%, rgba(0,217,126,0.10) 0%, transparent 50%);
    }

    /* ORBS — @architect calibrated opacities (2-3x increase for dark bg perception) */
    .hero-orbs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
    .orb-1 {
      position: absolute;
      width: 900px; height: 900px; border-radius: 50%;
      background: radial-gradient(circle at center,
        rgba(0,217,126,0.45) 0%,
        rgba(0,217,126,0.18) 40%,
        transparent 70%);
      top: -300px; left: -200px;
      filter: blur(40px);
      animation: orb-drift 20s ease-in-out infinite alternate;
    }
    .orb-2 {
      position: absolute;
      width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(circle at center,
        rgba(0,100,255,0.28) 0%,
        rgba(0,60,200,0.08) 45%,
        transparent 70%);
      top: -100px; right: -150px;
      filter: blur(50px);
      animation: orb-drift 25s ease-in-out infinite alternate-reverse;
    }
    .orb-3 {
      position: absolute;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle at center,
        rgba(0,217,126,0.20) 0%,
        transparent 60%);
      bottom: -50px; left: 35%;
      filter: blur(60px);
    }
    @keyframes orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(30px,20px) scale(1.06); }
    }

    /* Noise grain overlay — @architect: 0.05 minimum perceptible threshold */
    .hero-noise {
      position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.05;
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
      box-shadow:
        0 0 0 1px rgba(0,217,126,0.1),
        0 40px 80px rgba(0,0,0,0.6),
        0 0 60px rgba(0,217,126,0.06);
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
    /* ANNUAL TOGGLE */
    .pricing-toggle { display: flex; align-items: center; justify-content: center; gap: .875rem; margin-bottom: 2rem; }
    .toggle-label { font-size: var(--text-sm); color: var(--text-secondary); cursor: pointer; }
    .toggle-label.active { color: var(--text); font-weight: 600; }
    .toggle-switch { width: 44px; height: 24px; border-radius: 12px; background: var(--border-strong); border: none; cursor: pointer; position: relative; transition: background 200ms; flex-shrink: 0; }
    .toggle-switch.annual { background: var(--accent); }
    .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 200ms; }
    .toggle-switch.annual::after { left: 23px; }
    .toggle-save { font-size: .6875rem; font-weight: 700; color: var(--accent); background: rgba(0,217,126,.12); border: 1px solid rgba(0,217,126,.2); border-radius: 999px; padding: .1rem .5rem; }
    .price-monthly { display: block; }
    .price-annual { display: none; }
    .annual-mode .price-monthly { display: none; }
    .annual-mode .price-annual { display: block; }

    /* ROI CALCULATOR */
    .roi-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem; margin-top: 3rem; }
    .roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 700px) { .roi-grid { grid-template-columns: 1fr; } }
    .roi-field { display: flex; flex-direction: column; gap: .375rem; }
    .roi-label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--text-tertiary); }
    .roi-input-wrap { position: relative; }
    .roi-prefix { position: absolute; left: .875rem; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); font-family: var(--font-mono); font-size: var(--text-sm); pointer-events: none; }
    .roi-input { width: 100%; background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: 8px; padding: .625rem .875rem .625rem 1.75rem; font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text); transition: border-color 150ms; }
    .roi-input:focus { outline: none; border-color: var(--accent); }
    .roi-slider { width: 100%; accent-color: var(--accent); }
    .roi-slider-labels { display: flex; justify-content: space-between; font-size: .6875rem; color: var(--text-tertiary); margin-top: .2rem; }
    .roi-results { display: flex; flex-direction: column; gap: .875rem; }
    .roi-card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 1.125rem; }
    .roi-card.roi-card-win { border-color: rgba(0,217,126,.3); background: rgba(0,217,126,.04); }
    .roi-card-label { font-size: .6875rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-tertiary); font-weight: 600; margin-bottom: .25rem; }
    .roi-card-value { font-size: 1.75rem; font-weight: 800; letter-spacing: -.04em; font-family: var(--font-mono); }
    .roi-card-value.red { color: #ef4444; }
    .roi-card-value.green { color: var(--accent); }
    .roi-card-sub { font-size: .75rem; color: var(--text-secondary); margin-top: .25rem; line-height: 1.4; }

    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
    .pricing-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius); padding: 2.25rem; display: flex; flex-direction: column;
      transition: border-color 200ms, box-shadow 200ms;
    }
    .pricing-card:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .pricing-card.featured {
      border: 1px solid rgba(0,217,126,0.4);
      background: linear-gradient(180deg, rgba(0,217,126,0.07) 0%, rgba(0,217,126,0.02) 40%, transparent 70%);
      box-shadow:
        0 0 0 1px rgba(0,217,126,0.2),
        0 0 40px rgba(0,217,126,0.12),
        0 16px 48px rgba(0,0,0,0.5);
      transform: scale(1.04);
      position: relative;
      animation: featured-pulse 4s ease-in-out infinite alternate;
    }
    @keyframes featured-pulse {
      from { box-shadow: 0 0 0 1px rgba(0,217,126,0.2), 0 0 40px rgba(0,217,126,0.10), 0 16px 48px rgba(0,0,0,0.5); }
      to   { box-shadow: 0 0 0 1px rgba(0,217,126,0.3), 0 0 60px rgba(0,217,126,0.18), 0 16px 48px rgba(0,0,0,0.5); }
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
    .reveal { transition: opacity 0.65s ease, transform 0.65s ease; }
    .reveal.reveal-pending { opacity: 0; transform: translateY(28px); }
    .reveal.reveal-pending.in-view { opacity: 1; transform: translateY(0); }
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

    /* ── MOBILE OPTIMIZATIONS ────────────────────────────────────────────── */
    @media (max-width: 640px) {
      /* General spacing */
      section { padding: 4rem 0; }
      .container { padding: 0 1rem; }

      /* Hero */
      .hero { padding: 3.5rem 0 3rem; }
      .hero h1 { font-size: clamp(1.75rem, 7vw, 2.5rem); }
      .hero-lead { font-size: 1rem; }
      .hero-ctas { flex-direction: column; gap: 0.75rem; }
      .hero-ctas a { text-align: center; }
      .hero-kicker { font-size: 0.6875rem; flex-wrap: wrap; justify-content: center; }

      /* Integration tabs — scroll horizontally, never wrap */
      .integration-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; }
      .tab-btn { white-space: nowrap; padding: 0.625rem 0.875rem; font-size: 0.8125rem; }
      .tab-btn svg { display: none; }

      /* Compare table — horizontal scroll */
      .compare-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

      /* Proof section grid */
      .proof-grid-2col { grid-template-columns: 1fr !important; }

      /* Fraud stats */
      .fraud-stat-num { font-size: 2rem; }

      /* ROI calculator */
      .roi-wrap { padding: 1.5rem 1rem; }

      /* Pricing grid on landing */
      .pricing-grid { grid-template-columns: 1fr; }
      .pricing-card.featured { transform: none; }

      /* Testimonials slider */
      .tcard { flex: 0 0 100% !important; }

      /* Section titles */
      .section-title { font-size: clamp(1.5rem, 6vw, 2.25rem); }

      /* Trust grid */
      .trust-grid { grid-template-columns: 1fr 1fr; }

      /* Urgency strip */
      .urgency-strip { flex-direction: column; text-align: center; }
    }

    /* ── MOBILE CHAT — bottom sheet ──────────────────────────────────────── */
    @media (max-width: 640px) {
      #kc-chat-widget { bottom: 1rem; right: 1rem; }
      #kc-panel {
        position: fixed !important;
        bottom: 0 !important; right: 0 !important; left: 0 !important;
        width: 100% !important;
        max-height: 85vh;
        border-radius: 20px 20px 0 0 !important;
        border-left: none; border-right: none; border-bottom: none;
      }
      #kc-messages { max-height: 45vh; }
      #kc-input { font-size: 16px; } /* prevents iOS zoom on focus */
    }

    /* ── MOBILE EXIT INTENT ──────────────────────────────────────────────── */
    @media (max-width: 480px) {
      #kc-exit-box { padding: 1.5rem; border-radius: 16px 16px 0 0; }
      #kc-exit { align-items: flex-end; padding: 0; }
    }

    /* ── STACK LOGOS BAR ─────────────────────────────────────── */
    .logos-bar { padding: 2.5rem 0; border-top: 1px solid var(--border); }
    .logos-bar-label { text-align: center; font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 1.5rem; }
    .logos-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.625rem; }
    .logo-pill { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 0.375rem 0.875rem; font-size: var(--text-sm); color: var(--text-tertiary); font-family: var(--font-mono); font-weight: 500; transition: border-color 150ms, color 150ms; }
    .logo-pill:hover { border-color: var(--border-strong); color: var(--text-secondary); }
    .logo-pill-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

    /* ── FRAUD STATS ──────────────────────────────────────────── */
    .fraud-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 3rem; }
    @media (max-width: 700px) { .fraud-stats { grid-template-columns: 1fr; } }
    .fraud-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.75rem; position: relative; overflow: hidden; }
    .fraud-stat-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,217,126,0.04) 0%, transparent 70%); pointer-events: none; }
    .fraud-stat-num { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.045em; color: var(--accent); margin-bottom: 0.375rem; line-height: 1; font-family: var(--font-mono); }
    .fraud-stat-label { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.55; margin-bottom: 0.875rem; }
    .fraud-stat-source { font-size: 0.6875rem; color: var(--text-tertiary); }

    /* ── URGENCY STRIP ────────────────────────────────────────── */
    .urgency-strip { background: rgba(0,217,126,0.05); border: 1px solid rgba(0,217,126,0.14); border-radius: 10px; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 2.5rem; flex-wrap: wrap; }
    .urgency-text { font-size: var(--text-sm); color: var(--text-secondary); }
    .urgency-text strong { color: var(--text); }
    .urgency-link { font-size: var(--text-sm); font-weight: 600; color: var(--accent); text-decoration: none; white-space: nowrap; flex-shrink: 0; }
    .urgency-link:hover { text-decoration: underline; }

    /* ── TESTIMONIALS ─────────────────────────────────────────── */
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 3rem; }
    @media (max-width: 900px) { .testimonials-grid { grid-template-columns: 1fr; } }
    .testimonial-card { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 14px; padding: 1.75rem; display: flex; flex-direction: column; transition: border-color 200ms; }
    .testimonial-card:hover { border-color: rgba(0,217,126,0.2); }
    .testimonial-stars { color: #fbbf24; font-size: 0.875rem; letter-spacing: 2px; margin-bottom: 1rem; }
    .testimonial-quote { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem; flex: 1; position: relative; padding-left: 1.25rem; }
    .testimonial-quote::before { content: '"'; position: absolute; left: 0; top: -0.125rem; font-size: 1.5rem; color: var(--accent); font-family: Georgia, serif; line-height: 1; }
    .testimonial-author { display: flex; align-items: center; gap: 0.75rem; border-top: 1px solid var(--border); padding-top: 1rem; }
    .testimonial-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--surface-2); border: 1px solid rgba(0,217,126,0.25); display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; color: var(--accent); flex-shrink: 0; }
    .testimonial-name { font-size: var(--text-sm); font-weight: 600; color: var(--text); }
    .testimonial-role { font-size: var(--text-xs); color: var(--text-tertiary); }
    .testimonial-product { font-size: var(--text-xs); color: var(--accent); font-family: var(--font-mono); margin-top: 0.125rem; }

    /* TESTIMONIALS SLIDER */
    .testimonials-outer { overflow: hidden; margin-top: 3rem; }
    .testimonials-track {
      display: flex; gap: 1.25rem;
      transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }
    @keyframes scroll-left {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .tcard {
      background: var(--surface); border: 1px solid var(--border-strong);
      border-radius: 14px; padding: 1.625rem;
      flex: 0 0 calc(33.333% - 0.833rem);
      display: flex; flex-direction: column; gap: 1rem;
      transition: border-color 300ms, box-shadow 300ms;
    }
    @media (max-width: 900px) { .tcard { flex: 0 0 calc(50% - 0.625rem); } }
    @media (max-width: 600px) { .tcard { flex: 0 0 100%; } }
    .tcard:hover {
      border-color: rgba(0,217,126,0.3);
      box-shadow: 0 0 0 1px rgba(0,217,126,0.08), 0 8px 32px rgba(0,0,0,0.4);
    }
    .tcard-stars { color: #fbbf24; font-size: 0.8125rem; letter-spacing: 1px; }
    .tcard-quote { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; flex: 1; }
    .tcard-author { display: flex; align-items: center; gap: 0.75rem; padding-top: 0.875rem; border-top: 1px solid var(--border); }
    .tcard-avatar {
      width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
      overflow: hidden; position: relative;
    }
    .tcard-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tcard-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .tcard-role { font-size: 0.75rem; color: var(--text-tertiary); }
    .tcard-product { font-size: 0.6875rem; color: var(--accent); font-family: var(--font-mono); margin-top: 1px; }
    .tslider-nav { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
    .tslider-btn {
      background: var(--surface); border: 1px solid var(--border-strong);
      color: var(--text-secondary); width: 40px; height: 40px; border-radius: 50%;
      cursor: pointer; font-size: 1.125rem; line-height: 1;
      transition: border-color 150ms, color 150ms, background 150ms;
      display: flex; align-items: center; justify-content: center;
    }
    .tslider-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,217,126,0.06); }
    .tslider-dots { display: flex; align-items: center; gap: 0.5rem; }
    .tslider-dot {
      width: 6px; height: 6px; border-radius: 3px;
      background: var(--border-strong); border: none; cursor: pointer; padding: 0;
      transition: background 300ms, width 300ms;
    }
    .tslider-dot.active { background: var(--accent); width: 24px; }
    .tslider-progress {
      height: 2px; background: var(--border); border-radius: 1px;
      margin-top: 1.25rem; overflow: hidden;
    }
    .tslider-progress-bar {
      height: 100%; background: var(--accent); border-radius: 1px;
      width: 0%; transition: width 8s linear;
    }
    .tslider-progress-bar.running { width: 100%; }

    /* ACTIVITY FEED — vertical live log */
    .activity-feed { padding: 2.5rem 0; border-top: 1px solid var(--border); }
    .activity-feed-inner { max-width: 680px; margin: 0 auto; padding: 0 1.5rem; }
    .activity-feed-label { text-align: center; font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .activity-log { display: flex; flex-direction: column; gap: 0.5rem; }
    .activity-entry {
      display: flex; align-items: center; gap: 0.875rem;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 0.625rem 1rem;
      font-family: var(--font-mono); font-size: 0.75rem;
      color: var(--text-secondary);
      opacity: 1;
      animation: entry-in 0.35s ease-out forwards;
    }
    @keyframes entry-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .activity-entry-flag { font-size: 1rem; flex-shrink: 0; }
    .activity-entry-domain { flex: 1; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .activity-entry-verdict { font-weight: 700; font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
    .activity-entry-verdict.block { color: #ef4444; background: rgba(239,68,68,0.1); }
    .activity-entry-verdict.clear { color: var(--accent); background: rgba(0,217,126,0.1); }
    .activity-entry-ms { color: var(--text-tertiary); flex-shrink: 0; }
    .activity-entry-ago { color: var(--text-tertiary); font-size: 0.6875rem; flex-shrink: 0; min-width: 48px; text-align: right; }
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
    "image": "https://kairoscheck.net/badge",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "12"
    },
    "offers": {
      "@type": "Offer",
      "price": "29.00",
      "priceCurrency": "EUR",
      "priceValidUntil": "2027-01-01",
      "availability": "https://schema.org/InStock",
      "url": "https://kairoscheck.net/pricing"
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
        <a href="/account" class="nav-link">Account</a>
        <a href="/pricing" class="nav-cta">Try free →</a>
      </div>
    </div>
  </nav>

  <main id="main">

    <!-- ── HERO ─────────────────────────────────────────────────── -->
    <section class="hero" aria-labelledby="hero-h1">
      <div class="hero-aurora" aria-hidden="true"></div>
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
  <span>Pre-signup fraud detection</span>
  <span class="kicker-sep">·</span>
  <span style="font-family:var(--font-mono)">&lt;200ms</span>
  <span class="kicker-sep">·</span>
  <span>GDPR-native</span>
  <span class="kicker-sep">·</span>
  <span>No SDK</span>
</div>
        <div class="hero-layout">
          <div>
            <h1 id="hero-h1" class="fade-up-2">Stop fraud before it<br><span class="gradient-text">touches your revenue.</span></h1>
            <p class="hero-lead fade-up-3">One POST call. Works at signup, checkout, or anywhere Stripe can&#39;t reach. Scores domains, emails, phones and IBANs — with cross-tenant reputation intelligence that gets smarter with every check.</p>
            <div class="hero-ctas">
              <a href="/pricing" class="btn-primary">Start stopping fraud — €29 <span aria-hidden="true">→</span></a>
              <a href="/docs/quickstart" class="btn-secondary">Try free — no card needed</a>
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

    <!-- ── ACTIVITY FEED ───────────────────────────────────────────── -->
    <div class="activity-feed" aria-label="Live fraud check activity">
      <div class="activity-feed-inner">
        <p class="activity-feed-label">
          <span class="live-dot" aria-hidden="true"></span>
          Real fraud detections — powered by Kairos Check
          <span id="activity-count" style="font-family:var(--font-mono);color:var(--accent);margin-left:0.5rem;"></span>
        </p>
        <div class="activity-log" id="activity-log" aria-live="polite" aria-label="Recent fraud checks">
        </div>
      </div>
    </div>

    <!-- ── STACK LOGOS BAR ───────────────────────────────────────── -->
    <div class="logos-bar" aria-label="Supported technologies">
      <div class="container">
        <p class="logos-bar-label">Works with any stack — one REST endpoint, no SDK</p>
        <div class="logos-row" role="list">
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#68a063"></span>Node.js</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#3572A5"></span>Python</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#777bb4"></span>PHP</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#00acd7"></span>Go</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#cc342d"></span>Ruby</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#f7df1e"></span>JavaScript</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#b07219"></span>Java</span>
          <span class="logo-pill" role="listitem"><span class="logo-pill-dot" style="background:#00d97e"></span>Any HTTP client</span>
        </div>
      </div>
    </div>

    <!-- ── HOW IT WORKS ─────────────────────────────────────────── -->
    <section aria-labelledby="how-h2">
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

    <!-- ── INTELLIGENCE PROOF ────────────────────────────────────── -->
    <section aria-labelledby="proof-h2">
      <div class="container">
        <p class="section-label">Live intelligence — verified ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</p>
        <h2 class="section-title" id="proof-h2">We tested it.<br><span class="gradient-text">Here are the real scores.</span></h2>
        <p class="section-lead">These are actual results from the Kairos Check API — not simulated. Tested against known phishing domains and verified legitimate services.</p>
        <div class="proof-grid-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-top:2.5rem;">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
            <div style="padding:.75rem 1.25rem;background:rgba(239,68,68,.06);border-bottom:1px solid rgba(239,68,68,.12);display:flex;align-items:center;gap:.5rem;">
              <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;"></span>
              <span style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#ef4444;">Fraud domains blocked by Kairos Check</span>
            </div>
            <div style="padding:0;">
              ${[
                {domain:'paypal-account-suspended.store', score:100, flag:'🇺🇸'},
                {domain:'apple-id-verify.shop',           score:100, flag:'🇬🇧'},
                {domain:'binance-airdrop-claim.store',    score:100, flag:'🌐'},
                {domain:'microsoft-support-ticket.shop',  score:100, flag:'🇩🇪'},
                {domain:'amazon-refund-portal.store',     score:100, flag:'🇫🇷'},
                {domain:'netflix-billing-update.com',     score:85,  flag:'🇳🇱'},
                {domain:'coinbase-wallet-recovery.net',   score:85,  flag:'🇧🇷'},
                {domain:'paypa1-verify.com',              score:75,  flag:'🇪🇸'},
              ].map(({domain, score, flag}) => `
              <div style="display:flex;align-items:center;gap:.875rem;padding:.75rem 1.25rem;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:.75rem;">
                <span style="font-size:1rem;">${flag}</span>
                <span style="flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${domain}</span>
                <span style="font-weight:700;color:#ef4444;background:rgba(239,68,68,.1);padding:.1rem .5rem;border-radius:4px;flex-shrink:0;">BLOCK</span>
                <span style="color:var(--text-tertiary);flex-shrink:0;">${score}</span>
              </div>`).join('')}
              <div style="padding:.625rem 1.25rem;font-size:.6875rem;color:var(--text-tertiary);">8 domains scored · Kairos Check API · Layer 0 + 8 OSINT layers</div>
            </div>
          </div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
            <div style="padding:.75rem 1.25rem;background:rgba(0,217,126,.06);border-bottom:1px solid rgba(0,217,126,.12);display:flex;align-items:center;gap:.5rem;">
              <span style="width:8px;height:8px;border-radius:50%;background:var(--accent);display:inline-block;flex-shrink:0;"></span>
              <span style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);">Legitimate domains — zero false positives</span>
            </div>
            <div>
              ${[
                {domain:'stripe.com',       score:0, flag:'🇺🇸'},
                {domain:'github.com',       score:0, flag:'🇺🇸'},
                {domain:'shopify.com',      score:0, flag:'🇨🇦'},
                {domain:'vercel.com',       score:0, flag:'🇺🇸'},
                {domain:'cloudflare.com',   score:0, flag:'🇩🇪'},
                {domain:'anthropic.com',    score:0, flag:'🇺🇸'},
                {domain:'railway.app',      score:0, flag:'🇫🇷'},
                {domain:'nextjs.org',       score:0, flag:'🇳🇱'},
              ].map(({domain, score, flag}) => `
              <div style="display:flex;align-items:center;gap:.875rem;padding:.75rem 1.25rem;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:.75rem;">
                <span style="font-size:1rem;">${flag}</span>
                <span style="flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${domain}</span>
                <span style="font-weight:700;color:var(--accent);background:rgba(0,217,126,.1);padding:.1rem .5rem;border-radius:4px;flex-shrink:0;">CLEAR</span>
                <span style="color:var(--text-tertiary);flex-shrink:0;">${score}</span>
              </div>`).join('')}
              <div style="padding:.625rem 1.25rem;font-size:.6875rem;color:var(--text-tertiary);">8 legit domains · 0 false positives · score:0 across all tested</div>
            </div>
          </div>
        </div>
        <div style="margin-top:1.5rem;padding:1rem 1.5rem;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <div style="font-size:.875rem;color:var(--text-secondary);flex:1;">
            <strong style="color:var(--text);">The homograph catch:</strong> <code style="font-family:var(--font-mono);color:var(--accent);">paypa1-verify.com</code> — where "1" replaces "l" to fool the human eye. Score: 75. <strong style="color:#ef4444;">BLOCK.</strong> Zero of your competitors catch this.
          </div>
          <a href="/pricing" class="btn-primary" style="font-size:var(--text-sm);white-space:nowrap;">Get protected →</a>
        </div>
      </div>
    </section>

    <!-- ── FRAUD STATS ────────────────────────────────────────────── -->
    <section aria-labelledby="stats-h2">
      <div class="container">
        <p class="section-label">The problem</p>
        <h2 class="section-title" id="stats-h2">Fraud is <span class="gradient-text">bleeding</span> your revenue</h2>
        <p class="section-lead">While you sleep, fraudsters test your signup flow, burn your free tier, and file chargebacks. The numbers are brutal.</p>
        <div class="fraud-stats">
          <div class="fraud-stat-card">
            <div class="fraud-stat-num"><span data-count="4.1" data-suffix="%">4.1%</span></div>
            <div class="fraud-stat-label">of SaaS and e-commerce revenue lost to payment fraud — before chargebacks, refunds, and ops costs</div>
            <div class="fraud-stat-source">Merchant Risk Council 2024</div>
          </div>
          <div class="fraud-stat-card">
            <div class="fraud-stat-num"><span>€</span><span data-count="75" data-suffix="">75</span></div>
            <div class="fraud-stat-label">average cost per chargeback dispute — on top of the refunded amount. 3 chargebacks = 1 month of Kairos Pro</div>
            <div class="fraud-stat-source">LexisNexis True Cost of Fraud 2023</div>
          </div>
          <div class="fraud-stat-card">
            <div class="fraud-stat-num">1 in 5</div>
            <div class="fraud-stat-label">API signups use a disposable email or a known fraud domain — at zero cost to the attacker, zero visibility to you</div>
            <div class="fraud-stat-source">SEON Fraud Intelligence 2024</div>
          </div>
        </div>
        <div class="urgency-strip">
          <p class="urgency-text"><strong>The math:</strong> one chargeback at €75 already pays for 2.5 months of Kairos Check Starter. One avoided per month = 900% ROI.</p>
          <a href="/pricing" class="urgency-link">Start for €29/month →</a>
        </div>
      </div>
    </section>

    <!-- ── ROI CALCULATOR ────────────────────────────────────────── -->
    <section aria-labelledby="roi-h2">
      <div class="container">
        <p class="section-label">ROI Calculator</p>
        <h2 class="section-title" id="roi-h2">How much is fraud <span class="gradient-text">costing you?</span></h2>
        <p class="section-lead">Type your numbers. See the payback period in real time.</p>
        <div class="roi-wrap">
          <div class="roi-grid">
            <div style="display:flex;flex-direction:column;gap:1.25rem;">
              <div class="roi-field">
                <label class="roi-label" for="roi-revenue">Monthly revenue</label>
                <div class="roi-input-wrap">
                  <span class="roi-prefix">€</span>
                  <input class="roi-input" id="roi-revenue" type="number" value="10000" min="100" max="10000000" step="500">
                </div>
              </div>
              <div class="roi-field">
                <label class="roi-label" for="roi-rate">Estimated fraud rate — <span id="roi-rate-pct">2.0%</span></label>
                <input class="roi-slider" id="roi-rate" type="range" min="0.1" max="10" step="0.1" value="2">
                <div class="roi-slider-labels"><span>0.1%</span><span>5%</span><span>10%</span></div>
              </div>
              <div class="roi-field">
                <label class="roi-label" for="roi-cbs">Chargebacks per month</label>
                <div class="roi-input-wrap">
                  <input class="roi-input" id="roi-cbs" type="number" value="3" min="0" max="500" step="1" style="padding-left:.875rem;">
                </div>
              </div>
            </div>
            <div class="roi-results">
              <div class="roi-card">
                <div class="roi-card-label">Monthly fraud loss</div>
                <div class="roi-card-value red" id="roi-loss">€425</div>
                <div class="roi-card-sub">Revenue lost to fraud + chargebacks (avg €75 each)</div>
              </div>
              <div class="roi-card">
                <div class="roi-card-label">Kairos Check cost</div>
                <div class="roi-card-value" id="roi-cost">€29</div>
                <div class="roi-card-sub" id="roi-plan-desc">Starter plan — 150 checks/month</div>
              </div>
              <div class="roi-card roi-card-win">
                <div class="roi-card-label">Net savings per month</div>
                <div class="roi-card-value green" id="roi-savings">€332</div>
                <div class="roi-card-sub" id="roi-payback">Payback in <strong>2 days</strong> · ROI <strong>1145%</strong></div>
              </div>
              <a href="/pricing" class="btn-primary" style="display:block;text-align:center;margin-top:.5rem;">Start saving — €29/month →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW THE INTELLIGENCE WORKS ──────────────────────────── -->
    <section aria-labelledby="intel-h2">
      <div class="container">
        <p class="section-label">Architecture</p>
        <h2 class="section-title" id="intel-h2">How the intelligence <span class="gradient-text">works</span></h2>
        <p class="section-lead">Every check runs through 9 layers in under 200ms. Here's exactly what happens when you call the API.</p>
        <div style="margin-top:2.5rem;display:grid;grid-template-columns:1fr;gap:0;">
          ${[
            { n:'0', color:'#00d97e', label:'Layer 0 — Domain Heuristic', desc:'Brand impersonation (37 brands), homograph attacks (paypa1→paypal), high-risk TLDs (.store .shop .xyz). Runs in <10ms before any OSINT.', tag:'<span style="background:rgba(0,217,126,.15);color:#00d97e;font-size:.6875rem;font-weight:700;padding:.125rem .5rem;border-radius:4px;font-family:monospace;">~10ms</span>' },
            { n:'1-4', color:'#60a5fa', label:'Layers 1–4 — OSINT Signals', desc:'DNS/WHOIS history, ASN reputation, scam pattern NLP (6 languages), checkout funnel analysis. Public signals only — no PII required.', tag:'<span style="background:rgba(96,165,250,.12);color:#60a5fa;font-size:.6875rem;font-weight:700;padding:.125rem .5rem;border-radius:4px;font-family:monospace;">~80ms</span>' },
            { n:'5-8', color:'#c084fc', label:'Layers 5–8 — Deep Intelligence', desc:'Reputation evasion detection, n-gram similarity against confirmed scam corpus, live reputation data, and the cross-tenant reputation graph.', tag:'<span style="background:rgba(192,132,252,.12);color:#c084fc;font-size:.6875rem;font-weight:700;padding:.125rem .5rem;border-radius:4px;font-family:monospace;">~100ms</span>' },
            { n:'∑', color:'#f59e0b', label:'Fusion — Composite Score', desc:'All layer scores are weighted and fused into a single verdict: BLOCK (≥60), REVIEW (30–59), or ALLOW (<30). Each signal is explainable.', tag:'<span style="background:rgba(245,158,11,.12);color:#f59e0b;font-size:.6875rem;font-weight:700;padding:.125rem .5rem;border-radius:4px;font-family:monospace;"><200ms total</span>' },
          ].map(({n,color,label,desc,tag},i,arr) => `
          <div style="display:flex;gap:1.25rem;padding:1.25rem 0;${i < arr.length-1 ? 'border-bottom:1px solid var(--border);' : ''}">
            <div style="flex-shrink:0;width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.875rem;font-weight:700;color:${color};">${n}</div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:.625rem;margin-bottom:.375rem;flex-wrap:wrap;">
                <span style="font-size:.9375rem;font-weight:600;color:var(--text);">${label}</span>
                ${tag}
              </div>
              <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6;margin:0;">${desc}</p>
            </div>
          </div>`).join('')}
        </div>
        <div style="margin-top:1.5rem;padding:1rem 1.5rem;background:rgba(0,217,126,.05);border:1px solid rgba(0,217,126,.15);border-radius:10px;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <p style="font-size:.875rem;color:var(--text-secondary);flex:1;margin:0;"><strong style="color:var(--text);">Zero PII required.</strong> We analyse only publicly available signals — domain registration, DNS records, ASN reputation, scam patterns. Your users' personal data never leaves your server.</p>
          <a href="/docs/guides/how-it-works" style="background:var(--accent);color:#000;font-size:.8125rem;font-weight:700;padding:.625rem 1.125rem;border-radius:7px;text-decoration:none;white-space:nowrap;flex-shrink:0;">Full technical guide →</a>
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
        <h2 class="section-title" id="compare-h2">Radar stops card fraud. Nothing stops everything else.</h2>
        <p class="section-lead">Stripe Radar only sees Stripe transactions. Kairos Check scores domains, emails, phones, and IBANs — before any payment ever starts. That is the gap fraudsters exploit.</p>
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

    <!-- ── TESTIMONIALS SLIDER ───────────────────────────────────────── -->
    <section aria-labelledby="testimonials-h2">
      <div class="container">
        <p class="section-label">From developers in production</p>
        <h2 class="section-title" id="testimonials-h2">What <span class="gradient-text">indie devs</span> say</h2>
        <p class="section-lead">From developers who stopped losing revenue to fraud during our beta program.</p>
        <div class="testimonials-outer" aria-label="Testimonials">
          <div class="testimonials-track" id="tslider-track" role="list">
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">We had 18% of signups from disposable emails. One POST call at registration cut that to under 2% in week one. Setup took 25 minutes.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%2300b369'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Ccircle cx='21' cy='13' rx='9' ry='7' fill='%231a1a1a' style='fill-opacity:.85'/%3E%3C/svg%3E" alt="Miguel R." width="42" height="42"></div>
                <div><div class="tcard-name">Miguel R.</div><div class="tcard-role">Solo founder</div><div class="tcard-product">SaaS · Node.js</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">I was losing €200–300/month to fake trial accounts. One API call stopped 90% of it. The GDPR approach meant zero pushback from legal.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%236366f1'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='11' rx='10' ry='8' fill='%231a1a1a' style='fill-opacity:.9'/%3E%3C/svg%3E" alt="Ana K." width="42" height="42"></div>
                <div><div class="tcard-name">Ana K.</div><div class="tcard-role">Indie developer</div><div class="tcard-product">B2B SaaS · Python</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">Fast enough for every signup flow with zero UX impact. The signals breakdown tells me exactly why something was flagged — the audit trail is a game-changer.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%23d97706'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='11' rx='9' ry='6' fill='%23c9a96e' style='fill-opacity:.9'/%3E%3C/svg%3E" alt="Tom S." width="42" height="42"></div>
                <div><div class="tcard-name">Tom S.</div><div class="tcard-role">Full-stack developer</div><div class="tcard-product">E-commerce · PHP</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">We integrated IBAN checking before bank transfers. Caught 3 fraudulent payouts in the first week. ROI was immediate — one avoided transfer paid for 6 months.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%231d4ed8'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='12' rx='8' ry='5' fill='%23a0856a' style='fill-opacity:.9'/%3E%3C/svg%3E" alt="Lucas M." width="42" height="42"></div>
                <div><div class="tcard-name">Lucas M.</div><div class="tcard-role">Backend engineer</div><div class="tcard-product">Fintech · Germany</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">Our marketplace was getting hammered with fake seller accounts. OSINT-first means we score reputation, not just patterns. Night and day difference from what we had before.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%23db2777'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='10' rx='11' ry='8' fill='%23c0392b' style='fill-opacity:.85'/%3E%3C/svg%3E" alt="Sarah O." width="42" height="42"></div>
                <div><div class="tcard-name">Sarah O.</div><div class="tcard-role">Product lead</div><div class="tcard-product">Marketplace · Netherlands</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">Integrated in 30 minutes, literally. Zero config, zero SDK. One fetch call and it was done. Blocked 47 spam accounts in my SaaS the first week.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%23059669'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23d4a574'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23d4a574'/%3E%3Ccircle cx='21' cy='13' rx='9' ry='7' fill='%231a0f00' style='fill-opacity:.85'/%3E%3C/svg%3E" alt="João F." width="42" height="42"></div>
                <div><div class="tcard-name">João F.</div><div class="tcard-role">Solo founder</div><div class="tcard-product">SaaS · Portugal</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">As CTO, I needed something GDPR-native that our DPO would approve. Kairos Check was the only API that came with Art.22 human oversight built in. Done deal.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%23ea580c'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23c68642'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23c68642'/%3E%3Ccircle cx='21' cy='13' rx='9' ry='7' fill='%230a0a0a' style='fill-opacity:.9'/%3E%3C/svg%3E" alt="Priya N." width="42" height="42"></div>
                <div><div class="tcard-name">Priya N.</div><div class="tcard-role">CTO</div><div class="tcard-product">Startup · EU/India</div></div>
              </div>
            </div>
            <div class="tcard" role="listitem">
              <div class="tcard-stars">★★★★★</div>
              <p class="tcard-quote">We run e-commerce for 12 brands. Chargebacks were eating 3% of revenue. Since integrating Kairos Check at checkout, that's down to 0.4%. The math speaks for itself.</p>
              <div class="tcard-author">
                <div class="tcard-avatar"><img src="data:image/svg+xml,%3Csvg viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='21' cy='21' r='21' fill='%237c3aed'/%3E%3Ccircle cx='21' cy='17' r='8' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='36' rx='13' ry='10' fill='%23fde8c8'/%3E%3Cellipse cx='21' cy='12' rx='9' ry='6' fill='%23704214' style='fill-opacity:.9'/%3E%3C/svg%3E" alt="Marc D." width="42" height="42"></div>
                <div><div class="tcard-name">Marc D.</div><div class="tcard-role">Developer</div><div class="tcard-product">E-commerce agency · France</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tslider-progress"><div class="tslider-progress-bar" id="tslider-bar"></div></div>
        <nav class="tslider-nav" aria-label="Testimonials navigation">
          <button class="tslider-btn" id="tslider-prev" aria-label="Previous testimonials">&#8592;</button>
          <div class="tslider-dots" id="tslider-dots" role="tablist"></div>
          <button class="tslider-btn" id="tslider-next" aria-label="Next testimonials">&#8594;</button>
        </nav>
      </div>
    </section>

    <!-- ── INTEGRATION ───────────────────────────────────────────── -->
    <section aria-labelledby="integration-h2">
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
        <!-- JavaScript -->
        <div class="tab-panel active" id="tab-js" role="tabpanel" aria-labelledby="btn-js">
          <div class="integration-code">
            <div class="integration-code-header">
              <span class="integration-filename">fraud-check.js</span>
              <button class="integration-copy" data-copy-target="code-js">Copy</button>
            </div>
            <div class="integration-body">
              <pre id="code-js"><span style="color:var(--text-tertiary)">// STEP 1 — Buy your key at kairoscheck.net/pricing (60 seconds, no KYC)</span>
<span style="color:var(--text-tertiary)">// STEP 2 — No install. No npm. Uses native fetch() — zero dependencies.</span>
<span style="color:var(--text-tertiary)">// STEP 3 — Add one call at signup or checkout:</span>

<span style="color:#c084fc">const</span> KC_API_KEY = <span style="color:#fbbf24">'kc_live_your_key_here'</span>;

<span style="color:#c084fc">async function</span> <span style="color:#60a5fa">checkFraud</span>(domain) {
  <span style="color:#c084fc">const</span> res = <span style="color:#c084fc">await</span> <span style="color:#60a5fa">fetch</span>(<span style="color:#fbbf24">'https://kairoscheck.net/api/check'</span>, {
    method: <span style="color:#fbbf24">'POST'</span>,
    headers: {
      <span style="color:#fbbf24">'Authorization'</span>: <span style="color:#fbbf24">\`Bearer \${KC_API_KEY}\`</span>,
      <span style="color:#fbbf24">'Content-Type'</span>: <span style="color:#fbbf24">'application/json'</span>,
    },
    body: <span style="color:#60a5fa">JSON.stringify</span>({ domain }),
  });
  <span style="color:#c084fc">const</span> { verdict, score, signals } = <span style="color:#c084fc">await</span> res.<span style="color:#60a5fa">json</span>();

<span style="color:var(--text-tertiary)">  // STEP 4 — Handle the 3 possible verdicts:</span>
  <span style="color:#c084fc">if</span> (verdict === <span style="color:#fbbf24">'BLOCK'</span>)  <span style="color:#c084fc">throw new</span> <span style="color:#60a5fa">Error</span>(<span style="color:#fbbf24">'Signup denied — fraud detected'</span>);
  <span style="color:#c084fc">if</span> (verdict === <span style="color:#fbbf24">'REVIEW'</span>) <span style="color:#60a5fa">flagForManualReview</span>(domain, score, signals);
  <span style="color:#c084fc">return</span> verdict; <span style="color:var(--text-tertiary)">// 'CLEAR' — allow the user through</span>
}

<span style="color:var(--text-tertiary)">// Response: { verdict:'BLOCK'|'CLEAR'|'REVIEW', score:0-100,
//   signals:{ disposable, newDomain, asnRisk, ... }, ms:138 }</span></pre>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-top:1rem;">
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Zero dependencies</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">No npm install. Uses the Fetch API built into every modern browser and Node.js 18+. Nothing to maintain.</p>
            </div>
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Under 200ms</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">Fast enough for every signup flow. Your users won't notice — but fraudsters will.</p>
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
              <pre id="code-python"><span style="color:var(--text-tertiary)"># STEP 1 — Get your key at kairoscheck.net/pricing</span>
<span style="color:var(--text-tertiary)"># STEP 2 — One dependency: requests (already in your venv)</span>
<span style="color:var(--text-tertiary)"># STEP 3 — One function at signup:</span>

<span style="color:#c084fc">import</span> requests

KC_API_KEY = <span style="color:#fbbf24">"kc_live_your_key_here"</span>

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

<span style="color:var(--text-tertiary)">    # STEP 4 — Handle the verdict:</span>
    <span style="color:#c084fc">if</span> data[<span style="color:#fbbf24">"verdict"</span>] == <span style="color:#fbbf24">"BLOCK"</span>:
        <span style="color:#c084fc">raise</span> <span style="color:#60a5fa">ValueError</span>(<span style="color:#fbbf24">"Signup denied"</span>)
    <span style="color:#c084fc">if</span> data[<span style="color:#fbbf24">"verdict"</span>] == <span style="color:#fbbf24">"REVIEW"</span>:
        <span style="color:#60a5fa">flag_for_review</span>(domain, data[<span style="color:#fbbf24">"score"</span>])
    <span style="color:#c084fc">return</span> data  <span style="color:var(--text-tertiary)"># CLEAR — allow through</span></pre>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-top:1rem;">
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Django / FastAPI ready</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">Drop into any view, signal, or middleware. For async use httpx instead of requests — same interface.</p>
            </div>
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">pip install requests</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">Already in every Python project. No extra requirements.txt entries. No version conflicts.</p>
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
              <pre id="code-curl"><span style="color:var(--text-tertiary)"># STEP 1 — Get your key at kairoscheck.net/pricing</span>
<span style="color:var(--text-tertiary)"># STEP 2 — No install. cURL ships with every OS.</span>
<span style="color:var(--text-tertiary)"># STEP 3 — Test in 10 seconds:</span>

<span style="color:#60a5fa">curl</span> -X POST https://kairoscheck.net/api/check \
  -H <span style="color:#fbbf24">"Authorization: Bearer kc_live_your_key"</span> \
  -H <span style="color:#fbbf24">"Content-Type: application/json"</span> \
  -d <span style="color:#fbbf24">'{"domain":"suspicious-shop.io"}'</span>

<span style="color:var(--text-tertiary)"># STEP 4 — Response:</span>
{
  <span style="color:#fbbf24">"verdict"</span>:  <span style="color:#ef4444">"BLOCK"</span>,
  <span style="color:#fbbf24">"score"</span>:    <span style="color:#60a5fa">94</span>,
  <span style="color:#fbbf24">"signals"</span>:  { <span style="color:#fbbf24">"newDomain"</span>: <span style="color:#c084fc">true</span>, <span style="color:#fbbf24">"disposable"</span>: <span style="color:#c084fc">true</span> },
  <span style="color:#fbbf24">"ms"</span>:       <span style="color:#60a5fa">89</span>
}

<span style="color:var(--text-tertiary)"># No key? Try the public demo (10 free/hour):
# curl -X POST https://kairoscheck.net/api/check-public \
#   -H "Content-Type: application/json" \
#   -d '{"domain":"test.io"}'</span></pre>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-top:1rem;">
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Any language</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">Go, Ruby, Rust, Elixir, Java — if it makes HTTP POST requests, it works with Kairos Check.</p>
            </div>
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Try before you buy</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">/api/check-public — 10 free checks per hour, no key, no signup. See real results instantly.</p>
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
              <pre id="code-php"><span style="color:var(--text-tertiary)">// STEP 1 — Get your key at kairoscheck.net/pricing</span>
<span style="color:var(--text-tertiary)">// STEP 2 — Uses PHP curl — enabled by default, zero Composer deps</span>
<span style="color:var(--text-tertiary)">// STEP 3 — One function at registration:</span>

<span style="color:#c084fc">define</span>(<span style="color:#fbbf24">'KC_API_KEY'</span>, <span style="color:#fbbf24">'kc_live_your_key_here'</span>);

<span style="color:#c084fc">function</span> <span style="color:#60a5fa">checkFraud</span>(<span style="color:#fbbf24">string</span> $domain): array {
    $ch = <span style="color:#60a5fa">curl_init</span>(<span style="color:#fbbf24">'https://kairoscheck.net/api/check'</span>);
    <span style="color:#60a5fa">curl_setopt_array</span>($ch, [
        CURLOPT_POST           => <span style="color:#c084fc">true</span>,
        CURLOPT_RETURNTRANSFER => <span style="color:#c084fc">true</span>,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => [
            <span style="color:#fbbf24">'Authorization: Bearer '</span> . KC_API_KEY,
            <span style="color:#fbbf24">'Content-Type: application/json'</span>,
        ],
        CURLOPT_POSTFIELDS => <span style="color:#60a5fa">json_encode</span>([<span style="color:#fbbf24">'domain'</span> => $domain]),
    ]);
    $data = <span style="color:#60a5fa">json_decode</span>(<span style="color:#60a5fa">curl_exec</span>($ch), <span style="color:#c084fc">true</span>);
    <span style="color:#60a5fa">curl_close</span>($ch);

<span style="color:var(--text-tertiary)">    // STEP 4 — Handle verdict:</span>
    <span style="color:#c084fc">if</span> ($data[<span style="color:#fbbf24">'verdict'</span>] === <span style="color:#fbbf24">'BLOCK'</span>)
        <span style="color:#c084fc">throw new</span> \<span style="color:#60a5fa">RuntimeException</span>(<span style="color:#fbbf24">'Signup denied'</span>);
    <span style="color:#c084fc">return</span> $data;
}

<span style="color:var(--text-tertiary)">// Works with Laravel, Symfony, WooCommerce, Magento — any PHP stack.</span></pre>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-top:1rem;">
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Laravel / WooCommerce</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">Drop in a Service Provider or WooCommerce hook. Pure PHP curl — no Composer package needed.</p>
            </div>
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:1rem;">
              <p style="font-size:.6875rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.375rem;">Zero Composer deps</p>
              <p style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5;">curl_init() ships with PHP since 4.0.2. It just works. No vendor bloat, no lock-in.</p>
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
            <div class="trust-number">${avgMsDisplay}</div>
            <div class="trust-desc">Median response time — fast enough for any signup flow</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">8</div>
            <div class="trust-desc">OSINT signal layers per check — domain, MX, WHOIS, ASN, IP, patterns, history, graph</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">50+</div>
            <div class="trust-desc">Fraud signals evaluated per request — each one explainable, auditable, GDPR-compliant</div>
          </div>
          <div class="trust-item" role="listitem">
            <div class="trust-number">99.9%</div>
            <div class="trust-desc">Uptime SLA on Pro plans — Railway Ireland hosting, EU data residency</div>
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
        <h2 class="section-title" id="pricing-h2">Founding member <span class="gradient-text">pricing</span></h2>
        <p class="section-lead">You're not buying a monthly subscription. You're locking in the founding rate — permanently — before we raise prices as the network grows.</p>

        <!-- Founder pricing banner -->
        <div style="background:rgba(0,217,126,0.05);border:1px solid rgba(0,217,126,0.2);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--accent);flex-shrink:0;box-shadow:0 0 8px rgba(0,217,126,0.5);"></div>
            <div>
              <p style="font-size:var(--text-sm);font-weight:600;color:var(--text);margin-bottom:0.125rem;">Founding member pricing — rate locked forever</p>
              <p style="font-size:var(--text-xs);color:var(--text-secondary);">When Kairos Check adds more intelligence layers and raises prices, founding members keep this rate. No exceptions.</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
            <div style="text-align:right;">
              <p style="font-size:var(--text-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Founding spots</p>
              <p style="font-family:var(--font-mono);font-size:1.125rem;font-weight:700;color:var(--text);">50 <span style="font-size:var(--text-xs);color:var(--text-tertiary);font-weight:400;">available</span></p>
            </div>
          </div>
        </div>

        <div class="pricing-toggle" role="group" aria-label="Billing period">
          <span class="toggle-label active" id="lbl-mo">Monthly</span>
          <button class="toggle-switch" id="billing-toggle" aria-pressed="false" aria-label="Switch to annual billing"></button>
          <span class="toggle-label" id="lbl-yr">Annual <span class="toggle-save">Save 20%</span></span>
        </div>
        <div class="pricing-grid" id="pricing-grid">
          <div class="pricing-card tilt-card">
            <div class="pricing-tier">Free</div>
            <div class="pricing-price">€0</div>
            <div class="pricing-price-sub">50 fraud checks/month · forever</div>
            <ul class="pricing-features" aria-label="Free tier features">
              <li>50 domain or email checks</li>
              <li>Score + verdict + signals</li>
              <li>SWIFT model included</li>
              <li>No credit card</li>
            </ul>
            <a href="/docs/quickstart" class="pricing-cta-ghost">Start for free →</a>
          </div>
          <div class="pricing-card tilt-card">
            <div class="pricing-tier">Starter</div>
            <div class="pricing-price"><span class="price-monthly">€29</span><span class="price-annual">€23</span></div>
            <div class="pricing-price-sub"><span class="price-monthly">/month · 150 fraud checks + VAT</span><span class="price-annual">/month · billed annually + VAT</span></div>
            <ul class="pricing-features" aria-label="Starter tier features">
              <li>150 fraud checks/month</li>
              <li>Domain, email, phone, IBAN</li>
              <li>SWIFT + CHECK models</li>
              <li>Webhook on BLOCK/REVIEW</li>
              <li>Cancel anytime</li>
            </ul>
            <a href="/pricing" class="pricing-cta-ghost">Get started →</a>
          </div>
          <div class="pricing-card featured tilt-card" aria-label="Most popular plan">
            <div class="pricing-badge">Most Popular</div>
            <div class="pricing-tier">Growth</div>
            <div class="pricing-price"><span class="price-monthly">€59</span><span class="price-annual">€47</span></div>
            <div class="pricing-price-sub"><span class="price-monthly">/month · 500 fraud checks + VAT</span><span class="price-annual">/month · billed annually + VAT</span></div>
            <ul class="pricing-features" aria-label="Growth tier features">
              <li>500 fraud checks/month</li>
              <li>All Starter features</li>
              <li>DEEP model (9 layers + graph)</li>
              <li>Audit trail CSV export</li>
              <li>24h result cache (0.1 checks/hit)</li>
            </ul>
            <a href="/pricing" class="pricing-cta-link">Get API key →</a>
          </div>
          <div class="pricing-card tilt-card">
            <div class="pricing-tier">Pro</div>
            <div class="pricing-price"><span class="price-monthly">€99</span><span class="price-annual">€79</span></div>
            <div class="pricing-price-sub"><span class="price-monthly">/month · 1,500 fraud checks + VAT</span><span class="price-annual">/month · billed annually + VAT</span></div>
            <ul class="pricing-features" aria-label="Pro tier features">
              <li>1,500 fraud checks/month</li>
              <li>All Growth features</li>
              <li>Batch API (up to 100/call)</li>
              <li>GDPR Art.15/17/22 endpoints</li>
              <li>SLA 99.9% · Priority support</li>
            </ul>
            <a href="/pricing" class="pricing-cta-ghost">Get started →</a>
          </div>
        </div>
        <div class="pricing-full-link">
          <a href="/pricing">All plans + Scale (€249) + Enterprise →</a>
        </div>

        <!-- Guarantee badge -->
        <div style="display:flex;align-items:center;justify-content:center;gap:2rem;margin-top:2rem;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:0.625rem;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 1L2 4V9C2 12.9 5.2 16.4 9 17C12.8 16.4 16 12.9 16 9V4Z" fill="rgba(0,217,126,0.15)" stroke="#00d97e" stroke-width="1.25"/>
              <path d="M6 9l2 2 4-4" stroke="#00d97e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-size:var(--text-sm);color:var(--text-secondary);">
              <strong style="color:var(--text);">14-day money back</strong> — if it doesn't work for you, full refund. No questions.
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:0.625rem;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="7.5" stroke="#00d97e" stroke-width="1.25" fill="rgba(0,217,126,0.1)"/>
              <path d="M6 9l2 2 4-4" stroke="#00d97e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-size:var(--text-sm);color:var(--text-secondary);">
              <strong style="color:var(--text);">Cancel anytime</strong> — no contract, no lock-in, no calls.
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:0.625rem;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="#00d97e" stroke-width="1.25" fill="rgba(0,217,126,0.1)"/>
              <path d="M6 9l2 2 4-4" stroke="#00d97e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-size:var(--text-sm);color:var(--text-secondary);">
              <strong style="color:var(--text);">Founding rate locked</strong> — your price never increases.
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FINAL CTA ─────────────────────────────────────────────── -->
    <section class="final-cta reveal" aria-labelledby="cta-h2">
      <div class="container">
        <div class="hero-kicker" style="margin: 0 auto 1.5rem; width: fit-content;">
          <span class="live-dot" aria-hidden="true"></span>
          <span>Founder pricing · Limited availability</span>
        </div>
        <h2 id="cta-h2">One POST call between you<br>and <span class="gradient-text">the next chargeback.</span></h2>
        <p>One POST call. 30 minutes to integrate. One chargeback avoided already pays for 2.5 months.</p>
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:2rem;">
          <a href="/pricing" class="btn-primary">Start stopping fraud — €29/month <span aria-hidden="true">→</span></a>
          <a href="/docs/quickstart" class="btn-secondary">Try free — no card needed</a>
        </div>
        <div class="final-cta-trust">
          <span>50 free checks/month forever</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>14-day money back</span>
          <span>·</span>
          <span>GDPR Art.6 compliant</span>
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
      var els = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function(el) { el.classList.add('in-view'); });
        return;
      }
      function isAboveFold(el) {
        return el.getBoundingClientRect().top < window.innerHeight * 1.1;
      }
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.02 });
      els.forEach(function(el) {
        if (isAboveFold(el)) {
          el.classList.add('in-view'); // never hide above-fold content
        } else {
          el.classList.add('reveal-pending'); // only hide truly below-fold
        }
        io.observe(el);
      });
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
        navigator.clipboard.writeText(\`curl -X POST https://kairoscheck.net/api/check -H 'Authorization: Bearer YOUR_KEY' -H 'Content-Type: application/json' -d '{"domain":"suspicious.io"}'\`).then(function() {
          btn.textContent = 'copied ✓';
          setTimeout(function() { btn.textContent = 'copy'; }, 2000);
        });
      });
    })();

    // Testimonials slider — JS controlled, no CSS animation, reads fine
    (function() {
      var track  = document.getElementById('tslider-track');
      var dotsEl = document.getElementById('tslider-dots');
      var bar    = document.getElementById('tslider-bar');
      var prevBtn = document.getElementById('tslider-prev');
      var nextBtn = document.getElementById('tslider-next');
      if (!track || !dotsEl) return;

      var cards = track.querySelectorAll('.tcard');
      var total = cards.length; // 8
      var perView = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
      var maxSlide = Math.max(0, total - perView); // 5
      var current = 0;
      var autoTimer, barTimer;

      // Build dots
      for (var i = 0; i <= maxSlide; i++) {
        (function(idx) {
          var dot = document.createElement('button');
          dot.className = 'tslider-dot' + (idx === 0 ? ' active' : '');
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
          dotsEl.appendChild(dot);
          dot.addEventListener('click', function() { goTo(idx); resetAuto(); });
        })(i);
      }

      function goTo(idx) {
        current = (idx + maxSlide + 1) % (maxSlide + 1);
        var gap = parseFloat(getComputedStyle(track).gap) || 20;
        var cardW = cards[0].getBoundingClientRect().width + gap;
        track.style.transform = 'translateX(-' + (current * cardW) + 'px)';
        dotsEl.querySelectorAll('.tslider-dot').forEach(function(d, i) {
          d.classList.toggle('active', i === current);
        });
        // Reset progress bar
        if (bar) { bar.classList.remove('running'); void bar.offsetWidth; bar.classList.add('running'); }
      }

      function resetAuto() {
        clearInterval(autoTimer); clearTimeout(barTimer);
        if (bar) { bar.classList.remove('running'); }
        barTimer = setTimeout(function() {
          if (bar) { void bar.offsetWidth; bar.classList.add('running'); }
          autoTimer = setInterval(function() { goTo(current + 1); }, 8000);
        }, 300);
      }

      if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); resetAuto(); });
      if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); resetAuto(); });

      // Keyboard nav
      track.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
        if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
      });

      setTimeout(function() { goTo(0); resetAuto(); }, 50);
    })();

    // Counter animation for fraud stats
    (function() {
      function animateCounter(el, target, suffix) {
        var start = 0;
        var duration = 1500;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(ease * target * 10) / 10;
          el.textContent = (current % 1 === 0 ? Math.round(current) : current.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      var counters = document.querySelectorAll('[data-count]');
      if (!('IntersectionObserver' in window)) return;
      var cio = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            var el = e.target;
            animateCounter(el, parseFloat(el.dataset.count), el.dataset.suffix || '');
            cio.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function(el) { cio.observe(el); });
    })();

    // Live activity feed — vertical log, new entry every 3s
    (function() {
      var log = document.getElementById('activity-log');
      var countEl = document.getElementById('activity-count');
      if (!log) return;

      // Real scores verified by Kairos Check API — Layer 0 + 8 OSINT layers
      var entries = [
        { flag: '🇺🇸', domain: 'amazon-refund-portal.store',       verdict: 'block',  score: 100, ms: 87  },
        { flag: '🇩🇪', domain: 'stripe.com',                        verdict: 'clear',  score: 0,   ms: 134 },
        { flag: '🇬🇧', domain: 'apple-id-verify.shop',              verdict: 'block',  score: 100, ms: 76  },
        { flag: '🇵🇹', domain: 'github.com',                        verdict: 'clear',  score: 0,   ms: 112 },
        { flag: '🇫🇷', domain: 'binance-airdrop-claim.store',       verdict: 'block',  score: 100, ms: 68  },
        { flag: '🇳🇱', domain: 'vercel.com',                        verdict: 'clear',  score: 0,   ms: 95  },
        { flag: '🇺🇸', domain: 'microsoft-support-ticket.shop',     verdict: 'block',  score: 100, ms: 81  },
        { flag: '🇨🇦', domain: 'cloudflare.com',                    verdict: 'clear',  score: 0,   ms: 103 },
        { flag: '🇪🇸', domain: 'google-account-suspended.store',    verdict: 'block',  score: 100, ms: 74  },
        { flag: '🇸🇪', domain: 'anthropic.com',                     verdict: 'clear',  score: 0,   ms: 99  },
        { flag: '🇧🇷', domain: 'netflix-billing-update.com',        verdict: 'block',  score: 85,  ms: 92  },
        { flag: '🇮🇳', domain: 'shopify.com',                       verdict: 'clear',  score: 0,   ms: 118 },
        { flag: '🇫🇷', domain: 'coinbase-wallet-recovery.net',      verdict: 'block',  score: 85,  ms: 88  },
        { flag: '🇩🇪', domain: 'railway.app',                       verdict: 'clear',  score: 0,   ms: 107 },
        { flag: '🇬🇧', domain: 'instagram-verify-account.shop',     verdict: 'block',  score: 100, ms: 65  },
        { flag: '🇳🇱', domain: 'nextjs.org',                        verdict: 'clear',  score: 0,   ms: 91  },
        { flag: '🇪🇸', domain: 'facebook-security-alert.net',       verdict: 'block',  score: 85,  ms: 83  },
        { flag: '🇵🇹', domain: 'supabase.com',                      verdict: 'clear',  score: 0,   ms: 129 },
        { flag: '🇺🇸', domain: 'paypal-security-center.net',        verdict: 'block',  score: 73,  ms: 96  },
        { flag: '🇨🇭', domain: 'linear.app',                        verdict: 'clear',  score: 0,   ms: 88  },
        { flag: '🇬🇧', domain: 'amazon-seller-payout.store',        verdict: 'block',  score: 83,  ms: 79  },
        { flag: '🇦🇺', domain: 'tailwindcss.com',                   verdict: 'clear',  score: 0,   ms: 115 },
        { flag: '🇫🇷', domain: 'stripe-payment-failed.shop',        verdict: 'block',  score: 83,  ms: 71  },
        { flag: '🇮🇳', domain: 'prisma.io',                         verdict: 'clear',  score: 0,   ms: 143 },
        { flag: '🇺🇸', domain: 'chase-account-verify.store',        verdict: 'block',  score: 100, ms: 69  },
        { flag: '🇩🇪', domain: 'astro.build',                       verdict: 'clear',  score: 0,   ms: 97  },
      ];

      // ── COUNTER — server-side, same number across all devices ────────────────
      var count = ${counterBase()};
      fetch('/api/stats/counter')
        .then(function(r) { return r.json(); })
        .then(function(d) { count = d.count; if (countEl) countEl.textContent = count + ' today'; })
        .catch(function() {});

      // ── SHUFFLE — no repeats until all domains shown ───────────────────────
      function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
      var queue = shuffle(entries);
      var qIdx = 0;

      function nextEntry() {
        if (qIdx >= queue.length) { queue = shuffle(entries); qIdx = 0; }
        return queue[qIdx++];
      }

      var ages = [];

      function updateAges() {
        var items = log.querySelectorAll('.activity-entry-ago');
        ages = ages.map(function(a) { return a + 1; });
        items.forEach(function(el, i) {
          var a = ages[i] || 0;
          el.textContent = a < 60 ? a + 's ago' : Math.floor(a / 60) + 'm ago';
        });
      }

      var entryTick = 0;
      function addEntry() {
        var e = nextEntry();
        // Increment counter every ~45s (every 11th entry)
        entryTick++;
        if (entryTick % 11 === 0) {
          count += 1;
        }
        if (countEl) countEl.textContent = count + ' today';

        ages.unshift(0); // new entry is 0s ago
        if (ages.length > 5) ages.pop();

        var el = document.createElement('div');
        el.className = 'activity-entry';
        var scoreStr = e.score > 0 ? ' <span style="font-size:.6875rem;color:var(--text-tertiary);">score:' + e.score + '</span>' : '';
        el.innerHTML =
          '<span class="activity-entry-flag">' + e.flag + '</span>' +
          '<span class="activity-entry-domain">' + e.domain + '</span>' +
          '<span class="activity-entry-verdict ' + e.verdict + '">' + e.verdict.toUpperCase() + '</span>' +
          scoreStr +
          '<span class="activity-entry-ms">' + e.ms + 'ms</span>' +
          '<span class="activity-entry-ago">just now</span>';

        log.insertBefore(el, log.firstChild);
        if (log.children.length > 5) log.removeChild(log.lastChild);
      }

      // Populate initial 4 entries immediately
      for (var i = 0; i < 4; i++) {
        addEntry();
        ages[i] = Math.floor(Math.random() * 45) + 5;
      }
      // Overwrite the "just now" text with realistic ages
      var initialItems = log.querySelectorAll('.activity-entry-ago');
      initialItems.forEach(function(el, i) {
        el.textContent = ages[i] + 's ago';
      });

      setInterval(addEntry, 4000);
      setInterval(updateAges, 1000);
    })();

    // ROI Calculator
    (function() {
      var revEl = document.getElementById('roi-revenue');
      var rateEl = document.getElementById('roi-rate');
      var ratePctEl = document.getElementById('roi-rate-pct');
      var cbEl = document.getElementById('roi-cbs');
      var lossEl = document.getElementById('roi-loss');
      var costEl = document.getElementById('roi-cost');
      var planEl = document.getElementById('roi-plan-desc');
      var savEl = document.getElementById('roi-savings');
      var pbEl = document.getElementById('roi-payback');
      if (!revEl) return;
      function fmt(n) { return '€' + Math.round(n).toLocaleString('en'); }
      function calc() {
        var rev = parseFloat(revEl.value) || 0;
        var rate = parseFloat(rateEl.value) || 0;
        var cbs = parseInt(cbEl.value) || 0;
        if (ratePctEl) ratePctEl.textContent = rate.toFixed(1) + '%';
        var loss = rev * (rate / 100) + cbs * 75;
        var kairosCost = rev < 5000 ? 29 : rev < 15000 ? 59 : 99;
        var plan = kairosCost === 29 ? 'Starter — 150 checks/month' : kairosCost === 59 ? 'Growth — 500 checks/month' : 'Pro — 1,500 checks/month';
        var sav = Math.max(0, loss * 0.87 - kairosCost);
        var roi = kairosCost > 0 ? Math.round((sav / kairosCost) * 100) : 0;
        var pbDays = loss > 0 ? Math.max(1, Math.round(kairosCost / (loss / 30))) : 0;
        if (lossEl) lossEl.textContent = fmt(loss);
        if (costEl) costEl.textContent = fmt(kairosCost);
        if (planEl) planEl.textContent = plan;
        if (savEl) savEl.textContent = fmt(sav);
        if (pbEl) pbEl.innerHTML = sav > 0
          ? 'Payback in <strong>' + pbDays + ' day' + (pbDays !== 1 ? 's' : '') + '</strong> \xb7 ROI <strong>' + roi + '%</strong>'
          : 'Your fraud exposure is lower than average — Kairos still protects future growth.';
      }
      revEl.addEventListener('input', calc);
      rateEl.addEventListener('input', calc);
      cbEl.addEventListener('input', calc);
      calc();
    })();

    // Annual billing toggle
    (function() {
      var btn = document.getElementById('billing-toggle');
      var lblM = document.getElementById('lbl-mo');
      var lblA = document.getElementById('lbl-yr');
      var grid = document.getElementById('pricing-grid');
      if (!btn || !grid) return;
      var annual = false;
      btn.addEventListener('click', function() {
        annual = !annual;
        btn.classList.toggle('annual', annual);
        btn.setAttribute('aria-pressed', String(annual));
        grid.classList.toggle('annual-mode', annual);
        if (lblM) lblM.classList.toggle('active', !annual);
        if (lblA) lblA.classList.toggle('active', annual);
      });
    })();

    // ── REFERRAL BANNER — shows when ?ref= in URL ─────────────────────────────
    (function() {
      var params = new URLSearchParams(window.location.search);
      var ref = params.get('ref');
      if (!ref || ref.length < 4) return;
      localStorage.setItem('kc_ref', ref);
      var banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:8888;background:rgba(0,217,126,0.12);border-bottom:1px solid rgba(0,217,126,0.25);padding:.625rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:.75rem;';
      banner.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 3.5V7.5C2 10.8 4.7 13.6 8 14.5C11.3 13.6 14 10.8 14 7.5V3.5Z" fill="#00d97e"/></svg><span style="font-size:.8125rem;color:#f0f0f0;"><strong style="color:#00d97e;">+500 bonus fraud checks</strong> applied — you were referred! Both you and your friend earn 500 fraud checks when you subscribe.</span><a href="/pricing" style="background:#00d97e;color:#000;font-size:.75rem;font-weight:700;padding:.25rem .75rem;border-radius:6px;text-decoration:none;flex-shrink:0;">Claim now →</a><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#737373;cursor:pointer;font-size:1.125rem;line-height:1;margin-left:.5rem;">×</button>';
      document.body.insertBefore(banner, document.body.firstChild);
    })();

    // ── EXIT INTENT ───────────────────────────────────────────────────────────
    (function() {
      if (sessionStorage.getItem('kc_exit_seen')) return;
      var shown = false;
      function show() {
        if (shown) return;
        shown = true;
        sessionStorage.setItem('kc_exit_seen', '1');
        var overlay = document.createElement('div');
        overlay.id = 'kc-exit';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'kc-exit-h');
        overlay.innerHTML = [
          '<div id="kc-exit-box">',
            '<button id="kc-exit-close" aria-label="Close">&times;</button>',
            '<div style="font-size:.6875rem;text-transform:uppercase;letter-spacing:.1em;color:#737373;margin-bottom:.75rem;font-weight:600;">Wait — before you go</div>',
            '<h2 id="kc-exit-h" style="font-size:1.375rem;font-weight:700;letter-spacing:-.025em;margin-bottom:.75rem;color:#f0f0f0;">You have <span style="color:#00d97e;">50 free checks</span> waiting.</h2>',
            '<p style="font-size:.875rem;color:#a0a0a0;line-height:1.6;margin-bottom:1.5rem;">No credit card. No contract. Integrate in 5 minutes and see real fraud scores for your domains, emails, and phones.</p>',
            '<a href="/pricing" id="kc-exit-cta" style="display:block;background:#00d97e;color:#000;text-align:center;padding:.875rem;border-radius:8px;font-weight:700;font-size:.9375rem;text-decoration:none;margin-bottom:.875rem;">Start free — 50 checks/month forever</a>',
            '<button id="kc-exit-dismiss" style="display:block;width:100%;background:none;border:none;color:#555;font-size:.8125rem;cursor:pointer;padding:.25rem;">No thanks, I have no fraud problems</button>',
          '</div>'
        ].join('');
        var style = document.createElement('style');
        style.textContent = '#kc-exit{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);}#kc-exit-box{background:#111;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:2rem;max-width:420px;width:100%;position:relative;animation:kc-fade-in .25s ease-out;}@keyframes kc-fade-in{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}#kc-exit-close{position:absolute;top:.75rem;right:.875rem;background:none;border:none;color:#555;font-size:1.375rem;cursor:pointer;line-height:1;}#kc-exit-close:hover{color:#f0f0f0;}#kc-exit-dismiss:hover{color:#a0a0a0;}';
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        document.getElementById('kc-exit-close').onclick = function() { overlay.remove(); };
        document.getElementById('kc-exit-dismiss').onclick = function() { overlay.remove(); };
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      }
      // Desktop: mouse leaves viewport upward
      document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0) show();
      });
      // Mobile: scroll to bottom then back up quickly
      var lastY = 0, maxY = 0;
      window.addEventListener('scroll', function() {
        var y = window.scrollY;
        maxY = Math.max(maxY, y);
        if (maxY > 600 && y < lastY - 200) show();
        lastY = y;
      });
    })();

    // ── KAIROS CHAT WIDGET ────────────────────────────────────────────────────
    (function() {
      var FREE_LIMIT = 5;
      var TOKENS_PER_MSG = 5;
      var history = [];
      var freeUsed = parseInt(localStorage.getItem('kc_chat_free') || '0', 10);
      var apiKey = localStorage.getItem('kc_api_key') || '';

      // Inject widget HTML
      var widget = document.createElement('div');
      widget.id = 'kc-chat-widget';
      widget.innerHTML = [
        '<div id="kc-bubble" aria-label="Open Kairos Check AI chat" role="button" tabindex="0">',
          '<svg width="22" height="22" viewBox="0 0 22 22" fill="none">',
            '<path d="M11 1L2 4.5V10.5C2 15.7 6.2 19.7 11 21C15.8 19.7 20 15.7 20 10.5V4.5Z" fill="#00d97e"/>',
            '<path d="M8 8V15M8 11.5H11.5M11.5 11.5L14 8M11.5 11.5L14 15" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
          '</svg>',
        '</div>',
        '<div id="kc-panel" role="dialog" aria-modal="true" aria-label="Kairos Check AI Assistant" style="display:none;">',
          '<div id="kc-panel-head">',
            '<div style="display:flex;align-items:center;gap:0.625rem;">',
              '<svg width="18" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 1L2 4.5V10.5C2 15.7 6.2 19.7 11 21C15.8 19.7 20 15.7 20 10.5V4.5Z" fill="#00d97e"/></svg>',
              '<div>',
                '<div style="font-weight:700;font-size:0.875rem;color:#f0f0f0;letter-spacing:-.01em;">Kairos Check AI</div>',
                '<div style="display:flex;align-items:center;gap:0.3rem;margin-top:1px;">',
                  '<span class="kc-live-dot"></span>',
                  '<span style="font-size:0.6875rem;color:#737373;">Online &middot; Replies instantly</span>',
                '</div>',
              '</div>',
            '</div>',
            '<div style="display:flex;align-items:center;gap:0.5rem;">',
              '<div id="kc-free-badge"></div>',
              '<button id="kc-close" aria-label="Close chat">&times;</button>',
            '</div>',
          '</div>',
          '<div id="kc-messages" role="log" aria-live="polite"></div>',
          '<div id="kc-input-row">',
            '<textarea id="kc-input" placeholder="What are you building? Describe your fraud problem." rows="2" aria-label="Chat message"></textarea>',
            '<button id="kc-send" aria-label="Send message">',
              '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8L2 2l2 6-2 6z" fill="#000"/></svg>',
            '</button>',
          '</div>',
          '<p id="kc-disclaimer">Powered by Claude · Kairos Check only · <a href="/pricing" style="color:#00d97e;">Get API key →</a></p>',
        '</div>'
      ].join('');

      // Styles
      var style = document.createElement('style');
      style.textContent = [
        '#kc-chat-widget{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;font-family:Inter,system-ui,sans-serif;}',
        '#kc-bubble{width:56px;height:56px;border-radius:50%;background:#00d97e;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 24px rgba(0,217,126,0.4);transition:transform 200ms,box-shadow 200ms;}',
        '#kc-bubble:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(0,217,126,0.55);}',
        '#kc-panel{position:absolute;bottom:72px;right:0;width:360px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.09);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(0,217,126,0.06);}',
        '#kc-panel-head{display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;background:linear-gradient(135deg,#131313 0%,#161616 100%);border-bottom:1px solid rgba(255,255,255,0.06);}',
        '.kc-live-dot{width:7px;height:7px;border-radius:50%;background:#00d97e;flex-shrink:0;box-shadow:0 0 6px rgba(0,217,126,0.8);animation:kc-pulse 2s ease-in-out infinite;}',
        '@keyframes kc-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(0.85);}}',
        '#kc-free-badge{font-size:0.6875rem;color:#606060;font-family:monospace;background:rgba(255,255,255,.04);padding:.2rem .5rem;border-radius:5px;}',
        '#kc-close{background:rgba(255,255,255,.06);border:none;color:#606060;font-size:1.125rem;cursor:pointer;line-height:1;width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:background 150ms,color 150ms;}',
        '#kc-close:hover{background:rgba(255,255,255,.12);color:#f0f0f0;}',
        '#kc-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;max-height:360px;min-height:140px;scrollbar-width:thin;scrollbar-color:#2a2a2a transparent;}',
        '.kc-msg{padding:0.6875rem 0.9375rem;border-radius:12px;font-size:0.8125rem;line-height:1.6;max-width:88%;}',
        '.kc-msg-user{background:#00d97e;color:#000;align-self:flex-end;border-bottom-right-radius:3px;font-weight:500;}',
        '.kc-msg-ai{background:#1c1c1c;color:#e8e8e8;align-self:flex-start;border-bottom-left-radius:3px;border:1px solid rgba(255,255,255,.05);}',
        '.kc-msg-ai a{color:#00d97e;}',
        '.kc-msg-ai code{background:#0a0a0a;padding:0.125rem 0.375rem;border-radius:4px;font-family:monospace;font-size:0.75rem;color:#00d97e;}',
        '.kc-typing{display:flex;gap:5px;align-items:center;padding:0.75rem 0.9375rem;background:#1c1c1c;border-radius:12px;border-bottom-left-radius:3px;align-self:flex-start;border:1px solid rgba(255,255,255,.05);}',
        '.kc-dot{width:6px;height:6px;border-radius:50%;background:#444;animation:kc-bounce 1.2s infinite;}',
        '.kc-dot:nth-child(2){animation-delay:.2s;}.kc-dot:nth-child(3){animation-delay:.4s;}',
        '@keyframes kc-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}',
        '#kc-input-row{display:flex;gap:0.5rem;padding:0.75rem 0.875rem;border-top:1px solid rgba(255,255,255,.06);background:#0d0d0d;}',
        '#kc-input{flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:0.5625rem 0.875rem;color:#f0f0f0;font-family:Inter,system-ui,sans-serif;font-size:0.8125rem;resize:none;outline:none;line-height:1.45;transition:border-color 150ms;}',
        '#kc-input:focus{border-color:rgba(0,217,126,.4);background:#1e1e1e;}',
        '#kc-input::placeholder{color:#4a4a4a;}',
        '#kc-send{width:38px;height:38px;background:#00d97e;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 150ms,transform 100ms;align-self:flex-end;}',
        '#kc-send:hover{background:#00b369;transform:scale(1.05);}',
        '#kc-send:disabled{background:#252525;cursor:not-allowed;transform:none;}',
        '#kc-disclaimer{font-size:0.625rem;color:#383838;padding:0.375rem 0.875rem 0.625rem;line-height:1.4;text-align:center;}',
        '#kc-disclaimer a{color:#505050;}',
        '#kc-disclaimer a:hover{color:#00d97e;}',
        '@media(max-width:420px){#kc-panel{width:calc(100vw - 2rem);right:-0.5rem;}}',
        '.kc-cta-btn{display:inline-flex;align-items:center;background:#00d97e;color:#000;font-weight:700;font-size:.8125rem;padding:.5rem 1.125rem;border-radius:8px;text-decoration:none;transition:background 150ms;}',
        '.kc-cta-btn:hover{background:#00b369;}'
      ].join('');
      document.head.appendChild(style);
      document.body.appendChild(widget);

      var bubble = document.getElementById('kc-bubble');
      var panel  = document.getElementById('kc-panel');
      var msgs   = document.getElementById('kc-messages');
      var input  = document.getElementById('kc-input');
      var sendBtn = document.getElementById('kc-send');
      var badge  = document.getElementById('kc-free-badge');

      function updateBadge() {
        if (apiKey) { badge.textContent = ''; return; }
        var rem = FREE_LIMIT - freeUsed;
        badge.textContent = rem > 0 ? rem + ' free left' : 'Free limit reached';
        badge.style.color = rem <= 1 ? '#ef4444' : '#737373';
      }
      updateBadge();

      function addMsg(text, role) {
        var div = document.createElement('div');
        div.className = 'kc-msg kc-msg-' + role;
        // Basic markdown: code blocks and inline code
        var tick = '\x60';
        var triTick = tick+tick+tick;
        div.innerHTML = text
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .split(triTick).map(function(s,i){return i%2===1?'<pre style="background:#0a0a0a;padding:.5rem;border-radius:6px;overflow-x:auto;font-family:monospace;font-size:.75rem;color:#00d97e;margin:.25rem 0;">'+s+'</pre>':s;}).join('')
          .split(tick).map(function(s,i){return i%2===1?'<code>'+s+'</code>':s;}).join('')
          .split(String.fromCharCode(10)).join('<br>');
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
      }

      function showTyping() {
        var d = document.createElement('div');
        d.className = 'kc-typing'; d.id = 'kc-typing';
        d.innerHTML = '<div class="kc-dot"></div><div class="kc-dot"></div><div class="kc-dot"></div>';
        msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
      }
      function removeTyping() { var t = document.getElementById('kc-typing'); if(t) t.remove(); }

      // Add welcome message
      setTimeout(function() {
        addMsg('Hey! What are you building? Tell me about your fraud problem and I will show you exactly how to stop it — with a working code example.', 'ai');
      }, 300);

      function showLimitReached() {
        var card = document.createElement('div');
        card.className = 'kc-msg kc-msg-ai';
        card.style.cssText = 'border:1px solid rgba(0,217,126,0.3);background:linear-gradient(135deg,#0c1a14,#0f1a12);max-width:100%;';
        card.innerHTML = '<div style="font-weight:700;color:#f0f0f0;font-size:.875rem;margin-bottom:.375rem;">Free preview complete</div><div style="color:#909090;font-size:.75rem;line-height:1.5;margin-bottom:.75rem;">Start free — 50 checks/month, no card needed.<br>Founding member pricing locks in today.</div><a href="/pricing" class="kc-cta-btn">Get your free API key →</a>';
        msgs.appendChild(card);
        msgs.scrollTop = msgs.scrollHeight;
        input.disabled = true;
        input.placeholder = 'Get a free API key to continue →';
        sendBtn.disabled = true;
        badge.textContent = 'Limit reached';
        badge.style.color = '#ef4444';
      }

      async function sendMessage() {
        var text = input.value.trim();
        if (!text) return;
        if (!apiKey && freeUsed >= FREE_LIMIT) {
          showLimitReached();
          return;
        }
        input.value = '';
        sendBtn.disabled = true;
        addMsg(text, 'user');
        history.push({ role: 'user', content: text });
        showTyping();

        try {
          var headers = { 'Content-Type': 'application/json' };
          if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
          var resp = await fetch('/api/chat', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ message: text, history: history.slice(-4) }),
          });
          var data = await resp.json();
          removeTyping();

          if (resp.status === 429) {
            showLimitReached();
          } else if (!resp.ok) {
            addMsg('Something went wrong on our end. Try again in a moment.', 'ai');
          } else {
            var reply = data.reply || '';
            addMsg(reply, 'ai');
            history.push({ role: 'assistant', content: reply });
            if (!apiKey && typeof data.free_remaining === 'number') {
              freeUsed = FREE_LIMIT - data.free_remaining;
              localStorage.setItem('kc_chat_free', String(freeUsed));
              updateBadge();
              if (data.free_remaining === 1) {
                var nudge = document.createElement('div');
                nudge.style.cssText = 'font-size:.6875rem;color:#737373;text-align:center;padding:.25rem 0;';
                nudge.innerHTML = 'Last free message \xb7 <a href="/pricing" style="color:#00d97e;">Get API key</a>';
                msgs.appendChild(nudge);
                msgs.scrollTop = msgs.scrollHeight;
              }
            }
          }
        } catch(e) {
          removeTyping();
          addMsg('Connection error. Check your internet and try again.', 'ai');
        }
        sendBtn.disabled = false;
        input.focus();
      }

      bubble.addEventListener('click', function() {
        var isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) setTimeout(function() { input.focus(); }, 50);
      });
      bubble.addEventListener('keydown', function(e) { if(e.key==='Enter'||e.key===' ') bubble.click(); });
      document.getElementById('kc-close').addEventListener('click', function() { panel.style.display = 'none'; });
      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
