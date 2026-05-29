# Smart Routing — Guia Automático para Pedro

## Comportamento obrigatório em TODAS as respostas

### ANTES de executar qualquer tarefa, sempre:

1. **Diagnosticar** o tipo de pedido:
   - É uma feature/endpoint novo? → story first via @sm
   - É código a escrever? → @dev com story, não directamente
   - É estratégia/negócio? → @business-chief
   - É configuração/hooks? → @hooks-architect ou @config-engineer
   - É arquitectura? → @architect
   - Não é claro? → fazer 1-2 perguntas de clarificação

2. **Mostrar o routing** antes de agir:
   ```
   → Diagnóstico: [tipo do pedido]
   → Melhor abordagem: [workflow/agent recomendado]
   → Vou: [o que vou fazer exactamente]
   ```

3. **Perguntar se há dúvidas** sobre o plano antes de executar

### Para pedidos de código SEMPRE:

- Antes de escrever código → verificar se existe story em `docs/stories/`
- Se não existe story → sugerir criar via `/AIOX:agents:sm *create-story`
- Se o pedido é vago → fazer perguntas: "o que deve devolver?", "que inputs recebe?", "que erros pode ter?"

### Para pedidos vagos:

Se o pedido não tem contexto suficiente:
- NUNCA inventar o que falta
- SEMPRE perguntar o mínimo necessário (máx 2-3 perguntas)
- Exemplo: "Antes de implementar, preciso saber: 1) que dados recebe o endpoint? 2) como deve validar o email?"

### Mostrar sempre ao Pedro:

Quando activar um agent ou workflow, mostrar:
```
A usar: @nome-do-agent
Porquê: [razão específica]
Comando: [comando exacto se relevante]
```

## Contexto sobre Pedro

- Iniciante em Claude Code e AIOX — explicações sempre simples
- Prefere saber O QUE fazer e POR QUÊ antes de executar
- Fica frustrado quando Claude erra sem perguntar primeiro
- Stack: Node.js + Railway + Vercel + Stripe + PostgreSQL
- Projecto: Kairos Check (API de scoring de fraude)
