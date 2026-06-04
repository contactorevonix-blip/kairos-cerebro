# Claude Code Monitor + Control Plane — UI/UX Specification

> **Design Lead:** Uma (UX Design Expert)
> **Data:** 2026-06-04
> **Produto:** Aplicação local (localhost) para monitorizar e controlar 150+ sessões/terminais Claude Code em tempo real
> **Base visual:** Estende o **KAIROS Design System** existente (`packages/web/src/styles/tokens.css`) — dark mode, acento verde `#00DC82`, escala cinzenta Radix estilo Resend
> **Estado:** Especificação aprovada para implementação

---

## Índice

1. [Benchmark Analysis](#1-benchmark-analysis)
2. [Design System](#2-design-system)
3. [Component Library](#3-component-library)
4. [Layout Strategy for 150+ Windows](#4-layout-strategy-for-150-windows)
5. [Real-time Data Visualization](#5-real-time-data-visualization)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Accessibility](#7-accessibility)
8. [Dark Mode](#8-dark-mode)
9. [UI Mockups / Wireframes](#9-ui-mockups--wireframes)
10. [Decisões Autónomas](#10-decisões-autónomas-registo)

---

## 1. Benchmark Analysis

### 1.1 Qual site "muito bom" clonamos?

O produto é um **mission-control para agentes** — denso em dados, tempo-real, multi-painel. Nenhum produto único cobre o caso de uso, por isso fazemos um **blend deliberado de 4 referências**, cada uma a resolver um problema distinto:

| Referência | O que clonamos | Problema que resolve |
|------------|----------------|----------------------|
| **Linear** | Sidebar de navegação, command palette (`Cmd+K`), densidade de listas, keyboard-first, micro-interações rápidas | Velocidade de navegação e controlo sem rato |
| **Vercel Dashboard** | Cards de status, badges semânticos, gráficos sóbrios, logs em tempo real (deployment logs), tabelas limpas | Visualização de métricas e log streams |
| **Grafana** | Grid de painéis arrastáveis/redimensionáveis, dashboards densos, time-series, refresh rates configuráveis | Layout de 150+ painéis simultâneos |
| **VS Code** | Tiling de terminais, split-view, painel colapsável, activity bar, status bar inferior | Gestão de muitos terminais num só ecrã |

**Referência primária para a "alma" visual:** **Linear + Vercel** (já presentes no DNA do KAIROS DS, que é inspirado no Resend — mesma família estética: dark, minimal, alta densidade, tipografia Inter).
**Referência primária para a "estrutura" de layout:** **Grafana + VS Code** (o desafio real são os 150+ painéis).

### 1.2 What makes it good? (porque é que estas referências são excelentes)

**Linear:**
- **Velocidade percebida** — tudo responde em <100ms, animações curtas (150-200ms), nunca há "loading spinner" gratuito.
- **Hierarquia visual** — uma única cor de acento, o resto é escala de cinzentos. O olho sabe sempre onde olhar.
- **Keyboard-first** — `Cmd+K` faz tudo. O rato é opcional.
- **Densidade sem ruído** — muita informação por pixel, mas com whitespace consistente (grid de 8px).

**Vercel:**
- **Status comunicado por cor + ícone + texto** (nunca só cor — bom para acessibilidade).
- **Log streams** com auto-scroll, syntax highlighting subtil, timestamps monoespaçados.
- **Cards auto-contidos** — cada card é uma unidade de informação completa.

**Grafana:**
- **Grid de painéis** redimensionáveis e persistentes (o layout do utilizador é guardado).
- **Refresh configurável** por painel — 5s, 10s, 30s, manual.
- **Densidade extrema** gerida com colapso/expansão e zoom.

**VS Code:**
- **Tiling de terminais** — split horizontal/vertical, foco num, grid de muitos.
- **Activity bar** estreita à esquerda para troca de contexto rápida.
- **Status bar** inferior — informação ambiente sempre visível sem ocupar espaço.

### 1.3 What we adapt vs what we keep

| Mantemos (keep) | Adaptamos (adapt) |
|-----------------|-------------------|
| Sidebar de navegação do Linear | Substituímos "projects/issues" por "sessions/agents/squads" |
| Command palette `Cmd+K` | Adicionamos acções de controlo (pause/resume/cancel agente) |
| Cards de status do Vercel | Tornamo-los SessionWidget / MetricsCard específicos do domínio |
| Grid arrastável do Grafana | Aplicamos algoritmos de tiling para 150+ terminais (ver §4) |
| Tiling de terminais do VS Code | Adicionamos overlay de métricas live por cima de cada tile |
| Dark mode como default | KAIROS DS já é dark-first — herdamos os tokens existentes |
| Log stream do Vercel | Adicionamos filtro por agente, nível e busca regex |

**Não copiamos:**
- Onboarding/marketing do Linear (é app local, sem funil de aquisição).
- Billing/team management do Vercel (single-user, localhost).
- Sistema de alerting/notificações por email do Grafana (é local, notificações in-app bastam).

---

## 2. Design System

> **Princípio:** Herdamos `packages/web/src/styles/tokens.css` (KAIROS DS) e **estendemos** com tokens específicos do domínio Monitor/Control. Não redefinimos o que já existe.

### 2.1 Color Tokens

```yaml
# === HERDADOS do KAIROS DS (tokens.css) — não alterar ===
inherited:
  background:        "#000000"
  surface_1:         "#141517"   # --color-gray-1 — fundo app
  surface_2:         "#191b1e"   # --color-gray-2 — cards/painéis
  surface_3:         "#212629"   # --color-gray-3 — divisores/bg subtil
  hover_overlay:     "#293034"   # --color-gray-4
  active_pressed:    "#333b3e"   # --color-gray-5
  border_default:    "rgba(214,235,253,0.19)"   # --border-default
  border_subtle:     "rgba(214,235,253,0.08)"   # --border-subtle
  border_strong:     "rgba(217,237,255,0.36)"   # --border-strong
  text_primary:      "#f0f0f0"   # --text-primary
  text_secondary:    "#a1a4a5"   # --text-secondary
  text_muted:        "#6e7679"   # --text-muted
  text_disabled:     "#52595b"   # --text-disabled
  accent:            "#00DC82"   # --color-accent (KAIROS verde)
  accent_dim:        "rgba(0,220,130,0.12)"
  accent_glow:       "rgba(0,220,130,0.25)"

# === NOVOS tokens semânticos de STATUS (estendem o DS) ===
# Mapeados aos valores já usados em score-meter.tsx para coerência
status:
  success:           "#22c55e"   # emerald-500 — agente concluído, gate passed
  success_bg:        "rgba(34,197,94,0.10)"
  success_border:    "rgba(34,197,94,0.30)"

  warning:           "#f59e0b"   # amber-500 — a aguardar input, gate concerns
  warning_bg:        "rgba(245,158,11,0.10)"
  warning_border:    "rgba(245,158,11,0.30)"

  error:             "#ef4444"   # red-500 — agente falhou, gate failed
  error_bg:          "rgba(239,68,68,0.10)"
  error_border:      "rgba(239,68,68,0.30)"

  pending:           "#6e7679"   # gray-9 — em fila, idle, não iniciado
  pending_bg:        "rgba(110,118,121,0.10)"
  pending_border:    "rgba(110,118,121,0.30)"

  running:           "#3b82f6"   # blue-500 — agente activo/a executar
  running_bg:        "rgba(59,130,246,0.10)"
  running_border:    "rgba(59,130,246,0.30)"
  running_pulse:     "rgba(59,130,246,0.25)"   # halo animado de "vivo"

# === Cores de domínio (workflow/agentes) ===
domain:
  agent_dev:         "#3b82f6"   # blue   — @dev
  agent_qa:          "#8b5cf6"   # violet — @qa
  agent_architect:   "#06b6d4"   # cyan   — @architect
  agent_pm:          "#f59e0b"   # amber  — @pm
  agent_devops:      "#00DC82"   # green  — @devops
  agent_default:     "#a1a4a5"   # gray   — outros
```

**Regra de uso de status (crítica para acessibilidade):** cor **nunca** é o único sinal. Cada estado usa sempre **cor + ícone + texto** (ver §7.4).

| Estado | Cor | Ícone | Texto |
|--------|-----|-------|-------|
| Running | azul (pulse) | ● (animado) | "Running" |
| Success | verde | ✓ | "Done" |
| Warning | âmbar | ▲ | "Waiting" |
| Error | vermelho | ✕ | "Failed" |
| Pending | cinzento | ○ | "Queued" |

### 2.2 Typography Tokens

```yaml
# === HERDADO do KAIROS DS ===
fonts:
  sans:    '"Inter", ui-sans-serif, system-ui, sans-serif'        # UI geral
  mono:    '"JetBrains Mono", ui-monospace, Menlo, monospace'     # terminais, métricas, logs, IDs

# Escala (herda --text-* do tokens.css)
scale:
  2xs:   "0.625rem"   # 10px — badges, labels de eixo de gráfico, timestamps densos
  xs:    "0.75rem"    # 12px — metadata, captions, log lines
  sm:    "0.875rem"   # 14px — corpo de UI, labels de form, tabelas (DEFAULT)
  base:  "1rem"       # 16px — corpo de leitura, descrições
  lg:    "1.125rem"   # 18px — títulos de card
  xl:    "1.25rem"    # 20px — títulos de painel
  2xl:   "1.5rem"     # 24px — métricas grandes (KPI numbers)
  3xl:   "1.875rem"   # 30px — header de página

weights:
  normal:    400   # corpo
  medium:    500   # labels, botões, ênfase subtil
  semibold:  600   # títulos, valores de métrica, badges activos
  bold:      700   # KPI hero numbers apenas

line_height:
  tight:    "1.2"    # títulos, KPI numbers
  normal:   "1.5"    # corpo
  relaxed:  "1.65"   # blocos de texto longo
  code:     "1.45"   # terminais/logs — densidade legível

# === REGRA de domínio ===
# Todos os NÚMEROS (tokens, custos, durações, contagens) usam `font-variant-numeric: tabular-nums`
# para alinhamento vertical em colunas que actualizam em tempo real.
numeric:
  variant: "tabular-nums"
  font:    "mono"   # custos, tokens, durações sempre em mono
```

### 2.3 Spacing Tokens

```yaml
# Grid base de 4px (sub-unidade) / 8px (unidade primária) — alinha com Linear/Vercel
grid:
  base_unit: "4px"
  primary:   "8px"

space:
  0:   "0"
  px:  "1px"
  1:   "4px"     # gap mínimo (badge interno, icon+text)
  2:   "8px"     # gap padrão entre elementos relacionados
  3:   "12px"    # padding interno de inputs/botões
  4:   "16px"    # padding de card (DEFAULT)
  5:   "20px"
  6:   "24px"    # gap entre cards, padding de painel
  8:   "32px"    # margem de secção
  10:  "40px"
  12:  "48px"    # margem grande / header height
  16:  "64px"

# Dimensões estruturais fixas (layout)
layout:
  sidebar_width:          "240px"   # left nav expandido
  sidebar_collapsed:      "56px"    # left nav colapsado (só ícones)
  right_panel_width:      "360px"   # painel de detalhe/inspector
  header_height:          "48px"    # top bar
  status_bar_height:      "28px"    # bottom status bar (estilo VS Code)
  terminal_min_width:     "320px"   # largura mínima de um tile de terminal
  terminal_min_height:    "180px"   # altura mínima de um tile
  grid_gap:               "8px"     # gap entre tiles no grid
```

### 2.4 Component Tokens (borders, shadows, radius)

```yaml
# === HERDADO do KAIROS DS ===
radius:
  xs:    "2px"
  sm:    "4px"
  md:    "6px"     # inputs, botões pequenos (DEFAULT controles)
  lg:    "8px"     # cards, painéis (DEFAULT containers)
  xl:    "12px"
  2xl:   "16px"    # botões grandes, icon boxes
  full:  "9999px"  # badges, pills, avatares

borders:
  width_thin:   "1px"
  default:      "1px solid rgba(214,235,253,0.19)"   # --border-default
  subtle:       "1px solid rgba(214,235,253,0.08)"
  strong:       "1px solid rgba(217,237,255,0.36)"   # hover/focus
  accent:       "1px solid rgba(0,220,130,0.35)"
  focus_ring:   "2px solid #00DC82"                  # foco de teclado (a11y)

shadows:
  card:         "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
  glow_green:   "0 0 40px rgba(0,220,130,0.2)"
  glow_blue:    "0 0 40px rgba(59,130,246,0.2)"      # painel de agente activo
  popover:      "0 8px 32px rgba(0,0,0,0.7)"
  modal:        "0 16px 64px rgba(0,0,0,0.8)"

# === Animação (herda --ease-* do DS) ===
motion:
  duration_fast:    "120ms"   # hover, micro-feedback
  duration_base:    "200ms"   # transições de estado, abrir painel
  duration_slow:    "400ms"   # entrada de modal, reflow de grid
  ease_default:     "cubic-bezier(0.4,0,0.2,1)"
  ease_spring:      "cubic-bezier(0.34,1.56,0.64,1)"   # badges, pills
  ease_cinematic:   "cubic-bezier(0.16,1,0.3,1)"       # modais, painéis

# Tokens de tile de terminal (específicos do domínio)
terminal:
  bg:               "#0a0b0d"            # mais escuro que surface_1 (foco no texto)
  border_idle:      "rgba(214,235,253,0.08)"
  border_active:    "rgba(0,220,130,0.35)"   # tile em foco
  border_running:   "rgba(59,130,246,0.30)"  # agente a executar
  border_error:     "rgba(239,68,68,0.30)"
  header_height:    "28px"               # título + controles do tile
  font_size:        "12px"               # texto de terminal denso
```

---

## 3. Component Library

> Cada componente lista: **anatomia**, **estados interactivos** (default / hover / active / disabled / focus), e **tokens** usados. Antes de criar qualquer componente em código, verificar `app/components/ui/` (regra: REUSE > ADAPT > CREATE).

### 3.1 Core Components

#### Button

```
Variantes: primary | secondary | ghost | danger | icon
Tamanhos:  sm (28px) | md (32px) | lg (40px)
```

| Estado | Primary | Secondary | Ghost | Danger |
|--------|---------|-----------|-------|--------|
| **default** | bg accent, text #000 | bg surface_3, border default | transparent, text secondary | bg error_bg, text error, border error_border |
| **hover** | bg accent + glow_green | bg hover_overlay | bg hover_overlay | bg error (full), text #fff |
| **active** | scale 0.98, bg accent dim | bg active_pressed | bg active_pressed | scale 0.98 |
| **disabled** | opacity 0.4, no pointer | opacity 0.4 | opacity 0.4 | opacity 0.4 |
| **focus** | focus_ring (2px accent) | focus_ring | focus_ring | focus_ring error |
| **loading** | spinner inline, label fade | — | — | — |

```
┌──────────────────────┐   default        ┌──────────────────────┐  hover (glow)
│   ▶  Run Agent        │  ───────────►    │   ▶  Run Agent       │ ✦
└──────────────────────┘                   └──────────────────────┘
  primary, accent bg                          + shadow-glow-green
```

#### Input / Textarea / Select

```
Anatomia: [label] [input field] [hint | error]
Altura:   32px (sm) — alinhado com Button md
```

| Estado | Visual |
|--------|--------|
| default | bg surface_2, border subtle, text primary, placeholder text_muted |
| hover | border default |
| focus | border accent + focus_ring, glow_sm |
| disabled | opacity 0.4, bg surface_1 |
| error | border error_border, hint a vermelho com ícone ✕ |
| valid | border success_border, ícone ✓ à direita |

```
Agent Name
┌────────────────────────────────────┐
│ my-fraud-scorer-agent              │  ← focus: borda verde + glow
└────────────────────────────────────┘
 Lowercase, hyphens only              ← hint, text-muted
```

#### Card

```
Anatomia: [header: title + actions] [body] [footer: metadata]
```

| Estado | Visual |
|--------|--------|
| default | bg surface_2, border default, radius lg, shadow card |
| hover | border strong, translateY(-1px) |
| selected | border accent, glow_sm |
| dragging | opacity 0.8, shadow popover, cursor grabbing |

#### Modal / Dialog

```
Anatomia: [overlay backdrop blur] [panel] [header + close] [body] [footer actions]
Largura:  sm 400px | md 560px | lg 800px | fullscreen
```

- Overlay: `rgba(0,0,0,0.6)` + `backdrop-filter: blur(8px)`
- Panel: bg surface_2, radius xl, shadow modal, entrada com `ease_cinematic` (scale 0.96→1, fade)
- Fecho: `Esc`, clique fora, botão ✕. Focus trap activo (a11y).

#### Table

```
Anatomia: [header sticky] [rows zebra subtil] [pagination | virtual scroll]
```

| Elemento | Token |
|----------|-------|
| header | bg surface_1 sticky, text_secondary, text-xs uppercase, border-bottom default |
| row | h 36px, border-bottom subtle, números em tabular-nums mono |
| row hover | bg hover_overlay |
| row selected | bg accent_dim, border-left 2px accent |
| sortable col | ícone ▲▼ no hover |

> Para >100 linhas: **virtual scrolling** obrigatório (renderiza só linhas visíveis).

#### Chart

```
Tipos: sparkline | line (time-series) | bar | donut (distribuição) | gauge
```

- Eixos: text_muted, text-2xs, grid lines em border_subtle.
- Séries: usar cores de `domain.agent_*` para distinguir agentes.
- Tooltip: popover dark, tabular-nums, segue o cursor.
- Live: novas amostras entram da direita com transição de 200ms (sem re-render total).

---

### 3.2 Monitor-specific Components

#### SessionWidget

Cartão compacto que representa **uma sessão Claude Code**. É a unidade base do dashboard (haverá 150+).

```
┌─────────────────────────────────────────────┐
│ ● @dev · story-2.3          [⋮]   12:04:33   │ ← header: status dot + agent + menu + uptime
│ ─────────────────────────────────────────── │
│ Implementing token-balance endpoint…         │ ← current task (truncate)
│                                               │
│ ▓▓▓▓▓▓▓▓░░░░░  62%   ·  4/7 ACs              │ ← progress bar + AC count
│                                               │
│ ⬡ 48.2k tok  ·  $0.34  ·  ⏱ 6m12s            │ ← métricas live (mono, tabular)
└─────────────────────────────────────────────┘
  border-left 2px = cor do status (running=azul pulse)
```

| Estado | Visual |
|--------|--------|
| running | border-left azul com pulse, dot ● animado |
| success | border-left verde, dot ✓ |
| error | border-left vermelho, dot ✕, body com error_bg subtil |
| waiting | border-left âmbar, dot ▲, label "Needs input" |
| idle/queued | border-left cinzento, dot ○, métricas a 50% opacity |
| hover | border strong, mostra acções rápidas (▶ ⏸ ✕) |
| selected | border accent, abre no right panel |

#### MetricsCard

KPI card para métricas agregadas (topo do dashboard).

```
┌───────────────────────┐
│ Total Tokens          │ ← label, text-secondary, text-xs
│                        │
│ 2.4M ▲ 12%            │ ← hero number (2xl bold mono) + delta (verde/vermelho)
│                        │
│ ▁▂▃▅▇▆▅▇  last 1h     │ ← sparkline + período
└───────────────────────┘
```

Variantes: tokens · cost · active agents · gates passed · avg duration.
Delta colorido: ▲ verde (positivo onde positivo é bom), ▼ vermelho. Para custo, ▲ = vermelho (subir é mau).

#### WorkflowVisualization

Timeline horizontal do SDC (Story Development Cycle: @sm → @po → @dev → @qa → @devops).

```
 ●━━━━━━●━━━━━━◉━━━━━━○━━━━━━○
 @sm    @po    @dev   @qa    @devops
 ✓      ✓      ●62%   queued queued
 Done   Done   Running        ↑ blocked by @dev
```

- Nó concluído: ● verde com ✓.
- Nó activo: ◉ azul pulsante + % de progresso.
- Nó pendente: ○ cinzento.
- Nó falhado: ✕ vermelho, conector a vermelho.
- Conectores: linha que "preenche" da esquerda conforme progresso.
- Hover num nó: tooltip com agente, task, duração, output preview.
- Vertical variant para sidebar estreita.

#### TerminalTile

Janela de terminal individual no grid (a peça-chave dos 150+ windows).

```
┌─ ● @dev · session-a3f ──────────────  ⊟ ⊡ ⛶ ✕ ─┐ ← header 28px: status + título + controles
│ $ npm test                                       │
│ PASS  src/lib/tokens.test.ts (4 tests)           │ ← output stream (mono 12px, auto-scroll)
│ PASS  src/lib/score.test.ts  (7 tests)           │
│ ⬡ Running suite 3/5…                              │
│                                                  │
│                          ⬡ 48k · $0.34 · 6m12s   │ ← overlay de métricas (canto, semi-transp)
└──────────────────────────────────────────────────┘
  controles: ⊟ minimize · ⊡ split · ⛶ fullscreen · ✕ close
```

| Estado | Border | Header |
|--------|--------|--------|
| active (focus) | accent (verde) | bg surface_3 |
| running | azul | dot pulsante |
| error | vermelho | bg error_bg |
| idle | subtle | dimmed |
| collapsed | só header visível (28px) | título + status |

Capacidades: auto-scroll com "jump to bottom" quando o user faz scroll up; busca `Cmd+F` inline; ANSI color rendering; copy-on-select.

---

### 3.3 Control-specific Components

#### AgentCreationForm

Wizard/form para criar um novo agente. **Decisão: form de step único com secções colapsáveis** (não wizard multi-página) — mais rápido para utilizador avançado solo (ver §6.1).

```
┌─ Create Agent ──────────────────────────── ✕ ─┐
│                                                 │
│ ▾ Identity                                      │
│   Name      [ fraud-scorer-agent            ]   │
│   Persona   [ Dex-style implementer         ]   │
│   Icon      [ 🤖 ▾ ]  (do icon-map.ts)          │
│                                                 │
│ ▾ Capabilities                                  │
│   Scope     [✓] code  [ ] db  [ ] research     │
│   Tools     [ Read ] [ Write ] [ Bash ] [+]    │
│                                                 │
│ ▸ Advanced (model, token budget, rules)        │ ← colapsado por defeito
│                                                 │
│ ─────────────────────────────────────────────  │
│              [ Cancel ]   [ Create Agent ▶ ]    │
└─────────────────────────────────────────────────┘
```

- Validação inline (nome único, lowercase-hyphen).
- Live preview do agente à direita conforme preenche.
- "Create" só activo quando válido.

#### SquadBuilder

Canvas para compor squads (grupos de agentes) — estilo node graph leve.

```
┌─ Squad: kairos-build ───────────────────────────────┐
│                                                       │
│   ┌────────┐      ┌────────┐      ┌────────┐         │
│   │ @sm    │─────▶│ @dev   │─────▶│ @qa    │         │
│   │ River  │      │ Dex    │      │ Quinn  │         │
│   └────────┘      └────────┘      └────────┘         │
│                        │                              │
│                        ▼                              │
│                   ┌────────┐                          │
│                   │ @devops│   [+ Add Agent]          │
│                   │ Gage   │                          │
│                   └────────┘                          │
└───────────────────────────────────────────────────────┘
```

- Nós arrastáveis (drag), conectores = handoff/dependência.
- Right panel mostra config do nó seleccionado.
- Botão "Run Squad" valida o grafo (sem ciclos) antes de executar.

#### ExecutionPanel

Painel de controlo de uma execução activa (no right panel ou modal).

```
┌─ Execution · story-2.3 ─────────────────────┐
│ Status   ● Running   (started 6m12s ago)     │
│ Agent    @dev · Dex                          │
│ ─────────────────────────────────────────── │
│ [ ⏸ Pause ]  [ ⏹ Cancel ]  [ ⟳ Restart ]    │ ← controles primários
│ ─────────────────────────────────────────── │
│ Progress   ▓▓▓▓▓▓▓░░░  62%                    │
│ Tokens     48,241  ·  $0.34                   │
│ Quality    Gate: ⏳ pending                    │
│ ─────────────────────────────────────────── │
│ ▾ Live Output                                 │
│   …log stream…                                │
└───────────────────────────────────────────────┘
```

- Pause/Cancel pedem confirmação se houver trabalho não guardado (destrutivo → secondary confirm).
- Restart é ghost (menos proeminente).

---

## 4. Layout Strategy for 150+ Windows

### 4.1 Main Layout — 3 colunas (estilo Linear + VS Code)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  TOP BAR (48px)   ⬡ Kairos Monitor   [Cmd+K search]      ◐ theme  ⚙ settings │
├──────┬──────────────────────────────────────────────────────┬───────────────┤
│      │                                                        │               │
│ LEFT │              CENTER CANVAS                             │  RIGHT PANEL  │
│ NAV  │         (dashboard OR terminal grid)                   │  (inspector / │
│ 240px│                                                        │   execution)  │
│      │                                                        │   360px       │
│ ▸ All│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │               │
│ ▸ Run│   │ S1   │ │ S2   │ │ S3   │ │ S4   │  ← grid tiles  │  [details of  │
│ ▸ Que│   └──────┘ └──────┘ └──────┘ └──────┘                │   selected]   │
│ ▸ Don│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │               │
│ ──── │   │ S5   │ │ S6   │ │ S7   │ │ S8   │                │               │
│Squads│   └──────┘ └──────┘ └──────┘ └──────┘                │               │
│Agents│                                                        │               │
│      │                                                        │               │
├──────┴──────────────────────────────────────────────────────┴───────────────┤
│ STATUS BAR (28px)  ● 23 running · 8 queued · 119 idle   ⬡ 2.4M tok · $18.40  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Left nav** colapsável (240px → 56px só ícones). Filtros: All / Running / Queued / Done + secções Squads, Agents.
- **Center canvas** alterna entre **Dashboard view** (SessionWidgets) e **Terminal grid** (TerminalTiles).
- **Right panel** colapsável; abre ao seleccionar um item.
- **Status bar** agrega contagens globais — sempre visível, custo zero de cliques.

### 4.2 Terminal Grid — algoritmos de tiling para 150+ janelas

O coração do desafio. 150+ janelas não cabem todas legíveis em simultâneo, por isso usamos **níveis de zoom semântico (LOD — Level Of Detail)** + tiling configurável.

#### 4.2.1 Modos de visualização (densidade adaptativa)

| Modo | Tiles visíveis | Conteúdo por tile | Quando usar |
|------|----------------|-------------------|-------------|
| **Focus** | 1 | terminal full + métricas completas | Inspeccionar 1 sessão |
| **Split** | 2-4 | terminal legível + header | Comparar sessões |
| **Grid** | 9-16 | últimas ~8 linhas + status | Vista de trabalho normal |
| **Dense** | 25-50 | status + 1 linha + progress | Supervisão de muitos |
| **Galaxy** | 150+ | só dot de status + nome (mini-tile 24px) | Overview total ("heatmap") |

**Galaxy mode** (o que resolve os 150+): cada sessão vira um quadrado pequeno colorido pelo status. Funciona como um *heatmap* — o olho detecta imediatamente os vermelhos (erros) e âmbares (à espera) num mar de azuis/verdes. Clicar num quadrado faz zoom para Focus.

```
GALAXY MODE (150+ sessions as a status heatmap)
┌──────────────────────────────────────────────────┐
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  │
│ ●●●●●✕●●●●●●●●●●▲●●●●●●●●●●●●●●●●●✕●●●●●●●●●●●  │ ← ✕ vermelho salta à vista
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●▲●●●●●●●●●●●●●●●●●●●  │
│ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  │
│  hover → tooltip · click → Focus · drag → select range │
└──────────────────────────────────────────────────┘
  ● azul=running  ● verde=done  ▲ âmbar=waiting  ✕ vermelho=error  ○ cinza=idle
```

#### 4.2.2 Algoritmos de tiling

1. **Binary tiling (estilo i3/VS Code):** split recursivo H/V. Bom para 2-8 painéis com controlo manual.
2. **Masonry/auto-grid (estilo Grafana):** colunas automáticas com base na largura do canvas e `terminal_min_width` (320px). `columns = floor(canvasWidth / (320 + gap))`.
3. **Priority pinning:** sessões "pinned" (erro ou waiting) sobem para o topo do grid automaticamente — o que precisa de atenção fica sempre visível.
4. **Pack algorithm para Galaxy:** grid uniforme de mini-tiles, ordenado por status (erros primeiro) ou por agente.

**Default:** auto-grid masonry com priority pinning. O utilizador pode trocar para binary tiling manual quando quer um layout fixo.

#### 4.2.3 Capacidades do grid

- **Resizable:** arrastar bordas/cantos dos tiles (handles aparecem no hover).
- **Collapsible:** tile colapsa para só header (28px).
- **Split-view:** botão ⊡ divide o tile em H ou V.
- **Persistência:** o layout é guardado em localStorage por "view" (o user volta ao mesmo arranjo).
- **Saved layouts:** presets nomeados ("Debug", "Overview", "QA focus").

### 4.3 Responsive Breakpoints

> É app local, mas suporta janelas redimensionadas e ecrãs ultrawide.

```yaml
breakpoints:
  sm:    "< 768px"     # 1 coluna; right panel vira overlay; grid força Focus/Split
  md:    "768-1280px"  # left nav colapsa para ícones; grid até 9 tiles
  lg:    "1280-1920px" # layout 3-col completo; grid até 16 tiles
  xl:    "1920-2560px" # grid denso até 25 tiles; right panel pode fixar
  2xl:   "> 2560px"    # ultrawide: 2º right panel opcional; Galaxy confortável
```

Comportamento: à medida que a largura diminui, o LOD sobe automaticamente (menos densidade, mais legibilidade) a não ser que o user fixe um modo.

### 4.4 Full-screen mode (foco numa janela)

- Atalho: `F` com tile seleccionado, ou ⛶ no header do tile.
- O tile ocupa 100% do canvas (left/right panels colapsam mas reabrem ao hover na borda).
- `Esc` ou `F` de novo regressa ao grid anterior (estado preservado).
- Em fullscreen, métricas completas + log stream + controles de execução ficam visíveis (não há compromisso de espaço).

---

## 5. Real-time Data Visualization

### 5.1 Transporte de dados — decisão técnica

**Decisão: WebSocket para streams, com fallback de polling.**

| Dado | Mecanismo | Frequência |
|------|-----------|------------|
| Log stream (terminal output) | WebSocket (push) | tempo-real, batched a 16ms (1 frame) |
| Agent status changes | WebSocket (push) | event-driven |
| Métricas (tokens/custo) | WebSocket (push) ou poll | event-driven, throttle 500ms na UI |
| Workflow progress | WebSocket (push) | event-driven |
| Agregados globais (status bar) | poll | 2s |

Razão: streams de terminal são alta-frequência → push é essencial; agregados toleram poll. Throttling/batching na UI evita re-renders excessivos com 150+ fontes.

### 5.2 Session metrics (tokens, custo, duração)

- **Tokens spent:** número grande mono tabular + sparkline da última hora. Cor neutra; delta verde/vermelho.
- **Cost:** `$` mono, 2 casas decimais. Delta ▲ a **vermelho** (subir custo é negativo).
- **Duration:** `⏱ 6m12s` formato compacto, conta para cima em tempo-real (tick de 1s, não re-render do card todo).

```
┌─ Session Metrics ─────────────────────────┐
│  Tokens          Cost           Duration   │
│  48,241          $0.34          6m 12s     │
│  ▲ 1.2k/min      ▲ $0.01/min    running     │
│  ▁▂▃▅▇▆▅▇ 1h     ▁▁▂▂▃▃▄▄ 1h               │
└─────────────────────────────────────────────┘
```

### 5.3 Agent status (running, idle, waiting, error)

- Representado consistentemente pelo **status dot** (cor + ícone + texto, ver §2.1).
- **Running** tem halo pulsante (`running_pulse`, 2s ease-in-out loop) — único estado animado, para reservar movimento para o que está "vivo".
- Agregado em barras empilhadas na status bar e em donut no dashboard.

### 5.4 Workflow progress (visual timeline)

- Componente `WorkflowVisualization` (§3.2). Timeline horizontal no card de sessão, vertical no right panel.
- Conectores preenchem progressivamente. Nós mudam de estado em tempo-real com transição de 200ms.

### 5.5 Quality gate status (passed / failed / pending)

```
Quality Gates
  Lint      ✓ passed      120ms
  Tests     ✓ passed      11/11
  Coverage  ▲ 78% (min 80%)   ← warning, abaixo do mínimo
  Security  ⏳ pending
  Review    ○ not started
```

- Lista vertical, cada gate com ícone + nome + métrica + duração.
- Cor por estado. Gate failed expande para mostrar a razão.
- Resumo num badge: "4/5 gates" no header da sessão.

### 5.6 Live terminal output (log stream)

- **Virtual scrolling** (essencial — logs podem ter milhares de linhas).
- **Auto-scroll** com pausa automática quando o user faz scroll para cima + botão flutuante "↓ Jump to latest" + contador de linhas novas.
- **ANSI colors** renderizados; **syntax highlighting** subtil para níveis (ERROR vermelho, WARN âmbar, INFO neutro).
- **Filtros:** por nível (debug/info/warn/error), busca regex inline (`Cmd+F`), filtro por agente em vista agregada.
- **Timestamps** mono tabular à esquerda, colapsáveis.
- **Batching:** linhas chegam em lotes de 16ms para não saturar o render thread.

```
┌─ Logs · all sessions ─────────────  [⊘ filter] [⌕ regex] ─┐
│ 12:04:31.204  @dev   INFO   Running test suite…           │
│ 12:04:31.890  @qa    WARN   Coverage 78% below threshold  │ ← âmbar
│ 12:04:32.110  @dev   ERROR  Connection refused :5432      │ ← vermelho
│ 12:04:32.330  @sm    INFO   Story 2.4 drafted             │
│                                          ↓ 12 new lines    │ ← botão flutuante
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Interaction Patterns

### 6.1 Como criar um agente — Form, não Wizard

**[AUTO-DECISION]** Wizard multi-página vs form único? → **Form de step único com secções colapsáveis** (Advanced colapsado). Razão: o utilizador-alvo é um solo founder avançado que cria agentes repetidamente; wizard multi-página adiciona cliques e atrito. Mantemos "progressive disclosure" via secções colapsáveis para não assustar com complexidade. Para o **primeiro** agente, oferecemos um template pré-preenchido (estilo "Quick start").

Fluxo: `Cmd+K → "Create Agent"` ou botão `[+]` na sidebar → `AgentCreationForm` (modal) → validação inline → live preview → Create → agente aparece na lista com estado "idle".

### 6.2 Como monitorizar execução — Live updates (push)

- Por defeito: **live updates via WebSocket** (ver §5.1). Sem botão "refresh" para o streaming.
- Indicador de ligação: dot verde "live" na top bar; se cair, vira âmbar "reconnecting…" e a UI passa a poll.
- O utilizador escolhe a densidade (Focus → Galaxy) conforme quer detalhe ou overview.

### 6.3 Como controlar workflow — Pause / Resume / Cancel

```
Controles primários (ExecutionPanel + hover em SessionWidget/TerminalTile):
  ▶ Run / Resume    — primary button
  ⏸ Pause           — secondary
  ⏹ Cancel          — danger (confirmação obrigatória)
  ⟳ Restart         — ghost
```

- **Pause:** suspende o agente, estado → "paused" (âmbar). Reversível sem perda.
- **Resume:** retoma de onde parou.
- **Cancel:** **destrutivo** → dialog de confirmação ("Cancel execution? Unsaved progress will be lost."). Nunca acção de 1 clique.
- **Bulk actions:** em Galaxy/Dense mode, seleccionar múltiplos (drag-select ou `Shift+click`) → barra de acções em lote ("Pause 12 · Cancel 12").
- **Command palette:** todas as acções disponíveis via `Cmd+K` (ex.: "Pause all running", "Cancel session-a3f").

### 6.4 Como ver logs e métricas

- **Logs:** clicar numa sessão → right panel/Focus mode com log stream; ou vista "Logs" agregada de todas as sessões com filtro por agente.
- **Métricas:** MetricsCards no topo do dashboard (agregado) + métricas inline em cada SessionWidget (por sessão) + métricas completas no ExecutionPanel/Focus.
- **Drill-down:** clicar numa MetricsCard agregada → vista detalhada com breakdown por agente/sessão.

### 6.5 Navegação global — Keyboard-first

| Atalho | Acção |
|--------|-------|
| `Cmd+K` | Command palette (tudo) |
| `Cmd+\` | Toggle right panel |
| `Cmd+B` | Toggle left nav |
| `1-5` | Trocar densidade (Focus→Galaxy) |
| `F` | Fullscreen tile seleccionado |
| `Cmd+F` | Busca no log/terminal activo |
| `J/K` | Navegar tiles (próximo/anterior) |
| `Esc` | Fechar modal / sair de fullscreen |
| `Space` | Pause/Resume sessão seleccionada |
| `g d` | Go to Dashboard · `g t` Go to Terminal grid |

---

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Contrast ratios

| Par | Ratio | Requisito AA | Estado |
|-----|-------|--------------|--------|
| text_primary `#f0f0f0` on surface_2 `#191b1e` | ~14.8:1 | 4.5:1 | ✓ AAA |
| text_secondary `#a1a4a5` on surface_2 | ~7.4:1 | 4.5:1 | ✓ AAA |
| text_muted `#6e7679` on surface_2 | ~3.9:1 | 3:1 (large/UI) | ✓ (usar só ≥18px ou UI) |
| accent `#00DC82` text on `#000` | ~11:1 | 4.5:1 | ✓ AAA |
| status success `#22c55e` on surface_2 | ~6.1:1 | 4.5:1 | ✓ AA |
| status error `#ef4444` on surface_2 | ~4.6:1 | 4.5:1 | ✓ AA |
| status warning `#f59e0b` on surface_2 | ~7.2:1 | 4.5:1 | ✓ AA |

> **Regra:** `text_muted` nunca para texto pequeno crítico (só hints ≥12px secundários ou metadata). Para texto pequeno importante usar `text_secondary` ou acima.

### 7.2 Keyboard navigation

- **Tudo** acessível por teclado (ver §6.5). Ordem de tab lógica (left nav → canvas → right panel).
- **Focus visível** sempre: `focus_ring` 2px accent em todos os elementos interactivos (nunca `outline: none` sem substituto).
- **Focus trap** em modais; `Esc` fecha. Foco regressa ao trigger ao fechar.
- **Skip link** "Skip to canvas" no topo.
- Roving tabindex no grid de tiles (setas navegam, não Tab a cada tile).

### 7.3 Screen reader support

- HTML semântico: `<nav>`, `<main>`, `<aside>`, `<button>` (nunca `<div onClick>`).
- `aria-label` em botões só-ícone (ex.: `aria-label="Pause @dev session"`).
- **Live regions:** `aria-live="polite"` para mudanças de status de agente; `aria-live="assertive"` para erros.
- Log stream: `role="log"` + `aria-live="polite"` (anuncia novas linhas sem floodar — batched).
- Progress bars: `role="progressbar"` com `aria-valuenow/min/max`.
- Status dots têm `aria-label` textual ("Running", "Failed") — o ícone+texto já não dependem de cor.

### 7.4 Color independence

- **Nenhum estado depende só de cor.** Status = cor + ícone (●✓▲✕○) + texto (ver §2.1).
- Deltas usam ▲▼ além de verde/vermelho.
- Gráficos: séries distinguidas por cor **e** padrão/label, com legenda textual.

### 7.5 Motion

- Respeitar `prefers-reduced-motion`: desliga pulse de "running", reduz transições para fade simples, sem reflow animado de grid.

---

## 8. Dark Mode

### 8.1 Default: Dark (preferência do Pedro)

O KAIROS DS é **dark-first** — herdamos directamente. Dark é o default e o modo primário de design. Todas as decisões de contraste acima são feitas para dark.

### 8.2 Light mode (opcional)

**[AUTO-DECISION]** Implementar light mode? → **Sim, mas como modo secundário opt-in**, gerado por inversão semântica dos tokens (não um redesign). Razão: app de monitorização usada longas horas; alguns utilizadores preferem light em ambientes muito iluminados. Custo baixo porque os tokens são semânticos (`surface-*`, `text-*`), só precisamos de um segundo conjunto de valores.

```yaml
# Light mode — inversão semântica (valores indicativos, a afinar em implementação)
light:
  background:     "#ffffff"
  surface_1:      "#fafafa"
  surface_2:      "#f4f4f5"
  surface_3:      "#e9e9eb"
  text_primary:   "#18181b"
  text_secondary: "#52525b"
  text_muted:     "#a1a1aa"
  border_default: "rgba(0,0,0,0.12)"
  accent:         "#00b86d"   # verde ligeiramente escurecido p/ contraste sobre branco
  # status colors: usar tonalidades -600 (success #16a34a, error #dc2626, warning #d97706)
  # terminal: mantém tema escuro mesmo em light mode (convenção de terminais)
```

- Toggle na top bar (◐) + `Cmd+Shift+L`. Persistido em localStorage. Default segue `prefers-color-scheme` na 1ª visita, depois respeita a escolha do user.
- **Terminais permanecem dark** mesmo em light mode (convenção universal, melhor para output de código).

---

## 9. UI Mockups / Wireframes

### 9.1 Tela principal — Dashboard view

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ⬡ Kairos Monitor          ⌕ Search or run command (⌘K)         ● live  ◐  ⚙     │
├──────┬───────────────────────────────────────────────────────────┬─────────────┤
│ ▾All │  ┌─Tokens────┐ ┌─Cost──────┐ ┌─Active────┐ ┌─Gates─────┐  │ INSPECTOR   │
│  ●Run│  │ 2.4M ▲12% │ │ $18.40 ▲  │ │ 23 / 150  │ │ 142 ✓ 3 ✕ │  │             │
│  ▲Wai│  │ ▁▂▃▅▇▆▅▇  │ │ ▁▁▂▃▃▄▄▅  │ │ ●●●●●○○○○ │ │ 97.9%     │  │ Select a    │
│  ○Que│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │ session to  │
│  ✓Don│                                                            │ inspect.    │
│ ──── │  Sessions (150)              [Galaxy▾] [⊞ Grid] [⊟ Focus]  │             │
│ Squads  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │             │
│  build│  │● @dev story-2.3│ │● @qa  story-1.9│ │▲ @pm  epic-04  │ │             │
│  scan │  │Implementing…   │ │Running tests…  │ │Needs input     │ │             │
│ ──── │  │▓▓▓▓▓░░ 62% 4/7 │ │▓▓▓▓▓▓▓ 90%     │ │▓▓░░░░░ 20%     │ │             │
│ Agents│  │48k $0.34 6m12s │ │31k $0.22 4m01s │ │12k $0.08 2m    │ │             │
│  +New │  └────────────────┘ └────────────────┘ └────────────────┘ │             │
│      │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │             │
│      │  │✕ @dev story-3.1│ │● @architect a-2│ │○ @sm  story-5.0│ │             │
│      │  │Connection error│ │Designing schema│ │Queued          │ │             │
│      │  └────────────────┘ └────────────────┘ └────────────────┘ │             │
├──────┴───────────────────────────────────────────────────────────┴─────────────┤
│ ● 23 running · ▲ 4 waiting · ○ 8 queued · ✓ 112 done · ✕ 3 error   ⬡ 2.4M · $18.40│
└────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Tela principal — Terminal Grid view (Grid mode)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ⬡ Kairos Monitor          ⌕ (⌘K)              [1Focus 2Split 3Grid 4Dense 5Gal]  │
├──────┬───────────────────────────────────────────────────────────┬─────────────┤
│ ▾All │ ┌─● @dev session-a3f ───── ⊟⊡⛶✕─┐ ┌─● @qa session-b1c ──⊟⊡⛶✕─┐│ EXECUTION │
│  ●Run│ │$ npm test                       │ │PASS score.test (7)        ││ story-2.3 │
│  ▲Wai│ │PASS tokens.test (4)             │ │PASS api.test  (11)        ││ ●Running  │
│  ○Que│ │⬡ suite 3/5…                     │ │⬡ coverage 78%▲            ││ ─────────  │
│  ✓Don│ │           48k·$0.34·6m12s       │ │          31k·$0.22·4m     ││ ⏸ Pause   │
│ ──── │ └──────────────────────────────────┘ └────────────────────────────┘│ ⏹ Cancel  │
│ Squads ┌─✕ @dev session-c4d ────── ⊟⊡⛶✕─┐ ┌─● @architect a-2 ───⊟⊡⛶✕─┐│ ⟳ Restart │
│ Agents │ERROR Connection refused :5432    │ │Designing schema…          ││ ─────────  │
│  +New │ │  at db.connect (db.ts:14)       │ │CREATE TABLE sessions…     ││ ▓▓▓ 62%   │
│      │ │⚠ retry 2/3…                      │ │           18k·$0.12·3m    ││ Gate ⏳    │
│      │ └──────────────────────────────────┘ └────────────────────────────┘│           │
├──────┴───────────────────────────────────────────────────────────┴─────────────┤
│ ● 23 running · ▲ 4 waiting · ✕ 3 error            Layout: "QA focus" ▾  ⬡ $18.40 │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Galaxy mode (150+ overview) — ver §4.2.1

### 9.4 Component library — guia visual rápido

```
BUTTONS                          BADGES / STATUS              INPUTS
┌──────────┐ ┌──────────┐        ● Running  (azul pulse)      ┌──────────────┐
│▶ Primary │ │Secondary │        ✓ Done     (verde)           │ default      │
└──────────┘ └──────────┘        ▲ Waiting  (âmbar)           └──────────────┘
┌──────────┐ ┌──────────┐        ✕ Failed   (vermelho)        ┌──────────────┐
│  Ghost   │ │✕ Danger  │        ○ Queued   (cinza)           │ focus  ✦      │ verde+glow
└──────────┘ └──────────┘                                     └──────────────┘

CARDS                            METRICS CARD                 WORKFLOW
┌────────────────┐               ┌──────────────┐             ●━━●━━◉━━○━━○
│ Title      [⋮] │               │ Total Tokens │             sm po dev qa devops
│ body content   │               │ 2.4M ▲ 12%   │             ✓  ✓  ●  ○  ○
│ footer · meta  │               │ ▁▂▃▅▇▆▅▇ 1h   │
└────────────────┘               └──────────────┘
```

### 9.5 Responsive behavior

```
DESKTOP (lg/xl)              TABLET (md)                MOBILE (sm)
┌──┬────────┬──┐            ┌─┬──────────┐             ┌────────────┐
│  │        │  │            │ │          │             │   header   │
│nv│ canvas │ip│            │n│  canvas  │             ├────────────┤
│  │        │  │            │v│          │             │            │
└──┴────────┴──┘            └─┴──────────┘             │   canvas   │
3-col completo              nav→ícones                 │  (1 col,   │
                           inspector→overlay           │   Focus)   │
                                                       ├────────────┤
                                                       │  ☰ nav     │ bottom
                                                       └────────────┘
```

---

## 10. Decisões Autónomas (Registo)

Conforme o protocolo de elicitação autónoma, registo as decisões tomadas sem confirmação do utilizador:

- **[AUTO-DECISION]** Base visual nova vs herdar DS existente → **Herdar KAIROS DS** (`tokens.css`). Razão: já existe um DS coerente estilo Resend (dark, acento verde #00DC82); criar do zero violaria REUSE>ADAPT>CREATE e quebraria coerência com o resto do produto Kairos.
- **[AUTO-DECISION]** Referência primária de benchmark → **Blend Linear+Vercel (alma) + Grafana+VS Code (estrutura)**. Razão: nenhum produto único cobre "mission-control de 150+ agentes"; cada referência resolve um eixo distinto.
- **[AUTO-DECISION]** Estratégia para 150+ janelas → **Level-of-Detail com 5 modos (Focus→Galaxy)** + Galaxy heatmap. Razão: 150 terminais legíveis em simultâneo é fisicamente impossível; densidade adaptativa + heatmap de status resolve overview vs detalhe.
- **[AUTO-DECISION]** Criar agente: wizard vs form → **Form único com secções colapsáveis**. Razão: utilizador avançado solo, criação repetida; minimizar cliques com progressive disclosure.
- **[AUTO-DECISION]** Transporte de dados real-time → **WebSocket push + fallback polling**. Razão: streams de terminal são alta-frequência; agregados toleram poll.
- **[AUTO-DECISION]** Light mode → **Sim, opt-in secundário por inversão de tokens**; terminais ficam sempre dark. Razão: custo baixo (tokens semânticos) e útil em ambientes iluminados; dark continua default por preferência do Pedro.
- **[AUTO-DECISION]** Status colors → **reutilizar os valores de `score-meter.tsx`** (emerald/amber/red) + azul para running. Razão: coerência com componente existente; evita divergência de palete.

---

## Próximos Passos (handoff para implementação)

1. **Tokens:** estender `packages/web/src/styles/tokens.css` com os novos tokens de status/domain/terminal (§2.1, §2.4) — requer aprovação antes de tocar em tokens do DS (regra de constraints).
2. **Story-driven:** criar epic "Monitor Control Plane UI" via `@pm *create-epic`, depois stories por componente via `@sm *draft`.
3. **Ordem de build sugerida:** Core (Button/Input/Card/Table) → Monitor (SessionWidget/TerminalTile/MetricsCard) → Layout (3-col + grid tiling) → Control (forms/panels) → Real-time wiring (WebSocket).
4. **Verificar `app/components/ui/icons/icon-map.ts`** antes de usar qualquer ícone (●✓▲✕○⊟⊡⛶ etc. devem mapear para ícones reais existentes).
5. **a11y gate:** validar contra `accessibility-wcag-checklist.md` após cada componente.

---

*Especificação produzida por Uma (UX Design Expert) · KAIROS_CEREBRO · 2026-06-04*
*Estende o KAIROS Design System (`packages/web/src/styles/tokens.css`) — dark-first, acento verde #00DC82*
