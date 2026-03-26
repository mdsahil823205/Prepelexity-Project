import dotenv from "dotenv";
dotenv.config();

import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const tavilyService = async (query) => {
  try {
    const response = await tvly.search(query, {
      max_results: 3,
      search_depth: "advanced",
      topic: "news",
    });

    if (!response.results || response.results.length === 0) {
      return "No internet results found.";
    }

    return response.results
      .map(
        (r, i) => `
Result ${i + 1}
Title: ${r.title}
URL: ${r.url}
Content: ${r.content}
`,
      )
      .join("\n");
  } catch (err) {
    console.error("Search error:", err.message);
    return "Internet search failed.";
  }
};

export default tavilyService;
