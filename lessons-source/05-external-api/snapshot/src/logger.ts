import { appendFileSync } from "node:fs";

const LOG_FILE = "agent.log";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];
const minLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

const timestamp = () => new Date().toISOString();

const formatData = (data?: unknown): string => {
  if (data === undefined) return "";
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
};

const write = (level: LogLevel, context: string, data?: unknown) => {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(minLevel)) return;
  const entry = `[${timestamp()}] ${level.toUpperCase().padEnd(5)} [${context}] ${formatData(data)}`;
  appendFileSync(LOG_FILE, entry + "\n");
};

function summarizeItem(item: unknown): string {
  const obj = item as Record<string, unknown>;
  if (obj.role === "system") return "[system] <prompt>";
  if (obj.role === "user") return `[user] ${obj.content}`;
  if (obj.type === "function_call")
    return `[tool_call] ${obj.name}(${obj.arguments})`;
  if (obj.type === "function_call_output")
    return `[tool_result] ${obj.output}`;
  if (obj.role === "assistant") {
    const content = obj.content;
    if (Array.isArray(content))
      return `[assistant] ${content.map((c: any) => c.text).join("")}`;
  }
  return `[unknown] ${JSON.stringify(item)}`;
}

export function summarizeConversation(items: unknown[]): string {
  return items.map(summarizeItem).join("\n");
}

export const createLogger = (context: string) => ({
  debug: (data?: unknown) => write("debug", context, data),
  info: (data?: unknown) => write("info", context, data),
  warn: (data?: unknown) => write("warn", context, data),
  error: (data?: unknown) => write("error", context, data),
});
