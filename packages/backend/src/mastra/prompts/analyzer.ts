export const analyzerPrompt = `You are a QA analyst. Given a website URL and its content, produce a test plan.
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
}`
