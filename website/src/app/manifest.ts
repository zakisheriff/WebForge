import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WebForge — AI Website Capture & Visual Blueprint",
    short_name: "WebForge",
    description:
      "AI-ready Chrome extension that captures websites into visual blueprints, screenshots, sitemaps and CSS design tokens for AI coding agents.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f0eee6",
    theme_color: "#191919",
    lang: "en",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/Logo-WebForge.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
