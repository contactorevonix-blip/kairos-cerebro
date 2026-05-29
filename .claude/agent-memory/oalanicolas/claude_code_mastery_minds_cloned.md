---
name: claude-code-mastery-minds-cloned
description: 8 Voice/Thinking DNA clones extracted for squad claude-code-mastery — slugs, fidelity scores, source tiers, and gaps per expert
metadata:
  type: project
---

# Claude-Code-Mastery — Minds Cloned (2026-05-29)

DNA completo extraído para `squads/claude-code-mastery/outputs/minds/{slug}/mind_dna_complete.yaml`.
Schema usado: `mind_dna_complete` com `voice_dna`, `thinking_dna`, `expertise_markers`, `verification` + bloco legacy `quality`. Cada entry tem `[SOURCE:]` ou `[INFERRED]`.

**Why:** Missão de clonar 8 experts do squad para agentes hooks-architect/mcp-integrator/etc.
**How to apply:** Reusar estes YAML ao gerar os ficheiros de agente `.md` do squad. Se for pedido re-clone, focar nos gaps abaixo.

| Slug | Expert | Role | Fidelity | Tier fontes | Gap principal |
|------|--------|------|----------|-------------|---------------|
| disler-indydevdan | Nathan Disler | hooks-architect | 90 | 0 (GitHub READMEs) + 1 | 12 Leverage Points são curso pago; YouTube não transcrito verbatim |
| peter-steinberger | @steipete | mcp-integrator | 91 | 0 (blog próprio) | uso exacto 'slop' vs 'charade' parafraseado |
| boris-cherny | Boris Cherny | roadmap-sentinel | 89 | 1 (Pragmatic Eng via mindwiredai) | quotes via secondary source; transcript original confirmaria |
| reuven-cohen | ruvnet | swarm-orchestrator | 87 | 0 (ruflo README/wiki) | voz pessoal X/@ruvnet não extraída; métricas auto-reportadas |
| kieran-klaassen | Kieran Klaassen | swarm-orchestrator | 88 | 0/1 (every.to) | transcript completo confirmaria verbatim; gists não inspeccionados |
| daniel-miessler | Daniel Miessler | project-integrator | 87 | 0 (blog próprio) | wording exacto 'Humans>STEM' / The Algorithm |
| superclaude-org | SuperClaude Framework | config-engineer | 86 | 0 (README) | org não-pessoa; contagem personas 9 vs 20 por versão |
| bmad-code-org | BMAD Method | skill-craftsman | 86 | 0 (README) | org não-pessoa; contagem agentes/workflows varia por módulo |

## Notas de extracção

- **2 são orgs/frameworks** (superclaude-org, bmad-code-org), não pessoas — "voz" = voz do README/docs do projecto. Fidelity propositadamente plafonada ~86.
- **Mais fortes** (blog/README do próprio, Tier 0): steipete, disler, daniel-miessler, ruvnet, kieran.
- **Boris Cherny**: melhores quotes vêm da entrevista Pragmatic Engineer (Gergely Orosz) — fonte canónica para re-verificação verbatim.
- IndyDevDan "Big Three" = Context, Model, Prompt (confirmado agenticengineer.com).
- Todos >= 85% de fidelidade alvo atingido.
