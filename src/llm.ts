import { readFileSync } from "fs";
import OpenAI from "openai";
import type { Tool } from "openai/resources/responses/responses";
import { getAllTools, ToolCall } from "./tools.js";
import { createLogger } from "./logger.js";
import * as conversation from "./conversation.js";

const log = createLogger("llm");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "ollama",
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.MODEL ?? "gpt-4o-mini";

let tools: Tool[] = [];

export async function init(): Promise<void> {
  conversation.addSystemPrompt(readFileSync("prompt.md", "utf-8"));
  tools = await getAllTools();
  const toolNames = tools
    .filter((t): t is Tool & { name: string } => "name" in t)
    .map((t) => t.name);
  log.info({ availableTools: toolNames });
}

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

export async function complete(onToken?: (token: string) => void): Promise<Response> {
  const stream = client.responses.stream({
    model,
    input: conversation.getItems() as OpenAI.Responses.ResponseInputItem[],
    tools,
  });

  if (onToken) {
    stream.on("response.output_text.delta", (event) => onToken(event.delta));
  }

  const response = await stream.finalResponse();

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

  const text = response.output_text || extractText(response.output);
  return { wantsTool: false, toolCalls: [], text };
}

function extractText(output: OpenAI.Responses.ResponseOutputItem[]): string {
  return output
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content)
    .filter((c): c is OpenAI.Responses.ResponseOutputText => c.type === "output_text")
    .map((c) => c.text)
    .join("");
}
