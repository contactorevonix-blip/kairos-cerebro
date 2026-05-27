# Tech Stack — Kairos Check

## Backend (API)
- **Runtime:** Node.js 18+ (CommonJS, zero TypeScript)
- **HTTP:** Native `node:http` — sem Express, sem Fastify
- **Hosting:** Railway (`railway.toml`)
- **Processo:** PM2 (`ecosystem.config.js`)

## Frontend (Website)
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui + Radix UI
- **Animações:** Framer Motion, Three.js, React Three Fiber
- **Auth:** NextAuth.js + Prisma
- **Hosting:** Vercel (`packages/web/vercel.json`)

## Base de Dados
- **API:** Ficheiros JSON locais em `.kairos-data/` (sniper-db)
- **Website:** PostgreSQL via Prisma (Neon ou Railway Postgres)

## Billing
- **Pagamentos:** Stripe (checkout, webhooks, portal)
- **Emails:** Resend

## Infraestrutura
- **Containerização:** Docker (`Dockerfile`)
- **CI/CD:** GitHub Actions (`.github/workflows/`)
- **Deploy backend:** Railway (auto-deploy on push to main)
- **Deploy frontend:** Vercel (auto-deploy on push to main)

## Testes
- **Runner:** Node.js built-in test runner (`node:test`)
- **Comando:** `npm test`
- **Ficheiros:** `tests/*.test.js` + `packages/sniper-api/*.test.js`
