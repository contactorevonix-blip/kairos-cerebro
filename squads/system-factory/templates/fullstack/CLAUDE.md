# CLAUDE.md — Fullstack Web App
# Template version: 1.0.0 | system-factory/templates/fullstack
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** Fullstack Web App (SSR + API + DB)
**Stack:** Next.js 14+ (App Router) + TypeScript + PostgreSQL + Prisma + Tailwind + Vercel
**URL Produção:** {PRODUCTION_URL}
**GitHub:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **Server-First** — Server Components por defeito; Client Components só quando há interactividade
2. **Type Safety End-to-End** — TypeScript do schema Prisma até ao componente React, sem `any`
3. **Colocation** — componente, estilos, testes e tipos vivem juntos na mesma feature folder
4. **Progressive Enhancement** — funcionalidade core funciona sem JS; JS melhora a experiência
5. **Single Source of Truth** — schema Prisma define o domínio; tudo o resto deriva dele

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` | @devops EXCLUSIVO | todos os outros |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation (FE + BE) | @dev | — |
| DB migrations (Prisma) | @data-engineer | @dev directo |
| Architecture decisions | @architect | — |
| UX/UI patterns | @ux-design-expert | — |

---

## 4. Hook Configuration

Hooks activos neste projecto:

| Hook | Evento | Ficheiro | Propósito |
|------|--------|---------|-----------|
| Commit lint | PreToolUse[Bash(git commit*)] | pre-commit-lint.cjs | Bloqueia termos depreciados |
| Push authority | PreToolUse[Bash(git push*)] | enforce-git-push-authority.cjs | Só @devops faz push |
| Type check | PreToolUse[Bash(git commit*)] | tsc-check.cjs | Bloqueia commit com erros de tipo |
| Post observer | PostToolUse | post-tool-use-observer.cjs | Log de todas as tool calls |
| Session start | SessionStart | session-start.cjs | Injecta contexto no início |

---

## 5. Database Conventions

**ORM:** Prisma (schema-first)

**Naming:**
- Models: `PascalCase` singular (ex: `User`, `Order`)
- Tabelas: `snake_case` plural via `@@map` (ex: `@@map("users")`)
- Colunas: `camelCase` no schema, `snake_case` na DB via `@map`
- Primary keys: `id String @id @default(cuid())`

**Obrigatório em cada model:**
```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

**Migrations:** `npx prisma migrate dev --name {descricao}` em dev; `prisma migrate deploy` em prod.

---

## 6. API Design Standards

**Route Handlers:** `app/api/{resource}/route.ts` (Next.js App Router)
**Server Actions:** preferidos para mutations originadas em forms; Route Handlers para APIs públicas

**Response format (Route Handlers):**
```json
{ "data": {}, "error": null }
```

**HTTP Status Codes:**
- 200/201: Success
- 400: Validation error (Zod)
- 401/403: Auth
- 404: Not Found
- 500: Internal (nunca expor stack traces)

**Validação:** Zod schema em cada Server Action e Route Handler, partilhado entre client e server.

---

## 7. Security Rules

**NUNCA:**
- Secrets no bundle do cliente (só vars `NEXT_PUBLIC_*` chegam ao browser)
- `dangerouslySetInnerHTML` sem sanitização (DOMPurify)
- Queries Prisma com input não validado
- Expor IDs sequenciais internos (usar cuid/uuid)

**SEMPRE:**
- Auth check em cada Server Action e Route Handler protegido
- CSRF protection (Next.js Server Actions têm built-in)
- Validação Zod no server, nunca confiar no client
- Headers de segurança via `next.config.js` (CSP, HSTS, X-Frame-Options)

---

## 8. Testing Requirements

**Coverage mínimo:** 80% em lógica de negócio e Server Actions

**Tipos obrigatórios:**
- Unit (Vitest): utils, validações Zod, lógica pura
- Component (Testing Library): comportamento de componentes, não implementação
- E2E (Playwright): fluxos críticos (signup, checkout, login)

**Pattern:**
```tsx
describe('LoginForm', () => {
  it('shows validation error on empty email', async () => { ... });
  it('submits and redirects on success', async () => { ... });
});
```

**Antes de qualquer PR:** `npm test` e `npm run test:e2e` passam.

---

## 9. Deployment Pipeline

**Branches:**
- `main` → produção (Vercel)
- `feat/*` → preview deployments automáticos (Vercel)

**CI/CD (.github/workflows):**
1. `ci.yml` — lint + typecheck + test em cada PR
2. Vercel deploy automático por branch

**Processo de release:**
1. `npm run build` passa localmente
2. PR com preview deployment
3. Review da preview URL
4. Merge para main → deploy de produção
5. Verificar Core Web Vitals na Vercel Analytics

---

## 10. Performance Benchmarks

| Métrica | Target |
|---------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (rota SSR) | < 600ms |
| Bundle JS inicial | < 200KB gzip |

**Alertas:** qualquer Core Web Vital fora do target em produção → investigar.

---

## 11. Error Handling Patterns

**Server:**
```tsx
try {
  const data = schema.parse(input);
  // ...
} catch (e) {
  if (e instanceof ZodError) return { error: e.flatten() };
  logger.error(e);
  return { error: { code: 'INTERNAL', message: 'Algo correu mal' } };
}
```

**Client:** usar `error.tsx` (error boundaries do App Router) e `not-found.tsx` por segmento de rota. Estados de loading via `loading.tsx` + Suspense.

---

## 12. Observability & Monitoring

**Logging:** estruturado (pino) no server; nunca logar PII sem masking.

**Métricas:**
- Core Web Vitals (Vercel Analytics / Speed Insights)
- Error rate por rota
- Server Action latência
- Query Prisma lenta (> 100ms)

**Alerts:** error rate > 1% em 5 min; LCP P75 > 2.5s.

---

## 13. Development Workflow

**Branches:**
```
main (produção)
└── feat/{story-id}-{description}
└── fix/{issue-description}
```

**Commit format:**
```
feat: add dashboard page [Story 2.1]
fix: correct hydration mismatch on header [Story 2.3]
```

**PR checklist:**
- [ ] `npm run lint` + `npm run typecheck` clean
- [ ] `npm test` passa
- [ ] Preview deployment verificada
- [ ] Sem `console.log` esquecido

---

## 14. Onboarding Checklist

1. **Clone e setup:**
   ```bash
   git clone {GITHUB_URL}
   cd {PROJECT_NAME}
   cp .env.example .env.local
   npm install
   ```

2. **Variáveis de ambiente:**
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — random string ≥ 32 chars
   - `NEXTAUTH_URL` — URL base da app

3. **Base de dados:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Correr localmente:**
   ```bash
   npm run dev  # porta 3000
   ```

5. **Correr testes:**
   ```bash
   npm test && npm run test:e2e
   ```

---

## 15. Quality Gates

**Antes de qualquer commit:**
- `npm run typecheck` clean (zero erros de tipo)
- Sem secrets no diff

**Antes de qualquer PR:**
- `npm run lint` + `npm test` 100%
- Preview deployment funcional

**Antes de deploy para produção:**
- Core Web Vitals dentro dos targets na preview
- Accessibility audit (Lighthouse ≥ 90)

---

## Secções Específicas Fullstack

## 16. SSR/CSR Strategy

**Regra base:** Server Component por defeito. Adicionar `"use client"` apenas quando necessário.

| Usa Server Component quando | Usa Client Component quando |
|-----------------------------|-----------------------------|
| Fetch de dados, acesso a DB/secrets | Hooks (`useState`, `useEffect`) |
| Conteúdo estático ou pouco interactivo | Event handlers (`onClick`, `onChange`) |
| SEO-crítico | Browser APIs (`localStorage`, `window`) |
| Reduzir bundle do cliente | Bibliotecas client-only (charts interactivos) |

**Rendering strategies (App Router):**
- **Static (default):** páginas sem dados dinâmicos → build-time
- **Dynamic:** `export const dynamic = 'force-dynamic'` ou uso de `cookies()`/`headers()`
- **ISR:** `export const revalidate = 60` para revalidação periódica
- **Streaming:** `<Suspense>` + `loading.tsx` para enviar HTML progressivamente

**Empurrar Client Components para as folhas da árvore** — manter pais como Server Components para minimizar o JS enviado.

---

## 17. Component Architecture

**Atomic Design adaptado:**
```
components/
├── ui/         # atoms: Button, Input, Badge (presentational, sem lógica de negócio)
├── composed/   # molecules: SearchBar, Card, FormField
└── features/   # organisms: feature-specific (UserDashboard, CheckoutFlow)
app/
└── (routes)/   # páginas e layouts
```

**Naming conventions:**
- Ficheiros de componente: `PascalCase.tsx` (`Button.tsx`)
- Um componente exportado por ficheiro (default export para o principal)
- Props interface: `{ComponentName}Props`

**Colocation:** cada feature reúne componente, hook, teste e tipos:
```
features/checkout/
├── CheckoutForm.tsx
├── CheckoutForm.test.tsx
├── useCheckout.ts
└── types.ts
```

**Estilos:** Tailwind inline; extrair para `cva` (class-variance-authority) quando há variantes. Sem CSS modules salvo casos justificados.

---

## 18. State Management

**Server state vs Client state — escolher conscientemente:**

| Tipo de estado | Ferramenta | Exemplo |
|----------------|-----------|---------|
| Server state (dados remotos) | React Query (TanStack) ou SWR | lista de pedidos, perfil do user |
| Server state em RSC | fetch directo + `cache()` | dados na render inicial |
| Client global (UI) | Zustand | tema, sidebar aberta, carrinho |
| Client local | `useState` | input de form, toggle |
| URL state | searchParams / `nuqs` | filtros, paginação, tab activa |

**Regras:**
- Não duplicar server state em client state — React Query/SWR é a cache
- Preferir URL state para estado partilhável/bookmarkável (filtros, paginação)
- Zustand só para estado verdadeiramente global de UI; evitar Context para estado que muda muito (causa re-renders)

---

## 19. SEO & Performance

**Metadata:** usar `generateMetadata()` por rota; nunca deixar título/descrição genéricos.
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title, description, openGraph: { ... }, twitter: { ... } };
}
```

**Image optimization:**
- Sempre `next/image` com `width`/`height` explícitos (previne CLS)
- `priority` na imagem above-the-fold (LCP)
- Formatos modernos: AVIF/WebP automáticos

**Font loading:** `next/font` (self-hosted, sem layout shift, `display: swap`).

**Core Web Vitals targets:** ver secção 10. Auditar com Lighthouse + Vercel Speed Insights.

**Sitemap & robots:** `app/sitemap.ts` e `app/robots.ts` gerados dinamicamente.

---

## 20. Accessibility Standards

**Mínimo:** WCAG 2.1 nível AA.

**Obrigatório:**
- HTML semântico (`<button>`, `<nav>`, `<main>`, headings hierárquicos) antes de ARIA
- Todas as imagens com `alt` (vazio `alt=""` se decorativa)
- Contraste de cor ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande)
- Foco visível em todos os elementos interactivos
- Forms com `<label>` associado a cada input

**ARIA patterns:** usar só quando o HTML semântico não chega (modais, tabs, combobox). Seguir os patterns do WAI-ARIA Authoring Practices.

**Keyboard navigation:**
- Tudo navegável por teclado (Tab, Enter, Esc, setas onde aplicável)
- Focus trap em modais; restaurar foco ao fechar
- Skip link para o conteúdo principal

**Verificação:** `eslint-plugin-jsx-a11y` no CI + audit manual com teclado e screen reader nos fluxos críticos.
