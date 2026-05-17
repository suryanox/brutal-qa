export interface TestCase {
  id: string
  description: string
  steps: TestStep[]
}

export interface TestStep {
  action: 'open' | 'click' | 'fill' | 'type' | 'scroll' | 'wait' | 'assert' | 'screenshot'
  selector?: string
  value?: string
  url?: string
  expected?: string
}

export interface TestPlan {
  url: string
  overview: string
  agents: AgentAssignment[]
}

export interface AgentAssignment {
  name: string
  scope: string
  testCases: TestCase[]
}

export interface AgentResult {
  agent: string
  passed: number
  failed: number
  bugs: Bug[]
  logs: LogEntry[]
}

export interface Bug {
  severity: 'critical' | 'major' | 'minor'
  description: string
  testCase: string
  screenshot?: string
}

export interface LogEntry {
  agent: string
  type: 'info' | 'action' | 'bug' | 'done'
  message: string
  data?: unknown
}

export interface FinalReport {
  url: string
  summary: string
  totalPassed: number
  totalFailed: number
  bugs: Bug[]
  agentResults: AgentResult[]
  markdown: string
  timestamp: number
}

export interface SessionInfo {
  id: string
  url: string
  status: string
  timestamp: number
  summary?: string
  totalPassed?: number
  totalFailed?: number
  bugCount?: number
}

export type StreamEvent =
  | { type: 'agent:start'; agent: string; message: string }
  | { type: 'agent:log'; agent: string; message: string }
  | { type: 'agent:action'; agent: string; action: string; selector?: string }
  | { type: 'agent:done'; agent: string }
  | { type: 'bug:found'; agent: string; severity: string; description: string; screenshot?: string }
  | { type: 'report:final'; report: FinalReport }
  | { type: 'error'; message: string }
