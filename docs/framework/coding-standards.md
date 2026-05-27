# Coding Standards — Kairos Check

## Regras Gerais

1. **Zero TypeScript no backend** — só JavaScript puro (CommonJS)
2. **Zero dependências desnecessárias** — cada package é zero-dep ou mínimo
3. **`'use strict'`** em todos os ficheiros do servidor
4. **Sem frameworks HTTP** — native `node:http` no servidor
5. **Sem ORM no backend** — sniper-db usa ficheiros JSON directamente

## Backend (sniper-api e packages)

```js
// ✅ Correcto — CommonJS, 'use strict', named exports
'use strict';
const fs = require('fs');

function myFunction(input) {
  // ...
}

module.exports = { myFunction };

// ❌ Errado — sem 'use strict', sem named exports
module.exports = function(input) { ... }
```

### Tratamento de erros

```js
// ✅ Sempre com contexto
try {
  const result = await operation();
  return result;
} catch (error) {
  console.error(`[module] Failed to do X:`, error.message);
  throw new Error(`Failed to X: ${error.message}`);
}
```

### Variáveis de ambiente

```js
// ✅ Sempre com fallback ou validação
const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.STRIPE_KEY; // sem fallback se obrigatório — falha cedo
```

## Frontend (packages/web)

- **TypeScript** em todos os ficheiros `.tsx` / `.ts`
- **App Router** — sem Pages Router
- **Server Components por defeito** — Client Components só quando necessário (`'use client'`)
- **Tailwind CSS** — sem CSS inline, sem styled-components
- **shadcn/ui** para componentes UI base

## Testes

```js
// ✅ Node test runner nativo
const { test, describe } = require('node:test');
const assert = require('node:assert');

test('descrição clara do que testa', async () => {
  const result = await myFunction(input);
  assert.equal(result.status, 200);
});
```

- **Um ficheiro de teste por package** em `tests/`
- **Testes de integração** no server: `packages/sniper-api/*.test.js`
- Correr com: `npm test`

## Segurança (obrigatório)

- **Sem secrets em git** — usar `.env` (gitignored)
- **Sem SQL injection** — queries parametrizadas sempre
- **Sem dados sensíveis em logs** — mascarar emails, IPs em logs de produção
- **Rate limiting** em todos os endpoints públicos (`packages/sniper-api/rate-limit.js`)

## Commits

Usar **Conventional Commits**:
```
feat: adicionar endpoint /api/check v2
fix: corrigir rate limit no endpoint público
chore: actualizar dependência stripe
docs: actualizar README com exemplos
```
