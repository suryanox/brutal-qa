import { z } from 'zod'
import { createReporterAgent } from '../mastra/agents.js'
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

  const agent = createReporterAgent()

  const result = await agent.generate([
    {
      role: 'user',
      content: `Write a test report for ${url}.\n\nResults:\n${data}`,
    },
  ], { maxSteps: 1 })

  const report = ReportSchema.parse(JSON.parse(result.text))

  const final: FinalReport = {
    url,
    summary: report.summary || `${totalPassed} passed, ${totalFailed} failed, ${bugs.length} bugs found`,
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
