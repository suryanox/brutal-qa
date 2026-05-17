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
- SettingsCard for LLM config (provider, baseUrl, apiKey, model) with Zustand persist to localStorage
- Settings shown on first launch, editable via top-right button

## Phase 4 — Polish
- Session history sidebar — lists past runs with URL, timestamp, pass/fail counts
- Click history item to view past report (fetches from backend)
- Bug screenshots — TesterAgent captures screenshot on failure, served via /api/test/screenshots/:filename
- Screenshots displayed inline in the bugs tab
- Retry wrapper on browser commands (2 retries before failing)
- Error handling — loading spinner in header, empty state when no test is running
- Backend sessions now store URL, timestamp, and result summary
- ReporterAgent includes timestamp in FinalReport

## Phase 5 — Mastra Integration (Agents + Tools)
- Replaced raw Vercel AI SDK calls (generateText/generateObject) with Mastra Agents
- `src/mastra/tools.ts` — 9 browser tools created via `createTool` from `@mastra/core/tools`
  - snapshot, click, fill, type, wait, navigate, getText, getUrl, screenshot
  - Factory pattern creates tools per session, closing over BrowserService
  - Each tool has typed input/output Zod schemas
  - Emits SSE events for real-time UI streaming
- `src/mastra/agents.ts` — Agent factory functions using `Agent` from `@mastra/core/agent`
  - AnalyzerAgent — generates structured test plans as JSON
  - TesterAgent — executes test cases with browser tools (maxSteps: 15)
  - ReporterAgent — generates markdown reports as JSON
  - Dynamic model routing via `provider/model` string (reads LLM_PROVIDER + LLM_MODEL env vars)
  - Maps custom base URLs to provider-specific env vars (OPENAI_BASE_URL, ANTHROPIC_BASE_URL)
- Updated AnalyzerAgent, TesterAgent, ReporterAgent to use Mastra agents
- Removed `src/services/LLMService.ts` (replaced by Mastra's model router)
- Kept existing Hono server, SSE streaming, OrchestratorAgent pipeline, and routes intact
