# Chrome Web Store Metadata & Listing (WebForge)

This file contains the listing copy, permission justifications, and store metadata required to publish WebForge to the Chrome Web Store.

---

## Store Listing Details

- **Product Name**: WebForge - AI-Ready Website Capture Engine
- **Short Description**: Capture full-page visual blueprints, responsive viewports, sitemaps, and design tokens for AI coding agents.
- **Detailed Description**:
  WebForge is a developer-centric website capture utility built specifically for the AI coding era. Rather than just capturing a simple screenshot, WebForge crawls and documents websites to generate a complete visual and structural blueprint. You can feed this blueprint package directly into AI coding agents (such as Claude Code, Cursor, Windsurf, or Codex) to recreate, refactor, or study websites with high accuracy.
  
  ### Key Features:
  - **Full-Page Visual Capture**: Scrolls through lazy-loaded pages, hides fixed/sticky navigation overlays, and stitches high-fidelity captures.
  - **Multi-Viewport Emulation**: Automatically resizes and captures pages at Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) viewport dimensions.
  - **Visual Website Crawler**: Automatically crawls same-domain URLs based on sitemap discovery to build a complete visual blueprint package of an entire site.
  - **Design Token Extraction**: Identifies and extracts font-families and CSS colors in use on target pages.
  - **Structured Blueprint ZIP**: Exports everything into an organized archive containing structured page subfolders, global `metadata.json`, and `sitemap.json`.

---

## Permissions Justification

Every permission used by WebForge is required to execute client-side captures. No remote servers are used.

1. **`activeTab`**:
   - *Justification*: Required to immediately target the active browser tab when the user clicks the WebForge action extension button.
2. **`tabs`**:
   - *Justification*: Required to open temporary background tabs to capture sitemap pages during crawled captures and close them once complete.
3. **`scripting`**:
   - *Justification*: Required to inject the scrolling controller, layout calculator, and link/font/color collectors into web pages.
4. **`downloads`**:
   - *Justification*: Required to download the compiled `WebForge_Project.zip` package directly to the local Downloads folder.
5. **`storage`**:
   - *Justification*: Required to manage concurrent capture states.
6. **`windows`**:
   - *Justification*: Required to resize the browser window to standard responsive layouts (Desktop, Tablet, Mobile) to trigger media queries and capture authentic CSS layouts.
7. **`host_permissions` (`http://*/*`, `https://*/*`)**:
   - *Justification*: Required to inject script engines and capture full-page screens on any arbitrary HTTP/HTTPS webpage the developer wants to copy or analyze.

---

## Privacy & Data Use Disclosure

- **Data Collection**: WebForge runs entirely locally in your browser. It does not collect, track, or transmit any user behavior, browsing history, or personal data.
- **Host Communications**: The extension communicates only with target web domains loaded by the user to scroll and capture pages. No remote APIs or telemetry services are contacted.

---

## Version History

- **v1.0.0** (2026-07-11):
  - Initial production release.
  - Added full-page scrolling frame-stitcher.
  - Added multi-viewport window resizer.
  - Added background-tab domain crawler.
  - Added Design tokens (Fonts, Colors) extractor.
  - Added organized ZIP export package with JSZip.
