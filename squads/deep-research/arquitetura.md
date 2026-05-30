# Arquitectura — Deep Research Squad

## Pipeline

```
Query → dr-orchestrator (classifica UC-001~004)
    │
    ├── TIER 0 (sequential obrigatório)
    │   Sackett (PICO) → Booth (methodology) → Creswell (design)
    │
    ├── TIER 1 (parallel — seleccionado por use case)
    │   forsgren │ cochrane │ higgins │ klein │ gilad
    │
    └── QA (sequential obrigatório)
        Ioannidis (evidence) → Kahneman (decision) → Synthesis Report
```

## Use Cases

| UC | Label | Tier 1 Primary |
|----|-------|---------------|
| UC-001 | Technical Deep Dive | forsgren + cochrane |
| UC-002 | Strategic Decision | klein + gilad |
| UC-003 | Competitive Intel | gilad + higgins |
| UC-004 | Evidence Synthesis | cochrane + forsgren |

## Quality Gates

| Gate | Agent | Critério |
|------|-------|----------|
| QG-001 | Sackett | PICO com 4 componentes |
| QG-002 | Booth | Review type correcto |
| QG-003 | Ioannidis | PPV > threshold |
| QG-004 | Kahneman | 12-Question Checklist |

## Activation

```
@dr-orchestrator
/AIOX:agents:dr-orchestrator
```
