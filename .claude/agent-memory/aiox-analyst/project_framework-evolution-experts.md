---
name: framework-evolution-experts
description: Experts reais identificados para validar/evoluir o framework AIOX (multi-agent, governance, ops) — verification partners para transformação Nível 4-5
metadata:
  type: project
---

Pesquisa Atlas (2026-06-05) de experts reais para validar a evolução estrutural do AIOX (12 agents, 130+ tasks, Constitution v1.0). 3 tipos: Complexity Architect, Governance Designer, Operational Excellence.

**Why:** AIOX enfrenta tensão protection-vs-extensibility, IDS em draft, governance complexa. Precisa de benchmarks externos reais (não inventados) para validar direcção da transformação.

**How to apply:** Quando o Pedro discutir evolução de framework, governance ou orquestração, ancorar em fontes verificadas abaixo (não reinventar):

- **Type 1 (Complexity/Orchestration):** Anthropic eng team — Barry Zhang (autor de "Building Effective Agents" E "Multi-Agent Research System", padrão orchestrator-workers); Jeremy Hadfield + co; João Moura (CrewAI, github.com/joaomdmoura, Crews+Flows).
- **Type 2 (Governance/Authority):** **DEN DELIMARSKY + JOHN LAM (github/spec-kit)** — usam literalmente `constitution.md` com princípios não-negociáveis para agents, paralelo directo ao AIOX. David Eads (Red Hat, desenhou Kubernetes RBAC, SIG-Auth emeritus lead) para delegation matrices.
- **Type 3 (Agent DevOps/Ops):** LangChain/LangGraph team (durable execution, human-in-the-loop, github.com/langchain-ai/langgraph); Boris Cherny (Head of Claude Code, sub-agent ops em produção); Vaibhav Gupta (BAML/Boundary, fault-tolerant agents).

**Top verification partner:** spec-kit team (Delimarsky/Lam) — melhor fit por usarem o MESMO modelo conceptual (constitution + spec-driven + AI agents enforcement). Repo público comparável directamente ao AIOX.
