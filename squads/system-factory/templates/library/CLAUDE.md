# CLAUDE.md — Library / Package
# Template version: 1.0.0 | system-factory/templates/library
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** Library / Package (npm, reutilizável)
**Stack:** TypeScript + Vitest + tsup (bundler) + npm + JSDoc
**npm:** {NPM_PACKAGE_NAME}
**GitHub:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **API as Contract** — cada export público é uma promessa; quebrá-la custa confiança
2. **Minimal Surface** — expor o mínimo; o que não está público pode mudar livremente
3. **Tree-Shakeable** — side-effect free; o consumidor só paga pelo que usa
4. **Typed by Design** — tipos são documentação executável; nada de `any` na API pública
5. **Backwards Compatible** — semver strict; major versions são raras e bem comunicadas

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` | @devops EXCLUSIVO | todos os outros |
| `npm publish` / release | @devops EXCLUSIVO | todos os outros |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation | @dev | — |
| API design decisions | @architect | @dev directo (API pública) |

---

## 4. Hook Configuration

| Hook | Evento | Propósito |
|------|--------|-----------|
| Commit lint | PreToolUse[Bash(git commit*)] | Bloqueia termos depreciados |
| Push authority | PreToolUse[Bash(git push*)] | Só @devops faz push |
| Post observer | PostToolUse | Log de tool calls |
| Session start | SessionStart | Injecta contexto |
| Task verify | TaskCompleted | Verifica antes de fechar |

---

## 5. Project Structure

```
{PROJECT_NAME}/
├── src/
│   ├── index.ts        # ÚNICO entrypoint público — controla a API surface
│   ├── core/           # implementação interna
│   └── types/          # tipos públicos
├── tests/
├── package.json        # exports, main, module, types fields
├── tsup.config.ts      # config do bundler (ESM + CJS)
└── tsconfig.json
```

**Regra:** só `index.ts` re-exporta o que é público. Tudo o resto é interno e mutável.

---

## 6. Code Standards

- TypeScript strict mode
- Sem `any` na API pública; `unknown` quando necessário
- Funções puras onde possível (testabilidade + tree shaking)
- Imports absolutos internos; nunca importar de paths internos no consumo

---

## 7. Dependency Management

- **Zero deps** é o ideal para uma library
- `dependencies` mínimas; preferir `peerDependencies` para frameworks
- Nunca incluir deps de build em `dependencies`
- Cada dep transitiva é peso no bundle do consumidor

---

## 8. Testing Requirements

**Coverage mínimo:** 90% (libraries têm barra mais alta — são dependência de outros).

**Tipos:**
- Unit: cada função pública isolada
- Type tests: contratos de tipo verificados (ex: `expectType`)
- Bundle test: ESM e CJS ambos importáveis

**Pattern:**
```typescript
describe('parse()', () => {
  it('returns typed result for valid input', () => { ... });
  it('throws TypedError for invalid input', () => { ... });
  it('is importable from both ESM and CJS', () => { ... });
});
```

**Antes de qualquer PR:** `npm test` 100%.

---

## 9. Deployment Pipeline

**Branches:**
- `main` → versão publicável
- `feat/*` → desenvolvimento

**CI/CD (.github/workflows):**
1. Lint + typecheck
2. `npm test` em múltiplas versões de Node
3. Build dual (ESM + CJS) + verificação de tamanho de bundle
4. `npm publish` em tag (só @devops)

---

## 10. Performance Benchmarks

| Métrica | Alvo |
|---------|------|
| Bundle size (minified + gzip) | < {TARGET_KB}kb |
| Tree-shaking | imports não usados eliminados |
| Cold import | < 50ms |

**Bundle size é métrica de qualidade** — regressões de tamanho bloqueiam o merge.

---

## 11. Error Handling Patterns

- Erros públicos são tipados e documentados (parte do contrato)
- Nunca lançar strings cruas — sempre `Error` (ou subclasse tipada)
- Mensagens accionáveis: dizer o que correu mal E como corrigir
- Não engolir erros silenciosamente

```typescript
export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`Invalid ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}
```

---

## 12. Observability & Monitoring

- Libraries não fazem logging por defeito (decisão do consumidor)
- Expor hooks/callbacks opcionais para o consumidor instrumentar
- Nenhum `console.log` na API pública

---

## 13. Development Workflow

**Branches:**
```
main
└── feat/{api-feature}
└── fix/{issue}
└── chore/{description}
```

**Commit format:**
```
feat: add `parse()` to public API [Story 1.1]
fix: correct edge case in serialize()
chore: reduce bundle size
```

**PR checklist:**
- [ ] `npm test` passa
- [ ] Bundle size não regrediu
- [ ] JSDoc nos exports novos
- [ ] CHANGELOG actualizado

---

## 14. Onboarding Checklist

1. **Clone e setup:**
   ```bash
   git clone {GITHUB_URL}
   cd {PROJECT_NAME}
   npm install
   ```

2. **Build dual:**
   ```bash
   npm run build  # gera ESM + CJS
   ```

3. **Testes:**
   ```bash
   npm test
   ```

4. **Verificar bundle:**
   ```bash
   npm run size  # confirma tamanho do bundle
   ```

5. **Dev loop:**
   ```bash
   npm run dev  # watch mode
   ```

---

## 15. Quality Gates

**Antes de qualquer commit:**
- Testes passam
- Lint + typecheck clean
- JSDoc em exports novos

**Antes de qualquer PR:**
- `npm test` 100% (coverage ≥ 90%)
- Bundle size dentro do alvo
- CHANGELOG actualizado

**Antes de qualquer release:**
- semver correcto
- migration guide se major
- `npm pack --dry-run` inspeccionado

---

## Secções Específicas Library

## 16. API Surface Design

**Princípio: minimal public API.**

- Só `src/index.ts` define o que é público — tudo o resto é interno
- Cada export é um contrato que terás de manter
- Não expor tipos internos, helpers, ou detalhes de implementação
- Preferir poucas funções poderosas a muitas funções específicas
- Named exports > default export (melhor para tree shaking e refactor)

```typescript
// src/index.ts — a fronteira da API pública
export { parse } from './core/parser';
export { serialize } from './core/serializer';
export type { ParseOptions, ParseResult } from './types';
// core/internal-helpers NUNCA é exportado
```

---

## 17. Backwards Compatibility

**semver strict:**

| Mudança | Versão |
|---------|--------|
| Bug fix sem mudança de contrato | PATCH |
| Nova função/opção opcional | MINOR |
| Remover/renomear export, mudar assinatura, mudar comportamento | MAJOR |

**Deprecation antes de remover:**
```typescript
/**
 * @deprecated since v2.1 — use `parse()` instead. Removed in v3.
 */
export function parseOld(input: string): Result { ... }
```

**Regras:**
- `@deprecated` JSDoc ≥ 1 minor antes de remover
- Migration guide em `MIGRATIONS.md` para cada major
- CHANGELOG documenta toda a mudança de contrato

---

## 18. Bundle Optimization

**Dual output obrigatório:**

```jsonc
// package.json
{
  "main": "./dist/index.cjs",      // CJS para Node antigo
  "module": "./dist/index.js",     // ESM para bundlers
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "sideEffects": false             // habilita tree shaking agressivo
}
```

**Regras:**
- `"sideEffects": false` — confirmar que NENHUM módulo tem side-effects no import
- Tree shaking: imports não usados devem desaparecer do bundle do consumidor
- Tamanho do bundle é monitorado em CI; regressão bloqueia o merge
- Evitar imports que arrastam dependências pesadas para o grafo
