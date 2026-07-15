import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import StructuredData from "./structured-data";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://webforge.theatom.lk"),

  title: {
    default: "WebForge — AI Website Capture & Visual Blueprint Engine (Web, Chrome, Python, npm)",
    template: "%s | WebForge",
  },

  description:
    "WebForge is an AI-ready website capture engine available as a free online tool, Chrome extension, Python library, and npm CLI package. Generate high-fidelity visual blueprints (multi-viewport screenshots, sitemaps, CSS design tokens, fonts, colors, and layout structure) optimized for Claude Code, Cursor, Windsurf, GitHub Copilot, ChatGPT, Gemini, and modern AI developer workflows.",

  keywords: [
    // Platforms & Libraries
    "webforge python",
    "webforge npm",
    "webforge cli",
    "webforge-theatom",
    "pip install webforge-theatom",
    "npm install webforge-theatom",
    "python website capture",
    "node website capture",
    "python playwright crawler",
    "node puppeteer crawler",
    // Brand
    "WebForge",
    "WebForge AI",
    "WebForge Download",
    "Download WebForge",
    "WebForge Chrome Extension",
    "WebForge Extension",
    "Install WebForge",
    "WebForge by The Atom",
    "The Atom WebForge",
    "WebForge LK",
    "WebForge Sri Lanka",

    // Company
    "The Atom",
    "The Atom Studio",
    "The Atom Sri Lanka",
    "The Atom LK",
    "The Atom Developer Tools",

    // Core Product
    "website capture",
    "website screenshot",
    "full page screenshot",
    "website blueprint",
    "visual blueprint",
    "website crawler",
    "website scraper",
    "website inspector",
    "website analyzer",
    "website reverse engineering",
    "website cloning",
    "website clone tool",
    "responsive website capture",
    "multi viewport capture",
    "desktop mobile tablet capture",
    "online website screenshot",
    "website screenshot online",
    "paste url screenshot",
    "url to screenshot",
    "capture website online",
    "free website capture tool",
    "website screenshot generator",
    "no install website capture",
    "CSS design token extractor",
    "CSS variable extractor",
    "CSS extractor",
    "font extractor",
    "color palette extractor",
    "layout extractor",
    "HTML extractor",
    "DOM analyzer",
    "website audit",
    "website exporter",
    "website documentation",
    "web archive",

    // AI
    "AI website capture",
    "AI website scraper",
    "AI website blueprint",
    "AI web crawler",
    "AI frontend development",
    "AI coding workflow",
    "website to AI",
    "website to code",
    "screenshot to code",
    "image to code",
    "design to code",
    "frontend to AI",
    "visual context for AI",
    "AI developer tools",
    "AI coding extension",

    // AI Platforms
    "Claude Code",
    "Claude AI",
    "Cursor",
    "Cursor AI",
    "Windsurf",
    "GitHub Copilot",
    "ChatGPT",
    "OpenAI",
    "Gemini",
    "Google Gemini",
    "Lovable",
    "Bolt.new",
    "v0",
    "v0.dev",
    "Replit AI",
    "Codeium",
    "Continue.dev",

    // SEO / Searches
    "best website capture tool",
    "best website screenshot extension",
    "Chrome developer extension",
    "developer productivity",
    "frontend developer tools",
    "web development tools",

    // Competitors
    "GoFullPage alternative",
    "Firecrawl alternative",
    "Browser Use alternative",
    "ScreenshotOne alternative",
    "website crawler alternative",
    "website scraper alternative",
  ],

  authors: [
    {
      name: "Zaki Sheriff",
      url: "https://github.com/zakisheriff",
    },
  ],

  creator: "Zaki Sheriff",

  publisher: "The Atom",

  category: "Developer Tools",

  applicationName: "WebForge",

  referrer: "origin-when-cross-origin",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  appleWebApp: {
    capable: true,
    title: "WebForge",
    statusBarStyle: "default",
  },

  manifest: "/manifest.webmanifest",

  // Add your real tokens from Google Search Console / Bing Webmaster Tools.
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_TOKEN",
    other: {
      "msvalidate.01": "BING_WEBMASTER_TOKEN",
    },
  },

  alternates: {
    canonical: "https://webforge.theatom.lk",
    languages: {
      "en-US": "https://webforge.theatom.lk",
      "x-default": "https://webforge.theatom.lk",
    },
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://webforge.theatom.lk",
    siteName: "WebForge",

    title:
      "WebForge — AI Website Capture & Visual Blueprint Engine",

    description:
      "Paste a URL to capture any website online, install the Chrome extension, or use our Python and npm CLI packages. Generate high-fidelity screenshots, sitemaps, and CSS design tokens optimized for Claude, Cursor, and AI coding agents.",

    images: [
      {
        url: "https://webforge.theatom.lk/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebForge: AI Website Capture & Visual Blueprint",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "WebForge — AI Website Capture & Visual Blueprint Engine",

    description:
      "Capture websites online, via Chrome extension, or with Python & npm packages. Generate multi-viewport screenshots, sitemaps, and CSS design tokens for AI coding agents.",

    images: ["https://webforge.theatom.lk/og-image.png"],
  },

  // Favicon, icon.png and apple-icon.png are auto-wired from src/app/ via
  // Next.js file conventions — no explicit `icons` block needed.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>

      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}