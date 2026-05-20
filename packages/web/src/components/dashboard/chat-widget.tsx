'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  MessageCircle, Send, X, Zap, ArrowUpRight,
  ChevronDown
} from 'lucide-react'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatResponse {
  reply?: string
  error?: string
  message?: string           // upgrade message quando limite atingido
  free_remaining?: number
  limit?: number
  token_balance?: number
  token_cost?: number
  authenticated?: boolean
  upgrade_url?: string
}

// ─────────────────────────────────────────────────────────
// Quick prompts para primeiro contacto
// ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Como integro a API em Node.js?',
  'Quanto custa e o que inclui o Starter?',
  'O que é o Network Intelligence (C8)?',
  'Como funcionam as 9 camadas?',
]

// ─────────────────────────────────────────────────────────
// Fake streaming — anima char a char (backend não streama)
// ─────────────────────────────────────────────────────────
function useTypingAnimation(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!active || !text) return
    setDisplayed('')
    let i = 0
    // Velocidade: caracteres simples 10ms, pontos/espaços 30ms
    function next() {
      if (i >= text.length) return
      setDisplayed(text.slice(0, i + 1))
      i++
      const char = text[i - 1]
      const delay = /[.!?,]/.test(char) ? 60 : /\s/.test(char) ? 20 : 10
      setTimeout(next, delay)
    }
    next()
  }, [text, active])

  return displayed
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────
export function ChatWidget({ apiKey }: { apiKey?: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null)
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')

  // Animação do último assistente
  const lastAssistant = messages.findLast(m => m.role === 'assistant')
  const typingText = useTypingAnimation(
    lastAssistant?.isStreaming ? lastAssistant.content : '',
    !!lastAssistant?.isStreaming
  )

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingText])

  // Focus no input quando abre
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  // Keyboard shortcut: Ctrl+/ abre o chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading || limitReached) return

    setInput('')
    setLoading(true)

    // Adicionar mensagem do utilizador
    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])

    // Histórico (últimas 6 mensagens = 3 turns)
    const history = messages
      .filter(m => !m.isStreaming)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (apiKey) headers['x-api-key'] = apiKey

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: trimmed, history }),
      })

      const data: ChatResponse = await res.json()
      setLoading(false)

      if (data.reply) {
        // Adicionar resposta com flag isStreaming para animação
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply!,
          isStreaming: true,
        }])

        // Remove isStreaming após a animação terminar (~12ms * length)
        const animDuration = Math.min(data.reply.length * 12, 3000)
        setTimeout(() => {
          setMessages(prev => prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, isStreaming: false } : m
          ))
        }, animDuration)

        if (data.free_remaining !== undefined) setFreeRemaining(data.free_remaining)
        if (data.token_balance !== undefined) setTokenBalance(data.token_balance)

      } else if (res.status === 429) {
        // Limite atingido
        setLimitReached(true)
        setUpgradeMessage(
          data.message ||
          'Limite de mensagens atingido. Cria uma conta grátis para continuar.'
        )
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || 'Limite atingido.',
          isStreaming: false,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Erro ao obter resposta. Tenta novamente.',
          isStreaming: false,
        }])
      }
    } catch {
      setLoading(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro de ligação. Verifica a tua internet e tenta novamente.',
        isStreaming: false,
      }])
    }
  }, [loading, limitReached, messages, apiKey])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    sendMessage(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Botão flutuante */}
      <SheetTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 h-13 w-13 rounded-full
                     flex items-center justify-center gap-2
                     bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                     shadow-lg shadow-blue-500/25
                     transition-all duration-200 hover:scale-105 active:scale-95
                     group px-4"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white hidden group-hover:inline transition-all">
            KairosAI
          </span>
        </button>
      </SheetTrigger>

      {/* Painel do chat */}
      <SheetContent
        side="right"
        className="w-[400px] max-w-[100vw] p-0 flex flex-col
                   bg-[var(--kc-bg-surface)] border-[var(--kc-border-normal)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--kc-border-subtle)] shrink-0">
          <div className="h-9 w-9 rounded-full bg-[var(--kc-accent)]/10 border border-[var(--kc-accent)]/20
                          flex items-center justify-center shrink-0">
            <Zap className="h-4.5 w-4.5 text-[var(--kc-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--kc-text-primary)] leading-none">
              KairosAI
            </p>
            <p className="text-xs text-[var(--kc-text-muted)] mt-0.5">
              Suporte técnico · Sales · Integração
            </p>
          </div>
          {/* Status badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[var(--kc-success)] animate-pulse" />
            <span className="text-xs text-[var(--kc-text-muted)]">online</span>
          </div>
        </div>

        {/* Balance bar (só para utilizadores autenticados) */}
        {tokenBalance !== null && (
          <div className="px-4 py-2 border-b border-[var(--kc-border-subtle)] bg-[var(--kc-bg-elevated)]/50 shrink-0">
            <div className="flex items-center justify-between text-xs text-[var(--kc-text-muted)]">
              <span>Saldo: <span className="font-mono text-[var(--kc-text-secondary)]">{tokenBalance}</span> tokens</span>
              <span>5 tokens/msg</span>
            </div>
          </div>
        )}

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

          {/* Estado inicial com quick prompts */}
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center pt-6 pb-2">
                <div className="h-12 w-12 rounded-2xl bg-[var(--kc-accent)]/10 border border-[var(--kc-accent)]/20
                                flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-[var(--kc-accent)]" />
                </div>
                <p className="text-sm font-medium text-[var(--kc-text-primary)]">
                  O que estás a construir?
                </p>
                <p className="text-xs text-[var(--kc-text-muted)] mt-1">
                  Integro a API em 60 segundos. Explico o que precisas.
                </p>
              </div>
              {/* Quick prompts */}
              <div className="space-y-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs
                               bg-[var(--kc-bg-elevated)] border border-[var(--kc-border-subtle)]
                               text-[var(--kc-text-secondary)] hover:border-[var(--kc-border-accent)]
                               hover:text-[var(--kc-text-primary)] transition-all duration-150
                               flex items-center justify-between group"
                  >
                    {prompt}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de mensagens */}
          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
            const content = isLastAssistant && msg.isStreaming && typingText
              ? typingText
              : msg.content

            return (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-[var(--kc-accent)] text-white rounded-br-md'
                      : 'bg-[var(--kc-bg-elevated)] text-[var(--kc-text-primary)] rounded-bl-md border border-[var(--kc-border-subtle)]'
                    }`}
                >
                  {content}
                  {/* Cursor a piscar durante animação */}
                  {isLastAssistant && msg.isStreaming && (
                    <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5
                                     align-middle animate-[cursor-blink_0.7s_step-end_infinite]" />
                  )}
                </div>
              </div>
            )
          })}

          {/* Indicador de loading (3 dots) */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--kc-bg-elevated)] border border-[var(--kc-border-subtle)]
                              rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[var(--kc-text-muted)]
                                 animate-[bounce-dots_1.2s_ease-in-out_infinite]"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA quando limite atingido */}
          {limitReached && (
            <div className="rounded-2xl bg-[var(--kc-accent)]/5 border border-[var(--kc-accent)]/20 p-4">
              <p className="text-xs font-medium text-[var(--kc-text-primary)] mb-3">
                {upgradeMessage || 'Cria uma conta para continuar.'}
              </p>
              <a
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                           text-white text-xs font-medium transition-colors"
              >
                Criar conta grátis — 100 checks
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--kc-border-subtle)] shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={
                limitReached
                  ? 'Cria uma conta para continuar...'
                  : freeRemaining !== null
                    ? `${freeRemaining} mensagem${freeRemaining !== 1 ? 's' : ''} grátis restante${freeRemaining !== 1 ? 's' : ''}...`
                    : 'Escreve aqui...'
              }
              disabled={loading || limitReached}
              className="flex-1 bg-[var(--kc-bg-elevated)] border border-[var(--kc-border-normal)]
                         rounded-xl px-3.5 py-2.5 text-sm text-[var(--kc-text-primary)]
                         placeholder:text-[var(--kc-text-muted)] outline-none
                         focus:border-[var(--kc-accent)] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading || limitReached}
              size="icon"
              className="h-10 w-10 rounded-xl bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                         disabled:opacity-40 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {/* Hint shortcut */}
          <p className="text-center text-[10px] text-[var(--kc-text-disabled)] mt-2">
            <kbd className="font-mono">Ctrl</kbd> + <kbd className="font-mono">/</kbd> para abrir/fechar
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
