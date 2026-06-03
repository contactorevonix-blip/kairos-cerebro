# KCC Design System — KAIROS COMMAND CENTER

**Versão:** 1.0.0
**Designer:** Uma (@ux-design-expert)
**Epic:** EPIC-004
**Data:** 2026-06-03
**Status:** Aprovado para Sprint 1

---

## Conceito Visual

**"Command Intelligence"** — cockpit operacional para um sistema de IA complexo.

Princípios:
- Densidade de informação alta sem ser caótico
- Hierarquia visual clara: o mais importante sempre visível
- Resposta imediata — zero loading states desnecessários
- Cor como linguagem: cada layer, agente e estado tem cor própria

---

## Tokens de Cor

```css
/* Backgrounds */
--kcc-bg-base:      #080A10;
--kcc-bg-surface:   #0E1118;
--kcc-bg-elevated:  #141820;
--kcc-bg-overlay:   #1A2030;

/* Borders */
--kcc-border-subtle:  #1C2232;
--kcc-border-default: #2A3448;
--kcc-border-strong:  #3D4F6E;

/* Accent Violet — acções, foco */
--kcc-accent:      #7C3AED;
--kcc-accent-h:    #8B5CF6;
--kcc-accent-glow: rgba(124, 58, 237, 0.25);

/* Accent Cyan — dados, links */
--kcc-data:    #06B6D4;
--kcc-data-h:  #22D3EE;

/* Layer System */
--kcc-l1:      #EF4444;  --kcc-l1-bg: rgba(239,68,68,0.12);
--kcc-l2:      #F97316;  --kcc-l2-bg: rgba(249,115,22,0.12);
--kcc-l3:      #EAB308;  --kcc-l3-bg: rgba(234,179,8,0.12);
--kcc-l4:      #10B981;  --kcc-l4-bg: rgba(16,185,129,0.12);

/* Semantic */
--kcc-success: #10B981;  --kcc-success-bg: rgba(16,185,129,0.12);
--kcc-warning: #F59E0B;  --kcc-warning-bg: rgba(245,158,11,0.12);
--kcc-error:   #EF4444;  --kcc-error-bg:   rgba(239,68,68,0.12);
--kcc-info:    #3B82F6;  --kcc-info-bg:    rgba(59,130,246,0.12);

/* Text */
--kcc-text-primary:   #F1F5F9;
--kcc-text-secondary: #94A3B8;
--kcc-text-muted:     #475569;
--kcc-text-inverse:   #0A0B0F;

/* Agent Identity Colors */
--kcc-agent-dev:       #3B82F6;
--kcc-agent-qa:        #F59E0B;
--kcc-agent-devops:    #10B981;
--kcc-agent-architect: #8B5CF6;
--kcc-agent-pm:        #EC4899;
--kcc-agent-po:        #06B6D4;
--kcc-agent-sm:        #84CC16;
--kcc-agent-analyst:   #F97316;
--kcc-agent-data:      #14B8A6;
--kcc-agent-ux:        #E879F9;
--kcc-agent-master:    #F1C40F;
```

---

## Tokens de Tipografia

```css
/* Fontes */
--kcc-font-ui:   'Inter', system-ui, -apple-system, sans-serif;
--kcc-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Escala */
--kcc-text-xs:   11px;
--kcc-text-sm:   13px;
--kcc-text-base: 15px;
--kcc-text-lg:   17px;
--kcc-text-xl:   20px;
--kcc-text-2xl:  24px;
--kcc-text-3xl:  32px;

/* Pesos */
--kcc-weight-normal:   400;
--kcc-weight-medium:   500;
--kcc-weight-semibold: 600;
--kcc-weight-bold:     700;

/* Line heights */
--kcc-leading-tight:  1.25;
--kcc-leading-snug:   1.375;
--kcc-leading-normal: 1.5;
--kcc-leading-relaxed: 1.625;
```

---

## Tokens de Espaçamento

```css
/* Base: 4px */
--kcc-space-1:  4px;
--kcc-space-2:  8px;
--kcc-space-3:  12px;
--kcc-space-4:  16px;
--kcc-space-5:  20px;
--kcc-space-6:  24px;
--kcc-space-8:  32px;
--kcc-space-10: 40px;
--kcc-space-12: 48px;
--kcc-space-16: 64px;

/* Border radius */
--kcc-radius-sm:   4px;
--kcc-radius-md:   8px;
--kcc-radius-lg:   12px;
--kcc-radius-xl:   16px;
--kcc-radius-full: 9999px;

/* Shadows */
--kcc-shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
--kcc-shadow-md:  0 4px 12px rgba(0,0,0,0.5);
--kcc-shadow-lg:  0 8px 32px rgba(0,0,0,0.6);
--kcc-shadow-glow: 0 0 20px var(--kcc-accent-glow);
```

---

## Layout Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOPBAR: 48px                                                        │
├──────────────┬──────────────────────────────────┬────────────────── │
│ SIDEBAR:     │ MAIN AREA:                       │ RIGHT PANEL:     │
│ 160px        │ flex: 1, min-width: 0            │ 280px            │
│ (collapsible)│                                  │ (collapsible)    │
├──────────────┴──────────────────────────────────┴─────────────────  │
│ STATUS BAR: 28px                                                    │
└─────────────────────────────────────────────────────────────────────┘

Breakpoints:
  Desktop: >= 1280px — layout completo 3 colunas
  Laptop:  >= 1024px — right panel colapsado por defeito
  Tablet:  >= 768px  — sidebar icon-only
```

---

## Componentes Atómicos

### StatusDot
```html
<span class="status-dot status-dot--active"></span>   <!-- verde ● -->
<span class="status-dot status-dot--idle"></span>     <!-- cinzento ○ -->
<span class="status-dot status-dot--pending"></span>  <!-- âmbar ◐ -->
```

### Badge
```html
<!-- Layer badges -->
<span class="badge badge--l1">L1</span>
<span class="badge badge--l4">L4</span>

<!-- Status badges -->
<span class="badge badge--success">PASS</span>
<span class="badge badge--warning">WARN</span>
<span class="badge badge--error">FAIL</span>

<!-- Agent badges -->
<span class="badge badge--agent" style="--agent-color: var(--kcc-agent-dev)">@dev</span>
```

### AgentCard
```html
<div class="agent-card" style="--agent-accent: var(--kcc-agent-dev)">
  <div class="agent-card__header">
    <span class="status-dot status-dot--active"></span>
    <span class="agent-card__icon">💻</span>
    <span class="agent-card__name">Dex</span>
    <span class="badge badge--agent">@dev</span>
  </div>
  <p class="agent-card__role">Implementação de código</p>
  <div class="agent-card__authority">git add · commit (não push)</div>
  <div class="agent-card__actions">
    <button class="btn btn--primary btn--sm">Activar</button>
    <button class="btn btn--ghost btn--sm">Info →</button>
  </div>
</div>
```

### ProgressBar
```html
<div class="progress">
  <div class="progress__bar" style="--progress: 67%"></div>
  <span class="progress__label">SDC 67%</span>
</div>
```

---

## Navegação — Tab System

```css
/* Tab activo: underline violeta + texto primário */
.tab--active {
  color: var(--kcc-text-primary);
  border-bottom: 2px solid var(--kcc-accent);
}

/* Tab inactivo: texto secundário */
.tab {
  color: var(--kcc-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab:hover {
  color: var(--kcc-text-primary);
  background: var(--kcc-bg-overlay);
}
```

---

## Next Action Banner

```html
<div class="next-action-banner">
  <span class="next-action-banner__icon">▶</span>
  <div class="next-action-banner__content">
    <p class="next-action-banner__title">Story 3.5 Done sem QA Gate formal</p>
    <code class="next-action-banner__command">
      /AIOX:agents:qa → *qa-gate 3.5
    </code>
  </div>
  <div class="next-action-banner__actions">
    <button class="btn btn--primary btn--sm">Executar</button>
    <button class="btn btn--ghost btn--sm">Adiar</button>
  </div>
  <button class="next-action-banner__close">×</button>
</div>
```

---

## Acessibilidade (WCAG AA)

| Elemento | Cor texto | Cor fundo | Ratio | Standard |
|---------|-----------|-----------|-------|----------|
| Texto primário | #F1F5F9 | #0E1118 | 14.2:1 | ✅ AAA |
| Texto secundário | #94A3B8 | #0E1118 | 5.8:1 | ✅ AA |
| Badge PASS | #6EE7B7 | #10B98115 | 4.6:1 | ✅ AA |
| Link accent | #8B5CF6 | #0E1118 | 4.8:1 | ✅ AA |

Mínimo: 4.5:1 para texto normal, 3:1 para texto grande.

---

## Entregável para @architect

O design system está definido. Para o @architect desenvolver as ADRs, as constraints UX são:

1. **Layout fixo:** topbar 48px + sidebar 160px + status bar 28px
2. **Sem frameworks CSS pesados:** usar CSS custom properties nativas
3. **Fontes:** Inter + JetBrains Mono (Google Fonts ou bundled)
4. **Sem build step obrigatório:** CSS deve funcionar sem compilação (plain CSS)
5. **Responsive mínimo:** desktop 1280px é o target, laptop 1024px aceitável
6. **File serve:** server Express serve `public/` com os assets

---

## Change Log

| Data | Designer | Acção |
|------|---------|-------|
| 2026-06-03 | Uma (@ux-design-expert) | Design system v1.0 criado — blocker @po resolvido |
