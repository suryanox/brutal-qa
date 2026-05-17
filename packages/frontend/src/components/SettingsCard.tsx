import { useState } from 'react'
import { useTestStore } from '@/store'
import type { Settings } from '@/store'

interface SettingsCardProps {
  mode?: 'initial' | 'modal'
  onClose?: () => void
}

export function SettingsCard({ mode = 'modal', onClose }: SettingsCardProps) {
  const saved = useTestStore((s) => s.settings)
  const updateSettings = useTestStore((s) => s.updateSettings)

  const [form, setForm] = useState<Settings>({ ...saved })

  function update(field: keyof Settings, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!form.apiKey) return
    updateSettings(form)
    onClose?.()
  }

  const isInitial = mode === 'initial'

  return (
    <div
      className={`${isInitial ? 'flex min-h-screen items-center justify-center bg-neutral-950' : ''}`}
    >
      <div
        className={`w-full ${isInitial ? 'max-w-md' : 'max-w-sm'} rounded-xl border ${
          isInitial ? 'border-neutral-700 bg-neutral-900 p-6 shadow-lg' : 'border-neutral-800 bg-neutral-900 p-5'
        }`}
      >
        <h2 className="mb-1 text-lg font-semibold text-neutral-100">
          {isInitial ? 'Configure LLM Provider' : 'Settings'}
        </h2>
        {isInitial && (
          <p className="mb-4 text-sm text-neutral-500">
            Enter your API details to get started.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Provider
            </label>
            <input
              value={form.provider}
              onChange={(e) => update('provider', e.target.value)}
              placeholder="openai"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Base URL <span className="text-neutral-600">(optional)</span>
            </label>
            <input
              value={form.baseUrl}
              onChange={(e) => update('baseUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              API Key
            </label>
            <input
              value={form.apiKey}
              onChange={(e) => update('apiKey', e.target.value)}
              type="password"
              placeholder="sk-..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Model
            </label>
            <input
              value={form.model}
              onChange={(e) => update('model', e.target.value)}
              placeholder="gpt-4o"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {!isInitial && (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.apiKey}
            className="flex-1 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
