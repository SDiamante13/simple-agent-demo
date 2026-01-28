import type { Tool } from "openai/resources/responses/responses";
import { searchGif } from "./giphyClient.js";

export const toolDefinitions: Tool[] = [
  {
    type: "function",
    name: "get_current_time",
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
];

export type ToolCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
};

export async function executeTool(toolCall: ToolCall): Promise<string> {
  switch (toolCall.name) {
    case "get_current_time":
      return executeGetCurrentTime(toolCall.arguments);
    case "get_gif":
      return executeGetGif(toolCall.arguments);
    default:
      return `Unknown tool: ${toolCall.name}`;
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
