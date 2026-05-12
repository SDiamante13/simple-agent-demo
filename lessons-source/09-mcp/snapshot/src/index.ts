import "dotenv/config";
import { getUserInput, print, close } from "./cli.js";
import { printBanner, parseCommand } from "../workshop/cli.js";
import { dispatchCommand } from "../workshop/commands/dispatch.js";
import * as llm from "./llm.js";
import * as mcp from "./mcpClient.js";
import { executeTool } from "./tools.js";

async function main() {
  await mcp.connect();
  await llm.init();

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

    llm.addUserMessage(userInput);
    let response = await llm.complete();

    while (response.wantsTool) {
      const results = await Promise.all(
        response.toolCalls.map((tc) => executeTool(tc))
      );
      for (let i = 0; i < response.toolCalls.length; i++) {
        llm.addToolResult(response.toolCalls[i].callId, results[i]);
      }
      response = await llm.complete();
    }

    print(response.text);
  }

  close();
}

await main();
