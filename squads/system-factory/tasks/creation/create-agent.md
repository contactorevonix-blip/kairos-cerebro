# Task: Create Agent
# Agent: forge-builder (Forge) + delegate @aiox-master
# Trigger: Activado quando um agent específico é necessário (gap individual, não domínio inteiro)

## Objectivo
Criar um agent específico quando o agent-creation-plan identifica uma capacidade pontual sem cobertura. Usa `@aiox-master *create agent`; DNA via @oalanicolas se for um expert real.

## Inputs
- `outputs/{system_name}/planning/agent-creation-plan.md` (decisão create_agent)
- Capacidade a cobrir + stories que dependem dela

## Processo
1. Confirmar a decisão `create_agent` (G23) e a capacidade alvo.
2. Definir a persona: id, alias, role, escopo, tools permitidas, gates aplicáveis.
3. Se baseado num **expert real** → DNA extraction via @oalanicolas (princípios, estilo, heurísticas).
4. Executar `@aiox-master *create agent` para gerar a definição completa.
5. Garantir alinhamento com a Constitution e o agent-authority (escopo e permissões correctos).
6. Colocar a definição em `.claude/agents/` e validar o frontmatter (tool scope).

## Output
Agent definition em `.claude/agents/{agent}.md`:
```yaml
agent_created:
  id: fraud-scorer
  alias: ledger
  role: "Calcula scores de risco a partir de sinais OSINT"
  scope: ["src/scoring/**"]
  tools: [Read, Edit, Bash, Grep]
  dna_extracted_from: null
  authority_aligned: true
  blocks_stories: ["2.1", "2.2"]
```

## Critérios de Completude
- [ ] Decisão create_agent confirmada (G23)
- [ ] Persona definida (id/alias/role/escopo/tools)
- [ ] DNA extraction via @oalanicolas (se expert real)
- [ ] @aiox-master *create agent executado
- [ ] Alinhado com Constitution e agent-authority
- [ ] Frontmatter (tool scope) validado
