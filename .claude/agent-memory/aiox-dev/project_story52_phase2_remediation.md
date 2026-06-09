---
name: story52-phase2-remediation
description: Story 5.2 Phase 2.2 remediation state — quais violations foram corrigidas, scope do lint, e falso-positivo do gate Art.III em ficheiros .json
metadata:
  type: project
---

Story 5.2 (Framework Governance) Task 2.2 — Remediate Violations entregue 2026-06-09.

**Why:** Phase 2 do sync-complete workflow remedia as violations do SYNC-FINDINGS.md (auditoria Phase 1).

**How to apply:** Ao continuar Story 5.2 (Tasks 2.3/2.4/2.5), o estado das remediations 2.2 é:
- V-ART5-001 (lint), V-ART5-002 (build), V-ART67-003 (frameworkProtection) — implementadas nesta sessão (commits 525f7f4, 687db4a, e16e1de).
- FP-01 + FP-02 — já estavam feitas no commit 585acdb (sessão anterior). NÃO re-implementar (Art. IV No Invention).
- V-DRIFT-004 — L1, deferido a @aiox-master *propose-modification. constitution.md NUNCA tocado.

**Decisão de scope do lint (não-óbvia):** `npm run lint` foi religado APENAS sobre a camada de governança (`.claude/hooks`, `.aiox/task-discovery.js`, `tests/hooks`) com `--quiet`. `npm run lint:all` (= `eslint .`) revela ~180 erros legacy em 61 ficheiros (L1 `.aiox-core/core`, `packages/web` Next.js, `squads`) — cleanup story própria, fora de scope. Erros dominantes: no-undef (globals browser/ESM em falta no flat config) + regras novas do ESLint v10 (preserve-caught-error, no-useless-assignment) a disparar em código legacy.

**Falso-positivo do gate Art.III (story-driven):** o pre-commit hook bloqueia commits de ficheiros `*.json` em `docs/stories/.../outputs/` exigindo `## Acceptance Criteria` — trata o output JSON como se fosse uma story. O `remediation-commits.json` ficou untracked no disco (output cumprido) porque NÃO se contorna o gate. Se precisares de committar artefactos JSON em docs/stories/, espera bloqueio do gate. Ver [[project_constitutional_enforcement_gates]].
