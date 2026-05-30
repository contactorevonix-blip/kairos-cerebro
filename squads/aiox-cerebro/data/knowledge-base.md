# Knowledge Base — aiox-cerebro

## AIOX Framework Knowledge

### Constitution (6 Artigos)
[SOURCE: .aiox-core/constitution.md]
- I: CLI First (NON-NEGOTIABLE)
- II: Agent Authority (NON-NEGOTIABLE) — git push exclusivo @devops
- III: Story-Driven Development (MUST)
- IV: No Invention (MUST) — zero features sem rastreabilidade
- V: Quality First (MUST)
- VI: Absolute Imports (SHOULD)

### Quality Gate SC_AGT_004
[SOURCE: .aiox-core/development/checklists/agent-quality-gate.md v4.0]
- 24 blocking checks + 11 recommended
- Maturity formula: identity(1.0)+thinking_dna(1.5)+voice_dna(1.5)+output_examples(1.0)+command_loader(1.5)+tasks(1.5)+templates(1.0)+checklists(0.5)+data(0.5) = 10.0
- Nivels: 1(0-4 FAIL), 2(4-7 CONDITIONAL), 3(7-9 PASS), 3+(9-10 EXCELLENT)

### Canonical Squad Structure
[SOURCE: squads/squad-creator/config/quality-gates.yaml QG-SC-1.1]
- 22 pastas + 5 ficheiros raiz obrigatórios
- squad.yaml, config.yaml, README.md, arquitetura.md, swipe-config.yaml

### Workflow Chains
[SOURCE: .aiox-core/data/workflow-chains.yaml]
- SDC: sm→po→dev→qa→devops
- QA Loop: max 5 iterações
- Spec Pipeline: pm→architect→analyst→pm→qa→architect

### Agent Handoff Protocol
[SOURCE: .claude/rules/agent-handoff.md]
- Artifact: ~379 tokens
- Redução de context: 33-57% por switch
- Storage: .aiox/handoffs/handoff-{from}-to-{to}-{ts}.yaml
