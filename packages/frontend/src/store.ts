import { create } from 'zustand'
import type { StreamEvent, FinalReport } from '@/types'

interface TestStore {
  sessionId: string | null
  loading: boolean
  connected: boolean
  url: string
  events: StreamEvent[]
  report: FinalReport | null

  setSessionId: (id: string | null) => void
  setLoading: (v: boolean) => void
  setConnected: (v: boolean) => void
  setUrl: (url: string) => void
  addEvent: (event: StreamEvent) => void
  setReport: (report: FinalReport) => void
  reset: () => void
}

export const useTestStore = create<TestStore>((set) => ({
  sessionId: null,
  loading: false,
  connected: false,
  url: '',
  events: [],
  report: null,

  setSessionId: (id) => set({ sessionId: id }),
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
  reset: () =>
    set({
      sessionId: null,
      loading: false,
      connected: false,
      events: [],
      report: null,
    }),
}))
