---
description: Confidence scoring para decisões de agentes — importado do SuperClaude v4.3.0
---

# Confidence Scoring

Antes de executar qualquer acção significativa, avalia o nível de confiança:

## Tiers de Acção

| Score | Acção |
|---|---|
| >= 90% | Avançar directamente sem confirmação |
| 70-89% | Apresentar alternativas ao utilizador antes de executar |
| < 70% | Fazer perguntas de clarificação antes de prosseguir |

## Budget por Complexidade

| Tipo de Task | Token Budget |
|---|---|
| Simple (typo fix, config change) | 200 tokens |
| Medium (bug fix, small feature) | 1,000 tokens |
| Complex (new feature, refactor) | 2,500 tokens |

## Aplicação

- **SE** a tarefa não está clara → score < 70% → perguntar primeiro
- **SE** há múltiplas abordagens válidas → score 70-89% → apresentar opções
- **SE** o caminho é claro e validado → score >= 90% → executar

## ROI

Gastar 100-200 tokens a avaliar confiança poupa 5.000-50.000 tokens em retrabalho.

*Fonte: SuperClaude v4.3.0 ConfidenceChecker — docs/research/v2-framework-research-REAL.md (Q3)*
