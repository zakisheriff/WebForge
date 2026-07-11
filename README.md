# <div align="center">WebForge</div>

<div align="center">
<strong>AI-Ready Website Capture Chrome Extension</strong>
</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

</div>

<br />

> **"Capture the visual blueprint of any website for AI coding agents."**
>
> WebForge is a developer-centric Chrome Extension designed with Claude's aesthetic philosophy.  
> It helps you capture complete website screenshots, emulate responsive viewports, crawl local links, extract design tokens, and export everything in a clean blueprint package that tools like Claude Code, Cursor, Windsurf, or Codex can use to rebuild sites with pixel perfection.

---

## 🌟 Vision

WebForge's mission is to be:

- **A developer's visual translator** — translating live pages into structural AI contexts
- **A multi-viewport blueprint generator** — capturing authentic CSS breakpoint adjustments
- **A beautiful, minimal tool** — built with a calm, content-first design system

---

## ✨ Why WebForge?

AI coding agents are highly capable of writing frontend layouts but require accurate visual reference.  
WebForge provides complete visual representations and design tokens of target sites, enabling agents to replicate them without design drift.

---

## 🎨 Claude-Inspired Design

- **Minimalist Aesthetics**  
  Warm beige page overlays with sharp, clean white workspace cards and charcoal text.

- **Calm Typography**  
  Modern Outfit and Inter typography styles, completely free of generic browser fonts.

- **Developer Dashboard**  
  A full-screen interactive workbench panel to review layouts, inspect design assets, and export.

---

## 🤖 Built-In Engine Capabilities

- **Scrolling Capture**  
  Calculates page metrics and scrolls through lazy-loaded images, temporarily hiding fixed headers to generate a stitched high-resolution PNG.

- **Viewport Emulation**  
  Automatically scales the active tab window to exact Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) viewport dimensions.

- **Domain Link Crawler**  
  Discovers sitemap pathways and crawls up to 20 pages sequentially inside a sandboxed capture tab.

---

## 🎓 Extracted Blueprints & Tokens

- **Fonts Collector**  
  Detects and lists active font families configured across standard document elements.

- **Colors Swatches**  
  Parses computed background/text styles and extracts hex codes with one-click copy actions.

- **Sitemap Indexer**  
  Documents discovered URL pathways in `sitemap.json` and page-scoped metadata details.

---

## 📁 Project Structure

```
WebForge/
├── public/
│   └── manifest.json             # Manifest V3 extension configuration
│
└── src/
    ├── App.tsx                   # Entry Router (Popup mode vs Dashboard mode)
    ├── index.css                 # Claude-inspired design system stylesheet
    ├── main.tsx                  # React application mount
    │
    ├── background/
    │   └── index.ts              # Service worker (capture loops, resizer, crawler queue)
    │
    ├── content/
    │   └── index.ts              # Injected page controller (scrolling, token parsing)
    │
    ├── popup/
    │   └── PopupView.tsx         # Compact 380px popup controls
    │
    ├── dashboard/
    │   └── DashboardView.tsx     # Full workspace overview & preview panel
    │
    └── utils/
        └── zipExporter.ts        # JSZip compiler producing WebForge packages
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Google Chrome** (Developer Mode enabled)

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/WebForge.git
cd WebForge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

### 4. Load in Chrome

- Open **chrome://extensions/**
- Enable **Developer mode** (top right)
- Click **Load unpacked** (top left)
- Select the `dist` folder generated inside this directory.

---

## 🎯 Key Features

### Visual blueprint generation

✅ **Full Page Scrolling** — Autoscroll and stitch lazy-loaded content  
✅ **Multi-Viewport capture** — Desktop, Tablet, and Mobile layouts  
✅ **Website Crawler** — Scan and capture full domains  
✅ **Design Token Export** — Extracted hex colors and font lists  
✅ **PDF Print Support** — Export individual pages to PDF natively  
✅ **Structured ZIP** — Pack everything in a cleanly mapped directory  

---

## 🔧 Tech Stack

- **React.js** + **TypeScript** — Component architecture
- **Vite** — Bundle optimizer compiling separate background worker files
- **OffscreenCanvas** — High-performance image drawing in service worker context
- **JSZip** — Local zip package compilations
- **Lucide React** — Minimal developer icons

## ☕ Support

If you find WebForge helpful and want to support the development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/theoneatom)

---

## 📄 License

MIT License — 100% Free and Open Source

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>
