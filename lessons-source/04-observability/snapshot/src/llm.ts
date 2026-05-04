import OpenAI from "openai";
import { toolDefinitions, ToolCall } from "./tools.js";
import * as conversation from "./conversation.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "ollama",
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.MODEL ?? "gpt-4o-mini";

export type Response = {
  wantsTool: boolean;
  toolCall?: ToolCall;
  text: string;
};

export function addUserMessage(text: string) {
  conversation.addUserMessage(text);
}

export function addToolResult(callId: string, output: string) {
  conversation.addToolResult(callId, output);
}

export async function complete(): Promise<Response> {
  const response = await client.responses.create({
    model,
    input: conversation.getItems() as OpenAI.Responses.ResponseInputItem[],
    tools: toolDefinitions,
  });

  conversation.addResponse(response.output);

  const toolCall = response.output.find((o) => o.type === "function_call");

  if (toolCall?.type === "function_call") {
    return {
      wantsTool: true,
      toolCall: {
        callId: toolCall.call_id,
        name: toolCall.name,
        arguments: JSON.parse(toolCall.arguments),
      },
      text: "",
    };
  }

  return { wantsTool: false, text: response.output_text };
}
