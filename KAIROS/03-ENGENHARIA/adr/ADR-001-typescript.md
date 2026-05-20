# ADR-001: TypeScript em packages/web/

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + CEO

## Contexto
packages/web/ já tem TypeScript 5.7.2 instalado. Decisão: manter ou remover.

## Decisão
**MANTER TypeScript.** Já está instalado, já funciona, não mudar.

## Raciocínio
- Zero custo de migração (já está)
- shadcn/ui é optimizado para TypeScript
- Erros de tipo apanham bugs em tempo de desenvolvimento
- Melhor DX para @Dex (autocomplete, type safety)

## Alternativas Rejeitadas
- JavaScript puro: o backend é JS puro (correcto lá) mas o frontend tem componentes complexos onde TypeScript ajuda

## Consequências
- Todos os ficheiros .tsx (não .jsx)
- tsconfig.json com strict: true
- Tipos para: Stripe webhook events, API responses, shadcn props

## Regra
Nunca usar `any`. Se não sabes o tipo → `unknown` + type guard.
