# Story PM-1.2: process-mapper — Template HTML Quality Gates com loops visuais explícitos

## Status
**Done**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "node squads/process-mapper/scripts/generate-process-map.js --test"
  - "node -e \"const {generateProcessMap}=require('./squads/process-mapper/scripts/generate-process-map.js'); const h=generateProcessMap({name:'t',title:'t',phases:[],quality_gates:[{id:'QG-1',name:'T',threshold:70,after_phase:'p1',path_no:'Volta F1',path_yes:'Avança'}]}); console.log(h.includes('Volta F1') && h.includes('Avança') ? 'AC_LOOPS_OK' : 'FAIL')\""
```

## Story

**As a** Pedro (owner do AIOX),
**I want** que os fluxogramas gerados mostrem loops de retorno visualmente explícitos — com seta lateral identificada a mostrar exactamente de onde para onde vai o retorno — e suporte a `out_of_scope` nos processos,
**so that** quem lê o mapa perceba instantaneamente o caminho de erro sem ter de inferir.

## Epic Context

- **Epic:** EPIC-PM-001 — Process Maps Foundation
- **Wave:** 1
- **Spec Reference:** `docs/prd/process-mapper/spec.md` v1.1 — FEAT-01, FR-06
- **Complexidade:** S
- **Depends on:** PM-1.1 Done ✅
- **Blockers para:** PM-1.3, PM-1.4, PM-1.5, PM-1.6 (usam este template melhorado)

## Acceptance Criteria

1. Dado um quality gate com `path_no: "Volta a Discovery"`, o HTML gerado mostra esse texto na caixa NO com destino explícito
2. Dado um processo com campo `out_of_scope: ["item1", "item2"]`, o HTML inclui uma secção "Fora de Scope" com os itens listados
3. Dado um processo com campo `planning_track`, o HTML mostra o track no subtítulo (ex: "Enterprise Track · 7 epics · 32 stories")
4. O `--test` continua a funcionar sem erros após as adições (regressão zero)
5. O HTML continua auto-contido (zero CDN, zero servidor)
6. A função `generateProcessMap(config)` continua exportável como módulo

## Tasks / Subtasks

- [x] Adicionar suporte a `config.planning_track` no subtítulo do HTML
- [x] Adicionar suporte a `config.out_of_scope` — secção final antes do delivery block
- [x] Adicionar `path_no_detail` opcional no quality gate (texto adicional com razão de retorno)
- [x] Actualizar TEST_CONFIG com os novos campos para verificação
- [x] Verificar AC 1-6 — todos PASS

## File List

```
squads/process-mapper/scripts/
├── generate-process-map.js   [MODIFICAR]
└── html-templates.js         [MODIFICAR — adicionar outOfScopeBlock()]

docs/process-maps/
└── test-process.html         [RE-GERADO pelo --test]
```

## Dev Notes

**Campos novos no config:**
```javascript
{
  planning_track: "Enterprise · 7 epics · 32 stories",  // opcional
  out_of_scope: ["item1", "item2"],                      // opcional
  quality_gates: [
    {
      ...,
      path_no_detail: "Escopo fraco / squad duplicado"   // opcional
    }
  ]
}
```

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm (River) | Story criada — Draft |
