# BrutalQA Development Log

## Phase 1 — Scaffold
- Initialized npm workspaces monorepo (root + packages/frontend + packages/backend)
- Frontend: Vite + React 19 + TypeScript 6 + Tailwind CSS v4
- Backend: Hono + TypeScript + tsx watch mode
- Added shadcn/ui components (button, card, badge, input, scroll-area)
- Created Makefile with `make` to run both frontend and backend
- Added .gitignore and .env.example

## Phase 2 — Agent Core
- Replaced raw OpenAI SDK with Vercel AI SDK v6 (multi-provider: OpenAI + Anthropic)
- LLMService with `llmChat` (text) and `llmObject` (structured with Zod schemas)
- BrowserService — wraps agent-browser CLI (open, click, fill, snapshot, etc.)
- StreamService — pub/sub for SSE events to frontend
- AnalyzerAgent — opens URL, snapshots page, LLM generates test plan with Zod schema
- TesterAgent — executes test cases via LLM with 8 native browser tools (click, fill, snapshot, navigate, etc.)
- ReporterAgent — aggregates results, LLM generates markdown report
- OrchestratorAgent — runs analyze → test → report pipeline
- API routes: POST /api/test, GET /api/test/stream/:sessionId (SSE), GET /api/sessions, GET /api/sessions/:id/report

## Phase 3 — Multi-Agent + UI
- Backend: TesterAgents run in parallel via Promise.all, each with isolated session
- Frontend: UrlInput component with URL textbox and Go button
- Frontend: useAgentStream hook — connects to SSE endpoint, collects real-time events
- Frontend: Console component — color-coded scrolling log viewer (blue/green/yellow/red/purple)
- Frontend: AgentDashboard — status cards with dot indicators (idle/running/done) and bug counts
- Frontend: ReportViewer — tabs for rendered markdown report and bug list
- Frontend: App.tsx — full layout with responsive 4-column grid
- Vite proxy configured for /api -> backend on :3001
- Replaced React useState prop-drilling with Zustand store (useTestStore)
- Refactored all components to read/write from centralized store
