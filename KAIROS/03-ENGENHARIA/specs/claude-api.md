# Claude API (Anthropic) — Specs para KairosCheck
> Verificado: platform.claude.com/docs/en/docs/about-claude/models/overview | Data: 2026-05-20 | Owner: @Dex

## Modelos Actuais (verificados 2026-05-20)

| Modelo | ID Exacto | Input/MTok | Output/MTok | Context | Max Output |
|---|---|---|---|---|---|
| **Opus 4.7** | `claude-opus-4-7` | $5 | $25 | 1M tokens | 128k |
| **Sonnet 4.6** | `claude-sonnet-4-6` | $3 | $15 | 1M tokens | 64k |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | $1 | $5 | 200k tokens | 64k |

**Para KairosCheck chat widget:** `claude-sonnet-4-6` (velocidade + inteligência)
**Para tarefas simples:** `claude-haiku-4-5-20251001` (-70% custo)
**Deprecated:** `claude-sonnet-4-20250514` e `claude-opus-4-20250514` — retirados em 15 Jun 2026

## O Essencial
- **Modelo recomendado:** `claude-sonnet-4-6` (melhor custo/performance em 2026)
- **Streaming SSE** para o chat widget — resposta incremental, não bloqueia a UI
- **Prompt caching** reduz custo em até 90% para contextos repetidos (system prompt + docs)
- **Tool use** permite ao Claude chamar a API do KairosCheck durante a conversa
- **Nunca expor `ANTHROPIC_API_KEY` ao browser** — sempre via Route Handler

---

## Messages API — Estrutura Básica

```ts
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: 'És um assistente de suporte do KairosCheck...',
  messages: [
    { role: 'user', content: 'Como faço uma chamada à API?' }
  ],
})

console.log(message.content[0].text)
```

---

## Streaming (para o Chat Widget)

### Route Handler com ReadableStream

```ts
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { messages, systemPrompt } = await request.json()

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })

  // Converter para ReadableStream compatível com Web API
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
```

### Cliente (Chat Widget)

```tsx
// components/chat-widget.tsx
'use client'
import { useState } from 'react'

export function ChatWidget() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage(userMessage: string) {
    setLoading(true)
    setResponse('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setResponse(prev => prev + decoder.decode(value))
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="response">{response}</div>
      {/* input e botões */}
    </div>
  )
}
```

---

## Prompt Caching (reduz custo 90%)

Prompt caching guarda o prefixo do contexto no servidor da Anthropic. Para o chat widget, o system prompt e os docs da API são sempre os mesmos → cachear.

```ts
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  system: [
    {
      type: 'text',
      text: `És o assistente de suporte do KairosCheck. Aqui estão os docs completos da API:\n\n${fullApiDocs}`,
      cache_control: { type: 'ephemeral' },  // ← CACHEAR ESTE BLOCO
    }
  ],
  messages: userMessages,
})
```

**Regras do prompt caching (verificadas nos docs Anthropic):**

| Modelo | Mínimo de tokens para cache |
|---|---|
| Claude Opus 4.7, 4.6 | 4.096 tokens |
| Claude Sonnet 4.6 | 1.024 tokens |
| Claude Haiku 4.5 | 4.096 tokens |

**Pricing de cache (Claude Sonnet 4.6, verificado):**
| Tipo | Custo por MTok |
|---|---|
| Cache write (5 min) | $3.75 (1.25× base) |
| Cache write (1 hora) | $6.00 (2× base) |
| Cache hit | $0.30 (0.1× base — 90% desconto!) |
| Input normal | $3.00 |
| Output | $15.00 |

**Dois modos:**
1. **Automático** (recomendado para conversas): `cache_control` no nível do request
2. **Explícito** (controlo fino): `cache_control` em blocos individuais (máx 4 breakpoints)

```ts
// Modo automático — o sistema decide onde colocar o breakpoint
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  cache_control: { type: 'ephemeral' },  // ← automático
  system: 'És o assistente do KairosCheck...',
  messages: conversationHistory,  // cresce a cada turno
})

// Verificar se cache foi usado
console.log(response.usage.cache_read_input_tokens)    // > 0 se cache hit
console.log(response.usage.cache_creation_input_tokens) // > 0 se escreveu cache
```

```ts
// Pre-warming — carregar cache antes do utilizador interagir
await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 0,  // sem output — só escreve o cache
  system: [{ type: 'text', text: systemPromptWithDocs, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: 'warmup' }]
})
```

**Poupança KairosCheck:**
- System prompt + API docs: ~4.000 tokens por request
- Sem cache: 4.000 × $3/MTok = $0.012/request
- Com cache hit: 4.000 × $0.30/MTok = $0.0012/request
- **Poupança: 90% nos tokens de contexto**

---

## Tool Use (Chat Widget pode chamar a API)

```ts
const tools: Anthropic.Tool[] = [
  {
    name: 'check_domain',
    description: 'Verifica o score de fraude de um domínio usando a API KairosCheck',
    input_schema: {
      type: 'object' as const,
      properties: {
        domain: { type: 'string', description: 'O domínio a verificar (ex: example.com)' },
      },
      required: ['domain'],
    },
  },
]

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  tools,
  messages: [{ role: 'user', content: 'Qual o score de fraude de example.com?' }],
})

// Se o Claude quiser usar uma tool:
if (response.stop_reason === 'tool_use') {
  const toolUse = response.content.find(b => b.type === 'tool_use')
  if (toolUse?.name === 'check_domain') {
    const result = await callKairosCheckAPI(toolUse.input.domain)
    // Continuar a conversa com o resultado da tool
  }
}
```

---

## Modelos Disponíveis (verificados 2026-05-20)

| Modelo | ID Exacto | Input/MTok | Output/MTok | Context | Uso |
|---|---|---|---|---|---|
| **Opus 4.7** | `claude-opus-4-7` | $5 | $25 | 1M | Tarefas complexas |
| **Sonnet 4.6** | `claude-sonnet-4-6` | $3 | $15 | 1M | **Chat widget** ← usar este |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | $1 | $5 | 200k | Classificação simples |

⚠️ **Deprecated:** `claude-sonnet-4-20250514` e `claude-opus-4-20250514` → retirados 15 Jun 2026

**Tool use — custo adicional:**
- ~346 tokens de sistema adicionados automaticamente por request com tools
- Preço: tokens normais de input

**Tool definition melhorada (boas práticas verificadas):**
```ts
const tools = [
  {
    name: 'check_domain',
    // Descrição DETALHADA — é o factor mais importante para performance
    description: `Verifica o score de fraude de um domínio usando a API KairosCheck.
                  Usa esta tool quando o utilizador pede para verificar, analisar, ou
                  avaliar o risco de um domínio específico. Retorna um score de 0-100
                  (100 = risco máximo) e o breakdown por camada (C0-C8).
                  Não usar para verificar emails — só domínios.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        domain: {
          type: 'string',
          description: 'O domínio a verificar. Exemplos: example.com, paypal.com (sem https://)'
        },
        model: {
          type: 'string',
          enum: ['swift', 'check', 'deep'],
          description: 'Modelo de análise. swift=rápido (C0), check=padrão (C0-C7), deep=completo (C0-C8)'
        }
      },
      required: ['domain'],
    },
    // input_examples ajudam o Claude a perceber o formato correcto
    input_examples: [
      { domain: 'example.com', model: 'check' },
      { domain: 'suspicious-site.xyz', model: 'deep' },
      { domain: 'google.com' }
    ]
  }
]
```

**Para o KairosCheck:** usar `claude-sonnet-4-6` no chat widget. Haiku para classificação de risco simples se necessário.

---

## Rate Limits (Tier 1 — conta nova)

| Modelo | RPM | TPM (input) | TPM (output) |
|---|---|---|---|
| claude-sonnet-4-6 | 50 | 40.000 | 8.000 |
| claude-haiku-4-5 | 50 | 50.000 | 10.000 |

Rate limits aumentam automaticamente com uso. Para alto volume, contactar Anthropic.

---

## System Prompt para o Chat Widget KairosCheck

```ts
const KAIROS_SYSTEM_PROMPT = `
És o assistente técnico do KairosCheck, a API de detecção de fraude OSINT-first para indie devs e solo founders.

Ajudas com:
- Integração da API (autenticação, endpoints, parâmetros)
- Interpretação de scores de fraude
- Troubleshooting de webhooks
- Billing e planos

Tom: técnico, directo, sem papo. O utilizador é um developer — trata-o como tal.
Línguas: responde na língua do utilizador (PT ou EN).

Documentação da API:
[inserir docs aqui — este bloco será cacheado]
`
```

---

## Implementação no Next.js — Estrutura Recomendada

```
app/
└── api/
    └── chat/
        └── route.ts    ← Route Handler de streaming

components/
└── chat/
    ├── chat-widget.tsx       ← UI do chat ('use client')
    ├── chat-message.tsx      ← Render de mensagem individual
    ├── chat-input.tsx        ← Input + enviar
    └── chat-bubble.tsx       ← Pill button para abrir o chat
```

---

## Para o KairosCheck

**Chat Widget no site:** Botão flutuante (bottom-right) → abre Sheet lateral (shadcn) com chat. Contexto: docs da API + plan info do utilizador autenticado.

**Custo estimado por mês (500 utilizadores activos, 10 msgs/utilizador/mês):**
- 5.000 requests × 2.000 tokens input (cacheados) × $0.30/MTok = $3/mês em input
- 5.000 requests × 500 tokens output × $15/MTok = $37.50/mês em output
- **Total estimado: ~$40/mês** (com prompt caching activo)

---

## Referências
- https://docs.anthropic.com/en/api/getting-started
- https://docs.anthropic.com/en/api/messages-streaming
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
