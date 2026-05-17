import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => c.json({ status: 'ok' }))

const port = 3001
console.log(`backend running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
