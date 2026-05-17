import { useEffect, useRef } from 'react'
import type { StreamEvent } from '@/types'

interface ConsoleProps {
  events: StreamEvent[]
}

export function Console({ events }: ConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm leading-relaxed">
      {events.length === 0 && (
        <p className="text-neutral-500">Waiting for test to start...</p>
      )}
      {events.map((ev, i) => (
        <div key={i} className="py-0.5">
          <span className="mr-2 text-neutral-600">
            {String(i + 1).padStart(3, ' ')}
          </span>
          <LogLine event={ev} />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function LogLine({ event }: { event: StreamEvent }) {
  switch (event.type) {
    case 'agent:start':
      return (
        <span>
          <span className="text-blue-400">[{event.agent}]</span>{' '}
          <span className="text-blue-300">{event.message}</span>
        </span>
      )
    case 'agent:log':
      return (
        <span>
          <span className="text-green-400">[{event.agent}]</span>{' '}
          <span className="text-neutral-300">{event.message}</span>
        </span>
      )
    case 'agent:action':
      return (
        <span>
          <span className="text-yellow-400">[{event.agent}]</span>{' '}
          <span className="text-yellow-300">
            {event.action}
            {event.selector ? ` ${event.selector}` : ''}
          </span>
        </span>
      )
    case 'agent:done':
      return (
        <span>
          <span className="text-purple-400">[{event.agent}]</span>{' '}
          <span className="text-purple-300">done</span>
        </span>
      )
    case 'bug:found':
      return (
        <span>
          <span className="text-red-400">[BUG]</span>{' '}
          <span className="text-red-300">{event.description}</span>
        </span>
      )
    case 'error':
      return (
        <span>
          <span className="text-red-500">[ERROR]</span>{' '}
          <span className="text-red-400">{event.message}</span>
        </span>
      )
    case 'report:final':
      return (
        <span>
          <span className="text-green-500">[REPORT]</span>{' '}
          <span className="text-green-400">{event.report.summary}</span>
        </span>
      )
    default:
      return <span className="text-neutral-500">{JSON.stringify(event)}</span>
  }
}
