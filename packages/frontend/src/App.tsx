import { UrlInput } from '@/components/UrlInput'
import { Console } from '@/components/Console'
import { AgentDashboard } from '@/components/AgentDashboard'
import { ReportViewer } from '@/components/ReportViewer'
import { SettingsCard } from '@/components/SettingsCard'
import { SessionHistory } from '@/components/SessionHistory'
import { useAgentStream } from '@/hooks/useAgentStream'
import { useTestStore } from '@/store'

function App() {
  useAgentStream()
  const sessionId = useTestStore((s) => s.sessionId)
  const loading = useTestStore((s) => s.loading)
  const settings = useTestStore((s) => s.settings)
  const showSettings = useTestStore((s) => s.showSettings)
  const setShowSettings = useTestStore((s) => s.setShowSettings)
  const viewSessionId = useTestStore((s) => s.viewSessionId)
  const hasSettings = !!settings.apiKey

  if (!hasSettings) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <SettingsCard mode="initial" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      {showSettings && (
        <SettingsCard mode="modal" onClose={() => setShowSettings(false)} />
      )}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold">BrutalQA</h1>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Running
              </span>
            )}
            <span className="text-xs text-neutral-600">
              {settings.provider} / {settings.model}
            </span>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-6">
        <UrlInput />

        {!sessionId && !viewSessionId && !loading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-neutral-600">
              Enter a URL above to start battle-testing.
            </p>
          </div>
        )}

        {(sessionId || viewSessionId) && (
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="flex flex-col gap-4 lg:col-span-1">
              <AgentDashboard />
              <SessionHistory />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-3">
              <div className="flex-1">
                <Console />
              </div>
              <ReportViewer />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
