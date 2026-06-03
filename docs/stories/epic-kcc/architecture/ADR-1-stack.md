# ADR-1: Stack Técnica — KAIROS COMMAND CENTER

**Status:** Aceite
**Data:** 2026-06-03
**Arquitecta:** Aria (@architect)
**Epic:** EPIC-004

---

## Contexto

O KCC é uma ferramenta local para Pedro (solo founder, único utilizador). Precisa de:
- Ler o filesystem do KAIROS_CEREBRO em tempo real
- Servir uma UI interactiva no browser
- Opcionalmente chamar a Claude API para agent discussions
- Correr com `node bin/kairos-command-center.js` (Constitution Art. I — CLI First)

Pedro já usa Node.js em todos os packages existentes. O KAIROS_CEREBRO já tem Express.js como dependência indirecta via `.aiox-core/`.

---

## Decisão

**Backend: Node.js v24 + Express.js 4.x**
**Frontend: HTML5 + Vanilla JS + CSS Custom Properties**
**Sem build step — serve ficheiros estáticos directamente**

---

## Opções Avaliadas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| Node.js + Express + Vanilla JS | Stack conhecida, sem build, simples | Vanilla JS menos ergonómico | ✅ ESCOLHA |
| Node.js + Fastify + Vanilla JS | Mais rápido, melhor DX | Pedro não conhece Fastify | ❌ |
| Node.js + Express + Vue/React | Melhor DX no frontend | Precisa build step, mais complexo | ❌ |
| Bun + Hono | Mais rápido | Menos estável, Pedro não conhece | ❌ |
| Electron | App nativa, sem server | Muito pesado para este caso | ❌ |

---

## Justificação

1. **Boring technology wins**: Node.js + Express são a stack mais conhecida do Pedro. Menos surpresas = mais velocity.

2. **Sem build step**: A Constitution diz CLI First. Adicionar webpack/vite seria UI complexity desnecessária para uma ferramenta local.

3. **CSS Custom Properties**: Uma definiu tokens CSS nativos. Funcionam sem compilação — decisão de design e stack alinhadas.

4. **Vanilla JS é suficiente**: O KCC é uma SPA simples com tabs. Não precisa de state management complexo (Redux, Pinia). `fetch()` + DOM manipulation chegam.

5. **JetBrains Mono + Inter via CDN**: Fontes servidas via Google Fonts CDN — sem bundling, sem dependência adicional.

---

## Dependências Novas

```json
// packages/kcc/package.json
{
  "name": "@kairos/kcc",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.19.0",
    "js-yaml": "^4.1.0",
    "chokidar": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

- `express`: HTTP server
- `js-yaml`: ler ficheiros YAML dos agentes
- `chokidar`: watch filesystem para live-reload de dados (opcional, Sprint 2)

---

## Consequências

**Positivas:**
- Zero build step — `node bin/kairos-command-center.js` funciona imediatamente
- Stack idêntica ao resto do projecto — Pedro não precisa aprender nada novo
- CSS custom properties da Uma funcionam nativamente
- Fácil de debugar (console.log, Node.js inspector)

**Negativas:**
- Vanilla JS mais verboso que React/Vue para UI complexa
- Sem TypeScript no frontend (acceptable para Sprint 1)
- Sem hot reload de CSS (aceitável para ferramenta local)

**Mitigação do negativo principal:**
Sprint 2+: se Vanilla JS se tornar difícil de gerir, migrar para Alpine.js (2kb, sem build, sem breaking changes).
