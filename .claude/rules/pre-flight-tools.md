# Pre-Flight Tools — Verificar ANTES de qualquer comando

> Criado via self-improving-agent | 2026-05-17
> Origem: 6 erros de comandos na FASE 1 por não verificar ferramentas disponíveis.

---

## REGRA 0 — VERIFICAR ANTES DE USAR

Antes de correr qualquer ferramenta, verificar:
1. Está instalada?
2. Está no PATH?
3. Em que contexto corre (Bash vs PowerShell)?

---

## COMANDOS CORRECTOS NO KAIROS

| Ferramenta | Errado | Correcto |
|---|---|---|
| Vercel CLI | `vercel --prod` | `npx vercel --prod` |
| shadcn | `npx shadcn-ui@latest` | `npx shadcn@latest` |
| agent-browser | `agent-browser` | `npx agent-browser` |
| tail (PowerShell) | `\| tail -N` | `\| Select-Object -Last N` |
| head (PowerShell) | `\| head -N` | `\| Select-Object -First N` |
| grep (PowerShell) | `\| grep "pattern"` | `\| Select-String "pattern"` |

## PATHS EM CONTEXTOS MISTOS

| Contexto | Path correcto |
|---|---|
| PowerShell | `C:\Users\lealp\KAIROS_CEREBRO\` |
| Bash (via Bash tool) | `/c/Users/lealp/KAIROS_CEREBRO/` |
| **Nunca misturar** — Bash não aceita `C:\` |

## SCREENSHOTS — REGRA PERMANENTE

**SEMPRE usar URL de produção para screenshots de auditoria.**
Nunca depender de dev server local (pode não arrancar em CI).

```bash
# CORRECTO — produção sempre disponível
npx agent-browser open https://kairoscheck.net
npx agent-browser screenshot "/c/Users/lealp/KAIROS_CEREBRO/.ai/design-ref/screenshot.png"

# ERRADO — dev server pode não estar a correr
npx agent-browser open http://localhost:3000
```

## SHADCN INIT — CHECKLIST

Antes de `npx shadcn@latest init`:
1. Verificar se gera `@import "tw-animate-css"` (versão >=2.x gera — precisa de instalar separado)
2. Verificar se `tailwind.config.js` tem os tokens de cores shadcn
3. Verificar se `globals.css` não tem `@apply border-border` sem Tailwind saber da classe

Solução testada e validada em 2026-05-17:
- Remover `@import "tw-animate-css"` e `@import "shadcn/tailwind.css"` de globals.css
- Substituir `@apply border-border outline-ring/50` por CSS directo
- Adicionar tokens ao tailwind.config.js manualmente

## PRE-FLIGHT CHECK (correr antes de qualquer instalação)

```bash
# Verificar ferramentas disponíveis
npx vercel --version 2>/dev/null && echo "vercel OK" || echo "vercel: usar npx"
npx agent-browser --version 2>/dev/null | head -1
node -e "require('framer-motion')" && echo "framer-motion OK" || echo "não instalado"
```

---

*Promovido via self-improving-agent | 2026-05-17 | 6 erros → 6 regras*
