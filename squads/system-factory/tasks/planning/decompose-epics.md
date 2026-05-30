# Task: Decompose Epics
# Agent: forge-planner (Cartographer) + delegate @aiox-pm
# Gate: G19 (BLOCKING)

## Objectivo
Decompor o sistema arquitectado num conjunto coerente de epics. Cada epic representa uma capacidade de negócio entregável de forma independente, com critérios de completude verificáveis.

## Inputs
- `outputs/{system_name}/architecture/architecture.md` (G18)
- `outputs/{system_name}/architecture/data-model.yaml`
- `outputs/{system_name}/classification/complexity.yaml` (define STANDARD vs COMPLEX)
- `outputs/{system_name}/research/research-report.md`

## Regras de Decomposição
- **STANDARD** (score 9-15): produzir 3-5 epics.
- **COMPLEX** (score >= 16): produzir 5-8 epics.
- Cada epic deve ser entregável de forma independente (vertical slice de valor).
- Evitar epics puramente técnicos sem valor de negócio observável.

## Processo
1. Ler a arquitectura e identificar os bounded contexts / módulos principais.
2. Agrupar capacidades relacionadas num epic com fronteira clara (1 epic = 1 capacidade de negócio).
3. Para cada epic definir: `id`, `name`, `objective`, `completion_criteria` (mínimo 2, verificáveis), `estimated_stories`, `owner`.
4. @aiox-pm valida cada epic contra os FR/NFR da arquitectura — cada epic deve mapear a pelo menos 1 requisito.
5. Ordenar epics por dependência lógica e valor entregue (foundation primeiro).
6. **Gate G19 — BLOCK** se: número de epics < 3, OU qualquer epic sem `completion_criteria`, OU epic sem mapeamento a requisito.

## Output
`outputs/{system_name}/planning/epics.yaml`
```yaml
epics:
  - id: EPIC-1
    name: "Autenticação e gestão de API keys"
    objective: "Permitir que clientes se autentiquem e giram chaves de API com segurança"
    completion_criteria:
      - "Cliente cria/revoga API key via endpoint"
      - "Requests sem key válida devolvem 401"
    estimated_stories: 4
    owner: forge-builder
    maps_to: [FR-1, FR-2, NFR-SEC-1]
  - id: EPIC-2
    name: "Motor de scoring de fraude"
    objective: "Calcular score de risco a partir de sinais OSINT"
    completion_criteria:
      - "POST /score devolve risk_score 0-100 com breakdown"
      - "Latência p95 < 800ms"
    estimated_stories: 5
    owner: forge-builder
    maps_to: [FR-3, FR-4, NFR-PERF-1]
total_epics: 5
class: "STANDARD"
```

## Critérios de Completude
- [ ] Número de epics dentro do range da classe (3-5 STANDARD / 5-8 COMPLEX)
- [ ] Cada epic tem objective claro e de valor de negócio
- [ ] Cada epic tem >= 2 completion_criteria verificáveis
- [ ] Cada epic mapeado a pelo menos 1 requisito (maps_to preenchido)
- [ ] Cada epic tem estimated_stories e owner
- [ ] Gate G19 verificado (sem epics insuficientes nem critérios em falta)
