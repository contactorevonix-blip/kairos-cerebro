# Arquitectura — Claude Code Mastery Squad

## Contrato do Squad

**Entry point:** `@claude-mastery-chief` ou `/Claude-Code-Mastery:agents:claude-mastery-chief`

**Input:** Qualquer questão sobre Claude Code
**Output:** Resposta directa + routing para especialista

---

## Triage Engine (Orion)

```
Query → Orion analisa keywords
    │
    ├── hooks/lifecycle → Latch
    ├── mcp/servers → Piper  
    ├── subagent/swarm → Nexus
    ├── settings/permissions → Sigil
    ├── skills/plugins → Anvil
    ├── CI/CD/project → Conduit
    └── roadmap/changelog → Vigil
```

## Pipeline

```
1. Orion triage (< 2s)
2. Quick answer inline
3. Route: "Para profundidade, activa @{specialist}"
4. Especialista executa com tools específicas
```

## Activation Matrix

| Via | Formato |
|-----|---------|
| Native | `@hooks-architect` |
| Squad command | `/Claude-Code-Mastery:agents:hooks-architect` |
| AIOX skill | `/AIOX:agents:hooks-architect` (N/A — diferente namespace) |
