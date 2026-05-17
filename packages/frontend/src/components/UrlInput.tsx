import { useTestStore } from '@/store'

export function UrlInput() {
  const url = useTestStore((s) => s.url)
  const loading = useTestStore((s) => s.loading)
  const settings = useTestStore((s) => s.settings)
  const error = useTestStore((s) => s.error)
  const setUrl = useTestStore((s) => s.setUrl)
  const setSessionId = useTestStore((s) => s.setSessionId)
  const setLoading = useTestStore((s) => s.setLoading)
  const setError = useTestStore((s) => s.setError)
  const reset = useTestStore((s) => s.reset)

  async function handleStart() {
    if (!url || loading) return
    reset()
    setLoading(true)
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, settings }),
      })
      if (!res.ok) {
        setError(`Backend error: ${res.status} ${res.statusText}`)
        return
      }
      const data = await res.json()
      setSessionId(data.sessionId)
    } catch (err) {
      setError('Cannot reach backend. Make sure the server is running (make be).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder="https://example.com"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        <button
          onClick={handleStart}
          disabled={loading || !url}
          className="rounded-lg bg-neutral-100 px-6 py-2 font-medium text-neutral-900 transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Go'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
