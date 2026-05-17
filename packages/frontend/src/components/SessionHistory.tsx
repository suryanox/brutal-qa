import { useEffect } from 'react'
import { useTestStore } from '@/store'

export function SessionHistory() {
  const sessions = useTestStore((s) => s.sessions)
  const setSessions = useTestStore((s) => s.setSessions)
  const viewSessionId = useTestStore((s) => s.viewSessionId)
  const setViewSessionId = useTestStore((s) => s.setViewSessionId)
  const sessionId = useTestStore((s) => s.sessionId)

  useEffect(() => {
    fetch('/api/test/sessions')
      .then((r) => r.json())
      .then((list) => setSessions(list))
      .catch(() => {})
  }, [sessionId, setSessions])

  if (sessions.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-600">
        History
      </p>
      {sessions.slice(0, 10).map((s) => (
        <button
          key={s.id}
          onClick={() => setViewSessionId(viewSessionId === s.id ? null : s.id)}
          className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
            viewSessionId === s.id
              ? 'border-neutral-600 bg-neutral-800'
              : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
          }`}
        >
          <div className="truncate font-medium text-neutral-200">{s.url.replace(/^https?:\/\//, '')}</div>
          <div className="mt-0.5 flex gap-2 text-neutral-500">
            <span>{new Date(s.timestamp).toLocaleTimeString()}</span>
            {s.status === 'done' && (
              <>
                <span className="text-green-400">{s.totalPassed}p</span>
                {s.totalFailed! > 0 && <span className="text-red-400">{s.totalFailed}f</span>}
              </>
            )}
            {s.status === 'running' && <span className="text-blue-400">running</span>}
            {s.status === 'error' && <span className="text-red-400">error</span>}
          </div>
        </button>
      ))}
    </div>
  )
}
