import { useState } from 'react'

interface UrlInputProps {
  onStart: (url: string) => void
  loading: boolean
}

export function UrlInput({ onStart, loading }: UrlInputProps) {
  const [url, setUrl] = useState('')

  return (
    <div className="flex gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
        onKeyDown={(e) => e.key === 'Enter' && !loading && url && onStart(url)}
      />
      <button
        onClick={() => onStart(url)}
        disabled={loading || !url}
        className="rounded-lg bg-neutral-100 px-6 py-2 font-medium text-neutral-900 transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Go'}
      </button>
    </div>
  )
}
