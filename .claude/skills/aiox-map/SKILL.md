---
name: aiox-map
description: |
  Audita framework AIOX completo (agentes, tasks, workflows, process-maps).
  Extrai DNA mental (padrões, autoridades, princípios). Gera relatório estruturado.
  Use para: entender arquitectura AIOX, visualizar dependências, onboarding rápido.
argument-hint: "[--json] [--graph] [--dna-only]"
context: fork
agent: general-purpose
user-invocable: true
---

# AIOX Map — Framework Audit & DNA Extraction

Execute um audit completo do framework AIOX, mapeando agentes, tasks, workflows, autoridades e dependências.

## Workflow

### Step 1: Scan AIOX Structure
- Descobre agentes em `.aiox-core/development/agents/`
- Lista tasks em `.aiox-core/development/tasks/`
- Mapeia workflows em `.aiox-core/development/workflows/`
- Identifica process-maps e checklists

### Step 2: Extract Agent DNA
Para cada agente (agentes ficheiro YAML/MD):
- Nome, persona, role, escopo
- Autoridades exclusivas (se presentes)
- Dependências (delegações)
- Responsabilidades e limites

### Step 3: Map Task Execution
Para cada task importante:
- Inputs/outputs
- Agent executor primário
- Pré-requisitos
- Complexidade (simple/standard/complex)

### Step 4: Identify Authority Matrix
Extrai padrões de agent authority de:
- `.claude/rules/agent-authority.md`
- Frontmatter de agentes
- Decisões de framework

### Step 5: Generate Outputs

**Option A: JSON (--json)**
Estrutura machine-readable com:
```json
{
  "framework": "Synkra AIOX",
  "version": "2.1",
  "agents": [
    {
      "id": "dev",
      "name": "Dex",
      "exclusive_operations": ["git add", "git commit"],
      "blocked_operations": ["git push"],
      "tasks": []
    }
  ],
  "authority_matrix": {},
  "workflows": [],
  "dependencies": {}
}
```

**Option B: Markdown (default)**
Relatório narrativo com:
- Agent Registry (tabela)
- Authority Matrix (operações vs agentes)
- Task Dependency Graph
- DNA Patterns (princípios, workflows)

**Option C: HTML/ASCII (--graph)**
Visualização interactiva:
- ASCII tree ou HTML DOT diagram
- Agent-task connections
- Authority flows

### Step 6: Validate & Summarize
- Verifica inconsistências (autoridades conflitantes, tasks órfãs)
- Conta entidades (N agentes, M tasks, K workflows)
- Sugere melhorias

## Constraints

**MUST:**
- Ler artefactos reais (nunca inventar agentes/tasks)
- Preservar autoridades exactas conforme rules
- Incluir linhas de arquivo para navegação rápida
- Validar referencialidade entre entidades

**MUST NOT:**
- Modificar framework (.aiox-core/)
- Assumir estrutura não verificada
- Gerar process-maps fictional
- Omitir autoridades exclusivas (@devops, @pm, @po, @sm)

## Output Options

| Flag | Output | Use Case |
|------|--------|----------|
| (none) | Markdown report | Leitura humana, relatório |
| `--json` | JSON structure | Parsing programático, CI/CD |
| `--graph` | HTML/ASCII diagram | Visualização, apresentação |
| `--dna-only` | DNA patterns only | Princípios e padrões |

## Examples

```
/aiox-map
→ Gera markdown relatório completo

/aiox-map --json
→ Retorna JSON para processamento

/aiox-map --graph
→ Abre HTML interactivo com dependências

/aiox-map --dna-only
→ Extrai DNA mental (padrões, princípios)
```

## Architecture

Este skill executa em **forked context** para:
- Manter audit limpo sem contaminar conversação principal
- Permitir leitura profunda de múltiplos ficheiros sem overhead
- Gerar outputs sem espaço limitado

Suporta processamento paralelo de agentes + tasks para scan rápido.

---

*Crafted by Anvil — AIOX Framework Cartographer*
