import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { testRoutes } from './routes/test.js'
import { checkBrowserBinary } from './services/BrowserService.js'

try {
  checkBrowserBinary()
  console.log('agent-browser found')
} catch (err) {
  console.error(String(err))
  process.exit(1)
}

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => c.json({ status: 'ok' }))

app.route('/api/test', testRoutes)

const port = 3001
console.log(`backend running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
