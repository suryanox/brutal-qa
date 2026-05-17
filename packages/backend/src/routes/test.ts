import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { runTestSuite } from '../agents/OrchestratorAgent.js'
import { registerSession, emit } from '../services/StreamService.js'
import type { StreamEvent } from '../types/index.js'

export const testRoutes = new Hono()

interface Settings {
  provider?: string
  baseUrl?: string
  apiKey?: string
  model?: string
}

const sessions = new Map<string, { status: string; report?: unknown }>()

testRoutes.post('/', async (c) => {
  const { url, settings } = await c.req.json<{ url: string; settings?: Settings }>()
  if (!url) return c.json({ error: 'url required' }, 400)

  if (settings) {
    if (settings.apiKey) {
      const key = settings.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'
      process.env[key] = settings.apiKey
    }
    if (settings.model) process.env.LLM_MODEL = settings.model
    if (settings.provider) process.env.LLM_PROVIDER = settings.provider
    if (settings.baseUrl) process.env.LLM_BASE_URL = settings.baseUrl
  }

  const sessionId = uuid()
  sessions.set(sessionId, { status: 'running' })

  runTestSuite(sessionId, url)
    .then((report) => {
      sessions.set(sessionId, { status: 'done', report })
    })
    .catch((err) => {
      sessions.set(sessionId, { status: 'error' })
      emit(sessionId, { type: 'error', message: err.message })
    })

  return c.json({ sessionId })
})

testRoutes.get('/stream/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')

  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const send = (event: StreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
        const unsub = registerSession(sessionId, send)
        c.req.raw.signal.addEventListener('abort', unsub)
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    },
  )
})

testRoutes.get('/sessions', (c) => {
  const list = Array.from(sessions.entries()).map(([id, s]) => ({
    id,
    status: s.status,
  }))
  return c.json(list)
})

testRoutes.get('/sessions/:sessionId/report', (c) => {
  const sessionId = c.req.param('sessionId')
  const session = sessions.get(sessionId)
  if (!session) return c.json({ error: 'not found' }, 404)
  return c.json(session.report ?? { status: session.status })
})
