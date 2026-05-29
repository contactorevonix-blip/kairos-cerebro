# Frontend Spec — Kairos Check
**Gerado por:** @ux-design-expert (Uma) — Brownfield Discovery Fase 3
**Data:** 2026-05-24
**Versão:** 1.0

---

## 1. Arquitectura Frontend

O Kairos Check **não tem framework frontend**. Todas as páginas são HTML gerado em JavaScript puro (Server-Side Rendering via Node.js stdlib).

```
sniper-api/
├── landing-page.js     → kairoscheck.net/
├── ui.js               → /dashboard (CEO Command Center)
├── pricing-page.js     → /pricing
├── account-page.js     → /account
├── enterprise-page.js  → /enterprise
├── docs-pages.js       → /docs/*
├── trust-pages.js      → /status, /changelog, /compare/*
├── legal-pages.js      → /privacy, /terms
├── success-page.js     → /success (pós-checkout)
└── og-image.js         → /og-image.png (gerador dinâmico)
```

**`packages/web/`** — Existe como directório mas está vazio (só `node_modules`). Não está em uso.

---

## 2. Design System

### Tokens de Cor (dark theme)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0a` | Fundo principal |
| `--surface` | `#111111` | Cards, painéis |
| `--surface-2` | `#1a1a1a` | Superfícies secundárias |
| `--border` | `#1f1f1f` | Bordas subtis |
| `--border-strong` | `#2a2a2a` | Bordas visíveis |
| `--text` | `#f5f5f5` | Texto principal |
| `--text-secondary` | `#a3a3a3` | Texto secundário |
| `--text-tertiary` | `#737373` | Texto de suporte |
| `--accent` | `#00d97e` | Verde principal (acções, sucesso) |
| `--accent-hover` | `#00b369` | Hover do accent |
| `--danger` | `#ef4444` | Vermelho (fraude, bloqueio) |
| `--warning` | `#f59e0b` | Amarelo (revisão) |

### Tipografia

| Família | Uso | Fonte |
|---|---|---|
| Inter (400, 500, 600, 700, 800) | Texto, UI | Bunny Fonts (GDPR-compliant) |
| JetBrains Mono (400, 500) | Código, API keys, scores | Bunny Fonts |

### Estética Geral

Dark terminal aesthetic — voltado para developers e tech-savvy founders. Consistente com o público-alvo (indie devs, solo founders).

---

## 3. Páginas Existentes

### 3.1 Landing Page (`/`)
- Headline: *"Fraud detection API for indie devs"*
- Counter dinâmico (domínios analisados, ameaças bloqueadas)
- Proof bar com métricas reais (só aparece quando há dados reais — boa decisão)
- SEO: meta tags completas, OG tags, Twitter card, canonical, LD+JSON
- Google Site Verification activo

### 3.2 Dashboard CEO (`/dashboard`)
- Métricas globais: total verificações, bloqueadas, review, permitidas
- Valor protegido estimado em €
- Feed de actividade recente (últimas 12 verificações)
- Lista de tenants (sidebar)
- Tempo relativo (agora / 5s / 3m / 2h)

### 3.3 Pricing Page (`/pricing`)
- 6 planos: Free / Starter €29 / Growth €59 / Pro €99 / Scale €249 / Enterprise €800+
- LD+JSON Schema.org Product markup (bom para SEO)
- Checkout via Stripe

### 3.4 Trust Pages (`/compare/*`)
- Comparações com competidores: Stripe Radar, Sift, SEON, MaxMind
- `/status`, `/changelog`, `/examples`

### 3.5 Páginas de suporte
- Account, Enterprise, Docs, Legal (Privacy, Terms), Success

---

## 4. Débitos Técnicos — Frontend/UX

### CRÍTICOS

| ID | Débito | Impacto |
|---|---|---|
| UX-001 | HTML em template literals JS — sem separação de concerns | Impossível manter, testar ou reutilizar componentes |
| UX-002 | CSS duplicado em cada ficheiro de página | Qualquer mudança de design requer editar 8+ ficheiros |
| UX-003 | `packages/web/` existe mas está vazio | Confusão sobre onde está o frontend "real" |

### ALTOS

| ID | Débito | Impacto |
|---|---|---|
| UX-004 | Sem componentes reutilizáveis | Cabeçalho, footer, botões — tudo duplicado |
| UX-005 | Sem testes de UI | Regressões visuais invisíveis |
| UX-006 | Dashboard sem autenticação visível | `/dashboard` exposto? Verificar se tem protecção |
| UX-007 | Sem estados de loading/error no frontend | Utilizador não sabe o que acontece durante API calls |
| UX-008 | Sem design system formalizado | Tokens definidos em `trust-pages.js` mas não partilhados |

### MÉDIOS

| ID | Débito | Impacto |
|---|---|---|
| UX-009 | Sem audit de acessibilidade (a11y) | WCAG compliance desconhecida |
| UX-010 | Mobile não verificado | Responsividade assumida, não testada |
| UX-011 | `packages/web/` — propósito não definido | Vai ser um dashboard separado? Uma SPA? |
| UX-012 | Counter dinâmico na landing usa data fake | `180 + days * 400` — não são dados reais |

---

## 5. Pontos Fortes

| Ponto | Detalhe |
|---|---|
| Dark theme consistente | Tokens de cor bem definidos |
| Sem framework = sem bundle | Zero JavaScript no cliente — ultra-rápido |
| Bunny Fonts | GDPR-compliant (não usa Google Fonts) |
| SEO completo | Meta tags, OG, Twitter Card, LD+JSON, canonical |
| Proof bar condicional | Só mostra dados quando reais — sem números falsos |
| prefers-reduced-motion | Respeita preferências de acessibilidade do sistema |

---

## 6. Respostas às Perguntas do @architect

**Q: O `packages/web` é um frontend completo ou landing page?**
R: Está vazio. Todo o frontend está em `sniper-api/` como SSR. O `packages/web/` pode ser uma tentativa de criar uma SPA separada que nunca foi desenvolvida.

**Q: Existe dashboard para o tenant ver as suas verificações?**
R: Existe `/dashboard` mas é o "CEO Command Center" — métricas globais, não por tenant. O `/account` pode ter detalhes por tenant (não analisado em detalhe).

**Q: O design system está definido?**
R: Tokens existem em `trust-pages.js` mas não estão centralizados nem partilhados entre ficheiros. Cada página define o seu próprio CSS.

---

## 7. Recomendação de Evolução

**Curto prazo (sem mudar stack):**
1. Extrair CSS base para `packages/sniper-api/styles.js` — um ficheiro partilhado
2. Criar helpers `components.js` para cabeçalho, footer, botões
3. Resolver `packages/web/` — remover ou definir propósito

**Médio prazo:**
1. Migrar para Astro ou Next.js para o frontend público (landing, pricing, docs)
2. Manter dashboard como SSR simples — não justifica framework
3. Formalizar design system com tokens exportáveis

---

*Fase 3 completa. Próximo: @architect — Fase 4 (Consolidação DRAFT)*
