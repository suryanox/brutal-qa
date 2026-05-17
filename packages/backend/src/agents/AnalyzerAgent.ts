import { z } from 'zod'
import { createAnalyzerAgent } from '../mastra/agents.js'
import { createBrowserTools } from '../mastra/tools.js'
import { emit } from '../services/StreamService.js'

const TestPlanSchema = z.object({
  overview: z.string(),
  agents: z.array(z.object({
    name: z.string(),
    scope: z.string(),
    testCases: z.array(z.object({
      id: z.string(),
      description: z.string(),
      steps: z.array(z.object({
        action: z.enum(['open', 'click', 'fill', 'type', 'scroll', 'wait', 'assert', 'screenshot']),
        selector: z.string().optional(),
        value: z.string().optional(),
        url: z.string().optional(),
        expected: z.string().optional(),
      })),
    })),
  })),
})

export async function analyzeSite(
  sessionId: string,
  url: string,
): Promise<z.infer<typeof TestPlanSchema>> {
  emit(sessionId, { type: 'agent:start', agent: 'analyzer', message: `Opening ${url}` })

  const tools = createBrowserTools(sessionId, 'analyzer', (ev) => emit(sessionId, ev))
  const agent = createAnalyzerAgent()

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: 'Taking snapshot of homepage' })

  const snapshot = await tools.snapshot.execute!({})
  const snapshotContent = snapshot.content

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: 'Analyzing page structure...' })

  const result = await agent.generate([
    { role: 'user', content: `URL: ${url}\n\nPage snapshot (accessibility tree):\n${snapshotContent.slice(0, 4000)}\n\nProduce a test plan.` },
  ], { maxSteps: 1 })

  const plan = TestPlanSchema.parse(JSON.parse(result.text))

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: `Plan: ${plan.overview}` })
  emit(sessionId, {
    type: 'agent:log',
    agent: 'analyzer',
    message: `${plan.agents.length} agent(s) defined, ${plan.agents.reduce((a: number, ag: any) => a + ag.testCases.length, 0)} total test cases`,
  })
  emit(sessionId, { type: 'agent:done', agent: 'analyzer' })

  return plan
}
