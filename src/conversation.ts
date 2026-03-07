import { createLogger, summarizeConversation } from "./logger.js";

const log = createLogger("conversation");

const items: unknown[] = [];
let logCursor = 0;

function logDelta() {
  if (items.length > logCursor) {
    log.info(summarizeConversation(items.slice(logCursor)));
    log.debug({ conversationHistory: items });
    logCursor = items.length;
  }
}

export function addSystemPrompt(content: string) {
  items.push({ role: "system", content });
}

export function addUserMessage(text: string) {
  items.push({ role: "user", content: text });
}

export function addToolResult(callId: string, output: string) {
  items.push({
    type: "function_call_output",
    call_id: callId,
    output,
  });
}

export function addResponse(output: unknown[]) {
  items.push(...output);
  logDelta();
}

export function getItems(): unknown[] {
  return items;
}
