# Simple Agent Demo

Teaching codebase demonstrating AI agent patterns for client engineers.

## Architecture

```
CLI (I/O) → index.ts (orchestration) → llm.ts (reasoning)
                                     → tools.ts (execution)
                                     → *Client.ts (external APIs)
            logger.ts (observability)
```

## Key Files

- `src/index.ts` - Agentic loop: prompt → LLM → tool execution → response
- `src/llm.ts` - Conversation state + OpenAI Responses API
- `src/tools.ts` - Tool definitions (JSON Schema) + executors
- `src/giphyClient.ts` - External API adapter pattern
- `src/logger.ts` - File-based structured logging

## Patterns Demonstrated

1. **Agentic Loop** - Iterative tool execution with context accumulation
2. **Declarative Tools** - Schema defines capability, switch dispatches execution
3. **Separation of Concerns** - I/O, reasoning, execution, integrations isolated
4. **Observability** - All interactions logged to `agent.log`

## Adding a New Tool

1. Define schema in `toolDefinitions` array (tools.ts)
2. Add case to `executeTool()` switch
3. Create executor function (inline or separate client file for APIs)

## Commands

```bash
npm run build    # Compile TypeScript
npm start        # Run agent CLI
```

## Environment

Required in `.env`:
- `OPENAI_API_KEY`
- `GIPHY_API_KEY`

## Model

Uses `gpt-4o-mini` via OpenAI Responses API
