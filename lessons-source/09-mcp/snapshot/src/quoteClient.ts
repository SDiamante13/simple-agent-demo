type ZenQuote = {
  q: string;
  a: string;
};

export async function getInspirationalQuote(): Promise<string> {
  const response = await fetch("https://zenquotes.io/api/random");

  if (!response.ok) {
    throw new Error(`ZenQuotes API error: ${response.status}`);
  }

  const data = (await response.json()) as ZenQuote[];
  const quote = data[0];

  return `"${quote.q}" - ${quote.a}`;
}
