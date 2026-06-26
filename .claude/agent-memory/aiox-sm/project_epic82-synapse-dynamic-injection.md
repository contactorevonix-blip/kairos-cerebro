---
name: project-epic82-synapse-dynamic-injection
description: EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7): 6 stories Draft criadas 2026-06-26 (63sp); sequência 82.1→82.2→{82.3,82.4,82.5}→82.6; CON-1 resolvida via amendment consolidado em 82.1
metadata:
  type: project
---

EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7) — 6 stories Draft criadas em 2026-06-26 (Cont 84).

**Why:** SYNAPSE engine funciona com L0+L1 apenas (L2-L7 mortos). Root cause: manifest nunca passado para engine; session.active_agent nunca escrito no ficheiro que o engine lê. PRD baseado em inspecção directa do código (not from audit narrative).

**How to apply:** Verificar estado destas stories antes de criar qualquer nova story relacionada com SYNAPSE context injection.

Stories e paths (todos em `docs/stories/epics/epic-82/`):
- 82.1 (13sp): `82.1.activation-engine-manifest-wiring.story.md` — FR-1/2/3/4; L4 bridge + L1 l2-agent.js; TEST-FIRST G1-CLOSURE; FILES amendment proposal. Prereq: L1 amendment aprovado por @aiox-master
- 82.2 (13sp): `82.2.merge-logic-layer-reenablement.story.md` — FR-5/6/7; L1 engine.js + formatter.js; L3 precedence.json. Prereq: 82.1
- 82.3 (8sp): `82.3.cache-manager-session-persistence.story.md` — FR-8; PURE L4; sticky agent + history + TTL. Prereq: 82.1
- 82.4 (8sp): `82.4.validation-graceful-degradation.story.md` — FR-9/10/NFR-3/7; L1 engine.js + formatter.js; sanitization + skip-on-fail. Prereq: 82.2
- 82.5 (8sp): `82.5.command-routing-l7-star-commands.story.md` — FR-11; L3 .synapse/commands format fix (prefer) > L1 parser escalation. Prereq: 82.2
- 82.6 (13sp): `82.6.integration-tests-diagnostics-gate.story.md` — FR-12/NFR-4; integration + golden snapshot + BLOCKING perf (<100ms) + diagnostics 0-FAIL. Prereq: todos

Total: 63sp | Sequência: 82.1→82.2→{82.3,82.4,82.5}→82.6

**CON-1 resolvida (implementation.yaml, Aria @architect Cont 84):**
- FR-1/2/3/8 são PURE L4 (chamam updateSession() da L1 — consuming API, not editing L1)
- FR-4/5/6/7/9/10/12 são L1 genuíno → ONE batched *propose-modification filed em 82.1
- 4 ficheiros no amendment: l2-agent.js, engine.js, formatter.js, synapse-diagnostics.js
- @aiox-master (Orion) aprova; @dev implementa slices sob umbrella
- 82.2/82.4/82.5/82.6 operam sob o mesmo amendment aprovado em 82.1 (sem amendment per-story)

**Constraint crítico para @dev:** CADA story tocando .aiox-core/core/synapse/** DEVE citar CON-1 e verificar approval antes de qualquer L1 write.

PRD: `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md`
Implementation plan: `docs/stories/epics/epic-82/implementation.yaml`
