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
| [story-F-core-config-yaml-fix.md](./story-F-core-config-yaml-fix.md) | P0 · @config-engineer → @architect · corrigir bloco YAML órfão em core-config.yaml (Achado gate Story B) |

## Sequência

```
D (fonte de verdade) ──► A (mapeamento SKILL.md)
                     └──► B (config paths)
C (paralelo)                      │
                                  ▼
                          E (gate E2E, por último)

F (independente — não bloqueia E nem é bloqueada por nenhuma story)
```

## Estado de Validação (@po *validate-story-draft — 2026-06-13)

| Story | Score | Decisão | Status final |
|---|---|---|---|
| A — IDE-FILE-RESOLUTION (F1) | 9/10 | **GO** | Done |
| B — devLoadAlwaysFiles/devDebugLog/toolsLocation (F2,F3) | 9/10 | **GO** | Done |
| C — deprecar templates órfãos (F4) | 8/10 | **GO** | Done |
| D — fonte de verdade + agent-teams (F5,F6) | 8/10 | **GO** | Done |
| E — suite E2E (Escopo Expandido) | 9/10 | **GO** | Ready (refinada 2026-06-14 — AC-E7.1..E7.6) |
| F — corrigir bloco YAML órfão em core-config.yaml | 9/10 | **GO** | Ready |

**Resultado:** 6/6 GO (Stories A-F). Todos os achados F1-F6 reconfirmados contra o filesystem real (Art. IV — No Invention satisfeito). Executores `@skill-craftsman` e `@config-engineer` confirmados existentes. Sequência D → A/B → E (C paralelo) coerente entre `blocks`/`depends_on` e o diagrama do PRD. Boundary L1/L2 respeitado: Stories C e D encaminham alterações L2 via `@aiox-master *propose-modification`, não edição directa.

**Story F (2026-06-14):** criada a partir do Achado 2 da gate da Story B (erro YAML estrutural pré-existente em `core-config.yaml` ~linhas 363-377). Validated GO (9/10) → `Ready`, `depends_on: []` — independente de E, não bloqueia o gate de aceitação de A/B. Pronta para `@config-engineer`.

**Should-Fix (não-bloqueante):** O PRD (`EPIC-agent-determinism.md`) usa repetidamente "11 agentes core + aiox-master" (implica 12 SKILL.md). A contagem real é **10 agentes core + aiox-master = 11 SKILL.md** — que é exactamente o conjunto que as stories A e E operam (lista de 11 agentes). As stories estão correctas; recomenda-se ao @pm normalizar o phrasing do PRD para "10 core + aiox-master (11 SKILL.md)".

## Próximo passo

Stories D, A, B, C já **Done**. Story E (`Ready`, refinada e re-validada) é o gate de aceitação de A/B — próxima a implementar (`@qa` → `@dev`). Story F (`Ready`) é independente, não bloqueia E; pode avançar em paralelo para `@config-engineer` → `@architect`. Push de cada story aprovada → `@devops` (exclusivo).
