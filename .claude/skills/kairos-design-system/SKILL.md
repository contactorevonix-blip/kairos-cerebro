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
Inspired by Linear, Vercel, Stripe, Notion, Railway, Raycast.
Anti-pattern: anything that looks "AI-generated SaaS template".

Principles:
1. Whitespace is a feature.
2. One sans-serif + one mono. No more.
3. Monochromatic + ONE accent color.
4. Typography hierarchy carries weight.
5. Animation must serve a purpose.
6. The CTA is the hero.
7. Mobile-first (works on 360px).

## Color tokens
:root {
  --bg: #0a0a0a; --surface: #111111; --surface-2: #1a1a1a;
  --border: #1f1f1f; --border-strong: #2a2a2a;
  --text: #f5f5f5; --text-secondary: #a3a3a3; --text-tertiary: #737373;
  --accent: #00d97e; --accent-hover: #00b369;
  --danger: #ef4444; --warning: #f59e0b; --success: var(--accent);
}

## Typography
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.5rem; --text-2xl: 2.25rem;
  --text-3xl: 3.5rem;
  --lh-tight: 1.1; --lh-snug: 1.3; --lh-normal: 1.6;
}
Self-host fonts ou Bunny.net CDN. NUNCA Google Fonts (privacy).

## Spacing scale (4px base)
--space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
--space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
--space-12: 3rem; --space-16: 4rem; --space-24: 6rem;

## Animations (CSS only)
ALLOWED: fade-in via animation-timeline, hover lift max 2px,
button states (transform 150ms ease-out), View Transitions API,
skeleton loaders.

FORBIDDEN: parallax, auto-play carousels, particles, animated gradients,
bouncy easing, animations >300ms unless purposeful.

Always:
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

## SEO non-negotiables (every page)
- Semantic HTML (<nav>, <main>, <article>, <aside>, <footer>)
- <meta name="viewport">
- <title> page-specific
- <meta name="description"> max 155 chars
- Open Graph complete (title, description, image, url, site_name)
- <link rel="canonical">
- Schema.org JSON-LD where relevant
- Preload hero font with crossorigin

## Accessibility (WCAG AA)
- alt text meaningful or alt=""
- Color contrast 4.5:1 body, 3:1 large
- Focus states visible
- Skip-to-content link first focusable
- Form labels associated
- ARIA only when semantic HTML insufficient

## Anti-patterns (auto-reject)
Inline styles, !important, <div onclick="">, hex hardcoded,
pixel typography, Tailwind utilities, top progress bar,
"Powered by AI", stock photos diverse-people-office,
huge cookie banners, popups <30s.

## Inspiration
linear.app, vercel.com, stripe.com, notion.so/product, raycast.com,
railway.app, 21st.dev (study, replicate vanilla).

When generating UI, ALWAYS apply this skill silently — do not
announce that you are using it.
