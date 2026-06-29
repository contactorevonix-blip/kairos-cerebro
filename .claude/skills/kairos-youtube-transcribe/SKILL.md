---
name: kairos-youtube-transcribe
description: >-
  Extrai ou transcreve o conteúdo de um vídeo do YouTube a partir do seu URL,
  guardando um Markdown organizado em docs/transcripts/. Usar sempre que o
  utilizador queira o texto, as legendas ou o transcript de um vídeo YouTube —
  por frases como "transcreve este vídeo", "extrai as legendas de", "dá-me o
  transcript", "o que é dito neste vídeo" ou simplesmente ao colar um link
  youtube.com/watch, youtu.be ou youtube.com/shorts, mesmo que não diga a
  palavra "transcrever". Tenta legendas via yt-dlp, depois um fallback de
  browser e, para vídeos sem legendas, transcrição local com Whisper.
---

# kairos-youtube-transcribe

Extrai transcritos de vídeos YouTube directamente no Claude Code, sem copy-paste
manual nem serviços online. O resultado é um ficheiro Markdown em
`docs/transcripts/`, com metadados no topo e o corpo no formato `Timestamp Texto`.

A skill existe para um caso concreto: o Pedro cola um link do YouTube e quer o
texto do vídeo dentro do repositório, de forma reproduzível e privada (nenhum
áudio ou cookie sai da máquina). Mantém o âmbito enxuto — extrai e organiza, não
resume nem analisa.

## Quando triggerar

Ativar quando o pedido envolve obter o texto de um vídeo YouTube a partir de um
URL: "transcreve este vídeo", "extrai as legendas de {URL}", "dá-me o transcript
deste short", ou quando o utilizador cola um link YouTube e claramente quer o
conteúdo em texto. Os três formatos aceites são `youtube.com/watch?v=`,
`youtu.be/` e `youtube.com/shorts/`.

Não ativar para pedidos que partilham vocabulário mas precisam de outra coisa:
transcrever um ficheiro de áudio local (sem URL YouTube), resumir um vídeo já
transcrito, ou pesquisar vídeos num canal. Esses casos estão fora de scope.

## A cadeia de extracção (e porquê esta ordem)

```
1. yt-dlp legendas      → preferido: rápido, sem browser, determinístico
        ↓ falha mas o vídeo TEM legendas
2. browser DOM fallback → lê o painel de transcript do YouTube (Chrome DevTools MCP)
        ↓ o vídeo NÃO tem legendas
3. Whisper local        → yt-dlp baixa o áudio → Whisper transcreve (on-demand)
```

A ordem é deliberada: `yt-dlp` resolve a esmagadora maioria dos casos com um
único comando e zero dependências pesadas, por isso é o primeiro. O fallback de
browser só ganha quando `yt-dlp` é bloqueado (rede/anti-bot) mas as legendas
existem na página. O Whisper é o último recurso porque transcrever áudio é lento
e exige um motor instalado — só vale a pena quando não há mesmo legendas.

Avançar para o fallback seguinte apenas quando o anterior falha. Parar no primeiro
método que produza um transcript válido.

---

## Pré-requisitos (Windows)

**Obrigatório (Steps 1-3):**

- `yt-dlp` — instalar com `winget install yt-dlp.yt-dlp` (ou `pip install yt-dlp`).
  Verificar com `yt-dlp --version`. O pacote winget traz `ffmpeg` como dependência.

**Opcional (Step 4 — só para o fallback Whisper, instalação on-demand):**

- `ffmpeg` — necessário para extrair e converter áudio. Instalar com
  `winget install Gyan.FFmpeg` (ou reutilizar o que vem com o pacote yt-dlp).
  Verificar com `ffmpeg -version`.
- Um motor Whisper (escolher um):
  - `whisper.cpp` — recomendado em Windows sem WSL; binários pre-built ou build de
    `github.com/ggerganov/whisper.cpp`. Precisa de um modelo (ex.: `ggml-base.bin`).
  - `openai-whisper` — `pip install openai-whisper` (requer Python 3.9+ e ffmpeg
    no PATH). Mais lento sem GPU.
  - Verificar com `whisper --help` ou `./main --help` (whisper.cpp).

**Browser fallback (Step 3):**

- Chrome DevTools MCP disponível na sessão Claude Code
  (ver `.aiox-core/core-config.yaml`).

Se a ferramenta obrigatória de um passo faltar, dizê-lo ao utilizador e sugerir o
comando de instalação em vez de falhar em silêncio.

---

## Step 1 — Validar o URL e extrair o video ID

Aceitar apenas os três formatos suportados e extrair o `VIDEO_ID` (11 caracteres):

| Formato | Exemplo | VIDEO_ID |
|---------|---------|----------|
| watch | `https://www.youtube.com/watch?v=VIDEO_ID` | parâmetro `v` |
| curto | `https://youtu.be/VIDEO_ID` | segmento de path |
| shorts | `https://www.youtube.com/shorts/VIDEO_ID` | segmento de path |

Se o URL não corresponder a nenhum formato, parar e pedir um URL YouTube válido —
adivinhar o formato leva a comandos errados e a transcrições do vídeo errado.
Guardar o `VIDEO_ID` e o URL canónico (`https://www.youtube.com/watch?v=VIDEO_ID`)
para os passos seguintes.

## Step 2 — Extrair legendas via yt-dlp (método preferido)

Obter primeiro o título do vídeo (serve para nomear o output e preencher os
metadados):

```bash
yt-dlp --skip-download --print "%(title)s" "URL"
```

Listar as legendas disponíveis para decidir o idioma:

```bash
yt-dlp --list-subs --skip-download "URL"
```

Descarregar as legendas (idiomas por defeito `pt,en`; preferir legendas manuais e
deixar as auto-geradas como fallback):

```bash
# Sem ffmpeg: descarrega VTT (directamente parseável, ver abaixo)
yt-dlp --skip-download --write-subs --write-auto-subs \
  --sub-langs "pt,en" -o "%(id)s.%(ext)s" "URL"

# Opcional, só se preferires SRT (a flag --convert-subs EXIGE ffmpeg no PATH):
yt-dlp --skip-download --write-subs --write-auto-subs \
  --sub-langs "pt,en" --convert-subs srt -o "%(id)s.%(ext)s" "URL"
```

O resultado é um ficheiro `VIDEO_ID.pt.vtt`/`VIDEO_ID.en.vtt` (ou `.srt` com a
conversão). **VTT e SRT têm a mesma estrutura `timestamp + texto`** — não é preciso
ffmpeg para o caminho de legendas; só o fallback Whisper (Step 4) precisa mesmo de
ffmpeg. Registar qual idioma foi efectivamente obtido — é um dos metadados do output.

**Cookies (OPCIONAL — opt-in por privacidade):** alguns vídeos com restrição de
idade ou região exigem autenticação. A flag `--cookies-from-browser=chrome` lê os
cookies do Chrome do utilizador. NÃO a usar por defeito, porque lê dados de sessão
do browser; ativá-la só com consentimento explícito do utilizador e apenas quando
o vídeo exigir login:

```bash
# Só quando o vídeo exige login E o utilizador autoriza explicitamente:
yt-dlp --cookies-from-browser=chrome --skip-download --write-subs \
  --sub-langs "pt,en" --convert-subs srt -o "%(id)s.%(ext)s" "URL"
```

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

Se o Step 2 produzir um transcript válido, avançar directamente para o Step 5.

**Resolução de problemas (yt-dlp):**

- `HTTP Error 429: Too Many Requests` — rate-limit transitório do YouTube. Tentar
  de novo passado um momento; se uma faixa de idioma falhar (ex.: `pt`) mas outra
  resolver (ex.: `en`), usar a que veio e registar esse idioma.
- `No supported JavaScript runtime` / `ffmpeg not found` — avisos, não erros; as
  legendas continuam a descarregar em VTT. Instalar ffmpeg só é necessário para o
  Step 4 (Whisper) ou para forçar SRT.

## Step 3 — Fallback browser (vídeo TEM legendas mas yt-dlp falhou)

Quando o `yt-dlp` falha (bloqueio anti-bot, erro de rede) mas o vídeo tem legendas
visíveis no YouTube, usar o Chrome DevTools MCP:

1. Abrir `https://www.youtube.com/watch?v=VIDEO_ID` no browser.
2. Abrir o painel de transcript (menu "..." → "Mostrar transcrição").
3. Ler os segmentos do DOM via selector `ytd-transcript-segment-renderer`:
   - timestamp: `.segment-timestamp`
   - texto: `.segment-text`
4. Compor as linhas no formato `Timestamp Texto` (igual ao Step 2).

Se obtiver transcript, avançar para o Step 5. Se o vídeo não tiver legendas (nem
no painel), avançar para o Step 4.

## Step 4 — Fallback Whisper local (vídeo SEM legendas)

**Condição de activação:** os Steps 2 e 3 não encontraram legendas (vídeo sem CC
manuais nem auto-geradas). Esta cadeia transcreve o áudio localmente — nenhum dado
sai da máquina, o que mantém a transcrição GDPR-friendly.

1. **Baixar o áudio** com yt-dlp (requer ffmpeg):

   ```bash
   yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 \
     -o "%(id)s.%(ext)s" "URL"
   ```

   Produz `VIDEO_ID.mp3`.

2. **Transcrever com Whisper local** (usar o motor instalado):

   whisper.cpp (recomendado em Windows):

   ```bash
   # Converter para WAV 16kHz mono (whisper.cpp exige PCM 16kHz):
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

Marcar o método como `whisper-local` nos metadados.

## Step 5 — Output organizado

1. **Criar a pasta** `docs/transcripts/` se ainda não existir.

2. **Nomear o ficheiro** `{YYYY-MM-DD}-{sanitized-title}.md`:
   - `YYYY-MM-DD` = data de extracção.
   - `sanitized-title` = título do vídeo em minúsculas, espaços → `-`, removendo
     os caracteres inválidos para nomes de ficheiro Windows (`\ / : * ? " < > |`),
     truncado a ~60 caracteres.

3. **Escrever o ficheiro** com esta estrutura exacta:

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

4. **Reportar ao utilizador**: o path do ficheiro criado, o idioma detectado, o
   método usado e o número de linhas.

---

## Notas Windows específicas

- `yt-dlp` é cross-platform nativo (não precisa de WSL).
- `ffmpeg` está disponível via `winget` ou como dependência do pacote `yt-dlp.yt-dlp`.
- `whisper.cpp` tem binários pre-built para Windows (CPU, ou Vulkan para GPU).
- `openai-whisper` via pip funciona em Windows mas é mais lento sem GPU.
- Em comandos com vários passos, evitar `&&` de bash; usar comandos separados ou
  documentar a variante PowerShell quando for relevante.
- Citar sempre o URL entre aspas para evitar problemas com o `&` no shell.

## Fora de scope

Esta skill extrai e organiza — nada mais. Não implementar aqui: resumo automático,
extracção de key-points, search em canais ou playlists, análise de conteúdo
(sentiment/tópicos), suporte a lotes (vários URLs numa invocação), nem upload do
transcript para serviços externos. Manter o âmbito enxuto é intencional: a skill
faz uma coisa de forma fiável.

## Privacidade e segurança

- `--cookies-from-browser` é opt-in: usar só com consentimento explícito do utilizador.
- O fallback Whisper é 100% local — o áudio nunca sai da máquina (GDPR-native).
- Nunca incluir tokens, cookies ou dados de sessão no ficheiro de output.
