# EPIC-agent-determinism — Índice

**Goal:** Caminho determinístico e incremental da ACTIVAÇÃO à EXECUÇÃO para os 11 agentes core + aiox-master, sem ficheiros fantasma nem fórmulas de path erradas.

**Track:** Enterprise (PRD obrigatório) · **Autor:** @pm (Morgan) · **Data:** 2026-06-13

## Ficheiros

| Ficheiro | Conteúdo |
|---|---|
| [EPIC-agent-determinism.md](./EPIC-agent-determinism.md) | PRD do epic, achados F1-F6, risco, DoD, handoff @sm |
| [story-A-ide-file-resolution.md](./story-A-ide-file-resolution.md) | P0 · @skill-craftsman → @qa · corrigir IDE-FILE-RESOLUTION nos 11 SKILL.md (F1) |
| [story-B-devloadalwaysfiles-config.md](./story-B-devloadalwaysfiles-config.md) | P0 · @config-engineer → @architect · devLoadAlwaysFiles/devDebugLog/toolsLocation (F2,F3) |
| [story-C-deprecate-orphan-templates.md](./story-C-deprecate-orphan-templates.md) | P2 · @skill-craftsman → @qa · deprecar templates activation-instructions-* (F4) |
| [story-D-development-vs-product-source-of-truth.md](./story-D-development-vs-product-source-of-truth.md) | P1 · @architect+@skill-craftsman → @pm · fonte de verdade + agent-teams (F5,F6) |
| [story-E-e2e-agent-validation-suite.md](./story-E-e2e-agent-validation-suite.md) | P1 · @qa → @dev · suite E2E em CI/aiox doctor (Escopo Expandido) |

## Sequência

```
D (fonte de verdade) ──► A (mapeamento SKILL.md)
                     └──► B (config paths)
C (paralelo)                      │
                                  ▼
                          E (gate E2E, por último)
```

## Próximo passo

Validação dos drafts → `@po *validate-story-draft` (Gate 1). Push → `@devops` (exclusivo).
