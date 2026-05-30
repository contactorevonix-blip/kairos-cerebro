# Task: Competitive Intelligence
# Agent: forge-researcher (Oracle) + delegate @gilad
# Gate: G07

## Objectivo
Recolher inteligência competitiva sobre no mínimo 5 concorrentes com dados reais verificados e identificar gaps de mercado exploráveis.

## Inputs
- `outputs/{system_name}/research/pico-question.yaml` (Comparison list)
- `classification.yaml` (tipo de sistema)
- Web search (EXA via @devops) para dados reais

## Processo

### Passo 1 — Identificar concorrentes
Compilar lista de >= 5 concorrentes:
- Directos (mesma proposta)
- Indirectos (resolvem o mesmo problema de outra forma)

### Passo 2 — Recolher dados por concorrente
Para CADA concorrente, recolher com SOURCE verificável:
- **Features**: capacidades principais
- **Pricing**: planos e preços reais (com URL/data)
- **Pontos fortes**: o que fazem bem
- **Pontos fracos**: queixas reais (reviews, G2, reddit)
- **Market position**: quota, financiamento, maturidade

### Passo 3 — Verificação (@gilad)
Cada dado marcado com SOURCE + data. Dados sem fonte → INFERRED, não contam para os 5.
- Regra G07: < 5 concorrentes com dados reais verificados → BLOCK, continuar research

### Passo 4 — Análise de gaps
Identificar gaps exploráveis:
- Features que nenhum concorrente oferece bem
- Segmentos mal servidos
- Pontos de dor recorrentes

## Output
`outputs/{system_name}/research/competitive-intel.md`
```markdown
## Concorrente: Stripe Radar
- Features: ML scoring, regras custom, 3DS
- Pricing: $0.05/transação (fonte: stripe.com/radar/pricing, 2026-05)
- Forte: integração nativa Stripe
- Fraco: lock-in, opaco (fonte: reddit r/stripe)
- Posição: líder, parte da Stripe

## Gaps de mercado
- Nenhum concorrente é OSINT-first para indie devs
- Pricing previsível ausente no segmento solo founder
```

## Critérios de Completude
- [ ] >= 5 concorrentes com dados reais verificados (SOURCE + data)
- [ ] Cada concorrente tem features/pricing/forte/fraco/posição
- [ ] Dados INFERRED separados dos verificados
- [ ] >= 2 gaps de mercado exploráveis identificados
