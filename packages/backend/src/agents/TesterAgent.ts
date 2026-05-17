import { zodSchema } from '@ai-sdk/provider-utils'
import { z } from 'zod'
import { llmChat } from '../services/LLMService.js'
import { BrowserService } from '../services/BrowserService.js'
import { emit } from '../services/StreamService.js'
import type { Bug, TestCase } from '../types/index.js'

const SYSTEM = `You are a QA test executor. You have browser tools available.
For each test case, execute the steps using the tools. If something goes wrong or an assertion fails, report it as a bug.
Be thorough — verify elements are visible, text matches, navigation works.`

export async function executeTestCases(
  sessionId: string,
  agentName: string,
  scope: string,
  testCases: TestCase[],
): Promise<{ passed: number; failed: number; bugs: Bug[] }> {
  const browser = new BrowserService(sessionId)
  const bugs: Bug[] = []
  let passed = 0
  let failed = 0

  emit(sessionId, { type: 'agent:start', agent: agentName, message: `Starting: ${scope}` })

  const browserTools = {
    snapshot: {
      description: 'Get the current page accessibility snapshot (use to check page state, find elements)',
      parameters: zodSchema(z.object({})),
      execute: async () => browser.snapshot(),
    },
    click: {
      description: 'Click an element by its accessibility ref or CSS selector',
      parameters: zodSchema(z.object({ selector: z.string().describe('e.g. @e3 or #submit') })),
      execute: async ({ selector }: { selector: string }) => {
        emit(sessionId, { type: 'agent:action', agent: agentName, action: 'click', selector })
        browser.click(selector)
        return `clicked ${selector}`
      },
    },
    fill: {
      description: 'Fill an input field with text',
      parameters: zodSchema(z.object({ selector: z.string(), value: z.string() })),
      execute: async ({ selector, value }: { selector: string; value: string }) => {
        emit(sessionId, { type: 'agent:action', agent: agentName, action: 'fill', selector })
        browser.fill(selector, value)
        return `filled ${selector} with "${value}"`
      },
    },
    type: {
      description: 'Type text into an element',
      parameters: zodSchema(z.object({ selector: z.string(), value: z.string() })),
      execute: async ({ selector, value }: { selector: string; value: string }) => {
        emit(sessionId, { type: 'agent:action', agent: agentName, action: 'type', selector })
        browser.type(selector, value)
        return `typed "${value}" into ${selector}`
      },
    },
    wait: {
      description: 'Wait for an element to appear',
      parameters: zodSchema(z.object({ selector: z.string() })),
      execute: async ({ selector }: { selector: string }) => {
        browser.wait(selector)
        return `waited for ${selector}`
      },
    },
    navigate: {
      description: 'Navigate to a URL',
      parameters: zodSchema(z.object({ url: z.string() })),
      execute: async ({ url }: { url: string }) => {
        emit(sessionId, { type: 'agent:action', agent: agentName, action: 'open', selector: url })
        browser.open(url)
        return `navigated to ${url}`
      },
    },
    getText: {
      description: 'Get text content of an element',
      parameters: zodSchema(z.object({ selector: z.string() })),
      execute: async ({ selector }: { selector: string }) => browser.getText(selector),
    },
    getUrl: {
      description: 'Get current page URL',
      parameters: zodSchema(z.object({})),
      execute: async () => browser.url,
    },
  }

  for (const tc of testCases) {
    emit(sessionId, { type: 'agent:log', agent: agentName, message: `Running ${tc.id}: ${tc.description}` })

    try {
      const stepsDesc = tc.steps.map((s, i) =>
        `${i + 1}. ${s.action}${s.selector ? ` ${s.selector}` : ''}${s.value ? ` "${s.value}"` : ''}${s.expected ? ` \u2192 expect: ${s.expected}` : ''}`,
      ).join('\n')

      const result = await llmChat(SYSTEM + `\n\nYou are agent "${agentName}" testing: ${scope}`, [
        {
          role: 'user',
          content: `Execute test case ${tc.id}: ${tc.description}\n\nSteps:\n${stepsDesc}\n\nUse your tools to execute each step. Report a bug if any step fails.`,
        },
      ], { tools: browserTools as unknown as Record<string, unknown> })

      const hasBug = result.toLowerCase().includes('bug') || result.toLowerCase().includes('fail')
      if (hasBug) {
        failed++
        bugs.push({ severity: 'major', description: result.slice(0, 300), testCase: tc.id })
        emit(sessionId, { type: 'bug:found', agent: agentName, severity: 'major', description: result.slice(0, 300) })
      } else {
        passed++
        emit(sessionId, { type: 'agent:log', agent: agentName, message: `${tc.id} PASSED` })
      }
    } catch (err) {
      failed++
      const description = err instanceof Error ? err.message : String(err)
      bugs.push({ severity: 'major', description, testCase: tc.id })
      emit(sessionId, { type: 'bug:found', agent: agentName, severity: 'major', description })
    }
  }

  emit(sessionId, { type: 'agent:done', agent: agentName })
  return { passed, failed, bugs }
}
