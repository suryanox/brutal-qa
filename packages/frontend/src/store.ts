import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StreamEvent, FinalReport, SessionInfo } from '@/types'

export interface Settings {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

interface TestStore {
  sessionId: string | null
  loading: boolean
  connected: boolean
  url: string
  events: StreamEvent[]
  report: FinalReport | null
  settings: Settings
  showSettings: boolean
  sessions: SessionInfo[]
  viewSessionId: string | null
  error: string | null

  setSessionId: (id: string | null) => void
  setLoading: (v: boolean) => void
  setConnected: (v: boolean) => void
  setUrl: (url: string) => void
  addEvent: (event: StreamEvent) => void
  setReport: (report: FinalReport) => void
  updateSettings: (s: Settings) => void
  setShowSettings: (v: boolean) => void
  setSessions: (s: SessionInfo[]) => void
  setViewSessionId: (id: string | null) => void
  setError: (msg: string | null) => void
  reset: () => void
}

const defaultSettings: Settings = {
  provider: 'openai',
  baseUrl: '',
  apiKey: '',
  model: 'gpt-4o',
}

export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      sessionId: null,
      loading: false,
      connected: false,
      url: '',
      events: [],
      report: null,
      settings: defaultSettings,
      showSettings: false,
      sessions: [],
      error: null,
      viewSessionId: null,

      setSessionId: (id) => set({ sessionId: id, error: null }),
      setLoading: (v) => set({ loading: v }),
      setConnected: (v) => set({ connected: v }),
      setUrl: (url) => set({ url }),
      addEvent: (event) =>
        set((state) => {
          const events = [...state.events, event]
          const report =
            event.type === 'report:final' ? event.report : state.report
          return { events, report }
        }),
      setReport: (report) => set({ report }),
      updateSettings: (settings) => set({ settings, showSettings: false }),
      setShowSettings: (v) => set({ showSettings: v }),
      setSessions: (sessions) => set({ sessions }),
      setViewSessionId: (id) => set({ viewSessionId: id, error: null }),
      setError: (msg) => set({ error: msg }),
      reset: () =>
        set({
          sessionId: null,
          loading: false,
          connected: false,
          events: [],
          report: null,
          error: null,
        }),
    }),
    {
      name: 'brutalqa-settings',
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
)
