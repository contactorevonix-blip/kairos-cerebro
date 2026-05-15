# Code Audit — sessão 2026-05-15 — landing + security + CI

> Auditores: @qa Quinn (qualidade) · @security-architect (segurança) · @architect Aria (processo)
> Commits auditados: 258ddc5 → 20de8cb (7 commits)

---

## Files Auditados vs Audit Matrix

| Ficheiro | Commit | Auditado? | Razão |
|---|---|---|---|
| `packages/sniper-api/server.js` | 91f5cef | ✅ SIM | Auth logic → audit obrigatório |
| `packages/sniper-api/landing-page.js` | 258ddc5, 5211ecf, d1a186a, 20de8cb | ⚠️ PARCIAL | Matrix diz "copy only" = skip, mas foram adicionados JS executável — auditado parcialmente |
| `.github/workflows/*.yml` | b322ffb | SKIP | Não está na Audit Matrix |
| `.ai/DAILY_BRIEF.md` | d796930 | SKIP | `.ai/**` → skip |

---

## VIOLAÇÕES DE PROCESSO — BLOQUEIA PRÓXIMO MERGE

### [HIGH-P1] @security-architect NÃO foi consultado em 91f5cef

**Regra violada:** CLAUDE.md — cadeia SEGURANÇA/BILLING:
```
1. @architect (Aria)        → decisão arquitectural
2. @security-architect      → revisão de segurança  ← SALTADO
3. @dev (Dex)               → implementa
4. @qa (Quinn)              → audit OBRIGATÓRIO
5. @devops (Gage)           → git push (ÚNICO)
```

**O que aconteceu:** O agente principal (@dev Dex) implementou autenticação de dashboard sem passar por @security-architect. Mesmo que o código esteja tecnicamente correcto, o processo foi violado. Qualquer mudança em auth logic requer revisão de @security-architect antes de push.

**Impacto:** Baixo (o código funciona e é razoável), mas o processo serve exactamente para apanhar o que foi encontrado abaixo.

---

## Issues de CÓDIGO

### [MEDIUM-1] Token em query string expõe segredo nos logs

**Ficheiro:** `server.js` — `checkAdminAuth()`

**Problema:**
```javascript
return new URLSearchParams(qs).get('token') === ADMIN_TOKEN;
```

O `?token=` aparece em:
- Logs de acesso do Railway (request URL completo)
- Logs do Cloudflare
- Histórico do browser
- Cabeçalhos `Referer` se clicar em links dentro do dashboard

**Recomendação:** Remover suporte a `?token=` query param. Usar APENAS `Authorization: Bearer`. Para acesso via browser, usar uma cookie de sessão ou Basic Auth.

**Fix prioritário?** Sim — assim que o ADMIN_TOKEN estiver em produção activo.

---

### [MEDIUM-2] `checkAdminAuth` fail-open em produção se env var não definida

**Ficheiro:** `server.js` linha 59

```javascript
const ADMIN_TOKEN = process.env.KAIROS_ADMIN_TOKEN || '';

function checkAdminAuth(req) {
  if (!ADMIN_TOKEN) return true; // ← dashboard aberto se env var não definida
```

**Problema:** Se Railway perder a variável de ambiente (restart, rollback, novo serviço), o dashboard volta a estar público sem qualquer aviso visível em runtime.

**Recomendação:** Em produção (`NODE_ENV=production`), recusar arrancar o servidor se ADMIN_TOKEN não estiver definido:
```javascript
if (!ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
  console.error('FATAL: KAIROS_ADMIN_TOKEN must be set in production');
  process.exit(1);
}
```

---

### [LOW-1] landing-page.js JS adicionado mas tratado como "copy only" na Audit Matrix

**Commits afectados:** 5211ecf, d1a186a

**O que foi adicionado:** IntersectionObserver rewrite, counter animation IIFE, activity feed counter IIFE.

**Avaliação:** O JS é client-side, não toca em dados do servidor, não faz fetch, usa `.textContent` (não `.innerHTML`). **Sem XSS risk.** Mas a Audit Matrix deve ser actualizada para incluir JS executável em landing-page.js como auditável.

---

### [LOW-2] Carousel loop jump — bug de renderização (não segurança)

**Ficheiro:** `landing-page.js` — `.testimonials-track`

**Problema técnico:** `gap: 1.25rem` na track + `width: max-content` + `translateX(-50%)`:
- Set 1: 8 × 340px + 7 × 20px gap = **2860px**
- Gap entre set 1 e set 2: 20px
- Loop point real: 2860 + 20 = **2880px** (13.3% of track)
- `translateX(-50%)` move: **2870px** (50% de 5740px total)
- **Diferença: 10px** → salto visível no loop

**Fix:** `gap: 0` + `margin-right` em cada card = slots de largura exata, `-50%` alinha perfeitamente.

---

## BOAS PRÁTICAS CONFIRMADAS ✅

| Check | Resultado |
|---|---|
| git push EXCLUSIVO @devops | ✅ PASS — todos os 7 commits |
| @qa Quinn antes de cada push | ✅ PASS — 170/170 em cada commit |
| Secrets hardcoded | ✅ NENHUM — lê de process.env |
| PII em logs | ✅ NENHUM — apenas domain strings públicas |
| npm install sem aprovação | ✅ NENHUM |
| DAILY_BRIEF lido antes de agir | ✅ SIM |
| Plano mostrado antes de código | ✅ SIM (primeira sessão) |

---

## Verdict

```
AUDIT_NEEDS_FIX

HIGH (processo): @security-architect saltado em 91f5cef
MEDIUM-1: token em query string expõe ADMIN_TOKEN nos logs
MEDIUM-2: fail-open auth em produção se env var perdida
LOW-1: Audit Matrix precisa de actualização para JS em landing-page.js
LOW-2: Carousel loop jump (fix a implementar nesta sessão)

Próxima acção obrigatória:
1. Fix MEDIUM-2 (server.js — fail-closed em produção) → @dev + @security-architect + @devops
2. Fix LOW-2 (carousel jump) → @dev + @devops
3. Para MEDIUM-1: avaliar remoção do ?token= → Pedro decide
```
