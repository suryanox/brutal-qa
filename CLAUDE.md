# BrutalQA — CLAUDE.md

## Commands

```sh
make              # run frontend + backend
npm run dev:fe    # frontend only (:5173)
npm run dev:be    # backend only (:3001)
npm run build     # build all packages
```

## Stack

- **Frontend**: React 19, TypeScript 6, Vite, Tailwind CSS v4, Zustand, shadcn/ui
- **Backend**: Hono, TypeScript, tsx (dev), Mastra (agents + tools), Vercel AI SDK (model routing)

## Project Structure

```
packages/
  frontend/src/
    components/   # React components (UrlInput, Console, SettingsCard, etc.)
    hooks/        # useAgentStream (SSE hook)
    store.ts      # Zustand store with persist
  backend/src/
    agents/       # OrchestratorAgent, AnalyzerAgent, TesterAgent, ReporterAgent
    mastra/       # Mastra agents.ts + tools.ts
    routes/       # test.ts (API routes)
    services/     # BrowserService, StreamService
    types/        # Shared types
```

## Key Patterns

- All backend agents use Mastra `Agent` class (from `@mastra/core/agent`)
- Browser tools created via `createTool` from `@mastra/core/tools`
- SSE streaming via StreamService (pub/sub pattern)
- OrchestratorAgent runs analyze → test (parallel) → report pipeline
- TesterAgent gets `streamSession` (for emit) and `browserSession` (for BrowserService)
- Analyzer injects target URL into all `open` steps after LLM generates plan
- Error handling: `withRetry` wrapper on browser commands (2 retries)
- Structured output: JSON from agent text, validated with Zod `.parse()`

## Conventions

- ESM throughout (`.js` extensions in imports)
- No semicolons
- Tailwind for styling (no CSS modules)
- Zustand store for state, no prop drilling
- Settings persisted to localStorage via zustand/persist
