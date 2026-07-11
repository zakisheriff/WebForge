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
      featureList: [
        "Full-page incremental stitching screenshot capture",
        "Multi-viewport capture (desktop, tablet, mobile)",
        "Same-domain website crawler and sitemap builder",
        "CSS design token, color palette and font extraction",
        "AI-ready blueprint export for Claude Code, Cursor and Copilot",
      ],
      keywords:
        "website capture, visual blueprint, website screenshot, website crawler, CSS design tokens, AI coding, Claude Code, Cursor, Chrome extension",
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
      ],
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
