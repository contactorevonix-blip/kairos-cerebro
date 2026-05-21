import { useEffect, useRef, useCallback, useState } from 'react'
import type { WsMessage } from '../types'

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketOptions {
  url: string
  onMessage: (msg: WsMessage) => void
  reconnectInterval?: number
  maxRetries?: number
}

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 2000,
  maxRetries = 10,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<WsStatus>('connecting')
  const [retryCount, setRetryCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const shouldReconnect = useRef(true)
  const onMessageRef = useRef(onMessage)

  // Keep ref up to date without restarting ws
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      retryCountRef.current = 0
      setRetryCount(0)
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as WsMessage
        onMessageRef.current(msg)
      } catch {
        // malformed message — ignore
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onclose = () => {
      if (!shouldReconnect.current) return
      const nextRetry = retryCountRef.current + 1
      retryCountRef.current = nextRetry
      setRetryCount(nextRetry)

      if (nextRetry <= maxRetries) {
        setStatus('connecting')
        const delay = Math.min(reconnectInterval * Math.pow(1.5, nextRetry - 1), 30_000)
        setTimeout(connect, delay)
      } else {
        setStatus('disconnected')
      }
    }
  }, [url, reconnectInterval, maxRetries])

  useEffect(() => {
    shouldReconnect.current = true
    connect()

    return () => {
      shouldReconnect.current = false
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { status, retryCount, send }
}
