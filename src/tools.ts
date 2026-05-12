import type { Tool } from "openai/resources/responses/responses";
import { searchGif } from "./giphyClient.js";
import { getInspirationalQuote } from "./quoteClient.js";
import * as mcp from "./mcpClient.js";

const localTools: Tool[] = [
  {
    type: "function",
    name: "get_current_date_time",
    description: "Get the current date and time",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "Timezone like 'America/New_York' or 'UTC'. Defaults to local.",
        },
      },
      required: [],
    },
    strict: false,
  },
  {
    type: "function",
    name: "get_gif",
    description:
      "Search for a GIF that fits the current conversation context. Use this to add visual reactions, illustrate emotions, or enhance responses with relevant imagery.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search term based on conversation context (emotions, reactions, topics, actions)",
        },
      },
      required: ["query"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "get_inspirational_quote",
    description: "Get a random inspirational quote to motivate the user",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    strict: false,
  },
];

export async function getAllTools(): Promise<Tool[]> {
  const mcpTools = await mcp.listTools();
  return [...localTools, ...mcpTools];
}

export type ToolCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
};

export async function executeTool(toolCall: ToolCall): Promise<string> {
  try {
    if (mcp.isMcpTool(toolCall.name)) {
      return await mcp.callTool(toolCall.name, toolCall.arguments);
    }

    switch (toolCall.name) {
      case "get_current_date_time":
        return executeGetCurrentTime(toolCall.arguments);
      case "get_gif":
        return await executeGetGif(toolCall.arguments);
      case "get_inspirational_quote":
        return await getInspirationalQuote();
      default:
        return `Unknown tool: ${toolCall.name}`;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Tool '${toolCall.name}' failed: ${message}`;
  }
}

function executeGetCurrentTime(args: Record<string, unknown>): string {
  const timezone = args["timezone"] as string | undefined;
  return new Date().toLocaleString("en-US", { timeZone: timezone });
}

function executeGetGif(args: Record<string, unknown>): Promise<string> {
  const query = args["query"] as string;
  return searchGif(query);
}
