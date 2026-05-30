# Task: Parse Intent
# Agent: forge-classifier (Compass)
# Gate: G01

## Objectivo
Transformar a descrição em linguagem natural num intent estruturado com entidade, domínio, contexto e ambiguidade score.

## Inputs
- `system_description`: string livre do utilizador
- `user_context`: contexto adicional (opcional)

## Processo

### Passo 1 — Extracção de Entidade
Identifica:
- **O quê**: que sistema/produto/ferramenta
- **Para quem**: utilizadores alvo, casos de uso
- **Porquê**: problema que resolve
- **Constraints**: tecnologia, prazo, orçamento mencionados

### Passo 2 — Ambiguidade Score
Calcula score de 0.0 a 1.0:
- 0.0 = totalmente claro
- 1.0 = completamente vago

Factores que aumentam ambiguidade:
- Sem utilizador alvo definido (+0.2)
- Sem problema específico (+0.2)
- Múltiplos sistemas possíveis (+0.2)
- Linguagem vaga ("algo parecido com", "tipo um") (+0.2)
- Sem constraints técnicos (+0.1)
- Sem escala definida (+0.1)

### Passo 3 — Gate de Clarificação
SE ambiguity_score > 0.3:
  - Formular 2-3 perguntas específicas (não mais de 3)
  - Aguardar resposta antes de avançar
  - Re-calcular score com novas informações

### Passo 4 — Structured Intent Output
Produzir:
```yaml
intent:
  entity: "nome do sistema"
  domain: "domínio de negócio"
  target_users: "quem vai usar"
  problem_solved: "que problema resolve"
  constraints: []
  ambiguity_score: 0.0
  clarifications_needed: []
```

## Output
- `intent.yaml` em `outputs/{system_name}/`
- Ambiguity score e clarificações pendentes

## Critérios de Completude
- [ ] Entidade identificada
- [ ] Domínio definido
- [ ] Utilizadores alvo identificados
- [ ] Problema específico articulado
- [ ] ambiguity_score < 0.3 (ou clarificações obtidas)
