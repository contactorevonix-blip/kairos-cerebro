# Known Gotchas

> Auto-generated from session insights
> Last updated: 2026-01-29T03:31:04.348Z
> Total gotchas: 4

This document contains common pitfalls and their solutions discovered during development.
Each gotcha includes the **wrong** approach, the **right** approach, and the **reason** why.

---

## Table of Contents

- [State Management](#state-management) (1)
- [API](#api) (2)
- [Other](#other) (1)

---

## State Management

### Zustand Persist Type Inference

**[MEDIUM]**

**Wrong:**

```typescript
const useStore = create(
  persist((set) => ({ ... }), { name: 'store' })
);
```

**Right:**

```typescript
const useStore = create<StoreType>()(
  persist((set) => ({ ... }), { name: 'store' })
);
```

**Reason:** Without explicit type parameter and extra parentheses, TypeScript cannot infer the store type correctly.

**Severity:** Medium

**Discovered:** STORY-7.4-TEST (2026-01-29)

**Related Files:** src/stores/authStore.ts

---

## API

### Fetch Error Handling

**[HIGH]**

**Wrong:**

```typescript
const data = await fetch(url).then((r) => r.json());
```

**Right:**

```typescript
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
const data = await response.json();
```

**Reason:** fetch() doesn't throw on HTTP errors (4xx, 5xx), only on network failures.

**Severity:** High

**Discovered:** STORY-7.4-TEST (2026-01-29)

**Related Files:** src/lib/api.ts

---

### Zustand persist middleware requires async hydration - com...

**[HIGH]**

**Reason:** Zustand persist middleware requires async hydration - common pitfall is to not wait for hydration

**Severity:** High

**Discovered:** STORY-7.4-TEST (2026-01-29)

**Related Files:** src/stores/authStore.ts

---

## Other

### React useEffect Cleanup

**[HIGH]**

**Wrong:**

```typescript
useEffect(() => {
  fetchData();
}, [id]);
```

**Right:**

```typescript
useEffect(() => {
  let cancelled = false;
  const fetch = async () => {
    const data = await fetchData();
    if (!cancelled) setData(data);
  };
  fetch();
  return () => {
    cancelled = true;
  };
}, [id]);
```

**Reason:** Without cleanup, race conditions can occur when the component unmounts or dependencies change before the async operation completes.

**Severity:** High

**Discovered:** STORY-7.4-TEST (2026-01-29)

---

## Fumadocs v16 + Next.js (aiox-academy)

### Fumadocs: Import paths correctos v16

**[HIGH]**

**Wrong:**
```typescript
import { RootProvider } from 'fumadocs-ui/provider';
import { createMDXSource } from 'fumadocs-mdx';
import { docs, meta } from '@/.source';
```

**Right:**
```typescript
import { RootProvider } from 'fumadocs-ui/provider/next';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { docs, meta } from '@/.source/server';
// Usage: toFumadocsSource(docs, meta)  ← positional args, not object
```

**Reason:** Fumadocs v16 reorganizou os exports. `createMDXSource` não existe — usar `toFumadocsSource`. Provider tem sub-paths por framework. `.source` tem submodules (`/server`, `/browser`, `/dynamic`).

**Severity:** High

**Discovered:** Story 1.1 AIOX Academy (2026-06-01)

**Related Files:** aiox-academy/app/source.ts, aiox-academy/app/layout.tsx

---

### Fumadocs: `.source/` deve ser excluído do ESLint

**[MEDIUM]**

**Wrong:** ESLint a analisar `.source/*.ts` (gerado automaticamente com `@ts-nocheck`)

**Right:** Adicionar `.source/**` ao `globalIgnores` em `eslint.config.mjs`

**Reason:** `.source/` é gerado pelo `fumadocs-mdx` via `npx fumadocs-mdx`. Tem `@ts-nocheck` e tipos `{}` que disparam erros de lint. Não deve ser editado nem analisado.

**Severity:** Medium

**Discovered:** Story 1.1 AIOX Academy (2026-06-01)

**Related Files:** aiox-academy/eslint.config.mjs

---

### Fumadocs: page.data.body requer type assertion

**[LOW]**

**Wrong:**
```typescript
const MDX = page.data.body;  // TypeScript error: body não existe no tipo
```

**Right:**
```typescript
const data = page.data as unknown as { title: string; body: FC; toc: TocEntry[] };
const MDX = data.body;
```

**Reason:** `toFumadocsSource` não propaga os tipos MDX para o `loader`. O body existe em runtime mas TypeScript não o conhece.

**Severity:** Low

**Discovered:** Story 1.1 AIOX Academy (2026-06-01)

**Related Files:** aiox-academy/app/lessons/[[...slug]]/page.tsx

---

---

---

## CodeRabbit CLI

### URL de instalação errada no task file

**[MEDIUM]**

**Wrong:**
```bash
curl -fsSL https://coderabbit.ai/install.sh | bash
```

**Right:**
```bash
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

**Reason:** O domínio correcto é `cli.coderabbit.ai`, não `coderabbit.ai`. O task file `environment-bootstrap.md` tinha o URL errado. Retorna HTTP 404.

**Severity:** Medium

**Discovered:** environment-bootstrap audit (2026-06-03)

**Related Files:** .aiox-core/development/tasks/environment-bootstrap.md

---

## Statistics

| Metric            | Value |
| ----------------- | ----- |
| Total Gotchas     | 5     |
| Categories        | 4     |
| Insights Scanned  | 1     |
| Duplicates Merged | 0     |

---

_Generated by AIOX Gotchas Documenter v1.0.0_
