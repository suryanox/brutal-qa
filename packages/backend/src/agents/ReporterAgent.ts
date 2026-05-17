import { z } from 'zod'
import { llmObject } from '../services/LLMService.js'
import { emit } from '../services/StreamService.js'
import type { AgentResult, FinalReport } from '../types/index.js'

const ReportSchema = z.object({
  summary: z.string(),
  markdown: z.string(),
})

export async function generateReport(
  sessionId: string,
  url: string,
  results: AgentResult[],
): Promise<FinalReport> {
  emit(sessionId, { type: 'agent:start', agent: 'reporter', message: 'Generating final report...' })

  const totalPassed = results.reduce((s, r) => s + r.passed, 0)
  const totalFailed = results.reduce((s, r) => s + r.failed, 0)
  const bugs = results.flatMap((r) => r.bugs)

  const data = results
    .map((r) => `${r.agent}: ${r.passed} passed, ${r.failed} failed, ${r.bugs.length} bugs\n${r.bugs.map((b) => `  - [${b.severity}] ${b.description}`).join('\n')}`)
    .join('\n\n')

  const report = await llmObject(
    'You are a QA report writer. Summarize test results in a clear markdown report.',
    [
      {
        role: 'user',
        content: `Write a test report for ${url}.\n\nResults:\n${data}`,
      },
    ],
    ReportSchema,
  )

  const final: FinalReport = {
    url,
    summary: `${totalPassed} passed, ${totalFailed} failed, ${bugs.length} bugs found`,
    totalPassed,
    totalFailed,
    bugs,
    agentResults: results,
    markdown: report.markdown,
    timestamp: Date.now(),
  }

  emit(sessionId, { type: 'agent:done', agent: 'reporter' })
  emit(sessionId, { type: 'report:final', report: final })

  return final
}
