---
description: Token budget por complexidade de task — importado do SuperClaude v4.3.0
---

# Token Budget

Guia de eficiência de tokens por tipo de tarefa.

## Budget por Complexidade

| Tipo | Budget | Exemplos |
|---|---|---|
| **Simple** | 200 tokens | Typo fix, config change, rename |
| **Medium** | 1,000 tokens | Bug fix, small enhancement |
| **Complex** | 2,500 tokens | New feature, refactor, architecture |

## Model Routing (Squad Creator PRO pattern)

| Complexidade | Modelo | Quando |
|---|---|---|
| Low | claude-haiku-4-5 | Templates, boilerplate, formatação |
| Medium | claude-sonnet-4-6 | Análise, síntese, código padrão |
| High | claude-opus-4-8 | Criação de DNA, decisões de arquitectura |

## Aplicação

- Para tasks simples: usar `--model haiku` se Claude Code suportar
- Para sessions longas: activar Token Efficiency Mode (7 modos do SuperClaude)
- Monitorar: se uma task excede 3x o budget esperado → parar e re-avaliar scope

*Fonte: SuperClaude v4.3.0 + Squad Creator PRO Model Routing — docs/research/v2-framework-research-REAL.md (Q2 + Q3)*
