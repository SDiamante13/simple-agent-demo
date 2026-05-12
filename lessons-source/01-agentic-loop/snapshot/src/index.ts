import "dotenv/config";
import { getUserInput, print, close } from "./cli.js";
import { printBanner, parseCommand } from "../workshop/cli.js";
import { dispatchCommand } from "../workshop/commands/dispatch.js";
import * as llm from "./llm.js";

async function main() {
  printBanner();
  console.log("Chat CLI (type 'exit' to quit, ':help' for commands)\n");

  while (true) {
    const line = await getUserInput();
    const inp = parseCommand(line);
    if (inp.kind === "command") {
      dispatchCommand(inp.name, inp.args);
      continue;
    }

    const userInput = inp.text;
    if (userInput.toLowerCase() === "exit") break;
    if (!userInput.trim()) continue;

    const response = await llm.complete(userInput);
    print(response);
  }

  close();
}

await main();
