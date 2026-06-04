---
name: monitor-control-ui-spec
description: Spec de UI do Claude Code Monitor + Control Plane (app local p/ 150+ sessões) em docs/design/MONITOR-CONTROL-UI-SPEC.md.
metadata:
  type: project
---

Existe uma especificação completa de UI/UX para o **Claude Code Monitor + Control Plane** em `docs/design/MONITOR-CONTROL-UI-SPEC.md` (criada 2026-06-04 pela Uma).

**O que é:** app local (localhost) para monitorizar/controlar 150+ sessões/terminais Claude Code em tempo-real.

**Decisões-chave de design (já tomadas):**
- Benchmark blend: Linear+Vercel (alma visual) + Grafana+VS Code (estrutura de layout).
- Layout 3-colunas (left nav 240px / center canvas / right panel 360px) + status bar inferior estilo VS Code.
- **150+ janelas resolvidas com Level-of-Detail: 5 modos** Focus→Split→Grid→Dense→Galaxy. "Galaxy mode" = heatmap de mini-tiles coloridos por status.
- Real-time: WebSocket push + fallback polling.
- Criar agente = form único com secções colapsáveis (não wizard).
- Light mode opt-in por inversão de tokens; terminais ficam sempre dark.

**Why:** Base para o epic "Monitor Control Plane UI" — handoff para @pm *create-epic depois @sm stories por componente.

**How to apply:** Antes de qualquer trabalho neste produto, ler a spec. Ordem de build sugerida: Core → Monitor components → Layout → Control → Real-time wiring. Estende [[design-system-kairos]].
