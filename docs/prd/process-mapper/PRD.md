# process-mapper — Product Requirements Document (PRD)

**Tipo:** Greenfield Squad PRD
**Versão:** 1.0 | **Data:** 2026-06-03
**Author:** @pm (Morgan) | **Owner:** Pedro Leal
**Status:** Draft — aguarda Spec Pipeline (Fase 2 ASSESS)

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-06-03 | 1.0 | PRD inicial — baseado em brainstorm + requisitos validados por Pedro | Morgan (@pm) |

---

## 1. Goals e Contexto

### 1.1 Problema Central

O AIOX tem ~100+ tasks, 10 agentes, 5 squads, 4 workflows primários, e uma estrutura de 4 camadas (L1-L4). **Nenhum destes artefactos tem representação visual.** Quem entra no AIOX pela primeira vez (ou quem regressa após tempo) não consegue perceber o que existe, como funciona, e quem faz o quê.

O segundo problema: **nada impede a criação de artefactos sem processo documentado.** Squads são criados, tasks são escritas, e agentes são definidos sem que exista um mapa do processo que estão a implementar.

### 1.2 Goals

- Gerar fluxogramas visuais (HTML interactivo + Figma-exportável) de todos os processos AIOX
- Bloquear automaticamente qualquer criação de artefacto AIOX sem mapa de processo validado
- Manter os mapas actualizados automaticamente quando os processos mudam
- Atingir ≥ 90% de cobertura de todos os artefactos AIOX mapeados
- Documentar a evolução do AIOX ao longo do tempo (changelog visual)

### 1.3 Background Context

O AIOX (Synkra AIOX) é um meta-framework de desenvolvimento com 4 camadas de mutabilidade (L1=imutável, L4=sempre modificável), 10 agentes especializados com autoridade exclusiva, e 4 workflows primários (SDC, QA Loop, Spec Pipeline, Brownfield Discovery). A complexidade cresceu organicamente — existe documentação em Markdown mas zero representação visual de fluxos.

O squad process-mapper actua como camada de observabilidade de processos: não controla nada, não modifica código, gera apenas mapas visuais e actua como gate pré-criação.

---

## 2. Requisitos

> Fonte de verdade completa: `docs/prd/process-mapper/requirements.json`
> Cada FR/NFR/CON abaixo rastreia directamente para o JSON.

### 2.1 Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| FR-01 | Outputs em Figma-exportável (SVG/HTML estruturado) + HTML interactivo | MUST |
| FR-02 | Consumidor único — Pedro, outputs locais em docs/process-maps/ | MUST |
| FR-03 | Gate automático pré-criação — mapa validado antes de criar qualquer artefacto | MUST |
| FR-04 | Cobertura ≥ 90% de todos os artefactos AIOX (4 workflows + 10 agentes + ~100 tasks + estrutura de pastas + evolution) | MUST |
| FR-05 | Actualização automática — quando processo muda, mapa re-gerado sem intervenção manual | MUST |
| FR-06 | Quality gates visíveis em cada mapa — threshold, path YES/NO, loop de retorno ao ponto exacto | MUST |

### 2.2 Requisitos Não-Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| NFR-01 | Qualidade máxima acima de velocidade — sem requisito de tempo, map-validator score ≥ 90% | MUST |
| NFR-02 | Validação máxima — cada elemento do mapa rastreia para ficheiro real, zero invenção | MUST |
| NFR-03 | Implementação do processo mais robusto possível — 5 domínios completos | MUST |

### 2.3 Constraints

| ID | Constraint | Severidade |
|----|------------|------------|
| CON-01 | Outputs em L4 only (docs/) — nunca em .aiox-core/core/ ou development/ | MUST NOT violate |
| CON-02 | CLI first — squad acessível via @cartographer-chief antes de qualquer UI | MUST |
| CON-03 | No Invention — mapas baseados apenas em ficheiros reais existentes | MUST NOT violate |
| CON-04 | @devops exclusivo para git push — squad não tem autoridade de push | MUST NOT violate |
| CON-05 | Enterprise Track obrigatório — PRD + Spec Pipeline + SDC por epic | MUST |

---

## 3. Design do Squad

### 3.1 Identidade

```
Nome:        process-mapper
Filosofia:   "Torna o invisível visível. Nenhum processo sem diagrama.
              Nenhuma criação sem mapa validado."
Orchestrator: cartographer-chief
```

### 3.2 Agentes (7 total)

| ID | Tier | Papel |
|----|------|-------|
| `cartographer-chief` | Orchestrator | Orquestra todos os domínios, gate pré-criação |
| `process-auditor` | 0 (Diagnóstico) | O que existe? O que falta? Coverage %? |
| `flow-architect` | 1 | Converte processos em fluxogramas HTML + Figma |
| `structure-mapper` | 1 | Mapeia pastas L1-L4, 22 pastas canónicas |
| `agent-cartographer` | 1 | Swim-lanes, authority diagrams, delegation trees |
| `evolution-tracker` | 1 | Versioning, changelog, process debt |
| `map-validator` | 2 | Valida fidelidade mapa ↔ ficheiros reais |

### 3.3 Comandos do Orchestrator

```
@cartographer-chief *map-process {nome}     → gera fluxograma de 1 processo
@cartographer-chief *map-squad {nome}       → mapa completo de 1 squad
@cartographer-chief *audit-coverage        → % de cobertura actual
@cartographer-chief *map-all               → gerar todos os mapas em falta
@cartographer-chief *map-evolution         → changelog visual do AIOX
@cartographer-chief *validate-map {path}   → validar mapa existente
```

### 3.4 Gate Pré-Criação (FR-03)

```
QUALQUER *create-* ou *draft ou *create-epic
         │
         ▼
cartographer-chief interceta
         │
         ▼
Existe mapa validado para este processo?
  NÃO → flow-architect gera mapa → map-validator valida
         Se score < 90% → BLOQUEADO (retorna ao criador)
         Se score ≥ 90% → mapa aprovado → criação prossegue
  SIM → verificar se está actualizado
         Desactualizado → re-gerar → validar → prosseguir
         Actualizado → prosseguir
```

---

## 4. Domínios de Mapeamento (5 fases)

| Fase | Domínio | Cobertura Actual | Alvo |
|------|---------|-----------------|------|
| A | Process Maps (SDC, QA, Spec, Brownfield, MCP, CI/CD, DB) | ~17% | 100% |
| B | Agent Maps (10 agentes, swim-lanes, authority, handoffs) | ~20% | 100% |
| C | Structure Maps (L1-L4, 22 pastas canónicas por squad) | 0% | 100% |
| D | File Maps (~100+ tasks, workflows, agents — auto-gerado) | 0% | 90% |
| E | Evolution Maps (changelog, timeline, process debt) | 0% | 80% |

**Cobertura global actual: ~17%**
**Alvo após squad completo: ≥ 90%**

---

## 5. Outputs Gerados pelo Squad

| Output | Formato | Localização | Trigger |
|--------|---------|-------------|---------|
| Fluxograma de processo | HTML interactivo | `docs/process-maps/{nome}.html` | *map-process ou pré-criação |
| Fluxograma Figma | SVG estruturado | `docs/process-maps/figma/{nome}.svg` | *map-process |
| Coverage audit | Markdown | `docs/process-maps/coverage-report.md` | *audit-coverage |
| Agent authority diagram | HTML | `docs/process-maps/agents/{nome}.html` | *map-squad |
| Structure map | HTML interactivo | `docs/process-maps/structure/{nome}.html` | *map-squad |
| Evolution timeline | HTML | `docs/process-maps/evolution/timeline.html` | *map-evolution |

---

## 6. Epic Overview

| Epic | Nome | Domínio | Stories estimadas |
|------|------|---------|------------------|
| EPIC-PM-001 | Process Maps Foundation | Fase A | 8-10 |
| EPIC-PM-002 | Agent Maps | Fase B | 4-5 |
| EPIC-PM-003 | Structure Maps | Fase C | 4-5 |
| EPIC-PM-004 | File Maps + Automação | Fase D | 6-8 |
| EPIC-PM-005 | Evolution Tracker | Fase E | 4-5 |
| EPIC-PM-006 | Gate Pré-Criação (FR-03) | Infra | 3-4 |

**Total estimado: 29-37 stories → Enterprise Track confirmado**

---

## 7. Referências

| Documento | Localização | Propósito |
|-----------|-------------|-----------|
| requirements.json | `docs/prd/process-mapper/requirements.json` | Fonte de verdade de requisitos |
| workflow-execution.md | `.claude/rules/workflow-execution.md` | 4 workflows primários a mapear |
| agent-authority.md | `.claude/rules/agent-authority.md` | Autoridade dos 10 agentes |
| story-lifecycle.md | `.claude/rules/story-lifecycle.md` | Ciclo de vida de stories |
| planning-tracks.md | `.claude/rules/planning-tracks.md` | Enterprise Track justificação |
| squad-creator/squad.yaml | `squads/squad-creator/squad.yaml` | Template de estrutura de squad |
| wf-create-squad.yaml | `squads/squad-creator/workflows/wf-create-squad.yaml` | Pipeline de criação a seguir |

---

## 8. Próximos Passos (Spec Pipeline)

```
FASE 2 — ASSESS (@architect)
  Input: este PRD + requirements.json
  Output: complexity.json
  Score esperado: ~16+ (COMPLEX) — confirmar com @architect

FASE 3 — RESEARCH (@analyst)
  Gene Kim · Geary Rummler · W.E. Deming · Tom Gilb
  Output: research.json

FASE 4 — SPEC (@pm)
  spec.md com rastreio completo FR-*/NFR-*/CON-*

FASE 5 — CRITIQUE (@qa)
  Score alvo: ≥ 4.0 (APPROVED)

FASE 6 — PLAN (@architect)
  implementation.yaml → stories por epic
```

---

*PRD v1.0 — process-mapper — 2026-06-03*
*Próxima acção: @architect *assess-complexity docs/prd/process-mapper/PRD.md*
