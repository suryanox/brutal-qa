import { useState } from 'react'
import { UrlInput } from '@/components/UrlInput'
import { Console } from '@/components/Console'
import { AgentDashboard } from '@/components/AgentDashboard'
import { ReportViewer } from '@/components/ReportViewer'
import { useAgentStream } from '@/hooks/useAgentStream'

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { events } = useAgentStream(sessionId)

  async function handleStart(url: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      setSessionId(data.sessionId)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold">BrutalQA</h1>
          <span className="text-sm text-neutral-500">Battle-test your websites</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-6">
        <UrlInput onStart={handleStart} loading={loading} />

        {sessionId && (
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <AgentDashboard events={events} />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-3">
              <div className="flex-1">
                <Console events={events} />
              </div>
              <ReportViewer events={events} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
