import type { AgentResult, FinalReport, TestCase } from '../types/index.js'
import { analyzeSite } from './AnalyzerAgent.js'
import { executeTestCases } from './TesterAgent.js'
import { generateReport } from './ReporterAgent.js'
import { emit } from '../services/StreamService.js'

export async function runTestSuite(
  sessionId: string,
  url: string,
): Promise<FinalReport> {
  emit(sessionId, { type: 'agent:start', agent: 'orchestrator', message: `Starting test suite for ${url}` })

  const { agents } = await analyzeSite(sessionId, url)

  emit(sessionId, {
    type: 'agent:log',
    agent: 'orchestrator',
    message: `Test plan ready: ${agents.length} agent(s) to dispatch`,
  })

  const results: AgentResult[] = await Promise.all(
    agents.map(async (assignment) => {
      const browserSession = `${sessionId}-${assignment.name}`
      const { passed, failed, bugs } = await executeTestCases(
        sessionId,
        browserSession,
        assignment.name,
        assignment.scope,
        assignment.testCases as TestCase[],
      )
      return { agent: assignment.name, passed, failed, bugs, logs: [] }
    }),
  )

  const report = await generateReport(sessionId, url, results)

  emit(sessionId, {
    type: 'agent:log',
    agent: 'orchestrator',
    message: `Done. ${report.totalPassed} passed, ${report.totalFailed} failed, ${report.bugs.length} bugs`,
  })

  return report
}
