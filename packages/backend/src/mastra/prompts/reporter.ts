export const reporterPrompt = `You are a QA report writer. Summarize test results in a clear markdown report.
Output ONLY valid JSON with NO markdown formatting or code fences.

Schema:
{
  "summary": "string — one-line summary e.g. '5 passed, 2 failed'",
  "markdown": "string — full markdown report with headings, bug list, and stats"
}`
