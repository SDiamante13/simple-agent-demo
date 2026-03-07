import * as readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const getUserInput = (): Promise<string> =>
  new Promise((resolve) => rl.question("You: ", resolve));

export const print = (text: string) => console.log("AI: " + text + "\n");

export const printToken = (token: string) => {
  if (token === "") return;
  process.stdout.write(token);
};

export const printEnd = () => console.log("\n");

export const close = () => rl.close();
