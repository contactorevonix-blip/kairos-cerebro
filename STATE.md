> 🗂️ Histórico completo (sessões anteriores a Cont 85) arquivado em `docs/sessions/2026-07/STATE-archive-2026-07-01.md` — truncado em 2026-07-01 por [Story REPO-HYGIENE.1].

# 🚀 Session 2026-06-30 (Cont 86) — kairos-youtube-transcribe skill + skill-creator sync ✅

**Status: ✅ 4 stories Done (commits LOCAIS, NÃO pushed) | skill `kairos-youtube-transcribe` viva e testada ao vivo | skill-creator sincronizada c/ oficial Anthropic | ➡️ NEXT: push dos 4 commits quando Pedro autorizar (@devops) + correr re-testes deferred (TEST-001)**

### Cont 86 (2026-06-29/30) — Origem
- Pedro pediu (1) `/tech-search` para "melhores skills que nos fazem falta" → research em `docs/research/2026-06-29-claude-code-skills-gap/` (gaps: Security/GDPR, Postgres MCP, Railway MCP, Hookdeck webhooks, TDD). (2) Depois `/tech-search` p/ melhor skill de transcrição de vídeo YouTube → research em `docs/research/2026-06-29-video-transcription/`.

### Cont 86 — 4 stories entregues (SDC completo, commits LOCAIS sem push)
- **YT-TRANSCRIBE.1** (commit `b5c86d5`) — skill `kairos-youtube-transcribe` v1: extração yt-dlp (pt,en, cookies opt-in) + browser fallback + Whisper documentado + output `docs/transcripts/` c/ metadados. QA CONCERNS→Done (AC3 Whisper deferred).
- **SKILL-CREATOR.1** (commit `49e4aae`) — sync `.claude/skills/skill-creator/` c/ `anthropics/skills@main` (byte-idêntico): SKILL.md 33KB + agents/ (grader/analyzer/comparator) + eval-viewer/ + 9 scripts. QA PASS. LICENSE preservado, init_skill.py órfão removido.
- **YT-TRANSCRIBE.2** (commit `142b955`) — recriação v2 via skill-creator oficial + grader REAL (Python 3.12 instalado via winget; grading.json pass_rate 1.0). Paridade c/ v0 (61 linhas idênticas). QA CONCERNS→Done.
- **YT-TRANSCRIBE.3** (commit `a9188c4`) — v2.1: suporte `/live/` + filtro de ruído auto-caption. QA CONCERNS→Done.
- **Teste ao vivo:** skill testada c/ `/live/6fUM11SWSgU` (aula Flávio Augusto) → 2198 linhas extraídas. Revelou 3 gaps; @po apanhou que 1 era falso (timestamps MM:SS = artefacto do meu script de teste ad-hoc, a spec já faz HH:MM:SS). v2.1 corrigiu os 2 reais.

### Cont 86 — Estado / pendências
- **Ambiente:** Python 3.12.10 + pyyaml + yt-dlp 2026.06.09 + ffmpeg instalados (winget). yt-dlp NÃO está no PATH do Git Bash (caminho: `.../WinGet/Packages/yt-dlp.yt-dlp.../yt-dlp.exe`).
- **NÃO pushed:** 4 commits locais em `main` (b5c86d5, 49e4aae, 142b955, a9188c4). Push aguarda autorização do Pedro.
- **Deferred (TEST-001):** re-testes de rede — youtu.be/shorts, browser fallback, Whisper (motor não instalado), re-conversão live empírica do filtro de ruído. Validados por inspeção, não end-to-end.
- **Ruído de sessão deixado fora dos commits** (unstaged): STATE.md, hook-metrics, registry-update-log, hunks L1 do entity-registry, agent MEMORY.md, project_*.md.

---

# 🚀 Session 2026-06-29 (Cont 85) — FWSYNC.1b + Karpathy v3.2 DONE/pushed ✅

**Status: ✅ FWSYNC.1b completa em `main` (a015ae6 + 54741c8) | ✅ Karpathy Principles v3.2 em `main` (143b50e) | ✅ npm test 382 pass/0 fail · enforcement 34/34 · lint+typecheck limpos | ➡️ NEXT: nada bloqueado — FWSYNC fechado (1a+1b) + Karpathy refinado. Próximo épico à escolha do Pedro**

### Cont 85 (2026-06-29) — Karpathy Principles v3.2 (pós-FWSYNC)
- **Origem:** Pedro colou `forrestchang/andrej-karpathy-skills` → redirect 301 → `multica-ai/andrej-karpathy-skills` (184k★, fonte canónica já citada no CLAUDE.md). repo-analyst mapeou: CLAUDE.md + skill + plugin + EXAMPLES.md (8 casos ❌/✅).
- **Entregue (commit 143b50e, docs-only):** (1) `CLAUDE.md` v3.2 — testes memoráveis por pilar + "Timing>Pattern" + tabela mapa Karpathy→Constitution + índice "21 Rule Files" corrigido. (2) `.claude/rules/karpathy-principles.md` NOVO — 4 pilares → mecanismos AIOX com ❌/✅ reais (vários de FWSYNC.1b).
- **@qa apanhou 4 refs erradas (CONCERNS→PASS após fix):** NEVER-002→NEVER-003 (delete sem perguntar; 002 é "ignore CLAUDE.md"); Art. IV-A trocado Simplicity/Surgical → alinhado (Simplicity=IV-A, Surgical=VI-VII); índice "21" tinha 1 phantom (`feedback_always-rules.md` não existe em rules) + 2 não-listados (agent-memory-imports, tool-response-filtering) → corrigido p/ 21 reais; "85% .aiox-core/" → ".aiox-core/core/".
- **Decisão:** NÃO criar `feedback_always-rules.md` paralelo (YAGNI/No-Invention). ALWAYS vivem em user-memory; ponteiro corrigido. Criar só se ALWAYS começarem a ser menos respeitadas que NEVER.
- **Nova regra de processo (memória `feedback-coordinator-may-lift-l1-with-authorization`):** coordenador pode baixar gates L1 com autorização explícita do Pedro + repõe byte-idêntico ao HEAD antes do commit @devops.

### Cont 85 (2026-06-29) — desfecho FWSYNC.1b
- **2 fases:** (A sem L1) 20 devDependencies em `devDependencies` (6→26; prod inalterada, `npm ls --omit=dev` limpo) + `docs/qa/framework-dormant.md` (6 módulos dormentes) + `docs/architecture/aiox-framework-consumption.md` (doc de fronteira) + `tests/framework/dev-isolated-guard.test.js` (guard). (B com L1) path fix nos 3 executors epic-4/5/6 (`../../` → `../../../infrastructure/scripts/`).
- **ACHADO 1 (REUSE):** os 5 scripts `infrastructure/scripts/` **já existiam completos** (4956 ln). A premissa da story (restaurar do oficial via `gh api`) estava desactualizada → só path fix aplicado (No-Invention). @po re-redigiu AC2.
- **ACHADO 2 (invariante real):** `bin/aiox-graph/delegate/ids.js` **importam `.aiox-core/` por design** (CLIs de framework). A invariante load-bearing é `packages/sniper-api/**` (CMD=server.js). Guard escrito à realidade: estrito em sniper-api, allowlist 3 CLIs em bin/. @po re-redigiu AC4/AC5.
- **Procedimento L1 (coordenador fez lift, não o Pedro desta vez):** Pedro autorizou "podes tu lift" → removi via `node` o deny `core/**` em settings.json + `frameworkProtection: false` em core-config.yaml → @dev aplicou path fix → **repus ambos os gates** (settings.json restaurado byte-idêntico ao HEAD via `git restore`; frameworkProtection: true) → @devops commitou com `--no-verify` (override Husky documentado no commit 54741c8).
- **Ruído de sessão deixado fora do commit:** entity-registry.yaml, registry-update-log.jsonl, hook-metrics.json, STATE.md, 3× agent MEMORY.md, .aiox/task-logs.

---
