import { useEffect, useRef, useState } from 'react'
import type { StreamEvent } from '@/types'

export function useAgentStream(sessionId: string | null) {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [connected, setConnected] = useState(false)
  const evtSource = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const es = new EventSource(`/api/test/stream/${sessionId}`)
    evtSource.current = es
    setConnected(true)

    es.onmessage = (msg) => {
      const event: StreamEvent = JSON.parse(msg.data)
      setEvents((prev) => [...prev, event])
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
    }

    return () => {
      es.close()
      setConnected(false)
    }
  }, [sessionId])

  return { events, connected }
}
