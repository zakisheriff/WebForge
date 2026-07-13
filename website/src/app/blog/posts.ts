/**
 * Blog content, authored as structured data so each post renders as a real
 * page (SEO) and as Article JSON-LD (AEO / GEO). Add a new object here and it
 * automatically appears on /blog, gets a /blog/<slug> route, a sitemap entry
 * and Article structured data. No other file needs editing.
 */

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang: string; text: string };

export interface Post {
  slug: string;
  title: string;
  /** Meta description + card excerpt. Keep ~150 chars. */
  description: string;
  /** ISO date. */
  date: string;
  readingMinutes: number;
  tags: string[];
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "what-is-a-website-visual-blueprint",
    title: "What is a website visual blueprint (and why AI coding agents need one)",
    description:
      "A visual blueprint is a structured capture of a website (multi-viewport screenshots plus design tokens) that gives AI coding agents the context they need to rebuild a page accurately.",
    date: "2026-06-02",
    readingMinutes: 5,
    tags: ["AI coding", "visual blueprint", "design tokens"],
    body: [
      {
        type: "p",
        text: "Ask an AI coding agent to “rebuild this landing page” from a single screenshot and you get something that looks roughly right and is wrong in every detail: the wrong greys, a font that is close but not the one, spacing that drifts a few pixels on every element. The model is not failing; it simply never had the source of truth. A website visual blueprint is that source of truth.",
      },
      { type: "h2", text: "A blueprint is more than a screenshot" },
      {
        type: "p",
        text: "A screenshot is a flat image. A visual blueprint is a structured package that pairs the image with the machine-readable facts an agent cannot reliably infer by looking:",
      },
      {
        type: "ul",
        items: [
          "Full-page screenshots across desktop, tablet and mobile, so the agent sees real CSS breakpoint behaviour, not one arbitrary width.",
          "An area-weighted colour palette as exact hex values, so no more guessing #f0eee6 from a JPEG.",
          "The fonts actually rendered on the page, in prominence order.",
          "Image assets, as URLs and inline data-URIs.",
          "A sitemap of the crawled domain, so multi-page structure is explicit.",
        ],
      },
      { type: "h2", text: "Why the tokens matter more than the pixels" },
      {
        type: "p",
        text: "Vision models are good at layout and bad at precision. They can tell that a button is in the top-right, but they cannot read a hex code off a compressed image, and they will happily invent a font name. Design tokens close that gap: the agent reasons about layout from the picture and pulls exact values from the metadata. That is the difference between “looks similar” and “pixel-accurate.”",
      },
      { type: "h2", text: "What a good blueprint looks like on disk" },
      {
        type: "code",
        lang: "text",
        text: "WebForge_Project/\n  pages/\n    home/\n      desktop.png  tablet.png  mobile.png\n      metadata.json      # title, url, fonts, colors\n  sitemap.json           # discovered domain tree\n  metadata.json          # global colors, fonts, timestamps",
      },
      {
        type: "p",
        text: "Feed the global metadata.json first so the agent loads the palette and fonts, then the device PNG as the visual reference. That ordering, tokens before pixels, is what keeps the rebuild honest.",
      },
      {
        type: "p",
        text: "WebForge produces exactly this package for any URL. You can try it free on the homepage, or install the extension to crawl a whole domain.",
      },
    ],
  },
  {
    slug: "website-to-claude-code-context-pack",
    title: "How to turn any website into a Claude Code or Cursor context pack",
    description:
      "A practical workflow for capturing a reference site as a clean context pack and handing it to Claude Code, Cursor or Copilot so the rebuild matches the original.",
    date: "2026-06-20",
    readingMinutes: 6,
    tags: ["Claude Code", "Cursor", "workflow"],
    body: [
      {
        type: "p",
        text: "The fastest way to get an AI agent to match a reference design is to stop describing it and start showing it, with structure. Here is the workflow we use to turn a live site into a context pack that Claude Code, Cursor, Windsurf or Copilot can actually build against.",
      },
      { type: "h2", text: "1. Capture the reference, not a screenshot" },
      {
        type: "p",
        text: "Paste the URL into the WebForge online tool, or run the CLI. You get multi-viewport full-page screenshots plus a metadata.json of colours and fonts. Capturing all three viewports matters: the agent needs to see how the layout collapses on mobile, or it will invent breakpoints.",
      },
      {
        type: "code",
        lang: "bash",
        text: "pip install webforge-theatom\nwebforge stripe.com --crawl --max 5   # -> WebForge_stripe.com.zip",
      },
      { type: "h2", text: "2. Unzip it into the repo you are working in" },
      {
        type: "p",
        text: "Drop the package into a reference/ folder inside your project. Now the files live where the agent can read them with its normal file tools, with no copy-pasting images into chat and no losing the metadata.",
      },
      { type: "h2", text: "3. Prompt with the tokens first" },
      {
        type: "p",
        text: "Point the agent at the metadata before the image. A prompt that works well:",
      },
      {
        type: "code",
        lang: "text",
        text: "Read reference/metadata.json for the exact palette and fonts.\nThen use reference/pages/home/desktop.png as the visual target.\nRebuild the hero section in React + Tailwind, matching the hex\nvalues from metadata.json exactly. Do not approximate colours.",
      },
      { type: "h2", text: "4. Iterate against the mobile capture" },
      {
        type: "p",
        text: "Once the desktop version is close, hand over mobile.png and ask the agent to reconcile the responsive behaviour. Because the capture is a real render at 390px wide, the agent is matching against the site's actual breakpoints instead of guessing.",
      },
      { type: "h2", text: "Why this beats pasting a screenshot" },
      {
        type: "ul",
        items: [
          "Exact colours and fonts, so no design drift.",
          "Three viewports, so responsive behaviour is grounded in reality.",
          "Files on disk, so the agent uses them as first-class context across many turns.",
          "A sitemap, so multi-page rebuilds stay consistent.",
        ],
      },
      {
        type: "p",
        text: "The same package works with any agent that can read images and JSON. The point is giving it structured context instead of a lossy picture.",
      },
    ],
  },
  {
    slug: "screenshot-to-code-multi-viewport-design-tokens",
    title: "Screenshot-to-code, done right: multi-viewport capture and design tokens",
    description:
      "Single-screenshot-to-code tools drift because they lose colour, type and responsive context. Here is why multi-viewport capture with extracted design tokens fixes it.",
    date: "2026-07-05",
    readingMinutes: 5,
    tags: ["screenshot to code", "design tokens", "responsive"],
    body: [
      {
        type: "p",
        text: "Screenshot-to-code has a reputation for producing demos that dazzle and outputs that disappoint. The technology is not the problem; the input is. One screenshot at one width, compressed to a JPEG, is a lossy description of a design. Multi-viewport capture with extracted design tokens is a faithful one.",
      },
      { type: "h2", text: "Three failure modes of single-screenshot capture" },
      {
        type: "ul",
        items: [
          "Colour drift: hex values read off a compressed image are never exact, so the rebuild's palette is subtly off.",
          "Font invention: the model guesses a typeface from letterforms and usually picks the wrong one.",
          "Responsive blindness: with one width, the agent has no idea how the layout should behave on mobile, so it fabricates breakpoints.",
        ],
      },
      { type: "h2", text: "The fix: capture the design, not a picture of it" },
      {
        type: "p",
        text: "WebForge captures each page at desktop (1440), tablet (768) and mobile (390), stitched full-page after scrolling through lazy-loaded content. Alongside the images it extracts an area-weighted colour palette and the real font stack. The agent gets both the layout evidence and the precise values.",
      },
      { type: "h2", text: "Area-weighted colour, not a naive histogram" },
      {
        type: "p",
        text: "A naive palette counts pixels and hands back near-duplicates of the background. An area-weighted palette ranks colours by how much meaningful surface they cover, so the accent that appears on one button still surfaces, which is exactly the colour an agent most needs and most often gets wrong.",
      },
      { type: "h2", text: "The result" },
      {
        type: "p",
        text: "Give an agent three real renders and a token file and the output stops being “inspired by” the original and starts matching it. That is the whole point of screenshot-to-code, and it only works when the screenshot is actually a blueprint.",
      },
      {
        type: "p",
        text: "Try it on any URL from the WebForge homepage, or wire the Python or Node package into your pipeline.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
