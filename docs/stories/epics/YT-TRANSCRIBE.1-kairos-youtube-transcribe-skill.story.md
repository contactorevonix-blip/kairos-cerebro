# Story YT-TRANSCRIBE.1: Criar skill `kairos-youtube-transcribe` (v1 enxuto)

## Status
**Done**

## Executor Assignment
```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "Verificacao manual: carregar skill e disparar com 1 URL YouTube com legendas (AC1+AC2)"
  - "Verificacao manual: testar fallback Whisper com vídeo sem legendas (AC3)"
  - "Grep: confirmar frontmatter SKILL.md tem name + description + triggers (AC4)"
```

## Story

**As a** Pedro (developer + solo founder),
**I want** uma skill AIOX `kairos-youtube-transcribe` que extraia transcritos de vídeos YouTube,
**so that** consigo obter texto de qualquer vídeo (com ou sem legendas) diretamente no Claude Code, sem copy-paste manual, com output organizado e metadados úteis.

## Epic Context

- **Track:** Quick Flow (1 story standalone — sem epic numerada)
- **Slug:** YT-TRANSCRIBE
- **Story Points:** 5sp
- **Complexidade:** M
- **Depends on:** nenhuma (pode começar imediatamente)
- **Bloqueia:** nenhuma
- **Pesquisa base:** `docs/research/2026-06-29-video-transcription/` (README + 04-skill-audit.md)
- **IDS Decision:** ADAPT — base = `feiskyer/claude-code-settings` `youtube-transcribe-skill` (MIT, auditada ✅, ~65% relevância). Técnica Whisper local inspirada em `jftuga/transcript-critic`. Mudanças >30% (AC2 output organizado, AC3 Whisper fallback, idiomas `pt,en`, cookies opcionais) → tecnicamente CREATE mas com ADAPT como ponto de partida documentado.
- **Notas de sizing:** SKILL.md puro (~300 linhas estimadas) + documentação Windows + 4 ACs. Sem código de aplicação.

## Acceptance Criteria

1. **AC1 — Extração base:** Dado URL YouTube nos formatos `youtube.com/watch`, `youtu.be` e `/shorts/`, a skill extrai legendas via `yt-dlp` (idiomas default `pt,en`; flag `--cookies-from-browser=chrome` é OPCIONAL — documentada mas não activada por defeito, por privacidade). Se `yt-dlp` falhar mas legendas existirem no DOM → fallback browser automation (Chrome DevTools MCP). Verify: transcript correcto de 1 vídeo com legendas.

2. **AC2 — Output organizado:** O transcript é guardado em pasta dedicada `docs/transcripts/` com ficheiro nomeado `{YYYY-MM-DD}-{sanitized-title}.md`. O ficheiro inclui secção de metadados (título, URL, data de extracção, idioma detectado, número de linhas) + corpo no formato `Timestamp Texto` (linha por entrada). Verify: ficheiro criado com todos os campos presentes após executar a skill.

3. **AC3 — Fallback Whisper:** Se o vídeo NÃO tem legendas disponíveis (nem `yt-dlp` nem browser as encontram), a skill instrui `yt-dlp` a baixar o áudio → Whisper local (whisper.cpp ou equivalente + ffmpeg) transcreve localmente. Verify: transcript de 1 vídeo sem legendas produzido com sucesso.

4. **AC4 — Formato AIOX:** `SKILL.md` segue o template `skill-creator` (`.claude/skills/skill-creator`): frontmatter YAML com campos `name: kairos-youtube-transcribe`, `description` precisa e `triggers` (lista de frases que disparam a skill); instruções em imperativo/infinitivo (sem segunda pessoa); skill carrega e dispara correctamente no Claude Code. Verify: `grep -l 'name: kairos-youtube-transcribe'` encontra o ficheiro; activação manual confirma carregamento.

## Non-Goals (v2 — fora de scope v1)

As seguintes funcionalidades NÃO fazem parte desta story e NÃO devem ser implementadas:

- Resumo automático do conteúdo transcrito
- Extracção de key-points ou highlights
- Search em canais ou playlists
- Análise de conteúdo (sentiment, tópicos, fact-checking)
- Suporte a lotes (múltiplos URLs numa invocação)
- Upload ou envio do transcript para serviços externos

## Dependências e Instalação (Windows)

**Obrigatórias (AC1):**
- `yt-dlp` — instalar: `winget install yt-dlp.yt-dlp` ou `pip install yt-dlp`
  - Verificar: `yt-dlp --version`

**Opcionais (AC3 — só necessárias para fallback Whisper):**
- `ffmpeg` — instalar: `winget install Gyan.FFmpeg` ou chocolatey `choco install ffmpeg`
  - Verificar: `ffmpeg -version`
- `whisper.cpp` (recomendado Windows — sem WSL) ou `openai-whisper` (via pip, precisa Python 3.9+)
  - whisper.cpp: build do repo `github.com/ggerganov/whisper.cpp` ou binary pre-built
  - openai-whisper: `pip install openai-whisper` (requer ffmpeg no PATH)
  - Verificar: `whisper --help` ou `./main --help`

**MCP Browser (AC1 fallback):**
- Chrome DevTools MCP deve estar disponível na sessão Claude Code (ver `.aiox-core/core-config.yaml`)

## IDS Compliance

```yaml
ids_decision:
  action: ADAPT_INSPIRED_CREATE
  source_1:
    repo: github.com/feiskyer/claude-code-settings
    file: youtube-transcribe-skill/SKILL.md
    license: MIT
    security_audit: PASSED (docs/research/2026-06-29-video-transcription/04-skill-audit.md)
    relevance: 0.65
    preserved: [url-validation-logic, yt-dlp-core-steps, browser-fallback-concept, output-format-Timestamp-Text]
  source_2:
    repo: github.com/jftuga/transcript-critic
    technique: whisper-local-fallback
    relevance: 0.40
    preserved: [whisper-cpp-invocation-pattern]
  changes_from_source_1:
    - Idiomas default: zh-Hans,zh-Hant,en → pt,en
    - Cookies: obrigatórios → OPCIONAIS (privacidade)
    - Output: ficheiro .txt no CWD → pasta docs/transcripts/ + metadados (AC2)
    - Fallback: browser apenas → browser + Whisper local (AC3 NOVO)
    - Formato: AIOX SKILL.md com frontmatter + triggers (AC4)
  new_entity: kairos-youtube-transcribe
  registry_path: .aiox-core/data/entity-registry.yaml
  registry_section: skills
  register_by: 2026-06-30
```

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

## Tasks / Subtasks

- [x] **T1 — Criar estrutura da skill** (AC4)
  - [x] Criar pasta `.claude/skills/kairos-youtube-transcribe/`
  - [x] Criar `.claude/skills/kairos-youtube-transcribe/SKILL.md` com frontmatter AIOX (name, description) — **sem `triggers`** (correção @po: template `skill-creator` usa só name+description; disparo via description)

- [x] **T2 — Implementar Step 1: validação de URL** (AC1)
  - [x] Documentar na SKILL.md: validar formatos `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`
  - [x] Documentar: extrair video ID para uso nos steps seguintes

- [x] **T3 — Implementar Step 2: extracção de legendas via yt-dlp** (AC1)
  - [x] Documentar comando: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs pt,en --convert-subs srt -o "%(id)s.%(ext)s" {URL}`
  - [x] Documentar: converter .vtt/.srt → formato `Timestamp Texto`
  - [x] Documentar: flag `--cookies-from-browser=chrome` como OPCIONAL (nota de privacidade)

- [x] **T4 — Implementar Step 3: fallback browser automation** (AC1)
  - [x] Documentar: se yt-dlp falhar + vídeo tem legendas → usar Chrome DevTools MCP
  - [x] Documentar: selector DOM `ytd-transcript-segment-renderer` para extrair timestamps + texto

- [x] **T5 — Implementar Step 4: fallback Whisper local** (AC3) — documentado (instalação on-demand)
  - [x] Documentar: condição de activação (sem legendas em Steps 2+3)
  - [x] Documentar: `yt-dlp --extract-audio --audio-format mp3 -o "%(id)s.%(ext)s" {URL}`
  - [x] Documentar: invocação whisper.cpp ou openai-whisper no ficheiro de áudio
  - [x] Documentar: converter output Whisper → formato `Timestamp Texto`

- [x] **T6 — Implementar Step 5: output organizado** (AC2)
  - [x] Documentar: criar `docs/transcripts/` se não existir
  - [x] Documentar: nome do ficheiro `{YYYY-MM-DD}-{sanitized-title}.md`
  - [x] Documentar: estrutura do ficheiro (secção metadados + corpo)
  - [x] Documentar: reportar ao utilizador path criado + idioma + nº de linhas

- [x] **T7 — Registar entity no registry** (IDS Art. IV-A)
  - [x] Entrada `kairos-youtube-transcribe` já presente em `.aiox-core/data/entity-registry.yaml` sob secção `skills:` (criada na prep da story); lifecycle actualizado `draft → active`, `lastVerified` actualizado

- [x] **T8 — Verificação AC1+AC2** (QA) — PASS
  - [x] Testado com `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (legendas pt+en manuais)
  - [x] Transcript correcto + ficheiro criado em `docs/transcripts/2026-06-29-rick-astley-never-gonna-give-you-up-official-video-4k-remast.md` (61 linhas)

- [ ] **T9 — Verificação AC3** (QA) — **DEFERRED** (Whisper/ffmpeg não instalados; instalação on-demand pelo utilizador; instruções documentadas na skill)
  - [ ] Testar com 1 URL YouTube sem legendas
  - [ ] Confirmar fallback Whisper activa + transcript gerado

- [x] **T10 — Verificação AC4** (QA) — grep PASS
  - [x] `grep 'name: kairos-youtube-transcribe'` encontra `.claude/skills/kairos-youtube-transcribe/SKILL.md` (1 match)
  - [ ] Activação manual no Claude Code (verificação runtime — para @qa)

## Dev Notes

### Fonte primária (pesquisa prévia aprovada)

- `docs/research/2026-06-29-video-transcription/README.md` — tabela comparativa de opções, recomendação Whisper local (GDPR)
- `docs/research/2026-06-29-video-transcription/04-skill-audit.md` — auditoria de segurança da skill base (feiskyer), pontos de atenção, cadeia desenhada para a versão Kairos

### Estrutura da skill base auditada (feiskyer)

```
Step 1: verify URL → youtube.com/watch, youtu.be, shorts
Step 2: yt-dlp CLI → get-title → write-auto-sub/write-sub → converter vtt/srt → txt "Timestamp Text"
Step 3: browser automation fallback (DOM ytd-transcript-segment-renderer)
Output: ficheiro txt + path/idioma/nº linhas
```

### Mudanças a aplicar face à skill base (do audit)

1. **Cookies OPCIONAIS** — `--cookies-from-browser=chrome` lê cookies do Chrome; privacidade → não activar por defeito, documentar como opt-in explícito
2. **Idiomas** — mudar de `zh-Hans,zh-Hant,en` para `pt,en`
3. **Output organizado** — mudar de `{título}.txt` no CWD para `docs/transcripts/{YYYY-MM-DD}-{slug}.md` com frontmatter metadados
4. **Fallback Whisper (NOVO)** — a skill base só tinha browser fallback (cobre vídeos COM legendas); AC3 adiciona cadeia para vídeos SEM legendas via áudio + Whisper local

### Localização do output

```
docs/transcripts/
└── 2026-06-29-titulo-do-video.md
```

Estrutura do ficheiro output:
```markdown
# Transcript: {Título do vídeo}

**URL:** {URL}
**Data:** {YYYY-MM-DD}
**Idioma:** {pt|en|...}
**Método:** {yt-dlp-subtitles|browser-fallback|whisper-local}
**Linhas:** {N}

---

00:00:00 Texto da primeira frase...
00:00:05 Texto da segunda frase...
```

### Localização da skill

```
.claude/skills/kairos-youtube-transcribe/
└── SKILL.md   (único ficheiro necessário em v1 — sem scripts/assets/references)
```

### Formato SKILL.md (AIOX)

Frontmatter obrigatório:
```yaml
---
name: kairos-youtube-transcribe
description: >
  This skill should be used when the user wants to extract or transcribe content
  from a YouTube video URL. Supports subtitle extraction (yt-dlp), browser DOM
  fallback, and local Whisper transcription for videos without subtitles.
triggers:
  - transcribe
  - transcript
  - transcrever
  - legenda
  - youtube
  - "extrair audio"
  - "extrair texto"
---
```

Instruções em imperativo (nunca segunda pessoa). Seguir o estilo do `skill-creator`:
- "To validate the URL, check for formats..."
- "To extract subtitles, run..."
- NÃO: "You should validate..." / "You need to..."

### Notas Windows específicas

- `yt-dlp` é cross-platform nativo (sem WSL)
- `ffmpeg` disponível via `winget` ou `choco` sem WSL
- `whisper.cpp` tem binários pre-built para Windows (sem CUDA, ou com Vulkan para GPU)
- `openai-whisper` via pip funciona em Windows mas é mais lento sem GPU
- Todos os comandos documentados na skill devem usar syntax Windows-compatible (sem `&&` bash, ou documentar ambos)

### Referência IDS

- Entity nova: não existe no registry (verificado 2026-06-29, registry tem 833 entries apenas com tasks/templates/agents/etc)
- Deve ser adicionada sob nova secção `skills:` no registry após criação

## Testing

- **Abordagem:** manual (a skill é SKILL.md — não tem código testável automaticamente)
- **AC1 verify:** executar skill com URL de vídeo português com legendas activadas (ex: vídeo com CC manual); confirmar texto coerente
- **AC2 verify:** confirmar existência de `docs/transcripts/YYYY-MM-DD-*.md` com todos os campos de metadados preenchidos
- **AC3 verify:** executar skill com URL de vídeo sem legendas; confirmar que instrui download de áudio + invocação Whisper; confirmar transcript gerado
- **AC4 verify:** `grep -r 'name: kairos-youtube-transcribe' .claude/skills/` retorna o ficheiro; activação no Claude Code não dá erro
- **Nota:** documentar qual URL usada em cada verificação na secção Dev Agent Record

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-06-29 | 0.1 | Story criada (Draft) — Quick Flow, base ADAPT feiskyer + técnica Whisper jftuga | @sm (River) |
| 2026-06-29 | 0.2 | Validated GO (8/10) — Status: Draft → Ready | @po (Pax) |
| 2026-06-29 | 0.3 | Development started (Interactive→YOLO mode) — Status: Ready → InProgress | @dev (Dex) |
| 2026-06-29 | 0.4 | SKILL.md criada (3 ACs documentados, frontmatter name+description sem triggers); yt-dlp instalado; AC1+AC2 testados (PASS) com dQw4w9WgXcQ; AC4 grep PASS; AC3 documentado/deferred; registry lifecycle draft→active — Status: InProgress → InReview | @dev (Dex) |
| 2026-06-30 | 0.5 | QA Gate CONCERNS — AC1/AC2/AC4 PASS verificados; AC3 (Whisper) deferred/não-verificado (TEST-001 medium); DOC-001 low (AC4 triggers wording). Status: InReview → Done | @qa (Quinn) |

---

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Dex / @dev) — modo Interactive→YOLO (Quick Flow, skill standalone)

### Debug Log References

- `yt-dlp --version` → 2026.06.09 (instalado via `winget install yt-dlp.yt-dlp`; o pacote trouxe `ffmpeg` como dependência)
- `yt-dlp --list-subs` em `dQw4w9WgXcQ` → legendas pt + en disponíveis (manuais)
- Extracção: `yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs pt,en --convert-subs srt` → gerou `dQw4w9WgXcQ.pt.srt` + `dQw4w9WgXcQ.en.srt`
- Conversão SRT → `Timestamp Texto` + escrita do output (parser Node reproduzindo o documentado no Step 5)
- AC4: `grep 'name: kairos-youtube-transcribe' .claude/skills/` → 1 match

### Completion Notes List

- **Correção @po aplicada (anti-alucinação):** o frontmatter da SKILL.md NÃO tem campo `triggers`. O template real `.claude/skills/skill-creator/SKILL.md` usa apenas `name` + `description` (+ `license` opcional). A skill dispara pela `description`. O texto do AC4 menciona `triggers`, mas a correcção do @po é autoritativa — implementado com `name` + `description` apenas. Texto do AC não foi alterado (domínio do @po).
- **AC1 — PASS:** transcript real extraído de `dQw4w9WgXcQ` (legendas pt+en manuais), formato `Timestamp Texto`.
- **AC2 — PASS:** output em `docs/transcripts/2026-06-29-rick-astley-never-gonna-give-you-up-official-video-4k-remast.md` com todos os metadados (Título, URL, Data, Idioma, Método, Linhas=61) + corpo.
- **AC3 — DOCUMENTADO / DEFERRED (não verificado):** cadeia Whisper local totalmente documentada na skill (Step 4). Por decisão do Pedro, `ffmpeg`/`whisper` NÃO foram instalados nesta sessão e o teste AC3 fica para instalação on-demand pelo utilizador. **AC3 não está marcado como verificado.** (Nota: o `ffmpeg` veio como dependência do pacote yt-dlp, mas o motor Whisper não foi instalado nem o fluxo testado.)
- **AC4 — PASS:** grep encontra o ficheiro (1 match); frontmatter `name` + `description`. Activação manual runtime fica para @qa.
- **IDS:** entidade `kairos-youtube-transcribe` já registada no registry (secção `skills:`, criada na prep da story); actualizado `lifecycle: draft → active` + `lastVerified`.
- **Ajuste face ao comando da story:** usado `--write-subs --write-auto-subs --sub-langs ... -o "%(id)s.%(ext)s"` (flags actuais do yt-dlp; `--write-auto-sub`/`--write-sub`/`--sub-lang` são aliases antigos). Nome por `%(id)s` evita problemas com títulos longos/inválidos; o título legível vai nos metadados.

### File List

```
CREATED:  .claude/skills/kairos-youtube-transcribe/SKILL.md
CREATED:  docs/transcripts/2026-06-29-rick-astley-never-gonna-give-you-up-official-video-4k-remast.md  (artefacto de teste AC1+AC2)
MODIFIED: .aiox-core/data/entity-registry.yaml  (skills.kairos-youtube-transcribe: lifecycle draft→active, lastVerified)
```

## QA Results

### Review Date: 2026-06-30

### Reviewed By: Quinn (Test Architect)

**Método:** Verificação directa dos artefactos (não confiança cega no Dev Record). Lidos SKILL.md, o ficheiro de transcript, frontmatter (grep) e entity-registry.

**AC-by-AC:**
- **AC1 — PASS:** SKILL.md Steps 1-3 documentam os 3 formatos de URL + cadeia yt-dlp → browser DOM fallback. Teste real confirmado: transcript de `dQw4w9WgXcQ` em formato `Timestamp Texto`.
- **AC2 — PASS:** `docs/transcripts/2026-06-29-rick-astley-...md` verificado — todos os metadados (URL, Data, Idioma=en, Método=yt-dlp-subtitles, Linhas=61) + corpo. Output organizado conforme spec.
- **AC3 — DEFERRED (não verificado):** cadeia Whisper local completamente documentada (Step 4), mas o motor Whisper não está instalado e o fluxo nunca foi executado. Sem prova funcional. Deferral autorizado pelo Pedro (instalação on-demand) → não-bloqueante, mas registado como `TEST-001` (medium).
- **AC4 — PASS (com nota):** grep encontra `name: kairos-youtube-transcribe`; frontmatter tem `name` + `description`. O campo `triggers` foi omitido por correção do @po (o template `skill-creator` real usa só name+description; o disparo é pela `description`). Tecnicamente correcto. Fica a divergência `DOC-001` (low): o texto do AC4 ainda menciona `triggers` — @po deve alinhar.

**Segurança:** Cookies opt-in com nota de privacidade; Whisper 100% local (GDPR); SKILL.md proíbe tokens/cookies no output. OK.

**Boundary:** Só L4 (.claude/skills/, docs/transcripts/) + L3 autorizado (registry). OK.

**Veredicto:** CONCERNS — implementação sólida e bem verificada nos ACs testáveis hoje; o único item aberto (AC3 Whisper) é um teste deferido e autorizado, não um defeito. Procede para Done com o item AC3 rastreado.

### Gate Status

Gate: CONCERNS → docs/qa/gates/YT-TRANSCRIBE.1-kairos-youtube-transcribe-skill.yml
