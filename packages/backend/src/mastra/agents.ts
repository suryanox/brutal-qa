import { Agent } from '@mastra/core/agent'
import { analyzerPrompt } from './prompts/analyzer.js'
import { testerPrompt } from './prompts/tester.js'
import { reporterPrompt } from './prompts/reporter.js'

function getModel(): string {
  const provider = process.env.LLM_PROVIDER ?? 'openai'
  const model = process.env.LLM_MODEL ?? 'gpt-4o'
  const baseUrl = process.env.LLM_BASE_URL

  if (baseUrl) {
    if (provider === 'openai') process.env.OPENAI_BASE_URL = baseUrl
    else if (provider === 'anthropic') process.env.ANTHROPIC_BASE_URL = baseUrl
  }

  return `${provider}/${model}`
}

export function createAnalyzerAgent() {
  return new Agent({
    id: 'analyzer',
    name: 'Analyzer',
    instructions: analyzerPrompt,
    model: getModel(),
  })
}

export function createTesterAgent(tools: Record<string, unknown>) {
  return new Agent({
    id: 'tester',
    name: 'Tester',
    instructions: testerPrompt,
    model: getModel(),
    tools,
  })
}

export function createReporterAgent() {
  return new Agent({
    id: 'reporter',
    name: 'Reporter',
    instructions: reporterPrompt,
    model: getModel(),
  })
}
