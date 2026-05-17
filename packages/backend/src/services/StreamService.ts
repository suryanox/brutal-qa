import type { StreamEvent } from '../types/index.js'

type Sink = (event: StreamEvent) => void

const sessions = new Map<string, Sink[]>()

export function registerSession(sessionId: string, sink: Sink): () => void {
  if (!sessions.has(sessionId)) sessions.set(sessionId, [])
  sessions.get(sessionId)!.push(sink)
  return () => {
    const list = sessions.get(sessionId)
    if (list) {
      const i = list.indexOf(sink)
      if (i !== -1) list.splice(i, 1)
      if (list.length === 0) sessions.delete(sessionId)
    }
  }
}

export function emit(sessionId: string, event: StreamEvent): void {
  const sinks = sessions.get(sessionId)
  if (sinks) for (const s of sinks) s(event)
}
