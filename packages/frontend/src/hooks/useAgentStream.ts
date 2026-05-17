import { useEffect, useRef } from 'react'
import { useTestStore } from '@/store'

export function useAgentStream() {
  const sessionId = useTestStore((s) => s.sessionId)
  const setConnected = useTestStore((s) => s.setConnected)
  const addEvent = useTestStore((s) => s.addEvent)
  const evtSource = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const es = new EventSource(`/api/test/stream/${sessionId}`)
    evtSource.current = es
    setConnected(true)

    es.onmessage = (msg) => {
      const event = JSON.parse(msg.data)
      addEvent(event)
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
    }

    return () => {
      es.close()
      setConnected(false)
    }
  }, [sessionId, setConnected, addEvent])
}
