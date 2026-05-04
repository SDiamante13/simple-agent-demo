import type { Tool } from "openai/resources/responses/responses";

export const toolDefinitions: Tool[] = [
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
];

export type ToolCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
};

export function executeTool(toolCall: ToolCall): string {
  const timezone = toolCall.arguments["timezone"] as string | undefined;
  return new Date().toLocaleString("en-US", { timeZone: timezone });
}
