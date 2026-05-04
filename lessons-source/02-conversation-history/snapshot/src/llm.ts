import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "ollama",
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.MODEL ?? "gpt-4o-mini";

type InputItem = OpenAI.Responses.ResponseInputItem;

const conversation: InputItem[] = [];

export function addUserMessage(text: string) {
  conversation.push({ role: "user", content: text });
}

export async function complete(): Promise<string> {
  const response = await client.responses.create({
    model,
    input: conversation,
  });

  conversation.push(...response.output);
  return response.output_text;
}
