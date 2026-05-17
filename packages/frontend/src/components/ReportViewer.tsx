import { useMemo, useState } from 'react'
import { marked } from 'marked'
import { useTestStore } from '@/store'

export function ReportViewer() {
  const [activeTab, setActiveTab] = useState<'report' | 'bugs'>('report')
  const events = useTestStore((s) => s.events)
  const report = useTestStore((s) => s.report)

  const reportHtml = useMemo(() => {
    if (!report) return ''
    return marked.parse(report.markdown, { async: false }) as string
  }, [report])

  const bugs = useMemo(
    () => events.filter((e): e is typeof e & { type: 'bug:found' } => e.type === 'bug:found'),
    [events],
  )

  if (!report && bugs.length === 0) return null

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
        {activeTab === 'report' && report && (
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        )}
        {activeTab === 'report' && !report && (
          <p className="text-sm text-neutral-500">Generating report...</p>
        )}
        {activeTab === 'bugs' && (
          <div className="space-y-2">
            {bugs.length === 0 && (
              <p className="text-sm text-neutral-500">No bugs found</p>
            )}
            {bugs.map((bug, i) => (
              <div key={i} className="rounded border border-red-900/50 bg-red-950/20 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-red-400">
                    [{bug.severity}]
                  </span>
                  <span className="text-xs text-neutral-500">{bug.agent}</span>
                </div>
                <p className="text-sm text-neutral-300">{bug.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
