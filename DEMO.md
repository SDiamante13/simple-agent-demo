# Simple Agent Demo - Teaching Progression

A step-by-step curriculum for teaching AI agent patterns to client engineers.

---

## Lesson 1: The Agentic Loop

**Tag**: `lesson-1-agentic-loop`

**Concept**: An agent is an LLM in a loop that can take actions.

```
User Input → LLM → Response
               ↓
            (if tool needed)
               ↓
         Execute Tool → Add Result → LLM → Response
```

**Key Files**:
- `src/index.ts` - The loop
- `src/llm.ts` - Conversation state + API calls
- `src/cli.ts` - I/O layer

**Try It**:
```bash
npm start
> What is 2 + 2?
```

The LLM responds directly - no tools needed yet.

**Aha Moment**: An agent is just a while loop that keeps calling the LLM until it has a final answer.

---

## Lesson 2: Adding Tools

**Tag**: `lesson-2-tools`

**Concept**: Tools are capabilities defined as JSON Schema + executor functions.

**Pattern**:
1. **Define** - JSON Schema describing what the tool does
2. **Register** - Add to `localTools` array
3. **Execute** - Switch case in `executeTool()`

**Key Code** (`tools.ts`):
```typescript
// Definition (what the LLM sees)
{
  type: "function",
  name: "get_current_time",
  description: "Get the current date and time",
  parameters: { ... }
}

// Execution (what runs)
function executeGetCurrentTime(args: Record<string, unknown>): string {
  const timezone = args["timezone"] as string | undefined;
  return new Date().toLocaleString("en-US", { timeZone: timezone });
}
```

**Try It**:
```bash
npm start
> What time is it in Tokyo?
```

Watch the loop: LLM decides to call tool → tool executes → result fed back → LLM responds.

**Aha Moment**: The LLM *chooses* to use tools based on context. You don't hardcode when to call them.

---

## Lesson 3: Observability

**Tag**: `lesson-3-observability`

**Concept**: You can't debug what you can't see. Log everything.

**Key File**: `src/logger.ts`

```typescript
const log = createLogger("agent");
log.info({ role: "user", content: text });
log.debug({ toolCall, result });
```

**View Logs**:
```bash
tail -f agent.log
```

**Try It**: Run a query and watch `agent.log` show the full conversation flow.

**Aha Moment**: Agentic systems are non-deterministic. Logs are essential for understanding what happened.

---

## Lesson 4: External API Integration

**Tag**: `lesson-4-external-api`

**Concept**: Tools can call external APIs. Isolate integration complexity.

**Pattern**:
- Tool definition in `tools.ts`
- API client in separate file (`giphyClient.ts`)
- Error handling at the integration boundary

**Key Code** (`giphyClient.ts`):
```typescript
export async function searchGif(query: string): Promise<string> {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return "Error: GIPHY_API_KEY not configured";
  }

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("rating", "g");

  const response = await fetch(url);
  // Handle errors, parse response, return URL
}
```

**Try It**:
```bash
npm start
> Show me a happy GIF
```

**Aha Moment**: Tools are the bridge between LLM reasoning and real-world actions.

---

## Lesson 5: Agent Focus (System Prompts)

**Tag**: `lesson-5-system-prompt`

**Concept**: Without a system prompt, an LLM is just ChatGPT. System prompts define role, goal, and boundaries.

**The Problem**: Run the agent without a system prompt:
```bash
npm start
> Write me a poem about cats
```
It complies! But this is a briefing bot, not a poetry generator.

**The Solution**: Add `prompt.md`:
```markdown
You are a Daily Briefing Bot. Your purpose is to help users
start their day with useful information and positive energy.

If asked about topics outside your purpose, acknowledge but redirect:
"I'm your daily briefing bot! While I can't help with that,
I can share an inspiring quote or a fun GIF to brighten your day."
```

**After Adding**:
```bash
npm start
> Write me a poem about cats
AI: I'm your daily briefing bot! While I can't help with poetry...
```

**Aha Moment**: The system prompt IS the product. It defines what the agent does and refuses to do.

---

## Lesson 6: Adding Another Tool

**Tag**: `lesson-6-quote-tool`

**Concept**: Reinforce the tool pattern. Same steps, different capability.

**New Tool**: `get_inspirational_quote` using ZenQuotes API (no key needed)

**Files**:
- `quoteClient.ts` - API integration
- `tools.ts` - Definition + executor

**Try It**:
```bash
npm start
> Give me an inspiring quote
```

**Aha Moment**: Adding tools is formulaic. Define, implement, register.

---

## Lesson 7: Parallel Tool Calls

**Tag**: `lesson-7-parallel-tools`

**Concept**: The LLM autonomously decides when to parallelize. You don't code this logic.

**The Magic**: Ask for multiple things:
```bash
npm start
> Give me a quote and a GIF to start my day
```

Check `agent.log` - both tools called in the *same* turn:
```
INFO [llm] { "parallelTools": ["get_inspirational_quote", "get_gif"] }
```

**Code Change** (`index.ts`):
```typescript
// Before: Single tool
const result = await executeTool(response.toolCall);

// After: Parallel tools
const results = await Promise.all(
  response.toolCalls.map(tc => executeTool(tc))
);
```

**Aha Moment**: The LLM recognized these requests are independent and parallelized them. You didn't tell it to.

---

## Lesson 8: MCP Integration

**Tag**: `lesson-8-mcp`

**Concept**: Tools don't have to be hardcoded. MCP (Model Context Protocol) lets you discover and call tools from external servers dynamically.

**Three Key Ideas**:
1. **Dynamic tool discovery** - Tools fetched at runtime, not compile time
2. **Protocol abstraction** - Same interface whether tool is local or remote
3. **Tool composition** - Mix local tools (time, giphy) with MCP tools (search) seamlessly

**New Dependency**: `@modelcontextprotocol/sdk`

**MCP Server**: Tavily (remote via Streamable HTTP)
```
https://mcp.tavily.com/mcp/?tavilyApiKey=<your-api-key>
```

**Key Code** (`mcpClient.ts`):
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Connect to remote MCP server
const transport = new StreamableHTTPClientTransport(new URL(url));
await client.connect(transport);

// Discover tools dynamically
const { tools } = await client.listTools();

// Call MCP tool
const result = await client.callTool({ name, arguments: args });
```

**Integration Pattern** (`tools.ts`):
```typescript
// Merge local + MCP tools
export async function getAllTools(): Promise<Tool[]> {
  const mcpTools = await mcp.listTools();
  return [...localTools, ...mcpTools];
}

// Dispatch based on source
export async function executeTool(toolCall: ToolCall): Promise<string> {
  if (mcp.isMcpTool(toolCall.name)) {
    return mcp.callTool(toolCall.name, toolCall.arguments);
  }
  // ... handle local tools
}
```

**Try It**:
```bash
npm start
> What's happening in tech today?
```

Watch the agent use Tavily search to fetch real-time news headlines.

**Aha Moment**: Your agent's capabilities aren't limited to what you coded. MCP servers can add tools at runtime - the agent discovers and uses them automatically.

---

## Summary

| Lesson | Concept                | Tag                        |
|--------|------------------------|----------------------------|
| 1      | Agentic Loop           | `lesson-1-agentic-loop`    |
| 2      | Tool Definition        | `lesson-2-tools`           |
| 3      | Observability          | `lesson-3-observability`   |
| 4      | External APIs          | `lesson-4-external-api`    |
| 5      | Agent Focus            | `lesson-5-system-prompt`   |
| 6      | Tool Pattern           | `lesson-6-quote-tool`      |
| 7      | Parallel Calls         | `lesson-7-parallel-tools`  |
| 8      | MCP Integration        | `lesson-8-mcp`             |

## Running the Demo

```bash
# Start from the beginning
git checkout lesson-1-agentic-loop
npm install && npm run build && npm start

# Progress through lessons
git checkout lesson-2-tools
git checkout lesson-3-observability
git checkout lesson-4-external-api
git checkout lesson-5-system-prompt
git checkout lesson-6-quote-tool
git checkout lesson-7-parallel-tools
git checkout lesson-8-mcp
```
