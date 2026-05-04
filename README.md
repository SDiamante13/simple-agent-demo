# Simple Agent Workshop

A from-scratch AI agent — no frameworks — that delivers a daily briefing.

Engineers ship agents every day without knowing what's underneath. This workshop fixes that by building one in plain TypeScript: prompts, tools, model, loop. You watch each piece arrive, one git tag at a time.

![Agentic loop](docs/agentic-loop-explained.png)

## Setup

Run from the `main` branch (Windows: use WSL):

```bash
./setup.sh
```

The script checks Node, installs deps, sets up your LLM (paid OpenAI or free local Ollama), walks you through any other API keys you need, and lands you on `lesson-1`. It's idempotent — re-run any time.

## Lessons

Each lesson is a git tag. Check one out, read the diff from the previous, run it.

| Tag                              | Concept                                                       |
|----------------------------------|---------------------------------------------------------------|
| `lesson-1-agentic-loop`          | LLM in a while loop — the simplest possible agent             |
| `lesson-2-conversation-history`  | Multi-turn memory — append messages, ship the whole history   |
| `lesson-3-date-tool`             | First tool: declare schema, dispatch on the model's call      |
| `lesson-4-observability`         | Log everything — agents are non-deterministic                 |
| `lesson-5-external-api`          | Tools call real APIs (Giphy); isolate integration code        |
| `lesson-6-system-prompt`         | The system prompt *is* the product — defines role and limits  |
| `lesson-7-quote-tool`            | Add a second tool — the pattern is formulaic                  |
| `lesson-8-parallel-tools`        | LLM decides when to parallelize; you don't code that logic    |
| `lesson-9-mcp`                   | Discover tools at runtime via Model Context Protocol          |

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
