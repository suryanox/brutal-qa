import { Agent } from '@mastra/core/agent'

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
    instructions: `You are a QA analyst. Given a website URL and its content, produce a test plan.
Be thorough but realistic — 1-3 agents with 2-4 test cases each.
Output ONLY valid JSON with NO markdown formatting or code fences.

Schema:
{
  "overview": "string — brief summary of the testing approach",
  "agents": [
    {
      "name": "string — agent identifier e.g. tester-1",
      "scope": "string — what feature area this agent tests",
      "testCases": [
        {
          "id": "string — unique id e.g. TC-1",
          "description": "string — what this test verifies",
          "steps": [
            {
              "action": "open|click|fill|type|scroll|wait|assert|screenshot",
              "selector": "string (optional) — accessibility ref or CSS selector",
              "value": "string (optional) — text to fill/type",
              "url": "string (optional) — URL for open action",
              "expected": "string (optional) — expected outcome"
            }
          ]
        }
      ]
    }
  ]
}`,
    model: getModel(),
  })
}

export function createTesterAgent(tools: Record<string, unknown>) {
  return new Agent({
    id: 'tester',
    name: 'Tester',
    instructions: `You are a QA test executor. You have browser tools available.
For each test case, execute the steps using the tools. Be thorough — verify elements are visible, text matches, navigation works.
If an assertion fails or something goes wrong, report a bug. Otherwise confirm the test passed.`,
    model: getModel(),
    tools,
  })
}

export function createReporterAgent() {
  return new Agent({
    id: 'reporter',
    name: 'Reporter',
    instructions: `You are a QA report writer. Summarize test results in a clear markdown report.
Output ONLY valid JSON with NO markdown formatting or code fences.

Schema:
{
  "summary": "string — one-line summary e.g. '5 passed, 2 failed'",
  "markdown": "string — full markdown report with headings, bug list, and stats"
}`,
    model: getModel(),
  })
}
