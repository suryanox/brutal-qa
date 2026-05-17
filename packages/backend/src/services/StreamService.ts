import type { StreamEvent } from '../types/index.js'

type Sink = (event: StreamEvent) => void

const sessions = new Map<string, { sinks: Sink[]; buffer: StreamEvent[] }>()

export function registerSession(sessionId: string, sink: Sink): () => void {
  let entry = sessions.get(sessionId)
  if (!entry) {
    entry = { sinks: [], buffer: [] }
    sessions.set(sessionId, entry)
  }
  entry.sinks.push(sink)
  for (const ev of entry.buffer) sink(ev)
  return () => {
    if (!entry) return
    const i = entry.sinks.indexOf(sink)
    if (i !== -1) entry.sinks.splice(i, 1)
    if (entry.sinks.length === 0) sessions.delete(sessionId)
  }
}

export function emit(sessionId: string, event: StreamEvent): void {
  let entry = sessions.get(sessionId)
  if (!entry) {
    entry = { sinks: [], buffer: [] }
    sessions.set(sessionId, entry)
  }
  entry.buffer.push(event)
  for (const s of entry.sinks) s(event)
}
