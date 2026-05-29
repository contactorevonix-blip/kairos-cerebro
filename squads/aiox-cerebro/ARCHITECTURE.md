# aiox-cerebro — Architecture

## Single Agent Design

Kronos é um agente único (não um squad multi-agent). A "squad" structure existe
para organizar os ficheiros operacionais requeridos pelo SC_AGT_004.

```
.claude/agents/aiox-cerebro.md
    │
    ├── command_loader (7 comandos → 7 task files)
    │
    ├── squads/aiox-cerebro/tasks/
    │   ├── audit-workflow.md
    │   ├── gap-analysis-workflow.md
    │   ├── gold-mechanisms-workflow.md
    │   ├── generate-workflow.md
    │   ├── self-audit-workflow.md
    │   ├── clone-structure-workflow.md
    │   └── next-3-actions-workflow.md
    │
    ├── squads/aiox-cerebro/templates/
    │   ├── audit-report-tmpl.md
    │   ├── gap-analysis-tmpl.md
    │   └── gold-mechanisms-tmpl.md
    │
    ├── squads/aiox-cerebro/checklists/
    │   └── aiox-cerebro-quality-gate.md
    │
    └── squads/aiox-cerebro/data/
        └── canonical-baseline.yaml
```

## CRITICAL_LOADER_RULE

Antes de qualquer *comando:
LOOKUP → STOP → LOAD → VERIFY → EXECUTE
FAILURE TO LOAD = FAILURE TO EXECUTE

Garante determinismo: cada execução é idêntica.

## Knowledge Sources

Inline no agente (não lidos em runtime):
- constitution.md v1.0.0
- create-agent.md v3.0
- agent-quality-gate.md v4.0
- tier-system-framework.md v1.0.0
- quality-dimensions-framework.md v1.0.0
- decision-heuristics-framework.md v1.0.0
- agent-handoff.md
- story-lifecycle.md
- workflow-chains.yaml
- quality-gates.yaml
