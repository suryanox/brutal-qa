import { createTesterAgent } from '../mastra/agents.js'
import { createBrowserTools } from '../mastra/tools.js'
import { emit } from '../services/StreamService.js'
import type { Bug, TestCase } from '../types/index.js'

export async function executeTestCases(
  streamSession: string,
  browserSession: string,
  agentName: string,
  scope: string,
  testCases: TestCase[],
): Promise<{ passed: number; failed: number; bugs: Bug[] }> {
  const bugs: Bug[] = []
  let passed = 0
  let failed = 0

  emit(streamSession, { type: 'agent:start', agent: agentName, message: `Starting: ${scope}` })

  const tools = createBrowserTools(browserSession, agentName, (ev) => emit(streamSession, ev))
  const agent = createTesterAgent(tools)

  for (const tc of testCases) {
    emit(streamSession, { type: 'agent:log', agent: agentName, message: `Running ${tc.id}: ${tc.description}` })

    try {
      const stepsDesc = tc.steps.map((s, i) =>
        `${i + 1}. ${s.action}${s.selector ? ` ${s.selector}` : ''}${s.value ? ` "${s.value}"` : ''}${s.expected ? ` → expect: ${s.expected}` : ''}`,
      ).join('\n')

      const result = await agent.generate([
        {
          role: 'user',
          content: `You are agent "${agentName}" testing: ${scope}\n\nExecute test case ${tc.id}: ${tc.description}\n\nSteps:\n${stepsDesc}\n\nUse your tools to execute each step. Report a bug if any step fails.`,
        },
      ], { maxSteps: 15 })

      const text = result.text.toLowerCase()
      const hasBug = text.includes('bug') || text.includes('fail')

      if (hasBug) {
        failed++
        const screenshot = await tools.screenshot.execute!({}).catch(() => ({ path: '' }))
        bugs.push({ severity: 'major', description: result.text.slice(0, 300), testCase: tc.id, screenshot: screenshot.path })
        emit(streamSession, { type: 'bug:found', agent: agentName, severity: 'major', description: result.text.slice(0, 300), screenshot: screenshot.path })
      } else {
        passed++
        emit(streamSession, { type: 'agent:log', agent: agentName, message: `${tc.id} PASSED` })
      }
    } catch (err) {
      failed++
      const description = err instanceof Error ? err.message : String(err)
      const screenshot = await tools.screenshot.execute!({}).catch(() => ({ path: '' }))
      bugs.push({ severity: 'major', description, testCase: tc.id, screenshot: screenshot.path })
      emit(streamSession, { type: 'bug:found', agent: agentName, severity: 'major', description, screenshot: screenshot.path })
    }
  }

  emit(streamSession, { type: 'agent:done', agent: agentName })
  return { passed, failed, bugs }
}
