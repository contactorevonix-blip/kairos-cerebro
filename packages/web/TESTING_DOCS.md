# Documentação — Guia de Testes Locais

## Como Testar Localmente

### 1. Iniciar o Dev Server

```bash
cd packages/web
npm run dev
```

Abre em: `http://localhost:3000/docs`

### 2. Testar Cada Página

#### `/docs` — API Reference
- [ ] Título e descrição carregam
- [ ] Quick links (4 cards) têm hover effects
- [ ] Código cURL é copiável
- [ ] Tabelas de risk bands aparecem
- [ ] CTA button "Generate Free API Key" leva a `/dashboard/keys`

#### `/docs/playground` — Interactive Playground
- [ ] Input fields aceitam texto
- [ ] Botão "Run Check" desativa enquanto loading
- [ ] Spinner animado aparece
- [ ] Resultado aparece após ~1s
- [ ] Score mostra em cor correcta (verde <50, amber 50-70, vermelho >70)
- [ ] Copy buttons funcionam (visuais "Copied" feedback)
- [ ] Tabs de linguagem mudam conteúdo
- [ ] Links de Get API Key funcionam

#### `/docs/signals` — Risk Signals
- [ ] Accordion expande/contrai com animation
- [ ] Icons (ChevronDown) rotacionam correctamente
- [ ] Conteúdo expandido mostra indicators
- [ ] Category filter funciona
- [ ] "All Categories" button reseta
- [ ] Total weight mostra ~270 pts

#### `/docs/examples` — Code Examples
- [ ] 9 language tabs aparecem
- [ ] Conteúdo muda ao clicar em tab
- [ ] Copy button funciona
- [ ] "Copied" feedback visual por 2 segundos
- [ ] Grid de error handling mostra 4 items
- [ ] Pricing tiers grid responsive

#### `/docs/rate-limits` — Rate Limits
- [ ] 3 pricing cards aparecem
- [ ] "Professional" card tem "Popular" badge
- [ ] Botões CTA em cada card
- [ ] Response headers table tem 6 linhas
- [ ] Error codes estão colorizados (vermelho)
- [ ] Best practices section tem 6 items

### 3. Testar Navegação

#### Sidebar
- [ ] Links destacam página activa
- [ ] Hover effects funcionam
- [ ] Mobile: hamburger menu aparece
- [ ] Mobile: click hamburger abre/fecha sidebar

#### Top Bar
- [ ] Logo é clicável (vai para `/docs`)
- [ ] "Get API Key" button é visível e funciona
- [ ] Responsive em mobile

### 4. Responsividade

```bash
# Chrome DevTools
F12 → Toggle device toolbar (Ctrl+Shift+M)
```

Testar em:
- [ ] iPhone 12 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1440px)

### 5. Performance

```bash
Chrome DevTools → Network tab

Esperar:
- [ ] /docs: <1s (First Contentful Paint)
- [ ] /docs/playground: <1.5s
- [ ] Imagens: não existem (só cores)
```

### 6. Dark Theme

```bash
# Não há theme switcher — dark theme é padrão
# Verificar em browser:
```

- [ ] Background dark (#0a0a0a ou `--kc-bg-base`)
- [ ] Text light (#ededed ou `--kc-text-primary`)
- [ ] Accent blue (#3b82f6 ou `--kc-accent`)
- [ ] Borders subtle (whitespace/10%)

### 7. Animações

- [ ] Playground: resultado aparece com fade-in
- [ ] Signals: accordion expande suavemente
- [ ] Copy feedback: background muda cor
- [ ] Nenhuma animação > 300ms (evitar lag)

### 8. CSS Tokens

Verificar `packages/web/src/app/globals.css` define:

```css
:root {
  --kc-bg-base:    oklch(9%  0 0);
  --kc-bg-surface: oklch(13% 0 0);
  --kc-text-primary: oklch(94% 0 0);
  --kc-accent:     oklch(62.3% 0.214 259.815);
  /* ... */
}
```

Se faltam variáveis, adicione à raiz em `globals.css`.

### 9. Links Internos

- [ ] `/docs` → `/docs/playground` funciona
- [ ] `/docs/playground` → `/docs/signals` funciona
- [ ] Todos os links navegam sem full refresh
- [ ] Back button funciona

### 10. Dados Fictícios (Playground)

Demo domains no playground:
- `paypal.com` → 8 pts (safe)
- `stripe.com` → 5 pts (safe)
- `suspect-store.tk` → 78 pts (high)
- `totally-not-phishing.xyz` → 92 pts (critical)
- `new-marketplace.co` → 45 pts (medium)

Outros domains → random 0-100

### 11. Verificação de Código

```bash
# No VSCode
Ctrl+Shift+O → Outline

Verificar:
- [ ] Nenhum console.log()
- [ ] Nenhum var { ... } não-tipados
- [ ] Imports correctos (react, lucide-react, framer-motion)
- [ ] Nenhum ficheiro não-usado
```

### 12. Validação SEO

Cada página tem metadata (conforme Next.js 16 App Router):

```typescript
export const metadata = {
  title: '...',
  description: '...',
}
```

Verificar:
- [ ] `/docs` → title "API Reference — KairosCheck"
- [ ] `/docs/playground` → title "Playground — KairosCheck API"
- [ ] `/docs/signals` → title "Risk Signals — KairosCheck"
- [ ] `/docs/examples` → title "Code Examples — KairosCheck"
- [ ] `/docs/rate-limits` → title "Rate Limits & Quotas — KairosCheck"

---

## Checklist Final (@Quinn)

- [ ] Todos os ficheiros compilam sem erros
- [ ] Sem TypeScript errors
- [ ] Sem console.logs
- [ ] Responsive funciona
- [ ] Animações suaves
- [ ] Links internos funcionam
- [ ] Copy buttons funcionam
- [ ] Cores correctas (OKLCH tokens)
- [ ] Dark theme consistente
- [ ] SEO metadata presente
- [ ] Sem secrets em código
- [ ] Sem ficheiros temporários

---

## Common Issues

### Variáveis CSS não encontradas

**Problema:** `--kc-accent` undefined

**Solução:**
```bash
# Adicionar a globals.css
cd packages/web/src/app
cat globals.css | grep --kc-accent
```

Se faltam, adicione via @Uma (Passo 3: Design System).

### Framer Motion não anima

**Problema:** `<motion.div>` não move

**Solução:**
```typescript
// Adicionar 'use client' no topo
'use client'

import { motion } from 'motion/react'
```

Verificar se `motion` está importado de `motion/react` (não `framer-motion`).

### Playground carrega infinitamente

**Problema:** "Analyzing request..." não termina

**Solução:**
```bash
# Verificar console
F12 → Console → ver se há erros

# Geralmente é await Promise.then() não resolvendo
# Código está correcto (usa setTimeout)
```

### Sidebar não responsível

**Problema:** Não desaparece em mobile

**Solução:**
```jsx
// Verificar className
className="hidden md:block"
// Deve estar em jsx, não style prop
```

---

## Deploy Checklist (@Gage)

Antes de `git push origin main`:

1. [ ] `npm run build` sem erros
2. [ ] `npm run lint` sem erros (se existe)
3. [ ] Testar em dev: `npm run dev`
4. [ ] Navegar /docs → /docs/playground → /docs/signals
5. [ ] Copy button testa (Ctrl+C manual)

Depois:
```bash
git add packages/web/src/app/docs/
git add packages/web/src/app/docs/layout.tsx
git add packages/web/TESTING_DOCS.md

git commit -m "feat: docs + interactive playground

- Complete API reference with 5 pages
- Interactive fraud detection playground
- 30 risk signals documented
- 10 code examples (JS, Python, Go, cURL, etc.)
- Pricing & rate limiting page
- Responsive design, dark theme, animations"

git push origin main
vercel --prod
```

---

## Validation por @Quinn

Correr este comando:

```bash
cd packages/web

# Build test
npm run build

# Dev test
npm run dev &
sleep 3
curl http://localhost:3000/docs
curl http://localhost:3000/docs/playground
curl http://localhost:3000/docs/signals
curl http://localhost:3000/docs/examples
curl http://localhost:3000/docs/rate-limits
```

Esperar:
- ✅ Todos os curl retornam HTTP 200
- ✅ HTML contém `<h1>` tags esperadas
- ✅ Nenhum erro 500

---

## Permissões

Ficheiros criados pertencem a:
- **Dex:** Implementação (código)
- **Quinn:** Validação (testes, QA)
- **Gage:** Deploy (git push, vercel)

Cadeia de aprovação:
```
Dex implementa → Quinn valida → Gage deploya
```

---

Última actualização: 2026-05-20
Próximo: @Quinn QA validation
