---
story_id: "10.1"
epic: EPIC-10
title: "Folder Structure Clarification & docs/ARCHITECTURE.md"
status: DRAFT
executor: "@analyst"
quality_gate: "@pm"
quality_gate_tools: [doc_completeness, layer_assignment_review, gitignore_verification]
effort: 6sp
risk: MEDIUM
---

# Story 10.1 — Folder Structure Clarification & docs/ARCHITECTURE.md

## Goal
Documentar cada pasta de topo do KAIROS_CEREBRO, atribuir-lhe um layer L1-L4 (ou marcar como product-data/orphan), e criar `docs/ARCHITECTURE.md` como fonte única do layout de pastas — cross-linkada em CLAUDE.md e PROJECT.md.

## Background (verified evidence — Art. IV)
O audit Cont37 marcou 6 pastas como "undocumented orphans". Inspecção directa corrige:
- `.kairos-data/` — 1,880 ficheiros (NÃO 3,054), **gitignored** (0 tracked), contém product-data Kairos Check (`api_keys.json`, `leads_pending.json`, `market_intel.jsonl`, `tenants.json`, `backups/`). É L4 product-runtime, não orphan code.
- `.codex/` (28 tracked) e `.antigravity/` (16 tracked) são **ideSync targets** já em `core-config.yaml → ideSync.targets`. Não são mistério.
- `governance/` (9 tracked) tem README.md + evolution-pipeline.md — documentado internamente, não cross-linkado.
- `.synapse/` (105 files, 38 tracked) — híbrido command-suite/data, requer clarificação de layer.

O gap real é **documentação + cross-link + layer assignment**, não existência-mistério.

## Acceptance Criteria
1. **Given** o conjunto de pastas de topo do repo, **when** a story completa, **then** existe `docs/ARCHITECTURE.md` com uma tabela: `folder | purpose | layer (L1-L4 / product-data / orphan) | git-tracked? | source (se ideSync target)`.
2. `.kairos-data/` documentado explicitamente como **product-runtime data, gitignored, fora do framework** — com nota de que contém credenciais e deve ser revisto por @devops (security flag, não in-scope desta story).
3. `.codex/` e `.antigravity/` documentados como **ideSync targets** gerados de `.aiox-core/development/agents` (referência a `core-config.yaml`).
4. `governance/` e `.synapse/` documentados com purpose + layer; `governance/README.md` existente referenciado.
5. CLAUDE.md e PROJECT.md cross-linkam `docs/ARCHITECTURE.md`.
6. Zero pastas de topo sem layer atribuído (100% coverage).
7. **No regression:** nenhuma pasta movida/apagada; `.kairos-data` não tocado; `ideSync` intacto.

## Out of Scope
- Mover/apagar qualquer pasta.
- Security review do conteúdo de `.kairos-data` (flag para @devops).
- Auditar os 10,136 ficheiros (audit P1).

## Notes for @sm
Story é doc-first, executor @analyst (investigação + redacção), gate @pm (completude estratégica). Risco MEDIUM por tocar docs de governança centrais. Verificar layer de `.synapse` lendo `core-config.yaml → synapse` e `.claude/settings.json`.
