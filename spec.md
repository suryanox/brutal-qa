# BrutalQA — Specification

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript (Vite) |
| Backend | Node.js + TypeScript (Express or Hono) |
| Browser Automation | agent-browser (Vercel Labs) |
| AI/LLM | OpenAI / Anthropic SDK |
| Real-time | Server-Sent Events (SSE) or WebSockets |
| Monorepo | npm workspaces / turborepo |

## Project Structure

```
BrutalQA/
├── packages/
│   ├── frontend/          # React UI
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UrlInput.tsx
│   │   │   │   ├── Console.tsx
│   │   │   │   ├── AgentLog.tsx
│   │   │   │   ├── ReportViewer.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAgentStream.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── backend/           # Node.js API + Agent Orchestrator
│       ├── src/
│       │   ├── agents/
│       │   │   ├── OrchestratorAgent.ts
│       │   │   ├── AnalyzerAgent.ts
│       │   │   ├── TesterAgent.ts
│       │   │   └── ReporterAgent.ts
│       │   ├── services/
│       │   │   ├── BrowserService.ts    # agent-browser wrapper
│       │   │   ├── LLMService.ts        # AI model calls
│       │   │   └── StreamService.ts     # SSE to frontend
│       │   ├── routes/
│       │   │   ├── test.ts             # POST /api/test
│       │   │   └── stream.ts           # GET /api/stream/:sessionId
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json            # root workspace
├── plan.md
└── spec.md
```

## Architecture Overview

```
User enters URL in React UI
        │
        ▼
Backend receives POST /api/test { url }
        │
        ▼
OrchestratorAgent starts session
        │
        ├──► AnalyzerAgent
        │       - Browses site via agent-browser
        │       - Maps pages, features, functionality
        │       - Determines N test agents needed
        │       - Outputs: test plan (JSON)
        │
        ├──► TesterAgent(s) x N
        │       - Each gets a slice of the test plan
        │       - Executes test cases via agent-browser
        │       - Reports pass/fail + bugs found
        │       - Continues until its scope is done
        │
        └──► ReporterAgent
                - Collects all agent results
                - Generates summary report
                - Outputs: final report (markdown/JSON)
        │
        ▼
Streams real-time logs to React console via SSE
Final report pushed at end
```

## Agent System

### OrchestratorAgent
- **Role**: Entry point — manages session lifecycle, spawns child agents
- **Input**: Target URL
- **Output**: Final consolidated report
- **Behavior**: Streams progress logs throughout

### AnalyzerAgent
- **Role**: Reconnaissance — understands the website
- **Tool**: agent-browser (open, snapshot, get, click, scroll)
- **Tasks**:
  1. Open the URL
  2. Snapshot the page (accessibility tree)
  3. Identify nav structure, forms, links, interactive elements
  4. Click through key pages, build a site map
  5. Determine number of TesterAgents needed (based on feature surface)
  6. Output a structured test plan: `{ agents: [{ name, scope, testCases: [...] }] }`

### TesterAgent(s)
- **Role**: Execute test cases against assigned feature area
- **Tool**: agent-browser (fill, click, type, screenshot, wait, snapshot, eval)
- **Tasks**:
  1. Receive test plan slice
  2. For each test case, execute steps via agent-browser
  3. Assert expected behavior (check element text, visibility, URL change, etc.)
  4. On failure: log bug with screenshot + description
  5. Continue until all test cases in scope are done
  6. Report results back

### ReporterAgent
- **Role**: Synthesize findings into a human-readable report
- **Tasks**:
  1. Collect all agent results
  2. Aggregate bugs by severity/area
  3. Generate markdown report with:
     - Summary (pass/fail counts)
     - Bug list (screenshots, steps to reproduce)
     - Feature coverage map
  4. Output final report

## Data Flow

```
Session created with unique sessionId
  │
  ▼
SSE connection established: GET /api/stream/:sessionId
  │
  ▼
POST /api/test { url }  →  Orchestrator begins
  │
  ▼
Each agent emits structured log events:
  { type: "agent:start", agent: "analyzer", message: "..." }
  { type: "agent:log",   agent: "analyzer", message: "..." }
  { type: "agent:action", agent: "analyzer", action: "click", selector: "@e3" }
  { type: "agent:done",  agent: "analyzer", result: {...} }
  { type: "bug:found",   agent: "tester-1", severity: "major", description: "...", screenshot: "..." }
  { type: "report:final", report: "# Summary\n..." }
  │
  ▼
React Console component renders log stream in real-time
ReportViewer displays final report when received
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/test` | Start a new test session. Body: `{ url: string }`. Returns: `{ sessionId: string }` |
| GET | `/api/stream/:sessionId` | SSE stream of agent logs + final report |
| GET | `/api/sessions` | List past sessions |
| GET | `/api/sessions/:sessionId/report` | Retrieve final report for a completed session |

## Frontend UI

```
┌──────────────────────────────────────────────────┐
│  BrutalQA                                         │
├──────────────────────────────────────────────────┤
│  [URL input box                        ] [Go!]   │
├──────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌────────────────────────────┐ │
│ │  Dashboard   │  │  Console / Logs            │ │
│ │              │  │                            │ │
│ │  Agent:      │  │  [12:00:01] Analyzer:      │ │
│ │  ● Analyzer  │  │  Opening page...           │ │
│ │  ○ Tester-1  │  │  [12:00:02] Analyzer:      │ │
│ │  ○ Tester-2  │  │  Snapshotting...           │ │
│ │  ○ Reporter  │  │  [12:00:03] Tester-1:      │ │
│ │              │  │  Testing login form...     │ │
│ │  Status:     │  │  [12:00:04] BUG FOUND!     │ │
│ │  Running     │  │  Button #submit not found  │ │
│ └──────────────┘  └────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  Report                                           │
│  ┌────────────────────────────────────────────┐  │
│  │  # Test Report                             │  │
│  │  12 passed, 3 failed                       │  │
│  │  ## Bugs                                   │  │
│  │  ...                                       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Scaffold
- Set up npm workspaces monorepo
- Bootstrap Vite React app + Express/Hono backend
- Basic URL input → POST → session creation flow
- SSE streaming from backend → Console component

### Phase 2: Agent Core
- Implement LLMService (OpenAI/Anthropic)
- Implement BrowserService (agent-browser CLI wrapper with exec/spawn)
- Build AnalyzerAgent → produces test plan JSON
- Build single TesterAgent → executes test cases

### Phase 3: Multi-Agent + Reports
- Orchestrator spawns N TesterAgents in parallel
- ReporterAgent generates final markdown report
- ReportViewer component in frontend

### Phase 4: Polish
- Session history
- Bug screenshots display
- Error handling + retry logic
- Loading states, edge cases
