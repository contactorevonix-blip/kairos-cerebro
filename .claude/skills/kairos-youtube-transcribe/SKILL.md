---
name: kairos-youtube-transcribe
description: >
  Extrai ou transcreve o conteúdo de um vídeo do YouTube a partir do seu URL.
  Usar quando o utilizador pede para transcrever, extrair legendas, extrair
  texto ou obter o transcript de um vídeo YouTube (formatos watch, youtu.be e
  shorts). Tenta legendas via yt-dlp, depois fallback de browser (Chrome
  DevTools MCP) e, para vídeos sem legendas, fallback de Whisper local. Guarda
  o resultado em docs/transcripts/ com metadados.
---

# kairos-youtube-transcribe

Extrai transcritos de vídeos YouTube directamente no Claude Code, sem copy-paste
manual. Produz um ficheiro Markdown organizado, com metadados e corpo no formato
`Timestamp Texto`.

## Quando usar

Activar esta skill quando o pedido envolve obter o texto de um vídeo YouTube —
por exemplo: "transcreve este vídeo", "extrai as legendas de {URL}", "dá-me o
transcript deste short". Aceita os formatos `youtube.com/watch?v=`, `youtu.be/`
e `youtube.com/shorts/`.

## Cadeia de extracção (ordem de tentativa)

```
1. yt-dlp legendas      → método preferido (rápido, sem browser)
        ↓ falha mas vídeo TEM legendas
2. browser DOM fallback → Chrome DevTools MCP (lê painel de transcript)
        ↓ vídeo NÃO tem legendas
3. Whisper local        → yt-dlp baixa áudio → Whisper transcreve (on-demand)
```

Passar ao fallback seguinte apenas quando o anterior falha. Parar no primeiro
método que produza um transcript válido.

---

## Pré-requisitos (Windows)

**Obrigatório (Steps 1-3):**
- `yt-dlp` — instalar: `winget install yt-dlp.yt-dlp` (ou `pip install yt-dlp`)
  - Verificar: `yt-dlp --version`
  - Nota: o pacote winget `yt-dlp.yt-dlp` instala `ffmpeg` como dependência.

**Opcional (Step 4 — só para fallback Whisper, instalação on-demand):**
- `ffmpeg` — necessário para extrair/converter áudio.
  - Instalar: `winget install Gyan.FFmpeg` (ou já presente via pacote yt-dlp).
  - Verificar: `ffmpeg -version`
- Motor Whisper (escolher um):
  - `whisper.cpp` — recomendado em Windows sem WSL. Binários pre-built ou build
    de `github.com/ggerganov/whisper.cpp`. Precisa de um modelo (ex: `ggml-base.bin`).
  - `openai-whisper` — `pip install openai-whisper` (requer Python 3.9+ e ffmpeg
    no PATH). Mais lento sem GPU.
  - Verificar: `whisper --help` ou `./main --help` (whisper.cpp).

**Browser fallback (Step 3):**
- Chrome DevTools MCP disponível na sessão Claude Code (ver `.aiox-core/core-config.yaml`).

---

## Step 1 — Validar o URL e extrair o video ID

Aceitar apenas os três formatos suportados e extrair o `VIDEO_ID` (11 caracteres):

| Formato | Exemplo | VIDEO_ID |
|---------|---------|----------|
| watch | `https://www.youtube.com/watch?v=VIDEO_ID` | parâmetro `v` |
| curto | `https://youtu.be/VIDEO_ID` | segmento de path |
| shorts | `https://www.youtube.com/shorts/VIDEO_ID` | segmento de path |

Se o URL não corresponder a nenhum formato, parar e pedir um URL YouTube válido.
Guardar o `VIDEO_ID` e o URL canónico (`https://www.youtube.com/watch?v=VIDEO_ID`)
para os passos seguintes.

## Step 2 — Extrair legendas via yt-dlp (método preferido)

Primeiro, obter o título do vídeo (para nomear o output e os metadados):

```bash
yt-dlp --skip-download --print "%(title)s" "URL"
```

Listar as legendas disponíveis para decidir o idioma:

```bash
yt-dlp --list-subs --skip-download "URL"
```

Descarregar as legendas (idiomas por defeito `pt,en`; preferir legendas manuais,
com auto-geradas como fallback) e converter para SRT:

```bash
yt-dlp --skip-download --write-subs --write-auto-subs \
  --sub-langs "pt,en" --convert-subs srt \
  -o "%(id)s.%(ext)s" "URL"
```

O resultado é um ficheiro `VIDEO_ID.pt.srt` ou `VIDEO_ID.en.srt`. Registar qual
idioma foi efectivamente obtido (idioma detectado).

**Cookies (OPCIONAL — opt-in por privacidade):** alguns vídeos com restrição de
idade ou região exigem autenticação. A flag `--cookies-from-browser=chrome` lê os
cookies do Chrome do utilizador. NÃO activar por defeito (lê dados de sessão do
browser). Usar apenas com consentimento explícito do utilizador:

```bash
# Só quando o vídeo exige login E o utilizador autoriza explicitamente:
yt-dlp --cookies-from-browser=chrome --skip-download --write-subs \
  --sub-langs "pt,en" --convert-subs srt -o "%(id)s.%(ext)s" "URL"
```

**Converter SRT → formato `Timestamp Texto`:** cada bloco SRT tem um índice, uma
linha de tempo (`00:00:01,000 --> 00:00:04,000`) e o texto. Para cada bloco,
extrair o timestamp de início (formato `HH:MM:SS`) e o texto, produzindo uma
linha por entrada:

```
00:00:01 Primeira frase do vídeo.
00:00:04 Segunda frase do vídeo.
```

Se o Step 2 produzir um transcript válido, avançar para o Step 5 (output).

## Step 3 — Fallback browser (vídeo TEM legendas mas yt-dlp falhou)

Quando o yt-dlp falha (ex: bloqueio, erro de rede) mas o vídeo tem legendas
visíveis no YouTube, usar o Chrome DevTools MCP:

1. Abrir `https://www.youtube.com/watch?v=VIDEO_ID` no browser.
2. Abrir o painel de transcript (menu "..." → "Mostrar transcrição").
3. Ler os segmentos do DOM via selector `ytd-transcript-segment-renderer`:
   - timestamp: `.segment-timestamp`
   - texto: `.segment-text`
4. Compor as linhas no formato `Timestamp Texto` (igual ao Step 2).

Se obtiver transcript, avançar para o Step 5. Caso o vídeo não tenha legendas
disponíveis (nem no painel), avançar para o Step 4.

## Step 4 — Fallback Whisper local (vídeo SEM legendas)

**Condição de activação:** Steps 2 e 3 não encontraram legendas (vídeo sem CC
manuais nem auto-geradas). Esta cadeia transcreve o áudio localmente — nenhum
dado sai da máquina (GDPR-friendly).

1. **Baixar o áudio** com yt-dlp (requer ffmpeg):

   ```bash
   yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 \
     -o "%(id)s.%(ext)s" "URL"
   ```

   Produz `VIDEO_ID.mp3`.

2. **Transcrever com Whisper local** (escolher o motor instalado):

   whisper.cpp (recomendado Windows):
   ```bash
   # Converter para WAV 16kHz (whisper.cpp exige PCM 16kHz mono):
   ffmpeg -i "VIDEO_ID.mp3" -ar 16000 -ac 1 -c:a pcm_s16le "VIDEO_ID.wav"
   # Transcrever (gera VIDEO_ID.wav.srt):
   ./main -m models/ggml-base.bin -f "VIDEO_ID.wav" -osrt -l auto
   ```

   openai-whisper (alternativa, requer Python):
   ```bash
   whisper "VIDEO_ID.mp3" --model base --output_format srt --language auto
   ```

3. **Converter o SRT do Whisper → formato `Timestamp Texto`** (mesma lógica do
   Step 2).

4. **Limpar os ficheiros intermédios** de áudio (`.mp3`/`.wav`) após gerar o
   transcript, para não deixar ficheiros grandes no repositório.

Marcar o método usado como `whisper-local` nos metadados.

## Step 5 — Output organizado

1. **Criar a pasta** `docs/transcripts/` se não existir.

2. **Nomear o ficheiro** `{YYYY-MM-DD}-{sanitized-title}.md`:
   - `YYYY-MM-DD` = data de extracção.
   - `sanitized-title` = título do vídeo em minúsculas, espaços→`-`, removendo
     caracteres inválidos para nomes de ficheiro Windows (`\ / : * ? " < > |`),
     truncado a ~60 caracteres.

3. **Escrever o ficheiro** com esta estrutura:

   ```markdown
   # Transcript: {Título do vídeo}

   **URL:** {URL canónico}
   **Data:** {YYYY-MM-DD}
   **Idioma:** {pt|en|...}
   **Método:** {yt-dlp-subtitles|browser-fallback|whisper-local}
   **Linhas:** {N}

   ---

   00:00:00 Texto da primeira frase...
   00:00:05 Texto da segunda frase...
   ```

4. **Reportar ao utilizador**: path do ficheiro criado, idioma detectado, método
   usado e número de linhas.

---

## Notas Windows específicas

- `yt-dlp` é cross-platform nativo (sem WSL).
- `ffmpeg` disponível via `winget` ou como dependência do pacote `yt-dlp.yt-dlp`.
- `whisper.cpp` tem binários pre-built para Windows (CPU, ou Vulkan para GPU).
- `openai-whisper` via pip funciona em Windows mas é mais lento sem GPU.
- Em comandos com vários passos, evitar `&&` de bash; usar comandos separados ou
  documentar a variante PowerShell quando relevante.
- Citar sempre o URL entre aspas para evitar problemas com `&` no shell.

## Fora de scope (v1)

NÃO implementar nesta skill: resumo automático, extracção de key-points, search
em canais/playlists, análise de conteúdo (sentiment/tópicos), suporte a lotes
(múltiplos URLs), nem upload para serviços externos.

## Privacidade e segurança

- `--cookies-from-browser` é opt-in: só com consentimento explícito do utilizador.
- O fallback Whisper é 100% local — o áudio nunca sai da máquina (GDPR-native).
- Nunca incluir tokens, cookies ou dados de sessão no ficheiro de output.
