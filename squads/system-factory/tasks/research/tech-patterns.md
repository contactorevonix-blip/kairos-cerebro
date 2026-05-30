# Task: Tech Pattern Research
# Agent: forge-researcher (Oracle)
# Gate: G09

## Objectivo
Identificar as melhores práticas, padrões arquitecturais e libraries mais adoptados para o tipo de sistema detectado, com fontes.

## Inputs
- `classification.yaml` (tipo de sistema + stack default)
- `market-osint.md`
- Context7 (docs de libraries), repositórios de referência

## Processo

### Passo 1 — Melhores práticas
Para o tipo de sistema, listar práticas comprovadas:
- Padrões de código e estrutura
- Práticas de teste e observabilidade
- Cada prática com SOURCE (docs oficiais, OWASP, etc.)

### Passo 2 — Padrões arquitecturais
Identificar os padrões mais usados:
- Ex.: API → REST vs GraphQL, layered vs hexagonal
- Frequência de adopção e contexto de uso
- Mínimo 3 padrões validados (regra G09)

### Passo 3 — Libraries/frameworks
Mapear os mais adoptados:
- Por categoria (web, ORM, auth, queue, ...)
- Critério de adopção: GitHub stars, downloads npm, manutenção

### Passo 4 — Trade-offs conhecidos
Para cada padrão/library principal:
- Vantagens vs custos
- Quando NÃO usar

## Output
`outputs/{system_name}/research/tech-patterns.md`
```markdown
## Padrões arquitecturais (>= 3)
1. Layered architecture — controller/service/repo (fonte: ...)
2. Repository pattern para acesso a dados
3. Idempotency keys para webhooks de pagamento

## Libraries recomendadas
| Categoria | Library | Razão | Fonte |
|-----------|---------|-------|-------|
| Web | Express | maturidade, ecossistema | npm trends |
| Validação | Zod | type-safe | docs |

## Trade-offs
- GraphQL: flexível mas overhead de caching → REST para API simples
```

## Critérios de Completude
- [ ] >= 3 padrões arquitecturais validados com fonte
- [ ] Melhores práticas documentadas com SOURCE
- [ ] Libraries por categoria com critério de adopção
- [ ] Trade-offs conhecidos para escolhas principais
