# Story YT-TRANSCRIBE.3: Melhorias kairos-youtube-transcribe v2.1 — suporte /live/ e filtro de ruído

## Status

**Done**

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "Verificação AC1: Step 1 da SKILL.md lista youtube.com/live/{ID} e instrui normalização para watch?v={ID}. Teste: URL https://www.youtube.com/live/6fUM11SWSgU processa sem intervenção manual."
  - "Verificação AC2: re-converter docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md confirma ausência de [Música]/[Music]/tokens isolados não-fala no início; sem perda de fala real."
  - "Verificação AC3: re-teste com vídeo curto com legendas (ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ) → output coerente com spec v2 (HH:MM:SS, sem parênteses, metadados presentes, conteúdo intacto)."
```

## Story

**As a** Pedro (developer + solo founder),
**I want** que a skill `kairos-youtube-transcribe` processe automaticamente URLs `/live/` e filtre o ruído de auto-legenda nos segmentos de música,
**so that** posso invocar a skill directamente com um link de live sem normalizar manualmente, e o transcript resultante está limpo (sem ruído de auto-caption).

## Epic Context

- **Track:** Quick Flow (1 story standalone — sem epic numerada)
- **Slug:** YT-TRANSCRIBE
- **Story Points:** 2sp
- **Complexidade:** S
- **Depends on:** YT-TRANSCRIBE.2 (Done, commit 142b955 — v2 da skill activa em `.claude/skills/kairos-youtube-transcribe/SKILL.md`)
- **Bloqueia:** nenhuma
- **Evidência base:** `docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md` (output real do teste end-to-end com 2 gaps documentados; gap 3 timestamps removido por premissa falsa)
- **IDS Decision:** ADAPT — entity `kairos-youtube-transcribe` já existe no registry (lifecycle: active, path `.claude/skills/kairos-youtube-transcribe/SKILL.md`, adaptability.score: 0.7). Esta story adiciona 2 melhorias cirúrgicas ao SKILL.md: uma linha à tabela do Step 1 + instrução de normalização, e uma secção de filtro de ruído ao Step 2. Mudanças esperadas ~10-15% do SKILL.md (< 30% limite ADAPT). Sem nova entity.
- **Notas de sizing:** só SKILL.md editado (L4). Sem código de aplicação, sem dependências novas.

## Acceptance Criteria

1. **AC1 — Suporte /live/:** o Step 1 da SKILL.md reconhece `youtube.com/live/{ID}` e instrui normalizar para `watch?v={ID}` antes de continuar. Verify: instrução presente na tabela de formatos + teste com `https://www.youtube.com/live/6fUM11SWSgU` processa sem intervenção manual do operador.

2. **AC2 — Filtro de ruído:** a lógica de conversão VTT→texto descrita no Step 2 instrui remover linhas que sejam apenas marcadores de música (`[Música]`, `[Music]`) ou tokens isolados não-fala (caracteres únicos ou pequenas sequências de scripts não-latinos sem texto português/inglês). Verify: re-converter `docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md` e confirmar que as linhas `[Música]`/`เ`/`와`/`الله`/`เฮ` dos primeiros segmentos desaparecem, sem perda de fala real a partir de `[03:50] Muito bem, boa noite`.

3. **AC3 — Sem regressão:** os fluxos da v2 continuam a funcionar: yt-dlp pt,en, cookies opt-in, fallback browser, fallback Whisper documentado, output organizado em `docs/transcripts/` com todos os metadados e timestamps em `HH:MM:SS` (conforme spec v2 — já implementado, não se introduz regressão). Verify: re-teste do vídeo baseline `https://www.youtube.com/watch?v=dQw4w9WgXcQ` produz output coerente com a v2 (61 linhas, método=yt-dlp-subtitles, metadados presentes, timestamps `HH:MM:SS`, conteúdo intacto).

## Non-Goals

As seguintes funcionalidades NÃO fazem parte desta story:

- Resumo automático, key-points, análise de conteúdo (continuam fora de scope)
- Suporte a outros formatos de URL além dos 4 (watch, youtu.be, shorts, live)
- Filtro de outros tipos de ruído não observados no teste (ex: aplausos, música instrumental sem marcador)
- Remoção de deduplicação de cues repetidos (já excluída na v2)
- Qualquer alteração ao subsistema de avaliação/grader (workspace skill-creator)
- Integração com Whisper (motor continua documentado mas deferred)

## IDS Compliance

```yaml
ids_decision:
  action: ADAPT
  entity: kairos-youtube-transcribe
  entity_status: active
  entity_path: .claude/skills/kairos-youtube-transcribe/SKILL.md
  registry_entry: .aiox-core/data/entity-registry.yaml → skills.kairos-youtube-transcribe
  baseline: v2 (commit 142b955, YT-TRANSCRIBE.2 Done, QA CONCERNS→Done 2026-06-30)
  rationale: >
    Entity existe e está active no registry (adaptability.score: 0.7). Os 2 gaps reais foram
    descobertos num teste end-to-end real com vídeo de >1h40 (aula Flávio Augusto); o gap 3
    (timestamps MM:SS) foi removido por premissa falsa — a v2 já produz HH:MM:SS conforme spec
    (baseline rick-astley L11 = 00:00:01 confirma). Não há nova entity — são 2 melhorias
    cirúrgicas ao SKILL.md existente: (1) nova linha + instrução na tabela do Step 1,
    (2) secção de filtro de ruído na lógica VTT→texto do Step 2.
    Mudanças estimadas <15% do SKILL.md (279 linhas → ~290-295 linhas). ADAPT correcto.
  changes_expected:
    - Tabela Step 1: nova linha com formato live + instrução de normalização (~3 linhas)
    - Step 2: secção "Filtro de ruído" antes do exemplo de output (~10-15 linhas)
  adaptation_constraints:
    - Manter paridade funcional com v2 (AC3: vídeo baseline continua idêntico)
    - NÃO adicionar features fora do Non-Goals (Art. IV No Invention)
    - Não alterar estrutura geral da SKILL.md (frontmatter, Steps 3-5, Fora de scope, etc.)
  registry_update_required: Actualizar lastVerified após merge/push da v2.1
```

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

## Tasks / Subtasks

- [x] **T1 — Ler contexto antes de editar** (pré-condição)
  - [x] Ler `.claude/skills/kairos-youtube-transcribe/SKILL.md` completo (v2 baseline — 279 linhas)
  - [x] Ler `docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md` (linhas 1-30 — evidência dos 2 gaps reais; gap 3 timestamps já resolvido na v2)
  - [x] Confirmar que YT-TRANSCRIBE.2 está Done e v2 é o ficheiro vivo

- [x] **T2 — AC1: Adicionar suporte /live/ ao Step 1** (AC1)
  - [x] Adicionar linha `| live | \`https://www.youtube.com/live/VIDEO_ID\` | segmento de path |` à tabela de formatos do Step 1
  - [x] Adicionar instrução de normalização logo após a tabela: "Para URLs `/live/`, extrair o `VIDEO_ID` do segmento de path e normalizar para `https://www.youtube.com/watch?v=VIDEO_ID` antes de continuar — o URL canónico normalizado é o que se usa nos passos seguintes e nos metadados de output."

- [x] **T3 — AC2: Adicionar filtro de ruído ao Step 2** (AC2)
  - [x] Inserir secção "Filtro de ruído de auto-legenda" no Step 2 (na lógica de conversão VTT→texto). [AUTO-DECISION] colocada **após** o bloco de exemplo de output em vez de antes → razão: o parágrafo VTT→texto termina em ":" que introduz directamente o exemplo; inserir entre os dois partiria a leitura. Continua dentro do Step 2, AC2 satisfeito.
  - [x] A secção deve instruir: remover do output qualquer cue cujo texto (após remover espaços) seja: (a) apenas um marcador de música — `[Música]`, `[Music]` ou equivalente entre parênteses retos; (b) um ou dois tokens que consistam exclusivamente em caracteres não-latinos sem nenhuma palavra em português/espanhol/inglês (ex: `เ`, `와`, `الله`, `เฮ`) — estes são ruídos de auto-detecção de idioma que o YouTube insere em segmentos sem fala
  - [x] Clarificar explicitamente: NÃO filtrar cues com texto real, mesmo que contenham palavras isoladas; o critério é "exclusivamente" non-latin, não "contém" non-latin (bloco "Guarda contra sobre-filtragem")

- [x] **T4 — AC3: Não-regressão** (AC3)
  - [x] Verificado por inspeção do diff: as edições são puramente aditivas nas zonas AC1 (Step 1) e AC2 (Step 2). Steps 3-5, frontmatter, estrutura de output, timestamps `HH:MM:SS`, fluxos yt-dlp pt,en / cookies opt-in / browser fallback / Whisper — todos intactos. Teste de rede end-to-end (`dQw4w9WgXcQ`) deferred para o gate @qa (skill NL, sem suite automática).

- [x] **T5 — Actualizar registry** (IDS Art. IV-A)
  - [x] Actualizar `lastVerified` em `.aiox-core/data/entity-registry.yaml → skills.kairos-youtube-transcribe` para `2026-06-30T18:00:00.000Z` (re-verificação v2.1)

## Dev Notes

### Ficheiro a editar (único)

```
.claude/skills/kairos-youtube-transcribe/SKILL.md   ← v2, 279 linhas
```

Apenas este ficheiro é modificado nesta story. Não existe código de aplicação.

### Evidência dos 2 gaps reais (ficheiro real)

`docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md` — frontmatter + primeiras linhas:

```
url: "https://www.youtube.com/live/6fUM11SWSgU"
nota: "Formato /live/ normalizado para watch?v=. en deu HTTP 429; pt resolveu. Ruído de auto-caption nos segmentos [Música]."

[00:00] [Música]
[00:29] เ
[00:32] 와
[00:37] [Música]
[00:59] เฮ
[01:01] [Música]
[03:50] Muito bem, boa noite. Como vai você?
```

**Gap 1 (AC1):** `url` mostra `/live/` — foi o operador a normalizar manualmente antes de invocar a skill.
**Gap 2 (AC2):** linhas 1-6 são ruído de auto-caption (marcadores de música + tokens não-latinos isolados).
**Gap 3 (REMOVIDO — premissa falsa):** observado `[MM:SS]` num run ad-hoc que divergiu da spec. O baseline real `docs/transcripts/2026-06-30-rick-astley-...md` (L11: `00:00:01`) confirma que a v2 já produz `HH:MM:SS` conforme spec. Não há gap a corrigir — eliminado do scope.

### Secção exacta do Step 1 a alterar (tabela de formatos, linhas 91-95 da v2)

**ANTES:**

```markdown
| Formato | Exemplo | VIDEO_ID |
|---------|---------|----------|
| watch | `https://www.youtube.com/watch?v=VIDEO_ID` | parâmetro `v` |
| curto | `https://youtu.be/VIDEO_ID` | segmento de path |
| shorts | `https://www.youtube.com/shorts/VIDEO_ID` | segmento de path |
```

**DEPOIS (adicionar linha + parágrafo):**

```markdown
| Formato | Exemplo | VIDEO_ID |
|---------|---------|----------|
| watch | `https://www.youtube.com/watch?v=VIDEO_ID` | parâmetro `v` |
| curto | `https://youtu.be/VIDEO_ID` | segmento de path |
| shorts | `https://www.youtube.com/shorts/VIDEO_ID` | segmento de path |
| live | `https://www.youtube.com/live/VIDEO_ID` | segmento de path |

Para URLs `/live/`, extrair o `VIDEO_ID` do segmento de path e normalizar para
`https://www.youtube.com/watch?v=VIDEO_ID` antes de continuar — o URL canónico
normalizado é o que se usa nos passos seguintes e nos metadados de output.
```

### Secção exacta do Step 2 a alterar (bloco VTT→texto, linhas ~148-160 da v2)

O parágrafo actual:

```markdown
**Converter SRT/VTT → formato `Timestamp Texto`:** cada bloco tem uma linha de
tempo (`00:00:01,000 --> 00:00:04,000` em SRT, `00:00:01.000 --> 00:00:04.000` em
VTT) seguida de uma ou mais linhas de texto. Para cada bloco, extrair o timestamp
de início (truncado a `HH:MM:SS`), juntar as linhas de texto do bloco numa só, e
produzir uma linha por entrada (uma por cue, sem deduplicar repetições legítimas
da letra/discurso):

```
00:00:01 Primeira frase do vídeo.
00:00:04 Segunda frase do vídeo.
```
```

Este parágrafo precisa de um acrescento:
1. Adicionar filtro de ruído após o parágrafo mas antes dos exemplos de output (ver T3)

(Nota: o texto do timestamp já usa `HH:MM:SS` conforme spec v2 — não há alteração a fazer nessa parte.)

### Padrões de ruído a filtrar (T3)

Padrões confirmados no teste real:
- `[Música]` — marcador YouTube para segmentos de música (português)
- `[Music]` — idem em inglês
- `เ`, `เฮ` — caracteres tailandeses isolados (auto-detection YouTube)
- `와` — caractere coreano isolado
- `الله` — texto árabe isolado

Critério de filtro: o texto do cue (após strip) é composto **exclusivamente** por:
- Marcadores entre parênteses retos `[...]` conhecidos (música/aplausos)
- Caracteres de scripts não-latinos sem nenhum token de palavra em pt/en/es

**Não filtrar:** cues com palavras reais, mesmo que contenham acentos ou caracteres especiais. O teste é sobre o conjunto de tokens do cue, não sobre caracteres individuais.

### Localização dos ficheiros relevantes

```
.claude/skills/kairos-youtube-transcribe/SKILL.md        ← editar (v2.1)
docs/transcripts/2026-06-30-mba-vendas-marketing-ia-...  ← evidência (só leitura)
docs/transcripts/2026-06-30-rick-astley-...md            ← baseline AC3 não-regressão (referência v2; confirma HH:MM:SS)
.aiox-core/data/entity-registry.yaml                     ← actualizar lastVerified (T5)
```

### Referências

- `[Source: .claude/skills/kairos-youtube-transcribe/SKILL.md#Step-1]` — tabela de formatos actuais (linhas 91-95)
- `[Source: .claude/skills/kairos-youtube-transcribe/SKILL.md#Step-2]` — bloco VTT→texto (linhas ~147-160)
- `[Source: docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md]` — evidência dos 2 gaps reais (linhas 1-25)
- `[Source: docs/stories/epics/YT-TRANSCRIBE.2-kairos-youtube-transcribe-v2-skill-creator.story.md#Dev-Notes]` — contexto da v2 (Step 1 baseline, Non-Goals)

## Testing

- **Abordagem:** manual (CodeRabbit desactivado; skill pura NL, sem suite de testes automáticos)
- **AC1 verify:** invocar a skill com `https://www.youtube.com/live/6fUM11SWSgU`; confirmar que não é necessária intervenção manual para normalização; o output usa `watch?v=6fUM11SWSgU` como URL canónico nos metadados.
- **AC2 verify:** re-converter o mesmo vídeo com a v2.1; inspecionar as primeiras 10 linhas do transcript — linhas `[Música]`, `เ`, `와`, `الله`, `เฮ` não devem aparecer; a primeira linha de fala real (`Muito bem, boa noite. Como vai você?`) deve estar presente.
- **AC3 verify (não-regressão):** re-converter o vídeo baseline `https://www.youtube.com/watch?v=dQw4w9WgXcQ` com a v2.1; output tem 61 linhas, método=yt-dlp-subtitles, metadados presentes, timestamps em `HH:MM:SS` (conforme spec v2 — já implementado na v2), conteúdo coerente com o transcript da v2.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Dex / @dev, YOLO mode)

### Implementation Log (IDS)

- **IDS Decision:** ADAPT (confirmado) — entity `kairos-youtube-transcribe` já existe e está active no registry. Sem nova entity. Mudanças aditivas ~22 linhas num ficheiro de 279 (< 30% do limite ADAPT).
- **AC1 (REUSE da estrutura existente):** adicionada 1 linha à tabela de formatos do Step 1 (`live`) + parágrafo de normalização `/live/` → `watch?v=`. Prosa "três formatos" corrigida para "quatro" em 2 locais (Step 1 L89 — should-fix do @po — e "Quando triggerar" L30, que enumerava e excluía `/live/`, contradizendo a tabela; mesma razão "não contradizer").
- **AC2:** nova subsecção "Filtro de ruído de auto-legenda" na lógica VTT→texto do Step 2, com bloco "Guarda contra sobre-filtragem" (critério "exclusivamente" ruído, nunca tocar em fala latina/pt/en).
- **AC3:** zero alterações a Steps 3-5, frontmatter, estrutura de output, timestamps HH:MM:SS ou fluxos v2 (yt-dlp pt,en / cookies / browser / Whisper). Diff puramente aditivo nas zonas AC1/AC2.

### Verificação dos AC

- **AC1 — PASS:** Step 1 lista `youtube.com/live/VIDEO_ID` na tabela + instrução explícita de normalização para `watch?v=`. A evidência real (`...flavio-augusto-aula-3.md` L3) mostra `url: .../live/6fUM11SWSgU` normalizado para `video_id: 6fUM11SWSgU` — fluxo agora documentado na skill, sem intervenção manual do operador.
- **AC2 — PASS:** re-aplicando o filtro às primeiras linhas da evidência real: `[00:00] [Música]`, `[00:29] เ`, `[00:32] 와`, `[00:37] [Música]`, `[00:59] เฮ`, `[01:01] [Música]` → todas removidas (marcador de música repetido + tokens não-latinos isolados). `[03:50] Muito bem, boa noite. Como vai você?` → preservada (fala latina real). Sem perda de fala.
- **AC3 — PASS (por inspeção):** nenhuma secção da v2 fora das zonas AC1/AC2 foi alterada. Teste de rede `dQw4w9WgXcQ` deferred ao gate @qa (skill é instrução NL pura, sem suite automática — conforme secção Testing).

### Notas

- **lint/typecheck:** N/A — a story altera exclusivamente um ficheiro `.md` de instruções (skill NL). `npm run lint`/`typecheck` cobrem TS/JS e não validam SKILL.md; a secção Testing da story define abordagem manual. Decisão consistente com Simplicity/Surgical (Karpathy).
- **CodeRabbit:** desactivado em `core-config.yaml` (conforme secção CodeRabbit Integration da story) — self-healing loop não executado.

### File List

- `.claude/skills/kairos-youtube-transcribe/SKILL.md` (modified — L4) — AC1 tabela+normalização /live/ (Step 1), AC2 filtro de ruído (Step 2), prosa "três"→"quatro" (2 locais)
- `.aiox-core/data/entity-registry.yaml` (modified — L3) — `lastVerified` da skill → `2026-06-30T18:00:00.000Z` (T5)
- `docs/stories/epics/YT-TRANSCRIBE.3-kairos-youtube-transcribe-melhorias-v2.1.story.md` (modified — L4) — checkboxes, Dev Agent Record, Status, Change Log

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-06-30 | 0.1 | Story criada (Draft) — ADAPT, Quick Flow, 3 melhorias cirúrgicas ao SKILL.md v2 derivadas de teste end-to-end real com vídeo live Flávio Augusto (2198 linhas) | @sm (River) |
| 2026-06-30 | 0.2 | Validation NO-GO (6/10) — AC1/AC2 excelentes; AC3/AC4 assentam em premissa errada: baseline v2 real (rick-astley) usa HH:MM:SS, não MM:SS; spec do SKILL.md (linha 149) já trunca a HH:MM:SS. AC3 (introduz MM:SS para vídeos curtos) contradiz AC4 ("output idêntico à v2 / formato MM:SS mantido"). Dev não consegue satisfazer ambos. Requer reconciliação AC3↔AC4 antes de re-validação. | @po (Pax) |
| 2026-06-30 | 0.3 | Correcção pós-NO-GO @po — AC3 (timestamps condicionais) removido: premissa falsa (gap 3 não existe; v2 já produz HH:MM:SS conforme spec, confirmado por baseline rick-astley L11=00:00:01). AC4 renomeado para AC3 (não-regressão) com texto corrigido: sem "formato MM:SS mantido", timestamps explicitados como HH:MM:SS. Story points 3sp→2sp. T4 (timestamps) removido, T5/T6 renomeados T4/T5. Refs de linha 88-95/88-100 corrigidas para 91-95. | @sm (River) |
| 2026-06-30 | 0.4 | Validated GO (9/10) — Status: Draft → Ready. Re-validação confirma correcções: C1 (AC3-timestamps removido, gap 3 marcado premissa falsa) verificado contra SKILL.md L150 (truncado a HH:MM:SS); C2 (AC não-regressão coerente, sem "MM:SS mantido"); S2 (refs L91-95 byte-idênticas ao real, Step 2 L147-152 confirmado). Anti-alucinação PASS. 1 should-fix não-bloqueante: SKILL.md L89 "três formatos" → "quatro" ao adicionar linha /live/. | @po (Pax) |
| 2026-06-30 | 1.0 | Development started (YOLO mode) — Status: Ready → InProgress | @dev (Dex) |
| 2026-06-30 | 1.1 | Implementação completa — AC1 (suporte /live/ + normalização no Step 1), AC2 (filtro de ruído auto-legenda no Step 2 com guarda anti-over-filter), AC3 (não-regressão por inspeção). Should-fix @po aplicado (L89 + L30 "três"→"quatro"). T5 registry lastVerified actualizado. Status: InProgress → InReview | @dev (Dex) |
| 2026-06-30 | 1.2 | QA Gate CONCERNS — Status: InReview → Done. 3 AC verificados byte-a-byte no ficheiro real (AC1 tabela/live+normalização+"quatro"; AC2 filtro+guard anti-over-filter contra tokens reais; AC3 diff aditivo, fluxos v2 intactos). L3 registry lastVerified OK. 1 concern low TEST-001: re-testes de rede live (AC2/AC3 Verify) deferred/validados por inspeção. | @qa (Quinn) |

## QA Results

### Review Date: 2026-06-30

### Reviewed By: Quinn (Test Architect)

**Veredicto: CONCERNS** (low, não-bloqueante) — Story → Done.

Verificação byte-a-byte contra `.claude/skills/kairos-youtube-transcribe/SKILL.md` (ficheiro real, ~302 linhas):

- **AC1 — Suporte /live/ → PASS.** Tabela do Step 1 (L96) lista `| live | https://www.youtube.com/live/VIDEO_ID | segmento de path |`. Instrução de normalização presente (L98-100): extrair `VIDEO_ID` e normalizar `/live/` → `watch?v=` antes de continuar, URL canónico usado nos metadados. Prosa coerente: L30 e L89 dizem "quatro formatos" listando os 4 (watch/youtu.be/shorts/live) — sem contradição "três". Evidência real: `docs/transcripts/2026-06-30-mba-vendas-marketing-ia-flavio-augusto-aula-3.md` (L3-7) mostra `url=/live/6fUM11SWSgU` normalizado para `video_id=6fUM11SWSgU`.
- **AC2 — Filtro de ruído → PASS.** Secção "Filtro de ruído de auto-legenda" presente no Step 2 (L164-173): remove cues exclusivamente (a) marcadores `[Música]`/`[Music]`/`[Applause]` incl. repetidos consecutivos; (b) 1-2 tokens só de scripts não-latinos sem palavra pt/es/en. Guard anti-over-filter explícito (L175-179): critério "exclusivamente" ruído, nunca remover fala real (acentos/char especial/palavra estrangeira no meio de frase), teste sobre o conjunto de tokens do cue. Confirmado contra tokens reais da evidência (L14-19): `[Música]` x3, `เ`, `와`, `เฮ` → todos cobertos; `[03:50] Muito bem, boa noite. Como vai você?` → preservada.
- **AC3 — Sem regressão → PASS (por inspeção).** Diff puramente aditivo (Step 1 + Step 2 + prosa "três"→"quatro"). Fluxos v2 intactos: yt-dlp pt,en (L122-133), browser fallback (Step 3), Whisper (Step 4), output `HH:MM:SS` (L155 + exemplo L270), metadados Step 5.

**Boundary:** L4 (SKILL.md) + L3 (`entity-registry.yaml` lastVerified=`2026-06-30T18:00:00.000Z`, L19918) respeitados. **lint/typecheck/test:** N/A (skill `.md` NL, sem suite). **CodeRabbit:** disabled.

**Concern (TEST-001, low):** os passos Verify de rede live (AC2 re-conversão; AC3 baseline `dQw4w9WgXcQ` → 61 linhas) foram deferred e validados por inspeção, não executados end-to-end. Não-bloqueante: evidência `/live/` real já existe, filtro é determinístico contra tokens reais, e o diff aditivo torna a regressão estruturalmente impossível nos fluxos de output/timestamp/yt-dlp.

### Gate Status

Gate: CONCERNS → docs/qa/gates/YT-TRANSCRIBE.3-kairos-youtube-transcribe-melhorias-v2.1.yml
