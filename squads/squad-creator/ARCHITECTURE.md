# Architecture — Squad Creator

## Pipeline

```
Request → squad-chief (triage)
    │
    ├── RESEARCH: mind-research-loop.md (3-5 iterations + devil's advocate)
    │
    ├── DNA: @oalanicolas *clone-mind (Voice + Thinking DNA)
    │   └── QG-SC-5.1: DNA Review (15+ [SOURCE:])
    │
    ├── PROCESS: @pedro-valerio (veto conditions + flow validation)
    │   └── QG-SC-6.1: Squad Review (smoke tests + handoffs)
    │
    └── OUTPUT: Squad completo em squads/{name}/
```

## Agents

| Agent | Tier | Role |
|-------|------|------|
| squad-chief | orchestrator | Orquestra criação, clone minds > create bots |
| oalanicolas | 1 | Voice DNA + Thinking DNA extraction |
| pedro-valerio | 1 | Process absolutist — veto conditions |

## Quality Pipeline

```
SC_RES_001 → SC_AGT_001 → DNA Review → Smoke Tests → SC_AGT_004
```

## Activation
```
/Chiefs:agents:squad-chief
@squad-chief
```
