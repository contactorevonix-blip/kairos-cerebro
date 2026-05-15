# Kairos Check — Conversion Design Intelligence

## The Designer's Mindset for KAIROS

Every pixel either builds trust or loses a customer.
The ICP is a developer with €500–€2000 budget. They scan fast, trust code over words, and leave if anything feels cheap.

## The 5-Second Test (every change must pass this)

A new visitor lands on the hero. In 5 seconds they must feel:
1. "This is serious software" (not a side project)
2. "I understand what this does" (clarity)
3. "The price seems reasonable for what it offers" (value signal)
4. "I could integrate this today" (low friction)

If a design change doesn't serve one of these 4 feelings, it's noise.

## Visual Weight Hierarchy (must respect always)

```
HIGHEST weight → H1 headline (the promise)
                → Price numbers (the commitment)
                → CTA button (the action)
                → Featured card (the recommendation)

MEDIUM weight  → Section H2 titles
                → Social proof numbers
                → Code blocks (developer credibility)

LOW weight     → Body text
                → Labels / kickers
                → Trust badges

LOWEST weight  → Dividers, borders, background elements
```

**Rule:** If two elements have similar visual weight, one of them is wrong.

## Typography Scale that Converts

```
H1 hero:        clamp(2.75rem, 7vw, 5.25rem) / weight 800 / tracking -0.045em / lh 1.05
H2 sections:    clamp(1.75rem, 4vw, 2.75rem) / weight 800 / tracking -0.035em / lh 1.1
Price numbers:  clamp(2.25rem, 4vw, 3rem)    / weight 800 / tracking -0.045em
Stats/trust:    2.5rem                        / weight 800 / tracking -0.045em
Hero subline:   1.1875rem                     / weight 400 / color #b0b0b0
Body:           1rem                          / weight 400 / color #909090
Labels:         0.75rem / weight 600 / uppercase / tracking 0.08em
```

## Section Rhythm (premium pacing)

```
Section padding:  7rem 0  (112px — Vercel/Linear standard)
Hero padding:     6rem 0 5rem
Container max:    1100px with 1.5rem horizontal padding
```

## What Makes a Card "Cheap" vs "Premium"

CHEAP:
- Same padding as everything else (1rem)
- No visual separation (same bg as page)
- Font weights identical to surrounding text
- Borders that match the content color

PREMIUM:
- Padding signals price tier (€29 card = 2.25rem, €79 card = 2.5rem)
- Subtle surface elevation (var(--surface) = #0f0f0f on #060606 bg)
- White-opacity borders: rgba(255,255,255,0.07) — modern, not dated
- The featured card breaks the grid (scale 1.035, accent border, glow)

## Gradient Text Strategy

Use gradient-text SPARINGLY — one word per headline maximum.
- Hero H1: last word or emotional word  ("customer", "today", "fraud")
- Section H2: the most important concept ("30 minutes", "customer", "pricing")
- NEVER: body text, labels, buttons
- The gradient is branding reinforcement, not decoration

## Conversion Moments (where visitors decide)

1. **Above fold (0–3 seconds):** H1 + hero subline + CTA button
   - If unclear → they leave. No second chance.
   - Fix: Use outcome language. "Stop fraud" not "Fraud detection API"

2. **Scroll position 1 (How it works):** the feasibility check
   - Developer asks: "Can I actually integrate this?"
   - Fix: Show real code, real response. Steps must feel achievable.

3. **Scroll position 2 (Gets smarter):** the moat check
   - Developer asks: "Why this and not building my own?"
   - Fix: Network effect, collective intelligence = data moat they can't replicate

4. **Scroll position 3 (Pricing):** the ROI check
   - Developer asks: "Is €79/month worth it?"
   - Fix: "One chargeback avoided pays for months" — say it explicitly near the price

5. **Bottom of page:** the final push
   - Developer asks: "Is this the right moment to start?"
   - Fix: Final CTA section with urgency + trust (no contract, 14-day refund)

## Objection Handling by Design

| Objection | Design Solution |
|---|---|
| "Too expensive" | Anchor with Scale (€199) — makes Pro (€79) feel cheap |
| "Complicated to integrate" | Code in How it Works + 10-line integration examples |
| "I'll lose my data" | GDPR badge + "EU-hosted · Zero PII stored in plaintext" |
| "What if I don't like it" | "14-day money back · Cancel anytime" near every CTA |
| "Is this a real product?" | Live demo that actually works + real latency numbers |
| "Better to build my own" | Gets smarter section — 10K clients = 10K fraud patterns |

## Performance vs Visual Impact (always evaluate)

Before adding any visual effect, ask:
- `backdrop-filter:blur` → NEVER on cards. Only nav.
- `box-shadow` → Free on cards (GPU compositing only on repaint)
- CSS animations → Free if on separate layer (transform/opacity only)
- `filter:blur` on orbs → Expensive. Use sparingly (max 3 orbs total)
- `will-change:transform` → Only on :hover, never always-on

## The Vercel Design Language (what we replicate)

1. True dark background — but not pure black (#060606)
2. Massive, bold headlines (weight 800, tight tracking)
3. ONE accent color throughout — we use #00d97e exclusively
4. Product screenshot/code in 3D perspective in hero
5. Subtle grid lines fading at the bottom (CSS background-image)
6. Gradient text on ONE word in each key headline
7. Generous vertical rhythm (7rem between sections)
8. Nav bar with backdrop-filter blur (glass effect)
9. Featured pricing card clearly breaks the grid
10. Final CTA section with gradient glow from below
