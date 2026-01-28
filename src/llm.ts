import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function complete(input: string): Promise<string> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input,
  });

  return response.output_text;
}
