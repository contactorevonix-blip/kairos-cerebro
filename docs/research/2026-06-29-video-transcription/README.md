# Research: Melhor skill/agente de transcrição de vídeo (2026)

**Data:** 2026-06-29 · **Pipeline:** tech-search (3 workers Haiku) · **Cobertura:** ~85% · **Estado:** aguarda decisão do Pedro (nada instalado)

## TL;DR

Não há "um melhor" universal — depende de **(a)** fonte (YouTube/links vs ficheiros áudio/vídeo locais) e **(b)** privacidade (local/GDPR vs cloud). Dado o posicionamento GDPR-native do Kairos, a recomendação default é **Whisper local**.

## Candidatos concretos (instaláveis no Claude Code)

| Opção | Tipo | Engine | Custo | Privacidade | Windows | Maturidade |
|-------|------|--------|-------|-------------|---------|------------|
| **whisper-windows-mcp** (eviscerations) | MCP | Whisper.cpp local + GPU Vulkan | Grátis | ✅ Local (áudio fica na máquina) | ✅ Nativo, sem WSL | ⚠️ 0★, novo (Jun 2026) |
| **transcript-critic** (jftuga) | Skill | Whisper.cpp local | Grátis | ✅ Local | ⚠️ Precisa WSL | ✅ MIT, maduro, +análise (sumários, falácias) |
| **audio-transcriber-mcp** (Ichigo3766) | MCP | OpenAI Whisper API | $0.36/h | ❌ Áudio vai p/ OpenAI (retém 30d) | ✅ Cross-platform | 10★, ativo, setup simples |
| **youtube-skills** (ZeroPointRepo) | Skill | Extrai captions YouTube | Grátis | n/a (só links públicos) | ✅ `npx skills add` | Ativo. ⚠️ Só extrai legendas, NÃO transcreve |
| **deAPI skills** | Skill | Cloud deAPI | ~$0.021/h | ❌ Cloud | ✅ | Tudo-em-um (TTS/OCR/imagem também) |

## Notas dos engines (worker 2)
- **Precisão (WER):** Whisper large-v3 ~2.8% · AssemblyAI ~2.1% · Deepgram Nova-3 ~5–10%.
- **GDPR:** só Whisper local mantém áudio na infra. OpenAI Whisper API retém áudio 30 dias apesar de claims.
- **YouTube npm `youtube-transcript-api`:** instável em produção (YouTube bloqueia IPs de cloud) → usar API gerida se for sério.
- **Diarização (quem fala):** AssemblyAI nativo melhor; Whisper precisa PyAnnote externo.

## Recomendação
- **Para uso pessoal/dev, privacidade primeiro, Windows:** `whisper-windows-mcp` (sem WSL, sem custo, local) — risco = imaturo (0★). Alternativa madura: `transcript-critic` (precisa WSL).
- **Para YouTube rápido:** `youtube-skills` (mas é extração de legendas, não transcrição).

> Decisão e instalação aguardam confirmação do Pedro. Instalação de MCP = autoridade @aiox-devops.
