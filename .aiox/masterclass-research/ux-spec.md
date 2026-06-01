# UX Spec — Dashboard Pessoal · AIOX Masterclass

**Autor:** Uma (UX Design Expert · AIOX)
**Data:** 2026-06-01
**Fonte de estilo:** `aiox-masterclass_2.html` (extracção real do CSS/`:root`)
**Princípio:** No Invention — todas as cores, fontes e componentes derivam do ficheiro real.

---

## 1. Estilo Real Extraído

### 1.1 Cores (do `:root` real)

| Token | Valor | Uso no dashboard |
|-------|-------|------------------|
| `--bg` | `#080c14` | Fundo da área de conteúdo |
| `--bg2` | `#0e1420` | Painel do dashboard, topbar, sidebar |
| `--bg3` | `#141c2e` | Cards, chips, tags (estado base) |
| `--bg4` | `#1a2238` | Track das barras de progresso |
| `--border` | `#1e2d45` | Bordas de cards e divisores |
| `--border2` | `#243450` | Bordas hover / estados elevados |
| `--accent` | `#4f9eff` | Azul primário · progresso · tab activa |
| `--accent2` | `#00d4aa` | Verde · sucesso · score · lições concluídas |
| `--accent3` | `#f5a623` | Laranja · avisos · nível intermédio |
| `--accent4` | `#ff6b6b` | Vermelho · perigo |
| `--purple` | `#a78bfa` | Roxo · nível mestre · títulos de bloco |
| `--text` | `#e8f0ff` | Texto primário |
| `--text2` | `#8899bb` | Texto secundário |
| `--text3` | `#4a6080` | Texto terciário / labels |
| `--glow` | `rgba(79,158,255,0.15)` | Efeito glow em cards destacados |

### 1.2 Tipografia (do `@import` Google Fonts real)

| Família | Pesos | Uso |
|---------|-------|-----|
| **Syne** | 400/600/700/800 | Títulos (h1, logo, score grande) |
| **DM Sans** | 300/400/500/600 | Corpo de texto, labels gerais |
| **DM Mono** | 400/500 | Números, badges, tags, percentagens, comandos |

### 1.3 Componentes existentes reaproveitados

Derivados directamente do CSS do ficheiro — o dashboard **não inventa primitivas novas**, estende as existentes:

| Existente | Reuso no dashboard |
|-----------|--------------------|
| `.progress-bar-bg` + `.progress-bar-fill` | base das barras de módulo (gradiente `accent2 → accent`) |
| `.section-tag` (.a/.b/.c/.d/.e/.f) | cores por módulo nas barras |
| `.tag` + `.tag-green/.tag-blue/.tag-orange/.tag-purple` | badge de nível |
| `.btn-top` | base do `.dash-tab-btn` |
| `.block-body` (radius 12px, bg2, border) | base do `.dash-card` |
| `.copy-btn` + estado `.copied` | comportamento do `.cmd-chip` |
| `.glow-card::before` | destaque do card de score |

### 1.4 Geometria observada (consistência visual)

- Radius cards: `12px` · chips/botões: `6px` · pills/badges: `20px`
- Padding card: `22px` · gap entre cards: `~16px`
- Transições: `0.2s` (hover), `0.4–0.5s` (barras de progresso)

---

## 2. Sistema de Score (regra de negócio)

| Pontos | Nível | Cor (token) | Classe tag |
|--------|-------|-------------|------------|
| 0 – 499 | **Iniciante** | `--accent` (azul) | `.tag-blue` |
| 500 – 1999 | **Intermédio** | `--accent3` (laranja) | `.tag-orange` |
| 2000 – 4999 | **Avançado** | `--accent2` (verde) | `.tag-green` |
| 5000+ | **Mestre** | `--purple` (roxo) | `.tag-purple` |

> A barra de score preenche-se proporcionalmente até ao limite do nível seguinte. Ao 5000+ fica preenchida a 100% com gradiente `accent → purple`.

---

## 3. Navegação por Tabs

A topbar real já tem `.topbar-right`. O dashboard adiciona **duas tabs** à esquerda do conteúdo, comutando entre o curso (estado actual) e o dashboard.

```
┌──────────────────────────────────────────────────────────┐
│ [CURSO] [📊 DASHBOARD]                       🆘  ↺ Reset   │
└──────────────────────────────────────────────────────────┘
```

- `[CURSO]` activa → mostra `.content-area` actual (sidebar + lição)
- `[📊 DASHBOARD]` activa → mostra `.dashboard-panel` (esconde sidebar/lição)
- Tab activa usa `--accent` (igual a `.os-tab.active`)

---

## 4. Wireframe ASCII — Dashboard

```
[CURSO] [📊 DASHBOARD]                              🆘  ↺ Reset

┌──────────────────────────────────────────────────────────┐
│  🏆 Pedro Leal — AIOX Dashboard                            │
├────────────────────────────┬─────────────────────────────┤
│ PROGRESSO                  │ SCORE                        │
│ ████████████░░░░░░  64%    │  ⭐ 1 240 pts                 │
│ 34 de 53 lições            │  [Intermédio]  🥈 badge       │
│                            │  ███████░░░  até Avançado     │
├────────────────────────────┴─────────────────────────────┤
│ MÓDULOS                                                    │
│  M0 Antes de Começar   ████████████ 100%                   │
│  M1 Instalação         ██████░░░░░░  50%                    │
│  M2 Primeiros Passos   ███░░░░░░░░░  25%                    │
│  M3 …                  ░░░░░░░░░░░░   0%                    │
├────────────────────────────────────────────────────────────┤
│ COMANDOS RÁPIDOS                                           │
│  [📋 *help]  [📋 *create-story]  [📋 @dev]  [📋 @qa]        │
│  [📋 npx aiox init]  [📋 *task develop-story]               │
└────────────────────────────────────────────────────────────┘
```

**Layout responsivo:** grid de 2 colunas (Progresso | Score) em desktop; empilha para 1 coluna abaixo de `768px` (igual ao `@media` existente que esconde `.sidebar`).

### Estados

- **Vazio (0%)**: barras a `0%`, score `0 pts`, badge `Iniciante`, microcopy "Completa a tua primeira lição para começar a pontuar".
- **Lição concluída**: barra do módulo anima (`transition:width 0.4s`), score incrementa, possível mudança de nível dispara reuso do `#celebration` existente.
- **Chip copiado**: `.cmd-chip` ganha estado `.copied` (verde, "✓ Copiado") por 1.5s — idêntico ao `.copy-btn.copied`.

---

## 5. CSS — Classes do Dashboard

Cores derivadas dos tokens reais. Cola dentro do `<style>` existente (a seguir a `/* TASKFLOW BADGE */`).

```css
/* ── DASHBOARD ── */

/* Tabs de comutação Curso/Dashboard */
.dash-tab-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
}
.dash-tab-btn:hover { border-color: var(--accent); color: var(--accent); }
.dash-tab-btn.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
  font-weight: 500;
}

/* Container do dashboard */
.dashboard-panel {
  display: none;
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 40px;
}
.dashboard-panel.active { display: block; }

.dash-h1 {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Grid topo (Progresso | Score) */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* Card genérico — herda de .block-body */
.dash-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 22px;
}
.dash-card-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text3);
  font-family: 'DM Mono', monospace;
  margin-bottom: 14px;
}

/* Barra de progresso de módulo */
.module-progress { margin-bottom: 14px; }
.module-progress:last-child { margin-bottom: 0; }
.module-progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 6px;
}
.module-progress-head .pct {
  font-family: 'DM Mono', monospace;
  color: var(--text3);
}
.module-progress-track {
  height: 6px;
  background: var(--bg4);
  border-radius: 3px;
  overflow: hidden;
}
.module-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent2), var(--accent));
  transition: width 0.4s ease;
}

/* Badge de nível */
.score-value {
  font-family: 'Syne', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}
.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
}
.score-badge.iniciante  { background: rgba(79,158,255,0.1);  color: var(--accent);  border: 1px solid rgba(79,158,255,0.3); }
.score-badge.intermedio { background: rgba(245,166,35,0.1);  color: var(--accent3); border: 1px solid rgba(245,166,35,0.3); }
.score-badge.avancado   { background: rgba(0,212,170,0.1);   color: var(--accent2); border: 1px solid rgba(0,212,170,0.3); }
.score-badge.mestre     { background: rgba(167,139,250,0.1); color: var(--purple); border: 1px solid rgba(167,139,250,0.3); }

/* Chip de comando copiável */
.cmd-chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.cmd-chip {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-family: 'DM Mono', monospace;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.cmd-chip:hover { border-color: var(--accent); color: var(--accent); }
.cmd-chip.copied { border-color: var(--accent2); color: var(--accent2); }
```

---

## 6. Acessibilidade (WCAG AA)

| Critério | Aplicação |
|----------|-----------|
| **Contraste texto** | `--text` (#e8f0ff) sobre `--bg2` ≈ 14:1 ✓; `--text2` sobre `--bg2` ≈ 6.4:1 ✓ (AA) |
| **Cor não isolada** | Nível indicado por cor **+ texto** (ex.: "Intermédio"), não só cor — apoia daltonismo |
| **Progresso** | Barras têm `%` numérica visível (não dependem só de comprimento) |
| **Tabs** | `role="tab"` / `aria-selected`; conteúdo `role="tabpanel"`; navegável por teclado |
| **Chips** | `<button>` reais (não `<div>`), focáveis; feedback "✓ Copiado" anuncia acção via `aria-live="polite"` |
| **Movimento** | Animações de barra/celebração respeitam `prefers-reduced-motion` (desactivar `transition`/`@keyframes bounce`) |
| **Alvos de toque** | Chips/tabs ≥ 32px de altura em mobile |

---

## 7. Notas de Implementação

- Dados de progresso já existem no JS (`SECTIONS` + estado de lições `done`). O dashboard **lê** esse estado, não duplica.
- Score sugerido: derivar de lições concluídas (ex.: pontos por lição) — regra exacta a definir pelo `@dev`; esta spec define apenas a apresentação e os limiares de nível.
- A mudança de nível pode reaproveitar o overlay `#celebration` existente em vez de criar um novo.
- Manter o dashboard dentro do mesmo `index.html` (single-file app), coerente com a arquitectura actual.
```
