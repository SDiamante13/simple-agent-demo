import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "ollama",
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.MODEL ?? "gpt-4o-mini";

export async function complete(input: string): Promise<string> {
  const response = await client.responses.create({
    model,
    input,
  });

  return response.output_text;
}
