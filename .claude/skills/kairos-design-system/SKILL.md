# Kairos Check — Design System Skill

Activate whenever the task involves: HTML pages, CSS styling, landing 
pages, /pricing, /success, /docs, /privacy, /terms, /check/[domain] 
SEO pages, or any user-facing UI for kairoscheck.net.

## Stack constraints (NON-NEGOTIABLE)
- Pure HTML, CSS, vanilla JS only.
- Zero React, Vue, Svelte, or framework.
- Zero build step.
- Zero npm deps in rendered output (CDN OK for fonts).
- Total page weight: <50KB HTML+CSS, <100KB JS, fonts <100KB.
- Lighthouse target: 100/100/100/100.

## Design philosophy
**Goal:** Every page must feel like it was built by a $100M company, not a solo dev.
Inspired by: Linear, Vercel, Stripe, Anthropic/Claude, Railway, Raycast.
Anti-pattern: anything that looks "AI-generated SaaS template", Bootstrap, Tailwind defaults.

Principles:
1. Whitespace is a feature. When in doubt, add more.
2. One sans-serif + one mono. No more.
3. Monochromatic + ONE accent color. Maximum.
4. Typography hierarchy IS the design. Size difference = importance.
5. Animation must serve a purpose. Hover: yes. Auto-play: never.
6. The CTA is always the most visually prominent element on screen.
7. Mobile-first (360px). Desktop is an enhancement.
8. Every visible number must be real. Never fake social proof.

## Color tokens
:root {
  --bg: #0a0a0a; --surface: #111111; --surface-2: #1a1a1a;
  --border: #1f1f1f; --border-strong: #2a2a2a;
  --text: #f5f5f5; --text-secondary: #a3a3a3; --text-tertiary: #737373;
  --accent: #00d97e; --accent-hover: #00b369; --accent-dim: rgba(0,217,126,0.08);
  --accent-border: rgba(0,217,126,0.25); --accent-glow: rgba(0,217,126,0.12);
  --danger: #ef4444; --warning: #f59e0b; --success: var(--accent);
}

## Typography
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem;
  --text-3xl: 3.5rem; --text-4xl: 4.5rem;
  --lh-tight: 1.05; --lh-snug: 1.3; --lh-normal: 1.65;
  --tracking-tight: -0.03em; --tracking-tighter: -0.04em;
}
Self-host via Bunny.net CDN. NEVER Google Fonts (privacy).

## Spacing scale (4px base)
--space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
--space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
--space-12: 3rem; --space-16: 4rem; --space-24: 6rem; --space-32: 8rem;

---

## Premium Visual Patterns (USE THESE — they create the "billionaire feel")

### 1. Grid Background (like Linear.app)
```css
.hero { position: relative; }
.hero::after {
  content: '';
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
  pointer-events: none;
}
.hero .container { position: relative; z-index: 1; }
```

### 2. Gradient Text (for key words in headlines)
```css
.gradient-text {
  background: linear-gradient(135deg, #ffffff 30%, #00d97e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 3. Featured Card Glow (like Stripe pricing)
```css
.card-featured {
  border: 1px solid var(--accent-border);
  box-shadow:
    0 0 0 1px var(--accent-border),
    0 4px 24px var(--accent-glow),
    0 1px 2px rgba(0,0,0,0.5);
  background: linear-gradient(180deg, rgba(0,217,126,0.04) 0%, transparent 40%);
}
```

### 4. Button Shimmer Effect
```css
.btn-primary {
  position: relative; overflow: hidden;
  background: var(--accent); color: #000;
  font-weight: 600; border-radius: 8px;
  transition: background 150ms, transform 150ms, box-shadow 150ms;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,217,126,0.25);
}
.btn-primary::after {
  content: '';
  position: absolute; top: -50%; left: -75%;
  width: 50%; height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transform: skewX(-20deg);
  transition: left 500ms ease;
}
.btn-primary:hover::after { left: 150%; }
```

### 5. Animated Live Dot
```css
.live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent);
  animation: live-pulse 2s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,217,126,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 5px rgba(0,217,126,0); }
}
```

### 6. Scroll Fade-In (no JS — CSS only)
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fade-up 0.5s ease-out both;
}
.animate-in:nth-child(2) { animation-delay: 0.1s; }
.animate-in:nth-child(3) { animation-delay: 0.2s; }
```

### 7. Number Counter (CSS trick for live feel)
Show numbers large, in monospace, with accent color for emphasis:
```html
<span class="stat-number">127</span>
<span class="stat-label">domains scored today</span>
```
```css
.stat-number { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-2xl); font-weight: 600; color: var(--text); }
.stat-label { font-size: var(--text-xs); color: var(--text-tertiary); }
```

### 8. Section Divider (horizontal rule with fade)
```css
.section-divider {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
  margin: 0;
}
```

### 9. Code Block (premium terminal look)
```css
.code-block {
  background: #0d0d0d;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset;
}
.code-header {
  background: #161616;
  border-bottom: 1px solid var(--border);
  padding: 0.625rem 1rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.traffic-dot { width: 10px; height: 10px; border-radius: 50%; }
.traffic-dot.red   { background: #ff5f57; }
.traffic-dot.amber { background: #ffbd2e; }
.traffic-dot.green { background: #28c840; }
```

### 10. Trust Badge Row
```css
.trust-row {
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  align-items: center;
}
.trust-pill {
  display: inline-flex; align-items: center; gap: 0.375rem;
  background: var(--surface); border: 1px solid var(--border-strong);
  border-radius: 999px; padding: 0.3rem 0.75rem;
  font-size: var(--text-xs); color: var(--text-secondary);
  white-space: nowrap;
}
.trust-pill svg { color: var(--accent); flex-shrink: 0; }
```

### 11. Gradient Orbs — Background depth (like Anthropic, Vercel, Claude.ai)
ALWAYS add orbs to hero sections. This is what makes sites look "premium" and "3D".
Multiple large blurred radial gradients create depth without any images.

```css
/* Orb container — sits behind everything */
.hero-orbs {
  position: absolute; inset: 0; overflow: hidden;
  pointer-events: none; z-index: 0;
}
/* Large primary orb — top left, brand colour */
.orb-1 {
  position: absolute;
  width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0,217,126,0.18) 0%, transparent 65%);
  top: -400px; left: -200px;
  filter: blur(80px);
  animation: orb-drift 18s ease-in-out infinite alternate;
}
/* Secondary orb — right side, cooler tone */
.orb-2 {
  position: absolute;
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0,140,255,0.09) 0%, transparent 65%);
  top: -100px; right: -150px;
  filter: blur(100px);
  animation: orb-drift 22s ease-in-out infinite alternate-reverse;
}
/* Accent orb — bottom centre */
.orb-3 {
  position: absolute;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0,217,126,0.07) 0%, transparent 65%);
  bottom: -200px; left: 30%;
  filter: blur(90px);
}
@keyframes orb-drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(40px, 30px) scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .orb-1, .orb-2, .orb-3 { animation: none; }
}
```

Usage in HTML:
```html
<section class="hero">
  <div class="hero-orbs" aria-hidden="true">
    <div class="orb-1"></div>
    <div class="orb-2"></div>
    <div class="orb-3"></div>
  </div>
  <div class="container">...</div>
</section>
```

### 12. 3D Perspective Card (like Linear, Vercel product screenshots)
Makes any card/code block look like it's floating in 3D space.
Use for the hero visual element — code block, screenshot, dashboard preview.

```css
.card-3d {
  transform: perspective(1200px) rotateX(6deg) rotateY(-10deg) rotateZ(1deg);
  transform-origin: center center;
  transition: transform 400ms ease;
  box-shadow:
    0 60px 120px -20px rgba(0,0,0,0.7),
    0 30px 60px -15px rgba(0,0,0,0.4),
    0 0 40px rgba(0,217,126,0.08),
    inset 0 1px 0 rgba(255,255,255,0.05);
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
}
.card-3d:hover {
  transform: perspective(1200px) rotateX(3deg) rotateY(-5deg) rotateZ(0.5deg);
}

/* Floating badge / verdict chip that hovers near the 3D card */
.float-badge {
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 0.5rem 0.875rem;
  font-size: var(--text-xs); font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
  animation: float 4s ease-in-out infinite;
  z-index: 2;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
```

### 13. Noise Texture Overlay (grain for depth — like Stripe, Loom)
Adds subtle film grain that makes the design feel more tactile and less flat.

```css
/* Add to :root or body */
body::before {
  content: '';
  position: fixed; inset: 0; z-index: 9999;
  pointer-events: none; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

### 14. Glowing Border (animated) — for premium CTA sections
```css
.glow-border {
  position: relative; border-radius: 12px;
  background: linear-gradient(var(--surface), var(--surface)) padding-box,
              linear-gradient(135deg, rgba(0,217,126,0.5), rgba(0,140,255,0.3), rgba(0,217,126,0.5)) border-box;
  border: 1px solid transparent;
}
```

### CRITICAL RULE — Always add orbs to hero sections
Every hero section MUST have gradient orbs. Without them the page looks flat.
This is NON-OPTIONAL on landing pages, pricing pages, and any hero section.
A page without orbs = a page that doesn't convert.

---

## Hero Section Template (HIGH CONVERSION)
```html
<section class="hero">
  <!-- grid overlay via ::after -->
  <div class="container">
    <!-- 1. Kicker badge -->
    <div class="hero-kicker">
      <span class="live-dot"></span>
      API · Self-serve · GDPR-native
    </div>
    <!-- 2. H1 — max 10 words, outcome-focused -->
    <h1>Stop fraud before it <span class="gradient-text">costs you</span></h1>
    <!-- 3. Subheadline — who + how in 2 lines -->
    <p class="hero-lead">One POST call. OSINT-first. GDPR-native. €29/month.</p>
    <!-- 4. CTAs — primary + ghost -->
    <div class="hero-ctas">
      <a href="/pricing" class="btn-primary">Get API key — free to start →</a>
      <a href="/docs" class="btn-ghost">Read the docs</a>
    </div>
    <!-- 5. Social proof micro-bar -->
    <div class="hero-proof">...</div>
    <!-- 6. Code demo OR screenshot -->
    <div class="hero-demo">...</div>
  </div>
</section>
```

## Pricing Card Template (ANCHORING)
Always show 4 tiers. Make Pro (#3) feel like the only rational choice:
- Free: bait, limited, "Read docs →" ghost button
- Starter: entry, limited checks, solid button
- **Pro: FEATURED — accent border, glow, "Most Popular" badge, scale(1.02), solid button**
- Scale: anchor that makes Pro feel reasonable

```html
<div class="pricing-card featured" aria-label="Most popular plan">
  <div class="pricing-badge">Most Popular</div>
  <div class="pricing-tier">Pro</div>
  <div class="pricing-price">€79<span>/mo</span></div>
  ...
</div>
```

```css
.pricing-card.featured {
  border: 1px solid var(--accent-border);
  background: linear-gradient(180deg, rgba(0,217,126,0.05) 0%, transparent 30%);
  box-shadow: 0 0 0 1px var(--accent-border), 0 8px 32px var(--accent-glow);
  transform: scale(1.02);
  position: relative;
}
.pricing-badge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: #000; font-size: 0.6875rem; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  padding: 0.25rem 0.875rem; border-radius: 0 0 8px 8px;
}
```

---

## Animations (CSS only)
ALLOWED: fade-up on scroll (CSS animation-timeline), hover lift max 2px,
button shimmer on hover, live-pulse dot, fade-in with delay for lists.

FORBIDDEN: parallax, auto-play carousels, particles, animated gradients on loop,
bouncy easing (cubic-bezier overshoot), animations >400ms unless purposeful.

ALWAYS include:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## SEO non-negotiables (every page)
- Semantic HTML (<nav>, <main>, <article>, <section>, <footer>)
- <meta name="viewport" content="width=device-width, initial-scale=1">
- <title> page-specific, max 60 chars
- <meta name="description"> max 155 chars, benefit-focused
- Open Graph: title, description, image (1200x630), url, site_name, type
- <link rel="canonical">
- Schema.org JSON-LD (SoftwareApplication for product, Product for pricing)
- Preload hero font: <link rel="preload" as="font" crossorigin>
- No broken links. No missing alt text.

## Accessibility (WCAG AA — non-negotiable)
- All interactive elements keyboard-navigable
- Color contrast: 4.5:1 body text, 3:1 large text (>18px bold / >24px regular)
- Focus styles: outline: 2px solid var(--accent); outline-offset: 2px
- Skip-to-content link as first focusable element
- Form labels associated with inputs (label[for] or aria-label)
- Icons without text: aria-label or aria-hidden="true" with adjacent text

## Layout Rules — CRITICAL (violations cause alignment bugs)

1. **NEVER** use `style="max-width:Xpx"` without `margin: 0 auto` on centred elements.
   Always use a CSS class with explicit `margin: 0 auto` for centred content.

2. **NEVER** place important UI elements (demo, CTA, form) with inline styles.
   Define a CSS class. Inline styles are allowed ONLY for one-off overrides.

3. **ALWAYS** verify alignment at 3 breakpoints: 1200px, 768px, 375px.
   Left-aligned content on desktop = broken layout. Check in the mental model before shipping.

4. **Demo / interactive elements** MUST:
   - Be max-width centred with `margin: 0 auto`
   - Have the browser-frame treatment (looks like a real product)
   - Have an AI-feel: "processing" state, animated result, verdict badge

5. **Code blocks inside sections** MUST:
   - Use the browser-frame pattern (coloured dots + URL/filename bar)
   - Have a copy-to-clipboard button
   - Use colour syntax highlighting via `<span>` classes

## Anti-patterns (auto-reject, no exceptions)
- Inline styles (only CSS classes)
- !important (only for prefers-reduced-motion)
- <div onclick=""> (use <button> or <a>)
- Hardcoded hex colours (use CSS variables)
- Pixel units for typography (use rem)
- Tailwind classes
- "Powered by AI" badge
- Stock photos of people in offices
- Cookie banners that block content
- Modal popups before 60 seconds
- Fake testimonials or fake user counts
- Vague adjectives: "revolutionary", "cutting-edge", "best-in-class"

## Inspiration sources to study
linear.app — spacing, typography, grid bg
stripe.com/pricing — featured card treatment
anthropic.com — dark theme, professional density
vercel.com — hero section, CTA hierarchy
raycast.com — feature section layout
railway.app — developer-first tone
