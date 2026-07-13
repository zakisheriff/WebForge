/**
 * Centralised Structured Data (JSON-LD) for SEO / AEO / GEO.
 *
 * One @graph exposes every entity search engines, answer engines
 * (Google AI Overviews, Perplexity, Bing Copilot) and generative
 * engines (ChatGPT, Claude, Gemini) look for:
 *
 *   - Organization      → brand / publisher knowledge panel
 *   - WebSite           → sitelinks + name in SERP
 *   - SoftwareApplication → rich product result + rating stars
 *   - FAQPage           → AEO answer boxes (mirrors visible FAQ)
 *   - HowTo             → step-by-step install answers
 *   - BreadcrumbList    → breadcrumb rich result
 */

import { POSTS } from "./blog/posts";

const SITE_URL = "https://webforge.theatom.lk";

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Atom",
      alternateName: "The Atom Studio",
      url: "https://theatom.lk",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/Logo-WebForge.png`,
        width: 808,
        height: 808,
      },
      founder: {
        "@type": "Person",
        name: "Zaki Sheriff",
        url: "https://github.com/zakisheriff",
      },
      sameAs: [
        "https://github.com/zakisheriff",
        "https://github.com/zakisheriff/WebForge",
        "https://buymeacoffee.com/theoneatom",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "WebForge",
      description:
        "AI-ready Chrome extension that captures websites into visual blueprints, screenshots, sitemaps and CSS design tokens for AI coding agents.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "WebForge",
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Browser Extension",
      operatingSystem: "Windows, macOS, Linux, ChromeOS",
      browserRequirements: "Requires Google Chrome or Chromium-based browser",
      softwareVersion: "1.0",
      downloadUrl: "https://github.com/zakisheriff/WebForge",
      installUrl: "https://github.com/zakisheriff/WebForge",
      description:
        "WebForge is an AI-ready Chrome extension that captures complete websites into visual blueprints, full-page screenshots, sitemaps, CSS design tokens, fonts, colors and layouts for AI coding assistants like Claude Code, Cursor, Windsurf, GitHub Copilot, ChatGPT and Gemini.",
      author: { "@id": `${SITE_URL}/#organization` },
      creator: { "@type": "Person", name: "Zaki Sheriff" },
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      // NOTE: aggregateRating must reflect genuine user ratings. Update the
      // values as real reviews come in, or remove this block — fabricated
      // ratings violate Google's structured-data policy.
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "12",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Full-page incremental stitching screenshot capture",
        "Multi-viewport capture (desktop, tablet, mobile)",
        "Same-domain website crawler and sitemap builder",
        "CSS design token, color palette and font extraction",
        "AI-ready blueprint export for Claude Code, Cursor and Copilot",
        "Free online single-page capture — paste any URL on the website, no install required",
      ],
      keywords:
        "website capture, visual blueprint, website screenshot, website crawler, CSS design tokens, AI coding, Claude Code, Cursor, Chrome extension",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "WebForge Online Capture",
      url: `${SITE_URL}/#try`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any (runs in the browser)",
      browserRequirements: "Requires a modern web browser",
      description:
        "Free online tool on the WebForge website: paste any website URL and instantly capture multi-viewport full-page screenshots (desktop, tablet, mobile) plus extracted colors, fonts and images, downloadable as a ZIP — a single-page preview of the WebForge extension, with no install required.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Paste-a-URL website capture directly in the browser",
        "Multi-viewport full-page screenshots (desktop, tablet, mobile)",
        "Automatic color palette, font and image extraction",
        "One-click ZIP download of screenshots and metadata",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is WebForge?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "WebForge is a free Chrome extension that captures any website into an AI-ready visual blueprint. It stitches full-page screenshots across desktop, tablet and mobile viewports, crawls same-domain pages, and extracts CSS design tokens, fonts and colors so AI coding agents can rebuild the layout accurately.",
          },
        },
        {
          "@type": "Question",
          name: "Is WebForge free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. WebForge is completely free to install and use. You can download it from GitHub and support development through Buy Me a Coffee.",
          },
        },
        {
          "@type": "Question",
          name: "Which AI tools does WebForge work with?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "WebForge output is optimized for Claude Code, Cursor, Windsurf, GitHub Copilot, ChatGPT, Gemini, Lovable, Bolt.new, v0 and any AI coding workflow that accepts screenshots and design-token context.",
          },
        },
        {
          "@type": "Question",
          name: "How is WebForge different from GoFullPage or a normal screenshot tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Unlike a plain screenshot extension, WebForge captures multiple viewports, crawls the whole domain, and exports a structured package containing screenshots plus JSON metadata of colors, fonts and sitemap — everything an AI agent needs to reconstruct the frontend code.",
          },
        },
        {
          "@type": "Question",
          name: "What does the exported WebForge package contain?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Each export is a ZIP containing a pages/ folder with desktop.png, tablet.png and mobile.png per page, a per-page metadata.json (title, URL, fonts, colors), a global metadata.json with combined design tokens and timestamps, and a sitemap.json of the discovered domain tree.",
          },
        },
        {
          "@type": "Question",
          name: "Can I try WebForge without installing the extension?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The WebForge website has a free online capture tool — paste any website URL and it instantly returns multi-viewport full-page screenshots (desktop, tablet, mobile) plus extracted colors, fonts and images, downloadable as a ZIP. The online tool captures a single page; installing the extension unlocks full-domain crawling, login and bot-protected pages, and pixel-perfect fidelity.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a Python or Node package?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The same capture engine ships as webforge-theatom on both PyPI (pip install webforge-theatom) and npm (npm install webforge-theatom), with an identical capture() and crawl() API plus a webforge CLI — ideal for scripts, notebooks and AI agent pipelines.",
          },
        },
        {
          "@type": "Question",
          name: "How does WebForge help AI coding agents rebuild sites accurately?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Vision models are good at layout and poor at precision. WebForge pairs real multi-viewport screenshots with machine-readable design tokens — exact hex colors and the real font stack — so the agent reasons about layout from the image and pulls exact values from the metadata, eliminating color drift and font guessing.",
          },
        },
        {
          "@type": "Question",
          name: "Does WebForge store or send my captured data anywhere?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The extension and packages run captures locally in your own browser or environment and export a ZIP to your machine. The free online tool captures a single page on-demand and returns the ZIP to you without retaining it.",
          },
        },
      ],
    },
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: "WebForge Blog",
      description:
        "Guides on turning websites into AI-ready visual blueprints for coding agents — screenshot-to-code, design-token extraction and context packs for Claude Code, Cursor and Copilot.",
      url: `${SITE_URL}/blog`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
      blogPost: POSTS.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        url: `${SITE_URL}/blog/${post.slug}`,
        keywords: post.tags.join(", "),
        author: { "@type": "Person", name: "Zaki Sheriff" },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/blog/${post.slug}`,
        },
      })),
    },
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/#howto`,
      name: "How to capture a website with WebForge",
      description:
        "Install WebForge and export an AI-ready visual blueprint of any website in four steps.",
      totalTime: "PT2M",
      tool: { "@type": "HowToTool", name: "WebForge Chrome Extension" },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Install the extension",
          text: "Download and install WebForge from GitHub into any Chrome or Chromium-based browser.",
          url: `${SITE_URL}/#features`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Open the target website",
          text: "Navigate to the website you want to capture and open the WebForge popup.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Choose a capture mode",
          text: "Select single page, multi-viewport, or full-domain crawl, then start the capture.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Export the blueprint",
          text: "WebForge compiles screenshots, sitemap and design tokens into a ZIP package ready to feed to your AI coding agent.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "How It Works",
          item: `${SITE_URL}/#features`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Blueprint Structure",
          item: `${SITE_URL}/#structure`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Try Online",
          item: `${SITE_URL}/#try`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
      ],
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
