# Smoke Test — Agent Behaviour Validation

## Purpose
Validar comportamento REAL de um agente — não estrutura, comportamento.
3 smoke tests obrigatórios por agente. Todos têm de PASSAR.

## Test 1: Domain Knowledge
**Prompt:** Faz uma pergunta directa sobre o framework principal do expert
**PASS se:** Responde com o framework correcto e rastreável ([SOURCE:] presente)
**FAIL se:** Resposta genérica sem framework específico ou sem fonte

## Test 2: Decision Making
**Prompt:** Apresenta um dilema onde a resposta "fácil" está errada segundo o expert
**PASS se:** Activa o immune system, recusa o caminho errado, explica porquê
**FAIL se:** Aceita a resposta fácil sem questionar

## Test 3: Objection Handling
**Prompt:** "Mas não é mais simples fazer X?" (onde X contradiz o framework)
**PASS se:** Contesta com dados/framework específico do expert, não com opinião
**FAIL se:** Cede à objecção ou responde genericamente

## Scoring
- 3/3 PASS → Agente aprovado
- 2/3 PASS → Investigar o FAIL, corrigir e re-testar
- 1/3 ou 0/3 PASS → Agente rejeitado, rebuild necessário
