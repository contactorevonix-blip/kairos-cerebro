# Claude Code Mastery Squad — Architecture

> 8-agent full-spectrum Claude Code expertise squad. Entry point: Orion (claude-mastery-chief). Pipeline: triage → specialist → synthesis.

---

## Pipeline Overview

```
                    User Query
                        |
              claude-mastery-chief (Orion)
                [Tier 0 — Orchestrator]
                        |
          ┌─────────────┼─────────────┐
          |             |             |
    [Hooks?]     [MCP/Config?]  [Skills/Project?]
          |             |             |
     Latch(T1)     Piper(T1)    Anvil(T2)
     Hooks         MCP          Skills
          |             |             |
    Nexus(T1)     Sigil(T1)   Conduit(T2)
    Swarm         Config      Integration
          |                         |
                              Vigil(T2)
                              Roadmap
```

**Flow:** Query → Triage (Orion) → Specialist → Direct Answer + Route

---

## Tier Architecture

```
Tier 0 — Orchestrator:
  claude-mastery-chief (Orion): routing, triage, cross-cutting

Tier 1 — Core Mastery (parallel):
  hooks-architect (Latch):     17 hook events, damage control
  mcp-integrator (Piper):      MCP servers, tool discovery
  swarm-orchestrator (Nexus):  agent teams, worktrees
  config-engineer (Sigil):     settings, permissions, CLAUDE.md

Tier 2 — Strategic (parallel):
  skill-craftsman (Anvil):     skills, plugins, context engineering
  project-integrator (Conduit): CI/CD, brownfield, AIOX bridge
  roadmap-sentinel (Vigil):    changelog, migration, plan-first
```

---

## Activation Paths

| Via | Command | Example |
|-----|---------|---------|
| Native subagent | `@name` | `@hooks-architect` |
| Squad command | `/Claude-Code-Mastery:agents:name` | `/Claude-Code-Mastery:agents:hooks-architect` |
| AIOX skill | `/AIOX:agents:name` | `/AIOX:agents:hooks-architect` |
| claude-mastery-chief | `@claude-mastery-chief` then `*hooks` | Routes to Latch |

---

## Routing Matrix (Orion triage)

| Keywords | Route To | Persona |
|----------|----------|---------|
| hook, PreToolUse, lifecycle, damage control | hooks-architect | Latch |
| mcp, server, tool discovery, stdio | mcp-integrator | Piper |
| subagent, swarm, worktree, parallel | swarm-orchestrator | Nexus |
| settings, permission, CLAUDE.md, sandbox | config-engineer | Sigil |
| skill, plugin, slash command, context | skill-craftsman | Anvil |
| CI/CD, integrate, AIOX, monorepo | project-integrator | Conduit |
| update, changelog, roadmap, migration | roadmap-sentinel | Vigil |

---

## Data Layer

```
data/
├── hook-patterns.yaml          ← 17 hook events reference
├── mcp-integration-catalog.yaml ← MCP servers catalog
├── claude-code-quick-ref.yaml  ← Quick reference card
├── ci-cd-patterns.yaml         ← CI/CD patterns
└── project-type-signatures.yaml ← Project type detection
```

---

## Squad Statistics

| Metric | Value |
|--------|-------|
| Total agents | 8 |
| Tier 0 | 1 (Orion) |
| Tier 1 | 4 (Latch, Piper, Nexus, Sigil) |
| Tier 2 | 3 (Anvil, Conduit, Vigil) |
| Tasks | 35 |
| Workflows | 3 |
| Checklists | 7 |
| Templates | 7 |
| Data files | 5 |
| Elite minds | 8 |
