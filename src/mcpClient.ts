import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "openai/resources/responses/responses";
import { createLogger } from "./logger.js";

const log = createLogger("mcp");

let client: Client | null = null;
let mcpToolNames: Set<string> = new Set();

export async function connect(): Promise<void> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    log.warn({ message: "TAVILY_API_KEY not set, MCP tools unavailable" });
    return;
  }

  const url = `https://mcp.tavily.com/mcp/?tavilyApiKey=${apiKey}`;
  log.info({ message: "Connecting to Tavily MCP...", url: url.replace(apiKey, "***") });

  client = new Client({ name: "simple-agent", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url));

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("MCP connection timeout (30s)")), 30000)
  );

  try {
    await Promise.race([client.connect(transport), timeout]);
    log.info({ message: "Connected to Tavily MCP" });
  } catch (err) {
    log.warn({ message: "MCP connection failed", error: String(err) });
    client = null;
  }
}

export async function listTools(): Promise<Tool[]> {
  if (!client) return [];

  const { tools } = await client.listTools();
  log.info({ discoveredTools: tools.map((t) => t.name) });

  mcpToolNames = new Set(tools.map((t) => t.name));

  return tools.map((t) => ({
    type: "function" as const,
    name: t.name,
    description: t.description ?? "",
    parameters: t.inputSchema as Record<string, unknown>,
    strict: false,
  }));
}

export function isMcpTool(name: string): boolean {
  return mcpToolNames.has(name);
}

export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  if (!client) throw new Error("MCP client not connected");

  log.info({ mcpToolCall: name, args });
  const result = await client.callTool({ name, arguments: args });

  const content = result.content as Array<{ type: string; text?: string }>;
  if (content[0]?.type === "text" && content[0].text) {
    return content[0].text;
  }

  return JSON.stringify(result.content);
}
