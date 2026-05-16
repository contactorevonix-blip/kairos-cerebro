# UX Design Expert Memory (Uma) — KAIROS Elite

## Brand Identity (Imutável — não alterar sem Pedro)
- Nome externo: **Kairos Check** (só este — sem sufixos)
- Operador: anónimo — sem foto, sem nome real público
- Domínio: kairoscheck.net
- Posicionamento: OSINT-first · GDPR-native · Zero external deps

## Design Tokens REAIS (source of truth — usar SEMPRE estes)
```css
--bg: #0a0a0a           /* fundo principal */
--surface: #111111      /* cards, nav */
--surface-2: #1a1a1a    /* inputs, code blocks */
--border: #1f1f1f
--border-strong: #2a2a2a
--text: #f5f5f5
--text-secondary: #a3a3a3
--text-tertiary: #737373
--accent: #00d97e       /* verde Kairos — CTAs, links, scores */
--accent-hover: #00b369
--danger: #ef4444       /* BLOCK verdict */
--warning: #f59e0b      /* REVIEW verdict */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-mono: 'JetBrains Mono', ui-monospace, monospace
```

ATENÇÃO: O ficheiro ux-design-expert.md tem tokens ERRADOS (azul/cyan).
Os tokens acima são os únicos correctos.

## Favicon (decisão final — não mudar)
Escudo verde (#00d97e) + K branco bold
Implementado como SVG vectorial (path + polygon, não text element)

## Regra Crítica — JS Syntax Gate
Qualquer alteração a CSS/HTML em landing-page.js:
→ Dex corre JS Syntax Gate antes de commitar
→ Sem excepções

## Padrão de Conversão (cada página deve ter)
1. **Hero**: proposta de valor em <7 palavras
2. **Social proof**: acima do fold
3. **CTA**: verde, impossível de ignorar, texto de acção
4. **Trust signals**: sempre visíveis (no contract, cancel anytime)
5. **Fricção zero**: checkout em <2 cliques

## Landing Actual — Estado (não alterar sem razão forte)
✅ Hero + orbs calibrados (opacidades 2-3x aumentadas)
✅ Activity feed + counter server-side (/api/stats/counter)
✅ Testimonials + urgency strip (ROI calc)
✅ How it works — 3 terminais macOS conectados
✅ Pricing: Pro featured, toggle anual/mensal
✅ Compare: Stripe Radar, Sift, SEON, Maxmind
✅ FAQ (5 perguntas)
✅ Schema.org correcto (SoftwareApplication + Offer)

## Pricing Page — Estado Actual
Ordem correcta: Free → Starter (€29) → Growth (€59) → Pro (€99, featured) → Scale (€249)
Pro é "Most Popular" e tem CTA primário verde.

## Princípio de Elite
"Se a Stripe ou a Linear vissem este ecrã, sentiriam inveja?
Se não — refaz. Sem desculpas."

## Design Conventions
- Atomic Design: átomos → moléculas → organismos → páginas
- WCAG 2.1 AA compliance target
- Dark theme only — sem light mode
- NEVER push — delegate to @devops

## Promotion Candidates

## Archived
