# Process Mapper Squad

**"Torna o invisível visível. Nenhuma criação sem mapa validado."**

Squad de observabilidade de processos para o AIOX. Gera fluxogramas visuais (HTML interactivo + SVG Figma-exportável) e actua como gate pré-criação automático.

## Comandos

```bash
@cartographer-chief *map-process {nome}    # gera fluxograma de 1 processo
@cartographer-chief *map-squad {nome}      # mapa completo de 1 squad
@cartographer-chief *audit-coverage       # % de cobertura actual
@cartographer-chief *map-all              # gerar todos os mapas em falta
@cartographer-chief *map-evolution        # changelog visual do AIOX
@cartographer-chief *validate-map {path}  # validar mapa existente
```

## Agentes

| Agente | Tier | Domínio |
|--------|------|---------|
| cartographer-chief | Orchestrator | Orchestração + gate pré-criação |
| process-auditor | 0 | Coverage audit, gap detection |
| flow-architect | 1 | Fluxogramas HTML + SVG Figma |
| structure-mapper | 1 | Pastas L1-L4, estrutura canónica |
| agent-cartographer | 1 | Swim-lanes, authority diagrams |
| evolution-tracker | 1 | Changelog, process debt, timeline |
| map-validator | 2 | Fidelidade mapa vs ficheiros reais |

## Outputs

Todos os mapas vivem em `docs/process-maps/` (L4):

```
docs/process-maps/
├── {processo}.html          # HTML interactivo
├── figma/{processo}.svg     # SVG Figma-exportável
├── agents/{agente}.html     # Swim-lanes por agente
├── structure/               # Mapas de pastas L1-L4
├── evolution/               # Timeline do AIOX
└── coverage-report.md       # Audit de cobertura
```

## Constraint Crítica

O gate pré-criação (EPIC-PM-006) só é activado **após** EPIC-PM-001 Done.
Gate sem mapas = bloqueio total do AIOX.

## Referências

- PRD: `docs/prd/process-mapper/PRD.md`
- Spec: `docs/prd/process-mapper/spec.md` (v1.1)
- Plan: `docs/prd/process-mapper/implementation.yaml`
