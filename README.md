# Simple Agent Workshop

A from-scratch AI agent — no frameworks — that delivers a daily briefing.

Engineers ship agents every day without knowing what's underneath. This workshop fixes that by building one in plain TypeScript: prompts, tools, model, loop. You watch each piece arrive, one git tag at a time.

![Agentic loop](docs/agentic-loop-explained.png)

## Setup

Run from the `main` branch (Windows: use WSL):

```bash
./setup.sh
```

The script checks Node, installs deps, walks you through getting the three API keys (OpenAI, Giphy, Tavily), validates each, and lands you on `lesson-1`. It's idempotent — re-run any time.

## Lessons

Each lesson is a git tag. Check one out, read the diff from the previous, run it.

| Tag                       | Concept                                                      |
|---------------------------|--------------------------------------------------------------|
| `lesson-1-agentic-loop`   | LLM in a while loop — the simplest possible agent            |
| `lesson-2-tools`          | Declare tools as JSON schema; LLM picks when to call them    |
| `lesson-3-observability`  | Log everything — agents are non-deterministic                |
| `lesson-4-external-api`   | Tools call real APIs (Giphy); isolate integration code       |
| `lesson-5-system-prompt`  | The system prompt *is* the product — defines role and limits |
| `lesson-6-quote-tool`     | Add a second tool — the pattern is formulaic                 |
| `lesson-7-parallel-tools` | LLM decides when to parallelize; you don't code that logic   |
| `lesson-8-mcp`            | Discover tools at runtime via Model Context Protocol         |
| `lesson-9-streaming`      | Stream responses token-by-token                              |

```bash
git checkout lesson-1-agentic-loop
npm start
```

Try: `What time is it in Tokyo?` · `Give me a quote and a GIF` · `What's happening in tech today?`

## Repo map

- `src/index.ts` — the agentic loop
- `src/llm.ts` — conversation state + OpenAI calls
- `src/tools.ts` — tool definitions and dispatch
- `prompt.md` — the system prompt
