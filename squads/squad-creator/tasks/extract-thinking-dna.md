# extract-thinking-dna

## Objectivo
Extrair Thinking DNA completo — como o expert decide, raciocina e resolve problemas.

## Agent: oalanicolas (Opus)

## Veto Conditions
- STOP se framework principal não é replicável por terceiros
- STOP se heurísticas não têm QUANDO usar
- NUNCA aceitar frameworks famosos sem documentação específica deste expert

## Steps

### 1. Framework Principal (sistema operacional)
- O método central que o expert usa para tudo
- Deve ser replicável: tem passos, sequência, critérios

### 2. Frameworks Secundários
- Metodologias complementares
- Quando usa cada um (contexto)

### 3. Framework de Diagnóstico
- Como o expert avalia uma situação antes de agir
- Perguntas que faz sempre

### 4. Heurísticas de Decisão (mínimo 10)
Formato obrigatório:
```
QUANDO [situação específica] → [decisão/acção]
PORQUE [razão documentada] [SOURCE: ...]
```

### 5. Heurísticas de Veto (deal-breakers)
- O que o expert recusa fazer mesmo com pressão
- Documentado com exemplos reais

### 6. Arquitectura de Decisão
- Sequência de perguntas que faz antes de decidir
- Filtros e critérios de priorização

### 7. Recognition Patterns (radares mentais)
- O que o expert detecta imediatamente
- Sinais de alarme vs sinais de oportunidade

### 8. Objection Handling
- Objecções mais comuns no domínio
- Como o expert responde (com fonte)

## Output: frameworks/{slug}-framework.md

```markdown
# Thinking DNA — {Nome do Expert}

## Framework Principal
[nome + descrição + passos]

## Frameworks Secundários
[lista com contexto de uso]

## Framework de Diagnóstico
[perguntas + sequência]

## Heurísticas de Decisão
[QUANDO → ENTÃO, com [SOURCE:]]

## Heurísticas de Veto
[deal-breakers documentados]

## Arquitectura de Decisão
[sequência de perguntas]

## Recognition Patterns
[radares mentais]

## Objection Handling
[objecções + respostas documentadas]
```

## Quality Gate
- Mínimo 10 heurísticas com QUANDO
- Framework principal replicável (tem passos)
- Score Thinking Quality >= 7/9
