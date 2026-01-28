import "dotenv/config";
import { getUserInput, print, close } from "./cli.js";
import * as llm from "./llm.js";

async function main() {
  console.log("Chat CLI (type 'exit' to quit)\n");

  while (true) {
    const userInput = await getUserInput();
    if (userInput.toLowerCase() === "exit") break;
    if (!userInput.trim()) continue;

    const response = await llm.complete(userInput);
    print(response);
  }

  close();
}

await main();
