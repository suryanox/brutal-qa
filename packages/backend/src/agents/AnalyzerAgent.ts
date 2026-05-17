import { z } from 'zod'
import { llmObject } from '../services/LLMService.js'
import { BrowserService } from '../services/BrowserService.js'
import { emit } from '../services/StreamService.js'

const TestStepSchema = z.object({
  action: z.enum(['open', 'click', 'fill', 'type', 'scroll', 'wait', 'assert', 'screenshot']),
  selector: z.string().optional(),
  value: z.string().optional(),
  url: z.string().optional(),
  expected: z.string().optional(),
})

const TestCaseSchema = z.object({
  id: z.string(),
  description: z.string(),
  steps: z.array(TestStepSchema),
})

const AgentAssignmentSchema = z.object({
  name: z.string(),
  scope: z.string(),
  testCases: z.array(TestCaseSchema),
})

const TestPlanSchema = z.object({
  overview: z.string(),
  agents: z.array(AgentAssignmentSchema),
})

const SYSTEM = `You are a QA analyst. Given a website URL and its content, produce a test plan.
Be thorough but realistic — 1-3 agents with 2-4 test cases each.`

export async function analyzeSite(
  sessionId: string,
  url: string,
): Promise<{ overview: string; agents: Array<{ name: string; scope: string; testCases: Array<{ id: string; description: string; steps: Array<{ action: string; selector?: string; value?: string; url?: string; expected?: string }> }> }> }> {
  const browser = new BrowserService(sessionId)

  emit(sessionId, { type: 'agent:start', agent: 'analyzer', message: `Opening ${url}` })

  browser.open(url)

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: 'Taking snapshot of homepage' })

  const snapshot = browser.snapshot()
  const title = browser.title

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: 'Analyzing page structure...' })

  const plan = await llmObject(SYSTEM, [
    {
      role: 'user',
      content: `URL: ${url}\nTitle: ${title}\n\nPage snapshot (accessibility tree):\n${snapshot.slice(0, 4000)}\n\nProduce a test plan.`,
    },
  ], TestPlanSchema)

  emit(sessionId, { type: 'agent:log', agent: 'analyzer', message: `Plan: ${plan.overview}` })
  emit(sessionId, {
    type: 'agent:log',
    agent: 'analyzer',
    message: `${plan.agents.length} agent(s) defined, ${plan.agents.reduce((a, ag) => a + ag.testCases.length, 0)} total test cases`,
  })
  emit(sessionId, { type: 'agent:done', agent: 'analyzer' })

  return plan
}
