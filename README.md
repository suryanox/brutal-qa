# BrutalQA

Battle-test websites with a team of AI agents.

```sh
npm install
make            # starts both (frontend :5173 + backend :3001)

# or individually:
npm run dev:frontend   # frontend only
npm run dev:backend    # backend only
```

Set your API key in the UI settings (top-right) or via env:

| Var | Default |
|---|---|
| `OPENAI_API_KEY` | — |
| `ANTHROPIC_API_KEY` | — |
| `LLM_PROVIDER` | `openai` |
| `LLM_MODEL` | `gpt-4o` |

Enter a URL and watch the agents analyze, test, and report bugs in real time.
