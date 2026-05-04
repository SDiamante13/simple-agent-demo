type GiphyResponse = {
  data: Array<{
    images: {
      original: { url: string };
    };
  }>;
};

export async function searchGif(query: string): Promise<string> {
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    return "Error: GIPHY_API_KEY not configured";
  }

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("rating", "g");

  const response = await fetch(url);
  if (!response.ok) {
    return `Error: Giphy API returned ${response.status}`;
  }

  const data = (await response.json()) as GiphyResponse;
  if (!data.data || data.data.length === 0) {
    return `No GIFs found for "${query}"`;
  }

  return data.data[0].images.original.url;
}
