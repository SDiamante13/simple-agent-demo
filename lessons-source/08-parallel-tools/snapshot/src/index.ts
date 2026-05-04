import "dotenv/config";
import { getUserInput, print, close } from "./cli.js";
import * as llm from "./llm.js";
import { executeTool } from "./tools.js";

async function main() {
  console.log("Chat CLI (type 'exit' to quit)\n");

  while (true) {
    const userInput = await getUserInput();
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
