import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { readFileSync } from 'node:fs'
import { runTestSuite } from '../agents/OrchestratorAgent.js'
import { registerSession, emit } from '../services/StreamService.js'
import type { StreamEvent, SessionInfo, FinalReport } from '../types/index.js'

export const testRoutes = new Hono()

interface Settings {
  provider?: string
  baseUrl?: string
  apiKey?: string
  model?: string
}

const sessions = new Map<string, SessionInfo>()
const reports = new Map<string, FinalReport>()

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
  const info: SessionInfo = { id: sessionId, url, status: 'running', timestamp: Date.now() }
  sessions.set(sessionId, info)

  runTestSuite(sessionId, url)
    .then((report) => {
      reports.set(sessionId, report)
      info.status = 'done'
      info.summary = report.summary
      info.totalPassed = report.totalPassed
      info.totalFailed = report.totalFailed
      info.bugCount = report.bugs.length
    })
    .catch((err) => {
      info.status = 'error'
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
  const list = Array.from(sessions.values()).sort((a, b) => b.timestamp - a.timestamp)
  return c.json(list)
})

testRoutes.get('/sessions/:sessionId/report', (c) => {
  const sessionId = c.req.param('sessionId')
  const report = reports.get(sessionId)
  if (!report) {
    const info = sessions.get(sessionId)
    return c.json({ status: info?.status ?? 'not found' })
  }
  return c.json(report)
})

testRoutes.get('/screenshots/:filename', (c) => {
  const filename = c.req.param('filename')
  const filePath = `data/screenshots/${filename}`
  try {
    const buf = readFileSync(filePath)
    const ext = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return new Response(buf, { headers: { 'Content-Type': ext } })
  } catch {
    return c.json({ error: 'not found' }, 404)
  }
})
