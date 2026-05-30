# FORGE — Universal System Factory

**Da descrição em linguagem natural ao sistema elite em produção.**

## O que é

O FORGE é uma infraestrutura de criação de sistemas automática dentro do KAIROS_CEREBRO.  
Dizes o que queres. O pipeline faz o resto.

## Como usar

```
@forge-classifier "quero uma API de scoring de fraude para indie devs"
```

O pipeline trata de tudo:
1. **Classifica** o tipo de sistema e complexidade
2. **Pesquisa** mercado, padrões, concorrentes com dados reais
3. **Arquitecta** tech stack, data model, security
4. **Planeia** epics, stories, acceptance criteria
5. **Constrói** scaffold, código, hooks, CLAUDE.md, squads
6. **Verifica** com 30-point elite checklist
7. **Entrega** sistema com score 90-100/100

## Agents

| Agent | Alias | Papel |
|-------|-------|-------|
| `@forge-classifier` | `@compass` | Classifica, pontua, roteia |
| `@forge-researcher` | `@oracle` | Research profunda com dados reais |
| `@forge-architect` | `@blueprint` | Arquitectura completa + ADRs |
| `@forge-planner` | `@cartographer` | Epics, stories, dependências |
| `@forge-builder` | `@forge` | Scaffold, código, config |
| `@forge-verifier` | `@sentinel` | QA, security, elite checklist |

## Tipos de sistema suportados

- `saas-api` — APIs SaaS com billing, auth, rate limiting
- `fullstack` — Apps completas Next.js + backend
- `data-pipeline` — ETL/ELT com idempotência e monitoring
- `agent-system` — Squads e workflows AIOX
- `cli-tool` — Ferramentas de linha de comando
- `library` — Packages npm reutilizáveis

## Workflows

| Workflow | Quando usar | Etapas |
|---------|------------|--------|
| `wf-universal-factory` | STANDARD/COMPLEX | 30 |
| `wf-quick-create` | SIMPLE | 15 |
| `wf-research-loop` | Loop de research | até score 8.0 |
| `wf-verification-loop` | Loop de verificação | até score 96 |

## Pontos de decisão humana

O utilizador decide apenas em 3 momentos:
1. Após classificação — "Este tipo e stack fazem sentido?"
2. Após arquitectura — "Approvas o design?"
3. Após veredicto — "Deploy para produção?"

Tudo o resto é automático.

## Veredicto final

| Score | Classificação |
|-------|--------------|
| 96-100 | ★ ELITE MUNDIAL |
| 90-95 | ✓ PRODUCTION READY |
| 80-89 | ⚠ NEEDS WORK |
| < 80 | ✗ RETRY |
