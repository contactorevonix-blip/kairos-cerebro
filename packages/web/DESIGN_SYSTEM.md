# KAIROS Design System

> Premium dark-mode SaaS aesthetic — inspired by Linear, Vercel, Stripe, Resend, Raycast, Notion.
> The interface must feel: **minimal · elegant · futuristic · trustworthy · high-performance**

---

## Visual Direction

KAIROS is the future of digital trust infrastructure. Every pixel communicates:
- Security without paranoia
- Intelligence without complexity
- Premium quality without excess

**Avoid:** generic gradients, bright/saturated colors, rounded cartoon UI, clutter, heavy shadows, template-based patterns.

---

## Typography

| Role | Font | Size | Weight | Tracking |
|------|------|------|--------|----------|
| Hero H1 | Inter | 72–96px | 600 | -0.04em |
| Section H2 | Inter | 48–56px | 600 | -0.03em |
| H3 | Inter | 28–36px | 600 | -0.02em |
| Body | Inter | 16px | 400 | 0 |
| Small | Inter | 14px | 400 | 0 |
| Code | JetBrains Mono | 14px | 400 | 0 |
| Label/Badge | Inter | 12px | 500 | 0.02em |

---

## Color System

### Backgrounds
```
--background:  #000000   (page root)
--surface-1:   #0a0a0b   (elevated panels)
--surface-2:   #111113   (cards)
--surface-3:   #18191b   (inputs, nested)
```

### Text
```
--text-primary:    #ededef   (headings, main body)
--text-secondary:  #a0a2a5   (descriptions, nav)
--text-muted:      #636466   (labels, hints)
--text-disabled:   #4a4b4e
```

### Accent
```
--color-accent:       #3b82f6   (blue — trust, action)
--color-brand-violet: #8b5cf6   (secondary accent)
--color-brand-cyan:   #06b6d4   (data visualization)
--color-brand-emerald:#10b981   (success states)
```

### Borders
```
--border-default: rgba(200,220,255,0.10)   (cards, sections)
--border-subtle:  rgba(200,220,255,0.06)   (nested elements)
--border-strong:  rgba(200,220,255,0.20)   (hover states)
--border-accent:  rgba(59,130,246,0.40)    (focus, active)
```

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Tags, small chips |
| `--radius-lg` | 8px | Inputs, badges |
| `--radius-xl` | 12px | Icon boxes |
| `--radius-2xl` | 16px | Buttons |
| `--radius-3xl` | 24px | Cards, panels |
| `--radius-full` | 9999px | Pills |

---

## Motion Philosophy

**The golden rule:** animations should feel cinematic, not playful.

- Default easing: `cubic-bezier(0.4, 0, 0.2, 1)` — 200ms
- Entrance easing: `cubic-bezier(0.16, 1, 0.3, 1)` — 400–800ms (cinematic)
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` — micro-interactions
- Prefer: `opacity + translateY` — never aggressive scale/rotation
- Duration range: 150ms (micro) → 1200ms (hero shield entrance)

---

## Component Specs

### Primary Button
```css
height: 44px;
padding: 0 20px;
border-radius: 16px; /* --radius-2xl */
border: 1px solid rgba(255,255,255,0.1);
background: linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,1) 100%);
font-weight: 600;
font-size: 14px;
color: #ffffff;
transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
```

### Ghost Button
```css
height: 44px;
padding: 0 20px;
border-radius: 16px;
border: 1px solid rgba(200,220,255,0.1);
background: transparent;
color: #a0a2a5;
transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
/* hover: */ color: #ededef; background: rgba(200,220,255,0.06);
```

### Feature Card
```css
background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%);
border: 1px solid rgba(200,220,255,0.10);
border-radius: 16px;
transition: border-color 0.2s, box-shadow 0.2s;
/* hover: */ border-color: rgba(200,220,255,0.20); box-shadow: 0 0 30px rgba(59,130,246,0.06);
```

### Glassmorphism Nav
```css
background: rgba(0,0,0,0.7);
backdrop-filter: blur(20px) saturate(180%);
border-bottom: 1px solid rgba(200,220,255,0.06);
```

---

## Layout Grid

| Section | Max-width | Padding X | Padding Y |
|---------|-----------|-----------|----------|
| Hero | 1280px | 24px | 160px top, 120px bottom |
| Content | 1024px | 24px | 96px |
| Tight | 768px | 24px | 80px |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 + CSS Custom Properties |
| Motion | Framer Motion |
| 3D | React Three Fiber + Three.js |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Payments | Stripe |
| Deploy | Vercel / Railway |

---

## Product Architecture

### Freemium (B2C)
- 5 chatbot messages/day free
- 3 lookups/day free (IBAN, email, phone, links)
- No signup required for first interaction
- Upsell to token packs or SaaS

### Token Economy
- Tokens purchased via Stripe
- 1 token = 1 lookup or 1 chat message
- Bundle packs: 100 / 500 / 2000 tokens

### SaaS Plans
- Starter — includes tokens + features
- Pro — more tokens + API access + priority
- Enterprise — unlimited + custom SLA + white-label API

### B2B API (flagship)
- REST API for fraud scoring
- IBAN / email / phone / link validation
- Webhook support
- SDK packages (Node, Python)
- Dashboard with usage analytics

### Browser Extension (Sniper)
- One-click lookup from any webpage
- Highlight text → run KAIROS check
- Real-time risk score overlay

---

## Code Quality Rules

- Production-grade only — no placeholder/demo code
- No messy structure — every file has a clear responsibility
- Reusable components — never duplicate UI logic
- Semantic HTML — `<section>`, `<article>`, `<nav>`, `<aside>`
- GPU-friendly animations — `transform` and `opacity` only
- No generic UI patterns — every element is purposeful
- Responsive on all devices — mobile-first
- Accessibility — ARIA labels, keyboard nav, focus rings
- Zero unnecessary dependencies
