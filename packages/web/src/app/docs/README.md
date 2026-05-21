# KairosCheck Documentation & Playground

## Estrutura

```
docs/
├── layout.tsx                # Sidebar + main navigation
├── page.tsx                  # API Reference (main entry point)
├── playground/
│   └── page.tsx              # Interactive API playground
├── signals/
│   └── page.tsx              # Risk signals documentation
├── examples/
│   └── page.tsx              # Code examples (10+ languages/frameworks)
└── rate-limits/
    └── page.tsx              # Pricing, quotas, rate limiting
```

## Páginas Criadas

### 1. **API Reference** (`/docs`)
- Main documentation page
- Quick links to all resources
- Authentication guide
- POST /v1/check endpoint documentation
- Request/response examples
- Risk bands explanation
- HTTP status codes

### 2. **Playground** (`/docs/playground`)
- **Interactive API tester** (no login required)
- Live input fields: email, domain, IP
- Real-time simulation of fraud scores
- Response visualization with animations
- Code examples in 4 languages (curl, JavaScript, Python, Go)
- Demo data with realistic patterns
- Execution time simulation

### 3. **Risk Signals** (`/docs/signals`)
- Complete signal documentation with weights
- 6 categories: Email, IP/Network, Documents, Phone, Behavioral, Geolocation
- ~30 signals with:
  - Weight (points toward score)
  - Severity level (critical/high/medium/low)
  - Description
  - Key indicators
- Expandable accordion UI
- Category filtering
- Score calculation example

### 4. **Code Examples** (`/docs/examples`)
- 10 language/framework combinations:
  - JavaScript (SDK + fetch)
  - React / Next.js (Server Actions)
  - Python (requests + Django)
  - Go (SDK + net/http)
  - cURL + Bash script
- Copy-to-clipboard functionality
- Error handling best practices
- Rate limits by plan

### 5. **Rate Limits & Pricing** (`/docs/rate-limits`)
- 3 pricing tiers: Starter ($0), Professional ($99), Enterprise (custom)
- Rate limiting strategy (token bucket algorithm)
- Response headers documentation (X-RateLimit-*, X-Quota-*, Retry-After)
- Error responses (429, 400, 401, 503)
- Best practices section

## Componentes Chave

### Navigation (layout.tsx)
- Responsive sidebar (hidden on mobile)
- Grouped documentation sections
- Active page highlighting
- Mobile hamburger menu

### Interactive Playground
- Framer Motion animations
- Real-time score calculation (simulated)
- Demo domain patterns:
  - paypal.com → score 8 (safe)
  - stripe.com → score 5 (safe)
  - suspect-store.tk → score 78 (high risk)
  - totally-not-phishing.xyz → score 92 (critical)
  - new-marketplace.co → score 45 (medium)

### Design System Integration
- Uses KairosCheck design tokens (OKLCH colors)
- Consistent with `--kc-*` CSS variables
- Dark theme throughout
- Risk-band color coding:
  - Green: Safe (0-50)
  - Amber: Medium (51-70)
  - Red: High/Critical (71-100)

## Features Implemented

✅ **Complete API Documentation** — All endpoints, parameters, responses
✅ **Interactive Playground** — Test without authentication
✅ **Code Examples** — 10+ language combinations
✅ **Signal Reference** — All 30 fraud detection signals documented
✅ **Pricing & Quotas** — Rate limiting, plans, best practices
✅ **Responsive Design** — Mobile-friendly navigation and layout
✅ **Animations** — Framer Motion for smooth transitions
✅ **Copy-to-Clipboard** — Easy code sharing
✅ **Dark Theme** — Full OKLCH color system integration
✅ **Status Codes** — HTTP error responses explained
✅ **SEO Metadata** — Title + description for each page

## URLs

- `/docs` — Main API reference
- `/docs/playground` — Interactive tester
- `/docs/signals` — Risk signals reference
- `/docs/examples` — Code examples
- `/docs/rate-limits` — Pricing & rate limits

## Next Steps (Passo 5 - Implementação)

1. **Connect Playground to Real API** — Replace simulated responses with actual API calls
2. **Add Authentication Modal** — Optional login to test with personal API key
3. **Add Copy Response** — Allow copying entire JSON responses
4. **Add Webhooks Docs** — If applicable
5. **Add Changelog** — API version history

## Styling Notes

All pages use inline React styles with KairosCheck design tokens:
- Background: `var(--kc-bg-*)` (base, surface, elevated)
- Text: `var(--kc-text-*)` (primary, secondary, muted)
- Borders: `var(--kc-border-*)`
- Accent: `var(--kc-accent)` (blue)
- Status colors: `var(--kc-success)`, `var(--kc-warning)`, `var(--kc-danger)`

These tokens must be defined in `globals.css` as per the OPERATIONAL_SYSTEM_COMPLETE spec.
