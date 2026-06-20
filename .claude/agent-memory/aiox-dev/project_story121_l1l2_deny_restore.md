---
name: story121-l1l2-deny-restore
description: Story 12.1 restaurou deny rules L1/L2 em settings.json (estavam erradamente em allow desde EPIC-8); MultiEdit também coberto agora
metadata:
  type: project
---

# Story 12.1 — Framework Boundary deny rules restauradas

Story 12.1 (EPIC-12, Framework Boundary Enforcement) corrigiu uma contradição constitucional: os paths L1/L2 estavam na secção `allow` de `.claude/settings.json`, não `deny` — contradizendo Constitution Art. VII linha 181 ("L1 boundary é protegido por deny rules ... não contornável").

**Why:** provável resíduo do desbloqueio de L1 do EPIC-8 (ver [[project_epic8_phase4_l1_blocker]] e [[project_epic8_phase3_l1_path_conflict]]). Enquanto esteve em `allow`, o backstop determinístico estava desligado — só o hook `enforce-quality-gates.cjs` protegia L1/L2.

**How to apply:**
- A partir de Story 12.1, escrever a `.aiox-core/core/**`, `.aiox-core/development/{tasks,templates,checklists,workflows}/**`, `.aiox-core/infrastructure/**`, `.aiox-core/constitution.md`, `bin/aiox*.js` é bloqueado por deny rules (Write/Edit/MultiEdit). Rota legítima continua: `@aiox-master *propose-modification`.
- Excepções L3 mantidas em `allow`: `.aiox-core/data/**`, `agents/*/MEMORY.md`, `Read(.aiox-core/**)`. Os antigos allow de `core/config/schemas/**` e `core/config/template-overrides.js` foram removidos (são L1; nenhum hook runtime depende deles).
- `MultiEdit` agora também passa pelo gate (antes só Write/Edit) — fechado um bypass real.
- Hook hardening: `isProtectedPath` usa `toProjectRelative()` + `isUnderDir()` (boundary-anchored, lida com caminhos absolutos Windows/POSIX). Helpers exportados para teste em `tests/hooks/test-boundary-enforce.test.js`.

Se um EPIC futuro precisar de escrever L1 (como EPIC-8/8.4 precisou), NÃO reverter para allow — usar a rota upstream `propose-modification` ou relocar para L4.
