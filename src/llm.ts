import { readFileSync } from "fs";
import OpenAI from "openai";
import { toolDefinitions, ToolCall } from "./tools.js";
import * as conversation from "./conversation.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

conversation.addSystemPrompt(readFileSync("prompt.md", "utf-8"));

export type Response = {
  wantsTool: boolean;
  toolCalls: ToolCall[];
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
    model: "gpt-4o-mini",
    input: conversation.getItems() as OpenAI.Responses.ResponseInputItem[],
    tools: toolDefinitions,
  });

  conversation.addResponse(response.output);

  const functionCalls = response.output.filter(
    (o) => o.type === "function_call"
  );

  if (functionCalls.length > 0) {
    const toolCalls = functionCalls.map((fc) => ({
      callId: fc.call_id,
      name: fc.name,
      arguments: JSON.parse(fc.arguments),
    }));
    return { wantsTool: true, toolCalls, text: "" };
  }

  return { wantsTool: false, toolCalls: [], text: response.output_text };
}
