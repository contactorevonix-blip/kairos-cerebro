# Story PM-1.1: process-mapper — Script Node.js base para geração de HTML de processos

## Status
**Done**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "node squads/process-mapper/scripts/generate-process-map.js --test"
  - "start docs/process-maps/test-process.html  (abre no browser — verificar visualmente)"
```

## Story

**As a** Pedro (owner do AIOX),
**I want** um script Node.js que receba a definição de um processo (fases, agentes, quality gates) e gere um ficheiro HTML auto-contido e interactivo,
**so that** todas as outras stories de mapeamento (PM-1.2 a PM-1.8) possam usar este gerador como base.

## Epic Context

- **Epic:** EPIC-PM-001 — Process Maps Foundation
- **Wave:** 1 (paralela com EPIC-PM-007)
- **Spec Reference:** `docs/prd/process-mapper/spec.md` v1.1 — FEAT-01
- **Complexidade:** M
- **Depends on:** PM-7.1 (pasta `squads/process-mapper/scripts/` precisa existir)
- **Blockers para:** PM-1.2, PM-1.3, PM-1.4, PM-1.5, PM-1.6, PM-1.7, PM-1.8 (todas usam este script)

## Acceptance Criteria

1. `node squads/process-mapper/scripts/generate-process-map.js --test` executa sem erros e gera `docs/process-maps/test-process.html`
2. O HTML gerado abre no browser sem erros de JavaScript (zero console errors)
3. HTML é auto-contido: sem imports externos, sem CDN, sem servidor necessário
4. Dado um processo com 3 fases, o HTML mostra 3 blocos de fase com cores distintas
5. Dado 1 quality gate com threshold 70%, o HTML mostra o gate com: percentagem, path YES (verde), path NO (vermelho com destino)
6. Dado um loop de retorno `NO → volta a Fase 1`, o HTML mostra seta de retorno com texto identificado
7. A função `generateProcessMap(config)` é exportável como módulo Node.js para uso por outros scripts
8. `docs/process-maps/aiox-squad-creation-pipeline.html` (existente) serve como referência visual — o script deve gerar HTML com qualidade igual ou superior

## Tasks / Subtasks

- [x] Criar `squads/process-mapper/scripts/generate-process-map.js` — função core + CLI
- [x] Criar `squads/process-mapper/scripts/html-templates.js` — phaseBlock, qualityGate, deliveryBlock, css
- [x] Implementar phaseBlock com cores por tipo
- [x] Implementar qualityGate com paths YES/NO e threshold
- [x] Implementar generateSVG (fallback template directo — sem Mermaid CLI)
- [x] Implementar generateFullHTML via generateProcessMap(config)
- [x] CLI: `--test`, `--config`, `--output`
- [x] Criar `docs/process-maps/` e `docs/process-maps/figma/`
- [x] Verificar AC 1-8 — todos PASS

## Input Schema (config object)

```javascript
// Formato de entrada do gerador
{
  name: "string",           // nome do processo (usado no filename)
  title: "string",          // título no HTML
  subtitle: "string",       // subtítulo
  phases: [
    {
      id: "string",
      label: "string",       // ex: "Fase 1"
      title: "string",       // ex: "Discovery & Process Design"
      agent: "string",       // ex: "@sm (River)"
      color: "mapper|architect|automation|qa|green",
      steps: ["string"]      // lista de passos
    }
  ],
  quality_gates: [
    {
      id: "string",
      name: "string",
      threshold: number,     // ex: 70
      after_phase: "string", // id da fase que precede o gate
      path_no: "string",     // destino do NO (ex: "Volta a Discovery")
      path_yes: "string"     // destino do YES (ex: "Avança para ARCHITECT")
    }
  ]
}
```

## File List

```
squads/process-mapper/scripts/
├── generate-process-map.js   [CRIAR — script principal + CLI]
└── html-templates.js         [CRIAR — funções de template]

docs/process-maps/
└── test-process.html         [GERADO pelo script --test]
```

## Dev Notes

**Referência visual obrigatória:** `docs/process-maps/aiox-squad-creation-pipeline.html`
O script deve gerar HTML com qualidade visual equivalente a este ficheiro.

**Cores por tipo de fase:**
- `mapper` → `#7C3AED` (purple)
- `architect` → `#0EA5E9` (blue)
- `automation` → `#F59E0B` (amber)
- `qa` → `#10B981` (green)
- `green` → `#10B981` (entrega)

**CLI mínimo:**
```bash
node generate-process-map.js --config process-definition.json --output docs/process-maps/output.html
node generate-process-map.js --test  # gera test-process.html com dados de exemplo
```

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm (River) | Story criada — Draft |
| 2026-06-03 | @po (Pax) | Validação 10 pontos: 9/10 — GO. Status: Draft → Ready |
| 2026-06-03 | @dev (Dex) | Implementação: generate-process-map.js + html-templates.js + test outputs. Status: Ready → InReview |
| 2026-06-03 | @qa (Quinn) | QA Gate PASS — 7 checks (2 WAIVED). Concern menor: escHtml/esc duplicadas (não bloqueante). Status: InReview → Done |
