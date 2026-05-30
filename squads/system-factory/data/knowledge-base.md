# Knowledge Base — System Factory

## Complexity Scoring

### Dimensões (1-5 cada)
- Scope: ficheiros afectados
- Integration: APIs externas
- Infrastructure: mudanças necessárias
- Knowledge: familiaridade da equipa
- Risk: criticidade

### Classes
- SIMPLE (≤ 8): fast path — 15 etapas, < 1h
- STANDARD (9-15): pipeline completo — 30 etapas
- COMPLEX (≥ 16): 30 etapas + ciclos de revisão

## Elite Score

Target: >= 96 ELITE
- QA Gate: 30pts
- Security: 20pts
- Architecture: 20pts
- Test Coverage: 15pts
- Documentation: 10pts
- Performance: 5pts

## Research Quality Gate (SC_RES_002)
- Mínimo 5 fontes únicas
- Mínimo 500 linhas extraídas
- Fontes primárias obrigatórias
- Inferências marcadas como tal

## AIOX Integration
Sistema Factory usa agentes AIOX para execução:
- @aiox-sm → stories
- @aiox-dev → implementação
- @aiox-qa → quality gate
- @aiox-devops → deploy
