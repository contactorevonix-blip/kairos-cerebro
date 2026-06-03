# ADR-3: API Contracts — KAIROS COMMAND CENTER

**Status:** Aceite
**Data:** 2026-06-03
**Arquitecta:** Aria (@architect)
**Epic:** EPIC-004

---

## Princípios de Design da API

1. **REST simples** — sem GraphQL, sem tRPC, sem overkill para uma ferramenta local
2. **JSON sempre** — `Content-Type: application/json`
3. **Envelope consistente** — todas as respostas têm `{ ok, data, error }`
4. **Paths relativos ao projectRoot** — nunca paths absolutos no response
5. **Read-heavy** — 8 GET endpoints, 1 POST, 1 PUT (com guard)

---

## Envelope de Resposta

```typescript
// Sucesso
{ ok: true,  data: T,      error: null }

// Erro
{ ok: false, data: null,   error: { code: string, message: string } }
```

---

## Endpoints

### GET /api/health

```json
Response:
{
  "ok": true,
  "data": {
    "doctor": {
      "pass": 15,
      "warn": 0,
      "fail": 0,
      "checks": [
        { "name": "settings-json", "status": "PASS", "detail": "97 deny rules" },
        { "name": "git-hooks",     "status": "PASS", "detail": "pre-commit + pre-push" }
      ]
    },
    "bracket": "FRESH",
    "hookLatencyMs": 32.5,
    "layersLoaded": 2,
    "totalRules": 73
  }
}
```

---

### GET /api/state

```json
Response:
{
  "ok": true,
  "data": {
    "workflowState": {
      "activeStory": "3.5",
      "phase": "Done",
      "activeAgent": null,
      "nextExpectedAction": "*qa-gate 3.5",
      "track": null,
      "pendingGates": ["qa-gate", "pre-push-quality-gate"]
    },
    "gitState": {
      "branch": "main",
      "modifiedCount": 5,
      "lastCommit": "e065e54",
      "lastCommitMsg": "feat: AIOX Masterclass EPIC-003 completo"
    },
    "activeProduct": "kairos-check"
  }
}
```

---

### GET /api/files?path=.claude

```json
// Retorna os filhos de um directório (uma camada)
Response:
{
  "ok": true,
  "data": {
    "path": ".claude",
    "layer": "L3",
    "layerColor": "#EAB308",
    "type": "directory",
    "children": [
      { "name": "CLAUDE.md",    "type": "file",      "ext": "md",   "layer": "L3", "editable": false },
      { "name": "settings.json","type": "file",      "ext": "json", "layer": "L3", "editable": false },
      { "name": "rules",        "type": "directory", "layer": "L3", "childCount": 15 },
      { "name": "hooks",        "type": "directory", "layer": "L3", "childCount": 12 },
      { "name": "skills",       "type": "directory", "layer": "L3", "childCount": 52 }
    ]
  }
}
```

---

### GET /api/files/content?path=.claude/CLAUDE.md

```json
Response:
{
  "ok": true,
  "data": {
    "path": ".claude/CLAUDE.md",
    "layer": "L3",
    "editable": false,
    "content": "# Synkra AIOX Development Rules...",
    "mimeType": "text/markdown",
    "size": 4821,
    "lastModified": "2026-05-28T10:00:00Z"
  }
}
```

---

### GET /api/agents

```json
Response:
{
  "ok": true,
  "data": {
    "groups": [
      {
        "id": "aiox-core",
        "label": "AIOX Core",
        "agents": [
          {
            "id": "dev",
            "name": "Dex",
            "role": "Implementação de código",
            "icon": "💻",
            "color": "#3B82F6",
            "status": "idle",
            "commands": ["*help", "*dev-develop-story", "*apply-qa-fixes"],
            "authority": { "can": ["git add", "git commit"], "cannot": ["git push"] },
            "sourcePath": ".aiox-core/development/agents/dev.md"
          }
        ]
      },
      {
        "id": "claude-code-mastery",
        "label": "Claude Code Mastery",
        "agents": [ /* 8 agents */ ]
      }
    ],
    "total": 40
  }
}
```

---

### GET /api/stories

```json
Response:
{
  "ok": true,
  "data": {
    "byStatus": {
      "Draft":      [],
      "Ready":      [],
      "InProgress": [],
      "InReview":   [],
      "Done": [
        {
          "id": "3.5",
          "title": "Masterclass Chatbot Dashboard Improvements",
          "epic": "EPIC-003",
          "executor": "@dev",
          "hasQaGate": false,
          "sdcProgress": 80,
          "path": "docs/stories/3.5.masterclass-chatbot-dashboard-improvements.md"
        }
      ]
    },
    "total": 15,
    "warnings": [
      { "type": "missing-qa-gate", "count": 15, "message": "15 stories Done sem QA Gate" }
    ]
  }
}
```

---

### GET /api/metrics

```json
Response:
{
  "ok": true,
  "data": {
    "hooks": {
      "totalDurationMs": 32.5,
      "bracket": "FRESH",
      "layersLoaded": 2,
      "layersSkipped": 6,
      "totalRules": 73,
      "perLayer": { "constitution": { "ms": 0.75, "rules": 34 } }
    },
    "entityRegistry": {
      "totalLines": 19653,
      "entities": 822,
      "updatedHoursAgo": 43
    },
    "sessionDigests": [],
    "hooksActive": 12
  }
}
```

---

### POST /api/discuss

```json
Request:
{
  "problem": "Devo adicionar caching ao sniper-engine?",
  "agents": ["architect", "qa", "analyst"],
  "mode": "panel"
}

Response (streaming NDJSON):
{ "agent": "architect", "thinking": true }
{ "agent": "architect", "chunk": "Do ponto de vista de arquitectura..." }
{ "agent": "architect", "done": true, "full": "Do ponto de vista de arquitectura..." }
{ "agent": "qa",        "thinking": true }
{ "agent": "qa",        "chunk": "Os riscos de introduzir caching são..." }
...
{ "synthesis": "Recomendação: sim, mas com estratégia X..." }
```

---

### PUT /api/files/content

```json
Request:
{
  "path": "docs/stories/3.5.masterclass-chatbot-dashboard-improvements.md",
  "content": "# Story 3.5 ...(updated)..."
}

Response (sucesso):
{
  "ok": true,
  "data": { "path": "...", "written": true, "layer": "L4" }
}

Response (bloqueado — L1/L2):
{
  "ok": false,
  "data": null,
  "error": {
    "code": "WRITE_GUARD_VIOLATION",
    "message": "Cannot write to L1 path: .aiox-core/constitution.md. Only L4 paths are writable.",
    "layer": "L1",
    "allowedRoots": ["docs/", "squads/", "packages/", "bin/"]
  }
}
```

---

## Classificação de Layers por Path

```javascript
// lib/write-guard.js — lógica de classificação
const LAYER_MAP = {
  L1: ['.aiox-core/core/', '.aiox-core/constitution.md', 'bin/aiox.js', 'bin/aiox-init.js'],
  L2: ['.aiox-core/development/', '.aiox-core/infrastructure/'],
  L3: ['.aiox-core/data/', '.claude/settings.json', 'core-config.yaml'],
  L4: ['docs/', 'squads/', 'packages/', 'bin/kairos', 'tests/'],
};
```
