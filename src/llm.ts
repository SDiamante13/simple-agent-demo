import OpenAI from "openai";
import { toolDefinitions, ToolCall } from "./tools.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type InputItem = OpenAI.Responses.ResponseInputItem;

const conversation: InputItem[] = [];

export type Response = {
  wantsTool: boolean;
  toolCall?: ToolCall;
  text: string;
};

export function addUserMessage(text: string) {
  conversation.push({ role: "user", content: text });
}

export function addToolResult(callId: string, output: string) {
  conversation.push({
    type: "function_call_output",
    call_id: callId,
    output,
  });
}

export async function complete(): Promise<Response> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: conversation,
    tools: toolDefinitions,
  });

  conversation.push(...response.output);

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
