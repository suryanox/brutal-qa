export type StreamEvent =
  | { type: 'agent:start'; agent: string; message: string }
  | { type: 'agent:log'; agent: string; message: string }
  | { type: 'agent:action'; agent: string; action: string; selector?: string }
  | { type: 'agent:done'; agent: string }
  | { type: 'bug:found'; agent: string; severity: string; description: string; screenshot?: string }
  | { type: 'report:final'; report: FinalReport }
  | { type: 'error'; message: string }

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

export interface Bug {
  severity: string
  description: string
  testCase: string
  screenshot?: string
}

export interface AgentResult {
  agent: string
  passed: number
  failed: number
  bugs: Bug[]
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

export type AgentStatus = 'idle' | 'running' | 'done'
