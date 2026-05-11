---
audience: founder, senior-agents (morgan, alex, aria)
update_cadence: as_needed
review_cadence: monthly
---

# Memoria Elefante — Segundo Cérebro Institucional

Este é o **segundo cérebro** da Kairos Check. Tudo o que vale a pena lembrar para além de uma sprint vive aqui.

## Princípio

O código (`packages/`) responde **como** fazemos.
A docs (`docs/`) responde **o que** construímos.
O `.ai/` responde **como o engine está hoje**.
A **Memoria Elefante** responde **porque existimos, para quem, e onde vamos**.

Se uma decisão depende de mercado, cliente, narrativa, estratégia ou lição estratégica — vai para aqui.
Se for técnica, vai para `docs/architecture/` ou `.ai/`.

## Estrutura

| Pasta | Pergunta a que responde |
|---|---|
| `00-vision/` | Quem somos, missão, north-star metric, brand |
| `01-market/` | Concorrência, ICPs, posicionamento |
| `02-customers/` | Vozes reais de utilizadores (interviews, churn, testimunhos) |
| `03-strategy/` | Pricing, expansão geográfica, moat building |
| `04-lessons/` | Post-mortems CEO-level, lições estratégicas |
| `99-narratives/` | Storytelling, decks, PR, fundraising |

## Regra de uso

1. **Antes** de uma decisão estratégica (não técnica): consultar a pasta relevante.
2. **Após** uma conversa com cliente, concorrente, investidor ou jornalista: capturar a substância aqui.
3. Cada ficheiro tem YAML frontmatter (`audience`, `update_cadence`, `review_cadence`) — respeitar a cadência.

## O que NÃO vai aqui

- Código, schemas, ADRs técnicos → `docs/`
- Audits de engine, benchmarks, segurança → `.ai/`
- Stories e backlog operacional → `docs/stories/`, `docs/backlog/`
- Secrets, credenciais → vault (`packages/vault/`)
