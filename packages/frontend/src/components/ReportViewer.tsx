import { useMemo, useState, useEffect } from 'react'
import { marked } from 'marked'
import { useTestStore } from '@/store'
import type { FinalReport } from '@/types'

export function ReportViewer() {
  const [activeTab, setActiveTab] = useState<'report' | 'bugs'>('bugs')
  const events = useTestStore((s) => s.events)
  const report = useTestStore((s) => s.report)
  const viewSessionId = useTestStore((s) => s.viewSessionId)
  const [historyReport, setHistoryReport] = useState<FinalReport | null>(null)

  useEffect(() => {
    if (!viewSessionId) {
      setHistoryReport(null)
      return
    }
    fetch(`/api/test/sessions/${viewSessionId}/report`)
      .then((r) => r.json())
      .then((data) => {
        if (data.markdown) setHistoryReport(data)
      })
      .catch(() => {})
  }, [viewSessionId])

  const activeReport = viewSessionId ? historyReport : report

  const reportHtml = useMemo(() => {
    if (!activeReport) return ''
    return marked.parse(activeReport.markdown, { async: false }) as string
  }, [activeReport])

  const bugs = useMemo<(import('@/types').Bug | { agent: string; severity: string; description: string; screenshot?: string })[]>(() => {
    if (activeReport) return activeReport.bugs
    return events.filter((e): e is typeof e & { type: 'bug:found' } => e.type === 'bug:found')
  }, [events, activeReport])

  if (!activeReport && bugs.length === 0 && !viewSessionId) return null

  return (
    <div className="rounded-lg border border-neutral-800">
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'report'
              ? 'border-b-2 border-neutral-100 text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Report
        </button>
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'bugs'
              ? 'border-b-2 border-neutral-100 text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Bugs {bugs.length > 0 && <span className="ml-1 text-red-400">({bugs.length})</span>}
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'report' && activeReport && (
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        )}
        {activeTab === 'report' && !activeReport && (
          <p className="text-sm text-neutral-500">Generating report...</p>
        )}
        {activeTab === 'bugs' && (
          <div className="space-y-3">
            {bugs.length === 0 && (
              <p className="text-sm text-neutral-500">No bugs found</p>
            )}
            {bugs.map((bug, i) => (
              <div key={i} className="rounded border border-red-900/50 bg-red-950/20 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-red-400">
                    [{bug.severity}]
                  </span>
                  <span className="text-xs text-neutral-500">{'testCase' in bug ? bug.testCase : bug.agent}</span>
                </div>
                <p className="text-sm text-neutral-300">{bug.description}</p>
                {bug.screenshot && (
                  <img
                    src={`/api/test/screenshots/${bug.screenshot.split('/').pop()}`}
                    alt="bug screenshot"
                    className="mt-2 max-w-xs rounded border border-neutral-700"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
