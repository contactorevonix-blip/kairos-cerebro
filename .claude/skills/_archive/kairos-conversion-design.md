---
name: kairos-conversion-design
description: High-conversion design patterns for kairoscheck.net. Encodes billionaire-company UX psychology for SaaS landing pages, pricing, and onboarding.
---

# Kairos Check — Conversion Design Skill

Activate for: landing page, pricing page, any page where the goal is to convert visitors into paying customers.
Works together with kairos-design-system (which handles visual tokens and constraints).

## The One Law of Conversion
**The visitor asks three questions in 3 seconds:**
1. "What is this?" (clarity)
2. "Is this for me?" (relevance)
3. "Can I trust them?" (credibility)

If any answer is unclear, they leave. Design solves all three simultaneously.

## Hero Section Formula (always in this order)
1. **Kicker** — tiny label that sets context: "Fraud detection API · Self-serve · GDPR-native"
2. **H1 — the promise** — specific, outcome-focused, <12 words. NOT features, OUTCOMES.
   - WRONG: "AI-powered fraud detection platform"
   - RIGHT: "Stop fraud before it costs you money"
3. **Subheadline** — who it's for + how it works in 1-2 lines
4. **Live demo** — let them try BEFORE they pay (trust builder #1)
5. **Primary CTA** — one button, benefit-framed: "Start free — no card needed"
6. **Social proof micro-copy** — "Join X developers already using Kairos Check"
7. **Trust icons** — GDPR · Zero external deps · <200ms

## Pricing Psychology (anchoring method)
Structure to make Pro (€79) feel like the obvious rational choice:

| Free | Starter €29 | **Pro €79 ← HIGHLIGHT** | Scale €199 |
|---|---|---|---|
| Limited bait | Entry point | Best value (most features/€) | "I need more" |

Rules:
- Pro card: border accent color, "Most Popular" badge, slightly larger
- Free tier exists ONLY to get them in the funnel — don't make it too good
- Scale tier anchors Pro as "reasonable" — €199 makes €79 feel cheap
- Never list "unlimited" on Pro if Scale has a real limit — be specific
- Show annual toggle (20% off) — increases ACV and commitment

## Social Proof — Early Stage (no testimonials yet)
When you have no reviews, use operational proof:
- Live counter: "X domains scored · Y threats blocked this week"
- Technical credibility: "GDPR Art. 5(1)(c) compliant · Zero external API calls"
- Process proof: "OSINT sources · No ML black box · Explainable scores"
- Specificity beats vague: "138ms average response" > "blazing fast"

## Trust Signals Placement
- **Above fold:** GDPR badge + "No credit card" + "Cancel anytime"
- **Near pricing:** refund policy or "pay after you see it works"
- **Near CTA:** "2-minute setup · Works with any language · REST API"
- **Footer:** Privacy policy + Terms (linked, not hidden)

## CTA Copy Rules
- Primary: verb + benefit. "Get API Key" > "Sign up" > "Start now"
- Secondary: reduce commitment. "See how it works →" (no register needed)
- Never: "Submit", "Click here", "Learn more" (vague, passive)
- Always: one primary CTA per page section. More = paralysis.

## Typography for Conversion
- H1: font-weight 700, line-height 1.05, letter-spacing -0.03em
- Subheadline: font-weight 400, color var(--text-secondary), line-height 1.5
- Feature titles: font-weight 600, no ALL CAPS
- Body: font-weight 400, line-height 1.65, max 65 chars per line
- Code snippets: monospace, accent color for keys, always syntax-shown

## Code Demo Block (high conversion element)
Always show a real API call. Devs trust code more than marketing copy.

```http
POST https://kairoscheck.net/api/check
x-api-key: kc_live_xxxxxxxxxxxx
Content-Type: application/json

{ "domain": "suspicious-shop.xyz" }
```
```json
{
  "verdict": "BLOCK",
  "score": 94,
  "signals": ["newly_registered", "no_ssl", "phishing_pattern"],
  "latencyMs": 138
}
```

## Visual Hierarchy for Scanning
Users scan in F-pattern. Place in order:
1. Logo top-left (brand anchor)
2. Primary CTA top-right (always visible)
3. H1 centre-left (the promise)
4. Demo/screenshot centre (proof)
5. Features below fold (for the convinced ones)
6. Pricing below features (closing the sale)

## What Kills Conversion (never do)
- Hero image of hands on laptop / diverse team
- "Revolutionary", "Cutting-edge", "Best-in-class" (empty adjectives)
- More than 2 CTAs above fold
- Pricing hidden behind "contact us"
- Long feature lists without outcome framing
- Auto-play anything
- Cookie banner that blocks content
- Registration before demo

## Logo/Brand Mark
The Kairos Check logotype should:
- Be SVG inline (no image request, no flash on load)
- Use the letter K stylized or a shield/check mark (trust + security)
- Accent color (--accent: #00d97e) for the mark, white for the wordmark
- Max 32px height in nav, scales for hero use
- Work in monochrome (for when printed or favicon)

## Section Order for Maximum Conversion
1. Nav (logo + links + CTA)
2. Hero (promise + demo + CTA)
3. Social proof bar (live numbers)
4. How it works (3 steps, no jargon)
5. Features (outcomes, not specs)
6. Pricing (anchored, Pro highlighted)
7. Trust / FAQ (objection handling)
8. Final CTA (repeat the promise)
9. Footer

## Performance = Conversion
Every 100ms delay = 1% conversion drop (Google data).
- Inline critical CSS
- Defer non-critical scripts
- Preload hero font only
- No web fonts >100KB
- Compress all images (target: landing page <50KB total HTML+CSS)
