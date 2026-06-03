# aiox-map Skill

**Anvil's Framework Cartographer**

Audit completo do framework AIOX — agentes, tasks, workflows, autoridades, DNA mental e dependências.

## Quick Start

```bash
/aiox-map                  # Markdown report (default)
/aiox-map --json          # JSON export
/aiox-map --graph         # Interactive HTML visualization
/aiox-map --dna-only      # DNA patterns only
```

## What It Does

1. **Scans AIOX Structure**
   - Descobre 13 agentes definidos
   - Mapeia 120+ tasks por categoria
   - Identifica 8 workflows e suas sequências
   - Enumera 6 checklists de validação

2. **Extracts Agent DNA**
   - Autoridades exclusivas (quem pode fazer push, criar PRs)
   - Delegações válidas (padrões de handoff)
   - Responsabilidades e limites
   - Interações agent-to-agent

3. **Authority Matrix**
   - Operações exclusivas por agent (@devops = git push only)
   - Operações bloqueadas (quem NÃO pode fazer)
   - Delegation chains (quem delega para quem)
   - Violação detection

4. **Framework Layer Analysis**
   - L1 Core (NEVER modify) ← protected by deny rules
   - L2 Templates (extend-only)
   - L3 Config (mutable with exceptions)
   - L4 Runtime (always mutable)

5. **Generates Three Output Formats**
   - **Markdown:** Narrative report, human-readable
   - **JSON:** Machine-readable export for CI/CD
   - **HTML/ASCII:** Visual process-map with connections

## Use Cases

| Scenario | Command | Output |
|----------|---------|--------|
| "How does AIOX work?" | `/aiox-map` | Markdown report |
| "New team member onboarding" | `/aiox-map --graph` | Interactive diagram |
| "CI/CD integration" | `/aiox-map --json` | JSON for processing |
| "What are the core principles?" | `/aiox-map --dna-only` | DNA patterns only |
| "Check for framework issues" | `/aiox-map` | Audit section + issues |

## Files

```
.claude/skills/aiox-map/
├── SKILL.md              # Skill definition (frontmatter + workflow)
├── test-prompts.md       # 10 trigger tests, 10 no-trigger tests
├── example-output.md     # Sample markdown report
├── README.md             # This file
└── references/
    └── agent-registry.md # Authority patterns reference
```

## Execution Context

**Context Mode:** Fork (isolated subagent)  
**Agent:** general-purpose  
**Model:** Claude Sonnet (default)

Runs in forked context to:
- Keep audit clean without conversation pollution
- Allow deep scanning of multiple files
- Generate outputs without space constraints
- Support parallel processing of agents + tasks

## Output Examples

### Default (Markdown)

```
# AIOX Framework Cartography

Framework: Synkra AIOX v2.1
Components: 13 agents, 120+ tasks, 8 workflows

## Agent Registry
[Table of all agents + authorities]

## Authority Matrix
[Exclusive ops by agent]

## DNA Mental Model
[Core principles, patterns, workflows]
```

### --json

```json
{
  "framework": "Synkra AIOX",
  "version": "2.1",
  "agents": [
    {
      "id": "dev",
      "persona": "Dex",
      "exclusive_operations": ["git add", "git commit"],
      "blocked_operations": ["git push", "gh pr create"]
    }
  ],
  "authority_matrix": { ... },
  "workflows": [ ... ]
}
```

### --graph

Opens interactive HTML with:
- Agent nodes + task nodes
- Edges showing delegation
- Authority visualizations
- Searchable/zoomable interface

## Constraints

**MUST:**
- Read real AIOX artefacts (never invent)
- Preserve exact authorities from rules
- Include file paths for quick navigation
- Validate structural consistency

**MUST NOT:**
- Modify framework (.aiox-core/)
- Assume unstated structure
- Create fictional process-maps
- Omit exclusive operations

## When to Use

✅ **Use /aiox-map when:**
- You need to understand AIOX architecture
- Onboarding new team members
- Validating framework consistency
- Generating CI/CD integrations
- Documenting the system

❌ **Don't use /aiox-map for:**
- Creating stories (use @sm)
- Implementing features (use @dev)
- Validating stories (use @po)
- Design decisions (use @architect)
- Database schema (use @data-engineer)

## Authority & Delegation

This skill reads only — never modifies framework. All recommendations are informational.

For actual changes to AIOX:
- **L1 Core changes** → Denied by framework (not modifiable)
- **L2 Templates** → Denied by framework (extend-only)
- **L3 Config** → @devops manages via allow rules
- **L4 Runtime** → Anyone can modify (stories, squads, tests)

---

**Crafted by Anvil, the Artificer**  
**Part of Claude Code Mastery Suite**

*"Every repeated workflow deserves its own skill. Context is architecture."*
