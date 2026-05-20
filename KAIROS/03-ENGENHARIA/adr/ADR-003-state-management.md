# ADR-003: State Management

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + CEO

## Contexto
O frontend precisa de gerir:
- Auth state (utilizador logado, tier, API keys)
- Dashboard state (checks history, quota)
- UI state (modais, toasts, sidebar aberta)
- Chat widget state (mensagens, streaming)

## Decisão
**Zustand para estado global + React Server Components para dados.**

Sem Redux. Sem Context API para dados (só para temas).

## Raciocínio
- Zustand: <1KB bundle, zero boilerplate, perfeito para estado pequeno
- RSC para dados: fetch no servidor = menos JS no cliente
- Runway = 45 dias: Zustand é 10x mais rápido de implementar que Redux
- Chat widget precisa de estado de mensagens = Zustand ideal
- Dashboard quota/keys pode vir do servidor = sem estado no cliente

## Estrutura de stores

```ts
// src/lib/stores/auth.ts
interface AuthStore {
  user: User | null
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
  monthlyChecks: number
  monthlyLimit: number
  setUser: (user: User) => void
  logout: () => void
}

// src/lib/stores/chat.ts
interface ChatStore {
  messages: Message[]
  isStreaming: boolean
  addMessage: (msg: Message) => void
  setStreaming: (v: boolean) => void
}
```

## Alternativas Rejeitadas
- Redux: overkill para esta escala, muito boilerplate
- Context API para dados: re-renders desnecessários
- Jotai: também bom mas Zustand mais familiar
- SWR/React Query: para depois do MVP se necessário

## Consequências
- `npm install zustand` (único pacote extra)
- auth.ts store para user/tier/quota
- chat.ts store para chat widget
- ui.ts store para estado de UI (modais, sidebar)
- Dados do dashboard: fetch directo em Server Components
