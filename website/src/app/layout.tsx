import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebForge — AI-Ready Website Capture Chrome Extension",
  description: "Capture high-fidelity visual blueprints, multi-viewport designs, sitemaps, and CSS design tokens from any website. Optimized for Claude, Cursor, and AI coding agents.",
  keywords: [
    "webforge", 
    "website capture", 
    "gofullpage alternative", 
    "screenshot to code", 
    "claude code input", 
    "cursor visual blueprint", 
    "design token extractor", 
    "web crawler", 
    "chrome extension"
  ],
  authors: [{ name: "Zaki Sheriff", url: "https://github.com/zakisheriff" }],
  alternates: {
    canonical: "https://webforge.theatom.lk",
  },
  openGraph: {
    type: "website",
    url: "https://webforge.theatom.lk",
    title: "WebForge — AI-Ready Website Capture Engine",
    description: "Capture visual blueprints, sitemaps, and design tokens to feed into AI coding workflows.",
    siteName: "WebForge",
    images: [{ url: "https://webforge.theatom.lk/assets/hero.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebForge — AI-Ready Website Capture Engine",
    description: "Generate complete visual blueprints and CSS variables of any webpage for AI coding agents.",
    images: ["https://webforge.theatom.lk/assets/hero.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "WebForge",
              "operatingSystem": "Chrome OS, macOS, Windows, Linux",
              "applicationCategory": "DeveloperApplication",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "description": "An advanced browser screenshot and website crawler extension that compiles pages into visual blueprints and CSS design tokens for AI coding tools like Claude and Cursor.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "142"
              }
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
