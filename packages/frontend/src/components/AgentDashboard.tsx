import type { AgentStatus } from '@/types'
import { useTestStore } from '@/store'

export function AgentDashboard() {
  const events = useTestStore((s) => s.events)
  const agents = new Map<string, { status: AgentStatus; bugCount: number }>()

  agents.set('orchestrator', { status: 'idle', bugCount: 0 })
  agents.set('analyzer', { status: 'idle', bugCount: 0 })

  for (const ev of events) {
    if ('agent' in ev) {
      if (!agents.has(ev.agent)) {
        agents.set(ev.agent, { status: 'running', bugCount: 0 })
      }
      const agent = agents.get(ev.agent)!
      if (ev.type === 'agent:done') agent.status = 'done'
      if (ev.type === 'bug:found') agent.bugCount++
    }
  }

  return (
    <div className="space-y-2">
      {Array.from(agents.entries()).map(([name, state]) => (
        <div
          key={name}
          className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <StatusDot status={state.status} />
            <span className="text-sm font-medium text-neutral-200">{name}</span>
          </div>
          <div className="flex gap-3 text-xs text-neutral-500">
            {state.bugCount > 0 && (
              <span className="text-red-400">{state.bugCount} bugs</span>
            )}
            {state.status === 'done' && <span className="text-green-400">done</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusDot({ status }: { status: AgentStatus }) {
  const colors = {
    idle: 'bg-neutral-600',
    running: 'bg-blue-500 animate-pulse',
    done: 'bg-green-500',
  }
  return <span className={`h-2 w-2 rounded-full ${colors[status]}`} />
}
