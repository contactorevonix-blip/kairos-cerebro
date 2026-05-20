# Kairos Check — Design Reference

> Documento vivo. Actualiza sempre que houver decisão de design.

---

## Identidade Visual

**Marca externa:** Kairos Check (apenas este nome — sem sufixos)
**Domínio:** kairoscheck.net
**Posicionamento:** OSINT-first fraud API para indie devs e solo founders
**Tom:** Directo, técnico, sem marketing vazio. Fala como developer para developer.

---

## Sistema de Cores

```css
:root {
  --bg:           #060606;  /* fundo da página */
  --surface:      #0f0f0f;  /* fundo dos cards */
  --surface-2:    #161616;  /* fundo de elementos elevados */
  --border:       rgba(255,255,255,0.07);   /* bordas normais */
  --border-strong:rgba(255,255,255,0.11);   /* bordas em destaque */

  --text:         #f0f0f0;  /* texto principal */
  --text-secondary:#909090; /* texto secundário */
  --text-tertiary: #555555; /* texto terciário / placeholders */

  --accent:       #00d97e;  /* verde KAIROS — cor principal de acção */
  --accent-hover: #00b369;  /* verde hover */
  --accent-dim:   rgba(0,217,126,0.08);   /* fundo de badges accent */
  --accent-border:rgba(0,217,126,0.25);   /* bordas accent */
  --accent-glow:  rgba(0,217,126,0.12);   /* glow/shadow accent */

  --danger:  #ef4444;  /* vermelho — BLOCK verdict */
  --warning: #f59e0b;  /* amarelo — REVIEW verdict */
}
```

---

## Tipografia

**Fontes:** Inter (sans) + JetBrains Mono (código)
**CDN:** Bunny.net — NUNCA Google Fonts (privacidade)
**Pesos carregados:** 400, 500, 600, 700, 800

| Elemento | Tamanho | Peso | Letter-spacing |
|---|---|---|---|
| H1 hero | clamp(2.75rem, 7vw, 5.25rem) | 800 | -0.045em |
| H2 secções | clamp(1.75rem, 4vw, 2.75rem) | 800 | -0.035em |
| Corpo | 1rem | 400 | 0 |
| Corpo secundário | 0.875rem | 400 | 0 |
| Label/kicker | 0.75rem | 600 | 0.08em + uppercase |
| Código | JetBrains Mono 0.8125rem | 400 | 0 |

---

## Logo

SVG inline no nav — escudo com K:
```html
<svg width="20" height="22" viewBox="0 0 20 22" fill="none">
  <path d="M10 1L1 4.5V10.5C1 15.7 5.2 19.7 10 21C14.8 19.7 19 15.7 19 10.5V4.5Z" fill="#00d97e"/>
  <path d="M7 7.5V14.5M7 11H10.5M10.5 11L13 7.5M10.5 11L13 14.5" stroke="#0a0a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## Padrões Visuais Premium

### Orbs de fundo (OBRIGATÓRIOS no hero)
```css
.orb-1 { /* verde grande top-left */
  width:900px; height:900px; border-radius:50%;
  background: radial-gradient(circle, rgba(0,217,126,0.2) 0%, transparent 70%);
  filter: blur(60px);
  animation: orb-drift 20s ease-in-out infinite alternate;
}
```

### Grid de fundo (hero)
```css
background-image:
  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
background-size: 48px 48px;
mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%);
```

### Gradiente no texto
```css
.gradient-text {
  background: linear-gradient(135deg, #ffffff 20%, #00d97e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Cards premium (SEM backdrop-filter — performance)
```css
.card {
  background: var(--surface);           /* #0f0f0f — NUNCA rgba < 0.05 em fundo escuro */
  border: 1px solid var(--border);      /* rgba(255,255,255,0.07) */
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset;
}
```

### Card featured (pricing Pro)
```css
.card-featured {
  border: 1px solid rgba(0,217,126,0.35);
  background: linear-gradient(180deg, rgba(0,217,126,0.05) 0%, var(--surface) 35%);
  box-shadow: 0 0 0 1px rgba(0,217,126,0.15), 0 8px 32px rgba(0,217,126,0.1);
  transform: scale(1.025);
}
```

### Botão primário com shimmer
```css
.btn-primary {
  background: var(--accent); color: #000; font-weight: 700;
  border-radius: 8px; overflow: hidden; position: relative;
  transition: background 150ms, transform 150ms, box-shadow 150ms;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0,217,126,0.3);
}
.btn-primary::after { /* shimmer */
  content:''; position:absolute; top:-50%; left:-75%;
  width:50%; height:200%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg); transition: left 500ms ease;
}
.btn-primary:hover::after { left: 150%; }
```

### Tilt em cards (JS)
```javascript
// Max 12/8 graus, sem scale (scale parece zoom, não tilt)
var rY = ((x - cx) / cx) * 12;
var rX = ((y - cy) / cy) * -8;
card.style.transform = 'perspective(900px) rotateX('+rX+'deg) rotateY('+rY+'deg)';
// NUNCA ter transform no CSS :hover quando usas JS tilt — conflito garantido
```

---

## Regras de Performance (NUNCA violar)

1. `backdrop-filter` apenas no **nav** — nenhum card, nunca
2. `will-change` apenas no hover, nunca always-on
3. Fontes: preload apenas Inter para hero, resto lazy
4. Total página: < 50KB HTML+CSS, < 100KB JS
5. Imagens: zero imagens externas — tudo SVG inline ou CSS

---

## Estrutura da Landing Page (ordem)

```
1. Nav          — logo SVG + links + CTA "Get API key"
2. Hero         — orbs + grid + H1 + CTAs + social proof + demo
3. How it works — 3 terminais macOS com STEP 01/02/03 + setas
4. Gets smarter — SVG rede + 3 cards (reputation, DNA, GDPR)
5. Comparison   — tabela vs Stripe Radar
6. Integration  — tabs JS/Python/cURL/PHP com copy
7. Trust        — números + badges compliance
8. Pricing      — Free/Starter/Pro(featured)/Scale
9. Final CTA    — "Start protecting your revenue today"
10. FAQ         — 5 perguntas + acordeão
11. Footer      — logo + tagline + links
```

---

## Anti-padrões (auto-rejeitar)

- `backdrop-filter` em cards — mata performance
- `rgba(0.03)` em fundo escuro — cards invisíveis
- Emojis como ícones — usar SVG com cor accent
- `!important` fora do reset
- Imagens externas (stock photos, etc.)
- Texto "AI-powered" / "Revolutionary" / "Cutting-edge"
- Contadores de 0 visíveis — esconder quando rawCount = 0
- `max-width` sem `margin: 0 auto` — cria desalinhamento
- CSS hover com `transform` em cards que têm JS tilt — conflito

---

## Referências de Design

| Site | O que replicar |
|---|---|
| vercel.com | H1 enorme + peso 800, fundo #000, hero centrado, product screenshot 3D |
| linear.app | Grid de fundo, scroll animations, cards minimalistas |
| stripe.com | Featured pricing card, tabela de comparação, confiança visual |
| anthropic.com | Orbs de cor, tipografia limpa, espaçamento generoso |
| raycast.com | Feature cards com ícones, glassmorphism nas secções certas |

**Nota:** WebFetch só vê HTML — não renderiza CSS. Para clonar um site preciso que Pedro descreva verbalmente ou partilhe screenshot.
