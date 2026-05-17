import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { BrowserService } from '../services/BrowserService.js'
import type { StreamEvent } from '../types/index.js'

async function withRetry<T>(fn: () => T, retries = 2): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await Promise.resolve(fn())
    } catch (err) {
      lastErr = err
      if (i === retries) throw err
    }
  }
  throw lastErr
}

export function createBrowserTools(sessionId: string, agentName: string, emit?: (event: StreamEvent) => void) {
  const browser = new BrowserService(sessionId)

  const e = (type: StreamEvent['type'], message: string, extra?: Record<string, string>) => {
    if (!emit) return
    if (type === 'agent:action') {
      emit({ type, agent: agentName, action: extra?.action ?? '', selector: extra?.selector })
    } else {
      emit({ type, agent: agentName, message } as StreamEvent)
    }
  }

  return {
    snapshot: createTool({
      id: 'snapshot',
      description: 'Get the current page accessibility snapshot. Call after any navigation to see what is on the page.',
      inputSchema: z.object({}),
      outputSchema: z.object({ content: z.string() }),
      execute: async () => {
        e('agent:log', 'Taking page snapshot')
        const content = await withRetry(() => browser.snapshot())
        return { content }
      },
    }),
    click: createTool({
      id: 'click',
      description: 'Click an element by its accessibility ref or CSS selector',
      inputSchema: z.object({ selector: z.string().describe('e.g. @e3 or #submit') }),
      outputSchema: z.object({ result: z.string() }),
      execute: async ({ selector }) => {
        e('agent:action', '', { action: 'click', selector })
        await withRetry(() => browser.click(selector))
        return { result: `clicked ${selector}` }
      },
    }),
    fill: createTool({
      id: 'fill',
      description: 'Fill an input field with text',
      inputSchema: z.object({ selector: z.string(), value: z.string() }),
      outputSchema: z.object({ result: z.string() }),
      execute: async ({ selector, value }) => {
        e('agent:action', '', { action: 'fill', selector })
        await withRetry(() => browser.fill(selector, value))
        return { result: `filled ${selector} with "${value}"` }
      },
    }),
    type: createTool({
      id: 'type',
      description: 'Type text into an element',
      inputSchema: z.object({ selector: z.string(), value: z.string() }),
      outputSchema: z.object({ result: z.string() }),
      execute: async ({ selector, value }) => {
        e('agent:action', '', { action: 'type', selector })
        await withRetry(() => browser.type(selector, value))
        return { result: `typed "${value}" into ${selector}` }
      },
    }),
    wait: createTool({
      id: 'wait',
      description: 'Wait for an element to appear on the page',
      inputSchema: z.object({ selector: z.string() }),
      outputSchema: z.object({ result: z.string() }),
      execute: async ({ selector }) => {
        await withRetry(() => browser.wait(selector))
        return { result: `waited for ${selector}` }
      },
    }),
    navigate: createTool({
      id: 'navigate',
      description: 'Navigate the browser to a URL',
      inputSchema: z.object({ url: z.string() }),
      outputSchema: z.object({ result: z.string() }),
      execute: async ({ url }) => {
        e('agent:action', '', { action: 'navigate', selector: url })
        await withRetry(() => browser.open(url))
        return { result: `navigated to ${url}` }
      },
    }),
    getText: createTool({
      id: 'getText',
      description: 'Get the visible text content of an element',
      inputSchema: z.object({ selector: z.string() }),
      outputSchema: z.object({ content: z.string() }),
      execute: async ({ selector }) => {
        const content = await withRetry(() => browser.getText(selector))
        return { content }
      },
    }),
    getUrl: createTool({
      id: 'getUrl',
      description: 'Get the current page URL',
      inputSchema: z.object({}),
      outputSchema: z.object({ url: z.string() }),
      execute: async () => {
        const url = await withRetry(() => browser.url)
        return { url }
      },
    }),
    screenshot: createTool({
      id: 'screenshot',
      description: 'Take a screenshot of the current page and save it',
      inputSchema: z.object({}),
      outputSchema: z.object({ path: z.string() }),
      execute: async () => {
        const path = `data/screenshots/${sessionId}-${agentName}-${Date.now()}.png`
        await withRetry(() => browser.screenshot(path))
        return { path }
      },
    }),
  }
}
