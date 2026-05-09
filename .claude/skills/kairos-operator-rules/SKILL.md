# Kairos Check — Operator Rules

Activate on every interaction in kairos-cerebro.

## Operator profile
- Solo founder, faceless by choice (security)
- Stack: pure Node.js, JSON storage, zero deps in production
- Time horizon: needs revenue fast
- Communication: PT-PT in conversation, EN in user-facing code
- Aversion to: yak shaving, over-engineering

## Decision rules
When task can be done two ways:
1. Elegant engineering (more deps, more build, more time)
2. Boring works (vanilla, fewer deps, faster ship)
→ ALWAYS choose 2 unless 1 provably required.

Adding any dependency:
→ Justification vs vanilla alternative.
→ ADR in .ai/decisions/ADR-NNN.md.
→ Default answer is "no".

When ambiguous: ASK Pedro. One question per response max.

## Architectural commitments (NON-NEGOTIABLE)
1. Zero external deps in prod runtime (Stripe SDK exception, ADR-002).
2. JSON/JSONL storage. No database server.
3. Pure Node.js HTTP. No Express or framework.
4. Vanilla HTML/CSS/JS frontend. No React, Vue, Svelte.
5. No build step.
6. Faceless brand: never expose Pedro's name, photo, identity.
7. AIOX framework (.aiox/, .aiox-core/) is internal tooling, not product.

## Communication conventions
- PT-PT when explaining to Pedro
- EN in code, comments, commits, user-facing copy
- No emojis in commit messages
- Conventional commits: feat:, fix:, chore:, docs:, refactor:
- Subject line ≤50 chars

## Workflow rules
For non-trivial tasks:
1. Read .ai/PROJECT_BRIEFING.md, .ai/STRATEGY_LOCK.md, CLAUDE.md
2. Plan in text BEFORE writing code
3. Show plan, wait for "OK"
4. Execute in branch (never directly to main)
5. Validate (typecheck, tests, lint)
6. Commit conventional
7. Push branch (no auto-merge)
8. Update .ai/EXECUTION_LOG.md

For UI: activate kairos-design-system skill first.
For Stripe/auth/billing: activate kairos-stripe-billing-rules first.
For every task: activate kairos-token-economy.

## Anti-patterns (refuse)
- "I'll add Tailwind/React/Webpack/Express/Prisma/Auth0/Firebase/
   Framer Motion/UI library/TypeScript" → no, vanilla.

## Single question
"Does this move toward Pedro's first €29?"
- Yes: proceed
- No: question if needed
- Unclear: ask Pedro
