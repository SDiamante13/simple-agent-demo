import { loadLessons, currentTag } from "./lessons.js";
import { renderBanner } from "./banner.js";

export type ParsedInput =
  | { kind: "input"; text: string }
  | { kind: "command"; name: string; args: string[] };

export const printBanner = (): void => {
  console.log(renderBanner(loadLessons(), currentTag()) + "\n");
};

export const parseCommand = (line: string): ParsedInput => {
  const trimmed = line.trim();
  if (trimmed.startsWith(":")) {
    const [name, ...args] = trimmed.slice(1).split(/\s+/);
    return { kind: "command", name, args };
  }
  return { kind: "input", text: line };
};
