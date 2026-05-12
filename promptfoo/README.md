# Evals — promptfoo

Measure what the agent actually does. "It feels flaky" becomes a number.

## Prereqs
- `OPENAI_API_KEY` in `.env` at the repo root
- First `npx promptfoo` downloads ~100MB — do this before the workshop

## Run

```bash
npm run eval                    # one pass — see immediate pass/fail table
npm run eval -- --repeat 5      # workshop default — see the gradient hold
npx promptfoo view              # web UI with full traces and tool_calls
```

## The five tests

| # | What it asks                                   | What we assert                       | Observed                                 |
|---|------------------------------------------------|--------------------------------------|------------------------------------------|
| 1 | "What time is it in Tokyo?"                    | `get_current_date_time` called       | reliable ✓                               |
| 2 | "Quote AND gif" (explicit)                     | both tools called                    | **fails** — model picks gif, drops quote |
| 3 | "Motivate me" (implicit)                       | both tools called                    | fails — same bias                        |
| 4 | "Give me my daily briefing"                    | ≥3 tools called                      | reliable ✓                               |
| 5 | "Debug this Python KeyError" (off-topic)       | `llm-rubric`: decline + redirect     | reliable ✓ (when judge is gpt-4.1)       |

## What you learn

- **Composition is biased, not random.** Even when the user asks for both, the model picks one. A specialist sub-agent (next lesson) wouldn't get distracted.
- **The system prompt teaches.** Test 4 fans out reliably because `prompt.md` enumerates the tools by name. Test 2 doesn't — the prompt doesn't list them in pairs.
- **Some properties have no substring.** Test 5 asks "did the bot decline AND redirect?" There's nothing to `contains`-check; that's the gap an LLM judge fills.

## LLM-as-judge

Test 5's only assertion is `llm-rubric` — output graded by another model. Defaults to OpenAI (gpt-4.1).

To swap the judge to Qwen running locally via Ollama:

```bash
ollama pull qwen2.5:3b
ollama serve                    # in a separate shell
npm run eval:qwen               # routes only the judge to Qwen
```

The judge provider lives in `promptfoo/judges/qwen.yaml` and is passed via `--grader file://...`. The main config is untouched — the agent under test still runs on `gpt-4o-mini`.

**Judge calibration matters.** A 3B local judge sometimes misreads correct replies as failures. Add new judges by dropping another `judges/<name>.yaml` and an npm script.

## Prompt source of truth

`promptfoo/prompts/agent.cjs` loads `prompt.md` from disk so the eval can't drift from what the runtime agent actually uses. Edit `prompt.md`, and tests pick it up on the next run.

## Why this matters (the pivot to lesson 11)

The agent has 3+ tools. The model has biases about which to pick and what to surface. Wrapping these in **specialist sub-agents** — each with a narrow tool set and a focused system prompt — eliminates whole classes of failure that no amount of prompt-tweaking on the main agent will fix.
