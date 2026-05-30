# Task: Map Dependencies
# Agent: forge-planner (Cartographer)
# Gate: G22 (BLOCKING)

## Objectivo
Construir o mapa de dependências entre stories, detectar ciclos (que bloqueiam) e produzir a sequência de implementação ordenada topologicamente.

## Inputs
- `outputs/{system_name}/planning/stories/**/*.story.md` (G21, validadas)
- `outputs/{system_name}/planning/epics.yaml`

## Processo
1. Para cada story, identificar dependências: que stories têm de estar DONE antes desta começar (ex.: schema antes de queries, auth antes de endpoints protegidos).
2. Construir grafo dirigido `story -> [depende_de]`.
3. **Detecção de ciclos:** aplicar ordenação topológica (Kahn). Se restarem nós sem ordem → existe ciclo.
   - **Gate G22 — BLOCK** se ciclo detectado. Reportar o ciclo exacto (ex.: `2.1 -> 3.2 -> 2.1`) e exigir refactor das stories antes de avançar.
4. Produzir a sequência linear de implementação (ordem topológica). Stories independentes podem ser marcadas como paralelizáveis.
5. Identificar o caminho crítico (cadeia mais longa de dependências).

## Output
`outputs/{system_name}/planning/dependency-map.yaml`
```yaml
dependency_map:
  edges:
    "1.1": []
    "1.2": ["1.1"]
    "2.1": ["1.1"]
    "2.2": ["2.1"]
  cycles_detected: false
  implementation_sequence:
    - "1.1"
    - "1.2"
    - "2.1"
    - "2.2"
  parallelizable:
    - ["1.2", "2.1"]
  critical_path: ["1.1", "2.1", "2.2"]
```

## Critérios de Completude
- [ ] Dependências mapeadas para todas as stories
- [ ] Detecção de ciclos executada (Kahn / topo-sort)
- [ ] cycles_detected = false (ou ciclo reportado e resolvido)
- [ ] implementation_sequence produzida e completa
- [ ] critical_path identificado
- [ ] Gate G22 verificado
