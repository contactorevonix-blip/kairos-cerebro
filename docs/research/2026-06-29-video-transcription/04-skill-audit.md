# Auditoria — youtube-transcribe-skill (feiskyer)

**Data:** 2026-06-29 · **Fase 0 (segurança)** · Repo: github.com/feiskyer/claude-code-settings (1.6k★, MIT)

## Segurança: ✅ VERDE
- Skill é **apenas `SKILL.md`** (4.7KB, instruções em NL). Sem scripts `.sh/.py`, sem binários, sem network calls embutidos.
- Comandos invocados: `yt-dlp` (ferramenta confiável) + Chrome DevTools MCP (fallback). Nenhum red-flag (cf. devil's advocate: untrusted network calls / bloated docs — ausentes).

## Pontos de atenção (a melhorar na nossa versão)
1. **Cookies do browser** — `yt-dlp --cookies-from-browser=chrome` lê cookies do Chrome p/ contornar logins. Padrão, mas privacidade → tornar **opcional**.
2. **Idiomas default** = `zh-Hans,zh-Hant,en` (autor chinês) → mudar p/ `pt,en`.
3. **Output** = `<Video Title>.txt` no CWD → melhorar p/ pasta organizada + metadados (AC2).
4. **Fallback** atual = browser automation (Chrome DevTools MCP), **não Whisper**. Só cobre vídeos COM legendas.

## Estrutura original (base p/ ADAPT)
- Step 1: verify URL (youtube.com/watch, youtu.be, shorts)
- Step 2: yt-dlp CLI — get-title → write-auto-sub/write-sub → converter vtt/srt → txt `Timestamp Text`
- Step 3: browser automation fallback (DOM `ytd-transcript-segment-renderer`)
- Output: ficheiro txt + reporta path/idioma/nº linhas

## Cadeia desenhada p/ a versão Kairos
1. yt-dlp extrai legendas (base, preservar)
2. yt-dlp falha + legendas existem → browser (preservar)
3. **sem legendas → yt-dlp baixa áudio + Whisper local (NOVO, AC3)**
4. **output organizado em pasta + metadados (NOVO, AC2)**

## Dependências da versão final
`yt-dlp` (base) · `ffmpeg` + `whisper`/`whisper.cpp` (só p/ AC3 fallback)
