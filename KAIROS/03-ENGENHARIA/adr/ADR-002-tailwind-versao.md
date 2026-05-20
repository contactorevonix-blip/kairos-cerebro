# ADR-002: Tailwind CSS v3 com CSS Variables OKLCH

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + CEO

## Contexto
O OPERATIONAL_SYSTEM_COMPLETE.md define um design system em OKLCH.
O package.json tem Tailwind CSS 3.4.17 instalado.
Decisão: manter v3 ou migrar para v4?

## Decisão
**MANTER Tailwind v3 + CSS Variables OKLCH no globals.css.**

## Raciocínio
- Tailwind v4 é rewrite completo — quebraria toda a config existente
- Com runway de 45 dias, risco de migração não é aceitável
- OKLCH funciona perfeitamente em v3 via CSS variables
- shadcn/ui usa CSS variables para theming → já compatível
- Zero custo de migração com esta abordagem

## Implementação
globals.css já tem os tokens OKLCH correctos:
  --kc-bg-base: oklch(9% 0 0)
  --kc-accent: oklch(62.3% 0.214 259.815)
  etc.

tailwind.config.js usa os tokens via:
  colors: { 'kc-bg': 'var(--kc-bg-base)', ... }
  OU arbitrários: bg-[oklch(9%_0_0)]

## Alternativas Rejeitadas
- Tailwind v4: tem native OKLCH mas quebra config v3 inteiramente
- CSS puro sem Tailwind: perde utilidades de layout e responsividade

## Consequências
- Actualizar tailwind.config.js para mapear CSS variables
- globals.css já está correcto (actualizado hoje)
- shadcn/ui continua a funcionar sem alterações
