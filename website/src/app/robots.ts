import { MetadataRoute } from "next";

const SITE_URL = "https://webforge.theatom.lk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Search + answer + generative engine crawlers — all allowed.
        userAgent: [
          "*",
          // Search engines
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "DuckDuckBot",
          "YandexBot",
          "Applebot",
          // AI / answer / generative engines
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-Web",
          "Claude-SearchBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "PerplexityBot",
          "Perplexity-User",
          "cohere-ai",
          "Diffbot",
          "Amazonbot",
          "Meta-ExternalAgent",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
